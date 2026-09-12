import type { PAGE_BY_SLUG_QUERY_RESULT } from './types.gen';

/** Jedna sekcja strony — unia dziewięciu typów, rozróżniana po `_type`. */
export type Section = NonNullable<NonNullable<PAGE_BY_SLUG_QUERY_RESULT>['sections']>[number];

/** Zawężenie do konkretnego typu sekcji, np. `SectionOf<'hero'>`. */
export type SectionOf<T extends Section['_type']> = Extract<Section, { _type: T }>;

/** Poziom nagłówka sekcji: 1 tylko dla pierwszej sekcji na stronie. */
export type HeadingLevel = 1 | 2;

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
