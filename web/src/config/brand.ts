/**
 * MOTYW I DANE FIRMY — JEDYNY PLIK, KTÓRY EDYTUJESZ PRZY NOWYM KLIENCIE.
 *
 * Zmieniasz wartości w obiekcie `brand` poniżej i podmieniasz logo
 * w `web/public/`. Nic więcej. Kod pod komentarzem „NIE EDYTUJ PONIŻEJ"
 * przelicza to na zmienne CSS i nie wymaga zmian.
 */

export type Shape = 'sharp' | 'soft' | 'round';
export type Spacing = 'compact' | 'normal' | 'airy';

export interface Brand {
	/** Adres produkcyjny — bez ukośnika na końcu. Z niego budujemy canonical, OG i sitemapę. */
	siteUrl: string;
	/** Kod języka do <html lang="…">. */
	lang: string;
	/** Locale do Open Graph (og:locale). */
	locale: string;

	/** Dane firmy.
	 *
	 *  UWAGA: od fazy 2 źródłem prawdy jest `siteSettings` w Sanity — te wartości
	 *  zostają wyłącznie jako zapas, żeby `pnpm --filter web dev` działał, zanim
	 *  projekt Sanity w ogóle powstanie.
	 *
	 *  Wartości domyślne są CELOWO FIKCYJNE i niedziałające: numer to same zera,
	 *  domena to zarezerwowana przez RFC 2606 `example.com`. Chodzi o to, żeby
	 *  niepodmieniony placeholder rzucał się w oczy na stronie, a nie kierował
	 *  ruchu pod cudzy numer albo adres. */
	company: {
		name: string;
		/** Krótki opis — trafia do stopki i jako zapasowy meta description. */
		tagline: string;
		street: string;
		postalCode: string;
		city: string;
		country: string;
		/** Telefon w formie do wyświetlenia, np. „+48 500 600 700". */
		phone: string;
		email: string;
	};

	/** Kolory. Podajesz hex — resztę robi Tailwind. */
	colors: {
		/** Kolor marki: przyciski, linki, akcenty. */
		brand: string;
		/** Ciemniejszy wariant marki — hover i focus. */
		brandDark: string;
		/** Kolor tekstu podstawowego. */
		ink: string;
		/** Kolor tekstu drugorzędnego. */
		muted: string;
		/** Tło strony. */
		surface: string;
		/** Tło sekcji wyróżnionych. */
		surfaceAlt: string;
		/** Kolor linii i obramowań. */
		border: string;
	};

	/** Typografia. Nazwa rodziny musi istnieć w Google Fonts —
	 *  Astro pobiera ją przy buildzie i hostuje lokalnie (zero requestów do Google). */
	font: {
		family: string;
		/** Zakres grubości fontu wariancyjnego, np. „100 900". */
		weights: string;
		/** Stos zapasowy na czas ładowania. */
		fallback: string;
		/** Osobny krój tytułów sekcji (h1 i h2) albo `null` — tytuły krojem treści.
		 *  Jedna grubość = jeden mały plik (latin + latin-ext); ma istnieć w Google Fonts
		 *  dla tej rodziny, inaczej przeglądarka podrobi pogrubienie. */
		heading: {
			family: string;
			/** Np. 600. Instrument Serif ma tylko 400. */
			weight: number;
			/** Rodzina zapasowa na czas ładowania — według charakteru kroju. */
			fallback: 'serif' | 'sans-serif';
		} | null;
	};

	/** Wygląd strony — każda linijka to wybór z kilku gotowych, sprawdzonych opcji.
	 *  Zmieniasz słowo, strona zmienia charakter; wartości CSS są niżej, w tabelach. */
	style: {
		/** Rogi przycisków, kart, zdjęć i pól formularza.
		 *  „sharp" — prawie kanciaste; „soft" — umiarkowanie zaokrąglone;
		 *  „round" — mocno zaokrąglone, przyciski w kształcie pigułki. */
		shape: Shape;
		/** Ile miejsca między sekcjami: „compact" — gęsto; „normal"; „airy" — dużo powietrza. */
		spacing: Spacing;
	};

	/** Maksymalna szerokość treści (dowolna jednostka CSS). */
	contentMax: string;

	/** Animacje (czysty CSS, 0 kB JS): „subtelny" — wejście hero i sekcji, odsłanianie
	 *  zdjęć, cień nagłówka i pasek postępu przy przewijaniu, uniesienie przycisków;
	 *  „brak" — strona bez ruchu. Ustawienie systemowe „ogranicz animacje" i tak wyłącza ruch. */
	motion: 'subtelny' | 'brak';

	/** Przycisk telefonu w przyklejonym nagłówku („Zadzwoń" na telefonie, numer od `lg`).
	 *  Włączaj tam, gdzie telefon jest głównym kanałem: awarie, rezerwacje, taksówka,
	 *  mechanik. Telefon w hero, kontakcie i danych strukturalnych zostaje niezależnie. */
	headerPhone: boolean;
}

export const brand: Brand = {
	// Placeholder na zarezerwowanej domenie z RFC 2606 — podmień przy wdrożeniu.
	siteUrl: 'https://example.com',
	lang: 'pl',
	locale: 'pl_PL',

	company: {
		name: 'Firma Demo (przykład)',
		tagline: 'Krótkie zdanie o tym, czym firma się zajmuje.',
		street: 'ul. Przykładowa 1',
		postalCode: '00-000',
		city: 'Przykładowo',
		country: 'Polska',
		phone: '+48 000 000 000',
		email: 'kontakt@example.com',
	},

	colors: {
		brand: '#1d4ed8',
		brandDark: '#1e3a8a',
		ink: '#111827',
		muted: '#4b5563',
		surface: '#ffffff',
		surfaceAlt: '#f5f6f8',
		border: '#e2e5ea',
	},

	font: {
		family: 'Inter',
		weights: '100 900',
		fallback: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
		heading: null,
	},

	style: {
		shape: 'soft',
		spacing: 'normal',
	},

	contentMax: '72rem',

	motion: 'subtelny',

	headerPhone: false,
};

/* ------------------------------------------------------------------ */
/* NIE EDYTUJ PONIŻEJ — to tylko przeliczenie powyższych wartości.      */
/* ------------------------------------------------------------------ */

/** Pełny adres w jednej linii — do stopki i do JSON-LD. */
export const fullAddress = `${brand.company.street}, ${brand.company.postalCode} ${brand.company.city}`;

/** Telefon w formacie akceptowanym przez `href="tel:"`. */
export const phoneHref = `tel:${brand.company.phone.replace(/[^+\d]/g, '')}`;

/** Zaokrąglenia dla `style.shape`. `soft` = wartości sprzed wprowadzenia stylów. */
const SHAPES: Record<Shape, { sm: string; md: string; lg: string; button: string }> = {
	sharp: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem', button: '0.25rem' },
	soft: { sm: '0.375rem', md: '0.75rem', lg: '1.25rem', button: '0.75rem' },
	round: { sm: '0.5rem', md: '1rem', lg: '2rem', button: '9999px' },
};

/** Pionowy odstęp sekcji dla `style.spacing`: telefon / od `lg`. `normal` = wartości sprzed stylów. */
const SPACINGS: Record<Spacing, { y: string; yLg: string }> = {
	compact: { y: '3rem', yLg: '4.5rem' },
	normal: { y: '4rem', yLg: '6rem' },
	airy: { y: '5rem', yLg: '8rem' },
};

const radius = SHAPES[brand.style.shape];
const spacing = SPACINGS[brand.style.spacing];

/** Zmienne CSS wstrzykiwane do `:root` w `BaseLayout.astro`.
 *  Tailwind czyta je przez `@theme inline` w `src/styles/global.css`. */
export const themeCss: string = [
	':root{',
	`--brand-color-brand:${brand.colors.brand};`,
	`--brand-color-brand-dark:${brand.colors.brandDark};`,
	`--brand-color-ink:${brand.colors.ink};`,
	`--brand-color-muted:${brand.colors.muted};`,
	`--brand-color-surface:${brand.colors.surface};`,
	`--brand-color-surface-alt:${brand.colors.surfaceAlt};`,
	`--brand-color-border:${brand.colors.border};`,
	`--brand-radius-sm:${radius.sm};`,
	`--brand-radius-md:${radius.md};`,
	`--brand-radius-lg:${radius.lg};`,
	`--brand-radius-button:${radius.button};`,
	`--brand-section-y:${spacing.y};`,
	`--brand-section-y-lg:${spacing.yLg};`,
	`--brand-content-max:${brand.contentMax};`,
	`--brand-font-fallback:${brand.font.fallback};`,
	// Bez osobnego kroju tytuły zostają przy grubościach z `Heading.astro` (800 / 700).
	...(brand.font.heading ? [`--brand-heading-weight:${brand.font.heading.weight};`] : []),
	'}',
].join('');
