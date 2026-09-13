"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Glyph } from "@/app/_components/Glyph";
import styles from "./journey.module.css";

export default function JourneyPlanDialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      el?.close();
      requestAnimationFrame(() => {
        if (returnTo?.isConnected && !document.querySelector("dialog[open]")) {
          returnTo.focus({ preventScroll: true });
        }
      });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.planDialog}
      aria-label="Your child’s reading plan"
      onCancel={onClose}
    >
      <header>
        <h2>The plan behind the path</h2>
        <button type="button" onClick={onClose} aria-label="Close reading plan">
          <Glyph name="x" size={22} />
        </button>
      </header>
      <div>{children}</div>
    </dialog>
  );
}
