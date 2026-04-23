"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, Loader2 } from "lucide-react";
import { removeStudent } from "../../actions";

export default function RemoveStudentButton({
  classroomId,
  childId,
  firstName,
}: {
  classroomId: string;
  childId: string;
  firstName: string;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (
      !confirm(
        `Remove ${firstName} from this class? Their past work is kept but they'll stop seeing new assignments.`,
      )
    ) {
      return;
    }
    setErr(null);
    start(async () => {
      const res = await removeStudent({ classroomId, childId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
        aria-label={`Remove ${firstName}`}
        title={`Remove ${firstName} from class`}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
        Remove
      </button>
      {err && <span className="ml-2 text-xs text-red-600">{err}</span>}
    </>
  );
}
