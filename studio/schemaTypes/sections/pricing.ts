import { CreditCardIcon } from '@sanity/icons/CreditCard';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundField } from '../fields/background';

export const pricing = defineType({
	name: 'pricing',
	title: 'Cennik',
	type: 'object',
	icon: CreditCardIcon,
	description: 'Pakiety lub usługi z cenami.',
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
			name: 'plans',
			title: 'Pozycje cennika',
			type: 'array',
			validation: (rule) =>
				rule.required().min(1).max(4).error('Od 1 do 4 pozycji — więcej przestaje być czytelne.'),
			of: [
				defineArrayMember({
					type: 'object',
					name: 'plan',
					title: 'Pozycja',
					icon: CreditCardIcon,
					fields: [
						defineField({
							name: 'name',
							title: 'Nazwa',
							type: 'string',
							validation: (rule) => rule.required().max(50),
						}),
						defineField({
							name: 'price',
							title: 'Cena',
							type: 'string',
							description:
								'Wpisz tak, jak ma się wyświetlić, np. „od 199 zł” albo „Wycena indywidualna”.',
							validation: (rule) => rule.required().max(40),
						}),
						defineField({
							name: 'unit',
							title: 'Za co',
							type: 'string',
							description: 'Np. „miesięcznie”, „za wizytę”. Zostaw puste, jeśli niepotrzebne.',
							validation: (rule) => rule.max(30),
						}),
						defineField({
							name: 'description',
							title: 'Opis',
							type: 'text',
							rows: 2,
							validation: (rule) => rule.max(200),
						}),
						defineField({
							name: 'includes',
							title: 'Co obejmuje',
							type: 'array',
							of: [defineArrayMember({ type: 'string' })],
							validation: (rule) => rule.max(10),
						}),
						defineField({ name: 'button', title: 'Przycisk', type: 'labeledLink' }),
						defineField({
							name: 'recommended',
							title: 'Oznacz jako polecaną',
							type: 'boolean',
							description: 'Tylko jedna pozycja powinna być polecana.',
							initialValue: false,
						}),
					],
					preview: {
						select: { title: 'name', price: 'price', unit: 'unit' },
						prepare({ title, price, unit }) {
							return {
								title: title || 'Bez nazwy',
								subtitle: [price, unit].filter(Boolean).join(' '),
							};
						},
					},
				}),
			],
		}),
		backgroundField(),
	],
	preview: {
		select: { title: 'heading', plans: 'plans' },
		prepare({ title, plans }) {
			const count = Array.isArray(plans) ? plans.length : 0;
			return {
				title: title || 'Cennik',
				subtitle: `Cennik — ${count} poz.`,
				media: CreditCardIcon,
			};
		},
	},
});
