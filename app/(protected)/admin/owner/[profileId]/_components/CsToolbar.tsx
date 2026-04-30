"use client";

import { useState, useTransition } from "react";
import {
  Coins,
  Pencil,
  KeyRound,
  ArrowRightLeft,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  grantCredits,
  addCsNote,
  changePlan,
  sendPasswordReset,
} from "../../actions";

type ActionKind = "credits" | "note" | "plan" | "reset" | null;

export default function CsToolbar({
  profileId,
  email,
  currentPlan,
  defaultPool,
}: {
  profileId: string;
  email: string;
  currentPlan: string;
  defaultPool: "teacher" | "parent";
}) {
  const [open, setOpen] = useState<ActionKind>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Credits form
  const [creditAmount, setCreditAmount] = useState("100");
  const [creditPool, setCreditPool] = useState<"teacher" | "parent">(defaultPool);
  const [creditReason, setCreditReason] = useState("");

  // Note form
  const [noteBody, setNoteBody] = useState("");

  // Plan form
  const [newPlan, setNewPlan] = useState(currentPlan);
  const [planReason, setPlanReason] = useState("");

  function close() {
    setOpen(null);
    setErr(null);
    setDone(null);
    setCreditReason("");
    setNoteBody("");
    setPlanReason("");
  }

  function flash(message: string) {
    setDone(message);
    setTimeout(() => {
      setDone(null);
      setOpen(null);
    }, 1200);
  }

  function submitCredits() {
    setErr(null);
    start(async () => {
      const res = await grantCredits({
        profileId,
        pool: creditPool,
        amount: Number(creditAmount),
        reason: creditReason,
      });
      if (!res.ok) setErr(res.error);
      else flash(`Granted ${creditAmount} ${creditPool} credits.`);
    });
  }

  function submitNote() {
    setErr(null);
    start(async () => {
      const res = await addCsNote({ profileId, body: noteBody });
      if (!res.ok) setErr(res.error);
      else flash("Note saved.");
    });
  }

  function submitPlan() {
    setErr(null);
    start(async () => {
      const res = await changePlan({ profileId, newPlan, reason: planReason });
      if (!res.ok) setErr(res.error);
      else flash(`Plan changed to ${newPlan}.`);
    });
  }

  function submitReset() {
    setErr(null);
    start(async () => {
      const res = await sendPasswordReset({ profileId, email });
      if (!res.ok) setErr(res.error);
      else flash("Password reset email sent.");
    });
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <ToolbarButton
          icon={Coins}
          label="+ Credits"
          tone="emerald"
          onClick={() => setOpen("credits")}
        />
        <ToolbarButton
          icon={ArrowRightLeft}
          label="Change plan"
          tone="violet"
          onClick={() => setOpen("plan")}
        />
        <ToolbarButton
          icon={KeyRound}
          label="Password reset"
          tone="blue"
          onClick={() => setOpen("reset")}
        />
        <ToolbarButton
          icon={Pencil}
          label="Add note"
          tone="amber"
          onClick={() => setOpen("note")}
        />
      </div>

      {open === "credits" && (
        <Modal title="Grant AI credits" onClose={close}>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Amount
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Pool
              </label>
              <div className="mt-1 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-bold">
                {(["teacher", "parent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCreditPool(p)}
                    className={`rounded-full px-3 py-1 transition ${
                      creditPool === p
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    {p === "teacher" ? "Teacher" : "Parent"}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-zinc-500">
                Teacher pool feeds wizard, live quiz, classroom image gen.
                Parent pool feeds Ask Readee.
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Reason (saved on the row + audit log)
              </label>
              <textarea
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                rows={2}
                placeholder="e.g. Comped after image-gen bug on 2026-04-30"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
            <Footer
              onCancel={close}
              onSubmit={submitCredits}
              pending={pending}
              done={done}
              err={err}
              ctaLabel="Grant credits"
              ctaTone="emerald"
            />
          </div>
        </Modal>
      )}

      {open === "note" && (
        <Modal title="Add internal note" onClose={close}>
          <div className="space-y-3 text-sm">
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={6}
              placeholder="What happened, who you spoke with, what was promised. Internal only."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <Footer
              onCancel={close}
              onSubmit={submitNote}
              pending={pending}
              done={done}
              err={err}
              ctaLabel="Save note"
              ctaTone="amber"
            />
          </div>
        </Modal>
      )}

      {open === "plan" && (
        <Modal title="Change plan tier" onClose={close}>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              This sets internal entitlements only. Stripe subscription is
              NOT touched — adjust that separately in the Stripe dashboard.
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                New plan
              </label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              >
                <option value="free">Free</option>
                <option value="premium">Readee+ (premium)</option>
                <option value="teacher_solo">Teacher Solo</option>
                <option value="classroom">Classroom</option>
                <option value="school">School</option>
                <option value="district">District</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Reason
              </label>
              <textarea
                value={planReason}
                onChange={(e) => setPlanReason(e.target.value)}
                rows={2}
                placeholder="e.g. Demo upgrade for school pilot, comp for outage, refund response"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
            <Footer
              onCancel={close}
              onSubmit={submitPlan}
              pending={pending}
              done={done}
              err={err}
              ctaLabel="Apply plan change"
              ctaTone="violet"
            />
          </div>
        </Modal>
      )}

      {open === "reset" && (
        <Modal title="Send password reset" onClose={close}>
          <div className="space-y-3 text-sm">
            <p className="text-zinc-700">
              This sends a Supabase password-reset email to{" "}
              <span className="font-mono">{email}</span>. The user clicks
              the link to set a new password. Logged in the audit trail.
            </p>
            <Footer
              onCancel={close}
              onSubmit={submitReset}
              pending={pending}
              done={done}
              err={err}
              ctaLabel="Send reset email"
              ctaTone="blue"
            />
          </div>
        </Modal>
      )}
    </>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: any;
  label: string;
  tone: "emerald" | "violet" | "blue" | "amber";
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    violet: "bg-violet-600 hover:bg-violet-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    amber: "bg-amber-600 hover:bg-amber-700",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white transition ${colors[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function Footer({
  onCancel,
  onSubmit,
  pending,
  done,
  err,
  ctaLabel,
  ctaTone,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  pending: boolean;
  done: string | null;
  err: string | null;
  ctaLabel: string;
  ctaTone: "emerald" | "violet" | "blue" | "amber";
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    violet: "bg-violet-600 hover:bg-violet-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    amber: "bg-amber-600 hover:bg-amber-700",
  };
  return (
    <>
      {err && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
          {err}
        </div>
      )}
      {done && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <Check className="mt-0.5 h-3.5 w-3.5" />
          {done}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50 ${colors[ctaTone]}`}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {ctaLabel}
        </button>
      </div>
    </>
  );
}
