"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "./Button";
import { useProfile } from "./ProfileContext";

export default function NavAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';

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
      </Link>
    </div>
  );
}
