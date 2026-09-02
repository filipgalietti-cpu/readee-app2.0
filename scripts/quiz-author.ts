/**
 * QUIZ FACTORY — authors a banded quiz FROM a finished lesson.
 *
 *   npx tsx scripts/quiz-author.ts --lesson=key-details
 *
 * Reads the lesson's actual scenes/words/images (perfect lesson↔quiz alignment,
 * near-zero new assets) and drafts: ~6 CORE questions (on-grade, about the
 * exact lesson content), 4 EASIER (below-grade support: yes/no or 2-choice,
 * picture crutches), 4 HARDER (SAME concept at the NEXT GRADE level: production
 * over recognition, no answer-option pictures). Every question carries a
 * no-spoiler hint (wrong #1) and a "That one was tricky!" explanation (wrong #2).
 *
 * RULES ENCODED (from the Rory correction rounds — do not relearn these):
 *  • narration NEVER enumerates the answer options (tiles are shuffled; the
 *    engine reads choices aloud in display order)
 *  • concise TEACHER voice: no hype filler ("Big kid challenge!"), no
 *    meta-commentary ("no picture helpers"), no em-dashes
 *  • challenge/no-reveal: prompts and narration never contain the answer
 *  • production speak questions list MANY acceptable words in `accept`
 *  • prompt-word images are fine; answer-option images only on easier/core
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import { GoogleGenAI } from "@google/genai";
import { LESSONS } from "../app/data/lessons-v2";

const arg = (k: string) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? "").split("=")[1];
const LESSON_ID = arg("lesson");
const GRADE = arg("grade") || "Kindergarten";
const LADDER: Record<string, { below: string; next: string; opts: string }> = {
  Kindergarten: { below: "pre-K support", next: "Grade 1", opts: "2 options for easier, 3 for core/harder" },
  "1st Grade": { below: "Kindergarten support", next: "Grade 2", opts: "2-3 options with picture support for easier, 3-4 TEXT-LEANING options for core/harder (G1 kids read; fewer picture crutches on core is the felt step up from K)" },
  "2nd Grade": { below: "Grade 1 support", next: "Grade 3", opts: "2-3 options with picture support for easier, 4 TEXT options with plausible parallel-length distractors for core/harder (G2 kids discriminate between close answers; explanation beats over recognition)" },
  "3rd Grade": { below: "Grade 2 support", next: "Grade 4", opts: "3 options for easier (2 only when the scaffold is genuinely easier work, e.g. picture-anchored either/or), 4 TEXT options with plausible parallel-length distractors for core/harder; harder = Grade 4 transfer whose new tool is TAUGHT in the question stimulus first (Greek/Latin roots, theme, firsthand vs secondhand), then applied" },
};
const L4D = LADDER[GRADE] ?? LADDER["1st Grade"];
if (!LESSON_ID || !LESSONS[LESSON_ID]) {
  console.error(`Usage: npx tsx scripts/quiz-author.ts --lesson=<id> (known: ${Object.keys(LESSONS).join(", ")})`);
  process.exit(1);
}
const { lesson, images } = LESSONS[LESSON_ID];
const QUIZ_ID = `${LESSON_ID}-quiz`;

// distill the lesson for the prompt: scenes' scripts + interaction words + available images
const lessonDigest = lesson.scenes
  .map((s) => {
    const i = s.interaction;
    let words = "";
    if (i) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ix = i as any;
      const labels = [
        ...(ix.items?.map((it: { label?: string; word?: string }) => it.label ?? it.word) ?? []),
        ...(ix.options?.map((o: { label: string }) => o.label) ?? []),
        ix.base, ix.result, ix.text,
      ].filter(Boolean);
      words = labels.length ? ` [words: ${labels.join(", ")}]` : "";
    }
    return `- (${s.purpose}) ${s.narration?.script ?? s.prompt}${words}`;
  })
  .join("\n");
const availableImages = Object.keys(images).join(", ");

const PROMPT = `You are Jennifer, a certified K-3 reading specialist, writing the POST-LESSON QUIZ for a ${GRADE} lesson the child JUST played. Output STRICT JSON only.

THE LESSON (title "${lesson.title}", standard ${lesson.standard}, objective "${lesson.objective}"):
${lessonDigest}

Available images (word → picture already generated): ${availableImages}
Available word audio: every word listed in the lesson scenes above.

Write 14 questions about THIS EXACT lesson (same characters, same words, same story), in three bands:
- 6 "core": on-grade checks of the lesson objective. Mixed formats.
- 4 "easier": below-grade SUPPORT (${L4D.below}). 2-choice with picture support. Softer asks. NEVER yes/no filler.
- 4 "harder": the SAME concept at the NEXT GRADE level (${L4D.next}): production over recognition (child SAYS or BUILDS an answer), multi-step, no answer-option images. Still about this lesson's concept.

HARD RULES (violations rejected):
- NEVER use an em-dash. Concise TEACHER voice: no hype filler, no "big kid challenge", no meta-commentary about the quiz mechanics or missing pictures. A teacher gives the instruction and stops.
- narration NEVER lists/enumerates the answer options (they are shuffled on screen and read aloud automatically). Ask the question; do not name the choices.
- The answer must NEVER appear in the prompt or narration. EXACTLY ONE option may be correct: never include a distractor that is also true in the lesson.
- prompt = one short line (max 9 words). narration = 1-3 short spoken sentences.
- Every question gets: hint (subtle, no-spoiler, played after the first wrong try) and explain (starts "That one was tricky!" then explains the correct answer simply).
- choose: ${L4D.opts}. Option words must be lesson words or grade-simple words; only use image:true when that word is in the available images list.
- sort: 2 buckets (3 for harder), 4-6 single-word items. Bucket names must be 1-2 words.
- speak (production): "accept" = 3-8 acceptable SINGLE words, each 3+ letters, no articles or stopwords.
- Use each format at least once across the quiz: choose, sort, speak.

JSON SHAPE:
{ "questions": [ {
  "id": string (kebab, prefix e-/c-/h- by band), "band": "easier"|"core"|"harder",
  "difficulty": number (1-5 within band ordering),
  "prompt": string, "narration": string,
  "promptImage": string|null (an available-images word to SHOW with the question; never the answer),
  "hint": string, "explain": string,
  "interaction":
    {"type":"choose","options":[{"word":string,"image":boolean}],"correctWord":string,"coachWrong":string} |
    {"type":"sort","buckets":[string],"items":[{"word":string,"bucket":string}],"coachWrong":string} |
    {"type":"speak","accept":[string],"coachWrong":string}
} ] }
STRICT JSON only.`;

// Coerce first: Gemini sometimes emits bare numbers (years, counts) as words.
const U = (w: string | number) => { const s = String(w); return s.length === 1 ? s : s.toUpperCase(); };
const L = (w: string | number) => String(w).toLowerCase();
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log(`\nQUIZ FACTORY · drafting ${QUIZ_ID} from lesson "${lesson.title}"…`);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: PROMPT,
    config: { responseMimeType: "application/json", temperature: 0.6 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let d: any;
  try {
    d = JSON.parse(res.text ?? "");
  } catch {
    await fs.writeFile("scripts/factory-quiz-error.json", res.text ?? "");
    console.error("Draft was not valid JSON → scripts/factory-quiz-error.json");
    process.exit(1);
  }

  // sanitize: strip stars/em-dashes from all spoken strings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const q of d.questions) {
    for (const k of ["narration", "hint", "explain", "prompt"]) if (q[k]) q[k] = String(q[k]).replace(/\*\*/g, "").replace(/—/g, ",");
    if (q.interaction?.coachWrong) q.interaction.coachWrong = String(q.interaction.coachWrong).replace(/\*\*/g, "").replace(/—/g, ",");
  }

  const A = `\`\${Q}/`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const genQ = (q: any): string => {
    const img = (w: string, flag: boolean) => (flag && images[L(w)] ? `, image: IMG(${j(L(w))})` : "");
    let inter = "";
    const i = q.interaction;
    if (i.type === "choose") {
      const opts = i.options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((o: any) => `{ id: ${j(L(o.word))}, label: ${j(U(o.word))}, audio: W(${j(L(o.word))})${img(o.word, o.image && q.band !== "harder")} }`)
        .join(", ");
      inter = `interaction: { type: "choose", options: [${opts}], correctId: ${j(L(i.correctWord))}, coachWrong: ${j(i.coachWrong)} },`;
    } else if (i.type === "sort") {
      const items = i.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((it: any) => `{ label: ${j(U(it.word))}, bucket: ${j(it.bucket)}, audio: W(${j(L(it.word))}) }`)
        .join(", ");
      // bucket clips are quiz-local kebab files; the quiz-tts missing-audio pass synths them
      const bAudio = `bucketAudio: { ${i.buckets.map((b: string) => `${j(b)}: \`\${Q}/b-${L(b).replace(/\s+/g, "-")}.mp3\``).join(", ")} },`;
      inter = `interaction: { type: "sort", buckets: ${j(i.buckets)}, ${bAudio} items: [${items}], coachWrong: ${j(i.coachWrong)} },`;
    } else if (i.type === "speak") {
      inter = `interaction: { type: "speak", text: ${j(i.accept.join(" "))} },`;
    }
    const parts = [
      `      id: ${j(q.id)},`,
      `      band: ${j(q.band)},`,
      `      difficulty: ${q.difficulty},`,
      `      prompt: ${j(q.prompt)},`,
      q.promptImage && images[L(q.promptImage)] ? `      image: IMG(${j(L(q.promptImage))}),` : null,
      `      narration: { audio: ${A}${q.id}.mp3\`, script: ${j(q.narration)} },`,
      `      hint: { audio: ${A}${q.id}-hint.mp3\`, script: ${j(q.hint)} },`,
      `      explain: { audio: ${A}${q.id}-explain.mp3\`, script: ${j(q.explain)} },`,
      `      ${inter}`,
    ].filter(Boolean);
    return `    {\n${parts.join("\n")}\n    },`;
  };

  const varName = QUIZ_ID.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
  const ts = `import type { QuizDef } from "@/lib/lesson-engine/quiz";

// ${lesson.title} QUIZ (${lesson.standard}) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. Reuses the lesson's word
// clips + images. Bands: easier(support) / core(on-grade) / harder(next-grade).

const Q = "/audio/quizzes-v2/${QUIZ_ID}";
const W = (w: string) => \`/audio/lessons-v2/${LESSON_ID}/words/\${w.toLowerCase()}.mp3\`;
const IMG = (w: string) => \`/images/lessons-v2/${LESSON_ID}/\${w.toLowerCase()}.png\`;

export const ${varName}: QuizDef = {
  id: ${j(QUIZ_ID)},
  lessonId: ${j(LESSON_ID)},
  title: ${j(`${lesson.title} Quiz`)},
  standard: ${j(lesson.standard)},
  askCount: 7,
  adaptive: true,
  questions: [
${d.questions.map(genQ).join("\n")}
  ],
};
`;
  await fs.writeFile(`app/data/quizzes-v2/${QUIZ_ID}.ts`, ts);

  // register in the quiz manifest
  const idxPath = "app/data/quizzes-v2/index.ts";
  let idx = await fs.readFile(idxPath, "utf-8");
  if (!idx.includes(`"${QUIZ_ID}"`)) {
    idx = idx.replace('export const QUIZZES', `import { ${varName} } from "./${QUIZ_ID}";\nexport const QUIZZES`);
    idx = idx.replace("};\n", `  "${QUIZ_ID}": ${varName},\n};\n`);
    await fs.writeFile(idxPath, idx);
  }

  // demo route
  await fs.mkdir(`app/demo/quiz/${LESSON_ID}`, { recursive: true });
  await fs.writeFile(
    `app/demo/quiz/${LESSON_ID}/page.tsx`,
    `"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { ${varName} } from "@/app/data/quizzes-v2/${QUIZ_ID}";

export default function Page() {
  return <QuizRunner quiz={${varName}} />;
}
`,
  );

  const bands = { easier: 0, core: 0, harder: 0 } as Record<string, number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const q of d.questions) bands[q.band] = (bands[q.band] ?? 0) + 1;
  console.log(`✓ ${d.questions.length} questions (easier ${bands.easier} / core ${bands.core} / harder ${bands.harder})`);
  console.log(`✓ registered · demo at /demo/quiz/${LESSON_ID}`);
  console.log(`NEXT: review → npx tsx scripts/quiz-tts.ts --quiz=${QUIZ_ID}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
