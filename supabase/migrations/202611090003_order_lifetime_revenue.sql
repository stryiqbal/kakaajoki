create or replace function public.get_lifetime_paid_revenue()
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(orders.amount), 0)::numeric
  from public.orders as orders
  where orders.payment_status = 'paid';
$$;

revoke all on function public.get_lifetime_paid_revenue() from public, anon, authenticated;
grant execute on function public.get_lifetime_paid_revenue() to service_role;
