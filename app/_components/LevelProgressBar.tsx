"use client";

export const READING_LEVELS = [
  "Emerging Reader",
  "Beginning Reader",
  "Developing Reader",
  "Growing Reader",
  "Independent Reader",
];

const LEVEL_COLORS = [
  { bg: "bg-indigo-100", fill: "bg-indigo-400", text: "text-indigo-700", ring: "ring-indigo-400" },
  { bg: "bg-indigo-100", fill: "bg-indigo-500", text: "text-indigo-700", ring: "ring-indigo-500" },
  { bg: "bg-violet-100", fill: "bg-violet-500", text: "text-violet-700", ring: "ring-violet-500" },
  { bg: "bg-purple-100", fill: "bg-purple-500", text: "text-purple-700", ring: "ring-purple-500" },
  { bg: "bg-emerald-100", fill: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-500" },
];

const LEVEL_SHORT = ["Emerging", "Beginning", "Developing", "Growing", "Independent"];

export default function LevelProgressBar({
  currentLevel,
  onLevelChange,
}: {
  currentLevel: string | null;
  onLevelChange: (level: string) => void;
}) {
  const currentIdx = currentLevel ? READING_LEVELS.indexOf(currentLevel) : -1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-500">Difficulty Level</label>
        {currentLevel ? (
          <span className="text-xs font-medium text-indigo-600">{currentLevel}</span>
        ) : (
          <span className="text-xs text-zinc-400">Not assessed yet</span>
        )}
      </div>

      {/* Progress track */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-zinc-100 rounded-full" />
        {/* Filled track */}
        {currentIdx >= 0 && (
          <div
            className="absolute top-4 left-4 h-1 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentIdx / (READING_LEVELS.length - 1)) * 100}%`, maxWidth: "calc(100% - 32px)" }}
          />
        )}

        {/* Level nodes */}
        <div className="relative flex justify-between">
          {READING_LEVELS.map((level, i) => {
            const isActive = i === currentIdx;
            const isPast = i < currentIdx;
            const color = LEVEL_COLORS[i];

            return (
              <button
                key={level}
                onClick={() => onLevelChange(level)}
                title={level}
                className="group flex flex-col items-center gap-1.5 z-10"
              >
                {/* Node circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? `${color.fill} text-white ring-4 ${color.ring} ring-opacity-30 scale-110`
                      : isPast
                        ? `${color.fill} text-white`
                        : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"
                  }`}
                >
                  {isPast ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] font-medium leading-tight text-center max-w-[56px] transition-colors ${
                    isActive ? color.text : isPast ? "text-zinc-500" : "text-zinc-400 group-hover:text-zinc-600"
                  }`}
                >
                  {LEVEL_SHORT[i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
