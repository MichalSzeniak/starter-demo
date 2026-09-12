/** Formatowanie danych z `siteSettings` na potrzeby nagłówka i stopki. */

export function telHref(phone: string | null | undefined): string | undefined {
	if (!phone) return undefined;
	const digits = phone.replace(/[^+\d]/g, '');
	return digits ? `tel:${digits}` : undefined;
}

export type AddressLike = {
	street?: string | null;
	postalCode?: string | null;
	city?: string | null;
	country?: string | null;
};

/** „ul. Przykładowa 1, 00-000 Miasto” — bez kraju, bo strona jest po polsku dla Polski. */
export function formatAddress(address: AddressLike | null | undefined): string | null {
	if (!address) return null;
	const line = [address.postalCode, address.city].filter(Boolean).join(' ');
	const parts = [address.street, line].filter(Boolean);
	return parts.length > 0 ? parts.join(', ') : null;
}

const WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORT: Record<string, string> = {
	monday: 'pon.',
	tuesday: 'wt.',
	wednesday: 'śr.',
	thursday: 'czw.',
	friday: 'pt.',
	saturday: 'sob.',
	sunday: 'niedz.',
};

/** ['monday','tuesday','wednesday','friday'] → „pon.–śr., pt.” */
export function formatDays(days: readonly string[] | null | undefined): string {
	if (!days?.length) return '';
	const indexes = [...new Set(days.map((d) => WEEK.indexOf(d)).filter((i) => i >= 0))].sort(
		(a, b) => a - b,
	);
	const runs: string[] = [];
	let start = indexes[0]!;
	let prev = start;
	const flush = () => {
		const a = DAY_SHORT[WEEK[start]!]!;
		const b = DAY_SHORT[WEEK[prev]!]!;
		runs.push(start === prev ? a : prev - start === 1 ? `${a}, ${b}` : `${a}–${b}`);
	};
	for (const index of indexes.slice(1)) {
		if (index === prev + 1) {
			prev = index;
			continue;
		}
		flush();
		start = index;
		prev = index;
	}
	flush();
	return runs.join(', ');
}

export interface OpeningHoursEntryLike {
	days?: readonly string[] | null;
	closed?: boolean | null;
	opens?: string | null;
	closes?: string | null;
}

export interface OpeningHoursRow {
	days: string;
	hours: string;
}

export function formatOpeningHours(
	entries: readonly OpeningHoursEntryLike[] | null | undefined,
): OpeningHoursRow[] {
	if (!entries?.length) return [];
	return entries
		.map((entry) => ({
			days: formatDays(entry.days),
			hours: entry.closed ? 'nieczynne' : `${entry.opens ?? '?'}–${entry.closes ?? '?'}`,
		}))
		.filter((row) => row.days);
}

const SOCIAL_LABELS: Record<string, string> = {
	facebook: 'Facebook',
	instagram: 'Instagram',
	linkedin: 'LinkedIn',
	youtube: 'YouTube',
	tiktok: 'TikTok',
	x: 'X',
};

export function socialLabel(platform: string | null | undefined): string {
	if (!platform) return 'Profil';
	return SOCIAL_LABELS[platform] ?? platform;
}
