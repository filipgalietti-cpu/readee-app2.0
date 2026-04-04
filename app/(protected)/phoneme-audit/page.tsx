"use client";

import { useState, useRef, useCallback } from "react";
import { ThumbsUp, Square, Play } from "lucide-react";
import phonemeData from "@/scripts/phoneme-database.json";

interface Phoneme {
  id: string;
  phoneme: string;
  type: string;
  sound: string;
  example: string;
  ttsScript: string;
}

const phonemes = phonemeData as Phoneme[];

const TYPE_LABELS: Record<string, string> = {
  consonant: "Consonants",
  short_vowel: "Short Vowels",
  long_vowel: "Long Vowels",
  r_controlled: "R-Controlled",
  diphthong: "Diphthongs",
  vowel: "Other Vowels",
};

const TYPE_COLORS: Record<string, string> = {
  consonant: "bg-blue-100 text-blue-700 border-blue-200",
  short_vowel: "bg-pink-100 text-pink-700 border-pink-200",
  long_vowel: "bg-purple-100 text-purple-700 border-purple-200",
  r_controlled: "bg-amber-100 text-amber-700 border-amber-200",
  diphthong: "bg-emerald-100 text-emerald-700 border-emerald-200",
  vowel: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const RATING_KEY = "readee_phoneme_audit";

type Rating = "good" | "bad" | null;
type Ratings = Record<string, { rating: Rating; note: string }>;

export default function PhonemeAuditPage() {
  const [ratings, setRatings] = useState<Ratings>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(RATING_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [playing, setPlaying] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const save = useCallback((next: Ratings) => {
    setRatings(next);
    localStorage.setItem(RATING_KEY, JSON.stringify(next));
  }, []);

  const play = useCallback((id: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playing === id) {
      setPlaying(null);
      return;
    }
    const audio = new Audio(`/audio/phonemes/${id}.mp3`);
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    audio.play();
    audioRef.current = audio;
    setPlaying(id);
  }, [playing]);

  const toggleRating = useCallback((id: string, r: "good" | "bad") => {
    const current = ratings[id];
    const newRating = current?.rating === r ? null : r;
    save({ ...ratings, [id]: { rating: newRating, note: current?.note || "" } });
  }, [ratings, save]);

  const submitNote = useCallback((id: string) => {
    const text = (notes[id] || "").trim();
    if (!text) return;
    const current = ratings[id];
    save({ ...ratings, [id]: { rating: current?.rating || null, note: text } });
    setNotes((n) => ({ ...n, [id]: "" }));
  }, [notes, ratings, save]);

  // Group by type
  const groups = phonemes.reduce<Record<string, Phoneme[]>>((acc, p) => {
    (acc[p.type] = acc[p.type] || []).push(p);
    return acc;
  }, {});

  const total = phonemes.length;
  const reviewed = Object.values(ratings).filter((r) => r.rating).length;
  const flagged = Object.values(ratings).filter((r) => r.rating === "bad").length;

  const playAll = useCallback(() => {
    let i = 0;
    function next() {
      if (i >= phonemes.length) {
        setPlaying(null);
        return;
      }
      const p = phonemes[i];
      setPlaying(p.id);
      const audio = new Audio(`/audio/phonemes/${p.id}.mp3`);
      audio.onended = () => {
        i++;
        setTimeout(next, 500);
      };
      audio.onerror = () => {
        i++;
        setTimeout(next, 500);
      };
      audio.play();
      audioRef.current = audio;
    }
    next();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Phoneme Audit</h1>
      <p className="text-gray-500 mb-4 text-sm">
        {total} phonemes |{" "}
        <span className="text-emerald-600 font-medium">{reviewed} reviewed</span>
        {flagged > 0 && (
          <>
            {" "} | <span className="text-red-500 font-medium">{flagged} flagged</span>
          </>
        )}
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={playAll}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          ▶ Play All
        </button>
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            setPlaying(null);
          }}
          className="px-4 py-2 text-sm bg-white border rounded-lg font-medium hover:bg-gray-50"
        >
          <Square className="w-4 h-4 inline-block mr-1" /> Stop
        </button>
        <button
          onClick={() => {
            const rows = ["ID,Phoneme,Type,Sound,Example,TTS Script,Rating,Note"];
            phonemes.forEach((p) => {
              const r = ratings[p.id];
              const note = (r?.note || "").replace(/"/g, '""');
              rows.push(`${p.id},${p.phoneme},${p.type},${p.sound},${p.example},"${p.ttsScript}",${r?.rating || ""},"${note}"`);
            });
            const blob = new Blob([rows.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "phoneme-audit.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 text-sm bg-white border rounded-lg font-medium hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {Object.entries(groups).map(([type, items]) => (
        <div key={type} className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {TYPE_LABELS[type] || type}{" "}
            <span className="text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((p) => {
              const r = ratings[p.id];
              const draft = notes[p.id] || "";
              const isPlaying = playing === p.id;

              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    r?.rating === "bad"
                      ? "bg-red-50 border-red-200"
                      : r?.rating === "good"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Play button */}
                    <button
                      onClick={() => play(p.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                        isPlaying
                          ? "bg-indigo-500 text-white animate-pulse scale-110"
                          : "bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
                      }`}
                    >
                      {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    {/* Phoneme info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-800">
                          {p.phoneme}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${TYPE_COLORS[p.type] || ""}`}>
                          {p.sound}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        e.g. <span className="font-medium">{p.example}</span>
                        <span className="text-gray-400 ml-2">• tts: &ldquo;{p.ttsScript}&rdquo;</span>
                      </p>
                    </div>

                    {/* Rating buttons */}
                    <button
                      onClick={() => toggleRating(p.id, "good")}
                      className={`p-1.5 rounded-lg transition-colors text-lg ${
                        r?.rating === "good"
                          ? "bg-emerald-200 text-emerald-700"
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                      title="Sounds correct"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleRating(p.id, "bad")}
                      className={`p-1.5 rounded-lg transition-colors text-lg ${
                        r?.rating === "bad"
                          ? "bg-red-200 text-red-700"
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                      title="Sounds wrong"
                    >
                      👎
                    </button>
                  </div>

                  {/* Note */}
                  {r?.note && (
                    <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      {r.note}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={draft}
                      onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") submitNote(p.id); }}
                      className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => submitNote(p.id)}
                      disabled={!draft.trim()}
                      className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
