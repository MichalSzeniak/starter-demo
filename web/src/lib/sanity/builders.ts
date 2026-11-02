import type {
	NAVIGATION_QUERY_RESULT,
	PAGE_BY_SLUG_QUERY_RESULT,
	REDIRECTS_QUERY_RESULT,
	SITE_SETTINGS_QUERY_RESULT,
} from './types.gen';

/**
 * Typy i helpery do pisania treści w kodzie — w kształcie wyników zapytań (TypeGen).
 *
 * Używają ich treści demo (fixtures.ts) i treści klienta bez panelu (src/tresci/).
 * Moduł importuje też `studio/scripts/seed.ts` przez fixtures, uruchamiany czystym
 * Node'em — dlatego wyłącznie typy i zwykły TS: bez aliasu `~`, bez `import.meta.glob`.
 */

export type SiteSettings = Extract<
	NonNullable<SITE_SETTINGS_QUERY_RESULT>,
	{ companyName: string }
>;
export type Navigation = NonNullable<NAVIGATION_QUERY_RESULT>;
export type Page = NonNullable<PAGE_BY_SLUG_QUERY_RESULT>;
export type Section = Page['sections'][number];
export type GalleryItem = Extract<Section, { _type: 'gallery' }>['items'][number];
export type Image = NonNullable<Extract<Section, { _type: 'hero' }>['image']>;
export type Link = Extract<Section, { _type: 'cta' }>['button']['link'];
export type Block = Extract<Section, { _type: 'faq' }>['items'][number]['answer'][number];
export type Redirect = REDIRECTS_QUERY_RESULT[number];

/** Komplet treści strony — to samo, co zwracają zapytania do Sanity. */
export interface SiteContent {
	siteSettings: SiteSettings;
	navigation: Navigation;
	redirects: Redirect[];
	/** Klucz = slug strony; strona główna to `/`. */
	pages: Record<string, Page>;
}

/** Odnośnik do podstrony; `anchor` = sekcja na niej (strona jednostronicowa: `internal('/', 'o-mnie')`). */
export const internal = (slug: string, anchor: string | null = null): Link => ({
	kind: 'internal',
	href: null,
	newTab: null,
	page: { slug },
	anchor,
});

export const external = (href: string, newTab = true): Link => ({
	kind: 'external',
	href,
	newTab,
	page: null,
	anchor: null,
});

/**
 * Helpery wymagające unikalnych `_key`. Każdy plik treści tworzy własny zestaw
 * z innym prefiksem, żeby klucze z dwóch źródeł nigdy się nie zderzyły.
 */
export function contentBuilders(keyPrefix: string) {
	let counter = 0;
	const key = () => `${keyPrefix}-${++counter}`;

	function paragraph(text: string, style: 'normal' | 'h2' | 'h3' = 'normal'): Block {
		return {
			_type: 'block',
			_key: key(),
			style,
			markDefs: null,
			children: [{ _type: 'span', _key: key(), text, marks: [] }],
		};
	}

	function bullet(text: string): Block {
		return { ...paragraph(text), listItem: 'bullet', level: 1 };
	}

	/** Akapit z jednym odnośnikiem w środku (adnotacja `link` w Portable Text). */
	function paragraphWithLink(before: string, linkText: string, link: Link, after: string): Block {
		const markKey = key();
		return {
			_type: 'block',
			_key: key(),
			style: 'normal',
			markDefs: [{ _key: markKey, _type: 'link', ...link }],
			children: [
				{ _type: 'span', _key: key(), text: before, marks: [] },
				{ _type: 'span', _key: key(), text: linkText, marks: [markKey] },
				{ _type: 'span', _key: key(), text: after, marks: [] },
			],
		};
	}

	return { key, paragraph, bullet, paragraphWithLink };
}
