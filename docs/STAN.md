# Stan projektu

**Aktualizacja: 2026-11-03.** Ten plik się **nadpisuje** na koniec każdej sesji (`/koniec`).
Historia i uzasadnienia: `docs/POSTEP.md` (tylko dopisywanie). Jak pracować z sesjami: `docs/SESJE.md`.

## Repozytoria

Stan z końca sesji — `/start` porównuje go z `git status -sb`.

| Repo | Rola | Stan |
| --- | --- | --- |
| `D:\dev\sanity` | starter, źródło prawdy | GitHub do `a021291`; lokalnie commity od `8c6e85f` (telefon w nagłówku, polityka prywatności, dokumenty) |
| `D:\dev\gabinet-demo` | projekt przykładowy (bez CMS-u, jedna strona) | lokalnie, ostatni `7deccf1`; remote `starter` |
| `D:\dev\zapytanie-ofertowe` | prototyp formularza zapytania (`node server.mjs` → :4400) | lokalne repo bez remote, ostatni `835beac`, tag `v1-przed-stylami` |
| `D:\dev\zlecenia\` | dokumenty zleceń (poza repo — dane klientów) | jedno aktywne zlecenie, niżej |

## Aktywne zlecenia

- **Gabinet psychoterapii (Kraków)** — `D:\dev\zlecenia\gabinet-psychoterapii-krakow\ZLECENIE.md`.
  Jedna strona z kotwicami, wariant bez CMS-u. Status: mail z pytaniami gotowy, **niewysłany**;
  oferta bez ceny. Blokuje: cena/termin/rundy poprawek, umowa, `git push` startera, domena klienta.

## Do decyzji (właściciel)

1. **Eksport przy rozstaniu — wariant B:** `dist/` bez formularza + treści i oryginały zdjęć +
   `_redirects`/`.htaccess` + README; źródła tylko przy wykupie (`--zrodla`). Oddawać zbudowany
   Worker formularza? (rekomendacja: nie). Pociąga zmiany w PRZEKAZANIE.md i OFERTA.md.
2. **Pole „Pokaż formularz” w sekcji „Kontakt”** — realizuje „klient ma wybór” i eksport bez formularza.
3. **OFERTA.md:** ceny; limit adresów w przenoszeniu; abonament „Wizytówki” obowiązkowy?; liczba
   rund poprawek; Lighthouse „przy oddaniu”; bez „zgodna z WCAG”; copywriting nie „za podstronę”;
   „dane na bieżąco” > budżet JS; szkolenie → nagranie; zmiany w abonamencie przez formularz z limitem.
4. Podgląd własnego koloru w prototypie — jedna linia JS (~80 B).
5. `scroll-padding-top` przy `headerPhone: false` — zmniejszyć po pomiarze długiej nazwy (~55 zn.).
6. Etykiety stylów w Studio „Nagłówek 2/3” → „Śródtytuł” / „Śródtytuł niższego rzędu”.

## Kolejka (uzgodniona kolejność)

1. **Presety stylów w starterze** (Spokojny / Rzeczowy / Wyrazisty) + osobny krój nagłówków.
   Kandydaci: Fraunces 70 kB, Instrument Serif 33 kB, Bricolage Grotesque 60 kB — zmierzyć wpływ
   na mobile perf. Prototyp ma podgląd na krojach systemowych.
2. **Ankieta treści** z JSON-a zapytania → `web/src/tresci/index.ts` (+ `nowy-klient --z-zapytania`).
3. Prawdziwy szkic strony z JSON-a pod adresem podglądu (wymaga 2).
4. Formularz „zgłoś zmianę” dla abonamentu.
5. gabinet-demo pod publicznym adresem (wymaga zgody — wdrożenie).
6. Mierzenie czasu wdrożeń w checkliście.
7. `nowy-klient`: dopisek na górze CLAUDE.md w repo klienta („to repo klienta X, zlecenie w docs/ZLECENIE.md”).

## Propozycje odłożone

- ComfyUI jako lokalny skrypt do poprawy zdjęć klienta / grafik dekoracyjnych (nie w buildzie,
  nie „prawdziwe” zdjęcia firmy, sprawdzić licencje modeli). Niski priorytet.

## Niezweryfikowane

- Treść wzoru polityki prywatności, licencja i klauzula wyjścia — do prawnika.
- CI na GitHubie (nowe kroki, Lighthouse bez AdGuarda) — nieuruchomione.
- Firefox/Safari: `:target-current` (podświetlanie menu), wysokość nagłówka.
