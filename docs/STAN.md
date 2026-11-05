# Stan projektu

**Aktualizacja: 2026-11-05 (sesja 9 — krój nagłówków `brand.font.heading`, porządek w decyzjach).**
Ten plik się **nadpisuje** na koniec każdej sesji (`/koniec`). Historia: `docs/POSTEP.md` (tylko
dopisywanie). Sesje: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`. Push i wdrożenia robi właściciel sam.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub = `86c1959`; lokalnie ponad `origin/main` dokumenty i kod **`db60e0e`** (limit formularza) i **`b929ba6`** (krój nagłówków) — niewypchnięte |
| `D:\dev\landing-oferta` | landing z ofertą (własny design) | lokalne, bez GitHuba; ostatni `e2b9910`; `starter` = `D:\dev\sanity` (push wyłączony), `starter/main` = `db60e0e` (nie pobrany po `b929ba6`); „behind” = dokumenty startera |
| `D:\dev\gabinet-demo` | **projekt podglądowy, do usunięcia** — nie synchronizować | ostatni `7deccf1`; cały kod jest w historii startera |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne, bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona, bez CMS-u, Wizytówka 1 900 zł. Mail z pytaniami gotowy, **niewysłany** (sekcja 7
  do korekty: domena, kontakt ogólnie). Blokuje ofertę: umowa.

## Oferta (OFERTA.md startera; kwoty: `PRICES` w `landing-oferta/web/src/lib/zapytanie.ts`)

- **Wizytówka 1 900 zł / Witryna 2 900 zł** (do 5 stron), **panel +800 zł** w każdym pakiecie;
  teksty 80 zł za fragment strony; blog 600 zł (wymaga panelu).
- Utrzymanie 300 zł/rok z domeną .pl / .com.pl / .com (droższa — różnica doliczana; własną
  przenoszę). Zmiany 150 zł/h, minimum pół godziny (75 zł); 30 dni po starcie do 2 h gratis.
- Bez VAT (nierejestrowana, limit 10 813,50 zł / kwartał). 50/50, 2 rundy, zwykle 1–2 tygodnie.
- **Kwoty muszą się zgadzać** w cenniku, kreatorze, mailu i OFERTA.md — jedno źródło `PRICES`.

## Landing `oferta.emes.dev` (szczegóły: `docs/LANDING.md` w repo landingu)

- Animacja telefonu zostaje jak jest, bez czwartej strony (2026-11-05).
- JS: strona główna 1339 B, `/zapytanie` 274 + 165 B.
- Przed publikacją: zdjęcie autora, polityka do prawnika. GitHub i wdrożenie — właściciel.

## Różnorodność stron

- Są: `style.shape`, `style.spacing`, `imageShape`, opinie siatka/karuzela, **`brand.font.heading`**
  (h1/h2 sekcji, jedna grubość, domyślnie `null`). Kandydaci: Fraunces 600 (35,5 kB), Instrument
  Serif 400 (22,9 kB), Bricolage Grotesque 700 (33 kB); mobile `/` 0,94–0,95 (bez: 0,96).
- Pozostałe osie odłożone („Propozycje odłożone”).

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B**: `dist/` bez formularza + treści i oryginały zdjęć +
   README; źródła tylko przy wykupie. Oddawać zbudowany Worker? (rek.: nie).
2. Blog (przy budowie): sekcja „Najnowsze wpisy” jako 10. typ sekcji (rek.: tak).
   RSS: `@astrojs/rss` — zgoda 2026-11-05.

## Kolejka (uzgodniona kolejność)

1. **Ankieta treści** z JSON-a zapytania → `web/src/tresci/index.ts` (+ `nowy-klient --z-zapytania`).
2. Prawdziwy szkic strony z JSON-a pod adresem podglądu (wymaga 1).
3. Mierzenie czasu wdrożeń w checkliście (+ czas pisania tekstów u 2 pierwszych klientów).
4. `nowy-klient`: dopisek na górze CLAUDE.md w repo klienta.
5. Prototyp zapytania: podgląd własnego koloru (~80 B JS) — zgoda 2026-11-04.
6. `scroll-padding-top` przy `headerPhone: false` — pomiar długiej nazwy.
7. Studio: etykiety „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu” — zgoda 2026-11-04.
8. `pnpm seed --z-tresci` — import `tresci/` do Sanity; ~2–3 h. Odłożone.

**Na zamówienie** (buduje pierwszy płacący klient): blog 6–10 h (tylko z panelem); druga wersja
językowa 15–25 h; opinie Google z Places API; „Mapy Google i katalogi”.

## Do zrobienia przez właściciela

- Push startera (20 commitów, w tym `db60e0e` i `b929ba6`).
- Landing: zdjęcie autora (pionowe 4:5, min. 800 px), prywatne repo na GitHubie, wdrożenie.
- Pokazać nowy cennik i kreator osobie, która testowała landing.
- Sprawdzić u rejestratora ceny odnowienia .pl / .com — przed ofertami.
- Usunąć gabinet-demo, gdy przestanie być potrzebny.
- `pnpm --filter studio seed` — Sanity ma galerię w starym polu `images` i 2 opinie zamiast 6.

## Propozycje odłożone

- Krój nagłówków w obrazach OG (dziś krój treści); powiązanie krojów ze stylami zapytania
  (Spokojny / Rzeczowy / Wyrazisty).
- Różnorodność w całości: warianty hero, dekor, warianty sekcji, układy branżowe.
- Przy usuwaniu gabinet-demo: odwołania w `NOWY-PROJEKT.md` (2×) i `OFERTA.md` — zastąpić opisem.
- `landing-oferta/docs/STAN.md` — stara kopia STAN-u startera; usunąć.
- Cennik na telefonie: przy Witrynie „jednorazowo” spada pod kwotę.
- Mail z potwierdzeniem po wysłaniu zapytania; Umami na VPS (wtedy „Statystyki” wracają).
- Studio po polsku: `@sanity/locale-pl-pl` (zależność — zgoda); zrzut panelu na landingu.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania.
- Menu mobilne otwarte po kliknięciu bieżącej strony (zamknięcie = skrypt — zgoda).
- Pauza „—” w treściach przykładowych startera; animacja FAQ z landingu do startera; ComfyUI.

## Niezweryfikowane

- Do prawnika: polityka prywatności, licencja, klauzula wyjścia, wzrost kosztów utrzymania,
  administrator danych na landingu, prawo odstąpienia dla konsumentów.
- `wrangler dev` / Cloudflare: Workery `/api/zapytanie` i `/api/kontakt` (w tym `readFormData`).
- Safari/Firefox i prawdziwy telefon: kreator, cennik, kształty zdjęć, krój nagłówków.
- CI na GitHubie (Lighthouse bez AdGuarda) — nieuruchomione; lokalnie BP 0,81–0,82 przez AdGuarda.
- Ceny odnowienia .pl/.com; Resend Free (1 czy 3 domeny); limity Sanity Free; stawki copywritingu,
  Plausible, Places API — z pamięci. `pnpm nowy-klient` na świeżym klonie — nieuruchomiony.
