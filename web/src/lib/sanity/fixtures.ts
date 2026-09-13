import type {
	NAVIGATION_QUERY_RESULT,
	PAGE_BY_SLUG_QUERY_RESULT,
	REDIRECTS_QUERY_RESULT,
	SITE_SETTINGS_QUERY_RESULT,
} from './types.gen';

/**
 * TREŚCI DEMO — używane, gdy nie ma projektu Sanity.
 *
 * Kształt jest 1:1 z wynikami zapytań (typy wygenerowane przez TypeGen), więc
 * komponenty nie widzą różnicy. Obrazy to placeholdery SVG z web/public/demo.
 * Wszystkie dane są celowo fikcyjne.
 *
 * Nie jest to drugie źródło prawdy dla klienta: skrypt `pnpm nowy-klient`
 * (faza 7) czyści te treści. W międzyczasie pilnują ich typy — zmiana schemy
 * bez aktualizacji fixtures nie przejdzie `pnpm check`.
 */

type SiteSettings = Extract<NonNullable<SITE_SETTINGS_QUERY_RESULT>, { companyName: string }>;
type Navigation = NonNullable<NAVIGATION_QUERY_RESULT>;
type Page = NonNullable<PAGE_BY_SLUG_QUERY_RESULT>;
type Section = Page['sections'][number];
type GalleryItem = Extract<Section, { _type: 'gallery' }>['items'][number];
type Image = NonNullable<Extract<Section, { _type: 'hero' }>['image']>;
type Link = Extract<Section, { _type: 'cta' }>['button']['link'];
type Block = Extract<Section, { _type: 'faq' }>['items'][number]['answer'][number];
type Redirect = REDIRECTS_QUERY_RESULT[number];

let counter = 0;
const key = () => `demo-${++counter}`;

function image(name: string, alt: string, width: number, height: number): Image {
	return {
		_key: null,
		alt,
		hotspot: null,
		crop: null,
		asset: {
			_id: `image-demo-${name}`,
			url: `/demo/${name}.svg`,
			mimeType: 'image/svg+xml',
			width,
			height,
		},
	};
}

/** Element galerii. Podpis (tytuł, opis) jest opcjonalny; `alt` — zawsze. */
function galleryItem(
	name: string,
	alt: string,
	title: string | null = null,
	description: string | null = null,
): GalleryItem {
	return { _key: key(), title, description, image: image(name, alt, 800, 600) };
}

const internal = (slug: string): Link => ({
	kind: 'internal',
	href: null,
	newTab: null,
	page: { slug },
});
const external = (href: string, newTab = true): Link => ({
	kind: 'external',
	href,
	newTab,
	page: null,
});

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

/** Akapit z jednym odnośnikiem w środku — ćwiczy adnotację `link` w Portable Text. */
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

const siteSettings: SiteSettings = {
	companyName: 'Firma Demo (przykład)',
	tagline: 'Naprawy, montaż i serwis dla domu i małych firm — treść przykładowa.',
	nip: '0000000000',
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
			opens: '08:00',
			closes: '17:00',
		},
		{ _key: key(), days: ['saturday'], closed: false, opens: '09:00', closes: '13:00' },
		{ _key: key(), days: ['sunday'], closed: true, opens: null, closes: null },
	],
	social: [
		{ _key: key(), platform: 'facebook', url: 'https://www.facebook.com/example' },
		{ _key: key(), platform: 'instagram', url: 'https://www.instagram.com/example' },
	],
	logo: image('logo', 'Firma Demo — logo', 240, 80),
	defaultOgImage: image('og', 'Firma Demo', 1200, 630),
	// Puste pola = wartości domyślne komponentu (zgoda i klauzula składane z danych firmy).
	contactForm: {
		consentLabel: null,
		privacyNotice: null,
		successMessage: null,
		privacyPolicySlug: null,
	},
	analytics: { provider: 'none', domain: null, websiteId: null, scriptHost: null },
	geo: { _type: 'geopoint', lat: 52.2297, lng: 21.0122 },
};

const navigation: Navigation = {
	mainMenu: [
		{ _key: key(), label: 'O nas', link: internal('o-nas') },
		{ _key: key(), label: 'Cennik', link: internal('cennik') },
	],
	footerMenu: [
		{ _key: key(), label: 'Strona główna', link: internal('/') },
		{ _key: key(), label: 'O nas', link: internal('o-nas') },
		{ _key: key(), label: 'Cennik', link: internal('cennik') },
	],
};

/*
 * Trzy podstrony demo ułożone jak prawdziwa strona firmy usługowej.
 * Razem pokrywają KAŻDY typ sekcji z biblioteki (pilnuje tego seed):
 *
 *   /        hero · features · testimonials · gallery (siatka) · cta
 *   /o-nas   textImage · gallery (karuzela) · faq · cta
 *   /cennik  pricing · faq · contact
 *
 * Galeria występuje w obu układach na tych samych zdjęciach — da się je porównać
 * (karuzela: 10 kafelków z powtórzeniami, żeby było co przewijać).
 *
 * Tła ustawione ręcznie (rytm: podstawowe / alternatywne na zmianę, CTA w kolorze
 * marki, ostatnia sekcja podstawowa — odcina się od stopki). W Studio domyślne
 * jest „auto" — patrz `sectionBackgrounds` w sections.ts.
 */

const home: Page = {
	_id: 'demo-page-home',
	_updatedAt: '2026-09-13T08:00:00Z',
	title: 'Strona główna',
	slug: '/',
	seo: {
		metaTitle: 'Firma Demo — naprawy i serwis w Przykładowie',
		metaDescription:
			'Przykładowa strona wizytówka: naprawy, montaż i serwis dla domu i małych firm. Szybka wycena, dojazd w 24 h.',
		noindex: false,
		ogImage: null,
	},
	sections: [
		{
			_key: key(),
			_type: 'hero',
			background: 'default',
			heading: 'Naprawimy to szybciej, niż zdążysz się zdenerwować',
			lead: 'Serwis dla domu i małych firm w Przykładowie i okolicy. Wycena przez telefon, dojazd w 24 godziny, gwarancja na każdą usługę.',
			image: image('hero', 'Technik przy pracy w warsztacie (placeholder)', 1200, 800),
			buttons: [
				{ _key: key(), label: 'Zobacz cennik', link: internal('cennik') },
				{ _key: key(), label: 'Poznaj nas', link: internal('o-nas') },
			],
		},
		{
			_key: key(),
			_type: 'features',
			background: 'alt',
			heading: 'Dlaczego my',
			lead: 'Trzy rzeczy, które słyszymy od klientów najczęściej.',
			items: [
				{
					_key: key(),
					title: 'Dojazd w 24 h',
					description:
						'W dni robocze jesteśmy u Ciebie następnego dnia. Pilne awarie — tego samego.',
				},
				{
					_key: key(),
					title: 'Cena przed rozpoczęciem',
					description: 'Wycenę dostajesz przed pracą, nie po. Bez niespodzianek na fakturze.',
				},
				{
					_key: key(),
					title: 'Gwarancja 24 miesiące',
					description: 'Na każdą naprawę i montaż. Jeśli coś zawiedzie, wracamy bez dyskusji.',
				},
			],
		},
		{
			_key: key(),
			_type: 'testimonials',
			background: 'default',
			heading: 'Co mówią klienci',
			items: [
				{
					_key: key(),
					quote:
						'Przyjechali następnego dnia rano, wycena zgadzała się co do złotówki. Polecam każdemu, kto ma dość czekania tydzień na fachowca.',
					author: 'Anna K.',
					role: 'klientka indywidualna',
					avatar: image('avatar-1', 'Anna K. (placeholder)', 200, 200),
				},
				{
					_key: key(),
					quote:
						'Obsługują nasz lokal od trzech lat. Przeglądy zawsze na czas, protokół w mailu tego samego dnia.',
					author: 'Marek N.',
					role: 'właściciel restauracji',
					avatar: image('avatar-2', 'Marek N. (placeholder)', 200, 200),
				},
			],
		},
		{
			_key: key(),
			_type: 'gallery',
			background: 'alt',
			heading: 'Nasze realizacje',
			layout: 'grid',
			items: [
				galleryItem(
					'galeria-1',
					'Realizacja 1 (placeholder)',
					'Nowa instalacja w kuchni',
					'Mieszkanie w bloku, dwa dni pracy. Przyłącza wody i gniazda pod zabudowę.',
				),
				galleryItem(
					'galeria-2',
					'Realizacja 2 (placeholder)',
					'Montaż pompy ciepła',
					'Dom pod Przykładowem. Montaż, uruchomienie i instruktaż w jeden dzień.',
				),
				galleryItem(
					'galeria-3',
					'Realizacja 3 (placeholder)',
					'Przegląd wentylacji w restauracji',
					'Przegląd okresowy z protokołem, bez zamykania lokalu.',
				),
				galleryItem(
					'galeria-4',
					'Realizacja 4 (placeholder)',
					'Awaria w biurze',
					'Zgłoszenie o 8:00, sprawna instalacja przed południem.',
				),
			],
		},
		{
			_key: key(),
			_type: 'cta',
			background: 'accent',
			heading: 'Masz awarię albo pytanie?',
			lead: 'Zadzwoń — wycenę podajemy od ręki.',
			button: { _key: null, label: 'Zadzwoń teraz', link: external('tel:+48000000000', false) },
		},
	],
};

const about: Page = {
	_id: 'demo-page-about',
	_updatedAt: '2026-09-13T08:00:00Z',
	title: 'O nas',
	slug: 'o-nas',
	seo: {
		metaTitle: 'O nas — Firma Demo',
		metaDescription:
			'Sześcioosobowy zespół serwisowy z Przykładowa. Od 2009 roku naprawiamy, montujemy i serwisujemy dla domu i małych firm.',
		noindex: false,
		ogImage: null,
	},
	sections: [
		{
			_key: key(),
			_type: 'textImage',
			background: 'default',
			heading: 'Pracujemy w Przykładowie od 2009 roku',
			body: [
				paragraph(
					'Zaczynaliśmy w jednym garażu z dwiema osobami. Dziś to sześcioosobowy zespół i dwa auta serwisowe, ale zasada została ta sama: robimy porządnie albo wcale.',
				),
				paragraph(
					'Nie mamy call center ani podwykonawców — do klienta jedzie ta sama osoba, która odbierała telefon.',
				),
				paragraph('Nasze zasady', 'h2'),
				bullet('Cena ustalona przed rozpoczęciem pracy'),
				bullet('Termin, który naprawdę trzymamy'),
				bullet('Po nas nie trzeba sprzątać'),
				paragraphWithLink(
					'Pełną listę usług i ceny znajdziesz w ',
					'cenniku',
					internal('cennik'),
					'.',
				),
			],
			image: image('o-nas', 'Zespół Firmy Demo przed warsztatem (placeholder)', 1000, 750),
			imagePosition: 'right',
		},
		{
			_key: key(),
			_type: 'gallery',
			background: 'alt',
			heading: 'Zespół i warsztat',
			layout: 'carousel',
			items: [
				galleryItem(
					'galeria-1',
					'Z życia firmy 1 (placeholder)',
					'Warsztat',
					'Tu naprawiamy to, czego nie da się zrobić na miejscu.',
				),
				galleryItem('galeria-2', 'Z życia firmy 2 (placeholder)', 'Auta serwisowe'),
				galleryItem(
					'galeria-3',
					'Z życia firmy 3 (placeholder)',
					'Magazyn części',
					'Najczęstsze części wozimy ze sobą — większość napraw kończy się na jednej wizycie.',
				),
				galleryItem('galeria-4', 'Z życia firmy 4 (placeholder)', 'Szkolenie zespołu'),
				galleryItem(
					'hero',
					'Z życia firmy 5 (placeholder)',
					'Pierwszy garaż, 2009',
					'Dwie osoby i jeden samochód. Od tego się zaczęło.',
				),
				// Powtórzenia celowe: 10 kafelków, żeby karuzela realnie przewijała i było
				// widać zachowanie na końcach. Seed wgrywa każdy plik raz (dedup po slocie).
				// Część bez podpisu — pokazuje, że podpis jest opcjonalny.
				galleryItem('o-nas', 'Z życia firmy 6 (placeholder)', 'Zespół w komplecie'),
				galleryItem('galeria-1', 'Z życia firmy 7 (placeholder)'),
				galleryItem('galeria-2', 'Z życia firmy 8 (placeholder)'),
				galleryItem('galeria-3', 'Z życia firmy 9 (placeholder)'),
				galleryItem('galeria-4', 'Z życia firmy 10 (placeholder)'),
			],
		},
		{
			_key: key(),
			_type: 'faq',
			background: 'default',
			heading: 'Pytania o firmę',
			items: [
				{
					_key: key(),
					question: 'Czy działacie poza Przykładowem?',
					answer: [
						paragraph(
							'Tak, obsługujemy cały powiat. Poza promieniem 20 km doliczamy koszt dojazdu.',
						),
					],
				},
				{
					_key: key(),
					question: 'Czy macie ubezpieczenie OC?',
					answer: [
						paragraph(
							'Tak, polisa OC działalności na 500 000 zł. Numer polisy podajemy na życzenie.',
						),
					],
				},
				{
					_key: key(),
					question: 'Kto przyjeżdża na zlecenie?',
					answer: [
						paragraph(
							'Zawsze ktoś z naszego zespołu — nie zlecamy prac podwykonawcom. Imię technika podajemy przy umawianiu wizyty.',
						),
					],
				},
			],
		},
		{
			_key: key(),
			_type: 'cta',
			background: 'accent',
			heading: 'Porozmawiajmy o Twoim zleceniu',
			lead: 'Ceny orientacyjne i formularz wyceny znajdziesz w cenniku.',
			button: { _key: null, label: 'Zobacz cennik', link: internal('cennik') },
		},
	],
};

const pricing: Page = {
	_id: 'demo-page-pricing',
	_updatedAt: '2026-09-13T08:00:00Z',
	title: 'Cennik',
	slug: 'cennik',
	seo: {
		metaTitle: 'Cennik usług — Firma Demo',
		metaDescription:
			'Przejrzyste ceny napraw, montażu i przeglądów. Wycena przed rozpoczęciem pracy, bez ukrytych kosztów.',
		noindex: false,
		ogImage: null,
	},
	sections: [
		{
			_key: key(),
			_type: 'pricing',
			background: 'default',
			heading: 'Cennik',
			lead: 'Ceny orientacyjne. Dokładną wycenę podajemy przed rozpoczęciem pracy.',
			plans: [
				{
					_key: key(),
					name: 'Naprawa',
					price: 'od 150 zł',
					unit: 'za wizytę',
					description: 'Diagnoza i usunięcie usterki w jednym przyjeździe.',
					includes: ['Diagnoza w cenie', 'Dojazd do 20 km gratis', 'Gwarancja 24 miesiące'],
					recommended: false,
					button: { _key: null, label: 'Zadzwoń', link: external('tel:+48000000000', false) },
				},
				{
					_key: key(),
					name: 'Montaż',
					price: 'od 350 zł',
					unit: 'za urządzenie',
					description: 'Montaż, podłączenie i uruchomienie z instruktażem.',
					includes: [
						'Materiały montażowe',
						'Uruchomienie i test',
						'Odbiór starego urządzenia',
						'Gwarancja 24 miesiące',
					],
					recommended: true,
					button: { _key: null, label: 'Zadzwoń', link: external('tel:+48000000000', false) },
				},
				{
					_key: key(),
					name: 'Przegląd',
					price: 'od 200 zł',
					unit: 'rocznie',
					description: 'Przegląd okresowy z protokołem dla firm i wspólnot.',
					includes: ['Protokół w PDF', 'Przypomnienie o kolejnym terminie'],
					recommended: false,
					button: null,
				},
			],
		},
		{
			_key: key(),
			_type: 'faq',
			background: 'alt',
			heading: 'Pytania o ceny i rozliczenia',
			items: [
				{
					_key: key(),
					question: 'Ile kosztuje dojazd?',
					answer: [
						paragraph(
							'W Przykładowie i promieniu 20 km dojazd jest bezpłatny. Dalej liczymy 2 zł za kilometr w jedną stronę — kwotę podajemy przy wycenie.',
						),
					],
				},
				{
					_key: key(),
					question: 'Czy wystawiacie faktury VAT?',
					answer: [
						paragraph('Tak, na każdą usługę. Fakturę wysyłamy mailem w dniu wykonania pracy.'),
					],
				},
				{
					_key: key(),
					question: 'Jak umówić wizytę?',
					answer: [
						paragraphWithLink(
							'Najszybciej telefonicznie — numer jest w nagłówku strony. Możesz też wypełnić formularz poniżej albo napisać na ',
							'kontakt@example.com',
							external('mailto:kontakt@example.com', false),
							', odpowiadamy w dni robocze do 2 godzin.',
						),
					],
				},
			],
		},
		{
			_key: key(),
			_type: 'contact',
			background: 'default',
			heading: 'Zapytaj o wycenę',
			lead: 'Nie ma Twojej usługi na liście? Opisz, co trzeba zrobić — wycenimy indywidualnie w ciągu jednego dnia roboczego.',
			showContactDetails: true,
			showMap: true,
		},
	],
};

/** Przykładowe przekierowania ze starej strony — ćwiczą generowanie _redirects. */
const redirects: Redirect[] = [
	{ from: '/oferta.html', to: '/cennik', permanent: true },
	{ from: '/o-firmie', to: '/o-nas', permanent: true },
	{ from: '/promocja', to: '/', permanent: false },
];

export const demoContent = {
	siteSettings,
	navigation,
	redirects,
	pages: { '/': home, 'o-nas': about, cennik: pricing } as Record<string, Page>,
};
