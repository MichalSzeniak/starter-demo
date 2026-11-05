# Stan projektu

**Aktualizacja: 2026-11-05 (sesja 8 — cennik na landingu, Witryna 2 900 zł).** Ten plik się
**nadpisuje** na koniec każdej sesji (`/koniec`). Historia: `docs/POSTEP.md` (tylko dopisywanie).
Sesje: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub = `86c1959`; lokalnie 8 commitów dokumentów ponad `origin/main` (OFERTA, checklista, POSTEP/STAN) — **niewypchnięte** |
| `D:\dev\landing-oferta` | landing z ofertą (własny design) | lokalne, bez GitHuba; ostatni `7b7cd4a`; `starter` = `D:\dev\sanity` (push wyłączony), pobrany do `a929d60` |
| `D:\dev\gabinet-demo` | projekt przykładowy (bez CMS-u, jedna strona) | lokalnie, ostatni `7deccf1`; `starter/main` nieodświeżony; przy pobraniu startera konflikt w `brand.ts` |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne repo bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona, bez CMS-u. Mail z pytaniami gotowy, **niewysłany** (sekcja 7 do korekty).
  Z sesji 7 są: cena (Wizytówka 1 900 zł), termin 1–2 tyg., 2 rundy poprawek, płatność 50/50,
  bez VAT. Blokuje: umowa.

## Oferta (OFERTA.md startera; kwoty: `PRICES` w `landing-oferta/web/src/lib/zapytanie.ts`)

- **Dwa pytania:** ile stron → **Wizytówka** od 1 900 zł („Wszystko na jednej stronie”) /
  **Witryna** od **2 900 zł** (do 5 stron z główną, „Osobne strony na ofertę, cennik i kontakt”;
  było 3 100 — zmiana 2026-11-05, sesja 8: pod progiem 3 000, różnica do Wizytówki równo 1 000 zł);
  **panel +800 zł w każdym pakiecie** (blog wymaga panelu).
- Teksty 80 zł za sekcję („fragment strony” na landingu), blog 600 zł; język i „Coś innego” — wycena.
- Utrzymanie 300 zł/rok; zmiany 30 dni za darmo (do 2 h), potem 150 zł/h od 30 min; błędy naprawiane
  bez opłat przez cały czas utrzymania.
- **Działalność nierejestrowana:** ceny końcowe, bez VAT; limit 2026 **10 813,50 zł / kwartał**
  (przychód należny, z utrzymaniem); po przekroczeniu 7 dni na CEIDG.
- Płatność 50% po akceptacji oferty, 50% przed publikacją (+ 1. rok utrzymania); 2 rundy poprawek;
  termin „zwykle 1–2 tygodnie od akceptacji oferty, 1. raty i materiałów”.
- „Mapy Google i katalogi” (~350 zł) — poza cennikiem, najpierw u 1–2 klientów.

## Landing `oferta.emes.dev` (szczegóły: `docs/LANDING.md` w repo landingu)

- Żółta góra, atrament, papier; znak „emes_”. Kreator na białym tle, kroki po kolei.
- JS: strona główna 1339 B, `/zapytanie` 274 B kreatora (zapamiętuje najdalszy krok; zgoda 2026-11-05)
  + 165 B zamykania menu.
- Cennik (sesja 8): karty = tylko różnice pakietów; „W obu pakietach”; wiersze w grupach „Dodatki
  do wyboru” / „Po uruchomieniu”. Ptaszek = w cenie, dopłata nigdy na liście z ptaszkami.
- Teksty pisane dla osoby nietechnicznej, bez obietnic bez pokrycia (statystyki zdjęte do czasu
  Umami; „Gotowa pod Google” bez „formatu dla AI”). „Realizacje” = demo bez podpisu — świadomie,
  do zmiany po pierwszych projektach.
- Przed publikacją: zdjęcie autora, obraz OG, polityka do prawnika, GitHub + wdrożenie.

## Różnorodność stron (w toku)

- Zrobione: `style.shape`, `style.spacing`, `imageShape`, opinie siatka/karuzela.
- Dalej: krój nagłówków, warianty hero, dekor, warianty sekcji, układy dla branż (z ankietą).

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B**: `dist/` bez formularza + treści i oryginały zdjęć +
   README; źródła tylko przy wykupie. Oddawać zbudowany Worker? (rek.: nie).
2. **OFERTA.md:** ceny pakietów (dziś `____`; przenieść 1 900 / 2 900 + panel 800?); limit adresów
   w przenoszeniu; Lighthouse „przy oddaniu”; bez „zgodna z WCAG”; szkolenie → nagranie;
   realne odnowienie .pl przed ruszaniem 300 zł/rok.
3. Minimalna jednostka zmian 30 min — wpisana z rekomendacji, nie potwierdzona wprost.
4. Formularz zapytania: „Co odwiedzający ma zobaczyć najpierw?” — dodać?
5. Kierunek z osiami w całości (krój, hero, dekor, warianty sekcji, układy branżowe).
6. Landing, telefon: pusty ekran ~0,35 s przy przejściach; czwarta strona (rek.: nie) — po obejrzeniu.
7. Landing: obraz OG (dziś atramentowy z tytułu); GitHub (prywatne) i wdrożenie.
8. Blog (przy budowie): sekcja „Najnowsze wpisy” jako 10. typ sekcji? RSS ręcznie czy `@astrojs/rss`?
9. Push startera (8 commitów dokumentów) — wypchnąć?

## Kolejka (uzgodniona kolejność)

1. **Kreator (c):** suma „Razem od X zł + 300 zł rocznie” (liczniki CSS), dopisek „wymaga panelu,
   +800 zł” przy blogu, kroki „Wygląd i dodatki” / „Twoje dane”, ceny w kafelkach w jednym miejscu,
   „sekcja” → „fragment strony”. Kwoty tylko z `PRICES` (muszą się zgadzać z cennikiem — wymóg
   właściciela 2026-11-05). Potem pokazać cennik osobie nietechnicznej.
2. **Landing — domknięcie:** decyzje 6–7, zdjęcie autora, potem publikacja (wymaga zgody).
3. **Krój nagłówków** — Fraunces 70 kB, Instrument Serif 33 kB, Bricolage Grotesque 60 kB; pomiar.
4. **Ankieta treści** z JSON-a zapytania → `web/src/tresci/index.ts` (+ `nowy-klient --z-zapytania`).
5. Prawdziwy szkic strony z JSON-a pod adresem podglądu (wymaga 4).
6. gabinet-demo pod publicznym adresem (wymaga zgody — wdrożenie).
7. Mierzenie czasu wdrożeń w checkliście (+ czas pisania tekstów u 2 pierwszych klientów).
8. `nowy-klient`: dopisek na górze CLAUDE.md w repo klienta.
9. Prototyp zapytania: podgląd własnego koloru (~80 B JS) — zgoda 2026-11-04.
10. `scroll-padding-top` przy `headerPhone: false` — pomiar długiej nazwy.
11. Studio: etykiety „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu” — zgoda 2026-11-04.
12. `pnpm seed --z-tresci` — import `tresci/` do Sanity; ~2–3 h. Odłożone.

**Na zamówienie** (buduje pierwszy płacący klient): blog w starterze 6–10 h (tylko z panelem);
druga wersja językowa 15–25 h; opinie Google przy buildzie z Places API; „Mapy Google i katalogi”.

## Do zrobienia przez właściciela

- Pokazać nowy cennik (sesja 8: nowy układ, Witryna 2 900 zł) osobie, która testowała landing.
- Obejrzeć animację telefonu na żywo (`pnpm --filter web dev` w `landing-oferta`) → decyzja 6.
- `pnpm --filter studio seed` — Sanity ma galerię w starym polu `images` i 2 opinie zamiast 6.
- Zdjęcie do „Kto zrobi Twoją stronę” (pionowe 4:5, min. 800 px).

## Propozycje odłożone

- Cennik na telefonie: przy Witrynie „jednorazowo” spada pod kwotę (przy Wizytówce mieści się obok).
- `landing-oferta/docs/STAN.md` — stara kopia STAN-u startera z klonu (m.in. „Firma od 3 900 zł”);
  usunąć albo zastąpić odsyłaczem do STAN-u startera.
- Mail z potwierdzeniem do klienta po wysłaniu zapytania (tylko stały tekst i zaznaczenia).
- Umami na VPS (statystyki bez cookies, link dla klienta) — wtedy „Statystyki” wracają na landing.
- Studio po polsku: `@sanity/locale-pl-pl` (nowa zależność — zgoda). Dziś przyciski po angielsku.
- Zrzut panelu (np. zmiana godzin) na landingu przy opisie panelu.
- ComfyUI jako lokalny skrypt do poprawy zdjęć klienta. Niski priorytet.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania.
- Menu mobilne zostaje otwarte po kliknięciu bieżącej strony (zamknięcie = skrypt — wymaga zgody).
- Pauza „—” w treściach przykładowych startera (`tresci/index.ts`, `fixtures.ts`, seed).
- Animacja rozwijania FAQ (z landingu) do startera — `faq` i `<details>` w sekcjach startera.

## Niezweryfikowane

- Do prawnika: polityka prywatności, licencja, klauzula wyjścia, wzrost kosztów utrzymania;
  przy działalności nierejestrowanej — administrator danych w polityce landingu, prawo odstąpienia
  dla konsumentów i jednoosobowych firm.
- Landing: Worker `/api/zapytanie` w `wrangler dev` / na Cloudflare (logika tylko w Node); kreator,
  cennik i telefon w Safari/Firefox i na prawdziwym telefonie.
- CI na GitHubie (Lighthouse bez AdGuarda) — nieuruchomione; lokalnie BP 0,81–0,82 przez AdGuarda.
- Kształty zdjęć na telefonie i w Safari/Firefox; `:target-current` i wysokość nagłówka w Firefox/Safari.
- Resend Free: 1 czy 3 domeny; ceny odnowienia .pl; Sanity Free: limit projektów na organizację.
- Stawki copywritingu, Plausible (~9 USD/mies.), Google Places API — z pamięci, niesprawdzone.
- `pnpm nowy-klient` na świeżym klonie — czy start jest bez błędów (nie uruchamiano).
