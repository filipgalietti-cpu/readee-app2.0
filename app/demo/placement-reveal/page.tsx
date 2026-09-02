"use client";

import { useCallback, useEffect, useState } from "react";
import { fixtureMaya } from "@/lib/placement/fixtures";
import {
  CelebrationScreen,
  HoldToBuild,
  ReportStatic,
  RevealWizard,
  bandGrade,
} from "@/app/(protected)/placement/_components/reveal";

/**
 * /demo/placement-reveal - walk the reveal end to end on the Maya fixture.
 * No audio here (audioUrlFor returns null), so each card runs its motion on
 * mount and the parent taps Next. The frame is a 430 px phone or a 1000 px
 * desktop; the components lay themselves out by container width, so the
 * toggle shows exactly what each device gets.
 */
type Tab = "celebration" | "hold" | "wizard" | "report";
type Frame = "phone" | "desktop";
const TABS: { id: Tab; label: string }[] = [
  { id: "celebration", label: "Celebration" },
  { id: "hold", label: "Hold" },
  { id: "wizard", label: "Wizard" },
  { id: "report", label: "Static report" },
];
const FRAMES: { id: Frame; label: string }[] = [
  { id: "phone", label: "Phone" },
  { id: "desktop", label: "Desktop" },
];

export default function Page() {
  const [result] = useState(() => fixtureMaya());
  const [tab, setTab] = useState<Tab>("celebration");
  const [frame, setFrame] = useState<Frame>("desktop");
  const [note, setNote] = useState<string>("");
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (window.innerWidth < 768) setFrame("phone");
  }, []);

  const pick = useCallback((t: Tab) => {
    setTab(t);
    setNote("");
    setRun((r) => r + 1);
  }, []);

  const toHold = useCallback(() => setTab("hold"), []);
  const toWizard = useCallback(() => setTab("wizard"), []);
  const toReport = useCallback(() => setTab("report"), []);

  const phone = frame === "phone";
  const frameStyle = phone
    ? { maxWidth: 430, height: 844 }
    : { maxWidth: 1000, height: "calc(100vh - 176px)", minHeight: 720 };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6">
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === t.id ? "bg-violet-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrame(f.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${frame === f.id ? "bg-zinc-800 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {note && <p className="mx-auto mb-4 max-w-md text-center text-sm text-zinc-500">{note}</p>}

      {tab === "report" ? (
        <div
          className={`mx-auto overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)] ${phone ? "overflow-y-auto" : "max-w-3xl"}`}
          style={phone ? frameStyle : undefined}
        >
          <ReportStatic result={result} onStartPlan={() => setNote("Start plan pressed on the static report.")} />
        </div>
      ) : (
        <div
          key={`${tab}-${run}`}
          className="mx-auto overflow-hidden rounded-3xl bg-zinc-50 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]"
          style={frameStyle}
        >
          {tab === "celebration" && (
            <CelebrationScreen childName={result.childName} outfitId="bunny_astronaut" carrots={30} onHandoff={toHold} />
          )}
          {tab === "hold" && (
            <HoldToBuild childName={result.childName} enrolledGrade={bandGrade(result.enrolled)} onComplete={toWizard} />
          )}
          {tab === "wizard" && (
            <RevealWizard
              result={result}
              audioUrlFor={() => null}
              onStartPlan={() => setNote("Start plan pressed. Stripe Checkout would open here.")}
              onNotNow={toReport}
              onSkipToReport={toReport}
            />
          )}
        </div>
      )}
    </div>
  );
}
