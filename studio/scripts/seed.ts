/**
 * Zasilanie datasetu treścią demo.
 *
 *   pnpm seed                 zapisuje treści demo (createOrReplace — można puszczać wielokrotnie)
 *   pnpm seed --dry-run       buduje dokumenty i wypisuje, co by zapisał; bez sieci i bez tokena
 *   pnpm seed --dry-run --verbose   jak wyżej, plus pełny JSON dokumentów
 *   pnpm seed:clean           wypisuje, co zostałoby usunięte
 *   pnpm seed:clean --yes     usuwa dokumenty demo (page, siteSettings, navigation, redirect,
 *                             wraz z wersjami roboczymi) i assety wgrane przez ten skrypt
 *
 * Źródłem jest web/src/lib/sanity/fixtures.ts — nie ma drugiego zestawu danych.
 * Fixtures mają kształt WYNIKÓW ZAPYTAŃ (asset rozwiązany do url, link do sluga),
 * więc skrypt przekłada je z powrotem na dokumenty: obraz → referencja do
 * wgranego assetu, odnośnik wewnętrzny → referencja do dokumentu strony.
 *
 * Obrazy: wgrywane z web/public/demo przez client.assets.upload. Sanity nadaje
 * assetom id z hasza treści, więc ponowne wgranie tego samego pliku nie tworzy
 * duplikatu. Assety dostają source.name = SEED_SOURCE — po tym `--clean` je znajduje.
 *
 * Token: SANITY_WRITE_TOKEN ze studio/.env (Node ładuje go przez --env-file-if-exists).
 * Nigdy w kodzie.
 *
 * NARZĘDZIE DEWELOPERSKIE. Skrypt `nowy-klient` (faza 7) ma go NIE uruchamiać —
 * świeży projekt klienta nie dostaje treści demo.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { demoContent } from '../../web/src/lib/sanity/fixtures.ts';

// ---------------------------------------------------------------------------
// Konfiguracja
// ---------------------------------------------------------------------------

const args = new Set(process.argv.slice(2));
const CLEAN = args.has('--clean');
const YES = args.has('--yes');
const DRY_RUN = args.has('--dry-run');
const VERBOSE = args.has('--verbose');

const SEED_SOURCE = 'starter-demo-seed';
const DOC_TYPES = ['page', 'siteSettings', 'navigation', 'redirect'];
const DEMO_DIR = path.resolve(
	fileURLToPath(new URL('.', import.meta.url)),
	'../../web/public/demo',
);

function fail(message: string): never {
	console.error(`\n✖ ${message}\n`);
	process.exit(1);
}

const projectId = process.env['SANITY_STUDIO_PROJECT_ID'];
const dataset = process.env['SANITY_STUDIO_DATASET'] ?? 'production';
const token = process.env['SANITY_WRITE_TOKEN'];

if (!projectId) fail('Brak SANITY_STUDIO_PROJECT_ID — uzupełnij studio/.env (patrz .env.example).');
if (!token && !DRY_RUN) {
	fail(
		'Brak SANITY_WRITE_TOKEN — token z uprawnieniem Editor tworzysz w sanity.io/manage → API → Tokens i wklejasz do studio/.env.',
	);
}

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2026-09-12',
	useCdn: false,
	// raw: widzimy też wersje robocze — clean ma je usunąć, a seed nadpisać.
	perspective: 'raw',
});

console.log(`Cel: projekt ${projectId}, dataset ${dataset}${DRY_RUN ? ' (dry-run)' : ''}`);

// ---------------------------------------------------------------------------
// Typy wejściowe (kształt wyników zapytań z fixtures) — strukturalne, minimalne
// ---------------------------------------------------------------------------

interface ResultImage {
	_key?: string | null;
	alt: string | null;
	asset: { url: string } | null;
}

interface ResultLink {
	kind: 'internal' | 'external';
	href: string | null;
	newTab: boolean | null;
	page: { slug: string } | null;
}

interface ResultLabeledLink {
	_key?: string | null;
	label: string;
	link: ResultLink;
}

interface ResultBlock {
	_type: 'block';
	_key: string;
	markDefs: Array<{ _key: string; _type: 'link' } & ResultLink> | null;
	[key: string]: unknown;
}

type Doc = Record<string, unknown> & { _id: string; _type: string };

/** Usuwa null/undefined rekurencyjnie — w dokumentach nie chcemy pustych pól. */
function prune<T>(value: T): T {
	if (Array.isArray(value)) return value.map(prune) as T;
	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [key, inner] of Object.entries(value)) {
			if (inner === null || inner === undefined) continue;
			out[key] = prune(inner);
		}
		return out as T;
	}
	return value;
}

const ref = (id: string) => ({ _type: 'reference' as const, _ref: id });

// ---------------------------------------------------------------------------
// Obrazy
// ---------------------------------------------------------------------------

const uploads = new Map<string, Promise<string>>();
let uploadCount = 0;

function uploadDemoImage(url: string): Promise<string> {
	const filename = path.basename(url);
	let pending = uploads.get(filename);
	if (!pending) {
		pending = (async () => {
			const body = await readFile(path.join(DEMO_DIR, filename));
			uploadCount += 1;
			if (DRY_RUN) return `image-dry-run-${filename.replace(/\W+/g, '-')}`;
			const asset = await client.assets.upload('image', body, {
				filename,
				label: 'demo',
				source: { name: SEED_SOURCE, id: filename },
			});
			console.log(`  ↑ ${filename} → ${asset._id}`);
			return asset._id;
		})();
		uploads.set(filename, pending);
	}
	return pending;
}

async function image(img: ResultImage | null | undefined) {
	if (!img?.asset?.url) return undefined;
	return {
		_type: 'imageWithAlt' as const,
		_key: img._key ?? undefined,
		alt: img.alt ?? undefined,
		asset: ref(await uploadDemoImage(img.asset.url)),
	};
}

// ---------------------------------------------------------------------------
// Odnośniki i tekst formatowany
// ---------------------------------------------------------------------------

const pageIdBySlug = new Map(Object.values(demoContent.pages).map((page) => [page.slug, page._id]));

function link(value: ResultLink) {
	if (value.kind === 'external') {
		return {
			_type: 'link' as const,
			kind: 'external',
			href: value.href,
			newTab: value.newTab ?? false,
		};
	}
	const slug = value.page?.slug;
	const id = slug ? pageIdBySlug.get(slug) : undefined;
	if (!id) fail(`Odnośnik wewnętrzny do nieznanego sluga: ${slug}`);
	return { _type: 'link' as const, kind: 'internal', page: ref(id) };
}

function labeledLink(item: ResultLabeledLink) {
	return {
		_type: 'labeledLink' as const,
		_key: item._key ?? undefined,
		label: item.label,
		link: link(item.link),
	};
}

function richText(blocks: ResultBlock[] | null | undefined) {
	return (blocks ?? []).map((block) => ({
		...block,
		markDefs: (block.markDefs ?? []).map((def) => ({ _key: def._key, ...link(def) })),
	}));
}

// ---------------------------------------------------------------------------
// Sekcje
// ---------------------------------------------------------------------------

type Section = (typeof demoContent.pages)[string]['sections'][number];

async function section(value: Section) {
	const base = { _key: value._key, _type: value._type };
	switch (value._type) {
		case 'hero':
			return {
				...base,
				heading: value.heading,
				lead: value.lead,
				image: await image(value.image),
				buttons: (value.buttons ?? []).map(labeledLink),
			};
		case 'textImage':
			return {
				...base,
				heading: value.heading,
				body: richText(value.body as ResultBlock[] | null),
				image: await image(value.image),
				imagePosition: value.imagePosition,
			};
		case 'features':
			return { ...base, heading: value.heading, lead: value.lead, items: value.items };
		case 'pricing':
			return {
				...base,
				heading: value.heading,
				lead: value.lead,
				plans: value.plans.map((plan) => ({
					...plan,
					button: plan.button ? labeledLink(plan.button) : undefined,
				})),
			};
		case 'testimonials':
			return {
				...base,
				heading: value.heading,
				items: await Promise.all(
					value.items.map(async (item) => ({ ...item, avatar: await image(item.avatar) })),
				),
			};
		case 'faq':
			return {
				...base,
				heading: value.heading,
				items: value.items.map((item) => ({
					...item,
					answer: richText(item.answer as ResultBlock[]),
				})),
			};
		case 'gallery':
			return {
				...base,
				heading: value.heading,
				images: await Promise.all(value.images.map(image)),
			};
		case 'cta':
			return {
				...base,
				heading: value.heading,
				lead: value.lead,
				button: labeledLink(value.button),
			};
	}
}

// ---------------------------------------------------------------------------
// Dokumenty
// ---------------------------------------------------------------------------

async function buildDocuments(): Promise<Doc[]> {
	const { siteSettings, navigation, pages, redirects } = demoContent;

	const settingsDoc: Doc = {
		_id: 'siteSettings',
		_type: 'siteSettings',
		companyName: siteSettings.companyName,
		tagline: siteSettings.tagline,
		nip: siteSettings.nip,
		address: siteSettings.address,
		geo: siteSettings.geo,
		phone: siteSettings.phone,
		email: siteSettings.email,
		openingHours: (siteSettings.openingHours ?? []).map((entry) => ({
			_type: 'openingHoursEntry',
			...entry,
		})),
		social: (siteSettings.social ?? []).map((profile) => ({ _type: 'socialProfile', ...profile })),
		logo: await image(siteSettings.logo),
		defaultOgImage: await image(siteSettings.defaultOgImage),
		analytics: siteSettings.analytics,
	};

	const navigationDoc: Doc = {
		_id: 'navigation',
		_type: 'navigation',
		mainMenu: (navigation.mainMenu ?? []).map(labeledLink),
		footerMenu: (navigation.footerMenu ?? []).map(labeledLink),
	};

	const pageDocs: Doc[] = [];
	for (const page of Object.values(pages)) {
		pageDocs.push({
			_id: page._id,
			_type: 'page',
			title: page.title,
			slug: { _type: 'slug', current: page.slug },
			seo: {
				_type: 'seo',
				metaTitle: page.seo.metaTitle,
				metaDescription: page.seo.metaDescription,
				noindex: page.seo.noindex ?? false,
				ogImage: await image(page.seo.ogImage),
			},
			sections: await Promise.all(page.sections.map(section)),
		});
	}

	const redirectDocs: Doc[] = redirects.map((redirect) => ({
		_id: `redirect-${redirect.from
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')}`,
		_type: 'redirect',
		from: redirect.from,
		to: redirect.to,
		permanent: redirect.permanent ?? true,
	}));

	return [settingsDoc, navigationDoc, ...pageDocs, ...redirectDocs].map(prune);
}

// ---------------------------------------------------------------------------
// Tryby
// ---------------------------------------------------------------------------

async function seed() {
	console.log('Buduję dokumenty…');
	const docs = await buildDocuments();

	console.log(`\n${docs.length} dokumentów, ${uploadCount} obrazów:`);
	for (const doc of docs) console.log(`  ${doc._type.padEnd(13)} ${doc._id}`);

	if (DRY_RUN) {
		if (VERBOSE) console.log(JSON.stringify(docs, null, 2));
		console.log('\nDry-run — nic nie zapisano.');
		return;
	}

	const tx = client.transaction();
	for (const doc of docs) {
		// Wersja robocza z tym samym id przesłoniłaby w Studio to, co zapisujemy.
		tx.delete(`drafts.${doc._id}`);
		tx.createOrReplace(doc);
	}
	const result = await tx.commit();
	console.log(`\n✔ Zapisano (transakcja ${result.transactionId}).`);
}

async function clean() {
	const docIds = await client.fetch<string[]>('*[_type in $types]._id', { types: DOC_TYPES });
	const assetIds = await client.fetch<string[]>(
		'*[_type == "sanity.imageAsset" && source.name == $source]._id',
		{ source: SEED_SOURCE },
	);

	console.log(
		`\nDo usunięcia: ${docIds.length} dokumentów (${DOC_TYPES.join(', ')}), ${assetIds.length} assetów demo.`,
	);
	for (const id of docIds) console.log(`  doc   ${id}`);
	for (const id of assetIds) console.log(`  asset ${id}`);

	if (!YES) {
		console.log('\nNic nie usunięto. Żeby naprawdę usunąć, dodaj --yes.');
		return;
	}
	if (docIds.length === 0 && assetIds.length === 0) return;

	// Najpierw dokumenty, potem assety — asset, do którego coś się odwołuje, nie da się usunąć.
	if (docIds.length > 0) {
		const tx = client.transaction();
		for (const id of docIds) tx.delete(id);
		await tx.commit();
	}
	if (assetIds.length > 0) {
		const tx = client.transaction();
		for (const id of assetIds) tx.delete(id);
		await tx.commit();
	}
	console.log('\n✔ Usunięto.');
}

try {
	await (CLEAN ? clean() : seed());
} catch (error) {
	fail(error instanceof Error ? error.message : String(error));
}
