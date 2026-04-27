import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import PptxGenJS from "pptxgenjs";

export const dynamic = "force-dynamic";

type Slide = {
  position: number;
  body: string;
  display_text: string | null;
  image_url: string | null;
  audio_url: string | null;
};

/**
 * GET /api/lesson/[lessonId]/pptx — generates a downloadable .pptx
 * file from a custom_lesson row. Each slide becomes a PowerPoint
 * slide with the image (if any) on the left and the passage text on
 * the right. Comprehension questions become extra slides at the end.
 *
 * Audio narration is referenced as speaker notes (the URL) so the
 * teacher can attach it manually in PowerPoint if they want — pptx
 * embedded media has format quirks across PowerPoint / Google Slides
 * that aren't worth chasing for V1.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("custom_lessons")
    .select(
      "id, title, topic, grade_level, slides, question_ids, cover_image_url",
    )
    .eq("id", lessonId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  const l = lesson as any;
  const slides = (l.slides ?? []) as Slide[];
  const questionIds: string[] = (l.question_ids ?? []) as string[];

  let questions: { prompt: string; choices: string[]; correct: string }[] = [];
  if (questionIds.length > 0) {
    const { data: qrows } = await supabase
      .from("custom_questions")
      .select("prompt, choices, correct")
      .in("id", questionIds);
    questions = ((qrows ?? []) as any[]).map((q) => ({
      prompt: q.prompt,
      choices: (q.choices ?? []) as string[],
      correct: String(q.correct),
    }));
  }

  // Build the deck.
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = l.title || "Readee lesson";
  pptx.author = "Readee.ai";
  pptx.company = "Readee Learning LLC";

  // Cover slide.
  const cover = pptx.addSlide();
  cover.background = { color: "F5F3FF" };
  cover.addText(l.title || "Lesson", {
    x: 0.5,
    y: 1.5,
    w: 12,
    h: 1.2,
    fontSize: 40,
    bold: true,
    color: "4338CA",
    fontFace: "Calibri",
  });
  if (l.grade_level) {
    cover.addText(l.grade_level, {
      x: 0.5,
      y: 2.7,
      w: 12,
      h: 0.4,
      fontSize: 18,
      color: "6B7280",
      fontFace: "Calibri",
    });
  }
  cover.addText(l.topic, {
    x: 0.5,
    y: 3.2,
    w: 12,
    h: 1.5,
    fontSize: 16,
    color: "374151",
    fontFace: "Calibri",
  });
  if (l.cover_image_url) {
    try {
      cover.addImage({
        path: l.cover_image_url,
        x: 8,
        y: 1.5,
        w: 4.5,
        h: 4.5,
      });
    } catch {
      /* skip if URL fails */
    }
  }
  cover.addText("Built with Readee.ai", {
    x: 0.5,
    y: 6.5,
    w: 12,
    h: 0.3,
    fontSize: 10,
    italic: true,
    color: "9CA3AF",
    fontFace: "Calibri",
  });

  // Per-slide content.
  for (const slide of slides) {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };

    if (slide.image_url) {
      try {
        s.addImage({
          path: slide.image_url,
          x: 0.5,
          y: 0.5,
          w: 5.5,
          h: 5.5,
        });
      } catch {
        // skip
      }
      // Text on the right
      s.addText(slide.body || "", {
        x: 6.5,
        y: 0.8,
        w: 6.3,
        h: 5,
        fontSize: 22,
        color: "111827",
        fontFace: "Georgia",
        valign: "middle",
      });
    } else {
      // Full-width text
      s.addText(slide.body || "", {
        x: 1,
        y: 1,
        w: 11.3,
        h: 5,
        fontSize: 28,
        color: "111827",
        fontFace: "Georgia",
        valign: "middle",
      });
    }

    // Slide number footer
    s.addText(`Slide ${slide.position}`, {
      x: 12,
      y: 6.8,
      w: 1,
      h: 0.3,
      fontSize: 10,
      color: "9CA3AF",
      align: "right",
      fontFace: "Calibri",
    });

    // Speaker notes: passage body + audio URL hint.
    const notes = [
      slide.body,
      slide.audio_url ? `\nRead-aloud audio: ${slide.audio_url}` : "",
    ]
      .filter(Boolean)
      .join("");
    if (notes) s.addNotes(notes);
  }

  // Comprehension question slides.
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const s = pptx.addSlide();
    s.background = { color: "EEF2FF" };
    s.addText(`Question ${i + 1}`, {
      x: 0.5,
      y: 0.4,
      w: 12,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: "4338CA",
      fontFace: "Calibri",
    });
    s.addText(q.prompt, {
      x: 0.5,
      y: 1,
      w: 12,
      h: 1.5,
      fontSize: 24,
      bold: true,
      color: "111827",
      fontFace: "Calibri",
    });
    const choicesText = q.choices
      .map((c, idx) => `${String.fromCharCode(65 + idx)}.  ${c}`)
      .join("\n");
    s.addText(choicesText, {
      x: 0.5,
      y: 2.8,
      w: 12,
      h: 4,
      fontSize: 20,
      color: "374151",
      fontFace: "Calibri",
    });
    s.addNotes(`Correct answer: ${q.correct}`);
  }

  // Closing slide.
  const close = pptx.addSlide();
  close.background = { color: "F5F3FF" };
  close.addText("Great work!", {
    x: 0.5,
    y: 2.8,
    w: 12,
    h: 1,
    fontSize: 48,
    bold: true,
    color: "4338CA",
    fontFace: "Calibri",
    align: "center",
  });
  close.addText("readee.app", {
    x: 0.5,
    y: 4,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: "6B7280",
    fontFace: "Calibri",
    align: "center",
  });

  // Stream the file out. Convert Node Buffer → Uint8Array for the
  // edge-runtime-friendly Response body type.
  const buf = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const body = new Uint8Array(buf);
  const fileName = `${(l.title || "lesson").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pptx`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
