import path from 'node:path';
import type { ImageMetadata } from 'astro';
import type { Image } from './sanity/builders';

/**
 * Obrazy wariantu bez CMS-u: pliki z web/src/tresci/obrazy/.
 *
 * W treści (src/tresci/index.ts) obraz to `obraz('hero.jpg', 'opis')` — w tym samym
 * kształcie co obraz z Sanity, więc komponenty go nie odróżniają. Wymiary czytamy
 * z pliku, a przy renderowaniu `resolveImage` sięga tu po `ImageMetadata`, żeby
 * zdjęcie przeszło przez astro:assets (srcset, WebP) jak obraz z CDN Sanity.
 *
 * `import.meta.glob` jest leniwy: plik obrazu trafia do builda dopiero wtedy, gdy
 * treść klienta go użyje. W buildzie z Sanity albo demo nie ładujemy żadnego.
 */

const DIR = '/src/tresci/obrazy/';
const loaders = import.meta.glob<ImageMetadata>(
	'/src/tresci/obrazy/*.{jpg,jpeg,png,webp,avif,svg}',
	{ import: 'default' },
);

/** Prefiks `_id` assetu — po nim `resolveImage` rozpoznaje obraz lokalny. */
export const LOCAL_IMAGE_ID_PREFIX = 'image-local-';

/** Wczytane metadane po nazwie pliku. Wypełniane przez `obraz()` przy ładowaniu treści. */
const loaded = new Map<string, ImageMetadata>();

/**
 * Obraz z web/src/tresci/obrazy/ w kształcie obrazu z Sanity.
 * Brak pliku albo pustego `alt` przerywa build — tak jak walidacja w Studio.
 */
export async function obraz(file: string, alt: string): Promise<Image> {
	const load = loaders[DIR + file];
	if (!load) {
		const available = Object.keys(loaders).map((key) => key.slice(DIR.length));
		throw new Error(
			`[treści] Brak pliku web/src/tresci/obrazy/${file}. Dostępne: ${available.join(', ') || '(katalog pusty)'}.`,
		);
	}
	if (!alt.trim()) throw new Error(`[treści] Obraz ${file} nie ma opisu (alt) — jest wymagany.`);

	const meta = await load();
	loaded.set(file, meta);
	return {
		_key: null,
		alt,
		hotspot: null,
		crop: null,
		asset: {
			_id: `${LOCAL_IMAGE_ID_PREFIX}${file}`,
			url: meta.src,
			mimeType: meta.format === 'svg' ? 'image/svg+xml' : `image/${meta.format}`,
			width: meta.width,
			height: meta.height,
		},
	};
}

export interface LocalImage {
	meta: ImageMetadata;
	/** Ścieżka na dysku — dla karty OG, która czyta plik sharpem. */
	file: string;
}

/** Obraz lokalny po `_id` assetu albo `null`, gdy to nie jest obraz z src/tresci/obrazy/. */
export function localImageById(id: string): LocalImage | null {
	if (!id.startsWith(LOCAL_IMAGE_ID_PREFIX)) return null;
	const name = id.slice(LOCAL_IMAGE_ID_PREFIX.length);
	const meta = loaded.get(name);
	if (!meta) return null;
	// Build i dev uruchamiane są z katalogu web/ — tak samo liczy ścieżki og.ts.
	return { meta, file: path.join(process.cwd(), 'src', 'tresci', 'obrazy', name) };
}
