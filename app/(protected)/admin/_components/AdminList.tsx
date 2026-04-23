import { supabaseAdmin } from "@/lib/supabase/admin";
import RevokeAdminButton from "./RevokeAdminButton";

type AdminRow = {
  id: string;
  profile_id: string;
  email: string;
  created_at: string;
};

async function loadAdmins(
  scope: "school" | "district",
  scopeId: string,
): Promise<AdminRow[]> {
  const admin = supabaseAdmin();
  const col = scope === "school" ? "school_id" : "district_id";
  const { data: memberships } = await admin
    .from("admin_memberships")
    .select("id, profile_id, created_at")
    .eq("scope", scope)
    .eq(col, scopeId)
    .order("created_at", { ascending: true });

  const rows = (memberships ?? []) as { id: string; profile_id: string; created_at: string }[];
  if (rows.length === 0) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .in(
      "id",
      rows.map((r) => r.profile_id),
    );

  const emailById = new Map(
    (profiles ?? []).map((p: any) => [p.id as string, p.email as string]),
  );

  return rows.map((r) => ({
    id: r.id,
    profile_id: r.profile_id,
    email: emailById.get(r.profile_id) ?? "(unknown)",
    created_at: r.created_at,
  }));
}

export default async function AdminList({
  scope,
  scopeId,
  selfProfileId,
}: {
  scope: "school" | "district";
  scopeId: string;
  selfProfileId: string;
}) {
  const admins = await loadAdmins(scope, scopeId);

  if (admins.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-4 text-center text-xs text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        No admins yet. Use the &quot;Add admin&quot; button above.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <ul className="divide-y divide-zinc-100 dark:divide-slate-800">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {a.email}
                {a.profile_id === selfProfileId && (
                  <span className="ml-2 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    You
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400 dark:text-slate-500">
                Admin since{" "}
                {new Date(a.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            {a.profile_id !== selfProfileId && (
              <RevokeAdminButton membershipId={a.id} email={a.email} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
