import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { brand } from './src/config/brand.ts';
import { linkGuard } from './src/integrations/link-guard.ts';
import { seoGuard } from './src/integrations/seo-guard.ts';

/** Wpis z `fonts` — warunkowy element tablicy traci typ kontekstowy, stąd jawny typ. */
type FontFamilyConfig = NonNullable<Parameters<typeof defineConfig>[0]['fonts']>[number];

// https://astro.build/config
export default defineConfig({
	site: brand.siteUrl,
	output: 'static',

	// Po buildzie: walidacja SEO każdej strony i _redirects dla Cloudflare, potem martwe
	// linki wewnętrzne. Obie integracje failują build.
	integrations: [seoGuard(), linkGuard()],

	// Jeden kanoniczny kształt URL-a: bez ukośnika na końcu — tak samo
	// normalizuje adresy Cloudflare Pages, więc canonical zgadza się z tym,
	// co realnie serwuje CDN.
	//
	// Zostajemy przy `format: 'directory'` (domyślnym). Sprawdzone na buildzie:
	// przy `format: 'file'` Astro wstawia `.html` do `Astro.url.pathname`,
	// przez co canonical wychodzi jako `/index.html` — a ten sam błąd przeszedłby
	// potem do sitemapy i breadcrumbów. Uzasadnienie w docs/POSTEP.md.
	trailingSlash: 'never',
	build: {
		format: 'directory',
	},

	// Font wariancyjny pobierany i hostowany lokalnie przy buildzie.
	// Zero requestów do Google w wyjściowym HTML (wydajność + RODO).
	// `latin-ext` jest obowiązkowy — bez niego nie ma ą, ę, ł, ń, ś, ź, ż, ć.
	fonts: [
		{
			name: brand.font.family,
			cssVariable: '--font-brand-sans',
			provider: fontProviders.google(),
			weights: [brand.font.weights],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext'],
			display: 'swap',
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
		},
		// Opcjonalny krój tytułów sekcji (`brand.font.heading`) — jedna grubość, te same zasady.
		...(brand.font.heading
			? [
					{
						name: brand.font.heading.family,
						cssVariable: '--font-brand-heading',
						provider: fontProviders.google(),
						weights: [brand.font.heading.weight],
						styles: ['normal'],
						subsets: ['latin', 'latin-ext'],
						display: 'swap',
						fallbacks: [brand.font.heading.fallback],
					} satisfies FontFamilyConfig,
				]
			: []),
	],

	image: {
		// Obrazy z Sanity pobierane i optymalizowane przy buildzie przez astro:assets.
		// W wyjściowym HTML nie ma linków do cdn.sanity.io.
		domains: ['cdn.sanity.io'],
		// Celowo BEZ globalnego `layout`: `constrained` generuje warianty dla każdego
		// breakpointu do 2× szerokości (ok. 10 na obraz). Przy 50 obrazach to setki
		// operacji sharpa i koniec kryterium „build < 60 s". Szerokości podaje
		// jawnie komponent SanityImage.
	},

	// Zmienne środowiskowe z walidacją typu na starcie builda.
	// Brak SANITY_PROJECT_ID w buildzie produkcyjnym przerywa build z czytelnym
	// komunikatem — chyba że DEMO_CONTENT=true (treści demo z web/src/lib/sanity/fixtures.ts)
	// albo LOCAL_CONTENT=true (wariant bez CMS-u: treści klienta z web/src/tresci/).
	env: {
		schema: {
			SANITY_PROJECT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
			SANITY_DATASET: envField.string({
				context: 'server',
				access: 'secret',
				default: 'production',
			}),
			DEMO_CONTENT: envField.boolean({ context: 'server', access: 'secret', default: false }),
			LOCAL_CONTENT: envField.boolean({ context: 'server', access: 'secret', default: false }),
		},
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
