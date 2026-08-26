/**
 * LESSON FACTORY v1 — drafts a complete engine lesson from a coverage-map row.
 *
 *   npx tsx scripts/lesson-author.ts --id=rhyme-time --standard=RF.K.2a \
 *     --archetype=phonics --title="Rhyme Time" \
 *     --concept="recognize and produce rhyming words"
 *
 * Pipeline: Gemini drafts a semantic lesson JSON (every authoring rule we've
 * learned is encoded in the prompt) → codegen writes the pure-data lesson file,
 * registers it in the manifest, creates the demo route → then run the asset
 * pipelines + lesson-lint. A human plays the FINISHED lesson (exception review),
 * never audits slides.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { GoogleGenAI } from "@google/genai";

const arg = (k: string) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? "").split("=").slice(1).join("=");
const ID = arg("id");
const STANDARD = arg("standard");
const ARCHETYPE = arg("archetype") || "phonics";
const TITLE = arg("title") || ID;
const CONCEPT = arg("concept");
const GRADE = arg("grade") || "Kindergarten"; // "Kindergarten" | "1st Grade" | ...
if (!ID || !STANDARD || !CONCEPT) {
  console.error("Usage: --id=<kebab> --standard=<CCSS> --archetype=<a> --title=<t> --concept=<what to teach> [--grade=<Kindergarten|1st Grade|...>]");
  process.exit(1);
}

// Grade-calibrated authoring guidance. Core = ON GRADE; the felt difficulty
// step between grades is deliberate (Filip: "we want to feel that distinction").
const GRADE_NOTES: Record<string, string> = {
  Kindergarten: `- Kindergarteners CANNOT read. All teaching lives in the spoken "narration". On-screen "prompt" is one short line (max 9 words).
- Choose beats use 2-3 options with picture support.`,
  "1st Grade": `- 1st graders are EMERGING READERS: they read short sentences themselves. Narration still teaches, but the child READS the on-screen text (prompts up to 12 words; read-along passages 3-5 sentences with G1 phonics: digraphs sh/ch/th/wh, consonant blends, long vowels with silent e and vowel teams, two-syllable words).
- MORE PRODUCTION than Kindergarten: at least 2 speak beats per lesson (read a sentence aloud, answer aloud); the child does the reading, the narrator does NOT pre-read text the child should read.
- Choose beats use 3-4 options; picture support on easier/teaching beats only, core checks lean on TEXT (that is the felt step up from K).
- Interaction items may be words OR short phrases (2-3 words) when the skill needs it; keep them decodable at G1.
- Passages and questions are a notch richer: central message, describe characters/settings/events, compare, explain WHY with evidence.`,
  "2nd Grade": `- 2nd graders are REAL READERS: they read multi-sentence passages silently and aloud. Prompts up to 14 words; read-along passages 5-8 sentences with G2 phonics (additional vowel teams oo/ou/ow/oi/oy/aw, r-controlled ar/or/er, two-syllable words, common prefixes/suffixes); stories may span 4-5 pages and feel like a short chapter (fables and folktales welcome).
- HEAVY PRODUCTION: at least 2 speak beats per lesson; the child reads passages the narrator does NOT pre-read; answers are often explained aloud ("tell WHY"), not just tapped.
- Choose beats use 3-4 TEXT options; pictures only as stimulus/decoration, never crutches on core checks. Distractors must be plausible and parallel-length (the felt step up from G1: options require real discrimination, not elimination).
- Interaction items may be phrases or full sentences (≤28-char tiles); multi-paragraph structure appears: "this paragraph is mostly about ___".
- Questions push explanation and inference: how a character RESPONDS to events, morals of fables, connections between steps/events, paragraph focus vs whole-text topic.`,
};
const GRADE_RULES = GRADE_NOTES[GRADE] ?? GRADE_NOTES["1st Grade"];

const PROMPT = `You are Jennifer, a certified K-3 reading specialist, designing an interactive ${GRADE} lesson for the Readee app. Output STRICT JSON only (no markdown).

LESSON: standard ${STANDARD}, archetype "${ARCHETYPE}", concept: "${CONCEPT}". Title: "${TITLE}".

The lesson is a sequence of 9-12 SCENES following gradual release: hook (look/listen) → model (watch me) → guided (your turn, with coaching) → apply (you try) → challenge (all by yourself) → celebrate. Scenes must form a CONNECTED story arc: each narration references what just happened and hands off to what's next. One playful framing (a character, a game, a mission) carries the whole lesson.

HARD RULES (violations get rejected):
- NEVER use an em-dash anywhere. Use periods, commas, or exclamation points.
${GRADE_RULES}
- Narrations are SHORT (2-4 short sentences), warm teacher voice, and always tell the child what to do ("Tap each tile to hear it").
- Scene 1 must be a "listen" or "read-along" hook. NEVER open with a question.
- The "challenge" scene must NOT name its answer in prompt or narration.
- Every choose option and sequence item should have image true, and every image-true word MUST have an entry in "images" (a vivid one-line illustration subject, bright 2D cartoon style, single object, no text).
- The final scene is purpose "celebrate", gate "none", no interaction, and its narration restates the rule warmly.

JSON SHAPE (exactly this):
{
 "title": string, "objective": string (one kid-facing sentence), "concepts": [string],
 "completion": { "script": string (3 warm spoken sentences recapping what they learned), "title": string, "body": string },
 "images": { "<word>": "<illustration subject>" },
 "scenes": [ {
   "id": string (kebab), "purpose": "hook"|"model"|"guided"|"apply"|"challenge"|"celebrate",
   "layout": "split"|"full" (full for wide activities like sort/sequence; split otherwise),
   "gate": "interaction"|"none" (none only for listen hooks and celebrate),
   "prompt": string, "narration": string,
   "sceneImage": string|null (an images key to illustrate the scene, for split scenes without interaction),
   "fx": { "text": string (mark key words with **stars**), "effect": "underline"|"pop-words"|"burst"|"glow"|"bounce"|"cross-out"|"rainbow"|"wave"|"stamp"|"fireworks"|"rocket"|"magic"|"bubbles"|"jelly"|"balloon"|"lightning" } | null. EVERY scene without an interaction SHOULD have fx (its sentence becomes the animated visual). Match effect to MEANING: underline = the rule's key word, cross-out = not/never teaching, pop-words = rule revealed beat by beat, burst/rainbow/fireworks/confetti = celebration (fireworks/rocket ONLY on the celebrate scene, one per lesson), magic = a word transforming, bubbles = light playful reveals, jelly/balloon = bouncy fun words, lightning = a POWER word or surprise, glow = a sound to notice. Never decorate randomly.,
   "interaction": null |
     {"type":"listen","items":[{"word":string,"image":boolean}]} |
     {"type":"choose","options":[{"word":string,"image":boolean}],"correctWord":string,"coachWrong":string} |
     {"type":"sort","buckets":[string,string],"items":[{"word":string,"bucket":string}],"coachWrong":string} |
     {"type":"sequence","items":[{"key":string,"word":string,"image":boolean}],"order":[string],"coachWrong":string} |
     {"type":"speak","text":string} |
     {"type":"read-along","text":string}
 } ]
}

Design the best possible "${CONCEPT}" lesson now. STRICT JSON only.`;

// ── codegen helpers ──────────────────────────────────────────────
const U = (w: string) => (w.length === 1 ? w : w.toUpperCase()); // single letters keep case (B vs b)
const L = (w: string) => w.toLowerCase();
const j = (v: unknown) => JSON.stringify(v);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function genInteraction(sceneId: string, i: any, images: Record<string, string>): string {
  if (!i) return "";
  const img = (w: string, flag: boolean) => (flag && images[L(w)] ? `, image: IMG(${j(L(w))})` : "");
  if (i.type === "listen") {
    const items = i.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => `{ label: ${j(U(it.word))}, audio: W(${j(it.word)})${img(it.word, it.image)} }`)
      .join(", ");
    return `interaction: { type: "listen", items: [${items}] },`;
  }
  if (i.type === "choose") {
    const opts = i.options
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o: any) => `{ id: ${j(L(o.word))}, label: ${j(U(o.word))}, audio: W(${j(o.word)})${img(o.word, o.image)} }`)
      .join(", ");
    return `interaction: { type: "choose", options: [${opts}], correctId: ${j(L(i.correctWord))}, coachWrong: ${j(i.coachWrong ?? "Try again!")} },`;
  }
  if (i.type === "sort") {
    const items = i.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => `{ label: ${j(U(it.word))}, bucket: ${j(it.bucket)}, audio: W(${j(it.word)}) }`)
      .join(", ");
    return `interaction: { type: "sort", buckets: ${j(i.buckets)}, items: [${items}], coachWrong: ${j(i.coachWrong ?? "Try again!")} },`;
  }
  if (i.type === "sequence") {
    const items = i.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => `{ id: ${j(it.key)}, label: ${j(U(it.word))}, audio: W(${j(it.word)})${img(it.word, it.image)} }`)
      .join(", ");
    return `interaction: { type: "sequence", items: [${items}], order: ${j(i.order)}, coachWrong: ${j(i.coachWrong ?? "Try again!")} },`;
  }
  if (i.type === "speak") return `interaction: { type: "speak", text: ${j(i.text)} },`;
  if (i.type === "read-along")
    return `interaction: { type: "read-along", text: ${j(i.text)}, audio: A(${j(`${sceneId}-sentence`)}) },`;
  return "";
}

async function main() {
  console.log(`\nFACTORY · drafting "${TITLE}" (${STANDARD}, ${ARCHETYPE})…`);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: PROMPT,
    config: { responseMimeType: "application/json", temperature: 0.7 },
  });
  const raw = res.text ?? "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let d: any;
  try {
    d = JSON.parse(raw);
  } catch {
    console.error("Draft was not valid JSON. Raw saved to scripts/factory-draft-error.json");
    await fs.writeFile("scripts/factory-draft-error.json", raw);
    process.exit(1);
  }

  // sanitize: image keys lowercase; stars never reach spoken/coach strings
  d.images = Object.fromEntries(Object.entries(d.images ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const sc of d.scenes ?? []) {
    if (sc.narration) sc.narration = String(sc.narration).replace(/\*\*/g, "");
    if (sc.interaction?.coachWrong) sc.interaction.coachWrong = String(sc.interaction.coachWrong).replace(/\*\*/g, "");
  }

  // quick guardrails the prompt asked for
  const allText = JSON.stringify(d);
  if (allText.includes("—")) console.warn("⚠ draft contains em-dash; will need judge fix");

  const varName = ID.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scenes = d.scenes.map((s: any) => {
    const parts = [
      `      id: ${j(s.id)},`,
      `      purpose: ${j(s.purpose)},`,
      s.layout === "full" ? `      layout: "full",` : null,
      `      gate: ${j(s.gate)},`,
      `      prompt: ${j(s.prompt)},`,
      s.sceneImage && d.images[L(s.sceneImage)] ? `      image: IMG(${j(L(s.sceneImage))}),` : null,
      s.fx ? `      fx: ${j(s.fx)},` : null,
      `      narration: { audio: A(${j(s.id)}), script: ${j(s.narration)} },`,
      s.interaction ? `      ${genInteraction(s.id, s.interaction, d.images)}` : null,
    ].filter(Boolean);
    return `    {\n${parts.join("\n")}\n    },`;
  });

  const ts = `import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./${ID}-timings.json";

// ${d.title} (${STANDARD}) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=${ID}

const A = (id: string) => \`/audio/lessons-v2/${ID}/\${id}.mp3\`;
const W = (w: string) => \`/audio/lessons-v2/${ID}/words/\${w.toLowerCase()}.mp3\`;
const IMG = (w: string) => \`/images/lessons-v2/${ID}/\${w.toLowerCase()}.png\`;

export const ${varName}Images: Record<string, string> = ${JSON.stringify(d.images, null, 2)};

export const ${varName}: LessonDef = {
  id: ${j(ID)},
  title: ${j(d.title)},
  grade: "${GRADE}",
  standard: ${j(STANDARD)},
  archetype: ${j(ARCHETYPE)},
  objective: ${j(d.objective)},
  concepts: ${j(d.concepts)},
  timings: timings as LessonDef["timings"],
  completion: ${JSON.stringify(d.completion, null, 2).replace(/^/gm, "  ").trim()},
  scenes: [
${scenes.join("\n")}
  ],
};
`;

  await fs.writeFile(`app/data/lessons-v2/${ID}.ts`, ts);
  await fs.writeFile(`app/data/lessons-v2/${ID}-timings.json`, "{}\n");

  // register in the manifest
  const idxPath = "app/data/lessons-v2/index.ts";
  let idx = await fs.readFile(idxPath, "utf-8");
  if (!idx.includes(`"${ID}"`)) {
    idx = idx.replace(
      'export interface LessonEntry {',
      `import { ${varName}, ${varName}Images } from "./${ID}";\n\nexport interface LessonEntry {`,
    );
    idx = idx.replace("};\n", `  "${ID}": { lesson: ${varName}, images: ${varName}Images },\n};\n`);
    await fs.writeFile(idxPath, idx);
  }

  // demo route
  await fs.mkdir(`app/demo/${ID}`, { recursive: true });
  await fs.writeFile(
    `app/demo/${ID}/page.tsx`,
    `"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { ${varName} } from "@/app/data/lessons-v2/${ID}";

// FACTORY-AUTHORED lesson · /demo/${ID}
export default function Page() {
  return <LessonRunner lesson={${varName}} />;
}
`,
  );

  console.log(`✓ drafted ${d.scenes.length} scenes → app/data/lessons-v2/${ID}.ts`);
  console.log(`✓ registered in manifest · demo at /demo/${ID}`);
  console.log(`\nNEXT (judge, then assets):\n  1. Claude/human reviews the lesson file`);
  console.log(`  2. npx tsx scripts/lesson-tts.ts --lesson=${ID}`);
  console.log(`  3. python3 scripts/lesson-timings.py ${ID}`);
  console.log(`  4. npx tsx scripts/lesson-images.ts --lesson=${ID}`);
  console.log(`  5. npx tsx scripts/lesson-lint.ts --lesson=${ID}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
