import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with service role privileges.
 * 
 * WARNING: This client bypasses Row Level Security (RLS).
 * Only use in server-side code (API routes, Server Components, Server Actions).
 * Never expose the service role key to the client side.
 * 
 * @returns Supabase client with admin privileges
 * @throws Error if required environment variables are not set
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  // Create admin client with service role key
  // This bypasses Row Level Security (RLS) - use with caution!
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
››
