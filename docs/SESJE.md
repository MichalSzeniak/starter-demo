# Praca w sesjach z Claude Code

Instrukcja, jak zaczynać i kończyć pracę z Claude tak, żeby następna sesja (jutro, za tydzień,
na innym komputerze) wiedziała, gdzie skończyliśmy, bez wklejania długich promptów.

Pierwsza część dotyczy tego repo, druga mówi, jak to samo wprowadzić w innym projekcie.

---

## Część 1. Jak korzystać w tym projekcie

### Gdzie co leży

| Plik | Co zawiera | Jak się zmienia |
| --- | --- | --- |
| `CLAUDE.md` | zasady projektu: budżet JS, SEO, schema, styl pracy | rzadko, tylko gdy zmieniasz regułę |
| `docs/STAN.md` | **co jest teraz**: stan repo, aktywne zlecenia, decyzje do podjęcia, kolejka zadań | **nadpisywany** na koniec każdej sesji |
| `docs/POSTEP.md` | **co zrobiliśmy i dlaczego**: pełna historia z weryfikacją | tylko **dopisywanie** na końcu |
| `.claude/commands/start.md` | komenda `/start` | gdy chcesz zmienić rytuał startu |
| `.claude/commands/koniec.md` | komenda `/koniec` | gdy chcesz zmienić rytuał końca |
| `D:\dev\zlecenia\<klient>\ZLECENIE.md` | jedno zlecenie: prośba klienta, ustalenia, mail, dziennik | dopisywany przy każdej sesji o tym kliencie |
| pamięć Claude (poza repo) | Twoje trwałe preferencje, np. „minimum kontaktu z klientem” | Claude zapisuje sam, gdy coś takiego powiesz |

Zasada: **każda informacja ma jedno miejsce.** Stan bieżący nie leży w historii, a historia
nie leży w stanie.

### Codzienny przebieg

**1. Otwórz Claude Code w `D:\dev\sanity` i wpisz:**

```
/start
```

albo z tematem:

```
/start presety stylów
```

Claude przeczyta STAN.md i aktywne zlecenia, sprawdzi `git status` we wszystkich repo
i powie, czy coś się zmieniło od ostatniej sesji, np. że wypchnąłeś starter. Wypisze
ponumerowane decyzje i zaproponuje temat. **Niczego nie zacznie, dopóki nie odpowiesz.**

**2. Odpowiedz krótko.** Numery decyzji ułatwiają odpowiedź:

```
1: tak, wariant B bez Workera. 3: abonament obowiązkowy, 2 rundy poprawek. Robimy presety stylów.
```

Claude od razu zapisze decyzje w STAN.md, więc nie przepadną, nawet jeśli sesja się urwie.

**3. Pracujcie nad jednym tematem.** Gdy w trakcie wpadnie Ci pomysł z innej beczki:

```
dopisz do STAN.md jako propozycję: formularz zgłoszenia zmian dla abonamentu
```

i wracacie do tematu.

**4. Na koniec wpisz:**

```
/koniec
```

albo z nazwą tematu:

```
/koniec presety stylów
```

Claude dopisze wpis do POSTEP, nadpisze STAN.md, dopisze dziennik w aktywnych zleceniach,
zacommituje dokumenty (bez pushowania) i wypisze, jakie decyzje czekają na Ciebie.

**5. Wypchnięcie robisz sam** albo mówisz Claude wprost „wypchnij starter”.

### Sytuacje szczególne

- **Przerwa w środku zadania, ten sam dzień:** `claude --continue` w terminalu wznawia ostatnią
  rozmowę, a `claude --resume` pozwala wybrać jedną z listy. Przy nowym dniu lepsza jest świeża
  sesja z `/start`, bo długa rozmowa i tak zostaje skrócona do streszczenia, które gubi szczegóły.
- **Sesja urwała się bez `/koniec`:** zacznij nową od `/start`. Claude zobaczy w gicie commity,
  których nie ma w STAN.md, i o nich powie. Wtedy poproś: „uzupełnij STAN.md i POSTEP o te
  commity”.
- **Sam zmieniłeś coś poza Claude** (push, ręczna poprawka, wysłany mail do klienta): `/start`
  wychwyci zmiany w gicie. Rzeczy spoza gita (mail wysłany, klient odpowiedział) powiedz wprost,
  np. „klient odpowiedział, treść niżej”.
- **Praca dla klienta:** jeśli praca dotyczy treści i kodu konkretnego klienta, otwórz sesję
  w jego repo (np. `D:\dev\gabinet-...`), a nie w starterze. Jego repo ma CLAUDE.md startera,
  więc zacznij od zdania „to repo klienta, zlecenie w `docs/ZLECENIE.md`” (dopóki `nowy-klient`
  nie dopisuje tego sam, punkt 7 kolejki w STAN.md).
- **Dane klienta** (nazwisko, e-mail, treść maili) nigdy nie trafiają do repo startera, bo jest
  publiczne na GitHubie. Trzymaj je w `D:\dev\zlecenia\...` i potem w prywatnym repo klienta.

### Czego unikać

- Ręcznego prompta startowego z listą zadań: dezaktualizuje się. `/start` zawsze patrzy na
  bieżący stan.
- Decyzji w nawiasach typu „[A / B]” w prompcie: Claude nie wie, którą wybrałeś. Odpowiadaj
  na ponumerowane pytania z `/start`.
- Kilku tematów w jednej sesji: da się, ale ustalenia łatwiej giną. Jeśli już, to `/koniec`
  po każdym temacie i dalej w tej samej rozmowie.

---

## Część 2. Jak wprowadzić to w innym projekcie

To 4 pliki i 10 minut. Działa w każdym repo, nie tylko z Astro czy Sanity.

### Krok 1. `CLAUDE.md` w katalogu głównym repo

Jeśli go nie ma, Claude Code zrobi szkic komendą `/init`. Dopisz sekcję:

```markdown
## Sesje

- Początek: `/start`. Koniec: `/koniec`.
- `docs/STAN.md` = stan bieżący (nadpisywany, krótki); `docs/POSTEP.md` = historia (tylko dopisywanie).
- Decyzje zapisuj w STAN.md od razu. Jedna sesja = jeden temat.
- Całego POSTEP nie czytaj na starcie, tylko wpisy potrzebne do zadania.
```

### Krok 2. `docs/STAN.md`

Szablon do skopiowania:

```markdown
# Stan projektu

**Aktualizacja: RRRR-MM-DD.** Nadpisywany na koniec każdej sesji (`/koniec`). Historia: `docs/POSTEP.md`.

## Repozytoria
| Repo | Rola | Stan |
| --- | --- | --- |
| `ścieżka` | główne | co wypchnięte, co lokalnie |

## Do decyzji
1. …

## Kolejka
1. …

## Propozycje odłożone
- …

## Niezweryfikowane
- …
```

Sekcje dopasuj do projektu, np. dodaj „Aktywne zlecenia”, jeśli pracujesz dla klientów. Jedno repo?
Tabela ma wtedy jeden wiersz.

### Krok 3. `docs/POSTEP.md`

Pusty plik z nagłówkiem `# Postęp`. Wpisy dopisuje `/koniec`. Dobra konwencja wpisu:

```markdown
## Temat — RRRR-MM-DD

### Co powstało
### Weryfikacja        ← liczby: testy, build, pomiary
### Niezweryfikowane   ← uczciwie, czego nie sprawdzono
### Do decyzji
### Następne kroki
```

### Krok 4. Komendy `/start` i `/koniec`

Skopiuj `.claude/commands/start.md` i `.claude/commands/koniec.md` z tego repo i usuń
fragmenty specyficzne dla startera: zlecenia, `D:\dev\zlecenia`, publiczne repo. Komenda to
zwykły plik Markdown. Nazwa pliku to nazwa komendy, a `$ARGUMENTS` to tekst wpisany po niej.

**Komendy w repo czy globalnie?**

- **W repo** (`<repo>/.claude/commands/`): każdy projekt może mieć swoją wersję, a komendy
  jadą razem z repo na inny komputer. **Zalecane.**
- **Globalnie** (`C:\Users\<Ty>\.claude\commands\`): działają w każdym projekcie bez kopiowania,
  ale muszą być ogólne („przeczytaj `docs/STAN.md`, jeśli istnieje”). Nie trzymaj komendy
  o tej samej nazwie w obu miejscach, bo nie będzie jasne, która zadziała.

### Krok 5. Pierwsza sesja w nowym projekcie

```
Przeczytaj repo i wypełnij docs/STAN.md: stan, otwarte sprawy i kolejkę, o ile da się je ustalić
z kodu, issues i TODO. Czego nie wiesz — zapytaj mnie. Potem /koniec.
```

Od następnego dnia już tylko `/start` i `/koniec`.

### Kiedy to się opłaca

- Projekty, do których wracasz przez dni lub tygodnie: tak.
- Jednorazowa poprawka w 15 minut: nie, wystarczy zwykłe polecenie.
- Kilka powiązanych repo (starter i klienci): tak, a tabela „Repozytoria” w STAN.md trzyma je razem.
