import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // In a Server Component we can't reliably set cookies.
        // For just reading the user + redirecting, a no-op is fine.
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {user.email}</p>
    </main>
  );
}
