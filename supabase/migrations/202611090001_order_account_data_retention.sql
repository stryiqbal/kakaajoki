create extension if not exists pg_cron with schema pg_catalog;

create index if not exists orders_account_data_retention_created_idx
  on public.orders (created_at)
  where account_data <> '{}'::jsonb;

create index if not exists orders_account_data_retention_completed_idx
  on public.orders (updated_at)
  where account_status = 'completed'
    and account_data <> '{}'::jsonb;

create or replace function public.purge_expired_order_account_data()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  purged_rows bigint;
begin
  update public.orders
  set account_data = '{}'::jsonb
  where account_data <> '{}'::jsonb
    and (
      (account_status = 'completed' and updated_at <= now() - interval '7 days')
      or created_at <= now() - interval '30 days'
    );

  get diagnostics purged_rows = row_count;
  return purged_rows;
end;
$$;

revoke all on function public.purge_expired_order_account_data() from public, anon, authenticated, service_role;

do $$
declare
  existing_job_id bigint;
begin
  for existing_job_id in
    select jobid
    from cron.job
    where jobname = 'purge-expired-order-account-data'
  loop
    perform cron.unschedule(existing_job_id);
  end loop;

  perform cron.schedule(
    'purge-expired-order-account-data',
    '0 3 * * *',
    'select public.purge_expired_order_account_data();'
  );
end;
$$;
