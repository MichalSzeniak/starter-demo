import { defineField } from 'sanity';

/**
 * Pole „Tło" — w każdym typie sekcji.
 *
 * Fabryka pola, nie osobny typ schemy (jak `layoutField`). Domyślnie
 * „Automatyczne": SectionRenderer dobiera tło tak, żeby sąsiednie sekcje się
 * różniły, więc przy wdrożeniu nie trzeba niczego ustawiać, a zmiana kolejności
 * sekcji nie psuje rytmu. Ręczna wartość nadpisuje automat tylko w tej sekcji;
 * sekcje „Automatyczne" dookoła biorą ją pod uwagę.
 *
 * „Kolor marki" jest dostępny wyłącznie w CTA (`accent: true`). Pozostałe sekcje
 * mają ciemny tekst, przyciski i akcenty w kolorze marki — na tle marki straciłyby
 * kontrast, a ten zależy od palety klienta, więc nie da się go zagwarantować.
 *
 * Pole NIE jest wymagane: sekcje zapisane wcześniej nie mają wartości.
 * Brak wartości = „auto" (`coalesce` w zapytaniu).
 */
const BASE = [
	{ title: 'Automatyczne', value: 'auto' },
	{ title: 'Podstawowe', value: 'default' },
	{ title: 'Alternatywne', value: 'alt' },
] as const;

const ACCENT = { title: 'Kolor marki', value: 'accent' } as const;

export function backgroundField({ accent = false }: { accent?: boolean } = {}) {
	return defineField({
		name: 'background',
		title: 'Tło',
		type: 'string',
		description:
			'Zostaw „Automatyczne" — tło dobierze się tak, żeby sąsiednie sekcje się od siebie odróżniały. Zmieniaj tylko, gdy świadomie chcesz inne.',
		options: {
			list: accent ? [...BASE, ACCENT] : [...BASE],
			layout: 'radio',
			direction: 'horizontal',
		},
		initialValue: 'auto',
	});
}
