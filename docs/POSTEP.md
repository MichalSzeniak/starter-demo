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

> **Domknięte po fakcie (2026-09-12).** Cloudflare uruchomił dla tego repo
> przepływ Workers, nie Pages, więc zachowanie normalizacji ustala
> `html_handling` w `wrangler.toml`, a nie domyślne reguły Pages.
>
> Moje pierwotne założenie („CDN i tak normalizuje do braku ukośnika") było
> BŁĘDNE dla tego przepływu: domyślne `html_handling = "auto-trailing-slash"`
> serwuje pliki indeksowe katalogów (`o-nas/index.html`) **z** ukośnikiem na
> końcu. Przy `build.format: 'directory'` dałoby to rozjazd — canonical
> `/o-nas`, realnie serwowane `/o-nas/`.
>
> Dlatego `wrangler.toml` ustawia jawnie `html_handling = "drop-trailing-slash"`.
> Zweryfikowane w `config-schema.json` wranglera 4.131.1 i w dokumentacji
> Cloudflare. Sam deployment nadal wymaga potwierdzenia na `*.workers.dev`.

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

---

## Faza 2 — Schema Sanity — 2026-09-12

### Co powstało

```
studio/
  sanity.config.ts      schemaTypes, structure, blokady singletonów, Vision tylko w dev
  sanity.cli.ts         konfiguracja TypeGen (sanity-typegen.json jest przestarzały)
  structure.ts          struktura panelu
  schemaTypes/
    index.ts            schemaTypes + singletonTypeNames
    documents/          siteSettings, navigation, page, redirect
    objects/            seo, imageWithAlt, richText, link, labeledLink
    sections/           hero, textImage, features, pricing, testimonials,
                        faq, gallery, cta  + index.ts z zamkniętą listą
web/src/lib/sanity/types.gen.ts   30 typów wygenerowanych z schemy
```

### Decyzje

**`imageWithAlt` jest jedynym typem obrazu w całej schemie.**
Zamiast powtarzać pole `alt` przy każdym obrazie, istnieje jeden typ i to on
niesie walidację. Zweryfikowane: `type: 'image'` występuje w źródłach dokładnie
raz — w definicji `imageWithAlt`. Siedem pól obrazu w schemie używa tego typu.

**Walidacja `alt` jest warunkowa, nie `required()`.**
`rule.required()` na polu wewnątrz opcjonalnego obrazu ryzykuje blokadę zapisu
dokumentu, w którym obrazu w ogóle nie wgrano. Zamiast tego `rule.custom()`
sprawdza `parent.asset` i zwraca błąd tylko wtedy, gdy obraz jest, a opisu nie
ma. Blokuje publikację dokładnie w tym jednym przypadku.

> Koszt: TypeGen nie widzi walidacji warunkowej, więc w wygenerowanych typach
> `alt` jest opcjonalne (`alt?: string`). Komponenty z fazy 3 i tak muszą
> obsłużyć brak wartości. Jeśli wolisz twardsze typy kosztem ryzyka blokowania
> pustych pól — powiedz, zamienię na `required()`.

**`metaTitle` i `metaDescription` są wymagane już na poziomie schemy.**
PLAN wymaga failowania buildu przy ich braku (faza 4), ale taniej jest nie
pozwolić opublikować takiej strony w ogóle. Limity 60 i 155 znaków są błędami,
nie ostrzeżeniami. Potwierdzone w wygenerowanych typach: `metaTitle: string`
i `metaDescription: string` bez znaku zapytania.

**`richText` ma celowo wąski zakres.** Akapit, H2, H3, dwie listy, pogrubienie,
kursywa i odnośnik. Brak H1 (jeden H1 na stronę pilnuje szablon), brak obrazów,
brak tabel, brak surowego HTML-a.

**„Kod analytics" zamodelowany jako wybór dostawcy, nie pole na kod.**
PLAN mówi o kodzie analytics w `siteSettings`, ale CLAUDE.md zakazuje pól typu
„surowy HTML". Zamiast tego: dostawca z listy (wyłączona / Plausible / Umami),
domena i opcjonalny adres własnej instancji. Faza 5 podłączy to do skryptu.

**Strona główna to podstrona ze slugiem `/`.** Zamiast dokładać pole
`homePage` do `siteSettings` (co wyszłoby poza listę pól z PLAN-u), walidacja
slugu dopuszcza pojedynczy ukośnik. Slugify usuwa polskie znaki.

**Singletony zabezpieczone na trzy sposoby:** stały `documentId` w strukturze,
odfiltrowanie z `schema.templates` (znika z globalnego „+") oraz usunięcie
akcji `delete`, `duplicate` i `unpublish` przez `document.actions`.

**Vision tylko w trybie deweloperskim.** Konsola GROQ nie jest dla klienta.
Zweryfikowane na produkcyjnym buildzie: config w bundlu to
`plugins:[dt({structure:sr})` — samo `structureTool`. Chunk Vision nadal trafia
do `dist/` jako martwy kod, bo import pozostaje statyczny; wtyczka nie jest
zarejestrowana.

### TypeGen

`pnpm typegen` działa od zera: `sanity schemas extract --enforce-required-fields
--force` w `studio/`, potem `sanity typegen generate` z konfiguracją w
`sanity.cli.ts` (nie w przestarzałym `sanity-typegen.json`). Typy lądują
w `web/src/lib/sanity/types.gen.ts`, dzięki czemu `web/` nadal nie zależy od
paczki `sanity`. `studio/schema.json` to artefakt pośredni — w `.gitignore`.

### Weryfikacja

| Sprawdzenie | Wynik |
|---|---|
| `sanity schemas validate` | 0 błędów, 0 ostrzeżeń |
| `pnpm --filter studio check` | czysto |
| `pnpm check` (web, z wygenerowanymi typami) | 0 errors, 0 warnings, 0 hints |
| `pnpm lint`, `pnpm format:check` | czysto |
| `pnpm build` | 2 strony, bez zmian |
| Dokumenty w schemie | redirect, page, navigation, siteSettings |
| Typy sekcji | dokładnie 8, wszystkie dozwolone w `page.sections` |
| `preview` + `icon` w każdej sekcji | 8/8 |
| Pola obrazu omijające `imageWithAlt` | brak |
| `sanity dev` | startuje bez ostrzeżeń |
| `sanity build` | przechodzi |

### Czego nie zweryfikowałem

Schema nie była uruchomiona na realnym projekcie Sanity — `SANITY_STUDIO_PROJECT_ID`
jest puste, więc Studio startuje, ale nie łączy się z datasetem. Walidacja pól
przy faktycznej publikacji dokumentu (a więc i twarde blokowanie braku `alt`)
wymaga podpiętego projektu. To do potwierdzenia przy pierwszym realnym kliencie.

### Stan

Schema zamknięta na 8 typach sekcji, struktura panelu ułożona pod klienta,
TypeGen działa. Następny krok: faza 3 (komponenty sekcji), po Twoim „dalej".

---

## Faza 3 — Komponenty sekcji — 2026-09-12

### Co powstało

```
web/src/lib/
  content.ts              jedyne wejście do treści: Sanity albo demo, memoizacja na build
  links.ts                resolveLink / hrefForSlug / anchorAttributes
  format.ts               tel:, adres, godziny („pon.–pt.”), etykiety social
  sanity/client.ts        createClient (published, useCdn: false) + bezpiecznik DEMO_CONTENT
  sanity/queries.ts       4 zapytania defineQuery z fragmentami IMAGE / LINK / RICH_TEXT / SECTIONS
  sanity/image.ts         resolveImage: URL z CDN + wymiary policzone z metadanych i kadru
  sanity/sections.ts      typy Section / SectionOf<T> / SectionContext, firstImageSectionIndex
  sanity/fixtures.ts      treści demo 1:1 z typami wyników (3 strony, wszystkie 8 sekcji)
  sanity/types.gen.ts     +4 typy wyników zapytań (pnpm typegen)
web/src/components/
  SectionRenderer.astro   switch po _type → komponent; dokłada headingLevel i priorityImage
  sections/               Hero, TextImage, Features, Pricing, Testimonials, Faq, Gallery, Cta
  portable/               RichText (wrapper), Block, Link, List, ListItem
  SanityImage.astro       jedyny sposób renderowania obrazów; Heading.astro; LinkButton.astro
  layout/Header.astro     menu z `navigation`, mobilne na <details> (zero JS)
  layout/Footer.astro     NAP, godziny, social, menu stopki z `siteSettings`/`navigation`
web/src/pages/[...slug].astro   jedna trasa; slug `/` → korzeń (index.astro usunięty)
web/public/demo/*.svg           10 placeholderów do treści demo
web/astro.config.ts             env.schema (SANITY_PROJECT_ID, SANITY_DATASET, DEMO_CONTENT)
```

Nowe zależności `web/`: `@sanity/client` 8.6.1, `@sanity/image-url` 2.1.1,
`astro-portabletext` 1.0.0 (wszystkie z listy fazy 0) oraz `groq` 6.13.2 —
to z niego pochodzi `defineQuery` (nie z `@sanity/client`), a TypeGen po nim
rozpoznaje zapytania. Był już w drzewie jako zależność przechodnia.

### Decyzje

**Treści demo i bezpiecznik.** Projektu Sanity nadal nie ma, a komponentów nie
da się zweryfikować bez danych. `fixtures.ts` ma kształt 1:1 z wynikami
zapytań (pilnują typy z TypeGen), więc komponenty nie widzą różnicy. Zasady:
`astro dev` bez `SANITY_PROJECT_ID` używa demo z ostrzeżeniem; `astro build`
bez projektu **przerywa się** z czytelnym komunikatem, chyba że jawnie
`DEMO_CONTENT=true` — żeby treści demo nie wyjechały przez pomyłkę na
produkcję klienta. Zweryfikowane: build bez zmiennych kończy się exit 1 z tym
komunikatem i zerem wygenerowanego HTML.

> **Konsekwencja dla deploymentu tego repo na Cloudflare:** do build variables
> trzeba dodać `DEMO_CONTENT=true`, inaczej build będzie się wywalał — celowo.

**Obrazy.** `SanityImage` jest jedynym sposobem renderowania obrazów:

- Z CDN prosimy o wersję już przeskalowaną do docelowej szerokości slotu
  (`fit('max')`), więc astro:assets pobiera kilkadziesiąt kB zamiast oryginału
  z aparatu — to mitygacja ryzyka nr 1 z fazy 0.
- Wymiary liczymy sami z metadanych **i kadru (`crop`)** ustawionego w Studio,
  żeby `width`/`height` w HTML zgadzały się z tym, co realnie zwróci CDN.
  Hotspot nie zmienia proporcji przy `fit('max')`, więc nie wchodzi w rachunek.
- Warianty `srcset` podajemy jawnie per slot (zwykle połowa i całość), a nie
  przez globalny `image.layout: 'constrained'` — sprawdzone w `layout.js`
  Astro: `constrained` generuje warianty dla każdego breakpointu do 2×
  szerokości, ok. 10 na obraz. Przy 50 obrazach to setki operacji sharpa.
- `priority` na `<Image>` daje dokładnie `loading="eager"`, `decoding="sync"`,
  `fetchpriority="high"` (zweryfikowane w `internal.js:106-110` i na buildzie).
  Dostaje go wyłącznie pierwszy obraz sekcji na stronie (`firstImageSectionIndex`);
  logo w nagłówku ma tylko `eager`, bez podbijania priorytetu.

**Poziomy nagłówków są sprawą szablonu, nie treści.** Pierwsza sekcja dostaje
h1, każda kolejna h2, elementy wewnątrz sekcji (punkty, pakiety, pytania) h3
lub h2. Zweryfikowane: dokładnie jeden h1 na każdej z 3 stron demo. Uwaga:
sekcja bez nagłówka na pierwszej pozycji zostawia stronę bez h1 — walidacja
buildu z fazy 4 to wyłapie; warto rozważyć regułę w schemie (poza zakresem tej fazy).

**FAQ i menu mobilne na `<details>`, bez wysp.** CLAUDE.md dopuszcza wyspy dla
obu, ale natywny `<details>/<summary>` daje accordion i rozwijane menu z zerem
JS, obsługą klawiatury i czytników ekranu. Kompromis: kliknięcie poza menu go
nie zamyka. Podmiana na wyspę to zmiana w jednym pliku. W `dist/` nadal 0 plików JS.

**Portable Text.** `astro-portabletext` 1.0.0 nazywa klucze komponentów
w liczbie pojedynczej (`block`, `mark`, `list`, `listItem`) — inaczej niż
`@portabletext/react`. Adnotacja `link` jest rozwiązywana tą samą funkcją co
menu i przyciski (`resolveLink`): wewnętrzna → ścieżka, zewnętrzna →
`rel="noopener"`, niekompletna → sam tekst bez `<a>`.

**Warstwa danych.** `content.ts` memoizuje wyniki na czas builda — ustawienia
i nawigacja są pobierane raz, nie raz na podstronę. Gdy projekt Sanity istnieje,
ale klient nie wypełnił `siteSettings`, wchodzi fallback z `brand.ts`. TypeGen
dokłada do `SITE_SETTINGS_QUERY_RESULT` wariant „wszystko null" — typ
`SiteSettings` jest zawężony do wariantu z `companyName: string`.

**`role="list"` na `ul`/`ol` zostaje.** ESLint zgłaszał redundancję, ale preflight
Tailwinda ustawia `list-style: none`, a Safari/VoiceOver gubi wtedy semantykę
listy. Reguła `no-redundant-roles` dostała wyjątek dla tej pary z komentarzem.

**Nazwy typów z TypeGen** to `SITE_SETTINGS_QUERY_RESULT` itd. (podkreślenie,
wielkie litery), nie `…QueryResult` jak w dokumentacji skilla.

### Weryfikacja

| Sprawdzenie | Wynik |
|---|---|
| `pnpm check` (web) / `pnpm --filter studio check` | 0 errors, 0 warnings, 0 hints / czysto |
| `pnpm lint`, `pnpm format:check` | czysto |
| `DEMO_CONTENT=true pnpm build` | 4 strony (`/`, `/o-nas`, `/cennik`, `/404`) w 0,6 s; `[...slug]` z `slug: undefined` daje `/index.html` |
| h1 na stronę | dokładnie 1 na każdej z 3 stron |
| `<img>` bez width/height | 0 (z 12 na 3 stronach) |
| `fetchpriority="high"` | 1 na stronę z obrazem sekcji (hero na `/`, textImage na `/o-nas`), 0 na `/cennik` |
| `<script>` / pliki `.js` w dist | 0 / 0 |
| `cdn.sanity.io` w HTML | 0 |
| Linki | `/`, `/o-nas`, `/cennik`, `tel:`, `mailto:`, social z `rel="me noopener"` |
| Godziny w stopce | `pon.–pt. 08:00–17:00 \| sob. 09:00–13:00 \| niedz. nieczynne` |
| Build bez `SANITY_PROJECT_ID` i bez `DEMO_CONTENT` | exit 1, komunikat „Brak SANITY_PROJECT_ID…”, zero HTML |
| `astro dev` bez `DEMO_CONTENT` | `/`, `/o-nas`, `/cennik` → 200, nieznany → 404 |
| Zdalny obraz przez astro:assets (host testowy, tymczasowo w `image.domains`) | pobrany przy buildzie, 3 pliki `.webp` lokalnie, `width/height` z `inferSize`, `srcset` 400w/800w, host źródłowy nieobecny w HTML, cały build 3 s |

### Czego nie zweryfikowałem

- **Realny dataset Sanity.** Wszystko chodzi na treściach demo. Zapytania GROQ
  przeszły przez TypeGen (składnia i typy), ale nie zostały wykonane przeciw
  Content Lake. Specyfika `cdn.sanity.io` (parametry `rect`, `w`, `fit`) też
  jest sprawdzona tylko przez typy `@sanity/image-url`.
- Pierwsze dwie próby testu zdalnego obrazu padły z przyczyn po stronie hosta
  (Wikimedia odrzuca requesty bez User-Agenta — HTTP 400; zgadnięta ścieżka na
  GitHubie nie istniała). Trzecia, z sondą HTTP przed buildem, przeszła.
- Tekst ostrzeżenia `[sanity] …` w `astro dev` nie został przechwycony — serwer
  dev w Astro 7 jest odłączony i loguje przez `astro dev logs`, nie na stdout
  launchera. Samo zachowanie (tryb demo) potwierdzają odpowiedzi 200.
- Lighthouse — nadal faza 6.

### Do fazy 4

- `<head>` w `BaseLayout` to nadal prowizorka; komponent `<Seo>` ma go zastąpić.
  `seo.ogImage` i `siteSettings.defaultOgImage` są już w zapytaniach, ale
  nieużywane.
- FAQ do `FAQPage` JSON-LD wymaga spłaszczenia `answer` (Portable Text) do
  tekstu — `@portabletext/toolkit` jest już w drzewie jako zależność
  `astro-portabletext`.
- `brand.ts` wciąż eksportuje `fullAddress` i `phoneHref` — od tej fazy
  nieużywane (NAP idzie z Sanity/demo z fallbackiem `settingsFromBrand`).
  Do usunięcia przy skrypcie `nowy-klient` w fazie 7 albo wcześniej na życzenie.

### Stan

Osiem sekcji renderuje się z jednego `SectionRenderer`, Portable Text ma własne
komponenty, obrazy idą przez `astro:assets` z wymiarami i priorytetem, strona
buduje się z demo bez projektu Sanity i odmawia builda produkcyjnego bez niego.
Następny krok: faza 4 (warstwa SEO), po Twoim „dalej".

---

## Faza 4 — Warstwa SEO — 2026-09-12

### Co powstało

```
web/src/components/seo/Seo.astro      title, description, canonical, robots, OG (pl_PL, 1200×630), Twitter card
web/src/components/seo/JsonLd.astro   jeden <script type="application/ld+json"> z @graph, `<` → <
web/src/lib/seo/jsonld.ts             Organization+LocalBusiness, WebSite, BreadcrumbList, FAQPage
web/src/lib/seo/site-graph.ts         węzły wspólne (memoizowane; logo przez astro:assets)
web/src/lib/seo/plain-text.ts         Portable Text → tekst (do FAQPage), bez zależności
web/src/lib/seo/og-image.ts           wybór obrazu OG: własny → domyślny → generowany
web/src/lib/seo/og.ts                 satori → SVG → sharp → PNG (tytuł, logo, nazwa, domena)
web/src/lib/seo/og-fonts.ts           TTF z Google Fonts (latin+latin-ext) z cache
web/src/pages/og/[id].png.ts          /og/<slug>.png dla każdej strony; `strona-glowna` = `/`
web/src/pages/sitemap.xml.ts          bez noindex, lastmod z _updatedAt
web/src/pages/robots.txt.ts           Allow: / + Sitemap
web/src/pages/redirects.txt.ts        z dokumentów `redirect`, kod statusu zawsze jawny
web/src/integrations/seo-guard.ts     astro:build:done — walidacja HTML (build failuje) + rename na _redirects
studio: siteSettings.geo (geopoint)   współrzędne do GeoCoordinates
queries: PAGE_INDEX_QUERY, REDIRECTS_QUERY, _updatedAt, geo
```

Nowa zależność `web/`: **satori 0.33.4** — ~11 MB unpacked razem z zależnościami
(opentype.js 3,8 MB, harfbuzzjs 1,2 MB, yoga-layout 0,2 MB), zero natywnych
binarek, wyłącznie build. Rasteryzacja przez **sharp**, który już był w drzewie
(librsvg 2.62 potwierdzony). Odrzucone: `astro-og-canvas` (canvaskit-wasm 25 MB),
`@resvg/resvg-js` (12 paczek platformowych po ~4,3 MB — zbędne przy sharpie).

### Decyzje

**Sitemap własnym endpointem, nie `@astrojs/sitemap`** (odstępstwo od litery
PLAN-u, uzgodnione). Sprawdzone w `index.d.ts` paczki: `filter?(page: string)`
dostaje wyłącznie URL, więc wykluczenie `noindex` wymagałoby kanału bocznego
(plik tymczasowy albo drugi klient Sanity w konfiguracji). Endpoint ma ~30 linii,
zero zależności i pełny dostęp do `content.ts`: `noindex` i `lastmod` wprost,
ten sam kod dla Sanity i demo.

**`_redirects` przez endpoint + rename.** Astro ignoruje trasy zaczynające się
od `_`, więc generujemy `redirects.txt`, a `seo-guard` zmienia nazwę po buildzie.
Zweryfikowane w dokumentacji Cloudflare: Workers Static Assets honoruje
`_redirects` w katalogu assetów (składnia `źródło cel kod`, 301/302/303/307/308,
limit 2 000 + 100). **Domyślny kod to 302**, dlatego zawsze wpisujemy jawnie:
301 dla trwałych, 302 dla pozostałych.

**Walidacja na wynikowym HTML, nie na danych z CMS.** `seo-guard` czyta każdy
`.html` w `dist/` i wymaga: dokładnie jednego `<h1>`, niepustego `<title>`
(≤ 60), `meta description` (≤ 155), absolutnego canonicala i absolutnego
`og:image`. To jedyne miejsce, w którym widać efekt końcowy — np. drugi h1
wstrzyknięty przez komponent, a nie przez treść. Build FAILUJE z raportem
per strona.

**Obraz OG: własny → domyślny → generowany.** Opis pola `defaultOgImage`
w Studio obiecuje „używany, gdy podstrona nie ma własnego" — honorujemy to,
więc generowanie z tytułu i logo jest opcją zerowego wysiłku, a nie nadpisuje
świadomej decyzji klienta. Obrazy z Sanity idą przez `getImage` do lokalnego
**JPG** (nie WebP — część serwisów społecznościowych nie renderuje WebP
w podglądzie linku), z `fit('crop')`, czyli z hotspotem ze Studio.

**Fonty do OG z Google Fonts, nie z fontsource.** To był najdłuższy problem
fazy. Satori nie czyta WOFF2 (jedyny format, jaki Astro pobiera dla strony).
Fontsource wystawia WOFF, ale podzielony na podzbiory, a satori — zweryfikowane
trzema eksperymentami z podglądem PNG — bierze pierwszy font o danej nazwie
i wadze i **nie sięga po drugi dla brakujących glifów**: `ł ż ę ą` renderowały
się jako tofu. `loadAdditionalAsset` jest wołany z segmentem
`łżćęśąźńĄĘŁŃŚŹŻ`, ale zwrócony font o tej samej nazwie nie jest używany;
`lang` przyjmuje tylko zamkniętą listę (CJK, indyjskie); `fontFamily` musi być
stringiem. Rozwiązanie: legacy endpoint `fonts.googleapis.com/css?family=…&subset=latin,latin-ext`
z UA `node` zwraca **jeden pełny TTF** (143 kB na wagę) — to samo źródło co
`fontProviders.google()` dla strony, więc OG i strona mają tę samą rodzinę.
Cache w `node_modules/.cache/og-fonts`. Nieznana rodzina → Inter z ostrzeżeniem.

**JSON-LD.** Jeden węzeł `@type: ['Organization', 'LocalBusiness']` —
LocalBusiness jest podtypem Organization, dwa osobne węzły dublowałyby NAP.
`openingHoursSpecification` pomija dni oznaczone „nieczynne", `vatID` = `PL` + NIP,
`addressCountry` = `PL` dla „Polska", `sameAs` z profili społecznościowych.
`BreadcrumbList` tylko na podstronach, `FAQPage` tylko gdy strona ma sekcję `faq`
(odpowiedzi spłaszczone z Portable Text). Bez `schema-dts` — cztery typy węzłów
nie uzasadniają zależności.

**Generyczny `LocalBusiness`.** Branża demo pozostaje nieustalona (pytanie z fazy 0
bez odpowiedzi), więc bez podtypu (`Dentist`, `Plumber`…). Dodanie pola
`businessType` do `siteSettings` to zmiana na 10 linii — na życzenie.

### Weryfikacja

| Sprawdzenie | Wynik |
|---|---|
| `pnpm check` / studio / lint / `format:check` | czysto |
| `DEMO_CONTENT=true pnpm build` | 4 strony w 3 s (z pobraniem fontów) |
| `seo-guard` w logu builda | `Walidacja SEO: 4 stron OK`, `redirects.txt → _redirects` |
| Walidator — 8 przypadków HTML (Node uruchamia TS natywnie) | 0 h1, 2 h1, brak opisu, canonical względny, brak og:image, title > 60, wszystko naraz — wszystkie złapane; poprawna strona przechodzi |
| **Build ze stroną o dwóch `<h1>`** (tymczasowa, osobny katalog) | exit 1, raport `tmp-bad\index.html — liczba <h1>: 2` |
| `<head>` na `/`, `/o-nas`, `/404` | title, description, canonical absolutny, `og:*` z obrazem 1200×630, `twitter:card summary_large_image`, `robots noindex` tylko na 404 |
| JSON-LD | `@graph`: Organization+LocalBusiness (logo, geo, vatID, 2× sameAs, godziny bez niedzieli, PL), WebSite (`publisher` → `#organization`), BreadcrumbList tylko na `/o-nas`, FAQPage 3 pyt. na `/` i 2 na `/o-nas`; `<` w JSON: 0 |
| `sitemap.xml` | 3 URL-e z `lastmod`, `noindex` respektowane |
| `robots.txt` | `Allow: /`, `Sitemap: https://example.com/sitemap.xml` |
| `_redirects` | `/oferta.html /cennik 301`, `/o-firmie /o-nas 301`, `/promocja / 302`; `redirects.txt` nie zostaje w `dist/` |
| OG PNG (podgląd obrazu) | 3 pliki 24–37 kB; polskie znaki poprawne po przejściu na TTF z Google; logo rasteryzowane w 2× (SVG z `density`) |
| `astro dev` | `/sitemap.xml`, `/robots.txt`, `/redirects.txt`, `/og/*.png` → 200 z właściwym `Content-Type` |
| `cdn.sanity.io` w `<head>` | 0 |

### Czego nie zweryfikowałem

- **Realny dataset Sanity** — nadal wszystko na demo. Ścieżka „własny obraz OG
  z Sanity → `getImage` → lokalny JPG" i logo w JSON-LD przez `getImage` są
  sprawdzone typami i analogiczną ścieżką z fazy 3, ale nie na CDN Sanity.
  W demo logo w JSON-LD to `/demo/logo.svg` (Google woli raster ≥ 112 px —
  przy kliencie logo pójdzie przez `getImage` do PNG).
- Rich Results Test / walidator schema.org — wymaga publicznego adresu.
  Graf jest poprawnym JSON-em i ma kształt z dokumentacji, ale nie był
  przepuszczony przez narzędzie Google.
- `_redirects` na realnym deploymencie Workers — składnia z dokumentacji,
  nie z testu na `*.workers.dev`.
- Lighthouse — faza 6. Uwaga: JSON-LD to `<script type="application/ld+json">`,
  przeglądarka go nie wykonuje; w `dist/` nadal 0 plików `.js`.

### Do fazy 5–7

- `robots.txt` nie blokuje robotów AI — decyzja właściciela strony; łatwo
  dodać `User-agent: GPTBot / Disallow: /` w endpoincie.
- Walidator nie sprawdza unikalności `metaTitle` między stronami (CLAUDE.md:
  „unikalny metaTitle") — do dodania w `seo-guard` (zbiór tytułów, ~10 linii).
- Kolizja: podstrona o slugu `strona-glowna` dałaby ten sam plik OG co `/`.
- `brand.ts` nadal eksportuje nieużywane `fullAddress` i `phoneHref`.

### Stan

Każda strona ma pełny `<head>`, JSON-LD składany warunkowo, obraz OG z tytułem
i logo generowany przy buildzie, sitemapa bez noindex, robots, `_redirects`
z CMS — a build odmawia wypuszczenia strony bez h1, tytułu, opisu, canonicala
lub og:image. Następny krok: faza 5 (formularz i analityka), po Twoim „dalej".

---

## Poza fazami — skrypt seed (2026-09-12)

`pnpm --filter studio seed` zasila dataset treściami demo z `web/src/lib/sanity/fixtures.ts`
(jedyne źródło; skrypt przekłada kształt wyników zapytań na dokumenty,
wgrywa obrazy z dysku — `studio/scripts/demo-images/` dopasowane po nazwie do slotu,
z zapasem SVG z `web/public/demo` i ostrzeżeniem, gdy pliku brak — `createOrReplace`
z deterministycznymi `_id`). Zdjęcia w `demo-images/` są wersjonowane — przed commitem `pnpm --filter studio images:optimize` (dłuższy bok ≤ 1600 px, WebP q80). Brak pliku dla slotu zatrzymuje seed przed pierwszym uploadem; placeholdery SVG tylko pod `--allow-placeholders`. `logo.svg` i `og.webp` generuje deterministycznie `pnpm --filter studio images:generate` (kod w `web/scripts/demo-images.ts`, bo tam jest satori — `studio/` nie dostało nowej zależności).
`--dry-run [--verbose]` bez sieci, `seed:clean [--yes]` sprząta dokumenty i assety
oznaczone `source.name = starter-demo-seed`. Token z `SANITY_WRITE_TOKEN` w `studio/.env`.

**Dla fazy 7:** `nowy-klient` NIE uruchamia seeda — świeży projekt klienta startuje
z pustym datasetem. Nie zweryfikowano na realnym projekcie (brak `SANITY_STUDIO_PROJECT_ID`);
sprawdzony wyłącznie dry-run i transformacja struktur.

---

## Poprawka — logo jako SVG z Sanity (2026-09-12)

Build na realnym datasecie padał: `astro:assets` odmawia rasteryzacji SVG bez
`dangerouslyProcessSVG`. **Winowajcą nie był `SanityImage.astro`** — ten
przepuszczał logo poprawnie (w `dist/` lądowały dwa pliki `.svg`, zanim build
padł). Wywracał go `site-graph.ts`, który dla `logo` w danych strukturalnych
wołał `getImage({ format: 'png' })` na wektorze.

**Rozwiązanie rozdziela dwa zastosowania obrazu:**

- **Wyświetlany wektor zostaje wektorem.** `resolveImage` wykrywa SVG po
  `mimeType` z metadanych assetu (zapasowo po rozszerzeniu adresu) i zwraca
  czysty adres oraz wymiary własne assetu — bez parametrów transformacji, bo CDN
  Sanity i tak ich dla SVG nie stosuje (sprawdzone: `?w=`/`?fit=` zwracają ten
  sam plik). `SanityImage` renderuje wtedy `<Image format="svg">`: plik trafia do
  `dist/` nietknięty, jednym plikiem zamiast dwóch identycznych wariantów srcset.
- **Gdzie raster jest wymagany, robi go CDN.** Google nie przyjmuje SVG w polu
  `logo` danych strukturalnych, a podgląd linku na Facebooku i LinkedIn nie
  renderuje SVG. Nowe `cdnRasterUrl` dokłada dla wektorów `fm=png`/`fm=jpg` —
  Sanity konwertuje po swojej stronie (sprawdzone: `?w=1200&h=630&fm=jpg` →
  `image/jpeg`), więc `astro:assets` dostaje gotowego rastra i nie dotyka SVG.

`dangerouslyProcessSVG` pozostaje wyłączone.

**Zasięg.** Każde pole obrazu w schemie jest pokryte: `logo` (nagłówek, JSON-LD,
karta OG), `defaultOgImage` i `seo.ogImage` (podgląd linku), `hero.image`,
`textImage.image`, `gallery.images[]`, `testimonials.avatar` (`SanityImage`).
Pozostałe sloty demo to WebP — nietknięte.

**Zweryfikowane na projekcie `mebrv8ha`:** build przechodzi (4 strony, 4 s);
logo w HTML to `/_astro/…svg`, 973 B, bajt w bajt jak źródło; JSON-LD dostaje
PNG 4 kB; `og:image` to JPG 1200×630; jeden plik `.svg` zamiast dwóch;
0 odwołań do `cdn.sanity.io` w HTML; 0 plików `.js`. Karta OG z fazy 4 poprawnie
rasteryzuje wektorowe logo przez sharpa (podgląd sprawdzony). Symulacja „klient
wgrywa SVG jako obraz OG" zwraca z CDN `image/jpeg`. Tryb demo bez regresji.

## Poprawki wizualne przed fazą 5 — 2026-09-13

Wszystko bez JS-u (0 plików `.js` w `dist/`, oba tryby: realny dataset i demo).

- **Sticky header** — `sticky top-0`, tło `bg-surface/80` + `backdrop-blur-md`
  tylko tam, gdzie przeglądarka obsługuje rozmycie (inaczej pełne tło).
  `scroll-padding-top: 5rem` na `html`: kotwice, „Przejdź do treści" i fokus
  z klawiatury nie lądują pod nagłówkiem.
- **FAQ** — nadal `<details>`. Wrapper `.faq-panel` z `grid-template-rows`
  0fr → 1fr. Sam trik nie wystarcza (zamknięty `<details>` nie renderuje treści,
  więc otwarcie nie ma stanu startowego) — stan podaje `@starting-style`.
  Zamykanie animuje się tylko przy `::details-content` (za `@supports`);
  gdzie indziej panel znika od razu. Całość za `prefers-reduced-motion`.
- **Fade-in sekcji** — `animation-timeline: view()` za `@supports` i
  `prefers-reduced-motion`. Pierwsza sekcja pominięta (h1 + obraz LCP). Zakres
  `entry 0% entry 12rem`, nie w %, żeby wysoka sekcja nie była półprzezroczysta
  w trakcie czytania. **Longhandy zamiast skrótu `animation`** — pipeline CSS
  (Tailwind + minifikacja Vite) sklejał skrót z `animation-timeline` w
  `animation: … view()`, którego Chrome nie przyjmuje: animacja znikała po cichu,
  bez błędu builda.
- **Galeria** — 3 kolumny, chyba że zostawiłyby w ostatnim rzędzie jedną sierotę,
  a 2 dzielą równo (4, 10, 16, 22 zdjęcia); 2 zdjęcia też w dwóch kolumnach.
  Przy 2 kolumnach srcset do 1200 px.
- **Karty features/testimonials** — bez ramki i tła (cieni nie było), akcent
  `border-l-2 border-brand`, większe odstępy między kartami.
- **Skala typograficzna** — rozmiar tytułu sekcji wynika teraz z poziomu, nie
  z typu sekcji: `<Heading variant="section">`, skala tylko w `Heading.astro`.
  h1 36/48/60 px extrabold, h2 24/30 px (desktop 2:1, było 48:36). Wcześniej h1
  był duży tylko w Hero — FAQ na górze strony miało h1 wielkości h2.

**Poprawka przy okazji (regresja ujawniona przez galerię).** `SanityImage`
wyrzucał z srcset warianty szersze od źródła zamiast je przycinać — pionowe
zdjęcie 1068 px przy `widths [600, 1200]` dostawało samo `600w`. Teraz wariant
jest przycinany do szerokości źródła (`600w, 1068w`).

**Zweryfikowane w Chrome 152 (DevTools Protocol, bez nowych zależności), 23/23:**
h1 60 px vs h2 30 px; header `top: 0` po scrollu, `blur(12px)`, tło z alfą 0,8;
pierwsza sekcja bez animacji, pozostałe z `ViewTimeline`, każda w pełni widoczna
po przewinięciu; galeria 2 kolumny × 4 zdjęcia; 5 kart: tylko lewa krawędź.
Klawiatura w FAQ: summary osiągalne Tabem, widoczny fokus, nie pod headerem;
Enter otwiera (wysokość 9 → 52 → 64 px), Spacja zamyka (52 → 12 → 0 px); fokus
zostaje na pytaniu; w zamkniętym pytaniu Tab omija link z odpowiedzi, w otwartym
wchodzi w niego, Shift+Tab wraca. `prefers-reduced-motion: reduce` → zero
animacji sekcji i `transition-duration: 0s` w FAQ. 390 px: bez poziomego scrolla.

**Niezweryfikowane:** Safari i Firefox (brak na maszynie). Tam oczekiwane:
otwieranie FAQ animowane (`@starting-style`), zamykanie natychmiastowe;
fade-in w Firefoksie nie działa (brak `view()` bez flagi) — treść jest wtedy
po prostu widoczna. Lighthouse nadal odłożony do fazy 6.

## Galeria: pole „Układ" (siatka / karuzela) — 2026-09-13

- **Schema.** Fabryka `layoutField()` w `studio/schemaTypes/fields/layout.ts`
  (radio, poziomo, `initialValue: 'grid'`). Fabryka pola, nie nowy typ schemy —
  lista ośmiu typów sekcji bez zmian, TypeGen daje `'grid' | 'carousel'`.
  Podgląd sekcji w Studio pokazuje układ („Galeria — 4 zdj. · karuzela").
- **Pole nie jest wymagane.** Galerie zapisane wcześniej nie mają wartości; wymóg
  zablokowałby publikację całej strony. Zapytanie zwraca
  `coalesce(layout, "grid")`, więc typ jest bez `null`, a stare sekcje to siatka.
- **Przygotowane dla opinii klientów, niewłączone.** Włączenie: `layoutField()`
  w `testimonials.ts`, `"layout": coalesce(layout, "grid")` w zapytaniu,
  gałąź z `<Carousel>` w `Testimonials.astro`, `layout` w seedzie.
- **`Carousel.astro`** (współdzielony) — `snap-x snap-mandatory`,
  `overflow-x-auto`, `overscroll-x-contain`. Elementy 85% / 45% / 30% szerokości,
  żeby następny wystawał (jedyna wskazówka „przewiń" bez przycisków). Kontener
  `role="region"` + `aria-label` (tytuł sekcji) + `tabindex="0"`: bez tego rzędu
  samych zdjęć nie da się przewinąć klawiaturą (axe: scrollable-region-focusable).
  W ESLint dopuszczony `tabindex` wyłącznie na `role="region"` — z komentarzem.
- **Seed i fixtures** przenoszą `layout` (demo: siatka).

**Zweryfikowane w Chrome 152** (demo z fixture tymczasowo przełączonym na
karuzelę, potem cofniętym), 1280 i 390 px: `scroll-snap-type: x mandatory`,
`scroll-snap-align: start`; rząd przewija się w bok, strona nie; region
osiągalny Tabem z widocznym fokusem; strzałki przechodzą przez wszystkie elementy
i każdy krok jest przyciągnięty (390 px: 320 → 641 → 907); leniwe obrazy
wczytują się po przewinięciu w bok; `<ul role="list">` zachowane. Realny dataset:
galeria bez pola renderuje się jako siatka 2×2, poprzednie 23 testy wizualne OK.
0 plików `.js`.

## Karuzela: przyciski i Home/End (JS za zgodą) — 2026-09-13

Zgoda właściciela na JS w karuzeli. Wyjątek od „zero JS domyślnie" dotyczy
wyłącznie `Carousel.astro`.

- **Technika:** zwykły `<script>` z własnym elementem `<site-carousel>`, nie
  wyspa `client:*` — wyspa wymagałaby frameworka (runtime), a logika to ~50 linii.
  Skrypt: 1,7 kB, 774 B gzip, wstawiony inline przez Astro.
- **Tylko tam, gdzie karuzela jest renderowana.** Astro nie dołącza skryptu
  komponentu, który się nie renderuje, mimo że `Gallery` importuje `Carousel` na
  każdej stronie. Realny dataset (galeria = siatka): 0 skryptów na wszystkich
  stronach. Demo z karuzelą: skrypt tylko na `/`.
- **Progressive enhancement:** kontrolki mają `hidden` w HTML i pokazuje je
  skrypt. Bez JS zostaje karuzela na samym scroll-snap.
- **Przyciski poprzedni/następny** przesuwają o widoczną „stronę" i zawsze
  kończą na początku pełnego elementu (liczone z pozycji elementów, nie
  `scrollBy` na ślepo). 44×44 px, etykiety „<tytuł sekcji>: poprzednie/następne".
  Na końcach `aria-disabled`, nie `disabled` — zablokowanie przycisku z fokusem
  wyrzuciłoby fokus na `<body>`. Gdy wszystko się mieści, kontrolki są ukryte
  (`ResizeObserver` na rzędzie).
- **Home/End** na sfocusowanym rzędzie — natywnie w Chrome nie działały.
- **Reduced motion:** `scrollTo` z `behavior: 'auto'` zamiast `'smooth'`.
- **Bez kropek** — pasek przewijania pokazuje pozycję; do dodania na życzenie.

**Zweryfikowane w Chrome 152, 15/15:** bez JS przyciski niewidoczne, snap
działa; start: „poprzednie" nieaktywne; 1280 px, 12 elementów: „następne"
0 → 1056 → 2112 → 3088 (strony po 3, każda przyciągnięta), na końcu nieaktywne
z fokusem nadal na przycisku, klik nic nie robi; „poprzednie" 3088 → 2112 →
1056 → 0; End/Home 3088/0; reduced motion — przesunięcie natychmiastowe;
390 px: po jednym elemencie 0 → 320 → 641 → 907, strona bez poziomego scrolla;
3 elementy mieszczące się w rzędzie → kontrolki ukryte. Regresja na realnym
datasecie: 23/23, 0 skryptów.

**Do rozważenia:** CLAUDE.md nadal mówi „Wyspa `client:visible` tylko dla menu
mobilnego i accordionu FAQ" — nie edytowałem (plik ma Twoje niezacommitowane
zmiany).

## Faza 5 — Formularz i analityka — 2026-09-13

### Decyzje

| Temat | Decyzja | Uzasadnienie |
| --- | --- | --- |
| Backend formularza | **Worker Cloudflare** (`web/worker/index.ts`, `main` w wrangler.toml), nie Pages Function | Repo wdraża się przepływem Workers (faza 1) — Pages Functions tam nie istnieją. `run_worker_first = ["/api/*"]`: Worker dostaje tylko API, resztę serwują assety. |
| E-mail | **Resend przez `fetch` do REST API**, bez SDK | Ustalone w fazie 0. Zero nowych zależności. SMTP z Workera wymagałby biblioteki socketów; Cloudflare Email Routing przejmuje MX klienta. |
| Rate limiting | **Natywny binding `[[ratelimits]]`**, dwa limitery: 5/min na IP, 20/min na stronę | Bez KV i Durable Objects. Dokumentacja odradza klucz z IP (NAT) — stąd łagodny limit IP + globalny limit strony, który chroni pulę Resend przy rotacji IP. |
| Umiejscowienie | **9. typ sekcji `contact`** | Zgoda właściciela (łamie zamkniętą listę 8 sekcji). Klient wstawia formularz na dowolną podstronę. |
| Mapa | **Karta dojazdu z linkami Google Maps URLs, bez mapy i bez iframe'a** | Zmiana względem PLAN.md („statyczny obrazek + klik → mapa"), decyzja właściciela po ustaleniach niżej. |
| Analityka | **Plausible i Umami**, wybór w Studio (schema z fazy 2) | Oba bez ciasteczek → bez baneru. Dodane brakujące pole `websiteId` — Umami identyfikuje stronę po UUID, nie po domenie. |

**Dlaczego nie mapa z podglądem** (sprawdzone w dokumentacji, nie z pamięci):
- Zasady kafelków OSMF dopuszczają „normalne przeglądanie przez człowieka" i zakazują
  pobierania z wyprzedzeniem — podgląd generowany przy każdym buildzie (bez cache na
  Cloudflare) to szara strefa.
- Google Static Maps zabrania zapisywania obrazu, a ładowanie go od Google w
  przeglądarce to zapytanie do Google przed kliknięciem.
- Maps Embed API oficjalnie wymaga klucza; wariant `maps?q=…&output=embed` jest
  nieudokumentowany.

### Co powstało

- **Studio:** `sections/contact.ts` (tytuł, lead, „Pokaż dane kontaktowe", „Pokaż dojazd");
  w Ustawieniach grupa „Formularz kontaktowy": treść zgody, klauzula informacyjna,
  link do polityki prywatności, komunikat po wysłaniu — wszystkie opcjonalne
  (wymagane zablokowałyby publikację Ustawień, np. przy zmianie telefonu).
  Adresat maili NIE jest w Studio — to sekret Workera.
- **`web/src/lib/contact-form.ts`** — jedno źródło nazw pól, limitów i walidacji
  dla HTML i Workera.
- **`web/src/lib/privacy.ts`** — puste pola w Studio = wzór zgody i klauzuli złożony
  z danych firmy (administrator, adres, NIP, e-mail).
- **`ContactForm.astro`** — działa bez JS (natywna walidacja, POST → 303 →
  `#kontakt-wyslano`, komunikat przez `:target`); JS dodaje wysyłkę bez przeładowania,
  błędy przy polach (`aria-invalid`, `aria-describedby`), region `role="status"`,
  fokus na wyniku, blokadę podwójnej wysyłki. Honeypot poza ekranem, nazwa odporna
  na autouzupełnianie. Treść zgody i czas trafiają do maila jako dowód zgody.
- **`MapCard.astro`** — „Pokaż na mapie" / „Wyznacz trasę" (Google Maps URLs,
  `api=1`, bez klucza, nowa karta). Zero JS, zero zapytań do Google ze strony.
- **`Analytics.astro`** — tylko w buildzie produkcyjnym, `defer`; Umami z
  `data-domains` = domena z brand.ts (podglądy się nie liczą). Brak ID → ostrzeżenie
  w logu builda zamiast zepsutego tagu.
- **Worker** — kolejność: Origin + rozmiar → honeypot (udaje sukces) → walidacja →
  rate limit (liczy tylko poprawne zgłoszenia) → wysyłka. Klucz limitu zawiera host,
  więc kilka stron klientów na jednym koncie nie dzieli limitów. W logach tylko statusy.
- **`wrangler.toml`**: `main`, `binding`, `run_worker_first`, dwa `[[ratelimits]]`,
  `[observability]`. Sekrety `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` — jako
  Secret, nie `[vars]`: zwykłe zmienne z panelu wrangler kasuje przy deployu
  (`keep_vars`). `.dev.vars.example` + wpis w `.gitignore`.

### Poprawki przy okazji

- **Fade-in sekcji bez `translate`.** Przesunięcie o 2rem zmieniało geometrię w chwili
  liczenia celu przewijania do kotwicy — komunikat formularza po przekierowaniu
  lądował 32 px pod sticky headerem. Zmierzone: scrollY 1056 z animacją vs 1024 bez;
  po poprawce cel na 80 px w obu trybach.
- **Ramki pól formularza w kolorze `muted`** — `border` z brand.ts ma 1,26:1, a WCAG
  1.4.11 wymaga 3:1 dla granic pól. `muted` jako kolor tekstu musi mieć ≥ 4,5:1,
  więc warunek trzyma się przy każdej poprawnej palecie klienta (dziś 7,56:1).

### Budżet JS (CLAUDE.md: 10 kB nieskompresowane)

| Skrypt | Rozmiar | Gdzie | Czego CSS nie potrafi |
| --- | --- | --- | --- |
| Karuzela (`Carousel.astro`) | 1 691 B (774 gzip) | strony z galerią-karuzelą | przyciski poprzedni/następny, Home/End |
| Formularz (`ContactForm.astro`) | 1 174 B (576 gzip) | strony z sekcją Kontakt | wysyłka bez przeładowania, zachowanie treści przy błędzie serwera |
| Plausible (zewnętrzny) | 2 841 B (1 291 gzip) | wszystkie, gdy włączony | — (analityka) |
| Umami (zewnętrzny) | nie zmierzone — `cloud.umami.is` nie rozwiązuje się z tej maszyny | wszystkie, gdy włączony | — |

Najgorszy przypadek (karuzela + formularz + Plausible): **5,7 kB / 10 kB**.
Demo: `/o-nas` 1 174 B, pozostałe strony 0 B. Realny dataset: 0 skryptów.

### Weryfikacja

- `pnpm check`, lint, format, `tsc` studio — czysto. Build realny i demo: SEO 4/4,
  0 plików `.js`.
- **Logika Workera (Node, prawdziwy moduł + atrapy bindingów), 28/28:** kształt
  żądania do Resend (`to` tablica, `reply_to`, treść zgody z czasem), 303 bez JS,
  otwarte przekierowanie (`//evil`, `https://evil` → `/`), honeypot bez maila i bez
  zużycia limitu, obcy Origin 403, walidacja 422, limit IP 5/min, inna strona klienta
  z tym samym IP nie blokowana, rotacja IP zatrzymana limitem strony, Resend 401 → 502,
  brak sekretu → 500, znaki sterujące w temacie, 405/413, multipart, logi bez PII.
- **Formularz w Chrome 152 (harness: dist + Worker), 22/22:** kolejność Taba,
  honeypot nigdy nie dostaje fokusu, klauzula z właściwym administratorem, etykiety,
  natywna blokada pustego formularza, sukces (fokus, region live, reset), błąd pola
  z serwera (`a@b`), awaria wysyłki z zapasowym telefonem, limit, podwójne kliknięcie
  = 1 mail, 0 zapytań do obcych hostów, brak iframe'a, 390 px bez poziomego scrolla,
  ścieżka bez JS (303 → `:target`, komunikat nie pod headerem).
- **`wrangler deploy --dry-run` (4.131.1 przez npx, bez dodawania zależności):**
  konfiguracja przyjęta, bindingi `CONTACT_RATE_LIMIT_IP` (5/60s),
  `CONTACT_RATE_LIMIT_SITE` (20/60s), `ASSETS`; bundel Workera 6,77 KiB.
- **`wrangler dev` (workerd):** `/o-nas/` → 307 `/o-nas`, 404 dla nieznanych ścieżek,
  wszystkie ścieżki Workera jak w harnessie, **prawdziwe API Resend** z fałszywym
  kluczem → 401 → 502, limit IP po 5 próbach.
- Analityka, 4 warianty w buildzie: Plausible chmura (domena z brand.ts), Plausible
  self-hosted, Umami chmura (`data-website-id` + `data-domains`), Umami bez ID →
  brak tagu + ostrzeżenie.

### Niezweryfikowane / do zrobienia

- **Prawdziwa wysyłka maila** — wymaga konta Resend ze zweryfikowaną domeną
  (SPF/DKIM). Do checklisty wdrożenia (faza 7).
- **Klauzula informacyjna to wzór techniczny, nie porada prawna.** Okres
  przechowywania (12 mies.) i odbiorcy (Cloudflare, Resend) do potwierdzenia u klienta.
- **Realny dataset nie ma sekcji Kontakt** — fixtures mają ją na „O nas";
  `pnpm seed` jej nie wgrał, bo nie był uruchamiany po zmianach (nie uruchamiałem
  bez pytania — nadpisuje dokumenty demo).
- Rate limiting na produkcji jest „ostatecznie spójny" i lokalny dla lokalizacji
  Cloudflare — hamulec na spam, nie precyzyjny licznik.
- Ostrzeżenie „Umami bez ID" drukuje się raz na stronę (4× w demo).
- Lighthouse — faza 6.
- **CLAUDE.md** nadal mówi „8 typów sekcji" — nie edytowałem (Twoje niezacommitowane
  zmiany). PLAN.md mówi o Pages Function i mapie z podglądem — rozbieżność opisana wyżej.

## Treść demo pokrywa całą bibliotekę sekcji — 2026-09-13

Fixtures przebudowane na trzy podstrony ułożone jak strona prawdziwej firmy
usługowej, zamiast 7 sekcji na stronie głównej:

| Podstrona | Sekcje |
| --- | --- |
| `/` | hero · features · testimonials · **gallery (siatka)** · cta |
| `/o-nas` | textImage · **gallery (karuzela)** · faq · cta |
| `/cennik` | pricing · faq · **contact** („Zapytaj o wycenę") |

- Każdy z 9 typów występuje co najmniej raz. Galeria w obu układach na tych samych
  zdjęciach (`galeria-1…4`; karuzela dodatkowo `hero`, żeby było co przewijać) —
  da się je porównać. Tylko istniejące pliki z `demo-images`, bez nowych slotów.
- Zdublowana historia firmy (textImage na głównej i na „O nas") scalona w jedną
  sekcję na „O nas". FAQ podzielone tematycznie: o firmie (`/o-nas`), o cenach
  i rozliczeniach (`/cennik`). Formularz wyceny stoi pod cennikiem, gdzie zapada decyzja.
- **Strażnik pokrycia w seedzie.** `REQUIRED_SECTION_TYPES` jest typowany
  `Record<typ sekcji z TypeGen, true>` — nowy typ sekcji wywala typecheck, dopóki
  nie trafi do listy; `preflightCoverage()` przed jakimkolwiek zapisem sprawdza, że
  fixtures faktycznie zawierają każdy typ i każdy układ galerii. Sprawdzone w obie
  strony: fixtures bez karuzeli → seed odmawia z listą braków; rekord bez `contact`
  → TS2741.
- **Seed uruchomiony** na `mebrv8ha`/`production`: 8 dokumentów, 10 obrazów
  z demo-images, 0 placeholderów.

**Zweryfikowane na realnym datasecie** (build po seedzie): wszystkie 9 typów
i oba układy galerii wyrenderowane; po jednym `<h1>` na stronę; SEO 4/4; JS tylko
tam, gdzie trzeba (karuzela na `/o-nas` — 5 zdjęć, formularz na `/cennik`,
strona główna 0 B); `FAQPage` w JSON-LD na `/o-nas` i `/cennik`; 0 odwołań do
`cdn.sanity.io`. Build demo też OK.

**Znalezione przy okazji, niepoprawione:** tło sekcji jest na sztywno w komponencie
(hero, features, testimonials, gallery → `bg-surface-alt`). Na nowej stronie głównej
cztery takie sekcje z rzędu zlewają się w jeden szary blok — zmiana kolejności tego
nie naprawi. Dotyczy każdego klienta, który ułoży te sekcje obok siebie. Propozycja:
naprzemienne tło liczone w `SectionRenderer` z pozycji sekcji (CTA zostaje w kolorze
marki) — do decyzji.

## Naprzemienne tła sekcji — 2026-09-13

Poprawka problemu z poprzedniego wpisu: cztery sekcje z tłem `bg-surface-alt`
na sztywno zlewały się na stronie głównej w jeden szary blok.

- **Tło nie należy już do komponentu ani do klienta.** `sectionTones()`
  w `sections.ts` liczy je z pozycji, SectionRenderer przekazuje w `ctx.tone`,
  każda z 9 sekcji używa `toneClass(ctx.tone)`. Sąsiednie sekcje zawsze się różnią,
  niezależnie od ułożenia strony w Studio.
- **Liczone od dołu strony.** Stopka jest szara i oddziela ją biały odstęp — ostatnia
  sekcja jest więc zawsze biała, inaczej przy stopce powstałby pas szary–biały–szary.
  CTA zawsze w kolorze marki; sekcja nad nim szara.
- **`--tone-raised`** — kolor kontrastujący z tłem sekcji dla kart w środku
  (karta dojazdu). Bez tego karta w kolorze `surface-alt` znikałaby na szarej sekcji.

Przypadki brzegowe (`sectionTones`, 8/8): trzy strony demo, stara 7-sekcyjna
strona główna, CTA w środku, dwa CTA obok siebie, jedna sekcja, pusta strona —
sąsiedzi różni, ostatnia sekcja nie szara, CTA zawsze w kolorze marki.

**Zweryfikowane w Chrome na realnym datasecie:** na każdej z 3 stron sąsiednie
sekcje mają różne tło i ostatnia różni się od stopki; najsłabszy kontrast tekstu
5,3:1 (CTA, `text-white/85` z nałożoną alfą); karta dojazdu odcina się od sekcji.
Regresja: formularz 22/22 (`/cennik`), karuzela 15/15 (`/o-nas`, 5 zdjęć),
poprawki wizualne 20/20 (sticky header, fade-in, FAQ z klawiatury, reduced motion).
Build realny i demo, 0 plików `.js`.

## Poprawki po fazie 5: tła z danych, karuzela demo, podpisy w galerii — 2026-09-13

### 1. Pole „Tło" w każdej sekcji

Uzgodniony wariant: **automat zostaje domyślny, ręczny wybór go nadpisuje**
(zamiast samych wartości ręcznych z domyślnym `default`). Przy samych ręcznych
wartościach każda nowo dodana sekcja byłaby „default", więc dwie nowe sekcje
z rzędu zlewałyby się jak dawniej, tyle że na biało. Do tego zmiana kolejności
w Studio rozbijałaby rytm, a wdrożeniowiec musiałby ustawiać tła na każdej stronie.

- **Schema.** Fabryka `backgroundField()` w `studio/schemaTypes/fields/background.ts`
  (jak `layoutField`, bez nowego typu). Wartości: Automatyczne (`auto`, domyślne) /
  Podstawowe (`default`) / Alternatywne (`alt`), a w CTA dodatkowo Kolor marki
  (`accent`). Pole niewymagane; zapytanie zwraca `coalesce(background, "auto")`.
- **`accent` tylko w CTA.** Pozostałe sekcje mają ciemny tekst, przyciski `bg-brand`
  i akcenty `border-brand` — na tle marki straciłyby kontrast, a ten zależy od
  palety klienta. Blokuje to już TypeGen: `accent` istnieje wyłącznie w typie CTA.
  CTA obsługuje za to jasne tła (nagłówek `text-ink`, lead `text-muted`, przycisk
  główny) — wcześniej miał biały tekst na sztywno.
- **Renderer, nie komponent.** `sectionBackgrounds()` rozstrzyga „auto",
  `backgroundClass()` daje klasy, SectionRenderer przekazuje je w `ctx.backgroundClass`.
  Komponenty sekcji nie importują już niczego związanego z tłem.
- **Automat działa na ciągach** sekcji „auto" między sekcjami o ustalonym tle: ciąg
  idzie naprzemiennie, jego dół różni się od sekcji poniżej, a gdy góra powtarzałaby
  ręczne tło sąsiada, cały ciąg się odwraca (jeśli pod nim jest kolor marki albo stopka).
  Pierwsza wersja szła sekcja po sekcji i test złapał kolizję
  `[alt ręcznie, auto, auto] → alt alt default`; teraz `alt default alt`.
  Kolizja zostaje tylko wtedy, gdy ręczne tła z obu stron wykluczają każdy układ.
- **Fixtures:** rytm ustawiony ręcznie (`/`: default · alt · default · alt · accent;
  `/o-nas`: default · alt · default · accent; `/cennik`: default · alt · default).
  Seed przenosi `background`.

### 2. Karuzela demo: 10 kafelków

`/o-nas`: 5 → 10 elementów przez **powtórzenie slotów w fixtures**, bez kopiowania
plików w `demo-images/`. Seed deduplikuje uploady po slocie, a Sanity nadaje assetom
id z hasza, więc kopie `.webp` dałyby w gicie ~1 MB identycznych binarek przy tym
samym efekcie. Kolejność: to samo zdjęcie nigdy obok siebie. Dry-run: nadal
10 unikalnych plików, 0 placeholderów.

### 3. Galeria: tytuł i opis przy każdym zdjęciu

- **Schema.** `images[]` (`imageWithAlt`) → `items[]` z obiektem `galleryItem`:
  `image` (`imageWithAlt`, wymagane — więc `alt` nadal wymagany i osobny),
  `title` (≤ 80, opcjonalny), `description` (≤ 160, opcjonalny). Obiekt zdefiniowany
  w tablicy, nie jako nowy typ schemy. Podgląd elementu w Studio: tytuł, a gdy go
  brak — alt.
- **Układ: podpis pod zdjęciem** (`<figure>` + `<figcaption>`), uzgodniony.
  Nakładka na hover nie działa na dotyku i ukrywa treść do czasu interakcji. Stała
  nakładka na zdjęciu ma kontrast zależny od zdjęcia (którego nie kontrolujemy)
  i zasłania kadr. Podpis pod spodem wygląda tak samo na myszy, dotyku, klawiaturze
  i w czytniku ekranu, a do tego zero JS. Tytuł to nagłówek o poziom niżej od tytułu
  sekcji (jak w Features) — nawigacja po nagłówkach przechodzi przez realizacje.
  Element bez podpisu nie dostaje pustego `<figcaption>`.
- **Siatka: `gap-y-10`** zamiast `gap-4`. Na zrzucie z 16 px podpis stał prawie
  w równej odległości od swojego zdjęcia (12 px) i od zdjęcia z rzędu niżej —
  nie było widać, do którego należy.
- **Fixtures:** 4 realizacje na `/` z tytułem i opisem; w karuzeli 6 z 10 z podpisem
  (część bez opisu, część bez niczego — pokazuje, że pola są opcjonalne).

> **Zmiana łamiąca dla zapisanych danych.** Galerie zapisane w starym kształcie
> (`images`) renderują się bez zdjęć, a Studio pokaże „nieznane pole". Dziś dotyczy
> to wyłącznie datasetu demo `mebrv8ha` (sprawdzone: build przechodzi, SEO 4/4,
> galerie puste) — naprawia to `pnpm --filter studio seed`. **Seed nie uruchomiony**
> (nadpisuje dokumenty demo — czeka na zgodę). Klientów z danymi jeszcze nie ma,
> więc migracja (deprecation pattern z `sanity-best-practices`) byłaby pracą na zapas.

### Budżet JS

Bez zmian: karuzela 1 691 B (tylko strony z karuzelą), formularz 1 174 B. Najgorszy
przypadek nadal 5,7 kB / 10 kB. Podpisy i tła — czysty HTML/CSS.

### Weryfikacja

- `pnpm check`, `pnpm --filter studio check`, `pnpm lint`, `prettier --check` — czysto;
  `sanity schema validate` — 0 błędów, 0 ostrzeżeń; `pnpm typegen` — `accent` tylko w CTA.
- `sectionBackgrounds`, 17/17 (skrypt jednorazowy, poza repo): wszystko auto (dawne
  wyniki bez zmian), strony demo, 7 sekcji, CTA w środku, dwa CTA obok, jedna/zero
  sekcji, ręczne w środku, ręczne na górze (odwrócenie ciągu), CTA ręcznie na jasnym
  tle, nieunikniona kolizja.
- Build demo: SEO 4/4, 0 plików `.js`, tła w HTML zgodne z fixtures, 0 `<img>` bez `alt`,
  0 odwołań do `cdn.sanity.io`. Build na realnym datasecie: SEO 4/4 (galerie puste — patrz wyżej).
- **Chrome 152 (CDP, bez zależności), 35/35:** na 3 stronach sąsiednie sekcje różnią
  się tłem, ostatnia różni się od stopki; CTA — biały nagłówek na kolorze marki.
  Siatka: 4 podpisy widoczne bez interakcji, podpis 12 px pod zdjęciem, tytuł `h3`,
  alt ≠ tytuł; 390 px — podpisy widoczne, bez poziomego scrolla. Karuzela 1280 px:
  10 kafelków, „następne" 0 → 1056 → 2112 → 2384 (koniec, ostatni kafelek w całości,
  przycisk nieaktywny, klik nic nie robi), „poprzednie" 2384 → 1408 → 352 → 0;
  390 px: po jednym kafelku do 2829 i z powrotem do 0.
  Uwaga do harnessu: zrzut z `captureBeyondViewport` zmienia na chwilę viewport
  i przesuwa karuzelę — pierwszy przebieg pokazał fałszywy skok „poprzednie" do 0.

### Niezweryfikowane

- CTA na jasnym tle w przeglądarce — demo ma oba CTA na kolorze marki; klasy są te
  same co w innych sekcjach (`text-ink`, `text-muted`, przycisk główny).
- Studio z nowym polem i podpisami — schema się waliduje i buduje typy, ale edycja
  w Studio nie była klikana.
- Na telefonie w karuzeli kafelki bez podpisu mają pod zdjęciem pustą przestrzeń
  (rząd ma wysokość najwyższego elementu) — przyciski nie skaczą przy przewijaniu;
  do zmiany na życzenie.
- Przy okazji zauważone, niepoprawiane: w nagłówku na 390 px numer telefonu łamie się
  w przycisku na dwie linie.

## Faza 6 — Automatyzacja — 2026-09-13

### Co powstało

```
web/src/integrations/link-guard.ts   build failuje przy martwych linkach wewnętrznych
lighthouserc.desktop.json            progi: 100/100/100/100
lighthouserc.mobile.json             progi: perf ≥ 90, reszta 100
scripts/lighthouse.ts                `pnpm lh` — ten sam skrypt lokalnie i w CI
.github/workflows/ci.yml             typy, lint, format, build, Lighthouse, raporty jako artefakt
.github/workflows/backup.yml         03:00 Europe/Warsaw: dzienny --raw, w niedzielę pełny → rsync na VPS
web/worker/rebuild.ts                POST /api/przebuduj: podpis Sanity → Durable Object → deploy hook
wrangler.toml                        binding REBUILD_DEBOUNCE + [[migrations]] new_sqlite_classes
```

Nowa zależność (uzgodniona): **`@lhci/cli` 0.15.1** w devDependencies roota — pinuje
lighthouse 12.6.1; ~331 paczek, ~147 MB w `node_modules`, 0 B po stronie klienta.

### Decyzje

| Temat | Decyzja | Uzasadnienie |
| --- | --- | --- |
| Próg mobile perf | **≥ 90** (uzgodnione) | PLAN.md i „Definicja gotowego" w CLAUDE.md mówią 95, nowsza reguła w CLAUDE.md — 90. Runnery GitHuba są wolniejsze i głośniejsze niż lokalna maszyna. |
| Agregacja przebiegów | domyślna lhci (`optimistic`, 3 przebiegi) | Szum pomiaru zaniża wynik, nie zawyża — najlepszy z 3 to realna zdolność strony. Kategorie poza wydajnością są deterministyczne. |
| Martwe linki | **tylko wewnętrzne**, na wynikowym HTML | Zewnętrzne zależą od sieci i cudzych serwerów — build failowałby losowo. Sprawdzane: `href`/`src`/`srcset`, `og:image`, absolutne adresy własnej domeny (canonical), kotwice względem `id` na stronie docelowej, cele `_redirects`, ukośnik na końcu (przy `trailingSlash: 'never'` to przekierowanie). `/api/*` pomijane (Worker). |
| Backup dzienny | **`--raw` zamiast `--no-assets`** (uzgodnione) | `--no-assets` usuwa z dokumentów wszystkie referencje do obrazów (`AssetHandler.stripAssets` w @sanity/export 6.2.1). Zmierzone na `mebrv8ha`: `--raw` 12 kB, 15/15 referencji; `--no-assets` 4 kB, **0/15**; pełny 684 kB, 15/15 + 8 plików. |
| Harmonogram | `cron: '0 3 * * *'` + `timezone: Europe/Warsaw` | GitHub obsługuje strefy w `schedule` od marca 2026 — bez ręcznego przeliczania CET/CEST. Niedziela liczona w strefie Warszawy. |
| Debounce | **Durable Object w istniejącym Workerze** (uzgodnione) | Deploy hook Workers Builds scala żądania tylko, gdy build czeka w kolejce. Reguła: build 3 min po ostatniej publikacji, najpóźniej 15 min po pierwszej. Alarm DO nadpisywany przy każdej publikacji = cały debounce. |
| Składnia DO | `[[migrations]]` + `new_sqlite_classes` | Nowsza `exports` jest w wranglerze 4.131.1 oznaczona jako eksperymentalna. Plan Free obsługuje tylko DO na SQLite. |
| Podpis webhooka | HMAC-SHA256 w Web Crypto, bez `@sanity/webhook` | Format przepisany z @sanity/webhook 4.0.4 i sprawdzony względem jego `encodeSignatureHeader`. Porównanie w stałym czasie. Bez okna czasowego na znacznik — ponowienia z Sanity mogą nieść pierwotny, a powtórka i tak przechodzi przez debounce. |
| Rotacja backupów | **po stronie VPS**, nie w workflow | Klucz trzymany w GitHubie nie powinien móc kasować. Zalecane `rrsync -wo` w `authorized_keys`. |

### Konfiguracja per klient (do checklisty fazy 7)

**GitHub → Settings → Secrets and variables → Actions**

- Variables: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `BACKUP_ENABLED=true`, `VPS_BACKUP_DIR`,
  `VPS_PORT` (opcjonalnie). W repo startera dodatkowo `DEMO_CONTENT=true`.
- Secrets: `SANITY_BACKUP_TOKEN` (rola Viewer), `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`,
  `VPS_KNOWN_HOSTS` (`ssh-keyscan -p <port> <host>`).
- **Settings → Rules → Rulesets** dla `main`: „Require status checks to pass" → `CI / jakosc`.
  Bez tego workflow failuje, ale GitHub nie blokuje merge'a.

**VPS** — klucz tylko do zapisu w katalogu backupów:

```
# ~/.ssh/authorized_keys użytkownika backupu
command="rrsync -wo /srv/backup/sanity",restrict ssh-ed25519 AAAA… github-backup
# wtedy VPS_BACKUP_DIR zostaje puste

# cron na VPS: rotacja
15 5 * * * find /srv/backup/sanity -name '*-dzienny.tar.gz' -mtime +30 -delete
20 5 * * * find /srv/backup/sanity -name '*-pelny.tar.gz' -mtime +180 -delete
```

**Cloudflare → Worker → Settings**: Builds → Deploy Hooks → utwórz dla `main`; w Variables
and Secrets jako Secret: `DEPLOY_HOOK_URL`, `SANITY_WEBHOOK_SECRET`.

**sanity.io/manage → API → Webhooks**: URL `https://<domena>/api/przebuduj`, dataset
`production`, trigger: Create / Update / Delete, filtr
`!(_type in ["sanity.imageAsset", "sanity.fileAsset"])`, projekcja `{_id, _type}`,
metoda POST, bez „Trigger on drafts", sekret = `SANITY_WEBHOOK_SECRET`.

**Przywracanie**: `sanity dataset import <plik> <dataset>` w `studio/`. Backup dzienny
wyłącznie do tego samego projektu (odwołuje się do plików, które w nim leżą).

### Budżet JS klienckiego

Bez zmian — cała faza to build, CI i Worker po stronie serwera. Najgorszy przypadek
nadal 5,7 kB / 10 kB.

### Weryfikacja

- `pnpm check`, `pnpm --filter studio check`, `pnpm lint`, `pnpm format:check` — czysto.
  `scripts/lighthouse.ts` — `tsc --strict` czysto.
- **link-guard:** build demo i realny — 117 linków na 4 stronach, 0 martwych. Logika 23/23
  (poprawne: podstrony, kotwice, OG z własnej domeny, `tel:`/`mailto:`, zewnętrzne, `/api/*`,
  źródła `_redirects` z `*`; błędne: brak strony, ukośnik na końcu, brak kotwicy na stronie
  docelowej i na bieżącej, brakujący plik, złe kodowanie, przekierowanie w nicość).
  **Build z tymczasową stroną z 3 martwymi linkami: exit 1** z raportem per strona.
- **Lighthouse lokalnie (demo):** desktop 100 perf / 100 a11y / 100 SEO na 3 stronach;
  mobile perf 96–99, SEO 100.
- **actionlint 1.7.12** (binarka w scratchpadzie, nie w repo): oba workflowy czyste.
- **Eksport Sanity** na `mebrv8ha` wszystkimi trzema trybami (tabela wyżej); `gzip -t` OK.
  Token z uprawnieniem odczytu, zmienna `SANITY_AUTH_TOKEN` potwierdzona w `@sanity/cli-core`.
- **Worker `rebuild.ts`, Node, 27/27:** podpis zgodny z `@sanity/webhook` (także 50 losowych
  treści z UTF-8), odrzucenie złego sekretu / treści / znacznika / nagłówka; debounce 3 min,
  sufit 15 min przy 15 publikacjach co 70 s; alarm → dokładnie 1 wywołanie hooka, seria
  zamknięta, nowa liczona od zera; błąd hooka → wyjątek (ponowienie przez Cloudflare);
  401 / 405 / 413 / 500 bez sekretów; formularz i assety bez zmian.
- **`wrangler deploy --dry-run` 4.131.1:** bindingi `REBUILD_DEBOUNCE` (Durable Object),
  2× Rate Limit, `ASSETS`.
- **E2E w `wrangler dev` (workerd, prawdziwy Durable Object z alarmem, atrapa deploy hooka,
  stałe produkcyjne), 9/9:** zły podpis 401, GET 405; trzy publikacje co 45 s → 202; po 3 min
  20 s od pierwszej **0 buildów** (debounce przesunął); **dokładnie 1 wywołanie hooka, 180 s po
  ostatniej publikacji**; kolejna publikacja otwiera nową serię; assety i formularz bez zmian.

### Znalezione problemy — do decyzji

1. **CI obleje dziś Lighthouse na `/` (mobile, accessibility 96).** To realny problem strony,
   nie pomiaru: axe łapie sekcję „Dlaczego my" w trakcie fade-inu (`animation-timeline: view()`)
   — dół pierwszego ekranu jest częściowo przezroczysty, tekst #ebecef na #f5f6f8 (1,09:1).
   Na desktopie sekcja jest poza pierwszym ekranem, dlatego tam 100. Nie poprawiałem — to
   zmiana wyglądu. Opcje: animować tylko sekcje w całości poniżej pierwszego ekranu (niewykonalne
   w czystym CSS), zacząć fade-in od wyższej nieprzezroczystości (nadal poniżej progu kontrastu),
   zamienić przezroczystość na efekt nie wpływający na kolor tekstu, albo zrezygnować z fade-inu.
2. **AdGuard na tej maszynie zniekształca `pnpm lh`.** Wstrzykuje do każdej strony, także
   `localhost`, skrypt 1,7 MB z `local.adguard.org`: mobile FCP 10,9 s, perf 0,41. Skrypt blokuje
   ten host w pomiarze (perf wraca do 0,96), ale `is-on-https` nadal liczy wstrzyknięte znaczniki
   → best-practices 0,81–0,82 lokalnie. W CI problemu nie ma. Naprawa po Twojej stronie: wyjątek
   dla `localhost` w AdGuardzie (np. reguła `@@||localhost^$document`).
3. **`chrome-launcher` na Windowsie** kończy co drugi przebieg błędem EPERM przy kasowaniu profilu
   (obejście lhci łapie tylko starszy komunikat). `scripts/lighthouse.ts` na Windowsie uruchamia
   jeden Chrome sam i podaje Lighthouse port — nic nie jest kasowane w trakcie.
4. **CLAUDE.md jest niespójny**: próg mobile 90 w „Twardych regułach" i 95 w „Definicji gotowego";
   „8 typów sekcji" przy 9 (kontakt). Nie edytowałem — plik ma Twoje niezacommitowane zmiany.

### Niezweryfikowane

- **Workflowy nie były uruchomione na GitHubie** — nic nie wypchnąłem. W szczególności:
  `--no-sandbox` dla Chrome na ubuntu-24.04 (dodane zapobiegawczo), cache pnpm, `timezone`
  w harmonogramie.
- **rsync na VPS** — brak dostępu do serwera; ścieżka z `rrsync` sprawdzona tylko w dokumentacji.
- **Prawdziwy deploy hook i webhook z Sanity** — wymaga wdrożonego Workera. Lokalnie atrapa hooka.
- **Import backupu** (test odtworzenia) — tworzy dataset w projekcie, nie robiłem bez zgody.
  Pozycja „test backupu" w checkliście fazy 7.
- Harmonogramy GitHuba w repo **publicznym** wyłączają się po 60 dniach bez aktywności —
  repozytoria klientów prywatne albo okresowy commit.

### Stan

CI pilnuje typów, lintu, SEO, linków i progów Lighthouse; backup co noc; publikacja w Sanity
przebudowuje stronę raz na serię zmian. Następny krok: faza 7 (proces nowego klienta),
po Twoim „dalej".

## Faza 7 — Proces nowego klienta — 2026-09-13

### Co powstało

```
scripts/nowy-klient.ts         `pnpm nowy-klient` — interaktywny, zero zależności
docs/BRIEF.md                  formularz dla klienta, z listą „bez tego nie startuję"
docs/CHECKLIST-WDROZENIE.md    12 etapów, chronologicznie; pozycje z czasem oczekiwania oznaczone ⏳
docs/DLA-KLIENTA.md            jedna strona, 5 kroków, miejsca na 5 zrzutów
web/src/lib/sanity/fixtures.ts poprawiony komentarz (obiecywał, że nowy-klient czyści fixtures)
```

### Skrypt `pnpm nowy-klient`

Pyta: nazwa firmy → domena → kolor marki → wariant hover (Enter = wyliczony) → Sanity
project ID → nazwa projektu (Enter = z domeny). Pokazuje podsumowanie, **zapisuje dopiero
po „t"** (domyślnie „nie"). Ostrzega, gdy repo ma niezacommitowane zmiany albo `brand.ts`
wygląda na skonfigurowany.

| Plik | Zmiana |
| --- | --- |
| `web/src/config/brand.ts` | `siteUrl`, `company.name`, `colors.brand`, `colors.brandDark`; usuwa komentarz o placeholderze |
| `web/.env`, `studio/.env` | tworzy z `.env.example` albo aktualizuje klucze w istniejącym pliku — token i inne linie zostają, CRLF zachowany |
| `package.json` | `name` |
| `wrangler.toml` | `name` (tylko klucz najwyższego poziomu, nie te w `[[ratelimits]]`) |
| `web/public/demo/`, `studio/scripts/demo-images/` | usuwa |

### Decyzje

**„Czyści treści demo" = usuwa to, co wycieka do klienta, nie `fixtures.ts`.** Fixtures są
fallbackiem `astro dev` bez projektu, źródłem seeda i strażnikiem typów przy zmianie schemy —
ich usunięcie psuje `content.ts` i `pnpm check`, a każdy cherry-pick zmiany schemy ze startera
kończyłby się konfliktem. W buildzie z `SANITY_PROJECT_ID` nie trafia z nich do `dist/` ani bajt.
Realny wyciek to `web/public/demo/` — Astro kopiuje `public/` w całości, więc placeholdery
wisiałyby pod `/demo/*.svg` na domenie klienta. `demo-images/` (800 kB) nie trafia do `dist/`,
ale klientowi jest zbędne. Dataset klienta jest pusty — seed nie jest uruchamiany.
Skutek uboczny w repo klienta: `seed` bez zdjęć odmówi pracy, a dev bez projektu pokaże
teksty demo bez obrazów. Oba tryby są tam nieużywane.

**Kontrast koloru marki sprawdzany przed zapisem.** Kryterium Lighthouse accessibility 100
zależy od palety klienta, więc skrypt liczy kontrast WCAG we wszystkich miejscach, gdzie kolor
marki styka się z tekstem (sprawdzone w `web/src`): biały napis na `bg-brand`, `text-brand` na
`surface` i `surfaceAlt`, `text-white/85` na CTA. Najsłabsza para musi mieć ≥ 4,5:1. Przy
niższym kontraście skrypt proponuje ten sam odcień o obniżonej jasności (HSL), zamiast odmawiać.
Przykłady: `#f59e0b` (1,92:1) → `#915d06` (4,52:1); `#0f766e` (Tailwind teal-700, 5,47:1 na
białym, ale 4,43:1 na CTA) → `#0f746c` (4,54:1). Hover: jasność × 0,7, ręczny nie może być
jaśniejszy od koloru marki.

**Nazwa Workera w `wrangler.toml` zmieniana obowiązkowo.** Wszyscy klienci na jednym koncie
Cloudflare z nazwą `starter-wizytowka` = deploy drugiego nadpisuje pierwszego. Domyślna nazwa
z domeny (`www.kowalski-serwis.pl` → `kowalski-serwis-pl`), walidowana pod reguły nazw Workerów.

**Skrypt nie pyta o NAP ani o dataset.** Dane firmy wpisuje się w Studio (kryterium „telefon
w < 60 s"); placeholdery w `brand.ts` zostają celowo fikcyjne. Dataset: `production`, chyba że
istniejący `.env` ma inny.

**Wszystkie edycje liczone w pamięci przed zapisem.** Każda podmiana w `brand.ts` musi trafić
dokładnie raz — inny kształt pliku przerywa skrypt, zanim cokolwiek zapisze. Tak wyszedł
pierwszy błąd: fraza „NIE EDYTUJ PONIŻEJ" pada też w komentarzu na górze pliku.

**Pominięte z listy „Odłożone":** zawężanie listy sekcji per klient (lista mówi „nic nie
powstaje przed pierwszym klientem, który tego potrzebuje").

### Dokumenty

- **BRIEF** — dla klienta, bez żargonu. Bloki opisane nazwami ze Studio, limity znaków
  wzięte ze schemy (np. tytuł hero 90, atuty 2–12, cennik 1–4 pakiety, galeria 2–24). Pyta
  o pocztę i rejestratora (od tego zależy migracja DNS), prawa do zdjęć, zgody autorów opinii,
  stare adresy do przekierowań, okres przechowywania wiadomości z formularza.
- **CHECKLIST** — konfiguracja per klient z faz 5–6 zebrana w jednym miejscu, plus DNS
  (porównanie MX/TXT przed zmianą serwerów), SSL, Search Console (usługa „Domena", sitemap),
  Google Business Profile (NAP znak w znak jak w Studio), test formularza z sieci komórkowej,
  test webhooka, test backupu (odtworzenie pełnego backupu do `backup-test` i usunięcie
  datasetu), test klienta „telefon w < 60 s". Składnia `sanity datasets create/import/delete`
  sprawdzona w `--help` zainstalowanego CLI.
- **DLA-KLIENTA** — napisy przycisków (`Publish`, `Add item`, `Remove`, `Upload`,
  `Validation errors`) sprawdzone w zasobach językowych `sanity` 6.13.2 — Studio nie ma
  polskiego pakietu interfejsu, więc instrukcja podaje je po angielsku.

### Budżet JS klienckiego

Bez zmian — skrypt i dokumenty nie dotykają `web/src`. Najgorszy przypadek nadal 5,7 kB / 10 kB.

### Weryfikacja

- `pnpm check` 0/0/0, `pnpm lint`, `pnpm format:check` — czysto; skrypt `tsc --strict
  --noUncheckedIndexedAccess --erasableSyntaxOnly` czysto; build startera bez regresji (SEO 4/4,
  117 linków, 0 martwych).
- **Kopia repo z odpowiedziami z potoku:** puste i błędne odpowiedzi odrzucane z komunikatem
  i ponownym pytaniem (nazwa, kolor „zielony", project ID `AB12`, nazwa `zly_projekt`); adres
  `https://www.Kowalski-Serwis.pl/kontakt` → `https://www.kowalski-serwis.pl`; apostrof
  w nazwie → literał w podwójnych cudzysłowach (zgodnie z Prettierem); odmowa zapisu
  i przerwane wejście (EOF, exit 1) — pliki bez zmian; istniejący `studio/.env` z CRLF,
  tokenem i datasetem `staging` — CRLF, token i dataset zachowane, podsumowanie pokazuje
  „nadpisuje SANITY_STUDIO_PROJECT_ID=…"; drugi przebieg — „katalogi demo już usunięte".
- **Kopia repo po `pnpm nowy-klient` na projekcie `mebrv8ha`** (świeży `pnpm install`):
  `pnpm check` 0/0/0, `lint`, `format:check` czysto — zmieniony `brand.ts` i `package.json`
  przechodzą Prettiera bez poprawek. Build na realnym datasecie: SEO 4/4, 117 linków,
  0 martwych, `dist/` bez katalogu `demo`, 0 odwołań do `/demo/` w HTML, `--brand-color-brand:#0f746c`,
  canonical `https://serwis-testowy.pl/`.
- **Lighthouse desktop na tej kopii:** 3 strony × 3 przebiegi — performance 100,
  accessibility 100 (`color-contrast` zaliczony z kolorem wybranym przez skrypt), SEO 100.
  Best-practices 81 — jedyny oblany audyt to `is-on-https` od skryptu AdGuarda (znany problem
  z fazy 6, pkt 2), nie od strony.

### Niezweryfikowane

- **Zrzuty ekranu do DLA-KLIENTA nie istnieją.** Studio wymaga logowania do Sanity, a
  przeglądarka sterowana z tej maszyny nie ma sesji. W pliku są odnośniki `docs/img/dla-klienta-1…5.png`
  i komentarz HTML (niewidoczny po wyrenderowaniu), co dokładnie ma być na każdym zrzucie.
- **Skrypt nie był uruchomiony na tym repo.** Klasyfikator uprawnień zablokował przebieg
  kasujący katalogi demo w roboczym repo; wszystkie testy szły na kopiach w scratchpadzie.
- Ścieżki w panelach Cloudflare, Resend, Search Console i Google Business Profile — z dokumentacji
  i wiedzy, nie z klikania; nazwy menu mogą się różnić. Ustawienia buildu Workers
  (`pnpm build` / `npx wrangler deploy`) nie są nigdzie zapisane w repo — do potwierdzenia
  z konfiguracją startera w panelu.
- Wprowadzanie w terminalu (TTY) nie było testowane interaktywnie — tylko potok. Iterator linii
  `readline` działa w obu trybach, a w TTY echo robi terminal.

### Do decyzji

- **CLAUDE.md** nadal: „8 typów sekcji", próg mobile 90 vs 95, „wyspa tylko dla menu i FAQ".
- `brand.ts` nadal eksportuje nieużywane `fullAddress` i `phoneHref` (od fazy 3) — skrypt ich
  nie rusza; usunięcie to osobna zmiana.
- PLAN.md „Na koniec" (lista świadomie pominiętych rzeczy z oszacowaniem) jest w dużej mierze
  pokryta sekcją „Odłożone" poniżej.

### Stan

Nowy klient: brief → `pnpm nowy-klient` → checklista → instrukcja dla klienta. Skrypt odmawia
koloru, który złamałby dostępność, i nie zapisuje niczego bez potwierdzenia. Brakuje zrzutów
ekranu do instrukcji.

## Odłożone — do zrobienia, gdy klient zapłaci

Zasada: nic z tej listy nie powstaje przed pierwszym klientem, który tego
potrzebuje i za to płaci. Po wdrożeniu — cherry-pick do startera.

### Blog / aktualności
- dodatkowy typ dokumentu, listing z paginacją, JSON-LD Article, RSS
- 1,5–2 h do każdego wdrożenia

### Wielojęzyczność
- przebudowuje schemę (pola zlokalizowane albo osobne dokumenty),
  routing `[lang]/`, hreflang, canonical per język, sitemapa z alternatywami
- 15–25 h; najdroższa pozycja na liście

### Podgląd wersji roboczej
- wymaga Visual Editing / Presentation, trybu hybrydowego i adaptera
  Cloudflare; kłóci się z `output: 'static'`
- rezygnacja z `@sanity/astro` w fazie 3 zamknęła tę drogę — do przemyślenia od nowa

### Sekcja menu (gastro)
- lista dań: nazwa, opis, cena, alergeny, składniki
- warianty porcji, menu dnia z datą obowiązywania
- wymaga panelu dla klienta → Growth ~60 zł/mc, abonament 350–400 zł
- 6–8 h. „Zapisywanie dań do wyboru" = koszyk, osobna wycena

### Sekcja live (dane na bieżąco)
- wyspa dopytująca Sanity po stronie klienta, tylko dla wybranej sekcji
- HTML z builda jako fallback → SEO i odporność zachowane
- koszt: 10–15 kB JS na stronach z tą sekcją + ruch do API
- kiedy: menu dnia, oferty pracy, terminy
- 4–6 h

### Karuzela w opiniach
- pole `layout` w `testimonials`, mechanizm gotowy z galerii
- sens dopiero od 5–6 opinii; przy dwóch szkodzi
- ~1 h

### Konfigurator zakresu
- 5 pytań: branża, liczba podstron, czy są treści, częstotliwość zmian, kontakt
- wynik: pakiet + zawartość + termin + lista rzeczy do dostarczenia
- NIE cennik modułowy (checkboxy z cenami) — zbiera zakres, nie składa ceny
- wyspa React, ~4–6 h

### Strona ofertowa
- zbudowana na tym starterze — jednocześnie demo i test biblioteki sekcji
- jeśli własnej strony nie da się złożyć z istniejących sekcji, biblioteka jest za uboga

### Audyt cudzej strony jako narzędzie akwizycji
- skrypt: PageSpeed, brakujące meta, brak JSON-LD, wagi obrazów → raport
- cel: 10 min na audyt zamiast godziny
- skuteczniejsze niż strona ofertowa, bo idzie do konkretnej firmy

### Skrypt migracji NDJSON → .md
- awaryjne wyjście, gdy Sanity zlikwiduje free tier
- warunek wykonalności: wszystkie GROQ w jednym `queries.ts`
- 4–6 h na skrypt, potem ~15 min na klienta
- NIE pisać na zapas — koszt identyczny teraz i później

### Przejście na Payload (VPS)
- warunek: Sanity wprowadzi opłatę > 30 zł/mc na projekt, albo klient wymaga
  danych w PL, albo potrzebny portal z logowaniem
- 4–5 dni na pierwszy projekt (schema, konwersja, Portable Text → Lexical, assety)
- VPS 8 GB: 60–120 zł/mc, ~6–8 klientów na instancję
- oddaje największą przewagę: zero administracji

### Wariant bez CMS-u (treści w repo)
- zrobione 2026-11-02 — wpis „Wariant bez CMS-u" na końcu pliku
- zostało: import treści z `web/src/tresci/` do Sanity (seed czyta dziś tylko fixtures),
  gdy pierwszy klient bez panelu zechce panel
- wspólny mechanizm ze „Skryptem migracji NDJSON → .md" — oba to treści w repo

### Paczka npm zamiast kopiowania repo
- wyzwalacz: ten sam fix trzeba nanieść ręcznie w >5 repo po raz drugi
- do tego czasu: `degit` + cherry-pick, commit startera zapisany w README klienta

### Zawężanie listy sekcji per klient
- `nowy-klient` generuje skróconą tablicę `of:` w `page.ts`
- sens tylko dla klientów z panelem (mniej opcji = czytelniej)
- kod zostaje kompletny — nieużyta sekcja nie generuje ani bajtu w HTML
- faza 7

### Kropki nawigacyjne w karuzeli
- odrzucone: pasek przewijania wystarcza, przy 12+ zdjęciach kropki nieczytelne
## Poprawka z fazy 6: fade-in sekcji bez przezroczystości — 2026-09-13

**Problem.** Sekcja wystająca u dołu pierwszego ekranu (na telefonie „Dlaczego my") stała
w pośrednim stanie animacji aż do pierwszego scrolla — tekst miał kontrast 1,09:1, mobile
accessibility na `/` wynosiło 96. Realny problem czytelności, nie artefakt pomiaru.

**Odrzucony wariant: start od `opacity: 0.4`.** Policzone: tekst `muted` ma wtedy 1,89–1,93:1,
nagłówki 2,51–2,54:1. Próg WCAG 4,5:1 zaczyna się przy opacity 0,59 (ink) i 0,82 (muted) —
fade od 0,82 jest niewidoczny.

**Wdrożone: animacja samego `transform`** (`translateY(2.5rem)` → 0), opacity zawsze 1.
Przesunięcie było usunięte w fazie 5, bo psuło skok do kotwicy (cel liczony z przesunięciem,
po animacji podjeżdżał pod sticky header). Rozwiązane selektorem
`section:not(:target):not(:has(:target))` — sekcja zawierająca cel kotwicy się nie przesuwa,
a przesunięcie innych sekcji nie wpływa na jej pozycję.

**Zweryfikowane w Chrome 152 (CDP), 11/11:** opacity 1 we wszystkich sekcjach na `/`, `/o-nas`,
`/cennik` przy 390 px; animacja na sekcjach 2+, nie na pierwszej; efekt widoczny (40 px po
wejściu przesunięcie 31,6 px, 400 px dalej 0); wejście z `#kontakt-wyslano` przy 1280 i 390 px —
cel na 80 px, identycznie jak bez animacji, header kończy się na 65 px; **kontrola bez wyjątku
`:target`: cel na 40 px, pod headerem** — wyjątek jest potrzebny; kotwica ze smooth scrollem po
załadowaniu — 80 px; `prefers-reduced-motion` — zero animacji.

**Lighthouse (`pnpm lh`):** mobile accessibility **100** na 3 stronach (było 96 na `/`),
performance 96–99, SEO 100; desktop — tylko best-practices poniżej progu. Best-practices
0,81–0,82 wszędzie: jedyny oblany audyt `is-on-https` wskazuje `http://local.adguard.org/…`
(AdGuard na tej maszynie, faza 6 pkt 2). `pnpm lh` kończy się więc lokalnie exit 1 —
w CI tego problemu nie ma.

Przy okazji poprawione w CLAUDE.md (za zgodą): Astro 7 i Cloudflare Workers, 9 typów sekcji,
próg mobile 90 w „Definicji gotowego", zasada skryptów zgodna ze stanem (`<details>` bez JS,
uzgodnione skrypty karuzeli i formularza).

Budżet JS bez zmian.

## Propozycje do wyboru: font nagłówków i paleta — 2026-09-13

Nic nie wdrożone — podglądy wstrzykiwane do zbudowanego `dist/`, zrzuty w scratchpadzie sesji.

- **Font nagłówków** (Inter zostaje w treści; waga latin + latin-ext z API Google Fonts,
  zakres 600–800): Fraunces 70 kB, Bricolage Grotesque 60 kB, Instrument Serif 33 kB (tylko 400).
  Odrzucone: Syne (w h1 na desktopie „zdenerwować" wychodzi poza kolumnę pod zdjęcie),
  Unbounded (169 kB, sam latin-ext 118 kB).
- **Palety** (kontrast liczony kodem z `nowy-klient`, każda przepuszczona przez skrypt):
  zieleń `#1f6b4f`/`#164b37`/`#f0f6f2` (5,15:1), terakota `#a3401f`/`#722d16`/`#fbf3ee` (5,05:1),
  śliwka `#7b2d5c`/`#561f40`/`#f8f1f5` (6,87:1). Jaśniejsza terakota `#b4462b` odrzucona
  przez skrypt (CTA 4,39:1).
- Logo demo w Sanity to SVG z kolorem na sztywno — po zmianie palety wymaga
  `images:generate` i ponownego seeda.

## Wariant bez CMS-u — 2026-11-02

Starter umie zbudować stronę bez panelu: treści i zdjęcia klienta leżą w repo, edytuje je
deweloper. Przygotowanie startera, nie praca pod konkretnego klienta. Decyzja: trzecie źródło
treści obok `sanity` i `demo` zamiast osobnego startera — sekcje, SEO, JSON-LD, formularz
i Worker są wspólne, a poprawki dalej przenosi się jednym cherry-pickiem.

### Co powstało

- **`LOCAL_CONTENT=true`** → źródło `local` (`client.ts`). Razem z `SANITY_PROJECT_ID`
  przerywa build (prawie na pewno pomyłka przy przejściu na panel); `DEMO_CONTENT`
  ignorowane z ostrzeżeniem. `content.ts`: jedna funkcja `contentInCode()` zamiast pięciu
  gałęzi `demo`; `src/tresci/` ładowane leniwie, tylko w trybie `local`.
- **`web/src/tresci/index.ts`** — szablon: strona główna (hero, features, textImage, faq, cta)
  i kontakt, wartości celowo fikcyjne. **`web/src/tresci/obrazy/`** — 4 pliki, ok. 90 kB
  (zdjęcia z `demo-images`, logo wyrenderowane do PNG).
- **`web/src/lib/sanity/builders.ts`** — typy i helpery (akapit, lista, linki) wydzielone
  z fixtures; `demoContent` bez zmian (porównany JSON bajt w bajt). Moduł bez aliasu `~`
  i bez Vite, bo przez fixtures importuje go seed uruchamiany czystym Node'em.
- **`web/src/lib/local-images.ts`** — `await obraz('plik.webp', 'alt')` zwraca obraz
  w kształcie z Sanity; wymiary z pliku, brak pliku albo pusty `alt` przerywa build.
- **`ResolvedImage.source: 'sanity' | 'local' | 'demo'`** zamiast `remote`. Lokalne rastry
  przez `<Image>` (srcset, WebP), lokalne SVG jako `<img>`. Obraz OG z lokalnego pliku →
  JPG 1200×630. Logo w JSON-LD → PNG przez astro:assets; logo w SVG → plik SVG z ostrzeżeniem
  przy buildzie (nie ma CDN-u, który zrobiłby raster). Karta OG czyta logo z dysku.
- **`pnpm nowy-klient`** pyta „Panel Sanity — klient sam edytuje treści?". Bez panelu: bez
  project ID, `LOCAL_CONTENT=true` w `web/.env`, `studio/.env` nietknięty. Z panelem dodatkowo
  usuwa `web/src/tresci/obrazy/` (patrz niżej).
- **Checklista**: pozycje **[panel]** i odpowiedniki **[bez CMS]**. **CI**: zmienna
  `LOCAL_CONTENT`, a w repo startera osobny build wariantu bez CMS-u — brakujący plik obrazu
  wychodzi dopiero w buildzie, nie w `astro check`.

### Ustalenia z weryfikacji API (astro 7.3.2, typy w `node_modules`)

- Import `.svg` zwraca `AstroComponentFactory & ImageMetadata` (`assets/runtime.d.ts`) —
  stąd lokalne wektory jako `<img src={meta.src}>`, nie przez `<Image>`.
- `<Image>` ma osobne warianty propsów dla adresu i `ImageMetadata`; `string | ImageMetadata`
  nie przechodzi typów — w `SanityImage` źródło idzie jako unia obiektów.
- **Astro emituje oryginały obrazów z modułu importowanego dynamicznie do `dist/_astro` nawet
  wtedy, gdy nic ich nie renderuje** — sprawdzone na buildzie demo: 4 pliki z `src/tresci/obrazy`
  w `dist/`. Dlatego `nowy-klient` przy panelu usuwa ten katalog, tak jak `web/public/demo`.

### Budżet JS klienckiego

Bez zmian — 0 B. Wszystko dzieje się przy buildzie.

### Weryfikacja

- `pnpm check` 0/0/0, `pnpm --filter studio check`, `lint`, `format:check` — czysto.
- **Build `local`**: SEO 3/3, 69 linków, 0 martwych, 0 odwołań do `cdn.sanity.io`; zdjęcia
  z srcset w WebP, hero z `fetchpriority="high"`; `og:image` → JPG z `og.webp`; logo w JSON-LD → PNG.
- **Build demo** bez regresji: SEO 4/4, 122 linki, 0 martwych.
- **Lighthouse `local`** (3 przebiegi): desktop performance 100, mobile 98–99, accessibility
  i SEO 100. Best-practices 81/82 — jedyny oblany audyt to `is-on-https` od AdGuarda; build
  demo daje na tej maszynie identyczne 81 (znany problem z fazy 6).
- **`astro dev` w trybie `local`**: strona 200, zdjęcia przez `/_image` jako WebP, `/og/kontakt.png` 200.
- **`nowy-klient` na kopii repo**: bez panelu — `LOCAL_CONTENT=true`, puste project ID,
  `studio/.env` nie powstaje, `pnpm build` przechodzi od razu (SEO 3/3). Z panelem — usuwa
  `src/tresci/obrazy/`, `pnpm check` 0/0/0. Komunikaty błędów: oba źródła naraz → „wybierz
  jedno źródło treści"; brak pliku → „[treści] Brak pliku … Dostępne: (katalog pusty)".

### Niezweryfikowane

- **Build na prawdziwym projekcie Sanity po zmianie `ResolvedImage`.** Ścieżka `sanity`
  zmieniona mechanicznie (`remote` → `source`), typy ją pilnują, ale build na realnym
  datasecie nie był uruchomiony — zrobić przed pierwszym wdrożeniem z panelem.
- Nowy krok CI i Lighthouse w CI (bez AdGuarda) — nie uruchomione na GitHubie.

### Do decyzji

- `nowy-klient` wpisuje nazwę firmy tylko do `brand.ts`; w wariancie bez CMS-u stronę
  podpisuje `companyName` z `src/tresci/index.ts` — do ręcznej podmiany razem z treściami.

### Stan

Wariant bez CMS-u: `pnpm nowy-klient` → „n" → treści w `web/src/tresci/` → checklista bez
pozycji **[panel]**. Przejście na panel później wymaga importu treści do Sanity — odłożone.

## Menu z bieżącą podstroną, projekt przykładowy i wnioski — 2026-11-02

### Bieżąca podstrona w menu

`Header.astro`: link do bieżącej podstrony dostaje `aria-current="page"` — liczone przy
buildzie z `Astro.url.pathname` (ta sama normalizacja co canonical), bez JS. Desktop:
podkreślenie w kolorze marki; menu mobilne: tło `surface-alt` i kolor marki. Linki zewnętrzne
nigdy nie są aktywne. Demo: aktywny właściwy link na `/o-nas` i `/cennik` w obu menu, brak na
`/` i 404 (nie ma ich w menu głównym). Lighthouse demo: accessibility 100 wszędzie, best-practices
81/82 tylko przez `is-on-https` od AdGuarda. Budżet JS bez zmian.

### Instrukcja nowego projektu

`docs/NOWY-PROJEKT.md` — klon startera z historią, remote `starter`, prywatne repo klienta,
`nowy-klient`, treści wariantu bez CMS-u, przenoszenie poprawek cherry-pickiem. Odnośnik
w checkliście, sekcja 1. Zastępuje plan z „Paczki npm": `degit` → klon z historią.

### Projekt przykładowy `D:\dev\gabinet-demo`

Gabinet psychoterapii (osoba, adres, ceny fikcyjne; domena `psychoterapia.example.org`),
wariant bez CMS-u, tylko lokalnie — nic w Sanity ani na GitHubie. Sklonowany z lokalnego
startera (`3127ac9`), remote `starter` → GitHub. Commity: `925e758` konfiguracja z `nowy-klient`,
`243bb1d` treści, `4635d68` cherry-pick podświetlania menu ze startera (`c0bd865`) bez konfliktów.

- 4 strony: główna (hero, „Z czym możesz przyjść", pierwsze spotkanie, FAQ, CTA), o mnie,
  cennik z FAQ płatności, kontakt. Bez sekcji opinii (etyka zawodowa); opis formularza prosi,
  żeby nie podawać danych o zdrowiu (art. 9 RODO).
- Motyw: zieleń `#1f6b4f` / `#164b37`, tło sekcji `#f0f6f2`, większe zaokrąglenia. Bez logo —
  nazwa w nagłówku tekstem, OG generowane. Grafiki: 3 abstrakcje z SVG przez sharp, ok. 9 kB każda.
- Build: SEO 5/5, 130 linków, 0 martwych. Lighthouse: perf 100 desktop / 98–99 mobile,
  accessibility i SEO 100 (po poprawce poziomu śródtytułu — niżej).

### Luki startera wykryte na przykładzie

1. **Telefon w nagłówku łamie się na mobile na 4 linie** przy długiej nazwie firmy (zrzut
   z Lighthouse mobile, 412 px). Demo tego nie pokazywało — „Firma Demo (przykład)" jest krótka.
   Propozycja: na wąskim ekranie „Zadzwoń" zamiast numeru (nazwa mieści się w 2 liniach);
   alternatywa `whitespace-nowrap` (nazwa w 3–4 liniach). **Do decyzji.**
2. **Poziom śródtytułów w Portable Text nie zależy od pozycji sekcji.** `h3` w treści sekcji,
   która jest pierwsza (nagłówek h1), daje `heading-order` i accessibility 98 — w przykładzie
   poprawione treścią (`h2`), ale klient w Studio może zrobić to samo. Rozwiązanie: przesuwanie
   poziomów w `Block.astro` względem nagłówka sekcji albo walidacja w schemie.
3. **Brak sekcji „sam tekst".** Checklista wymaga podstrony „Polityka prywatności", a `textImage`
   wymaga obrazu. Dziesiąty typ sekcji wymaga zgody (CLAUDE.md).

### Do decyzji

- Luki 1–3 powyżej.
- **Strona jednostronicowa** — jako możliwość w każdym projekcie, nie osobny wariant (bez
  przełącznika — nie zmienia źródła treści). Zakres ok. 2–3 h: opcjonalne pole „Kotwica"
  w sekcjach (`id`), opcjonalna kotwica w linku wewnętrznym (`/#o-mnie`), zamykanie menu
  mobilnego po kliknięciu kotwicy (kilkadziesiąt bajtów JS — nowy skrypt), podświetlanie
  sekcji przy przewijaniu: CSS `scroll-target-group` / `:target-current` (0 kB, wsparcie
  przeglądarek niesprawdzone) albo skrypt ~1 kB albo wcale. Gotowe już: płynne przewijanie,
  `scroll-padding-top` pod sticky header, link-guard sprawdza kotwice. Uwaga SEO dla klienta:
  jeden tytuł i opis zamiast osobnych podstron.
- **Warianty animacji w CSS** wybierane w `brand.ts` („subtelna" / „wyrazista" / „bez"),
  scroll-driven animations i View Transitions między podstronami — 0 kB JS. Bez animowania
  obrazu LCP w hero (mobile perf ≥ 90).
- **JSON-LD `businessType`** (np. bardziej precyzyjny typ niż `LocalBusiness`) — ok. 10 linii,
  przydatne przy branżach typu gabinet.

### Następne kroki (kolejność)

1. `git push` startera — GitHub ma stan do `3127ac9`; podświetlanie menu (`c0bd865`) i ten wpis
   są tylko lokalnie, a klon z GitHuba ich nie dostanie.
2. Build na prawdziwym projekcie Sanity po zmianie `ResolvedImage` (pkt „Niezweryfikowane"
   we wpisie o wariancie bez CMS-u) i zielone CI na GitHubie (także pierwszy pomiar Lighthouse
   bez AdGuarda).
3. Luka 1 (telefon w nagłówku) — widoczna od razu na telefonie u każdego klienta z dłuższą nazwą.
4. Zrzuty ekranu do `DLA-KLIENTA.md` (wymagają logowania do Studio).
5. Pierwszy klient: strona ofertowa na starterze albo skrypt audytu cudzej strony („Odłożone").

## Strona jednostronicowa i animacje — 2026-11-02

Możliwość w każdym projekcie, nie osobny wariant — bez przełącznika, bo nie zmienia źródła
treści. Commity startera: `3a88b74` (kotwice), `a2bd3f4` (animacje); w `gabinet-demo`
cherry-pick bez konfliktów i przebudowa na jedną stronę (`8329dc2`).

### Strona jednostronicowa

- **Schema:** opcjonalne pole „Kotwica" w każdej z 9 sekcji (`fields/anchor.ts`: format
  `a-z0-9-`, unikalność w obrębie strony) i „Sekcja na stronie" w odnośniku wewnętrznym.
  Bez nowego typu sekcji. `pnpm typegen` → `anchor: string | null` w sekcjach i linkach;
  fixtures i szablon `src/tresci` dostały `anchor: null`, `internal(slug, anchor?)`.
- **Strona:** sekcja z kotwicą ma `id`; link → `/strona#kotwica`; kontakt bez kotwicy nadal
  `#kontakt`. Zdublowana kotwica przerywa build (Studio pilnuje unikalności, treść w kodzie
  i domyślne `kontakt` — nie). Link-guard sprawdza kotwice jak dotąd.
- **Menu:** sekcja na ekranie podświetla swój link — `scroll-target-group: auto` na liście
  i `:target-current` na linkach, 0 kB JS. Menu mobilne (`<details>`) zamyka po kliknięciu
  kotwicy skrypt 165 B, renderowany tylko gdy w menu są kotwice (demo startera: 0 B więcej).

### Animacje — `brand.motion: 'subtelny' | 'brak'`

`<html data-motion>`; wszystko w `@media (prefers-reduced-motion: no-preference)`:
wejście tekstu hero kaskadą (transform, 0,9 s), dotychczasowe wejście sekcji przy scrollu,
odsłanianie zdjęć `clip-path` (poza pierwszą sekcją — obraz LCP bez animacji), cień nagłówka
i pasek postępu 2 px przy przewijaniu (`animation-timeline: scroll(root)`), uniesienie
przycisków (`data-lift`). Bez opacity — kontrast od pierwszej klatki (patrz poprawka z fazy 6).
Minifikat sprawdzony: longhandy `animation-timeline` zachowane, `:target-current` też.

### Weryfikacja

- `pnpm check`, `studio check`, `lint`, `format:check` — czysto. Demo startera: SEO 4/4,
  122 linki, 0 martwych; Lighthouse bez zmian (perf 100 / 98–99, a11y 100), CLS 0.
- **gabinet-demo w Chrome 152 przez CDP** (skrypt w scratchpadzie sesji): animacje
  `rise-in`, `section-reveal`, `image-unveil`, `header-lift`, `scroll-progress` aktywne;
  przy `#cennik` aktywny link „Cennik"; klik „Kontakt" → sekcja 96 px od góry, nagłówek
  kończy się na 61 px; cień i pasek (60 % przy cenniku) po przewinięciu; menu mobilne
  zamknięte po kliknięciu „Cennik"; przy „ogranicz animacje" 0 animacji i `scroll-behavior: auto`.
- gabinet-demo: SEO 2/2 (strona + 404), 69 linków, 0 martwych; Lighthouse perf 100 desktop /
  98–99 mobile, a11y i SEO 100, CLS 0; JS na stronie 1,3 kB (formularz + menu 165 B).

### Niezweryfikowane

- Firefox i Safari — `:target-current` prawdopodobnie bez wsparcia (menu bez podświetlenia,
  reszta działa); nie testowane.
- Nowe pola w Studio nie były oglądane (wymaga logowania) — sprawdzone tylko `schema extract`
  i TypeGen.

### Do decyzji

- **Luka 1 jest teraz pilniejsza:** na mobile przycisk telefonu ma 96 px wysokości, nagłówek
  121 px, a `scroll-padding-top` 80 px — przy skoku do sekcji jej górny margines chowa się pod
  nagłówkiem (tytuł akurat jeszcze widać). Rekomendacja bez zmian: „Zadzwoń" zamiast numeru
  na wąskim ekranie.
- Na samej górze strony podświetla się pierwszy link menu (przeglądarka uznaje go za bieżący,
  zanim przewinie się do którejkolwiek sekcji z menu).
- CLAUDE.md, „Uzgodnione skrypty": dopisać skrypt zamykania menu przy kotwicach (165 B).

## Nagłówek przy długiej nazwie, poziomy śródtytułów — 2026-11-03

Luki 1 i 2 z wpisu o projekcie przykładowym. Commity startera: `8778eab` (nagłówek),
`3a25e2b` (śródtytuły), `ef37d97` (CLAUDE.md); w `gabinet-demo` cherry-pick bez konfliktów:
`284c3ee`, `35e074a`, `1fb73fe`. Nic nie wypchnięte.

### Luka 1 — nagłówek a `scroll-padding-top`

Decyzja: „Zadzwoń" zamiast numeru. Sam „Zadzwoń" nie wystarczył — pomiar w gabinet-demo
(„Gabinet Psychoterapii Przystań (przykład)"): 412 px → 81 px przy paddingu 80 px, 360 px →
nazwa w 4 liniach, 137 px. Bez obcinania nazwy nie da się zagwarantować wysokości nagłówka
dla dowolnej nazwy klienta; wybrano pełną nazwę i większy zapas (obcinanie do 2 linii dawało
przy 360–375 px „Gabinet Psychoterapii…").

- **Telefon:** poniżej `lg` „Zadzwoń", od `lg` numer; `whitespace-nowrap`. Granica `lg`, nie
  `sm`: przy 640 px numer bez łamania ściskał nazwę do 4 linii (137 px, gorzej niż przed zmianą —
  81 px), a „O mnie" w menu łamało się w pionie.
- **Nazwa firmy:** na telefonie `text-base/snug`, od `sm` `text-lg` z oryginalną wysokością
  linii (sprawdzone w skompilowanym CSS — `text-base/snug` nie ustawia `--tw-leading`).
- **Linki menu desktop:** `whitespace-nowrap`.
- **`scroll-padding-top`:** 7,5rem poniżej `lg` (mieści 4 linie nazwy, 113 px przy 360 px),
  5rem od `lg`. Koszt: przy krótkiej nazwie po skoku widać ok. 50 px poprzedniej sekcji więcej.

### Luka 2 — poziomy śródtytułów w Portable Text

Przesuwanie w renderowaniu, bez zmian w schemie (działa też dla treści w kodzie i istniejących
dokumentów). `RichText` dostaje `headingLevel` — nagłówek sekcji (`TextImage`) albo pytania
(`Faq`) — i liczy znacznik: „Nagłówek 2" → poziom + 1, „Nagłówek 3" → poziom + 2 tylko po
„Nagłówku 2" w tej samej treści, inaczej + 1. Wygląd dalej wynika ze stylu. Maks. `h5`
(h3 pytania + 2).

### Budżet JS klienckiego

Bez zmian — 0 B. gabinet-demo: 1339 B na stronie (formularz + menu 165 B), jak dotąd.

### Weryfikacja

- `pnpm check` 0/0/0, `lint`, `format:check` — czysto, w obu repo `check` i build.
- **Chrome 156 przez CDP** (skrypt od nowa w scratchpadzie sesji): gabinet-demo, klik każdej
  kotwicy w menu (mobile przez `<details>`), z animacjami i z „ogranicz animacje":

  | szerokość | nagłówek | linie nazwy | telefon | `scroll-padding-top` | sekcja po skoku |
  | --- | --- | --- | --- | --- | --- |
  | 360 | 113 px | 4 | Zadzwoń | 120 px | 120 px (kontakt 136) |
  | 375 | 91 px | 3 | Zadzwoń | 120 px | 120 px |
  | 412 | 69 px | 2 | Zadzwoń | 120 px | 120 px |
  | 640 / 768 | 81 px | 2 | Zadzwoń | 120 px | 120 px |
  | 1024 / 1280 | 61 px | 1 | numer | 80 px | 80 px |

  Przed zmianą (412 px): nagłówek 121 px, sekcja od 80 px — 41 px pod nagłówkiem. Bez
  przewijania w poziomie na żadnej szerokości; menu mobilne zamknięte po kliknięciu.
  Demo startera (logo): 65 px na każdej szerokości.
- **Śródtytuły** na tymczasowo zmienionych fixtures (wycofane): h3 bez h2 w sekcji h1 → `h2`;
  w sekcji h2: h3 przed h2 → `h3`, h2 → `h3`, h3 po h2 → `h4`; w odpowiedzi FAQ: h2 → `h4`,
  h3 po nim → `h5`; klasy wyglądu zgodne ze stylem. gabinet-demo: „Wykształcenie i szkolenia"
  `h3` pod `h2`, konspekt bez przeskoków.
- **Lighthouse** — starter: desktop perf/a11y/SEO 100, mobile perf 96–99, a11y i SEO 100;
  gabinet-demo: desktop 100, mobile 98, a11y i SEO 100; CLS 0 wszędzie. Best-practices 81/82
  tylko przez `is-on-https` (AdGuard).

### Ustalenie przy okazji

`web/.env` startera ma `SANITY_PROJECT_ID` i `DEMO_CONTENT=false` — lokalny `pnpm build`
startera bierze treści z **prawdziwego datasetu**, nie z fixtures. Wszystkie buildy startera
w tej sesji przeszły na nim (SEO 4/4, 117 linków, 0 martwych, 0 odwołań do `cdn.sanity.io`),
więc punkt „Build na prawdziwym projekcie Sanity po zmianie `ResolvedImage`" z wpisu
o wariancie bez CMS-u jest prawdopodobnie zamknięty — do potwierdzenia, czy ten dataset to
docelowy projekt testowy. Fixtures buduje `SANITY_PROJECT_ID= DEMO_CONTENT=true pnpm build`
(SEO 4/4, 122 linki, 0 martwych — tyle, ile we wcześniejszych wpisach o „demo").

### Niezweryfikowane

- Firefox i Safari — nagłówek mierzony tylko w Chrome (inne metryki fontu mogą zmienić
  łamanie nazwy o linię; zapas do 120 px to pokrywa przy ≤ 4 liniach).
- Nazwa łamiąca się na 5+ linii przy 360 px (ok. 55+ znaków bez logo) nadal przekroczy zapas.

### Do decyzji

- Etykiety stylów w Studio „Nagłówek 2/3" nie mówią już wprost o znaczniku — propozycja:
  „Śródtytuł" / „Śródtytuł niższego rzędu" (zmiana `title`, bez migracji danych).
- Bez zmian: na samej górze strony podświetla się pierwszy link menu.

### Następne kroki

1. `git push` startera (`8778eab`, `3a25e2b`, `ef37d97` i ten wpis są tylko lokalnie).
2. Potwierdzić, że dataset z `web/.env` startera zamyka punkt o buildzie z Sanity; zielone CI.
3. Luka 3 (sekcja „sam tekst" dla polityki prywatności) — wymaga zgody na dziesiąty typ.

## Eksport kodu i przekazanie przy rozstaniu z klientem — 2026-11-03

Commity startera: `01f5df0` (skrypt), `9b39ced` (dokumenty), `906189d` (komunikat);
w `gabinet-demo` cherry-pick skryptu bez konfliktów: `2d26ab0`, `6e76a8e`. Dokumenty
zostają w starterze, jak wcześniejsze wpisy.

### Co powstało

- **`pnpm eksport-klienta [katalog]`** (`scripts/eksport-klienta.ts`, bez zależności) — w repo
  klienta: kopia HEAD bez historii (`git clone --depth=1`, potem bez `.git`), bez narzędzi
  startera (CLAUDE.md, skille, `docs/`, `scripts/`, Lighthouse, backup, seed i zdjęcia demo,
  generator obrazów; `studio/` w wariancie bez CMS-u), z nowym README, uproszczonym CI
  i `.env.example` dla wariantu. Wariant z `web/.env`. Weryfikacja w katalogu eksportu:
  install, check (+ studio check przy panelu), lint, format, build. Wynik: repo z jednym
  commitem + `.zip`; `node_modules`/`dist` usuwane `rmSync` (`git clean -X` na Windows nie
  radzi sobie z długimi ścieżkami w `node_modules/.pnpm`). Odmawia bez remote `starter`,
  na nieczystym drzewie i do niepustego katalogu.
- **Zostaje celowo cały `web/`** — ścieżka Sanity, fixtures demo i endpoint przebudowy są
  wplecione w kod strony (6+ plików); wycinanie przy każdym kliencie to koszt i ryzyko
  bez realnej ochrony. Ochrona: licencja w umowie. Skrypt wypisuje komentarze odsyłające do
  usuniętych plików (4 w wariancie bez CMS-u, 6 z panelem) — informacyjnie.
- **`docs/PRZEKAZANIE.md`** — czyje konta od startu, co ustalić w umowie (licencja
  niewyłączna, klauzula wyjścia; nie porada prawna), checklista rozstania z kolejnością
  domena → eksport strefy DNS → przełączenie → sprzątanie, wzór maila. Checklista wdrożenia:
  domena zawsze na klienta, licencja i klauzula wyjścia w umowie. `NOWY-PROJEKT.md` odsyła
  do eksportu.

### Budżet JS klienckiego

Bez zmian — skrypt działa tylko w repo dewelopera.

### Weryfikacja

- `lint`, `format:check`, `tsc --strict` na skrypcie (typy Node pożyczone ze `studio/`) — czysto.
- **Bez CMS-u** — `pnpm eksport-klienta` na gabinet-demo: wszystkie kroki ✓ (SEO 2/2, 69 linków,
  0 martwych), 81 plików, zip ok. 200 kB, repo źródłowe nietknięte. Wcześniejszy ręczny
  eksport tego samego stanu dał `dist/` identyczny bajt w bajt z buildem repo.
- **Panel** — klon startera z remote `starter` i jego `web/.env` (prawdziwy dataset): wszystkie
  kroki ✓ z `studio check` (SEO 4/4, 117 linków), 121 plików; `studio/` bez `scripts/`,
  bez `@sanity/client` i `sharp`, `.env.example` z project ID.
- Zabezpieczenia: repo startera, nieczyste drzewo, istniejący katalog — odmowa z komunikatem.

### Niezweryfikowane

- CI z eksportu nie było uruchomione na GitHubie.
- Przeniesienie projektu Sanity między organizacjami i eksport strefy w Cloudflare —
  opisane z dokumentacji/panelu, nieprzećwiczone.
- Eksport na Linuksie/macOS (pisany i testowany na Windows; ścieżki przez `path`).

### Następne kroki

1. `git push` startera — od `8778eab` do tego wpisu wszystko tylko lokalnie.
2. Zapisy licencji i klauzuli wyjścia do sprawdzenia przez prawnika, potem do wzoru umowy.

## Oferta — pakiety, dodatki, abonament — 2026-11-03

`docs/OFERTA.md`: pakiety „Wizytówka" (jedna strona, bez panelu) i „Firma" (do 5 podstron,
panel), wspólny standard (wszystko, co starter robi sam — poza cennikiem), dodatki
z biblioteki i budowane na zamówienie (szacunki godzin z „Odłożonych"), abonament, lista
„czego nie obiecywać". Ceny i terminy jako pola do uzupełnienia — brak pomiarów czasu
wdrożenia. Decyzja zgodna z wcześniejszą notatką „Konfigurator zakresu": nie cennik modułowy.
Konsekwencja: wycinanie niekupionych modułów przy eksporcie niepotrzebne — formularz jest
w każdym pakiecie.

Do rozwiązania przed sprzedażą: podstrona „Polityka prywatności" bez zdjęcia (luka 3).

## Telefon w nagłówku jako opcja, prototyp zapytania ofertowego — 2026-11-03

### `brand.headerPhone` — domyślnie `false`

Decyzja: przycisk telefonu w nagłówku ma sens tylko tam, gdzie klienci głównie dzwonią
(awarie, rezerwacje, taksówka); u reszty dubluje telefon z hero i kontaktu i ściska nazwę firmy.
`Header.astro` pokazuje go tylko przy `brand.headerPhone: true`. Telefon w hero, kontakcie
i JSON-LD bez zmian. Commit startera `8c6e85f`, w gabinet-demo `1b70521`.

- Starter: `check` 0/0/0, `lint`, `format:check` czysto; build SEO 4/4, 113 linków, 0 martwych;
  w `<header>` 0 linków `tel:`, na stronie 2.
- gabinet-demo: SEO 2/2, 67 linków (było 69 — dwa linki z nagłówka). Chrome przez CDP,
  „ogranicz animacje”, skok do każdej kotwicy z menu:

  | szerokość | nagłówek (było) | linie nazwy (było) | `scroll-padding-top` | sekcja po skoku |
  | --- | --- | --- | --- | --- |
  | 360 / 375 / 412 | 69 px (113 / 91 / 69) | 2 (4 / 3 / 2) | 120 px | 120 px |
  | 640 | 81 px (81) | 2 | 120 px | 120 px |
  | 768 | 53 px (81) | 1 (2) | 120 px | 120 px |
  | 1024 / 1280 | 53 px (61) | 1 | 80 px | 80 px |

- **Cherry-pick do gabinet-demo:** konflikt modify/delete na `docs/NOWY-PROJEKT.md` (repo klienta
  nie ma dokumentów startera) — rozwiązany usunięciem. Wniosek: zmiany w `docs/` commitować
  osobno od kodu, wtedy cherry-pick kodu do klientów przechodzi bez konfliktów.

### Prototyp `D:\dev\zapytanie-ofertowe`

Formularz zapytania o stronę, osobne repo (nie starter — to formularz jednego „klienta”, czyli
wykonawcy). Commity `0a184a6`…`22f6872`, tylko lokalnie. 4 kroki bez JS (radio poza `<form>`
+ `:has()`), szkic strony na żywo (sekcje, kolor, stos ekranów przy kilku podstronach), dobrany
pakiet, lista „Co przygotować”; sposoby kontaktu (telefon, e-mail, formularz, adres) osobno.
Serwer w Node bez zależności zapisuje treść maila i JSON (pod `nowy-klient --z-zapytania`).
Teksty bez obietnic rozmów i szkoleń — cel: jak najmniej kontaktu z klientem.

### Do decyzji

- `scroll-padding-top` 7,5rem poniżej `lg` był liczony pod nagłówek z przyciskiem telefonu.
  Bez niego przy 360 px nagłówek ma 69 px — zapas ok. 50 px. Można go uzależnić od
  `headerPhone`, ale nazwa dłuższa niż w gabinet-demo dalej łamie się na więcej linii — wymaga
  pomiaru na nazwie ok. 55 znaków.
- Formularz kontaktowy jako wybór klienta: pole „Pokaż formularz” w sekcji „Kontakt” (obok
  „Pokaż mapę”) — rozwiązuje też eksport strony bez formularza (wariant B).
- Podgląd własnego koloru w prototypie wymaga jednej linii JS.

## Polityka prywatności generowana, lista materiałów w zapytaniu — 2026-11-03

Luka 3 dla polityki prywatności zamknięta **bez dziesiątego typu sekcji**. Commit startera
`fad0b3a` (kod) + ten wpis i dokumenty osobno; w gabinet-demo cherry-pick bez konfliktów:
`7deccf1`. Nic nie wypchnięte.

### Co powstało

- **`lib/privacy-policy.ts`** + trasa **`pages/[politykaPrywatnosci].astro`** — strona
  `/polityka-prywatnosci` składana z Ustawień: administrator (nazwa, adres, NIP, e-mail),
  formularz (ta sama klauzula co pod formularzem; własna klauzula klienta w całości),
  odwiedziny (logi Cloudflare, art. 6 ust. 1 lit. f; statystyki tylko przy włączonej
  analityce, z nazwą dostawcy; brak cookies do statystyk i reklam), linki zewnętrzne
  („Jak dojechać”, profile społecznościowe — nic nie jest osadzone), prawa, data zmiany
  (`POLICY_UPDATED`).
- Powstaje tylko, gdy klient **nie wskazał własnej podstrony** w Ustawieniach i nie ma
  podstrony o tym adresie — wtedy `getStaticPaths` zwraca pustą listę, a własna strona idzie
  przez `[...slug]`. Tytuł ≤ 60 znaków: z nazwą firmy, przy długiej nazwie sam „Polityka
  prywatności” (gabinet-demo).
- Obraz OG (`/og/polityka-prywatnosci.png`), wpis w sitemapie (`lastmod` = `POLICY_UPDATED`),
  link w stopce (pomijany, gdy klient ma go w menu stopki) i zawsze pod klauzulą formularza.
- `privacy.ts`: wzór klauzuli rozbity na nazwane części (`defaultNoticeParts`) — polityka bierze
  z nich tylko akapity o formularzu, bez powtórzenia administratora i praw. Klauzula pod
  formularzem bez zmian (6 akapitów, sprawdzone w zbudowanym HTML).
- Opis pola „Polityka prywatności” w Studio mówi, co znaczy puste pole. Bez zmian w strukturze schemy.
- Dokumenty: checklista (polityka generowana, kiedy potrzebna własna), brief (pytanie o własną
  politykę), OFERTA (polityka w standardzie; „nie obiecywać” — sprawdzenia przez prawnika).

### Weryfikacja

- `check` 0/0/0, `studio check`, `lint`, `format:check` — czysto.
- Buildy startera: dataset SEO 5/5, 140 linków; fixtures 5/5, 145; bez CMS-u 4/4, 89 — 0 martwych.
  gabinet-demo: 3/3, 95 linków, 0 martwych.
- **Lighthouse** (starter, 3 przebiegi): polityka desktop 100/100/100, mobile 99/100/100
  (perf/a11y/SEO), CLS 0; pozostałe strony bez regresji (desktop 100, mobile 96–99).
  Best-practices 81/82 — wyłącznie `is-on-https` (AdGuard).

### Prototyp zapytania (`D:\dev\zapytanie-ofertowe`)

Commit `835beac`: lista „Co przygotować” na stronie po wysłaniu (na górze, z podpowiedzią
o zapisaniu/wydruku) i w treści maila do wykonawcy. Warunki w dwóch miejscach (CSS `:has()`
w formularzu, `materials()` w serwerze) — opisane w komentarzu.

### Niezweryfikowane

- **Treść wzoru nie była sprawdzona przez prawnika** — dopisać do listy razem z licencją
  i klauzulą wyjścia (wpis o eksporcie).
- Cloudflare może ustawić techniczny plik cookie ochrony przed botami (zależnie od ustawień
  strefy) — wzór pisze tylko, że strona nie zapisuje cookies do statystyk ani reklam.
- Strona bez sekcji „Kontakt” nadal ma w polityce akapit o formularzu.

### Następne kroki

1. Presety stylów (Spokojny / Rzeczowy / Wyrazisty) i krój nagłówków w starterze — uzgodnione.
2. Ankieta treści z JSON-a zapytania → `src/tresci/index.ts`.
3. `git push` startera — od `8778eab` wszystko tylko lokalnie.

## Stan na koniec dnia i decyzje z rozmowy — 2026-11-03

Podsumowanie całej sesji, żeby następna mogła zacząć bez czytania rozmowy.

### Repozytoria

| Repo | Stan |
| --- | --- |
| `D:\dev\sanity` (starter) | GitHub do `a021291`; lokalnie 4 commity: `8c6e85f`, `d29d583`, `fad0b3a`, `b1ab69b` |
| `D:\dev\gabinet-demo` | lokalnie, 13 commitów przed `starter/main`; ostatni `7deccf1` (polityka prywatności) |
| `D:\dev\zapytanie-ofertowe` | nowe lokalne repo, bez remote; `835beac`, tag `v1-przed-stylami` (= `22f6872`) |

Prototyp uruchamia `node server.mjs` → `http://localhost:4400`; zapytania lądują w `zapytania/`
(w `.gitignore`, dane osobowe — przy testach usuwać tylko własne pliki).

### Decyzje podjęte

- **Telefon w nagłówku:** `brand.headerPhone`, domyślnie `false` (wdrożone).
- **Polityka prywatności:** generowana z Ustawień zamiast dziesiątego typu sekcji (wdrożone).
- **Formularz kontaktowy ma być wyborem klienta** — nie w każdym pakiecie obowiązkowo
  (do wdrożenia, niżej).
- **Jak najmniej kontaktu z klientem** — zasada dla oferty i narzędzi: bez rozmów, szkoleń
  na żywo i „wyceny po rozmowie”; zamiast tego formularze, ankiety, nagrania, limity.
- **Przy rozstaniu oddawać jak najmniej kodu.** Licencja w umowie realnie nie chroni (korekta
  argumentu z wpisu o eksporcie). Kierunek: klient dostaje zbudowaną stronę (`dist/`) i swoje
  treści, nie źródła; wykup kodu źródłowego jako płatna opcja w umowie. **Formalnie jeszcze
  niezatwierdzone** — patrz „Do decyzji”.
- **Formularz zapytania ofertowego zamiast kalkulatora z cenami:** wybór sekcji bez dopłat,
  dobrany pakiet, „od ____ zł”; dodatki wyceniane osobno. Kroki pojedynczo, styl, kolor.
- **Style strony** (Spokojny / Rzeczowy / Wyrazisty) jako presety w `brand.ts` — zgoda;
  najpierw były w prototypie (zrobione), teraz starter.
- **ComfyUI:** nie ma projektu. Ocena: sensowne tylko jako lokalny skrypt (poprawa zdjęć
  klienta, grafiki dekoracyjne/podglądowe), nigdy „prawdziwe” zdjęcia firmy, nie w buildzie;
  sprawdzić licencje modeli. Niski priorytet.

### Do decyzji (czeka na właściciela)

1. **Eksport przy rozstaniu — wariant B:** `dist/` bez formularza + treści i oryginały zdjęć +
   `_redirects` i `.htaccess` + README; obecny eksport źródeł jako `--zrodla` przy wykupie.
   Pytanie: oddawać zbudowany Worker formularza czy nie (rekomendacja: nie — wariant B).
   Szacunek przebudowy `eksport-klienta`: 2–3 h. Do zmiany też PRZEKAZANIE.md i OFERTA.md
   („klient dostaje kod strony” → „gotową stronę i treści” + pozycja „wykup kodu”).
2. **Pole „Pokaż formularz” w sekcji „Kontakt”** (obok „Pokaż mapę”) — pole, nie nowy typ.
   Realizuje wybór klienta i jednocześnie eksport bez formularza (pkt 1).
3. **OFERTA.md — poprawki 1–7 z rozmowy:** Lighthouse „przy oddaniu, z raportem”; nie pisać
   „zgodna z WCAG”; limit adresów w przenoszeniu (np. 20); czy abonament „Wizytówki” jest
   obowiązkowy; liczba rund poprawek (np. 2); copywriting nie „za podstronę”; dodatek „dane na
   bieżąco” przekracza budżet 10 kB JS. Plus: szkolenie → nagranie 3–5 min; zmiany w abonamencie
   przez formularz z limitem. **Ceny** (`____ zł`) — nadal puste.
4. Podgląd własnego koloru w prototypie: jedna linia JS (~80 B) — tak/nie.
5. `scroll-padding-top` (7,5rem poniżej `lg`) przy `headerPhone: false` ma ok. 50 px zapasu —
   zmniejszać tylko po pomiarze nazwy ~55 znaków.
6. Etykiety stylów w Studio „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu”.

### Propozycje i kolejność (uzgodniona)

Zrobione: lista „Co przygotować” (4), polityka prywatności (3). Dalej:

1. **Presety stylów w starterze** — `brand.style` (albo zestaw wartości) + osobny krój nagłówków
   (kandydaci z 2026-09-13: Fraunces 70 kB, Instrument Serif 33 kB, Bricolage Grotesque 60 kB;
   wagi kroju i wpływ na mobile perf ≥ 90 do zmierzenia). Prototyp ma już podgląd stylów na
   krojach systemowych.
2. **Ankieta treści** po akceptacji oferty: z JSON-a zapytania formularz dopasowany do sekcji
   → zapis `web/src/tresci/index.ts`; zdjęcia przez link do folderu. Szacunek 6–10 h.
   Razem z etapem 2: `pnpm nowy-klient --z-zapytania zapytanie.json`.
3. **Prawdziwy szkic strony** z JSON-a, wystawiony pod adresem podglądu (wymaga 2).
4. Formularz „zgłoś zmianę” dla abonamentu (z limitem z OFERTA.md).
5. gabinet-demo pod publicznym adresem jako przykład „Wizytówki” — wymaga zgody (wdrożenie).
6. Mierzenie czasu wdrożeń w checkliście (podstawa cen i terminów).

### Wnioski techniczne z sesji

- **Kod i `docs/` w osobnych commitach** — repo klientów nie mają dokumentów startera, wspólny
  commit daje przy cherry-picku konflikt modify/delete.
- Edycje plików Pythonem na Windows: zapis w trybie tekstowym daje CRLF — pisać z
  `newline='\n'`, a w podmienianych napisach nie używać `\n` w zwykłych stringach (rozwija się
  w regexach JS).
- `git stash` nie chowa nieśledzonych plików — do porównań „przed/po” użyć `git worktree`.
- Weryfikacja w Chrome: skrypty CDP w scratchpadzie sesji (Node 24, wbudowany WebSocket) —
  zrzuty z emulacją szerokości, klikanie przez `Runtime.evaluate`, pomiar nagłówka
  i pozycji sekcji po skoku do kotwicy. Nie są w repo — pisać od nowa.

## Pierwsze zlecenie — 2026-11-03

Zapytanie od pierwszego klienta: gabinet psychoterapii, **jedna strona z kotwicami**
(góra z przyciskiem „Umów się na spotkanie” → formularz, O mnie, Oferta, Cennik, Kontakt).
Pokrywa się z wariantem bez CMS-u i stroną jednostronicową — jak gabinet-demo, bez nowego kodu.

Szczegóły (prośba klienta, mapowanie na sekcje, pytania, mail, otwarte sprawy) są **poza repo
startera** — starter jest publiczny na GitHubie, a to dane i korespondencja klienta:
`D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`. Po założeniu prywatnego repo klienta
dokument przenieść tam.

Blokuje start: cena, termin i liczba rund poprawek (OFERTA.md), warunki umowy (przekazanie przy
rozstaniu — „Do decyzji” 1 we wpisie „Stan na koniec dnia”), `git push` startera przed klonem,
domena klienta (potrzebna do wysyłki z formularza przez Resend). To pierwsze wdrożenie —
zmierzyć czas (start i uruchomienie w checkliście).

## Praca w sesjach: STAN.md, /start, /koniec — 2026-11-03

Ciągłość między sesjami bez ręcznego prompta startowego (poprzedni prompt był nieaktualny —
zlecał zrobione już luki 1–2 — i miał nierozstrzygnięte decyzje w nawiasach).

- **`docs/STAN.md`** — stan bieżący (repo, aktywne zlecenia, „Do decyzji” 1–6, kolejka,
  odłożone, niezweryfikowane), nadpisywany; POSTEP zostaje historią.
- **`.claude/commands/start.md`** (`/start [temat]`) — czyta STAN.md i aktywne zlecenia,
  porównuje z `git status` we wszystkich repo, pyta o decyzje, nie koduje przed odpowiedzią.
- **`.claude/commands/koniec.md`** (`/koniec [temat]`) — wpis w POSTEP, nadpisany STAN.md,
  dziennik zlecenia, pamięć, commit dokumentów osobno, bez pusha.
- **`CLAUDE.md`** — sekcja „Sesje”; „Plan projektu” nie każe już czytać całego POSTEP.
- **`docs/SESJE.md`** — instrukcja dla właściciela + przeniesienie metody do innych projektów
  (szablony STAN.md, POSTEP, sekcji CLAUDE.md, komend).

Eksport do klienta pomija `docs/` i `.claude/` (bez zmian w `eksport-klienta`). Do gabinet-demo
nie przenoszone — repo klienta nie ma STAN.md; dopisek w CLAUDE.md repo klienta jest w kolejce (7).

Niezweryfikowane: komendy nie były uruchomione w nowej sesji (format pliku wg dokumentacji
Claude Code: Markdown w `.claude/commands/`, frontmatter `description` i `argument-hint`) —
pierwsze `/start` jutro jest testem.

## Landing z ofertą — rama treści, formularz „tylko mailowo”, JS bez limitu w kB — 2026-11-04

Temat od właściciela: własny landing z ofertą tworzenia stron + formularz zamówienia
jak w `zapytanie-ofertowe`. Sesja koncepcyjna — landing jeszcze nie powstał.

### Ustalenia

- **Rama treści landingu:** sprzedajemy wynik i wygodę (strona dobra na telefonie, gotowa pod
  Google, stała cena i termin, „pilnuję strony w abonamencie”), nie technologię ani
  „nie-WordPressa”. Technika jako dowód w jednej sekcji / jednym pytaniu FAQ.
  Uczciwy wniosek z porównania z WP: większość przewag stacku to przewagi **dla wykonawcy**
  (koszt wdrożenia, utrzymanie bez łatania wtyczek, hosting) — dla klienta realne tylko,
  jeśli przełożą się na cenę albo termin. Stąd pomiar czasu wdrożeń (kolejka 6) przed landingiem.
- **Nie pisać „bez spotkań”** — zamiast tego: szczegóły ustalasz w formularzu, dalej mailowo.
- **Czego nie obiecywać na landingu:** „zgodna z WCAG”, polityka „sprawdzona przez prawnika”,
  Best Practices 100 (lokalnie 81/82 przez AdGuarda, CI nieuruchomione), formularz na hostingu
  klienta, „najbezpieczniejsza strona” (brak CSP/HSTS), oddanie kodu przy rozstaniu
  (OFERTA.md, „Abonament”, wciąż tak mówi — sprzeczne z „Do decyzji” 1).
- **Stack landingu (rekomendacja, nieprzyjęta formalnie):** klon startera, wariant bez CMS-u,
  `/` + `/zapytanie`; formularz na CSS jak w prototypie, endpoint w Workerze (Resend,
  `CONTACT_TO`); jeden moduł TS z opcjami dla strony i Workera (usuwa dublowanie reguły
  pakietu i listy materiałów). React + react-hook-form odradzone: formularz nie potrzebuje JS,
  a landing jest dowodem obietnic o szybkości. Prompt dla nowej sesji przygotowany w rozmowie,
  **niezapisany w pliku**.
- **Decyzja: limit 10 kB JS zniesiony** (wariant 3 z trzech). Zostaje: Lighthouse mobile ≥ 90,
  zgoda na każdy skrypt, uzasadnienie „czego CSS nie potrafi”, bez frameworków, raport wagi
  JS w POSTEP. Uzasadnienie: limit nic dziś nie wiązał (starter 0 B, gabinet-demo 1,3 kB),
  blokował tylko dodatek „dane na bieżąco” (10–15 kB); zasada ważniejsza od liczby.

### Co powstało

- `zapytanie-ofertowe` `1b6424f` — pole `ustalenia` (dziś zawsze `email`, słownik
  `L.ustalenia` + ukryte pole w kroku 4, opis „Szczegóły ustalimy mailowo…”), wiersz
  „Ustalenia” w mailu i podsumowaniu; **pole telefonu klienta usunięte** (z HTML i z danych),
  e-mail na pełną szerokość. Telefon / rozmowa online wrócą jako kolejne opcje `ustalenia`.
- Starter: `CLAUDE.md` — reguła JS bez limitu w kB (obie wzmianki).

### Budżet JS klienckiego

Bez zmian w kodzie stron — starter 0 B, gabinet-demo 1339 B.

### Weryfikacja

- Prototyp na porcie 4499, `curl` POST: „Ustalenia: Mailowo” w podsumowaniu, mailu i JSON-ie;
  wartość spoza słownika → `email`; dopisany `telefon=123` nie trafia nigdzie; strona bez
  `name="telefon"`. Pliki testowe usunięte.
- `/start` z poprzedniej sesji zadziałał (test z wpisu 2026-11-03 zaliczony).

### Niezweryfikowane

- Wygląd kroku 4 po zmianie (tylko HTML/curl, bez przeglądarki).
- Astro Docs MCP i Context7 — wspomniane jako pomoc dla Claude, adresów nie sprawdzano.

### Do decyzji

- CLAUDE.md przeczy sam sobie o React: „świadoma wyspa” (w. 106) vs „w żadnej formie” (w. 110).
- Zapisać prompt landingu do pliku (poza repo startera — będą tam dane firmy).
- Stack landingu: Astro bez Reacta (rekomendacja) — formalne potwierdzenie.

## Model rozliczeń: utrzymanie roczne zamiast abonamentu — 2026-11-04

Sesja bez kodu stron: decyzje z listy „Do decyzji”, rozeznanie rynku, przepisanie oferty.

### Decyzje właściciela

- **Abonament wycofany** — właściciel nie widział, jak miałby działać. Zamiast niego
  **utrzymanie roczne 300 zł/rok** na kontach wykonawcy; w kwocie tylko utrzymanie (domena,
  hosting, formularz, kopie, poprawki techniczne). Zmiany osobno: **150 zł/h**, od 30 min
  (jednostka z rekomendacji, właściciel nie zakwestionował); 30 dni po uruchomieniu zmiany
  za darmo do 2 h; błąd ≠ zmiana; brak opłaty → wyłączenie po 30 dniach.
  Po drodze odrzucony „Model C” (jednorazowo, hosting i domena na kliencie).
- **Domena** rejestrowana przez wykonawcę na swoim koncie u rejestratora, **abonentem jest
  klient** — klient nie dotyka niczego technicznego, a przy rozstaniu dostaje kod AuthInfo.
- **Resend:** formularze wszystkich klientów wysyłają z jednej domeny wykonawcy
  (`CONTACT_FROM`); Reply-To = osoba z formularza już jest w workerze — bez zmian w kodzie.
- **React w `web/` zakazany bez wyjątków** — CLAUDE.md (`82e435f`).
- Bez pola „Pokaż formularz” w sekcji „Kontakt”. Landing na Astro bez Reacta. Promptu
  landingu nie zapisujemy.
- Do kolejki: podgląd własnego koloru w prototypie, `scroll-padding-top` (jeśli pomiar pokaże,
  że warto), etykiety stylów w Studio („Śródtytuł”). Odpada „zgłoś zmianę” dla abonamentu.

### Rozeznanie (blogi firm i platform — widełki orientacyjne)

- Domena + hosting wizytówki ok. 150–800 zł/rok; „opieka” freelancera 100–500 zł/mies.
  (głównie WordPress — nieporównywalne ze stroną statyczną).
- Stawki freelancera web: mid ok. 80–250 zł/h, „minimum opłacalne” 120–150 zł/h.
- Darmowe plany: Cloudflare Workers 100 tys. wywołań/dzień **na konto** (assety statyczne bez
  limitu); Sanity — projekty bez limitu, limity per projekt (20 miejsc, 10 tys. dokumentów);
  Resend — 100 maili/dzień i 3000/mies. **na konto**, 1 albo 3 domeny (źródła sprzeczne).
- Praktyka z domenami: klient jako właściciel (abonent); rejestratorzy przewidują
  rejestrację przez pośrednika na dane klienta.

### Co powstało

- Starter `82e435f` — CLAUDE.md: usunięte „świadoma wyspa”, zostaje „w żadnej formie”.
- Dokumenty (commit tego wpisu): `OFERTA.md` — sekcja „Utrzymanie roczne” zamiast „Abonament”,
  „Wizytówka”: zmiany godzinowo; `PRZEKAZANIE.md` — domena przez wykonawcę na dane klienta,
  jedna domena nadawcy w Resend; `CHECKLIST-WDROZENIE.md` (sekcja 10) i `NOWY-PROJEKT.md` —
  bez „abonamentu”.
- Pytanie o obrazy demo: `nowy-klient` usuwa `web/public/demo/` i `studio/scripts/demo-images/`
  (zawsze) oraz `web/src/tresci/obrazy/` (przy panelu) dopiero po „Zapisać?”. Z kodu
  (`client.ts`) wynika, że to nie powinno dawać błędów — placeholdery demo są używane tylko bez
  projektu i bez `LOCAL_CONTENT`, a `nowy-klient` zawsze ustawia jedno z nich.

### Budżet JS klienckiego

Bez zmian — starter 0 B, gabinet-demo 1339 B.

### Niezweryfikowane

- Limit domen na darmowym planie Resend (1 czy 3); limity planów zmieniają się bez zapowiedzi.
- Ceny odnowienia domeny .pl u rejestratorów (koszt po stronie wykonawcy w 300 zł).
- `nowy-klient` na świeżym klonie — czy rzeczywiście nie ma błędów na starcie (nie uruchamiano;
  właściciel nie podał treści błędu).
- Procedura .pl: rejestracja przez pośrednika na dane abonenta i wydanie AuthInfo — z regulaminów
  rejestratorów, nie z dokumentacji NASK.

### Do decyzji

- Eksport przy rozstaniu (wariant B) — „do przemyślenia”; po niej poprawić PRZEKAZANIE.md
  (licencja, „kod strony”) i zdanie „stronę do przeniesienia” w OFERTA.md.
- OFERTA.md: ceny pakietów, rundy poprawek, pozostałe punkty listy.

## Różnorodność stron — blok `style`, kształt zdjęć, opinie w karuzeli, menu — 2026-11-04

Temat od właściciela: kilku klientów z jednej branży (np. psychologowie) nie może dostać tej samej
strony z innymi zdjęciami. Sesja zaczęła od koncepcji, skończyła na dwóch osiach i trzech
poprawkach zgłoszonych po drodze.

### Ustalenia

- **Kierunek:** zamiast 3 pełnych presetów — niezależne ustawienia („osie”) z kilkoma gotowymi
  wartościami; Spokojny / Rzeczowy / Wyrazisty to gotowe wypełnienia bloku `style` w `brand.ts`
  (w kodzie, nie w Studio). Kolejność sekcji jest dowolna już dziś (`sections`) — brakuje układów
  dla branż (do ankiety treści).
- **Bez rejestru wdrożeń i bez losowania** — osie dobiera właściciel ręcznie.
- **Formularz zapytania bez konfiguratora szczegółów** (strona tekstu, kolejność sekcji): klient
  nie jest projektantem, każde pytanie obniża konwersję, więcej wyborów = więcej rund poprawek.
  Propozycja (niezatwierdzona): 2 pytania w języku klienta — „Jakie masz zdjęcia?” → hero
  i kształt zdjęć, „Co odwiedzający ma zobaczyć najpierw?” → układ sekcji.
- **Nazwy w kodzie po angielsku** (klucze, typy, wartości); komentarze, Studio, commity po polsku.
- **Kształt zdjęć per sekcja, nie globalnie** — właściciel nie chce jednym ustawieniem okrągłych
  zdjęć w całej stronie.
- **Pionowy pasek postępu — odrzucony** po dwóch iteracjach (długa linia: wyglądała jak błąd
  układu i znikała na sekcji w kolorze marki; pastylka z odstępem od krawędzi). Commit cofnięty.

### Co powstało (starter, lokalnie)

- `79d505a` — `style.shape` (sharp/soft/round) i `style.spacing` (compact/normal/airy) zastępują
  wolne pola `radius` i `spacing.sectionY*`; wartości domyślne = poprzednie. Przyciski mają osobne
  zaokrąglenie `rounded-button` (przy `round` — pigułka). `contentMax` wyjęty na poziom `brand`.
- `9cdc01f` — pole `imageShape` (rect/arch/circle, fabryka `imageShapeField` jak `layoutField`)
  w hero i textImage; `coalesce(…, "rect")` w zapytaniu. `SanityImage` przyjmuje `shape` →
  `data-shape` + `object-position` z hotspotu (`focalPoint()` w `image.ts`, przeliczony na kadr).
  Przycinanie CSS-em: `aspect-ratio` + `object-fit: cover`, koło maks. 24 rem, łuk 4:5 maks. 28 rem.
  Prostokąt — HTML bez zmian.
- `dd69cdd` — menu: link bieżącej podstrony ma `href="#"` (przewija na górę, bez przeładowania);
  link-guard przepuszcza pusty fragment, `#top` by nie przeszedł.
- `5781635` + `54ffb34` (revert) — `style.progress` z pionowym paskiem; wycofane w całości.
- `07ea8d4` — opinie klientów: `layoutField()` (siatka/karuzela, domyślnie siatka), karta
  wydzielona do `TestimonialCard.astro`, podgląd w Studio pokazuje układ. **Poprawka seeda:**
  przy opiniach gubił `layout`.
- `1c44a71` — treści demo: 6 opinii w karuzeli (4 nowe bez zdjęcia — pole opcjonalne), galeria
  „Nasze realizacje” 8 zdjęć; `galeria-5…8` z picsum.photos (id 1015, 1018, 1039, 1043, licencja
  Unsplash; pierwsza pula odrzucona — logotypy Apple/LG), WebP 852 kB razem; placeholdery SVG.

### Weryfikacja

- `pnpm check` (web) i `tsc` (studio): 0 błędów po każdym kroku. Build: SEO 5 stron OK, linki
  140 (Sanity) / 145–149 (demo), 0 martwych.
- Lighthouse na demo z łukiem w hero i kołem w „O nas”: mobile perf 0,98–0,99, A11y 1, SEO 1,
  CLS 0, `image-aspect-ratio` OK; desktop perf 1. To samo z karuzelą opinii.
  **Best Practices 0,81–0,82 na każdej stronie — wyłącznie `is-on-https`: AdGuard wstrzykuje
  skrypty z `http://local.adguard.org`.** Nie skutek zmian (polityka prywatności bez nowych
  elementów ma ten sam wynik).
- Menu sprawdzone w Chrome (puppeteer): po kliknięciu znacznik w `window` przetrwał, scrollY 0.
- Zrzuty: łuk i koło (1440), karuzela opinii (1440, 390).

### Budżet JS klienckiego

Bez nowego skryptu. Karuzela opinii używa istniejącego `Carousel` — ładowany tylko na stronach
z karuzelą (w demo: strona główna i „O nas”). Starter bez karuzeli 0 B, gabinet-demo 1339 B.

### Dataset Sanity — znalezisko

Dokumenty demo w Sanity są z seeda 2026-09-12 i nikt ich nie edytował (ten sam `_updatedAt`).
Galeria ma tam stare pole `images` zamiast `items` (zmiana w `3725a2f`) — strona z Sanity pokazuje
nagłówek galerii bez zdjęć. Naprawia to ponowny `pnpm --filter studio seed`; Claude nie uruchomił
(blokada auto mode — zapis do zasobu zewnętrznego). Jest też szkic `drafts.13328575…` („1”) spoza
seeda — seed go nie dotyka.

### Niezweryfikowane

- Kształty zdjęć na prawdziwym telefonie (headless Chrome nie schodzi poniżej 500 px; zrzut 390 px
  ucięty) i w Safari/Firefox.
- `imageShape` ze zdjęciem z hotspotem ze Studio (demo nie ma hotspotów — tylko środek).
- Wartości `sharp`/`round`, `compact`/`airy` — wybrane „na oko”, nieoglądane obok siebie.
- Seed z nowymi treściami (nieuruchomiony).

### Do decyzji

- Dwa pytania w formularzu zapytania (zdjęcia → hero/kształt, „co najpierw” → układ).
- Czy kierunek z osiami (krój, hero, dekor, warianty sekcji, układy branżowe) zatwierdzony
  w całości — dziś wprost przyjęte tylko `shape`, `spacing`, `imageShape`.

### Następne kroki

- Landing z ofertą w `D:\dev\landing-oferta` (decyzje w STAN.md) — praca autonomiczna.
- Krój nagłówków (para krojów, pomiar mobile) — następny krok różnorodności.
- gabinet-demo przy pobraniu startera: konflikt w `brand.ts` (`radius`/`spacing` → `style`).

## Landing z ofertą — oferta.emes.dev (praca autonomiczna) — 2026-11-04

Właściciel poza komputerem; zadanie: landing z ofertą tworzenia stron. Decyzje przed startem:
nowe lokalne repo, strona + formularz, ceny z analizy rynku; w trakcie (wiadomości od właściciela):
design kompletnie inny niż gabinet-demo, bez zaznaczania tekstu w makietach, więcej animacji,
sekcja realizacji z wygenerowanymi obrazami (później ukryć), mniej niebieskiego, formularz
zwykłej wiadomości.

### Co powstało (`D:\dev\landing-oferta`, lokalnie)

- `b542fa9` konfiguracja (`nowy-klient`, bez CMS-u), `cfe3809` strona główna + `/zapytanie`
  + Worker, `36d2079` uwagi właściciela, `cf58bab` `docs/LANDING.md` (szczegóły, ceny ze źródłami,
  lista przed publikacją).
- Strona główna: własne komponenty (`components/landing`), treść w `tresci/index.ts` (SEO, FAQ
  JSON-LD i sitemapa działają jak w starterze). `/zapytanie` przeniesione z prototypu; opcje,
  ceny, reguła pakietu i lista materiałów w jednym module `lib/zapytanie.ts` (strona + Worker).
- `POST /api/zapytanie`: Resend, załącznik `zapytanie.json`, strony po wysłaniu z assetów
  uzupełniane przez Worker (`<template data-z>`), te same sekrety i limity co `/api/kontakt`.
- Realizacje: zrzuty gabinet-demo, demo startera (Sanity) i wariantu startera (śliwka, round,
  airy, łuk) — **nie są realizacjami klientów**.

### Weryfikacja

- check 0 błędów; build SEO 6 stron, 179 linków, 0 martwych.
- Lighthouse: mobile perf 0,98–0,99, desktop 1, A11y 1, SEO 1, CLS 0; BP 0,81–0,82 (AdGuard).
- Worker: 21 sprawdzeń w Node (esbuild + atrapy) — wszystkie OK. Bez `wrangler dev` (brak w projekcie).
- JS: strona główna 1403 B inline (formularz kontaktowy + menu), `/zapytanie` 197 B (menu).

### Znalezisko

- `D:\dev\landing` — wcześniejsza próba (sesja `landing-35`, sekcje startera), niezacommitowana;
  jej `origin` to GitHub `starter-demo` — push stamtąd trafiłby do publicznego startera.

### Niezweryfikowane

- Worker na Cloudflare / `wrangler dev`; prawdziwa wysyłka Resend z załącznikiem.
- Polityka prywatności vs dane z zapytania; brutto/netto; Safari/Firefox (`:has()`, scroll-driven).

## Przegląd landingu — żółta góra, „o mnie”, telefon z trzema stronami — 2026-11-04

Sesja 4. Przegląd `D:\dev\landing-oferta` z właścicielem, poprawki na bieżąco.

### Decyzje

- Zostaje `landing-oferta`; `D:\dev\landing` (origin = publiczne `starter-demo`) usunięty.
- Ceny zostają (1 900 / 3 900 zł); kwoty na stronie = cały koszt klienta (nic nie dochodzi).
- Realizacje (zrzuty demo) na razie zostają. Sekcja „dlaczego” bez pozycji w menu.
- Góra strony: **żółty zakreślacz** (wybrany z 7 wariantów: kobalt, atrament, śliwka, cegła, krem…).
  Kobalt usunięty w całości (`brand` = atrament) — niebieski hover „źle wygląda”.
- Żółty tylko tam, gdzie znaczy: góra, kwoty, numery kroków, hover na jasnym tle, pas CTA.
  Odrzucone: zakreślacz pod każdym nagłówkiem (za dużo), „cień” przycisku w hero (kobaltowy i biały).
- Bez pauzy „—” w tekstach widocznych: „ - ” w zdaniach, „ | ” w tytułach (zapisane w pamięci).
- „O mnie” z CV właściciela: bez nazw pracodawców, technologii i branży („kilkaset osób w kilku
  krajach”); podpis zdjęcia „Michał Szeniak” (zgoda właściciela).
- Skrypt „ponowny klik logo odtwarza animację telefonu” — zgoda na próbę, sprawdzony, **odrzucony**
  (po przewinięciu gotowy telefon znika i składa się od nowa).
- Telefon w hero zmienia stronę: wariant 1 z 3 — jedno okrążenie i stop (WCAG 2.2.2: ruch > 5 s
  powinno się dać zatrzymać). Wjazd całej strony od dołu odrzucony jako mało subtelny.

### Co powstało

Starter (`D:\dev\sanity`):
- `9c89abf` logo na stronie głównej → `#` (przewija na górę, bez przeładowania).
- `a929d60` „—” → „ - ” w klauzuli formularza i polityce prywatności, tytuł polityki z „ | ”.

Landing (`D:\dev\landing-oferta`, merge startera `fbe72f4`, `3ca8814`):
- `9d02547` żółta góra, znak „emes_” (plakietka z kursorem terminala — pionowy czytał się jak „l”),
  favicon „e_”; sekcja „Czym to się różni od kreatora albo WordPressa”; „cały koszt” w cenach;
  FAQ „Najczęściej zadawane pytania” + pytania o koszt i Google; płynne rozwijanie FAQ
  (`::details-content` + `interpolate-size`, 0 B JS); polityka prywatności z sekcją
  „Zapytanie o stronę” (`INQUIRY_PRIVACY` w `lib/zapytanie.ts`).
- `103370a` marka atramentowa, hover żółty na jasnym tle, żółte numery kroków, myślniki
  (strona, `/zapytanie`, strony po wysłaniu, mail).
- `987a471` sekcja „Kto zrobi Twoją stronę” (`#o-mnie`); tła sekcji na zmianę automatycznie
  (`.lp > .lp-section:nth-of-type(odd)`), więc ukrycie sekcji nie psuje rytmu.
- `d73a587` miejsce na zdjęcie (`author` w `tresci/index.ts`; bez zdjęcia inicjały „MS”).
- `ffa301c` tekst bez branży pracodawcy.
- `dc1ce64` skrypt logo (326 B) → `dbfab3c` revert.
- `219de15` telefon: serwis rowerowy → gabinet fizjoterapii (szeryfy, okrągły portret) →
  kawiarnia (kanciasta, „zdjęcie” z gradientów); kolejna strona „przeciera się” od góry,
  sekcje dokładają się po kolei, ok. 13 s i powrót do pierwszej. Czysty CSS.
- Dokumenty: `3714d36`, `a74ad9b`, `1268c2d` (`docs/LANDING.md`: paleta, znak, lista przed publikacją).

### Weryfikacja

- `pnpm check` 0 błędów (starter i landing); build landingu: SEO 6 stron OK, 179 linków, 0 martwych.
- Lighthouse landingu (mobile, 3 strony × 3 przebiegi, po ostatniej zmianie): perf 0,99, A11y 1,
  SEO 1, CLS 0; BP 0,82 wyłącznie `is-on-https` (lokalny AdGuard).
- JS strony głównej landingu: 1339 B inline (formularz 1174 + menu 165) — bez zmian netto.
- Kontrasty nowych par policzone (tekst ≥ 5,5:1). Animacja telefonu sprawdzona na stopklatkach
  (ujemne `animation-delay` + pauza) — headless Chrome nie przesuwa animacji w czasie.

### Niezweryfikowane

- Animacja telefonu i rozwijanie FAQ na żywo, na prawdziwym telefonie, w Safari/Firefox.
- Wersja mobilna nagłówka z plakietką „emes_” (zrzut headless nie zwęża okna poniżej ~500 px).
- Treść sekcji polityki o zapytaniu — wzór, do prawnika.

### Do decyzji

- Zamiennik „dla małych firm” (tagline, metaTitle, „o mnie”) — propozycja: „dla lokalnych firm”.
- Czwarta przykładowa strona w telefonie (okrążenie ~17 s) — rekomendacja: zostać przy trzech.
- Plik zdjęcia do „o mnie”; obraz OG (dziś atramentowy z tytułu).

## Landing: naprawa telefonu w hero i nowy tagline — 2026-11-05

Sesja 5. Na starcie: starter był już wypchnięty (`origin/main` = `a929d60`), a dokumenty
sesji 4 nie miały commita — zacommitowane razem z pierwszymi decyzjami sesji 5 (`a59d15d`).

### Co powstało

`D:\dev\landing-oferta`:

- `187ef41` **naprawa animacji telefonu.** Opóźnienia `4.6s, 12.6s` stały w regule
  `[data-motion] .lp-site + .lp-site` (szczegółowość 0,3,0), więc `.lp-site--cafe` (0,2,0)
  ze swoim `8.6s` przegrywała: kawiarnia wjeżdżała razem z fizjoterapią, na wierzchu i pusta
  (sekcje dopiero od ~9 s). Efekt: ~4 s białego ekranu, fizjoterapii nie widać, „trzeciej
  strony nie ma”. Teraz opóźnienia tylko w regułach poszczególnych stron.
  Do tego **powrót do pierwszej strony tak jak pozostałe przejścia** (prośba właściciela):
  zamiast ścierania kawiarni w dół serwis rowerowy przeciera się od góry na wierzch
  (`lp-site-return`, `z-index: 1` w klatkach) i jego sekcje wchodzą drugi raz po kolei
  (`lp-mock-in, lp-mock-hide, lp-mock-in` — ukrycie od 12,6 s do drugiego wejścia; drugie
  wejście z `fill-mode: forwards`, bez wypełnienia wstecz). `lp-site-out` usunięte.
  Okrążenie ~14,5 s, potem stoi. Tylko CSS.
- `611b357` tagline, `metaTitle` strony głównej (48 zn.) i „Kto zrobi Twoją stronę”:
  **„Strony internetowe dla firm i specjalistów”** zamiast „dla małych firm”.

### Weryfikacja

- Landing: `pnpm --filter web check` 0 błędów; build: SEO 6 stron OK.
- Animacja sprawdzona na klatkach: `puppeteer-core` z `node_modules` landingu (skrypt
  w scratchpadzie, bez nowej zależności), `document.getAnimations()` → `pause()` +
  `currentTime` dla animacji z `document.timeline` (scroll-driven trzeba pominąć — rzucają
  wyjątek). Klatki 3 / 6,5 / 11 / 12,75 / 13,6 / 16 s: rower → fizjo → kawiarnia → pusty ekran
  z paskiem roweru → sekcje po kolei → cała strona. Metoda z sesji 4 (ujemne opóźnienia)
  błędu nie wyłapała — sprawdzała strony osobno, nie nakładanie się warstw.
- JS strony głównej bez zmian (1339 B). Lighthouse w tej sesji nieuruchamiany.

### Niezweryfikowane

- Animacja na żywo w przeglądarce (właściciel ma obejrzeć), na telefonie, w Safari/Firefox.
- Lighthouse landingu po zmianach (zmiana tylko w CSS animacji i tekstach — ryzyko małe).

### Do decyzji

- Pusty ekran ~0,35 s przy każdym przejściu w telefonie — zostawić czy skrócić.
- Czwarta strona w telefonie — po obejrzeniu animacji na żywo.
- Formularz zapytania: „Jakie masz zdjęcia?” odrzucone w tej formie; „Co odwiedzający ma
  zobaczyć najpierw?” bez odpowiedzi.
- Obraz OG, prywatne repo landingu na GitHubie i wdrożenie.

## Ceny dodatków i panel w Wizytówce — kreator landingu — 2026-11-05

Sesja 6. Zaczęła się od pytań właściciela (Sanity dla stron „bez CMS-u”, architektura bloków,
model abonamentu z cudzej analizy), skończyła się poprawką kreatora i cennika na landingu.

### Ustalenia (bez kodu)

- **„Bez CMS-u też na Sanity”** — odrzucone jako domyślne. Każda Wizytówka dostałaby pozycje
  **[panel]** z checklisty (projekt, CORS, webhook, Deploy Hook, kopia), a edycja treści przez AI
  jest prostsza w `tresci/index.ts` (typy, diff) niż w Studio. Przejście na panel dziś: kod obsługuje
  oba źródła (jedna zmienna), ręcznie trzeba przepisać treści (~1–2 h). Importer
  `pnpm seed --z-tresci` (~2–3 h) — w kolejce, odłożony.
- **Architektura bloków z artykułu** — starter ma ją już w lepszej wersji (`switch` zamiast
  `Record<…, any>`, h1 z pozycji, link jako referencja, `alt`/SEO/`preview`). Studio pod `/admin`
  = React w `web/` — zakazane. Jedyny pomysł wart uwagi (wariant hero) jest już w planie.
- **Cudza analiza cen** — wzięte: punkty odniesienia (one-page 1 800–2 400, dopłata za edytor
  800–1 200), sprawdzić odnowienie .pl i VAT przed ruszaniem 300 zł, nagranie zamiast szkolenia.
  Odrzucone: „Opieka Pro” ze skrzynkami i priorytetowym wsparciem (więcej kontaktu), darmowe korekty
  w abonamencie, tryb ciemny, i18n za 800–1 200 zł ryczałtem przed zbudowaniem infrastruktury,
  hasła o „wirusach WordPressa” i „panelu jak Word”.
- **Decyzje:** panel dopłatą **tylko w Wizytówce, +800 zł** (Firma 3 900 z panelem w cenie);
  teksty **80 zł za sekcję** (nagłówek się liczy, Kontakt nie); blog **600 zł „na początek”**, tylko
  z panelem, klient informowany, że przy wielu wpisach utrzymanie może podrożeć; druga wersja
  językowa odłożona (w kreatorze „wycena”, budowa po zapłacie); opinie Google/Booksy — możliwe, ale
  z pełną informacją o skutkach (RODO, baner, wynik, abonament widżetu); blog „czeka nas”, tylko
  z panelem; w regulaminie zapis o możliwym wzroście kosztów zewnętrznych; przyciski kart cennika
  zostają „Zapytaj o Wizytówkę / o Firmę”, bez „Zamów”; przełącznik ceny na karcie — nie.

### Co powstało

`landing-oferta`:
- `318efaa` **feat: kreator — panel jako dopłata w Wizytówce, ceny dodatków, opis „Coś innego”** —
  `PRICES` w `lib/zapytanie.ts` (jedyne źródło kwot); `packageFor(zakres)` bez edycji;
  `needsPanel()` = Wizytówka + („Zmieniam je sam” albo blog); `Zapytanie` dostaje `panel`
  i `dodatkiOpis`; ceny w rogu kafelków (`price` w `Option`); pytanie o edycję tylko przy jednej
  stronie (przy podstronach „panel w cenie Firmy”); „Coś innego” odsłania pole opisu (`:has`);
  kwota tekstów z licznika CSS `counter-increment: teksty 80` (ukryta sekcja się nie liczy,
  Kontakt ma własny inkrement); karta Wizytówki „panel: +800 zł”, FAQ o panelu, blog zdjęty
  z „Na miarę”.
- `64522a8` chore: `docs/LANDING.md` — tabela cen.

`sanity`:
- `86c1959` chore: OFERTA.md — panel 800, teksty 80/sekcja, blog 600 (tylko z panelem, koszty
  rosną z wpisami), opinie Google/Booksy, i18n, zapis o wzroście kosztów do regulaminu.
- Push: GitHub `a929d60..86c1959` (zgoda w sesji).

### Weryfikacja

- `pnpm --filter web check` 0 błędów, 0 ostrzeżeń; build: SEO 6/6, linki 179/0 martwych.
- Worker (`parseZapytanie`/`summaryRows`/`mailSubject` w Node): 6 przypadków — pakiet, panel,
  blog → panel, Firma bez dopłaty, teksty 3 × 80 = 240 zł bez Kontaktu, opis odrzucany bez „inne”.
- Headless Chrome, 5 układów: właściwy blok pakietu i uwagi; licznik 4 × 80 = 320 zł; ceny przy
  prawej krawędzi kafelka (po poprawce `flex: 1`), także przy 390 px.
- Lighthouse (`pnpm lh`): `/zapytanie` desktop 100/100/81/100, mobile 99/100/82/100; strona główna
  mobile 98–99. BP 0,81–0,82 na wszystkich stronach = AdGuard (znane). JS: 0 plików `.js` w `dist/`,
  kreator 0 B.

### Niezweryfikowane

- Worker `/api/zapytanie` w `wrangler dev` / na Cloudflare (logika sprawdzona tylko w Node).
- Kreator w Safari/Firefox i na prawdziwym telefonie; czytnik ekranu a kwota z `::before`.
- Rynkowe stawki copywritingu (50–150 zł / 1 000 zn.) i czas pisania 80 zł/sekcję — szacunki.
- Sanity Free: limit liczby projektów na organizację; Google Places API — limit opinii, regulamin.

### Następne kroki

- Landing: domknięcie (decyzje 6–7, zdjęcie autora, publikacja).
- Blog w starterze (6–10 h) — przy pierwszym zamówieniu; sekcja „Najnowsze wpisy” = 10. typ (zgoda).
