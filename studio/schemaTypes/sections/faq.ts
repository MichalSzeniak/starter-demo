import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundField } from '../fields/background';

export const faq = defineType({
	name: 'faq',
	title: 'Najczęstsze pytania',
	type: 'object',
	icon: HelpCircleIcon,
	description:
		'Pytania i odpowiedzi. Ta sekcja trafia też do danych strukturalnych Google (FAQPage), więc pisz pytania tak, jak zadaje je klient.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			validation: (rule) => rule.max(90),
		}),
		defineField({
			name: 'items',
			title: 'Pytania',
			type: 'array',
			validation: (rule) => rule.required().min(2).max(20),
			of: [
				defineArrayMember({
					type: 'object',
					name: 'faqItem',
					title: 'Pytanie',
					icon: HelpCircleIcon,
					fields: [
						defineField({
							name: 'question',
							title: 'Pytanie',
							type: 'string',
							validation: (rule) => rule.required().max(160),
						}),
						defineField({
							name: 'answer',
							title: 'Odpowiedź',
							type: 'richText',
							validation: (rule) => rule.required().error('Odpowiedź jest wymagana.'),
						}),
					],
					preview: { select: { title: 'question' } },
				}),
			],
		}),
		backgroundField(),
	],
	preview: {
		select: { title: 'heading', items: 'items' },
		prepare({ title, items }) {
			const count = Array.isArray(items) ? items.length : 0;
			return {
				title: title || 'Najczęstsze pytania',
				subtitle: `FAQ — ${count} pyt.`,
				media: HelpCircleIcon,
			};
		},
	},
});
