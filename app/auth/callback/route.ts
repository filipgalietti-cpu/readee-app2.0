/**
 * CRITICAL FILE - DO NOT DELETE
 * 
 * OAuth callback handler for Supabase authentication.
 * Handles the redirect after Google Sign-In and other OAuth providers.
 * Required for authentication to work properly.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'
  // Role hint from the signup page (Google OAuth path can't send
  // raw_user_meta_data the way password signup can, so we pass it
  // here and stamp it onto the freshly-created profile).
  const signupRole = searchParams.get('signup_role')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // First-sign-in role stamp: the handle_new_user trigger already
      // inserted a profiles row defaulted to 'parent'; if this OAuth
      // flow originated from the teacher signup, flip it to 'educator'.
      // We only do this when role is 'educator' to avoid stomping any
      // hand-set roles on subsequent sign-ins.
      if (signupRole === 'educator') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ role: 'educator' })
            .eq('id', user.id)
            .eq('role', 'parent')
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try logging in again or contact support if the issue persists.`)
}
