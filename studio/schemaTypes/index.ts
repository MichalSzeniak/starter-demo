import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { redirect } from './documents/redirect';
import { siteSettings } from './documents/siteSettings';
import { imageWithAlt } from './objects/imageWithAlt';
import { labeledLink } from './objects/labeledLink';
import { link } from './objects/link';
import { richText } from './objects/richText';
import { seo } from './objects/seo';
import { sectionTypes } from './sections';

/** Dokumenty, które istnieją dokładnie raz. Pilnuje tego structure.ts. */
export const singletonTypeNames: string[] = [siteSettings.name, navigation.name];

export const schemaTypes = [
	// Dokumenty
	siteSettings,
	navigation,
	page,
	redirect,
	// Obiekty współdzielone
	seo,
	imageWithAlt,
	richText,
	link,
	labeledLink,
	// Osiem typów sekcji
	...sectionTypes,
];
