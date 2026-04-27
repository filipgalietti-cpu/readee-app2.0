import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import PrintShell from "./_components/PrintShell";

export const dynamic = "force-dynamic";

type Page = {
  position: number;
  text: string;
  image_url: string | null;
};

/**
 * Print-optimized layout for a decodable book. One page per US-letter
 * sheet — image on top, large text underneath. Teachers hit Cmd/Ctrl+P
 * (or browser "Save as PDF") to get a printable PDF for the take-home
 * folder. No on-screen UI chrome — just the book.
 */
export default async function BookPrintPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: book } = await supabase
    .from("custom_books")
    .select("id, title, pattern_label, grade_level, pages, cover_image_url")
    .eq("id", bookId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!book) notFound();
  const b = book as any;
  const pages = (b.pages ?? []) as Page[];

  return (
    <PrintShell
      title={b.title}
      patternLabel={b.pattern_label}
      gradeLevel={b.grade_level}
      coverImageUrl={b.cover_image_url}
      pages={pages}
    />
  );
}
