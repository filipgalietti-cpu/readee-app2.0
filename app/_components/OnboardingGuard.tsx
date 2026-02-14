"use client";

<<<<<<< Updated upstream
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
=======
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PUBLIC_PATHS = ["/welcome", "/login", "/signup", "/about"];

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Not logged in: allow public pages, otherwise send to login
        if (!user) {
          if (!PUBLIC_PATHS.includes(pathname)) {
            router.replace("/login");
          }
          if (!cancelled) setReady(true);
          return;
        }

        // Logged in: check onboarding_complete from DB
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", user.id)
          .single();

        const onboardingComplete = profile?.onboarding_complete === true;

        // If onboarding not complete, force /welcome unless already there
        if (!onboardingComplete && pathname !== "/welcome") {
          router.replace("/welcome");
          if (!cancelled) setReady(true);
          return;
        }

        // If onboarding complete, prevent landing on /welcome
        if (onboardingComplete && pathname === "/welcome") {
          router.replace("/dashboard");
          if (!cancelled) setReady(true);
          return;
        }

        if (!cancelled) setReady(true);
      } catch (e) {
        // If anything goes wrong, don't hard-loop. Just render.
        if (!cancelled) setReady(true);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  // Prevent flicker: don't render children until guard decides
  if (!ready) return null;

>>>>>>> Stashed changes
  return <>{children}</>;
}