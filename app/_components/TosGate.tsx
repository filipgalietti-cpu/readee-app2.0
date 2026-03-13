"use client";

import { useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { CURRENT_TOS_VERSION } from "@/lib/tos";
import TosCheckbox from "@/app/components/auth/TosCheckbox";

type Status = "loading" | "accepted" | "needs-consent";
const TOS_LOCAL_STORAGE_KEY = "readee-tos-consent";
const PROFILE_MISSING_CACHE_KEY = "readee-profile-row-missing";

function isNoRowError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return err.code === "PGRST116" || Boolean(err.message?.toLowerCase().includes("no rows"));
}

export default function TosGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  async function checkConsent() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Not logged in — let other middleware handle redirect
      setStatus("accepted");
      return;
    }

    setUserId(user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tos_version")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError && !isNoRowError(profileError)) {
      console.error("Error checking ToS consent:", profileError);
      // Avoid locking users out on transient network/API errors.
      setStatus("accepted");
      return;
    }

    // Already accepted current version
    if (profile?.tos_version === CURRENT_TOS_VERSION) {
      localStorage.removeItem(PROFILE_MISSING_CACHE_KEY);
      setStatus("accepted");
      return;
    }

    // Check localStorage for consent stashed during signup
    const stored = localStorage.getItem(TOS_LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const consent = JSON.parse(stored);
        if (consent.tos_version === CURRENT_TOS_VERSION) {
          // Write to DB when profile exists.
          if (profile) {
            await supabase
              .from("profiles")
              .update({
                tos_accepted_at: consent.tos_accepted_at,
                tos_version: consent.tos_version,
              })
              .eq("id", user.id);
            localStorage.removeItem(TOS_LOCAL_STORAGE_KEY);
          }
          setStatus("accepted");
          return;
        }
      } catch {
        localStorage.removeItem(TOS_LOCAL_STORAGE_KEY);
      }
    }

    // No profile row yet (brand-new Google OAuth user before onboarding)
    if (!profile) {
      localStorage.setItem(PROFILE_MISSING_CACHE_KEY, "1");
      setStatus("needs-consent");
      return;
    }

    setStatus("needs-consent");
  }

  async function handleAccept() {
    if (!userId) return;
    setSaving(true);

    const supabase = createClient();
    const now = new Date().toISOString();
    const consentPayload = { tos_accepted_at: now, tos_version: CURRENT_TOS_VERSION };
    let saved = false;

    if (localStorage.getItem(PROFILE_MISSING_CACHE_KEY) !== "1") {
      const { error } = await supabase
        .from("profiles")
        .update(consentPayload)
        .eq("id", userId);

      if (!error) {
        saved = true;
      } else if (isNoRowError(error)) {
        localStorage.setItem(PROFILE_MISSING_CACHE_KEY, "1");
      } else {
        console.error("Failed to save ToS consent:", error);
      }
    }

    if (!saved) {
      localStorage.setItem(TOS_LOCAL_STORAGE_KEY, JSON.stringify(consentPayload));
    } else {
      localStorage.removeItem(TOS_LOCAL_STORAGE_KEY);
    }

    setStatus("accepted");
    setSaving(false);
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void checkConsent();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (status === "accepted") {
    return <>{children}</>;
  }

  // Blocking modal
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">
            Please review our terms
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            To continue using Readee, please review and accept our updated
            terms.
          </p>

          <div className="mb-6">
            <TosCheckbox checked={checked} onChange={setChecked} />
          </div>

          <button
            onClick={handleAccept}
            disabled={!checked || saving}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
}
