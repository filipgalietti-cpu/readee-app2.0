import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message } = (await req.json()) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { success: false, message: "All fields are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not set on the server");
    return NextResponse.json(
      { success: false, message: "Email isn't set up on the server yet. Please email hello@readee.app directly." },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    // The Resend SDK does NOT throw on API errors — it returns { data, error }.
    // We must inspect `error` or a failed send looks like a success.
    const { data, error } = await resend.emails.send({
      // From a distinct address (NOT hello@) — sending hello@ -> hello@ is
      // a self-addressed mail that Google hard-bounces, which got hello@
      // suppressed in Resend. Recipient is env-overridable so we can point
      // it back at hello@ once that suppression clears.
      from: "Readee Contact Form <notify@readee.app>",
      // Resend suppression on hello@ was manually cleared and the mailbox
      // now receives, so contact mail goes to the real inbox.
      // TEAM_INBOX_EMAIL overrides if it ever needs re-routing.
      to: process.env.TEAM_INBOX_EMAIL || "hello@readee.app",
      replyTo: email.trim(),
      subject: `Contact form: ${name.trim()}`,
      html: `
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Message:</strong></p>
        <p>${message.trim().replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("Contact form Resend error:", error);
      return NextResponse.json(
        { success: false, message: `Couldn't send: ${error.message ?? "email error"}. Please email hello@readee.app directly.` },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, message: "Message sent!", id: data?.id ?? null });
  } catch (err) {
    console.error("Contact form threw:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send. Please email hello@readee.app directly." },
      { status: 500 },
    );
  }
}
