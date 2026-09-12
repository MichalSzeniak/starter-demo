import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Fonty do generowania obrazów OG.
 *
 * Satori nie czyta WOFF2 (a tylko takie pobiera Astro dla strony), więc bierzemy
 * TTF z tego samego źródła co font strony: Google Fonts. Legacy endpoint
 * `/css?family=` z parametrem `subset=latin,latin-ext` zwraca dla nieznanego
 * user-agenta JEDEN plik TTF z pełnym pokryciem polskich znaków — bez dzielenia
 * na podzbiory, z którym satori sobie nie radzi (sprawdzone: przy dwóch plikach
 * o tej samej nazwie i wadze bierze pierwszy i rysuje tofu za ł, ż, ę, ą).
 *
 * Pobrane pliki lądują w node_modules/.cache i nie są pobierane ponownie.
 * Sieć przy buildzie to nic nowego: Astro i tak pobiera fonty strony z Google.
 */

export interface OgFont {
	name: string;
	data: ArrayBuffer;
	weight: 400 | 700;
	style: 'normal';
}

const WEIGHTS = [400, 700] as const;
const FALLBACK_FAMILY = 'Inter';

function cacheDir(): string {
	return path.join(process.cwd(), 'node_modules', '.cache', 'og-fonts');
}

function cacheKey(family: string, weight: number): string {
	return `${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${weight}.ttf`;
}

async function fetchTtf(family: string, weight: number): Promise<ArrayBuffer | null> {
	const file = path.join(cacheDir(), cacheKey(family, weight));
	try {
		const cached = await readFile(file);
		return cached.buffer.slice(cached.byteOffset, cached.byteOffset + cached.byteLength);
	} catch {
		// brak w cache — pobieramy
	}

	const cssUrl = `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}&subset=latin,latin-ext`;
	const css = await fetch(cssUrl, { headers: { 'User-Agent': 'node' } });
	if (!css.ok) return null;

	const fontUrl = (await css.text()).match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1];
	if (!fontUrl) return null;

	const font = await fetch(fontUrl);
	if (!font.ok) return null;

	const data = await font.arrayBuffer();
	await mkdir(cacheDir(), { recursive: true });
	await writeFile(file, Buffer.from(data));
	return data;
}

async function loadFamily(family: string): Promise<OgFont[] | null> {
	const fonts: OgFont[] = [];
	for (const weight of WEIGHTS) {
		const data = await fetchTtf(family, weight);
		if (!data) return null;
		fonts.push({ name: family, data, weight, style: 'normal' });
	}
	return fonts;
}

let pending: Promise<{ family: string; fonts: OgFont[] }> | undefined;

/** Fonty rodziny marki (400 i 700, latin + latin-ext) albo Inter, gdy Google jej nie zna. */
export function loadOgFonts(family: string): Promise<{ family: string; fonts: OgFont[] }> {
	pending ??= (async () => {
		const own = await loadFamily(family);
		if (own) return { family, fonts: own };

		console.warn(
			`[og] Google Fonts nie zna rodziny "${family}" — obrazy OG użyją ${FALLBACK_FAMILY}.`,
		);
		const fallback = await loadFamily(FALLBACK_FAMILY);
		if (!fallback) {
			throw new Error(
				`[og] Nie udało się pobrać fontu ${FALLBACK_FAMILY} z Google Fonts — sprawdź połączenie sieciowe builda.`,
			);
		}
		return { family: FALLBACK_FAMILY, fonts: fallback };
	})();
	return pending;
}
