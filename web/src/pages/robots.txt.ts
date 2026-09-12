import type { APIRoute } from 'astro';

/**
 * Strony `noindex` celowo NIE są tu blokowane: robot musi je odwiedzić,
 * żeby zobaczyć znacznik noindex. Disallow zostawiłby je w indeksie na zawsze.
 */
export const GET: APIRoute = ({ site }) => {
	if (!site)
		throw new Error('Brak `site` w astro.config.ts — robots.txt wymaga adresu absolutnego.');

	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${new URL('/sitemap.xml', site).href}`,
		'',
	].join('\n');
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
