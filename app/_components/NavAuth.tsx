"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
<<<<<<< Updated upstream
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "./Button";
import { useProfile } from "./ProfileContext";

export default function NavAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';
=======
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavAuth() {
  const pathname = usePathname();
  const hideLoginLink = pathname === "/login" || pathname === "/signup";

  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
>>>>>>> Stashed changes

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setLoggedIn(!!data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoggedIn(!!session);
      setReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

<<<<<<< Updated upstream
  // Show nothing while loading instead of early return
  if (loggedIn === null) {
    return null;
  }

  // Show login button for logged out users
  if (!loggedIn) {
    return (
      <Link href="/login">
        <Button size="sm" accentColor={accentColor}>
          Login
        </Button>
      </Link>
    );
  }

  // Show dashboard link and logout for logged in users
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
      >
        Dashboard
      </Link>
      <Link href="/logout">
        <Button variant="ghost" size="sm">
          Logout
        </Button>
=======
  // ✅ prevents “flash” on first paint
  if (!ready) return null;

  // Not logged in
  if (!loggedIn) {
    if (hideLoginLink) return null;
    return (
      <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
        Login
      </Link>
    );
  }

  // Logged in
  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
        Dashboard
      </Link>
      <Link href="/logout" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
        Logout
>>>>>>> Stashed changes
      </Link>
    </div>
  );
}