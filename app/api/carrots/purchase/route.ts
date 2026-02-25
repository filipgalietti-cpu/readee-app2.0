import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { childId, packId } = body as { childId?: string; packId?: string };

  if (!childId || !packId) {
    return NextResponse.json(
      { success: false, message: "Missing childId or packId" },
      { status: 400 },
    );
  }

  // Stub: will be replaced with Stripe Checkout integration
  return NextResponse.json({
    success: false,
    message: "Coming soon! Carrot packs will be available shortly.",
  });
}
