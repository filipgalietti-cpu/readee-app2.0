"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Two-column auth shell (from the Claude Design "Readee Auth"): the form
 * lives in a centered left column with the logo + a Sign in / Create account
 * tab toggle on top; a marketing side panel (bunny + stats) shows on the right
 * at ≥lg. Replaces the old AuthCard for /login and /signup. The tabs are real
 * route links so each page keeps its own auth wiring.
 */
export default function AuthLayout({
  mode,
  showTabs = true,
  children,
}: {
  /** Which tab is active — also which route this page is. */
  mode: "signin" | "signup";
  /** Hide the tab toggle for sub-views (forgot password, check-your-email). */
  showTabs?: boolean;
  children: React.ReactNode;
}) {
  // Carry any query params (?redirect=, ?as=teacher, ?next=) across the toggle.
  const search = typeof window !== "undefined" ? window.location.search : "";
  const tab = (active: boolean) =>
    `rounded-full py-2.5 text-sm font-extrabold transition-all ${
      active ? "bg-white text-indigo-950 shadow-[0_1px_4px_rgba(24,24,27,0.12)]" : "bg-transparent text-zinc-500"
    }`;

  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden">
      {/* ── Form column ── */}
      <div className="flex-1 flex justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-[360px] mx-auto pb-10" style={{ paddingTop: "max(40px, calc(50vh - 340px))" }}>
          <Image
            src="/readee-logo.png"
            alt="Readee — Learn to Read"
            width={612}
            height={408}
            priority
            className="w-44 h-auto mx-auto mb-6"
          />

          {showTabs && (
            <div className="grid grid-cols-2 gap-1 rounded-full bg-zinc-100 p-1 mb-6">
              <Link href={`/login${search}`} className={`text-center ${tab(mode === "signin")}`}>
                Sign in
              </Link>
              <Link href={`/signup${search}`} className={`text-center ${tab(mode === "signup")}`}>
                Create account
              </Link>
            </div>
          )}

          {children}
        </div>
      </div>

      {/* ── Marketing side panel (desktop) ── */}
      <div
        className="hidden lg:flex w-[52%] relative flex-col items-center justify-center p-12 box-border"
        style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #ffffff 40%, #eef2ff 75%, #e0f2fe 100%)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: "url('/images/auth-bg.webp')", backgroundRepeat: "repeat", backgroundSize: "420px", opacity: 0.35 }}
        />
        <Image
          src="/images/ui/bunny-reading.png"
          alt="Readee bunny reading"
          width={240}
          height={240}
          className="relative w-60 h-60 object-cover rounded-full border-[6px] border-indigo-800 shadow-[0_20px_50px_-15px_rgba(49,46,129,0.4)]"
        />
        <div className="relative mt-7 text-center font-[family-name:var(--font-baloo)] font-extrabold text-[28px] text-indigo-950">
          Unlock the Joy of Reading
        </div>
        <p className="relative mt-2 max-w-[380px] text-center text-[15px] leading-relaxed text-zinc-600">
          Expert-designed lessons that help young readers build confidence and comprehension.
        </p>
        <div className="relative mt-8 flex gap-4">
          {[
            { n: "900+", l: "practice questions" },
            { n: "200+", l: "lessons" },
            { n: "10 min", l: "a day" },
          ].map((s) => (
            <div key={s.l} className="text-center rounded-2xl border border-indigo-100 bg-white/85 px-5 py-3">
              <div className="font-[family-name:var(--font-baloo)] font-extrabold text-2xl text-indigo-700">{s.n}</div>
              <div className="text-[13px] text-zinc-600">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
