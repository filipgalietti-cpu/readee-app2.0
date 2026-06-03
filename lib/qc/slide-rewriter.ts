/**
 * Transcript-slide rewriter — the root-cause FIX for the non-canon
 * catalog (the detector in spec-checks.ts only FLAGS).
 *
 * The catalog's disease: teach/intro/tip slides put the spoken sentence
 * on screen ("Characters are the who of the story.") instead of a terse
 * anchor ("Character = who"). The audio is FINE — only the on-screen
 * pill is wrong. So this is a DATA-ONLY fix: rewrite each step's
 * displayText/displayParts into a short anchor and KEEP the ttsScript +
 * audioFile + audioRegenAt untouched. No TTS regen, no image regen, no
 * uploads — the audio already says the right thing.
 *
 * Each rewritten step becomes one terse `displayText` anchor (≤5 words,
 * canon style — "Who?", "3 Magic Questions", "Character = who") shown at
 * displayDelay 0, or audio-only (no anchor) for pure framing lines. The
 * result is validated against the detector itself, so the rewriter
 * cannot reintroduce a transcript/crammed/verbose pill.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { checkTranscriptPill, checkCrammedPill, checkQaTerseness, checkFragmentedPill } from "./spec-checks";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export type SlideRewriteInput = {
  standardId: string;
  standardText: string;
  grade: string;
  /** The slide to rewrite (intro / teach / tip). Mutated copy returned. */
  slide: any;
  /** A canon slide of the SAME type — the anchor-style bar. */
  referenceSlide: any;
};

export type SlideRewriteResult =
  | { ok: true; slide: any }
  | { ok: false; error: string };

const SYSTEM = `You are a senior K-4 reading specialist fixing ONE lesson slide. Its on-screen pills currently TRANSCRIBE the audio (the whole spoken sentence is on screen). Rewrite the on-screen text into terse ANCHORS — the screen shows the ONE idea in as few words as possible while the audio does the teaching.

You receive the slide's steps (each has a sub id, the ttsScript that is SPOKEN, and the current bad on-screen text), plus a CANON reference slide of the same type whose anchor style is the bar.

For EACH step, classify it as one of three KINDS and output {sub, kind, text}:

- "story": the audio is READING example STORY TEXT — a narrative sentence from a little story used as the example ("Max the dog ran to the park.", "The kind old woman fed the birds every morning.", "The old woman lived by the sea, in a tiny cottage."). Put that story sentence in text (drop framing words like "Listen."). It renders in an italic STORY BOX, exactly like the canon Max/Bella example. Use this whenever the audio narrates story/example text instead of explaining a concept.

- "pill": the audio TEACHES or NAMES one concept. Put a ≤5-word anchor in text using the audio's REAL words: "Characters are the who of the story" → "Characters = who"; "The setting is where and when" → "Setting: where and when"; "Events are what happens" → "Events: what happens". (A clean comma-list like "Characters, setting, and events" is split into separate pills automatically — for that step just use kind "pill" with your best single label; the splitter overrides it.)

- "qa": the audio asks a question AND gives the answer ("Where do penguins live? Very cold places!"). Put a TERSE question + answer in text separated by "||": "Where?||Very cold places!". Question ≤4 words, answer ≤5 words — anchors of the spoken Q&A, not the full sentence. Use this for example-slide question steps.

- "skip": pure framing / transition with no concept and no story text — a greeting, "let's look at each one", "here's a trick", "now you're ready". text = "". Becomes audio-only; the image carries it.

HARD RULES:
1. Keep the SAME steps and SAME order. One entry per step, matched by sub.
2. A sentence narrating a story/example → "story" (NOT skip, NOT a pill). A sentence explaining a concept → "pill" (≤5 words, real words, no abstract summaries like "Story Elements"). Connective tissue → "skip".
3. For "pill", NEVER put a full spoken sentence on screen — ≤5 words, one idea.
4. Do not change what is taught. Do not output audioFile / ttsScript / imagePrompt.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    anchors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sub: { type: Type.STRING },
          kind: { type: Type.STRING }, // "story" | "pill" | "skip"
          text: { type: Type.STRING }, // story sentence, or ≤5-word anchor, or ""
        },
        required: ["sub", "kind", "text"],
      },
    },
  },
  required: ["anchors"],
};

/**
 * Deterministically pull a clean 3-item enumeration ("A, B, and C") of
 * short terms from the FIRST sentence of a ttsScript. LLMs are flaky at
 * "split this list into pills" (they punt to one summary), but a clean
 * list of ≤2-word terms is unambiguous — extract it directly so the
 * canon Who?/What?/Where? treatment always fires.
 */
export function extractEnumeration(tts: string): string[] | null {
  const first = String(tts ?? "").split(/[.!?]/)[0] ?? "";
  // A 3-item "A, B, and C" list of ≤2-word terms, anywhere in the first
  // sentence (so embedded lists like "...nouns, irregular verbs, and
  // tricky pronouns" are caught, not just whole-sentence lists).
  const item = "([A-Za-z][A-Za-z']*(?: [A-Za-z][A-Za-z']*)?)";
  const m = first.match(new RegExp(`\\b${item},\\s+${item},?\\s+(?:and |or )?${item}\\b`));
  if (!m) return null;
  const items = [m[1], m[2], m[3]].map((s) => s.trim()).filter(Boolean);
  if (items.length !== 3) return null;
  if (!items.every((it) => it.split(/\s+/).length <= 2)) return null;
  return items.map((it) => it.charAt(0).toUpperCase() + it.slice(1));
}

/**
 * Split a pill that is itself a short comma/and/or-list into separate
 * pills ("ING, ED, S" → [ING, ED, S]; "person, place, or thing" →
 * [Person, Place, Thing]). Catches embedded lists the sentence-level
 * extractor misses, so structured sets become pills instead of failing.
 */
function splitList(text: string): string[] | null {
  const cleaned = String(text)
    .replace(/\s+and\s+/gi, ", ")
    .replace(/\s+or\s+/gi, ", ");
  const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3 && parts.every((p) => p.split(/\s+/).length <= 2)) {
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  }
  return null;
}

/** Build the compact view of a slide we hand to the model. */
function describeSlide(slide: any): string {
  const steps = (slide.steps ?? []).map((st: any) => {
    const onscreen =
      typeof st.displayText === "string"
        ? st.displayText
        : Array.isArray(st.displayParts)
          ? st.displayParts.map((p: any) => p?.text ?? "").join(" ")
          : st.displayTableRow
            ? `[table row: ${st.displayTableRow.label} = ${st.displayTableRow.value}]`
            : "(none)";
    return `  ${st.sub}: spoken="${st.ttsScript ?? ""}"  current-onscreen="${onscreen}"`;
  });
  return `type=${slide.type} heading="${slide.heading ?? ""}"\n${steps.join("\n")}`;
}

export async function rewriteSlide(
  input: SlideRewriteInput,
): Promise<SlideRewriteResult> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "AI not configured." };
  }

  // Don't touch table-row teach slides — those are already canon
  // (structured info → table). Only prose-pill slides are the disease.
  const steps = Array.isArray(input.slide.steps) ? input.slide.steps : [];
  if (steps.some((s: any) => s.displayTableRow)) {
    return { ok: false, error: "slide uses a table — not a transcript slide, skipping" };
  }

  const baseMsg = [
    `STANDARD: ${input.standardId} — ${input.standardText}`,
    `GRADE: ${input.grade}`,
    "",
    "SLIDE TO FIX:",
    describeSlide(input.slide),
    "",
    "CANON REFERENCE (same type — match this anchor style):",
    describeSlide(input.referenceSlide),
  ].join("\n");

  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const userMsg = lastError
      ? `${baseMsg}\n\nYOUR PREVIOUS ATTEMPT FAILED THIS CHECK — fix it: ${lastError}`
      : baseMsg;
    let parsed: any;
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
      parsed = JSON.parse(response.text ?? "{}");
    } catch (e: any) {
      lastError = `invalid JSON: ${e?.message ?? e}`;
      continue;
    }

    const bySub = new Map<string, { kind: string; text: string }>();
    for (const a of parsed.anchors ?? []) {
      if (a && typeof a.sub === "string") {
        bySub.set(a.sub, { kind: String(a.kind ?? "skip"), text: String(a.text ?? "").trim() });
      }
    }
    if (bySub.size === 0) {
      lastError = "no anchors returned";
      continue;
    }

    // Apply onto a deep copy, then validate against the DETECTOR itself.
    // Keep audioFile / ttsScript / audioRegenAt / preStepDelay / imageFile.
    const out = JSON.parse(JSON.stringify(input.slide));
    for (const st of out.steps ?? []) {
      if (!bySub.has(st.sub)) continue;
      delete st.displayParts;
      delete st.displayHighlight;
      delete st.displayText;
      delete st.displayStyle;

      // A clean comma-list in the audio always becomes separate pills
      // (the canon Who?/What?/Where? move), overriding the LLM.
      const enumPills = extractEnumeration(st.ttsScript ?? "");
      if (enumPills) {
        // Even stagger is a placeholder; the apply step Whisper-refines
        // these to the real spoken word times.
        st.displayParts = enumPills.map((text, i) => ({ text, delay: i * 900 }));
        continue;
      }

      const { kind, text } = bySub.get(st.sub)!;
      if (kind === "story" && text) {
        st.displayText = text;
        st.displayStyle = "passage"; // italic story box (Max/Bella)
        st.displayDelay = 0;
      } else if (kind === "qa" && text.includes("||")) {
        const [q, a] = text.split("||").map((s) => s.trim());
        if (q && a) {
          // Answer delay is a placeholder; the Whisper timing pass refines it.
          st.displayParts = [
            { text: q.endsWith("?") ? q : q + "?", delay: 0 },
            { text: a, delay: 1500 },
          ];
        }
      } else if (kind === "pill" && text) {
        const listed = splitList(text);
        if (listed) {
          st.displayParts = listed.map((t, i) => ({ text: t, delay: i * 900 }));
        } else {
          st.displayText = text;
          st.displayDelay = 0;
        }
      }
      // kind "skip" (or empty text) → audio-only.
    }

    // The rewrite must produce ZERO detector flags — it cannot reintroduce
    // the disease it was built to cure.
    let bad = "";
    for (const st of out.steps ?? []) {
      const t = checkTranscriptPill(st, out.type);
      if (!t.ok) { bad = `${st.sub}: ${t.message}`; break; }
      const c = checkCrammedPill(st, out.type);
      if (!c.ok) { bad = `${st.sub}: ${c.message}`; break; }
      const q = checkQaTerseness(st);
      if (!q.ok) { bad = `${st.sub}: ${q.message}`; break; }
      const fr = checkFragmentedPill(st);
      if (!fr.ok) { bad = `${st.sub}: ${fr.message}`; break; }
    }
    if (bad) { lastError = bad; continue; }

    return { ok: true, slide: out };
  }
  return { ok: false, error: `failed after 3 attempts: ${lastError}` };
}
