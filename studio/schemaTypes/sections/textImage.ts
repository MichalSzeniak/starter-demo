import { BlockContentIcon } from '@sanity/icons/BlockContent';
import { defineField, defineType } from 'sanity';

export const textImage = defineType({
	name: 'textImage',
	title: 'Tekst z obrazem',
	type: 'object',
	icon: BlockContentIcon,
	description: 'Blok treści obok zdjęcia.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			validation: (rule) => rule.required().max(90),
		}),
		defineField({ name: 'body', title: 'Treść', type: 'richText' }),
		defineField({
			name: 'image',
			title: 'Obraz',
			type: 'imageWithAlt',
			validation: (rule) => rule.required().error('Ta sekcja wymaga obrazu.'),
		}),
		defineField({
			name: 'imagePosition',
			title: 'Obraz po stronie',
			type: 'string',
			options: {
				list: [
					{ title: 'Po prawej', value: 'right' },
					{ title: 'Po lewej', value: 'left' },
				],
				layout: 'radio',
			},
			initialValue: 'right',
		}),
	],
	preview: {
		select: { title: 'heading', media: 'image' },
		prepare({ title, media }) {
			return {
				title: title || 'Bez tytułu',
				subtitle: 'Tekst z obrazem',
				media: media ?? BlockContentIcon,
			};
		},
	},
});
