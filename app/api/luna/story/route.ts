import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateKidStory,
  generateImage,
  generateImageBrief,
  generateMCQQuestions,
  moderateKidInput,
} from "@/lib/ai/readee-ai";
import { assertSafePrompt, assertSafeOutput } from "@/lib/ai/safety";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { gradeToken } from "@/lib/luna/target-pattern";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
// Headroom for the (now fast) parallel cover + MCQ generation. Actual cap is
// clamped to the Vercel plan's max; generation runs ~20-25s on 3.1-flash.
export const maxDuration = 120;

/**
 * POST /api/luna/story — the Luna Story Studio generator. A KID answers a
 * short questionnaire (story type + their own idea + picture style) and Luna
 * writes a full, illustrated story decodable to the child's grade. This is the
 * create step; publishing to the community happens separately (submit for
 * review). Mirrors /api/luna/passage but adds a cover image and is framed as
 * the child's OWN creation ("kind: luna_story").
 *
 * Body (JSON): { childId, storyType?, idea?, imageStyle? }
 *   storyType  — a pill the kid picked ("funny", "space", "mystery"...).
 *   idea       — the kid's own words for what happens (the text box). Luna
 *                turns this into a polished, level-appropriate passage.
 *   imageStyle — cover art direction: cartoon | realistic | watercolor | comic.
 *
 * Safety is layered: assertSafePrompt screens the kid's idea BEFORE Luna
 * writes (Luna also re-checks inside generatePassage), assertSafeOutput
 * re-checks the finished text/title. The heavier family-friendly LLM judge
 * (runCommunityQC) and a human admin run at PUBLISH time — nothing a kid makes
 * reaches other kids without that gate.
 */

// Cover art directions. Cartoon is the Readee house style; the rest give kids
// a real, visible choice without going off-brand.
// Art directions, tuned for Imagen 4 Ultra (which actually honors style —
// unlike the Flash model's baked-in cartoon bias). Each reads as a clearly
// different look so the kid's choice is visible.
const IMAGE_STYLES: Record<string, string> = {
  cartoon:
    "A vibrant, flat 2D cartoon illustration in a modern kids' picture-book style, with bold clean outlines and bright saturated colors. ",
  realistic:
    "A photorealistic, richly detailed image with natural lighting, lifelike textures, and true-to-life proportions - like professional wildlife or portrait photography. Not a cartoon, not an illustration. ",
  watercolor:
    "A traditional watercolor storybook painting with soft color washes, visible paper texture, and gentle pastel tones. ",
  comic:
    "Bold comic-book and graphic-novel art with heavy ink outlines, dynamic shading, and halftone dot texture. ",
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const childId = String(b?.childId ?? "");
  const storyType = b?.storyType ? String(b.storyType).trim().slice(0, 60) : "";
  const idea = b?.idea ? String(b.idea).trim().slice(0, 200) : "";
  const imageStyle = IMAGE_STYLES[String(b?.imageStyle ?? "cartoon")]
    ? String(b.imageStyle)
    : "cartoon";
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  // Quick scan of the kid's own words before we spend a generation on it.
  // Returns a gentle, kid-facing reason so the UI can say "let's try a
  // different idea" rather than exposing the banlist.
  const inputSafe = assertSafePrompt(`${storyType} ${idea}`);
  if (!inputSafe.ok) {
    return NextResponse.json(
      { error: "Let's pick a kinder idea for our story.", reason: "unsafe_input" },
      { status: 400 },
    );
  }

  // Auth: parent of the child + paid gate (Luna is premium B2C).
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id, grade")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "child not found" }, { status: 404 });
  if ((child as any).parent_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { data: prof } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  if (!hasAnyPaidTier(((prof as any)?.plan ?? "free") as string)) {
    return NextResponse.json(
      { error: "Luna requires a paid plan.", reason: "plan" },
      { status: 402 },
    );
  }

  // Story Studio uses its OWN storyteller (generateKidStory), NOT the decodable
  // comprehension generator - so "a tiger learning about pollution" stays a
  // tiger and pollution, at a warm read-aloud level, instead of being flattened
  // to "Tom the big cat" decodable practice text. Grade only flavors word choice.
  const gradeTok = gradeToken((child as any).grade);

  // Second safety layer: an LLM reads the kid's idea for anything the banlist
  // can't catch (paraphrase, disguised profanity, unsafe themes) before we
  // write or draw anything. Banlist already ran (assertSafePrompt) above.
  const mod = await moderateKidInput({
    teacherId: user.id,
    text: `${storyType} ${idea}`,
  });
  if (!mod.ok) {
    return NextResponse.json(
      { error: "Let's pick a different idea for our story.", reason: "unsafe_input" },
      { status: 400 },
    );
  }

  const res = await generateKidStory({
    teacherId: user.id,
    idea,
    storyType,
    gradeLevel: gradeTok,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });

  const title = res.passage.title;
  const body = res.passage.passage;

  // Re-check the finished text before it ever becomes a saved creation.
  const outSafe = assertSafeOutput([title, body]);
  if (!outSafe.ok) {
    return NextResponse.json(
      { error: "Luna hit a snag - let's try another idea.", reason: "unsafe_output" },
      { status: 422 },
    );
  }

  // Cover + comprehension questions, generated in PARALLEL. No narration here:
  // TTS is generated at PUBLISH time (submitForCommunityReview) so the create
  // step stays fast and cheap and doesn't risk the function timeout. Both are
  // best-effort: a hiccup still saves the story (UI degrades gracefully).
  const [coverRes, mcqRes] = await Promise.allSettled([
    (async (): Promise<string | null> => {
      const briefRes = await generateImageBrief({
        teacherId: user.id,
        passageTitle: title,
        passageBody: body,
      });
      if (!briefRes.ok) return null;
      // Anchor the cover to what the KID asked for so it can't drift, and add
      // hard anti-slop negatives. Custom stylePrefix REPLACES the default style
      // words (which carried "no text"), so we must restate it here or the
      // model bakes captions/speech bubbles + duplicate faces into the art.
      const scenePrompt = `${
        idea ? `Main subject: ${idea}. ` : ""
      }${briefRes.brief} Depict ONE single main character with natural, correct anatomy - no duplicated or extra faces, heads, eyes, or limbs. Absolutely NO text, words, letters, numbers, labels, captions, signs, speech bubbles, or watermarks anywhere in the image.`;
      const img = await generateImage({
        teacherId: user.id,
        prompt: scenePrompt,
        stylePrefix: IMAGE_STYLES[imageStyle],
        // 3.1 Flash Image: much faster than 3 Pro (which was ~38s and timed the
        // request out) while still honoring the chosen style well.
        imageModel: "gemini-3.1-flash-image",
      });
      return img.ok ? img.imageUrl : null;
    })(),
    generateMCQQuestions({
      teacherId: user.id,
      topic: [
        `Generate exactly 3 comprehension questions for this children's story.`,
        `Mix: one main-idea, one inference / cause-effect, one literal-recall. Avoid trivial recall.`,
        ``,
        `Title: ${title}`,
        ``,
        `Story:`,
        body,
      ].join("\n"),
      gradeLevel: gradeTok,
      count: 3,
    }),
  ]);

  const imageUrl = coverRes.status === "fulfilled" ? coverRes.value : null;
  const audioUrl = null; // narration is added when the story is published
  const questions =
    mcqRes.status === "fulfilled" && mcqRes.value.ok
      ? mcqRes.value.questions.map((q) => ({
          prompt: q.prompt,
          choices: q.choices,
          correct: q.correct,
          hint: q.hint ?? null,
        }))
      : [];

  // Persist the child's creation. kind "luna_story" marks it as kid-authored
  // Story Studio content (vs "luna_reading" targeted practice), so the publish
  // flow can set the child's first-name byline. Shape matches what the
  // community submit + the daily-style reader consume 1:1.
  let contentId: string | null = null;
  try {
    const { data: row } = await supabaseAdmin()
      .from("child_ai_content")
      .insert({
        parent_id: user.id,
        child_id: childId,
        kind: "luna_story",
        topic: (idea || storyType || "Surprise story").slice(0, 400),
        grade_level: gradeTok,
        phonics_pattern: null,
        title,
        passage_text: body,
        image_url: imageUrl,
        audio_url: audioUrl,
        questions: questions.length > 0 ? questions : null,
      })
      .select("id")
      .single();
    contentId = (row as any)?.id ?? null;
  } catch {
    /* keepsake save is best-effort — still return the story to the kid */
  }

  return NextResponse.json({
    ok: true,
    contentId,
    story: {
      grade: gradeTok,
      title,
      text: body,
      imageUrl,
      imageStyle,
      audioUrl,
      questions,
    },
  });
}
