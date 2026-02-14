<<<<<<< Updated upstream
/**
 * CRITICAL FILE - DO NOT DELETE OR MODIFY
 * 
 * This file creates the browser-side Supabase client for authentication and database access.
 * Used in client components for user authentication and data operations.
 */

import { createBrowserClient } from "@supabase/ssr";

// Browser/client-safe Supabase client (anon key) with proper cookie management for SSR
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  }
  
  return createBrowserClient(url, anon);
}

// Compatibility export (some files import `createClient`)
=======
import { createBrowserClient } from "@supabase/ssr";

>>>>>>> Stashed changes
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(url, anonKey);
}