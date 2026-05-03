import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/sign-out-everywhere
 *
 * Revokes ALL refresh tokens for the calling user, kicking them out of
 * every device + browser. Use case: shared family device left signed
 * in, lost phone, suspected account compromise.
 *
 * Different from a normal sign-out (which only clears the current
 * browser's cookies). This calls supabase.auth.signOut({ scope: "global" }).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
