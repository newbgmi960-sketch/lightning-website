-- Lightning security hardening migration
-- Run this once in the Supabase SQL Editor as the project owner.
-- The current bootstrap administrator is sagar@lightning.lat. Change the email
-- in is_lightning_admin() before running if a different administrator is needed.

create table if not exists public.account_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric not null default 0 check (balance >= 0),
  active_plan text not null default 'None',
  plan_expiry timestamptz,
  updated_at timestamptz not null default now()
);

-- One-time migration of existing, user-editable auth metadata into protected rows.
insert into public.account_entitlements (user_id, balance, active_plan, plan_expiry)
select
  id,
  case
    when coalesce(raw_user_meta_data->>'balance', '') ~ '^[0-9]+([.][0-9]+)?$'
      then (raw_user_meta_data->>'balance')::numeric
    else 0
  end,
  coalesce(nullif(raw_user_meta_data->>'active_plan', ''), 'None'),
  case
    when coalesce(raw_user_meta_data->>'plan_expiry', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'
      then (raw_user_meta_data->>'plan_expiry')::timestamptz
    else null
  end
from auth.users
on conflict (user_id) do nothing;

alter table public.account_entitlements enable row level security;

drop policy if exists "Users can read their own entitlement" on public.account_entitlements;
create policy "Users can read their own entitlement"
on public.account_entitlements for select to authenticated
using (auth.uid() = user_id);

revoke all on table public.account_entitlements from anon, authenticated;
grant select on table public.account_entitlements to authenticated;

create or replace function public.get_my_entitlement()
returns table (balance numeric, active_plan text, plan_expiry timestamptz)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.account_entitlements (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  return query
  select e.balance, e.active_plan, e.plan_expiry
  from public.account_entitlements e
  where e.user_id = auth.uid();
end;
$$;

create or replace function public.purchase_membership(requested_plan text)
returns table (balance numeric, active_plan text, plan_expiry timestamptz)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  plan_price numeric;
  plan_days integer;
  current_balance numeric;
  next_expiry timestamptz;
  canonical_plan text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select case lower(trim(requested_plan))
    when 'lightning bronze' then 'Lightning Bronze'
    when 'lightning silver' then 'Lightning Silver'
    when 'lightning gold' then 'Lightning Gold'
    when 'lightning platinum' then 'Lightning Platinum'
    when 'lightning diamond' then 'Lightning Diamond'
    else null end
  into canonical_plan;

  if canonical_plan is null then
    raise exception 'Invalid membership plan';
  end if;

  select case canonical_plan
    when 'Lightning Bronze' then 200
    when 'Lightning Silver' then 450
    when 'Lightning Gold' then 900
    when 'Lightning Platinum' then 1600
    when 'Lightning Diamond' then 3000 end,
  case canonical_plan
    when 'Lightning Bronze' then 1
    when 'Lightning Silver' then 3
    when 'Lightning Gold' then 7
    when 'Lightning Platinum' then 14
    when 'Lightning Diamond' then 30 end
  into plan_price, plan_days;

  insert into public.account_entitlements (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  select balance, plan_expiry into current_balance, next_expiry
  from public.account_entitlements
  where user_id = auth.uid()
  for update;

  if current_balance < plan_price then
    raise exception 'Insufficient balance';
  end if;

  next_expiry := greatest(coalesce(next_expiry, now()), now()) + make_interval(days => plan_days);

  update public.account_entitlements
  set balance = current_balance - plan_price,
      active_plan = canonical_plan,
      plan_expiry = next_expiry,
      updated_at = now()
  where user_id = auth.uid();

  return query
  select e.balance, e.active_plan, e.plan_expiry
  from public.account_entitlements e
  where e.user_id = auth.uid();
end;
$$;

create or replace function public.is_lightning_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce((auth.jwt() ->> 'email') = 'sagar@lightning.lat', false);
$$;

create or replace function public.get_all_users_admin()
returns table (id uuid, email varchar, created_at timestamptz, balance numeric, active_plan text)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.is_lightning_admin() then
    raise exception 'Not authorized';
  end if;

  return query
  select au.id, au.email::varchar, au.created_at,
    coalesce(e.balance, 0), coalesce(e.active_plan, 'None')
  from auth.users au
  left join public.account_entitlements e on e.user_id = au.id
  order by au.created_at desc;
end;
$$;

create or replace function public.update_user_admin(target_user_id uuid, new_plan text, new_balance numeric)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.is_lightning_admin() then
    raise exception 'Not authorized';
  end if;
  if new_balance is null or new_balance < 0 then
    raise exception 'Balance must be zero or greater';
  end if;
  if new_plan not in ('None', 'Lightning Bronze', 'Lightning Silver', 'Lightning Gold', 'Lightning Platinum', 'Lightning Diamond', 'Lightning Owner') then
    raise exception 'Invalid membership plan';
  end if;

  insert into public.account_entitlements (user_id, balance, active_plan, updated_at)
  values (target_user_id, new_balance, new_plan, now())
  on conflict (user_id) do update
    set balance = excluded.balance,
        active_plan = excluded.active_plan,
        updated_at = now();
end;
$$;

create or replace function public.delete_user_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.is_lightning_admin() then
    raise exception 'Not authorized';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'The current administrator cannot delete their own account';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$;

create or replace function public.get_total_users_count()
returns integer
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.is_lightning_admin() then
    raise exception 'Not authorized';
  end if;
  return (select count(*)::integer from auth.users);
end;
$$;

revoke all on function public.get_my_entitlement() from public, anon;
revoke all on function public.purchase_membership(text) from public, anon;
revoke all on function public.is_lightning_admin() from public, anon;
revoke all on function public.get_all_users_admin() from public, anon;
revoke all on function public.update_user_admin(uuid, text, numeric) from public, anon;
revoke all on function public.delete_user_admin(uuid) from public, anon;
revoke all on function public.get_total_users_count() from public, anon;
grant execute on function public.get_my_entitlement() to authenticated;
grant execute on function public.purchase_membership(text) to authenticated;
grant execute on function public.is_lightning_admin() to authenticated;
grant execute on function public.get_all_users_admin() to authenticated;
grant execute on function public.update_user_admin(uuid, text, numeric) to authenticated;
grant execute on function public.delete_user_admin(uuid) to authenticated;
grant execute on function public.get_total_users_count() to authenticated;
