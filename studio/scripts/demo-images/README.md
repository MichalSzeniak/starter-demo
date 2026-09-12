# Zdjęcia do seeda

Pliki z tego katalogu wgrywa `pnpm --filter studio seed` (przez `client.assets.upload`).
Dodawane ręcznie, **nie trafiają do repozytorium** (`.gitignore`) — poza tym README.

Dopasowanie jest po nazwie pliku (bez rozszerzenia; `jpg`, `jpeg`, `png`, `webp`,
`avif`, `gif`, `svg`). Nazwa musi odpowiadać slotowi z `web/src/lib/sanity/fixtures.ts`.
Brakujący plik → seed bierze placeholder SVG z `web/public/demo` i ostrzega.

| Plik                          | Gdzie                             | Proporcje / uwagi                 |
| ----------------------------- | --------------------------------- | --------------------------------- |
| `hero.*`                      | sekcja hero na stronie głównej    | ok. 3:2, poziome                  |
| `o-nas.*`                     | sekcja tekst z obrazem (2×)       | ok. 4:3                           |
| `galeria-1.*` … `galeria-4.*` | galeria                           | 4:3, kadrowane do siatki          |
| `avatar-1.*`, `avatar-2.*`    | opinie klientów                   | kwadrat, twarz na środku          |
| `logo.*`                      | nagłówek, JSON-LD, obraz OG       | SVG lub PNG z przezroczystym tłem |
| `og.*`                        | domyślny obraz przy udostępnianiu | dokładnie 1200×630                |

Oryginały z aparatu są OK — Sanity skaluje je na CDN na żądanie, a strona
i tak pobiera przy buildzie tylko wersję o docelowej szerokości.
