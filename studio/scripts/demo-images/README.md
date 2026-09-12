# Zdjęcia do seeda

Pliki z tego katalogu wgrywa `pnpm --filter studio seed` (przez `client.assets.upload`, z dysku).
Są wersjonowane w repo — dlatego **przed commitem** przepuść je przez
`pnpm --filter studio images:optimize` (dłuższy bok ≤ 1600 px, WebP q80, ok. 200–300 kB na plik).

Dopasowanie jest po nazwie pliku (bez rozszerzenia; `jpg`, `jpeg`, `png`, `webp`,
`avif`, `gif`, `svg`). Nazwa musi odpowiadać slotowi z `web/src/lib/sanity/fixtures.ts`.
**Brakujący plik zatrzymuje seed** z listą braków; placeholdery SVG z `web/public/demo`
wchodzą wyłącznie pod flagą `--allow-placeholders` (do testów).

| Plik                          | Gdzie                             | Proporcje / uwagi                 |
| ----------------------------- | --------------------------------- | --------------------------------- |
| `hero.*`                      | sekcja hero na stronie głównej    | ok. 3:2, poziome                  |
| `o-nas.*`                     | sekcja tekst z obrazem (2×)       | ok. 4:3                           |
| `galeria-1.*` … `galeria-4.*` | galeria                           | 4:3, kadrowane do siatki          |
| `avatar-1.*`, `avatar-2.*`    | opinie klientów                   | kwadrat, twarz na środku          |
| `logo.*`                      | nagłówek, JSON-LD, obraz OG       | SVG lub PNG z przezroczystym tłem |
| `og.*`                        | domyślny obraz przy udostępnianiu | dokładnie 1200×630                |

`logo.*` i `og.*` można wygenerować: `pnpm --filter studio images:generate`
(monogram z inicjałów nazwy firmy na kolorze akcentu; karta 1200×630 z nazwą firmy
fontem marki — wszystko z `web/src/config/brand.ts`). Wynik jest deterministyczny:
ten sam `brand.ts` daje bajt w bajt te same pliki. Generator mieszka w `web/scripts/`,
bo tam jest satori.
