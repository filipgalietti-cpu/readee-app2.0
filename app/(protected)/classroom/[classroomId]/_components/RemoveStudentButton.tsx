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
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
        aria-label={`Remove ${firstName}`}
        title={`Remove ${firstName} from class`}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
      </button>
      {err && <span className="ml-2 text-xs text-red-600">{err}</span>}
    </>
  );
}
