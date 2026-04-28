"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Languages } from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";

const LANGS = [
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

export default function TranslatePlayground() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("es");
  const [out, setOut] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  async function go() {
    setErr(null);
    setOut(null);
    setCached(false);
    if (!source.trim()) {
      setErr("Paste some text first.");
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, lang: target }),
      });
      const json = await r.json();
      if (!json.ok) setErr(json.error ?? "Translation failed.");
      else {
        setOut(json.translated as string);
        setCached(!!json.cached);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Translation failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <textarea
          rows={6}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Paste English text here…"
          className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-fuchsia-500 focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
            Target
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={go}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-bold text-white hover:bg-fuchsia-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
            Translate
          </button>
        </div>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {pending && !out && (
        <div className="rounded-3xl border border-fuchsia-100 bg-white px-5 py-10">
          <ReadeeAiLoader
            size={140}
            label="Readee.ai is translating"
            caption="Translating…"
          />
        </div>
      )}

      {out && (
        <div className="rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-700">
              {LANGS.find((l) => l.code === target)?.label}
            </div>
            {cached && (
              <div className="text-[10px] font-bold text-fuchsia-700">
                cached · free
              </div>
            )}
          </div>
          <p
            className="mt-2 whitespace-pre-line text-sm text-zinc-900"
            dir={target === "ar" ? "rtl" : "ltr"}
          >
            {out}
          </p>
        </div>
      )}
    </div>
  );
}
