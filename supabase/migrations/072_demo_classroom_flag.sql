-- Demo classroom + demo student markers for the teacher onboarding
-- "land in a populated workspace" experience.
--
-- After identity capture, we seed a demo classroom + 3 demo children
-- + 1 starter assignment so a fresh teacher sees a working dashboard
-- instead of an empty roster. When they add their first real student
-- (Phase D), the demo data gets cleaned up and the flags clear.

alter table public.classrooms
  add column if not exists is_demo boolean not null default false;

alter table public.children
  add column if not exists is_demo boolean not null default false;

create index if not exists classrooms_demo_idx
  on public.classrooms (teacher_id) where is_demo = true;

create index if not exists children_demo_idx
  on public.children (created_by_teacher) where is_demo = true;
