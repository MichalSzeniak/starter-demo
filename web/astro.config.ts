import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { brand } from './src/config/brand.ts';

// https://astro.build/config
export default defineConfig({
	site: brand.siteUrl,
	output: 'static',

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
	],

	image: {
		// Obrazy z Sanity pobierane i optymalizowane przy buildzie przez astro:assets.
		// W wyjściowym HTML nie ma linków do cdn.sanity.io.
		domains: ['cdn.sanity.io'],
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
