"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";

const STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

function normalizeState(s?: string | null): string | null {
  if (!s) return null;
  const up = s.trim().toUpperCase();
  return STATES.has(up) ? up : null;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Create a new district and make the caller a district admin. Open to any
 * authenticated user today; long-term this becomes gated by a "is an
 * approved Readee customer" flag.
 */
export async function createDistrict(input: {
  name: string;
  state?: string | null;
}): Promise<
  { ok: true; districtId: string } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "District name is required." };
  if (name.length > 120) return { ok: false, error: "Name is too long." };

  const supabase = await createClient();

  const { data: district, error } = await supabase
    .from("districts")
    .insert({
      name,
      state: normalizeState(input.state),
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !district) {
    return { ok: false, error: error?.message ?? "Could not create district." };
  }

  const districtId = (district as any).id as string;

  const { error: memberErr } = await supabase
    .from("admin_memberships")
    .insert({
      profile_id: profile.id,
      scope: "district",
      district_id: districtId,
    });
  if (memberErr) return { ok: false, error: memberErr.message };

  revalidatePath("/admin");
  return { ok: true, districtId };
}

/**
 * Create a new school. If a districtId is provided, the caller must be
 * an admin of that district. If none, the caller becomes a school admin
 * of the orphan school.
 */
export async function createSchool(input: {
  name: string;
  districtId?: string | null;
  city?: string | null;
  state?: string | null;
}): Promise<{ ok: true; schoolId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "School name is required." };
  if (name.length > 120) return { ok: false, error: "Name is too long." };

  const supabase = await createClient();

  if (input.districtId) {
    const { data: districtMember } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "district")
      .eq("district_id", input.districtId)
      .maybeSingle();
    if (!districtMember) {
      return { ok: false, error: "You are not an admin of that district." };
    }
  }

  let school: { id: string } | null = null;
  let createErr: any = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = randomCode();
    const { data, error } = await supabase
      .from("schools")
      .insert({
        name,
        district_id: input.districtId ?? null,
        city: input.city?.trim() || null,
        state: normalizeState(input.state),
        created_by: profile.id,
        join_code: joinCode,
      })
      .select("id")
      .single();
    if (!error && data) {
      school = data as { id: string };
      break;
    }
    if (error?.code === "23505" && error.message.includes("join_code")) {
      createErr = error;
      continue;
    }
    createErr = error;
    break;
  }
  if (!school) {
    return { ok: false, error: createErr?.message ?? "Could not create school." };
  }

  const schoolId = (school as any).id as string;

  // If no district, the creator becomes the school admin so they can
  // actually manage it. In a district, district admins already have
  // read access via the inherited-scope helper.
  if (!input.districtId) {
    const { error: memberErr } = await supabase
      .from("admin_memberships")
      .insert({
        profile_id: profile.id,
        scope: "school",
        school_id: schoolId,
      });
    if (memberErr) return { ok: false, error: memberErr.message };
  }

  revalidatePath("/admin");
  if (input.districtId) revalidatePath(`/admin/district/${input.districtId}`);
  return { ok: true, schoolId };
}

/**
 * Grant a Readee user admin scope at a school or district level. The
 * target user must already have a Readee profile — identified by email.
 * Callers must be an existing admin of that scope (enforced via RLS on
 * the existence check).
 */
export async function grantAdminScope(input: {
  email: string;
  scope: "school" | "district";
  schoolId?: string | null;
  districtId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That doesn't look like a valid email." };
  }

  const supabase = await createClient();

  // Confirm the caller has the right to grant in this scope.
  if (input.scope === "district") {
    if (!input.districtId) return { ok: false, error: "Missing districtId." };
    const { data: self } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "district")
      .eq("district_id", input.districtId)
      .maybeSingle();
    if (!self) return { ok: false, error: "You are not a district admin here." };
  } else {
    if (!input.schoolId) return { ok: false, error: "Missing schoolId." };
    // School admins OR the parent district's district admins may grant.
    const { data: selfDirect } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "school")
      .eq("school_id", input.schoolId)
      .maybeSingle();
    if (!selfDirect) {
      const { data: school } = await supabase
        .from("schools")
        .select("district_id")
        .eq("id", input.schoolId)
        .maybeSingle();
      const districtId = (school as any)?.district_id;
      if (!districtId) {
        return { ok: false, error: "You are not an admin of that school." };
      }
      const { data: selfDistrict } = await supabase
        .from("admin_memberships")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("scope", "district")
        .eq("district_id", districtId)
        .maybeSingle();
      if (!selfDistrict) {
        return { ok: false, error: "You are not an admin of that school or its district." };
      }
    }
  }

  // Profile lookup bypasses own-only RLS with the service role. We only
  // return existence; emails here are already held by the admin making
  // the grant.
  const admin = supabaseAdmin();
  const { data: target } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!target) {
    return {
      ok: false,
      error:
        "That email doesn't have a Readee account yet. Ask them to sign up at learn.readee.app/signup first, then try again.",
    };
  }
  const targetId = (target as any).id as string;

  const row =
    input.scope === "district"
      ? { profile_id: targetId, scope: "district" as const, district_id: input.districtId! }
      : { profile_id: targetId, scope: "school" as const, school_id: input.schoolId! };

  const { error } = await supabase
    .from("admin_memberships")
    .insert(row);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "That user is already an admin here." };
    return { ok: false, error: error.message };
  }

  if (input.scope === "district") revalidatePath(`/admin/district/${input.districtId}`);
  else revalidatePath(`/admin/school/${input.schoolId}`);
  return { ok: true };
}

/**
 * Rotate a school's join code. School admin (direct or parent-district)
 * only. Useful if a teacher's code has been shared too widely.
 */
export async function rotateSchoolJoinCode(input: {
  schoolId: string;
}): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: selfDirect } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("scope", "school")
    .eq("school_id", input.schoolId)
    .maybeSingle();
  if (!selfDirect) {
    const { data: school } = await supabase
      .from("schools")
      .select("district_id")
      .eq("id", input.schoolId)
      .maybeSingle();
    const districtId = (school as any)?.district_id;
    if (!districtId) return { ok: false, error: "Not allowed." };
    const { data: selfDistrict } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "district")
      .eq("district_id", districtId)
      .maybeSingle();
    if (!selfDistrict) return { ok: false, error: "Not allowed." };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from("schools")
      .update({ join_code: code })
      .eq("id", input.schoolId)
      .select("join_code")
      .maybeSingle();
    if (!error && data) {
      revalidatePath(`/admin/school/${input.schoolId}`);
      return { ok: true, code: (data as any).join_code as string };
    }
    if (error?.code === "23505") continue;
    return { ok: false, error: error?.message ?? "Could not rotate code." };
  }
  return { ok: false, error: "Could not rotate code — try again." };
}

export async function updateDistrict(input: {
  districtId: string;
  name?: string;
  state?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: self } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("scope", "district")
    .eq("district_id", input.districtId)
    .maybeSingle();
  if (!self) return { ok: false, error: "You are not a district admin here." };

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const n = input.name.trim();
    if (!n) return { ok: false, error: "Name cannot be empty." };
    patch.name = n.slice(0, 120);
  }
  if (input.state !== undefined) patch.state = normalizeState(input.state);
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabase
    .from("districts")
    .update(patch)
    .eq("id", input.districtId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/district/${input.districtId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateSchool(input: {
  schoolId: string;
  name?: string;
  city?: string | null;
  state?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Caller must be a school admin (direct or via parent district).
  const { data: selfDirect } = await supabase
    .from("admin_memberships")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("scope", "school")
    .eq("school_id", input.schoolId)
    .maybeSingle();
  if (!selfDirect) {
    const { data: school } = await supabase
      .from("schools")
      .select("district_id")
      .eq("id", input.schoolId)
      .maybeSingle();
    const districtId = (school as any)?.district_id;
    if (!districtId) return { ok: false, error: "Not allowed." };
    const { data: selfDistrict } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "district")
      .eq("district_id", districtId)
      .maybeSingle();
    if (!selfDistrict) return { ok: false, error: "Not allowed." };
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const n = input.name.trim();
    if (!n) return { ok: false, error: "Name cannot be empty." };
    patch.name = n.slice(0, 120);
  }
  if (input.city !== undefined) patch.city = input.city?.trim() || null;
  if (input.state !== undefined) patch.state = normalizeState(input.state);
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabase
    .from("schools")
    .update(patch)
    .eq("id", input.schoolId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/school/${input.schoolId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function revokeAdminScope(input: { membershipId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("admin_memberships")
    .select("id, profile_id, scope, school_id, district_id")
    .eq("id", input.membershipId)
    .maybeSingle();
  if (!membership) return { ok: false, error: "Admin assignment not found." };

  const m = membership as any;
  if (m.profile_id === profile.id) {
    return { ok: false, error: "You can't remove your own admin scope here." };
  }

  // Verify caller has authority to revoke.
  if (m.scope === "district") {
    const { data: self } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "district")
      .eq("district_id", m.district_id)
      .maybeSingle();
    if (!self) return { ok: false, error: "Not allowed." };
  } else {
    const { data: selfDirect } = await supabase
      .from("admin_memberships")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("scope", "school")
      .eq("school_id", m.school_id)
      .maybeSingle();
    if (!selfDirect) {
      const { data: school } = await supabase
        .from("schools")
        .select("district_id")
        .eq("id", m.school_id)
        .maybeSingle();
      const districtId = (school as any)?.district_id;
      if (!districtId) return { ok: false, error: "Not allowed." };
      const { data: selfDistrict } = await supabase
        .from("admin_memberships")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("scope", "district")
        .eq("district_id", districtId)
        .maybeSingle();
      if (!selfDistrict) return { ok: false, error: "Not allowed." };
    }
  }

  const { error } = await supabase.from("admin_memberships").delete().eq("id", input.membershipId);
  if (error) return { ok: false, error: error.message };

  if (m.scope === "district") revalidatePath(`/admin/district/${m.district_id}`);
  else revalidatePath(`/admin/school/${m.school_id}`);
  return { ok: true };
}
