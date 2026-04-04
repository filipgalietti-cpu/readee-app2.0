import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy (Next.js 16 middleware).
 *
 * 1. Security headers
 * 2. Supabase session refresh
 * 3. Auth gating: unauthenticated → /login
 * 4. Plan gating: free users on premium-only routes → /upgrade?reason=X
 *
 * Page-level gating handles partial access (lesson 1 free, first 10 questions, etc.)
 */

/** Routes that require premium — redirect free users to /upgrade */
const PREMIUM_ONLY_ROUTES: Record<string, string> = {
  "/analytics": "analytics",
};

/** Routes that require authentication — redirect to /login */
const AUTH_REQUIRED_PREFIXES = [
  "/learn",
  "/lesson",
  "/practice",
  "/practice-hub",
  "/journey",
  "/stories",
  "/analytics",
  "/dashboard",
  "/settings",
  "/account",
  "/billing",
  "/word-bank",
  "/upgrade",
  "/roadmap",
  "/shop",
  "/leaderboard",
  "/notifications",
  "/assessment-results",
  "/carrot-rewards",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // ── Security headers ──────────────────────────────────────────────
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' https://us.i.posthog.com https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.supabase.co",
    "font-src 'self'",
    isDev
      ? "connect-src 'self' ws://localhost:* https://*.supabase.co https://us.i.posthog.com https://*.ingest.us.sentry.io"
      : "connect-src 'self' https://*.supabase.co https://us.i.posthog.com https://*.ingest.us.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  // ── Supabase session refresh ──────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Auth gating ───────────────────────────────────────────────────
  const needsAuth = AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Plan gating (premium-only routes) ─────────────────────────────
  if (user) {
    const reason = PREMIUM_ONLY_ROUTES[pathname];
    if (reason) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profile?.plan !== "premium") {
        const url = request.nextUrl.clone();
        url.pathname = "/upgrade";
        url.searchParams.set("reason", reason);
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|apple-touch-icon\\.png).*)",
  ],
};
