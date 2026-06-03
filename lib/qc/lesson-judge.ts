/**
 * Lesson judge — the AI reviewer that replaces the human audit.
 *
 * The detector (spec-checks.ts) deterministically guarantees no
 * transcription / crammed / verbose pills. But it can't judge whether an
 * anchor is GOOD — whether it captures the audio's idea, whether story
 * text landed in a box vs went blank, whether a slide feels empty. That
 * subjective "is this canon-quality?" call is what kept Filip auditing
 * one-by-one.
 *
 * This judge reads a candidate lesson (its TTS + on-screen anchors) next
 * to the nearest golden canon lesson and scores it 1-5 with specific
 * issues. Lessons that score < 4 are the short EXCEPTION list a human
 * looks at; everything 4-5 ships without review.
 */

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export type JudgeResult =
  | { ok: true; score: number; passes: boolean; summary: string; issues: Array<{ slide: number; issue: string }> }
  | { ok: false; error: string };

const SYSTEM = `You are a senior K-4 reading specialist grading a lesson against the GOLDEN rulebook. You receive a CANON golden lesson (the bar) and a CANDIDATE lesson, each as slides → steps with the spoken audio and what's on screen ("pill: X", "story-box: X", "pills: [A,B,C]", "Q→A: ...", "table-row: ...", or "audio-only").

Grade the CANDIDATE against these rules (the ones visible in text — images/audio/timing are graded elsewhere, do NOT penalize for them):
  1. Screen ANCHORS the audio, never transcribes it — one short idea per pill, in the audio's REAL words (not abstract summaries like "Story Elements" when the audio says "Characters, setting, events").
  2. Terse: pill ≤5 words, question ≤4, answer ≤5.
  3. Narrative/example STORY text sits in a story-box, never a plain pill and never left blank.
  4. A structured SET of items (roots/prefixes/vowel teams) should be a table, not prose pills.
  5. No slide is empty — every teaching beat that names a concept or reads story text shows something; only pure framing/transition/closing steps are audio-only.
  6. The example is "Let's Try One": framing → focal anchor → terse Q→A → closing.
  7. No word repeats across slides (the example word ≠ a teach word). Q2 must not contain Q1's answer.
  8. It teaches the EXACT standard, with no filler steps.

Score 1-5:
  5 = indistinguishable from golden.
  4 = solid, minor nits only — SHIPS without human review.
  3 = noticeable problems (awkward/wrong anchor, story text blank or as a pill, a beat that should anchor but is blank, anchor doesn't match the audio, word repeat).
  2 = several problems. 1 = broken.
Score 4-5 = passes. Score ≤3 = fails (needs a human).

List concrete issues with the slide number. Be specific. Output JSON only.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    passes: { type: Type.BOOLEAN },
    summary: { type: Type.STRING },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slide: { type: Type.INTEGER },
          issue: { type: Type.STRING },
        },
        required: ["slide", "issue"],
      },
    },
  },
  required: ["score", "passes", "summary", "issues"],
};

/** Compact, judge-friendly view of a lesson: audio + what's on screen. */
function describeLesson(lesson: any): string {
  const lines: string[] = [`TITLE: ${lesson.title} (${lesson.grade}) — standard ${lesson.standardId}`];
  for (const s of lesson.slides ?? []) {
    if (s.type === "mcq") continue;
    lines.push(`[${s.type}] slide ${s.slide} "${s.heading ?? ""}"`);
    for (const st of s.steps ?? []) {
      let onscreen = "audio-only";
      if (st.displayStyle === "passage" && st.displayText) onscreen = `story-box: "${st.displayText}"`;
      else if (typeof st.displayText === "string") onscreen = `pill: "${st.displayText}"`;
      else if (Array.isArray(st.displayParts)) {
        const isQA = st.displayParts.length === 2 && String(st.displayParts[0]?.text).trim().endsWith("?");
        onscreen = isQA
          ? `Q→A: "${st.displayParts[0].text}" / "${st.displayParts[1].text}"`
          : `pills: [${st.displayParts.map((p: any) => p.text).join(", ")}]`;
      } else if (st.displayTableRow) onscreen = `table-row: ${st.displayTableRow.label} = ${st.displayTableRow.value}`;
      lines.push(`   ${st.sub}: audio="${st.ttsScript ?? ""}"  →  ${onscreen}`);
    }
  }
  return lines.join("\n");
}

export async function judgeLesson(candidate: any, canon: any): Promise<JudgeResult> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AI not configured." };
  }

  const userMsg = [
    "CANON GOLDEN LESSON (the bar):",
    describeLesson(canon),
    "",
    "CANDIDATE LESSON (grade this):",
    describeLesson(candidate),
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.2,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}");
    const score = Number(parsed.score) || 0;
    return {
      ok: true,
      score,
      passes: score >= 4,
      summary: String(parsed.summary ?? ""),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "judge call failed" };
  }
}
