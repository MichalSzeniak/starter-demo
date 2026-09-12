import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { brand } from '~/config/brand';
import type { ResolvedImage } from '~/lib/sanity/image';
import { loadOgFonts } from './og-fonts';
import { OG_HEIGHT, OG_WIDTH } from './og-image';

/**
 * Obraz OG generowany przy buildzie: tytuł strony + logo + nazwa firmy,
 * w kolorach i foncie z brand.ts.
 *
 * satori zamienia drzewo elementów (kształt jak React, bez Reacta) na SVG,
 * a sharp — który i tak jest w projekcie — rasteryzuje SVG do PNG. Dzięki temu
 * nie potrzebujemy @resvg/resvg-js ani żadnej natywnej binarki poza sharpem.
 *
 * Satori wymaga `display: 'flex'` na każdym elemencie z wieloma dziećmi.
 */

export interface OgCardInput {
	title: string;
	companyName: string;
	/** Host serwisu do stopki karty, np. example.com. */
	siteHost: string;
	logo: ResolvedImage | null;
}

type Element = { type: string; props: Record<string, unknown> };

function h(
	type: string,
	style: Record<string, unknown>,
	children?: unknown,
	extra?: Record<string, unknown>,
): Element {
	return { type, props: { style, ...extra, children } };
}

/** Logo jako data URI PNG — satori nie czyta SVG w <img>, a data URI omija dodatkowe I/O. */
async function logoDataUri(logo: ResolvedImage | null): Promise<string | null> {
	if (!logo) return null;
	try {
		const source = logo.remote
			? Buffer.from(await (await fetch(logo.src)).arrayBuffer())
			: await readFile(path.join(process.cwd(), 'public', logo.src));
		// Rasteryzujemy w 2× docelowej wysokości (96 px w karcie), żeby logo było ostre.
		// Wektor (SVG) można powiększać bez strat, rastra nie ma sensu rozciągać.
		const isSvg = (await sharp(source).metadata()).format === 'svg';
		const png = await sharp(source, isSvg ? { density: 300 } : undefined)
			.resize({ height: 192, withoutEnlargement: !isSvg })
			.png()
			.toBuffer();
		return `data:image/png;base64,${png.toString('base64')}`;
	} catch (error) {
		console.warn('[og] Nie udało się wczytać logo do obrazu OG:', error);
		return null;
	}
}

export async function renderOgPng(input: OgCardInput): Promise<Buffer> {
	const { family, fonts } = await loadOgFonts(brand.font.family);
	const logo = await logoDataUri(input.logo);
	const { colors } = brand;

	// Dłuższe tytuły dostają mniejszy stopień, żeby zmieściły się w trzech liniach.
	const titleSize = input.title.length > 70 ? 48 : input.title.length > 45 ? 56 : 66;

	const element = h(
		'div',
		{
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			padding: '64px 72px',
			backgroundColor: colors.surface,
			color: colors.ink,
			fontFamily: family,
			borderTop: `16px solid ${colors.brand}`,
		},
		[
			h(
				'div',
				{ display: 'flex', alignItems: 'center', height: 96 },
				logo
					? [h('img', { height: 96, objectFit: 'contain' }, undefined, { src: logo })]
					: [h('div', { fontSize: 36, fontWeight: 700, color: colors.brand }, input.companyName)],
			),
			h(
				'div',
				{
					display: 'flex',
					fontSize: titleSize,
					fontWeight: 700,
					lineHeight: 1.15,
					letterSpacing: '-0.02em',
					maxWidth: 1000,
				},
				input.title,
			),
			h(
				'div',
				{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: colors.muted },
				[
					h('div', { display: 'flex' }, input.companyName),
					h('div', { display: 'flex' }, input.siteHost),
				],
			),
		],
	);

	// Typ ReactNode w satori to tylko deklaracja — w runtime przyjmuje zwykłe obiekty {type, props}.
	const svg = await satori(element as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts });
	return sharp(Buffer.from(svg)).png().toBuffer();
}
