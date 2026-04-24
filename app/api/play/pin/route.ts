import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPin, newSalt } from "@/lib/auth/play-mode";

/** Set / change the parent PIN. Requires Supabase auth. */
export async function POST(req: NextRequest) {
  const profile = await requireProfile();
  const { pin } = (await req.json().catch(() => ({}))) as { pin?: string };
  if (!pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be 4 digits (0-9)." },
      { status: 400 },
    );
  }
  const salt = newSalt();
  const hash = hashPin(pin, salt);

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({ parent_pin_hash: hash, parent_pin_salt: salt })
    .eq("id", profile.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Clear the parent PIN — exit will fall back to password. */
export async function DELETE() {
  const profile = await requireProfile();
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({ parent_pin_hash: null, parent_pin_salt: null })
    .eq("id", profile.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
