import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePassage } from "@/lib/ai/readee-ai";
import { generateLunaQuestions } from "@/lib/ai/luna-questions";
import { getTargetPattern, readingGradeToken } from "@/lib/luna/target-pattern";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasFullAccessFromProfile } from "@/lib/plan/access";
import { FREE_LIMITS } from "@/lib/plan/limits";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/luna/passage — generate a short reading passage loaded with a
 * child's weak phonics pattern, so Luna can give targeted 1:1 practice on
 * exactly what they struggle with. Reuses readee-ai's passage generator
 * (phonicsPattern is a first-class input there).
 *
 * Body (JSON): { childId, pattern?, gradeLevel?, topic? }
 *
 * `topic` is the kid/parent's prompt ("a story about dinosaurs playing
 * soccer"). The generator keeps it decodable to gradeLevel + phonicsPattern,
 * so the prompt drives the STORY while Luna controls the READING LEVEL.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  const childId = String(b?.childId ?? "");
  const pattern = b?.pattern ? String(b.pattern).slice(0, 80) : null;
  // The kid/parent prompt. Falls back to a generic fun story ("surprise me").
  const rawTopic = b?.topic ? String(b.topic).trim().slice(0, 200) : "";
  const topic = rawTopic || "a short, fun story a young reader will enjoy reading out loud";
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  // Auth: parent of the child + paid gate (Luna is premium B2C).
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id, grade, reading_level")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "child not found" }, { status: 404 });
  if ((child as any).parent_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // Free allowance (server-enforced so it can't be bypassed): full-access
  // readers (paid or inside the reverse trial) generate unlimited
  // stories; a genuinely-free reader gets personalizedStoriesFree taste
  // generations, then a 402 that LunaCreate turns into the Readee+ wall.
  const admin = supabaseAdmin();
  const { data: prof } = await admin
    .from("profiles")
    .select("plan, created_at, had_subscription")
    .eq("id", user.id)
    .maybeSingle();
  if (!hasFullAccessFromProfile(prof as { plan?: string | null; created_at?: string | null; had_subscription?: boolean | null } | null)) {
    const { count } = await admin
      .from("child_ai_content")
      .select("id", { count: "exact", head: true })
      .eq("child_id", childId)
      .eq("kind", "luna_reading");
    if ((count ?? 0) >= FREE_LIMITS.personalizedStoriesFree) {
      return NextResponse.json({ error: "limit", reason: "personalized_stories" }, { status: 402 });
    }
  }

  // Anti-repeat: same topic + same pattern makes the model converge on nearly
  // the same story ("I already saw this one!"). Tell it what this child has
  // recently read so every story feels brand-new.
  const { data: recentRows } = await supabase
    .from("child_ai_content")
    .select("title")
    .eq("child_id", childId)
    .eq("kind", "luna_reading")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentTitles = ((recentRows ?? []) as { title: string | null }[])
    .map((r) => (r.title ?? "").trim())
    .filter(Boolean);
  const varietyLine = recentTitles.length
    ? ` Make it feel brand-new: a different character name and a different little plot from these recent stories: ${recentTitles.join("; ")}.`
    : "";

  // Reading level = the child's actual grade (authoritative). Target the
  // phonics pattern they most need next (unless an explicit one was passed) so
  // the story DRILLS the right sound, not just grade-decodable text.
  const gradeTok = readingGradeToken((child as any).reading_level ?? null, (child as any).grade);
  let phonicsPattern = pattern;
  let patternLabel: string | null = null;
  if (!phonicsPattern) {
    const target = await getTargetPattern(childId, gradeTok);
    if (target) {
      phonicsPattern = target.focus;
      patternLabel = target.label;
    }
  }

  const res = await generatePassage({
    teacherId: user.id,
    topic: `${topic}.${varietyLine}`,
    gradeLevel: gradeTok,
    phonicsPattern,
    lengthLevel: "short",
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });

  // Comprehension questions for the custom story (best-effort, ~2-4s): one
  // literal + one inferential MCQ, same strict QC as the library factory. A
  // generation miss just means the reader skips the quiz — never fail the read.
  let questions: unknown = null;
  try {
    const qres = await generateLunaQuestions({
      passage: res.passage.passage,
      gradeLevel: gradeTok,
      teacherId: user.id,
    });
    if (qres.ok) questions = qres.questions;
  } catch {
    /* quiz-less story is fine */
  }

  // Keepsake: persist to "My Readings" (best-effort). child_ai_content is the
  // shared parent-content store; admin client per RLS (same as buildParentContent).
  try {
    await supabaseAdmin()
      .from("child_ai_content")
      .insert({
        parent_id: user.id,
        child_id: childId,
        kind: "luna_reading",
        topic: (rawTopic || "Surprise story").slice(0, 400),
        grade_level: gradeTok,
        phonics_pattern: patternLabel,
        title: res.passage.title,
        passage_text: res.passage.passage,
        questions,
      });
  } catch {
    /* keepsake save is best-effort — never fail the read on a save hiccup */
  }

  return NextResponse.json({
    ok: true,
    passage: {
      grade: gradeTok,
      title: res.passage.title,
      text: res.passage.passage,
      patternLabel,
      questions,
    },
  });
}
