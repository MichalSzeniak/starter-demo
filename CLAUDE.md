# CLAUDE.md

Starter stron wizytówek: Astro 7 (SSG) + Sanity + Tailwind 4, hosting Cloudflare Workers
(statyczne assety + Worker dla `/api/*`).
Repo jest **szablonem**, nie projektem jednego klienta.

## Naczelna zasada

Optymalizujemy czas kolejnego wdrożenia.
Rozwiązanie, które trzeba dostosowywać przy każdym nowym kliencie, jest złym
rozwiązaniem — nawet jeśli jest ładniejsze.

## Komendy

```bash
pnpm --filter web dev        # Astro na :4321
pnpm --filter studio dev     # Sanity Studio na :3333
pnpm --filter web build      # build produkcyjny (failuje przy brakach SEO)
pnpm --filter web check      # astro check + tsc --noEmit
pnpm typegen                 # sanity typegen: schema → typy TS dla web/
pnpm lh                      # Lighthouse CI lokalnie
```

## Twarde reguły

- `output: 'static'`. Nie przełączaj na SSR bez wyraźnej zgody.
- JS kliencki: bez limitu w kB — pilnują go próg Lighthouse (mobile perf ≥ 90) i zgoda
  na każdy skrypt. Waniliowy, bez frameworków. React nie ma prawa trafić do `web/`.
- Cel Lighthouse: mobile performance ≥ 90, pozostałe kategorie 100.
  Wygląd ma pierwszeństwo przed ostatnimi punktami wydajności.
- Menu mobilne i FAQ działają na `<details>`, bez JS. Uzgodnione skrypty: karuzela,
  formularz kontaktowy i zamykanie menu mobilnego po kliknięciu kotwicy (165 B, tylko
  gdy w menu są kotwice) — każdy tylko na stronach, które go potrzebują. Każdy nowy
  skrypt albo wyspa = pytanie do mnie.
- **Obrazy lokalnie.** `astro:assets` pobiera z `cdn.sanity.io` przy buildzie.
  Nie linkuj do CDN Sanity w wyjściowym HTML.
- **Nie dodawaj zależności bez pytania.** Podaj wagę i uzasadnienie.
- **Schema jest zamknięta**: 9 typów sekcji (dziewiąty, `contact`,
  za zgodą w fazie 5). Dziesiąty wymaga mojej zgody.
- Każde pole obrazu ma wymagany `alt` (walidacja w schemie).
- Żadnych pól typu „surowy HTML" ani rich texta w miejscach strukturalnych.
- Etykiety pól w Studio po polsku.
- Nie commituj `.env`, tokenów, `dist/`.

## Plan projektu

Projekt realizujemy fazami opisanymi w `docs/PLAN.md` (fazy 0–7 zamknięte).
Wykonuj wyłącznie zadanie, które wskażę. Po jego zakończeniu dopisz wpis
do `docs/POSTEP.md` i zatrzymaj się.

## Sesje

- **Początek: `/start`** (albo przeczytaj `docs/STAN.md`). Całego `docs/POSTEP.md`
  nie czytaj — tylko wpisy, do których odsyła STAN.md albo które są potrzebne.
- **Koniec: `/koniec`** — wpis w POSTEP, nadpisany STAN.md, osobny commit dokumentów.
- `docs/STAN.md` = stan bieżący (nadpisywany, krótki); `docs/POSTEP.md` = historia
  (tylko dopisywanie). Decyzje zapisuj w STAN.md od razu, nie na koniec.
- Jedna sesja = jeden temat; pomysły poboczne → STAN.md, „Propozycje odłożone”.
- Dane i korespondencja klientów nigdy do tego repo (jest publiczne) —
  `D:\dev\zlecenia\…` albo prywatne repo klienta.
- Szczegóły: `docs/SESJE.md`.

## Wiedza o Sanity

W repo zainstalowane są skille `sanity-io/agent-toolkit`. Przy każdej pracy
dotyczącej schemy, GROQ, TypeGen, obrazów, Portable Text lub page buildera
korzystaj z `sanity-best-practices`, a przy metadanych i danych
strukturalnych z `seo-aeo-best-practices`.

## Weryfikacja API

Nie zgaduj sygnatur. Przed użyciem API z `astro`, `@sanity/astro`,
`@sanity/image-url`, `astro-portabletext`, `sanity`:

1. sprawdź zainstalowaną wersję (`pnpm list <pkg>`),
2. przeczytaj typy w `node_modules/<pkg>`,
3. jeśli nadal nie masz pewności — powiedz to, zamiast pisać kod „na czuja".

Szczególnie ostrożnie z Sanity CLI: `dataset export`/`import` mają znane
kruche miejsca przy referencjach do assetów między projektami.

## Definicja gotowego

Zmiana jest skończona, gdy:

- `pnpm check` przechodzi,
- build przechodzi (w tym walidacja SEO),
- Lighthouse: desktop 100/100/100/100, mobile perf ≥ 90, reszta 100
  (próg 90 uzgodniony w fazie 6 — tak samo w `lighthouserc.mobile.json`),
- nie przybyło JS-u klienckiego, chyba że uzgodnione,
- nowa sekcja ma `preview` w Studio i wpis w `SectionRenderer`.

## SEO — nienegocjowalne

Każda strona: unikalny `metaTitle` (≤ 60 zn.), `metaDescription` (≤ 155 zn.),
absolutny canonical, dokładnie jeden `<h1>`, OG image.
Build ma **failować**, gdy któregokolwiek z tych elementów brakuje.

## Styl pracy

- Pracuj małymi krokami, po każdym pokaż diff.
- Nie refaktoruj rzeczy, o które nie prosiłem.
- Komunikaty commitów po polsku, konwencja `feat:` / `fix:` / `chore:`.
- Gdy coś jest złym pomysłem — powiedz to wprost, zanim zaczniesz kodować.

- Studio żyje w `studio/`, strona w `web/`. React nie ma prawa
  pojawić się w zależnościach `web/` inaczej niż jako świadoma wyspa.

- JS kliencki: bez limitu w kB (decyzja 2026-11-04), waniliowy, bez frameworków.
  React nie ma prawa trafić do `web/` w żadnej formie.
- Każdy nowy skrypt wymaga uzasadnienia: czego CSS nie potrafi.
  Wagę JS na stronach raportuj w POSTEP.md — żeby było widać, czy przyrasta.
- Cel Lighthouse: mobile performance ≥ 90, pozostałe kategorie 100.
  Wygląd ma pierwszeństwo przed ostatnimi punktami wydajności.

  - Nie umieszczaj moich danych osobowych (e-mail, telefon, adres) w żądaniach
  do zewnętrznych serwisów ani w kodzie. Jeśli API tego wymaga — zapytaj.