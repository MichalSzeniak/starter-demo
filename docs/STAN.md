# Stan projektu

**Aktualizacja: 2026-11-04 (sesja 4 — przegląd landingu).** Ten plik się **nadpisuje** na koniec
każdej sesji (`/koniec`). Historia: `docs/POSTEP.md` (tylko dopisywanie). Sesje: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub = `a929d60` (wypchnięty 2026-11-04 wieczorem); dalej tylko commity dokumentów |
| `D:\dev\landing-oferta` | landing z ofertą (własny design) | lokalne, bez GitHuba; ostatni `187ef41` (naprawa telefonu w hero); `starter` = `D:\dev\sanity` (push wyłączony), pobrany do `a929d60` |
| `D:\dev\gabinet-demo` | projekt przykładowy (bez CMS-u, jedna strona) | lokalnie, ostatni `7deccf1`; `starter/main` nieodświeżony; przy pobraniu startera konflikt w `brand.ts` |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne repo bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

`D:\dev\landing` (stara próba, origin = publiczne `starter-demo`) — usunięty w sesji 4.

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona z kotwicami, bez CMS-u. Mail z pytaniami gotowy, **niewysłany** (sekcja 7 do
  korekty pod utrzymanie roczne). Blokuje: cena pakietu, termin, rundy poprawek, umowa.

## Model rozliczeń (OFERTA.md „Utrzymanie roczne”)

- Strona jednorazowo + **utrzymanie 300 zł/rok**; zmiany 30 dni za darmo (do 2 h), potem
  **150 zł/h od 30 min**; domena przez wykonawcę, abonentem klient.

## Landing `oferta.emes.dev` — po przeglądzie (szczegóły: `docs/LANDING.md` w repo landingu)

- Żółta góra (nagłówek + hero), atrament, papier na co drugiej sekcji, **bez kobaltu**; znak
  „emes_”, favicon „e_”. Żółty tylko: góra, kwoty, numery kroków, hover, pas CTA.
- Sekcje: co dostajesz, czym się różni (kreator/WordPress), realizacje (**zrzuty demo**),
  kto zrobi Twoją stronę (CV bez nazw pracodawców), jak to wygląda, ceny (kwoty = cały koszt),
  FAQ (płynne rozwijanie), wiadomość, CTA. Telefon w hero: 3 przykładowe strony, jedno okrążenie.
- JS strony głównej 1339 B (formularz + menu). Skrypt „klik logo → animacja” odrzucony.
- Przed publikacją: zdjęcie autora, obraz OG, polityka do prawnika, analityka, GitHub + wdrożenie.

## Różnorodność stron (w toku)

- Zrobione: `style.shape`, `style.spacing`, `imageShape`, opinie siatka/karuzela.
- Dalej: krój nagłówków, warianty hero, dekor, warianty sekcji, układy dla branż (z ankietą).
- Nazwy w kodzie po angielsku; ustawienia stylu w kodzie, nie w Studio.

## Decyzje sesji 5 (2026-11-05)

- Pytanie „Jakie masz zdjęcia?” do formularza zapytania — **za słabe w tej formie** (decyzja 4,
  część pierwsza). Drugie pytanie bez odpowiedzi.
- Landing, tagline / metaTitle / „o mnie”: **„Strony internetowe dla firm i specjalistów”**
  (decyzja 6).
- Telefon w hero: zgłoszony błąd — widać dwie strony, długi biały ekran, trzeciej brak
  (decyzja 7 → najpierw naprawa). Przyczyna: `.lp-site + .lp-site` wygrywał szczegółowością
  z opóźnieniem `.lp-site--cafe`, kawiarnia wjeżdżała pusta razem z fizjoterapią. Naprawione
  (lokalnie, bez commita) + na końcu pierwsza strona **wchodzi tak samo jak pozostałe**
  (przecieranie od góry, sekcje po kolei) zamiast pojawić się spod ścieranej. Okrążenie ~14,5 s.
- `git push` startera (dawna decyzja 9) — już zrobiony, `origin/main` = `a929d60`.

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B**: `dist/` bez formularza + treści i oryginały zdjęć +
   README; źródła tylko przy wykupie. Oddawać zbudowany Worker? (rek.: nie).
2. **OFERTA.md:** ceny pakietów (landing: 1 900 / 3 900 zł — przenieść?); rundy poprawek; limit
   adresów w przenoszeniu; Lighthouse „przy oddaniu”; bez „zgodna z WCAG”; szkolenie → nagranie.
3. Minimalna jednostka zmian 30 min — wpisana z rekomendacji, nie potwierdzona wprost.
4. Formularz zapytania: 2 pytania „Jakie masz zdjęcia?” i „Co odwiedzający ma zobaczyć najpierw?”.
5. Kierunek z osiami w całości (krój, hero, dekor, warianty sekcji, układy branżowe).
6. Landing: zamiennik „dla małych firm” (rek.: „dla lokalnych firm”) w tagline, metaTitle i „o mnie”.
7. Landing: czwarta strona w telefonie (okrążenie ~17 s; rek.: zostać przy trzech).
8. Landing: obraz OG (dziś atramentowy z tytułu); GitHub (prywatne) i wdrożenie.
9. `git push` startera — zrobione (`a929d60`); ewentualnie wypchnąć commity dokumentów.

## Kolejka (uzgodniona kolejność)

1. **Landing — domknięcie:** decyzje 6–8, zdjęcie autora, potem publikacja (wymaga zgody).
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

- `pnpm --filter studio seed` — Sanity ma galerię w starym polu `images` i 2 opinie zamiast 6.
  Claude nie uruchomi (blokada auto mode).
- Zdjęcie do „Kto zrobi Twoją stronę” (pionowe 4:5, min. 800 px).

## Propozycje odłożone

- ComfyUI jako lokalny skrypt do poprawy zdjęć klienta. Niski priorytet.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania.
- Menu mobilne zostaje otwarte po kliknięciu bieżącej strony (zamknięcie = skrypt — wymaga zgody).
- Pauza „—” w treściach przykładowych startera (`tresci/index.ts`, `fixtures.ts`, seed).
- Animacja rozwijania FAQ (z landingu) do startera — `faq` i `<details>` w sekcjach startera.

## Niezweryfikowane

- Polityka prywatności (wzór + sekcja o zapytaniu), licencja, klauzula wyjścia — do prawnika.
- Landing: animacja telefonu i FAQ na żywo, na telefonie, w Safari/Firefox; plakietka „emes_”
  poniżej 500 px; Worker `/api/zapytanie` w `wrangler dev` / na Cloudflare.
- CI na GitHubie (Lighthouse bez AdGuarda) — nieuruchomione; lokalnie BP 0,82 przez AdGuarda.
- Kształty zdjęć na prawdziwym telefonie i w Safari/Firefox; `imageShape` z hotspotem ze Studio.
- Firefox/Safari: `:target-current` (podświetlanie menu), wysokość nagłówka.
- Resend Free: 1 czy 3 domeny; ceny odnowienia .pl; procedura .pl przez pośrednika.
- `pnpm nowy-klient` na świeżym klonie — czy start jest bez błędów (nie uruchamiano).
