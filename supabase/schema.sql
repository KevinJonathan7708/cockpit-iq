-- CockpitIQ account and test-history schema.
-- Apply in the Supabase SQL Editor before adding the browser publishable key.

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  procedure text not null check (procedure in ('takeoff', 'landing')),
  outcome text not null check (outcome in ('completed', 'failed')),
  correct_steps smallint not null check (correct_steps >= 0),
  total_steps smallint not null check (total_steps > 0 and correct_steps <= total_steps),
  score_percent smallint generated always as (
    round((correct_steps::numeric * 100) / total_steps)::smallint
  ) stored,
  mistakes smallint not null check (mistakes between 0 and 3),
  duration_seconds integer not null check (duration_seconds between 0 and 86400),
  completed_at timestamptz not null default now()
);

create index if not exists test_attempts_user_completed_at_idx
  on public.test_attempts (user_id, completed_at desc, id desc);

alter table public.test_attempts enable row level security;

drop policy if exists "Users read their own test attempts" on public.test_attempts;
create policy "Users read their own test attempts"
  on public.test_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users add their own test attempts" on public.test_attempts;
create policy "Users add their own test attempts"
  on public.test_attempts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own test attempts" on public.test_attempts;
create policy "Users delete their own test attempts"
  on public.test_attempts for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.test_attempts from anon, authenticated;
grant select, insert, delete on public.test_attempts to authenticated;
