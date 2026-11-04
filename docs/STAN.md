# Stan projektu

**Aktualizacja: 2026-11-04 (sesja 2).** Ten plik się **nadpisuje** na koniec każdej sesji (`/koniec`).
Historia i uzasadnienia: `docs/POSTEP.md` (tylko dopisywanie). Jak pracować z sesjami: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub do `a021291`; lokalnie 11 commitów ponad `origin/main` (ostatnie: `82e435f` CLAUDE.md — React zakazany, potem commit dokumentów tej sesji) |
| `D:\dev\gabinet-demo` | projekt przykładowy (bez CMS-u, jedna strona) | lokalnie, ostatni `7deccf1`; 13 przed `starter/main` (bo starter niewypchnięty) |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne repo bez remote, ostatni `1b6424f`, tag `v1-przed-stylami` na `22f6872` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona z kotwicami, wariant bez CMS-u. Mail z pytaniami gotowy, **niewysłany**.
  Utrzymanie i stawka już są (niżej); blokuje: cena pakietu, termin, rundy poprawek, umowa,
  `git push` startera.

## Model rozliczeń (ustalony 2026-11-04, OFERTA.md „Utrzymanie roczne”)

- Strona jednorazowo + **utrzymanie 300 zł/rok** na kontach wykonawcy: domena, hosting,
  formularz, kopie, poprawki techniczne. Abonamentu miesięcznego nie ma.
- Zmiany: 30 dni po uruchomieniu za darmo (do 2 h), potem **150 zł/h od 30 min**; błąd ≠ zmiana.
- Domena przez wykonawcę, **abonentem klient**; przy rozstaniu kod AuthInfo.
- Formularze wszystkich klientów wysyłają z jednej domeny wykonawcy (`CONTACT_FROM`).
- Limity darmowych planów liczą się na konto wykonawcy (Resend 100 maili/dzień) — POSTEP 2026-11-04.

## Landing z ofertą (temat w toku)

- Sprzedaje wynik i wygodę, nie technologię; nie pisać „bez spotkań” — „szczegóły w formularzu,
  dalej mailowo”. Formularz: ustalenia tylko mailowo (gotowe w prototypie).
- Stack potwierdzony: Astro bez Reacta, klon startera bez CMS-u, `/` + `/zapytanie`, formularz
  na CSS, endpoint w Workerze, jeden moduł TS z opcjami. Promptu nie zapisujemy.
- Przed landingiem warto mieć pomiar czasu wdrożenia (kolejka 5).

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B** („do przemyślenia”): `dist/` bez formularza + treści
   i oryginały zdjęć + `_redirects`/`.htaccess` + README; źródła tylko przy wykupie (`--zrodla`).
   Oddawać zbudowany Worker formularza? (rekomendacja: nie). Po decyzji: PRZEKAZANIE.md
   (licencja, „kod strony”) i „stronę do przeniesienia” w OFERTA.md.
2. **OFERTA.md:** ceny pakietów; liczba rund poprawek; limit adresów w przenoszeniu; Lighthouse
   „przy oddaniu”; bez „zgodna z WCAG”; copywriting nie „za podstronę”; szkolenie → nagranie.
3. Minimalna jednostka zmian 30 min — wpisana z rekomendacji, nie potwierdzona wprost.

## Kolejka (uzgodniona kolejność)

1. **Presety stylów w starterze** (Spokojny / Rzeczowy / Wyrazisty) + osobny krój nagłówków.
   Kandydaci: Fraunces 70 kB, Instrument Serif 33 kB, Bricolage Grotesque 60 kB — zmierzyć wpływ
   na mobile perf. Prototyp ma podgląd na krojach systemowych.
2. **Ankieta treści** z JSON-a zapytania → `web/src/tresci/index.ts` (+ `nowy-klient --z-zapytania`).
3. Prawdziwy szkic strony z JSON-a pod adresem podglądu (wymaga 2).
4. gabinet-demo pod publicznym adresem (wymaga zgody — wdrożenie).
5. Mierzenie czasu wdrożeń w checkliście.
6. `nowy-klient`: dopisek na górze CLAUDE.md w repo klienta („to repo klienta X, zlecenie w docs/ZLECENIE.md”).
7. Prototyp zapytania: podgląd własnego koloru (jedna linia JS, ~80 B) — zgoda 2026-11-04.
8. `scroll-padding-top` przy `headerPhone: false` — pomiar długiej nazwy (~55 zn.), zmiana tylko gdy warto.
9. Studio: etykiety stylów „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu” — zgoda 2026-11-04.

## Propozycje odłożone

- ComfyUI jako lokalny skrypt do poprawy zdjęć klienta / grafik dekoracyjnych (nie w buildzie,
  nie „prawdziwe” zdjęcia firmy, sprawdzić licencje modeli). Niski priorytet.
- Opcje „Telefonicznie” / „Rozmowa online” w polu `ustalenia` formularza zapytania (wraca wtedy
  pole telefonu).

## Niezweryfikowane

- Treść wzoru polityki prywatności, licencja i klauzula wyjścia — do prawnika.
- CI na GitHubie (nowe kroki, Lighthouse bez AdGuarda) — nieuruchomione.
- Firefox/Safari: `:target-current` (podświetlanie menu), wysokość nagłówka.
- Krok 4 prototypu po usunięciu telefonu — sprawdzony tylko curl-em, nie w przeglądarce.
- Resend Free: 1 czy 3 domeny; ceny odnowienia .pl; procedura .pl przez pośrednika (z regulaminów
  rejestratorów, nie z NASK).
- `pnpm nowy-klient` na świeżym klonie — czy start jest bez błędów (właściciel pytał; z kodu
  wynika, że usunięcie obrazów demo nie psuje startu; nie uruchamiano).
