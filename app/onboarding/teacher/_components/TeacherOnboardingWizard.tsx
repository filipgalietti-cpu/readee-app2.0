"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Building2,
  Target,
  Check,
} from "lucide-react";
import { saveTeacherIdentity } from "../actions";

type Grade = "K" | "1st" | "2nd" | "3rd" | "4th" | "Mixed";
type Setting = "classroom" | "resource_room" | "tutoring" | "homeschool" | "after_school";
type Intent = "phonics_gaps" | "below_grade" | "above_grade" | "ell" | "parent_comm" | "exploring";

const GRADES: { id: Grade; label: string }[] = [
  { id: "K", label: "Kindergarten" },
  { id: "1st", label: "1st grade" },
  { id: "2nd", label: "2nd grade" },
  { id: "3rd", label: "3rd grade" },
  { id: "4th", label: "4th grade" },
  { id: "Mixed", label: "Mixed grades" },
];

const SETTINGS: { id: Setting; label: string; sub: string }[] = [
  { id: "classroom",     label: "Classroom",        sub: "General-ed, full class" },
  { id: "resource_room", label: "Resource room",    sub: "SPED, small group" },
  { id: "tutoring",      label: "1-on-1 tutoring",  sub: "Individual instruction" },
  { id: "homeschool",    label: "Homeschool",       sub: "Teaching at home" },
  { id: "after_school",  label: "After-school",     sub: "Enrichment / club" },
];

const INTENTS: { id: Intent; label: string; sub: string; gradient: string }[] = [
  { id: "phonics_gaps", label: "Phonics gaps",      sub: "Decoding holes I need to fill",        gradient: "from-violet-500 to-indigo-600" },
  { id: "below_grade",  label: "Below-grade readers", sub: "Kids reading under their level",      gradient: "from-rose-500 to-pink-600" },
  { id: "above_grade",  label: "Above-grade readers", sub: "Need more challenging content",       gradient: "from-emerald-500 to-teal-600" },
  { id: "ell",          label: "ELL students",       sub: "English-language learners in my class", gradient: "from-fuchsia-500 to-pink-600" },
  { id: "parent_comm",  label: "Parent communication", sub: "Easier ways to share progress",       gradient: "from-amber-500 to-orange-600" },
  { id: "exploring",    label: "Just exploring",     sub: "Kicking the tires",                    gradient: "from-zinc-500 to-zinc-700" },
];

export default function TeacherOnboardingWizard({
  emailHint,
  initial,
}: {
  emailHint: string | null;
  initial: {
    displayName: string;
    defaultGrade: Grade | null;
    schoolHint: string;
    classSetting: Setting | null;
    intent: Intent | null;
  };
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [defaultGrade, setDefaultGrade] = useState<Grade | null>(initial.defaultGrade);
  const [schoolHint, setSchoolHint] = useState(initial.schoolHint);
  const [classSetting, setClassSetting] = useState<Setting | null>(initial.classSetting);
  const [intent, setIntent] = useState<Intent | null>(initial.intent);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const totalSteps = 3;
  const canAdvance =
    step === 0 ? displayName.trim().length > 1
      : step === 1 ? !!defaultGrade && !!classSetting
      : step === 2 ? !!intent
      : false;

  function next() {
    if (!canAdvance || pending) return;
    setErr(null);
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    finish();
  }

  function back() {
    if (pending) return;
    setErr(null);
    if (step > 0) setStep(step - 1);
  }

  function finish() {
    start(async () => {
      const res = await saveTeacherIdentity({
        displayName,
        defaultGrade,
        schoolHint,
        classSetting,
        intent,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.replace("/classroom?onboarded=1");
    });
  }

  const stepDirection = useStepDirection();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      {/* Step indicator */}
      <div className="mx-auto flex w-full max-w-md items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-800"
          >
            <motion.div
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-400">
        Step {step + 1} of {totalSteps} · {stepLabel(step)}
      </div>

      {/* Step body */}
      <div className="mt-10 flex-1">
        <AnimatePresence mode="wait" custom={stepDirection.direction}>
          <motion.div
            key={step}
            custom={stepDirection.direction}
            variants={{
              enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {step === 0 && (
              <StepIdentity
                displayName={displayName}
                onChange={setDisplayName}
                emailHint={emailHint}
              />
            )}
            {step === 1 && (
              <StepClass
                defaultGrade={defaultGrade}
                setDefaultGrade={setDefaultGrade}
                schoolHint={schoolHint}
                setSchoolHint={setSchoolHint}
                classSetting={classSetting}
                setClassSetting={setClassSetting}
              />
            )}
            {step === 2 && <StepIntent intent={intent} setIntent={setIntent} />}
          </motion.div>
        </AnimatePresence>

        {err && (
          <div className="mx-auto mt-6 flex max-w-md items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {err}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mx-auto mt-10 flex w-full max-w-md items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            stepDirection.set(-1);
            back();
          }}
          disabled={step === 0 || pending}
          className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-0 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            stepDirection.set(1);
            next();
          }}
          disabled={!canAdvance || pending}
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-violet-700 disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up your classroom…
            </>
          ) : step < totalSteps - 1 ? (
            <>
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Open my classroom
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function stepLabel(step: number) {
  if (step === 0) return "About you";
  if (step === 1) return "About your class";
  return "What brings you here";
}

function useStepDirection() {
  const [direction, setDirection] = useState(1);
  return { direction, set: (d: number) => setDirection(d) };
}

/* ─── Step 1: Identity ─────────────────────────────── */

function StepIdentity({
  displayName,
  onChange,
  emailHint,
}: {
  displayName: string;
  onChange: (v: string) => void;
  emailHint: string | null;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
        <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        What should kids call you?
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
        This is how you&apos;ll appear across Readee — on lessons,
        in messages home, in your students&apos; dashboards.
      </p>

      <div className="mt-6">
        <input
          type="text"
          value={displayName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Mrs. Klingerman"
          autoFocus
          maxLength={80}
          className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-5 py-4 text-center text-2xl font-bold text-zinc-900 placeholder:text-zinc-300 focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {emailHint && !displayName && (
          <p className="mt-2 text-xs text-zinc-400">
            We had your email as <span className="font-mono">{emailHint}</span> — kids
            will never see that.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Step 2: Class context ────────────────────────── */

function StepClass({
  defaultGrade,
  setDefaultGrade,
  schoolHint,
  setSchoolHint,
  classSetting,
  setClassSetting,
}: {
  defaultGrade: Grade | null;
  setDefaultGrade: (g: Grade) => void;
  schoolHint: string;
  setSchoolHint: (v: string) => void;
  classSetting: Setting | null;
  setClassSetting: (s: Setting) => void;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <Building2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Tell us about your class
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          This sets defaults for new lessons and tunes Readee.ai to your kids.
        </p>
      </div>

      {/* Grade */}
      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Grade you teach
        </span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setDefaultGrade(g.id)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                defaultGrade === g.id
                  ? "border-violet-600 bg-violet-600 text-white shadow-md"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </label>

      {/* Setting */}
      <label className="mt-5 block">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Where you teach
        </span>
        <div className="mt-2 space-y-1.5">
          {SETTINGS.map((s) => {
            const active = classSetting === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setClassSetting(s.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left transition ${
                  active
                    ? "border-violet-600 bg-violet-50"
                    : "border-zinc-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className={`text-sm font-bold ${active ? "text-violet-900" : "text-zinc-900 dark:text-slate-100"}`}>
                    {s.label}
                  </div>
                  <div className={`text-xs ${active ? "text-violet-700" : "text-zinc-500"}`}>
                    {s.sub}
                  </div>
                </div>
                {active && (
                  <Check className="h-4 w-4 flex-shrink-0 text-violet-600" />
                )}
              </button>
            );
          })}
        </div>
      </label>

      {/* School (optional) */}
      <label className="mt-5 block">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          School name <span className="text-zinc-400 normal-case">· optional</span>
        </span>
        <input
          type="text"
          value={schoolHint}
          onChange={(e) => setSchoolHint(e.target.value.slice(0, 120))}
          placeholder="e.g. Lincoln Elementary"
          className="mt-2 w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>
    </div>
  );
}

/* ─── Step 3: Intent ──────────────────────────────── */

function StepIntent({
  intent,
  setIntent,
}: {
  intent: Intent | null;
  setIntent: (i: Intent) => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg">
          <Target className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          What brings you to Readee?
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          Pick the one that fits best. Readee will lead with the tools
          that match.
        </p>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {INTENTS.map((opt) => {
          const active = intent === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => setIntent(opt.id)}
                className={`flex w-full flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition ${
                  active
                    ? "border-violet-600 bg-violet-50 shadow-md"
                    : "border-zinc-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${opt.gradient} text-white`}>
                  {active ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </div>
                <div className={`mt-2 text-sm font-bold ${active ? "text-violet-900" : "text-zinc-900 dark:text-slate-100"}`}>
                  {opt.label}
                </div>
                <div className={`text-xs ${active ? "text-violet-700" : "text-zinc-500"}`}>
                  {opt.sub}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
