# Stan projektu

**Aktualizacja: 2026-11-04 (sesja 3).** Ten plik się **nadpisuje** na koniec każdej sesji (`/koniec`).
Historia i uzasadnienia: `docs/POSTEP.md` (tylko dopisywanie). Jak pracować z sesjami: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub do `d2838b6`; lokalnie 8 commitów ponad `origin/main` (7 z sesji 3, ostatni kodu `54ffb34`, potem commit dokumentów) |
| `D:\dev\gabinet-demo` | projekt przykładowy (bez CMS-u, jedna strona) | lokalnie, ostatni `7deccf1`; `starter/main` nieodświeżony (fetch); przy pobraniu startera konflikt w `brand.ts` |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne repo bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\landing-oferta` | landing z ofertą (do założenia) | jeszcze nie istnieje |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona z kotwicami, wariant bez CMS-u. Mail z pytaniami gotowy, **niewysłany**
  (sekcja 7 do korekty pod utrzymanie roczne). Blokuje: cena pakietu, termin, rundy poprawek, umowa.

## Model rozliczeń (OFERTA.md „Utrzymanie roczne”)

- Strona jednorazowo + **utrzymanie 300 zł/rok** (domena, hosting, formularz, kopie, poprawki).
- Zmiany: 30 dni po uruchomieniu za darmo (do 2 h), potem **150 zł/h od 30 min**; błąd ≠ zmiana.
- Domena przez wykonawcę, abonentem klient. Formularze z jednej domeny wykonawcy (`CONTACT_FROM`).

## Landing z ofertą — następny temat (praca autonomiczna)

- Repo `D:\dev\landing-oferta`: klon startera według `NOWY-PROJEKT.md`, wariant bez CMS-u,
  remote `starter`, **bez GitHuba i bez wdrożenia**.
- Zakres: `/` z ofertą (sekcje startera) + `/zapytanie` przeniesione z prototypu (CSS, 0 B JS),
  endpoint w Workerze (Resend, `CONTACT_TO` tylko w sekrecie), test lokalny bez wysyłki maili.
  Jeden moduł TS z opcjami dla strony i Workera (reguła pakietu, lista materiałów).
- Treść: wynik i wygoda, nie technologia; nie „bez spotkań” — „szczegóły w formularzu, dalej
  mailowo”. Czego nie obiecywać: POSTEP 2026-11-04 „Landing z ofertą”.
- **Ceny:** Claude analizuje rynek i wpisuje rozsądne — właściciel zmieni.
- Bez danych osobowych właściciela w kodzie — placeholdery.

## Różnorodność stron (w toku)

- Zrobione: `style.shape`, `style.spacing` (`brand.ts`), `imageShape` w hero i textImage
  (per sekcja), opinie siatka/karuzela. Pionowy pasek postępu odrzucony.
- Dalej: krój nagłówków (para krojów + pomiar mobile), warianty hero, dekor, warianty sekcji,
  układy sekcji dla branż (z ankietą treści). Bez rejestru wdrożeń i bez losowania.
- Nazwy w kodzie po angielsku; ustawienia stylu w kodzie, nie w Studio.

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B** („do przemyślenia”): `dist/` bez formularza + treści
   i oryginały zdjęć + README; źródła tylko przy wykupie. Oddawać zbudowany Worker? (rek.: nie).
2. **OFERTA.md:** ceny pakietów (landing przyniesie propozycję); rundy poprawek; limit adresów
   w przenoszeniu; Lighthouse „przy oddaniu”; bez „zgodna z WCAG”; szkolenie → nagranie.
3. Minimalna jednostka zmian 30 min — wpisana z rekomendacji, nie potwierdzona wprost.
4. Formularz zapytania: 2 pytania „Jakie masz zdjęcia?” i „Co odwiedzający ma zobaczyć najpierw?”.
5. Kierunek z osiami w całości (krój, hero, dekor, warianty sekcji, układy branżowe).

## Kolejka (uzgodniona kolejność)

1. **Landing z ofertą** (wyżej).
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

- `pnpm --filter studio seed` — Sanity ma galerię w starym polu `images` (strona pokazuje pustą
  galerię) i 2 opinie zamiast 6. Bezpieczne: dokumenty demo nieedytowane od 2026-09-12.
  Claude nie uruchomi (blokada auto mode).

## Propozycje odłożone

- ComfyUI jako lokalny skrypt do poprawy zdjęć klienta. Niski priorytet.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania.
- Menu mobilne zostaje otwarte po kliknięciu bieżącej strony (zamknięcie = skrypt menu na każdej
  podstronie — wymaga zgody).

## Niezweryfikowane

- Treść wzoru polityki prywatności, licencja i klauzula wyjścia — do prawnika.
- CI na GitHubie (Lighthouse bez AdGuarda) — nieuruchomione; lokalnie BP 0,81–0,82 przez AdGuarda.
- Kształty zdjęć na prawdziwym telefonie i w Safari/Firefox; `imageShape` z hotspotem ze Studio.
- Wartości `sharp`/`round`, `compact`/`airy` — nieoglądane obok siebie.
- Firefox/Safari: `:target-current` (podświetlanie menu), wysokość nagłówka.
- Resend Free: 1 czy 3 domeny; ceny odnowienia .pl; procedura .pl przez pośrednika.
- `pnpm nowy-klient` na świeżym klonie — czy start jest bez błędów (nie uruchamiano).
