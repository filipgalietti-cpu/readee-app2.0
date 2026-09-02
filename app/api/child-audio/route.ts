import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/child-audio?path=<object path> — mint a short-TTL signed URL for a
 * child-audio object (private bucket) and redirect to it, but ONLY after
 * verifying the caller owns the child the object belongs to.
 *
 * Child voice recordings (fluency/{childId}/…) and name greetings
 * (greetings/{childId}.wav) live in the private `child-audio` bucket (COPPA).
 * Object paths embed the childId; we parse it, confirm the authed user is that
 * child's parent (or a platform admin), then sign. A plain <audio src> element
 * follows the 302 to the signed URL.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "";

  // Whitelist the exact two shapes we mint; reject anything else (no traversal,
  // no arbitrary bucket reads).
  const greeting = /^greetings\/([0-9a-f-]{36})(?:-[a-z]+)?\.wav$/.exec(path);
  const fluency = /^fluency\/([0-9a-f-]{36})\/[A-Za-z0-9._-]+$/.exec(path);
  // Placement: narration clips that say the child's name + the passage recording.
  const placement = /^placement\/([0-9a-f-]{36})\/[A-Za-z0-9._-]+$/.exec(path);
  const childId = greeting?.[1] ?? fluency?.[1] ?? placement?.[1] ?? null;
  if (!childId) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Ownership: the caller must be the child's parent. (RLS on `children` means
  // this select returns a row only when the user owns it — no separate check.)
  const { data: owned } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .maybeSingle();
  if (!owned) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: signed, error } = await supabaseAdmin()
    .storage.from("child-audio")
    .createSignedUrl(path, 300); // 5 min — long enough to play, short enough to not leak
  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.redirect(signed.signedUrl);
}
