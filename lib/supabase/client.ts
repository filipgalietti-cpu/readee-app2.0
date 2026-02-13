import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // NEXT_PUBLIC_ prefixed variables are available in browser code at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

// Re-export admin client for server-side admin operations
// Note: This should only be used in server-side code (API routes, server components, etc.)
export { createAdminClient } from './admin'
