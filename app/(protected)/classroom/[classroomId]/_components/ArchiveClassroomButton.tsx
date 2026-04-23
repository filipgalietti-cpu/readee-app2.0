"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2 } from "lucide-react";
import { archiveClassroom } from "../../actions";

export default function ArchiveClassroomButton({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (!confirm("Archive this class? Students stop seeing assignments and you can always view it later.")) return;
    setErr(null);
    start(async () => {
      const res = await archiveClassroom(classroomId);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push("/classroom");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
        Archive class
      </button>
      {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
    </div>
  );
}
