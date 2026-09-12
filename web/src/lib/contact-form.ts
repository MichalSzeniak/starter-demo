/**
 * Kontrakt formularza kontaktowego — wspólny dla komponentu (HTML) i Workera
 * (walidacja po stronie serwera). Jedno źródło nazw pól i limitów, żeby
 * `maxlength` w HTML nie rozjechał się z tym, co odrzuca serwer.
 *
 * Czysty TypeScript bez importów z Astro: ten plik bundluje też wrangler.
 */

export const CONTACT_ENDPOINT = '/api/kontakt';

export const FIELD = {
	name: 'name',
	email: 'email',
	phone: 'phone',
	message: 'message',
	consent: 'consent',
	/** Treść zgody w chwili wysłania — trafia do wiadomości jako dowód zgody. */
	consentText: 'consent_text',
	/** Ścieżka strony z formularzem — cel przekierowania bez JS. */
	page: 'page',
	/** Kotwica sekcji — do komunikatu `:target` bez JS. */
	anchor: 'anchor',
	/**
	 * Honeypot. Nazwa celowo nie przypomina niczego, co autouzupełnianie
	 * przeglądarki mogłoby wypełnić (website, company, url) — inaczej prawdziwe
	 * wiadomości byłyby po cichu odrzucane.
	 */
	trap: 'pole_kontrolne',
} as const;

export const LIMIT = {
	name: 100,
	email: 200,
	phone: 30,
	messageMin: 10,
	message: 5000,
	consentText: 600,
} as const;

/** Wynik wysyłki — wspólny dla odpowiedzi JSON i kotwic `#…-status` bez JS. */
export type ContactStatus = 'wyslano' | 'blad' | 'limit' | 'niepoprawne';

export interface ContactMessage {
	name: string;
	email: string;
	phone: string;
	message: string;
	consentText: string;
}

export type FieldErrors = Partial<
	Record<'name' | 'email' | 'phone' | 'message' | 'consent', string>
>;

// Świadomie prosty wzorzec: HTML `type=email` robi dokładną walidację w przeglądarce,
// serwer tylko odsiewa oczywiste śmieci i nowe linie (wstrzykiwanie nagłówków).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (form: FormData, key: string): string => {
	const value = form.get(key);
	return typeof value === 'string' ? value.trim() : '';
};

/** Walidacja po stronie serwera. Zwraca dane albo błędy pól. */
export function parseContactForm(
	form: FormData,
): { ok: true; message: ContactMessage } | { ok: false; errors: FieldErrors } {
	const name = text(form, FIELD.name);
	const email = text(form, FIELD.email);
	const phone = text(form, FIELD.phone);
	const message = text(form, FIELD.message);
	const consent = text(form, FIELD.consent);
	const consentText = text(form, FIELD.consentText).slice(0, LIMIT.consentText);

	const errors: FieldErrors = {};
	if (!name || name.length > LIMIT.name) errors.name = 'Podaj imię (do 100 znaków).';
	if (!EMAIL_PATTERN.test(email) || email.length > LIMIT.email)
		errors.email = 'Podaj poprawny adres e-mail.';
	if (phone.length > LIMIT.phone || /[\r\n]/.test(phone)) errors.phone = 'Numer jest za długi.';
	if (message.length < LIMIT.messageMin || message.length > LIMIT.message)
		errors.message = 'Wiadomość powinna mieć od 10 do 5000 znaków.';
	if (!consent) errors.consent = 'Zaznacz zgodę, żebyśmy mogli odpowiedzieć.';

	if (Object.keys(errors).length > 0) return { ok: false, errors };
	return { ok: true, message: { name, email, phone, message, consentText } };
}

/**
 * Ścieżka powrotu po wysłaniu bez JS. Tylko ścieżka w obrębie strony —
 * nigdy pełny adres ani `//host` (otwarte przekierowanie).
 */
export function safeReturnPath(value: string): string {
	return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/';
}

/** Kotwica: tylko bezpieczne znaki, żeby nie wstrzyknąć niczego do `Location`. */
export function safeAnchor(value: string): string {
	return /^[a-z0-9-]{1,40}$/.test(value) ? value : 'kontakt';
}
