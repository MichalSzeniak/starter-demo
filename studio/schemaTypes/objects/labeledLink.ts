import { LinkIcon } from '@sanity/icons/Link';
import { defineField, defineType } from 'sanity';

/** Odnośnik z własnym napisem. Używany w menu, stopce i jako przycisk w sekcjach. */
export const labeledLink = defineType({
	name: 'labeledLink',
	title: 'Przycisk / pozycja menu',
	type: 'object',
	icon: LinkIcon,
	fields: [
		defineField({
			name: 'label',
			title: 'Napis',
			type: 'string',
			description: 'Tekst widoczny dla odwiedzającego, np. „Umów wizytę”.',
			validation: (rule) => rule.required().max(40).error('Napis jest wymagany (maks. 40 znaków).'),
		}),
		defineField({
			name: 'link',
			title: 'Odnośnik',
			type: 'link',
			validation: (rule) => rule.required(),
		}),
	],
	preview: {
		select: { title: 'label', kind: 'link.kind', pageTitle: 'link.page.title', href: 'link.href' },
		prepare({ title, kind, pageTitle, href }) {
			return {
				title: title || 'Bez napisu',
				subtitle: kind === 'external' ? href : pageTitle,
				media: LinkIcon,
			};
		},
	},
});
