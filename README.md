# Permitly

**Compliance command center for short-term rental hosts.** A subscription
SaaS that tracks permit renewals, occupancy-tax filing deadlines, and
per-city regulation requirements for Airbnb/Vrbo hosts, and reminds them by
email before anything lapses.

Built as a real, deployable Next.js app — not a mockup. Every screen reads
and writes real data; the only things missing are *your* accounts (Supabase
project, Stripe account, Resend account, a domain) because those can't be
provisioned on your behalf.

## Why this niche

Short-term rental regulation is a genuine, recurring pain point:

- Rules are hyper-local (city, sometimes neighborhood-specific) and change
  often — hosts have no reliable way to track updates.
- The penalty for missing a permit renewal or tax filing is real money: fines,
  suspended listings, sometimes forced delisting from Airbnb/Vrbo.
- The audience is large, findable (Airbnb host groups, STR subreddits,
  property-manager networks) and has demonstrated willingness to pay for
  tools (PriceLabs, Wheelhouse, MyLodgeTax already sell into this market).
- It's a natural fit for **programmatic SEO** — every city is a page
  (`/cities/[slug]`) that can rank for "`<city>` short-term rental permit"
  searches, which is free, compounding, passive distribution once indexed.

## Tech stack

- **Next.js 16** (App Router, Server Actions, Route Handlers) + TypeScript + Tailwind CSS 4
- **Supabase** — Postgres, Auth, Row Level Security
- **Stripe** — subscription billing (Checkout + Customer Portal + webhooks)
- **Resend** — transactional/reminder email
- Deploys cleanly to **Vercel** (includes `vercel.json` cron config)

## Project structure

```
app/
  page.tsx                  Landing page
  pricing/                  Pricing page (Stripe Checkout CTAs)
  cities/                   Public, SEO-indexable per-city regulation pages
  login/, signup/           Supabase auth (Server Actions)
  dashboard/                Authenticated app: properties, deadlines, settings
  api/stripe/               checkout / webhook / billing portal route handlers
  api/cron/send-reminders/  Daily reminder email job (Vercel Cron)
lib/
  compliance-engine.ts      Pure deadline-calculation logic (unit-testable)
  supabase/                 Browser + server + service-role Supabase clients
  stripe.ts, email.ts       Stripe SDK + Resend email templating
supabase/
  migrations/0001_init.sql  Core schema + RLS policies
  migrations/0002_storage.sql  Private Storage bucket + RLS for the document vault
  seed.sql                  18 curated jurisdictions (see "Content operations" below)
types/database.ts           Hand-written types mirroring the schema
```

## Local setup

1. **Install dependencies** (already done if you're reading this from the repo):

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then in
   the SQL editor run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage.sql`
   - `supabase/seed.sql`

   (Or, with the Supabase CLI installed and linked: `supabase db push` then
   `supabase db execute -f supabase/seed.sql`.)

3. **Copy env vars**:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Project Settings → API.

4. **Stripe** (test mode is fine to start):
   - Create two recurring Prices under one or two Products — "Pro" ($15/mo)
     and "Portfolio" ($39/mo) — and paste their price IDs into
     `STRIPE_PRICE_ID_PRO` / `STRIPE_PRICE_ID_PORTFOLIO`.
   - Copy your test secret key into `STRIPE_SECRET_KEY`.
   - For local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
     and paste the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

5. **Resend**: create an API key at resend.com and set `RESEND_API_KEY` +
   `EMAIL_FROM` (must be a domain you've verified in Resend to send in
   production; Resend's sandbox works for testing).

6. **Cron secret**: set `CRON_SECRET` to any random string — it protects the
   reminder endpoint from being triggered by anyone but your cron job.

7. Run it:

   ```bash
   npm run dev
   ```

## Deploying

1. Push this repo to GitHub, import it into Vercel.
2. Add all the env vars from `.env.example` in Vercel project settings
   (use your **live** Stripe keys once you're ready to charge real cards).
3. In Stripe Dashboard → Developers → Webhooks, add an endpoint pointing at
   `https://yourdomain.com/api/stripe/webhook` listening for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.created`, and `customer.subscription.deleted`.
   Copy its signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel.
4. Vercel Cron picks up `vercel.json` automatically and will call
   `/api/cron/send-reminders` daily at 13:00 UTC, sending an
   `Authorization: Bearer $CRON_SECRET` header that the route checks.
5. Set `NEXT_PUBLIC_SITE_URL` to your real domain.

## Content operations (this is the actual product)

The `jurisdictions` table is the editorial core of Permitly — it's what
turns a generic reminders app into something hosts trust. `supabase/seed.sql`
ships with 18 markets, five of which (New York, Los Angeles, San Francisco,
New Orleans, Honolulu) were cross-checked against official city sources at
write time; the rest are directionally correct from general knowledge and
flagged with an earlier `last_verified_on` date specifically so you re-verify
them before leaning on them commercially. **This is not legal advice** —
every page says so, and that disclaimer should stay.

Ongoing maintenance loop once you're running this for real:
- Re-verify each row against its official source on a rolling basis (the
  `last_verified_on` column makes staleness queryable — sort by it).
- Add new cities by inserting rows into `jurisdictions`; the dashboard's "add
  property" dropdown and the public `/cities` directory both read from this
  table directly, so a new row is live everywhere immediately.
- Consider a "request a city" intake (a mailto is already wired into the add
  property form) to prioritize by actual host demand.

## Go-to-market notes (how this actually makes money passively)

1. **SEO is the primary acquisition channel.** Each `/cities/[slug]` page
   targets a specific, high-intent, low-competition query
   ("nashville short term rental permit renewal"). Once Google indexes ~18
   pages of genuinely useful, sourced content, this compounds without ad
   spend. Expand the jurisdiction table and the page count — and the
   traffic — grows with it.
2. **Free tier is the funnel.** One free property removes signup friction;
   hosts who add a second property (very common — STR hosts scale fast) hit
   the paywall organically at the moment they most need the tool.
3. **Pricing** ($0 / $15 / $39) is anchored below the cost of a single missed
   permit fine, which is the actual comparison a host makes.
4. **Distribution beyond SEO**: r/AirBnBHosts and similar subreddits, Airbnb
   host Facebook groups, and STR-focused newsletters are where this audience
   already asks "how do you track your permit renewals" — answering that
   question with a link is the whole pitch.
5. **Ongoing effort is content curation, not code.** The engineering is
   done; the compounding task is keeping `jurisdictions` accurate and adding
   new cities, which is a research task, not a dev task.

## What's not implemented (be aware before launching)

- No automated ordinance-change monitoring — the `jurisdictions` table is
  operator-maintained, not auto-scraped. That's a legitimate v2 feature
  (e.g., a scheduled job that diffs official pages) but comes with real
  accuracy risk if built naively — treat it as a project of its own.
- All jurisdiction data needs a real legal/compliance review pass before you
  rely on it in a paid product used by real hosts facing real fines.
