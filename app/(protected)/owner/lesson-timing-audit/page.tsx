import Link from "next/link";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { ShieldOff, ArrowLeft } from "lucide-react";
import sampleLessons from "@/app/data/sample-lessons.json";
import AuditClient from "./_components/AuditClient";

export const dynamic = "force-dynamic";

/**
 * Lesson Timing Audit — local dev verification surface.
 *
 * Renders the 5 sample lessons we aligned with Whisper-derived
 * timestamps + grade-conditional pre-roll so Filip can listen-check
 * each slide and thumbs-up/down with notes. Output writes to
 * scripts/lesson-timing-reviews.json (gitignored — dev artifact).
 *
 * Sample standards (one per grade):
 *   K   → RL.K.1   (Key Details)
 *   1st → RL.1.1   (Asking Story Questions)
 *   2nd → RF.2.3b  (Vowel Teams — proof lesson)
 *   3rd → L.3.4b   (Prefix Power)
 *   4th → L.4.4b   (Greek Roots)
 */

const SAMPLE_STANDARDS = [
  "RL.K.1",
  "RL.1.1",
  "RF.2.3b",
  "L.3.4b",
  "L.4.4b",
];

export default async function LessonTimingAuditPage() {
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Owner
        </Link>
        <Link
          href="/owner/lesson-timing-audit/mobile"
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
        >
          Mobile audit →
        </Link>
      </div>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-zinc-900">
        Lesson Timing Audit
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        5 sample lessons aligned with Whisper word-timestamps and
        grade-conditional pre-roll (K −150ms → 4th −40ms). Play each
        slideshow, then thumbs each slide. Notes go to{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px]">
          scripts/lesson-timing-reviews.json
        </code>
        .
      </p>
      <AuditClient lessons={lessons as any[]} />
    </div>
  );
}
