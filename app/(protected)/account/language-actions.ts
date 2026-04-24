"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

export async function setChildLanguage(input: {
  childId: string;
  language: "en" | "es";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();
  if (input.language !== "en" && input.language !== "es") {
    return { ok: false, error: "Unsupported language." };
  }
  const { error } = await supabase
    .from("children")
    .update({ language: input.language })
    .eq("id", input.childId)
    .eq("parent_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}
