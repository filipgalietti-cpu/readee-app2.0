cat > app/_components/NavAuth.tsx <<'EOF'
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavAuth() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Avoid flicker on first load
  if (loggedIn === null) return null;

  // Hide "Login" button when you're already on /login or /signup
  const hideLogin = pathname === "/login" || pathname === "/signup";

  if (!loggedIn) {
    if (hideLogin) return null;

    return (
      <Link
        href="/login"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      >
        Dashboard
      </Link>
      <Link
        href="/logout"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      >
        Logout
      </Link>
    </div>
  );
}
EOF