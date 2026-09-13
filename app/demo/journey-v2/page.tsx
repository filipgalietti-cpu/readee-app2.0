import JourneyExperience from "./_components/JourneyExperience";

export const metadata = {
  title: "Journey V2 · Readee design studio",
  robots: { index: false, follow: false },
};

// The existing /demo layout gates this surface in production. No live data is loaded.
export default function JourneyV2Page() {
  return <JourneyExperience />;
}
