"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleButton({ role }: { role?: "parent" | "educator" } = {}) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);

      // Optional "next" support without useSearchParams. When the caller
      // hints a role (teacher signup path), default the post-login landing
      // to the matching surface so educators don't bounce through /dashboard.
      const params = new URLSearchParams(window.location.search);
      const fallbackNext = role === "educator" ? "/classroom" : "/dashboard";
      const next = params.get("next") ?? fallbackNext;

      const supabase = createClient();

      // Pass the role through the callback URL so /auth/callback can stamp
      // the new profile correctly when this is the user's first sign-in.
      const callbackParams = new URLSearchParams({ next });
      if (role) callbackParams.set("signup_role", role);
      const redirectTo = `${window.location.origin}/auth/callback?${callbackParams.toString()}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        console.error("Google OAuth error:", error);
        setLoading(false);
      }
      // If success, browser redirects to Google immediately.
    } catch (e) {
      console.error("Google OAuth unexpected:", e);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl font-semibold text-zinc-900 bg-white hover:bg-zinc-50 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>

      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}