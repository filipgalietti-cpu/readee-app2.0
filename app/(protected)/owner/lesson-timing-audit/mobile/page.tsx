import Link from "next/link";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { ShieldOff, ArrowLeft } from "lucide-react";
import sampleLessons from "@/app/data/sample-lessons.json";
import MobileAuditClient from "./_components/MobileAuditClient";

export const dynamic = "force-dynamic";

/**
 * Mobile Lesson Timing Audit — dedicated page for reviewing the 5
 * canon lessons in the 393×852 phone shell. Slide-by-slide comment
 * cards laid out next to a live iPhone preview so the reviewer can
 * thumb + note each slide independently without waiting for playback
 * to land there.
 */
const SAMPLE_STANDARDS = [
  "RL.K.1",
  "RL.1.1",
  "RF.2.3b",
  "L.3.4b",
  "L.4.4b",
];

export default async function MobileLessonTimingAuditPage() {
  const profile = await requireProfile();
  if (!isPlatformAdmin(profile as any)) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center space-y-4">
        <ShieldOff className="mx-auto h-10 w-10 text-zinc-300" />
        <h1 className="text-2xl font-extrabold text-zinc-900">Owner only</h1>
        <p className="text-sm text-zinc-500">
          This audit surface is restricted to platform admins.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const lessons = SAMPLE_STANDARDS.map((id) =>
    (sampleLessons as any[]).find((l) => l.standardId === id),
  ).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/owner/lesson-timing-audit"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Desktop audit
        </Link>
      </div>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-zinc-900">
        Mobile Lesson Timing Audit
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        5 canon lessons rendered in the 393×852 phone shell — what 75%
        of real kids see. Play each lesson, then thumb + note each slide
        independently. Reviews are saved to{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px]">
          scripts/lesson-timing-reviews.json
        </code>{" "}
        (shared with the desktop audit).
      </p>
      <MobileAuditClient lessons={lessons as any[]} />
    </div>
  );
}
