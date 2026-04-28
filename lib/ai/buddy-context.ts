/**
 * Build a personalized Reading Buddy system prompt.
 *
 * Pulls a kid's profile + recent practice + recent fluency so Readee
 * can address the kid by name, knows their grade, and references what
 * they've actually been working on. The difference between a generic
 * LLM voice toy and a real tutor.
 *
 * Falls back gracefully — if no childId is passed, or the kid has no
 * activity yet, we use the base prompt without personal context.
 */

import { createClient } from "@/lib/supabase/server";

const BASE = `You are Readee, a warm, patient real-time reading buddy for a K-4 child.
- Keep replies SHORT (1-3 sentences).
- Match grade-level vocabulary. K-1 use very simple words.
- If the child asks what a word means, give a kid-friendly definition + one quick example using a word they'd know.
- If they're sounding out a word, gently say it slowly and break it into chunks.
- If they ask about the passage, answer warmly and briefly.
- Encourage them by name when you can. Don't be saccharine — kids see through it.
- If they go off-topic, gently redirect: "That sounds fun! Let's keep reading first."
- NEVER pretend to be human. If asked, say you're Readee, the reading helper.
- Stay safe. No personal info. Refuse anything inappropriate.
Tone: warm, encouraging, bunny-mascot energy. Speak like a friend, not a teacher.`;

export type BuddyMode =
  | "freeform"
  | "read_with_me"
  | "word_meaning"
  | "story_time"
  | "quick_quiz";

const MODE_GUIDANCE: Record<BuddyMode, string> = {
  freeform: "",
  read_with_me: `MODE: READ-WITH-ME. The child is reading a passage out loud. Wait until they pause, then give a short encouragement or a gentle correction if they stumble. Do not read AHEAD of them. If they ask for help with a specific word, sound it out together.`,
  word_meaning: `MODE: WORD MEANING. The child is asking what specific words mean. Give a one-sentence kid-friendly definition + one example sentence using a word they'd actually know. No long etymologies.`,
  story_time: `MODE: STORY TIME. The child wants you to tell them a story. Tell a 4-6 sentence original story at their grade level. Pause naturally and ask one prediction question ("what do you think happens next?"). After they answer, continue the story incorporating their idea where reasonable. Keep it warm and kid-safe.`,
  quick_quiz: `MODE: QUICK QUIZ. Ask the child 3 short comprehension questions about the passage they just read. After each answer give brief feedback ("That's right!" or "Close — let's look again at..."). At the end, give one specific encouragement.`,
};

export type BuddyContext = {
  systemInstruction: string;
  passage: string;
  gradeLevel: string;
  childFirstName: string | null;
};

export async function buildBuddyContext(input: {
  childId?: string | null;
  passage?: string | null;
  gradeLevel?: string | null;
  mode?: BuddyMode;
}): Promise<BuddyContext> {
  const passage = (input.passage ?? "").toString().slice(0, 4000);
  const mode = input.mode ?? "freeform";

  let firstName: string | null = null;
  let grade = (input.gradeLevel ?? "").toString().slice(0, 20);
  const recentLines: string[] = [];

  if (input.childId) {
    try {
      const supabase = await createClient();
      const { data: child } = await supabase
        .from("children")
        .select("name, reading_level")
        .eq("id", input.childId)
        .maybeSingle();
      if (child) {
        const c = child as any;
        firstName = (c.name ?? "").split(" ")[0] || null;
        if (!grade) grade = c.reading_level ?? "";
      }

      // Recent practice — last 5 standards touched.
      const { data: practice } = await supabase
        .from("practice_results")
        .select("standard_id, questions_correct, questions_attempted, updated_at")
        .eq("child_id", input.childId)
        .order("updated_at", { ascending: false })
        .limit(5);
      for (const r of (practice ?? []) as any[]) {
        const pct = r.questions_attempted
          ? Math.round((r.questions_correct / r.questions_attempted) * 100)
          : 0;
        recentLines.push(`  - ${r.standard_id}: ${pct}% accuracy`);
      }

      // Most recent fluency reading — surface target patterns if any.
      const { data: fluency } = await supabase
        .from("fluency_readings")
        .select("wcpm, target_patterns, updated_at")
        .eq("child_id", input.childId)
        .order("updated_at", { ascending: false })
        .limit(1);
      const f = ((fluency ?? []) as any[])[0];
      if (f) {
        const targets = Array.isArray(f.target_patterns) ? f.target_patterns : [];
        if (f.wcpm) recentLines.push(`  - Last fluency read: ${f.wcpm} WCPM`);
        if (targets.length > 0) {
          recentLines.push(`  - Working on: ${targets.slice(0, 3).join(", ")}`);
        }
      }
    } catch {
      // Profile fetch failure shouldn't kill the buddy — fall through
      // to the generic prompt.
    }
  }

  const personal: string[] = [];
  if (firstName) {
    personal.push(`The child's name is ${firstName}. Use their name occasionally — once or twice per session, not every reply.`);
  }
  personal.push(`Grade level: ${grade || "K-4"}.`);
  if (recentLines.length > 0) {
    personal.push(
      `Recent activity (use these only when relevant — don't lecture about them):\n${recentLines.join("\n")}`,
    );
  }

  const passageBlock = passage
    ? `\nPassage on the screen right now:\n"""\n${passage}\n"""`
    : `\nNo passage on screen yet — the child is just chatting about reading.`;

  const modeBlock = MODE_GUIDANCE[mode]
    ? `\n${MODE_GUIDANCE[mode]}`
    : "";

  const systemInstruction = [BASE, "", ...personal, passageBlock, modeBlock]
    .filter(Boolean)
    .join("\n");

  return {
    systemInstruction,
    passage,
    gradeLevel: grade || "K-4",
    childFirstName: firstName,
  };
}
