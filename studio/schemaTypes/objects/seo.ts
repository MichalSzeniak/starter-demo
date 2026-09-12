import { SearchIcon } from '@sanity/icons/Search';
import { defineField, defineType } from 'sanity';

/**
 * Metadane wyszukiwarek. Limity znaków są błędami, nie ostrzeżeniami —
 * dłuższy tytuł i tak zostanie ucięty w wynikach Google.
 */
export const seo = defineType({
	name: 'seo',
	title: 'SEO',
	type: 'object',
	icon: SearchIcon,
	options: { collapsible: true, collapsed: false },
	fields: [
		defineField({
			name: 'metaTitle',
			title: 'Tytuł w Google',
			type: 'string',
			description:
				'Nagłówek, który zobaczy ktoś szukający w Google. Maks. 60 znaków — dłuższy zostanie ucięty. Musi być inny na każdej podstronie.',
			validation: (rule) =>
				rule
					.required()
					.error('Tytuł w Google jest wymagany.')
					.max(60)
					.error('Maksymalnie 60 znaków — dłuższy tytuł Google i tak utnie.'),
		}),
		defineField({
			name: 'metaDescription',
			title: 'Opis w Google',
			type: 'text',
			rows: 3,
			description:
				'Dwa–trzy zdania pod tytułem w wynikach wyszukiwania. Maks. 155 znaków. To reklama tej podstrony, nie streszczenie.',
			validation: (rule) =>
				rule
					.required()
					.error('Opis w Google jest wymagany.')
					.max(155)
					.error('Maksymalnie 155 znaków — dłuższy opis Google utnie.'),
		}),
		defineField({
			name: 'ogImage',
			title: 'Obraz przy udostępnianiu',
			type: 'imageWithAlt',
			description:
				'Miniatura pokazywana, gdy ktoś wklei link do tej strony na Facebooku czy LinkedIn. Zalecane 1200×630 px. Jeśli puste, użyjemy domyślnego obrazu z ustawień strony.',
		}),
		defineField({
			name: 'noindex',
			title: 'Ukryj tę stronę przed Google',
			type: 'boolean',
			description:
				'Włącz tylko dla stron, które mają nie pojawiać się w wyszukiwarce (np. podziękowanie po wysłaniu formularza). Strona nadal będzie dostępna pod swoim adresem.',
			initialValue: false,
		}),
	],
});
