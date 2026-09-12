import { MenuIcon } from '@sanity/icons/Menu';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const navigation = defineType({
	name: 'navigation',
	title: 'Nawigacja',
	type: 'document',
	icon: MenuIcon,
	fields: [
		defineField({
			name: 'mainMenu',
			title: 'Menu główne',
			type: 'array',
			description: 'Pozycje w nagłówku strony. Więcej niż 6 przestaje mieścić się na telefonie.',
			of: [defineArrayMember({ type: 'labeledLink' })],
			validation: (rule) =>
				rule.max(6).warning('Powyżej 6 pozycji menu robi się ciasno na telefonie.'),
		}),
		defineField({
			name: 'footerMenu',
			title: 'Menu w stopce',
			type: 'array',
			description: 'Zwykle polityka prywatności, regulamin, kontakt.',
			of: [defineArrayMember({ type: 'labeledLink' })],
			validation: (rule) => rule.max(10),
		}),
	],
	preview: {
		prepare() {
			return { title: 'Nawigacja', subtitle: 'Menu główne i stopka', media: MenuIcon };
		},
	},
});
