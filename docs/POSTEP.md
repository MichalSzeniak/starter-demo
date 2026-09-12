# Postęp prac

## Faza 0 — Ustalenia — 2026-09-12

### Decyzje

| Temat | Decyzja | Uzasadnienie |
|---|---|---|
| Astro | **7.3.2** (zamiast „Astro 5" z PLAN.md) | Astro 5 stoi na 5.18.2, czyli dwa majory wstecz. Cały stack deklaruje wsparcie `^7`. Szablon ma żyć latami, nie startuje z długiem migracyjnym. |
| Sanity Studio | **Osobny pakiet `studio/`**, hosting `*.sanity.studio` | Rozstrzygnięcie konfliktu PLAN.md („osadzone pod `/studio`") vs CLAUDE.md („Studio żyje w `studio/`, React nie ma prawa pojawić się w `web/`"). Wygrywa CLAUDE.md. `web/` zostaje bez Reacta i styled-components, build strony krótszy o 20–40 s. |
| `@sanity/astro` | **Nie używamy** | Jego wartość to osadzanie Studio i Visual Editing. Przy osobnym Studio i czystym SSG wystarczy `@sanity/client` + `defineQuery`. Konsekwencja: brak Presentation / podglądu wersji roboczej. |
| TypeScript | **6.0.3** (pin, nie `^`) | TS 7.0.2 jest latest, ale nie do użycia: `@astrojs/check` deklaruje peer `^5 \|\| ^6`, `typescript-eslint` `>=4.8.4 <6.1.0`. Sufit to TS 6. |
| Zakres | **Bez bloga, bez i18n, bez podglądu wersji roboczej** | Czysta wizytówka, jeden język (pl). Podporządkowane celowi „wdrożenie w 8 h". |
| Formularz | **Resend przez Cloudflare Pages Function** | Jedno API, darmowy tier 3000 maili/mies., bez konfigurowania SMTP per klient. Wymaga weryfikacji domeny (SPF/DKIM) — i tak potrzebnej przy poczcie firmowej. Szczegóły w fazie 5. |

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
