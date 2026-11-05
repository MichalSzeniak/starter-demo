# Stan projektu

**Aktualizacja: 2026-11-05 (sesja 5 — telefon w hero i tagline landingu).** Ten plik się
**nadpisuje** na koniec każdej sesji (`/koniec`). Historia: `docs/POSTEP.md` (tylko dopisywanie).
Sesje: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub = `a929d60`; lokalnie 2 commity dokumentów ponad `origin/main` (`a59d15d` + commit z `/koniec` sesji 5) |
| `D:\dev\landing-oferta` | landing z ofertą (własny design) | lokalne, bez GitHuba; ostatni `611b357`; `starter` = `D:\dev\sanity` (push wyłączony), pobrany do `a929d60` |
| `D:\dev\gabinet-demo` | projekt przykładowy (bez CMS-u, jedna strona) | lokalnie, ostatni `7deccf1`; `starter/main` nieodświeżony; przy pobraniu startera konflikt w `brand.ts` |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne repo bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona z kotwicami, bez CMS-u. Mail z pytaniami gotowy, **niewysłany** (sekcja 7 do
  korekty pod utrzymanie roczne). Blokuje: cena pakietu, termin, rundy poprawek, umowa.

## Model rozliczeń (OFERTA.md „Utrzymanie roczne”)

- Strona jednorazowo + **utrzymanie 300 zł/rok**; zmiany 30 dni za darmo (do 2 h), potem
  **150 zł/h od 30 min**; domena przez wykonawcę, abonentem klient.

## Landing `oferta.emes.dev` (szczegóły: `docs/LANDING.md` w repo landingu)

- Żółta góra, atrament, papier na co drugiej sekcji, bez kobaltu; znak „emes_”, favicon „e_”.
- Tagline / metaTitle / „o mnie”: **„Strony internetowe dla firm i specjalistów”** (2026-11-05).
- Telefon w hero: rower → fizjoterapia → kawiarnia → **rower wraca tak samo jak pozostałe**
  (przecieranie od góry, sekcje po kolei), ~14,5 s, potem stoi. Błąd z nakładaniem się stron
  naprawiony w sesji 5 (POSTEP 2026-11-05).
- JS strony głównej 1339 B (formularz + menu).
- Przed publikacją: zdjęcie autora, obraz OG, polityka do prawnika, analityka, GitHub + wdrożenie.

## Różnorodność stron (w toku)

- Zrobione: `style.shape`, `style.spacing`, `imageShape`, opinie siatka/karuzela.
- Dalej: krój nagłówków, warianty hero, dekor, warianty sekcji, układy dla branż (z ankietą).

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B**: `dist/` bez formularza + treści i oryginały zdjęć +
   README; źródła tylko przy wykupie. Oddawać zbudowany Worker? (rek.: nie).
2. **OFERTA.md:** ceny pakietów (landing: 1 900 / 3 900 zł — przenieść?); rundy poprawek; limit
   adresów w przenoszeniu; Lighthouse „przy oddaniu”; bez „zgodna z WCAG”; szkolenie → nagranie.
3. Minimalna jednostka zmian 30 min — wpisana z rekomendacji, nie potwierdzona wprost.
4. Formularz zapytania: „Co odwiedzający ma zobaczyć najpierw?” — dodać? („Jakie masz zdjęcia?”
   odrzucone jako słabe w tej formie.)
5. Kierunek z osiami w całości (krój, hero, dekor, warianty sekcji, układy branżowe).
6. Landing, telefon: pusty ekran ~0,35 s przy przejściach — zostawić czy skrócić; czwarta strona
   (rek.: zostać przy trzech) — po obejrzeniu na żywo.
7. Landing: obraz OG (dziś atramentowy z tytułu); GitHub (prywatne) i wdrożenie.
8. `git push` startera — 2 commity dokumentów czekają.

## Kolejka (uzgodniona kolejność)

1. **Landing — domknięcie:** decyzje 6–7, zdjęcie autora, potem publikacja (wymaga zgody).
2. **Krój nagłówków** — Fraunces 70 kB, Instrument Serif 33 kB, Bricolage Grotesque 60 kB; pomiar.
3. **Ankieta treści** z JSON-a zapytania → `web/src/tresci/index.ts` (+ `nowy-klient --z-zapytania`).
4. Prawdziwy szkic strony z JSON-a pod adresem podglądu (wymaga 3).
5. gabinet-demo pod publicznym adresem (wymaga zgody — wdrożenie).
6. Mierzenie czasu wdrożeń w checkliście.
7. `nowy-klient`: dopisek na górze CLAUDE.md w repo klienta.
8. Prototyp zapytania: podgląd własnego koloru (~80 B JS) — zgoda 2026-11-04.
9. `scroll-padding-top` przy `headerPhone: false` — pomiar długiej nazwy.
10. Studio: etykiety „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu” — zgoda 2026-11-04.

## Do zrobienia przez właściciela

- Obejrzeć animację telefonu na żywo (`pnpm --filter web dev` w `landing-oferta`) → decyzja 6.
- `pnpm --filter studio seed` — Sanity ma galerię w starym polu `images` i 2 opinie zamiast 6.
- Zdjęcie do „Kto zrobi Twoją stronę” (pionowe 4:5, min. 800 px).

## Propozycje odłożone

- ComfyUI jako lokalny skrypt do poprawy zdjęć klienta. Niski priorytet.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania.
- Menu mobilne zostaje otwarte po kliknięciu bieżącej strony (zamknięcie = skrypt — wymaga zgody).
- Pauza „—” w treściach przykładowych startera (`tresci/index.ts`, `fixtures.ts`, seed).
- Animacja rozwijania FAQ (z landingu) do startera — `faq` i `<details>` w sekcjach startera.

## Niezweryfikowane

- Polityka prywatności (wzór + sekcja o zapytaniu), licencja, klauzula wyjścia — do prawnika.
- Landing: telefon i FAQ na żywo, na telefonie, w Safari/Firefox (telefon sprawdzony tylko na
  klatkach z puppeteera); Lighthouse po sesji 5; plakietka „emes_” poniżej 500 px; Worker
  `/api/zapytanie` w `wrangler dev` / na Cloudflare.
- CI na GitHubie (Lighthouse bez AdGuarda) — nieuruchomione; lokalnie BP 0,82 przez AdGuarda.
- Kształty zdjęć na prawdziwym telefonie i w Safari/Firefox; `imageShape` z hotspotem ze Studio.
- Firefox/Safari: `:target-current` (podświetlanie menu), wysokość nagłówka.
- Resend Free: 1 czy 3 domeny; ceny odnowienia .pl; procedura .pl przez pośrednika.
- `pnpm nowy-klient` na świeżym klonie — czy start jest bez błędów (nie uruchamiano).
