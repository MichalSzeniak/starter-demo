# Stan projektu

**Aktualizacja: 2026-11-05 (sesja 8 — cennik i kreator na landingu, OFERTA.md, limity formularzy).**
Ten plik się **nadpisuje** na koniec każdej sesji (`/koniec`). Historia: `docs/POSTEP.md` (tylko
dopisywanie). Sesje: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub = `86c1959`; lokalnie ponad `origin/main` dokumenty i **kod `db60e0e`** (limit rozmiaru formularza) — **niewypchnięte** |
| `D:\dev\landing-oferta` | landing z ofertą (własny design) | lokalne, bez GitHuba; ostatni `e2b9910`; `starter` = `D:\dev\sanity` (push wyłączony): scalony do `a929d60` + cherry-pick `db60e0e` (`34e0335`); „behind” = dokumenty startera |
| `D:\dev\gabinet-demo` | **projekt podglądowy, do usunięcia** — nie synchronizować | ostatni `7deccf1`; cały kod jest w historii startera (sprawdzone), usunięcie nic nie traci |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne, bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona, bez CMS-u, Wizytówka 1 900 zł. Mail z pytaniami gotowy, **niewysłany** (sekcja 7
  do korekty: domena, kontakt ogólnie). Blokuje ofertę: umowa.

## Oferta (OFERTA.md startera — uzupełniona; kwoty: `PRICES` w `landing-oferta/web/src/lib/zapytanie.ts`)

- **Wizytówka 1 900 zł / Witryna 2 900 zł** (do 5 stron), **panel +800 zł** w każdym pakiecie
  (z panelem 2 700 / 3 700 zł); teksty 80 zł za fragment strony; blog 600 zł (wymaga panelu).
- Utrzymanie 300 zł/rok z domeną **.pl, .com.pl albo .com** (droższa — różnica w odnowieniu
  doliczana; własną klienta przenoszę, kwota bez zmian). Błędy naprawiane bez opłat.
- Zmiany (treść i wygląd) 150 zł/h, **najmniejsze zlecenie = pół godziny (75 zł)**, większe —
  wycena przed pracą; 30 dni po uruchomieniu do 2 h bez dopłaty.
- Bez VAT (działalność nierejestrowana, limit 10 813,50 zł / kwartał). Płatność 50/50, 2 rundy
  poprawek, termin zwykle 1–2 tygodnie. „Mapy Google i katalogi” — poza cennikiem.
- **Kwoty muszą się zgadzać** w cenniku, kreatorze, mailu i OFERTA.md — jedno źródło `PRICES`.

## Landing `oferta.emes.dev` (szczegóły i decyzje: `docs/LANDING.md` w repo landingu)

- Sekcje: co dostajesz → realizacje → o mnie → jak to wygląda → czym to się różni → ceny → pytania.
- Cennik: karty = tylko różnice pakietów, blok „W obu pakietach”, wiersze „Dodatki do wyboru” /
  „Po uruchomieniu”. Kreator: „Razem od X zł + 300 zł rocznie” (CSS = `totalPrice()`).
- Kontakt z wykonawcą ogólnie („dajesz znać”), nie „mailem”. Bez przycisku „do góry” (odrzucone).
- JS: strona główna 1339 B, `/zapytanie` 274 + 165 B. Formularze: limit 32 kB z odczytanych bajtów.
- Przed publikacją: zdjęcie autora, obraz OG, polityka do prawnika, GitHub + wdrożenie.

## Różnorodność stron (w toku)

- Zrobione: `style.shape`, `style.spacing`, `imageShape`, opinie siatka/karuzela.
- Dalej: krój nagłówków, warianty hero, dekor, warianty sekcji, układy dla branż (z ankietą).

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B**: `dist/` bez formularza + treści i oryginały zdjęć +
   README; źródła tylko przy wykupie. Oddawać zbudowany Worker? (rek.: nie).
2. Formularz zapytania: „Co odwiedzający ma zobaczyć najpierw?” — dodać?
3. Kierunek z osiami w całości (krój, hero, dekor, warianty sekcji, układy branżowe).
4. Landing, telefon: pusty ekran ~0,35 s przy przejściach; czwarta strona (rek.: nie) — po obejrzeniu.
5. Landing: obraz OG (dziś atramentowy z tytułu); GitHub (prywatne) i wdrożenie.
6. Blog (przy budowie): sekcja „Najnowsze wpisy” jako 10. typ sekcji? RSS ręcznie czy `@astrojs/rss`?
7. **Push startera** (dokumenty + `db60e0e` z poprawką formularza) — wypchnąć?

## Kolejka (uzgodniona kolejność)

1. **Landing — domknięcie:** decyzje 4–5, zdjęcie autora, potem publikacja (wymaga zgody).
2. **Krój nagłówków** — Fraunces 70 kB, Instrument Serif 33 kB, Bricolage Grotesque 60 kB; pomiar.
3. **Ankieta treści** z JSON-a zapytania → `web/src/tresci/index.ts` (+ `nowy-klient --z-zapytania`).
4. Prawdziwy szkic strony z JSON-a pod adresem podglądu (wymaga 3).
5. Mierzenie czasu wdrożeń w checkliście (+ czas pisania tekstów u 2 pierwszych klientów).
6. `nowy-klient`: dopisek na górze CLAUDE.md w repo klienta.
7. Prototyp zapytania: podgląd własnego koloru (~80 B JS) — zgoda 2026-11-04.
8. `scroll-padding-top` przy `headerPhone: false` — pomiar długiej nazwy.
9. Studio: etykiety „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu” — zgoda 2026-11-04.
10. `pnpm seed --z-tresci` — import `tresci/` do Sanity; ~2–3 h. Odłożone.

**Na zamówienie** (buduje pierwszy płacący klient): blog 6–10 h (tylko z panelem); druga wersja
językowa 15–25 h; opinie Google z Places API; „Mapy Google i katalogi”.

## Do zrobienia przez właściciela

- Pokazać nowy cennik i kreator osobie, która testowała landing.
- Sprawdzić u rejestratora ceny odnowienia .pl / .com (próg „droższej” domeny) — przed ofertami.
- Obejrzeć animację telefonu na żywo (`pnpm --filter web dev` w `landing-oferta`) → decyzja 4.
- Usunąć gabinet-demo, gdy przestanie być potrzebny (odwołania w docs — „Propozycje odłożone”).
- `pnpm --filter studio seed` — Sanity ma galerię w starym polu `images` i 2 opinie zamiast 6.
- Zdjęcie do „Kto zrobi Twoją stronę” (pionowe 4:5, min. 800 px).

## Propozycje odłożone

- Przy usuwaniu gabinet-demo: odwołania w `NOWY-PROJEKT.md` (2×) i `OFERTA.md` — zastąpić opisem.
- `landing-oferta/docs/STAN.md` — stara kopia STAN-u startera („Firma od 3 900 zł”); usunąć.
- Cennik na telefonie: przy Witrynie „jednorazowo” spada pod kwotę.
- Mail z potwierdzeniem do klienta po wysłaniu zapytania; Umami na VPS (wtedy „Statystyki” wracają).
- Studio po polsku: `@sanity/locale-pl-pl` (zależność — zgoda); zrzut panelu na landingu.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania.
- Menu mobilne otwarte po kliknięciu bieżącej strony (zamknięcie = skrypt — zgoda).
- Pauza „—” w treściach przykładowych startera; animacja FAQ z landingu do startera; ComfyUI.

## Niezweryfikowane

- Do prawnika: polityka prywatności, licencja, klauzula wyjścia, wzrost kosztów utrzymania,
  administrator danych na landingu, prawo odstąpienia dla konsumentów.
- `wrangler dev` / Cloudflare: Workery `/api/zapytanie` i `/api/kontakt` (w tym `readFormData`).
- Safari/Firefox i prawdziwy telefon: kreator (suma `round()`/`mod()`), cennik, kształty zdjęć.
- CI na GitHubie (Lighthouse bez AdGuarda) — nieuruchomione; lokalnie BP 0,81–0,82 przez AdGuarda.
- Ceny odnowienia .pl/.com; Resend Free (1 czy 3 domeny); limity Sanity Free; stawki copywritingu,
  Plausible, Places API — z pamięci. `pnpm nowy-klient` na świeżym klonie — nieuruchomiony.
