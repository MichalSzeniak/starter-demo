/** Kształt odnośnika z fragmentu LINK w queries.ts. Typ strukturalny. */
export type LinkLike = {
	kind?: string | null;
	href?: string | null;
	newTab?: boolean | null;
	page?: { slug: string | null } | null;
};

export interface ResolvedLink {
	href: string;
	external: boolean;
	newTab: boolean;
}

/** Slug z Sanity → ścieżka. Slug `/` to strona główna. Bez ukośnika na końcu. */
export function hrefForSlug(slug: string | null | undefined): string {
	if (!slug || slug === '/') return '/';
	return `/${slug.replace(/^\/+|\/+$/g, '')}`;
}

/**
 * Rozwiązuje odnośnik ze Studio na atrybuty <a>.
 * Zwraca null, gdy odnośnik jest niekompletny (np. usunięta podstrona) —
 * komponent wtedy nie renderuje martwego linku.
 */
export function resolveLink(link: LinkLike | null | undefined): ResolvedLink | null {
	if (!link) return null;

	if (link.kind === 'external') {
		if (!link.href) return null;
		return { href: link.href, external: true, newTab: link.newTab === true };
	}

	if (!link.page?.slug) return null;
	return { href: hrefForSlug(link.page.slug), external: false, newTab: false };
}

/** Atrybuty dla <a> — rel/target tylko tam, gdzie mają sens. */
export function anchorAttributes(link: ResolvedLink): {
	href: string;
	target?: '_blank';
	rel?: string;
} {
	if (!link.external) return { href: link.href };
	return link.newTab
		? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
		: { href: link.href, rel: 'noopener' };
}
