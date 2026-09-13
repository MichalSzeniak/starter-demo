/**
 * Webhook Sanity → przebudowa strony, z debounce'em.
 *
 * `POST /api/przebuduj` przyjmuje podpisany webhook z Sanity i planuje wywołanie
 * deploy hooka Cloudflare Workers Builds. Klient poprawiający literówki publikuje
 * 15 razy w 10 minut — build ma być jeden, po tym, jak skończy.
 *
 * Reguła: build rusza QUIET_MS po OSTATNIEJ publikacji, ale nie później niż
 * MAX_WAIT_MS po PIERWSZEJ z serii — ciągła praca w Studio nie może odkładać
 * aktualizacji strony w nieskończoność.
 *
 * Stan serii trzyma jeden Durable Object (alarm + znacznik początku serii).
 * Sam deploy hook scala żądania tylko wtedy, gdy build jeszcze czeka w kolejce,
 * więc bez tego każda publikacja po starcie buildu dawałaby kolejny.
 *
 * Sekrety Workera: SANITY_WEBHOOK_SECRET (ten sam co w webhooku Sanity),
 * DEPLOY_HOOK_URL (Workers → Settings → Builds → Deploy Hooks — URL jest poświadczeniem).
 */

export const REBUILD_ENDPOINT = '/api/przebuduj';

/** Cisza po ostatniej publikacji, po której ruszamy z buildem. */
export const QUIET_MS = 3 * 60_000;
/** Najdłuższe czekanie od pierwszej publikacji w serii. */
export const MAX_WAIT_MS = 15 * 60_000;
/** Webhook z projekcją `{_id, _type}` ma kilkadziesiąt bajtów; pełny dokument strony — kilkadziesiąt kB. */
const MAX_BODY_BYTES = 1_000_000;

const SIGNATURE_HEADER = 'sanity-webhook-signature';
const FIRST_EVENT_KEY = 'firstEventAt';

/** Minimalne typy — bez zależności od @cloudflare/workers-types. */
interface DurableObjectStorage {
	get<T>(key: string): Promise<T | undefined>;
	put(key: string, value: unknown): Promise<void>;
	delete(key: string): Promise<boolean>;
	setAlarm(scheduledTime: number): Promise<void>;
}

export interface DurableObjectState {
	storage: DurableObjectStorage;
}

interface DurableObjectStub {
	fetch(request: Request): Promise<Response>;
}

export interface DurableObjectNamespace {
	idFromName(name: string): unknown;
	get(id: unknown): DurableObjectStub;
}

export interface RebuildEnv {
	REBUILD_DEBOUNCE: DurableObjectNamespace;
	/** Sekret. */
	SANITY_WEBHOOK_SECRET?: string;
	/** Sekret. */
	DEPLOY_HOOK_URL?: string;
}

export async function handleRebuildWebhook(request: Request, env: RebuildEnv): Promise<Response> {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
	}
	if (!env.SANITY_WEBHOOK_SECRET || !env.DEPLOY_HOOK_URL) {
		console.error('przebuduj: brak sekretów SANITY_WEBHOOK_SECRET / DEPLOY_HOOK_URL');
		return new Response('Not configured', { status: 500 });
	}

	const length = Number(request.headers.get('Content-Length') ?? 0);
	if (length > MAX_BODY_BYTES) return new Response('Payload Too Large', { status: 413 });
	const body = await request.text();
	if (body.length > MAX_BODY_BYTES) return new Response('Payload Too Large', { status: 413 });

	const valid = await isValidSignature(
		body,
		request.headers.get(SIGNATURE_HEADER),
		env.SANITY_WEBHOOK_SECRET,
	);
	if (!valid) {
		console.warn('przebuduj: odrzucono (podpis)');
		return new Response('Unauthorized', { status: 401 });
	}

	const stub = env.REBUILD_DEBOUNCE.get(env.REBUILD_DEBOUNCE.idFromName('deploy'));
	return stub.fetch(new Request('https://debounce/zaplanuj', { method: 'POST' }));
}

/**
 * Durable Object z jednym zadaniem: trzymać alarm serii publikacji.
 * Wszystkie żądania trafiają do jednej instancji (`idFromName('deploy')`).
 */
export class RebuildDebounce {
	private readonly state: DurableObjectState;
	private readonly env: RebuildEnv;

	constructor(state: DurableObjectState, env: RebuildEnv) {
		this.state = state;
		this.env = env;
	}

	async fetch(): Promise<Response> {
		const now = Date.now();
		const storage = this.state.storage;
		let firstEventAt = await storage.get<number>(FIRST_EVENT_KEY);
		if (firstEventAt === undefined) {
			firstEventAt = now;
			await storage.put(FIRST_EVENT_KEY, firstEventAt);
		}
		const buildAt = nextBuildAt(now, firstEventAt);
		// setAlarm nadpisuje poprzedni alarm — to jest cały debounce.
		await storage.setAlarm(buildAt);
		console.log(`przebuduj: build za ${Math.round((buildAt - now) / 1000)} s`);
		return Response.json({ buildAt: new Date(buildAt).toISOString() }, { status: 202 });
	}

	async alarm(): Promise<void> {
		// Seria zamknięta PRZED wywołaniem hooka: publikacja w trakcie żądania otwiera nową
		// serię i dostanie własny build (ten mógł już pobrać repo bez jej zmian).
		await this.state.storage.delete(FIRST_EVENT_KEY);

		const response = await fetch(this.env.DEPLOY_HOOK_URL!, { method: 'POST' });
		if (!response.ok) {
			// Wyjątek = ponowienie alarmu przez Cloudflare (backoff od 2 s, do 6 prób).
			throw new Error(`przebuduj: deploy hook ${response.status} ${await response.text()}`);
		}
		console.log(`przebuduj: deploy hook ${response.status}`);
	}
}

export function nextBuildAt(now: number, firstEventAt: number): number {
	return Math.min(now + QUIET_MS, firstEventAt + MAX_WAIT_MS);
}

/**
 * Podpis webhooka Sanity: nagłówek `t=<znacznik ms>,v1=<HMAC-SHA256>`, gdzie HMAC liczony
 * jest z `${t}.${body}` i zakodowany base64url bez dopełnienia. Format zweryfikowany
 * w @sanity/webhook 4.0.4 (`encodeSignatureHeader`) — bez dokładania tej zależności.
 *
 * Bez okna czasowego na znacznik: ponowienia dostarczenia z Sanity mogą nieść pierwotny
 * znacznik, a powtórzone żądanie może co najwyżej zaplanować build, który i tak
 * przechodzi przez debounce.
 */
export async function isValidSignature(
	body: string,
	header: string | null,
	secret: string,
): Promise<boolean> {
	const match = header?.trim().match(/^t=(\d+)[, ]+v1=([^, ]+)$/);
	if (!match || !body) return false;
	const [, timestamp, received] = match;

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const signature = new Uint8Array(
		await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`)),
	);
	const expected = btoa(String.fromCharCode(...signature))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	return timingSafeEqual(expected, received!);
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}
