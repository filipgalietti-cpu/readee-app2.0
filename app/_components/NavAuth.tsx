"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavAuth() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? "text-indigo-700"
        : "text-zinc-600 hover:text-zinc-900"
    }`;

  // Avoid flicker
  if (loggedIn === null) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-indigo-700">READ</span>
            <span className="text-indigo-400">EE</span>
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link
          href={loggedIn ? "/dashboard" : "/"}
          className="text-xl font-extrabold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-indigo-700">READ</span>
          <span className="text-indigo-400">EE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                  aria-label="Profile menu"
                >
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/contact-us"
                      className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Help & Support
                    </Link>
                    <div className="border-t border-zinc-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/about" className={linkClass("/about")}>
                About
              </Link>
              <Link href="/#pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                Pricing
              </Link>
              <Link
                href="/login"
                className={linkClass("/login")}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-6 py-4 space-y-1">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="block py-2.5 text-sm font-medium text-zinc-700 hover:text-indigo-700">
                Dashboard
              </Link>
              <Link href="/settings" className="block py-2.5 text-sm font-medium text-zinc-700 hover:text-indigo-700">
                Settings
              </Link>
              <Link href="/contact-us" className="block py-2.5 text-sm font-medium text-zinc-700 hover:text-indigo-700">
                Help & Support
              </Link>
              <div className="border-t border-zinc-100 my-2" />
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2.5 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/about" className="block py-2.5 text-sm font-medium text-zinc-700 hover:text-indigo-700">
                About
              </Link>
              <Link href="/#pricing" className="block py-2.5 text-sm font-medium text-zinc-700 hover:text-indigo-700">
                Pricing
              </Link>
              <Link href="/login" className="block py-2.5 text-sm font-medium text-zinc-700 hover:text-indigo-700">
                Log In
              </Link>
              <Link href="/signup" className="block py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
