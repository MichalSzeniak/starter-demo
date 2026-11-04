import { defineField } from 'sanity';

/**
 * Pole „Kształt zdjęcia" dla sekcji, w których zdjęcie jest elementem kompozycji:
 * hero i tekst z obrazem. Ustawiane per sekcja, nie globalnie — portret w kole
 * w „O mnie" nie wymusza kół na reszcie strony.
 *
 * Fabryka pola, nie osobny typ schemy (jak `layoutField`) — lista typów sekcji
 * się nie zmienia, a TypeGen daje `'rect' | 'arch' | 'circle'`.
 *
 * Galeria, karuzela i awatary opinii celowo bez tego pola: w siatce łuki i koła
 * wyglądają chaotycznie i ucinają kadry.
 *
 * Pole NIE jest wymagane: sekcje zapisane przed jego dodaniem nie mają wartości.
 * Brak wartości = prostokąt (`coalesce` w zapytaniu).
 */
export const IMAGE_SHAPES = [
	{ title: 'Prostokąt', value: 'rect' },
	{ title: 'Łuk u góry', value: 'arch' },
	{ title: 'Koło', value: 'circle' },
] as const;

export type ImageShape = (typeof IMAGE_SHAPES)[number]['value'];

export function imageShapeField() {
	return defineField({
		name: 'imageShape',
		title: 'Kształt zdjęcia',
		type: 'string',
		description:
			'Łuk i koło przycinają zdjęcie — ważne elementy kadru trzymaj na środku. ' +
			'Koło najlepiej pasuje do portretu.',
		options: {
			list: [...IMAGE_SHAPES],
			layout: 'radio',
			direction: 'horizontal',
		},
		initialValue: 'rect' satisfies ImageShape,
	});
}
