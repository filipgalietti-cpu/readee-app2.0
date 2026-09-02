"use client";

/**
 * UpgradeCelebration — self-contained port of the `direction="confetti"`
 * celebration state (variant "1a", "Confetti burst") from the Claude Design
 * `Upgrade Flow.dc.html` component.
 *
 * The source rendered a whole upgrade → mock-Stripe → celebration flow. Only the
 * final CELEBRATION overlay for the confetti variant is ported here: a dimmed,
 * blurred full-screen backdrop, 70 pieces of confetti raining from the top, a
 * springy white card ("Welcome to Readee+!"), and the unlocked Readee+ perks
 * ticking in one by one with a green check, ending in a primary button that
 * calls `onClose`.
 *
 * Everything is pure JSX + inline SVG (no external assets beyond the optional
 * Readee logo, which the confetti variant does NOT use). Every CSS class and
 * @keyframes name is prefixed `uc-` / `uc…` so it cannot collide with the app's
 * existing `rx2-*`, `bn-*`, `kwf-*`, `rw-*`, `mt-*`, `readee*` styles.
 *
 * Faithful to source: card copy, perk lines, stagger delays, spring curves, and
 * confetti generation (colors / size / duration / delay / shape) are copied from
 * the source `celebrate()` and the confetti markup. The one adaptation is the
 * confetti fall distance: the source translated a fixed 940px inside a 900px-tall
 * mock frame; here it falls `110vh` so it clears any real viewport.
 */

import { useEffect, useMemo, useState } from "react";
import { FluentIcon } from "@/app/_components/FluentIcon";

const CONFETTI_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#f472b6",
  "#4ade80",
  "#facc15",
];

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  dur: number;
  color: string;
  size: number;
  br: string;
};

// Mirrors the source `celebrate()` generator: 70 pieces, random left / delay /
// duration / size, cycling colors, half round + half square.
function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: +(Math.random() * 100).toFixed(1),
    delay: +(Math.random() * 1.2).toFixed(2),
    dur: +(2 + Math.random() * 1.5).toFixed(2),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: Math.round(6 + Math.random() * 7),
    br: Math.random() > 0.5 ? "50%" : "2px",
  }));
}

const PERKS = [
  "All 162 lessons unlocked",
  "25 stories with read-aloud audio",
  "Unlimited practice, every standard",
  "Parent progress reports",
];

// Green check, matches the source perk-row icon.
function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#10b981"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const CSS = `
.uc-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  font-family: 'Nunito', ui-sans-serif, system-ui, sans-serif;
  animation: ucFadeIn 0.3s ease both;
}

.uc-confetti {
  position: absolute;
  top: -20px;
  z-index: 110;
  pointer-events: none;
  animation-name: ucConfettiFall;
  animation-timing-function: ease-in;
  animation-fill-mode: both;
}

.uc-card {
  position: relative;
  z-index: 120;
  box-sizing: border-box;
  width: 100%;
  max-width: 400px;
  padding: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ucPopCard 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.uc-badge {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff, #ede9fe);
  animation: ucPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
}

.uc-title {
  margin: 0;
  font-family: 'Baloo 2', 'Nunito', sans-serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(90deg, #4f46e5, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ucFadeUp 0.4s ease 0.45s both;
}

.uc-perks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  margin: 0 auto;
}

.uc-perk {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #3f3f46;
  animation: ucFadeUp 0.35s ease both;
}
.uc-perk svg { flex-shrink: 0; }
.uc-perk-0 { animation-delay: 0.65s; }
.uc-perk-1 { animation-delay: 0.8s; }
.uc-perk-2 { animation-delay: 0.95s; }
.uc-perk-3 { animation-delay: 1.1s; }

.uc-note {
  margin: 0;
  font-size: 12px;
  color: #a1a1aa;
  animation: ucFadeUp 0.35s ease 1.25s both;
}

.uc-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  animation: ucFadeUp 0.35s ease 1.35s both;
}
.uc-btn:hover { filter: brightness(1.08); }
.uc-btn:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; }

@keyframes ucFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ucFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ucPopCard {
  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes ucPopIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ucConfettiFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .uc-overlay,
  .uc-card,
  .uc-badge,
  .uc-title,
  .uc-perk,
  .uc-note,
  .uc-btn { animation: none !important; }
  .uc-confetti { display: none !important; }
}
`;

export default function UpgradeCelebration({ onClose }: { onClose: () => void }) {
  // Generate confetti on the client only, so server/client markup match (the
  // overlay is empty of confetti during SSR, then fills after mount).
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  useEffect(() => {
    setConfetti(makeConfetti());
  }, []);

  const perks = useMemo(() => PERKS, []);

  return (
    <div
      className="uc-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="uc-title"
    >
      <style>{CSS}</style>

      {confetti.map((p) => (
        <div
          key={p.id}
          className="uc-confetti"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.br,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="uc-card">
        <div className="uc-badge">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
          </svg>
        </div>

        <h2 id="uc-title" className="uc-title">
          Welcome to Readee+!
        </h2>

        <div className="uc-perks">
          {perks.map((perk, i) => (
            <div key={perk} className={`uc-perk uc-perk-${i}`}>
              <FluentIcon name="check" size={20} />
              {perk}
            </div>
          ))}
        </div>

        <p className="uc-note">
          Your 7-day free trial started. No charge until day 8.
        </p>

        <button type="button" className="uc-btn" onClick={onClose}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
