"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Check,
} from "lucide-react";
import { saveTeacherIdentity } from "../actions";

type Grade = "K" | "1st" | "2nd" | "3rd" | "4th" | "Mixed";
type Grades = Grade[];
type Setting = "classroom" | "resource_room" | "tutoring" | "homeschool" | "after_school";
type Intent = "phonics_gaps" | "below_grade" | "above_grade" | "ell" | "parent_comm" | "exploring";
type Intents = Intent[];

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

const INTENTS: { id: Intent; label: string; sub: string }[] = [
  { id: "phonics_gaps", label: "Phonics gaps",         sub: "Decoding holes I need to fill" },
  { id: "below_grade",  label: "Below-grade readers",  sub: "Kids reading under their level" },
  { id: "above_grade",  label: "Above-grade readers",  sub: "Need more challenging content" },
  { id: "ell",          label: "ELL students",         sub: "English-language learners in my class" },
  { id: "parent_comm",  label: "Parent communication", sub: "Easier ways to share progress" },
  { id: "exploring",    label: "Just exploring",       sub: "Kicking the tires" },
];

export default function TeacherOnboardingWizard({
  emailHint,
  initial,
}: {
  emailHint: string | null;
  initial: {
    displayName: string;
    defaultGrades: Grades | null;
    schoolHint: string;
    classSetting: Setting | null;
    intents: Intents | null;
  };
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [defaultGrades, setDefaultGrades] = useState<Grades>(initial.defaultGrades ?? []);
  const [schoolHint, setSchoolHint] = useState(initial.schoolHint);
  const [classSetting, setClassSetting] = useState<Setting | null>(initial.classSetting);
  const [intents, setIntents] = useState<Intents>(initial.intents ?? []);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function toggleGrade(g: Grade) {
    setDefaultGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }
  function toggleIntent(i: Intent) {
    setIntents((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  const totalSteps = 3;
  const canAdvance =
    step === 0 ? displayName.trim().length > 1
      : step === 1 ? defaultGrades.length > 0 && !!classSetting
      : step === 2 ? intents.length > 0
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
        defaultGrades,
        schoolHint,
        classSetting,
        intents,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      // Land DIRECTLY in the demo classroom workspace (roster +
      // assignment + sidebar all visible) instead of the dashboard
      // grid where the demo card is just one of many tiles.
      const target = res.demoClassroomId
        ? `/classroom/${res.demoClassroomId}?onboarded=1`
        : "/classroom?onboarded=1";
      router.replace(target);
    });
  }

  const stepDirection = useStepDirection();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      {/* Step indicator — soft track, brand-fill */}
      <div className="mx-auto flex w-full max-w-md items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="relative h-1 flex-1 overflow-hidden rounded-full bg-violet-200"
          >
            <motion.div
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="absolute inset-y-0 left-0 rounded-full bg-violet-600"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 text-center text-[11px] font-bold uppercase tracking-widest text-violet-700/70">
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
                defaultGrades={defaultGrades}
                toggleGrade={toggleGrade}
                schoolHint={schoolHint}
                setSchoolHint={setSchoolHint}
                classSetting={classSetting}
                setClassSetting={setClassSetting}
              />
            )}
            {step === 2 && <StepIntent intents={intents} toggleIntent={toggleIntent} />}
          </motion.div>
        </AnimatePresence>

        {err && (
          <div className="mx-auto mt-6 flex max-w-md items-start gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-800 ring-1 ring-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {err}
          </div>
        )}
      </div>

      {/* Footer nav — Continue centered, Back as a small text link below */}
      <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => {
            stepDirection.set(1);
            next();
          }}
          disabled={!canAdvance || pending}
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
        <button
          type="button"
          onClick={() => {
            stepDirection.set(-1);
            back();
          }}
          disabled={step === 0 || pending}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition hover:text-zinc-800 disabled:opacity-0"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
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

const ROTATING_PLACEHOLDERS = [
  "e.g. Mrs. Wonderful",
  "e.g. Mr. Fantastic",
  "e.g. Ms. Brilliant",
  "e.g. Mrs. Sunshine",
  "e.g. Mr. Awesome",
  "e.g. Ms. Marvelous",
  "e.g. Mrs. Curious",
  "e.g. Mr. Sparkle",
  "e.g. Ms. Galaxy",
  "e.g. Coach Sarah",
  "e.g. Dr. Klingerman",
  "e.g. Señora Lopez",
];

function StepIdentity({
  displayName,
  onChange,
  emailHint,
}: {
  displayName: string;
  onChange: (v: string) => void;
  emailHint: string | null;
}) {
  const [phIdx, setPhIdx] = useState(() =>
    Math.floor(Math.random() * ROTATING_PLACEHOLDERS.length),
  );

  // Cycle the placeholder every 2.2s while the input is empty.
  // Pauses the moment the teacher starts typing.
  useEffect(() => {
    if (displayName.length > 0) return;
    const t = setInterval(() => {
      setPhIdx((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
    }, 2200);
    return () => clearInterval(t);
  }, [displayName]);

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
        What should kids call you?
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        This is how you&apos;ll appear across Readee — on lessons,
        in messages home, in your students&apos; dashboards.
      </p>

      <div className="mt-6 relative">
        <input
          type="text"
          value={displayName}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          autoFocus
          maxLength={80}
          className="w-full border-0 border-b-2 border-violet-200 bg-transparent px-2 py-4 text-center text-4xl font-extrabold tracking-tight text-zinc-900 transition focus:border-violet-600 focus:outline-none"
        />
        {/* Rotating placeholder layer — fades in/out behind the cursor
            when the input is empty. Plain placeholder= can't animate
            so we render it as an absolutely positioned label. */}
        {!displayName && (
          <AnimatePresence mode="wait">
            <motion.span
              key={phIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-extrabold tracking-tight text-violet-300"
            >
              {ROTATING_PLACEHOLDERS[phIdx]}
            </motion.span>
          </AnimatePresence>
        )}
        {emailHint && !displayName && (
          <p className="mt-2 text-xs text-zinc-500">
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
  defaultGrades,
  toggleGrade,
  schoolHint,
  setSchoolHint,
  classSetting,
  setClassSetting,
}: {
  defaultGrades: Grades;
  toggleGrade: (g: Grade) => void;
  schoolHint: string;
  setSchoolHint: (v: string) => void;
  classSetting: Setting | null;
  setClassSetting: (s: Setting) => void;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Tell us about your class
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Pick all that apply. We&apos;ll set defaults from your selections.
        </p>
      </div>

      {/* Grades — multi-select checklist */}
      <fieldset className="mt-6">
        <legend className="text-xs font-bold uppercase tracking-widest text-violet-700/70">
          Grades you teach
        </legend>
        <ul className="mt-2 space-y-1">
          {GRADES.map((g) => {
            const active = defaultGrades.includes(g.id);
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => toggleGrade(g.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active ? "bg-violet-600 shadow-md shadow-violet-300/30" : "hover:bg-violet-100"
                  }`}
                >
                  <CheckBox active={active} />
                  <span className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-900"}`}>
                    {g.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Setting — single pick (a teacher generally has one primary setting) */}
      <fieldset className="mt-6">
        <legend className="text-xs font-bold uppercase tracking-widest text-violet-700/70">
          Where you teach
        </legend>
        <ul className="mt-2 space-y-1">
          {SETTINGS.map((s) => {
            const active = classSetting === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setClassSetting(s.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active ? "bg-violet-600 shadow-md shadow-violet-300/30" : "hover:bg-violet-100"
                  }`}
                >
                  <RadioDot active={active} />
                  <span className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-900"}`}>
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* School (optional) */}
      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-widest text-violet-700/70">
          School name <span className="text-zinc-500 normal-case">· optional</span>
        </span>
        <input
          type="text"
          value={schoolHint}
          onChange={(e) => setSchoolHint(e.target.value.slice(0, 120))}
          placeholder="e.g. Lincoln Elementary"
          className="mt-2 w-full border-0 border-b-2 border-violet-200 bg-transparent px-2 py-3 text-sm text-zinc-900 placeholder:text-violet-300 transition focus:border-violet-600 focus:outline-none"
        />
      </label>
    </div>
  );
}

function CheckBox({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition ${
        active
          ? "bg-white text-violet-700"
          : "bg-violet-100 text-transparent ring-1 ring-violet-300"
      }`}
    >
      {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition ${
        active ? "bg-white" : "bg-violet-100 ring-1 ring-violet-300"
      }`}
    >
      {active && <span className="h-2 w-2 rounded-full bg-violet-700" />}
    </span>
  );
}

/* ─── Step 3: Intent ──────────────────────────────── */

function StepIntent({
  intents,
  toggleIntent,
}: {
  intents: Intents;
  toggleIntent: (i: Intent) => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          What brings you to Readee?
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Pick everything that fits. We&apos;ll surface the tools that match.
        </p>
      </div>

      <ul className="mt-6 space-y-1">
        {INTENTS.map((opt) => {
          const active = intents.includes(opt.id);
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => toggleIntent(opt.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active ? "bg-violet-600 shadow-md shadow-violet-300/30" : "hover:bg-violet-100"
                }`}
              >
                <CheckBox active={active} />
                <span className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-900"}`}>
                  {opt.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
