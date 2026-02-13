// Session sync proxy for Supabase authentication
// This file ensures session state is properly synchronized
// between client and server in Next.js App Router

import { createClient } from '@/lib/supabase/server'

export async function syncSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
