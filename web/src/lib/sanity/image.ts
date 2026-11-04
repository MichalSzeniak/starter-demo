import { createImageUrlBuilder } from '@sanity/image-url';
import type { ImageMetadata } from 'astro';
import { localImageById } from '../local-images';
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

/**
 * Skąd pochodzi obraz:
 * - `sanity` — CDN Sanity, pobierany i optymalizowany przy buildzie przez astro:assets,
 * - `local`  — plik z src/tresci/obrazy/ (wariant bez CMS-u), też przez astro:assets,
 * - `demo`   — placeholder z public/demo, zwykły <img> bez optymalizacji.
 */
export type ImageSource = 'sanity' | 'local' | 'demo';

export type ResolvedImage = {
	width: number;
	height: number;
	alt: string;
	/** true = SVG. Idzie do dist/ w oryginale, bez rasteryzacji i bez srcset. */
	vector: boolean;
} & (
	| { source: 'sanity'; /** Adres CDN do pobrania przy buildzie. */ src: string }
	| { source: 'local'; src: ImageMetadata; /** Ścieżka pliku na dysku. */ file: string }
	| { source: 'demo'; /** Ścieżka w public/. */ src: string }
);

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
	const vector = isVector(asset);

	// Wariant bez CMS-u: bez kadru i hotspotu — zdjęcie przygotowujemy przed wrzuceniem.
	const local = localImageById(asset._id);
	if (local) {
		const width = vector ? local.meta.width : Math.min(targetWidth, local.meta.width);
		const height = Math.round((width * local.meta.height) / local.meta.width);
		return { source: 'local', src: local.meta, file: local.file, width, height, alt, vector };
	}

	const remote = asset.url.startsWith('http');

	if (vector) {
		const size = { width: asset.width, height: asset.height, alt, vector };
		return remote
			? { source: 'sanity', src: asset.url, ...size }
			: { source: 'demo', src: asset.url, ...size };
	}

	const crop = image?.crop ?? {};
	const cropW = 1 - (crop.left ?? 0) - (crop.right ?? 0);
	const cropH = 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
	const aspect = (asset.width * cropW) / (asset.height * cropH);

	const width = Math.min(targetWidth, Math.round(asset.width * cropW));
	const height = Math.round(width / aspect);

	// Treści demo: pliki z web/public/demo — bez CDN i bez optymalizacji.
	if (!remote || !builder) {
		return { source: 'demo', src: asset.url, width, height, alt, vector: false };
	}

	const src = builder
		.image({ asset: { _id: asset._id }, crop: image?.crop ?? undefined, hotspot: undefined })
		.width(width)
		.fit('max')
		.url();

	return { source: 'sanity', src, width, height, alt, vector: false };
}

/**
 * Punkt ostrości (hotspot ze Studio) jako wartość `object-position`.
 *
 * Do zdjęć przycinanych CSS-em (`object-fit: cover` przy kształcie łuku i koła).
 * Hotspot jest zapisany we współrzędnych całego zdjęcia, a CDN wydaje już kadr
 * (crop) — przeliczamy go na współrzędne kadru. Brak hotspotu (wariant bez CMS-u,
 * treści demo) = środek.
 */
export function focalPoint(image: ImageLike | null | undefined): string {
	const hotspot = image?.hotspot;
	if (!hotspot) return '50% 50%';
	const crop = image?.crop ?? {};
	const left = crop.left ?? 0;
	const top = crop.top ?? 0;
	const cropW = 1 - left - (crop.right ?? 0);
	const cropH = 1 - top - (crop.bottom ?? 0);
	const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v * 1000) / 10));
	return `${clamp((hotspot.x - left) / cropW)}% ${clamp((hotspot.y - top) / cropH)}%`;
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
