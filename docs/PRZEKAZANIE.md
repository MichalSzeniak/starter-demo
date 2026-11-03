# Przekazanie strony i rozstanie z klientem

Co klient ma od pierwszego dnia, co dostaje, gdy rozwiązuje umowę, i w jakiej kolejności to
przekazać, żeby strona i poczta działały bez przerwy. Kod do przekazania robi
`pnpm eksport-klienta`.

## Od pierwszego dnia — czyje są konta

| Element | Czyje | Dlaczego |
| --- | --- | --- |
| Domena (abonent u rejestratora) | **klienta, zawsze** | Domena na Ciebie zamienia rozstanie w spór o adres. |
| Search Console, wizytówka Google, analityka | klienta (właściciel), Ty jako użytkownik | Historia i opinie należą do firmy. |
| Projekt Sanity (panel) | Twoja organizacja, klient jako Editor | Przy rozstaniu przenosisz projekt albo eksport. |
| Cloudflare (Worker, DNS), GitHub, Resend | Twoje konta | Abonament: utrzymujesz i odpowiadasz za działanie. |

## Umowa — co ustalić przed startem

Nie jest to porada prawna — zapisy daj do sprawdzenia prawnikowi.

- **Licencja niewyłączna** na kod strony: bezterminowa, z prawem do zmian i zlecania ich
  innym, ograniczona do strony tego klienta — bez prawa do odsprzedaży ani rozpowszechniania
  kodu jako szablonu. Startera nie przenosisz na nikogo; używasz go u wszystkich klientów.
- Teksty, zdjęcia i grafiki zrobione dla klienta mogą przejść na niego w całości.
- Przeniesienie autorskich praw majątkowych i licencja wyłączna wymagają formy pisemnej
  z wymienionymi polami eksploatacji; licencja niewyłączna — dowolnej, ale lepiej spisać.
- **Klauzula wyjścia**: co klient dostaje po rozwiązaniu umowy (lista z sekcji niżej)
  i w jakim terminie (np. 14 dni). Do kiedy utrzymujesz stronę po wypowiedzeniu.

## Rozstanie — co przekazać

Klient dostaje: **kod bez historii, treści, dostępy, instrukcję DNS**. Nie dostaje: repo
z historią, `docs/`, `CLAUDE.md`, skryptów startera, przyszłych poprawek ze startera.

### 1. Ustal z klientem

- [ ] Kto przejmuje stronę (nowy wykonawca / sam klient) i gdzie będzie hosting.
- [ ] Datę przełączenia. Do niej strona działa u Ciebie bez zmian.

### 2. Kod

- [ ] Repo klienta czyste, ostatnie zmiany zacommitowane.
- [ ] `pnpm eksport-klienta` — wszystkie kroki ✓. Lista „Odwołania do plików, których nie ma
      w paczce" to komentarze w kodzie; przejrzyj, nie blokują.
- [ ] Klientowi: `<nazwa>-przekazanie.zip` albo push katalogu eksportu do repo klienta
      (`git remote add origin <adres> && git push -u origin main` w katalogu eksportu).

### 3. Treści

- [ ] **[bez CMS]** Są w kodzie (`web/src/tresci/`) — przechodzą z eksportem.
- [ ] **[panel]** Projekt Sanity do organizacji klienta (sanity.io/manage, wymaga uprawnień
      w obu organizacjach) albo klient jako Administrator, a Ty usuwasz siebie na końcu.
- [ ] **[panel]** Pełny eksport datasetu z obrazami jako zapas:
      `pnpm --filter studio exec sanity datasets export production <plik>.tar.gz`.
      Eksport między projektami bywa kruchy przy obrazach — przeniesienie projektu jest pewniejsze.

### 4. Domena i DNS — kolejność ma znaczenie

- [ ] Domena: u klienta — nic. U Ciebie — kod AuthInfo albo zmiana abonenta u rejestratora.
- [ ] Strefa DNS na Twoim Cloudflare: **eksport strefy** (DNS → Records → Import and Export →
      Export) i przekazanie pliku. Zawiera MX, SPF, DKIM, DMARC i weryfikacje Google —
      bez nich po przeniesieniu klient traci pocztę.
- [ ] Klient (albo nowy wykonawca) importuje strefę i stawia stronę u siebie **przed**
      zmianą serwerów DNS u rejestratora.
- [ ] Dopiero po przełączeniu DNS (status u nowego dostawcy aktywny, strona otwiera się
      z nowego hostingu) wyłączasz cokolwiek po swojej stronie.

### 5. Formularz kontaktowy

- [ ] Klient zakłada własne konto Resend i weryfikuje w nim domenę (nowe rekordy DKIM).
      Twój klucz API nie przechodzi.
- [ ] Uprzedź: na hostingu innym niż Cloudflare Workers formularz trzeba zastąpić inną
      usługą — strona działa, wysyłka nie.

### 6. Konta Google i analityka

- [ ] Search Console, wizytówka Google, analityka: klient jest właścicielem; usuń siebie.

### 7. Sprzątanie po Twojej stronie (po przełączeniu DNS)

- [ ] Cloudflare: usuń Workera klienta, jego domeny niestandardowe i strefę DNS.
- [ ] Resend: usuń domenę klienta i unieważnij klucz API używany przez jego stronę.
- [ ] **[panel]** Webhook Sanity i Deploy Hook usunięte; backup: zmienna `BACKUP_ENABLED`
      usunięta (workflow przestaje działać), kopie na VPS — skasowane albo przekazane,
      zgodnie z umową powierzenia danych.
- [ ] Repo klienta na GitHubie: zarchiwizuj (Settings → Archive) — zostaje jako ślad prac,
      bez sekretów w Actions.
- [ ] Usuń klienta z listy cherry-picków poprawek ze startera.

### 8. Potwierdzenie

- [ ] Mail z listą przekazanych elementów — wzór niżej. Odpowiedź klienta zamyka przekazanie.

## Wzór maila

```
Temat: Przekazanie strony <domena>

Dzień dobry,

zgodnie z umową przekazuję stronę <domena>:

1. Kod strony — w załączniku <nazwa>-przekazanie.zip (albo: w repozytorium <adres>).
   W pliku README.md jest instrukcja uruchomienia i wdrożenia dla nowego wykonawcy.
2. Treści — <w kodzie strony | projekt Sanity przeniesiony do Państwa organizacji>.
3. Plik strefy DNS — w załączniku. Proszę zaimportować go u nowego dostawcy przed
   zmianą serwerów DNS — zawiera rekordy poczty.
4. Formularz kontaktowy wymaga konta Resend po Państwa stronie (opis w README).

Strona działa u mnie bez zmian do <data>. Po przełączeniu DNS usunę swoje dostępy
i konfigurację.

Proszę o potwierdzenie odbioru.
```
