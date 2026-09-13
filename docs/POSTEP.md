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
