"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useChildStore } from "@/lib/stores/child-store";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import {
  Home, BarChart3, BookText, ListChecks, Map,
  Carrot, Trophy, ChevronDown, ClipboardCheck,
} from "lucide-react";

/* ─── Nav items ──────────────────────────────────── */

function getNavSections(childId: string | null) {
  const q = childId ? `?child=${childId}` : "";
  return [
    {
      label: "Main",
      items: [
        { href: "/dashboard", icon: Home, label: "Dashboard" },
        { href: `/assessment-results${q}`, icon: ClipboardCheck, label: "Placement Test" },
        { href: `/analytics${q}`, icon: BarChart3, label: "Analytics" },
      ],
    },
    {
      label: "Learning",
      items: [
        { href: "/word-bank", icon: BookText, label: "Word Bank" },
        { href: `/practice-hub${q}`, icon: ListChecks, label: "Practice" },
        { href: `/journey${q}`, icon: Map, label: "Reading Journey" },
      ],
    },
    {
      label: "Fun",
      items: [
        { href: `/shop${q}`, icon: Carrot, label: "Shop", iconColor: "w-[17px] h-[17px] text-orange-500" },
        { href: `/leaderboard${q}`, icon: Trophy, label: "Leaderboard" },
      ],
    },
  ];
}

/* ─── Helpers ────────────────────────────────────── */

function isActive(pathname: string, href: string) {
  return pathname === href.split("?")[0];
}

function navLinkClass(pathname: string, href: string, emphasis?: boolean) {
  if (emphasis && !isActive(pathname, href)) {
    return "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60";
  }
  return `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
    isActive(pathname, href)
      ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950/40 dark:text-indigo-300"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
  }`;
}

function navIconClass(pathname: string, href: string) {
  return `w-4 h-4 ${isActive(pathname, href) ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-slate-500"}`;
}

function collapsedIconClass(pathname: string, href: string) {
  return isActive(pathname, href)
    ? "w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 transition-colors"
    : "w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors";
}

function collapsedIconColor(pathname: string, href: string) {
  return `w-5 h-5 ${isActive(pathname, href) ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-500 dark:text-slate-400"}`;
}

/* ─── SidebarTooltip ─────────────────────────────── */

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  return (
    <div
      className="relative"
      onMouseEnter={() => { timeout.current = setTimeout(() => setShow(true), 200); }}
      onMouseLeave={() => { if (timeout.current) clearTimeout(timeout.current); setShow(false); }}
    >
      {children}
      {show && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium shadow-lg whitespace-nowrap">
            {label}
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-zinc-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  AppSidebar                                         */
/* ═══════════════════════════════════════════════════ */

export default function AppSidebar() {
  const pathname = usePathname();
  const open = useSidebarStore((s) => s.open);
  const setOpen = useSidebarStore((s) => s.setOpen);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  const childData = useChildStore((s) => s.childData);
  const storeChildren = useChildStore((s) => s.children);
  const activeChild = childData || storeChildren[0] || null;
  const childIndex = activeChild ? storeChildren.indexOf(activeChild) : 0;
  const avatarSrc = activeChild ? getChildAvatarImage(activeChild, childIndex === -1 ? 0 : childIndex) : null;

  const sections = getNavSections(activeChild?.id || null);

  // Close mobile overlay on route change
  useEffect(() => { setMobileOpen(false); }, [pathname, setMobileOpen]);

  return (
    <>
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="absolute top-0 left-0 bottom-0 w-[272px] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border-r border-zinc-200 dark:border-slate-700"
            >
              <ExpandedNav
                pathname={pathname}
                sections={sections}
                avatarSrc={avatarSrc}
                childName={activeChild?.first_name || null}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Desktop fixed sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-[76px] left-0 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-700 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "w-[272px]" : "w-[72px]"
        }`}
      >
        <div className="flex flex-col h-full">
          {open ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              <ExpandedNav
                pathname={pathname}
                sections={sections}
                avatarSrc={avatarSrc}
                childName={activeChild?.first_name || null}
                onToggle={() => setOpen(false)}
              />
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
                onClick={() => setOpen(true)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors mb-2"
                aria-label="Expand sidebar"
              >
                <ChevronDown className="w-5 h-5 text-zinc-400 dark:text-slate-500 rotate-90" strokeWidth={2} />
              </button>

              {sections.map(({ label, items }, sIdx) => (
                <div key={label}>
                  {sIdx > 0 && <div className="w-5 h-px bg-zinc-200 dark:bg-slate-700 my-2" />}
                  <div className="space-y-1">
                    {items.map(({ href, icon: Icon, label: itemLabel, iconColor }: any) => (
                      <SidebarTooltip key={href} label={itemLabel}>
                        <Link href={href} className={collapsedIconClass(pathname, href)}>
                          <Icon className={iconColor || collapsedIconColor(pathname, href)} strokeWidth={1.5} />
                        </Link>
                      </SidebarTooltip>
                    ))}
                  </div>
                </div>
              ))}

              {/* Avatar at bottom */}
              {avatarSrc && (
                <div className="mt-auto">
                  <SidebarTooltip label={activeChild?.first_name || "Reader"}>
                    <button
                      onClick={() => setOpen(true)}
                      className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-zinc-200 dark:ring-slate-700 hover:ring-indigo-300 dark:hover:ring-indigo-600 transition-all"
                    >
                      <img src={avatarSrc} alt={activeChild?.first_name || ""} className="w-full h-full object-cover" draggable={false} />
                    </button>
                  </SidebarTooltip>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ─── Expanded nav content (shared by mobile + desktop) ── */

function ExpandedNav({
  pathname,
  sections,
  avatarSrc,
  childName,
  onClose,
  onToggle,
}: {
  pathname: string;
  sections: ReturnType<typeof getNavSections>;
  avatarSrc: string | null;
  childName: string | null;
  onClose?: () => void;
  onToggle?: () => void;
}) {
  const dismiss = onClose || onToggle;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2.5">
        {avatarSrc && (
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200 dark:ring-slate-700">
            <img src={avatarSrc} alt={childName || ""} className="w-full h-full object-cover" draggable={false} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-slate-100 truncate leading-tight">
            {childName || "Reader"}
          </div>
        </div>
        {dismiss && (
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Collapse"
          >
            <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-slate-500 -rotate-90" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="mx-3 h-px bg-zinc-200 dark:bg-slate-700" />

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {sections.map(({ label, items }) => (
          <div key={label} className="px-3">
            <p className="px-2 mb-1 text-[11px] font-semibold text-zinc-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            <nav className="space-y-0.5">
              {items.map(({ href, icon: Icon, label: itemLabel, iconColor, emphasis }: any) => (
                <Link key={href} href={href} onClick={onClose} className={navLinkClass(pathname, href, emphasis)}>
                  <Icon className={iconColor || (emphasis && !isActive(pathname, href) ? "w-4 h-4 text-indigo-500" : navIconClass(pathname, href))} strokeWidth={1.5} />
                  <span>{itemLabel}</span>
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
