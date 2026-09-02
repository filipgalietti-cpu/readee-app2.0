/**
 * Luna comprehension-question generator — ONE implementation shared by the
 * offline library backfill (scripts/gen-luna-questions.ts) and the live
 * custom-story route (/api/luna/passage). Produces exactly two MCQs per
 * story: one LITERAL (answer stated in the text — the anchor) and one
 * INFERENTIAL (read between the lines), three short tappable choices each.
 *
 * QC is strict and layered: Gemini's structured output → validateLunaQuestions
 * (shape, 3 distinct short choices, valid answer, no em-dashes) → a literal
 * answer-in-text check (the literal answer must actually appear in the
 * passage). One retry, then give up — a story without questions just skips
 * the quiz, it never gets a bad question.
 */
import { Type } from "@google/genai";
import { getClient, logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { validateLunaQuestions, type LunaQuestion } from "@/lib/luna/comprehension";

const SYSTEM = `You write comprehension questions for children in grades K-4 who just read a very short decodable story aloud.

Write EXACTLY 2 multiple-choice questions about the story:
1. kind "literal": the answer is stated directly in the text. A child who read carefully can point to it.
2. kind "inferential": requires putting two ideas together or reading feelings/reasons between the lines. Still answerable from the story alone.

RULES
- Question wording: short, warm, simple. Max ~12 words. Vocabulary at or below the story's level.
- Exactly 3 choices per question. Each choice 1-3 words, lowercase unless a name. All three plausible; only one correct.
- The literal question's correct choice must use a word or phrase FROM the story text.
- Never quiz on the phonics pattern, spelling, or letters. Meaning only.
- No trick questions, no negations ("which did NOT..."), nothing scary or sad.
- Use "child" never "kid". No em-dashes anywhere.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          q: { type: Type.STRING },
          choices: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.INTEGER },
          kind: { type: Type.STRING, enum: ["literal", "inferential"] },
        },
        required: ["q", "choices", "answer", "kind"],
      },
    },
  },
  required: ["questions"],
};

/** The literal question's answer must be grounded in the passage. Checked by
 *  CONTENT words (articles/stop-words dropped), so a natural answer like
 *  "a coin" grounds against "found a small, round coin". */
const STOP = new Set(["a", "an", "the", "is", "was", "of", "to", "in", "on", "at", "and"]);
function literalGrounded(qs: LunaQuestion[], passage: string): boolean {
  const words = new Set(passage.toLowerCase().replace(/[^a-z0-9'\s-]/g, " ").split(/\s+/).filter(Boolean));
  return qs
    .filter((q) => q.kind === "literal")
    .every((q) => {
      const content = q.choices[q.answer]
        .toLowerCase()
        .replace(/[^a-z0-9'\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w && !STOP.has(w));
      return content.length > 0 && content.every((w) => words.has(w));
    });
}

export async function generateLunaQuestions(input: {
  passage: string;
  gradeLevel: string;
  /** For usage logging; "factory" for offline runs. */
  teacherId: string;
}): Promise<{ ok: true; questions: LunaQuestion[] } | { ok: false; error: string }> {
  const client = getClient();
  const prompt = `Grade level: ${input.gradeLevel}.\n\nSTORY:\n${input.passage}\n\nWrite the 2 questions per the rules.`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
          temperature: attempt === 0 ? 0.4 : 0.7, // retry explores a bit more
          maxOutputTokens: 2048,
        } as never,
      });
      const text = response.text;
      if (!text) throw new Error("empty response");
      const parsed = JSON.parse(text) as { questions?: unknown };
      const qs = validateLunaQuestions(parsed.questions);
      if (qs.length === 2 && literalGrounded(qs, input.passage)) {
        // Usage logging is best-effort and only for real user ids — the
        // offline factory ("factory") has no uuid and must never fail on it.
        if (/^[0-9a-f-]{36}$/i.test(input.teacherId)) {
          try {
            await logUsage({
              teacherId: input.teacherId,
              kind: "passage_generation",
              model: MODEL_ID,
              inputTokens: response.usageMetadata?.promptTokenCount,
              outputTokens: response.usageMetadata?.candidatesTokenCount,
              success: true,
              requestSummary: "luna comprehension questions",
            });
          } catch { /* never block on telemetry */ }
        }
        return { ok: true, questions: qs };
      }
      // fall through to retry on weak output
    } catch {
      // fall through to retry
    }
  }
  return { ok: false, error: "Could not produce two QC-passing questions." };
}
