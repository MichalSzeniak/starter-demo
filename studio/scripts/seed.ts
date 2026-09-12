/**
 * Zasilanie datasetu treścią demo.
 *
 *   pnpm seed                 zapisuje treści demo (createOrReplace — można puszczać wielokrotnie)
 *   pnpm seed --dry-run       buduje dokumenty i wypisuje, co by zapisał; bez sieci i bez tokena
 *   pnpm seed --dry-run --verbose   jak wyżej, plus pełny JSON dokumentów
 *   pnpm seed --allow-placeholders  brakujące zdjęcia zastępuje placeholderami SVG (tylko do testów)
 *   pnpm seed:clean           wypisuje, co zostałoby usunięte
 *   pnpm seed:clean --yes     usuwa dokumenty demo (page, siteSettings, navigation, redirect,
 *                             wraz z wersjami roboczymi) i assety wgrane przez ten skrypt
 *
 * Źródłem jest web/src/lib/sanity/fixtures.ts — nie ma drugiego zestawu danych.
 * Fixtures mają kształt WYNIKÓW ZAPYTAŃ (asset rozwiązany do url, link do sluga),
 * więc skrypt przekłada je z powrotem na dokumenty: obraz → referencja do
 * wgranego assetu, odnośnik wewnętrzny → referencja do dokumentu strony.
 *
 * Obrazy: czytane z dysku i wgrywane przez client.assets.upload — nigdy z URL-i.
 * Źródłem jest studio/scripts/demo-images (pliki dodawane ręcznie, poza repo),
 * dopasowane po nazwie do slotu z fixtures: /demo/hero.svg → demo-images/hero.*
 * (jpg, jpeg, png, webp, avif, gif, svg). Brak pliku dla slotu = BŁĄD z listą braków,
 * sprawdzany przed pierwszym uploadem; placeholdery SVG z web/public/demo wchodzą
 * wyłącznie pod jawną flagą --allow-placeholders. Sanity nadaje assetom id z hasza treści,
 * więc ponowne wgranie tego samego pliku nie tworzy duplikatu. Assety dostają
 * source.name = SEED_SOURCE — po tym `--clean` je znajduje.
 *
 * Token: SANITY_WRITE_TOKEN ze studio/.env (Node ładuje go przez --env-file-if-exists).
 * Nigdy w kodzie.
 *
 * NARZĘDZIE DEWELOPERSKIE. Skrypt `nowy-klient` (faza 7) ma go NIE uruchamiać —
 * świeży projekt klienta nie dostaje treści demo.
 */

import { readdir, readFile } from 'node:fs/promises';
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
const ALLOW_PLACEHOLDERS = args.has('--allow-placeholders');

const SEED_SOURCE = 'starter-demo-seed';
const DOC_TYPES = ['page', 'siteSettings', 'navigation', 'redirect'];

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
/** Zdjęcia do seeda — dodawane ręcznie, poza repo. Nazwa pliku = slot z fixtures. */
const DEMO_IMAGES_DIR = path.join(SCRIPT_DIR, 'demo-images');
/** Placeholdery SVG strony demo — zapas, gdy w demo-images brakuje pliku. */
const PLACEHOLDER_DIR = path.resolve(SCRIPT_DIR, '../../web/public/demo');
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];

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

/** Slot = nazwa pliku bez rozszerzenia, małymi literami: /demo/hero.svg → hero. */
function slotOf(file: string): string {
	return path.basename(file, path.extname(file)).toLowerCase();
}

/** Pliki z demo-images zindeksowane po slocie. Czytane raz. */
let demoImageIndex: Promise<Map<string, string>> | undefined;

function indexDemoImages(): Promise<Map<string, string>> {
	demoImageIndex ??= (async () => {
		const map = new Map<string, string>();
		let entries: string[];
		try {
			entries = await readdir(DEMO_IMAGES_DIR);
		} catch {
			return map;
		}
		for (const entry of entries.sort()) {
			const ext = path.extname(entry).slice(1).toLowerCase();
			if (!IMAGE_EXTENSIONS.includes(ext)) continue;
			const slot = slotOf(entry);
			const existing = map.get(slot);
			if (existing) {
				console.warn(
					`  ! ${slot}: kilka plików w demo-images — biorę ${existing}, pomijam ${entry}`,
				);
				continue;
			}
			map.set(slot, entry);
		}
		return map;
	})();
	return demoImageIndex;
}

interface ResolvedFile {
	slot: string;
	file: string;
	placeholder: boolean;
}

/** Slot z fixtures → plik z demo-images albo placeholder SVG. */
async function resolveImageFile(url: string): Promise<ResolvedFile> {
	const slot = slotOf(url);
	const own = (await indexDemoImages()).get(slot);
	if (own) return { slot, file: path.join(DEMO_IMAGES_DIR, own), placeholder: false };
	return { slot, file: path.join(PLACEHOLDER_DIR, `${slot}.svg`), placeholder: true };
}

const uploads = new Map<string, Promise<string>>();
const resolvedFiles: ResolvedFile[] = [];

function uploadDemoImage(url: string): Promise<string> {
	const slot = slotOf(url);
	let pending = uploads.get(slot);
	if (!pending) {
		pending = (async () => {
			const resolved = await resolveImageFile(url);
			resolvedFiles.push(resolved);
			const body = await readFile(resolved.file);
			const filename = path.basename(resolved.file);
			if (DRY_RUN) return `image-dry-run-${slot}`;
			const asset = await client.assets.upload('image', body, {
				filename,
				label: 'demo',
				source: { name: SEED_SOURCE, id: slot },
			});
			console.log(`  ↑ ${filename} → ${asset._id}`);
			return asset._id;
		})();
		uploads.set(slot, pending);
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

/** Wszystkie adresy obrazów z fixtures — do sprawdzenia plików PRZED uploadem. */
function collectImageUrls(): string[] {
	const { siteSettings, pages } = demoContent;
	const urls: (string | null | undefined)[] = [
		siteSettings.logo?.asset?.url,
		siteSettings.defaultOgImage?.asset?.url,
	];
	for (const page of Object.values(pages)) {
		urls.push(page.seo.ogImage?.asset?.url);
		for (const item of page.sections) {
			switch (item._type) {
				case 'hero':
				case 'textImage':
					urls.push(item.image?.asset?.url);
					break;
				case 'testimonials':
					for (const entry of item.items) urls.push(entry.avatar?.asset?.url);
					break;
				case 'gallery':
					for (const entry of item.images) urls.push(entry.asset?.url);
					break;
			}
		}
	}
	return urls.filter((url): url is string => Boolean(url));
}

/**
 * Treść demo ma pokazywać CAŁĄ bibliotekę sekcji — to jej jedyny sens.
 *
 * Rekord jest typowany kluczami z TypeGen: nowy typ sekcji w schemie wywala
 * typecheck, dopóki ktoś go tu nie dopisze. Sprawdzenie w czasie działania
 * pilnuje, żeby fixtures faktycznie go zawierały (i każdy układ galerii).
 */
const REQUIRED_SECTION_TYPES: Record<SectionType, true> = {
	hero: true,
	textImage: true,
	features: true,
	pricing: true,
	testimonials: true,
	faq: true,
	gallery: true,
	contact: true,
	cta: true,
};
const REQUIRED_GALLERY_LAYOUTS: Record<GalleryLayout, true> = { grid: true, carousel: true };

function preflightCoverage(): void {
	const sections = Object.values(demoContent.pages).flatMap((page) => page.sections);
	const types = new Set(sections.map((item) => item._type));
	const layouts = new Set(
		sections.flatMap((item) => (item._type === 'gallery' ? [item.layout] : [])),
	);
	const missing = [
		...Object.keys(REQUIRED_SECTION_TYPES).filter((type) => !types.has(type as SectionType)),
		...Object.keys(REQUIRED_GALLERY_LAYOUTS)
			.filter((layout) => !layouts.has(layout as GalleryLayout))
			.map((layout) => `gallery (${layout})`),
	];
	if (missing.length > 0) {
		fail(
			`Treść demo nie pokazuje wszystkich sekcji. Brakuje: ${missing.join(', ')}. Uzupełnij web/src/lib/sanity/fixtures.ts.`,
		);
	}
}

/** Twardy błąd przy brakujących zdjęciach — zanim cokolwiek trafi do Sanity. */
async function preflightImages(): Promise<void> {
	const missing = new Set<string>();
	for (const url of collectImageUrls()) {
		const resolved = await resolveImageFile(url);
		if (resolved.placeholder) missing.add(resolved.slot);
	}
	if (missing.size === 0) return;
	const slots = [...missing].sort().join(', ');
	if (!ALLOW_PLACEHOLDERS) {
		fail(
			`Brak zdjęć w scripts/demo-images dla slotów: ${slots}. Dodaj pliki (nazwy w scripts/demo-images/README.md) albo uruchom z --allow-placeholders, żeby użyć placeholderów SVG.`,
		);
	}
	console.warn(
		`  ! --allow-placeholders: sloty ${slots} dostaną placeholdery SVG z web/public/demo.`,
	);
}

function printImageSummary(): void {
	const placeholders = resolvedFiles.filter((file) => file.placeholder).length;
	console.log(
		`\n${resolvedFiles.length} obrazów (${resolvedFiles.length - placeholders} z demo-images, ${placeholders} placeholderów):`,
	);
	for (const file of resolvedFiles) {
		const source = path.relative(SCRIPT_DIR, file.file).replace(/\\/g, '/');
		const note = file.placeholder ? `   (brak ${file.slot}.* w demo-images)` : '';
		console.log(`  ${file.slot.padEnd(11)} ← ${source}${note}`);
	}
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
type SectionType = Section['_type'];
type GalleryLayout = Extract<Section, { _type: 'gallery' }>['layout'];

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
				layout: value.layout,
				images: await Promise.all(value.images.map(image)),
			};
		case 'contact':
			return {
				...base,
				heading: value.heading,
				lead: value.lead,
				showContactDetails: value.showContactDetails,
				showMap: value.showMap,
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
		// `privacyPolicySlug` to projekcja referencji, nie pole dokumentu — nie zapisujemy.
		contactForm: {
			consentLabel: siteSettings.contactForm?.consentLabel,
			privacyNotice: siteSettings.contactForm?.privacyNotice,
			successMessage: siteSettings.contactForm?.successMessage,
		},
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
	console.log('Sprawdzam pokrycie sekcji i zdjęcia…');
	preflightCoverage();
	await preflightImages();
	console.log('Buduję dokumenty…');
	const docs = await buildDocuments();

	console.log(`\n${docs.length} dokumentów:`);
	for (const doc of docs) console.log(`  ${doc._type.padEnd(13)} ${doc._id}`);
	printImageSummary();

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
