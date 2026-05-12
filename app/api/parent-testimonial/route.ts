import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Capture a parent testimonial / positive quote.
 *
 * POST { quote, rating, displayName?, childGrade?, marketingConsent, source? }
 *   → 200 { ok: true, id }
 *
 * Distinct from /api/feedback (general bug reports + triage). This
 * endpoint exists specifically for *marketing-eligible* quotes so
 * Jen + Filip can scan one clean table for homepage testimonials.
 *
 * Submissions land with approved=false. Admin reviews + flips.
 * Nothing reaches the public site without explicit approval AND
 * marketing_consent=true.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let body: {
    quote?: string;
    rating?: number;
    displayName?: string;
    childGrade?: string;
    marketingConsent?: boolean;
    source?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const quote = (body.quote ?? "").trim();
  if (!quote || quote.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Tell us a bit more — at least a sentence." },
      { status: 400 },
    );
  }
  if (quote.length > 1500) {
    return NextResponse.json(
      { ok: false, error: "Quote is too long. Keep it under 1500 characters." },
      { status: 400 },
    );
  }

  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : null;
  const displayName =
    typeof body.displayName === "string"
      ? body.displayName.trim().slice(0, 60) || null
      : null;
  const childGrade =
    typeof body.childGrade === "string"
      ? body.childGrade.trim().slice(0, 40) || null
      : null;
  const marketingConsent = body.marketingConsent === true;
  const source =
    typeof body.source === "string" ? body.source.trim().slice(0, 64) : null;

  const { data, error } = await supabase
    .from("parent_testimonials")
    .insert({
      user_id: user.id,
      quote,
      rating,
      display_name: displayName,
      child_grade: childGrade,
      marketing_consent: marketingConsent,
      source,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[parent-testimonial] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your note. Try again in a sec." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: (data as any).id }, { status: 200 });
}
