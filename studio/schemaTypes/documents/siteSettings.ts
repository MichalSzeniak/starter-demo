import { CogIcon } from '@sanity/icons/Cog';
import { defineArrayMember, defineField, defineType } from 'sanity';

const DAYS = [
	{ title: 'Poniedziałek', value: 'monday' },
	{ title: 'Wtorek', value: 'tuesday' },
	{ title: 'Środa', value: 'wednesday' },
	{ title: 'Czwartek', value: 'thursday' },
	{ title: 'Piątek', value: 'friday' },
	{ title: 'Sobota', value: 'saturday' },
	{ title: 'Niedziela', value: 'sunday' },
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Ustawienia strony',
	type: 'document',
	icon: CogIcon,
	groups: [
		{ name: 'company', title: 'Firma', default: true },
		{ name: 'contact', title: 'Kontakt i godziny' },
		{ name: 'media', title: 'Logo i udostępnianie' },
		{ name: 'form', title: 'Formularz kontaktowy' },
		{ name: 'analytics', title: 'Analityka' },
	],
	fields: [
		defineField({
			name: 'companyName',
			title: 'Nazwa firmy',
			type: 'string',
			group: 'company',
			description: 'Tak, jak ma się pojawiać na stronie i w wynikach Google.',
			validation: (rule) => rule.required().error('Nazwa firmy jest wymagana.'),
		}),
		defineField({
			name: 'tagline',
			title: 'Jednym zdaniem',
			type: 'string',
			group: 'company',
			description: 'Czym firma się zajmuje. Używane w stopce i jako zapasowy opis dla Google.',
			validation: (rule) => rule.max(155),
		}),
		defineField({
			name: 'nip',
			title: 'NIP',
			type: 'string',
			group: 'company',
			description: '10 cyfr, z myślnikami lub bez.',
			validation: (rule) =>
				rule.custom((value) => {
					if (!value) return true;
					const digits = value.replace(/[\s-]/g, '');
					if (!/^\d{10}$/.test(digits)) return 'NIP to dokładnie 10 cyfr.';
					return true;
				}),
		}),
		defineField({
			name: 'address',
			title: 'Adres',
			type: 'object',
			group: 'company',
			description: 'Trafia do stopki i do danych strukturalnych Google (wizytówka firmy).',
			options: { columns: 2 },
			fields: [
				defineField({
					name: 'street',
					title: 'Ulica i numer',
					type: 'string',
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: 'postalCode',
					title: 'Kod pocztowy',
					type: 'string',
					validation: (rule) =>
						rule
							.required()
							.custom((value) => (!value || /^\d{2}-\d{3}$/.test(value) ? true : 'Format: 00-000')),
				}),
				defineField({
					name: 'city',
					title: 'Miejscowość',
					type: 'string',
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: 'country',
					title: 'Kraj',
					type: 'string',
					initialValue: 'Polska',
					validation: (rule) => rule.required(),
				}),
			],
		}),
		defineField({
			name: 'geo',
			title: 'Współrzędne siedziby',
			type: 'geopoint',
			group: 'company',
			description:
				'Szerokość i długość geograficzna — trafiają do wizytówki firmy w Google (dane strukturalne). W Google Maps kliknij prawym przyciskiem na pinezkę, pierwsza pozycja menu to gotowe współrzędne.',
		}),
		defineField({
			name: 'phone',
			title: 'Telefon',
			type: 'string',
			group: 'contact',
			description:
				'W formie do wyświetlenia, np. +48 500 600 700. Odnośnik „zadzwoń” zbuduje się sam.',
			validation: (rule) => rule.required().error('Telefon jest wymagany.'),
		}),
		defineField({
			name: 'email',
			title: 'E-mail',
			type: 'string',
			group: 'contact',
			validation: (rule) => rule.required().email().error('Podaj poprawny adres e-mail.'),
		}),
		defineField({
			name: 'openingHours',
			title: 'Godziny otwarcia',
			type: 'array',
			group: 'contact',
			description:
				'Dodaj po jednym wpisie na każdy zestaw dni o tych samych godzinach — osobno dni robocze, osobno sobota.',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'openingHoursEntry',
					title: 'Godziny',
					fields: [
						defineField({
							name: 'days',
							title: 'Dni',
							type: 'array',
							of: [defineArrayMember({ type: 'string' })],
							options: { list: DAYS, layout: 'grid' },
							validation: (rule) =>
								rule.required().min(1).error('Wybierz przynajmniej jeden dzień.'),
						}),
						defineField({
							name: 'closed',
							title: 'Nieczynne',
							type: 'boolean',
							initialValue: false,
						}),
						defineField({
							name: 'opens',
							title: 'Otwarcie',
							type: 'string',
							placeholder: '09:00',
							hidden: ({ parent }) => parent?.closed === true,
							validation: (rule) =>
								rule.custom((value, context) => {
									const parent = context.parent as { closed?: boolean } | undefined;
									if (parent?.closed) return true;
									if (!value) return 'Podaj godzinę otwarcia.';
									return TIME_PATTERN.test(value) ? true : 'Format: 09:00';
								}),
						}),
						defineField({
							name: 'closes',
							title: 'Zamknięcie',
							type: 'string',
							placeholder: '17:00',
							hidden: ({ parent }) => parent?.closed === true,
							validation: (rule) =>
								rule.custom((value, context) => {
									const parent = context.parent as { closed?: boolean; opens?: string } | undefined;
									if (parent?.closed) return true;
									if (!value) return 'Podaj godzinę zamknięcia.';
									if (!TIME_PATTERN.test(value)) return 'Format: 17:00';
									if (parent?.opens && value <= parent.opens) {
										return 'Zamknięcie musi być później niż otwarcie.';
									}
									return true;
								}),
						}),
					],
					preview: {
						select: { days: 'days', opens: 'opens', closes: 'closes', closed: 'closed' },
						prepare({ days, opens, closes, closed }) {
							const names = Array.isArray(days)
								? days
										.map((d: string) => DAYS.find((day) => day.value === d)?.title ?? d)
										.join(', ')
								: '';
							return {
								title: names || 'Brak dni',
								subtitle: closed ? 'Nieczynne' : `${opens ?? '?'}–${closes ?? '?'}`,
							};
						},
					},
				}),
			],
		}),
		defineField({
			name: 'social',
			title: 'Profile społecznościowe',
			type: 'array',
			group: 'contact',
			description: 'Trafiają do stopki i do danych strukturalnych jako oficjalne profile firmy.',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'socialProfile',
					title: 'Profil',
					fields: [
						defineField({
							name: 'platform',
							title: 'Serwis',
							type: 'string',
							options: {
								list: [
									{ title: 'Facebook', value: 'facebook' },
									{ title: 'Instagram', value: 'instagram' },
									{ title: 'LinkedIn', value: 'linkedin' },
									{ title: 'YouTube', value: 'youtube' },
									{ title: 'TikTok', value: 'tiktok' },
									{ title: 'X (Twitter)', value: 'x' },
								],
							},
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: 'url',
							title: 'Adres profilu',
							type: 'url',
							validation: (rule) => rule.required().uri({ scheme: ['https'] }),
						}),
					],
					preview: { select: { title: 'platform', subtitle: 'url' } },
				}),
			],
			validation: (rule) => rule.unique(),
		}),
		defineField({
			name: 'logo',
			title: 'Logo',
			type: 'imageWithAlt',
			group: 'media',
			description: 'Najlepiej SVG lub PNG z przezroczystym tłem.',
		}),
		defineField({
			name: 'defaultOgImage',
			title: 'Domyślny obraz przy udostępnianiu',
			type: 'imageWithAlt',
			group: 'media',
			description:
				'Używany, gdy podstrona nie ma własnego. Zalecane 1200×630 px — tak wygląda link do strony wklejony na Facebooku czy LinkedIn.',
		}),
		defineField({
			name: 'contactForm',
			title: 'Formularz kontaktowy',
			type: 'object',
			group: 'form',
			description:
				'Wspólne dla każdej sekcji „Kontakt" na stronie. Adres, na który przychodzą wiadomości, ustawia wykonawca strony — nie ma go tutaj.',
			fields: [
				defineField({
					name: 'consentLabel',
					title: 'Treść zgody przy polu wyboru',
					type: 'text',
					rows: 3,
					description:
						'Zdanie, które osoba zaznacza przed wysłaniem. Puste = zdanie domyślne. Treść zgody trafia też do każdej wiadomości jako dowód, na co się zgodzono.',
					validation: (rule) => rule.max(400),
				}),
				defineField({
					name: 'privacyNotice',
					title: 'Klauzula informacyjna (RODO)',
					type: 'text',
					rows: 12,
					description:
						'Kto przetwarza dane, w jakim celu, jak długo i jakie prawa przysługują. Akapity oddzielaj pustą linią. Puste = wzór złożony automatycznie z danych firmy — do sprawdzenia przez prawnika.',
					validation: (rule) => rule.max(4000),
				}),
				defineField({
					name: 'privacyPolicyPage',
					title: 'Polityka prywatności',
					type: 'reference',
					to: [{ type: 'page' }],
					description: 'Podstrona z pełną polityką prywatności — pod klauzulą pojawi się link.',
				}),
				defineField({
					name: 'successMessage',
					title: 'Komunikat po wysłaniu',
					type: 'string',
					description: 'Puste = „Dziękujemy! Odpowiemy najszybciej, jak to możliwe."',
					validation: (rule) => rule.max(200),
				}),
			],
		}),
		defineField({
			name: 'analytics',
			title: 'Analityka',
			type: 'object',
			group: 'analytics',
			description:
				'Statystyki odwiedzin bez ciasteczek, więc bez baneru zgody. Nie ma tu pola na wklejenie dowolnego kodu — to celowe.',
			fields: [
				defineField({
					name: 'provider',
					title: 'Dostawca',
					type: 'string',
					options: {
						list: [
							{ title: 'Wyłączona', value: 'none' },
							{ title: 'Plausible', value: 'plausible' },
							{ title: 'Umami', value: 'umami' },
						],
						layout: 'radio',
					},
					initialValue: 'none',
				}),
				defineField({
					name: 'domain',
					title: 'Domena w panelu analityki',
					type: 'string',
					description: 'Dokładnie tak, jak wpisana w Plausible albo Umami, np. example.pl',
					hidden: ({ parent }) => !parent?.provider || parent.provider === 'none',
				}),
				defineField({
					name: 'scriptHost',
					title: 'Adres własnej instancji',
					type: 'url',
					description: 'Wypełnij tylko przy samodzielnym hostingu. Puste = chmura dostawcy.',
					hidden: ({ parent }) => !parent?.provider || parent.provider === 'none',
					validation: (rule) => rule.uri({ scheme: ['https'] }),
				}),
			],
		}),
	],
	preview: {
		select: { title: 'companyName' },
		prepare({ title }) {
			return { title: 'Ustawienia strony', subtitle: title, media: CogIcon };
		},
	},
});
