"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
<<<<<<< Updated upstream
    const supabase = supabaseBrowser();
    supabase.auth.signOut().finally(() => {
=======
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
>>>>>>> Stashed changes
      window.location.href = "/login";
    });
  }, []);

  return null;
}