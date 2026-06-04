/**
 * Anti-slop rubric for the interactive "fork" slides. Deterministic gate
 * that every generated fork must pass before it ships:
 *
 *   TERSE      on-screen prompt ≤6 words, each choice ≤3 words, anchor ≤6
 *   NO GIVEAWAY the correct answer never appears on screen (not in the
 *              prompt, the anchor, or — for comprehension — a printed passage)
 *   WELL-FORMED correct ∈ choices; ≥3 choices; no duplicate choices
 *   COACHING    affirmation names the answer + a reason; encouragement
 *              offers a retry ("try again") and never just gives the answer
 *   NO DUP TTS  no question/affirmation/encouragement script is verbatim
 *              identical to another lesson's (catches robotic copy-paste)
 *
 *   npx tsx scripts/qc-judge-interactive.ts            # grade all forks
 *   npx tsx scripts/qc-judge-interactive.ts --json     # machine-readable
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const JSON_OUT = process.argv.includes("--json");

const words = (s: string) => (s || "").trim().split(/\s+/).filter(Boolean);
const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

type Finding = { std: string; sev: "fail" | "warn"; rule: string; detail: string };

function gradeFork(l: any): Finding[] {
  const out: Finding[] = [];
  const slide = (l.slides ?? []).find((s: any) => s.type === "interactive");
  if (!slide) return out;
  const it = slide.interactive ?? {};
  const std = l.standardId;
  const add = (sev: "fail" | "warn", rule: string, detail: string) => out.push({ std, sev, rule, detail });

  const kind = it.kind ?? "tap";

  // TERSE (shared)
  if (words(it.prompt).length > 6) add("warn", "terse.prompt", `prompt is ${words(it.prompt).length} words: "${it.prompt}"`);
  if (it.anchor && (it.anchor as string).replace(/·/g, " ").trim().split(/\s+/).filter(Boolean).length > 6) add("warn", "terse.anchor", `anchor long: "${it.anchor}"`);

  if (kind === "match") {
    const L = it.leftItems ?? [], R = it.rightItems ?? [], P = it.correctPairs ?? {};
    if (L.length < 2) add("fail", "match.pairs", `only ${L.length} left items`);
    if (L.length !== R.length) add("fail", "match.balance", `${L.length} left vs ${R.length} right`);
    for (const k of L) if (!(k in P)) add("fail", "match.unpaired", `left "${k}" has no pair`);
    for (const v of Object.values(P)) if (!R.map(norm).includes(norm(v as string))) add("fail", "match.badtarget", `pair target "${v}" not in right column`);
    for (const c of [...L, ...R]) if (words(c).length > 3) add("warn", "terse.item", `item too long: "${c}"`);
  } else {
    // TAP
    const choices = (it.choices ?? []).map(norm);
    // Hyphen-preserving for dup detection — syllable splits like
    // "el-ep-hant" vs "el-e-phant" are DISTINCT answers, not duplicates.
    const choicesH = (it.choices ?? []).map((c: string) => (c || "").toLowerCase().replace(/[^a-z0-9-]/g, "").trim());
    for (const c of it.choices ?? []) if (words(c).length > 5) add("warn", "terse.choice", `choice too long: "${c}"`);
    if ((it.choices ?? []).length < 3) add("fail", "form.choices", `only ${(it.choices ?? []).length} choices`);
    if (new Set(choicesH).size !== choicesH.length) add("fail", "form.dupchoice", "duplicate choices");
    if (!choices.includes(norm(it.correct))) add("fail", "form.correct", `correct "${it.correct}" not in choices`);
    // NO GIVEAWAY — answer must not be visible on screen
    const onScreen = norm([it.prompt, it.anchor].filter(Boolean).join(" "));
    if (norm(it.correct) && onScreen.split(" ").includes(norm(it.correct))) add("fail", "giveaway.onscreen", `answer "${it.correct}" is printed on screen`);
    if (words(it.prompt).length > 8) add("fail", "giveaway.passage", `prompt looks like a printed passage (${words(it.prompt).length} words)`);
  }

  // COACHING dialogue
  const cs = it.correctScript ?? "", ws = it.wrongScript ?? "";
  if (!cs) add("fail", "coach.affirm", "missing affirmation script");
  else if (!norm(cs).includes(norm(it.correct))) add("warn", "coach.affirmname", "affirmation doesn't name the answer");
  if (!ws) add("fail", "coach.encourage", "missing encouragement script");
  else {
    if (!/try again|again/i.test(ws)) add("warn", "coach.retry", "encouragement doesn't invite a retry");
    // Real spoiler = the answer PHRASE appears as a whole word in the
    // encouragement. Ignore ≤2-char answers ("is", "it") — they're
    // stopwords that recur incidentally, not giveaways.
    const ca = norm(it.correct);
    if (ca && ca.length > 2 && new RegExp(`\\b${ca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(norm(ws)))
      add("fail", "coach.spoiler", "encouragement gives away the answer");
  }

  // question audio present
  const q = slide.steps?.[0];
  if (!q?.ttsScript) add("fail", "audio.question", "missing question audio script");
  if (!q?.audioFile) add("fail", "audio.qfile", "missing question audio file");
  return out;
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const forks = lessons.filter((l) => (l.slides ?? []).some((s: any) => s.type === "interactive"));

  const all: Finding[] = [];
  for (const l of forks) all.push(...gradeFork(l));

  // CROSS-LESSON DUP TTS
  const scriptMap = new Map<string, string[]>();
  for (const l of forks) {
    const slide = (l.slides ?? []).find((s: any) => s.type === "interactive");
    const it = slide?.interactive ?? {};
    for (const [label, txt] of [["question", slide?.steps?.[0]?.ttsScript], ["correct", it.correctScript], ["wrong", it.wrongScript]] as const) {
      if (!txt) continue;
      const k = norm(txt);
      scriptMap.set(k, [...(scriptMap.get(k) ?? []), `${l.standardId}:${label}`]);
    }
  }
  for (const [, owners] of scriptMap) {
    if (owners.length > 1) all.push({ std: owners.join(" / "), sev: "fail", rule: "dup.tts", detail: `identical TTS across: ${owners.join(", ")}` });
  }

  if (JSON_OUT) { console.log(JSON.stringify(all, null, 2)); return; }

  const fails = all.filter((f) => f.sev === "fail");
  const warns = all.filter((f) => f.sev === "warn");
  console.log(`\n═══ INTERACTIVE FORK RUBRIC — ${forks.length} forks graded ═══`);
  console.log(`   ${fails.length} FAIL · ${warns.length} warn\n`);
  for (const std of forks.map((l) => l.standardId)) {
    const mine = all.filter((f) => f.std === std || f.std.includes(std));
    const mark = mine.some((f) => f.sev === "fail") ? "✗" : mine.length ? "⚠" : "✓";
    console.log(`  ${mark} ${std}`);
    for (const f of mine) console.log(`        [${f.sev}] ${f.rule}: ${f.detail}`);
  }
  console.log(fails.length ? `\n✗ ${fails.length} blocking issue(s) — fix before scaling.` : `\n✓ all forks pass the deterministic gate.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
