import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Sparkles, GraduationCap, Check } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { REFERRAL_BONUS_CREDITS } from "@/lib/referrals/teacher-referrals";

export const dynamic = "force-dynamic";

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = code.toUpperCase();

  const admin = supabaseAdmin();
  const { data: rows } = await admin.rpc("find_teacher_referral", {
    p_code: normalized,
  });
  const ref = Array.isArray(rows) ? rows[0] : rows;
  if (!ref) notFound();
  const referrerEmail = (ref as any).referrer_email as string | null;
  const redeemed = (ref as any).redeemed as boolean;

  const referrerName = referrerEmail ? referrerEmail.split("@")[0] : "A teacher";

  // Drop a 30-day cookie so signup can redeem the code — we can't write
  // to the DB until the new account exists. Signup's post-create hook
  // reads this cookie and invokes redeemReferralOnSignup().
  const cookieStore = await cookies();
  cookieStore.set({
    name: "readee_referral_code",
    value: normalized,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  if (redeemed) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-slate-400">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white">
          This referral link was already used
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          No worries — you can still sign up for Readee and start your own
          classroom.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <GraduationCap className="h-4 w-4" />
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-8 text-center shadow-sm dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
          {referrerName} thinks you&apos;ll love Readee
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-slate-400">
          Sign up via this link and you&apos;ll both get{" "}
          <strong>+{REFERRAL_BONUS_CREDITS} Readee.ai credits</strong> — usable
          for AI-generated passages, comprehension questions, images, and
          read-aloud audio.
        </p>

        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          <Bullet>K-4 reading curriculum built by a reading specialist</Bullet>
          <Bullet>Classroom tools + AI quiz wizard out of the box</Bullet>
          <Bullet>Common Core ELA aligned · Science of Reading</Bullet>
          <Bullet>Free to start — no credit card required</Bullet>
        </ul>

        <Link
          href="/signup"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
        >
          <GraduationCap className="h-4 w-4" />
          Claim my {REFERRAL_BONUS_CREDITS} credits
        </Link>

        <div className="mt-4 text-[11px] text-zinc-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold underline hover:text-zinc-800 dark:hover:text-slate-200">
            Log in
          </Link>{" "}
          — we&apos;ll apply the credits the moment you create your classroom.
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
      <span className="text-zinc-700 dark:text-slate-300">{children}</span>
    </li>
  );
}
