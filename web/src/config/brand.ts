/**
 * MOTYW I DANE FIRMY — JEDYNY PLIK, KTÓRY EDYTUJESZ PRZY NOWYM KLIENCIE.
 *
 * Zmieniasz wartości w obiekcie `brand` poniżej i podmieniasz logo
 * w `web/public/`. Nic więcej. Kod pod komentarzem „NIE EDYTUJ PONIŻEJ"
 * przelicza to na zmienne CSS i nie wymaga zmian.
 */

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
	};

	/** Zaokrąglenia rogów (dowolna jednostka CSS). */
	radius: {
		sm: string;
		md: string;
		lg: string;
	};

	/** Pionowe odstępy między sekcjami strony. */
	spacing: {
		sectionY: string;
		sectionYLg: string;
		contentMax: string;
	};
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
	},

	radius: {
		sm: '0.375rem',
		md: '0.75rem',
		lg: '1.25rem',
	},

	spacing: {
		sectionY: '4rem',
		sectionYLg: '6rem',
		contentMax: '72rem',
	},
};

/* ------------------------------------------------------------------ */
/* NIE EDYTUJ PONIŻEJ — to tylko przeliczenie powyższych wartości.      */
/* ------------------------------------------------------------------ */

/** Pełny adres w jednej linii — do stopki i do JSON-LD. */
export const fullAddress = `${brand.company.street}, ${brand.company.postalCode} ${brand.company.city}`;

/** Telefon w formacie akceptowanym przez `href="tel:"`. */
export const phoneHref = `tel:${brand.company.phone.replace(/[^+\d]/g, '')}`;

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
	`--brand-radius-sm:${brand.radius.sm};`,
	`--brand-radius-md:${brand.radius.md};`,
	`--brand-radius-lg:${brand.radius.lg};`,
	`--brand-section-y:${brand.spacing.sectionY};`,
	`--brand-section-y-lg:${brand.spacing.sectionYLg};`,
	`--brand-content-max:${brand.spacing.contentMax};`,
	`--brand-font-fallback:${brand.font.fallback};`,
	'}',
].join('');
