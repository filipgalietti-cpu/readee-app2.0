"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { trackFunnelClient } from "@/lib/analytics/funnel";

/**
 * The passage text, with the second-story signup gate.
 *
 * The first story a logged-out visitor opens is free and whole. From the
 * second distinct story on, the page shows the opening and then asks for a
 * free account to finish. Signed-in readers never see the gate.
 *
 * Why client-side: the server renders the FULL text every time, so search
 * engines and the AI crawlers that already cite these pages keep seeing
 * complete passages. The gate only exists after hydration, keyed on a
 * localStorage list of slugs read in this browser.
 *
 * Why "keep reading" rather than "take the assessment" here: the visitor
 * asked for a story, so the gate delivers the story after signup
 * (`next=/community/<slug>`). The assessment ask sits below the passage in
 * LibraryCta. Both are signups; PostHog tells them apart by `placement`.
 */

const STORAGE_KEY = "readee_library_reads";
/** Distinct stories a logged-out visitor can read in full before the gate. */
const FREE_READS = 1;

function readList(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** The opening of the passage: the first paragraph when there are several
 *  and it is not most of the text, otherwise the first ~40% of sentences. */
function opening(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= 2 && paragraphs[0].length < text.length * 0.6) {
    return paragraphs[0];
  }
  const sentences = text.match(/[^.!?]+[.!?]+["'”’]?\s*/g) ?? [text];
  const keep = Math.max(2, Math.ceil(sentences.length * 0.4));
  return sentences.slice(0, keep).join("").trim();
}

export default function GatedPassage({
  slug,
  grade,
  text,
}: {
  slug: string;
  grade: string;
  text: string;
}) {
  const [gated, setGated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let signedIn = false;
      try {
        const { data } = await supabaseBrowser().auth.getSession();
        signedIn = !!data.session;
      } catch {
        /* treat as logged out */
      }
      const prior = readList().filter((s) => s !== slug);
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([...prior, slug].slice(-50)),
        );
      } catch {
        /* private mode: no memory, no gate next time either */
      }
      const shouldGate = !signedIn && prior.length >= FREE_READS;
      if (cancelled) return;
      setGated(shouldGate);
      trackFunnelClient("library.story_view", {
        slug,
        grade,
        gated: shouldGate,
        prior_reads: prior.length,
        signed_in: signedIn,
      });
      if (shouldGate) {
        trackFunnelClient("library.gate_view", { slug, grade, prior_reads: prior.length });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, grade]);

  const back = `/community/${slug}`;
  const signupHref = `/signup?ref=library-gate&next=${encodeURIComponent(back)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(back)}`;

  return (
    <div>
      <div
        className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900"
        style={{
          fontFamily:
            'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
        }}
      >
        {gated ? opening(text) : text}
      </div>

      {gated && (
        <div className="relative mt-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-14 left-0 right-0 h-14 bg-gradient-to-b from-transparent to-white"
          />
          <div className="rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-lg sm:p-8">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
              Keep reading, free
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900">
              Create a free Readee account to finish this one.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-700">
              The whole library is free with an account, read-aloud audio and
              questions included. So is the ten-minute reading assessment.
            </p>
            <Link
              href={signupHref}
              onClick={() =>
                trackFunnelClient("library.cta_click", {
                  placement: "library-gate",
                  slug,
                  grade,
                })
              }
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-violet-700"
            >
              Create a free account
            </Link>
            <p className="mt-3 text-xs text-zinc-500">
              Already have one?{" "}
              <Link href={loginHref} className="font-semibold text-violet-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
