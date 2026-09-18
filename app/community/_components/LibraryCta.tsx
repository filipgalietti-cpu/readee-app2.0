"use client";

import Link from "next/link";
import { Glyph } from "@/app/_components/Glyph";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { assessmentSignupHref } from "../_lib/public-filter";

/**
 * The one ask on every public library page: the free reading assessment.
 *
 * Before Sep 17 2026 the library's CTAs said "Try Readee free" and pointed
 * at a bare /signup, and the story pages (where the reads actually happen)
 * had no CTA at all. Filip: "I want to CONVERT THEM TO SIGN UP". So every
 * CTA now carries a `ref` placement and lands on /placement/setup after
 * signup, and every click is a `library.cta_click` event with the
 * placement, so PostHog can say which surface converts.
 */
export default function LibraryCta({
  placement,
  slug,
  grade,
  compact = false,
}: {
  /** Which surface: library-header, library-home, library-grade, library-story… */
  placement: string;
  slug?: string;
  grade?: string;
  /** Header pill instead of the full card. */
  compact?: boolean;
}) {
  const href = assessmentSignupHref(placement);
  const onClick = () =>
    trackFunnelClient("library.cta_click", {
      placement,
      slug: slug ?? null,
      grade: grade ?? null,
    });

  if (compact) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 sm:text-sm"
      >
        Start Reading Assessment
      </Link>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 text-center shadow-sm sm:p-8">
      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
        Free reading assessment
      </div>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
        How well does your child read?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-700">
        Ten minutes. Your child reads out loud, you get the level, the speed
        and the plan. Free, kindergarten through 4th grade.
      </p>
      <div className="mt-5 flex items-center justify-center">
        <Link
          href={href}
          onClick={onClick}
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-violet-700"
        >
          Start Reading Assessment
          <Glyph name="arrow-right" size={16} />
        </Link>
      </div>
    </section>
  );
}
