import { defineField } from 'sanity';

/**
 * Pole „Układ" dla sekcji z listą elementów: siatka albo karuzela.
 *
 * Fabryka pola, nie osobny typ schemy — wartość to zwykły string, więc lista
 * ośmiu typów sekcji się nie zmienia, a TypeGen daje `'grid' | 'carousel'`.
 *
 * Używa: galeria. Przygotowane dla opinii klientów — włączenie to dopisanie
 * `layoutField()` do `fields` w testimonials.ts, pola `layout` w zapytaniu
 * i gałęzi z <Carousel> w Testimonials.astro. Na razie świadomie wyłączone.
 *
 * Pole NIE jest wymagane: sekcje zapisane przed jego dodaniem nie mają wartości
 * i wymóg zablokowałby publikację całej strony. Brak wartości = siatka
 * (`coalesce` w zapytaniu), a `initialValue` ustawia siatkę w nowych sekcjach.
 */
export const SECTION_LAYOUTS = [
	{ title: 'Siatka', value: 'grid' },
	{ title: 'Karuzela', value: 'carousel' },
] as const;

export type SectionLayout = (typeof SECTION_LAYOUTS)[number]['value'];

export function layoutField(description: string) {
	return defineField({
		name: 'layout',
		title: 'Układ',
		type: 'string',
		description,
		options: {
			list: [...SECTION_LAYOUTS],
			layout: 'radio',
			direction: 'horizontal',
		},
		initialValue: 'grid' satisfies SectionLayout,
	});
}
