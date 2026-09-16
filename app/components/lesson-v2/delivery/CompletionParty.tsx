"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
/** Display animation only. Rewards are derived from the saved attempt, never incremented here. */
export default function CompletionParty({
  title,
  learned,
  carrots,
  bonus,
  perfectBonus = 0,
  rewardAlreadyEarned = false,
  achievement,
  activitySummary,
  outfitId,
  active,
  onRestart,
  onContinue,
  continueLabel = "Start practice",
  kind = "lesson",
  autoContinue = false,
  narrationFinished = false,
}: {
  title: string;
  learned: string[];
  carrots: number;
  bonus: number;
  perfectBonus?: number;
  rewardAlreadyEarned?: boolean;
  achievement?: string;
  activitySummary?: string;
  outfitId: string;
  active: boolean;
  onRestart?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  kind?: "lesson" | "practice" | "exam";
  autoContinue?: boolean;
  narrationFinished?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const continueRef = useRef(onContinue);
  continueRef.current = onContinue;
  const continued = useRef(false);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const canContinue = !!onContinue;
  useEffect(() => {
    if (
      !autoContinue ||
      !canContinue ||
      !active ||
      count !== carrots ||
      !narrationFinished ||
      !visible
    )
      return;
    const timer = setTimeout(() => {
      if (continued.current) return;
      continued.current = true;
      continueRef.current?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [autoContinue, canContinue, active, count, carrots, narrationFinished, visible]);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(carrots);
      return;
    }
    let n = 0;
    setCount(0);
    const timer = setInterval(() => {
      n++;
      setCount(Math.min(n, carrots));
      if (n >= carrots) clearInterval(timer);
    }, 110);
    return () => clearInterval(timer);
  }, [active, carrots]);
  return (
    <section className="le-summary le-party" inert={!active}>
      {active && (
        <div className="le-party-confetti" aria-hidden="true">
          {Array.from({ length: 36 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 29) % 100}%`,
                background: ["#6e5bff", "#eea943", "#8ec3a0", "#f2b6ce"][i % 4],
                animationDelay: `${(i % 9) * 0.13}s`,
                rotate: `${i * 37}deg`,
              }}
            />
          ))}
        </div>
      )}
      <div className="le-party-rabbit" aria-label="Readee Rabbit celebrates with you">
        <span className="le-party-cheer">You did it!</span>
        <BunnyReaction outfitId={outfitId} state="levelup" />
      </div>
      <div className="le-party-details">
        <p className="le-eyebrow">
          {kind === "lesson"
            ? "Lesson completed"
            : kind === "exam"
              ? "Exam completed"
              : "Practice completed"}
        </p>
        <h1>{title}</h1>
        {achievement && <p className="le-perfect-score">{achievement}</p>}
        {activitySummary && <p className="le-activity-summary">{activitySummary}</p>}
        <h2>{kind === "exam" ? "What you checked" : "Look what you learned"}</h2>
        <ul>
          {learned.map((text) => (
            <li key={text}>
              <Check size={20} aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        {rewardAlreadyEarned ? (
          <p className="le-completion-bonus">
            Your exam carrots were earned on your first check-in. This try updates your skills and
            readiness.
          </p>
        ) : (
          <>
            <div className="le-carrot-prize">
              <img src="/icons/fluent/carrot.svg" width={62} height={62} alt="" />
              <div>
                <strong key={count} aria-hidden="true">
                  {count}
                </strong>
                <span>carrots earned</span>
              </div>
            </div>
            <p className={`le-completion-bonus ${count > carrots - bonus ? "is-earned" : ""}`}>
              <img src="/icons/fluent/carrot.svg" width={23} height={23} alt="" />
              Includes +{bonus} for finishing!
            </p>
            {perfectBonus > 0 && (
              <p className="le-completion-bonus is-earned">
                <img src="/icons/fluent/carrot.svg" width={23} height={23} alt="" />
                Plus +{perfectBonus} for first-try answers!
              </p>
            )}
            <span className="le-sr-only" role="status">
              {count === carrots
                ? `${carrots} carrots earned, including ${bonus} for finishing${perfectBonus ? ` and ${perfectBonus} for first-try answers` : ""}.`
                : "Counting your carrots."}
            </span>
          </>
        )}
        {onContinue && (
          <button
            className="le-primary"
            onClick={() => {
              if (!continued.current) {
                continued.current = true;
                onContinue();
              }
            }}
          >
            {continueLabel}
          </button>
        )}
        {onRestart && (
          <button onClick={onRestart}>
            <RotateCcw size={17} />
            Play again
          </button>
        )}
      </div>
    </section>
  );
}
