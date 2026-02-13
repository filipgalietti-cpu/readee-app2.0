import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require auth
  const publicPaths = ['/login', '/signup', '/about', '/auth/callback'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Get auth status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Not logged in
  if (!user) {
    // Redirect to login if accessing protected route
    if (!isPublicPath && pathname !== '/') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Redirect home to login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Allow access to public paths
    return NextResponse.next();
  }
  
  // User is logged in - check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();
  
  const onboardingComplete = profile?.onboarding_complete ?? false;
  
  // If onboarding not complete, redirect to /welcome (except if already there)
  if (!onboardingComplete) {
    if (pathname !== '/welcome' && !isPublicPath) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }
    // Allow access to /welcome
    return NextResponse.next();
  }
  
  // Onboarding complete - redirect away from /welcome
  if (pathname === '/welcome') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect home to dashboard for logged-in onboarded users
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access to all routes for logged-in onboarded users
  return NextResponse.next();
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
