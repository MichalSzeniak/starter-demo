import { ImageIcon } from '@sanity/icons/Image';
import { defineField, defineType } from 'sanity';

/**
 * JEDYNY typ obrazu w tej schemie.
 *
 * Dzięki temu wymóg opisu alternatywnego jest zdefiniowany w jednym miejscu
 * i obowiązuje wszędzie — nie da się dodać pola obrazu, które go omija.
 *
 * Walidacja jest błędem, nie ostrzeżeniem: blokuje publikację. Sprawdzamy
 * warunkowo (tylko gdy obraz faktycznie wgrano), żeby puste pole opcjonalnego
 * obrazu nie blokowało zapisu całego dokumentu.
 */
export const imageWithAlt = defineType({
	name: 'imageWithAlt',
	title: 'Obraz',
	type: 'image',
	icon: ImageIcon,
	options: { hotspot: true },
	fields: [
		defineField({
			name: 'alt',
			title: 'Opis alternatywny',
			type: 'string',
			description:
				'Opisz, co widać na obrazie — dla osób korzystających z czytników ekranu i dla Google. Np. „Gabinet zabiegowy z fotelem stomatologicznym”.',
			validation: (rule) =>
				rule.custom((alt, context) => {
					const parent = context.parent as { asset?: unknown } | undefined;
					if (parent?.asset && !alt) {
						return 'Opis alternatywny jest wymagany dla każdego obrazu.';
					}
					return true;
				}),
		}),
	],
});
