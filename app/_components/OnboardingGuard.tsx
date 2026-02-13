"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Refresh to let middleware handle redirects
        router.refresh();
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
