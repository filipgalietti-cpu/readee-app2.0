export default function Home() {
  // This page is intentionally blank
  // The middleware (proxy.ts) handles all redirects:
  // - Not logged in → /login
  // - Logged in but not onboarded → /welcome  
  // - Logged in and onboarded → /dashboard
  return null;
}