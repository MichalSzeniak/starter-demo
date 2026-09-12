import type { APIRoute, GetStaticPaths } from 'astro';
import { getPage, getPageIndex, getSiteSettings } from '~/lib/content';
import { resolveImage } from '~/lib/sanity/image';
import { renderOgPng } from '~/lib/seo/og';
import { ogIdForSlug, requireSite } from '~/lib/seo/og-image';

/**
 * /og/<id>.png — obraz OG generowany przy buildzie dla każdej strony z Sanity.
 * `strona-glowna` odpowiada slugowi `/` i służy też jako obraz zapasowy (404).
 */
export const getStaticPaths = (async () => {
	const pages = await getPageIndex();
	const ids = new Set(pages.map((page) => ogIdForSlug(page.slug)));
	ids.add('strona-glowna');
	return [...ids].map((id) => ({ params: { id } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params, site }) => {
	const id = params.id;
	if (!id) throw new Error('[og] Brak identyfikatora strony.');

	const slug = id === 'strona-glowna' ? '/' : id;
	const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()]);

	const png = await renderOgPng({
		title: page?.seo.metaTitle ?? settings.companyName,
		companyName: settings.companyName,
		siteHost: requireSite(site).host,
		logo: resolveImage(settings.logo, 600),
	});

	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
