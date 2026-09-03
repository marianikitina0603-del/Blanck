-- Выполните этот файл один раз в Supabase → SQL Editor.
-- Ученик может только отправлять работу. Просматривать работы может только авторизованный учитель.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_surname text not null default '',
  student_name text not null default '',
  student_patronymic text not null default '',
  student_class text not null default '',
  region_code text not null default '',
  school_code text not null default '',
  room_number text not null default '',
  exam_date text not null default '',
  answers jsonb not null default '{}'::jsonb,
  replacements jsonb not null default '[]'::jsonb,
  form_state jsonb not null default '{}'::jsonb
);

alter table public.submissions enable row level security;

drop policy if exists "anonymous can submit" on public.submissions;
create policy "anonymous can submit"
on public.submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated teacher can read" on public.submissions;
create policy "authenticated teacher can read"
on public.submissions
for select
to authenticated
using (true);

drop policy if exists "authenticated teacher can delete" on public.submissions;
create policy "authenticated teacher can delete"
on public.submissions
for delete
to authenticated
using (true);

create index if not exists submissions_created_at_idx on public.submissions(created_at desc);
create index if not exists submissions_student_idx on public.submissions(student_surname, student_name);
