import { cta } from './cta';
import { faq } from './faq';
import { features } from './features';
import { gallery } from './gallery';
import { hero } from './hero';
import { pricing } from './pricing';
import { testimonials } from './testimonials';
import { textImage } from './textImage';

/**
 * ZAMKNIĘTA LISTA OŚMIU TYPÓW SEKCJI.
 *
 * Dziewiąty typ wymaga osobnej zgody — patrz CLAUDE.md. Klient układa każdą
 * podstronę wyłącznie z tych ośmiu klocków.
 */
export const sectionTypes = [hero, textImage, features, pricing, testimonials, faq, gallery, cta];

/** Nazwy typów w kolejności, w jakiej pojawiają się w menu dodawania sekcji. */
export const sectionTypeNames = sectionTypes.map((section) => section.name);
