# Oferta — pakiety, dodatki, utrzymanie roczne

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
- **Polityka prywatności** przygotowana z danych firmy i zgodna z tym, co strona robi naprawdę
  (formularz, hosting, statystyki) — do Twojej akceptacji.
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
> (albo darmowy plan) — ustal, czy wliczasz go w utrzymanie roczne.

---

Dwa niezależne pytania (decyzja 2026-11-05): **ile stron** wybiera pakiet, **kto zmienia
treści** — panel za dopłatą 800 zł, w każdym pakiecie. Panel jest też warunkiem bloga.

## Pakiet „Wizytówka" — jedna strona

Dla firm, którym wystarczy jedna przewijana strona: kto, co, za ile, jak się skontaktować.

| | |
| --- | --- |
| Cena | `____ zł` |
| Zakres | jedna strona z sekcjami z biblioteki (zwykle 5–8), menu przewijające do sekcji |
| Treści zmienia | wykonawca, płatnie za godzinę (bez panelu); 30 dni po uruchomieniu — za darmo. Panel do samodzielnych zmian za dopłatą 800 zł |
| Termin | `__` dni roboczych od kompletu materiałów |

Klient dostarcza (brief): dane firmy (A), domena i poczta (B), logo i kolor (C), treść
strony (D), minimum 3 zdjęcia (E), adres do formularza (H), osoba do kontaktu (K).

> Dla Ciebie: wariant bez CMS-u + strona jednostronicowa (`NOWY-PROJEKT.md`). Przykład:
> `D:\dev\gabinet-demo`. Uprzedź klienta: jedna strona = jeden tytuł i opis w Google.

## Pakiet „Witryna" — do 5 stron

Dla firm i specjalistów, którzy chcą rozdzielić treść na osobne strony, np. Oferta, Cennik,
O nas. Każda strona ma własny tytuł i opis w Google, więc każda usługa może pojawiać się
w wynikach osobno. Podpis w cenniku: „Osobne strony na ofertę, cennik i kontakt” („Wizytówka”: „Wszystko na jednej stronie”). (Do 2026-11-05: „Firma” — myliła osoby spoza firm; „Strona z podstronami” — brzmiała technicznie.)

| | |
| --- | --- |
| Cena | `____ zł` |
| Zakres | do 5 stron razem z główną (np. Główna, O nas, Oferta, Cennik, Kontakt) z sekcji z biblioteki |
| Treści zmienia | wykonawca, jak w „Wizytówce". Panel do samodzielnych zmian za dopłatą 800 zł |
| Termin | `__` dni roboczych od kompletu materiałów |

Klient dostarcza: jak w „Wizytówce" (treści i zdjęcia rozłożone na strony).

> Dla Ciebie: bez panelu — wariant bez CMS-u z kilkoma stronami (`pages` w `tresci/index.ts`);
> z panelem — wariant Sanity. Sekcje te same co w „Wizytówce", tylko rozdzielone, więc teksty
> liczone tak samo (80 zł / sekcja).

## Panel do samodzielnych zmian — dopłata 800 zł (każdy pakiet)

| | |
| --- | --- |
| Treści zmienia | klient, w panelu w przeglądarce; zmiana na stronie po ok. 5 minutach |
| W cenie | instrukcja PDF, krótkie szkolenie, nocna kopia zapasowa treści i zdjęć |

Klient dostarcza dodatkowo: osobę, która będzie edytować treści (J).

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
| Panel do edycji | 800 zł | w każdym pakiecie; przejście na wariant z panelem, najprościej od startu (decyzja 2026-11-05) |
| Projekt graficzny indywidualny | `____ zł` | starter daje motyw (kolor, font, zaokrąglenia); układ poza biblioteką = projekt |
| Teksty na stronę (copywriting) | 80 zł / sekcja | nagłówek się liczy, „Kontakt" nie (same dane). Z ankiety: szkic AI + Twoja redakcja, jedna runda poprawek w cenie; klient odpowiada za fakty. Ok. 50 zł kosztu na sekcję — zmierz u 2 pierwszych klientów |
| Blog / aktualności | 600 zł „na początek" | **tylko z panelem** — bez panelu doliczasz go (+800 zł). Pierwsze zamówienie = budowa w starterze 6–10 h (dłuższy termin), potem 1,5–2 h na wdrożenie. Uprzedź klienta: przy wielu wpisach i zdjęciach koszt utrzymania może wzrosnąć (limity planu Free Sanity) |
| Mapy Google i katalogi | ok. 350 zł — **nie w cenniku**, najpierw u 1–2 pierwszych klientów (zmierz czas, nagraj instrukcję weryfikacji) | założenie albo uporządkowanie Profilu Firmy w Google, Bing Places, 3–5 katalogów (np. Panorama Firm; branżowe: ZnanyLekarz, Booksy) z identycznymi danymi (NAP). Ok. 2–3 h. Weryfikację profilu robi klient (nagranie albo kartka) — daj mu nagraną instrukcję. Bez obietnic pozycji i cytowań w AI (decyzja 2026-11-05) |

### Budowane na zamówienie — wycena indywidualna

Nie ma ich w starterze. Pierwszy klient, który za nie zapłaci, finansuje ich wbudowanie
w starter (zasada z POSTEP, „Odłożone").

| Dodatek | Dla Ciebie: szacunek z POSTEP |
| --- | --- |
| Druga wersja językowa | 15–25 h — najdroższa pozycja; to głównie jednorazowa infrastruktura w starterze (buduj dopiero po zapłacie), potem tłumaczenie AI + przegląd klienta. Każda późniejsza zmiana treści = podwójna praca |
| Opinie z Google / Booksy | ręcznie w „Opiniach" (standard) / pobieranie przy buildzie z Places API (kilka h, sprawdź regulamin Google) / widżet (skrypt, baner zgody, niższy wynik). Klient dostaje pełną informację o skutkach (decyzja 2026-11-05) |
| Menu restauracji (gastro) | 6–8 h; wymaga panelu i płatnego planu Sanity |
| Dane na bieżąco (menu dnia, oferty pracy) | 4–6 h, ok. 10–15 kB JS na tych stronach |
| Karuzela w opiniach | ok. 1 h; sens od 5–6 opinii |
| Google Analytics / Tag Manager / Meta Pixel z banerem zgody | wymaga baneru cookies — nowy skrypt, decyzja wg CLAUDE.md; ryzyko dla wyniku Lighthouse |
| Integracje, kalkulatory, wyszukiwarka, sklep | wycena po rozmowie |

---

## Utrzymanie roczne

Strona działa, a Ty nie zajmujesz się niczym technicznym — jedna opłata raz w roku.

| | |
| --- | --- |
| Cena | 300 zł / rok |
| Domena | rejestrujemy na Twoją firmę (to Ty jesteś jej właścicielem), opłacamy i odnawiamy — w cenie |
| Hosting | strona i formularz kontaktowy — w cenie |
| Kopie zapasowe | nocne, treści i zdjęcia (strony z panelem) — w cenie |
| Poprawki techniczne | ulepszenia i poprawki bezpieczeństwa — w cenie |
| Na start | przez 30 dni od uruchomienia zmiany za darmo, do 2 godzin pracy |
| Później zmiany | płatne osobno: 150 zł / godz., rozliczane od 30 min |

- **Błąd to nie zmiana.** Gdy coś na stronie nie działa tak, jak zostało oddane, poprawiamy
  to bez opłat — zawsze. Zmiana to coś nowego albo coś inaczej.
- **Brak opłaty** — przypomnienie; 30 dni po terminie strona zostaje wyłączona. Domena
  pozostaje Twoja.
- **Koniec współpracy** — dostajesz kod przeniesienia domeny i stronę do przeniesienia
  (szczegóły: `docs/PRZEKAZANIE.md`).

> Dla Ciebie:
> - Koszt po Twojej stronie to praktycznie samo odnowienie domeny — wybierz rejestratora
>   ze stałą ceną odnowienia (nie promocyjną za pierwszy rok). Hosting 0 zł: Cloudflare
>   Workers Free, Sanity Free, Resend Free; limity liczą się **na Twoje konto**, nie na
>   klienta (STAN.md, rozeznanie 2026-11-04).
> - Domena: rejestrujesz na swoim koncie u rejestratora, **abonentem jest klient** (jego dane).
>   Przy rozstaniu klient dostaje kod AuthInfo.
> - Formularze wszystkich klientów wysyłają z jednej Twojej domeny (`CONTACT_FROM`);
>   „Odpowiedz" trafia do osoby z formularza (Reply-To w workerze).
> - 300 zł to dolny pułap rynku za samą domenę i hosting (ok. 150–800 zł/rok) — przewaga
>   cenowa, ale marża jest mała, więc każda praca poza utrzymaniem idzie godzinowo.
>   Netto czy brutto — zależnie od VAT.
> - Bez gwarancji terminu realizacji zmian (bez SLA) — nie obiecuj „w 24 h".
> - W umowie/regulaminie: 300 zł obejmuje usługi w obecnych progach dostawców (Cloudflare,
>   Sanity, Resend, odnowienie domeny). Duży ruch, dużo zgłoszeń z formularza, rosnący blog,
>   zmiana cenników dostawców albo podwyżka domeny = możliwa zmiana ceny, z wyprzedzeniem
>   (np. 30 dni). Treść do prawnika (STAN.md, decyzja 2a).
> - Co dokładnie dostaje klient przy rozstaniu (`dist/`, źródła?) — decyzja 1 w STAN.md;
>   `PRZEKAZANIE.md` popraw po niej.

---

## Czego nie obiecywać (stan na 2026-11-03)

- **Osadzonej mapy Google** — jest karta „Jak dojechać" z linkiem (decyzja z fazy 5: bez
  klucza API i bez ładowania czegokolwiek od Google).
- **Polityki prywatności sprawdzonej przez prawnika** — to wzór z danych firmy. Gdy dane
  z formularza trafiają dalej (CRM, inna firma), potrzebna jest własna treść klienta.
- **Podglądu przed publikacją w panelu** — odłożone.
- **Formularza na hostingu klienta** — działa tylko na Cloudflare Workers. „Klient ma swój
  hosting" = strona tak, formularz nie.

## Płatność i forma działalności (decyzja 2026-11-05)

- **50% po akceptacji oferty, 50% po akceptacji podglądu, przed publikacją** (podpięciem
  domeny). Pierwszy rok utrzymania płatny razem z drugą ratą.
- **Poprawki: dwie rundy w cenie** (uwagi do podglądu mailem). Kolejne — jak zmiany treści.
- Start na **działalności nierejestrowanej**: rachunek, bez VAT — ceny na landingu są końcowe.
  Limit 2026: 10 813,50 zł przychodu należnego **na kwartał** (225% minimalnego wynagrodzenia);
  po przekroczeniu 7 dni na wpis do CEIDG. Wlicza się też utrzymanie i godziny zmian.

> Dla Ciebie: do prawnika — administrator danych w polityce prywatności landingu (Twoje dane),
> prawo odstąpienia od umowy dla konsumentów i jednoosobowych firm.

## Terminy — do skalibrowania

Na landingu: „zwykle 1–2 tygodnie od akceptacji oferty i otrzymania materiałów” (oba pakiety,
decyzja 2026-11-05). Brak pomiarów — pola `__` wypełnij po pierwszych wdrożeniach. Licz od kompletu materiałów
z sekcji „Bez tego nie startuję" w briefie. Dopisuj w checkliście datę startu i uruchomienia.

Na termin wpływa zwykle nie praca, a oczekiwanie: odpowiedź klienta, zmiana DNS u
rejestratora, weryfikacja domeny w Resend. Weryfikacja wizytówki Google (dni do tygodni)
nie blokuje uruchomienia strony.
