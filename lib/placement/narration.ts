/**
 * PLACEMENT NARRATION - the nine spoken lines of the reveal, in Readee's voice
 * to the parent. Pure: decision + moments + plan in, lines out. Each line is
 * synthesized as one clip (the complete route does that), so every line stays
 * under NARRATION_MAX_CHARS and cites only what the evidence holds.
 *
 * House rules the validator enforces (narrationProblems): no em-dashes, no
 * "kid", no "test"/"quiz"/"exam", no "typical" (say "benchmark" or "the
 * average 4th grader"), no "behind", no "guaranteed"; "failing" appears only
 * inside the one reassurance sentence; no exclamation marks on the number,
 * placement and skill lines.
 */
import { childCopyProblems } from "./bank";
import type { PlacementDecision } from "./decide";
import type { PlacedBand } from "./ladder";
import { ordinal, type GradePhase } from "./norms";
import type { Moment, NarrationId, NarrationLine, PlacementPlan } from "./types";
import { gradeAdjective, unitPhraseFor } from "./plan";

export type Pronoun = "she" | "he" | "they";

export type NarrateInput = {
  childName: string;
  /** Default "they". */
  pronoun?: Pronoun;
  decision: PlacementDecision;
  moments: Moment[];
  plan: PlacementPlan;
  today: Date;
};

export const NARRATION_ORDER: readonly NarrationId[] = [
  "strengths", "number", "placement", "skill-decoding", "skill-fluency", "skill-comprehension", "path", "plan", "ask",
] as const;

export const NARRATION_MAX_CHARS = 340;
export const REASSURANCE = "Below grade level does not mean failing. It means the practice needs to be aimed.";
export const ASK_CLOSE = "Everything on the Custom Journey is included with Readee Plus. You can start it now.";
/** On top of bank.FORBIDDEN_CHILD_WORDS. */
export const FORBIDDEN_NARRATION_WORDS = ["typical", "behind", "kid", "kids", "test", "quiz", "exam", "guaranteed"];
const NO_EXCLAMATION: ReadonlySet<NarrationId> = new Set<NarrationId>(["number", "placement", "skill-decoding", "skill-fluency", "skill-comprehension"]);

/** Every house-rule violation in one line; empty means clean. Shared by the tests and any QC script. */
export function narrationProblems(line: NarrationLine): string[] {
  const problems = new Set<string>(childCopyProblems(line.text));
  for (const w of FORBIDDEN_NARRATION_WORDS) {
    if (new RegExp(`\\b${w}\\b`, "i").test(line.text)) problems.add(`forbidden word "${w}"`);
  }
  if (/\bfailing\b/i.test(line.text.split(REASSURANCE).join(""))) problems.add('"failing" outside the reassurance sentence');
  if (line.text.length > NARRATION_MAX_CHARS) problems.add(`over ${NARRATION_MAX_CHARS} characters (${line.text.length})`);
  if (NO_EXCLAMATION.has(line.id) && line.text.includes("!")) problems.add("exclamation mark");
  return [...problems];
}

/* ------------------------------------------------------------- grammar */

type P = { subj: string; obj: string; poss: string; plural: boolean };
const PRONOUNS: Record<Pronoun, P> = {
  she: { subj: "she", obj: "her", poss: "her", plural: false },
  he: { subj: "he", obj: "him", poss: "his", plural: false },
  they: { subj: "they", obj: "them", poss: "their", plural: true },
};

const SMALL = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const num = (n: number): string => (Number.isInteger(n) && n >= 0 && n <= 10 ? SMALL[n] : String(n));
const cap = (s: string): string => (s.length ? s[0].toUpperCase() + s.slice(1) : s);
const lower = (s: string): string => (s.length ? s[0].toLowerCase() + s.slice(1) : s);
const pct = (x: number): number => Math.round(x * 100);

function joinAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** norms.ordinal handles 1-3 and "th" for the rest; percentiles need 21st, 22nd, 33rd, 101st. */
function pctOrdinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const rem10 = n % 10;
  const suffix = rem10 === 1 ? "st" : rem10 === 2 ? "nd" : rem10 === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}

/** "kindergarten" / "4th grade" (noun) */
const gradeNoun = (band: PlacedBand): string => (band === 0 ? "kindergarten" : `${ordinal(band)} grade`);

const PHASE: Record<GradePhase, string> = {
  early: "at the start of the year",
  mid: "in the middle of the year",
  late: "at the end of the year",
};

/* --------------------------------------------------------------- lines */

type Ctx = {
  name: string;
  p: P;
  /** verb agreement: v("reads", "read") */
  v: (singular: string, plural: string) => string;
  decision: PlacementDecision;
  moments: Moment[];
  plan: PlacementPlan;
  entry: PlacedBand;
  enrolled: PlacedBand;
};

function strengthsLine(c: Ctx): string {
  const { name, p, v, decision, moments } = c;
  const clauses: string[] = [];
  for (const m of moments) {
    if (clauses.length >= 2) break;
    switch (m.kind) {
      case "list-passed":
        clauses.push(
          m.misses === 0
            ? `${p.subj} read every word on the ${gradeAdjective(m.band)} list`
            : `${p.subj} read the ${gradeAdjective(m.band)} list with just ${num(m.misses)} ${m.misses === 1 ? "miss" : "misses"}`,
        );
        break;
      case "list-easy":
        clauses.push(`the ${gradeAdjective(m.band)} list was easy for ${p.obj}`);
        break;
      case "passage-accurate":
        clauses.push(`${p.subj} read the ${gradeAdjective(m.band)} story with ${pct(m.accuracy)} percent accuracy`);
        break;
      case "passage-expressive":
        clauses.push(`${p.subj} read the ${gradeAdjective(m.band)} story with expression`);
        break;
      case "comprehension":
        if (m.total > 0 && m.correct === m.total) clauses.push(`${p.subj} understood everything ${p.subj} read`);
        break;
      case "foundation": {
        const bar = m.skill === "nonsenseWords" ? 0.7 : 0.8;
        if (m.total > 0 && m.correct / m.total >= bar) {
          const what = m.skill === "letterSounds" ? "letter sounds" : m.skill === "blending" ? "blends" : "new words";
          clauses.push(`${p.subj} got ${num(m.correct)} of ${num(m.total)} ${what}`);
        }
        break;
      }
      default:
        break;
    }
  }
  if (clauses.length === 0) {
    // Fall back to the decision's strengths, re-pointing its "they" at the child.
    for (const s of decision.strengths.slice(0, 2)) {
      const fixed = s.replace(/\bthey read\b/g, `${p.subj} ${v("reads", "read")}`);
      clauses.push(p.plural ? `${p.subj} ${fixed.replace(/^(\w+)s\b/, "$1")}` : `${p.subj} ${fixed}`);
    }
  }
  if (clauses.length === 0) clauses.push(`${p.subj} gave every word a try, and that is exactly where reading starts`);
  const opener = `${name} did a great job today. Here is where ${p.subj} ${v("is", "are")}.`;
  return `${opener} ${cap(joinAnd(clauses))}.`;
}

function numberLine(c: Ctx): string {
  const { name, decision, enrolled } = c;
  const f = decision.fluency;
  if (f) {
    const season = decision.season;
    const parts: string[] = [];
    let unit = "";
    if (f.typicalForEnrolled !== null) {
      parts.push(`The ${season} benchmark for ${gradeNoun(enrolled)} is ${f.typicalForEnrolled} words per minute.`);
    } else {
      parts.push(`There is no ${season} benchmark for ${gradeNoun(enrolled)} yet, since timed reading is measured from winter on.`);
      unit = " words per minute";
    }
    let s = `${name} read ${f.wcpm}${unit}`;
    if (!f.onEnrolledPassage) s += ` on the ${gradeAdjective(f.band)} story`;
    if (f.percentile) s += `, about the ${pctOrdinal(f.percentile.percentile)} percentile${f.onEnrolledPassage ? "" : " for that grade"}`;
    if (f.gradeEquivalent) s += `, similar to the average ${ordinal(f.gradeEquivalent.grade)} grader ${PHASE[f.gradeEquivalent.phase]}`;
    parts.push(`${s}.`);
    return parts.join(" ");
  }
  const who = enrolled === 0 ? "Kindergartners" : "Beginning readers";
  let s = `${who} are not measured on timed passages yet, so there is no benchmark number today.`;
  const fo = decision.foundations;
  if (fo) {
    s += ` Instead we looked at the building blocks: ${name} knew ${num(fo.letterSounds.correct)} of ${num(fo.letterSounds.total)} letter sounds,`
      + ` blended ${num(fo.blending.correct)} of ${num(fo.blending.total)} words from their sounds,`
      + ` and sounded out ${num(fo.nonsenseWords.correct)} of ${num(fo.nonsenseWords.total)} new words.`;
  } else {
    s += ` Instead we looked at letter sounds, blending, and first words.`;
  }
  return s;
}

function placementLine(c: Ctx): string {
  const { p, decision } = c;
  const rel = decision.relative;
  let s = `That places ${p.obj} ${rel.label}.`;
  if (rel.delta > 0) s += ` ${REASSURANCE}`;
  else s += ` The path keeps ${p.obj} climbing from there.`;
  return s;
}

function decodingLine(c: Ctx): string {
  const { p, v, decision, moments } = c;
  const d = decision.decoding;
  if (d.level === null) {
    return `Decoding: ${p.subj} ${v("is", "are")} not reading words on ${p.poss} own yet, so letter sounds and blending come first.`;
  }
  const level = d.ceilingPassed ? "every list we had, up through 5th-grade words" : `${gradeAdjective(d.level)} words`;
  let s = `Decoding: ${p.subj} ${v("reads", "read")} ${level}.`;
  const next = d.nextTarget;
  if (next !== null) {
    const hard = moments.find((m): m is Extract<Moment, { kind: "list-hard" }> => m.kind === "list-hard" && m.band === next)
      ?? moments.find((m): m is Extract<Moment, { kind: "list-hard" }> => m.kind === "list-hard");
    const words = hard ? hard.words.slice(0, 3) : [];
    const nt = gradeAdjective(next);
    const where = words.length
      ? `${cap(joinAnd(words))} ${words.length === 1 ? "is" : "are"} where the ${nt} list got hard`
      : `The ${nt} list is where the words got hard`;
    const top = Math.max(c.entry, c.enrolled);
    if (next > 4) s += ` ${where}, and that is above the 4th-grade path, so word reading is a strength to build on.`;
    else if (next > top) s += ` ${where}, so ${nt} words are the step after this path.`;
    else s += ` ${where}, so ${nt} words come next.`;
  } else if (d.ceilingPassed) {
    s += ` Word reading is a strength to build on.`;
  } else {
    s += ` The next word list is the next step.`;
  }
  return s;
}

function fluencyLine(c: Ctx): string {
  const { p, v, decision, moments } = c;
  const f = decision.fluency;
  if (!f) {
    return `Fluency: no timed reading yet. It starts once ${p.subj} ${v("is", "are")} reading short sentences, and Luna will track it from the first one.`;
  }
  let s = `Fluency: ${f.wcpm} words per minute at ${pct(f.accuracy)} percent accuracy${f.onEnrolledPassage ? "" : ` on the ${gradeAdjective(f.band)} story`}.`;
  const kept = moments.some((m) => m.kind === "passage-kept-going");
  const expressive = moments.some((m) => m.kind === "passage-expressive");
  const slow = moments.some((m) => m.kind === "passage-slow");
  if (kept) s += ` In the story ${p.subj} slowed down but kept going.`;
  else if (expressive) s += ` ${cap(p.subj)} read with expression.`;
  else if (slow) s += ` ${cap(p.subj)} read carefully but slowly.`;
  const needSpeed = decision.needs.includes("reading speed and smoothness");
  const needAccuracy = decision.needs.includes("accurate reading");
  if (needSpeed && needAccuracy) s += ` Speed and accuracy both grow with daily reading at the right level.`;
  else if (needSpeed) s += ` Speed is the skill to build.`;
  else if (needAccuracy) s += ` Accuracy is the skill to build.`;
  else s += ` Pace and accuracy are both solid, so the path stretches ${p.obj} with harder stories.`;
  return s;
}

function comprehensionLine(c: Ctx): string {
  const { p, v, decision, moments, entry } = c;
  const comp = decision.comprehension;
  if (!comp) {
    return `Comprehension: no story questions yet at this stage. The ${gradeAdjective(entry)} story lessons build understanding by listening first.`;
  }
  const cited = moments.find((m): m is Extract<Moment, { kind: "comprehension" }> => m.kind === "comprehension");
  let s = `Comprehension: ${num(comp.correct)} of ${num(comp.total)}${cited ? ` on the ${gradeAdjective(cited.band)} story` : ""}.`;
  if (comp.pct >= 0.99) s += ` ${cap(p.subj)} ${v("understands", "understand")} what ${p.subj} ${v("reads", "read")}.`;
  else if (comp.pct <= 0.5) s += ` Understanding what ${p.subj} ${v("reads", "read")} is the skill to build, and the ${gradeAdjective(entry)} stories on the path are aimed at it.`;
  else s += ` That is a solid base, and the stories on the path build on it.`;
  return s;
}

function pathLine(c: Ctx): string {
  const { name, p, plan } = c;
  const steps = plan.steps;
  const start = steps.find((s) => s.kind === "start");
  const skipped = steps.filter((s) => s.kind === "skipped");
  const targets = steps.filter((s) => s.kind === "target");
  const luna = steps.find((s) => s.kind === "luna");
  const end = steps.find((s) => s.kind === "end");
  let s = start ? `${name}'s Custom Journey starts with ${start.title}` : `${name}'s Custom Journey starts today`;
  if (skipped.length) {
    const reasons = [...new Set(skipped.map((k) => k.reason))];
    s += `, skips ${joinAnd(skipped.map((k) => k.title))} since ${joinAnd(reasons)}`;
  }
  if (targets.length) s += `, targets ${joinAnd(targets.map((t) => t.title))} next`;
  if (luna) s += `, then reading speed with Luna listening to ${p.obj} every day`;
  if (end) s += `, and then ${lower(end.title)}`;
  return `${s}.`;
}

function milestoneFragment(label: string, month: string): string {
  const by = month === "this month" ? "this month" : `by ${month}`;
  if (label.startsWith("Reads like ")) return `to read like ${label.slice("Reads like ".length)} ${by}`;
  if (label.startsWith("Reaches ")) return `to reach ${label.slice("Reaches ".length)} ${by}`;
  if (label.startsWith("Reads ")) return `to read ${label.slice("Reads ".length)} ${by}`;
  return `for ${lower(label)} ${by}`;
}

function planLine(c: Ctx): string {
  const { name, p, v, plan } = c;
  const dose = `With ${plan.minutesPerDay} minutes a day, ${plan.daysPerWeek} days a week,`;
  if (!plan.milestones.length) return `${dose} ${name} keeps climbing, and Luna adjusts the pace as ${p.subj} ${v("goes", "go")}.`;
  const frags = plan.milestones.map((m) => milestoneFragment(m.label, m.month));
  return `${dose} ${name} is on track ${frags.join(", and ")}.`;
}

function askLine(c: Ctx): string {
  const { p, plan } = c;
  const fu = plan.firstUnit;
  const opener = fu
    ? `${cap(p.poss)} Custom Journey starts with ${fu.title}, ${fu.lessons} short ${fu.lessons === 1 ? "lesson" : "lessons"} on ${unitPhraseFor(fu.grade, fu.domain)}.`
    : `${cap(p.poss)} Custom Journey starts today.`;
  return `${opener} ${ASK_CLOSE}`;
}

export function narrate(input: NarrateInput): NarrationLine[] {
  const p = PRONOUNS[input.pronoun ?? "they"];
  const entry = input.decision.placedBand;
  const enrolled = Math.max(0, Math.min(4, entry + input.decision.relative.delta)) as PlacedBand;
  const c: Ctx = {
    name: input.childName.trim() || "Your child",
    p,
    v: (singular, plural) => (p.plural ? plural : singular),
    decision: input.decision,
    moments: input.moments,
    plan: input.plan,
    entry,
    enrolled,
  };
  const text: Record<NarrationId, string> = {
    "strengths": strengthsLine(c),
    "number": numberLine(c),
    "placement": placementLine(c),
    "skill-decoding": decodingLine(c),
    "skill-fluency": fluencyLine(c),
    "skill-comprehension": comprehensionLine(c),
    "path": pathLine(c),
    "plan": planLine(c),
    "ask": askLine(c),
  };
  return NARRATION_ORDER.map((id) => ({ id, text: text[id] }));
}

