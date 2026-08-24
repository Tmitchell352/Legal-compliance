-- Permitly schema: compliance tracking for short-term rental hosts

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- profiles: one row per auth user, holds billing/subscription state
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text not null default 'none'
    check (subscription_status in ('none', 'trialing', 'active', 'past_due', 'canceled')),
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'portfolio')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- jurisdictions: curated reference data, one row per city/county market.
-- This is the editorial content that makes the product valuable —
-- readable by everyone, writable only via the service role (admin/CMS).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  city text not null,
  state text not null,
  country text not null default 'US',

  permit_required boolean not null default true,
  permit_name text,
  permit_authority text,
  permit_renewal_months integer not null default 12,
  permit_url text,

  tax_name text,
  tax_filing_frequency text
    check (tax_filing_frequency in ('monthly', 'quarterly', 'semi_annual', 'annual')),
  tax_authority text,
  tax_url text,

  occupancy_notes text,
  insurance_notes text,
  other_requirements text,

  last_verified_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.jurisdictions enable row level security;

create policy "jurisdictions are public read" on public.jurisdictions
  for select using (true);

-- ─────────────────────────────────────────────────────────────
-- properties: a host's individual listing/unit
-- ─────────────────────────────────────────────────────────────
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  jurisdiction_id uuid references public.jurisdictions (id),

  nickname text not null,
  address_line text,
  city text not null,
  state text not null,

  permit_number text,
  permit_issued_on date,
  permit_expires_on date,
  last_tax_filed_on date,

  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "properties are managed by owner" on public.properties
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists properties_user_id_idx on public.properties (user_id);

-- ─────────────────────────────────────────────────────────────
-- compliance_deadlines: generated + manual deadlines per property
-- ─────────────────────────────────────────────────────────────
create table if not exists public.compliance_deadlines (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,

  kind text not null
    check (kind in ('permit_renewal', 'tax_filing', 'insurance_renewal', 'custom')),
  title text not null,
  due_date date not null,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'completed', 'overdue', 'dismissed')),
  notes text,
  -- 0 = no reminder sent yet, 1 = the 45-day nudge, 2 = the 14-day reminder,
  -- 3 = the 3-day urgent alert. The cron job only ever moves this forward.
  reminder_stage integer not null default 0,
  reminder_sent_at timestamptz,

  created_at timestamptz not null default now()
);

alter table public.compliance_deadlines enable row level security;

create policy "deadlines are managed by property owner" on public.compliance_deadlines
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = compliance_deadlines.property_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.properties p
      where p.id = compliance_deadlines.property_id and p.user_id = auth.uid()
    )
  );

create index if not exists compliance_deadlines_property_id_idx on public.compliance_deadlines (property_id);
create index if not exists compliance_deadlines_due_date_idx on public.compliance_deadlines (due_date);

-- ─────────────────────────────────────────────────────────────
-- documents: uploaded permits/licenses/insurance certs (Supabase Storage refs)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents are managed by property owner" on public.documents
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = documents.property_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.properties p
      where p.id = documents.property_id and p.user_id = auth.uid()
    )
  );
