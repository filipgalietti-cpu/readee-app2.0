"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import SettingsShell from "@/app/_components/SettingsShell";
import Link from "next/link";
import {
  LifeBuoy,
  ChevronDown,
  Mail,
  Send,
  Loader2,
  Check,
} from "lucide-react";

/** Parent-facing help center: quick answers to the most common questions
 *  plus a contact form that emails hello@readee.app (replyTo the parent),
 *  reusing the existing /api/contact route. The FAQ deflects the easy
 *  questions so the inbox stays focused on real ones. */

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What does my child do on Readee each day?",
    a: (
      <>
        Readee builds a short daily plan from your child&apos;s reading level —
        a lesson, some practice, and a story. Each lesson follows the same
        three steps: <strong>Lesson</strong> (learn it), <strong>Practice</strong>{" "}
        (try it), and <strong>Excel</strong> (stretch it). Just tap{" "}
        <em>Today&apos;s Plan</em> on the home screen and press play.
      </>
    ),
  },
  {
    q: "How do I change my child's grade or reading level?",
    a: (
      <>
        Open <Link href="/settings" className="text-indigo-600 font-semibold underline">Settings</Link>{" "}
        and update your child&apos;s grade. Readee adapts the difficulty as they
        practice, so it&apos;s fine to start a little easy — the app moves them
        up as they master skills. You can also re-take the placement test any
        time from the dashboard.
      </>
    ),
  },
  {
    q: "How does Readee+ billing work, and how do I cancel?",
    a: (
      <>
        Readee+ is <strong>$9.99/month</strong> (or $6.99/month billed
        annually) and unlocks all lessons, stories, and analytics. It&apos;s
        month-to-month through Stripe — cancel anytime from{" "}
        <Link href="/account" className="text-indigo-600 font-semibold underline">Account → Billing</Link>{" "}
        and you keep access through the end of the period. No app-store fees,
        no lock-in.
      </>
    ),
  },
  {
    q: "Is my child's information private?",
    a: (
      <>
        Yes. Readee is built for families and follows COPPA — we never sell
        data or show third-party ads to children. You can read the full{" "}
        <Link href="/privacy-policy" className="text-indigo-600 font-semibold underline">Privacy Policy</Link>,
        and you can request deletion of your child&apos;s data any time from
        Account.
      </>
    ),
  },
  {
    q: "The app isn't working — a lesson won't load or audio is silent.",
    a: (
      <>
        First try a full refresh, and make sure your device isn&apos;t on
        silent (lessons use read-aloud audio). If it keeps happening, send us a
        note below with your child&apos;s name and what you were doing — we
        answer every message.
      </>
    ),
  },
  {
    q: "My child finds it too easy or too hard. What should I do?",
    a: (
      <>
        Readee adjusts automatically as your child answers, but you can nudge
        it: bump the grade in Settings for more challenge, or re-take the
        placement test for a fresh read on their level. When in doubt, message
        us — we&apos;re happy to help you calibrate it.
      </>
    ),
  },
];

function Faq({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-zinc-900">{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-sm leading-relaxed text-zinc-600">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Prefill from the signed-in parent so they don't retype their email.
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabaseBrowser().auth.getUser();
      if (user?.email) setEmail(user.email);
      const meta = user?.user_metadata as { display_name?: string; full_name?: string } | undefined;
      if (meta?.display_name || meta?.full_name) setName(meta.display_name || meta.full_name || "");
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) setMessage("");
    } catch {
      setResult({ success: false, message: "Something went wrong. Please email hello@readee.app directly." });
    }
    setSending(false);
  }

  return (
    <SettingsShell>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Help &amp; Support</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Quick answers, or send us a note — we reply to every message.</p>
          </div>
        </div>

        {/* FAQ */}
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-base font-semibold text-zinc-900">Common questions</h2>
          </div>
          <div>
            {FAQS.map((f) => (
              <Faq key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
            <h2 className="text-base font-semibold text-zinc-900">Still need help?</h2>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-600">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Jane Doe"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-600">How can we help?</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Tell us what's going on…"
              />
            </label>

            {result && (
              <div
                role="status"
                className={`text-sm rounded-xl px-3 py-2 font-medium ${
                  result.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}
              >
                {result.success ? "Thanks — we got it and will reply soon." : result.message}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : result?.success ? (
                  <><Check className="w-4 h-4" /> Sent</>
                ) : (
                  <><Send className="w-4 h-4" /> Send message</>
                )}
              </button>
              <span className="text-xs text-zinc-400">
                or email{" "}
                <a href="mailto:hello@readee.app" className="text-indigo-600 font-semibold">hello@readee.app</a>
              </span>
            </div>
          </form>
        </section>
      </div>
    </SettingsShell>
  );
}
