"use client";

import { useState } from "react";
import { Languages, Loader2, ChevronDown } from "lucide-react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "ht", label: "Kreyòl Ayisyen" },
  { code: "pt", label: "Português" },
  { code: "tl", label: "Tagalog" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
];

/**
 * Drop-in translator. Pass the original English text; the toggle picks
 * a language and replaces the rendered text with the translation.
 *
 * Caches at the API layer, so language hops are essentially free after
 * the first parent translates a given passage.
 */
export default function TranslateToggle({
  source,
  className,
  textClassName,
}: {
  source: string;
  className?: string;
  textClassName?: string;
}) {
  const [lang, setLang] = useState<string>("en");
  const [translated, setTranslated] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function pick(code: string) {
    setOpen(false);
    setErr(null);
    if (code === "en") {
      setLang("en");
      setTranslated(null);
      return;
    }
    setLang(code);
    setPending(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, lang: code }),
      });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Translation failed.");
      } else {
        setTranslated(json.translated as string);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Translation failed.");
    } finally {
      setPending(false);
    }
  }

  const current = LANGS.find((l) => l.code === lang);

  return (
    <div className={className}>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 hover:border-violet-300 hover:text-violet-700"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Languages className="h-3 w-3" />
          )}
          {current?.label ?? "Translate"}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-30 mt-1 max-h-60 w-44 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => pick(l.code)}
                className={`block w-full px-3 py-1.5 text-left text-xs ${
                  l.code === lang
                    ? "bg-violet-50 font-bold text-violet-700"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {err && (
        <div className="mt-1 text-[11px] font-semibold text-red-600">{err}</div>
      )}
      <div
        className={textClassName}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {translated && lang !== "en" ? translated : source}
      </div>
    </div>
  );
}
