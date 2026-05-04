"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  Languages,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Mail,
} from "lucide-react";
import {
  draftParentLetterAction,
  translateParentLetterAction,
} from "@/lib/ai/path-actions";
import { SUPPORTED_LANGUAGES } from "@/lib/ai/build-parent-letter.shared";

type Translation = {
  language: string;
  languageLabel: string;
  subject: string;
  body: string;
};

export default function ParentLetterEditor({
  classroomId,
}: {
  classroomId: string;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [drafting, startDraft] = useTransition();
  const [translating, startTranslate] = useTransition();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pendingLang, setPendingLang] = useState<string | null>(null);

  function draft() {
    setErr(null);
    setTranslations([]);
    startDraft(async () => {
      const res = await draftParentLetterAction({ classroomId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSubject(res.subject);
      setBody(res.body);
    });
  }

  function translate(code: string, label: string) {
    if (!subject.trim() || !body.trim()) {
      setErr("Draft a letter first.");
      return;
    }
    setErr(null);
    setPendingLang(code);
    startTranslate(async () => {
      const res = await translateParentLetterAction({
        subject,
        body,
        targetLanguage: code,
        targetLanguageLabel: label,
      });
      setPendingLang(null);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setTranslations((prev) => {
        const filtered = prev.filter((t) => t.language !== code);
        return [
          ...filtered,
          {
            language: code,
            languageLabel: label,
            subject: res.subject,
            body: res.body,
          },
        ];
      });
    });
  }

  function copyVersion(key: string, subj: string, b: string) {
    const text = `Subject: ${subj}\n\n${b}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* English original */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              English original
            </div>
            <h2 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
              Letter
            </h2>
          </div>
          <button
            type="button"
            onClick={draft}
            disabled={drafting}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {drafting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Drafting…
              </>
            ) : (
              <>
                {subject || body ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {subject || body ? "Re-draft" : "AI draft"}
              </>
            )}
          </button>
        </div>

        <label className="mt-4 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Subject
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Click 'AI draft' or type your own"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <label className="mt-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="The letter body."
          rows={10}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-zinc-500">
            Translate this version to send to families in their language.
          </div>
          <button
            type="button"
            onClick={() => copyVersion("en", subject, body)}
            disabled={!subject && !body}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {copiedKey === "en" ? (
              <>
                <Check className="h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy English
              </>
            )}
          </button>
        </div>
      </div>

      {/* Translation toolbar */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-violet-600" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Translate to
          </h3>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
          Each translation costs 1 credit and runs in seconds.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.map((l) => {
            const has = translations.some((t) => t.language === l.code);
            const isPending = pendingLang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => translate(l.code, l.label)}
                disabled={translating || (!subject && !body)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  has
                    ? "border-violet-400 bg-violet-100 font-bold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                } disabled:opacity-50`}
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                {l.label}
                {has && !isPending && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {/* Translated versions */}
      {translations.map((t) => (
        <div
          key={t.language}
          className="rounded-3xl border border-violet-200 bg-violet-50/40 p-6 dark:border-violet-900/40 dark:bg-violet-950/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                Translation
              </div>
              <h3 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
                {t.languageLabel}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => copyVersion(t.language, t.subject, t.body)}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-50"
            >
              {copiedKey === t.language ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-white p-4 dark:bg-slate-900">
            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Subject
            </div>
            <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
              {t.subject}
            </div>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Body
            </div>
            <p
              className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-800 dark:text-slate-200"
              dir={
                t.language === "ar"
                  ? "rtl"
                  : "ltr"
              }
            >
              {t.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
