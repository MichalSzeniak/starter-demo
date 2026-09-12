import { RedoIcon } from '@sanity/icons/Redo';
import { defineField, defineType } from 'sanity';

/**
 * Przekierowania. Przy buildzie zamieniane na plik `_redirects` dla Cloudflare
 * (faza 4). Służą temu, żeby stare adresy z poprzedniej strony nie zwracały 404.
 */
export const redirect = defineType({
	name: 'redirect',
	title: 'Przekierowanie',
	type: 'document',
	icon: RedoIcon,
	fields: [
		defineField({
			name: 'from',
			title: 'Stary adres',
			type: 'string',
			description: 'Ścieżka, która ma przekierowywać, np. /oferta.html. Zaczyna się od ukośnika.',
			validation: (rule) =>
				rule.required().custom((value) => {
					if (!value) return 'Stary adres jest wymagany.';
					if (!value.startsWith('/'))
						return 'Adres musi zaczynać się od ukośnika, np. /stara-oferta';
					if (/^https?:\/\//.test(value)) return 'Podaj samą ścieżkę, bez domeny.';
					return true;
				}),
		}),
		defineField({
			name: 'to',
			title: 'Nowy adres',
			type: 'string',
			description: 'Dokąd przekierować. Ścieżka (np. /oferta) albo pełny adres innego serwisu.',
			validation: (rule) =>
				rule.required().custom((value, context) => {
					if (!value) return 'Nowy adres jest wymagany.';
					if (!value.startsWith('/') && !/^https?:\/\//.test(value)) {
						return 'Podaj ścieżkę zaczynającą się od / albo pełny adres z https://';
					}
					const doc = context.document as { from?: string } | undefined;
					if (doc?.from && doc.from === value)
						return 'Stary i nowy adres są takie same — powstałaby pętla.';
					return true;
				}),
		}),
		defineField({
			name: 'permanent',
			title: 'Przekierowanie trwałe',
			type: 'boolean',
			description:
				'Włączone (301) mówi Google, że adres zmienił się na stałe — tak jest w większości przypadków. Wyłącz (302) tylko przy zmianie tymczasowej.',
			initialValue: true,
		}),
	],
	preview: {
		select: { title: 'from', subtitle: 'to', permanent: 'permanent' },
		prepare({ title, subtitle, permanent }) {
			return {
				title: title || 'Brak adresu',
				subtitle: `→ ${subtitle ?? '?'} (${permanent === false ? '302' : '301'})`,
				media: RedoIcon,
			};
		},
	},
});
