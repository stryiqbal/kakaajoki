create table if not exists public.orders (
  order_id text primary key check (order_id ~ '^KKJ-[a-f0-9]{32}$'),
  service_title text not null,
  product_title text not null,
  quantity integer not null check (quantity between 1 and 1000),
  unit_price bigint not null check (unit_price >= 0),
  subtotal_amount bigint not null check (subtotal_amount = unit_price * quantity),
  fee_amount bigint not null default 0 check (fee_amount >= 0),
  amount bigint not null check (amount = subtotal_amount + fee_amount),
  contact_phone text not null,
  account_data jsonb not null default '{}'::jsonb,
  proof_path text not null unique,
  payment_status text not null default 'pending_review'
    check (payment_status in ('pending_review', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_payment_status_idx
  on public.orders (payment_status, created_at desc);

alter table public.orders enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-proofs',
  'order-proofs',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
