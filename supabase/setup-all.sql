-- ============================================================
-- RRcollections — FULL database setup (run once in Supabase SQL Editor)
-- Safe to re-run. Combines: schema + product gallery + subcategories/sizes
-- + reviews + orders. Project must be RRcollections' OWN Supabase (NOT Juzubi's).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  brand       text not null,
  category    text not null,              -- sarees | lehengas | kurtas | jewellery
  price       integer not null check (price >= 0),
  mrp         integer check (mrp >= 0),   -- null = not on sale
  rating      numeric(2,1) not null default 4.5,
  reviews     integer not null default 0,
  badge       text,
  description text not null default '',
  image       text not null default '',
  in_stock    boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
-- gallery + subcategories + sizes (incremental columns)
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists subcategories text[] not null default '{}';
alter table public.products add column if not exists sizes text[] not null default '{}';
alter table public.products add column if not exists weight_oz numeric; -- shipping weight (oz); null = category default

alter table public.products enable row level security;
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (true);
-- writes happen server-side with the secret (service_role) key, which bypasses RLS.

-- ---------- ENQUIRIES / ORDERS (WhatsApp leads) ----------
create table if not exists public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  product_slug   text,
  product_name   text,
  customer_name  text,
  customer_phone text,
  message        text,
  status         text not null default 'new',
  created_at     timestamptz not null default now()
);
alter table public.enquiries enable row level security;
drop policy if exists "enquiries anyone insert" on public.enquiries;
create policy "enquiries anyone insert" on public.enquiries for insert with check (true);
drop policy if exists "enquiries read own" on public.enquiries;
create policy "enquiries read own" on public.enquiries for select using (auth.uid() = user_id);

-- ---------- NEWSLETTER ----------
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "newsletter anyone insert" on public.newsletter_subscribers;
create policy "newsletter anyone insert" on public.newsletter_subscribers for insert with check (true);

-- ---------- CUSTOMER PROFILES ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  phone      text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce(new.raw_user_meta_data->>'phone', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- WISHLISTS ----------
create table if not exists public.wishlists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, product_slug)
);
alter table public.wishlists enable row level security;
drop policy if exists "wishlists manage own" on public.wishlists;
create policy "wishlists manage own" on public.wishlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  author text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);
create index if not exists reviews_slug_idx on public.reviews(product_slug);
alter table public.reviews enable row level security;
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert
  with check (char_length(author) between 1 and 80 and char_length(comment) between 1 and 2000 and rating between 1 and 5);

-- ---------- ORDERS (Stripe checkout) ----------
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_payment_intent text unique,
  amount                integer not null,
  currency              text not null default 'usd',
  email                 text,
  customer_name         text,
  address               jsonb,
  product_slugs         text[] not null default '{}',
  status                text not null default 'paid',
  created_at            timestamptz not null default now()
);
alter table public.orders enable row level security;
-- No public policies: orders are read/written only with the secret key on the server.

-- ============================================================
-- SEED starter products (safe to re-run; upserts by slug).
-- Delete these once you add your own products in /content.
-- ============================================================
insert into public.products (slug, name, brand, category, price, mrp, rating, reviews, badge, description, image, sort_order) values
('banarasi-silk-saree','Banarasi Silk Saree with Zari Border','RRcollections Signature','sarees',4499,6999,4.7,128,'Bestseller','Handwoven Banarasi silk with intricate gold zari work and a contrast pallu. Comes with an unstitched blouse piece.','https://picsum.photos/seed/rrcollections-saree-1/700/875',1),
('kanjivaram-pure-silk-saree','Kanjivaram Pure Silk Saree','Riwaaz','sarees',8999,11999,4.9,76,'Premium','Temple-border Kanjivaram in pure mulberry silk. A timeless drape for weddings and festivals.','https://picsum.photos/seed/rrcollections-saree-2/700/875',2),
('organza-floral-saree','Organza Floral Print Saree','Anaya','sarees',2499,null,4.4,53,null,'Lightweight organza with delicate floral prints and a satin border. Easy, elegant and perfect for day events.','https://picsum.photos/seed/rrcollections-saree-3/700/875',3),
('cotton-handloom-saree','Cotton Handloom Saree','Mulmul','sarees',1299,1799,4.3,211,'New','Breathable handloom cotton with a woven temple border. Your everyday-ethnic staple.','https://picsum.photos/seed/rrcollections-saree-4/700/875',4),
('bridal-velvet-lehenga','Bridal Velvet Lehenga Set','RRcollections Couture','lehengas',24999,32999,4.8,41,'Bridal','Hand-embroidered velvet lehenga with zardozi work, matching blouse and net dupatta. Made to make the day unforgettable.','https://picsum.photos/seed/rrcollections-lehenga-1/700/875',5),
('sequin-party-lehenga','Sequin Party Lehenga','Anaya','lehengas',7999,10999,4.6,64,null,'All-over sequin lehenga with a flared silhouette. The showstopper for sangeet and receptions.','https://picsum.photos/seed/rrcollections-lehenga-2/700/875',6),
('festive-georgette-lehenga','Festive Georgette Lehenga','Riwaaz','lehengas',5499,null,4.5,88,'Bestseller','Flowy georgette lehenga with thread embroidery, festive-ready without the weight.','https://picsum.photos/seed/rrcollections-lehenga-3/700/875',7),
('anarkali-kurta-set','Anarkali Kurta Set with Dupatta','Mulmul','kurtas',2999,3999,4.6,174,'Bestseller','Floor-length Anarkali with intricate yoke embroidery, churidar and a chiffon dupatta.','https://picsum.photos/seed/rrcollections-kurta-1/700/875',8),
('chikankari-cotton-kurta','Chikankari Cotton Kurta','Anaya','kurtas',1499,null,4.5,309,'New','Authentic Lucknowi chikankari hand-embroidery on soft cotton. Cool, classic, everyday luxe.','https://picsum.photos/seed/rrcollections-kurta-2/700/875',9),
('printed-straight-kurta','Printed Straight Kurta','RRcollections Everyday','kurtas',899,1299,4.2,421,null,'Easy straight-cut kurta in a contemporary print. A wardrobe workhorse at a friendly price.','https://picsum.photos/seed/rrcollections-kurta-3/700/875',10),
('silk-kurta-palazzo','Silk Kurta with Palazzo Set','Riwaaz','kurtas',3499,4499,4.7,96,null,'Art-silk kurta paired with flowing palazzos and a dupatta, graceful for festive occasions.','https://picsum.photos/seed/rrcollections-kurta-4/700/875',11)
on conflict (slug) do update set
  name = excluded.name, brand = excluded.brand, category = excluded.category,
  price = excluded.price, mrp = excluded.mrp, rating = excluded.rating,
  reviews = excluded.reviews, badge = excluded.badge, description = excluded.description,
  image = excluded.image, sort_order = excluded.sort_order;
