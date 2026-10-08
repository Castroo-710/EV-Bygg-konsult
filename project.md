# EV-Bygg-konsult – vägen till en live-sajt

Steg-för-steg-plan för att ta sajten till produktion. Förebild för struktur och flöde:
[heko.se](https://heko.se/).

**Strategi:** börja enkelt. Förfrågningar går direkt till företagets mejl (och kunder kan ringa).
Ingen databas eller egen backend behövs för att gå live. Ärendehantering med Supabase läggs till
först när volymen eller antalet medarbetare kräver det – inget i fas 1 behöver göras om då.

| Fas | Vad | Tjänster |
|-----|-----|----------|
| **1** | Sajten live, formulär → mejl till `info@`, ring-knapp | Netlify + Netlify Forms |
| **1b** | Kvittensmejl till kunden ("vi återkommer inom 1 arbetsdag") | + Netlify Function + Resend |
| **2** | Ärendehantering: status, historik, admin, svar kopplade till ärenden | + Supabase, Turnstile |
| **3** | Bilagor, mötesbokning, påminnelser, statistik | |

---

## 0. Nuläge

| Del | Status |
|-----|--------|
| `frontend/` | Vite + React 19 + TypeScript + Tailwind 4. En sida med ankarlänkar. Sektioner: Header, Hero, Services, About, Projects, Booking, Contact, Footer. |
| Formulär | `Contact.tsx` → `POST /api/contact`, `Booking.tsx` → `POST /api/booking`. Endpoints finns inte – byts mot Netlify Forms i fas 1. |
| `backend/` | Tom. Behövs först i fas 2. |
| Innehåll | `company.ts` och `projects.ts` innehåller **platshållare** (telefon, org.nr, adress, placehold.co-bilder). |
| Git | GitHub: `Castroo-710/EV-Bygg-konsult`. |
| Konton | Netlify och Supabase finns redan. |

### Kända buggar att rätta tidigt
- `Contact.tsx`/`Booking.tsx`: `event.currentTarget.reset()` körs efter `await` → `currentTarget` är
  `null` → lyckade utskick visas som fel. Spara `const form = event.currentTarget` före `await`.
- `Booking.tsx`: projekttyp är förvald till första tjänsten – lägg till tomt "Välj…"-alternativ.
- `Booking.tsx`: datumfältet tillåter passerade datum – sätt `min` till dagens datum.
- `npm run lint` kraschar: `eslint.config.js` importerar `eslint-config-prettier` som saknas i
  `package.json` (`npm i -D eslint-config-prettier prettier`).

---

## 1. Fas 1 – Netlify + Netlify Forms

```
 Besökare ──► Netlify (statisk React-sajt, CDN, HTTPS)
                │  formulär (POST till Netlify Forms)
                ▼
             Netlify Forms ──► spamfilter ──► mejlnotis till info@
                                         └──► sparas i Netlify UI (lista, export CSV)
 Besökare ──► ring-knapp (tel:) ──► företagets telefon
```

### 1.1 Ändringar i koden
1. **Statisk kopia av formulären i `frontend/index.html`** – Netlify hittar formulär vid deploy genom
   att läsa HTML, och React renderar dem först i webbläsaren. Fältnamnen måste matcha React-formulären:
   ```html
   <form name="kontakt" data-netlify="true" netlify-honeypot="bot-field" hidden>
     <input name="name" /><input name="email" /><input name="phone" />
     <textarea name="message"></textarea><input name="consent" /><input name="source" />
   </form>
   <form name="bokning" data-netlify="true" netlify-honeypot="bot-field" hidden>
     <input name="name" /><input name="phone" /><input name="email" />
     <input name="preferredDate" /><input name="projectType" />
     <textarea name="message"></textarea><input name="consent" /><input name="source" />
   </form>
   ```
2. **React-formulären** skickar till Netlify i stället för `/api/...`:
   ```ts
   const form = event.currentTarget           // före await!
   const data = new FormData(form)
   data.append('form-name', 'kontakt')        // resp. 'bokning'
   await fetch('/', {
     method: 'POST',
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
   })
   form.reset()
   ```
   Lägg också till ett dolt honeypot-fält `bot-field` och en obligatorisk **samtyckesruta** med länk
   till integritetspolicyn.
3. **Ring-knapp** som alltid syns i mobil (`company.phoneHref`), och löfte om svarstid nära formuläret.
4. Rätta buggarna i §0.

### 1.2 Begränsningar att känna till
- Netlify Forms fungerar inte i `npm run dev` – testa på en deploy preview eller produktions-URL.
- Gratisplanen har ett tak på antal inskick per månad – se *Forms → Usage* i Netlify.
- Ingen kvittens till kunden – det löses i fas 1b.
- Inkorgen är ärendesystemet: ingen status/historik. Använd gärna en etikett/mapp per status i
  mejlklienten tills fas 2.

---

## 2. Kopplingar – när och hur

### Steg A – GitHub (klart)
Koden ligger på `origin/main`. Valfritt: *Settings → Branches* → skydda `main`.

### Steg B – Netlify ↔ GitHub (nu)
1. Netlify → **Add new project → Import an existing project → GitHub** → välj `EV-Bygg-konsult`.
2. Build-inställningar:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Deploy → sajten finns på `<namn>.netlify.app`. Varje push till `main` deployar automatiskt.
4. *Project configuration → Build & deploy → Deploy Previews*: på för pull requests.

Vill du ha konfigurationen i repot i stället för i UI:t – lägg `netlify.toml` i repo-roten:
```toml
[build]
  base    = "frontend"
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"   # relativt base → frontend/netlify/functions (fas 1b)
```

### Steg C – Netlify Forms (när formulären är ändrade enligt §1.1)
1. Netlify → projektet → **Forms → Enable form detection**.
2. Deploya igen. Formulären `kontakt` och `bokning` ska nu synas under *Forms*.
3. **Mejlnotis:** *Project configuration → Notifications → Emails and webhooks → Form submission
   notifications → Add notification → Email notification* → `info@…` → välj formulär. Gör en per formulär.
4. Skicka ett testinskick från deployad sajt. Kontrollera att mejlet kommer fram och vad "Svara"
   går till – om svaret inte går till kunden, kopiera kundens adress ur mejlet (eller gå vidare med fas 1b).
5. Spam: Netlify filtrerar automatiskt + honeypot. Vid problem: lägg till `data-netlify-recaptcha="true"`.

### Steg D – Egen domän och företagsmejl (vid lansering)
1. Köp domän (t.ex. `ev-byggkonsult.se`) i företagets namn.
2. Företagsmejl `info@` via Google Workspace / Microsoft 365 – MX, SPF, DKIM enligt leverantören.
3. Netlify → *Domain management → Add a domain* → domän + `www`. Peka DNS till **Netlify DNS**
   (enklast) eller lägg `A`/`CNAME` hos registraren. HTTPS skapas automatiskt.
4. Flyttas DNS till Netlify: **kopiera alla befintliga mejlposter först** (MX, SPF, DKIM, DMARC).
5. DMARC: `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:info@…` → skärp till `quarantine` senare.

### Steg E – Kvittensmejl via Resend (fas 1b, kräver egen domän)
Netlify kör automatiskt en function som heter **`submission-created`** för varje godkänt inskick
(spam filtreras bort först). Den skickar kvittensen – formulären ändras inte.

1. Resend → **Domains → Add domain** → lägg in DNS-posterna (SPF/DKIM) → *Verify*.
2. Resend → **API Keys → Create** (sending).
3. Netlify → *Project configuration → Environment variables* (scope: Functions):

   | Variabel | Exempel | Hemlig |
   |----------|---------|--------|
   | `RESEND_API_KEY` | `re_…` | **ja** |
   | `MAIL_FROM` | `EV-Bygg-konsult <info@ev-byggkonsult.se>` | nej |
   | `MAIL_REPLY_TO` | `info@ev-byggkonsult.se` | nej |

4. Skapa `frontend/netlify/functions/submission-created.ts`: läs `payload.data` (namn, e-post,
   formulär), skicka kvittens med Resend till kunden och `Reply-To: info@`. Escapa all kundtext.
5. Valfritt: skicka även en egen, snyggare notis till `info@` med `Reply-To` = kunden och stäng av
   Netlifys standardnotis.
6. Lägg `.env.example` i repot med **namnen** (utan värden). `.env` är redan git-ignorerad.

Lokalt: `npx netlify link` + `npx netlify dev` injicerar miljövariablerna.

---

## 3. Innehåll, struktur och SEO (parallellt med fas 1)

### 3.1 Sidor som HEKO
```
/                         Startsida
/tjanster                 Översikt
/tjanster/:slug           En mall för alla tjänster (t.ex. /tjanster/nybyggnation-stockholm)
/projekt                  Referensprojekt (före/efter-bilder, korta case)
/om-oss
/kontakt
/integritetspolicy
```
- `react-router` + **förrendering** av sidorna (t.ex. `vite-react-ssg`) så sökmotorer ser innehållet.
  Alternativ: Astro. Lägg SPA-fallback i `netlify.toml` (`/*` → `/index.html` 200) om förrendering saknas.
- `services.ts` per tjänst: `slug`, `title`, `intro`, `includes[]`, `benefits[]`, `faq[]`,
  `seoTitle`, `seoDescription`, ev. `priceFrom`.
- Tjänstesida: hero "{Tjänst} Stockholm" + CTA → vad ingår → 4 fördelskort → formulär (förifylld
  tjänst) → FAQ (+ `FAQPage` JSON-LD) → footer.

### 3.2 Förtroende och konvertering
- Riktiga uppgifter i `company.ts`, riktiga projekt och bilder (WebP/AVIF).
- Certifieringar, F-skatt, ansvarsförsäkring, medlemskap, Google-recensioner.
- ROT-avdrag förklarat för renovering/tillbyggnad. Gärna prisexempel ("från …").
- Guider: "Behöver jag bygglov för …?", "Vad kostar en konstruktionsritning?".
- Skicka med `source` (sida + UTM) i formulären för att se var förfrågningar kommer ifrån.

### 3.3 SEO
`<title>`, meta description, canonical, Open Graph per sida · `LocalBusiness` JSON-LD ·
`sitemap.xml` + `robots.txt` · Google Business Profile · Google Search Console.

---

## 4. GDPR och juridik (krävs redan i fas 1)

- Integritetspolicy: uppgifter, ändamål, rättslig grund, lagringstid, mottagare (Netlify,
  mejlleverantör, Resend), rättigheter, kontakt. Netlify/Resend är amerikanska – nämn
  tredjelandsöverföring (EU–US Data Privacy Framework).
- DPA (personuppgiftsbiträdesavtal) med Netlify, mejlleverantören och Resend.
- Gallring: radera gamla inskick i Netlify *Forms* och gamla mejl enligt angiven lagringstid.
- Ingen spårning → ingen cookiebanner. Statistik: cookiefri (Plausible, Umami, Netlify Analytics).
- Sidfot: företagsnamn, org.nr, adress.

---

## 5. Fas 2 – ärendehantering med Supabase

Gör detta när inkorgen inte längre räcker: många förfrågningar, flera som delar på dem, eller behov
av statistik.

### 5.1 Arkitektur
```
 Besökare ──► Netlify Function POST /api/inquiries ──► Turnstile (spamkoll)
                   ├──► Supabase Postgres (kund, ärende, händelse)   [secret key, endast server]
                   └──► Resend (kvittens + notis)
 Personal ──► /admin (React) ──► Supabase Auth + Postgres med RLS   [publishable key]
 Kund svarar ──► Resend inbound webhook ──► Netlify Function ──► ärendets tidslinje
```
- Formulären går från Netlify Forms till egen function (Netlify Forms + `submission-created` kan
  också användas och skriva till Supabase – enklare övergång).
- Supabase **secret key** (`sb_secret_…`, tidigare "service_role") bara i Netlifys Functions-variabler.
  Webbläsaren får bara **publishable key** (`sb_publishable_…`, tidigare "anon").

### 5.2 Repostruktur
npm workspaces så frontend och functions delar zod-scheman och typer:
```
package.json             workspaces: ["frontend", "backend"]
netlify.toml             command = "npm run build -w frontend", publish = "frontend/dist",
                         functions = "backend/functions"
backend/functions/       inquiries.ts, inbound-email.ts, admin-reply.ts
backend/src/             schemas.ts, mail/, supabase.ts
supabase/migrations/     SQL (versionshanterat)
```

### 5.3 Kopplingar
**Supabase-projekt**
1. *New project* → `ev-bygg-prod`, region **EU** (Stockholm om den finns, annars Frankfurt). Spara
   databaslösenordet i en lösenordshanterare. Skapa även `ev-bygg-dev` (gratisplanen räcker där).
2. Lokalt:
   ```bash
   npx supabase login
   npx supabase init
   npx supabase link --project-ref <ref>
   npx supabase migration new init     # fyll i SQL från §5.4
   npx supabase db push                # alltid mot dev först
   ```
3. *Project Settings → API Keys* → Project URL, publishable key, secret key.

**Supabase ↔ Netlify** – *Environment variables*, olika värden per deploy context
(*Production* → prod, *Deploy previews / Local development* → dev):

| Variabel | Scope | Hemlig |
|----------|-------|--------|
| `SUPABASE_URL` | Functions | nej |
| `SUPABASE_SECRET_KEY` | Functions | **ja** |
| `VITE_SUPABASE_URL` | Builds | nej |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Builds | nej |
| `VITE_TURNSTILE_SITE_KEY` | Builds | nej |
| `TURNSTILE_SECRET_KEY` | Functions | **ja** |

(Netlifys Supabase-extension kan sätta Supabase-variablerna automatiskt.)

**Turnstile:** Cloudflare → *Turnstile → Add widget* → domäner `localhost`, `*.netlify.app`, egen domän.

**Auth för admin**
1. *Authentication → Sign In / Providers*: Email på, **"Allow new users to sign up" av**.
2. *URL Configuration*: Site URL = produktionsdomän; Redirect URLs `http://localhost:8888/**`,
   `https://*--<namn>.netlify.app/**`, `https://ev-byggkonsult.se/**`.
3. *SMTP Settings*: koppla Resend (Supabases inbyggda mejl är inte för produktion).
4. *Users → Invite user* per medarbetare → lägg in i `staff`-tabellen.

**Inkommande kundsvar**
1. Resend → mottagning (inbound) på `in.ev-byggkonsult.se` (MX-post). Alternativ: Postmark Inbound.
2. Webhook → `/api/webhooks/inbound-email`, `RESEND_WEBHOOK_SECRET` (Functions, **hemlig**), verifiera signatur.
3. Utgående svar: `Reply-To: arende+EVB-2026-0042@in.ev-byggkonsult.se`.
4. Vidarebefordra `info@` dit så att även direktmejl blir ärenden.

### 5.4 Schema och RLS
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
  source text,
  status case_status not null default 'ny',
  assigned_to uuid references auth.users(id),
  project_address text,
  preferred_date date,
  message text,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table case_events (
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
  role text not null default 'staff'
);

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
Inga policies för `anon` → besökare kan varken läsa eller skriva. Testa det uttryckligen.

### 5.5 Admin (`/admin`, noindex)
Inloggning → ärendelista (filter, sök, gärna Kanban) → ärendevy (tidslinje, status, anteckningar,
svara kund) → översikt (nya, per tjänst, andel vunna) · knapp "Nytt ärende" för telefonsamtal.
Tills den finns: Supabase Studio → Table Editor.

### 5.6 Att tänka på
- **Gratisplanen pausar projekt** efter ca en veckas inaktivitet och saknar dagliga backuper →
  prod på **Pro**. Testa en återställning till dev.
- DPA med Supabase. Gallring via `pg_cron` eller Netlify Scheduled Function. Export/radering per kund.

---

## 6. Test, drift och säkerhet

- Före lansering: skicka testinskick från båda formulären → notis till `info@` (→ kvittens i fas 1b).
- Lighthouse ≥ 90 på publika sidor; tillgänglighet (labels, kontrast, tangentbord).
- CI (GitHub Actions) eller Netlify-build: lint, typecheck, build.
- Konton (Netlify, domän, mejl, Resend, Supabase) i **företagets** namn, tvåstegsverifiering,
  minst två personer med åtkomst.
- Upptidskoll (UptimeRobot/Better Stack). Kolla Resend-dashboard och DMARC-rapporter första veckorna.
- Hemligheter endast i Netlifys miljövariabler – aldrig i git.

---

## 7. Checklista

**Fas 1 – live med formulär till mejl**
- [x] Steg A: frontend + plan på GitHub
- [ ] Rätta buggarna i §0 (formulär, lint)
- [ ] Steg B: Netlify kopplat till GitHub, test-URL fungerar
- [ ] §1.1: formulär till Netlify Forms, honeypot, samtycke, ring-knapp
- [ ] Steg C: form detection + mejlnotiser till `info@`, testat
- [ ] Riktigt innehåll (`company.ts`, projekt, bilder), integritetspolicy
- [ ] Routing + tjänstesidor + förrendering + SEO-grund
- [ ] Steg D: egen domän, företagsmejl, SPF/DKIM/DMARC
- [ ] Search Console + Google Business Profile

**Fas 1b – kvittens till kund**
- [ ] Steg E: Resend-domän, `submission-created`-function, miljövariabler

**Fas 2 – ärendehantering**
- [ ] Workspaces + `backend/` + Supabase dev/prod + migration med RLS
- [ ] Function `POST /api/inquiries` + Turnstile, eller `submission-created` → Supabase
- [ ] Auth, `/admin`, svara kund, inkommande svar, `info@` vidarebefordras
- [ ] Prod på Supabase Pro, gallring och export/radering

**Fas 3 – förbättringar**
- [ ] Bilagor (foton/ritningar)
- [ ] Mötesbokning (t.ex. Cal.com-inbäddning)
- [ ] Påminnelser för obesvarade förfrågningar, statistik
- [ ] Guider/artiklar, prisexempel, recensioner på sajten
