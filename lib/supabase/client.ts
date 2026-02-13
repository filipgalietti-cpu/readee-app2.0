import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Browser/client-safe Supabase client (anon key)
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, anon);
}

// Compatibility export (some files import `createClient`)
export function createClient() {
  return supabaseBrowser();
}