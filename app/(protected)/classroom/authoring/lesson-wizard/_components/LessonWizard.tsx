"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ImagePlus,
  Volume2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { aiBuildLesson } from "@/app/(protected)/classroom/authoring-actions";
import {
  estimateLessonCredits,
  type LessonBrief,
} from "@/lib/ai/build-lesson.shared";
import { CREDIT_COST, MONTHLY_CREDIT_LIMIT } from "@/lib/ai/credits";
import VoiceSelector from "@/app/_components/VoiceSelector";
import {
  DEFAULT_VOICE_ID,
  getVoice,
  type VoiceId,
} from "@/lib/ai/voices";
import { Progress } from "@/app/components/ui/progress";

type Grade = "K" | "1st" | "2nd" | "3rd" | "4th";
const GRADES: Grade[] = ["K", "1st", "2nd", "3rd", "4th"];

const TOPIC_SUGGESTIONS = [
  "How plants grow — seed, sprout, leaves, flower. 2nd grade level.",
  "Community helpers: what a firefighter, librarian, and mail carrier do.",
  "The water cycle in kid-friendly terms. 3rd grade.",
  "A short folktale about a clever fox and a wise owl learning to share.",
  "Animals that hibernate in winter and why they do it.",
  "What a paragraph is and how to spot the main idea.",
];

function initialBrief(): LessonBrief {
  return {
    title: "",
    gradeLevel: "2nd",
    topic: "",
    slideCount: 5,
    media: { perSlideImage: true, perSlideAudio: true },
    voice: getVoice(DEFAULT_VOICE_ID).geminiVoice,
    questionCount: 3,
  };
}

export default function LessonWizard() {
  const router = useRouter();
  const [brief, setBrief] = useState<LessonBrief>(initialBrief);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("Getting started…");
  const [budget, setBudget] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  const cost = estimateLessonCredits(brief);
  const exceedsBudget = budget != null && cost > budget.remaining;

  // Cycle through example prompts when topic is empty.
  useEffect(() => {
    if (brief.topic.trim()) return;
    const t = setTimeout(() => {
      setSuggestionIdx((i) => (i + 1) % TOPIC_SUGGESTIONS.length);
    }, 4500);
    return () => clearTimeout(t);
  }, [suggestionIdx, brief.topic]);

  // Load budget so cost preview is accurate.
  useEffect(() => {
    fetch("/api/classroom/ai-budget")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.monthly) {
          setBudget({
            used: j.monthly.used,
            limit: j.monthly.limit,
            remaining: j.monthly.remaining,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Asymptotic progress bar while pending — orchestrator runs as one
  // server action so we don't get real milestones.
  useEffect(() => {
    if (!pending) return;
    setProgress(0);
    const labels = [
      [0, "Writing the passage…"],
      [25, "Splitting into slides…"],
      [40, "Drawing illustrations…"],
      [70, "Recording read-aloud…"],
      [88, "Writing comprehension questions…"],
      [95, "Quality-checking…"],
    ] as const;
    const t0 = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - t0) / 1000;
      const target = Math.min(95, 100 * (1 - Math.exp(-elapsed / 25)));
      setProgress(Math.round(target));
      const label = labels.find(([pct]) => target >= pct);
      if (label) setStepLabel(label[1]);
    }, 250);
    return () => clearInterval(tick);
  }, [pending]);

  function setBriefField<K extends keyof LessonBrief>(k: K, v: LessonBrief[K]) {
    setBrief((b) => ({ ...b, [k]: v }));
  }

  function submit() {
    setErr(null);
    if (!brief.topic.trim()) {
      setErr("Tell Readee what you want to teach.");
      return;
    }
    start(async () => {
      const res = await aiBuildLesson({ brief });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      const warnQuery = res.warnings.length
        ? `&warn=${encodeURIComponent(res.warnings.join(" · ").slice(0, 600))}`
        : "";
      router.push(`/classroom/lessons/${res.lessonId}?built=1${warnQuery}`);
    });
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      {/* Title */}
      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Lesson title <span className="font-normal text-zinc-400">(optional)</span>
        </span>
        <input
          value={brief.title}
          onChange={(e) => setBriefField("title", e.target.value.slice(0, 120))}
          placeholder="Leave blank — Readee will use the passage title"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      {/* Grade */}
      <div className="mt-5">
        <span className="block mb-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Grade level
        </span>
        <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setBriefField("gradeLevel", g)}
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

      {/* Topic */}
      <div className="mt-5">
        <label className="block">
          <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
            What is this lesson about?
          </span>
          <div className="relative mt-1">
            <textarea
              value={brief.topic}
              onChange={(e) =>
                setBriefField("topic", e.target.value.slice(0, 400))
              }
              onKeyDown={(e) => {
                if (!brief.topic.trim() && e.key === "Tab" && !e.shiftKey) {
                  e.preventDefault();
                  setBriefField("topic", TOPIC_SUGGESTIONS[suggestionIdx]);
                }
              }}
              rows={3}
              placeholder={
                brief.topic.trim()
                  ? "Describe what to teach…"
                  : ""
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            {!brief.topic.trim() && (
              <div
                key={suggestionIdx}
                className="pointer-events-none absolute inset-x-0 top-0 px-3 py-2 text-sm leading-relaxed text-zinc-400"
              >
                {TOPIC_SUGGESTIONS[suggestionIdx]}
              </div>
            )}
          </div>
        </label>
        {!brief.topic.trim() && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-300">
              <Sparkles className="h-3 w-3" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                Try a prompt
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setBriefField("topic", TOPIC_SUGGESTIONS[suggestionIdx])
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-200"
            >
              Use this prompt
              <kbd className="rounded bg-white/70 px-1 text-[9px] font-bold text-violet-700">
                Tab
              </kbd>
            </button>
          </div>
        )}
      </div>

      {/* Slide count */}
      <div className="mt-5">
        <span className="block mb-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
          How many slides? <span className="font-normal text-zinc-400">({brief.slideCount})</span>
        </span>
        <input
          type="range"
          min={3}
          max={10}
          value={brief.slideCount}
          onChange={(e) =>
            setBriefField("slideCount", parseInt(e.target.value, 10))
          }
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400">
          <span>3 (quick)</span>
          <span>10 (deep)</span>
        </div>
      </div>

      {/* Question count */}
      <div className="mt-5">
        <span className="block mb-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
          End-of-lesson comprehension questions{" "}
          <span className="font-normal text-zinc-400">({brief.questionCount})</span>
        </span>
        <input
          type="range"
          min={0}
          max={6}
          value={brief.questionCount}
          onChange={(e) =>
            setBriefField("questionCount", parseInt(e.target.value, 10))
          }
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400">
          <span>0 (just slides)</span>
          <span>6 (deep check)</span>
        </div>
      </div>

      {/* Media toggles */}
      <div className="mt-6 space-y-2">
        <Toggle
          icon={<ImagePlus className="h-4 w-4" />}
          title="Illustration on every slide"
          description={`One cartoon image per slide. Costs ${CREDIT_COST.image_generation + CREDIT_COST.quiz_generation} credits per slide.`}
          enabled={brief.media.perSlideImage}
          onChange={(v) =>
            setBriefField("media", { ...brief.media, perSlideImage: v })
          }
        />
        <Toggle
          icon={<Volume2 className="h-4 w-4" />}
          title="Read-aloud on every slide"
          description={`Narration plays as the slide is shown. Costs ${CREDIT_COST.tts_generation} credits per slide.`}
          enabled={brief.media.perSlideAudio}
          onChange={(v) =>
            setBriefField("media", { ...brief.media, perSlideAudio: v })
          }
        />
      </div>

      {/* Voice */}
      {brief.media.perSlideAudio && (
        <div className="mt-5">
          <VoiceSelector
            value={
              (
                ["sage", "rio", "riley", "marcus", "kai", "lily"] as VoiceId[]
              ).find((id) => getVoice(id).geminiVoice === brief.voice) ??
              DEFAULT_VOICE_ID
            }
            onChange={(id) =>
              setBriefField("voice", getVoice(id).geminiVoice)
            }
          />
        </div>
      )}

      {/* Cost footer */}
      <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-xs dark:bg-slate-900/40">
        <span className="text-zinc-600 dark:text-slate-300">
          Estimated cost: <span className="font-bold text-violet-700 dark:text-violet-300">{cost} credits</span>
        </span>
        {budget && (
          <span className="text-zinc-500">
            {budget.remaining} / {budget.limit} remaining this month
          </span>
        )}
      </div>
      {exceedsBudget && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          This lesson would cost more than your remaining credits ({budget?.remaining}).
        </div>
      )}

      {/* Error */}
      {err && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {/* Build button */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">
          Lesson · {brief.slideCount} slide{brief.slideCount === 1 ? "" : "s"}
          {brief.questionCount > 0 ? ` + ${brief.questionCount} questions` : ""}
        </span>
        {pending ? (
          <div className="flex w-full max-w-md flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {stepLabel}
              <span className="ml-auto font-mono text-zinc-500">
                {progress}%
              </span>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={exceedsBudget}
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            Build lesson
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-3 transition ${
        enabled
          ? "border-violet-300 bg-violet-50/40 dark:border-violet-700 dark:bg-violet-950/20"
          : "border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg ${
            enabled ? "bg-violet-100 text-violet-700" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white">
            {title}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-slate-400">
            {description}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`mt-1 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition ${
          enabled ? "bg-violet-600" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
