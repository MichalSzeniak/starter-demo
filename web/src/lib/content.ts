import { brand } from '~/config/brand';
import { contentSource, sanityClient } from './sanity/client';
import { demoContent } from './sanity/fixtures';
import {
	NAVIGATION_QUERY,
	PAGE_BY_SLUG_QUERY,
	PAGE_SLUGS_QUERY,
	SITE_SETTINGS_QUERY,
} from './sanity/queries';
import type {
	NAVIGATION_QUERY_RESULT,
	PAGE_BY_SLUG_QUERY_RESULT,
	PAGE_SLUGS_QUERY_RESULT,
	SITE_SETTINGS_QUERY_RESULT,
} from './sanity/types.gen';

/** TypeGen dokłada wariant „wszystko null”; bierzemy tylko ten z faktycznymi danymi. */
export type SiteSettings = Extract<
	NonNullable<SITE_SETTINGS_QUERY_RESULT>,
	{ companyName: string }
>;
export type Navigation = NonNullable<NAVIGATION_QUERY_RESULT>;
export type Page = NonNullable<PAGE_BY_SLUG_QUERY_RESULT>;

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
		phone: company.phone,
		email: company.email,
		openingHours: null,
		social: null,
		logo: null,
		defaultOgImage: null,
		analytics: null,
	};
}

export function getSiteSettings(): Promise<SiteSettings> {
	return once('siteSettings', async () => {
		if (contentSource === 'demo') return demoContent.siteSettings;
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
		if (contentSource === 'demo') return demoContent.navigation;
		const result = await sanityClient!.fetch<NAVIGATION_QUERY_RESULT>(NAVIGATION_QUERY);
		return result ?? { mainMenu: null, footerMenu: null };
	});
}

export function getPageSlugs(): Promise<string[]> {
	return once('pageSlugs', async () => {
		if (contentSource === 'demo') return Object.keys(demoContent.pages);
		const result = await sanityClient!.fetch<PAGE_SLUGS_QUERY_RESULT>(PAGE_SLUGS_QUERY);
		return result.map((row) => row.slug).filter((slug): slug is string => Boolean(slug));
	});
}

export function getPage(slug: string): Promise<Page | null> {
	return once(`page:${slug}`, async () => {
		if (contentSource === 'demo') return demoContent.pages[slug] ?? null;
		return sanityClient!.fetch<PAGE_BY_SLUG_QUERY_RESULT>(PAGE_BY_SLUG_QUERY, { slug });
	});
}
