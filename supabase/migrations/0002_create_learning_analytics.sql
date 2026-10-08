-- BitFlow: analiticas de aprendizaje (retos y proyectos)
-- Pegar este SQL completo en Supabase Dashboard > SQL Editor > Run
-- (ejecutar despues de 0001_create_profiles.sql)

create table if not exists public.learning_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id text not null,
  course_id text not null,
  module_id text not null,
  attempts integer not null default 0,
  time_spent integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  hints_used integer not null default 0,
  error_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_analytics_user_idx
  on public.learning_analytics (user_id, created_at);

create index if not exists learning_analytics_challenge_idx
  on public.learning_analytics (user_id, challenge_id);

alter table public.learning_analytics enable row level security;

drop policy if exists "analytics_select_own" on public.learning_analytics;
create policy "analytics_select_own"
  on public.learning_analytics
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "analytics_insert_own" on public.learning_analytics;
create policy "analytics_insert_own"
  on public.learning_analytics
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "analytics_update_own" on public.learning_analytics;
create policy "analytics_update_own"
  on public.learning_analytics
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "analytics_delete_own" on public.learning_analytics;
create policy "analytics_delete_own"
  on public.learning_analytics
  for delete
  to authenticated
  using (auth.uid() = user_id);
