"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Clock } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type OpenAssignment = {
  id: string;
  kind: "readee_lesson" | "custom_quiz" | "fluency";
  source_id: string;
  title: string;
  note: string | null;
  due_at: string | null;
  classroom_name: string;
};

function formatDueDate(dueAt: string | null): string | null {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return "Past due";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 7) return `Due in ${diffDays} days`;
  return `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function assignmentHref(a: OpenAssignment, childId: string): string {
  if (a.kind === "readee_lesson") {
    return `/learn?child=${childId}&standard=${encodeURIComponent(a.source_id)}`;
  }
  if (a.kind === "custom_quiz") {
    return `/practice/custom-quiz/${a.source_id}?child=${childId}`;
  }
  if (a.kind === "fluency") {
    return `/fluency?child=${childId}&assignment=${a.id}`;
  }
  return `/dashboard?child=${childId}`;
}

export default function TeacherAssignmentsCard({ childId }: { childId: string }) {
  const [assignments, setAssignments] = useState<OpenAssignment[] | null>(null);

  // B2C-only kill switch. While the marketing push is parent-first,
  // any kid that happens to be a member of a (test or real) classroom
  // would surface "From your teacher" on the parent dashboard — which
  // breaks the family-only story. Flip NEXT_PUBLIC_HIDE_TEACHER_ASSIGNMENTS
  // back to false (or remove it) once the B2B/B2S surface re-opens.
  const hideForB2C =
    process.env.NEXT_PUBLIC_HIDE_TEACHER_ASSIGNMENTS === "true";

  useEffect(() => {
    let cancelled = false;
    if (hideForB2C) {
      setAssignments([]);
      return;
    }

    async function load() {
      const supabase = supabaseBrowser();

      const { data: memberships } = await supabase
        .from("classroom_memberships")
        .select("classroom_id")
        .eq("child_id", childId);

      const classroomIds = (memberships ?? []).map((m: any) => m.classroom_id);
      if (classroomIds.length === 0) {
        if (!cancelled) setAssignments([]);
        return;
      }

      const { data: rows } = await supabase
        .from("assignments")
        .select(
          "id, kind, source_id, title, note, due_at, classrooms!inner(name, archived_at)",
        )
        .in("classroom_id", classroomIds);

      const all = (rows ?? []).filter((r: any) => !r.classrooms?.archived_at);

      const { data: submissions } = await supabase
        .from("assignment_submissions")
        .select("assignment_id, completed_at")
        .eq("child_id", childId)
        .not("completed_at", "is", null);

      const completedIds = new Set(
        (submissions ?? []).map((s: any) => s.assignment_id),
      );

      const open: OpenAssignment[] = all
        .filter((r: any) => !completedIds.has(r.id))
        .map((r: any) => ({
          id: r.id,
          kind: r.kind,
          source_id: r.source_id,
          title: r.title,
          note: r.note,
          due_at: r.due_at,
          classroom_name: r.classrooms?.name ?? "Class",
        }))
        .sort((a, b) => {
          if (!a.due_at && !b.due_at) return 0;
          if (!a.due_at) return 1;
          if (!b.due_at) return -1;
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
        });

      if (!cancelled) setAssignments(open);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [childId, hideForB2C]);

  if (!assignments || assignments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/60 p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          From your teacher
        </div>
      </div>

      <div className="space-y-2.5">
        {assignments.map((a) => {
          const due = formatDueDate(a.due_at);
          const overdue = due === "Past due";
          return (
            <Link
              key={a.id}
              href={assignmentHref(a, childId)}
              className="block rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-slate-400 truncate">
                    {a.classroom_name}
                  </div>
                  <div className="font-extrabold text-zinc-900 dark:text-slate-100 truncate leading-tight mt-0.5">
                    {a.title}
                  </div>
                  {due && (
                    <div
                      className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                        overdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                      {due}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold">
                  Start
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
