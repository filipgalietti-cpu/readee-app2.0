import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, plan_interest } = body;

  if (!email || !plan_interest) {
    return NextResponse.json({ error: "Missing email or plan_interest" }, { status: 400 });
  }

  if (!["monthly", "annual"].includes(plan_interest)) {
    return NextResponse.json({ error: "plan_interest must be 'monthly' or 'annual'" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({ email, plan_interest });

  if (error) {
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
