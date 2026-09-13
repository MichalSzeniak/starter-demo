import type { PAGE_BY_SLUG_QUERY_RESULT } from './types.gen';

/** Jedna sekcja strony — unia dziewięciu typów, rozróżniana po `_type`. */
export type Section = NonNullable<NonNullable<PAGE_BY_SLUG_QUERY_RESULT>['sections']>[number];

/** Zawężenie do konkretnego typu sekcji, np. `SectionOf<'hero'>`. */
export type SectionOf<T extends Section['_type']> = Extract<Section, { _type: T }>;

/** Poziom nagłówka sekcji: 1 tylko dla pierwszej sekcji na stronie. */
export type HeadingLevel = 1 | 2;

/**
 * Tło sekcji. NIE jest wyborem klienta ani cechą typu sekcji — liczy je
 * SectionRenderer z pozycji, żeby sąsiednie sekcje zawsze się różniły,
 * niezależnie od tego, jak klient je ułoży.
 */
export type SectionTone = 'default' | 'alt' | 'brand';

/** To, co SectionRenderer dokłada do każdej sekcji poza jej danymi. */
export interface SectionContext {
	/** Pozycja sekcji na stronie, od 0. */
	index: number;
	/** Pierwsza sekcja dostaje h1, każda kolejna h2. Jeden h1 na stronę. */
	headingLevel: HeadingLevel;
	/**
	 * true dla sekcji, w której jest pierwszy obraz na stronie — ten obraz
	 * ładuje się z `loading="eager"` i `fetchpriority="high"` (LCP).
	 */
	priorityImage: boolean;
	/** Tło sekcji — patrz `sectionTones`. */
	tone: SectionTone;
}

function hasImage(section: Section): boolean {
	switch (section._type) {
		case 'hero':
		case 'textImage':
			return Boolean(section.image?.asset?.url);
		case 'gallery':
			return Boolean(section.images?.[0]?.asset?.url);
		default:
			return false;
	}
}

/** Indeks sekcji z pierwszym obrazem na stronie albo -1. */
export function firstImageSectionIndex(sections: readonly Section[]): number {
	return sections.findIndex(hasImage);
}

/**
 * Naprzemienne tła, liczone OD DOŁU strony.
 *
 * Stopka jest szara i oddziela ją od treści biały odstęp. Gdyby ostatnia sekcja
 * była szara, przy stopce powstałby pas szary–biały–szary, wyglądający na błąd.
 * Dlatego ostatnia sekcja jest zawsze biała, a kolejne w górę na zmianę.
 * CTA ma zawsze kolor marki i przerywa naprzemienność (sekcja nad nim jest szara).
 */
export function sectionTones(sections: readonly Pick<Section, '_type'>[]): SectionTone[] {
	const tones: SectionTone[] = [];
	// Pod ostatnią sekcją jest stopka w kolorze „alt".
	let below: SectionTone = 'alt';
	for (let index = sections.length - 1; index >= 0; index--) {
		const tone: SectionTone =
			sections[index]!._type === 'cta' ? 'brand' : below === 'alt' ? 'default' : 'alt';
		tones[index] = tone;
		below = tone;
	}
	return tones;
}

/**
 * Klasy tła sekcji. `--tone-raised` to kolor kontrastujący z tłem — dla kart
 * i pól wewnątrz sekcji (np. karta dojazdu), żeby nie znikały na tle tego samego
 * koloru. Zmienne `--brand-color-*` pochodzą z brand.ts.
 */
export function toneClass(tone: SectionTone): string {
	switch (tone) {
		case 'alt':
			return 'bg-surface-alt [--tone-raised:var(--brand-color-surface)]';
		case 'brand':
			return 'bg-brand text-white';
		default:
			return 'bg-surface [--tone-raised:var(--brand-color-surface-alt)]';
	}
}
