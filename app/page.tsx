export default function Home() {
  // This page is intentionally minimal
  // The middleware (proxy.ts) handles all redirects:
  // - Not logged in → /login
  // - Logged in but not onboarded → /welcome  
  // - Logged in and onboarded → /dashboard
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}