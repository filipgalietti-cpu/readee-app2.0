"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

type Result = { ok: true } | { ok: false; error: string };

function cleanTitle(t: string): string | { error: string } {
  const trimmed = t.trim();
  if (!trimmed) return { error: "Title cannot be empty." };
  if (trimmed.length > 120) return { error: "Title is too long (max 120)." };
  return trimmed;
}

// ── Lessons ─────────────────────────────────────────────────────────

export async function renameLesson(input: {
  lessonId: string;
  title: string;
}): Promise<Result> {
  const profile = await requireProfile();
  const cleaned = cleanTitle(input.title);
  if (typeof cleaned !== "string") return { ok: false, error: cleaned.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_lessons")
    .update({ title: cleaned })
    .eq("id", input.lessonId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/lessons");
  revalidatePath(`/classroom/lessons/${input.lessonId}`);
  return { ok: true };
}

export async function deleteLesson(input: { lessonId: string }): Promise<Result> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_lessons")
    .delete()
    .eq("id", input.lessonId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/lessons");
  return { ok: true };
}

// ── Books ───────────────────────────────────────────────────────────

export async function renameBook(input: {
  bookId: string;
  title: string;
}): Promise<Result> {
  const profile = await requireProfile();
  const cleaned = cleanTitle(input.title);
  if (typeof cleaned !== "string") return { ok: false, error: cleaned.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_books")
    .update({ title: cleaned })
    .eq("id", input.bookId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/books");
  revalidatePath(`/classroom/books/${input.bookId}`);
  return { ok: true };
}

export async function deleteBook(input: { bookId: string }): Promise<Result> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_books")
    .delete()
    .eq("id", input.bookId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/books");
  return { ok: true };
}

// ── Leveled passages ────────────────────────────────────────────────

export async function renameLeveled(input: {
  passageId: string;
  title: string;
}): Promise<Result> {
  const profile = await requireProfile();
  const cleaned = cleanTitle(input.title);
  if (typeof cleaned !== "string") return { ok: false, error: cleaned.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("differentiated_passages")
    .update({ title: cleaned })
    .eq("id", input.passageId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/leveled");
  revalidatePath(`/classroom/leveled/${input.passageId}`);
  return { ok: true };
}

export async function deleteLeveled(input: { passageId: string }): Promise<Result> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("differentiated_passages")
    .delete()
    .eq("id", input.passageId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/leveled");
  return { ok: true };
}
