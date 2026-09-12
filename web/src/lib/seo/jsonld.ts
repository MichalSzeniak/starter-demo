import type { Page, SiteSettings } from '~/lib/content';
import { hrefForSlug } from '~/lib/links';
import { portableTextToPlain } from './plain-text';

/**
 * Budowniczowie węzłów JSON-LD. Każdy zwraca zwykły obiekt bez `@context` —
 * kontekst dokłada raz `jsonLdGraph()`, a węzły łączą się przez `@id`.
 *
 * Bez `schema-dts`: to byłaby kolejna zależność dla czterech typów węzłów.
 */

export type JsonLdNode = Record<string, unknown>;

const DAY_OF_WEEK: Record<string, string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

export function organizationId(site: URL): string {
	return new URL('/#organization', site).href;
}

export function webSiteId(site: URL): string {
	return new URL('/#website', site).href;
}

/** Organization + LocalBusiness jako jeden węzeł — LocalBusiness jest podtypem Organization. */
export function organizationNode(
	settings: SiteSettings,
	site: URL,
	logoUrl: string | null,
): JsonLdNode {
	const node: JsonLdNode = {
		'@type': ['Organization', 'LocalBusiness'],
		'@id': organizationId(site),
		name: settings.companyName,
		url: site.href,
	};
	if (settings.tagline) node.description = settings.tagline;
	if (logoUrl) node.logo = { '@type': 'ImageObject', url: logoUrl };
	if (settings.phone) node.telephone = settings.phone;
	if (settings.email) node.email = settings.email;
	if (settings.nip) node.vatID = `PL${settings.nip.replace(/[\s-]/g, '')}`;

	if (settings.address) {
		node.address = {
			'@type': 'PostalAddress',
			streetAddress: settings.address.street,
			postalCode: settings.address.postalCode,
			addressLocality: settings.address.city,
			addressCountry: settings.address.country === 'Polska' ? 'PL' : settings.address.country,
		};
	}

	if (settings.geo?.lat !== undefined && settings.geo?.lng !== undefined) {
		node.geo = {
			'@type': 'GeoCoordinates',
			latitude: settings.geo.lat,
			longitude: settings.geo.lng,
		};
	}

	const hours = (settings.openingHours ?? [])
		.filter((entry) => !entry.closed && entry.opens && entry.closes && entry.days.length > 0)
		.map((entry) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: entry.days.map((day) => DAY_OF_WEEK[day] ?? day),
			opens: entry.opens,
			closes: entry.closes,
		}));
	if (hours.length > 0) node.openingHoursSpecification = hours;

	const sameAs = (settings.social ?? []).map((profile) => profile.url).filter(Boolean);
	if (sameAs.length > 0) node.sameAs = sameAs;

	return node;
}

export function webSiteNode(settings: SiteSettings, site: URL, lang: string): JsonLdNode {
	return {
		'@type': 'WebSite',
		'@id': webSiteId(site),
		name: settings.companyName,
		url: site.href,
		inLanguage: lang,
		publisher: { '@id': organizationId(site) },
	};
}

/** Okruszki tylko na podstronach: Strona główna → bieżąca strona. */
export function breadcrumbNode(page: Page, site: URL): JsonLdNode | null {
	if (page.slug === '/') return null;
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Strona główna', item: site.href },
			{
				'@type': 'ListItem',
				position: 2,
				name: page.title,
				item: new URL(hrefForSlug(page.slug), site).href,
			},
		],
	};
}

/** FAQPage z wszystkich sekcji `faq` na stronie; null, gdy nie ma żadnego pytania. */
export function faqPageNode(page: Page): JsonLdNode | null {
	const questions = page.sections
		.filter((section) => section._type === 'faq')
		.flatMap((section) => section.items)
		.map((item) => ({ question: item.question, answer: portableTextToPlain(item.answer) }))
		.filter((item) => item.question && item.answer);

	if (questions.length === 0) return null;

	return {
		'@type': 'FAQPage',
		mainEntity: questions.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer },
		})),
	};
}

export function jsonLdGraph(nodes: readonly (JsonLdNode | null | undefined)[]): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@graph': nodes.filter((node): node is JsonLdNode => Boolean(node)),
	};
}
