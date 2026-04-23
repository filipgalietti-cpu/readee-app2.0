"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Link2, School, Users2 } from "lucide-react";

type Course = {
  id: string;
  name: string;
  section?: string;
};

type Student = {
  userId: string;
  name: string;
};

export type ImportedStudent = {
  firstName: string;
  lastInitial: string;
};

/**
 * Two-step Google Classroom import: list the teacher's courses, then
 * pull the roster for the chosen course. Student names are split into
 * first name + last initial client-side — Readee only stores the first
 * name + last initial for K-4 privacy.
 *
 * `onImport` hands the rows back to the parent modal which then drops
 * them into the existing "one by one" table for the teacher to review
 * before submitting.
 */
export default function GoogleClassroomImport({
  classroomId,
  onImport,
}: {
  classroomId: string;
  onImport: (rows: ImportedStudent[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [pickedCourse, setPickedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setNotConnected(false);
    try {
      const res = await fetch("/api/classroom/google/courses");
      if (res.status === 409) {
        setNotConnected(true);
        setCourses(null);
        return;
      }
      if (!res.ok) throw new Error("Could not load courses.");
      const body = (await res.json()) as { courses: Course[] };
      setCourses(body.courses);
    } catch (e: any) {
      setErr(e.message ?? "Could not load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  async function pickCourse(c: Course) {
    setPickedCourse(c);
    setLoading(true);
    setErr(null);
    setStudents(null);
    try {
      const res = await fetch(`/api/classroom/google/roster?courseId=${encodeURIComponent(c.id)}`);
      if (!res.ok) throw new Error("Could not load roster.");
      const body = (await res.json()) as { students: Student[] };
      setStudents(body.students);
    } catch (e: any) {
      setErr(e.message ?? "Could not load roster.");
    } finally {
      setLoading(false);
    }
  }

  function dropIntoEditor() {
    if (!students) return;
    const rows: ImportedStudent[] = students.map((s) => {
      const parts = s.name.trim().split(/\s+/);
      const firstName = parts[0] ?? "Student";
      const lastInitial = (parts[1] ?? "").charAt(0).toUpperCase();
      return { firstName, lastInitial };
    });
    onImport(rows);
  }

  if (notConnected) {
    const connectHref = `/api/classroom/google/connect?redirect=${encodeURIComponent(`/classroom/${classroomId}?tab=students&gc=connected`)}`;
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
          <Link2 className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="mt-3 font-bold text-zinc-900 dark:text-white">
          Connect Google Classroom
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
          Pull your class roster straight from Google Classroom — students go
          into the editor below and you review before adding.
        </p>
        <a
          href={connectHref}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Continue with Google
        </a>
      </div>
    );
  }

  if (loading && !courses) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-10 text-sm text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading your Google Classroom courses…
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {err}{" "}
        <button onClick={loadCourses} className="ml-1 font-semibold underline">
          Try again
        </button>
      </div>
    );
  }

  if (!pickedCourse) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          <School className="h-3 w-3" />
          Pick a course
        </div>
        <ul className="space-y-1.5">
          {(courses ?? []).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pickCourse(c)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {c.name}
                  </div>
                  {c.section && (
                    <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                      {c.section}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-indigo-600">Import →</span>
              </button>
            </li>
          ))}
          {courses && courses.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
              No active Google Classroom courses on this account.
            </li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          <Users2 className="h-3 w-3" />
          Roster for {pickedCourse.name}
        </div>
        <button
          onClick={() => {
            setPickedCourse(null);
            setStudents(null);
          }}
          className="text-[11px] font-semibold text-indigo-600 hover:underline"
        >
          Pick a different course
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center rounded-xl bg-zinc-50 p-6 text-sm text-zinc-500 dark:bg-slate-900/40">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading roster…
        </div>
      ) : students && students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
          No students enrolled in this course.
        </div>
      ) : (
        <>
          <ul className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900">
            {(students ?? []).map((s) => (
              <li
                key={s.userId}
                className="border-b border-zinc-100 px-3 py-1.5 last:border-0 dark:border-slate-800"
              >
                {s.name}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={dropIntoEditor}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Add {students?.length ?? 0} students to the editor
          </button>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-slate-400">
            Readee only keeps first name + last initial — reviewing names in
            the editor before submitting lets you edit both.
          </p>
        </>
      )}
    </div>
  );
}
