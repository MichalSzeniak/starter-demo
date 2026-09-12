import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityDataset, sanityProjectId } from './client';

/**
 * Minimalny kształt obrazu, jaki zwraca fragment IMAGE z queries.ts.
 * Typ strukturalny — pasuje do każdego wygenerowanego typu wyniku.
 */
export interface ImageLike {
	alt?: string | null;
	crop?: {
		top?: number | null;
		bottom?: number | null;
		left?: number | null;
		right?: number | null;
	} | null;
	hotspot?: { x: number; y: number; width: number; height: number } | null;
	asset?: {
		_id: string;
		url: string | null;
		width: number | null;
		height: number | null;
	} | null;
}

export interface ResolvedImage {
	/** Adres do pobrania przy buildzie (CDN Sanity) albo lokalny plik demo. */
	src: string;
	width: number;
	height: number;
	alt: string;
	/** true = obraz z CDN Sanity, przechodzi przez astro:assets. */
	remote: boolean;
}

const builder = sanityProjectId
	? createImageUrlBuilder({ projectId: sanityProjectId, dataset: sanityDataset })
	: null;

/**
 * Zamienia obraz z Sanity na to, czego potrzebuje <Image>: adres + wymiary.
 *
 * Wymiary liczymy sami, z metadanych i kadru (crop) ustawionego w Studio —
 * dzięki temu width/height w HTML zgadzają się z tym, co faktycznie zwróci
 * CDN, i nie ma przesunięć układu. Hotspot nie zmienia proporcji przy
 * `fit('max')`, więc nie wpływa na te obliczenia.
 *
 * Z CDN prosimy od razu o przeskalowaną wersję (`width` = docelowa szerokość):
 * astro:assets pobiera wtedy kilkadziesiąt kB zamiast oryginału z aparatu.
 */
export function resolveImage(
	image: ImageLike | null | undefined,
	targetWidth: number,
): ResolvedImage | null {
	const asset = image?.asset;
	if (!asset?.url || !asset.width || !asset.height) return null;

	const crop = image?.crop ?? {};
	const cropW = 1 - (crop.left ?? 0) - (crop.right ?? 0);
	const cropH = 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
	const aspect = (asset.width * cropW) / (asset.height * cropH);

	const width = Math.min(targetWidth, Math.round(asset.width * cropW));
	const height = Math.round(width / aspect);
	const alt = image?.alt ?? '';

	// Treści demo: pliki z web/public/demo — bez CDN i bez optymalizacji.
	if (!asset.url.startsWith('http') || !builder) {
		return { src: asset.url, width, height, alt, remote: false };
	}

	const src = builder
		.image({ asset: { _id: asset._id }, crop: image?.crop ?? undefined, hotspot: undefined })
		.width(width)
		.fit('max')
		.url();

	return { src, width, height, alt, remote: true };
}

/**
 * Adres kadru o zadanych wymiarach z CDN Sanity — do obrazów OG (1200×630).
 * `fit('crop')` respektuje hotspot ustawiony w Studio. null dla obrazów demo.
 */
export function cdnCropUrl(
	image: ImageLike | null | undefined,
	width: number,
	height: number,
): string | null {
	const asset = image?.asset;
	if (!asset?.url || !asset.url.startsWith('http') || !builder) return null;
	return builder
		.image({
			asset: { _id: asset._id },
			crop: image?.crop ?? undefined,
			hotspot: image?.hotspot ?? undefined,
		})
		.width(width)
		.height(height)
		.fit('crop')
		.url();
}
