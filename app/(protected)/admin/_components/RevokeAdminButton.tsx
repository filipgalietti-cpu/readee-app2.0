"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, Loader2 } from "lucide-react";
import { revokeAdminScope } from "../actions";

export default function RevokeAdminButton({
  membershipId,
  email,
}: {
  membershipId: string;
  email: string;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (!confirm(`Remove ${email} as an admin here? They'll lose access to this dashboard.`)) return;
    setErr(null);
    start(async () => {
      const res = await revokeAdminScope({ membershipId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserMinus className="h-3 w-3" />}
        Revoke
      </button>
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
    </div>
  );
}
