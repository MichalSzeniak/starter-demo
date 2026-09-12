# Postęp prac

## Faza 0 — Ustalenia — 2026-09-12

### Decyzje

| Temat           | Decyzja                                                | Uzasadnienie                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro           | **7.3.2** (zamiast „Astro 5" z PLAN.md)                | Astro 5 stoi na 5.18.2, czyli dwa majory wstecz. Cały stack deklaruje wsparcie `^7`. Szablon ma żyć latami, nie startuje z długiem migracyjnym.                                                                                                   |
| Sanity Studio   | **Osobny pakiet `studio/`**, hosting `*.sanity.studio` | Rozstrzygnięcie konfliktu PLAN.md („osadzone pod `/studio`") vs CLAUDE.md („Studio żyje w `studio/`, React nie ma prawa pojawić się w `web/`"). Wygrywa CLAUDE.md. `web/` zostaje bez Reacta i styled-components, build strony krótszy o 20–40 s. |
| `@sanity/astro` | **Nie używamy**                                        | Jego wartość to osadzanie Studio i Visual Editing. Przy osobnym Studio i czystym SSG wystarczy `@sanity/client` + `defineQuery`. Konsekwencja: brak Presentation / podglądu wersji roboczej.                                                      |
| TypeScript      | **6.0.3** (pin, nie `^`)                               | TS 7.0.2 jest latest, ale nie do użycia: `@astrojs/check` deklaruje peer `^5 \|\| ^6`, `typescript-eslint` `>=4.8.4 <6.1.0`. Sufit to TS 6.                                                                                                       |
| Zakres          | **Bez bloga, bez i18n, bez podglądu wersji roboczej**  | Czysta wizytówka, jeden język (pl). Podporządkowane celowi „wdrożenie w 8 h".                                                                                                                                                                     |
| Formularz       | **Resend przez Cloudflare Pages Function**             | Jedno API, darmowy tier 3000 maili/mies., bez konfigurowania SMTP per klient. Wymaga weryfikacji domeny (SPF/DKIM) — i tak potrzebnej przy poczcie firmowej. Szczegóły w fazie 5.                                                                 |

### Wersje zweryfikowane w npm (2026-09-12)

`astro` 7.3.2 · `@astrojs/sitemap` 3.7.4 · `@astrojs/check` 0.9.10 ·
`@sanity/client` 8.6.1 · `@sanity/image-url` 2.1.1 · `astro-portabletext` 1.0.0 ·
`tailwindcss` / `@tailwindcss/vite` 4.3.3 · `sanity` 6.13.2 · `sharp` 0.35.4 ·
`prettier` 3.9.6 · `eslint` 10.10.0 · `eslint-plugin-astro` 3.1.0 ·
`typescript-eslint` 8.70.0 · `typescript` 6.0.3.

Środowisko lokalne: Node 24.19.0, pnpm 11.21.0 — spełnia `engines` wszystkich paczek
(Astro 7 i Sanity 6 wymagają Node ≥22.12).

API potwierdzone przez rozpakowanie `astro@7.3.2` i odczyt
`dist/types/public/config.d.ts` (nie z pamięci):
`output?: 'static' | 'server'`, `trailingSlash?: 'always' | 'never' | 'ignore'`,
`build.format?: 'file' | 'directory' | 'preserve'`, `image.domains?: string[]`.
`sharp` jest `optionalDependency` Astro, nie zwykłą zależnością.

### Otwarte ryzyka, do pilnowania w kolejnych fazach

1. **Pobieranie obrazów przy buildzie** — największe zagrożenie dla kryterium
   „build < 60 s przy 50 obrazach". `astro:assets` ściąga każdy obraz z
   `cdn.sanity.io` przy każdym buildzie, cache Cloudflare Pages nie jest
   gwarantowany. Mitygacja: żądać z `@sanity/image-url` przeskalowanego WebP
   w docelowej szerokości. **Zmierzyć w fazie 3, nie na końcu.**
2. `sharp` jako `optionalDependency` bywa pomijany przez pnpm/CI — pinowany
   jawnie w `web/`.
3. Walidacja SEO failująca build wymaga własnej integracji na `astro:build:done`
   i parsowania HTML pod kątem liczby `<h1>` — jeden przebieg po `dist/`,
   nie per-strona.
4. `trailingSlash` — skłaniamy się do `'never'` + `build.format: 'file'`, żeby
   canonical zgadzał się z normalizacją URL-i Cloudflare Pages. Do uzasadnienia
   i weryfikacji w fazie 1.
5. Generowanie OG images (faza 4) wymaga nowej zależności: `satori` 0.33.4 +
   `@resvg/resvg-js` 2.6.2 albo `astro-og-canvas` 0.13.1 (peers `^5 || ^6 || ^7`,
   ciągnie `canvaskit-wasm` ~7 MB, tylko build-time). Decyzja po zgodzie.
6. Seed treści demo (faza 7) — **nie** przez `sanity dataset import`; skrypt na
   `@sanity/client` z lokalnymi plikami, ze względu na kruchość referencji do
   assetów między projektami.
7. ESLint 10 obsługuje wyłącznie flat config.
8. Na Cloudflare Pages trzeba jawnie ustawić Node ≥22.12 (`.nvmrc` +
   `NODE_VERSION`), bo domyślny obraz bywa starszy i Astro 7 się nie zbuduje.

### Do ustalenia przed treściami demo (nie blokuje fazy 1)

Branża demo: usługi lokalne / gabinet / gastronomia / kancelaria. Determinuje
treści demo, kształt sekcji `pricing` i `gallery` oraz podtyp `LocalBusiness`
w JSON-LD.

### Stan

Nic nie zakodowane — faza 0 jest fazą ustaleń. Następny krok: faza 1 (szkielet),
po Twoim „dalej".

---

## Faza 1 — Szkielet — 2026-09-12

### Co powstało

Monorepo pnpm z dwoma pakietami:

```
package.json  pnpm-workspace.yaml  .npmrc  .nvmrc  .editorconfig
.prettierrc.json  .prettierignore  eslint.config.js  .gitignore
web/     astro.config.ts  tsconfig.json  .env.example
         src/config/brand.ts
         src/styles/global.css
         src/layouts/BaseLayout.astro
         src/components/layout/{Header,Footer}.astro
         src/pages/{index,404}.astro
         public/favicon.svg
studio/  sanity.config.ts  sanity.cli.ts  tsconfig.json  .env.example
```

### Decyzje i uzasadnienia

**`trailingSlash: 'never'` + `build.format: 'directory'`.**
Bez ukośnika, bo tak samo normalizuje adresy Cloudflare Pages — canonical
zgadza się wtedy z tym, co realnie serwuje CDN, bez przekierowania po drodze.

Pierwotnie ustawiłem `format: 'file'` (zakładałem, że mapowanie 1:1 na
`dist/o-nas.html` jest czystsze). Build to obalił: przy `'file'` Astro wstawia
`.html` do `Astro.url.pathname`, więc canonical strony głównej wyszedł jako
`https://example.pl/index.html`. Ten sam błąd przeszedłby potem do sitemapy
i breadcrumbów. Przy `'directory'` sprawdzone na buildzie:
`/` → `https://example.pl/`, `/o-nas` → `https://example.pl/o-nas`.

> Do potwierdzenia na realnym deploymencie (faza 7, checklist wdrożeniowy):
> zachowanie Cloudflare Pages przy `foo/index.html` opisuję z dokumentacji,
> nie ze zmierzonego zachowania tego konkretnego projektu.

**Font przez `fonts` w `astro.config.ts`, nie przez plik w repo.**
Astro 7 ma stabilne API `fonts` + komponent `<Font>` z `astro:assets`.
`fontProviders.google()` pobiera font przy buildzie i hostuje lokalnie —
w wyjściowym HTML nie ma ani jednego requestu do Google (wydajność + RODO),
a przy nowym kliencie wystarczy zmienić nazwę rodziny w `brand.ts`.
`subsets: ['latin', 'latin-ext']` jest obowiązkowe — bez `latin-ext` nie ma
ą, ę, ł, ń, ś, ź, ż, ć. Preload obejmuje oba podzbiory, bo polski tekst sięga
po latin-ext już w pierwszym nagłówku. `display: 'swap'` zgodnie z planem.

**Most `brand.ts` → Tailwind przez `@theme inline`.**
`brand.ts` jest jedynym źródłem; `BaseLayout` wstrzykuje z niego `:root{…}`,
a `global.css` mapuje te zmienne na tokeny Tailwinda przez `@theme inline`.
Dzięki temu zmiana koloru nie wymaga dotykania CSS-u. Zweryfikowane na
buildzie: `bg-brand`, `text-ink`, `py-section`, `hover:bg-brand-dark`
i `content-container` generują się poprawnie.

**NAP zostaje w `brand.ts` tylko tymczasowo.**
Plan mówi „dane NAP firmy" w `brand.ts`, ale kryterium akceptacji mówi, że
nietechniczna osoba ma zmienić telefon w stopce w < 60 s — a to wyklucza
trzymanie go w kodzie. Od fazy 2 źródłem prawdy jest `siteSettings` w Sanity;
wartości w `brand.ts` zostają jako zapas, żeby `pnpm --filter web dev` działał,
zanim projekt Sanity w ogóle powstanie.

**TypeScript 6.0.3, `astro/tsconfigs/strict`.** Bez `baseUrl` — TS 6 zgłasza go
jako deprecated (TS5101); aliasy `~/*` działają na samym `paths`.

### Zmiany względem ustaleń fazy 0

| Paczka | Faza 0 | Faktycznie | Powód |
|---|---|---|---|
| `@eslint/js` | 9.42.0 | **10.0.1** | wersja 9.42.0 nie istnieje; linia @eslint/js podąża za ESLint 10 |
| `react` / `react-dom` / `@types/react` | 19.2.2 | **19.3.0** | `@portabletext/editor` (zależność Sanity 6) wymaga `react ^19.2.8` |
| `@types/node` | — | **24.13.4** (studio) | `sanity.cli.ts` i `sanity.config.ts` czytają `process.env`; bez tego `tsc` nie przechodzi |
| `sanity` w devDeps `web/` | tak | **nie** | niepotrzebne w fazie 1; wejdzie w fazie 2 razem z TypeGenem |

Trzy dopisane paczki to narzędzia deweloperskie o zerowej wadze w bundlu.
Nic nie przybyło po stronie klienta.

### Napotkane niespodzianki

1. **pnpm 11 używa `allowBuilds:` w `pnpm-workspace.yaml`**, nie
   `onlyBuiltDependencies` z pnpm 10 — to drugie jest czytane przez
   `pnpm config get`, ale nie odblokowuje skryptów. Odblokowany tylko `esbuild`
   (rozpakowuje natywny binarek dla Sanity CLI).
2. **`eslint-plugin-astro` 3.1.0 ma sprzeczne peer deps**: wymaga
   `eslint-plugin-jsx-a11y >=6.10.2` i `eslint >=10`, a jsx-a11y 6.10.2
   (najnowszy) deklaruje `eslint <=9`. Flat config działa; wyciszone przez
   `peerDependencyRules.allowedVersions` z komentarzem.
3. **`autoUpdates` w `sanity.cli.ts` przeniosło się do `deployment.autoUpdates`** —
   CLI ostrzegało przy starcie. Poprawione, zweryfikowane w typach
   `@sanity/cli-core`.
4. **`prettier --write .` zjadł 68 plików z `.agents/` i `.claude/`.**
   Cofnięte przez `git checkout`; te katalogi oraz `docs/` są teraz
   w `.prettierignore`, a `.agents`/`.claude`/`.sanity` w ignorach ESLinta.

### Weryfikacja

| Sprawdzenie | Wynik |
|---|---|
| `pnpm check` (astro check + tsc) | 0 errors, 0 warnings, 0 hints |
| `pnpm --filter studio check` | czysto |
| `pnpm lint` | czysto |
| `pnpm format:check` | czysto |
| `pnpm build` | 2 strony, ~0,3 s, `dist/` 161 kB |
| JS w `dist/` | **0 plików**, 0 znaczników `<script>` |
| Zewnętrzne hosty w HTML | brak (jedyny absolutny URL to canonical) |
| `<html lang="pl">`, canonical, skip-link, `<main id="tresc">` | obecne |
| Kolejność CSS skip-linka | `focus:absolute` po `not-sr-only` → pozycjonowanie działa |
| `pnpm --filter web dev` | `/` → 200, `/nie-istnieje` → 404 |
| `pnpm --filter studio dev` | startuje na :3333 bez ostrzeżeń |

**Lighthouse nie był uruchamiany** — `pnpm lh` wymaga `@lhci/cli`, który
dokładamy w fazie 6 wraz z progami w CI. Analogicznie `pnpm typegen` zacznie
działać w fazie 2, gdy powstanie schema i `web/` dostanie CLI Sanity.

### Stan

Szkielet stoi, oba serwery dev działają, build i typechecki przechodzą.
Następny krok: faza 2 (schema Sanity), po Twoim „dalej".
