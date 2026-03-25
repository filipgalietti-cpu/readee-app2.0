"use client";

import { useState, useRef, useCallback } from "react";

/* ── Audit data for the 10 generated samples ── */
const ITEMS = [
  { id: "RL.K.1-Q1-incorrect", path: "kindergarten/RL.K.1", script: "The correct answer is C, a red ball." },
  { id: "RL.K.1-Q2-incorrect", path: "kindergarten/RL.K.1", script: "The correct answer is D, to school." },
  { id: "RL.K.1-Q3-incorrect", path: "kindergarten/RL.K.1", script: "The correct answer is D, 6." },
  { id: "RL.K.1-Q4-incorrect", path: "kindergarten/RL.K.1", script: "The correct answer is A, Gray with white paws." },
  { id: "RL.K.1-Q5-incorrect", path: "kindergarten/RL.K.1", script: "The correct answer is D, his grandma." },
  { id: "RL.K.2-Q1-incorrect", path: "kindergarten/RL.K.2", script: "The correct answer is B, Bear was hungry, found honey in a tree, and ate it." },
  { id: "RL.K.2-Q2-incorrect", path: "kindergarten/RL.K.2", script: "The correct answer is B, Frog wanted to cross the pond." },
  { id: "RL.K.2-Q3-incorrect", path: "kindergarten/RL.K.2", script: "The correct answer is A, Mia forgot her lunch, so Leo shared with her." },
  { id: "RL.K.2-Q4-incorrect", path: "kindergarten/RL.K.2", script: "The correct answer is B, Turtle won the race." },
  { id: "RL.K.2-Q5-incorrect", path: "kindergarten/RL.K.2", script: "The correct answer is C, a rainbow appeared." },
];

const PREFIX_FILES = [
  "incorrect-1", "incorrect-2", "incorrect-3", "incorrect-4", "incorrect-5",
  "incorrect-6", "incorrect-7", "incorrect-8", "incorrect-9", "incorrect-10",
];

const STORAGE_KEY = "readee_incorrect_audio_audit";

type Rating = "good" | "bad" | null;
type Ratings = Record<string, { rating: Rating; note: string }>;

export default function IncorrectAudioAuditPage() {
  const [ratings, setRatings] = useState<Ratings>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [playing, setPlaying] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceAbort = useRef<boolean>(false);

  const save = useCallback((next: Ratings) => {
    setRatings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const stopAudio = useCallback(() => {
    sequenceAbort.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(null);
  }, []);

  const playFile = useCallback((url: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }, []);

  /* Play just the answer audio */
  const playAnswer = useCallback((item: typeof ITEMS[0]) => {
    stopAudio();
    if (playing === item.id) return;
    sequenceAbort.current = false;
    setPlaying(item.id);
    const url = `/audio/${item.path}/${item.id}.mp3`;
    playFile(url).then(() => {
      if (!sequenceAbort.current) setPlaying(null);
    });
  }, [playing, stopAudio, playFile]);

  /* Play full sequence: random prefix + gap + answer */
  const playFull = useCallback((item: typeof ITEMS[0]) => {
    stopAudio();
    if (playing === `full-${item.id}`) return;
    sequenceAbort.current = false;
    setPlaying(`full-${item.id}`);

    const prefix = PREFIX_FILES[Math.floor(Math.random() * PREFIX_FILES.length)];
    const prefixUrl = `/audio/feedback/${prefix}.mp3`;
    const answerUrl = `/audio/${item.path}/${item.id}.mp3`;

    playFile(prefixUrl).then(() => {
      if (sequenceAbort.current) return;
      return new Promise<void>((resolve) => setTimeout(resolve, 250));
    }).then(() => {
      if (sequenceAbort.current) return;
      return playFile(answerUrl);
    }).then(() => {
      if (!sequenceAbort.current) setPlaying(null);
    });
  }, [playing, stopAudio, playFile]);

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

  const reviewed = Object.values(ratings).filter((r) => r.rating).length;
  const flagged = Object.values(ratings).filter((r) => r.rating === "bad").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Incorrect Answer Audio Audit</h1>
      <p className="text-gray-500 mb-2 text-sm">
        {ITEMS.length} samples |{" "}
        <span className="text-emerald-600 font-medium">{reviewed} reviewed</span>
        {flagged > 0 && (
          <>{" "} | <span className="text-red-500 font-medium">{flagged} flagged</span></>
        )}
      </p>
      <p className="text-gray-400 mb-4 text-xs">
        &quot;Answer Only&quot; plays just the correct-answer clip. &quot;Full Preview&quot; plays a random prefix (&quot;Almost!&quot; etc.) then the answer, as kids will hear it.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={stopAudio}
          className="px-4 py-2 text-sm bg-white border rounded-lg font-medium hover:bg-gray-50"
        >
          Stop
        </button>
        <button
          onClick={() => {
            const rows = ["ID,Script,Rating,Note"];
            ITEMS.forEach((item) => {
              const r = ratings[item.id];
              const note = (r?.note || "").replace(/"/g, '""');
              const script = item.script.replace(/"/g, '""');
              rows.push(`${item.id},"${script}",${r?.rating || ""},"${note}"`);
            });
            const blob = new Blob([rows.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "incorrect-audio-audit.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 text-sm bg-white border rounded-lg font-medium hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {ITEMS.map((item) => {
          const r = ratings[item.id];
          const draft = notes[item.id] || "";
          const isPlayingAnswer = playing === item.id;
          const isPlayingFull = playing === `full-${item.id}`;

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-colors ${
                r?.rating === "bad"
                  ? "bg-red-50 border-red-200"
                  : r?.rating === "good"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-gray-200"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono font-bold text-gray-700">{item.id.replace("-incorrect", "")}</span>
                <span className="flex-1 text-sm text-gray-500 italic truncate">&ldquo;{item.script}&rdquo;</span>

                {/* Rating buttons */}
                <button
                  onClick={() => toggleRating(item.id, "good")}
                  className={`p-1.5 rounded-lg transition-colors text-lg ${
                    r?.rating === "good"
                      ? "bg-emerald-200 text-emerald-700"
                      : "hover:bg-gray-100 text-gray-400"
                  }`}
                  title="Sounds good"
                >
                  👍
                </button>
                <button
                  onClick={() => toggleRating(item.id, "bad")}
                  className={`p-1.5 rounded-lg transition-colors text-lg ${
                    r?.rating === "bad"
                      ? "bg-red-200 text-red-700"
                      : "hover:bg-gray-100 text-gray-400"
                  }`}
                  title="Sounds bad"
                >
                  👎
                </button>
              </div>

              {/* Play buttons */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => playAnswer(item)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                    isPlayingAnswer
                      ? "bg-indigo-500 text-white animate-pulse"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {isPlayingAnswer ? "Playing..." : "Answer Only"}
                </button>
                <button
                  onClick={() => playFull(item)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                    isPlayingFull
                      ? "bg-purple-500 text-white animate-pulse"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  {isPlayingFull ? "Playing..." : "Full Preview"}
                </button>
              </div>

              {/* Saved note */}
              {r?.note && (
                <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  {r.note}
                </div>
              )}

              {/* Note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={draft}
                  onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") submitNote(item.id); }}
                  className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  onClick={() => submitNote(item.id)}
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
  );
}
