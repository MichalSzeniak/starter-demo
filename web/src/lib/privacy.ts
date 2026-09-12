import type { SiteSettings } from '~/lib/content';
import { formatAddress } from '~/lib/format';

/**
 * Teksty RODO formularza kontaktowego.
 *
 * Klient może je nadpisać w Ustawieniach strony. Gdy pola są puste, składamy
 * wzór z danych firmy — nowe wdrożenie ma od razu klauzulę z właściwym
 * administratorem, zamiast pustego miejsca albo danych firmy demo.
 *
 * UWAGA: to wzór techniczny, nie porada prawna. Okres przechowywania
 * i lista odbiorców (Cloudflare, Resend) muszą zgadzać się z rzeczywistością
 * u danego klienta — do sprawdzenia przy wdrożeniu (checklista fazy 7).
 */

export const DEFAULT_CONSENT_LABEL =
	'Wyrażam zgodę na przetwarzanie moich danych osobowych podanych w formularzu w celu odpowiedzi na wiadomość. Zgodę mogę w każdej chwili wycofać.';

export const DEFAULT_SUCCESS_MESSAGE = 'Dziękujemy! Odpowiemy najszybciej, jak to możliwe.';

export function consentLabel(settings: SiteSettings): string {
	return settings.contactForm?.consentLabel?.trim() || DEFAULT_CONSENT_LABEL;
}

export function successMessage(settings: SiteSettings): string {
	return settings.contactForm?.successMessage?.trim() || DEFAULT_SUCCESS_MESSAGE;
}

/** Klauzula jako akapity (w Studio oddzielone pustą linią). */
export function privacyNoticeParagraphs(settings: SiteSettings): string[] {
	const custom = settings.contactForm?.privacyNotice?.trim();
	if (custom) {
		return custom
			.split(/\n\s*\n/)
			.map((paragraph) => paragraph.trim())
			.filter(Boolean);
	}

	const address = formatAddress(settings.address);
	const administrator = [settings.companyName, address, settings.nip ? `NIP ${settings.nip}` : null]
		.filter(Boolean)
		.join(', ');
	const contact = settings.email ? ` W sprawach danych osobowych napisz na ${settings.email}.` : '';

	return [
		`Administratorem Twoich danych osobowych jest ${administrator}.${contact}`,
		'Dane podane w formularzu (imię, e-mail, telefon, treść wiadomości) przetwarzamy wyłącznie po to, żeby odpowiedzieć na Twoją wiadomość — na podstawie Twojej zgody (art. 6 ust. 1 lit. a RODO).',
		'Dane przechowujemy przez czas potrzebny do obsługi zapytania, nie dłużej niż 12 miesięcy od ostatniej wiadomości.',
		'Odbiorcami danych są dostawcy usług technicznych: Cloudflare (hosting strony) i Resend (dostarczenie wiadomości e-mail). Mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym na podstawie standardowych klauzul umownych zatwierdzonych przez Komisję Europejską.',
		'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przenoszenia, a także prawo cofnięcia zgody w dowolnym momencie — bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.',
		'Podanie danych jest dobrowolne, ale bez nich nie będziemy mogli odpowiedzieć.',
	];
}
