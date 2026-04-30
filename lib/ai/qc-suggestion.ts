/**
 * One-shot LLM for "what would fix this?" Given a finding (kind +
 * type + severity + reason) and the target snapshot, produces a
 * concrete 1-2 sentence rewrite hint or instructional fix.
 *
 * Cost: ~$0.001 per call. Run after the audit's existing judges
 * so we already have the failure reason in hand.
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

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestion: { type: Type.STRING },
  },
  required: ["suggestion"],
};

const SYSTEM = `You are a senior K-4 reading specialist suggesting how to FIX a content QC finding. Read the failure reason + the target snapshot and write ONE concrete suggestion the editor can act on.

Rules:
- 1-2 sentences max. Plain English. Action verbs ("rewrite", "split", "replace", "drop").
- Cite WHAT to change, not just that something is wrong.
- For "drop" verdicts (the question shouldn't exist): say so, and recommend either deletion or replacement with a specific alternative ("Drop and replace with a tap_to_pair on rhyming /at/ words").
- For format-mismatch findings: name the better question type AND give the kid-facing skeleton.
- For lesson structural issues: give the fix as a one-line patch ("Add a step with ttsScript: 'Now you try!'").
- For pedagogical concerns: name the missing teaching move (modeling, scaffolding, retrieval).
- Don't restate the problem — restate the FIX.`;

export type SuggestionInput = {
  targetKind: "lesson" | "question" | "lesson_slide";
  targetId: string;
  findingType: string;
  severity: "warn" | "fail";
  message: string;
  snapshot?: any;
};

export async function generateFixSuggestion(
  input: SuggestionInput,
): Promise<{ ok: true; suggestion: string } | { ok: false; error: string }> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const snapshotBlock = input.snapshot
    ? `\nTarget snapshot:\n\`\`\`json\n${JSON.stringify(input.snapshot, null, 2).slice(0, 2000)}\n\`\`\``
    : "";

  const userMsg = [
    `Target kind: ${input.targetKind}`,
    `Target id: ${input.targetId}`,
    `Finding type: ${input.findingType}`,
    `Severity: ${input.severity}`,
    `Reason: ${input.message}`,
    snapshotBlock,
    `Write ONE concrete fix suggestion.`,
  ]
    .filter(Boolean)
    .join("\n");

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
    const parsed = JSON.parse(response.text ?? "{}") as { suggestion?: string };
    const s = String(parsed.suggestion ?? "").trim();
    if (!s) return { ok: false, error: "Empty suggestion." };
    return { ok: true, suggestion: s };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Suggestion call failed." };
  }
}
