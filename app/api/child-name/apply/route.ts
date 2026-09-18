import { NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cleanSaidAs, spokenNameOf, usableSaidAs } from "@/lib/audio/name-pronunciation";
import { synthesizeChildGreeting, synthesizeChildNamePack } from "@/lib/audio/child-greeting";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST { childId, saidAs } : save how the name is said and re-make every clip
 * that speaks it (welcome greeting + placement name pack) in that form.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  let body: { childId?: string; saidAs?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const childId = String(body.childId ?? "");
  if (!/^[0-9a-f-]{36}$/.test(childId)) return NextResponse.json({ ok: false, error: "Bad child." }, { status: 400 });
  const submitted = cleanSaidAs(body.saidAs);
  const admin = supabaseAdmin();
  const { data: child } = await admin.from("children").select("id, first_name, parent_id, name_said_as").eq("id", childId).maybeSingle();
  if (!child || child.parent_id !== user.id) return NextResponse.json({ ok: false, error: "Not your reader." }, { status: 403 });
  const firstName = String(child.first_name ?? "");
  // A respelling that normalises back to the written name tells the voice
  // nothing, and storing it makes the record look handled when it is not. That
  // is how Fil came to be read aloud as "file" with a pronunciation on file.
  const saidAs = usableSaidAs(firstName, submitted) ? submitted : "";
  const unusable = !!submitted && !saidAs;
  const before = spokenNameOf(firstName, child.name_said_as as string | null);
  const spoken = spokenNameOf(firstName, saidAs);
  const { error: saveError } = await admin.from("children").update({ name_said_as: saidAs || null }).eq("id", childId).eq("parent_id", user.id);
  if (saveError) return NextResponse.json({ ok: false, error: "Could not save the pronunciation. Please retry." }, { status: 503 });
  if (spoken !== before) {
    after(async () => {
      await synthesizeChildGreeting(childId, firstName, spoken);
      await synthesizeChildNamePack(childId, firstName, { spokenName: spoken, force: true });
    });
  }
  // `unusable` lets the caller ask the parent to say it once more, instead of
  // reporting success over a pronunciation that will not be used.
  return NextResponse.json({ ok: true, saidAs, spoken, unusable });
}
