-- BitFlow: esquema completo de Supabase
-- Pegar este SQL completo en Supabase Dashboard > SQL Editor > Run
-- Incluye: profiles + learning_analytics + RLS + trigger de registro

-- ============================================================
-- 1. Perfiles (progreso del estudiante)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Aprendiz',
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_active_date date not null default current_date,
  unlocked_skins text[] not null default array['default']::text[],
  current_course_id text not null default 'html-course',
  completed_challenges text[] not null default array[]::text[],
  updated_at timestamptz not null default now()
);

create index if not exists profiles_xp_idx on public.profiles (xp desc);
create index if not exists profiles_level_idx on public.profiles (level desc);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- Crea el perfil automaticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'Aprendiz')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. Analiticas de aprendizaje (retos y proyectos)
-- ============================================================

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
