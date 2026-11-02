import { LinkIcon } from '@sanity/icons/Link';
import { defineField, defineType } from 'sanity';
import { ANCHOR_FORMAT_ERROR, ANCHOR_PATTERN } from '../fields/anchor';

/**
 * Odnośnik: albo do podstrony tego serwisu, albo pod adres zewnętrzny.
 * Celowo nie ma tu pola na dowolny HTML — klient nie może wkleić skryptu.
 */
export const link = defineType({
	name: 'link',
	title: 'Odnośnik',
	type: 'object',
	icon: LinkIcon,
	fields: [
		defineField({
			name: 'kind',
			title: 'Dokąd prowadzi',
			type: 'string',
			description: 'Wybierz, czy odnośnik kieruje na tę stronę, czy poza nią.',
			options: {
				list: [
					{ title: 'Podstrona tego serwisu', value: 'internal' },
					{ title: 'Adres zewnętrzny', value: 'external' },
				],
				layout: 'radio',
			},
			initialValue: 'internal',
			validation: (rule) => rule.required().error('Wybierz rodzaj odnośnika.'),
		}),
		defineField({
			name: 'page',
			title: 'Podstrona',
			type: 'reference',
			to: [{ type: 'page' }],
			description: 'Adres zbuduje się sam z adresu URL wybranej podstrony.',
			hidden: ({ parent }) => parent?.kind !== 'internal',
			validation: (rule) =>
				rule.custom((value, context) => {
					const parent = context.parent as { kind?: string } | undefined;
					if (parent?.kind === 'internal' && !value) return 'Wskaż podstronę.';
					return true;
				}),
		}),
		defineField({
			name: 'anchor',
			title: 'Sekcja na stronie (opcjonalnie)',
			type: 'string',
			description:
				'Kotwica sekcji z wybranej podstrony, np. „o-mnie" — strona przewinie się prosto do niej. Puste = początek strony.',
			hidden: ({ parent }) => parent?.kind !== 'internal',
			validation: (rule) =>
				rule.custom((value) => (!value || ANCHOR_PATTERN.test(value) ? true : ANCHOR_FORMAT_ERROR)),
		}),
		defineField({
			name: 'href',
			title: 'Adres URL',
			type: 'url',
			description: 'Pełny adres, np. https://example.com. Działa też mailto: i tel:.',
			hidden: ({ parent }) => parent?.kind !== 'external',
			validation: (rule) =>
				rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }).custom((value, context) => {
					const parent = context.parent as { kind?: string } | undefined;
					if (parent?.kind === 'external' && !value) return 'Podaj adres URL.';
					return true;
				}),
		}),
		defineField({
			name: 'newTab',
			title: 'Otwórz w nowej karcie',
			type: 'boolean',
			initialValue: false,
			hidden: ({ parent }) => parent?.kind !== 'external',
		}),
	],
});
