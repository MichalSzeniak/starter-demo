import { getPageIndex, getSiteSettings, type SiteSettings } from '~/lib/content';
import { formatAddress } from '~/lib/format';
import { defaultNoticeParts, privacyNoticeParagraphs } from '~/lib/privacy';

/**
 * Polityka prywatności generowana z Ustawień strony — bez nowego typu sekcji i bez treści
 * do pisania przy każdym kliencie.
 *
 * Powstaje pod `/polityka-prywatnosci` tylko wtedy, gdy klient nie ma własnej: nie wskazał
 * podstrony w Ustawienia → Formularz kontaktowy → Polityka prywatności i nie ma podstrony
 * o tym adresie. Własna podstrona zawsze wygrywa.
 *
 * UWAGA: to wzór techniczny, nie porada prawna — opisuje to, co starter robi naprawdę
 * (formularz → Resend, hosting → Cloudflare, statystyki bez cookies). Zmiana tego zachowania
 * w kodzie = zmiana tutaj i nowa data w POLICY_UPDATED.
 */

export const PRIVACY_POLICY_SLUG = 'polityka-prywatnosci';

/** Data ostatniej zmiany treści wzoru — na stronie i w `<lastmod>` sitemapy. */
export const POLICY_UPDATED = '2026-11-03';

export interface PrivacyPolicyTarget {
	/** Slug podstrony z polityką (bez ukośnika). */
	slug: string;
	/** true = strona generowana z tego modułu; false = własna podstrona klienta. */
	generated: boolean;
}

/** Gdzie jest polityka prywatności tej strony. Wywoływane przy buildzie, dane memoizowane w content.ts. */
export async function privacyPolicyTarget(): Promise<PrivacyPolicyTarget> {
	const [settings, pages] = await Promise.all([getSiteSettings(), getPageIndex()]);
	const own = settings.contactForm?.privacyPolicySlug;
	if (own) return { slug: own, generated: false };
	if (pages.some((page) => page.slug === PRIVACY_POLICY_SLUG)) {
		return { slug: PRIVACY_POLICY_SLUG, generated: false };
	}
	return { slug: PRIVACY_POLICY_SLUG, generated: true };
}

/** Tytuł ≤ 60 znaków i opis ≤ 155 (seo-guard) — przy długiej nazwie firmy bez nazwy. */
export function privacyPolicyMeta(settings: SiteSettings): { title: string; description: string } {
	const base = 'Polityka prywatności';
	const withName = `${base} — ${settings.companyName}`;
	const description = `Kto przetwarza dane osobowe na stronie ${settings.companyName}, w jakim celu i jakie prawa Ci przysługują.`;
	return {
		title: withName.length <= 60 ? withName : base,
		description:
			description.length <= 155
				? description
				: 'Kto przetwarza dane osobowe na tej stronie, w jakim celu i jakie prawa Ci przysługują.',
	};
}

export interface PolicySection {
	heading: string;
	paragraphs: string[];
}

const ANALYTICS_NAMES: Record<string, string> = { plausible: 'Plausible', umami: 'Umami' };

/** Treść polityki jako sekcje: śródtytuł + akapity. */
export function privacyPolicySections(settings: SiteSettings): PolicySection[] {
	const address = formatAddress(settings.address);
	const administrator = [settings.companyName, address, settings.nip ? `NIP ${settings.nip}` : null]
		.filter(Boolean)
		.join(', ');
	const contact = settings.email
		? `W sprawach danych osobowych możesz napisać na adres ${settings.email}.`
		: 'W sprawach danych osobowych możesz skontaktować się z nami przez dane podane na stronie.';

	const provider = settings.analytics?.provider;
	const analyticsName = provider ? ANALYTICS_NAMES[provider] : undefined;

	const sections: PolicySection[] = [
		{
			heading: 'Kto odpowiada za Twoje dane',
			paragraphs: [`Administratorem danych osobowych jest ${administrator}.`, contact],
		},
		{
			heading: 'Formularz kontaktowy',
			paragraphs: formParagraphs(settings),
		},
		{
			heading: 'Odwiedziny strony',
			paragraphs: [
				'Stronę dostarcza Cloudflare. Przy każdym wejściu przeglądarka przekazuje dane techniczne, takie jak adres IP, rodzaj przeglądarki i adres odwiedzanej podstrony. Cloudflare przetwarza je, żeby dostarczyć stronę i chronić ją przed atakami — na podstawie naszego prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO).',
				analyticsName
					? `Liczymy odwiedziny narzędziem ${analyticsName}, które nie używa plików cookies i nie identyfikuje osób — widzimy tylko zbiorcze statystyki, np. liczbę odwiedzin i najczęściej czytane podstrony. Podstawą jest nasz prawnie uzasadniony interes w ulepszaniu strony (art. 6 ust. 1 lit. f RODO).`
					: 'Nie używamy narzędzi do statystyk odwiedzin.',
				'Strona nie zapisuje w Twojej przeglądarce plików cookies do statystyk ani reklam i nie korzysta z narzędzi reklamowych.',
			],
		},
		{
			heading: 'Linki do innych serwisów',
			paragraphs: [
				'Strona nie osadza map, filmów ani wtyczek serwisów społecznościowych. Przycisk „Jak dojechać” i odnośniki do profili społecznościowych otwierają zewnętrzne serwisy — po przejściu obowiązują ich zasady prywatności.',
			],
		},
		{
			heading: 'Twoje prawa',
			paragraphs: [
				'Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przenoszenia oraz prawo sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Zgodę możesz cofnąć w dowolnym momencie — bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem.',
				'Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).',
			],
		},
		{
			heading: 'Zmiany polityki',
			paragraphs: [
				`Gdy zmieni się sposób przetwarzania danych, zaktualizujemy tę stronę. Ostatnia zmiana: ${formatDate(POLICY_UPDATED)}.`,
			],
		},
	];
	return sections;
}

/**
 * Własna klauzula klienta z Ustawień — w całości (nie wiemy, co w niej jest).
 * Wzór domyślny — bez akapitów o administratorze i prawach, bo polityka ma na nie osobne sekcje.
 */
function formParagraphs(settings: SiteSettings): string[] {
	if (settings.contactForm?.privacyNotice?.trim()) return privacyNoticeParagraphs(settings);
	const parts = defaultNoticeParts(settings);
	return [parts.purpose, parts.retention, parts.recipients, parts.voluntary];
}

function formatDate(iso: string): string {
	return new Intl.DateTimeFormat('pl-PL', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date(`${iso}T12:00:00Z`));
}
