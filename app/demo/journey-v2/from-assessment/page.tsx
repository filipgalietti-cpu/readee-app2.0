import AssessmentJourneyPreview from './preview';
import { assessmentJourneyMock } from './fixture';

export const metadata = { title: 'Assessment → Journey · Readee preview', robots: { index: false, follow: false } };
export default function Page() {
  const { result, journey } = assessmentJourneyMock();
  return <AssessmentJourneyPreview result={result} journey={journey} />;
}
