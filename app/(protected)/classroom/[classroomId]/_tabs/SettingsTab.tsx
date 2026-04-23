import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import ClassroomSettingsForm from "../_components/ClassroomSettingsForm";
import ArchiveClassroomButton from "../_components/ArchiveClassroomButton";
import ClassroomSchoolPicker from "../_components/ClassroomSchoolPicker";

type ClassroomRow = {
  id: string;
  name: string;
  grade_level: "K" | "1st" | "2nd" | "3rd" | "4th" | "Mixed" | null;
  school_id: string | null;
};

type SchoolOption = { id: string; name: string };

export default async function SettingsTab({ classroomId }: { classroomId: string }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, grade_level, school_id")
    .eq("id", classroomId)
    .maybeSingle();

  if (!classroom) return null;
  const c = classroom as ClassroomRow;

  // Offer schools where this teacher is an admin (direct school admin or
  // via district). Teachers without any admin scope get a read-only
  // message pointing at hello@ for provisioning.
  const { data: memberships } = await supabase
    .from("admin_memberships")
    .select("scope, school_id, district_id")
    .eq("profile_id", profile.id);

  const directSchoolIds = (memberships ?? [])
    .filter((m: any) => m.scope === "school" && m.school_id)
    .map((m: any) => m.school_id as string);
  const districtIds = (memberships ?? [])
    .filter((m: any) => m.scope === "district" && m.district_id)
    .map((m: any) => m.district_id as string);

  let schoolOptions: SchoolOption[] = [];
  if (directSchoolIds.length > 0 || districtIds.length > 0) {
    const { data: schoolsDirect } = directSchoolIds.length
      ? await supabase.from("schools").select("id, name").in("id", directSchoolIds)
      : { data: [] as any[] };
    const { data: schoolsFromDistricts } = districtIds.length
      ? await supabase.from("schools").select("id, name").in("district_id", districtIds)
      : { data: [] as any[] };
    const seen = new Set<string>();
    schoolOptions = [...(schoolsDirect ?? []), ...(schoolsFromDistricts ?? [])]
      .filter((s: any) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      })
      .map((s: any) => ({ id: s.id, name: s.name }));
  }

  // If the classroom is linked to a school the current user can't
  // administer, still render it so the teacher sees the linkage.
  if (c.school_id && !schoolOptions.some((o) => o.id === c.school_id)) {
    const { data: linked } = await supabase
      .from("schools")
      .select("id, name")
      .eq("id", c.school_id)
      .maybeSingle();
    if (linked) schoolOptions = [...schoolOptions, linked as SchoolOption];
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
          Class details
        </h3>
        <div className="mt-4">
          <ClassroomSettingsForm
            classroomId={c.id}
            initialName={c.name}
            initialGradeLevel={c.grade_level}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
          School
        </h3>
        <p className="mt-2 text-xs text-zinc-500 dark:text-slate-400">
          Linking this class to a school rolls up your classroom into
          principal and district admin dashboards. Only admins of the school
          or district can link it.
        </p>
        <div className="mt-4">
          <ClassroomSchoolPicker
            classroomId={c.id}
            initialSchoolId={c.school_id}
            schools={schoolOptions}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6 dark:border-red-950/50 dark:bg-red-950/20">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
          Danger zone
        </h3>
        <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              Archive this class
            </div>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-slate-400">
              Removes it from your list and stops new joiners. Student
              history and submissions are preserved.
            </p>
          </div>
          <ArchiveClassroomButton classroomId={c.id} />
        </div>
      </section>
    </div>
  );
}
