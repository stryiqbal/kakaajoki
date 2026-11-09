create table if not exists public.chat_rate_limits (
  client_hash text primary key check (client_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1)
);

alter table public.chat_rate_limits enable row level security;

create or replace function public.consume_chat_rate_limit(
  p_client_hash text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_client_hash !~ '^[a-f0-9]{64}$' or p_window_seconds < 1 or p_limit < 1 then
    return false;
  end if;

  insert into public.chat_rate_limits as limits (client_hash, window_started_at, request_count)
  values (p_client_hash, now(), 1)
  on conflict (client_hash) do update
    set window_started_at = case
          when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
          else limits.window_started_at
        end,
        request_count = case
          when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
          else limits.request_count + 1
        end
  returning request_count into current_count;

  delete from public.chat_rate_limits
  where window_started_at < now() - interval '1 day';

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_chat_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_chat_rate_limit(text, integer, integer) to service_role;
