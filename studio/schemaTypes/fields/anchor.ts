import { defineField } from 'sanity';

/**
 * Pole „Kotwica" — w każdym typie sekcji. Strona jednostronicowa: menu prowadzi
 * do sekcji (`/#o-mnie`) zamiast do podstron.
 *
 * Fabryka pola jak `backgroundField`. Opcjonalne: pusta kotwica = sekcja bez `id`
 * (poza kontaktem, który zawsze ma `#kontakt` — patrz SectionRenderer).
 * Format pilnuje tego, żeby kotwica była poprawnym `id` i czytelnym adresem.
 */

/** Małe litery, cyfry i pojedyncze myślniki — bez polskich znaków. */
export const ANCHOR_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ANCHOR_FORMAT_ERROR =
	'Tylko małe litery bez polskich znaków, cyfry i myślniki, np. o-mnie.';

type SectionLike = { _key?: string; anchor?: string };

export function anchorField() {
	return defineField({
		name: 'anchor',
		title: 'Kotwica (strona jednostronicowa)',
		type: 'string',
		description:
			'Opcjonalnie. Krótka nazwa sekcji w adresie, np. „o-mnie" — wtedy w menu możesz wskazać tę sekcję i strona przewinie się prosto do niej.',
		validation: (rule) =>
			rule.custom((value, context) => {
				if (!value) return true;
				if (!ANCHOR_PATTERN.test(value)) return ANCHOR_FORMAT_ERROR;
				const sections = (context.document?.sections ?? []) as SectionLike[];
				const own = (context.parent as SectionLike | undefined)?._key;
				const taken = sections.some((section) => section.anchor === value && section._key !== own);
				return taken ? 'Ta kotwica jest już użyta w innej sekcji tej strony.' : true;
			}),
	});
}
