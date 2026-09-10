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
import Link from "next/link";
import { reportFailure } from "@/lib/observability/critical";
import { playUrlRequired, stopClip } from "./audio";
import { ASK_CLOSE } from "@/lib/placement/narration";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { CelebrationScreen, HoldToBuild, RevealWizard } from "./reveal";

type Phase = "celebrate" | "hold" | "wizard";

export default function RevealFlow({ childId, childName, outfitId }: { childId: string; childName: string; outfitId: string | null }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("celebrate");
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [holdDone, setHoldDone] = useState(false);
  const pollRef = useRef<number | null>(null);
  useEffect(() => { if (holdDone && result) setPhase("wizard"); }, [holdDone, result]);

  // The parent reached the report. Once per mount, and only with a result actually loaded.
  const reportSeen = useRef(false);
  useEffect(() => {
    if (phase !== "wizard" || !result || reportSeen.current) return;
    reportSeen.current = true;
    trackFunnelClient("funnel.report_view", {
      child_id: childId,
      placement_id: result.id,
      placed_band: result.decision.placedBand,
      relative_delta: result.decision.relative.delta,
    });
  }, [phase, result, childId]);

  const startPlan = useCallback(() => {
    trackFunnelClient("funnel.placement_lesson_clicked", { child_id: childId });
    router.push(`/journey?child=${encodeURIComponent(childId)}&from=placement`);
  }, [childId, router]);

  const [loadError, setLoadError] = useState(false);
  const loadingRef = useRef(false);
  const alive = useRef(true);
  // Only publish a poll that actually changed something. Every 4 s tick used to
  // hand down a fresh object, so `result` changed identity even when the
  // placement had not — re-rendering HoldToBuild and RevealWizard, whose
  // `AnimatePresence mode="wait"` was often mid-exit. Framer then removed a
  // node React had already removed: NotFoundError "Failed to execute
  // 'removeChild'" on /placement/reveal (Sentry JAVASCRIPT-NEXTJS-F).
  const lastPayload = useRef<string | null>(null);
  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const r = await fetch(`/api/placement/result?child=${childId}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.ok || !j.result) throw new Error("placement_result_unavailable");
      if (!alive.current) return;
      setLoadError(false);
      // Historical recordings may describe a trial. Keep every report card,
      // and keep the final invitation aligned with the custom-journey action.
      j.result.narration = j.result.narration.map((line: NarrationLine) => line.id === "ask" && !line.text.endsWith(ASK_CLOSE)
        ? { ...line, text: ASK_CLOSE, audioPath: null } : line);
      const payload = JSON.stringify(j.result);
      if (payload === lastPayload.current) return;
      lastPayload.current = payload;
      setResult(j.result as PlacementResult);
    } catch (error) {
      if (alive.current) setLoadError(true);
      reportFailure("placement.reveal_load", error, { route: "/placement/reveal" });
    } finally { loadingRef.current = false; }
  }, [childId]);

  // Load immediately; poll while the bounded narration job is still running.
  useEffect(() => {
    alive.current = true;
    void load();
    const started = Date.now();
    pollRef.current = window.setInterval(() => {
      if (Date.now() - started > 300000) { if (pollRef.current) window.clearInterval(pollRef.current); return; }
      void load();
    }, 4000);
    return () => { alive.current = false; if (pollRef.current) window.clearInterval(pollRef.current); };
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
    let cancelled = false;
    void (async () => {
      await playUrlRequired(spectrumClip("assessment-complete"), 12000).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 3500));
      if (!cancelled) setPhase("hold");
    })();
    return () => { cancelled = true; stopClip(); };
  }, [phase]);

  const repairRef = useRef<Promise<void> | null>(null);
  const retryNarration = useCallback(async () => {
    if (repairRef.current) return repairRef.current;
    const request = (async () => {
      const response = await fetch("/api/placement/narration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId }) });
      if (!response.ok) throw new Error("Narration unavailable");
      await load();
    })();
    repairRef.current = request;
    try { await request; } finally { repairRef.current = null; }
  }, [childId, load]);
  const attemptedRepair = useRef(false);
  useEffect(() => {
    // Give the initial background generation a head start; recover a failed line on older reports.
    if (result && !attemptedRepair.current && Date.now() - Date.parse(result.createdAt) > 60000 && result.narration.some(line => !line.audioPath)) {
      attemptedRepair.current = true;
      void retryNarration().catch(() => {});
    }
  }, [result, retryNarration]);

  const audioUrlFor = useCallback((line: NarrationLine): string | null => {
    if (line.id === "ask") return spectrumClip("reveal-ask");
    return line.audioPath ? `/api/child-audio?path=${encodeURIComponent(line.audioPath)}` : null;
  }, []);

  // The reveal owns the whole viewport (no site chrome on /placement routes): one screen, never a page scroll.
  let screen: React.ReactNode;
  if (phase === "celebrate") {
    screen = <CelebrationScreen childName={childName} outfitId={outfitId} carrots={30} handoffDelayMs={120000} onHandoff={() => setPhase("hold")} />;
  } else if (phase === "hold" || !result) {
    const g = result ? ["kindergarten", "1st-grade", "2nd-grade", "3rd-grade", "4th-grade"][result.enrolled] : undefined;
    screen = <HoldToBuild childName={childName} enrolledGrade={g} onComplete={() => setHoldDone(true)} />;
  } else {
    screen = (
      <RevealWizard
        result={result}
        audioUrlFor={audioUrlFor}
        onRetryNarration={retryNarration}
        onStartPlan={startPlan}
        outfitId={outfitId}
        onNotNow={() => router.push(`/placement/report?child=${childId}`)}
        onSkipToReport={() => router.push(`/placement/report?child=${childId}`)}
      />
    );
  }
  return <div className="relative h-dvh overflow-hidden bg-zinc-50">{screen}
    {loadError && !result && <div role="alert" className="absolute inset-x-4 bottom-4 mx-auto max-w-md rounded-2xl border border-rose-200 bg-white p-4 text-center shadow-sm">
      <p className="text-sm text-zinc-700">Your answers are saved, but we couldn’t load the report. Please try again.</p>
      <button onClick={() => { void load(); }} className="mt-3 rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Try again</button>
      <Link href="/dashboard" className="ml-4 text-sm text-violet-700 underline">Back to dashboard</Link>
    </div>}
  </div>;
}
