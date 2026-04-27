"use client";

import { useState } from "react";
import { Loader2, AlertCircle, FileSpreadsheet, Check } from "lucide-react";

type Student = {
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  studentId: string;
};

export default function RosterImporter() {
  const [text, setText] = useState("");
  const [students, setStudents] = useState<Student[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setErr(null);
    setStudents(null);
    setWarnings([]);
    if (!text.trim()) {
      setErr("Paste a roster first.");
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/roster-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await r.json();
      if (!json.ok) setErr(json.error ?? "Couldn't parse that roster.");
      else {
        setStudents(json.result.students as Student[]);
        setWarnings((json.result.warnings ?? []) as string[]);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't parse that roster.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your roster — CSV, tab-separated, or just lines like 'Jane Doe, K, Mrs Smith'…"
          className="w-full rounded-lg border border-zinc-300 px-2 py-2 font-mono text-xs focus:border-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={go}
          disabled={pending}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
          Parse
        </button>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <div className="font-bold">Notes</div>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {students && students.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            <Check className="h-3 w-3" />
            {students.length} students parsed
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-3 py-2">First</th>
                  <th className="px-3 py-2">Last</th>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="px-3 py-1.5 font-semibold text-zinc-900">{s.firstName}</td>
                    <td className="px-3 py-1.5 text-zinc-700">{s.lastName}</td>
                    <td className="px-3 py-1.5 text-zinc-700">{s.grade}</td>
                    <td className="px-3 py-1.5 text-zinc-700">{s.className}</td>
                    <td className="px-3 py-1.5 text-zinc-500">{s.studentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-emerald-800">
            Confirm by importing into your class. (Bulk-import action
            wires next — for now copy / paste into your existing
            roster flow.)
          </div>
        </div>
      )}
    </div>
  );
}
