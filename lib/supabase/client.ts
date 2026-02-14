/**
 * CRITICAL FILE - DO NOT DELETE OR MODIFY
 * 
 * This file creates the browser-side Supabase client for authentication and database access.
 * Used in client components for user authentication and data operations.
 */

import { createBrowserClient } from "@supabase/ssr";

// Browser/client-safe Supabase client (anon key) with proper cookie management for SSR
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createBrowserClient(url, anon);
}

// Compatibility export (some files import `createClient`)
export function createClient() {
  return supabaseBrowser();
}