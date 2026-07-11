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

create table if not exists public.test_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  category text not null,
  selected_answer int not null,
  correct_answer int not null,
  is_correct boolean not null,
  submitted_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table if not exists public.case_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null,
  case_name text not null,
  score int not null default 0,
  success boolean not null default false,
  feedback text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  status text not null default 'viewed' check (status in ('viewed', 'in_progress', 'completed')),
  progress_percentage numeric not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create table if not exists public.feature_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  event_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_attempt_answers enable row level security;
alter table public.case_attempts enable row level security;
alter table public.learning_progress enable row level security;
alter table public.feature_events enable row level security;

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
  improvement numeric,
  cases_completed bigint,
  modules_completed bigint,
  feature_events_count bigint
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
    end as improvement,
    coalesce(cases.cases_completed, 0) as cases_completed,
    coalesce(modules.modules_completed, 0) as modules_completed,
    coalesce(events.feature_events_count, 0) as feature_events_count
  from public.profiles p
  left join public.test_attempts pre
    on pre.user_id = p.id
    and pre.test_type = 'pretest'
  left join public.test_attempts post
    on post.user_id = p.id
    and post.test_type = 'posttest'
  left join (
    select user_id, count(*) as cases_completed
    from public.case_attempts
    where success = true
    group by user_id
  ) cases on cases.user_id = p.id
  left join (
    select user_id, count(*) as modules_completed
    from public.learning_progress
    where status = 'completed' or progress_percentage >= 100
    group by user_id
  ) modules on modules.user_id = p.id
  left join (
    select user_id, count(*) as feature_events_count
    from public.feature_events
    group by user_id
  ) events on events.user_id = p.id
  where admin_password = 'nutrisphere123'
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

drop policy if exists "students can read own attempt answers" on public.test_attempt_answers;
create policy "students can read own attempt answers"
on public.test_attempt_answers for select
using (auth.uid() = user_id);

drop policy if exists "students can insert own attempt answers" on public.test_attempt_answers;
create policy "students can insert own attempt answers"
on public.test_attempt_answers for insert
with check (auth.uid() = user_id);

drop policy if exists "teachers can read all attempt answers" on public.test_attempt_answers;
create policy "teachers can read all attempt answers"
on public.test_attempt_answers for select
using (public.current_user_role() = 'teacher');

drop policy if exists "students can read own case attempts" on public.case_attempts;
create policy "students can read own case attempts"
on public.case_attempts for select
using (auth.uid() = user_id);

drop policy if exists "students can insert own case attempts" on public.case_attempts;
create policy "students can insert own case attempts"
on public.case_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "teachers can read all case attempts" on public.case_attempts;
create policy "teachers can read all case attempts"
on public.case_attempts for select
using (public.current_user_role() = 'teacher');

drop policy if exists "students can read own learning progress" on public.learning_progress;
create policy "students can read own learning progress"
on public.learning_progress for select
using (auth.uid() = user_id);

drop policy if exists "students can upsert own learning progress" on public.learning_progress;
create policy "students can upsert own learning progress"
on public.learning_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "students can update own learning progress" on public.learning_progress;
create policy "students can update own learning progress"
on public.learning_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "teachers can read all learning progress" on public.learning_progress;
create policy "teachers can read all learning progress"
on public.learning_progress for select
using (public.current_user_role() = 'teacher');

drop policy if exists "students can insert own feature events" on public.feature_events;
create policy "students can insert own feature events"
on public.feature_events for insert
with check (auth.uid() = user_id or user_id is null);

drop policy if exists "students can read own feature events" on public.feature_events;
create policy "students can read own feature events"
on public.feature_events for select
using (auth.uid() = user_id);

drop policy if exists "teachers can read all feature events" on public.feature_events;
create policy "teachers can read all feature events"
on public.feature_events for select
using (public.current_user_role() = 'teacher');

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists test_attempts_user_type_idx on public.test_attempts (user_id, test_type);
create index if not exists test_attempt_answers_attempt_idx on public.test_attempt_answers (attempt_id);
create index if not exists case_attempts_user_success_idx on public.case_attempts (user_id, success);
create index if not exists learning_progress_user_module_idx on public.learning_progress (user_id, module_id);
create index if not exists feature_events_user_feature_idx on public.feature_events (user_id, feature);
