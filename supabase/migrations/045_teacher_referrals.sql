-- Teacher-to-teacher referral loop.
--
-- Each teacher gets a unique referral code the first time they land on
-- the referral page. When another teacher signs up via the share URL
-- (/join/teacher/{code}), both parties get a +200 credit bonus in
-- ai_credit_balance (source='referral'). One-time per invitee.
--
-- Schema notes:
--   - codes are short (8 chars, alphanumeric no O/0/I/1) for memorability
--   - redeemed_at is set when the invitee's signup completes
--   - invitee_profile_id is nullable until redemption
--   - unique constraint on (referrer_id, invitee_profile_id) stops a
--     single teacher from referring the same person twice

create table if not exists public.teacher_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  invitee_profile_id uuid references public.profiles(id) on delete set null,
  invitee_email text,
  redeemed_at timestamptz,
  credits_granted_to_referrer integer,
  credits_granted_to_invitee integer,
  created_at timestamptz not null default now(),
  constraint teacher_referrals_one_invitee_per_referrer unique (referrer_id, invitee_profile_id)
);

create index teacher_referrals_code_idx on public.teacher_referrals (code);
create index teacher_referrals_referrer_idx on public.teacher_referrals (referrer_id);

alter table public.teacher_referrals enable row level security;

create policy "Referrer sees their own referrals"
  on public.teacher_referrals for select to authenticated
  using (referrer_id = auth.uid() or invitee_profile_id = auth.uid());

-- Find-by-code (public): anyone can resolve a code to look up the
-- referrer's display name on the join page. Security definer function
-- so RLS doesn't block anon access to the codes table.
create or replace function public.find_teacher_referral(p_code text)
returns table (
  id uuid,
  referrer_id uuid,
  referrer_email text,
  redeemed boolean
)
language sql
security definer
set search_path = public
as $$
  select
    tr.id,
    tr.referrer_id,
    p.email as referrer_email,
    (tr.redeemed_at is not null) as redeemed
  from public.teacher_referrals tr
  join public.profiles p on p.id = tr.referrer_id
  where tr.code = upper(p_code)
  limit 1;
$$;
