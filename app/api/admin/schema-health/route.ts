import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type CheckResult = {
  name: string;
  ok: boolean;
  error?: string;
};

async function runCheck(name: string, fn: () => Promise<unknown>): Promise<CheckResult> {
  try {
    await fn();
    return { name, ok: true };
  } catch (error: unknown) {
    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.SCHEMA_HEALTH_TOKEN;
  if (!expectedToken) {
    // Endpoint intentionally unavailable unless explicitly enabled.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const providedToken = request.headers.get("x-schema-health-token");
  if (providedToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const checks = await Promise.all([
    runCheck("profiles_core_columns", async () => {
      const { error } = await admin
        .from("profiles")
        .select("id,display_name,role,onboarding_complete,plan,tos_accepted_at,tos_version")
        .limit(1);
      if (error) throw new Error(error.message);
    }),
    runCheck("onboarding_preferences_columns", async () => {
      const { error } = await admin
        .from("onboarding_preferences")
        .select("id,user_id,favorite_color,favorite_color_hex,interests")
        .limit(1);
      if (error) throw new Error(error.message);
    }),
    runCheck("children_core_columns", async () => {
      const { error } = await admin
        .from("children")
        .select("id,parent_id,first_name,grade,reading_level,carrots,equipped_items")
        .limit(1);
      if (error) throw new Error(error.message);
    }),
    runCheck("signups_hardening_columns", async () => {
      const { error } = await admin
        .from("signups")
        .select("id,email,source_ip,user_agent,created_at")
        .limit(1);
      if (error) throw new Error(error.message);
    }),
  ]);

  const ok = checks.every((c) => c.ok);
  return NextResponse.json(
    { ok, checks, checked_at: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}
