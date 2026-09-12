import { CommentIcon } from '@sanity/icons/Comment';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const testimonials = defineType({
	name: 'testimonials',
	title: 'Opinie klientów',
	type: 'object',
	icon: CommentIcon,
	description: 'Cytaty od klientów wraz z podpisem.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			validation: (rule) => rule.max(90),
		}),
		defineField({
			name: 'items',
			title: 'Opinie',
			type: 'array',
			validation: (rule) => rule.required().min(1).max(9),
			of: [
				defineArrayMember({
					type: 'object',
					name: 'testimonial',
					title: 'Opinia',
					icon: CommentIcon,
					fields: [
						defineField({
							name: 'quote',
							title: 'Treść opinii',
							type: 'text',
							rows: 4,
							validation: (rule) => rule.required().max(400),
						}),
						defineField({
							name: 'author',
							title: 'Kto to powiedział',
							type: 'string',
							description:
								'Imię i nazwisko albo nazwa firmy. Opinia bez podpisu nie buduje zaufania.',
							validation: (rule) => rule.required().max(60),
						}),
						defineField({
							name: 'role',
							title: 'Stanowisko lub firma',
							type: 'string',
							validation: (rule) => rule.max(80),
						}),
						defineField({ name: 'avatar', title: 'Zdjęcie', type: 'imageWithAlt' }),
					],
					preview: {
						select: { title: 'author', subtitle: 'quote', media: 'avatar' },
					},
				}),
			],
		}),
	],
	preview: {
		select: { title: 'heading', items: 'items' },
		prepare({ title, items }) {
			const count = Array.isArray(items) ? items.length : 0;
			return {
				title: title || 'Opinie klientów',
				subtitle: `Opinie — ${count}`,
				media: CommentIcon,
			};
		},
	},
});
