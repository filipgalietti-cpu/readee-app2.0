import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PLAY_COOKIE_NAME, decodePlayCookie, verifyPin } from "@/lib/auth/play-mode";

/**
 * Exit play-mode. Clears the per-device cookie after PIN OR password
 * verification. The cookie carries the parent profile id so we know
 * who's authorized to unlock — even if a kid grabs another adult's
 * Supabase session, they can't unlock the wrong cookie.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const playCookie = cookieStore.get(PLAY_COOKIE_NAME)?.value;
  const lock = decodePlayCookie(playCookie);
  if (!lock) {
    return NextResponse.json({ error: "Not in play mode." }, { status: 400 });
  }

  const { pin, password } = (await req.json().catch(() => ({}))) as {
    pin?: string;
    password?: string;
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // The Supabase user MUST match the parent who locked this device.
  if (user.id !== lock.parentId) {
    return NextResponse.json(
      { error: "This device was locked by a different account. Sign in as that account to exit." },
      { status: 403 },
    );
  }

  const admin = supabaseAdmin();
  const { data: profileRow } = await admin
    .from("profiles")
    .select("parent_pin_hash, parent_pin_salt, email")
    .eq("id", user.id)
    .single();
  const profile = profileRow as any;

  if (pin) {
    if (!profile?.parent_pin_hash || !profile?.parent_pin_salt) {
      return NextResponse.json(
        { error: "No PIN is set on this account. Use your password instead." },
        { status: 400 },
      );
    }
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4 digits." }, { status: 400 });
    }
    let ok = false;
    try {
      ok = verifyPin(pin, profile.parent_pin_hash, profile.parent_pin_salt);
    } catch {
      ok = false;
    }
    if (!ok) {
      return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
    }
  } else if (password) {
    // Verify by reauthenticating the password with Supabase. We use the
    // user's email + the supplied password to call signInWithPassword;
    // if it succeeds, the password is correct. We don't keep that
    // session — the existing one is fine.
    if (!profile?.email) {
      return NextResponse.json(
        { error: "Couldn't verify password — no email on file." },
        { status: 400 },
      );
    }
    const verifyClient = await createClient();
    const { error } = await verifyClient.auth.signInWithPassword({
      email: profile.email,
      password,
    });
    if (error) {
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }
  } else {
    return NextResponse.json(
      { error: "Provide a PIN or password." },
      { status: 400 },
    );
  }

  // Unlock — clear the cookie.
  cookieStore.set({
    name: PLAY_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
