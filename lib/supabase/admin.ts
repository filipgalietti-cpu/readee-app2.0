import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only. Never import this in client components.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, serviceRole);
}

// Compatibility export (some server routes import `createAdminClient`)
export function createAdminClient() {
  return supabaseAdmin();
}