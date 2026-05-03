"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Lock,
  BookOpen,
  ImagePlus,
  Volume2,
  HelpCircle,
  Users,
} from "lucide-react";
import { askReadee } from "../actions";
import {
  estimateParentBriefCredits,
  MONTHLY_PARENT_CREDIT_LIMIT,
  type ParentAiBrief,
} from "@/lib/ai/build-parent-content.shared";
import { CREDIT_COST } from "@/lib/ai/credits";
import TopUpCreditsButton from "@/app/_components/TopUpCreditsButton";
import VoiceSelector from "@/app/_components/VoiceSelector";
import { DEFAULT_VOICE_ID, getVoice, type VoiceId } from "@/lib/ai/voices";
import { PROMPT_TEMPLATES, PROMPT_CATEGORIES } from "@/lib/ai/prompt-templates";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";

type Step = 1 | 2 | 3;

type ChildOpt = { id: string; first_name: string; reading_level: string | null };

function defaultPerQuestionTts(grade: string | null): boolean {
  return grade === "K" || grade === "1st";
}

function initialBrief(): ParentAiBrief {
  return {
    childId: "",
    topic: "",
    phonicsPattern: "",
    passage: { enabled: true },
    questionCount: 3,
    media: {
      image: true,
      passageTts: true,
      perQuestionTts: false,
    },
    voice: getVoice(DEFAULT_VOICE_ID).geminiVoice,
    shareWithCommunity: false,
  };
}

export default function AskReadeeWizard({
  children,
  initialChildId,
  isPremium,
}: {
  children: ChildOpt[];
  initialChildId: string | null;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [brief, setBrief] = useState<ParentAiBrief>(() => {
    const b = initialBrief();
    const firstChild = initialChildId
      ? children.find((c) => c.id === initialChildId) ?? children[0]
      : children[0];
    b.childId = firstChild?.id ?? "";
    b.media.perQuestionTts = defaultPerQuestionTts(firstChild?.reading_level ?? null);
    return b;
  });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [budget, setBudget] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/ai-budget")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.monthly) setBudget(d.monthly);
      })
      .catch(() => {});
  }, []);

  const [perQttsTouched, setPerQttsTouched] = useState(false);
  function setChildId(id: string) {
    const c = children.find((c) => c.id === id);
    setBrief((prev) => ({
      ...prev,
      childId: id,
      media: {
        ...prev.media,
        perQuestionTts: perQttsTouched
          ? prev.media.perQuestionTts
          : defaultPerQuestionTts(c?.reading_level ?? null),
      },
    }));
  }

  const selectedChild = children.find((c) => c.id === brief.childId);

  const cost = useMemo(() => estimateParentBriefCredits(brief), [brief]);
  const exceedsRemaining = budget !== null && cost > budget.remaining;

  function stepForward() {
    setErr(null);
    if (step === 1) {
      if (!brief.childId) return setErr("Pick a child first.");
      if (!brief.topic.trim()) return setErr("Tell us the topic.");
    }
    if (step === 2 && !brief.passage.enabled && brief.questionCount === 0) {
      return setErr("Turn on the passage or add at least one question.");
    }
    setStep(((step + 1) as Step));
  }

  function stepBack() {
    setErr(null);
    if (step > 1) setStep(((step - 1) as Step));
  }

  function submit() {
    setErr(null);
    if (!isPremium) {
      router.push("/upgrade?reason=ask_readee");
      return;
    }
    if (exceedsRemaining) {
      setErr(`Not enough credits. You need ${cost}, have ${budget?.remaining}.`);
      return;
    }
    start(async () => {
      const res = await askReadee({ brief });
      if (!res.ok) {
        if (res.paywall) {
          router.push("/upgrade?reason=ask_readee");
          return;
        }
        setErr(res.error);
        return;
      }
      router.push(`/dashboard/ask-readee?built=${res.contentId}`);
      router.refresh();
    });
  }

  if (!isPremium) {
    return <ReadeePlusPaywall />;
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <StepHeader step={step} />
      {pending && (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10">
          <ReadeeAiLoader
            size={160}
            label="Readee.ai is building your lesson"
            caption="Building, this takes 20-40 seconds…"
          />
        </div>
      )}
      <div className={`px-6 pb-6${pending ? " pointer-events-none opacity-30" : ""}`}>
        {step === 1 && (
          <Step1
            brief={brief}
            setBrief={setBrief}
            setChildId={setChildId}
            children={children}
            selectedChild={selectedChild}
          />
        )}
        {step === 2 && <Step2 brief={brief} setBrief={setBrief} />}
        {step === 3 && (
          <Step3
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

        <CostFooter exceedsRemaining={exceedsRemaining} />

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
          {step < 3 ? (
            <button
              type="button"
              onClick={stepForward}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending || exceedsRemaining}
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building — this takes 20-40 seconds…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Build with Readee.ai
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({ step }: { step: Step }) {
  const labels = ["Child & topic", "Passage & questions", "Audio & share"];
  return (
    <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-4 dark:border-slate-800">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                n === step
                  ? "bg-indigo-600 text-white"
                  : n < step
                  ? "bg-green-500 text-white"
                  : "bg-zinc-200 text-zinc-500 dark:bg-slate-800 dark:text-slate-500"
              }`}
            >
              {n}
            </div>
            <span
              className={`text-xs font-semibold ${
                n === step ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-slate-500"
              }`}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <div className="h-px w-6 bg-zinc-200 dark:bg-slate-800" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  brief,
  setBrief,
  setChildId,
  children,
  selectedChild,
}: {
  brief: ParentAiBrief;
  setBrief: (fn: (b: ParentAiBrief) => ParentAiBrief) => void;
  setChildId: (id: string) => void;
  children: ChildOpt[];
  selectedChild: ChildOpt | undefined;
}) {
  return (
    <div className="space-y-5 pt-5">
      <div>
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Which child is this for?
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChildId(c.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                brief.childId === c.id
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {c.first_name}
              {c.reading_level && (
                <span className="ml-1.5 opacity-70">· {c.reading_level}</span>
              )}
            </button>
          ))}
        </div>
        {selectedChild && (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-slate-400">
            Grade is set from {selectedChild.first_name}&apos;s profile
            ({selectedChild.reading_level ?? "2nd"}). Readee will write at
            that exact level.
          </p>
        )}
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          What should the passage be about?
        </span>
        <textarea
          value={brief.topic}
          onChange={(e) =>
            setBrief((b) => ({ ...b, topic: e.target.value.slice(0, 400) }))
          }
          rows={3}
          placeholder={
            selectedChild
              ? `e.g. A friendly octopus who learns to share. Something ${selectedChild.first_name} would love.`
              : "e.g. A short story about a friendly octopus who learns to share."
          }
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <SuggestedPrompts
        childName={selectedChild?.first_name ?? "your child"}
        onPick={(topic, pattern) =>
          setBrief((b) => ({
            ...b,
            topic,
            phonicsPattern: pattern ?? b.phonicsPattern,
          }))
        }
      />

      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Phonics focus (optional)
        </span>
        <input
          value={brief.phonicsPattern ?? ""}
          onChange={(e) =>
            setBrief((b) => ({ ...b, phonicsPattern: e.target.value }))
          }
          placeholder="e.g. silent e, short a, r-controlled"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>
    </div>
  );
}

function Step2({
  brief,
  setBrief,
}: {
  brief: ParentAiBrief;
  setBrief: (fn: (b: ParentAiBrief) => ParentAiBrief) => void;
}) {
  return (
    <div className="space-y-4 pt-5">
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
        <div className="flex-1">
          <div className="font-bold text-zinc-900 dark:text-white">Reading passage</div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
            A short decodable passage at your child&apos;s grade level.
          </p>
        </div>
        <YesNo
          value={brief.passage.enabled}
          onChange={(v) =>
            setBrief((b) => ({ ...b, passage: { enabled: v } }))
          }
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
          <div className="flex-1">
            <div className="font-bold text-zinc-900 dark:text-white">Comprehension questions</div>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
              Multiple-choice questions about what your child read.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setBrief((b) => ({
                ...b,
                questionCount: Math.max(0, b.questionCount - 1),
              }))
            }
            disabled={brief.questionCount === 0}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-sm font-bold text-zinc-900 dark:text-white">
            {brief.questionCount}
          </span>
          <button
            type="button"
            onClick={() =>
              setBrief((b) => ({
                ...b,
                questionCount: Math.min(5, b.questionCount + 1),
              }))
            }
            disabled={brief.questionCount === 5}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
          >
            +
          </button>
          <span className="ml-2 text-[11px] text-zinc-500 dark:text-slate-400">
            0-5 questions
          </span>
        </div>
      </div>
    </div>
  );
}

function Step3({
  brief,
  setBrief,
  onPerQttsToggle,
}: {
  brief: ParentAiBrief;
  setBrief: (fn: (b: ParentAiBrief) => ParentAiBrief) => void;
  onPerQttsToggle: () => void;
}) {
  const perQttsCost = CREDIT_COST.tts_generation * brief.questionCount;
  return (
    <div className="space-y-3 pt-5">
      <MediaRow
        icon={<ImagePlus className="h-5 w-5" />}
        title="Illustration"
        description={`A cartoon scene for the passage. Costs ${CREDIT_COST.image_generation} credits.`}
        enabled={brief.passage.enabled && brief.media.image}
        disabled={!brief.passage.enabled}
        disabledHint="Turn on the passage first."
        onChange={(v) =>
          setBrief((b) => ({ ...b, media: { ...b.media, image: v } }))
        }
      />
      <MediaRow
        icon={<Volume2 className="h-5 w-5" />}
        title="Read-aloud passage"
        description={`Warm narration of the passage. Great for struggling readers. Costs ${CREDIT_COST.tts_generation} credits.`}
        enabled={brief.passage.enabled && brief.media.passageTts}
        disabled={!brief.passage.enabled}
        disabledHint="Turn on the passage first."
        onChange={(v) =>
          setBrief((b) => ({ ...b, media: { ...b.media, passageTts: v } }))
        }
      />
      <MediaRow
        icon={<HelpCircle className="h-5 w-5" />}
        title="Read each question aloud"
        description={`Read-aloud audio on every question. Costs ${perQttsCost} credits (${CREDIT_COST.tts_generation} × ${brief.questionCount}). Recommended for K–1.`}
        enabled={brief.media.perQuestionTts}
        disabled={brief.questionCount === 0}
        disabledHint="Add at least one question first."
        onChange={(v) => {
          onPerQttsToggle();
          setBrief((b) => ({ ...b, media: { ...b.media, perQuestionTts: v } }));
        }}
      />

      {((brief.media.passageTts && brief.passage.enabled) || brief.media.perQuestionTts) && (
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

      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:border-violet-900/40 dark:from-violet-950/20 dark:to-indigo-950/20">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-600 dark:text-violet-300" />
          <div className="flex-1">
            <div className="font-bold text-zinc-900 dark:text-white">
              Share with other Readee families
            </div>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-slate-400">
              Contribute a sanitized version (no names, no personal
              details) to the community library so other kids benefit.
              Every shared passage is reviewed before it goes live.
            </p>
          </div>
          <YesNo
            value={brief.shareWithCommunity}
            onChange={(v) =>
              setBrief((b) => ({ ...b, shareWithCommunity: v }))
            }
          />
        </div>
      </div>
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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
  exceedsRemaining,
}: {
  exceedsRemaining: boolean;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
      {exceedsRemaining ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-red-700 dark:text-red-300">
            <Sparkles className="h-3.5 w-3.5" />
            You&apos;ve used your monthly Readee+ readings. Top up to keep
            building.
          </div>
          <TopUpCreditsButton pool="parent" label="Top up" />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 font-semibold text-zinc-600 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          Included with your Readee+ plan.
        </div>
      )}
    </div>
  );
}

function ReadeePlusPaywall() {
  return (
    <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-10 text-center dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-zinc-900 dark:text-white">
        Ask Readee is a Readee+ feature
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-slate-400">
        Generate personalized reading passages, comprehension questions,
        illustrations, and warm read-aloud audio for {" "}
        your child — at their exact grade level. Up to {MONTHLY_PARENT_CREDIT_LIMIT}{" "}
        credits of AI content every month.
      </p>
      <Link
        href="/upgrade?reason=ask_readee"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
      >
        <Sparkles className="h-4 w-4" />
        Upgrade to Readee+
      </Link>
    </div>
  );
}

function SuggestedPrompts({
  childName,
  onPick,
}: {
  childName: string;
  onPick: (topic: string, pattern?: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("interests");
  const categories = Object.entries(PROMPT_CATEGORIES) as [
    keyof typeof PROMPT_CATEGORIES,
    string,
  ][];

  const visible = PROMPT_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        <Sparkles className="h-3.5 w-3.5" />
        Suggested — tap one to fill the topic
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {categories.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCategory(key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              activeCategory === key
                ? "bg-indigo-600 text-white"
                : "bg-white text-zinc-600 hover:bg-indigo-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-indigo-950/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {visible.map((t) => {
          const built = t.build({ childName });
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(built.topic, built.phonicsPattern)}
              className="flex min-w-[44%] flex-1 flex-col items-start gap-0.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{t.title}</span>
              <span className="text-[11px] text-zinc-500 dark:text-slate-400">{t.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
