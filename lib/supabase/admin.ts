import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only. Never import this in client components.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceRole) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  }
  
  return createSupabaseClient(url, serviceRole);
}

// Compatibility export (some server routes import `createAdminClient`)
export function createAdminClient() {
  return supabaseAdmin();
}