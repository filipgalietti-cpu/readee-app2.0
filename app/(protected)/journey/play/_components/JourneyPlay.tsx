"use client";

/**
 * JOURNEY PLAY — one chrome-free wrapper around the V2 runners for the child's
 * own journey. The runner is the same one /demo uses; this adds the two things
 * a demo never had: a childId, and a completion that is written down.
 *
 * On completion: POST /api/journey/complete → the route records the attempt,
 * awards carrots, and answers with the next step. Lessons and warm-ups then
 * move straight on; questions and exams show their summary with a forward
 * button that already points at the next step.
 */
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import WarmupArcade, { type WarmupSkin } from "@/app/components/warmup/WarmupArcade";
import WordBuilderArcade, { type WordBuilderSkin } from "@/app/components/warmup/WordBuilderArcade";
import type { LessonDef } from "@/lib/lesson-engine/types";
import type { QuizDef, QuizResultItem } from "@/lib/lesson-engine/quiz";
import type { WarmupDef } from "@/lib/warmup-engine/types";
import type { ItemKind } from "@/lib/journey-v2/types";

type NextStep = { kind: ItemKind; id: string; title: string; href: string; free: boolean; unitId: string; unitName: string } | null;
type CompleteResponse = { ok: boolean; passed?: boolean; carrots?: number; unitDone?: boolean; next?: NextStep; upgrade?: boolean };

export type JourneyPlayProps = {
  kind: ItemKind;
  childId: string;
  childName: string;
  outfitId: string | null;
  unitName: string;
  def: LessonDef | QuizDef | WarmupDef;
};

const JOURNEY = (childId: string) => `/journey?child=${encodeURIComponent(childId)}`;

export default function JourneyPlay({ kind, childId, childName, outfitId, unitName, def }: JourneyPlayProps) {
  const router = useRouter();
  const [nextHref, setNextHref] = useState<string | null>(null);
  const [nextLabel, setNextLabel] = useState("Next");
  const [error, setError] = useState<string | null>(null);
  const submitted = useRef(false);

  /** Record the attempt once; resolve to where the child goes next. */
  const submit = useCallback(async (score: number | null): Promise<string> => {
    if (submitted.current) return nextHref ?? JOURNEY(childId);
    submitted.current = true;
    try {
      const res = await fetch("/api/journey/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, kind, id: def.id, score }),
      });
      const j = (await res.json().catch(() => ({ ok: false }))) as CompleteResponse;
      if (res.status === 403 && j.upgrade) return `/upgrade?reason=journey&child=${encodeURIComponent(childId)}`;
      if (!res.ok || !j.ok) {
        submitted.current = false; // let a retry through
        setError("We could not save that. Your progress on this step was not recorded.");
        return JOURNEY(childId);
      }
      const n = j.next;
      if (!n) { setNextLabel("Back to the map"); return JOURNEY(childId); }
      if (kind === "exam" || kind === "final") {
        if (j.passed) setNextLabel(j.unitDone ? "Next unit" : "Continue");
        else setNextLabel("Back to the map");
        // A failed exam sends the child back to the map (the unit stays current), not into the next unit.
        return j.passed ? n.href : JOURNEY(childId);
      }
      setNextLabel(n.kind === "exam" ? "Take the unit exam" : n.unitId === (def as { unitId?: string }).unitId ? "Next" : "Next");
      return n.href;
    } catch {
      submitted.current = false;
      setError("We could not save that. Your progress on this step was not recorded.");
      return JOURNEY(childId);
    }
  }, [childId, kind, def, nextHref]);

  const goOn = useCallback(async (score: number | null) => {
    const href = await submit(score);
    router.push(href);
  }, [submit, router]);

  if (kind === "lesson") {
    return (
      <>
        <LessonRunner lesson={def as LessonDef} onComplete={() => { void goOn(null); }} continueLabel="Continue" />
        {error && <Toast text={error} />}
      </>
    );
  }

  if (kind === "warmup") {
    const w = def as WarmupDef;
    const common = { warmup: w, lessonTitle: w.lessonTitle ?? w.lessonId, childName, outfitId, greetingAudioUrl: null, onComplete: () => { void goOn(null); } };
    if (w.mode === "builder") {
      const skin: WordBuilderSkin = w.skin === "pond" ? "pond" : "workshop";
      return <><WordBuilderArcade {...common} skin={skin} />{error && <Toast text={error} />}</>;
    }
    const scout = w.recipe === "topic-scout" || w.recipe === "story-scout";
    const skin: WarmupSkin = w.skin === "sky" || w.skin === "carrot" ? w.skin : scout ? "sky" : "carrot";
    return <><WarmupArcade {...common} skin={skin} />{error && <Toast text={error} />}</>;
  }

  // quiz / exam / final: the summary's forward button appears once the attempt is saved.
  const onQuizComplete = (results: QuizResultItem[]) => {
    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    void submit(pct).then((href) => setNextHref(href));
  };
  const note = kind === "exam" || kind === "final" ? () => `${unitName} · ${kind === "final" ? "graduation exam" : "unit exam"}` : undefined;
  return (
    <>
      <QuizRunner quiz={def as QuizDef} onComplete={onQuizComplete} nextHref={nextHref ?? undefined} nextLabel={nextLabel} resultNote={note} />
      {error && <Toast text={error} />}
    </>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div role="status" className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit max-w-[92vw] rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-lg">
      {text}
    </div>
  );
}
