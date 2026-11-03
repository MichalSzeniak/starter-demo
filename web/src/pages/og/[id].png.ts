import type { APIRoute, GetStaticPaths } from 'astro';
import { getPage, getPageIndex, getSiteSettings } from '~/lib/content';
import { privacyPolicyTarget } from '~/lib/privacy-policy';
import { resolveImage } from '~/lib/sanity/image';
import { renderOgPng } from '~/lib/seo/og';
import { ogIdForSlug, requireSite } from '~/lib/seo/og-image';

/**
 * /og/<id>.png — obraz OG generowany przy buildzie dla każdej strony z Sanity.
 * `strona-glowna` odpowiada slugowi `/` i służy też jako obraz zapasowy (404).
 * Generowana polityka prywatności nie jest stroną z Sanity — jej id dokładamy osobno.
 */
export const getStaticPaths = (async () => {
	const pages = await getPageIndex();
	const ids = new Set(pages.map((page) => ogIdForSlug(page.slug)));
	ids.add('strona-glowna');
	const policy = await privacyPolicyTarget();
	if (policy.generated) ids.add(ogIdForSlug(policy.slug));
	return [...ids].map((id) => ({ params: { id } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params, site }) => {
	const id = params.id;
	if (!id) throw new Error('[og] Brak identyfikatora strony.');

	const slug = id === 'strona-glowna' ? '/' : id;
	const [page, settings, policy] = await Promise.all([
		getPage(slug),
		getSiteSettings(),
		privacyPolicyTarget(),
	]);
	const isGeneratedPolicy = policy.generated && slug === policy.slug;

	const png = await renderOgPng({
		title: isGeneratedPolicy
			? 'Polityka prywatności'
			: (page?.seo.metaTitle ?? settings.companyName),
		companyName: settings.companyName,
		siteHost: requireSite(site).host,
		logo: resolveImage(settings.logo, 600),
	});

	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
