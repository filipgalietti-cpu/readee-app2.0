import FeedbackAudit from "./FeedbackAudit";
import kData from "@/app/data/kindergarten-standards-questions.json";
import g1Data from "@/app/data/1st-grade-standards-questions.json";
import g2Data from "@/app/data/2nd-grade-standards-questions.json";
import g3Data from "@/app/data/3rd-grade-standards-questions.json";
import g4Data from "@/app/data/4th-grade-standards-questions.json";

const FILES: Record<string, any> = {
  K: kData, "1": g1Data, "2": g2Data, "3": g3Data, "4": g4Data,
};

export type AuditQuestion = {
  id: string;
  type?: string;
  prompt: string;
  choices?: string[];
  correct?: string | string[];
  correct_feedback?: string;
  incorrect_feedback?: string;
  reveal_feedback?: string;
};

export default async function Page({
  params,
}: {
  params: Promise<{ standardId: string }>;
}) {
  const { standardId } = await params;
  const grade = standardId.split(".")[1]; // RL.K.2 -> K, RF.2.3b -> 2
  const data = FILES[grade];
  const std = data?.standards?.find(
    (s: any) => s.standard_id === standardId,
  );
  const questions: AuditQuestion[] = (std?.questions ?? []).filter(
    (q: any) => (q.type ?? "multiple_choice") === "multiple_choice",
  );

  return (
    <FeedbackAudit
      standardId={standardId}
      title={std?.standard_description ?? standardId}
      questions={questions}
    />
  );
}
