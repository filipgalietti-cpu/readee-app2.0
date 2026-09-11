"use client";
import ReaderLoading from "@/app/_components/ReaderLoading";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ReaderSetupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/placement/setup");
  }, [router]);
  return <ReaderLoading />;
}
