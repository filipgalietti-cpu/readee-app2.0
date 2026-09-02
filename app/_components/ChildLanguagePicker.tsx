"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setChildLanguage } from "@/app/(protected)/account/language-actions";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/strings";
import { Glyph } from "@/app/_components/Glyph";

/**
 * Small inline picker that lets a parent flip a child's content
 * language between English and Spanish. Optimistic UI — we set the
 * new value locally immediately, then roll back on server error.
 */
export default function ChildLanguagePicker({
  childId,
  childName,
  current,
}: {
  childId: string;
  childName: string;
  current: Locale;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Locale>(current);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function change(next: Locale) {
    if (next === value || pending) return;
    const prev = value;
    setValue(next);
    setErr(null);
    start(async () => {
      const res = await setChildLanguage({ childId, language: next });
      if (!res.ok) {
        setValue(prev);
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
        <Glyph name="globe" size={12} />
        {childName}&apos;s language:
      </div>
      <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5">
        {SUPPORTED_LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => change(l.code)}
            disabled={pending}
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition disabled:opacity-60 ${
              value === l.code
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {l.native}
          </button>
        ))}
      </div>
      {pending && <Glyph name="loader2" size={12} className="animate-spin text-zinc-400" />}
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
    </div>
  );
}
