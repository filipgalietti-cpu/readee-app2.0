"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { bindErrorIdentity } from "@/lib/observability/auth-identity";

export default function SentryIdentity() {
  useEffect(() => bindErrorIdentity(supabaseBrowser().auth), []);
  return null;
}
