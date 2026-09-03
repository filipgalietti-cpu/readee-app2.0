import { NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cleanSaidAs, spokenNameOf } from "@/lib/audio/name-pronunciation";
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
  const saidAs = cleanSaidAs(body.saidAs);
  const admin = supabaseAdmin();
  const { data: child } = await admin.from("children").select("id, first_name, parent_id, name_said_as").eq("id", childId).maybeSingle();
  if (!child || child.parent_id !== user.id) return NextResponse.json({ ok: false, error: "Not your reader." }, { status: 403 });
  const firstName = String(child.first_name ?? "");
  const before = spokenNameOf(firstName, child.name_said_as as string | null);
  const spoken = spokenNameOf(firstName, saidAs);
  await admin.from("children").update({ name_said_as: saidAs || null }).eq("id", childId);
  if (spoken !== before) {
    after(async () => {
      await synthesizeChildGreeting(childId, firstName, spoken);
      await synthesizeChildNamePack(childId, firstName, { spokenName: spoken, force: true });
    });
  }
  return NextResponse.json({ ok: true, saidAs, spoken });
}
