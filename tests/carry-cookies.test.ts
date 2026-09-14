import { expect, it } from "vitest";
import { NextResponse } from "next/server";
import { carryCookies } from "@/lib/auth/carry-cookies";

it("carries a rotated session and a cleared cookie onto a redirect, attributes intact", () => {
  const from = NextResponse.next();
  from.cookies.set("sb-demo-auth-token.0", "rotated", { path: "/", maxAge: 3600, httpOnly: true, secure: true, sameSite: "lax" });
  from.cookies.set("sb-demo-auth-token.1", "", { path: "/", maxAge: 0 });

  const to = carryCookies(from, NextResponse.redirect(new URL("https://learn.readee.app/login")));

  expect(to.status).toBe(307);
  const set = to.headers.getSetCookie();
  expect(set).toHaveLength(2);
  expect(set[0]).toContain("sb-demo-auth-token.0=rotated");
  expect(set[0]).toContain("Max-Age=3600");
  expect(set[0]).toContain("HttpOnly");
  expect(set[0]).toContain("Secure");
  expect(set[0].toLowerCase()).toContain("samesite=lax");
  expect(set[1]).toMatch(/^sb-demo-auth-token\.1=;/);
  expect(set[1]).toContain("Max-Age=0");
});

it("leaves a redirect untouched when nothing was set", () => {
  const to = carryCookies(NextResponse.next(), NextResponse.redirect(new URL("https://learn.readee.app/dashboard")));
  expect(to.headers.getSetCookie()).toHaveLength(0);
});
