-- Promo codes were listable by every signed-in account: SELECT to authenticated
-- USING (true), returning the code string, expiry and remaining capacity. These
-- codes hand out free Readee+ to the first few families, so anyone with an
-- account could read the list, find one with room left, and redeem it.
--
-- Dropping the policy outright would break the billing page, which shows a
-- parent which code they used via promo_redemptions -> promo_codes(code). So
-- scope it instead: you may read a code you have actually redeemed, and nothing
-- else. Discovery closes, the receipt keeps working.
--
-- Redemption itself is unaffected: /api/promo/redeem looks codes up with the
-- service role, which bypasses RLS.
drop policy if exists "Authenticated users can read promo_codes" on public.promo_codes;

create policy "Users read only promo codes they redeemed"
  on public.promo_codes for select to authenticated
  using (
    exists (
      select 1 from public.promo_redemptions r
      where r.promo_code_id = promo_codes.id
        and r.user_id = (select auth.uid())
    )
  );
