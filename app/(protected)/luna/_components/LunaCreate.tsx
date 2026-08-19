"use client";

/**
 * LunaCreate — Luna's one page. The kid checks off what they want in their
 * story (multi-select), optionally adds their own idea, and Luna generates a
 * passage decodable to their level (via /api/luna/passage), then hands it
 * straight to the orb reader for an Azure-graded read. No images; the orb and
 * the words are the whole experience.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Wand2, RefreshCw, Lock, Check } from "lucide-react";
import LunaOrb from "./LunaOrb";
import LunaReader from "./LunaReader";

type LunaPassage = { grade: string; title: string; text: string; patternLabel?: string | null };

// Tickable story ingredients. Kid agency = the wow. No native emojis
// (Lucide/text only) per the design rules.
const TOPICS = [
  "Animals",
  "Space",
  "Dinosaurs",
  "Sports",
  "Ocean",
  "Magic",
  "Trucks & diggers",
  "Something funny",
];

type Phase = "pick" | "generating" | "reading" | "error";

type Reading = { id: string; title: string; text: string; patternLabel: string | null };

export default function LunaCreate({
  childId,
  childName,
  grade,
  readings = [],
}: {
  childId: string;
  childName: string;
  grade: string;
  readings?: Reading[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [passage, setPassage] = useState<LunaPassage | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState("");
  const [errKind, setErrKind] = useState<"upgrade" | "gen" | "unsafe" | null>(null);

  function toggle(t: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  async function generate(topic: string) {
    setPhase("generating");
    setErrKind(null);
    try {
      const r = await fetch("/api/luna/passage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childId, topic, gradeLevel: grade }),
      });
      if (r.status === 402) {
        setErrKind("upgrade");
        setPhase("error");
        return;
      }
      if (!r.ok) {
        // Server moderation (assertSafePrompt/Output) blocks unsafe topics —
        // show a friendly nudge instead of a generic failure.
        let msg = "";
        try {
          msg = (await r.json())?.error ?? "";
        } catch {
          /* ignore */
        }
        setErrKind(/kid-safe/i.test(msg) ? "unsafe" : "gen");
        setPhase("error");
        return;
      }
      const j = await r.json();
      if (!j?.passage?.text) throw new Error("no passage");
      setPassage({
        grade: j.passage.grade ?? grade,
        title: j.passage.title ?? "Your story",
        text: j.passage.text,
        patternLabel: j.passage.patternLabel ?? null,
      });
      setPhase("reading");
    } catch {
      setErrKind("gen");
      setPhase("error");
    }
  }

  function makeStory() {
    const parts = [...selected];
    if (custom.trim()) parts.push(custom.trim());
    if (parts.length === 0) return;
    generate(parts.join(", "));
  }

  // Re-read a saved keepsake — straight to the orb reader, no generation.
  function reread(r: Reading) {
    setPassage({ grade, title: r.title, text: r.text, patternLabel: r.patternLabel });
    setPhase("reading");
  }

  const canMake = selected.size > 0 || custom.trim().length > 0;

  // Once we have a passage, hand off to the real orb/Azure reader.
  if (phase === "reading" && passage) {
    return (
      <LunaReader childId={childId} childName={childName} passages={[{ ...passage, patternLabel: passage.patternLabel ?? undefined }]} />
    );
  }

  const thinking = phase === "generating";

  return (
    <div className="flex flex-col items-center text-center">
      <LunaOrb mode={thinking ? "thinking" : "idle"} size={200} />

      {thinking ? (
        <p
          className="mt-6 text-lg font-extrabold text-violet-700 dark:text-violet-300"
          style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
        >
          Luna is writing your story…
        </p>
      ) : phase === "error" ? (
        <div className="mt-6">
          {errKind === "upgrade" ? (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <Lock className="h-3 w-3" />
                Readee+
              </div>
              <h2
                className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-white"
                style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
              >
                Make unlimited stories with Luna
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
                Luna writes a new story about anything {childName} loves, at
                their exact reading level, and coaches every word.
              </p>
              <Link
                href="/upgrade?reason=reading_buddy"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Unlock Luna
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-600 dark:text-slate-300">
                {errKind === "unsafe"
                  ? "Let's pick a different idea. Luna keeps every story kid-friendly."
                  : "Luna couldn't finish that one. Let's try again."}
              </p>
              <button
                type="button"
                onClick={() => setPhase("pick")}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
              >
                <RefreshCw className="h-4 w-4" />
                {errKind === "unsafe" ? "Pick another" : "Try again"}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            Luna
          </div>
          <h2
            className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
            style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
          >
            What should your story be about, {childName}?
          </h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-slate-400">
            Tick what you like. Luna makes a story you can read.
          </p>

          {/* Tickable ingredients */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {TOPICS.map((t) => {
              const on = selected.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(t)}
                  className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold shadow-sm transition ${
                    on
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-violet-100 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
                  {t}
                </button>
              );
            })}
          </div>

          {/* Own idea (added to the ticked ones) */}
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={200}
            placeholder="…or add your own idea"
            className="mt-5 w-full max-w-md rounded-full border-2 border-zinc-200 bg-white px-4 py-2 text-center text-sm text-zinc-900 outline-none transition focus:border-violet-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />

          <button
            type="button"
            onClick={makeStory}
            disabled={!canMake}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-base font-extrabold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-700 disabled:cursor-default disabled:opacity-40"
            style={{ fontFamily: "'Baloo 2','Nunito',sans-serif" }}
          >
            <Wand2 className="h-5 w-5" />
            Make my story
          </button>

          {/* Surprise me = a free, instant premade read (no generation). */}
          <button
            type="button"
            onClick={() => router.push(`/luna/read?child=${childId}`)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 transition hover:text-violet-800 dark:text-violet-300"
          >
            <Sparkles className="h-4 w-4" />
            Surprise me
          </button>

          {readings.length > 0 && (
            <div className="mt-8 w-full">
              <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-slate-500">
                My readings
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {readings.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => reread(r)}
                    title={r.title}
                    className="max-w-[220px] truncate rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
