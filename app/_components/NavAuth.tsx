"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChildStore } from "@/lib/stores/child-store";

export default function NavAuth() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide navbar completely on immersive pages
  if (pathname === "/practice") return null;
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      if (data.session?.user) {
        supabase
          .from("profiles")
          .select("plan")
          .eq("id", data.session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserPlan((profile as { plan?: string } | null)?.plan || "free");
          });
      }
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
    setNavHidden(false);
  }, [pathname]);

  // Auto-hide nav on scroll down (mobile only)
  useEffect(() => {
    function handleScroll() {
      if (window.innerWidth >= 768) { setNavHidden(false); return; }
      const y = window.scrollY;
      if (y > lastScrollY.current && y > 80) {
        setNavHidden(true);
        setMobileOpen(false);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  const childData = useChildStore((s) => s.childData);
  const storeChildren = useChildStore((s) => s.children);
  const activeChild = childData || storeChildren[0] || null;
  const analyticsHref = activeChild ? `/analytics?child=${activeChild.id}` : "/analytics";

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    `text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg ${
      isActive(href)
        ? "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950"
        : "text-zinc-600 hover:text-indigo-700 hover:bg-indigo-50/60 dark:text-slate-300 dark:hover:text-indigo-300 dark:hover:bg-slate-800"
    }`;

  // Avoid flicker
  if (loggedIn === null) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-slate-700 transition-transform duration-300 md:translate-y-0" style={{ transform: navHidden ? "translateY(-100%)" : undefined }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-20">
          <img src="/readee-logo.png" alt="Readee - Learn to Read" style={{ width: 150, height: 'auto' }} />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-slate-700 transition-transform duration-300 md:translate-y-0" style={{ transform: navHidden ? "translateY(-100%)" : undefined }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-20">
        {/* Logo */}
        <Link
          href={loggedIn ? "/dashboard" : "/"}
          className="hover:opacity-80 transition-opacity"
        >
          <img src="/readee-logo.png" alt="Readee - Learn to Read" style={{ width: 150, height: 'auto' }} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href={analyticsHref} className={linkClass("/analytics")}>
                Analytics
              </Link>
              <Link href={activeChild ? `/shop?child=${activeChild.id}` : "/shop"} className={linkClass("/shop")}>
                🥕 Shop
              </Link>
              <Link href="/word-bank" className={linkClass("/word-bank")}>
                Word Bank
              </Link>
              <Link href="/question-bank" className={linkClass("/question-bank")}>
                Question Bank
              </Link>

              {userPlan !== "premium" ? (
                <Link
                  href="/upgrade"
                  className="relative text-sm font-bold px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 overflow-hidden group nav-shine"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative">⭐</span>
                  <span className="relative font-extrabold">Upgrade</span>
                </Link>
              ) : (
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 2C8.2 2 7 3.5 7 5.5c0 1.2.4 2.3 1 3C6.8 9.2 6 10.5 6 12v4c0 2.2 2.7 4 6 4s6-1.8 6-4v-4c0-1.5-.8-2.8-2-3.5.6-.7 1-1.8 1-3C17 3.5 15.8 2 14.5 2c-.8 0-1.5.5-2 1.2L12 4l-.5-.8C11 2.5 10.3 2 9.5 2zM10 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  Readee+
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                  aria-label="Profile menu"
                >
                  <svg
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
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
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/contact-us"
                      className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Help & Support
                    </Link>
                    <div className="border-t border-zinc-100 dark:border-slate-700 my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={linkClass("/login")}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Sign Up for Free!
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5 text-zinc-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-zinc-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 space-y-1">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/dashboard") ? "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950" : "text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-slate-800"}`}>
                Dashboard
              </Link>
              <Link href={analyticsHref} className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/analytics") ? "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950" : "text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-slate-800"}`}>
                Analytics
              </Link>
              <Link href={activeChild ? `/shop?child=${activeChild.id}` : "/shop"} className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/shop") ? "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950" : "text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-slate-800"}`}>
                🥕 Shop
              </Link>
              <Link href="/word-bank" className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/word-bank") ? "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950" : "text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-slate-800"}`}>
                Word Bank
              </Link>
              <Link href="/question-bank" className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/question-bank") ? "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950" : "text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-slate-800"}`}>
                Question Bank
              </Link>
              {userPlan !== "premium" ? (
                <Link
                  href="/upgrade"
                  className="relative block my-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold text-center hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative">⭐ Upgrade to Readee+</span>
                </Link>
              ) : (
                <Link
                  href="/settings"
                  className="flex items-center justify-center gap-2 my-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 2C8.2 2 7 3.5 7 5.5c0 1.2.4 2.3 1 3C6.8 9.2 6 10.5 6 12v4c0 2.2 2.7 4 6 4s6-1.8 6-4v-4c0-1.5-.8-2.8-2-3.5.6-.7 1-1.8 1-3C17 3.5 15.8 2 14.5 2c-.8 0-1.5.5-2 1.2L12 4l-.5-.8C11 2.5 10.3 2 9.5 2zM10 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  Readee+ Member
                </Link>
              )}
              <Link href="/settings" className="block py-2.5 text-sm font-medium text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300">
                Settings
              </Link>
              <Link href="/contact-us" className="block py-2.5 text-sm font-medium text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300">
                Help & Support
              </Link>
              <div className="border-t border-zinc-100 dark:border-slate-700 my-2" />
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2.5 text-sm font-medium text-zinc-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300">
                Log In
              </Link>
              <Link href="/signup" className="block py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                Sign Up for Free!
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
