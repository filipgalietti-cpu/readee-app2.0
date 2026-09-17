"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdventureLesson } from "@/lib/journey/adventure-view";
import { Glyph } from "@/app/_components/Glyph";
import styles from "./journey-v2.module.css";

export default function CompletedLessonNode({
  lesson,
  disabled,
  onReplay,
}: {
  lesson: AdventureLesson;
  disabled: boolean;
  onReplay: () => void;
}) {
  const button = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const id = `stats-${lesson.nodeId}`;
  function cancelClose() {
    clearTimeout(timer.current);
  }
  function open() {
    if (disabled || !button.current) return;
    cancelClose();
    const rect = button.current.getBoundingClientRect();
    setPosition({
      left: Math.max(12, Math.min(innerWidth - 312, rect.left + rect.width / 2 - 150)),
      top: Math.max(12, Math.min(innerHeight - 340, rect.bottom + 12)),
    });
  }
  function closeLater() {
    cancelClose();
    timer.current = setTimeout(() => setPosition(null), 180);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!position) return;
    const outside = (e: PointerEvent) => {
      if (!button.current?.contains(e.target as Node) && !panel.current?.contains(e.target as Node))
        setPosition(null);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPosition(null);
        cancelClose();
      }
    };
    const resize = () => setPosition(null);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [position]);
  const stats = lesson.stats;
  return (
    <>
      <button
        ref={button}
        className={styles.destination}
        disabled={disabled}
        aria-label={`Completed: ${lesson.title}. View stats`}
        aria-haspopup="dialog"
        aria-expanded={!!position}
        aria-controls={position ? id : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") open();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") closeLater();
        }}
        onFocus={open}
        onClick={open}
        onBlur={(e) => {
          if (!panel.current?.contains(e.relatedTarget as Node)) setPosition(null);
        }}
      >
        <Glyph name="check" size={29} />
      </button>
      {position &&
        createPortal(
          <div
            ref={panel}
            id={id}
            tabIndex={-1}
            role="dialog"
            aria-label={`${lesson.title} stats`}
            className={styles.completedStats}
            style={{
              left: position.left,
              top: position.top,
              maxHeight: `calc(100dvh - ${position.top + 12}px)`,
            }}
            onPointerEnter={cancelClose}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") closeLater();
            }}
            onFocus={cancelClose}
            onBlur={(e) => {
              if (
                !e.currentTarget.contains(e.relatedTarget as Node) &&
                e.relatedTarget !== button.current
              )
                setPosition(null);
            }}
          >
            <button
              className={styles.statsClose}
              aria-label="Close lesson stats"
              onClick={() => setPosition(null)}
            >
              ×
            </button>
            <span className={styles.statsEyebrow}>Completed</span>
            <h3>{lesson.title}</h3>
            {stats ? (
              <>
                <strong className={styles.statsScore}>
                  {stats.checked
                    ? `${stats.correct} / ${stats.checked} correct${stats.percent !== null ? ` · ${stats.percent}%` : ""}`
                    : "Practice completed"}
                </strong>
                <p>First answers · {stats.checked} independently checked</p>
                <div className={styles.statsDetails}>
                  {stats.helped > 0 && <span>{stats.helped} with help</span>}
                  {stats.pending > 0 && <span>{stats.pending} need another check</span>}
                  {stats.supported > 0 && <span>{stats.supported} supported activities</span>}
                  <span>
                    <img src="/icons/fluent/carrot.svg" alt="Carrots" width={22} height={22} />
                    {stats.carrots} earned
                  </span>
                </div>
              </>
            ) : (
              <p>
                This lesson is complete. A question breakdown isn’t available for this older result.
              </p>
            )}
            <button className={styles.statsReplay} onClick={onReplay}>
              Revisit lesson
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
