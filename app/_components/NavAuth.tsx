"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function NavAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

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

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return <Link href="/login">Login</Link>;
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard" className="text-purple-700 hover:text-orange-600 transition-colors">Dashboard</Link>
      <Link href="/logout" className="text-purple-700 hover:text-pink-600 transition-colors">
        Logout
      </Link>
    </div>
  );
}
