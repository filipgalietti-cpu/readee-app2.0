"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, X, Plus, Check, FileSpreadsheet, Pencil, Trash2, Users, Mail } from "lucide-react";
import { createInvites, createClassroomStudents } from "../../invite-actions";

type DraftRow = {
  firstName: string;
  lastInitial: string;
  parentEmail: string;
};

function emptyRow(): DraftRow {
  return { firstName: "", lastInitial: "", parentEmail: "" };
}

function parseCsv(text: string): DraftRow[] {
  const rows: DraftRow[] = [];
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Skip likely header rows.
    if (/^(first[_\s]?name|student|name)\b/i.test(line) && /email|parent/i.test(line)) continue;
    const cols = line.split(/\s*,\s*/);
    const firstName = (cols[0] ?? "").trim();
    if (!firstName) continue;
    let lastInitial = "";
    let parentEmail = "";
    // Two common shapes: "First,Email" or "First,Last,Email"
    if (cols.length === 2) {
      parentEmail = (cols[1] ?? "").trim();
    } else {
      lastInitial = (cols[1] ?? "").trim().charAt(0);
      parentEmail = (cols[2] ?? "").trim();
    }
    rows.push({ firstName, lastInitial, parentEmail });
  }
  return rows;
}

function isValidEmail(s: string): boolean {
  if (!s) return true; // empty is allowed
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function InviteStudentsButton({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<"direct" | "parent">("direct");
  const [mode, setMode] = useState<"manual" | "csv">("manual");
  const [rows, setRows] = useState<DraftRow[]>([emptyRow()]);
  const [csvText, setCsvText] = useState("");
  const [sendEmails, setSendEmails] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const allRows = useMemo<DraftRow[]>(() => {
    if (mode === "csv") return parseCsv(csvText);
    return rows;
  }, [mode, csvText, rows]);

  const validRows = useMemo(() => {
    if (flow === "direct") {
      return allRows.filter((r) => r.firstName.trim());
    }
    return allRows.filter(
      (r) => r.firstName.trim() && isValidEmail(r.parentEmail.trim()),
    );
  }, [allRows, flow]);

  const invalidCount = allRows.length - validRows.length;

  function close() {
    setOpen(false);
    setTimeout(() => {
      setFlow("direct");
      setMode("manual");
      setRows([emptyRow()]);
      setCsvText("");
      setErr(null);
      setSendEmails(true);
    }, 200);
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function updateRow(i: number, patch: Partial<DraftRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function removeRow(i: number) {
    setRows((prev) => (prev.length === 1 ? [emptyRow()] : prev.filter((_, idx) => idx !== i)));
  }

  function submit() {
    if (validRows.length === 0) {
      setErr("Add at least one student with a first name.");
      return;
    }
    if (flow === "parent" && sendEmails && validRows.some((r) => !r.parentEmail.trim())) {
      setErr("All rows need a parent email when sending invites. Uncheck 'send email invites' to save names only.");
      return;
    }
    setErr(null);
    start(async () => {
      if (flow === "direct") {
        const res = await createClassroomStudents({
          classroomId,
          source: mode === "csv" ? "csv" : "manual",
          students: validRows.map((r) => ({
            firstName: r.firstName.trim(),
            lastInitial: r.lastInitial.trim() || null,
          })),
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
      } else {
        const res = await createInvites({
          classroomId,
          sendEmails,
          invites: validRows.map((r) => ({
            firstName: r.firstName.trim(),
            lastInitial: r.lastInitial.trim() || null,
            parentEmail: r.parentEmail.trim() || null,
            source: mode === "csv" ? "csv" : "manual",
          })),
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
      }
      close();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
      >
        <UserPlus className="h-4 w-4" />
        Invite students
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                Invite students
              </h2>
              <button
                onClick={close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
              {flow === "direct"
                ? "Students sign in at learn.readee.app/class with the class code + their name. No email needed."
                : "Parents get a link to connect their child to this class from home."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setFlow("direct")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  flow === "direct"
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                    : "text-zinc-500 dark:text-slate-400"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Add students directly
              </button>
              <button
                type="button"
                onClick={() => setFlow("parent")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  flow === "parent"
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                    : "text-zinc-500 dark:text-slate-400"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Invite parents
              </button>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  mode === "manual"
                    ? "bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-indigo-300"
                    : "text-zinc-500 dark:text-slate-400"
                }`}
              >
                <Pencil className="h-3.5 w-3.5" />
                One by one
              </button>
              <button
                type="button"
                onClick={() => setMode("csv")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  mode === "csv"
                    ? "bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-indigo-300"
                    : "text-zinc-500 dark:text-slate-400"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Paste CSV
              </button>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-xl border border-zinc-200 p-3 dark:border-slate-800">
              {mode === "manual" ? (
                <div className="space-y-2">
                  <div
                    className={`grid items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400 ${
                      flow === "direct"
                        ? "grid-cols-[1fr_60px_32px]"
                        : "grid-cols-[1fr_60px_1.6fr_32px]"
                    }`}
                  >
                    <div>First name</div>
                    <div>Last init.</div>
                    {flow === "parent" && <div>Parent email</div>}
                    <div />
                  </div>
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className={`grid items-center gap-2 ${
                        flow === "direct"
                          ? "grid-cols-[1fr_60px_32px]"
                          : "grid-cols-[1fr_60px_1.6fr_32px]"
                      }`}
                    >
                      <input
                        value={r.firstName}
                        onChange={(e) => updateRow(i, { firstName: e.target.value })}
                        placeholder="Emma"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <input
                        value={r.lastInitial}
                        onChange={(e) => updateRow(i, { lastInitial: e.target.value.slice(0, 1) })}
                        placeholder="T"
                        maxLength={1}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-center text-sm uppercase text-zinc-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      {flow === "parent" && (
                        <input
                          value={r.parentEmail}
                          onChange={(e) => updateRow(i, { parentEmail: e.target.value })}
                          placeholder="parent@example.com"
                          type="email"
                          className={`rounded-lg border bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none dark:bg-slate-900 dark:text-white ${
                            isValidEmail(r.parentEmail)
                              ? "border-zinc-200 focus:border-indigo-400 dark:border-slate-700"
                              : "border-red-300 focus:border-red-500 dark:border-red-900"
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add another
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-xs text-zinc-500 dark:text-slate-400">
                    One student per line. Format:{" "}
                    <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">
                      First name, Last initial, parent@example.com
                    </code>
                    {" "}(last initial optional, email optional if you just want to save the name)
                  </p>
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={10}
                    placeholder={"Emma, T, parent1@example.com\nNoah, K, parent2@example.com\nAva,, parent3@example.com"}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  {allRows.length > 0 && (
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-zinc-50 p-2 dark:bg-slate-950/50">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                        Preview ({allRows.length})
                      </div>
                      <ul className="space-y-1">
                        {allRows.slice(0, 50).map((r, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {r.firstName}
                              {r.lastInitial ? ` ${r.lastInitial}.` : ""}
                            </span>
                            <span className="text-zinc-500 dark:text-slate-400">
                              {r.parentEmail || "(no email)"}
                            </span>
                            {!isValidEmail(r.parentEmail) && (
                              <span className="text-[10px] font-semibold text-red-600">
                                invalid email
                              </span>
                            )}
                          </li>
                        ))}
                        {allRows.length > 50 && (
                          <li className="text-[11px] text-zinc-400">
                            … and {allRows.length - 50} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {flow === "parent" && (
              <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={sendEmails}
                  onChange={(e) => setSendEmails(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Send email invites now to parents
              </label>
            )}

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-zinc-500 dark:text-slate-400">
                {validRows.length} ready{" "}
                {invalidCount > 0 && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    ({invalidCount} skipped — missing name or invalid email)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || validRows.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {flow === "direct"
                    ? `Add ${validRows.length} student${validRows.length === 1 ? "" : "s"}`
                    : sendEmails
                    ? `Send invites (${validRows.length})`
                    : `Save (${validRows.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
