"use client";

import { useState, useTransition } from "react";
import { Glyph } from "@/app/_components/Glyph";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { recordKidFeedbackAction } from "@/app/actions/kid-feedback";
import type { KidAssetKind, KidVerdict } from "@/lib/feedback/kid-thumbs";

/**
 * Universal kid-facing thumbs widget. Drop into the end of any
 * kid-facing surface (lesson, story, daily Q, practice, Ask Readee
 * passage). Persists one row per (childId, assetKind, assetId) and
 * silently triggers auto-quarantine if enough kids downvote.
 *
 * UI: two muted chips that turn solid on click. After voting, the
 * chip shows a small check + a tiny "thanks!" caption. Re-voting
 * (clicking the other chip) overwrites.
 */
export default function KidThumbs({
  childId,
  assetKind,
  assetId,
  align = "center",
  size = "md",
  prompt = "Did you like this?",
}: {
  childId: string;
  assetKind: KidAssetKind;
  assetId: string;
  align?: "center" | "start";
  size?: "sm" | "md";
  prompt?: string;
}) {
  const [verdict, setVerdict] = useState<KidVerdict | null>(null);
  const [pending, start] = useTransition();
  const [errored, setErrored] = useState(false);

  function vote(v: KidVerdict) {
    setVerdict(v);
    setErrored(false);
    start(async () => {
      const res = await recordKidFeedbackAction({
        childId,
        assetKind,
        assetId,
        verdict: v,
      });
      if (!res.ok) {
        setVerdict(null);
        setErrored(true);
      }
    });
  }

  const dim = size === "sm" ? 16 : 20;
  const pad = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  const justify = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`flex flex-col items-${align} gap-1.5`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        {prompt}
      </p>
      <div className={`flex items-center gap-2 ${justify}`}>
        <button
          type="button"
          disabled={pending}
          onClick={() => vote("up")}
          aria-label="Thumbs up"
          className={`inline-flex items-center gap-1.5 rounded-full font-bold ring-1 transition disabled:opacity-60 ${pad} ${
            verdict === "up"
              ? "bg-emerald-500 text-white ring-emerald-500"
              : "bg-white text-emerald-700 ring-emerald-200 hover:bg-emerald-50"
          }`}
        >
          <Glyph name="thumbs-up" size={dim} />
          {verdict === "up" ? <Glyph name="check" size={14} /> : "Loved it"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => vote("down")}
          aria-label="Thumbs down"
          className={`inline-flex items-center gap-1.5 rounded-full font-bold ring-1 transition disabled:opacity-60 ${pad} ${
            verdict === "down"
              ? "bg-rose-500 text-white ring-rose-500"
              : "bg-white text-rose-700 ring-rose-200 hover:bg-rose-50"
          }`}
        >
          <Glyph name="thumbs-down" size={dim} />
          {verdict === "down" ? <Glyph name="check" size={14} /> : "Not for me"}
        </button>
      </div>
      {verdict && !errored && !pending && (
        <p className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
          Got it, thanks! <FluentIcon name="seedling" size={12} />
        </p>
      )}
      {errored && (
        <p className="text-[11px] text-rose-600">
          Couldn&apos;t save your vote. Try once more.
        </p>
      )}
    </div>
  );
}
