"use client";
import { useEffect, useRef } from "react";
import { Glyph } from "./Glyph";
import TrialOffer from "./TrialOffer";
import { usePlanStore } from "@/lib/stores/plan-store";

type Props = {
  open: boolean;
  onClose: () => void;
  childId?: string | null;
  childName?: string | null;
  trigger?: "lesson" | "story" | "analytics" | "child";
  eligibleForTrial?: boolean;
};
/** Native modal provides focus containment, Escape, and focus restoration. */
export function PaywallModal({
  open,
  onClose,
  childId,
  childName,
  trigger = "lesson",
  eligibleForTrial,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const loaded = usePlanStore((s) => s.loaded);
  const everSubscribed = usePlanStore((s) => s.everSubscribed);
  const fetchPlan = usePlanStore((s) => s.fetch);
  useEffect(() => {
    const element = dialog.current;
    if (!open) {
      element?.close();
      return;
    }
    if (eligibleForTrial === undefined) void fetchPlan();
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      element?.close();
    };
  }, [open, eligibleForTrial, fetchPlan]);
  const canOffer = eligibleForTrial !== undefined || loaded;
  return (
    <dialog
      ref={dialog}
      aria-label="Readee+ for your family"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-md overflow-y-auto rounded-2xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-900/45"
      data-paywall-modal
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white px-6 py-2">
        <p className="text-sm font-semibold text-zinc-600">
          For {childName ? `${childName}’s` : "your reader’s"} grown-up
        </p>
        <button
          aria-label="Close membership options"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-zinc-100"
          onClick={onClose}
        >
          <Glyph name="x" size={20} />
        </button>
      </div>
      {open &&
        (canOffer ? (
          <TrialOffer
            childId={childId}
            childName={childName}
            eligibleForTrial={eligibleForTrial ?? !everSubscribed}
            source={`paywall-${trigger}`}
          />
        ) : (
          <p role="status" className="p-6">
            Loading your membership options…
          </p>
        ))}
    </dialog>
  );
}
