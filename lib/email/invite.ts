import { Resend } from "resend";

type SendInviteInput = {
  to: string;
  classroomName: string;
  teacherDisplay: string;
  studentFirstName: string;
  inviteUrl: string;
  joinCode: string;
};

const FROM = "Readee <hello@readee.app>";

export async function sendInviteEmail(input: SendInviteInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  const resend = new Resend(apiKey);

  const { to, classroomName, teacherDisplay, studentFirstName, inviteUrl, joinCode } = input;
  const subject = `${teacherDisplay} invited ${studentFirstName} to ${classroomName} on Readee`;

  const text = [
    `${teacherDisplay} invited ${studentFirstName} to the class "${classroomName}" on Readee.`,
    "",
    `Click this link to connect ${studentFirstName}'s Readee account:`,
    inviteUrl,
    "",
    `Or enter this join code at learn.readee.app/classroom-join:`,
    joinCode,
    "",
    "Readee is a K-4 reading app aligned to Common Core and the Science of Reading.",
    "If you weren't expecting this email, you can ignore it.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4e4e7;">
            <tr>
              <td style="font-size:14px;font-weight:700;color:#6366f1;letter-spacing:0.08em;text-transform:uppercase;padding-bottom:8px;">
                Readee
              </td>
            </tr>
            <tr>
              <td style="font-size:22px;font-weight:800;line-height:1.3;padding-bottom:16px;">
                ${escapeHtml(teacherDisplay)} invited ${escapeHtml(studentFirstName)} to ${escapeHtml(classroomName)}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#3f3f46;padding-bottom:24px;">
                ${escapeHtml(studentFirstName)} has been added to the class <strong>${escapeHtml(classroomName)}</strong> on Readee — a K-4 reading app aligned to Common Core and the Science of Reading.
                Tap the button below to connect ${escapeHtml(studentFirstName)}'s Readee account.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${inviteUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;">
                  Connect ${escapeHtml(studentFirstName)}'s account
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;line-height:1.6;padding-bottom:8px;">
                Or enter this join code at <a href="https://learn.readee.app/classroom-join" style="color:#6366f1;">learn.readee.app/classroom-join</a>:
              </td>
            </tr>
            <tr>
              <td style="font-family:monospace;font-size:22px;font-weight:800;color:#4f46e5;letter-spacing:0.15em;padding-bottom:24px;">
                ${escapeHtml(joinCode)}
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#a1a1aa;line-height:1.6;border-top:1px solid #e4e4e7;padding-top:16px;">
                If you weren't expecting this email, you can safely ignore it. Readee Learning LLC, Somerset NJ.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    text,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
