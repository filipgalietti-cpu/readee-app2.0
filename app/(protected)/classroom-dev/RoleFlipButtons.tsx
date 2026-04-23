"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { devSetRole } from "../classroom/actions";

export default function RoleFlipButtons({ currentRole }: { currentRole: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function flip(role: "parent" | "educator") {
    start(async () => {
      const res = await devSetRole(role);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
      // bounce to the side that matches the new role so the flip is visible
      router.push(role === "educator" ? "/classroom" : "/classroom-join");
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending || currentRole === "educator"}
        onClick={() => flip("educator")}
        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        Become educator
      </button>
      <button
        type="button"
        disabled={pending || currentRole === "parent"}
        onClick={() => flip("parent")}
        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        Become parent
      </button>
    </div>
  );
}
