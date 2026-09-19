import { NextResponse } from "next/server";

/**
 * The page behind a one-tap link in an email to the team inbox.
 *
 * ‼️ A link in an email is not a button press. Mail providers and security
 * scanners FETCH the links in a message, sometimes before a person has opened
 * it. On 16 Sep 2026 that is exactly what filed a community report against a
 * featured story. For a link that redraws a daily picture it means pictures
 * changing with nobody asking. For a link that approves an email to every
 * family it means a send nobody approved.
 *
 * So a GET never does anything. It shows what is about to happen and one
 * button, and the button is a POST. Scanners follow links; they do not submit
 * forms.
 */

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shell(title: string, inner: string, ok: boolean): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex"/><title>${escapeText(title)}</title></head>
<body style="margin:0;background:#f0f0e4;font-family:${FONT};">
<div style="max-width:520px;margin:12vh auto;padding:0 20px;"><div style="background:#fff;border:1px solid #e6e6d6;border-radius:18px;padding:30px 26px;">
<h1 style="margin:0 0 10px;font-size:22px;color:${ok ? "#4c1d95" : "#a8301f"};">${escapeText(title)}</h1>
${inner}</div></div></body></html>`,
    { status: ok ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

/** The outcome. `body` is trusted HTML written by the route, never user input. */
export function resultPage(title: string, body: string, ok = true): NextResponse {
  return shell(title, `<p style="margin:0;font-size:16px;line-height:1.6;color:#3f3f46;">${body}</p>`, ok);
}

/**
 * Step one of two. The form has no `action`, so it posts back to the address
 * it was served from, signed query string included.
 */
export function confirmPage(title: string, body: string, buttonLabel: string): NextResponse {
  return shell(
    title,
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3f3f46;">${body}</p>
<form method="post"><button type="submit" style="appearance:none;border:0;border-radius:12px;background:#6d28d9;color:#fff;font:700 16px ${FONT};padding:14px 22px;cursor:pointer;">${escapeText(buttonLabel)}</button></form>`,
    true,
  );
}
