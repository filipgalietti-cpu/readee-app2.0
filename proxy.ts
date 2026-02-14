/**
 * CRITICAL FILE - DO NOT DELETE OR MODIFY WITHOUT CAREFUL REVIEW
 * 
 * This proxy/middleware handles authentication and routing for the entire application.
 * It ensures users are logged in and redirected appropriately based on their onboarding status.
 * 
 * Removing or breaking this file will cause login and authentication to fail completely.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
  // eslint-disable-next-line prefer-const
  let res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Validate required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check .env.local file.');
    
    // Redirect to a setup page instead of bypassing auth
    // This prevents unauthorized access while providing helpful guidance
    if (pathname !== '/test-connection') {
      return NextResponse.redirect(new URL('/test-connection?error=missing-config', req.url));
    }
    
    // Allow access to test-connection page to help with diagnosis
    return res;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user and keep session cookies synced
  const { data: { user } } = await supabase.auth.getUser();
  
  // Public paths that don't require auth
  const publicPaths = ['/login', '/signup', '/about', '/auth/callback'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Not logged in
  if (!user) {
    // Redirect to login if accessing protected route
    if (!isPublicPath && pathname !== '/') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Redirect home to login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Allow access to public paths
    return res;
  }
  
  // User is logged in - check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();
  
  const onboardingComplete = profile?.onboarding_complete ?? false;
  
  // If onboarding not complete, redirect to /welcome
  if (!onboardingComplete) {
    if (pathname !== '/welcome' && !isPublicPath) {
      return NextResponse.redirect(new URL('/welcome', req.url));
    }
    // Allow access to /welcome
    return res;
  }
  
  // Onboarding complete - redirect away from /welcome
  if (pathname === '/welcome') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Redirect home to dashboard for logged-in onboarded users
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Allow access to all routes for logged-in onboarded users
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

