# Oferta — pakiety, dodatki, abonament

Baza do oferty i strony ofertowej, zgodna z tym, co starter umie **dziś**. Zmienia się razem
ze starterem: nowa możliwość albo dodatek z „Odłożonych" wdrożony u klienta → popraw ten plik.

Zasada: **pakiet sprzedaje wynik, dodatek — realną pracę.** Rzeczy, które starter robi sam,
są w standardzie, nie w cenniku. Ceny (`____ zł`) ustalasz Ty.

Teksty w punktach są pisane do klienta — można je przenieść na stronę ofertową.
Uwagi wewnętrzne są oznaczone „Dla Ciebie".

---

## W każdym pakiecie

- **Strona szybka na telefonie** — wynik Google Lighthouse: 100 na komputerze, co najmniej
  90 na telefonie. Bez wtyczek i ciężkich skryptów.
- **Gotowa pod Google** — każda podstrona ma tytuł, opis i adres kanoniczny; mapa strony
  (sitemap), dane firmy w formacie zrozumiałym dla Google (dane strukturalne firmy lokalnej),
  zgodne z wizytówką Google. Strona nie zostanie opublikowana, jeśli czegoś brakuje.
- **Ładny podgląd linku** na Facebooku, LinkedInie i w komunikatorach — obrazek generowany
  dla każdej podstrony.
- **Formularz kontaktowy** z ochroną przed spamem (pułapka na boty, limit zgłoszeń), zgodą RODO
  i wzorem klauzuli informacyjnej.
- **Kontakt i dojazd** — dane, godziny otwarcia i przycisk „Jak dojechać" (Google Maps).
- **Dostępność** — wynik Lighthouse „Dostępność" 100, kontrast kolorów na poziomie WCAG AA
  (kolor firmowy sprawdzany automatycznie), menu i FAQ obsługiwane klawiaturą.
- **Statystyki odwiedzin bez cookies** (Plausible albo Umami) — bez baneru zgody.
- **Subtelne animacje** albo wcale — do wyboru.
- **Przeniesienie ze starej strony** — ważne adresy przekierowane, żeby nie stracić pozycji
  w Google.
- **Podłączenie Google Search Console** i zgłoszenie mapy strony.

> Dla Ciebie: to wszystko wynika ze startera i checklisty — koszt dla Ciebie to minuty.
> Dlatego nie ma tego w cenniku. Analityka Plausible/Umami ma własny koszt subskrypcji
> (albo darmowy plan) — ustal, czy wliczasz go w abonament.

---

## Pakiet „Wizytówka" — jedna strona

Dla firm, którym wystarczy jedna przewijana strona: kto, co, za ile, jak się skontaktować.

| | |
| --- | --- |
| Cena | `____ zł` |
| Zakres | jedna strona z sekcjami z biblioteki (zwykle 5–8), menu przewijające do sekcji |
| Treści zmienia | wykonawca, w ramach abonamentu (bez panelu) |
| Termin | `__` dni roboczych od kompletu materiałów |

Klient dostarcza (brief): dane firmy (A), domena i poczta (B), logo i kolor (C), treść
strony (D), minimum 3 zdjęcia (E), adres do formularza (H), osoba do kontaktu (K).

> Dla Ciebie: wariant bez CMS-u + strona jednostronicowa (`NOWY-PROJEKT.md`). Przykład:
> `D:\dev\gabinet-demo`. Uprzedź klienta: jedna strona = jeden tytuł i opis w Google.

## Pakiet „Firma" — do 5 podstron z panelem

Dla firm, które chcą same zmieniać telefon, godziny, cennik czy zdjęcia.

| | |
| --- | --- |
| Cena | `____ zł` |
| Zakres | do 5 podstron (np. Główna, O nas, Oferta, Cennik, Kontakt) z sekcji z biblioteki |
| Treści zmienia | klient, w panelu; zmiana na stronie po ok. 5 minutach |
| W cenie dodatkowo | panel w przeglądarce, instrukcja PDF, krótkie szkolenie, nocna kopia zapasowa treści |
| Termin | `__` dni roboczych od kompletu materiałów |

Klient dostarcza: jak w „Wizytówce" plus treści i zdjęcia dla każdej podstrony (D, E),
osoba, która będzie edytować treści (J).

> Dla Ciebie: wariant z panelem Sanity. Szkolenie = „Test klienta" z checklisty (zmiana
> telefonu w < 60 s). Panel nie ma podglądu wersji roboczej — zmiany widać po publikacji.

### Biblioteka sekcji (oba pakiety)

Nagłówek powitalny · Tekst z obrazem · Atuty · Cennik · Opinie klientów · Najczęstsze pytania ·
Galeria (siatka albo przewijana) · Kontakt · Wezwanie do działania.

---

## Dodatki

### Z biblioteki — szybkie dla Ciebie, wyceniane od wartości

| Dodatek | Cena | Dla Ciebie |
| --- | --- | --- |
| Kolejna podstrona | `____ zł` | treść, zdjęcia i SEO każdej podstrony — realna praca |
| Panel do edycji w „Wizytówce" | `____ zł` | przejście na wariant z panelem; najprościej od startu |
| Projekt graficzny indywidualny | `____ zł` | starter daje motyw (kolor, font, zaokrąglenia); układ poza biblioteką = projekt |
| Teksty na stronę (copywriting) | `____ zł` / podstrona | realny czas pisania |

### Budowane na zamówienie — wycena indywidualna

Nie ma ich w starterze. Pierwszy klient, który za nie zapłaci, finansuje ich wbudowanie
w starter (zasada z POSTEP, „Odłożone").

| Dodatek | Dla Ciebie: szacunek z POSTEP |
| --- | --- |
| Blog / aktualności | 1,5–2 h na wdrożenie (po zbudowaniu raz) |
| Druga wersja językowa | 15–25 h — najdroższa pozycja |
| Menu restauracji (gastro) | 6–8 h; wymaga panelu i płatnego planu Sanity |
| Dane na bieżąco (menu dnia, oferty pracy) | 4–6 h, ok. 10–15 kB JS na tych stronach |
| Karuzela w opiniach | ok. 1 h; sens od 5–6 opinii |
| Google Analytics / Tag Manager / Meta Pixel z banerem zgody | wymaga baneru cookies — nowy skrypt, decyzja wg CLAUDE.md; ryzyko dla wyniku Lighthouse |
| Integracje, kalkulatory, wyszukiwarka, sklep | wycena po rozmowie |

---

## Abonament

| | |
| --- | --- |
| Cena | `____ zł` / mies. |
| Hosting | Cloudflare — strona i formularz |
| Utrzymanie | poprawki i ulepszenia wdrażane we wszystkich stronach (cherry-pick ze startera) |
| Kopie zapasowe | nocne, treści i zdjęcia („Firma") |
| Zmiany treści | „Wizytówka": `__` zmian w miesiącu; „Firma": pomoc przy panelu |
| Domena | pozostaje na kliencie i jest opłacana przez klienta u rejestratora |

Po rozwiązaniu umowy klient dostaje kod strony, treści i dostępy — `docs/PRZEKAZANIE.md`.

---

## Czego nie obiecywać (stan na 2026-11-03)

- **Osadzonej mapy Google** — jest karta „Jak dojechać" z linkiem (decyzja z fazy 5: bez
  klucza API i bez ładowania czegokolwiek od Google).
- **Podstrony „Polityka prywatności" bez zdjęcia** — „Tekst z obrazem" wymaga obrazu,
  a sekcji „sam tekst" nie ma (luka 3, wymaga zgody na dziesiąty typ). Rozwiązać przed
  pierwszą sprzedażą albo dodawać grafikę.
- **Podglądu przed publikacją w panelu** — odłożone.
- **Formularza na hostingu klienta** — działa tylko na Cloudflare Workers. „Klient ma swój
  hosting" = strona tak, formularz nie.

## Terminy — do skalibrowania

Brak pomiarów — pola `__` wypełnij po pierwszych wdrożeniach. Licz od kompletu materiałów
z sekcji „Bez tego nie startuję" w briefie. Dopisuj w checkliście datę startu i uruchomienia.

Na termin wpływa zwykle nie praca, a oczekiwanie: odpowiedź klienta, zmiana DNS u
rejestratora, weryfikacja domeny w Resend. Weryfikacja wizytówki Google (dni do tygodni)
nie blokuje uruchomienia strony.
