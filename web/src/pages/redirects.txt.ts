import type { APIRoute } from 'astro';
import { getRedirects } from '~/lib/content';

/**
 * Plik przekierowań dla Cloudflare (Workers Static Assets honoruje `_redirects`
 * w katalogu assetów). Astro ignoruje trasy zaczynające się od `_`, więc
 * generujemy `redirects.txt`, a integracja seo-guard zmienia nazwę po buildzie.
 *
 * Kod statusu ZAWSZE jawnie: Cloudflare domyślnie daje 302, a my chcemy 301
 * dla przekierowań trwałych. Limit: 2 000 statycznych + 100 z symbolami.
 */
export const GET: APIRoute = async () => {
	const redirects = await getRedirects();
	const lines: string[] = [];

	for (const redirect of redirects) {
		const from = redirect.from?.trim();
		const to = redirect.to?.trim();
		if (!from || !to || !from.startsWith('/')) {
			console.warn(`[redirects] Pominięto niepoprawne przekierowanie: ${from} → ${to}`);
			continue;
		}
		if (from === to) continue;
		lines.push(`${from} ${to} ${redirect.permanent === false ? 302 : 301}`);
	}

	if (lines.length > 2100) {
		throw new Error(`[redirects] ${lines.length} przekierowań — Cloudflare przyjmuje maks. 2 100.`);
	}

	return new Response(lines.length > 0 ? `${lines.join('\n')}\n` : '', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
