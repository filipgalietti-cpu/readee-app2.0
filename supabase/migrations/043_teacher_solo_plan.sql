-- Teacher Solo plan — individual-teacher SKU.
--
-- Bottom-up wedge for teachers whose district hasn't (yet) bought
-- Readee Classroom. Covers homeschool co-op teachers, tutors,
-- private-school solo teachers, substitutes, and any other teacher who
-- wants to use Readee with their class without going through
-- procurement.
--
-- Plan string: "teacher_solo". Price handled via Stripe Billing — two
-- price IDs wired via env vars (STRIPE_PRICE_TEACHER_SOLO_MONTHLY /
-- STRIPE_PRICE_TEACHER_SOLO_ANNUAL). Webhook maps Stripe price → plan
-- string at subscription.created/updated.
--
-- This migration just documents the valid plan values via a CHECK
-- constraint. The column itself (profiles.plan text default 'free')
-- already exists from migration 011.

alter table public.profiles
  drop constraint if exists profiles_plan_valid;

alter table public.profiles
  add constraint profiles_plan_valid
  check (plan in ('free', 'premium', 'teacher_solo'));
