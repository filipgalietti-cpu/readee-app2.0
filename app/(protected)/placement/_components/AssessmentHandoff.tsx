"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import "./placement.css";

export default function AssessmentHandoff({
  name,
  gradeLabel,
  startHref,
  exploreHref = "/explore",
}: {
  name: string;
  gradeLabel: string;
  startHref: string;
  exploreHref?: string;
}) {
  return (
    <main className="pa-frame pa-parent">
      <header className="pa-top">
        <Link href="/dashboard" className="pa-exit">
          <ArrowLeft size={18} /> Back
        </Link>
        <span>For the grown-up</span>
        <span>Readee</span>
      </header>
      <section className="pa-stage">
        <div className="pa-handoff">
          <div className="pa-handoff-copy">
            <p className="pa-eyebrow">Before you hand over</p>
            <h1>
              Find {name}’s
              <br />
              starting point.
            </h1>
            <p>The assessment checks reading skills. The lessons that follow help build them.</p>
            <dl className="pa-grade-context">
              <div>
                <dt>Enrolled grade</dt>
                <dd>{gradeLabel}</dd>
              </div>
              <div>
                <dt>Reading starting point</dt>
                <dd>Let’s find out</dd>
              </div>
            </dl>
            <p className="pa-small">
              School grade guides the first questions. What {name} can read and understand
              determines where their journey begins—even if that’s a different grade.
            </p>
          </div>
          <div className="pa-handoff-next">
            <LunaOrb mode="idle" size={104} label="Luna, your child’s reading companion" />
            <h2>Ready for your reader.</h2>
            <p>
              Hand over the device. Stay nearby for the microphone check, then let {name} answer
              independently.
            </p>
            <Link className="pa-primary" href={startHref}>
              Over to {name} <ArrowRight size={20} />
            </Link>
            <p className="pa-small">Their results and first lesson are free.</p>
            <Link className="pa-text-link" href={exploreHref}>
              Explore lessons first
            </Link>
          </div>
        </div>
      </section>
      <footer className="pa-dock">
        <div className="pa-bunny" aria-hidden="true">
          <Bunny outfitId="bunny_classic" />
        </div>
      </footer>
    </main>
  );
}
