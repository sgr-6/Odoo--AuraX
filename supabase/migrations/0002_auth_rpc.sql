-- RPC to get email by login_id for authentication
create or replace function public.get_email_by_login_id(p_login_id text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.users where login_id = p_login_id;
$$;
