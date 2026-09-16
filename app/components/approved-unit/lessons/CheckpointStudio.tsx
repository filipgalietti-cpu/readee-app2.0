"use client";
import { useUnitRuntime } from "@/lib/approved-unit/runtime";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import AdaptivePractice from "@/app/components/lesson-v2/delivery/AdaptivePractice";
import { examScoreSummary } from "@/lib/lesson-engine/production/exam-readiness";
import OpeningAmbience from "@/app/components/lesson-v2/delivery/OpeningAmbience";
import Karaoke from "@/app/components/lesson-v2/delivery/Karaoke";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import {
  previewSpeechToken,
  previewEvaluateResponse,
} from "@/app/components/lesson-v2/delivery/preview-services";
import { useLessonVoice } from "@/lib/lesson-engine/delivery/use-voice";
import type { NarrationTimings } from "@/lib/lesson-engine/delivery/word-timings";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import {
  createCheckpointPlan,
  checkpointPracticeSelection,
  checkpointTaskQuestion,
  checkpointTaskBudget,
} from "@/lib/lesson-engine/production/checkpoint";
import type { CheckpointDefinition } from "@/lib/lesson-engine/production/checkpoint-types";
import {
  recordedCompositionIssue,
  type RecordedComposition,
} from "@/lib/lesson-engine/delivery/recorded-speech";
import "./pip-studio.css";
import "./checkpoint-studio.css";
const empty = {};
export type CheckpointPreviewProps = {
  onExit: () => void;
  assigned?: string[];
  band?: Band;
  participation?: string | null;
  oralOnly?: boolean;
};
/** Guarded /demo adapter. No parent/student lookup, database writes or entitlement
 * claim. Production must inject authoritative assignment and approved exposure. */
export default function CheckpointStudio({
  definition: d,
  onExit,
  assigned: requested,
  band = "core",
  participation: selected,
  oralOnly = false,
}: CheckpointPreviewProps & { definition: CheckpointDefinition }) {
  const runtime = useUnitRuntime();
  const root = d.assetRoot,
    participation = selected === undefined ? d.defaultParticipation : selected;
  const assigned = useMemo(
    () => requested ?? [...d.scoredStandards, ...new Set(d.participation.map((p) => p.standard))],
    [requested, d],
  );
  const style = { "--checkpoint-ground": d.background } as CSSProperties;
  const [assets, setAssets] = useState<{
      manifest: Record<string, string>;
      timings: NarrationTimings;
    } | null>(null),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0),
    [started, setStarted] = useState(false);
  const voice = useLessonVoice(assets?.manifest ?? empty, assets?.timings);
  const plan = useMemo(
    () =>
      createCheckpointPlan({
        pool: d.probes,
        assigned: oralOnly ? [] : assigned,
        taught: assigned,
        exposedKeys: [],
        allowedProbeIds: d.probes.map((p) => p.id),
        maxProbes:
          [...new Set(assigned)].filter((s) => d.scoredStandards.some((x) => x === s)).length || 1,
      }),
    [d, assigned, oralOnly],
  ); // local candidate fixture only
  const closing = useMemo(
    () => d.participation.find((p) => p.id === participation && assigned.includes(p.standard)),
    [d, assigned, participation],
  );
  const closingQuestions = useMemo(
    () =>
      closing
        ? closing.tasks.map((task) => ({
            ...checkpointTaskQuestion(closing, task),
            phase: "reading-finish" as const,
          }))
        : [],
    [closing],
  );
  const scoredClosing = useMemo(
    () => (d.scoredClosing ?? []).filter((p) => assigned.includes(p.standard)),
    [d, assigned],
  );
  const scoredQuestions = useMemo(
    () =>
      scoredClosing.flatMap((p) =>
        p.tasks.map((t) => ({ ...checkpointTaskQuestion(p, t), phase: "reading-finish" as const })),
      ),
    [scoredClosing],
  );
  const pool = useMemo(
    () => [
      ...plan.pool.flatMap((p) => p.tasks.map((t) => checkpointTaskQuestion(p, t))),
      ...scoredQuestions,
      ...closingQuestions,
    ],
    [plan, closingQuestions, scoredQuestions],
  );
  const maxItems = checkpointTaskBudget(plan, closingQuestions, scoredQuestions);
  const selection = useMemo(
    () =>
      checkpointPracticeSelection(
        plan,
        closingQuestions,
        Object.fromEntries(
          plan.eligibleStandards.map((s) => [s, { band, rightRun: 0, wrongRun: 0 }]),
        ),
        scoredQuestions,
      ),
    [plan, closingQuestions, band, scoredQuestions],
  );
  const flowId = `${d.id}-${plan.eligibleStandards.join("-").replace(/[^a-z0-9-]/gi, "")}-${band}-${closing?.id.split("/").at(-1) ?? "no-oral"}${scoredClosing.length ? "-scored-oral-v1" : ""}`;
  useEffect(() => {
    const ac = new AbortController();
    Promise.all(
      [
        "audio-v2.json",
        "word-timings.json",
        ...(d.recordedSpeech ? ["speech-compositions.json"] : []),
      ].map(async (file) => {
        const r = await fetch(`${root}/${file}`, { signal: ac.signal, cache: "no-store" });
        if (!r.ok) throw Error("Checkpoint assets unavailable");
        return r.json();
      }),
    )
      .then(([manifest, timings, compositions]) => {
        if (d.recordedSpeech)
          for (const text of d.recordedSpeech.texts) {
            const issue = recordedCompositionIssue(
              text,
              compositions?.tracks?.[text] as RecordedComposition,
              manifest,
              d.recordedSpeech.units,
            );
            if (issue) throw Error(issue);
          }
        setAssets({ manifest, timings });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => ac.abort();
  }, [root, retry]);
  useEffect(() => {
    if (!assets || started) return;
    voice.say(d.welcome);
    return voice.stop;
  }, [assets, started, d.welcome, voice.say, voice.stop]);
  if (started && assets)
    return (
      <div
        className="pip-studio checkpoint-studio pip-practice"
        style={style}
        data-checkpoint={d.id}
      >
        <AdaptivePractice
          id={flowId}
          title={d.title}
          pool={pool}
          standards={plan.eligibleStandards}
          maxItems={maxItems}
          manifest={assets.manifest}
          timings={assets.timings}
          selectNext={selection}
          progressLabel={(attempt) =>
            `${d.title.replace(/^The /, "")} · ${attempt.asked.length} of ${maxItems}`
          }
          completionTitle={`You finished ${d.title.replace(/^The /, "the ")}!`}
          completion={d.completion}
          perfectCompletion={d.perfectCompletion}
          exam={
            d.exam
              ? {
                  ...d.exam,
                  resultSummary: (attempt) => examScoreSummary(plan, attempt, scoredClosing),
                }
              : undefined
          }
          learned={d.learned}
          questionTopic={d.questionTopic}
          visiblePassage
          speechToken={runtime?.speechToken ?? previewSpeechToken}
          evaluateResponse={runtime?.evaluateResponse ?? previewEvaluateResponse}
          onExit={onExit}
        />
      </div>
    );
  return (
    <div className="pip-studio checkpoint-studio" style={style} data-checkpoint={d.id}>
      <main className="le-frame checkpoint-invitation">
        <div className="checkpoint-cover">
          <img src={`${root}/opening.webp`} alt={d.coverAlt} />
        </div>
        <div className="checkpoint-welcome-copy">
          <p className="le-eyebrow">A new reading adventure</p>
          <h1>{d.title}</h1>
          <p>
            <Karaoke text={d.welcome} caption={voice.caption} activeWord={voice.activeWord} />
          </p>
          {error ? (
            <div role="alert">
              The audio could not load.{" "}
              <button
                onClick={() => {
                  setError(false);
                  setRetry((x) => x + 1);
                }}
              >
                Try loading again
              </button>
            </div>
          ) : !assets ? (
            <p role="status">Getting ready…</p>
          ) : null}
          {!maxItems && (
            <p role="status">There are no questions for this preview’s selected skills.</p>
          )}
          <button
            className="checkpoint-begin"
            disabled={!assets || !maxItems}
            onClick={() => {
              voice.stop();
              setStarted(true);
            }}
          >
            Let’s begin
          </button>
        </div>
        <div className="checkpoint-host" aria-hidden="true">
          <Bunny outfitId="classic" />
        </div>
        <div className="checkpoint-voice">
          <LunaOrb
            size={64}
            mode={voice.speaking ? "speaking" : "idle"}
            analyser={voice.analyser}
            label="Read the invitation again"
            onTap={() => voice.say(d.welcome)}
          />
        </div>
        <button className="checkpoint-back" onClick={onExit}>
          Back
        </button>
        {assets && (
          <OpeningAmbience
            src={`${root}/${d.ambience.file}`}
            label={d.ambience.label}
            duck={voice.speaking}
            volume={d.ambience.volume}
            duckVolume={d.ambience.duckVolume}
          />
        )}
      </main>
    </div>
  );
}
