/**
 * Eksport strony klienta do przekazania przy rozstaniu — kod bez historii i bez narzędzi startera.
 *
 *   pnpm eksport-klienta [katalog]      domyślnie ../<nazwa-projektu>-przekazanie
 *
 * Uruchamiasz w repo KLIENTA (z remote `starter`), na czystym drzewie — eksport bierze
 * stan z HEAD. Wariant (panel Sanity / bez CMS-u) czyta z web/.env, tak jak zapisał go
 * `nowy-klient`.
 *
 * Wynik:
 *   <katalog>/        repo z jednym commitem, README dla następnego wykonawcy
 *   <katalog>.zip     to samo jako archiwum
 *
 * Usuwane (narzędzia i wiedza startera, niepotrzebne do zbudowania strony):
 *   CLAUDE.md, .claude/, .agents/, skills-lock.json   instrukcje i skille dla AI
 *   docs/                                             plan, postęp, brief, checklisty
 *   scripts/, lighthouserc.*.json                     nowy-klient, eksport, Lighthouse
 *   .github/workflows/backup.yml                      backup na Twój VPS
 *   web/scripts/                                      generator obrazów demo
 *   studio/scripts/                                   seed treści demo i jego zdjęcia
 *   studio/                                           cały — tylko w wariancie bez CMS-u
 *
 * Zostaje celowo cały web/ — także ścieżka Sanity, fixtures demo i endpoint przebudowy.
 * Są wplecione w kod strony; wycinanie ich przy każdym kliencie kosztuje więcej, niż chroni.
 * Ochroną jest licencja w umowie (docs/PRZEKAZANIE.md).
 *
 * Na koniec skrypt w katalogu eksportu robi to, co zrobi następny wykonawca: pnpm install,
 * check, lint, format:check i build. Czerwony krok = eksport nie nadaje się do przekazania.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const COMMON_REMOVALS = [
	'CLAUDE.md',
	'.claude',
	'.agents',
	'skills-lock.json',
	'docs',
	'scripts',
	'lighthouserc.desktop.json',
	'lighthouserc.mobile.json',
	'.github/workflows/backup.yml',
	'web/scripts',
	'studio/scripts',
];

const BUILD_ARTIFACTS = [
	'node_modules',
	'web/node_modules',
	'studio/node_modules',
	'web/dist',
	'web/.astro',
	'studio/dist',
	'studio/.sanity',
];

/** Odwołania do usuniętych plików, które mogły zostać w komentarzach kodu. */
const DANGLING_REFERENCES =
	/CLAUDE\.md|POSTEP|PLAN\.md|CHECKLIST|NOWY-PROJEKT|nowy-klient|eksport-klienta|lighthouserc/;

function fail(message: string): never {
	console.error(`\n✖ ${message}\n`);
	process.exit(1);
}

function run(command: string, args: string[], cwd: string, env: Record<string, string> = {}) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: 'utf8',
		env: { ...process.env, ...env },
		// pnpm na Windows to pnpm.cmd — wymaga powłoki. git nie, a jego argumenty (komunikat
		// commita, ścieżki) mają spacje, których powłoka by nie zacytowała.
		shell: process.platform === 'win32' && command === 'pnpm',
	});
	return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function git(args: string[], cwd = ROOT): string {
	const result = run('git', args, cwd);
	if (!result.ok) fail(`git ${args.join(' ')}\n${result.output}`);
	return result.output.trim();
}

const readEnvValue = (source: string, key: string) =>
	source.match(new RegExp(`^${key}=([^\\r\\n]*)`, 'm'))?.[1]?.trim() ?? '';

// ---------------------------------------------------------------------------
// Warunki startu
// ---------------------------------------------------------------------------

if (!git(['remote']).split('\n').includes('starter')) {
	fail(
		'Brak remote `starter` — to wygląda na repo startera, nie klienta. Eksport robisz u klienta.',
	);
}
if (git(['status', '--porcelain'])) {
	fail('Repo ma niezacommitowane zmiany. Eksport bierze stan z HEAD — najpierw commit.');
}

const webEnvFile = path.join(ROOT, 'web/.env');
if (!existsSync(webEnvFile))
	fail('Brak web/.env — nie wiem, który to wariant (uruchom nowy-klient).');
const webEnv = readFileSync(webEnvFile, 'utf8');
const local = readEnvValue(webEnv, 'LOCAL_CONTENT') === 'true';
const projectId = readEnvValue(webEnv, 'SANITY_PROJECT_ID');
if (local === Boolean(projectId)) {
	fail('web/.env: ustaw albo LOCAL_CONTENT=true, albo SANITY_PROJECT_ID — dokładnie jedno.');
}
const dataset = readEnvValue(webEnv, 'SANITY_DATASET') || 'production';
const variant = local ? 'bez CMS-u' : 'panel Sanity';

const projectName = (
	JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
		name: string;
	}
).name;
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, '..', `${projectName}-przekazanie`));
const ZIP = `${OUT}.zip`;
if (existsSync(OUT) && readdirSync(OUT).length > 0) fail(`${OUT} istnieje i nie jest pusty.`);
if (existsSync(ZIP)) fail(`${ZIP} już istnieje.`);

console.log(`\nEksport ${projectName} (${variant}) z ${git(['rev-parse', '--short', 'HEAD'])}`);
console.log(`  → ${OUT}\n`);

// ---------------------------------------------------------------------------
// 1. Kopia HEAD bez historii
// ---------------------------------------------------------------------------

git(['clone', '--quiet', '--depth=1', pathToFileURL(ROOT).href, OUT], path.dirname(OUT));
rmSync(path.join(OUT, '.git'), { recursive: true, force: true });

const out = (file: string) => path.join(OUT, file);
const removals = [...COMMON_REMOVALS, ...(local ? ['studio'] : [])];
for (const item of removals) rmSync(out(item), { recursive: true, force: true });

// ---------------------------------------------------------------------------
// 2. Konfiguracja bez odwołań do usuniętych części
// ---------------------------------------------------------------------------

interface PackageJson {
	description?: string;
	scripts: Record<string, string>;
	devDependencies: Record<string, string>;
}

function editJson(file: string, edit: (json: PackageJson) => void) {
	const json = JSON.parse(readFileSync(out(file), 'utf8')) as PackageJson;
	edit(json);
	writeFileSync(out(file), `${JSON.stringify(json, null, 2)}\n`);
}

function editText(file: string, edit: (source: string) => string) {
	writeFileSync(out(file), edit(readFileSync(out(file), 'utf8')));
}

/** Usuwa linie pasujące do wzorca. Pliki z CRLF zostają z CRLF. */
const dropLines = (source: string, pattern: RegExp) =>
	source
		.split('\n')
		.filter((line) => !pattern.test(line.replace(/\r$/, '')))
		.join('\n');

editJson('package.json', (p) => {
	p.description = 'Strona internetowa — Astro (statyczna) + Cloudflare Workers';
	for (const s of ['lh', 'nowy-klient', 'eksport-klienta', ...(local ? ['typegen'] : [])]) {
		delete p.scripts[s];
	}
	delete p.devDependencies['@lhci/cli'];
});
editJson('web/package.json', (p) => {
	delete p.scripts['demo:images'];
});
if (!local) {
	editJson('studio/package.json', (p) => {
		for (const s of ['seed', 'seed:clean', 'images:optimize', 'images:generate']) {
			delete p.scripts[s];
		}
		// Używane tylko przez usunięte studio/scripts.
		delete p.devDependencies['@sanity/client'];
		delete p.devDependencies['sharp'];
	});
	editText('studio/.env.example', (s) =>
		s
			.replace(/\r?\n# Tylko do `pnpm seed`[\s\S]*$/, '\n')
			.replace(/^SANITY_STUDIO_PROJECT_ID=.*$/m, `SANITY_STUDIO_PROJECT_ID=${projectId}`)
			.replace(/^SANITY_STUDIO_DATASET=.*$/m, `SANITY_STUDIO_DATASET=${dataset}`),
	);
}

if (local) editText('pnpm-workspace.yaml', (s) => dropLines(s, /^ {2}- studio$/));
editText('.prettierignore', (s) =>
	dropLines(
		s,
		/^(docs\/|CLAUDE\.md|\.agents\/|\.claude\/|skills-lock\.json|# Dokumenty projektowe.*)$/,
	),
);
editText('eslint.config.js', (s) => dropLines(s, /^\t+'\.(agents|claude)\/\*\*',$/));
editText('.gitignore', (s) => {
	let next = dropLines(s, /^\.lighthouseci\/$/);
	if (local)
		next = next
			.replace(/# Sanity\r?\n\.sanity\/\r?\n\r?\n/, '')
			.replace(/\r?\n# Sanity TypeGen[\s\S]*$/, '\n');
	return next;
});

writeFileSync(
	out('web/.env.example'),
	local
		? `# Skopiuj do web/.env. Plik .env NIE trafia do repozytorium.
# Treści strony są w web/src/tresci/ — stąd LOCAL_CONTENT=true i puste SANITY_PROJECT_ID.
LOCAL_CONTENT=true
SANITY_PROJECT_ID=
DEMO_CONTENT=false
`
		: `# Skopiuj do web/.env. Plik .env NIE trafia do repozytorium.
# Treści strony pobiera build z projektu Sanity (dataset publiczny do odczytu).
SANITY_PROJECT_ID=${projectId}
SANITY_DATASET=${dataset}
LOCAL_CONTENT=false
DEMO_CONTENT=false
`,
);
if (local) {
	editText('.dev.vars.example', (s) =>
		dropLines(s, /^(SANITY_WEBHOOK_SECRET=.*|DEPLOY_HOOK_URL=.*|# Lokalnie wskaż atrapę.*)$/),
	);
}

writeFileSync(out('.github/workflows/ci.yml'), ciWorkflow());
writeFileSync(out('README.md'), readme());

// ---------------------------------------------------------------------------
// 3. Kontrola: sekrety i odwołania do usuniętych plików
// ---------------------------------------------------------------------------

function walk(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const full = path.join(dir, entry);
		if (entry === 'node_modules' || entry === 'dist' || entry === '.astro') return [];
		return statSync(full).isDirectory() ? walk(full) : [full];
	});
}

const files = walk(OUT);
const secrets = files.filter((f) => /^(\.env|\.dev\.vars)$/.test(path.basename(f)));
if (secrets.length > 0) fail(`W eksporcie są pliki z sekretami:\n  ${secrets.join('\n  ')}`);

const dangling = files
	.filter((f) => /\.(ts|astro|js|json|toml|ya?ml|md|css)$/.test(f) && !f.endsWith('pnpm-lock.yaml'))
	.flatMap((f) =>
		readFileSync(f, 'utf8')
			.split('\n')
			.map((line, i) => ({ line, at: `${path.relative(OUT, f)}:${i + 1}` }))
			.filter(({ line }) => DANGLING_REFERENCES.test(line)),
	);

// ---------------------------------------------------------------------------
// 4. To, co zrobi następny wykonawca: instalacja, kontrola, build
// ---------------------------------------------------------------------------

const buildEnv: Record<string, string> = local
	? { LOCAL_CONTENT: 'true', SANITY_PROJECT_ID: '', DEMO_CONTENT: 'false' }
	: {
			SANITY_PROJECT_ID: projectId,
			SANITY_DATASET: dataset,
			LOCAL_CONTENT: 'false',
			DEMO_CONTENT: 'false',
		};

const steps: { label: string; args: string[]; env?: Record<string, string> }[] = [
	{ label: 'pnpm install', args: ['install'] },
	{ label: 'pnpm check', args: ['check'] },
	...(local ? [] : [{ label: 'studio check', args: ['--filter', 'studio', 'check'] }]),
	{ label: 'pnpm lint', args: ['lint'] },
	{ label: 'pnpm format:check', args: ['format:check'] },
	{ label: 'pnpm build', args: ['build'], env: buildEnv },
];
for (const { label, args, env } of steps) {
	process.stdout.write(`  ${label.padEnd(18)}`);
	const result = run('pnpm', args, OUT, env);
	if (!result.ok) {
		console.log('✖');
		fail(`${label} nie przechodzi w eksporcie — nie przekazuj go w tym stanie.\n${result.output}`);
	}
	const summary = result.output.match(/Walidacja SEO: [^\n]*|Linki wewnętrzne: [^\n]*/g);
	console.log(`✓${summary ? `  ${summary.join(' · ')}` : ''}`);
}

// ---------------------------------------------------------------------------
// 5. Jeden commit, archiwum, sprzątanie
// ---------------------------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
git(['init', '--quiet', '-b', 'main'], OUT);
git(['add', '-A'], OUT);
git(['commit', '--quiet', '-m', `Strona ${projectName} — stan na ${today}`], OUT);
git(['archive', '--format=zip', '-o', ZIP, 'HEAD'], OUT);
// Artefakty weryfikacji — ignorowane przez gita, w paczce zbędne. rmSync, nie `git clean -X`:
// ten na Windows nie usuwa ścieżek z node_modules/.pnpm dłuższych niż 260 znaków.
for (const dir of BUILD_ARTIFACTS) rmSync(out(dir), { recursive: true, force: true });

console.log(`
✓ Gotowe (${git(['ls-files'], OUT).split('\n').length} plików, jeden commit).
  Repo:     ${OUT}
  Archiwum: ${ZIP}
`);
if (dangling.length > 0) {
	console.log(
		'Odwołania do plików, których nie ma w paczce (komentarze — przejrzyj, nie blokują):',
	);
	for (const { at, line } of dangling) console.log(`  ${at}  ${line.trim().slice(0, 90)}`);
	console.log('');
}
console.log('Dalej: docs/PRZEKAZANIE.md — DNS, domena, konta, sprzątanie po Twojej stronie.\n');

// ---------------------------------------------------------------------------
// Pliki dla następnego wykonawcy
// ---------------------------------------------------------------------------

function ciWorkflow(): string {
	const env = local
		? `      LOCAL_CONTENT: 'true'`
		: `      # Settings → Secrets and variables → Actions → Variables
      SANITY_PROJECT_ID: \${{ vars.SANITY_PROJECT_ID }}
      SANITY_DATASET: \${{ vars.SANITY_DATASET || 'production' }}`;
	const studioCheck = local ? '' : `\n      - run: pnpm --filter studio check`;
	return `# Kontrola jakości: typy, lint i build (z walidacją SEO i martwych linków).
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  jakosc:
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    env:
${env}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
      - uses: pnpm/action-setup@v6
        with:
          cache: true
      - run: pnpm install --frozen-lockfile
      - run: pnpm check${studioCheck}
      - run: pnpm lint && pnpm format:check
      - run: pnpm build
`;
}

function readme(): string {
	const content = local
		? `## Zmiana treści

- Teksty, dane kontaktowe, menu i podstrony: \`web/src/tresci/index.ts\`.
- Zdjęcia: \`web/src/tresci/obrazy/\`, w treści \`await obraz('plik.webp', 'opis zdjęcia')\`.
  Brak pliku albo pusty opis przerywa build.
- Kolory, czcionka, zaokrąglenia, animacje: \`web/src/config/brand.ts\`.
- Po zmianie treści podbij \`UPDATED\` w \`web/src/tresci/index.ts\` (data w sitemapie).`
		: `## Treści — panel Sanity

Treści edytuje się w panelu (Sanity Studio, kod w \`studio/\`). Strona czyta je przy buildzie
z projektu \`${projectId}\`, dataset \`${dataset}\`.

\`\`\`bash
cp studio/.env.example studio/.env
pnpm --filter studio dev             # panel lokalnie na http://localhost:3333
pnpm --filter studio deploy          # panel pod adresem *.sanity.studio
pnpm typegen                         # po zmianie schemy: typy TS dla web/
\`\`\`

- Kolory, czcionka, zaokrąglenia, animacje: \`web/src/config/brand.ts\`.
- Po publikacji w panelu strona przebudowuje się sama: webhook Sanity
  (\`https://<domena>/api/przebuduj\`, sekret \`SANITY_WEBHOOK_SECRET\`) → Worker → Deploy Hook
  Cloudflare (\`DEPLOY_HOOK_URL\`).
- Kopie zapasowe treści: \`pnpm --filter studio exec sanity datasets export ${dataset} <plik>.tar.gz\`
  (plik zawiera też obrazy). Warto ustawić je cyklicznie.`;
	const vars = local
		? '`LOCAL_CONTENT=true`'
		: `\`SANITY_PROJECT_ID=${projectId}\`, \`SANITY_DATASET=${dataset}\``;
	const secrets = local
		? '`RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`'
		: '`RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`, `SANITY_WEBHOOK_SECRET`, `DEPLOY_HOOK_URL`';
	return `# Strona internetowa

Strona statyczna w [Astro](https://astro.build) ze stylami w Tailwind CSS. Hosting:
Cloudflare Workers (pliki statyczne + mały Worker dla formularza kontaktowego${local ? '' : ' i przebudowy po publikacji'}).

## Uruchomienie

Wymagania: Node.js (wersja w \`.nvmrc\`) i pnpm (wersja w \`package.json\` → \`packageManager\`).

\`\`\`bash
pnpm install
cp web/.env.example web/.env
pnpm dev        # podgląd na http://localhost:4321
pnpm build      # wersja produkcyjna do web/dist
pnpm check      # kontrola typów
\`\`\`

Build przerywa się, gdy podstrona nie ma tytułu, opisu, adresu kanonicznego, nagłówka \`h1\`
albo obrazu do udostępniania, oraz gdy wewnętrzny link prowadzi donikąd.

${content}

## Wdrożenie (Cloudflare)

1. Workers & Pages → import repozytorium. Build: \`pnpm build\`, deploy: \`npx wrangler deploy\`.
   Nazwa Workera = \`name\` w \`wrangler.toml\`.
2. Zmienne builda: ${vars}.
3. Sekrety Workera (Settings → Variables and Secrets, typ „Secret"): ${secrets}.
   Formularz wysyła przez [Resend](https://resend.com) — potrzebne konto z zweryfikowaną domeną.
4. Domena: Worker → Settings → Domains & Routes → Custom Domain (domena główna i \`www\`).

Formularz kontaktowy działa tylko z Workerem (\`web/worker/\`). Na innym hostingu statycznym
strona zadziała, ale formularz trzeba zastąpić inną usługą.
`;
}
