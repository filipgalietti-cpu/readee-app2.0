import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decodePlayCookie, PLAY_COOKIE_NAME } from "@/lib/auth/play-mode";

/**
 * Proxy (Next.js 16 middleware).
 *
 * 1. Security headers
 * 2. Supabase session refresh
 * 3. Auth gating: unauthenticated → /login
 * 4. Plan gating: free users on premium-only routes → /upgrade?reason=X
 * 5. Play-mode gating: device locked to a kid → adult routes blocked
 *
 * Page-level gating handles partial access (lesson 1 free, first 10 questions, etc.)
 */

/**
 * Routes that are always blocked when this device is in kid play-mode.
 * If a kid clicks any of these (or types the URL), they get bounced
 * back to the kid surface for their child. Exit requires PIN/password
 * via /api/play/exit.
 */
const PLAY_MODE_BLOCKED_PREFIXES = [
  "/classroom",
  "/admin",
  "/account",
  "/billing",
  "/upgrade",
  "/dashboard/ask-readee",
  "/dashboard",
  "/notifications",
  "/settings",
];

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
  "/classroom",
  "/admin",
  "/play",
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
    "media-src 'self' blob: https://*.supabase.co",
    "font-src 'self'",
    isDev
      ? "connect-src 'self' ws://localhost:* https://*.supabase.co https://us.i.posthog.com https://*.ingest.us.sentry.io https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com https://us-central1-aiplatform.googleapis.com wss://us-central1-aiplatform.googleapis.com"
      : "connect-src 'self' https://*.supabase.co https://us.i.posthog.com https://*.ingest.us.sentry.io https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com https://us-central1-aiplatform.googleapis.com wss://us-central1-aiplatform.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Allow mic on our own origin so /fluency, /buddy, and /classroom/tools/coach
  // can capture audio. Camera + geolocation stay locked because we don't use them.
  response.headers.set(
    "Permissions-Policy",
    'camera=(), microphone=(self "https://learn.readee.app"), geolocation=()',
  );
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

  // ── Play-mode gating (per-device lock to a kid) ───────────────────
  // If this device has an active play cookie, block adult routes and
  // bounce the kid back to their lesson home. The /api/play/exit
  // endpoint clears the cookie after PIN/password validation.
  const playCookie = request.cookies.get(PLAY_COOKIE_NAME)?.value;
  const playLock = decodePlayCookie(playCookie);
  if (playLock) {
    const isBlocked = PLAY_MODE_BLOCKED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    // Don't block /play/* itself, /api/play/exit, /api/play/setup,
    // /login (so a parent can still log out), or /logout.
    const isAllowedAlways =
      pathname === "/login" ||
      pathname === "/logout" ||
      pathname.startsWith("/play/") ||
      pathname === "/play" ||
      pathname.startsWith("/api/play/");
    if (isBlocked && !isAllowedAlways) {
      const url = request.nextUrl.clone();
      url.pathname = `/play/${playLock.childId}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
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

  // ── Role-based hard separation ────────────────────────────────────
  // Three audiences, three sandboxes — Filip's call: no hybrid.
  //   1. Platform admin (Filip / Jen): owner surface only
  //   2. Educator: classroom surface only
  //   3. Parent / student: family surface only
  //
  // Anyone trying to cross the line gets bounced to their own home.
  // To test a different surface, sign out and use a separate account.
  if (user && !ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
    const isOwnerOnlyRoute = OWNER_ONLY_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    const isTeacherRoute = TEACHER_ONLY_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    const isParentRoute = PARENT_ONLY_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    // Only bother with the role lookup when the pathname could conflict.
    if (isAdminRoute || isOwnerOnlyRoute || isTeacherRoute || isParentRoute) {
      const [{ data: profile }, { data: paRow }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase.from("platform_admins").select("profile_id").eq("profile_id", user.id).maybeSingle(),
      ]);
      const role = (profile as { role?: string } | null)?.role ?? null;
      const isOwner = !!paRow;

      if (isOwner) {
        // Owners see ONLY /owner/*. /admin is for tenant admins —
        // owners shouldn't use it. Bounce anything else to /owner.
        if (!isOwnerOnlyRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/owner";
          url.search = "";
          return NextResponse.redirect(url);
        }
      } else if (role === "educator") {
        // Teachers can't enter the owner surface or the parent surface.
        if (isOwnerOnlyRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/classroom";
          url.search = "";
          return NextResponse.redirect(url);
        }
        if (isParentRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/classroom";
          url.search = "";
          return NextResponse.redirect(url);
        }
      } else if (role === "parent") {
        // Parents can't enter classroom or owner.
        if (isOwnerOnlyRoute || isAdminRoute || isTeacherRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          url.search = "";
          return NextResponse.redirect(url);
        }
      } else if (role === "student") {
        // Students should be in play mode; if they aren't, send them home.
        if (isOwnerOnlyRoute || isAdminRoute || isTeacherRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          url.search = "";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return response;
}

/** Owner-only routes (platform admins / Readee Inc back-office).
 *  Single prefix — anything under /owner/* is platform-only. */
const OWNER_ONLY_PREFIXES = ["/owner"];

/** Teacher / classroom surface. */
const TEACHER_ONLY_PREFIXES = [
  "/classroom",
];

/** Parent / family surface. Not exhaustive — only routes that
 *  meaningfully conflict with classroom/admin scope. Shared routes
 *  (/account, /upgrade, /settings, /today, /buddy, /fluency, /play)
 *  intentionally NOT here so all roles can use them. */
const PARENT_ONLY_PREFIXES = [
  "/dashboard",
  "/practice",
  "/practice-hub",
  "/stories",
  "/stories-for-me",
  "/journey",
  "/word-bank",
  "/review",
  "/assessment-results",
  "/shop",
  "/leaderboard",
  "/analytics",
  "/roadmap",
  "/learn",
  "/lesson",
  "/carrot-rewards",
];

/** Always allowed regardless of role — auth flow + shared utility routes. */
const ALWAYS_ALLOWED = [
  "/login",
  "/logout",
  "/signup",
  "/onboarding",
  "/account",
  "/settings",
  "/billing",
  "/upgrade",
  "/notifications",
  "/today",
  "/standards",
  "/buddy",
  "/fluency",
  "/play",
  "/api",
  "/contact-us",
  "/about",
  "/pricing",
  "/copyright",
  "/terms-of-service",
  "/privacy-policy",
  "/privacy-for-schools",
  "/schools",
];

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|apple-touch-icon\\.png).*)",
  ],
};
