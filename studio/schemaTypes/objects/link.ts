import { LinkIcon } from '@sanity/icons/Link';
import { defineField, defineType } from 'sanity';

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
