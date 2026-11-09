create sequence if not exists public.order_number_seq
  as bigint
  start with 1
  increment by 1
  minvalue 1
  no cycle;

create or replace function public.next_order_number()
returns bigint
language sql
security definer
set search_path = ''
as $$
  select nextval('public.order_number_seq'::regclass);
$$;

revoke all on function public.next_order_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to service_role;

alter table public.orders
  drop constraint if exists orders_order_id_check;

alter table public.orders
  add constraint orders_order_id_check
  check (
    order_id ~ '^KKJ-[a-f0-9]{32}$'
    or order_id ~ '^KJ/[0-9]{8}/[0-9]{4,}$'
  );