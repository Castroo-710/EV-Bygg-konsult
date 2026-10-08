# EV-Bygg-konsult – vägen till en live-sajt (Netlify + Supabase)

Steg-för-steg-plan för att ta sajten till produktion med formulär, kundmejl och ärendehantering –
utan egen server. Förebild för struktur och flöde: [heko.se](https://heko.se/).

---

## 0. Nuläge

| Del | Status |
|-----|--------|
| `frontend/` | Vite + React 19 + TypeScript + Tailwind 4. En sida med ankarlänkar. Sektioner: Header, Hero, Services, About, Projects, Booking, Contact, Footer. |
| Formulär | `Contact.tsx` → `POST /api/contact`, `Booking.tsx` → `POST /api/booking`. Endpoints finns inte ännu. |
| `backend/` | Tom. Blir hem för Netlify Functions + delad kod (se §2). |
| Innehåll | `company.ts` och `projects.ts` innehåller **platshållare** (telefon, org.nr, adress, placehold.co-bilder). |
| Git | Repo på GitHub: `Castroo-710/EV-Bygg-konsult`. |
| Konton | Netlify och Supabase finns redan. |

### Kända buggar att rätta tidigt
- `Contact.tsx`/`Booking.tsx`: `event.currentTarget.reset()` körs efter `await` → `currentTarget` är
  `null` → lyckade utskick visas som fel. Spara `const form = event.currentTarget` före `await`.
- `Booking.tsx`: projekttyp är förvald till första tjänsten – lägg till tomt "Välj…"-alternativ.
- `Booking.tsx`: datumfältet tillåter passerade datum – sätt `min` till dagens datum.

---

## 1. Arkitektur

```
 Besökare ──► Netlify (statisk React-sajt, CDN, HTTPS)
                │
                │  POST /api/inquiries
                ▼
             Netlify Function ──► Cloudflare Turnstile (spamkoll)
                │
                ├──► Supabase Postgres (kund, ärende, händelse)   [secret key, endast server]
                └──► Resend (kvittens till kund + notis till info@)

 Personal ──► /admin (React) ──► Supabase Auth + Postgres med RLS   [publishable key]

 Kund svarar på mejl ──► Resend inbound webhook ──► Netlify Function ──► ärendets tidslinje
```

| Behov | Tjänst |
|-------|--------|
| Hosting, build, previews, domän, HTTPS | **Netlify** |
| Serverlogik (formulär, mejl, webhooks) | **Netlify Functions** |
| Databas, inloggning, behörighet, filer | **Supabase** (Postgres, Auth, RLS, Storage) |
| Transaktionsmejl ut + inkommande svar | **Resend** |
| Spamskydd | **Cloudflare Turnstile** (gratis, cookiefritt) |
| Företagsmejl `info@` | Google Workspace / Microsoft 365 |

### Grundregler
- Publika formulär skriver **aldrig direkt** till Supabase från webbläsaren – alltid via en Netlify
  Function (validering, Turnstile, rate limit).
- Supabase **secret key** (`sb_secret_…`, tidigare "service_role") finns **bara** i Netlifys
  miljövariabler för Functions. Aldrig i frontend, aldrig i git.
- Webbläsaren får bara **publishable key** (`sb_publishable_…`, tidigare "anon") – och RLS ser till
  att den inte kan läsa något utan inloggning.

---

## 2. Repostruktur (mål)

npm workspaces så att frontend och functions delar typer och valideringsscheman.

```
EV-Bygg-konsult/
  package.json             workspaces: ["frontend", "backend"]
  netlify.toml             build- och functions-konfiguration
  frontend/                React-sajten (finns)
  backend/
    package.json           @supabase/supabase-js, resend, zod
    functions/
      inquiries.ts         POST /api/inquiries
      inbound-email.ts     POST /api/webhooks/inbound-email   (fas 2)
    src/
      schemas.ts           zod-scheman – importeras även av frontend
      mail/                mejlmallar
      supabase.ts          server-klient (secret key)
  supabase/
    config.toml            skapas av `supabase init`
    migrations/            SQL-migrationer (versionshanterade)
  project.md
```

`netlify.toml`:
```toml
[build]
  command   = "npm run build -w frontend"
  publish   = "frontend/dist"

[functions]
  directory = "backend/functions"
  node_bundler = "esbuild"

[dev]
  command    = "npm run dev -w frontend"
  targetPort = 5173

# SPA-fallback när routing införs
[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

Functions får egen URL via `export const config = { path: "/api/inquiries" }` i filen – ingen
redirect behövs, och `netlify dev` gör att `/api/*` fungerar lokalt (ingen Vite-proxy behövs).

---

## 3. Kopplingar – när och hur

Gör stegen i den här ordningen. Varje steg säger **när** det behövs.

### Steg A – GitHub (nu)
1. Committa `frontend/` och `project.md` och pusha till `origin/main`.
2. På GitHub: *Settings → Branches* → skydda `main` (valfritt men bra senare).

### Steg B – Netlify ↔ GitHub (direkt efter A)
Ger en publik test-URL och automatisk deploy vid varje push.
1. Netlify → **Add new project → Import an existing project → GitHub** → välj `EV-Bygg-konsult`.
2. Build-inställningar (tills `netlify.toml` finns):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Deploy. Sajten hamnar på `<namn>.netlify.app`.
4. *Project configuration → Build & deploy → Deploy Previews*: på för pull requests.
5. När `netlify.toml` + workspaces läggs till (§2) – töm fälten i UI:t, filen tar över.

Lokal koppling (när functions börjar skrivas):
```bash
npm i -D netlify-cli      # i repo-roten
npx netlify login
npx netlify link          # välj projektet du skapade ovan
npx netlify dev           # sajt + functions på http://localhost:8888, env-variabler injiceras
```

### Steg C – Supabase-projekt (när backend påbörjas)
1. Supabase → **New project**. Namn `ev-bygg-prod`, region **EU** (Stockholm om den finns i listan,
   annars Frankfurt). Spara databaslösenordet i en lösenordshanterare.
2. Skapa gärna ett andra projekt `ev-bygg-dev` för utveckling (gratisplanen räcker där).
3. Lokal koppling:
   ```bash
   npx supabase login
   npx supabase init                         # skapar supabase/
   npx supabase link --project-ref <ref>     # ref finns i projektets URL/Settings
   npx supabase migration new init           # skapa schema-fil, fyll i (§4)
   npx supabase db push                      # kör migrationer mot länkat projekt
   ```
   Kör alltid `db push` mot **dev** först, länka sedan om till prod.
4. Hämta nycklar: *Project Settings → API Keys* → `Project URL`, `publishable key`, `secret key`.

### Steg D – Supabase ↔ Netlify (när första function skrivs)
Netlify → *Project configuration → Environment variables* → lägg till:

| Variabel | Värde | Scope | Hemlig |
|----------|-------|-------|--------|
| `SUPABASE_URL` | Project URL | Functions | nej |
| `SUPABASE_SECRET_KEY` | secret key | Functions | **ja** |
| `VITE_SUPABASE_URL` | Project URL | Builds | nej |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key | Builds | nej |

- Använd **olika värden per deploy context**: *Production* → prod-projektet, *Deploy previews /
  Local development* → dev-projektet.
- Markera hemliga värden som *Contains secret values*.
- Alternativ: Netlifys **Supabase-extension** sätter variablerna automatiskt – men manuellt ger full
  kontroll över namn och contexts.
- Lägg en `.env.example` i repot med **namnen** (utan värden). `.env` är redan git-ignorerad.

### Steg E – Resend (när kvittensmejl ska skickas)
Kräver egen domän för riktiga utskick. Före domän: Resends testavsändare kan bara skicka till din
egen kontoadress – räcker för utveckling.
1. Resend → **Domains → Add domain** → t.ex. `ev-byggkonsult.se` (eller subdomän `mail.`).
2. Lägg in DNS-posterna Resend visar (SPF/DKIM, ev. MX för retur) hos DNS-leverantören → *Verify*.
3. **API Keys → Create** (behörighet: sending) → Netlify-variabler:

| Variabel | Exempel | Scope | Hemlig |
|----------|---------|-------|--------|
| `RESEND_API_KEY` | `re_…` | Functions | **ja** |
| `MAIL_FROM` | `EV-Bygg-konsult <info@ev-byggkonsult.se>` | Functions | nej |
| `MAIL_TO_INTERNAL` | `info@ev-byggkonsult.se` | Functions | nej |
| `SITE_URL` | `https://ev-byggkonsult.se` | Functions | nej |

4. Lägg till en DMARC-post (`_dmarc` TXT: `v=DMARC1; p=none; rua=mailto:info@…`), skärp till
   `quarantine` när allt levererar korrekt.
5. **Supabase Auth → SMTP Settings**: koppla Resend som SMTP (inbjudnings- och lösenordsmejl till
   personal). Supabases inbyggda mejl har hårda gränser och är inte för produktion.

### Steg F – Cloudflare Turnstile (innan formuläret går live)
1. Cloudflare-konto → **Turnstile → Add widget** → domäner: `localhost`, `*.netlify.app`, egen domän.
2. Netlify-variabler: `VITE_TURNSTILE_SITE_KEY` (Builds, ej hemlig), `TURNSTILE_SECRET_KEY`
   (Functions, **hemlig**).

### Steg G – Egen domän (vid lansering)
1. Netlify → *Domain management → Add a domain* → `ev-byggkonsult.se` + `www`.
2. Antingen peka domänens DNS till **Netlify DNS** (enklast), eller lägg `A`/`CNAME` hos din
   DNS-leverantör enligt Netlifys instruktion. HTTPS-certifikat skapas automatiskt.
3. Behåll MX/SPF/DKIM/DMARC för mejl när DNS flyttas – kopiera alla befintliga poster först.
4. Uppdatera `SITE_URL`, Turnstile-domäner och Supabase Auth URL:er (steg H).

### Steg H – Supabase Auth för admin (fas 2)
1. *Authentication → Sign In / Providers*: Email på, **"Allow new users to sign up" av**.
2. *Authentication → URL Configuration*: Site URL = produktionsdomän. Redirect URLs:
   `http://localhost:8888/**`, `https://*--<namn>.netlify.app/**`, `https://ev-byggkonsult.se/**`.
3. *Authentication → Users → Invite user* för varje medarbetare, lägg sedan in dem i `staff`-tabellen.

### Steg I – Inkommande kundsvar (fas 2)
1. Resend → aktivera mottagning (inbound) på en subdomän, t.ex. `in.ev-byggkonsult.se` (MX-post).
2. Webhook → `https://ev-byggkonsult.se/api/webhooks/inbound-email`, spara signeringshemligheten som
   `RESEND_WEBHOOK_SECRET` (Functions, **hemlig**). Verifiera signaturen i functionen.
3. Utgående mejl sätts med `Reply-To: arende+EVB-2026-0042@in.ev-byggkonsult.se` så svaret kopplas
   till rätt ärende.

> Om Resends mottagning inte passar: **Postmark Inbound** fungerar på samma sätt.

---

## 4. Databas (Supabase)

### 4.1 Schema – första migrationen
```sql
create type case_status as enum
  ('ny','kontaktad','mote_bokat','offert_skickad','vunnen','forlorad','pagaende','avslutad');

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create sequence case_ref_seq;

create table cases (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null
    default 'EVB-' || to_char(now(),'YYYY') || '-' || lpad(nextval('case_ref_seq')::text, 4, '0'),
  customer_id uuid not null references customers(id) on delete cascade,
  service text,
  source text,                 -- sida/UTM som förfrågan kom från
  status case_status not null default 'ny',
  assigned_to uuid references auth.users(id),
  project_address text,
  preferred_date date,
  message text,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table case_events (     -- fullständig historik per ärende
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  type text not null,          -- created | status_changed | note | email_out | email_in
  payload jsonb not null default '{}',
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'staff'   -- staff | admin
);
```

### 4.2 Row Level Security
```sql
alter table customers   enable row level security;
alter table cases       enable row level security;
alter table case_events enable row level security;
alter table staff       enable row level security;

create function is_staff() returns boolean
  language sql stable security definer set search_path = public
  as $$ select exists (select 1 from staff where user_id = auth.uid()) $$;

create policy staff_all on customers   for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on cases       for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on case_events for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_read on staff      for select to authenticated using (is_staff());
```
Inga policies för `anon` = besökare kan varken läsa eller skriva. Netlify-functionen använder secret
key och går förbi RLS – därför valideras allt där.

**Testa RLS:** logga in med publishable key utan session och verifiera att `select * from cases`
returnerar tomt.

### 4.3 Supabase-plan
- **Gratisplanen pausar projekt** efter ca en veckas inaktivitet och har inga dagliga backuper.
  Prod-projektet bör ligga på **Pro** när sajten går live. Dev kan ligga kvar på gratis.
- Teckna DPA (personuppgiftsbiträdesavtal) i Supabase, Netlify och Resend.

---

## 5. Netlify Function: `POST /api/inquiries`

Ersätter `/api/contact` och `/api/booking` (frontend skickar `type: "contact" | "booking"`).

Flöde:
1. Endast `POST`, max ~10 kB body.
2. Validera med zod (delat schema): name, email, phone?, service?, projectAddress?, preferredDate?,
   message, consent = true, honeypot tomt, turnstileToken.
3. Verifiera Turnstile-token mot Cloudflare (`TURNSTILE_SECRET_KEY`).
4. Enkel rate limit (t.ex. Netlify Blobs per IP, eller Netlifys inbyggda rate limiting-regler).
5. Upsert kund på e-post → skapa `cases` → `case_events` (`created`).
6. Skicka två mejl via Resend: kvittens till kund + notis till `MAIL_TO_INTERNAL`
   (`Reply-To` = kunden, länk till ärendet i admin).
7. Svara `201 { reference }`. Vid fel: logga, svara `500` utan interna detaljer.

---

## 6. Mejlflöden

| Händelse | Till | Innehåll |
|----------|------|----------|
| Ny förfrågan | Kund | "Tack – vi har tagit emot din förfrågan (EVB-2026-0042). Vi återkommer inom 1 arbetsdag." + sammanfattning. |
| Ny förfrågan | `info@` | Alla uppgifter + länk till ärendet. `Reply-To` = kunden. |
| Svar från admin (fas 2) | Kund | Ämne `[EVB-2026-0042] …`, `Reply-To` = ärendeadress. |
| Kund svarar (fas 2) | System | Inbound-webhook → `case_events` (`email_in`) + notis till ansvarig. |
| Påminnelse (fas 3) | Ansvarig | Ärende i status *ny* > 24 h (Netlify Scheduled Function). |

Mallar: React Email (fungerar direkt med Resend) + textversion. Escapa all kundtext.

**Ärenden som inte kommer via formuläret:** knapp "Nytt ärende" i admin för telefonsamtal, och
vidarebefordran av `info@` till inbound-adressen så att allt hamnar på ett ställe.

---

## 7. Frontend – struktur som HEKO

### 7.1 Sidor
```
/                         Startsida
/tjanster                 Översikt
/tjanster/:slug           En mall för alla tjänster (t.ex. /tjanster/nybyggnation-stockholm)
/projekt                  Referensprojekt (före/efter-bilder, korta case)
/om-oss
/kontakt
/integritetspolicy
/admin/*                  Ärendehantering (inloggning, noindex)
```
- `react-router` + **förrendering** av publika sidor (t.ex. `vite-react-ssg`) så att sökmotorer ser
  innehållet. Alternativ: Astro för publika sidor.
- `services.ts` byggs ut per tjänst: `slug`, `title`, `intro`, `includes[]`, `benefits[]`, `faq[]`,
  `seoTitle`, `seoDescription`, ev. `priceFrom`.

### 7.2 Tjänstesida (mall)
Hero "{Tjänst} Stockholm" + CTA → Vad ingår → 4 fördelskort → formulär (förifylld tjänst) →
FAQ (+ `FAQPage` JSON-LD) → footer.

### 7.3 Formulär
- En gemensam komponent för kontakt/bokning. Skickar `source` (sida + UTM-parametrar).
- Fält: namn, e-post, telefon, tjänst ("Välj…"), kommun/adress, önskat datum (`min` = idag),
  meddelande, **samtycke** med länk till integritetspolicy, honeypot, Turnstile.
- Fas 3: bilagor (foton/ritningar) → Supabase Storage via signerad uppladdnings-URL från en function.

### 7.4 Innehåll som bygger förtroende
- Riktiga uppgifter i `company.ts`, riktiga projekt och bilder (WebP/AVIF).
- Certifieringar, F-skatt, ansvarsförsäkring, medlemskap, Google-recensioner.
- ROT-avdrag förklarat för renovering/tillbyggnad. Gärna prisexempel ("från …").
- Guider: "Behöver jag bygglov för …?", "Vad kostar en konstruktionsritning?".
- Mobil: alltid synlig ring-knapp, löfte om svarstid.

### 7.5 SEO
`<title>`, meta description, canonical, Open Graph per sida · `LocalBusiness` JSON-LD ·
`sitemap.xml` + `robots.txt` · Google Business Profile · Google Search Console.

---

## 8. Adminläge (`/admin`)

Samma React-app, egen layout, `noindex`. Använder `@supabase/supabase-js` med publishable key +
inloggad session – RLS avgör vad som syns.

1. Inloggning (e-post + lösenord, Supabase Auth).
2. Ärendelista: ref, kund, tjänst, status, skapad, ansvarig · filter · sök · gärna Kanban per status.
3. Ärendevy: kunduppgifter, tidslinje (händelser + mejl), statusbyte, anteckningar, svara kund
   (via function `POST /api/admin/reply` som skickar mejl med Resend).
4. Översikt: nya ärenden, per tjänst, andel vunna.

Tills adminvyn finns: använd **Supabase Studio → Table Editor** för att läsa och uppdatera ärenden.

---

## 9. GDPR och juridik

- Integritetspolicy: uppgifter, ändamål, rättslig grund, lagringstid, mottagare (Netlify, Supabase,
  Resend, Cloudflare), rättigheter, kontakt.
- DPA med alla leverantörer. Supabase-data i EU. Netlify/Resend är amerikanska – nämn
  tredjelandsöverföring (EU–US Data Privacy Framework) i policyn.
- Gallring: t.ex. anonymisera förlorade ärenden efter 12 månader (Netlify Scheduled Function eller
  `pg_cron` i Supabase).
- Export/radering av en kunds uppgifter från admin.
- Ingen spårning → ingen cookiebanner. Statistik: cookiefri (Plausible, Umami, Netlify Analytics).
- Sidfot: företagsnamn, org.nr, adress.

---

## 10. Test och kvalitet

- Functions: enhetstester för validering och ärendelogik med mockad Supabase/Resend.
- RLS-test: anonym klient får inget, inloggad icke-staff får inget, staff får allt.
- Frontend: formulärstatus (lyckat/fel), tillgänglighet (labels, kontrast, tangentbord).
- Lighthouse ≥ 90 på publika sidor.
- CI (GitHub Actions): lint, typecheck, tester, build. Netlify bygger bara om CI är grön
  (eller kör kontrollerna i Netlify-builden).
- End-to-end i produktion före lansering: förfrågan → kvittensmejl → notis → ärende i Studio/admin.

---

## 11. Drift och säkerhet

- Konton (Netlify, Supabase, Resend, Cloudflare, domän) registreras på **företaget**, med
  tvåstegsverifiering och minst två personer med åtkomst.
- Backuper: Supabase Pro har dagliga backuper – **testa en återställning** till dev-projektet.
- Övervakning: upptidskoll på `/` (UptimeRobot/Better Stack), Netlify function-loggar,
  Resend-dashboard för studs/spam, ev. Sentry.
- DMARC-rapporter första veckorna → skärp policy.

---

## 12. Checklista

**Fas 1 – MVP (kan gå live)**
- [ ] Steg A: commit + push av `frontend/` och `project.md`
- [ ] Rätta formulärbuggarna (§0)
- [ ] Steg B: Netlify kopplat till GitHub, test-URL fungerar
- [ ] Workspaces + `netlify.toml` + `backend/`-struktur
- [ ] Steg C: Supabase dev + prod, migration med schema + RLS
- [ ] Steg D: miljövariabler i Netlify per context, `.env.example`
- [ ] Function `POST /api/inquiries` + tester
- [ ] Steg E: Resend med domän, kvittens + intern notis
- [ ] Steg F: Turnstile
- [ ] Riktigt innehåll, integritetspolicy, samtyckesruta
- [ ] Routing + tjänstesidor + förrendering + SEO-grund
- [ ] Steg G: egen domän, Supabase prod på Pro
- [ ] End-to-end-test i produktion, Search Console + Google Business Profile

**Fas 2 – ärendehantering**
- [ ] Steg H: Supabase Auth, signup av, inbjudna medarbetare
- [ ] `/admin`: lista, ärendevy, status, anteckningar, manuellt ärende
- [ ] Svara kund från admin
- [ ] Steg I: inkommande kundsvar kopplas till ärenden, `info@` vidarebefordras
- [ ] Gallring och export/radering (GDPR)

**Fas 3 – förbättringar**
- [ ] Bilagor via Supabase Storage
- [ ] Mötesbokning (t.ex. Cal.com-inbäddning)
- [ ] Påminnelser för obesvarade ärenden, statistik
- [ ] Guider/artiklar, prisexempel, recensioner på sajten
