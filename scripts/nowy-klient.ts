/**
 * Nowy klient ze startera — interaktywnie.
 *
 *   pnpm nowy-klient
 *
 * Pyta o nazwę firmy, domenę, kolor marki, Sanity project ID i nazwę projektu, pokazuje
 * podsumowanie i dopiero po potwierdzeniu:
 *
 *   web/src/config/brand.ts   siteUrl, company.name, colors.brand, colors.brandDark
 *   web/.env, studio/.env     project ID i dataset (istniejące klucze, np. token, zostają)
 *   package.json              name
 *   wrangler.toml             name — nazwa Workera musi być unikalna na koncie Cloudflare,
 *                             inaczej deploy drugiego klienta nadpisze pierwszego
 *   web/public/demo/          usuwany — Astro kopiuje public/ do dist/, więc placeholdery demo
 *                             wisiałyby na domenie klienta
 *   studio/scripts/demo-images/  usuwany — zdjęcia do seeda (~800 kB), klientowi zbędne
 *
 * Czego NIE rusza, celowo:
 *   - web/src/lib/sanity/fixtures.ts i studio/scripts/seed.ts — fixtures są fallbackiem
 *     `astro dev` bez projektu i strażnikiem typów przy zmianie schemy; usunięcie ich
 *     psuje `pnpm check` i daje konflikty przy cherry-picku poprawek ze startera.
 *     W buildzie z SANITY_PROJECT_ID nie trafia z nich do dist/ ani bajt.
 *   - Dataset klienta — świeży projekt jest pusty, seed nie jest uruchamiany.
 *   - Dane NAP w brand.ts — źródłem prawdy jest siteSettings w Studio; placeholdery
 *     w brand.ts są celowo fikcyjne i rzucają się w oczy, dopóki klient ich nie uzupełni.
 *
 * Nic nie jest zapisywane przed potwierdzeniem. Wszystkie zmiany cofa `git checkout . && git clean -fd`.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const rel = (...parts: string[]) => path.join(ROOT, ...parts);

const FILES = {
	brand: rel('web/src/config/brand.ts'),
	packageJson: rel('package.json'),
	wrangler: rel('wrangler.toml'),
	webEnv: rel('web/.env'),
	webEnvExample: rel('web/.env.example'),
	studioEnv: rel('studio/.env'),
	studioEnvExample: rel('studio/.env.example'),
};

const DEMO_DIRS = ['web/public/demo', 'studio/scripts/demo-images'];

/** WCAG AA dla zwykłego tekstu — kolor marki występuje jako tekst linków i tło przycisków z białym napisem. */
const MIN_CONTRAST = 4.5;

function fail(message: string): never {
	console.error(`\n✖ ${message}\n`);
	process.exit(1);
}

// ---------------------------------------------------------------------------
// Wejście — iterator linii działa tak samo w terminalu i przy odpowiedziach z potoku
// ---------------------------------------------------------------------------

const lines = createInterface({ input: process.stdin })[Symbol.asyncIterator]();

async function ask(question: string, fallback = ''): Promise<string> {
	process.stdout.write(fallback ? `${question} [${fallback}]: ` : `${question}: `);
	const next = await lines.next();
	if (next.done) fail('Przerwano — brak odpowiedzi.');
	if (!process.stdin.isTTY) process.stdout.write(`${next.value}\n`);
	return next.value.trim() || fallback;
}

/** Pyta, dopóki `parse` nie zwróci wartości. `parse` zwraca string z błędem albo { value }. */
async function askValid<T>(
	question: string,
	parse: (input: string) => { value: T } | string,
	fallback = '',
): Promise<T> {
	for (;;) {
		const result = parse(await ask(question, fallback));
		if (typeof result !== 'string') return result.value;
		console.log(`  ✖ ${result}`);
	}
}

async function confirm(question: string, defaultYes: boolean): Promise<boolean> {
	const answer = (await ask(`${question} ${defaultYes ? '[T/n]' : '[t/N]'}`)).toLowerCase();
	if (!answer) return defaultYes;
	return answer === 't' || answer === 'tak' || answer === 'y' || answer === 'yes';
}

// ---------------------------------------------------------------------------
// Walidacja odpowiedzi
// ---------------------------------------------------------------------------

function parseCompanyName(input: string) {
	if (!input) return 'Nazwa firmy jest wymagana.';
	if (input.length > 100) return 'Maksymalnie 100 znaków — pełną nazwę prawną wpiszesz w Studio.';
	return { value: input };
}

/** „firma.pl”, „https://www.firma.pl/” → „https://firma.pl” / „https://www.firma.pl”. */
function parseDomain(input: string) {
	const host = input
		.replace(/^https?:\/\//i, '')
		.replace(/\/.*$/, '')
		.toLowerCase();
	const label = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
	const parts = host.split('.');
	if (!host || parts.length < 2 || !parts.every((part) => label.test(part))) {
		return 'Podaj domenę, np. firma.pl albo www.firma.pl (bez polskich znaków — dla IDN wpisz postać xn--…).';
	}
	if (host === 'example.com' || host.endsWith('.example.com')) {
		return 'To domena z szablonu — podaj domenę klienta.';
	}
	return { value: `https://${host}` };
}

function parseProjectId(input: string) {
	if (!/^[a-z0-9]+$/.test(input)) {
		return 'Project ID to małe litery i cyfry, np. ab12cd34 — sanity.io/manage → projekt → nagłówek.';
	}
	return { value: input };
}

/** Nazwa Workera Cloudflare i pakietu: małe litery, cyfry, myślniki, do 63 znaków. */
function parseProjectName(input: string) {
	if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(input)) {
		return 'Małe litery, cyfry i myślniki, 1–63 znaki, bez myślnika na początku i końcu.';
	}
	return { value: input };
}

function projectNameFromUrl(siteUrl: string): string {
	return new URL(siteUrl).hostname
		.replace(/^www\./, '')
		.replace(/\./g, '-')
		.slice(0, 63)
		.replace(/-+$/, '');
}

// ---------------------------------------------------------------------------
// Kolory — kontrast liczony tak jak w WCAG 2.x, bez zależności
// ---------------------------------------------------------------------------

type Rgb = [number, number, number];

function hexToRgb(input: string): Rgb | null {
	const hex = input.replace(/^#/, '').toLowerCase();
	if (/^[0-9a-f]{3}$/.test(hex)) {
		return [...hex].map((c) => parseInt(c + c, 16)) as Rgb;
	}
	if (/^[0-9a-f]{6}$/.test(hex)) {
		return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
	}
	return null;
}

const rgbToHex = (rgb: Rgb) =>
	`#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

function luminance([r, g, b]: Rgb): number {
	const channel = (c: number) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
	return (light + 0.05) / (dark + 0.05);
}

/** Kolor `top` o nieprzezroczystości `alpha` nałożony na `bottom`. */
const blend = (top: Rgb, alpha: number, bottom: Rgb): Rgb =>
	top.map((c, i) => c * alpha + bottom[i]! * (1 - alpha)) as Rgb;

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
	const [rn, gn, bn] = [r / 255, g / 255, b / 255];
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	const h =
		max === rn
			? (gn - bn) / d + (gn < bn ? 6 : 0)
			: max === gn
				? (bn - rn) / d + 2
				: (rn - gn) / d + 4;
	return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
	if (s === 0) return [l * 255, l * 255, l * 255];
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const hue = (t: number) => {
		const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
		if (x < 1 / 6) return p + (q - p) * 6 * x;
		if (x < 1 / 2) return q;
		if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
		return p;
	};
	return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
}

/** Ten sam odcień, jasność pomnożona przez `factor`. */
function withLightness(rgb: Rgb, factor: number): Rgb {
	const [h, s, l] = rgbToHsl(rgb);
	return hslToRgb([h, s, l * factor]);
}

const WHITE: Rgb = [255, 255, 255];

interface Surfaces {
	surface: Rgb;
	surfaceAlt: Rgb;
}

/**
 * Wszystkie miejsca, w których kolor marki styka się z tekstem (sprawdzone w web/src):
 * biały napis na przycisku `bg-brand`, `text-brand` na tle strony i na sekcji alternatywnej,
 * `text-white/85` na CTA w kolorze marki. Najsłabsza para decyduje.
 */
function brandContrast(brand: Rgb, { surface, surfaceAlt }: Surfaces): number {
	return Math.min(
		contrast(brand, WHITE),
		contrast(brand, surface),
		contrast(brand, surfaceAlt),
		contrast(blend(WHITE, 0.85, brand), brand),
	);
}

/** Najjaśniejsza wersja tego odcienia, która spełnia próg — propozycja zamiast odmowy. */
function darkenToPass(brand: Rgb, surfaces: Surfaces): Rgb | null {
	for (let factor = 0.99; factor > 0; factor -= 0.01) {
		const candidate = hexToRgb(rgbToHex(withLightness(brand, factor)))!;
		if (brandContrast(candidate, surfaces) >= MIN_CONTRAST) return candidate;
	}
	return null;
}

const ratio = (value: number) => `${value.toFixed(2)}:1`;

async function askBrandColor(surfaces: Surfaces): Promise<string> {
	for (;;) {
		const input = await ask('Kolor marki (hex, np. #1d4ed8)');
		const rgb = hexToRgb(input);
		if (!rgb) {
			console.log('  ✖ Podaj kolor w zapisie hex: #1d4ed8 albo #15c.');
			continue;
		}
		const value = brandContrast(rgb, surfaces);
		if (value >= MIN_CONTRAST) {
			console.log(`  ✓ kontrast ${ratio(value)} (próg ${MIN_CONTRAST}:1)`);
			return rgbToHex(rgb);
		}
		const proposal = darkenToPass(rgb, surfaces);
		console.log(
			`  ✖ ${rgbToHex(rgb)} ma kontrast ${ratio(value)} z białym napisem lub tłem strony — ` +
				`przyciski i linki nie przejdą WCAG AA ani Lighthouse accessibility 100.`,
		);
		if (!proposal) continue;
		const hex = rgbToHex(proposal);
		if (
			await confirm(
				`  Użyć ${hex} (ten sam odcień, ${ratio(brandContrast(proposal, surfaces))})?`,
				true,
			)
		) {
			return hex;
		}
	}
}

async function askBrandDark(brandHex: string): Promise<string> {
	const brand = hexToRgb(brandHex)!;
	const auto = rgbToHex(withLightness(brand, 0.7));
	return askValid(
		'Ciemniejszy wariant (hover; Enter = wyliczony)',
		(input) => {
			const rgb = hexToRgb(input);
			if (!rgb) return 'Podaj kolor w zapisie hex.';
			if (contrast(rgb, WHITE) < contrast(brand, WHITE)) {
				return 'Wariant hover musi być ciemniejszy od koloru marki — inaczej biały napis traci kontrast.';
			}
			return { value: rgbToHex(rgb) };
		},
		auto,
	);
}

function readSurfaces(brandSource: string): Surfaces {
	const read = (key: string, fallback: Rgb) => {
		const match = brandSource.match(new RegExp(`\\b${key}: '(#[0-9a-fA-F]{3,6})'`));
		return (match && hexToRgb(match[1]!)) || fallback;
	};
	return { surface: read('surface', WHITE), surfaceAlt: read('surfaceAlt', WHITE) };
}

// ---------------------------------------------------------------------------
// Edycje plików — najpierw wszystkie liczone w pamięci, zapis dopiero po potwierdzeniu
// ---------------------------------------------------------------------------

/** Literał zgodny z Prettierem (singleQuote): podwójne cudzysłowy tylko, gdy są w treści apostrofy. */
function tsString(value: string): string {
	const escaped = value.replace(/\\/g, '\\\\');
	if (value.includes("'") && !value.includes('"')) return `"${escaped}"`;
	return `'${escaped.replace(/'/g, "\\'")}'`;
}

/** Podmienia wartość klucza w obiekcie `brand`. Klucz musi wystąpić dokładnie raz. */
function setBrandValue(source: string, key: string, literal: string): string {
	const start = source.indexOf('export const brand: Brand = {');
	// Od `start` — ta sama fraza pada też w komentarzu na górze pliku.
	const end = source.indexOf('NIE EDYTUJ PONIŻEJ', start);
	if (start === -1 || end === -1) fail('brand.ts ma nieoczekiwany kształt — brak obiektu `brand`.');
	const block = source.slice(start, end);
	const pattern = new RegExp(
		`^(\\t+${key}: )(?:'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")(,)$`,
		'gm',
	);
	const matches = block.match(pattern)?.length ?? 0;
	if (matches !== 1)
		fail(`brand.ts: klucz \`${key}\` występuje ${matches}× zamiast dokładnie raz.`);
	const replaced = block.replace(
		pattern,
		(_, prefix: string, comma: string) => prefix + literal + comma,
	);
	return source.slice(0, start) + replaced + source.slice(end);
}

/** Ustawia klucz w pliku .env; brakujący dopisuje na końcu, pozostałe linie zostają bez zmian. */
function setEnv(source: string, key: string, value: string): string {
	// [^\r\n], nie `.` — kropka łapie \r i zjadłaby koniec linii w pliku z CRLF.
	const pattern = new RegExp(`^${key}=[^\\r\\n]*`, 'm');
	if (pattern.test(source)) return source.replace(pattern, `${key}=${value}`);
	return `${source.replace(/\n*$/, '\n')}${key}=${value}\n`;
}

const readEnvValue = (source: string, key: string) =>
	source.match(new RegExp(`^${key}=([^\\r\\n]*)`, 'm'))?.[1]?.trim() ?? '';

function setWranglerName(source: string, name: string): string {
	// Tylko klucz najwyższego poziomu — `name = …` występuje też w [[ratelimits]] i bindingach.
	const firstTable = source.search(/^\[/m);
	const head = firstTable === -1 ? source : source.slice(0, firstTable);
	const pattern = /^name = ".*"$/m;
	if (!pattern.test(head)) fail('wrangler.toml: brak `name = "…"` przed pierwszą tabelą.');
	return head.replace(pattern, `name = "${name}"`) + source.slice(head.length);
}

function gitDirty(): string | null {
	const result = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
	if (result.status !== 0) return null;
	return result.stdout.trim() || null;
}

// ---------------------------------------------------------------------------
// Przebieg
// ---------------------------------------------------------------------------

console.log('\nNowy klient ze startera. Nic nie zostanie zapisane przed potwierdzeniem.\n');

const brandSource = readFileSync(FILES.brand, 'utf8');
if (!brandSource.includes("siteUrl: 'https://example.com'")) {
	console.log(
		'⚠ brand.ts ma już domenę inną niż example.com — wygląda na skonfigurowany wcześniej.\n',
	);
}

const companyName = await askValid('Nazwa firmy (jak na stronie)', parseCompanyName);
const siteUrl = await askValid('Domena produkcyjna (np. firma.pl)', parseDomain);
const surfaces = readSurfaces(brandSource);
const brandColor = await askBrandColor(surfaces);
const brandDark = await askBrandDark(brandColor);
const projectId = await askValid('Sanity project ID', parseProjectId);
const projectName = await askValid(
	'Nazwa projektu (package.json, Worker Cloudflare)',
	parseProjectName,
	projectNameFromUrl(siteUrl),
);

// Wszystkie edycje w pamięci — błąd kształtu któregoś pliku przerywa, zanim cokolwiek zapiszemy.
let nextBrand = setBrandValue(brandSource, 'siteUrl', tsString(siteUrl));
nextBrand = setBrandValue(nextBrand, 'name', tsString(companyName));
nextBrand = setBrandValue(nextBrand, 'brand', tsString(brandColor));
nextBrand = setBrandValue(nextBrand, 'brandDark', tsString(brandDark));
nextBrand = nextBrand.replace(/^\t\/\/ Placeholder na zarezerwowanej domenie.*\n/m, '');

const packageSource = readFileSync(FILES.packageJson, 'utf8');
const packageJson = JSON.parse(packageSource) as { name: string };
const previousName = packageJson.name;
packageJson.name = projectName;
const nextPackage = `${JSON.stringify(packageJson, null, 2)}\n`;

const nextWrangler = setWranglerName(readFileSync(FILES.wrangler, 'utf8'), projectName);

const envSource = (file: string, example: string) =>
	existsSync(file) ? readFileSync(file, 'utf8') : readFileSync(example, 'utf8');
const webEnvBefore = envSource(FILES.webEnv, FILES.webEnvExample);
const studioEnvBefore = envSource(FILES.studioEnv, FILES.studioEnvExample);
const dataset = readEnvValue(webEnvBefore, 'SANITY_DATASET') || 'production';

let nextWebEnv = setEnv(webEnvBefore, 'SANITY_PROJECT_ID', projectId);
nextWebEnv = setEnv(nextWebEnv, 'SANITY_DATASET', dataset);
nextWebEnv = setEnv(nextWebEnv, 'DEMO_CONTENT', 'false');
let nextStudioEnv = setEnv(studioEnvBefore, 'SANITY_STUDIO_PROJECT_ID', projectId);
nextStudioEnv = setEnv(
	nextStudioEnv,
	'SANITY_STUDIO_DATASET',
	readEnvValue(studioEnvBefore, 'SANITY_STUDIO_DATASET') || dataset,
);

const demoDirs = DEMO_DIRS.filter((dir) => existsSync(rel(dir)));

// Podsumowanie
const envNote = (file: string, before: string, key: string) => {
	if (!existsSync(file)) return 'nowy plik';
	const old = readEnvValue(before, key);
	return old && old !== projectId ? `nadpisuje ${key}=${old}` : 'aktualizacja';
};

console.log(`
Podsumowanie
  Firma          ${companyName}
  Domena         ${siteUrl}
  Kolory         ${brandColor} / hover ${brandDark}
  Sanity         ${projectId}, dataset ${dataset}
  Projekt        ${previousName} → ${projectName}

Zmiany
  web/src/config/brand.ts     siteUrl, company.name, colors.brand, colors.brandDark
  web/.env                    ${envNote(FILES.webEnv, webEnvBefore, 'SANITY_PROJECT_ID')}
  studio/.env                 ${envNote(FILES.studioEnv, studioEnvBefore, 'SANITY_STUDIO_PROJECT_ID')}
  package.json                name
  wrangler.toml               name
${demoDirs.map((dir) => `  ${`${dir}/`.padEnd(28)}usunięcie`).join('\n') || '  (katalogi demo już usunięte)'}
`);

const dirty = gitDirty();
if (dirty) {
	console.log('⚠ Repo ma niezacommitowane zmiany — trudniej będzie cofnąć sam skrypt:');
	console.log(dirty.replace(/^/gm, '    '), '\n');
}

if (!(await confirm('Zapisać?', false))) {
	console.log('\nNic nie zapisano.\n');
	process.exit(0);
}

writeFileSync(FILES.brand, nextBrand);
writeFileSync(FILES.webEnv, nextWebEnv);
writeFileSync(FILES.studioEnv, nextStudioEnv);
writeFileSync(FILES.packageJson, nextPackage);
writeFileSync(FILES.wrangler, nextWrangler);
for (const dir of demoDirs) rmSync(rel(dir), { recursive: true, force: true });

console.log(`
✓ Zapisano.

Dalej:
  1. Logo: web/public/favicon.svg (favicon), logo klienta wgrywasz w Studio → Ustawienia strony.
  2. Studio:  pnpm --filter studio deploy   (host *.sanity.studio, zaproś klienta z rolą Editor)
  3. Commit:  git add -A && git commit -m "chore: konfiguracja klienta ${projectName}"
  4. Reszta:  docs/CHECKLIST-WDROZENIE.md
`);
process.exit(0);
