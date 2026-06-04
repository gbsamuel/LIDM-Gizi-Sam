create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nim text,
  email text,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_type text not null check (test_type in ('pretest', 'posttest')),
  score int not null,
  total int not null,
  percentage numeric not null,
  submitted_at timestamptz not null default now(),
  unique (user_id, test_type)
);

alter table public.profiles enable row level security;
alter table public.test_attempts enable row level security;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

drop policy if exists "students can read own profile" on public.profiles;
create policy "students can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "students can insert own profile" on public.profiles;
create policy "students can insert own profile"
on public.profiles for insert
with check (auth.uid() = id and role = 'student');

drop policy if exists "students can update own basic profile" on public.profiles;
create policy "students can update own basic profile"
on public.profiles for update
using (auth.uid() = id and role = 'student')
with check (auth.uid() = id and role = 'student');

drop policy if exists "teachers can read all profiles" on public.profiles;
create policy "teachers can read all profiles"
on public.profiles for select
using (public.current_user_role() = 'teacher');

drop policy if exists "students can read own attempts" on public.test_attempts;
create policy "students can read own attempts"
on public.test_attempts for select
using (auth.uid() = user_id);

drop policy if exists "students can insert own attempts" on public.test_attempts;
create policy "students can insert own attempts"
on public.test_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "teachers can read all attempts" on public.test_attempts;
create policy "teachers can read all attempts"
on public.test_attempts for select
using (public.current_user_role() = 'teacher');

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists test_attempts_user_type_idx on public.test_attempts (user_id, test_type);
