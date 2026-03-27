"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "@/lib/stores/child-store";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  Home, BarChart3, BookText, ListChecks, Map, Carrot, Trophy,
  ChevronDown, User, CreditCard, Bell, LogOut, ChevronsUpDown,
} from "lucide-react";

/**
 * Shared shell for settings pages (Account, Billing, Notifications).
 * Renders the sidebar nav + main content area, matching the dashboard layout.
 */
export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const childData = useChildStore((s) => s.childData);
  const storeChildren = useChildStore((s) => s.children);
  const setStoreChildren = useChildStore((s) => s.setChildren);
  const activeChild = childData || storeChildren[0] || null;
  const childIndex = activeChild ? storeChildren.indexOf(activeChild) : 0;
  const avatarSrc = activeChild ? getChildAvatarImage(activeChild, childIndex) : null;
  const childName = activeChild?.first_name || "Reader";
  const readingLevel = activeChild?.reading_level || null;

  // Load children into store if not already loaded (e.g. navigated directly to /account)
  useEffect(() => {
    if (storeChildren.length > 0) return;
    async function loadChildren() {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });
      if (data && data.length > 0) setStoreChildren(data as any);
    }
    loadChildren();
  }, [storeChildren.length, setStoreChildren]);

  // Remove main container constraints
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) { main.style.padding = "0"; main.style.maxWidth = "none"; }
    return () => {
      if (main) { main.style.padding = ""; main.style.maxWidth = ""; }
    };
  }, []);

  const isActive = (href: string) => pathname === href.split("?")[0];

  const navLinkClass = (href: string) =>
    `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
      isActive(href)
        ? "bg-indigo-50 text-indigo-700 font-medium"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  const navIconClass = (href: string) =>
    `w-4 h-4 ${isActive(href) ? "text-indigo-500" : "text-zinc-400"}`;

  const childId = activeChild?.id || "";

  const NAV_SECTIONS = [
    {
      label: "Main",
      items: [
        { href: "/dashboard", icon: Home, label: "Dashboard" },
        { href: `/analytics?child=${childId}`, icon: BarChart3, label: "Analytics", path: "/analytics" },
      ],
    },
    {
      label: "Learning",
      items: [
        { href: "/word-bank", icon: BookText, label: "Word Bank" },
        { href: "/question-bank", icon: ListChecks, label: "Question Bank" },
        { href: `/roadmap?child=${childId}`, icon: Map, label: "Reading Journey", path: "/roadmap" },
      ],
    },
    {
      label: "Fun",
      items: [
        { href: `/shop?child=${childId}`, icon: Carrot, label: "Shop", path: "/shop", iconColor: "w-[17px] h-[17px] text-orange-500" },
        { href: `/leaderboard?child=${childId}`, icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
      ],
    },
  ];

  return (
    <>
      {/* Fixed sidebar (desktop) */}
      <aside
        className={`hidden lg:flex flex-col fixed top-[76px] left-0 bottom-0 z-30 bg-white/80 backdrop-blur-sm border-r border-zinc-200 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarOpen ? "w-[272px]" : "w-[72px]"
        }`}
      >
        <div className="flex flex-col h-full">
          {sidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-3 pt-3 pb-2 flex items-center gap-2.5">
                  {avatarSrc && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200">
                      <img src={avatarSrc} alt={childName} className="w-full h-full object-cover" draggable={false} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate leading-tight">{childName}</div>
                    {readingLevel && <div className="text-[11px] text-zinc-500 leading-tight">{readingLevel}</div>}
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-indigo-50 border border-zinc-200 transition-colors"
                    title="Collapse sidebar"
                  >
                    <ChevronDown className="w-4 h-4 text-indigo-500 -rotate-90" strokeWidth={2} />
                  </button>
                </div>

                <div className="mx-3 h-px bg-zinc-200" />

                {/* Nav sections */}
                <div className="flex-1 overflow-y-auto py-2 space-y-4">
                  {NAV_SECTIONS.map(({ label, items }) => (
                    <div key={label} className="px-3">
                      <p className="px-2 mb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
                      <nav className="space-y-0.5">
                        {items.map(({ href, icon: Icon, label: itemLabel, iconColor }: any) => (
                          <Link key={href} href={href} className={navLinkClass(href)}>
                            <Icon className={iconColor || navIconClass(href)} strokeWidth={1.5} />
                            <span>{itemLabel}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mx-3 h-px bg-zinc-200" />
                <SettingsUserMenu avatarSrc={avatarSrc} name={childName} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-col items-center h-full py-3"
            >
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors mb-2"
              >
                <ChevronDown className="w-5 h-5 text-zinc-400 rotate-90" strokeWidth={2} />
              </button>
              {[
                { href: "/dashboard", icon: Home, label: "Dashboard" },
                { href: `/analytics?child=${childId}`, icon: BarChart3, label: "Analytics" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors" title={label}>
                  <Icon className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                </Link>
              ))}
              <div className="w-5 h-px bg-zinc-200 my-2" />
              {[
                { href: "/word-bank", icon: BookText, label: "Word Bank" },
                { href: "/question-bank", icon: ListChecks, label: "Question Bank" },
                { href: `/roadmap?child=${childId}`, icon: Map, label: "Reading Journey" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors" title={label}>
                  <Icon className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                </Link>
              ))}
              <div className="w-5 h-px bg-zinc-200 my-2" />
              {[
                { href: `/shop?child=${childId}`, icon: Carrot, label: "Shop", color: "text-orange-500" },
                { href: `/leaderboard?child=${childId}`, icon: Trophy, label: "Leaderboard" },
              ].map(({ href, icon: Icon, label, color }: any) => (
                <Link key={href} href={href} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors" title={label}>
                  <Icon className={`w-5 h-5 ${color || "text-zinc-500"}`} strokeWidth={1.5} />
                </Link>
              ))}
              <div className="mt-auto">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-zinc-200 hover:ring-indigo-300 transition-all"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={childName} className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {childName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`min-h-[calc(100vh-76px)] transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? "lg:ml-[272px]" : "lg:ml-[72px]"}`}>
        {children}
      </div>
    </>
  );
}

/* ─── Simplified user menu for settings pages ─── */

function SettingsUserMenu({ avatarSrc, name }: { avatarSrc: string | null; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div ref={ref} className="relative px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200">
          {avatarSrc ? (
            <img src={avatarSrc} alt={name} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-medium text-zinc-900 truncate">{name}</div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-zinc-400 flex-shrink-0" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden z-50"
          >
            <div className="py-1 px-1">
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors">
                <User className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> Account
              </Link>
              <Link href="/billing" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors">
                <CreditCard className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> Billing
              </Link>
              <Link href="/notifications" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors">
                <Bell className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> Notifications
              </Link>
            </div>
            <div className="h-px bg-zinc-100" />
            <div className="py-1 px-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors">
                <LogOut className="w-4 h-4 text-zinc-400" strokeWidth={1.5} /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
