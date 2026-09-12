import { getImage } from 'astro:assets';
import { brand } from '~/config/brand';
import { getSiteSettings } from '~/lib/content';
import { resolveImage } from '~/lib/sanity/image';
import { organizationNode, webSiteNode, type JsonLdNode } from './jsonld';

/**
 * Węzły JSON-LD wspólne dla każdej strony (Organization+LocalBusiness, WebSite).
 * Liczone raz na build — logo przechodzi przez astro:assets tylko raz.
 */

let pending: Promise<JsonLdNode[]> | undefined;

async function logoUrl(site: URL): Promise<string | null> {
	const settings = await getSiteSettings();
	const logo = resolveImage(settings.logo, 600);
	if (!logo) return null;
	if (!logo.remote) return new URL(logo.src, site).href;

	const result = await getImage({
		src: logo.src,
		width: logo.width,
		height: logo.height,
		format: 'png',
	});
	return new URL(result.src, site).href;
}

export function getSiteGraph(site: URL): Promise<JsonLdNode[]> {
	pending ??= (async () => {
		const settings = await getSiteSettings();
		const logo = await logoUrl(site);
		const lang = brand.locale.replace('_', '-');
		return [organizationNode(settings, site, logo), webSiteNode(settings, site, lang)];
	})();
	return pending;
}
