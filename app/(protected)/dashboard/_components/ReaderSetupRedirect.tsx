"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ReaderSetupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/placement/setup");
  }, [router]);
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#faf8ff] text-xl text-violet-900"
      role="status"
    >
      Getting ready for your reader…
    </div>
  );
}
