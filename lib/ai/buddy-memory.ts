/**
 * Reading Buddy cross-session memory.
 *
 *   summarizeAndSave  — runs after a Buddy session ends. Takes the
 *                        transcript, asks Gemini to summarize, and
 *                        persists one buddy_memories row.
 *   loadRecentMemories — fetches up to 3 recent memories for a kid
 *                        so we can prepend them to the next system
 *                        prompt.
 *
 * Margin: 1 Gemini text call per session ≈ \$0.005 (charged 0 to the
 * user — Readee eats this as retention infrastructure). Worth it: a
 * Buddy that "remembers" turns a one-off chat into a recurring habit.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { trackError } from "@/lib/observability/track";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SUMMARY_SYSTEM = `You read a Reading Buddy session transcript between Readee (the AI tutor) and a K-4 child. Produce ONE structured memory record:

- summary: ONE warm sentence ≤ 25 words capturing the gist. Use the child's first name if visible. e.g. "Maya read 'The Lost Mitten' and asked what 'tangled' means; we worked through it together."
- words_asked: words the kid specifically asked about or stumbled on.
- standards_touched: CCSS strands implied by what came up (e.g. "L.2.4a", "RF.2.3"). Up to 3, only when clear.
- mood: ONE of: "engaged", "frustrated", "confident", "neutral".

Be conservative. If you can't tell, leave a field empty / mood "neutral". Don't invent words the kid didn't ask about. The summary is read by THE SAME CHILD next session, so write it like a friend recapping ("we worked on…", "you asked about…"), not a clinical report.`;

const SUMMARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    words_asked: { type: Type.ARRAY, items: { type: Type.STRING } },
    standards_touched: { type: Type.ARRAY, items: { type: Type.STRING } },
    mood: { type: Type.STRING },
  },
  required: ["summary"],
};

export type SavedMemory = {
  id: string;
  summary: string;
  wordsAsked: string[];
  standardsTouched: string[];
  mood: string | null;
  createdAt: string;
};

export async function summarizeAndSave(input: {
  childId: string;
  transcripts: { role: "child" | "buddy"; text: string }[];
  sessionMinutes?: number;
}): Promise<{ ok: true; memory: SavedMemory } | { ok: false; error: string }> {
  if (!input.transcripts || input.transcripts.length < 2) {
    return { ok: false, error: "Transcript too short to summarize." };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const transcript = input.transcripts
    .slice(-30)
    .map((t) => `${t.role === "child" ? "Child" : "Readee"}: ${t.text}`)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: `Conversation transcript:\n"""\n${transcript}\n"""\n\nWrite the memory record per the schema.`,
      config: {
        systemInstruction: SUMMARY_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SUMMARY_SCHEMA,
        temperature: 0.3,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<{
      summary: string;
      words_asked: string[];
      standards_touched: string[];
      mood: string;
    }>;
    const summary = (parsed.summary ?? "").trim();
    if (!summary) return { ok: false, error: "Empty summary." };

    const wordsAsked = Array.isArray(parsed.words_asked)
      ? parsed.words_asked.map((s) => String(s).trim()).filter(Boolean).slice(0, 10)
      : [];
    const standardsTouched = Array.isArray(parsed.standards_touched)
      ? parsed.standards_touched.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
      : [];
    const moodRaw = (parsed.mood ?? "").toString().trim().toLowerCase();
    const mood = ["engaged", "frustrated", "confident", "neutral"].includes(moodRaw)
      ? moodRaw
      : null;

    const admin = supabaseAdmin();
    const { data: row, error } = await admin
      .from("buddy_memories")
      .insert({
        child_id: input.childId,
        summary,
        words_asked: wordsAsked,
        standards_touched: standardsTouched,
        mood,
        session_minutes: input.sessionMinutes ?? null,
      })
      .select("id, created_at")
      .single();
    if (error || !row) {
      return { ok: false, error: error?.message ?? "Insert failed." };
    }

    await logUsage({
      teacherId: input.childId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      // Readee absorbs this as retention infrastructure.
      creditsUsed: 0,
      success: true,
      requestSummary: `buddy_memory: ${summary.slice(0, 100)}`,
    });

    return {
      ok: true,
      memory: {
        id: (row as any).id,
        summary,
        wordsAsked,
        standardsTouched,
        mood,
        createdAt: (row as any).created_at,
      },
    };
  } catch (e: any) {
    trackError(e, { route: "buddy-memory.summarizeAndSave" });
    return { ok: false, error: e?.message ?? "Summarize failed." };
  }
}

export async function loadRecentMemories(input: {
  childId: string;
  limit?: number;
}): Promise<SavedMemory[]> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("buddy_memories")
    .select("id, summary, words_asked, standards_touched, mood, created_at")
    .eq("child_id", input.childId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 3);
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    summary: r.summary,
    wordsAsked: Array.isArray(r.words_asked) ? r.words_asked : [],
    standardsTouched: Array.isArray(r.standards_touched) ? r.standards_touched : [],
    mood: r.mood ?? null,
    createdAt: r.created_at,
  }));
}
