"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Glyph } from "@/app/_components/Glyph";
import { PlacementAudioCancelled, playUrlRequired, stopClip, subscribePlayback, getPlaybackAnalyser } from "./audio";
import { spectrumClip } from "@/app/data/placement-spectrum/audio";
import LunaOrb from "@/app/(protected)/luna/_components/LunaOrb";
import { Bunny } from "@/app/_components/Bunny/Bunny";
import SayNameControl from "@/app/_components/SayNameControl";
import "./placement.css";

export default function AssessmentHandoff({
  name,
  gradeLabel,
  startHref,
  exploreHref = "/explore",
  childId,
  initialSaidAs = "",
}: {
  name: string;
  gradeLabel: string;
  startHref: string;
  exploreHref?: string;
  childId?: string;
  initialSaidAs?: string;
}) {
  const [saidAs, setSaidAs] = useState(initialSaidAs);
  const [nameStatus, setNameStatus] = useState("");
  const [savingName, setSavingName] = useState(false);
  async function savePronunciation() {
    setSavingName(true);
    setNameStatus("");
    try {
      const response = await fetch("/api/child-name/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, saidAs }),
      });
      if (!response.ok) throw new Error("Could not save");
      setNameStatus("Saved. Luna’s greeting is being updated.");
    } catch {
      setNameStatus("We couldn’t save that. Please try again.");
    } finally {
      setSavingName(false);
    }
  }
  const [speaking, setSpeaking] = useState(false);
  const [welcomeError, setWelcomeError] = useState(false);
  const analyser = useSyncExternalStore(subscribePlayback, getPlaybackAnalyser, () => null);
  useEffect(() => () => stopClip(), []);
  const welcome = async () => {
    if (speaking) {
      stopClip();
      setSpeaking(false);
      return;
    }
    setWelcomeError(false);
    setSpeaking(true);
    try {
      await playUrlRequired(spectrumClip("parent-welcome"), 12000);
    } catch (error) {
      if (!(error instanceof PlacementAudioCancelled)) setWelcomeError(true);
    } finally {
      setSpeaking(false);
    }
  };
  return (
    <main className="pa-frame pa-parent">
      <header className="pa-top">
        <Link href={exploreHref} className="pa-exit">
          <Glyph name="arrow-left" size={18} /> Back
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
            {childId && (
              <details className="pa-name-pronunciation">
                <summary>Help Luna say {name}’s name</summary>
                <SayNameControl writtenName={name} value={saidAs} onChange={setSaidAs} />
                <button
                  className="pa-secondary"
                  disabled={savingName}
                  onClick={() => void savePronunciation()}
                >
                  {savingName ? "Saving…" : "Save pronunciation"}
                </button>
                <p role="status" className="pa-small">
                  {nameStatus}
                </p>
              </details>
            )}
            <p className="pa-small">
              School grade guides the first questions. What {name} can read and understand
              determines where their journey begins, even if that’s a different grade.
            </p>
          </div>
          <div className="pa-handoff-next">
            <LunaOrb
              mode={speaking ? "speaking" : "idle"}
              analyser={analyser}
              voiceDriven
              responsive
              size={104}
              label="Luna, your child’s reading companion"
            />
            <button className="pa-replay" onClick={() => void welcome()}>
              <Glyph name={speaking ? "volume-x" : "volume2"} size={24} />
              {speaking ? "Stop welcome" : "Hear a welcome from Readee"}
            </button>
            {welcomeError && <p role="alert" className="pa-small">The welcome could not play. Check your sound and tap Hear a welcome to retry.</p>}
            <h2>Ready for your reader.</h2>
            <p>
              Hand over the device. Stay nearby for the microphone check, then let {name} answer
              independently.
            </p>
            <Link className="pa-primary" href={startHref}>
              Over to {name} <Glyph name="arrow-right" size={20} />
            </Link>
            <p className="pa-small">The assessment and full reading report are free.</p>
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
