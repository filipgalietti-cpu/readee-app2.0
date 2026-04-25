import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import {
  getOrCreateReferralCode,
  getReferralStats,
  REFERRAL_BONUS_CREDITS,
} from "@/lib/referrals/teacher-referrals";
import ReferralShareCard from "./_components/ReferralShareCard";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const [code, stats] = await Promise.all([
    getOrCreateReferralCode(profile.id),
    getReferralStats(profile.id),
  ]);

  const shareUrl = `https://learn.readee.app/join/teacher/${code}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/classroom"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Classroom
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Users className="h-4 w-4" />
          Refer a teacher
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Invite a teacher, both get {REFERRAL_BONUS_CREDITS} Readee.ai credits
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-slate-400">
          Share your link with a teacher who&apos;d love Readee. When they sign up
          and create their first classroom, both of you get{" "}
          <strong>+{REFERRAL_BONUS_CREDITS} Readee.ai credits</strong> added to your
          monthly pool.
        </p>
      </div>

      <div className="mt-8">
        <ReferralShareCard shareUrl={shareUrl} code={code} />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="Shared" value={stats.totalSent} />
        <Stat label="Redeemed" value={stats.totalRedeemed} />
        <Stat label="Credits earned" value={stats.totalCreditsEarned} />
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          How it works
        </div>
        <ol className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-slate-300">
          <li>
            <strong>1.</strong> Share your link with a teacher.
          </li>
          <li>
            <strong>2.</strong> They sign up for Readee through the link and
            create their first classroom (or start a Teacher Solo trial).
          </li>
          <li>
            <strong>3.</strong> Both of you get +{REFERRAL_BONUS_CREDITS}{" "}
            Readee.ai credits applied to your monthly pool — usable for AI
            passages, audio, and image generation.
          </li>
          <li className="text-xs text-zinc-500 dark:text-slate-400">
            Referrals are one-time per teacher. Credits never expire.
          </li>
        </ol>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <div className="font-mono text-2xl font-extrabold text-zinc-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
