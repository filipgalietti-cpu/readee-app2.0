/**
 * REVEAL COPY - every display string the reveal and the static report show,
 * derived from one PlacementResult. Nothing here is invented: the numbers come
 * from decision.fluency / decision.decoding / decision.comprehension, the
 * words from decision.strengths / needs / relative, the path from plan.
 *
 * Pronouns: the decision engine writes "they" ("understands what they read"),
 * and the result carries no gender, so derived sentences use the child's name
 * where a pronoun would go.
 */
import type { GlyphName } from "@/app/_components/Glyph";
import { BAND_LABEL, type Band, type PlacedBand } from "@/lib/placement/ladder";
import { ordinal, type GradePhase, type Season } from "@/lib/placement/norms";
import type { Moment, NarrationId, NarrationLine, PlacementResult, PlanMilestone, PlanStep } from "@/lib/placement/types";

export type SkillCopy = {
  id: "decoding" | "fluency" | "comprehension";
  narrationId: NarrationId;
  icon: GlyphName;
  label: string;
  value: string;
  fillPct: number;
  meaning: string;
};

export type NumberCopy = {
  dataLabel: string;
  wcpm: number;
  benchmark: number | null;
  benchmarkLabel: string;
  percentile: number | null;
  sentence: string;
  source: string;
};

export type RevealCopy = {
  childName: string;
  dateLine: string;
  dateLong: string;
  enrolledLabel: string;
  enrolledHyphen: string;
  /** "9 minutes with Luna" */
  minutesLine: string;
  metaLine: string;
  headline: string;
  strengths: string[];
  momentLine: string | null;
  number: NumberCopy | null;
  placement: { band: string; category: string; support: string; reassurance: string | null };
  skills: SkillCopy[];
  path: {
    steps: PlanStep[];
    milestones: PlanMilestone[];
    lessons: number;
    weeks: number;
    minutesPerDay: number;
    reviewedBy: string;
    countLine: string;
    curatedLine: string;
  };
  plan: {
    dose: string;
    milestones: PlanMilestone[];
    tipsHeading: string;
    tips: string[];
    projection: string;
  };
  ask: {
    headline: string;
    line: string;
    button: string;
    finePrint: string;
    /** The same dates as finePrint, one step per row, for the ask card's timeline. */
    timeline: TrialStep[];
    trust: string;
    notNow: string;
    notNowSub: string;
  };
};

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);
const capitalize = (s: string): string => (s.length ? s[0].toUpperCase() + s.slice(1) : s);

/** "4th grade" / "kindergarten" */
export function gradeWord(band: PlacedBand): string {
  return band === 0 ? "kindergarten" : `${ordinal(band)} grade`;
}

/** "4th-grade" / "kindergarten" (attributive) */
export function bandGrade(band: Band): string {
  return band === 0 ? "kindergarten" : `${BAND_LABEL[band]}-grade`;
}

export function seasonWord(season: Season): string {
  return season;
}

function phaseWords(phase: GradePhase): string {
  if (phase === "early") return "at the start of the year";
  if (phase === "mid") return "in the middle of the year";
  return "at the end of the year";
}

export function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** One quiet line about something that happened in the exam. */
export function momentLine(m: Moment, name: string): string {
  switch (m.kind) {
    case "list-passed":
      return m.misses === 0
        ? `${name} read every word on the ${bandGrade(m.band)} list.`
        : `${name} passed the ${bandGrade(m.band)} list with ${numberWord(m.misses)} ${m.misses === 1 ? "miss" : "misses"}.`;
    case "list-hard": {
      const words = m.words.map((w, i) => (i === 0 ? capitalize(w) : w));
      return words.length === 1
        ? `${words[0]} is where the ${bandGrade(m.band)} list got hard.`
        : `${joinList(words)} are where the ${bandGrade(m.band)} list got hard.`;
    }
    case "list-easy":
      return `The ${bandGrade(m.band)} list was easy for ${name}.`;
    case "passage-kept-going":
      return `In the story ${name} slowed down but kept going.`;
    case "passage-accurate":
      return `${name} read the ${bandGrade(m.band)} story with ${Math.round(m.accuracy * 100)} percent accuracy.`;
    case "passage-slow":
      return `${name} read the ${bandGrade(m.band)} story at a careful pace.`;
    case "passage-expressive":
      return `${name} read the ${bandGrade(m.band)} story with expression.`;
    case "comprehension":
      return m.correct === m.total
        ? `${name} answered all ${numberWord(m.total)} questions.`
        : `${name} answered ${numberWord(m.correct)} of ${numberWord(m.total)} questions.`;
    case "foundation": {
      const skill = m.skill === "letterSounds" ? "letter sounds" : m.skill === "blending" ? "blends" : "new words";
      return `${name} got ${m.correct} of ${m.total} ${skill}.`;
    }
  }
}

export function narrationFor(result: PlacementResult, id: NarrationId): NarrationLine | null {
  return result.narration.find((n) => n.id === id) ?? null;
}

function formatDate(iso: string, withYear: boolean): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", withYear ? { month: "long", day: "numeric", year: "numeric" } : { month: "long", day: "numeric" });
}

export const HOME_TIPS = (name: string): string[] => [
  `Listen to ${name} read aloud for five minutes`,
  "Reread one short book twice. The second read builds speed",
  "Ask one question about the story afterward",
];

export function buildRevealCopy(result: PlacementResult): RevealCopy {
  const { childName: name, decision, plan } = result;
  const enrolledLabel = gradeWord(result.enrolled);
  const enrolledHyphen = bandGrade(result.enrolled);
  const dateLine = formatDate(result.createdAt, false);
  const minutes = Math.max(1, Math.round(result.durationSeconds / 60));

  // The number
  let number: NumberCopy | null = null;
  const f = decision.fluency;
  if (f) {
    const season = seasonWord(decision.season);
    const bench = f.typicalForEnrolled;
    const pctl = f.percentile?.percentile ?? null;
    const ge = f.gradeEquivalent;
    const first = bench !== null ? `The ${season} benchmark for ${enrolledLabel} is ${bench} words per minute. ` : "";
    let second = bench !== null ? `${name} read ${f.wcpm}` : `${name} read ${f.wcpm} words per minute`;
    if (pctl !== null) second += `, about the ${ordinal(pctl)} percentile`;
    if (ge) second += `, similar to the average ${ordinal(ge.grade)} grader ${phaseWords(ge.phase)}`;
    number = {
      dataLabel: `Reading speed · ${bandGrade(f.band)} passage`,
      wcpm: f.wcpm,
      benchmark: bench,
      benchmarkLabel: `${season} benchmark for ${enrolledLabel}`,
      percentile: pctl,
      sentence: `${first}${second}.`,
      source: "Hasbrouck and Tindal 2017 national norms",
    };
  }

  // Placement
  const delta = decision.relative.delta;
  const placement = {
    band: decision.readingLevelName,
    category: `${capitalize(decision.relative.label)}.`,
    support: decision.needs.length
      ? `${name} will benefit from targeted practice in ${joinList(decision.needs)}.`
      : `${name} is ready to keep building from here.`,
    reassurance: delta > 0 ? "Below grade level does not mean failing. It means the practice needs to be aimed." : null,
  };

  // Skills
  const skills: SkillCopy[] = [];
  const level = decision.decoding.level;
  const nextTarget = decision.decoding.nextTarget;
  skills.push({
    id: "decoding",
    narrationId: "skill-decoding",
    icon: "text",
    label: "Decoding",
    value: level === null ? "Getting started" : `${bandGrade(level)} words`,
    fillPct: level === null ? 0 : result.enrolled === 0 ? 100 : Math.min(100, Math.round((level / result.enrolled) * 100)),
    meaning:
      nextTarget !== null && nextTarget <= 4
        ? `${capitalize(bandGrade(nextTarget))} words are next.`
        : decision.decoding.ceilingPassed
          ? "Reads above grade-level words."
          : "Reads grade-level words.",
  });
  if (f) {
    const speedNeed = decision.needs.some((n) => n.includes("speed"));
    const good = (f.percentile?.percentile ?? 0) >= 50;
    skills.push({
      id: "fluency",
      narrationId: "skill-fluency",
      icon: "gauge",
      label: "Fluency",
      value: `${f.wcpm} words per minute`,
      fillPct: f.percentile?.percentile ?? 0,
      meaning: `${Math.round(f.accuracy * 100)} percent accuracy.${speedNeed ? " Speed is the skill to build." : good ? " A good pace." : ""}`,
    });
  }
  const c = decision.comprehension;
  if (c) {
    skills.push({
      id: "comprehension",
      narrationId: "skill-comprehension",
      icon: "brain",
      label: "Comprehension",
      value: `${c.correct} of ${c.total}`,
      fillPct: Math.round(c.pct * 100),
      meaning: c.pct >= 0.99 ? "Understands what they read." : c.pct >= 0.66 ? "Understands most of what they read." : "Understanding is the skill to build.",
    });
  }

  return {
    childName: name,
    dateLine,
    dateLong: formatDate(result.createdAt, true),
    enrolledLabel,
    enrolledHyphen,
    minutesLine: `${minutes} minutes with Luna`,
    metaLine: `${minutes} minutes with Luna · ${dateLine}`,
    headline: `${name} did a great job today.`,
    strengths: decision.strengths.map(capitalize),
    momentLine: result.moments.length ? momentLine(result.moments[0], name) : null,
    number,
    placement,
    skills,
    path: {
      steps: plan.steps,
      milestones: plan.milestones,
      lessons: plan.lessons,
      weeks: plan.weeksAt10Min,
      minutesPerDay: plan.minutesPerDay,
      reviewedBy: plan.reviewedBy,
      countLine: `${plan.lessons} lessons · about ${plan.weeksAt10Min} weeks at ${plan.minutesPerDay} minutes a day`,
      curatedLine: `Curated from ${name}'s placement · Reviewed by ${plan.reviewedBy}`,
    },
    plan: {
      dose: `${plan.minutesPerDay} minutes a day, ${plan.daysPerWeek} days a week.`,
      milestones: plan.milestones,
      tipsHeading: "Three things to do at home this week",
      tips: HOME_TIPS(name),
      projection: "Projected from published growth rates at this practice dose.",
    },
    ask: {
      headline: `${name}'s plan is ready.`,
      line: `Everything on ${name}'s path is included with Readee+.`,
      button: `Start ${name}'s plan`,
      finePrint: trialTimeline(new Date()),
      timeline: trialSteps(new Date()),
      trust: `Reviewed by ${plan.reviewedBy}`,
      notNow: `Not right now. ${name} keeps the free first unit.`,
      notNowSub: "The full report stays on your dashboard.",
    },
  };
}


export type TrialStep = { when: string; text: string };

const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** The trial as three dated steps: today, the reminder (Stripe emails it 7
 *  days before the trial ends), and the first charge. */
export function trialSteps(start: Date): TrialStep[] {
  const reminder = new Date(start.getTime() + 7 * 86400000);
  const charge = new Date(start.getTime() + 14 * 86400000);
  return [
    { when: "Today", text: "Full access, $0 due now" },
    { when: shortDate(reminder), text: "We email you a reminder" },
    { when: shortDate(charge), text: "First charge, $9.99 a month" },
  ];
}

/** Blinkist-style dated trial timeline as one sentence (the report's fine print). */
export function trialTimeline(start: Date): string {
  const [today, reminder, charge] = trialSteps(start);
  return `${today.when}: ${today.text.toLowerCase()}. ${reminder.when}: ${reminder.text.toLowerCase()}. ${charge.when}: ${charge.text.toLowerCase()}. Cancel anytime in one tap.`;
}
