import type { PAGE_BY_SLUG_QUERY_RESULT } from './types.gen';

/** Jedna sekcja strony — unia dziewięciu typów, rozróżniana po `_type`. */
export type Section = NonNullable<NonNullable<PAGE_BY_SLUG_QUERY_RESULT>['sections']>[number];

/** Zawężenie do konkretnego typu sekcji, np. `SectionOf<'hero'>`. */
export type SectionOf<T extends Section['_type']> = Extract<Section, { _type: T }>;

/** Poziom nagłówka sekcji: 1 tylko dla pierwszej sekcji na stronie. */
export type HeadingLevel = 1 | 2;

/** Tło sekcji wybrane w Studio. „auto" = dobiera SectionRenderer (`sectionBackgrounds`). */
export type BackgroundChoice = Section['background'];

/** Tło faktycznie nałożone na sekcję — po rozstrzygnięciu „auto". */
export type SectionBackground = Exclude<BackgroundChoice, 'auto'>;

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
	/** Tło sekcji po rozstrzygnięciu „auto" — patrz `sectionBackgrounds`. */
	background: SectionBackground;
	/**
	 * Klasy tła nakładane na <section>. Liczy je SectionRenderer; komponent
	 * sekcji tylko je przekazuje i nie wybiera tła sam.
	 */
	backgroundClass: string;
}

function hasImage(section: Section): boolean {
	switch (section._type) {
		case 'hero':
		case 'textImage':
			return Boolean(section.image?.asset?.url);
		case 'gallery':
			return Boolean(section.items?.[0]?.image?.asset?.url);
		default:
			return false;
	}
}

/** Indeks sekcji z pierwszym obrazem na stronie albo -1. */
export function firstImageSectionIndex(sections: readonly Section[]): number {
	return sections.findIndex(hasImage);
}

/**
 * Tła sekcji: wybór z Studio, a dla „auto" — naprzemienne, liczone OD DOŁU strony.
 *
 * Stopka jest w kolorze „alt" i oddziela ją od treści odstęp w kolorze strony.
 * Gdyby ostatnia sekcja była „alt", przy stopce powstałby pas alt–podstawowe–alt,
 * wyglądający na błąd. Dlatego automat zaczyna od dołu: ostatnia sekcja
 * „default", kolejne w górę na zmianę. CTA w trybie „auto" dostaje kolor marki
 * (sekcja nad nim — „alt").
 *
 * Ręczny wybór jest nietykalny. Sekcje „auto" (poza CTA) między dwoma sekcjami
 * o ustalonym tle tworzą ciąg, który zawsze idzie naprzemiennie. Jego dół różni
 * się od sekcji pod nim; gdy góra ciągu powtarzałaby ręczne tło sekcji nad nim,
 * a dół ma swobodę (pod spodem kolor marki albo tylko stopka), cały ciąg się
 * odwraca. Priorytety, gdy nie da się spełnić wszystkiego:
 * 1. sekcja poniżej i powyżej — sąsiednie sekcje stykają się bezpośrednio,
 *    dolna wygrywa, gdy ręczne tła z obu stron wykluczają każdy układ;
 * 2. stopka — oddziela ją odstęp, więc „alt" nad nią to tylko drobny zgrzyt.
 */
export function sectionBackgrounds(
	sections: readonly Pick<Section, '_type' | 'background'>[],
): SectionBackground[] {
	const result: SectionBackground[] = [];
	const flip = (background: SectionBackground): SectionBackground =>
		background === 'alt' ? 'default' : 'alt';
	const isRun = (section: Pick<Section, '_type' | 'background'>): boolean =>
		section.background === 'auto' && section._type !== 'cta';
	/** Tło sekcji, której nie obejmuje ciąg: ręczne albo CTA „auto". */
	const fixed = (section: Pick<Section, '_type' | 'background'>): SectionBackground =>
		section.background === 'auto' ? 'accent' : section.background;

	// Pod ostatnią sekcją jest stopka w kolorze „alt".
	let below: SectionBackground = 'alt';
	let end = sections.length - 1;
	while (end >= 0) {
		if (!isRun(sections[end]!)) {
			below = result[end] = fixed(sections[end]!);
			end--;
			continue;
		}
		let start = end;
		while (start > 0 && isRun(sections[start - 1]!)) start--;

		const flexible: boolean = below === 'accent' || end === sections.length - 1;
		let bottom: SectionBackground = flip(below);
		const top = (end - start) % 2 === 0 ? bottom : flip(bottom);
		const above = start > 0 ? fixed(sections[start - 1]!) : undefined;
		if (above === top && flexible) bottom = flip(bottom);

		for (let index = end; index >= start; index--) {
			result[index] = (end - index) % 2 === 0 ? bottom : flip(bottom);
		}
		below = result[start]!;
		end = start - 1;
	}
	return result;
}

/**
 * Klasy tła sekcji. `--tone-raised` to kolor kontrastujący z tłem — dla kart
 * i pól wewnątrz sekcji (np. karta dojazdu), żeby nie znikały na tle tego samego
 * koloru. Zmienne `--brand-color-*` pochodzą z brand.ts.
 */
export function backgroundClass(background: SectionBackground): string {
	switch (background) {
		case 'alt':
			return 'bg-surface-alt [--tone-raised:var(--brand-color-surface)]';
		case 'accent':
			return 'bg-brand text-white';
		default:
			return 'bg-surface [--tone-raised:var(--brand-color-surface-alt)]';
	}
}
