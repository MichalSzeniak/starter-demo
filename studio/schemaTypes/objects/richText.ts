import { defineArrayMember, defineType } from 'sanity';

/**
 * Tekst formatowany — wyłącznie do treści akapitowych.
 *
 * Zakres jest celowo wąski: brak H1 (jeden H1 na stronę pilnuje szablon),
 * brak obrazów, brak tabel, brak surowego HTML-a. Klient nie może stąd
 * zepsuć layoutu ani hierarchii nagłówków.
 */
export const richText = defineType({
	name: 'richText',
	title: 'Treść',
	type: 'array',
	of: [
		defineArrayMember({
			type: 'block',
			styles: [
				{ title: 'Akapit', value: 'normal' },
				{ title: 'Nagłówek 2', value: 'h2' },
				{ title: 'Nagłówek 3', value: 'h3' },
			],
			lists: [
				{ title: 'Lista punktowana', value: 'bullet' },
				{ title: 'Lista numerowana', value: 'number' },
			],
			marks: {
				decorators: [
					{ title: 'Pogrubienie', value: 'strong' },
					{ title: 'Kursywa', value: 'em' },
				],
				annotations: [defineArrayMember({ type: 'link', name: 'link' })],
			},
		}),
	],
});
