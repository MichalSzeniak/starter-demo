import { StarIcon } from '@sanity/icons/Star';
import { defineField, defineType } from 'sanity';

export const cta = defineType({
	name: 'cta',
	title: 'Wezwanie do działania',
	type: 'object',
	icon: StarIcon,
	description: 'Wyróżniony pasek z jednym zdaniem i przyciskiem. Zwykle na końcu strony.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł',
			type: 'string',
			validation: (rule) => rule.required().max(90),
		}),
		defineField({
			name: 'lead',
			title: 'Zdanie wprowadzające',
			type: 'text',
			rows: 2,
			validation: (rule) => rule.max(200),
		}),
		defineField({
			name: 'button',
			title: 'Przycisk',
			type: 'labeledLink',
			validation: (rule) => rule.required().error('Ta sekcja bez przycisku nie ma sensu.'),
		}),
	],
	preview: {
		select: { title: 'heading', subtitle: 'button.label' },
		prepare({ title, subtitle }) {
			return {
				title: title || 'Wezwanie do działania',
				subtitle: subtitle ? `Przycisk: ${subtitle}` : 'Wezwanie do działania',
				media: StarIcon,
			};
		},
	},
});
