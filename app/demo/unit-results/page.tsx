import { packages } from "@/lib/approved-unit/packages";
import Review from "./review";
export default function Page() {
  const pool = packages["key-details"].pool;
  const questions = [
    ...pool.filter((q) => q.scene.evidence === "assessed").slice(0, 5),
    pool.find((q) => q.scene.evidence === "practice")!,
  ];
  return (
    <main>
      <Review pool={questions} />
    </main>
  );
}
