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
		mimeType?: string | null;
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
	/** true = SVG. Idzie do dist/ w oryginale, bez rasteryzacji i bez srcset. */
	vector: boolean;
}

const builder = sanityProjectId
	? createImageUrlBuilder({ projectId: sanityProjectId, dataset: sanityDataset })
	: null;

type AssetLike = NonNullable<ImageLike['asset']>;

/**
 * Czy źródłem jest wektor. `mimeType` z metadanych assetu jest rozstrzygające;
 * rozszerzenie adresu to zapas dla treści demo, gdzie metadanych nie ma.
 */
function isVector(asset: AssetLike): boolean {
	if (asset.mimeType) return asset.mimeType === 'image/svg+xml';
	const withoutQuery = (asset.url ?? '').split('?')[0]!.split('#')[0]!;
	return withoutQuery.toLowerCase().endsWith('.svg');
}

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
 *
 * WEKTORY są wyjątkiem. CDN Sanity nie transformuje SVG (sprawdzone: `?w=`
 * i `?fit=` nie zmieniają odpowiedzi — wraca ten sam plik), a astro:assets
 * odmawia rasteryzacji bez `dangerouslyProcessSVG`. Zwracamy więc czysty adres
 * i wymiary własne assetu: logo trafia do dist/ jako wektor, jednym plikiem,
 * bez srcset. Kadr i hotspot są dla wektora pomijane, bo wydajemy oryginał.
 */
export function resolveImage(
	image: ImageLike | null | undefined,
	targetWidth: number,
): ResolvedImage | null {
	const asset = image?.asset;
	if (!asset?.url || !asset.width || !asset.height) return null;

	const alt = image?.alt ?? '';
	const remote = asset.url.startsWith('http');

	if (isVector(asset)) {
		return { src: asset.url, width: asset.width, height: asset.height, alt, remote, vector: true };
	}

	const crop = image?.crop ?? {};
	const cropW = 1 - (crop.left ?? 0) - (crop.right ?? 0);
	const cropH = 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
	const aspect = (asset.width * cropW) / (asset.height * cropH);

	const width = Math.min(targetWidth, Math.round(asset.width * cropW));
	const height = Math.round(width / aspect);

	// Treści demo: pliki z web/public/demo — bez CDN i bez optymalizacji.
	if (!remote || !builder) {
		return { src: asset.url, width, height, alt, remote: false, vector: false };
	}

	const src = builder
		.image({ asset: { _id: asset._id }, crop: image?.crop ?? undefined, hotspot: undefined })
		.width(width)
		.fit('max')
		.url();

	return { src, width, height, alt, remote: true, vector: false };
}

/**
 * Adres RASTROWY z CDN Sanity o zadanych wymiarach.
 *
 * Do obrazów OG i danych strukturalnych, czyli tam, gdzie odbiorca nie renderuje
 * SVG: podgląd linku na Facebooku i LinkedIn oraz `logo` w danych strukturalnych
 * Google wymagają rastra. Dla źródeł wektorowych prosimy CDN o konwersję (`fm`)
 * — sprawdzone, że Sanity ją wykonuje — dzięki czemu astro:assets dostaje
 * gotowego rastra i nie musi w ogóle dotykać SVG.
 *
 * `fit: 'crop'` respektuje hotspot ze Studio (kadrowanie do proporcji OG),
 * `fit: 'max'` mieści obraz w ramce bez przycinania (logo).
 */
export function cdnRasterUrl(
	image: ImageLike | null | undefined,
	options: { width: number; height: number; format: 'png' | 'jpg'; fit: 'crop' | 'max' },
): string | null {
	const asset = image?.asset;
	if (!asset?.url || !asset.url.startsWith('http') || !builder) return null;

	let url = builder
		.image({
			asset: { _id: asset._id },
			crop: image?.crop ?? undefined,
			hotspot: options.fit === 'crop' ? (image?.hotspot ?? undefined) : undefined,
		})
		.width(options.width)
		.height(options.height)
		.fit(options.fit);

	if (isVector(asset)) url = url.format(options.format);
	return url.url();
}
