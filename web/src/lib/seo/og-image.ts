import { getImage } from 'astro:assets';
import { cdnRasterUrl, type ImageLike } from '~/lib/sanity/image';

/**
 * Obraz Open Graph strony. Kolejność:
 *   1. własny obraz podstrony (`seo.ogImage`),
 *   2. domyślny z ustawień (`siteSettings.defaultOgImage`) — tak obiecuje opis pola w Studio,
 *   3. wygenerowany przy buildzie z tytułu i logo (`/og/<id>.png`).
 * Obrazy z Sanity przechodzą przez astro:assets do lokalnego JPG 1200×630 —
 * w HTML nie ma linku do CDN.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface OgImage {
	/** Absolutny adres — Facebook i LinkedIn nie rozwiązują względnych. */
	url: string;
	width: number;
	height: number;
	alt: string;
}

/** Identyfikator pliku OG dla sluga; strona główna nie może być `/.png`. */
export function ogIdForSlug(slug: string): string {
	return slug === '/' ? 'strona-glowna' : slug;
}

export function requireSite(site: URL | undefined): URL {
	if (!site)
		throw new Error('Brak `site` w astro.config.ts — metadane wymagają adresu absolutnego.');
	return site;
}

export async function ogImageFromSanity(
	image: ImageLike | null | undefined,
	site: URL,
): Promise<OgImage | null> {
	// Raster już z CDN: gdyby klient wgrał tu SVG, podgląd linku i tak by go nie
	// wyrenderował, a astro:assets odmówiłby rasteryzacji.
	const src = cdnRasterUrl(image, {
		width: OG_WIDTH,
		height: OG_HEIGHT,
		format: 'jpg',
		fit: 'crop',
	});
	if (!src) return null;

	// JPG, nie WebP: część serwisów społecznościowych nadal nie renderuje WebP w podglądzie linku.
	const result = await getImage({
		src,
		width: OG_WIDTH,
		height: OG_HEIGHT,
		format: 'jpg',
		fit: 'cover',
	});
	return {
		url: new URL(result.src, site).href,
		width: OG_WIDTH,
		height: OG_HEIGHT,
		alt: image?.alt ?? '',
	};
}

export function generatedOgImage(id: string, site: URL, alt: string): OgImage {
	return { url: new URL(`/og/${id}.png`, site).href, width: OG_WIDTH, height: OG_HEIGHT, alt };
}
