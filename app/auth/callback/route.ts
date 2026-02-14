<<<<<<< Updated upstream
/**
 * CRITICAL FILE - DO NOT DELETE
 * 
 * OAuth callback handler for Supabase authentication.
 * Handles the redirect after Google Sign-In and other OAuth providers.
 * Required for authentication to work properly.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'
=======
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function redirectTo(request: Request, path: string) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) return NextResponse.redirect(`${origin}${path}`);
  if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${path}`);
  return NextResponse.redirect(`${origin}${path}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
>>>>>>> Stashed changes

  if (!code) {
    return redirectTo(
      request,
      "/login?error=Missing OAuth code. Please try again."
    );
  }

  const supabase = await createClient();

  // 1) Exchange OAuth code for a Supabase session (sets cookies)
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return redirectTo(
      request,
      "/login?error=Authentication failed. Please try again."
    );
  }

  // 2) Get the user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return redirectTo(
      request,
      "/login?error=Could not load user after login. Please try again."
    );
  }

  // 3) Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  // 4) If profile missing, create it (new user)
  if (profileError) {
    return redirectTo(
      request,
      "/login?error=Profile lookup failed. Please try again."
    );
  }

  if (!profile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      role: "student",
      onboarding_complete: false,
    });

    if (insertError) {
      return redirectTo(
        request,
        "/login?error=Could not create profile. Please try again."
      );
    }

    // New user → onboarding
    return redirectTo(request, "/welcome");
  }

  // Existing user → route based on onboarding status
  if (profile.onboarding_complete) return redirectTo(request, "/dashboard");
  return redirectTo(request, "/welcome");
}