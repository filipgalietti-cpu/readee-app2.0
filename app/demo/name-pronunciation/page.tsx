"use client";
import { useState } from "react";
import SayNameControl from "@/app/_components/SayNameControl";
/** Local QA surface for the actual settings playback control; demos are disabled in production. */
export default function NamePronunciationDemo() {
  const [value, setValue] = useState("fee-LOOSH");
  return <main className="mx-auto max-w-xl p-8"><SayNameControl writtenName="Filus" value={value} onChange={setValue} /></main>;
}
