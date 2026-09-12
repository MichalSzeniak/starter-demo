import { contact } from './contact';
import { cta } from './cta';
import { faq } from './faq';
import { features } from './features';
import { gallery } from './gallery';
import { hero } from './hero';
import { pricing } from './pricing';
import { testimonials } from './testimonials';
import { textImage } from './textImage';

/**
 * ZAMKNIĘTA LISTA DZIEWIĘCIU TYPÓW SEKCJI.
 *
 * Kolejny typ wymaga osobnej zgody — patrz CLAUDE.md. Dziewiąty (`contact`)
 * dodany za zgodą w fazie 5. Klient układa każdą podstronę wyłącznie z tych klocków.
 */
export const sectionTypes = [
	hero,
	textImage,
	features,
	pricing,
	testimonials,
	faq,
	gallery,
	contact,
	cta,
];

/** Nazwy typów w kolejności, w jakiej pojawiają się w menu dodawania sekcji. */
export const sectionTypeNames = sectionTypes.map((section) => section.name);
