/**
 * Odchudza zdjęcia w studio/scripts/demo-images przed wersjonowaniem:
 * dłuższy bok maks. 1600 px, WebP q80. Oryginał jpg/png/gif/avif jest zastępowany
 * plikiem .webp o tej samej nazwie; .webp mieszczące się w limicie są pomijane;
 * SVG nietykane. Cel: ok. 200–300 kB na zdjęcie.
 *
 *   pnpm --filter studio images:optimize [--dry-run]
 */

import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DIR = path.join(fileURLToPath(new URL('.', import.meta.url)), 'demo-images');
const MAX_SIDE = 1600;
const QUALITY = 80;
const SOURCES = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
const DRY_RUN = process.argv.includes('--dry-run');

const kb = (bytes: number) => `${Math.round(bytes / 1024)} kB`;
let totalBefore = 0;
let totalAfter = 0;

for (const entry of (await readdir(DIR)).sort()) {
	const ext = path.extname(entry).toLowerCase();
	if (!SOURCES.includes(ext)) continue;

	const input = path.join(DIR, entry);
	const meta = await sharp(input).metadata();
	const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
	if (ext === '.webp' && longest <= MAX_SIDE) {
		console.log(`  = ${entry}  ${meta.width}×${meta.height}, już w limicie`);
		continue;
	}

	const size = (await stat(input)).size;
	totalBefore += size;
	const output = path.join(DIR, `${path.basename(entry, ext)}.webp`);
	if (DRY_RUN) {
		console.log(
			`  ~ ${entry}  ${meta.width}×${meta.height} ${kb(size)} → ${path.basename(output)} (≤${MAX_SIDE} px, q${QUALITY})`,
		);
		continue;
	}

	// rotate() bez argumentu = zastosuj orientację z EXIF, żeby zdjęcia z telefonu nie leżały na boku.
	const buffer = await sharp(input)
		.rotate()
		.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: QUALITY })
		.toBuffer();
	await writeFile(output, buffer);
	if (output !== input) await unlink(input);
	totalAfter += buffer.length;

	const out = await sharp(buffer).metadata();
	console.log(
		`  ✔ ${entry}  ${meta.width}×${meta.height} ${kb(size)} → ${path.basename(output)}  ${out.width}×${out.height} ${kb(buffer.length)}`,
	);
}

console.log(
	DRY_RUN
		? `\nDry-run: ${kb(totalBefore)} do przetworzenia.`
		: `\nRazem: ${kb(totalBefore)} → ${kb(totalAfter)}.`,
);
