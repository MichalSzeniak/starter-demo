---
description: Początek sesji — odczytaj stan projektu, sprawdź repozytoria i zaproponuj zadanie
argument-hint: '[temat sesji, opcjonalnie]'
---

Zaczynamy nową sesję pracy. Temat od użytkownika (może być pusty): $ARGUMENTS

1. Przeczytaj `docs/STAN.md`. CLAUDE.md masz już w kontekście — stosuj jego zasady.
   **Nie czytaj całego `docs/POSTEP.md`** — tylko wpis, do którego STAN.md odsyła albo którego
   potrzebujesz do konkretnej decyzji.
2. Dla każdego aktywnego zlecenia ze STAN.md przeczytaj jego `ZLECENIE.md` (sekcje „Status”,
   „Do ustalenia”, „Następne kroki”, ostatnie pozycje „Dziennika”).
3. Dla każdego repozytorium z tabeli „Repozytoria” uruchom `git status -sb` i `git log --oneline -3`.
   Porównaj z tym, co mówi STAN.md, i **wypisz różnice** (np. coś zostało wypchnięte, są
   niezacommitowane zmiany, przybyły commity spoza sesji). Nie zakładaj, że STAN.md jest aktualny.
4. Podsumuj w maksymalnie 10 liniach:
   - stan (co jest zrobione, co tylko lokalnie),
   - otwarte decyzje — ponumerowane, tak żeby dało się odpowiedzieć „1: tak, 3: nie”,
   - pierwsze zadanie z kolejki albo temat z `$ARGUMENTS`.
5. Zaproponuj, co robimy w tej sesji (jeden temat), i **zapytaj** — nie zaczynaj kodować przed
   odpowiedzią. Jeśli temat wymaga decyzji z listy „Do decyzji”, zapytaj o nią najpierw.

Zasady na całą sesję:

- Jeden temat. Pomysł poboczny → zapisz go w STAN.md w „Propozycje odłożone” i wróć do tematu.
- Decyzje użytkownika zapisuj od razu w STAN.md (nie czekaj do `/koniec`) — rozmowa może się urwać.
- Dane i korespondencja klientów nigdy do repo startera (jest publiczne) — tylko do
  `D:\dev\zlecenia\…` albo do prywatnego repo klienta.
