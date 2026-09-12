import { getImage } from 'astro:assets';
import { brand } from '~/config/brand';
import { getSiteSettings } from '~/lib/content';
import { cdnRasterUrl, resolveImage } from '~/lib/sanity/image';
import { organizationNode, webSiteNode, type JsonLdNode } from './jsonld';

/**
 * Węzły JSON-LD wspólne dla każdej strony (Organization+LocalBusiness, WebSite).
 * Liczone raz na build — logo przechodzi przez astro:assets tylko raz.
 */

/** Google oczekuje w danych strukturalnych rastra o boku co najmniej 112 px. */
const LOGO_WIDTH = 600;

let pending: Promise<JsonLdNode[]> | undefined;

async function logoUrl(site: URL): Promise<string | null> {
	const settings = await getSiteSettings();
	const logo = resolveImage(settings.logo, LOGO_WIDTH);
	if (!logo) return null;

	// Treści demo: plik leży w public/, podajemy go wprost.
	if (!logo.remote) return new URL(logo.src, site).href;

	// Google nie przyjmuje tu SVG, a astro:assets nie rasteryzuje wektorów.
	// Konwersję zleca się więc CDN-owi Sanity (fm=png) — astro:assets dostaje
	// już PNG i przetwarza go normalnie.
	const src =
		cdnRasterUrl(settings.logo, {
			width: logo.width,
			height: logo.height,
			format: 'png',
			fit: 'max',
		}) ?? logo.src;

	const result = await getImage({
		src,
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
