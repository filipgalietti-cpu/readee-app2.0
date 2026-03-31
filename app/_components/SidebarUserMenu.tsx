"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { User, CreditCard, Bell, LogOut, ChevronsUpDown } from "lucide-react";

export function SidebarUserMenu({
  avatarSrc,
  name,
  plan,
}: {
  avatarSrc: string;
  name: string;
  plan: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
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
        className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200 dark:ring-slate-700">
          <img src={avatarSrc} alt={name} className="w-full h-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-medium text-zinc-900 dark:text-slate-100 truncate">{name}</div>
          <div className="text-[11px] text-zinc-400 dark:text-slate-500">
            {plan === "premium" ? "Readee+" : "Free Plan"}
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-zinc-400 dark:text-slate-500 flex-shrink-0" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50"
          >
            <div className="px-3 py-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200 dark:ring-slate-700">
                <img src={avatarSrc} alt={name} className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-zinc-900 dark:text-slate-100 truncate">{name}</div>
                <div className={`text-[11px] ${plan === "premium" ? "text-violet-500 font-medium" : "text-zinc-500 dark:text-slate-400"}`}>
                  {plan === "premium" ? "Readee+ Member" : "Free Plan"}
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-slate-800" />

            <div className="py-1 px-1">
              <Link href="/account" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors">
                <User className="w-4 h-4 text-zinc-400 dark:text-slate-500" strokeWidth={1.5} />
                Account
              </Link>
              <Link href="/billing" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors">
                <CreditCard className="w-4 h-4 text-zinc-400 dark:text-slate-500" strokeWidth={1.5} />
                Billing
              </Link>
              <Link href="/notifications" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors">
                <Bell className="w-4 h-4 text-zinc-400 dark:text-slate-500" strokeWidth={1.5} />
                Notifications
              </Link>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-slate-800" />

            <div className="py-1 px-1">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors">
                <LogOut className="w-4 h-4 text-zinc-400 dark:text-slate-500" strokeWidth={1.5} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
