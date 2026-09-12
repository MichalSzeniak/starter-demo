# Prompt startowy do Claude Code — starter „wizytówka" (Astro SSG + Sanity)

> Wklej całość jako pierwszą wiadomość w świeżym repo.
> Wszystko poniżej „---" jest treścią promptu.

---

## Kontekst i cel

Budujemy **wielokrotnego użytku startera** na strony wizytówki dla małych firm.
To nie jest projekt dla jednego klienta — to szablon, z którego kolejne wdrożenie
ma powstawać w **maksymalnie 8 godzin roboczych**.

Wszystkie decyzje podporządkuj temu celowi. Jeśli coś jest eleganckie, ale
wymaga customu przy każdym nowym kliencie — odrzuć to i powiedz dlaczego.

## Stack (nie zmieniaj bez pytania)

- Astro 5, `output: 'static'`, TypeScript w trybie `strict`
- Sanity jako CMS (`@sanity/astro`), Studio osadzone pod `/studio`
- Tailwind CSS 4
- Hosting: Cloudflare Pages
- Node 20+, pnpm

## Twarde wymagania

1. **Zero JS po stronie klienta w domyślnej ścieżce.** Wyjątki tylko tam, gdzie
   są konieczne (menu mobilne, FAQ accordion) — jako wyspy Astro z
   `client:visible`, nie React globalnie.
2. **Po zbudowaniu strona nie zależy od Sanity w runtime.** Obrazy pobierane i
   optymalizowane przy buildzie przez `astro:assets` (`image.domains` z
   `cdn.sanity.io`), nie linkowane do CDN Sanity.
3. **Motyw w jednym pliku.** `src/config/brand.ts` — kolory, fonty, promienie,
   dane firmy. Nowy klient = edycja tego pliku + podmiana logo.
4. **Schema Sanity jest zamknięta.** 8 typów sekcji, nie więcej. Klient układa
   stronę z tych ośmiu.
5. **Klient nie może zepsuć layoutu.** Żadnego pola typu „HTML" ani
   niekontrolowanego rich texta w miejscach strukturalnych.
6. Wszystkie teksty w Studio po polsku (`title`, `description` pól).

## Kryteria akceptacji

- Lighthouse desktop: 100/100/100/100. Mobile: performance ≥ 95, reszta 100.
- `astro check` bez błędów, `tsc --noEmit` czysty.
- Build strony demo < 60 s przy 50 obrazach.
- Nietechniczna osoba zmienia numer telefonu w stopce w < 60 s bez instrukcji.

## Zasady pracy (ważne)

- **Nie zgaduj API.** Przed użyciem dowolnego API z `astro`, `@sanity/astro`,
  `@sanity/image-url`, `astro-portabletext` — sprawdź faktyczną wersję
  (`npm view <pkg> version`) i przeczytaj typy w `node_modules`. Jeśli nie
  jesteś pewien sygnatury, powiedz to zamiast wymyślać.
- **Nie dodawaj zależności bez pytania.** Każda nowa paczka = pytanie do mnie z
  uzasadnieniem i wagą bundle'a.
- **Pracuj fazami.** Po każdej fazie ZATRZYMAJ SIĘ, pokaż co powstało i czekaj
  na moje „dalej". Nie przeskakuj faz.
- Commity atomowe, komunikaty po polsku, konwencja `feat:`, `fix:`, `chore:`.

---

## FAZA 0 — Ustalenia (nic nie koduj)

Zadaj mi pytania o rzeczy, których nie da się rozstrzygnąć bez kontekstu:
docelowa branża, czy potrzebny blog, czy wielojęzyczność, jaki formularz.

Następnie sprawdź aktualne wersje wszystkich paczek ze stacku i przedstaw:
- proponowany `package.json`,
- strukturę katalogów,
- listę ryzyk / rzeczy, które mogą nie działać tak, jak zakładam.

**STOP.**

---

## FAZA 1 — Szkielet

- Inicjalizacja Astro + TS strict + Tailwind 4 + Prettier + ESLint.
- `src/config/brand.ts` z tokenami (kolory jako CSS custom properties,
  font stack, spacing scale, dane NAP firmy).
- `BaseLayout.astro`: `<html lang="pl">`, skip-link, semantyczny szkielet,
  preload fontu wariancyjnego z `font-display: swap`.
- `trailingSlash` ustawione świadomie i spójnie z canonicalami — uzasadnij wybór.
- Strona 404.

**STOP.**

---

## FAZA 2 — Schema Sanity

Struktura dokumentów:

- `siteSettings` (singleton): nazwa firmy, NAP (nazwa/adres/telefon), NIP,
  godziny otwarcia, social, logo, domyślne OG, kod analytics.
- `page`: `title`, `slug`, `seo` (obiekt), `sections[]`.
- `navigation` (singleton): menu główne i stopka.
- `redirect`: `from`, `to`, `permanent` — do `_redirects` przy buildzie.

Obiekt `seo`: `metaTitle` (walidacja max 60 znaków), `metaDescription`
(max 155), `ogImage`, `noindex` (bool). Wszystkie z podpowiedziami po polsku
tłumaczącymi, do czego to służy.

Sekcje (dokładnie te, żadnych dodatkowych):
`hero`, `textImage`, `features`, `pricing`, `testimonials`, `faq`, `gallery`,
`cta`.

Wymagania do schemy:
- Każde pole obrazu ma **wymagany** `alt` (walidacja blokuje publikację bez niego).
- Każda sekcja ma `preview` z sensownym tytułem i ikoną — klient ma widzieć,
  co dodaje.
- Struktura Studio (`structure.ts`): singletony na górze, bez możliwości
  utworzenia drugiego `siteSettings`.
- Ukryj w Studio wszystko, czego klient nie ma dotykać.

**STOP.**

---

## FAZA 3 — Komponenty sekcji

Jeden komponent Astro na typ sekcji + `SectionRenderer.astro` mapujący
`_type` → komponent. Portable Text przez `astro-portabletext` z własnymi
komponentami (nagłówki, listy, linki wewnętrzne vs zewnętrzne).

Obrazy: `<Image>` z `astro:assets`. Pierwszy obraz na stronie
`loading="eager"` + `fetchpriority="high"`, reszta lazy. Zawsze `width`/`height`
— zero CLS.

**STOP.**

---

## FAZA 4 — Warstwa SEO

To jest kluczowa faza, potraktuj ją poważnie.

- Komponent `<Seo>`: title, description, canonical (absolutny), robots,
  Open Graph (`og:locale` = `pl_PL`, obraz 1200×630), Twitter card.
- **Generowanie OG images przy buildzie** z tytułu strony i logo — zaproponuj
  bibliotekę, uzasadnij wybór, pokaż wagę.
- JSON-LD, składany warunkowo:
  - `Organization` + `LocalBusiness` z NAP, `openingHoursSpecification`, `geo`,
    `sameAs` — z `siteSettings`,
  - `BreadcrumbList` na podstronach,
  - `FAQPage` generowany automatycznie, gdy strona zawiera sekcję `faq`,
  - `WebSite`.
- `@astrojs/sitemap` z wykluczeniem stron `noindex`.
- `robots.txt` z odwołaniem do sitemapy.
- `_redirects` dla Cloudflare generowany z dokumentów `redirect`.
- Walidacja przy buildzie: build **failuje**, jeśli któraś strona nie ma
  `metaTitle`/`metaDescription` albo ma więcej niż jeden `<h1>`.

**STOP.**

---

## FAZA 5 — Formularz i analityka

- Formularz kontaktowy: Cloudflare Pages Function → e-mail (Resend albo SMTP,
  zaproponuj i uzasadnij). Honeypot + rate limiting. Bez zewnętrznych widgetów.
- Zgoda RODO: checkbox + klauzula informacyjna z `siteSettings`.
- Analityka: Plausible albo Umami (bez ciasteczek → bez baneru zgody).
  **Nie proponuj GA4**, chyba że wyraźnie poproszę — pociąga za sobą baner CMP.
- Mapa: nie osadzaj iframe'a Google od razu. Statyczny obrazek + klik →
  dopiero wtedy ładuje się mapa (wydajność + RODO).

**STOP.**

---

## FAZA 6 — Automatyzacja

- GitHub Actions: `astro check` + build + Lighthouse CI z progami z „kryteriów
  akceptacji" — PR nie przechodzi, jeśli progi nie są spełnione.
- Sprawdzanie martwych linków w buildzie.
- **Nocny backup datasetu Sanity**: cron 03:00, `sanity dataset export` z
  `--no-assets` codziennie, pełny raz w tygodniu (niedziela), artefakty
  wypychane na mój VPS przez rsync. Tokeny z secrets.
- Webhook Sanity → deploy hook Cloudflare, z debounce (nie przebudowuj 15 razy,
  gdy klient poprawia literówki).

**STOP.**

---

## FAZA 7 — Proces nowego klienta

- Skrypt `pnpm nowy-klient` (interaktywny): pyta o nazwę firmy, kolory,
  Sanity project ID, domenę → podmienia `brand.ts`, tworzy `.env`, ustawia
  nazwę projektu w `package.json`, czyści treści demo.
- `docs/BRIEF.md` — formularz briefu do wysłania klientowi (treści + zdjęcia),
  bez którego nie startuję.
- `docs/CHECKLIST-WDROZENIE.md` — DNS, SSL, weryfikacja w Search Console,
  zgłoszenie sitemapy, Google Business Profile, test formularza, test backupu.
- `docs/DLA-KLIENTA.md` — jedna strona, screenshoty, 5 kroków.

**STOP.**

---

## Na koniec

Wypisz listę rzeczy, które **świadomie pominęliśmy** i które trzeba będzie
dorobić przy pierwszym realnym kliencie (np. podgląd wersji roboczej, i18n,
blog). Krótko, z oszacowaniem czasu.