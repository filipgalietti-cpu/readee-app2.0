import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, School, Users2, ArrowRight, ShieldOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

type Membership = {
  id: string;
  scope: "school" | "district";
  school_id: string | null;
  district_id: string | null;
};

export default async function AdminHomePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("admin_memberships")
    .select("id, scope, school_id, district_id")
    .eq("profile_id", profile.id);

  const rows = (memberships ?? []) as Membership[];
  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-slate-400">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          No admin scope assigned
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          School and district admin access is assigned by Readee when a
          contract is signed. If your district just signed up, email{" "}
          <a href="mailto:hello@readee.app" className="font-semibold text-indigo-600 underline">
            hello@readee.app
          </a>{" "}
          — we&apos;ll grant access within one business day.
        </p>
        <Link
          href="/classroom"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Back to my classrooms
        </Link>
      </div>
    );
  }

  // Auto-route if the admin only has one scope.
  if (rows.length === 1) {
    const m = rows[0];
    if (m.scope === "district" && m.district_id) {
      redirect(`/admin/district/${m.district_id}`);
    }
    if (m.scope === "school" && m.school_id) {
      redirect(`/admin/school/${m.school_id}`);
    }
  }

  const districtIds = rows.filter((m) => m.scope === "district").map((m) => m.district_id).filter((x): x is string => !!x);
  const schoolIds = rows.filter((m) => m.scope === "school").map((m) => m.school_id).filter((x): x is string => !!x);

  const [{ data: districts }, { data: schools }] = await Promise.all([
    districtIds.length
      ? supabase.from("districts").select("id, name, state").in("id", districtIds)
      : Promise.resolve({ data: [] as any[] }),
    schoolIds.length
      ? supabase.from("schools").select("id, name, city, state").in("id", schoolIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        <Users2 className="h-4 w-4" />
        Admin
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Your scopes
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
        You have admin access to the places below. Pick one to dive in.
      </p>

      <div className="mt-8 space-y-3">
        {(districts ?? []).map((d: any) => (
          <Link
            key={d.id}
            href={`/admin/district/${d.id}`}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                District
              </div>
              <div className="mt-0.5 font-extrabold text-zinc-900 dark:text-white">{d.name}</div>
              {d.state && (
                <div className="text-xs text-zinc-500 dark:text-slate-400">{d.state}</div>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-400" />
          </Link>
        ))}
        {(schools ?? []).map((s: any) => (
          <Link
            key={s.id}
            href={`/admin/school/${s.id}`}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              <School className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                School
              </div>
              <div className="mt-0.5 font-extrabold text-zinc-900 dark:text-white">{s.name}</div>
              {(s.city || s.state) && (
                <div className="text-xs text-zinc-500 dark:text-slate-400">
                  {[s.city, s.state].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
