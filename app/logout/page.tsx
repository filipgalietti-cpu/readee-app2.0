"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.signOut().finally(() => {
      window.location.href = "/login";
    });
  }, []);

  return (
    <main className="p-6">
      <p className="text-gray-600">Signing you out…</p>
    </main>
  );
}
