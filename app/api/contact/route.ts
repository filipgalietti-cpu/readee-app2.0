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

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Readee Contact Form <hello@readee.app>",
      to: "hello@readee.app",
      replyTo: email.trim(),
      subject: `Contact form: ${name.trim()}`,
      html: `
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Message:</strong></p>
        <p>${message.trim().replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ success: true, message: "Message sent!" });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send. Please email hello@readee.app directly." },
      { status: 500 },
    );
  }
}
