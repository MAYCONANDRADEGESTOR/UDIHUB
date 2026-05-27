-- ══════════════════════════════════════════
-- UDIHUB — Schema do Banco de Dados Supabase
-- ══════════════════════════════════════════

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";

-- ── USERS ──────────────────────────────────
create table users (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text unique not null,
  phone text,
  avatar text,
  role text not null default 'client' check (role in ('client', 'professional', 'admin')),
  city text default 'Uberlândia',
  neighborhood text,
  banned boolean not null default false,
  ban_reason text,
  created_at timestamptz not null default now()
);

-- ── CATEGORIES ─────────────────────────────
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  icon text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed categories
insert into categories (name, slug, icon) values
  ('Encanador / Hidráulica', 'encanador', '🔧'),
  ('Eletricista', 'eletricista', '⚡'),
  ('Pintor', 'pintor', '🎨'),
  ('Pedreiro / Reformas', 'pedreiro', '🧱'),
  ('Técnico de Ar Condicionado', 'ar-condicionado', '❄️'),
  ('Marido de Aluguel / Faz Tudo', 'marido-aluguel', '🔨'),
  ('Diarista / Faxineira', 'diarista', '🧹'),
  ('Jardineiro', 'jardineiro', '🌿'),
  ('Montador de Móveis', 'montador-moveis', '🪑'),
  ('Técnico de Informática', 'tecnico-informatica', '💻'),
  ('Gesseiro / Drywall', 'gesseiro', '🏗️'),
  ('Marceneiro', 'marceneiro', '🪵'),
  ('Serralheiro', 'serralheiro', '🔩'),
  ('Desentupidora', 'desentupidora', '🚿'),
  ('Dedetização', 'dedetizacao', '🐛'),
  ('Chaveiro', 'chaveiro', '🔑'),
  ('Vidraceiro', 'vidraceiro', '🪟'),
  ('Técnico de Refrigeração', 'refrigeracao', '🌡️'),
  ('Cuidador de Idosos', 'cuidador-idosos', '👴'),
  ('Babá / Cuidador Infantil', 'baba', '👶'),
  ('Fotógrafo', 'fotografo', '📸'),
  ('Mecânico', 'mecanico', '🚗'),
  ('Pet Sitter / Dog Walker', 'pet-sitter', '🐾');

-- ── CITIES ─────────────────────────────────
create table cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  state text not null default 'MG',
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed cities
insert into cities (name, slug, enabled) values
  ('Uberlândia', 'uberlandia', true),
  ('Uberaba', 'uberaba', false),
  ('Patos de Minas', 'patos-de-minas', false),
  ('Ituiutaba', 'ituiutaba', false),
  ('Araguari', 'araguari', false),
  ('Frutal', 'frutal', false),
  ('Monte Carmelo', 'monte-carmelo', false),
  ('Araxá', 'araxa', false);

-- ── NEIGHBORHOODS ──────────────────────────
create table neighborhoods (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid not null references cities on delete cascade,
  name text not null,
  slug text not null,
  unique (city_id, slug)
);

-- ── PROFESSIONALS ──────────────────────────
create table professionals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users on delete cascade,
  slug text unique not null,
  bio text,
  whatsapp text not null,
  category_id uuid not null references categories,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  plan text not null default 'basic' check (plan in ('basic', 'pro')),
  featured boolean not null default false,
  views_count integer not null default 0,
  avg_rating numeric(3,2) not null default 0,
  available_now boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── PROFESSIONAL NEIGHBORHOODS ─────────────
create table professional_neighborhoods (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals on delete cascade,
  neighborhood_id uuid not null references neighborhoods on delete cascade,
  unique (professional_id, neighborhood_id)
);

-- ── PROFESSIONAL PHOTOS ────────────────────
create table professional_photos (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals on delete cascade,
  url text not null,
  caption text,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── SUBSCRIPTIONS ──────────────────────────
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals on delete cascade,
  plan text not null check (plan in ('basic', 'pro')),
  status text not null default 'pending' check (status in ('active', 'inactive', 'canceled', 'pending')),
  asaas_subscription_id text,
  next_billing timestamptz,
  created_at timestamptz not null default now()
);

-- ── REVIEWS ────────────────────────────────
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals on delete cascade,
  client_id uuid not null references users on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  reply text,
  created_at timestamptz not null default now(),
  unique (professional_id, client_id)
);

-- ── WHATSAPP CLICKS (LEADS) ────────────────
create table whatsapp_clicks (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals on delete cascade,
  clicker_id uuid references users on delete set null,
  city text,
  neighborhood text,
  created_at timestamptz not null default now()
);

-- ── PROFILE VIEWS ──────────────────────────
create table profile_views (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals on delete cascade,
  viewer_ip text,
  created_at timestamptz not null default now()
);

-- ── REPORTS ────────────────────────────────
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references users on delete cascade,
  professional_id uuid not null references professionals on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

-- ── FAVORITES ──────────────────────────────
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users on delete cascade,
  professional_id uuid not null references professionals on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, professional_id)
);

-- ══════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════
create index on professionals (category_id);
create index on professionals (status, plan);
create index on professionals (avg_rating desc);
create index on whatsapp_clicks (professional_id, created_at desc);
create index on reviews (professional_id);
create index on professional_neighborhoods (professional_id);

-- ══════════════════════════════════════════
-- TRIGGERS — Update avg_rating automatically
-- ══════════════════════════════════════════
create or replace function update_professional_rating()
returns trigger as $$
begin
  update professionals
  set avg_rating = (
    select coalesce(avg(rating), 0)
    from reviews
    where professional_id = coalesce(new.professional_id, old.professional_id)
  )
  where id = coalesce(new.professional_id, old.professional_id);
  return new;
end;
$$ language plpgsql;

create trigger trg_update_rating
after insert or update or delete on reviews
for each row execute function update_professional_rating();

-- ══════════════════════════════════════════
-- RLS (Row Level Security)
-- ══════════════════════════════════════════

-- Enable RLS
alter table users enable row level security;
alter table professionals enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
alter table whatsapp_clicks enable row level security;
alter table profile_views enable row level security;
alter table reports enable row level security;
alter table subscriptions enable row level security;
alter table professional_photos enable row level security;
alter table professional_neighborhoods enable row level security;

-- Public read for professionals (active only)
create policy "Public can view active professionals"
  on professionals for select
  using (status = 'active');

-- Public read for categories
create policy "Public can view categories"
  on categories for select
  using (active = true);

-- Public read for cities
create policy "Public can view enabled cities"
  on cities for select
  using (enabled = true);

-- Public read for neighborhoods
create policy "Public can view neighborhoods"
  on neighborhoods for select
  using (true);

-- Public read for photos
create policy "Public can view professional photos"
  on professional_photos for select
  using (true);

-- Public read for professional neighborhoods
create policy "Public can view professional neighborhoods"
  on professional_neighborhoods for select
  using (true);

-- Users can read their own data
create policy "Users can view own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on users for update
  using (auth.uid() = id);

-- Professionals can edit own professional profile
create policy "Professionals can edit own profile"
  on professionals for update
  using (auth.uid() = user_id);

-- Authenticated can insert whatsapp clicks
create policy "Anyone can register whatsapp click"
  on whatsapp_clicks for insert
  with check (true);

-- Clients can insert reviews (if they clicked WhatsApp first)
create policy "Clients can create reviews"
  on reviews for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from whatsapp_clicks
      where clicker_id = auth.uid()
      and professional_id = reviews.professional_id
    )
  );

-- Public can read reviews
create policy "Public can read reviews"
  on reviews for select
  using (true);

-- Users can manage own favorites
create policy "Users can manage own favorites"
  on favorites for all
  using (auth.uid() = user_id);

-- Users can create reports
create policy "Users can create reports"
  on reports for insert
  with check (auth.uid() = reporter_id);

-- Professionals can see own subscriptions
create policy "Professionals can see own subscription"
  on subscriptions for select
  using (
    professional_id in (
      select id from professionals where user_id = auth.uid()
    )
  );
