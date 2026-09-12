import { CogIcon } from '@sanity/icons/Cog';
import { DocumentIcon } from '@sanity/icons/Document';
import { MenuIcon } from '@sanity/icons/Menu';
import { RedoIcon } from '@sanity/icons/Redo';
import type { StructureResolver } from 'sanity/structure';
import { singletonTypeNames } from './schemaTypes';

/**
 * Struktura panelu.
 *
 * Kolejność jest ułożona pod klienta, nie pod schemę: najpierw dwie rzeczy,
 * które zmienia najczęściej (dane firmy, menu), potem podstrony, a rzadko
 * używane przekierowania na końcu, za separatorem.
 *
 * Singletony mają przypisany stały identyfikator dokumentu, więc nie da się
 * utworzyć drugich „Ustawień strony”. Dodatkowo są odfiltrowane z listy
 * generycznej, żeby nie dublowały się w menu.
 */
export const structure: StructureResolver = (S) =>
	S.list()
		.title('Treść')
		.items([
			S.listItem()
				.title('Ustawienia strony')
				.icon(CogIcon)
				.child(
					S.document()
						.schemaType('siteSettings')
						.documentId('siteSettings')
						.title('Ustawienia strony'),
				),

			S.listItem()
				.title('Nawigacja')
				.icon(MenuIcon)
				.child(S.document().schemaType('navigation').documentId('navigation').title('Nawigacja')),

			S.divider(),

			S.documentTypeListItem('page').title('Podstrony').icon(DocumentIcon),

			S.divider(),

			S.documentTypeListItem('redirect').title('Przekierowania').icon(RedoIcon),
		]);

/** Typy, których klient nie tworzy z globalnego przycisku „+”. */
export const hiddenFromNewDocument = singletonTypeNames;
