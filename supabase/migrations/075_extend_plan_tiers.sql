-- Extend profiles.plan CHECK to cover the full teacher tier hierarchy
-- defined in lib/plan/teacher-gate.ts. The original CHECK only allowed
-- free/premium/teacher_solo, which made the higher tiers (classroom,
-- school, district) literally unsettable in prod, so every gate calling
-- requireTeacherTier({ min: "school" }) or above was unreachable.

alter table profiles
  drop constraint if exists profiles_plan_valid;

alter table profiles
  add constraint profiles_plan_valid
  check (plan = any (array[
    'free'::text,
    'premium'::text,
    'teacher_solo'::text,
    'classroom'::text,
    'school'::text,
    'district'::text
  ]));
