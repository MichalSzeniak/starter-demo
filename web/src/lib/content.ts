import { brand } from '~/config/brand';
import { contentSource, sanityClient } from './sanity/client';
import type { SiteContent } from './sanity/builders';
import { demoContent } from './sanity/fixtures';
import {
	NAVIGATION_QUERY,
	PAGE_BY_SLUG_QUERY,
	PAGE_INDEX_QUERY,
	REDIRECTS_QUERY,
	SITE_SETTINGS_QUERY,
} from './sanity/queries';
import type {
	NAVIGATION_QUERY_RESULT,
	PAGE_BY_SLUG_QUERY_RESULT,
	PAGE_INDEX_QUERY_RESULT,
	REDIRECTS_QUERY_RESULT,
	SITE_SETTINGS_QUERY_RESULT,
} from './sanity/types.gen';

/** TypeGen dokłada wariant „wszystko null”; bierzemy tylko ten z faktycznymi danymi. */
export type SiteSettings = Extract<
	NonNullable<SITE_SETTINGS_QUERY_RESULT>,
	{ companyName: string }
>;
export type Navigation = NonNullable<NAVIGATION_QUERY_RESULT>;
export type Page = NonNullable<PAGE_BY_SLUG_QUERY_RESULT>;
export type PageIndexEntry = PAGE_INDEX_QUERY_RESULT[number];
export type Redirect = REDIRECTS_QUERY_RESULT[number];

/**
 * Jedyne miejsce, przez które strona sięga po treści.
 *
 * Komponenty nie wiedzą, czy dane przyszły z Sanity, czy z fixtures — dostają
 * ten sam kształt (typy wygenerowane z zapytań). Wyniki są memoizowane na czas
 * builda: ustawienia i nawigację pobieramy raz, nie raz na każdą podstronę.
 */

const memo = new Map<string, Promise<unknown>>();

function once<T>(key: string, load: () => Promise<T>): Promise<T> {
	let pending = memo.get(key) as Promise<T> | undefined;
	if (!pending) {
		pending = load();
		memo.set(key, pending);
	}
	return pending;
}

/**
 * Ustawienia z brand.ts, gdy w Sanity nie ma jeszcze dokumentu `siteSettings`
 * (projekt istnieje, klient nic nie wypełnił). Strona ma się zbudować,
 * a nie wywalić na pustym singletonie.
 */
function settingsFromBrand(): SiteSettings {
	const { company } = brand;
	return {
		companyName: company.name,
		tagline: company.tagline,
		nip: null,
		address: {
			street: company.street,
			postalCode: company.postalCode,
			city: company.city,
			country: company.country,
		},
		geo: null,
		phone: company.phone,
		email: company.email,
		openingHours: null,
		social: null,
		logo: null,
		defaultOgImage: null,
		contactForm: null,
		analytics: null,
	};
}

/**
 * Treści zapisane w kodzie: demo (fixtures) albo klienta bez CMS-u (src/tresci/).
 * `null` = źródłem jest Sanity. Treści klienta ładowane leniwie — w buildzie
 * z Sanity albo demo moduł src/tresci/ (i jego obrazy) w ogóle się nie wykonuje.
 */
async function contentInCode(): Promise<SiteContent | null> {
	if (contentSource === 'demo') return demoContent;
	if (contentSource === 'local') return (await import('~/tresci')).content;
	return null;
}

export function getSiteSettings(): Promise<SiteSettings> {
	return once('siteSettings', async () => {
		const inCode = await contentInCode();
		if (inCode) return inCode.siteSettings;
		const result = await sanityClient!.fetch<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY);
		if (!result?.companyName) {
			console.warn('[sanity] Brak dokumentu siteSettings — używam danych z brand.ts.');
			return settingsFromBrand();
		}
		return result;
	});
}

export function getNavigation(): Promise<Navigation> {
	return once('navigation', async () => {
		const inCode = await contentInCode();
		if (inCode) return inCode.navigation;
		const result = await sanityClient!.fetch<NAVIGATION_QUERY_RESULT>(NAVIGATION_QUERY);
		return result ?? { mainMenu: null, footerMenu: null };
	});
}

/** Wszystkie strony ze slugiem — do getStaticPaths i sitemapy. */
export function getPageIndex(): Promise<PageIndexEntry[]> {
	return once('pageIndex', async () => {
		const inCode = await contentInCode();
		if (inCode) {
			return Object.values(inCode.pages).map((page) => ({
				slug: page.slug,
				_updatedAt: page._updatedAt,
				noindex: page.seo.noindex === true,
			}));
		}
		const result = await sanityClient!.fetch<PAGE_INDEX_QUERY_RESULT>(PAGE_INDEX_QUERY);
		return result.filter((row) => Boolean(row.slug));
	});
}

export function getRedirects(): Promise<Redirect[]> {
	return once('redirects', async () => {
		const inCode = await contentInCode();
		if (inCode) return inCode.redirects;
		return sanityClient!.fetch<REDIRECTS_QUERY_RESULT>(REDIRECTS_QUERY);
	});
}

export function getPage(slug: string): Promise<Page | null> {
	return once(`page:${slug}`, async () => {
		const inCode = await contentInCode();
		if (inCode) return inCode.pages[slug] ?? null;
		return sanityClient!.fetch<PAGE_BY_SLUG_QUERY_RESULT>(PAGE_BY_SLUG_QUERY, { slug });
	});
}
