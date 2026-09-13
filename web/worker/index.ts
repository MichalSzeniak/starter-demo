/**
 * Worker Cloudflare: formularz kontaktowy `POST /api/kontakt` → e-mail przez Resend
 * oraz webhook Sanity `POST /api/przebuduj` → przebudowa strony (worker/rebuild.ts).
 *
 * Wszystko inne serwują statyczne assety — `run_worker_first = ["/api/*"]`
 * w wrangler.toml kieruje tu wyłącznie ścieżki API. Fallback do `env.ASSETS`
 * zostaje na wypadek zmiany tej reguły.
 *
 * Kolejność sprawdzeń jest celowa:
 * 1. Origin i rozmiar — tanie odrzucenie obcych stron i śmieci.
 * 2. Honeypot — bot dostaje „wysłano", niczego nie zużywa i nie uczy się obejścia.
 * 3. Walidacja pól.
 * 4. Rate limiting — liczy tylko poprawne zgłoszenia, więc zalew botów
 *    złapanych na honeypocie nie blokuje prawdziwych osób.
 * 5. Wysyłka.
 *
 * Do logów nie trafiają dane osobowe — tylko statusy.
 */
import {
	CONTACT_ENDPOINT,
	FIELD,
	parseContactForm,
	safeAnchor,
	safeReturnPath,
	type ContactMessage,
	type ContactStatus,
	type FieldErrors,
} from '../src/lib/contact-form';
import { handleRebuildWebhook, REBUILD_ENDPOINT, type RebuildEnv } from './rebuild';

// Klasa Durable Object musi być eksportowana z głównego modułu Workera.
export { RebuildDebounce } from './rebuild';

/** Minimalne typy bindingów — bez zależności od @cloudflare/workers-types. */
interface RateLimit {
	limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Fetcher {
	fetch(request: Request): Promise<Response>;
}

export interface Env extends RebuildEnv {
	ASSETS: Fetcher;
	/** Na adres IP — łagodny, bo za NAT-em biura albo operatora siedzi wiele osób. */
	CONTACT_RATE_LIMIT_IP: RateLimit;
	/** Na całą stronę — chroni limit wysyłek w Resend, gdy bot zmienia adresy IP. */
	CONTACT_RATE_LIMIT_SITE: RateLimit;
	/** Sekret. */
	RESEND_API_KEY?: string;
	/** Sekret. Adresat; kilka adresów po przecinku. */
	CONTACT_TO?: string;
	/** Sekret. Nadawca z domeny zweryfikowanej w Resend, np. „Strona <formularz@firma.pl>". */
	CONTACT_FROM?: string;
}

const RESEND_URL = 'https://api.resend.com/emails';
/** Formularz to kilka kB; więcej = śmieci albo atak. */
const MAX_BODY_BYTES = 32_000;

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === REBUILD_ENDPOINT) return handleRebuildWebhook(request, env);
		if (url.pathname !== CONTACT_ENDPOINT) return env.ASSETS.fetch(request);
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
		}
		return handleContact(request, env, url);
	},
};

async function handleContact(request: Request, env: Env, url: URL): Promise<Response> {
	const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');
	let page = '/';
	let anchor = 'kontakt';

	const respond = (status: ContactStatus, httpStatus: number, errors?: FieldErrors) =>
		wantsJson
			? Response.json(
					{ status, errors },
					{ status: httpStatus, headers: { 'Cache-Control': 'no-store' } },
				)
			: // Bez JS: 303 zamienia POST na GET, więc odświeżenie nie wyśle formularza drugi raz.
				new Response(null, {
					status: 303,
					headers: { Location: `${page}#${anchor}-${status}`, 'Cache-Control': 'no-store' },
				});

	// 1. Tylko z tej samej strony. Przeglądarki wysyłają Origin przy POST.
	const origin = request.headers.get('Origin');
	if (origin && origin !== url.origin) return respond('blad', 403);

	const length = Number(request.headers.get('Content-Length') ?? 0);
	if (length > MAX_BODY_BYTES) return respond('niepoprawne', 413);

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return respond('niepoprawne', 400);
	}
	page = safeReturnPath(String(form.get(FIELD.page) ?? '/'));
	anchor = safeAnchor(String(form.get(FIELD.anchor) ?? 'kontakt'));

	// 2. Honeypot.
	if (String(form.get(FIELD.trap) ?? '') !== '') {
		console.log('kontakt: odrzucono (honeypot)');
		return respond('wyslano', 200);
	}

	// 3. Walidacja.
	const parsed = parseContactForm(form);
	if (!parsed.ok) return respond('niepoprawne', 422, parsed.errors);

	// 4. Rate limiting. Host w kluczu: kilka stron klientów na jednym koncie
	//    Cloudflare nie dzieli limitów, nawet przy tym samym namespace_id.
	const ip = request.headers.get('CF-Connecting-IP') ?? 'nieznany';
	const [perIp, perSite] = await Promise.all([
		env.CONTACT_RATE_LIMIT_IP.limit({ key: `${url.hostname}:${ip}` }),
		env.CONTACT_RATE_LIMIT_SITE.limit({ key: url.hostname }),
	]);
	if (!perIp.success || !perSite.success) {
		console.warn(`kontakt: limit (${perIp.success ? 'strona' : 'IP'})`);
		return respond('limit', 429);
	}

	// 5. Wysyłka.
	if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
		console.error('kontakt: brak sekretów RESEND_API_KEY / CONTACT_TO / CONTACT_FROM');
		return respond('blad', 500);
	}

	const sent = await sendEmail(env, parsed.message, `${url.host}${page}`);
	return sent ? respond('wyslano', 200) : respond('blad', 502);
}

async function sendEmail(env: Env, message: ContactMessage, source: string): Promise<boolean> {
	// Temat to jedna linia: znaki sterujące (np. nowe linie z ręcznie złożonego POST-a) → spacja.
	const subjectName = Array.from(message.name, (char) => {
		const code = char.charCodeAt(0);
		return code < 32 || code === 127 ? ' ' : char;
	})
		.join('')
		.slice(0, 80);
	const submittedAt = new Date().toISOString();

	const text = [
		`Nowa wiadomość z formularza na stronie ${source}`,
		'',
		`Imię: ${message.name}`,
		`E-mail: ${message.email}`,
		`Telefon: ${message.phone || '—'}`,
		'',
		'Wiadomość:',
		message.message,
		'',
		'—',
		`Zgoda na przetwarzanie danych: zaznaczona, ${submittedAt} (UTC)`,
		`Treść zgody: „${message.consentText || 'brak treści w zgłoszeniu'}"`,
		'',
		'Odpowiedz na tego maila, żeby napisać bezpośrednio do nadawcy.',
	].join('\n');

	try {
		const response = await fetch(RESEND_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: env.CONTACT_FROM,
				to: env
					.CONTACT_TO!.split(',')
					.map((address) => address.trim())
					.filter(Boolean),
				reply_to: message.email,
				subject: `Wiadomość ze strony od: ${subjectName}`,
				text,
			}),
		});
		if (!response.ok) {
			// Treść błędu Resend nie zawiera danych z formularza — można logować.
			console.error(`kontakt: Resend ${response.status} ${await response.text()}`);
			return false;
		}
		return true;
	} catch (error) {
		console.error('kontakt: Resend niedostępny', error instanceof Error ? error.message : error);
		return false;
	}
}
