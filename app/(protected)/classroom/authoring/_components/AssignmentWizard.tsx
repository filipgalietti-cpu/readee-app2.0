"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Check,
  BookOpen,
  ImagePlus,
  Volume2,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { aiBuildAssignment } from "../../authoring-actions";
import {
  estimateBriefCredits,
  type AssignmentBrief,
} from "@/lib/ai/build-assignment";
import { CREDIT_COST, MONTHLY_CREDIT_LIMIT } from "@/lib/ai/credits";
import TopUpCreditsButton from "@/app/_components/TopUpCreditsButton";
import VoiceSelector from "@/app/_components/VoiceSelector";
import { DEFAULT_VOICE_ID, getVoice, type VoiceId } from "@/lib/ai/voices";
import { Progress } from "@/app/components/ui/progress";
import PromptSuggestionsTyper from "@/app/_components/PromptSuggestionsTyper";

const TEACHER_PROMPT_SUGGESTIONS = [
  "A short passage about a young hockey player learning the basics. Friendly, encouraging tone.",
  "An informational passage about how plants grow — seed, sprout, leaves, flower.",
  "A story about a brave dog who helps a lost kid find their way home.",
  "A passage about community helpers — what a firefighter, librarian, and mail carrier do.",
  "A short folktale about a clever fox and a wise owl learning to share food.",
  "A passage explaining the water cycle in simple kid-friendly terms.",
];

type Step = 1 | 2 | 3 | 4;

type Grade = "K" | "1st" | "2nd" | "3rd" | "4th";

const GRADES: Grade[] = ["K", "1st", "2nd", "3rd", "4th"];

/** Grades where read-aloud audio on every question is the safer default. */
function defaultPerQuestionTts(grade: Grade): boolean {
  return grade === "K" || grade === "1st";
}

function initialBrief(): AssignmentBrief {
  return {
    title: "",
    gradeLevel: "2nd",
    topic: "",
    phonicsPattern: "",
    passage: { enabled: true },
    questions: { multipleChoice: 5, trueFalse: 0, matching: 0 },
    media: {
      passageImage: true,
      passageTts: true,
      perQuestionTts: false, // re-derived below when grade changes
    },
    voice: getVoice(DEFAULT_VOICE_ID).geminiVoice,
  };
}

export default function AssignmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [brief, setBrief] = useState<AssignmentBrief>(() => {
    const b = initialBrief();
    b.media.perQuestionTts = defaultPerQuestionTts(b.gradeLevel as Grade);
    return b;
  });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStep, setBuildStep] = useState("Getting started…");

  // Progress simulation — orchestrator runs server-side in a single
  // server action so we don't get real milestones. Animate to ~95% over
  // ~35s (non-linear: fast at start, slow near the cap), rotate step
  // labels to match the real orchestrator sequence so the UX doesn't
  // lie about what's happening.
  useEffect(() => {
    if (!pending) {
      setBuildProgress(0);
      setBuildStep("Getting started…");
      return;
    }
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      // Asymptote-style: pct = 95 * (1 - exp(-elapsed/14)). Hits ~50% at
      // 10s, ~75% at 20s, ~90% at 35s. Caps under 95 so we don't claim
      // "done" before the server actually returns.
      const pct = 95 * (1 - Math.exp(-elapsed / 14));
      setBuildProgress(Math.round(pct));
      const labels: [number, string][] = [
        [0, "Setting up the assignment…"],
        [5, "Writing the passage…"],
        [12, "Drawing the illustration…"],
        [20, "Generating questions…"],
        [28, "Recording read-aloud audio…"],
      ];
      let label = labels[0][1];
      for (const [t, l] of labels) if (elapsed >= t) label = l;
      setBuildStep(label);
    }, 200);
    return () => clearInterval(tick);
  }, [pending]);
  const [budget, setBudget] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/classroom/ai-budget")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setBudget(d.monthly);
      })
      .catch(() => {});
  }, []);

  // When grade changes, re-derive the per-question TTS default — but
  // don't override a teacher who has explicitly toggled it.
  const [perQttsTouched, setPerQttsTouched] = useState(false);
  function setGrade(g: Grade) {
    setBrief((prev) => ({
      ...prev,
      gradeLevel: g,
      media: {
        ...prev.media,
        perQuestionTts: perQttsTouched
          ? prev.media.perQuestionTts
          : defaultPerQuestionTts(g),
      },
    }));
  }

  const totalQuestions =
    brief.questions.multipleChoice +
    brief.questions.trueFalse +
    brief.questions.matching;

  const cost = useMemo(() => estimateBriefCredits(brief), [brief]);
  const exceedsRemaining =
    budget !== null && cost > budget.remaining;

  function stepForward() {
    setErr(null);
    if (step === 1) {
      if (!brief.title.trim()) return setErr("Give the assignment a title.");
      if (!brief.topic.trim()) return setErr("Describe the topic.");
    }
    if (step === 2 && brief.passage.enabled === false && totalQuestions === 0) {
      return setErr("Without a passage, you need at least one question.");
    }
    if (step === 3 && totalQuestions === 0) {
      return setErr("Pick at least one question.");
    }
    setStep(((step + 1) as Step));
  }

  function stepBack() {
    setErr(null);
    if (step > 1) setStep(((step - 1) as Step));
  }

  function submit() {
    setErr(null);
    if (exceedsRemaining) {
      setErr(
        `Not enough credits. You need ${cost}, you have ${budget?.remaining}.`,
      );
      return;
    }
    start(async () => {
      const res = await aiBuildAssignment({ brief });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/classroom/authoring/quiz/${res.quizId}?built=1`);
    });
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <StepHeader step={step} />

      <div className="px-6 pb-6">
        {step === 1 && (
          <StepBrief
            brief={brief}
            setBrief={setBrief}
            setGrade={setGrade}
          />
        )}
        {step === 2 && <StepPassage brief={brief} setBrief={setBrief} />}
        {step === 3 && (
          <StepQuestions brief={brief} setBrief={setBrief} />
        )}
        {step === 4 && (
          <StepMedia
            brief={brief}
            setBrief={setBrief}
            onPerQttsToggle={() => setPerQttsTouched(true)}
          />
        )}

        {err && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {err}
          </div>
        )}

        <CostFooter
          cost={cost}
          budget={budget}
          exceedsRemaining={exceedsRemaining}
        />

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={stepBack}
            disabled={step === 1 || pending}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={stepForward}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : pending ? (
            <div className="flex w-full flex-col gap-2 sm:max-w-md">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {buildStep}
                <span className="ml-auto font-mono text-zinc-500">
                  {buildProgress}%
                </span>
              </div>
              <Progress value={buildProgress} />
            </div>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={exceedsRemaining}
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Build assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step header with progress dots ─────────────────────────────── */

function StepHeader({ step }: { step: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Brief" },
    { n: 2, label: "Passage" },
    { n: 3, label: "Questions" },
    { n: 4, label: "Audio & visuals" },
  ];
  return (
    <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-4 dark:border-slate-800">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              s.n === step
                ? "bg-indigo-600 text-white"
                : s.n < step
                ? "bg-green-500 text-white"
                : "bg-zinc-200 text-zinc-500 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            {s.n < step ? <Check className="h-3.5 w-3.5" /> : s.n}
          </div>
          <span
            className={`text-xs font-semibold ${
              s.n === step
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-400 dark:text-slate-500"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className="h-px w-6 bg-zinc-200 dark:bg-slate-800" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Brief ──────────────────────────────────────────────── */

function StepBrief({
  brief,
  setBrief,
  setGrade,
}: {
  brief: AssignmentBrief;
  setBrief: (fn: (b: AssignmentBrief) => AssignmentBrief) => void;
  setGrade: (g: Grade) => void;
}) {
  return (
    <div className="space-y-5 pt-5">
      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Assignment title
        </span>
        <input
          value={brief.title}
          onChange={(e) =>
            setBrief((b) => ({ ...b, title: e.target.value.slice(0, 120) }))
          }
          placeholder="e.g. Hockey heroes — comprehension"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <div>
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Grade level
        </span>
        <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={`rounded-full px-3 py-1 transition ${
                brief.gradeLevel === g
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                  : "text-zinc-500"
              }`}
            >
              {g === "K" ? "Kindergarten" : g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block">
          <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
            What is the assignment about?
          </span>
          <textarea
            value={brief.topic}
            onChange={(e) =>
              setBrief((b) => ({ ...b, topic: e.target.value.slice(0, 400) }))
            }
            rows={3}
            placeholder="Tell Readee.ai what you want your students to read about…"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        {!brief.topic.trim() && (
          <PromptSuggestionsTyper
            suggestions={TEACHER_PROMPT_SUGGESTIONS}
            onPick={(p) => setBrief((b) => ({ ...b, topic: p }))}
          />
        )}
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Phonics focus (optional)
        </span>
        <input
          value={brief.phonicsPattern ?? ""}
          onChange={(e) =>
            setBrief((b) => ({ ...b, phonicsPattern: e.target.value }))
          }
          placeholder="e.g. short a, r-controlled, silent e"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-slate-400">
          If set, passage target words are bolded and the questions lean
          into the pattern.
        </p>
      </label>
    </div>
  );
}

/* ── Step 2: Passage toggle ─────────────────────────────────────── */

function StepPassage({
  brief,
  setBrief,
}: {
  brief: AssignmentBrief;
  setBrief: (fn: (b: AssignmentBrief) => AssignmentBrief) => void;
}) {
  return (
    <div className="space-y-4 pt-5">
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:border-slate-800 dark:from-indigo-950/20 dark:to-violet-950/20">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
          <div className="flex-1">
            <div className="font-bold text-zinc-900 dark:text-white">
              Generate a reading passage
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-slate-400">
              Students read the passage first, then answer questions based
              on it. Recommended — it gives the questions real grounding
              instead of being trivia.
            </p>
          </div>
          <YesNo
            value={brief.passage.enabled}
            onChange={(v) =>
              setBrief((b) => ({ ...b, passage: { enabled: v } }))
            }
          />
        </div>
      </div>

      {brief.passage.enabled && (
        <p className="text-xs text-zinc-500 dark:text-slate-400">
          Your phonics focus{" "}
          <span className="font-semibold">
            {brief.phonicsPattern?.trim()
              ? `(${brief.phonicsPattern})`
              : "(none)"}
          </span>{" "}
          will be applied. Target words are bolded for the student reader.
        </p>
      )}

      {!brief.passage.enabled && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          Questions will be topic-only (no passage). Good for vocabulary
          review, phonics drills, and quick formative checks.
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Question mix ───────────────────────────────────────── */

function StepQuestions({
  brief,
  setBrief,
}: {
  brief: AssignmentBrief;
  setBrief: (fn: (b: AssignmentBrief) => AssignmentBrief) => void;
}) {
  function set<K extends "multipleChoice" | "trueFalse" | "matching">(
    k: K,
    v: number,
  ) {
    setBrief((b) => ({ ...b, questions: { ...b.questions, [k]: v } }));
  }
  const total =
    brief.questions.multipleChoice +
    brief.questions.trueFalse +
    brief.questions.matching;
  return (
    <div className="space-y-3 pt-5">
      <p className="text-xs text-zinc-500 dark:text-slate-400">
        Pick a mix. Total across all types should stay under 20.
      </p>
      <Counter
        label="Multiple choice"
        sublabel="Four choices, one correct. Readee's default."
        value={brief.questions.multipleChoice}
        setValue={(v) => set("multipleChoice", v)}
        max={15}
      />
      <Counter
        label="True / false"
        sublabel="Good for quick checks. Rendered as 2-choice MCQs."
        value={brief.questions.trueFalse}
        setValue={(v) => set("trueFalse", v)}
        max={10}
      />
      <Counter
        label="Matching pairs"
        sublabel="Pair definitions or concepts. Each pair becomes an MCQ for the student runner."
        value={brief.questions.matching}
        setValue={(v) => set("matching", v)}
        max={8}
      />
      <div className="pt-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
        Total:{" "}
        <span className="text-zinc-900 dark:text-white">{total} questions</span>
      </div>
    </div>
  );
}

/* ── Step 4: Media ──────────────────────────────────────────────── */

function StepMedia({
  brief,
  setBrief,
  onPerQttsToggle,
}: {
  brief: AssignmentBrief;
  setBrief: (fn: (b: AssignmentBrief) => AssignmentBrief) => void;
  onPerQttsToggle: () => void;
}) {
  const totalQs =
    brief.questions.multipleChoice +
    brief.questions.trueFalse +
    brief.questions.matching;
  const perQttsCost = CREDIT_COST.tts_generation * totalQs;
  return (
    <div className="space-y-3 pt-5">
      <MediaRow
        icon={<ImagePlus className="h-5 w-5" />}
        title="Illustration for the passage"
        description={`Generates a cartoon illustration that sits above the reading passage. Costs ${CREDIT_COST.image_generation} credits.`}
        enabled={brief.passage.enabled && brief.media.passageImage}
        disabled={!brief.passage.enabled}
        disabledHint="Enable the passage in step 2 first."
        onChange={(v) =>
          setBrief((b) => ({ ...b, media: { ...b.media, passageImage: v } }))
        }
      />
      <MediaRow
        icon={<Volume2 className="h-5 w-5" />}
        title="Read-aloud for the passage"
        description={`Warm narration of the passage. Plays when the student opens the quiz. Costs ${CREDIT_COST.tts_generation} credits.`}
        enabled={brief.passage.enabled && brief.media.passageTts}
        disabled={!brief.passage.enabled}
        disabledHint="Enable the passage in step 2 first."
        onChange={(v) =>
          setBrief((b) => ({ ...b, media: { ...b.media, passageTts: v } }))
        }
      />
      <MediaRow
        icon={<HelpCircle className="h-5 w-5" />}
        title="Read each question aloud"
        description={`Read-aloud audio on every question prompt. Costs ${perQttsCost} credits (${CREDIT_COST.tts_generation} × ${totalQs}). Recommended for K–1; off by default for 2–4.`}
        enabled={brief.media.perQuestionTts}
        onChange={(v) => {
          onPerQttsToggle();
          setBrief((b) => ({
            ...b,
            media: { ...b.media, perQuestionTts: v },
          }));
        }}
      />

      {(brief.media.passageTts || brief.media.perQuestionTts) && (
        <VoiceSelector
          value={
            (
              ["sage", "rio", "riley", "marcus", "kai", "lily"] as VoiceId[]
            ).find((id) => getVoice(id).geminiVoice === brief.voice) ??
            DEFAULT_VOICE_ID
          }
          onChange={(id) =>
            setBrief((b) => ({ ...b, voice: getVoice(id).geminiVoice }))
          }
        />
      )}
    </div>
  );
}

/* ── Small reusable building blocks ─────────────────────────────── */

function YesNo({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-zinc-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
      {[
        { v: true, label: "Yes" },
        { v: false, label: "No" },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.v)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            value === o.v
              ? "bg-indigo-600 text-white"
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Counter({
  label,
  sublabel,
  value,
  setValue,
  max,
}: {
  label: string;
  sublabel: string;
  value: number;
  setValue: (v: number) => void;
  max: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-0 flex-1">
        <div className="font-bold text-zinc-900 dark:text-white">{label}</div>
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
          {sublabel}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setValue(Math.max(0, value - 1))}
          disabled={value === 0}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-sm font-bold text-zinc-900 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          disabled={value === max}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
        >
          +
        </button>
      </div>
    </div>
  );
}

function MediaRow({
  icon,
  title,
  description,
  enabled,
  disabled,
  disabledHint,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        disabled
          ? "border-zinc-200 bg-zinc-50 opacity-70 dark:border-slate-800 dark:bg-slate-950/50"
          : "border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="mt-0.5 flex-shrink-0 text-violet-600 dark:text-violet-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
          {disabled ? disabledHint : description}
        </div>
      </div>
      <YesNo
        value={!disabled && enabled}
        onChange={(v) => !disabled && onChange(v)}
      />
    </div>
  );
}

function CostFooter({
  cost,
  budget,
  exceedsRemaining,
}: {
  cost: number;
  budget: { used: number; limit: number; remaining: number } | null;
  exceedsRemaining: boolean;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-600 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          Projected cost:{" "}
          <span className="font-mono font-bold text-zinc-900 dark:text-white">
            {cost} credits
          </span>
        </div>
        {budget && (
          <div
            className={`font-mono font-semibold ${
              exceedsRemaining
                ? "text-red-600"
                : "text-zinc-500 dark:text-slate-400"
            }`}
          >
            {budget.remaining} / {budget.limit} credits left this month
          </div>
        )}
      </div>
      {exceedsRemaining && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="text-red-700 dark:text-red-300">
            Over your monthly cap. Reduce options — or top up for more
            credits.
          </div>
          <TopUpCreditsButton pool="teacher" label="Top up" />
        </div>
      )}
    </div>
  );
}
