import { ImagesIcon } from '@sanity/icons/Images';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const gallery = defineType({
	name: 'gallery',
	title: 'Galeria',
	type: 'object',
	icon: ImagesIcon,
	description: 'Siatka zdjęć — realizacje, wnętrze lokalu, zespół.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			validation: (rule) => rule.max(90),
		}),
		defineField({
			name: 'images',
			title: 'Zdjęcia',
			type: 'array',
			of: [defineArrayMember({ type: 'imageWithAlt' })],
			options: { layout: 'grid' },
			validation: (rule) => rule.required().min(2).max(24).error('Od 2 do 24 zdjęć.'),
		}),
	],
	preview: {
		select: { title: 'heading', images: 'images', media: 'images.0' },
		prepare({ title, images, media }) {
			const count = Array.isArray(images) ? images.length : 0;
			return {
				title: title || 'Galeria',
				subtitle: `Galeria — ${count} zdj.`,
				media: media ?? ImagesIcon,
			};
		},
	},
});
