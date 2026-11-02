/**
 * TREŚCI KLIENTA BEZ CMS-u — wariant, w którym stronę edytuje deweloper, nie klient.
 *
 * Włączane przez LOCAL_CONTENT=true (web/.env i zmienne builda w Cloudflare).
 * Kształt jest ten sam co wyniki zapytań do Sanity, więc wszystkie sekcje, SEO,
 * JSON-LD i formularz działają bez zmian, a literówkę w strukturze wyłapie `pnpm check`.
 *
 * Jak edytować:
 *   - zdjęcia wrzucasz do src/tresci/obrazy/ i podajesz nazwę pliku w `obraz()`;
 *     brak pliku albo pusty opis (alt) przerywa build,
 *   - kadrujesz przed wrzuceniem — tu nie ma hotspotu ze Studio,
 *   - logo najlepiej w PNG: Google w danych strukturalnych oczekuje rastra,
 *   - po każdej zmianie treści podbij UPDATED (trafia do <lastmod> w sitemapie).
 *
 * Przejście na panel Sanity później: projekt Sanity + import tych treści
 * (patrz docs/POSTEP.md, „Wariant bez CMS-u").
 *
 * Wartości poniżej są CELOWO FIKCYJNE — szablon do nadpisania treściami z briefu.
 */

import { obraz } from '~/lib/local-images';
import {
	contentBuilders,
	external,
	internal,
	type Navigation,
	type Page,
	type Redirect,
	type SiteContent,
	type SiteSettings,
} from '~/lib/sanity/builders';

const { key, paragraph, bullet } = contentBuilders('tresci');

/** Data ostatniej zmiany treści (ISO 8601). */
const UPDATED = '2026-11-02T00:00:00Z';

const siteSettings: SiteSettings = {
	companyName: 'Firma (przykład)',
	tagline: 'Krótkie zdanie o tym, czym firma się zajmuje — treść przykładowa.',
	nip: null,
	address: {
		street: 'ul. Przykładowa 1',
		postalCode: '00-000',
		city: 'Przykładowo',
		country: 'Polska',
	},
	phone: '+48 000 000 000',
	email: 'kontakt@example.com',
	openingHours: [
		{
			_key: key(),
			days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
			closed: false,
			opens: '09:00',
			closes: '17:00',
		},
		{ _key: key(), days: ['saturday', 'sunday'], closed: true, opens: null, closes: null },
	],
	social: null,
	logo: await obraz('logo.png', 'Firma (przykład) — logo'),
	defaultOgImage: await obraz('og.webp', 'Firma (przykład)'),
	// Puste pola = wartości domyślne komponentu (zgoda i klauzula składane z danych firmy).
	contactForm: {
		consentLabel: null,
		privacyNotice: null,
		successMessage: null,
		privacyPolicySlug: null,
	},
	analytics: { provider: 'none', domain: null, websiteId: null, scriptHost: null },
	geo: null,
};

const navigation: Navigation = {
	mainMenu: [{ _key: key(), label: 'Kontakt', link: internal('kontakt') }],
	footerMenu: [
		{ _key: key(), label: 'Strona główna', link: internal('/') },
		{ _key: key(), label: 'Kontakt', link: internal('kontakt') },
	],
};

const home: Page = {
	_id: 'tresci-strona-glowna',
	_updatedAt: UPDATED,
	title: 'Strona główna',
	slug: '/',
	seo: {
		metaTitle: 'Firma (przykład) — usługi w Przykładowie',
		metaDescription:
			'Przykładowa strona bez panelu treści. Podmień tytuł i opis na dane klienta z briefu — do 155 znaków.',
		noindex: false,
		ogImage: null,
	},
	sections: [
		{
			_key: key(),
			_type: 'hero',
			background: 'default',
			heading: 'Nagłówek strony głównej — jedno zdanie o tym, co dostaje klient',
			lead: 'Rozwinięcie w dwóch zdaniach: dla kogo, gdzie i dlaczego warto. Treść przykładowa.',
			image: await obraz('zdjecie-2.webp', 'Zdjęcie przykładowe (do podmiany)'),
			buttons: [{ _key: key(), label: 'Skontaktuj się', link: internal('kontakt') }],
		},
		{
			_key: key(),
			_type: 'features',
			background: 'alt',
			heading: 'Czym się zajmujemy',
			lead: null,
			items: [
				{ _key: key(), title: 'Usługa pierwsza', description: 'Jedno, dwa zdania opisu.' },
				{ _key: key(), title: 'Usługa druga', description: 'Jedno, dwa zdania opisu.' },
				{ _key: key(), title: 'Usługa trzecia', description: 'Jedno, dwa zdania opisu.' },
			],
		},
		{
			_key: key(),
			_type: 'textImage',
			background: 'default',
			heading: 'O firmie',
			body: [
				paragraph('Kilka zdań o historii firmy i ludziach, którzy ją tworzą. Treść przykładowa.'),
				paragraph('Co nas wyróżnia', 'h3'),
				bullet('Pierwszy wyróżnik'),
				bullet('Drugi wyróżnik'),
			],
			image: await obraz('zdjecie-1.webp', 'Drugie zdjęcie przykładowe (do podmiany)'),
			imagePosition: 'right',
		},
		{
			_key: key(),
			_type: 'faq',
			background: 'alt',
			heading: 'Najczęstsze pytania',
			items: [
				{
					_key: key(),
					question: 'Pierwsze pytanie klienta?',
					answer: [paragraph('Krótka, konkretna odpowiedź.')],
				},
				{
					_key: key(),
					question: 'Drugie pytanie klienta?',
					answer: [paragraph('Krótka, konkretna odpowiedź.')],
				},
			],
		},
		{
			_key: key(),
			_type: 'cta',
			background: 'accent',
			heading: 'Masz pytanie?',
			lead: 'Zadzwoń albo napisz — odpowiadamy w dni robocze.',
			button: { _key: null, label: 'Zadzwoń', link: external('tel:+48000000000', false) },
		},
	],
};

const contact: Page = {
	_id: 'tresci-kontakt',
	_updatedAt: UPDATED,
	title: 'Kontakt',
	slug: 'kontakt',
	seo: {
		metaTitle: 'Kontakt — Firma (przykład)',
		metaDescription:
			'Adres, telefon i formularz kontaktowy. Przykładowy opis podstrony — podmień na dane klienta.',
		noindex: false,
		ogImage: null,
	},
	sections: [
		{
			_key: key(),
			_type: 'contact',
			background: 'default',
			heading: 'Kontakt',
			lead: 'Napisz, w czym możemy pomóc — odpowiemy w ciągu jednego dnia roboczego.',
			showContactDetails: true,
			showMap: false,
		},
	],
};

/** Przekierowania ze starej strony klienta (trafiają do _redirects). */
const redirects: Redirect[] = [];

export const content: SiteContent = {
	siteSettings,
	navigation,
	redirects,
	pages: { '/': home, kontakt: contact },
};
