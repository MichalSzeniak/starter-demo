---
description: Koniec sesji — wpis w POSTEP, nadpisanie STAN.md, commit dokumentów, lista decyzji
argument-hint: '[krótki temat sesji, opcjonalnie]'
---

Kończymy sesję. Temat (może być pusty — wtedy nazwij go sam): $ARGUMENTS

1. **Zbierz, co się wydarzyło** w tej sesji: commity we wszystkich repozytoriach z tabeli
   w `docs/STAN.md` (`git log --oneline` od początku sesji), decyzje użytkownika, co sprawdzono
   i czego **nie** sprawdzono. Jeśli są niezacommitowane zmiany w kodzie — zapytaj, co z nimi,
   zanim pójdziesz dalej.
2. **Dopisz wpis na końcu `docs/POSTEP.md`** w konwencji pliku: `## <Temat> — <data>`, potem
   według potrzeby „Co powstało”, „Weryfikacja” (liczby: SEO, linki, Lighthouse), „Niezweryfikowane”,
   „Do decyzji”, „Następne kroki”. Hashe commitów w każdym repo. Nie przepisuj starszych wpisów.
3. **Nadpisz `docs/STAN.md`** — aktualny obraz, nie historia:
   - data aktualizacji,
   - tabela repozytoriów ze stanem z `git status -sb` (co wypchnięte, co tylko lokalnie),
   - aktywne zlecenia i ich status,
   - „Do decyzji”: usuń rozstrzygnięte, dodaj nowe, zachowaj numerację od 1,
   - kolejka i propozycje odłożone,
   - „Niezweryfikowane”.
   Plik ma zostać krótki (ok. 80 linii) — szczegóły zostają w POSTEP.
4. **Aktywne zlecenia:** dopisz pozycję w „Dzienniku” ich `ZLECENIE.md` (poza repo startera).
5. **Pamięć:** jeśli użytkownik podał nową trwałą preferencję albo korektę sposobu pracy,
   zapisz ją w pamięci (nie w POSTEP).
6. **Commit dokumentów osobno od kodu:** `chore: POSTEP i STAN — <temat>` (po polsku, ze stopką
   Co-Authored-By). **Nie pushuj** — zapytaj, jeśli coś czeka na wypchnięcie.
7. Na koniec wypisz użytkownikowi:
   - 3–5 zdań, co zrobiliśmy,
   - ponumerowane decyzje, które czekają na niego,
   - „Następnym razem: `/start`” (z sugerowanym tematem, jeśli jest oczywisty).
