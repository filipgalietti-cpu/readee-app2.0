"use client";

/**
 * RevealFlow — R0 celebration → R1 hold-to-build → the wizard. Fetches the
 * child's latest placement while the child celebrates, keeps polling while
 * the narration clips are still being synthesized, and resolves each line's
 * audio to a playable URL through /api/child-audio.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NarrationLine, PlacementResult } from "@/lib/placement/types";
import { usePlanStore } from "@/lib/stores/plan-store";
import { CelebrationScreen, HoldToBuild, RevealWizard } from "./reveal";

type Phase = "celebrate" | "hold" | "wizard";

export default function RevealFlow({ childId, childName, outfitId }: { childId: string; childName: string; outfitId: string | null }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("celebrate");
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [holdDone, setHoldDone] = useState(false);
  const pollRef = useRef<number | null>(null);
  useEffect(() => { if (holdDone && result) setPhase("wizard"); }, [holdDone, result]);

  // "Start <Name>'s Reading Journey": straight into Stripe Checkout (14-day
  // card trial, monthly). The wizard has already explained the trial, so no
  // /upgrade detour. Already on Readee+ -> the dashboard, where the next
  // lesson now starts at the placed band. Any failure falls back to /upgrade.
  const rawPlan = usePlanStore((s) => s.rawPlan);
  const startingRef = useRef(false);
  const startPlan = useCallback(async () => {
    if (rawPlan === "premium") { router.push("/dashboard"); return; }
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing: "monthly", sku: "premium", cancelTo: `/placement/report?child=${childId}` }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) { window.location.href = data.url; return; }
    } catch { /* fall through */ }
    startingRef.current = false;
    router.push("/upgrade?reason=placement");
  }, [childId, rawPlan, router]);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/placement/result?child=${childId}`, { cache: "no-store" });
      const j = await r.json();
      if (r.ok && j.ok && j.result) setResult(j.result as PlacementResult);
    } catch { /* keep polling */ }
  }, [childId]);

  // Load immediately; keep polling every 4 s until every narration line has audio (or 2 minutes pass).
  useEffect(() => {
    void load();
    const started = Date.now();
    pollRef.current = window.setInterval(() => {
      if (Date.now() - started > 120000) { if (pollRef.current) window.clearInterval(pollRef.current); return; }
      void load();
    }, 4000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [load]);
  useEffect(() => {
    if (result && result.narration.length > 0 && result.narration.every((l) => l.audioPath) && pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [result]);

  // The celebration hands off on its own after the clip; the parent then holds.
  useEffect(() => {
    if (phase !== "celebrate") return;
    const t = window.setTimeout(() => setPhase("hold"), 9000);
    return () => window.clearTimeout(t);
  }, [phase]);

  const audioUrlFor = useCallback((line: NarrationLine): string | null => {
    return line.audioPath ? `/api/child-audio?path=${encodeURIComponent(line.audioPath)}` : null;
  }, []);

  if (phase === "celebrate") {
    return <CelebrationScreen childName={childName} outfitId={outfitId} carrots={30} onHandoff={() => setPhase("hold")} />;
  }
  if (phase === "hold" || !result) {
    const g = result ? ["kindergarten", "1st-grade", "2nd-grade", "3rd-grade", "4th-grade"][result.enrolled] : undefined;
    return <HoldToBuild childName={childName} enrolledGrade={g} onComplete={() => setHoldDone(true)} />;
  }
  return (
    <RevealWizard
      result={result}
      audioUrlFor={audioUrlFor}
      onStartPlan={() => { void startPlan(); }}
      onNotNow={() => router.push(`/placement/report?child=${childId}`)}
      onSkipToReport={() => router.push(`/placement/report?child=${childId}`)}
    />
  );
}
