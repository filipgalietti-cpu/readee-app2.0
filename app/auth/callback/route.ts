/**
 * CRITICAL FILE - DO NOT DELETE
 *
 * OAuth callback handler for Supabase authentication.
 * Handles the redirect after Google Sign-In and other OAuth providers.
 * Required for authentication to work properly.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { trackFunnel } from "@/lib/analytics/funnel.server";
import { signupAttributionFromCookie } from "@/lib/analytics/signup-attribution";
import { cleanCampaignValue, safePostLoginDestination } from "@/lib/auth/auth-navigation";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safePostLoginDestination(searchParams.get("next"), "/dashboard");
  // Role hint from the signup page (Google OAuth path can't send
  // raw_user_meta_data the way password signup can, so we pass it
  // here and stamp it onto the freshly-created profile).
  const signupRole = searchParams.get("signup_role");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // First-sign-in role stamp: the handle_new_user trigger already
      // inserted a profiles row defaulted to 'parent'; if this OAuth
      // flow originated from the teacher signup, flip it to 'educator'.
      // We only do this when role is 'educator' to avoid stomping any
      // hand-set roles on subsequent sign-ins.
      if (signupRole === "educator" && user) {
        await supabase
          .from("profiles")
          .update({ role: "educator" })
          .eq("id", user.id)
          .eq("role", "parent");
      }

      // Only signup-originated callbacks include signup_role. A normal Google
      // sign-in therefore cannot become a conversion. The deterministic
      // $insert_id makes callback retries exactly-once in PostHog.
      if (user && (signupRole === "parent" || signupRole === "educator")) {
        const attribution = signupAttributionFromCookie(request.headers.get("cookie"));
        const ref = cleanCampaignValue(searchParams.get("ref"));
        await trackFunnel("funnel.signup_complete", user.id, {
          // PostHog uses $insert_id to deduplicate retries and future sign-ins.
          // The callback can run more than once for one account, but the signup
          // conversion must only be counted once.
          $insert_id: `signup:${user.id}`,
          provider: String(user.app_metadata?.provider ?? "email"),
          role: signupRole ?? "parent",
          intended_destination: next,
          ...(ref ? { signup_ref: ref } : {}),
          ...attribution,
        });
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/login?error=Authentication failed. Please try logging in again or contact support if the issue persists.`,
  );
}
