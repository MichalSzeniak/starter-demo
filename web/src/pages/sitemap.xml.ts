import type { APIRoute } from 'astro';
import { getPageIndex } from '~/lib/content';
import { hrefForSlug } from '~/lib/links';
import { POLICY_UPDATED, privacyPolicyTarget } from '~/lib/privacy-policy';

/**
 * Sitemapa budowana z indeksu stron — strony `noindex` pominięte, `lastmod`
 * z `_updatedAt`. Własny endpoint zamiast @astrojs/sitemap: jego `filter`
 * dostaje tylko URL, więc nie ma jak odczytać noindex bez kanału bocznego.
 */
export const GET: APIRoute = async ({ site }) => {
	if (!site) throw new Error('Brak `site` w astro.config.ts — sitemapa wymaga adresu absolutnego.');

	const pages = (await getPageIndex())
		.filter((page) => !page.noindex)
		.map((page) => ({ slug: page.slug, lastmod: page._updatedAt.slice(0, 10) }));
	// Generowana polityka prywatności nie jest w indeksie stron z Sanity.
	const policy = await privacyPolicyTarget();
	if (policy.generated) pages.push({ slug: policy.slug, lastmod: POLICY_UPDATED });

	const entries = pages
		.map(({ slug, lastmod }) => {
			const loc = new URL(hrefForSlug(slug), site).href;
			return `\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t</url>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
