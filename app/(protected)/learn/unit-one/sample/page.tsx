import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { unitOneEnabled } from "@/lib/approved-unit/access";
import Sample from "@/app/components/approved-unit/Sample";
export default async function LessonSample() {
  await requireProfile();
  if (!unitOneEnabled()) notFound();
  return <Sample />;
}
