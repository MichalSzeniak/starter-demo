# CLAUDE.md

Starter stron wizytówek: Astro 5 (SSG) + Sanity + Tailwind 4, hosting Cloudflare Pages.
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
- **Zero JS klienckiego domyślnie.** Wyspa `client:visible` tylko dla menu
  mobilnego i accordionu FAQ. Nowa wyspa = pytanie do mnie.
- **Obrazy lokalnie.** `astro:assets` pobiera z `cdn.sanity.io` przy buildzie.
  Nie linkuj do CDN Sanity w wyjściowym HTML.
- **Nie dodawaj zależności bez pytania.** Podaj wagę i uzasadnienie.
- **Schema jest zamknięta**: 8 typów sekcji. Dziewiąty wymaga mojej zgody.
- Każde pole obrazu ma wymagany `alt` (walidacja w schemie).
- Żadnych pól typu „surowy HTML" ani rich texta w miejscach strukturalnych.
- Etykiety pól w Studio po polsku.
- Nie commituj `.env`, tokenów, `dist/`.

## Plan projektu

Projekt realizujemy fazami opisanymi w `docs/PLAN.md`.
Przed rozpoczęciem pracy przeczytaj `docs/PLAN.md` oraz `docs/POSTEP.md`.
Wykonuj wyłącznie fazę, którą wskażę. Po jej zakończeniu dopisz wpis
do `docs/POSTEP.md` i zatrzymaj się.

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
- Lighthouse: desktop 100/100/100/100, mobile perf ≥ 95,
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