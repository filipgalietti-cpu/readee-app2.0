/**
 * Luna comprehension questions — the shared contract between the content
 * factory (offline generation), the live passage generator, and the reader.
 *
 * Reading = Decoding x Comprehension (Simple View). After the read, Luna asks
 * TWO gentle questions: one LITERAL (the answer is right there in the text —
 * the anchor) and one INFERENTIAL (read between the lines). Tappable choices,
 * because K-4 readers answer by recognizing, not typing. Wrong answers get a
 * warm reveal, never a fail — the point is building the comprehension habit.
 */

export type LunaQuestionKind = "literal" | "inferential";

export type LunaQuestion = {
  /** The question Luna speaks and shows. Short, child-facing. */
  q: string;
  /** Exactly 3 short choices a K-4 reader can read on a button. */
  choices: string[];
  /** Index into choices. */
  answer: number;
  kind: LunaQuestionKind;
};

const MAX_Q_LEN = 90;
const MAX_CHOICE_LEN = 28;

/**
 * Validate + normalize raw question data (from AI output or stored JSON).
 * Returns only the questions that pass every check, capped at 2 (one literal
 * first when available). Strict by design: a malformed question must never
 * reach a child — better to silently skip the quiz.
 */
export function validateLunaQuestions(raw: unknown): LunaQuestion[] {
  if (!Array.isArray(raw)) return [];
  const clean: LunaQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const q = typeof o.q === "string" ? o.q.trim() : "";
    const kind: LunaQuestionKind = o.kind === "inferential" ? "inferential" : "literal";
    const choices = Array.isArray(o.choices)
      ? o.choices.map((c) => String(c ?? "").trim()).filter(Boolean)
      : [];
    const answer = typeof o.answer === "number" ? o.answer : -1;
    if (!q || q.length > MAX_Q_LEN) continue;
    if (choices.length !== 3) continue;
    if (choices.some((c) => c.length > MAX_CHOICE_LEN)) continue;
    // Choices must be distinct (case-insensitive) — duplicate choices make the
    // question unanswerable or trivially gamed.
    const lower = choices.map((c) => c.toLowerCase());
    if (new Set(lower).size !== 3) continue;
    if (answer < 0 || answer > 2) continue;
    // No em-dashes in child-facing copy (app rule).
    if ([q, ...choices].some((s) => s.includes("—"))) continue;
    clean.push({ q, choices, answer, kind });
  }
  // Literal first (the anchor), then one inferential. Max 2 total.
  const literal = clean.filter((c) => c.kind === "literal");
  const inferential = clean.filter((c) => c.kind === "inferential");
  const picked: LunaQuestion[] = [];
  if (literal[0]) picked.push(literal[0]);
  if (inferential[0]) picked.push(inferential[0]);
  if (picked.length < 2) {
    for (const c of clean) {
      if (picked.length >= 2) break;
      if (!picked.includes(c)) picked.push(c);
    }
  }
  return picked.slice(0, 2);
}
