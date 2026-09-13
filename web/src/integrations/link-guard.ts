import type { AstroIntegration } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Integracja uruchamiana po buildzie (`astro:build:done`): martwe linki
 * wewnętrzne. Build FAILUJE, gdy którakolwiek strona odsyła do pliku, strony
 * albo kotwicy, których nie ma w `dist/`.
 *
 * Sprawdzamy:
 * - `href`, `src`, `srcset` w każdym `.html` oraz `og:image` / `twitter:image`,
 * - ścieżki względne, od `/` i absolutne adresy własnej domeny (`site`),
 * - kotwice (`/cennik#kontakt`, `#tresc`) względem `id` na stronie docelowej,
 * - cele z `_redirects` — przekierowanie w nicość to też martwy link.
 *
 * Linków zewnętrznych NIE sprawdzamy: zależałoby to od sieci i cudzych serwerów,
 * więc build failowałby losowo. Typowy martwy link w wizytówce to i tak link
 * wpisany w Studio do usuniętej podstrony albo kotwicy.
 */

/** Ścieżki obsługiwane przez Worker (`run_worker_first` w wrangler.toml), nie przez pliki. */
const WORKER_PREFIXES = ['/api/'];

const SKIPPED_SCHEMES = /^(mailto|tel|sms|data|javascript|blob):/i;

interface Redirect {
	source: string;
	target: string;
}

interface Page {
	/** Ścieżka URL strony, np. `/o-nas`. */
	urlPath: string;
	ids: Set<string>;
	links: string[];
}

async function listFiles(dir: string, root = dir): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...(await listFiles(full, root)));
		else files.push('/' + path.relative(root, full).split(path.sep).join('/'));
	}
	return files;
}

/** `/o-nas/index.html` → `/o-nas`, `/index.html` → `/`, `/404.html` → `/404`. */
function urlPathOf(file: string): string {
	const withoutIndex = file.replace(/\/index\.html$/, '') || '/';
	return withoutIndex.replace(/\.html$/, '');
}

function decodeEntities(value: string): string {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

export function extractLinks(html: string): { ids: Set<string>; links: string[] } {
	const ids = new Set<string>();
	for (const match of html.matchAll(/\sid="([^"]*)"/g)) ids.add(decodeEntities(match[1]!));

	const links: string[] = [];
	for (const match of html.matchAll(/\s(href|src|srcset)="([^"]*)"/g)) {
		const [, attr, raw] = match;
		const value = decodeEntities(raw!);
		if (attr === 'srcset') {
			for (const candidate of value.split(',')) {
				const url = candidate.trim().split(/\s+/)[0];
				if (url) links.push(url);
			}
		} else {
			links.push(value);
		}
	}
	for (const match of html.matchAll(
		/<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]*)"/g,
	)) {
		links.push(decodeEntities(match[1]!));
	}
	return { ids, links };
}

/** `_redirects`: `źródło cel [kod]`, komentarze od `#`. */
export function parseRedirects(text: string): Redirect[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'))
		.map((line) => {
			const [source = '', target = ''] = line.split(/\s+/);
			return { source, target };
		});
}

function matchesRedirect(urlPath: string, redirects: Redirect[]): boolean {
	return redirects.some(({ source }) =>
		source.endsWith('*') ? urlPath.startsWith(source.slice(0, -1)) : source === urlPath,
	);
}

/**
 * Zwraca opis problemu albo `null`, gdy link jest poprawny lub nie podlega sprawdzeniu.
 * `files` — ścieżki wszystkich plików w dist (`/o-nas/index.html`), `pages` — strony po `urlPath`.
 */
export function checkLink(
	link: string,
	from: string,
	site: URL,
	files: Set<string>,
	pages: Map<string, Page>,
	redirects: Redirect[],
): string | null {
	if (!link || SKIPPED_SCHEMES.test(link)) return null;

	let url: URL;
	try {
		url = new URL(link, new URL(from, site));
	} catch {
		return `niepoprawny adres: ${link}`;
	}
	// Zewnętrzne — poza zakresem (patrz komentarz na górze pliku).
	if (url.origin !== site.origin) return null;

	let urlPath: string;
	try {
		urlPath = decodeURIComponent(url.pathname);
	} catch {
		return `niepoprawne kodowanie adresu: ${link}`;
	}
	if (WORKER_PREFIXES.some((prefix) => urlPath.startsWith(prefix))) return null;

	// `trailingSlash: 'never'` — link z ukośnikiem działa, ale przez przekierowanie.
	if (urlPath !== '/' && urlPath.endsWith('/')) {
		return `ukośnik na końcu (przekierowanie zamiast strony): ${link}`;
	}

	const target = pages.get(urlPath);
	if (target) {
		const fragment = url.hash.slice(1);
		if (fragment && !target.ids.has(decodeURIComponent(fragment))) {
			return `brak kotwicy #${fragment} na stronie ${urlPath}: ${link}`;
		}
		return null;
	}
	if (files.has(urlPath)) return null;
	if (matchesRedirect(urlPath, redirects)) return null;
	return `nie istnieje: ${link}`;
}

export function linkGuard(): AstroIntegration {
	let site: URL | undefined;
	return {
		name: 'link-guard',
		hooks: {
			'astro:config:done': ({ config }) => {
				site = config.site ? new URL(config.site) : undefined;
			},
			'astro:build:done': async ({ dir, logger }) => {
				if (!site) {
					logger.warn('Brak `site` w konfiguracji — pomijam sprawdzanie linków.');
					return;
				}
				const root = fileURLToPath(dir);
				const fileList = await listFiles(root);
				const files = new Set(fileList);

				// seo-guard zmienia nazwę redirects.txt → _redirects; działamy przed i po nim.
				let redirects: Redirect[] = [];
				for (const name of ['_redirects', 'redirects.txt']) {
					try {
						redirects = parseRedirects(await readFile(path.join(root, name), 'utf8'));
						break;
					} catch {
						// brak pliku — sprawdzamy następną nazwę
					}
				}

				const pages = new Map<string, Page>();
				for (const file of fileList.filter((f) => f.endsWith('.html'))) {
					const html = await readFile(path.join(root, file), 'utf8');
					const urlPath = urlPathOf(file);
					pages.set(urlPath, { urlPath, ...extractLinks(html) });
				}

				const failures: string[] = [];
				let checked = 0;
				for (const page of pages.values()) {
					const problems = new Set<string>();
					for (const link of page.links) {
						checked++;
						const problem = checkLink(link, page.urlPath, site, files, pages, redirects);
						if (problem) problems.add(problem);
					}
					if (problems.size > 0) {
						failures.push(
							`  ${page.urlPath}\n${[...problems].map((p) => `    - ${p}`).join('\n')}`,
						);
					}
				}

				const redirectProblems = new Set<string>();
				for (const { source, target } of redirects) {
					checked++;
					const problem = checkLink(target, '/', site, files, pages, redirects);
					if (problem) redirectProblems.add(`${source} → ${problem}`);
				}
				if (redirectProblems.size > 0) {
					failures.push(
						`  _redirects\n${[...redirectProblems].map((p) => `    - ${p}`).join('\n')}`,
					);
				}

				if (failures.length > 0) {
					throw new Error(`[link-guard] Martwe linki wewnętrzne:\n${failures.join('\n')}`);
				}
				logger.info(
					`Linki wewnętrzne: ${checked} sprawdzonych na ${pages.size} stronach, 0 martwych.`,
				);
			},
		},
	};
}
