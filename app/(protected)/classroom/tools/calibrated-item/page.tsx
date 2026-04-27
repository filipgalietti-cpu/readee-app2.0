import { Wand2 } from "lucide-react";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import CalibratedItemForm from "./_components/CalibratedItemForm";

export const dynamic = "force-dynamic";

export default async function CalibratedItemPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
        <Wand2 className="h-4 w-4" />
        Calibrated item builder
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Generate one calibrated question
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Standard, grade, target difficulty. Readee writes one MCQ that
        hits the difficulty band precisely with plausible distractors.
      </p>
      <div className="mt-6">
        <CalibratedItemForm />
      </div>
    </div>
  );
}
