import { BoltIcon } from '@sanity/icons/Bolt';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundField } from '../fields/background';

export const features = defineType({
	name: 'features',
	title: 'Atuty',
	type: 'object',
	icon: BoltIcon,
	description: 'Lista krótkich punktów: co wyróżnia firmę, co obejmuje usługa.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			validation: (rule) => rule.max(90),
		}),
		defineField({
			name: 'lead',
			title: 'Zdanie wprowadzające',
			type: 'text',
			rows: 2,
			validation: (rule) => rule.max(260),
		}),
		defineField({
			name: 'items',
			title: 'Punkty',
			type: 'array',
			validation: (rule) => rule.required().min(2).max(12).error('Od 2 do 12 punktów.'),
			of: [
				defineArrayMember({
					type: 'object',
					name: 'feature',
					title: 'Punkt',
					icon: BoltIcon,
					fields: [
						defineField({
							name: 'title',
							title: 'Nazwa',
							type: 'string',
							validation: (rule) => rule.required().max(60),
						}),
						defineField({
							name: 'description',
							title: 'Opis',
							type: 'text',
							rows: 3,
							validation: (rule) => rule.max(300),
						}),
					],
					preview: {
						select: { title: 'title', subtitle: 'description' },
					},
				}),
			],
		}),
		backgroundField(),
	],
	preview: {
		select: { title: 'heading', items: 'items' },
		prepare({ title, items }) {
			const count = Array.isArray(items) ? items.length : 0;
			return { title: title || 'Atuty', subtitle: `Atuty — ${count} pkt`, media: BoltIcon };
		},
	},
});
