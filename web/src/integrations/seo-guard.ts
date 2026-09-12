import type { AstroIntegration } from 'astro';
import { readdir, readFile, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Integracja uruchamiana po buildzie (`astro:build:done`):
 *
 * 1. Walidacja SEO każdej wygenerowanej strony HTML. Build FAILUJE, gdy strona
 *    nie ma tytułu, opisu, absolutnego canonicala albo ma inną liczbę <h1> niż 1.
 *    Sprawdzamy wynikowy HTML, nie dane z CMS — to jedyne miejsce, w którym
 *    widać efekt końcowy (np. drugi h1 wstrzyknięty przez komponent).
 * 2. `redirects.txt` → `_redirects` (Astro nie pozwala na trasy z `_` na początku).
 */

interface PageProblem {
	file: string;
	problems: string[];
}

async function listHtmlFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir);
	const files: string[] = [];
	for (const entry of entries) {
		const full = path.join(dir, entry);
		const info = await stat(full);
		if (info.isDirectory()) files.push(...(await listHtmlFiles(full)));
		else if (entry.endsWith('.html')) files.push(full);
	}
	return files;
}

export function validateHtml(html: string): string[] {
	const problems: string[] = [];

	const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
	if (h1Count !== 1) problems.push(`liczba <h1>: ${h1Count} (wymagany dokładnie 1)`);

	const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
	if (!title) problems.push('brak <title>');
	else if (title.length > 60) problems.push(`<title> ma ${title.length} znaków (maks. 60)`);

	const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
	if (!description) problems.push('brak meta description');
	else if (description.length > 155) {
		problems.push(`meta description ma ${description.length} znaków (maks. 155)`);
	}

	const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
	if (!canonical) problems.push('brak canonical');
	else if (!/^https?:\/\//.test(canonical))
		problems.push(`canonical nie jest absolutny: ${canonical}`);

	if (!/<meta property="og:image" content="https?:\/\//.test(html)) problems.push('brak og:image');

	return problems;
}

export function seoGuard(): AstroIntegration {
	return {
		name: 'seo-guard',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const root = fileURLToPath(dir);

				// 1. _redirects
				const redirectsSrc = path.join(root, 'redirects.txt');
				try {
					await rename(redirectsSrc, path.join(root, '_redirects'));
					logger.info('redirects.txt → _redirects');
				} catch {
					logger.warn('Brak redirects.txt — _redirects nie został wygenerowany.');
				}

				// 2. Walidacja
				const files = await listHtmlFiles(root);
				const failures: PageProblem[] = [];
				for (const file of files) {
					const problems = validateHtml(await readFile(file, 'utf8'));
					if (problems.length > 0) failures.push({ file: path.relative(root, file), problems });
				}

				if (failures.length > 0) {
					const report = failures
						.map((f) => `  ${f.file}\n${f.problems.map((p) => `    - ${p}`).join('\n')}`)
						.join('\n');
					throw new Error(
						`[seo-guard] Walidacja SEO nie przeszła dla ${failures.length} stron:\n${report}`,
					);
				}

				logger.info(
					`Walidacja SEO: ${files.length} stron OK (h1, title, description, canonical, og:image).`,
				);
			},
		},
	};
}
