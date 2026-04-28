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
import { loadRecentMemories } from "@/lib/ai/buddy-memory";

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
- WHEN A CONVERSATION IS WINDING DOWN (the child sounds done, the topic feels resolved, or they say goodbye), suggest ONE concrete next thing on Readee: "want to practice [skill] for a few minutes?" or "want me to tell you a story about that?" or "want to do a reading check?". One suggestion, not three.
Tone: warm, encouraging, bunny-mascot energy. Speak like a friend, not a teacher.`;

export type BuddyMode =
  | "freeform"
  | "read_with_me"
  | "word_meaning"
  | "story_time"
  | "quick_quiz";

const MODE_GUIDANCE: Record<BuddyMode, string> = {
  freeform: "",

  read_with_me: `MODE: READ-WITH-ME. The child is reading the passage on screen OUT LOUD. You are the listener-helper.

Turn-by-turn behavior:
1. When the child starts reading, do NOT interrupt or comment on every line.
2. Stay quiet through correctly-read sentences. Silence is OK.
3. If they STUMBLE on a word (long pause, mispronounce, ask for help):
   - Say the word slowly, then break it into chunks ("gi-gan-tic"), then say it once smoothly.
   - Wait for them to repeat it or keep reading.
4. If they read the whole passage cleanly, congratulate them on ONE specific word they nailed (not "great job" — name the word).
5. NEVER read ahead of the child. NEVER read the passage TO them unless they explicitly ask.
6. If they ask "what does X mean" mid-read, give a one-sentence definition then say "want to keep going?"`,

  word_meaning: `MODE: WORD MEANING. The child sees 6 vocab cards on screen. They will ask about one (or more).

Turn-by-turn behavior:
1. Listen for which word they ask about. If they say a word that's NOT on the list, still help them.
2. Give a 1-sentence kid-friendly definition + ONE example sentence using only words they'd already know. No etymology. No long lectures.
3. After answering, briefly invite the next word: "want to know about another one?" Don't list all 6 — just hand the choice back.
4. Keep every reply under 25 words.`,

  story_time: `MODE: STORY TIME. The child has read your story OPENING on screen plus a prediction question. Now you tell the rest of the story IN PIECES, with the kid driving the plot.

Turn-by-turn behavior:
1. When the child answers the prediction question, ACKNOWLEDGE their idea warmly ("ooh, [their idea] — that would be exciting!").
2. CONTINUE the story for 3-4 more sentences, INCORPORATING their prediction where it fits. Don't just retell their idea — weave it into the narrative.
3. Pause and ask ONE more prediction question ("what do you think the dragon does now?").
4. Run for 3 total prediction rounds, then bring the story to a satisfying 1-2 sentence ending.
5. Match grade-level vocabulary. Keep it warm and kid-safe.
6. NEVER finish the whole story in one turn — the kid drives the plot.`,

  quick_quiz: `MODE: QUICK QUIZ. The child has read the passage on screen. There are prepared questions about it.

Turn-by-turn behavior:
1. Wait for the child to say something (e.g. "I'm ready" or just any input).
2. Ask QUESTION 1 from the passage. Read it conversationally — don't announce "question 1 of 3."
3. After their answer:
   - If correct → "That's right! [one-sentence specific reason]" then ask Q2.
   - If close → "Close — let's look again. [hint that points to the right part]" then re-ask the same question.
   - If wrong → don't give the answer outright; give a hint and let them try once more.
4. Repeat for Question 2, Question 3.
5. End with ONE specific encouragement based on what they did well.
6. Never reveal answers in the question itself. Never ask all 3 at once.`,
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
  const memoryLines: string[] = [];

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

      // Cross-session memory — last 3 buddy sessions.
      const memories = await loadRecentMemories({ childId: input.childId, limit: 3 });
      for (const m of memories) {
        memoryLines.push(`  - ${m.summary}`);
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
  if (memoryLines.length > 0) {
    personal.push(
      `What you remember from your last sessions with this child (reference naturally if it fits — "remember when we worked on…"):\n${memoryLines.join("\n")}`,
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
