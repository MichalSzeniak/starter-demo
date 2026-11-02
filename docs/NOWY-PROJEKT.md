# Nowy projekt ze startera

Jak założyć repo klienta, skonfigurować je i później przenosić do niego poprawki ze startera.
Co dalej po założeniu (Sanity, Cloudflare, DNS, formularz, SEO) — `docs/CHECKLIST-WDROZENIE.md`.

Przykład gotowego projektu: `D:\dev\gabinet-demo` — gabinet psychoterapii w wariancie bez CMS-u.

## Panel Sanity czy bez CMS-u

| | Panel Sanity | Bez CMS-u |
| --- | --- | --- |
| Kto zmienia treści | klient, w Studio | Ty, w `web/src/tresci/` |
| Zmienna builda | `SANITY_PROJECT_ID` (+ `SANITY_DATASET`) | `LOCAL_CONTENT=true` |
| Studio, webhook, backup | tak | nie — treści są w repo, commit uruchamia build |
| Dla kogo | klient zmienia coś częściej niż kilka razy w roku | zmiany rzadkie, robione w ramach abonamentu |

Obie naraz (`LOCAL_CONTENT=true` i `SANITY_PROJECT_ID`) przerywają build. Przejście klienta
bez CMS-u na panel wymaga importu treści do Sanity — na razie odłożone (`docs/POSTEP.md`).

## Krok po kroku

Starter: `github.com/MichalSzeniak/starter-demo`. **Przed klonowaniem wypchnij starter**
(`git push` w repo startera) — klon z GitHuba nie zawiera commitów, które są tylko lokalnie.

```bash
# 1. Klon startera z pełną historią — folder = nazwa klienta
git clone https://github.com/MichalSzeniak/starter-demo.git gabinet-kowalska
cd gabinet-kowalska

# 2. Starter jako źródło poprawek, origin będzie repo klienta
git remote rename origin starter

# 3. PRYWATNE repo klienta i pierwszy push
gh repo create MichalSzeniak/gabinet-kowalska --private --source . --remote origin --push

# 4. Commit startera, od którego startujesz — wpisz w checklistę („Commit startera")
git rev-parse --short HEAD

# 5. Konfiguracja
pnpm install
pnpm nowy-klient        # nazwa, domena, kolor marki, panel Sanity tak/nie, nazwa projektu

# 6. Przejrzyj zmiany (bez .env!) i zacommituj
git status
git add -A
git commit -m "chore: konfiguracja klienta gabinet-kowalska"
git push
```

Bez `gh`: utwórz puste prywatne repo na github.com, potem `git remote add origin <adres>`
i `git push -u origin main`.

Dlaczego tak:

- **Prywatne repo** — w publicznym GitHub wyłącza harmonogramy po 60 dniach bez commitów,
  więc nocny backup przestałby działać po cichu.
- **Nie fork** — fork publicznego repo nie może być prywatny.
- **Klon z historią, nie „Use this template" ani `degit`** — wspólna historia pozwala
  jednym poleceniem zobaczyć, co w starterze zmieniło się od startu klienta.

## Wariant bez CMS-u — treści

- Wszystko w `web/src/tresci/index.ts`: ustawienia (NAP, godziny, formularz), menu, podstrony,
  przekierowania. Kształt jak dane z Sanity — błąd w strukturze wyłapie `pnpm check`.
- Zdjęcia w `web/src/tresci/obrazy/`, w treści `await obraz('plik.webp', 'opis')`.
  Brak pliku albo pusty opis przerywa build. Kadruj przed wrzuceniem — nie ma hotspotu.
- Logo najlepiej w PNG (Google w danych strukturalnych oczekuje rastra). Bez logo nagłówek
  pokazuje nazwę firmy tekstem, a obraz OG generuje się z tytułu strony.
- Przykładowe obrazy szablonu usuń — Astro kopiuje do `dist/` każdy plik z tego katalogu.
- Po zmianie treści podbij `UPDATED` (data w `<lastmod>` sitemapy).
- `companyName` w treści ustawiasz ręcznie — `nowy-klient` wpisuje nazwę tylko do `brand.ts`.

## Poprawki ze startera u klienta

```bash
git fetch starter
git log --oneline <commit-startera>..starter/main   # co nowego od startu klienta
git cherry-pick <hash>                              # pojedyncze poprawki
```

- Cherry-pick pojedynczych zmian, nie `merge` całego startera.
- Konflikty w `brand.ts`, `package.json`, `wrangler.toml`, `web/src/tresci/` są normalne —
  wartości klienta wygrywają.
- **Kierunek:** błąd znaleziony u klienta poprawiasz najpierw w starterze, potem cherry-pick
  do klientów. Starter zostaje źródłem prawdy.

## Czego unikać

- Pracy nad klientem w folderze startera.
- `DEMO_CONTENT` w repo klienta (lokalnie, w Cloudflare i w GitHub Actions).
- Commitowania `.env` — jest w `.gitignore`, ale po `git add -A` sprawdź `git status`.
