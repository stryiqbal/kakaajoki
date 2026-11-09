alter table public.orders
  add column if not exists account_status text;

update public.orders
set account_status = 'pending'
where payment_status = 'paid'
  and account_status is null;

update public.orders
set account_status = null
where payment_status <> 'paid';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_account_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_account_status_check
      check (account_status is null or account_status in ('pending', 'processing', 'completed'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_account_status_requires_paid_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_account_status_requires_paid_check
      check (payment_status = 'paid' or account_status is null);
  end if;
end $$;

create index if not exists orders_account_status_idx
  on public.orders (account_status, created_at desc);
