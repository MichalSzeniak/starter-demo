import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { defineField, defineType } from 'sanity';
import { backgroundField } from '../fields/background';

/**
 * Sekcja kontaktowa: formularz + opcjonalnie dane kontaktowe i karta dojazdu.
 *
 * Dziewiąty typ sekcji — dodany za zgodą (faza 5). Wszystko, co wspólne dla
 * całej strony (zgoda RODO, klauzula, adres, współrzędne), żyje w Ustawieniach
 * strony, a nie tutaj: klient wpisuje to raz, a sekcję może wstawić na kilka
 * podstron. Adresat wiadomości NIE jest polem w Studio — to sekret Workera
 * (CONTACT_TO), bo zmiana na literówkę po cichu gubiłaby zapytania klientów.
 */
export const contact = defineType({
	name: 'contact',
	title: 'Kontakt',
	type: 'object',
	icon: EnvelopeIcon,
	description: 'Formularz kontaktowy, a obok niego dane kontaktowe i dojazd.',
	fields: [
		defineField({
			name: 'heading',
			title: 'Tytuł sekcji',
			type: 'string',
			initialValue: 'Napisz do nas',
			validation: (rule) => rule.required().max(90),
		}),
		defineField({
			name: 'lead',
			title: 'Zdanie wprowadzające',
			type: 'text',
			rows: 2,
			description: 'Np. „Odpowiadamy w ciągu jednego dnia roboczego."',
			validation: (rule) => rule.max(200),
		}),
		defineField({
			name: 'showContactDetails',
			title: 'Pokaż dane kontaktowe',
			type: 'boolean',
			description: 'Adres, telefon, e-mail i godziny otwarcia — z Ustawień strony.',
			initialValue: true,
		}),
		defineField({
			name: 'showMap',
			title: 'Pokaż dojazd',
			type: 'boolean',
			description:
				'Przyciski „Pokaż na mapie" i „Wyznacz trasę" — otwierają Google Maps w nowej karcie. Na samej stronie nic od Google się nie ładuje. Korzysta z adresu w Ustawieniach strony.',
			initialValue: true,
		}),
		backgroundField(),
	],
	preview: {
		select: { title: 'heading', details: 'showContactDetails', map: 'showMap' },
		prepare({ title, details, map }) {
			const extras = [details !== false && 'dane kontaktowe', map !== false && 'dojazd'].filter(
				Boolean,
			);
			return {
				title: title || 'Kontakt',
				subtitle: ['Formularz', ...extras].join(' · '),
				media: EnvelopeIcon,
			};
		},
	},
});
