/**
 * Generuje dwie grafiki demo do studio/scripts/demo-images — deterministycznie:
 *
 *   logo.svg  kwadratowy monogram z inicjałów nazwy firmy (brand.ts) na kolorze akcentu
 *   og.webp   1200×630, tło w kolorze marki, nazwa firmy fontem marki (WebP bezstratny)
 *
 * Tekst przechodzi przez satori, które zamienia glify na ścieżki SVG — wynik nie
 * zależy od fontów zainstalowanych w systemie. Font marki to ten sam TTF z Google,
 * którego używają obrazy OG strony (og-fonts.ts, cache w node_modules/.cache).
 * Ten sam brand.ts → bajt w bajt ten sam plik przy każdym uruchomieniu.
 *
 *   pnpm --filter web demo:images
 *   pnpm --filter studio images:generate   (to samo, komenda delegująca)
 *
 * Mieszka w web/, bo tu są satori i sharp — studio/ nie dostaje przez to
 * żadnej nowej zależności.
 */

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';
import { brand } from '../src/config/brand.ts';
import { loadOgFonts } from '../src/lib/seo/og-fonts.ts';

const OUT_DIR = path.resolve(
	fileURLToPath(new URL('.', import.meta.url)),
	'../../studio/scripts/demo-images',
);
const LOGO_SIZE = 256;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const TEXT_ON_BRAND = '#ffffff';

/**
 * Inicjały: pierwsze litery dwóch pierwszych słów, z pominięciem nawiasów
 * („Firma Demo (przykład)” → „FD”). Jedno słowo → jego dwie pierwsze litery.
 */
function initials(name: string): string {
	const words = name
		.replace(/\([^)]*\)/g, ' ')
		.split(/\s+/)
		.map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
		.filter(Boolean);
	if (words.length === 0) return '?';
	if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
	return words
		.slice(0, 2)
		.map((word) => word[0]!)
		.join('')
		.toUpperCase();
}

type Element = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children: unknown): Element => ({
	type,
	props: { style, children },
});

const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex').slice(0, 12);

const { family, fonts } = await loadOgFonts(brand.font.family);
const name = brand.company.name;
const monogram = initials(name);
await mkdir(OUT_DIR, { recursive: true });

// --- logo.svg -------------------------------------------------------------
const logoSvg = await satori(
	h(
		'div',
		{
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: brand.colors.brand,
			color: TEXT_ON_BRAND,
			fontFamily: family,
			fontSize: monogram.length > 2 ? 96 : 128,
			fontWeight: 700,
			letterSpacing: '-0.04em',
			borderRadius: 32,
		},
		monogram,
	) as never,
	{ width: LOGO_SIZE, height: LOGO_SIZE, fonts },
);
await writeFile(path.join(OUT_DIR, 'logo.svg'), logoSvg);
console.log(
	`  ✔ logo.svg  ${LOGO_SIZE}×${LOGO_SIZE}, monogram „${monogram}”, ${Math.round(logoSvg.length / 1024)} kB, sha ${sha(logoSvg)}`,
);

// --- og.webp --------------------------------------------------------------
const fontSize = name.length > 28 ? 64 : name.length > 18 ? 84 : 100;
const ogSvg = await satori(
	h(
		'div',
		{
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '80px 96px',
			backgroundColor: brand.colors.brand,
			color: TEXT_ON_BRAND,
			fontFamily: family,
			fontSize,
			fontWeight: 700,
			lineHeight: 1.1,
			letterSpacing: '-0.02em',
			textAlign: 'center',
		},
		name,
	) as never,
	{ width: OG_WIDTH, height: OG_HEIGHT, fonts },
);
// Bezstratny WebP: płaskie tło i tekst kompresują się świetnie, a brak kwantyzacji
// oznacza identyczne bajty przy każdym uruchomieniu.
const og = await sharp(Buffer.from(ogSvg)).webp({ lossless: true }).toBuffer();
await writeFile(path.join(OUT_DIR, 'og.webp'), og);
console.log(
	`  ✔ og.webp   ${OG_WIDTH}×${OG_HEIGHT}, „${name}”, ${Math.round(og.length / 1024)} kB, sha ${sha(og)}`,
);
