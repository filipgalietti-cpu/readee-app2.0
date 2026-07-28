"use client";

/**
 * Karaoke story reader — the redesigned Stories reading experience.
 *
 *   K–2 (mode "line"):  one sentence centered at a time, amber word-highlight
 *                       synced to real audio timing, SLOW pacing. K–2 auto-play.
 *   3–4 (mode "prose"): whole paragraph shown fully readable; grey-out + word
 *                       highlight only start when the reader taps "Read it to me".
 *
 * Word timing comes from app/data/stories-karaoke.json (Whisper forced-
 * alignment — same tech as lesson karaoke), NOT browser speech.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, Play, Pause, Check, ArrowLeft } from "lucide-react";
import { useAudio } from "@/lib/audio/use-audio";

export type KaraokeWord = { t: string; start: number; end: number };
export type KaraokeSentence = { text: string; audioUrl?: string; words: KaraokeWord[] };
export type StoryKaraoke = {
  mode: "line" | "prose";
  autoplay: boolean;
  wholeAudio?: string;
  sentences: KaraokeSentence[];
};

type Props = {
  title: string;
  grade: string;
  imageUrl: string;
  fallbackText: string;
  fallbackAudioUrl: string;
  karaoke?: StoryKaraoke;
  onBack: () => void;
  onFinishReading: () => void;
};

// If a sentence got no aligned words (rare Whisper miss on whole-passage
// audio), fall back to its plain words so the text still renders (no karaoke).
function wordsOf(s: KaraokeSentence): KaraokeWord[] {
  return s.words && s.words.length
    ? s.words
    : s.text.split(/\s+/).filter(Boolean).map((t) => ({ t, start: 0, end: 0 }));
}

// Slower inter-sentence breath for the youngest readers.
function sentencePauseMs(grade: string): number {
  if (grade === "kindergarten" || grade === "1st") return 1500;
  if (grade === "2nd") return 1000;
  return 700;
}

export default function StoryKaraokeReader({
  title,
  grade,
  imageUrl,
  fallbackText,
  fallbackAudioUrl,
  karaoke,
  onBack,
  onFinishReading,
}: Props) {
  const { playUrl, stop } = useAudio();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [litWord, setLitWord] = useState(-1);
  const [usedAudio, setUsedAudio] = useState(false); // prose: has read-along begun

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const halt = useCallback(() => {
    clearTimers();
    stop();
    setPlaying(false);
    setLitWord(-1);
  }, [clearTimers, stop]);

  useEffect(() => () => halt(), [halt]); // cleanup on unmount

  const isProse = karaoke?.mode === "prose";
  const sentences = useMemo(() => karaoke?.sentences ?? [], [karaoke]);

  // Schedule the amber word-highlight for one sentence's words, offset by `base` ms.
  const scheduleWords = useCallback((words: KaraokeWord[], base = 0) => {
    words.forEach((w, wi) => {
      timers.current.push(setTimeout(() => setLitWord(wi), base + Math.max(0, w.start * 1000)));
    });
  }, []);

  // ── Line mode (K–2): play one sentence, then auto-advance ──
  const playLine = useCallback(
    (i: number) => {
      clearTimers();
      const s = sentences[i];
      if (!s) return;
      setLineIdx(i);
      setPlaying(true);
      setLitWord(-1);
      if (s.audioUrl) playUrl(s.audioUrl);
      scheduleWords(s.words);
      const last = s.words[s.words.length - 1];
      const endMs = (last ? last.end * 1000 : 2500) + sentencePauseMs(grade);
      timers.current.push(
        setTimeout(() => {
          setLitWord(-1);
          if (i + 1 < sentences.length) {
            playLine(i + 1);
          } else {
            setPlaying(false);
          }
        }, endMs),
      );
    },
    [sentences, clearTimers, playUrl, scheduleWords, grade],
  );

  // Auto-play for K–2 on open.
  useEffect(() => {
    if (karaoke && !isProse && karaoke.autoplay) {
      playLine(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [karaoke?.mode]);

  const toggleLinePlay = () => {
    if (playing) {
      halt();
    } else {
      playLine(lineIdx >= sentences.length ? 0 : lineIdx);
    }
  };
  const replayLine = () => playLine(lineIdx);

  // ── Prose mode (3–4): read-along across the whole clip ──
  const startProse = useCallback(() => {
    if (!karaoke) return;
    clearTimers();
    setUsedAudio(true);
    setPlaying(true);
    if (karaoke.wholeAudio) playUrl(karaoke.wholeAudio);
    // Highlight sentence-by-sentence; each word's start is an absolute offset
    // into the whole recording.
    let maxEnd = 0;
    karaoke.sentences.forEach((s, si) => {
      const first = s.words[0];
      if (first) {
        timers.current.push(
          setTimeout(() => {
            setLineIdx(si);
            setLitWord(-1);
          }, first.start * 1000),
        );
      }
      s.words.forEach((w, wi) => {
        timers.current.push(setTimeout(() => setLitWord(wi), w.start * 1000));
        maxEnd = Math.max(maxEnd, w.end * 1000);
      });
    });
    timers.current.push(setTimeout(() => { setPlaying(false); setLitWord(-1); }, maxEnd + 400));
  }, [karaoke, clearTimers, playUrl]);

  const toggleProse = () => (playing ? halt() : startProse());

  const back = () => { halt(); onBack(); };
  const finish = () => { halt(); onFinishReading(); };

  // ── Graceful fallback if this story has no karaoke data yet ──
  if (!karaoke || sentences.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button onClick={back} className="mb-4 flex items-center gap-1 text-sm font-semibold text-violet-600">
          <ArrowLeft className="h-4 w-4" /> Back to Stories
        </button>
        <div className="overflow-hidden rounded-3xl bg-white shadow-md">
          <Image src={imageUrl} alt="" width={640} height={360} className="aspect-video w-full bg-violet-50 object-contain" />
          <div className="p-6">
            <h1 className="mb-3 text-xl font-extrabold text-zinc-900">{title}</h1>
            <div className="space-y-2">
              {fallbackText.split(/(?<=[.!?"])\s+/).map((s, i) => (
                <p key={i} className="text-base leading-relaxed text-zinc-700">{s}</p>
              ))}
            </div>
            <button onClick={() => playUrl(fallbackAudioUrl)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-100">
              <Volume2 className="h-4 w-4" /> Listen
            </button>
            <button onClick={finish} className="mt-4 block w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 py-4 text-base font-extrabold text-white shadow-sm active:scale-[0.98]">
              I&apos;m done reading →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const atEnd = lineIdx >= sentences.length - 1 && !playing;

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-6"
      style={{ background: "linear-gradient(160deg,#e8e0ff 0%,#ffffff 45%,#e0ecff 100%)" }}
    >
      <div className="mb-4 flex items-center gap-3">
        <button onClick={back} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-700 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-xl font-extrabold text-indigo-950" style={{ fontFamily: "var(--font-baloo, inherit)" }}>{title}</h1>
        <div className="w-11" />
      </div>

      {/* Book spread */}
      <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:flex-row" style={{ minHeight: 480 }}>
        <div className="md:w-[44%]">
          <Image src={imageUrl} alt="" width={640} height={640} className="h-56 w-full bg-[#ede9fe] object-cover md:h-full" style={{ objectPosition: "center 15%" }} />
        </div>
        <div className="flex flex-1 flex-col justify-between p-8" style={{ background: "#fffdf8" }}>
          {isProse ? (
            /* ── 3–4: whole paragraph, grey-out only after read-along ── */
            <p className="text-[20px] font-bold leading-[1.85]">
              {sentences.map((s, si) => {
                const d = si - lineIdx;
                const color = !usedAudio ? "#3f3f46" : si === lineIdx ? "#1e1b4b" : d < 0 ? "#a1a1aa" : "#c4c4cc";
                return (
                  <span key={si} style={{ color, transition: "color 0.4s" }}>
                    {wordsOf(s).map((w, wi) => (
                      <span
                        key={wi}
                        style={{
                          background: usedAudio && playing && si === lineIdx && wi === litWord ? "#fde68a" : "transparent",
                          borderRadius: 6,
                          padding: "1px 3px",
                          transition: "background 0.18s ease",
                        }}
                      >
                        {w.t}{" "}
                      </span>
                    ))}
                  </span>
                );
              })}
            </p>
          ) : (
            /* ── K–2: one centered sentence, amber word karaoke ── */
            <div className="flex flex-1 items-center justify-center text-center">
              <p className="text-[28px] font-extrabold leading-snug text-indigo-950">
                {(sentences[lineIdx] ? wordsOf(sentences[lineIdx]) : []).map((w, wi) => (
                  <span
                    key={wi}
                    style={{
                      background: playing && wi === litWord ? "#fde68a" : "transparent",
                      borderRadius: 7,
                      padding: "2px 4px",
                      transition: "background 0.18s ease",
                    }}
                  >
                    {w.t}{" "}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#f0ece1] pt-5">
            <button
              onClick={isProse ? toggleProse : replayLine}
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold transition"
              style={{ background: playing ? "#6d28d9" : "#ede9fe", color: playing ? "#fff" : "#6d28d9" }}
            >
              <Volume2 className="h-4 w-4" />
              {isProse ? (playing ? "Stop reading" : "Read it to me") : "Listen again"}
            </button>

            {isProse ? (
              <button onClick={finish} className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-700 to-violet-600 px-6 text-lg font-extrabold text-white shadow-md active:scale-[0.98]">
                <Check className="h-5 w-5" /> I&apos;m done reading
              </button>
            ) : atEnd ? (
              <button onClick={finish} className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-700 to-violet-600 px-6 text-lg font-extrabold text-white shadow-md active:scale-[0.98]">
                <Check className="h-5 w-5" /> Go to questions
              </button>
            ) : (
              <button onClick={toggleLinePlay} className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-700 to-violet-600 px-6 text-lg font-extrabold text-white shadow-md active:scale-[0.98]">
                {playing ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> {lineIdx > 0 ? "Keep reading" : "Play story"}</>}
              </button>
            )}
          </div>
          {!isProse && !atEnd && (
            <button onClick={finish} className="mt-3 self-center text-sm font-semibold text-violet-600 underline">
              Skip to questions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
