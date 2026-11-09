alter table public.orders
  add column if not exists paid_at timestamptz;

update public.orders
set paid_at = updated_at
where payment_status = 'paid'
  and paid_at is null;

create index if not exists orders_paid_at_idx
  on public.orders (paid_at desc)
  where paid_at is not null;

create or replace function public.get_monthly_paid_revenue_daily(
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  paid_day date,
  total_amount numeric,
  order_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (orders.paid_at at time zone 'Asia/Jakarta')::date as paid_day,
    sum(orders.amount)::numeric as total_amount,
    count(*)::bigint as order_count
  from public.orders as orders
  where orders.payment_status = 'paid'
    and orders.paid_at >= p_start
    and orders.paid_at < p_end
  group by 1
  order by 1;
$$;

revoke all on function public.get_monthly_paid_revenue_daily(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_monthly_paid_revenue_daily(timestamptz, timestamptz)
  to service_role;
