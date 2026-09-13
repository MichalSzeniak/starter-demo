import { ImagesIcon } from '@sanity/icons/Images';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundField } from '../fields/background';
import { layoutField } from '../fields/layout';

export const gallery = defineType({
	name: 'gallery',
	title: 'Galeria',
	type: 'object',
	icon: ImagesIcon,
	description: 'Zdjęcia w siatce albo w przewijanej karuzeli — realizacje, wnętrze lokalu, zespół.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			validation: (rule) => rule.max(90),
		}),
		defineField({
			name: 'items',
			title: 'Zdjęcia',
			type: 'array',
			of: [
				defineArrayMember({
					// Obiekt w tablicy, nie osobny typ schemy — lista typów się nie zmienia.
					name: 'galleryItem',
					title: 'Zdjęcie',
					type: 'object',
					icon: ImagesIcon,
					fields: [
						defineField({
							name: 'image',
							title: 'Zdjęcie',
							type: 'imageWithAlt',
							validation: (rule) => rule.required().error('Wgraj zdjęcie.'),
						}),
						defineField({
							name: 'title',
							title: 'Tytuł',
							type: 'string',
							description:
								'Opcjonalny. Wyświetla się pod zdjęciem, np. „Łazienka, Mokotów". Nie zastępuje opisu alternatywnego.',
							validation: (rule) => rule.max(80),
						}),
						defineField({
							name: 'description',
							title: 'Krótki opis',
							type: 'text',
							rows: 2,
							description:
								'Opcjonalny. Jedno–dwa zdania pod tytułem: co zrobiliście, w jakim czasie.',
							validation: (rule) => rule.max(160),
						}),
					],
					preview: {
						select: { title: 'title', alt: 'image.alt', subtitle: 'description', media: 'image' },
						prepare({ title, alt, subtitle, media }) {
							return {
								title: title || alt || 'Zdjęcie bez podpisu',
								subtitle,
								media: media ?? ImagesIcon,
							};
						},
					},
				}),
			],
			options: { layout: 'grid' },
			validation: (rule) => rule.required().min(2).max(24).error('Od 2 do 24 zdjęć.'),
		}),
		layoutField(
			'Siatka pokazuje wszystkie zdjęcia naraz. Karuzela mieści je w jednym rzędzie przewijanym w bok — lepsza przy wielu zdjęciach.',
		),
		backgroundField(),
	],
	preview: {
		select: { title: 'heading', items: 'items', layout: 'layout', media: 'items.0.image' },
		prepare({ title, items, layout, media }) {
			const count = Array.isArray(items) ? items.length : 0;
			return {
				title: title || 'Galeria',
				subtitle: `Galeria — ${count} zdj. · ${layout === 'carousel' ? 'karuzela' : 'siatka'}`,
				media: media ?? ImagesIcon,
			};
		},
	},
});
