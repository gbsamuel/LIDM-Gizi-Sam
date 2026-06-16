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

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, nim, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'Mahasiswa'),
    nullif(new.raw_user_meta_data->>'nim', ''),
    new.email,
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.admin_dashboard_rows(admin_password text)
returns table (
  profile_id uuid,
  full_name text,
  nim text,
  email text,
  pretest_score int,
  pretest_total int,
  pretest_percentage numeric,
  pretest_submitted_at timestamptz,
  posttest_score int,
  posttest_total int,
  posttest_percentage numeric,
  posttest_submitted_at timestamptz,
  improvement numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id as profile_id,
    p.full_name,
    p.nim,
    p.email,
    pre.score as pretest_score,
    pre.total as pretest_total,
    pre.percentage as pretest_percentage,
    pre.submitted_at as pretest_submitted_at,
    post.score as posttest_score,
    post.total as posttest_total,
    post.percentage as posttest_percentage,
    post.submitted_at as posttest_submitted_at,
    case
      when pre.percentage is null or post.percentage is null then null
      else round(post.percentage - pre.percentage, 2)
    end as improvement
  from public.profiles p
  left join public.test_attempts pre
    on pre.user_id = p.id
    and pre.test_type = 'pretest'
  left join public.test_attempts post
    on post.user_id = p.id
    and post.test_type = 'posttest'
  where admin_password = 'nutriverse123'
    and p.role = 'student'
  order by p.full_name asc;
$$;

grant execute on function public.admin_dashboard_rows(text) to anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

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
