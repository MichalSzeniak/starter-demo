import { RocketIcon } from '@sanity/icons/Rocket';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundField } from '../fields/background';

export const hero = defineType({
	name: 'hero',
	title: 'Nagłówek powitalny',
	type: 'object',
	icon: RocketIcon,
	description: 'Pierwsza sekcja strony: duży tytuł, zdanie wprowadzające i przyciski.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł',
			type: 'string',
			description: 'Najważniejsze zdanie na stronie. Powiedz, co robicie i dla kogo.',
			validation: (rule) => rule.required().max(90),
		}),
		defineField({
			name: 'lead',
			title: 'Zdanie wprowadzające',
			type: 'text',
			rows: 3,
			validation: (rule) => rule.max(260),
		}),
		defineField({ name: 'image', title: 'Obraz', type: 'imageWithAlt' }),
		defineField({
			name: 'buttons',
			title: 'Przyciski',
			type: 'array',
			of: [defineArrayMember({ type: 'labeledLink' })],
			description: 'Maksymalnie dwa. Pierwszy jest wyróżniony.',
			validation: (rule) => rule.max(2),
		}),
		backgroundField(),
	],
	preview: {
		select: { title: 'heading', media: 'image' },
		prepare({ title, media }) {
			return {
				title: title || 'Bez tytułu',
				subtitle: 'Nagłówek powitalny',
				media: media ?? RocketIcon,
			};
		},
	},
});
