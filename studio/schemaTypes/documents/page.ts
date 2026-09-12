import { DocumentIcon } from '@sanity/icons/Document';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { sectionTypeNames } from '../sections';

export const page = defineType({
	name: 'page',
	title: 'Podstrona',
	type: 'document',
	icon: DocumentIcon,
	groups: [
		{ name: 'content', title: 'Treść', default: true },
		{ name: 'seo', title: 'SEO' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Nazwa robocza',
			type: 'string',
			group: 'content',
			description:
				'Do czego ta strona służy — widoczne tylko tutaj, w panelu. Tytuł dla Google ustawiasz w zakładce SEO.',
			validation: (rule) => rule.required().error('Nazwa robocza jest wymagana.'),
		}),
		defineField({
			name: 'slug',
			title: 'Adres strony',
			type: 'slug',
			group: 'content',
			description:
				'Końcówka adresu, np. „o-nas” da adres /o-nas. Dla strony głównej wpisz pojedynczy ukośnik: /',
			options: {
				source: 'title',
				maxLength: 96,
				slugify: (input) =>
					input
						.toLowerCase()
						.replace(/ą/g, 'a')
						.replace(/ć/g, 'c')
						.replace(/ę/g, 'e')
						.replace(/ł/g, 'l')
						.replace(/ń/g, 'n')
						.replace(/ó/g, 'o')
						.replace(/ś/g, 's')
						.replace(/[żź]/g, 'z')
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/^-+|-+$/g, '')
						.slice(0, 96),
			},
			validation: (rule) =>
				rule.required().custom((slug) => {
					const value = slug?.current;
					if (!value) return 'Adres strony jest wymagany.';
					if (value === '/') return true;
					if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
						return 'Dozwolone są tylko małe litery bez polskich znaków, cyfry i myślniki — albo samo / dla strony głównej.';
					}
					return true;
				}),
		}),
		defineField({
			name: 'sections',
			title: 'Sekcje strony',
			type: 'array',
			group: 'content',
			description: 'Ułóż stronę z gotowych klocków. Kolejność zmieniasz przeciąganiem.',
			of: sectionTypeNames.map((name) => defineArrayMember({ type: name })),
			validation: (rule) =>
				rule.required().min(1).error('Strona musi mieć co najmniej jedną sekcję.'),
		}),
		defineField({
			name: 'seo',
			title: 'SEO',
			type: 'seo',
			group: 'seo',
			validation: (rule) => rule.required(),
		}),
	],
	preview: {
		select: { title: 'title', slug: 'slug.current', noindex: 'seo.noindex' },
		prepare({ title, slug, noindex }) {
			const path = slug === '/' ? '/ (strona główna)' : slug ? `/${slug}` : 'brak adresu';
			return {
				title: title || 'Bez nazwy',
				subtitle: noindex ? `${path} — ukryta przed Google` : path,
				media: DocumentIcon,
			};
		},
	},
});
