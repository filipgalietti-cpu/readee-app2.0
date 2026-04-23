import { NextResponse } from "next/server";
import { clearStudentCookie } from "@/lib/auth/student-session";

export async function POST() {
  await clearStudentCookie();
  return NextResponse.json({ ok: true });
}
