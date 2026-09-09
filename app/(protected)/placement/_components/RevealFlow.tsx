"use client";

import Link from "next/link";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { Bunny } from "@/app/_components/Bunny/Bunny";

/** The child finishes with an activity. The full assessment report is available to their parent. */
export default function RevealFlow({ childId, childName, outfitId }: { childId: string; childName: string; outfitId: string | null }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-violet-50 px-6 py-10 text-center">
      <div className="h-44 w-40"><Bunny outfitId={outfitId} /></div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-violet-600">Reading check complete</p>
      <h1 className="mt-3 max-w-lg text-3xl font-bold text-zinc-900">Ready for your first lesson, {childName}?</h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600">We saved your answers and picked a place to start. Let’s read together.</p>
      <Link href={`/placement/start?child=${encodeURIComponent(childId)}`}
        onClick={() => trackFunnelClient("funnel.placement_lesson_clicked", { child_id: childId })}
        className="mt-8 rounded-2xl bg-violet-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">
        Start my first lesson
      </Link>
      <p className="mt-3 text-sm text-zinc-600">Your first reading unit is free. No card needed.</p>
      <Link href={`/placement/report?child=${encodeURIComponent(childId)}`} className="mt-8 text-sm font-semibold text-violet-700 underline underline-offset-4">For parents: see the reading report</Link>
    </main>
  );
}
