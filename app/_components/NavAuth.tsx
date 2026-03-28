"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChildStore } from "@/lib/stores/child-store";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import { Star, Bell, HelpCircle, Menu } from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { usePlanStore } from "@/lib/stores/plan-store";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export default function NavAuth() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide navbar completely on immersive/auth pages
  if (pathname === "/practice" || pathname === "/login" || pathname === "/signup") return null;

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const userPlan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [navHidden, setNavHidden] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const childData = useChildStore((s) => s.childData);
  const storeChildren = useChildStore((s) => s.children);
  const activeChild = childData || storeChildren[0] || null;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      if (data.session?.user) {
        const uid = data.session.user.id;
        const u = data.session.user;
        setUserName(u.user_metadata?.full_name || u.email || "");
        setUserAvatar(u.user_metadata?.avatar_url || u.user_metadata?.picture || null);

        fetchPlan();
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", uid)
          .single()
          .then(({ data: profile }) => {
            const p = profile as any;
            if (p?.display_name) setUserName(p.display_name);
          });

        // Populate child store if empty so avatar shows
        if (useChildStore.getState().children.length === 0) {
          supabase
            .from("children")
            .select("*")
            .eq("parent_id", uid)
            .order("created_at", { ascending: true })
            .then(({ data: kids }) => {
              if (kids && kids.length > 0) {
                const store = useChildStore.getState();
                store.setChildren(kids as any);
                if (!store.childData) store.setChildData(kids[0] as any);
              }
            });
        }

        // Fetch notifications
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(20)
          .then(({ data: notifs }) => {
            if (notifs) setNotifications(notifs as Notification[]);
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

  // Close notif dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  // Close on route change
  useEffect(() => {
    setNotifOpen(false);
    setNavHidden(false);
  }, [pathname]);

  // Auto-hide nav on scroll down (mobile only)
  useEffect(() => {
    function handleScroll() {
      if (window.innerWidth >= 768) { setNavHidden(false); return; }
      const y = window.scrollY;
      if (y > lastScrollY.current && y > 80) {
        setNavHidden(true);
        setNotifOpen(false);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const supabase = createClient();
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Avatar: prefer child avatar, fall back to parent initial
  const childAvatarSrc = activeChild ? getChildAvatarImage(activeChild, storeChildren.indexOf(activeChild)) : null;
  const displayInitial = activeChild?.first_name?.charAt(0)?.toUpperCase()
    || userName?.charAt(0)?.toUpperCase()
    || "U";

  // Format relative time
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Avoid flicker
  if (loggedIn === null) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 sm:px-6 h-[76px]">
          <div className="flex items-center gap-3">
            <img src="/readee-logo.png" alt="Readee" className="w-[140px] sm:w-[160px] h-auto" />
            <span className="hidden sm:inline text-[13px] text-violet-500 font-medium"><span className="font-bold">Unlock</span> Reading</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-700 transition-transform duration-300"
      style={{ transform: navHidden ? "translateY(-100%)" : undefined }}
    >
      <div className="flex items-center justify-between px-5 sm:px-8 h-[76px]">
        {/* Logo + motto */}
        <Link href={loggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/readee-logo.png" alt="Readee" className="w-[140px] sm:w-[160px] h-auto" />
          <span className="hidden sm:inline text-sm text-violet-500 font-medium"><span className="font-bold">Unlock</span> Reading</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {loggedIn ? (
            <>
              {/* Mobile hamburger (opens sidebar overlay) */}
              <button
                onClick={() => useSidebarStore.getState().setMobileOpen(true)}
                className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Upgrade (free users only — hidden while plan is loading) */}
              {userPlan === "free" && (
                <Link
                  href="/upgrade"
                  className="relative text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Star className="relative w-4 h-4" strokeWidth={1.5} />
                  <span className="relative font-extrabold hidden sm:inline">Upgrade</span>
                </Link>
              )}

              {/* Help */}
              <Link
                href="/contact-us"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-semibold hidden sm:inline">Help</span>
              </Link>

              {/* Notifications bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-10 h-10 rounded-lg flex items-center justify-center text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                      <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors ${
                              n.read ? "opacity-60" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {!n.read && (
                                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                              )}
                              <div className={`flex-1 min-w-0 ${n.read ? "pl-5" : ""}`}>
                                <div className="text-sm font-medium text-zinc-900 leading-tight">{n.title}</div>
                                <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{n.message}</div>
                                <div className="text-[10px] text-zinc-400 mt-1">{timeAgo(n.created_at)}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-6 h-6 text-zinc-300 mx-auto mb-2" strokeWidth={1.5} />
                          <p className="text-sm text-zinc-400">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile avatar */}
              <button
                onClick={() => router.push("/account")}
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all hover:ring-2 hover:ring-indigo-200"
                aria-label="Account"
              >
                {childAvatarSrc ? (
                  <img src={childAvatarSrc} alt={activeChild?.first_name || ""} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                    {displayInitial}
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              {!isAuthPage && (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-indigo-700 transition-colors">
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-semibold px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
