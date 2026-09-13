# Checklista wdrożenia

Kolejność jest chronologiczna. Pozycje oznaczone ⏳ mają czas oczekiwania po stronie
kogoś innego (Google, rejestrator, DNS) — uruchom je pierwszego dnia, nawet jeśli
reszta poczeka.

Klient: `__________`  Domena: `__________`  Start: `____-__-__`  Commit startera: `_______`

---

## 0. Warunki startu

- [ ] Brief (`docs/BRIEF.md`) wrócił kompletny — wszystkie pozycje z sekcji „Bez tego nie startuję".
- [ ] Mam dostęp do domeny: login do rejestratora albo osoba po stronie klienta, która
      zmieni serwery DNS w ustalonym dniu.
- [ ] Wiem, gdzie klient ma pocztę (Google Workspace, home.pl, OVH…) — od tego zależy,
      które rekordy DNS są nietykalne.
- [ ] ⏳ **Wizytówka Google (Google Business Profile)**: klient ma profil albo zakładamy go
      dziś. Weryfikacja (film, telefon, pocztówka) potrafi trwać od kilku dni do kilku tygodni.

## 1. Repo i konfiguracja

- [ ] Nowe **prywatne** repo z aktualnego startera; hash commita startera wpisany wyżej
      (do późniejszych cherry-picków). Prywatne, bo harmonogramy GitHuba w repo publicznym
      wyłączają się po 60 dniach bez commitów — backup przestałby działać po cichu.
- [ ] sanity.io/manage → nowy projekt, dataset `production`, widoczność **Public**
      (build czyta treści bez tokena).
- [ ] sanity.io/manage → API → CORS origins: `http://localhost:3333` z „Allow credentials"
      (Studio lokalnie).
- [ ] `pnpm install && pnpm nowy-klient` — nazwa, domena, kolor marki, project ID.
- [ ] `web/public/favicon.svg` — favicon klienta.
- [ ] `pnpm check && pnpm lint && pnpm format:check` — czysto.
- [ ] Commit: `chore: konfiguracja klienta <nazwa>`.

## 2. Studio i treści

- [ ] `pnpm --filter studio deploy` → host `<nazwa>.sanity.studio`.
- [ ] Ustawienia strony: nazwa, adres, telefon, e-mail, NIP, godziny, social, logo, domyślny
      obraz udostępniania, współrzędne. **NAP znak w znak jak w wizytówce Google** — ten sam
      zapis ulicy, telefonu i nazwy.
- [ ] Podstrony z briefu. Strona główna ma adres `/`. Każda: tytuł i opis w zakładce SEO.
- [ ] Podstrona „Polityka prywatności" (treść od klienta) i link do niej w Ustawienia →
      Formularz kontaktowy oraz w menu stopki.
- [ ] Nawigacja: menu główne (≤ 6 pozycji) i stopka.
- [ ] Przekierowania ze starej strony: każdy adres, który ma ruch lub linki (Search Console
      starej domeny, sitemap starej strony) → odpowiednik na nowej, „Trwałe".
- [ ] `pnpm build` przechodzi z treściami klienta (walidacja SEO i martwych linków).
- [ ] Klauzula informacyjna RODO potwierdzona przez klienta: okres przechowywania
      (wzór: 12 mies.) i odbiorcy (Cloudflare, Resend). Wzór nie jest poradą prawną.

## 3. Cloudflare — Worker i build

- [ ] Workers & Pages → import repo klienta. Build: `pnpm build`, deploy: `npx wrangler deploy`
      (jak w repo startera). Nazwa Workera = `name` z `wrangler.toml` — ustawiona przez
      `nowy-klient`, unikalna na koncie.
- [ ] Build variables: `SANITY_PROJECT_ID`, `SANITY_DATASET`. **Bez `DEMO_CONTENT`.**
- [ ] Settings → Variables and Secrets, typ **Secret**: `RESEND_API_KEY`, `CONTACT_TO`,
      `CONTACT_FROM`, `SANITY_WEBHOOK_SECRET`, `DEPLOY_HOOK_URL`.
- [ ] Settings → Builds → Deploy Hooks → hook dla `main`; jego URL do `DEPLOY_HOOK_URL`.
- [ ] Pierwszy deploy na `*.workers.dev` — strona otwiera się, `/o-nas/` przekierowuje
      na `/o-nas`.

## 4. DNS i SSL

- [ ] ⏳ Domena dodana do Cloudflare. **Przed zmianą serwerów DNS**: porównaj rekordy
      zaimportowane przez Cloudflare z obecną strefą — MX, TXT (SPF, DKIM, DMARC,
      weryfikacje), CNAME `autodiscover`. Brakujący MX = klient przestaje dostawać pocztę.
- [ ] ⏳ Serwery DNS u rejestratora zmienione na cloudflarowe; status domeny „Active".
- [ ] Worker → Settings → Domains & Routes → Custom Domain: domena główna **i** `www`.
      Wariant niekanoniczny przekierowany 301 na kanoniczny (ten z `brand.ts` → `siteUrl`).
- [ ] SSL/TLS: certyfikat wydany dla obu wariantów, „Always Use HTTPS" włączone.
- [ ] Sprawdzone z zewnątrz: `http://` → `https://`, `www` ↔ bez `www` → wariant kanoniczny
      jednym przekierowaniem, `/o-nas/` → `/o-nas`, nieistniejący adres → 404.
- [ ] Stara strona: przekierowania z sekcji 2 działają na nowej domenie (kilka próbek).

## 5. Formularz kontaktowy

- [ ] ⏳ Resend → Domains → domena klienta; rekordy SPF/DKIM dodane w Cloudflare DNS, status
      „Verified". Jeśli klient ma DMARC z `p=reject`, sprawdź zgodność przed pierwszym mailem.
- [ ] `CONTACT_FROM` z tej domeny, `CONTACT_TO` — adres(y) z briefu.
- [ ] **Test formularza na produkcji** z telefonu (sieć komórkowa, nie Wi-Fi biura):
  - [ ] wiadomość dochodzi do skrzynki klienta, nie do spamu,
  - [ ] „Odpowiedz" trafia do nadawcy z formularza,
  - [ ] w treści jest zgoda i czas jej wyrażenia,
  - [ ] komunikat sukcesu na stronie; to samo z wyłączonym JavaScriptem,
  - [ ] klient potwierdził odbiór.

## 6. Analityka

- [ ] Strona dodana w Plausible albo Umami; Studio → Ustawienia → Analityka wypełnione.
- [ ] Po publikacji i przebudowie wizyta widoczna w panelu (i nie liczy się z `*.workers.dev`).

## 7. Automatyzacja

- [ ] GitHub → Settings → Secrets and variables → Actions:
      Variables `SANITY_PROJECT_ID`, `SANITY_DATASET`, `BACKUP_ENABLED=true`, `VPS_BACKUP_DIR`,
      `VPS_PORT`; Secrets `SANITY_BACKUP_TOKEN` (rola Viewer), `VPS_HOST`, `VPS_USER`,
      `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`. Zmiennej `DEMO_CONTENT` **nie ma**.
- [ ] Settings → Rules → Rulesets dla `main`: wymagany status `CI / jakosc`.
- [ ] CI zielone na `main` (typy, lint, build, Lighthouse).
- [ ] sanity.io/manage → API → Webhooks: URL `https://<domena>/api/przebuduj`, dataset
      `production`, Create/Update/Delete, filtr
      `!(_type in ["sanity.imageAsset", "sanity.fileAsset"])`, projekcja `{_id, _type}`,
      POST, bez „Trigger on drafts", sekret = `SANITY_WEBHOOK_SECRET`.
- [ ] **Test webhooka**: drobna zmiana w Studio → Publish → po ok. 3 min build w Cloudflare
      → zmiana na stronie. Trzy publikacje pod rząd dają **jeden** build.

## 8. Backup

- [ ] VPS: katalog backupu, klucz w `authorized_keys` z `command="rrsync -wo <katalog>",restrict`,
      cron rotacji (dzienne 30 dni, pełne 180 dni) — szczegóły w `docs/POSTEP.md`, faza 6.
- [ ] Actions → Backup Sanity → Run workflow: raz zwykły, raz z „pełny". Oba zielone,
      oba pliki leżą na VPS, `gzip -t` przechodzi.
- [ ] **Test odtworzenia** (pełny backup, osobny dataset, w `studio/`):
      ```
      pnpm exec sanity datasets create backup-test --visibility private
      pnpm exec sanity datasets import <plik>-pelny.tar.gz -d backup-test
      ```
      W Vision na `backup-test`: liczba dokumentów `page` i obrazy jak w `production`.
      Potem `pnpm exec sanity datasets delete backup-test` — plan Free ma limit datasetów.
- [ ] Następnego dnia rano: nocny backup z 03:00 jest na VPS.

## 9. SEO i jakość przed ogłoszeniem

- [ ] `pnpm lh` — desktop 100/100/100/100, mobile perf ≥ 90, reszta 100.
- [ ] Podgląd źródła strony głównej i jednej podstrony: title, description, canonical
      z domeną produkcyjną, `og:image`, JSON-LD z danymi klienta.
- [ ] Rich Results Test (search.google.com/test/rich-results): LocalBusiness bez błędów,
      FAQ na stronach z sekcją pytań.
- [ ] Podgląd linku: Facebook Sharing Debugger i LinkedIn Post Inspector — obraz, tytuł, opis.
- [ ] `https://<domena>/robots.txt` i `/sitemap.xml` — domena produkcyjna, bez stron `noindex`.
- [ ] ⏳ **Search Console**: usługa typu „Domena", weryfikacja rekordem TXT w Cloudflare DNS.
- [ ] Search Console → Mapy witryn → `https://<domena>/sitemap.xml` → „Powodzenie".
- [ ] Search Console → Sprawdzanie adresu URL → strona główna → „Poproś o zindeksowanie".
- [ ] Przy zmianie domeny: Search Console starej domeny → „Zmiana adresu".
- [ ] **Google Business Profile**: adres strony = domena kanoniczna, NAP i godziny zgodne
      ze Studio, kategoria główna ustawiona, profil zweryfikowany.

## 10. Przekazanie klientowi

- [ ] Klient zaproszony do Sanity (Members → Invite) z rolą **Editor**, nie Administrator.
- [ ] `docs/DLA-KLIENTA.md` — uzupełniony adres Studio i kontakt; wysłany jako PDF.
- [ ] **Test klienta**: bez podpowiedzi zmienia numer telefonu w stopce (kryterium:
      < 60 s) i widzi zmianę na stronie po kilku minutach. Jeśli nie — zapisz, gdzie utknął.
- [ ] Klient ma dostęp do: Cloudflare (albo wie, że domenę trzymasz Ty), Search Console
      (użytkownik), wizytówki Google (właściciel), panelu analityki.

## 11. Po starcie

- [ ] +7 dni: Search Console — strony zaindeksowane, brak błędów 404 ze starych adresów;
      backupy z każdej nocy na VPS; formularz bez spamu.
- [ ] +30 dni: Search Console — skuteczność i zapytania; Lighthouse na produkcji.
