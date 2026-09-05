import LegacyJourney from "../LegacyJourney";

/**
 * /journey/library?child=<id> — "More support": the full legacy lesson
 * library (the 201-lesson catalog) as extra practice on any skill. The
 * roadmap journey at /journey is the spine; this is the shelf beside it.
 */
export const metadata = { title: "More support · Readee" };

export default function JourneyLibraryPage() {
  return <LegacyJourney />;
}
