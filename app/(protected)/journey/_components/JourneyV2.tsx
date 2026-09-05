"use client";

/**
 * JOURNEY V2 MAP — the child's own route through the roadmap.
 *
 * What the child sees: the next step up top, then the units they can see
 * (finished ones, the one they are in, and the next one). The rest of the
 * road is fog: a count, not a list, so a reader placed far below their grade
 * never faces eighty lessons at once. A unit's exam is the gate to the next
 * unit and can be taken early to test out. Units past the free one show a
 * Readee+ line, never an empty grey box.
 */
import Link from "next/link";
import { PRICING } from "@/lib/billing-copy";
import type { JourneyChild } from "@/lib/journey-v2/load";
import type { ItemKind, JourneyItem, JourneyLesson, JourneyUnit, JourneyView } from "@/lib/journey-v2/types";

const KIND_LABEL: Record<ItemKind, string> = { warmup: "Warm-up", lesson: "Lesson", quiz: "Questions", exam: "Unit exam", final: "Graduation exam" };
const GRADE_SHORT: Record<string, string> = { Kindergarten: "K", "1st Grade": "1st", "2nd Grade": "2nd", "3rd Grade": "3rd", "4th Grade": "4th" };

function upgradeHref(childId: string) {
  return `/upgrade?reason=journey&child=${encodeURIComponent(childId)}`;
}

export default function JourneyV2({ view, child, hasPlacement }: { view: JourneyView; child: JourneyChild; hasPlacement: boolean }) {
  const cur = view.current;
  const finished = cur === null;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#1e1b3a]">{child.firstName}&rsquo;s reading journey</h1>
        <p className="mt-1 text-base text-zinc-500">
          {hasPlacement
            ? `Starting where the placement put ${child.firstName}: ${gradeLabel(view.startBand)}. Each unit exam opens the next unit.`
            : `Starting at ${gradeLabel(view.startBand)}. Take the placement any time to start where ${child.firstName} really is.`}
        </p>
        {!hasPlacement && (
          <Link href={`/placement?child=${encodeURIComponent(child.id)}`} className="mt-2 inline-block text-sm font-semibold text-violet-700 underline underline-offset-4">
            Take the reading placement
          </Link>
        )}
        {view.why.length > 0 && (
          <div className="mt-4 rounded-2xl border border-zinc-100 bg-white px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">Why this plan</div>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-zinc-700">
              {view.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {cur && cur.item.free && (
        <section className="mb-8 rounded-3xl border border-violet-100 bg-violet-50 p-5 shadow-[0_4px_0_0_rgb(221_214_254)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">Next up</div>
          <div className="mt-1 text-2xl font-bold text-violet-900">{cur.item.title}</div>
          <div className="mt-1 text-sm text-violet-700">
            {KIND_LABEL[cur.item.kind]} · {GRADE_SHORT[cur.unit.grade] ?? cur.unit.grade} {cur.unit.name} · {cur.unit.lessonsDone} of {cur.unit.lessonsTotal} lessons done
          </div>
          <Link href={cur.item.href} className="mt-4 inline-block rounded-2xl bg-violet-600 px-7 py-3.5 text-lg font-bold text-white shadow-[0_4px_0_0_rgb(91_33_182)] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_rgb(91_33_182)]">
            {cur.item.done ? "Try again" : cur.unit.lessonsDone === 0 && cur.item.kind === "warmup" ? "Start" : "Continue"}
          </Link>
        </section>
      )}

      {cur && !cur.item.free && <RoadCard view={view} child={child} />}

      {finished && (
        <section className="mb-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="text-2xl font-bold text-emerald-900">Every unit that is ready is done.</div>
          <p className="mt-1 text-sm text-emerald-800">
            {view.unbuiltAhead > 0
              ? `Our reading specialists are still building ${view.unbuiltAhead} more ${view.unbuiltAhead === 1 ? "unit" : "units"} for this part of the road. They appear here the day they are ready.`
              : "There is more to read in the full lesson library."}
          </p>
          <Link href={`/journey?child=${encodeURIComponent(child.id)}&legacy=1`} className="mt-3 inline-block text-sm font-semibold text-emerald-900 underline underline-offset-4">
            Open the full lesson library
          </Link>
        </section>
      )}

      <ol className="flex flex-col gap-4">
        {view.units.map((u) => (
          <UnitCard key={u.id} unit={u} childId={child.id} />
        ))}
      </ol>

      {(view.hiddenAhead > 0 || view.unbuiltAhead > 0) && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          {view.hiddenAhead > 0 && `${view.hiddenAhead} more ${view.hiddenAhead === 1 ? "unit" : "units"} coming up after these. `}
          {view.unbuiltAhead > 0 && `${view.unbuiltAhead} ${view.unbuiltAhead === 1 ? "unit is" : "units are"} still being built.`}
        </p>
      )}
      {!view.fullAccess && view.prescribedUnitId && (
        <p className="mt-3 text-center text-sm text-zinc-500">
          The first unit is free, start to finish. <Link href={upgradeHref(child.id)} className="font-semibold text-violet-700 underline underline-offset-4">Readee+</Link> opens every unit and every exam.
        </p>
      )}
    </main>
  );
}

/**
 * THE ROAD AT THE ASK — shown in place of "Next up" the moment the child's
 * next step is past the free unit. The parent sees the route to the bar, not
 * a price: how many units remain, the dated milestones the placement
 * projected, and the trial as the way to keep going.
 */
function RoadCard({ view, child }: { view: JourneyView; child: JourneyChild }) {
  const cur = view.current!;
  const remaining = view.units.filter((u) => u.status !== "done").length + view.hiddenAhead;
  const bar = gradeLabel(view.enrolledBand);
  return (
    <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-[0_4px_0_0_rgb(253_230_138)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">{cur.unit.lessonsDone === 0 && cur.unit.status === "current" ? "Unit ready" : "Next up"}</div>
      <div className="mt-1 text-2xl font-bold text-amber-950">{GRADE_SHORT[cur.unit.grade] ?? cur.unit.grade} {cur.unit.name} is ready.</div>
      <p className="mt-2 text-sm text-amber-900">
        {child.firstName}&rsquo;s road to the {bar} bar: {remaining} {remaining === 1 ? "unit" : "units"}
        {view.unbuiltAhead > 0 ? ` (${view.unbuiltAhead} more still being built)` : ""}, each one opened by its own exam.
      </p>
      {view.milestones.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {view.milestones.map((m) => (
            <li key={m.label + m.date} className="flex items-baseline justify-between gap-3 rounded-xl bg-white/70 px-3 py-2 text-sm">
              <span className="font-semibold text-amber-950">{m.label}</span>
              <span className="shrink-0 text-amber-800">{m.month}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href={upgradeHref(child.id)} className="mt-4 inline-block rounded-2xl bg-amber-500 px-7 py-3.5 text-lg font-bold text-amber-950 shadow-[0_4px_0_0_rgb(180_83_9)] transition active:translate-y-[2px]">
        Keep going with Readee+
      </Link>
      <p className="mt-2 text-xs text-amber-800">{PRICING.trialDays} days free, then {PRICING.monthly.label}. Cancel any time.</p>
    </section>
  );
}

function gradeLabel(band: number): string {
  return ["kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade"][band] ?? "kindergarten";
}

function UnitCard({ unit, childId }: { unit: JourneyUnit; childId: string }) {
  const chip = unit.status === "done" ? "Done" : unit.status === "current" ? "Now" : "Next";
  const chipCls = unit.status === "done" ? "bg-emerald-100 text-emerald-800" : unit.status === "current" ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-600";
  const locked = !unit.free;
  return (
    <li className={`rounded-3xl border bg-white p-5 ${unit.status === "current" ? "border-violet-200 shadow-[0_4px_0_0_rgb(237_233_254)]" : "border-zinc-100"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">{unit.grade}</div>
          <h2 className="text-xl font-bold text-[#1e1b3a]">{unit.name}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${chipCls}`}>{chip}</span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-violet-500 transition-[width]" style={{ width: `${unit.pct}%` }} />
      </div>
      <div className="mt-1 text-xs font-semibold text-zinc-500">{unit.lessonsDone} of {unit.lessonsTotal} lessons</div>

      {locked ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3">
          <div className="text-sm font-semibold text-amber-900">{unit.lessonsTotal} lessons{unit.exam ? " and the unit exam" : ""}. Readee+ opens this unit.</div>
          <Link href={upgradeHref(childId)} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-amber-950 shadow-[0_3px_0_0_rgb(180_83_9)] active:translate-y-[1px]">Unlock</Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-zinc-100">
          {unit.lessons.map((l) => (
            <LessonRow key={l.id} lesson={l} />
          ))}
          {unit.exam && <GateRow item={unit.exam} allLessonsDone={unit.lessonsDone === unit.lessonsTotal} childId={childId} />}
          {unit.final && <GateRow item={unit.final} allLessonsDone={unit.status === "done"} childId={childId} isFinal />}
        </ul>
      )}
    </li>
  );
}

function LessonRow({ lesson }: { lesson: JourneyLesson }) {
  const next = lesson.items.find((i) => !i.done) ?? null;
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className={`truncate text-base font-semibold ${lesson.done ? "text-zinc-400 line-through decoration-zinc-300" : "text-[#1e1b3a]"}`}>{lesson.title}</div>
        <div className="mt-1 flex items-center gap-1.5">
          {lesson.items.map((it) => (
            <StepDot key={it.kind + it.id} item={it} />
          ))}
        </div>
      </div>
      {next ? (
        <Link href={next.href} className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_0_rgb(91_33_182)] active:translate-y-[1px]">
          {KIND_LABEL[next.kind]}
        </Link>
      ) : (
        <Link href={lesson.items.find((i) => i.kind === "lesson")?.href ?? "#"} className="shrink-0 text-sm font-semibold text-violet-700 underline underline-offset-4">
          Play again
        </Link>
      )}
    </li>
  );
}

function StepDot({ item }: { item: JourneyItem }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${item.done ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-500"}`}>
      {KIND_LABEL[item.kind]}
    </span>
  );
}

function GateRow({ item, allLessonsDone, childId, isFinal = false }: { item: JourneyItem; allLessonsDone: boolean; childId: string; isFinal?: boolean }) {
  const label = isFinal ? "Graduation exam" : "Unit exam";
  let sub: string;
  if (item.passed) sub = item.score !== null ? `Passed with ${item.score}%` : "Passed";
  else if (item.done) sub = item.score !== null ? `Last try: ${item.score}%. Try again when you are ready.` : "Try again when you are ready.";
  else if (allLessonsDone) sub = isFinal ? "Every unit is done. Show what you know." : "Pass it to open the next unit.";
  else sub = isFinal ? "Finish the units first, or test out now." : "Test out now, or finish the lessons first.";
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className={`text-base font-semibold ${item.passed ? "text-emerald-800" : "text-[#1e1b3a]"}`}>{label}</div>
        <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>
      </div>
      {item.free ? (
        <Link href={item.href} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold ${item.passed ? "bg-zinc-100 text-zinc-600" : "bg-violet-600 text-white shadow-[0_3px_0_0_rgb(91_33_182)] active:translate-y-[1px]"}`}>
          {item.passed ? "Retake" : item.done ? "Try again" : allLessonsDone ? "Start" : "Test out"}
        </Link>
      ) : (
        <Link href={upgradeHref(childId)} className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-amber-950 shadow-[0_3px_0_0_rgb(180_83_9)] active:translate-y-[1px]">
          Readee+
        </Link>
      )}
    </li>
  );
}
