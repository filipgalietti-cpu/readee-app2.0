"use client";

/**
 * KidWelcomeFlow — the kid-facing first-run welcome (ported from the
 * Claude Design "Kid Welcome Flow"). Replaces the old parent-facing
 * AddChildrenForm: the child themselves picks their name, grade, and
 * buddy across five delighted steps, then hands off to /assessment.
 *
 * Collects exactly what child creation needs (first_name, grade,
 * equipped_items.avatar) so the DB wiring is unchanged — insert the
 * children row, flip profiles.onboarding_complete, fire the funnel
 * event, then route to the placement test already knowing the kid.
 *
 * Deliberately single-theme (a bright, immersive kid takeover). The
 * design's decorative robot-walk / magic-trick animations are swapped
 * for our own Bunny mascot for v1; everything else is a faithful port.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import RoboWalk from "./RoboWalk";
import MagicTrick from "./MagicTrick";
import type { Child } from "@/lib/db/types";

const BALOO = "var(--font-baloo), 'Baloo 2', Nunito, sans-serif";
const NUN = "Nunito, ui-sans-serif, system-ui, sans-serif";
const INDIGO = "#4338ca";

const GREETINGS = ["Hi!", "¡Hola!", "Hello!", "Bonjour!", "Ciao!", "Greetings!", "Howdy!", "Aloha!"];

const GRADE_OPTS: { label: string; sub: string; value: string }[] = [
  { label: "K", sub: "Kindergarten", value: "Kindergarten" },
  { label: "1st", sub: "grade", value: "1st" },
  { label: "2nd", sub: "grade", value: "2nd" },
  { label: "3rd", sub: "grade", value: "3rd" },
  { label: "4th", sub: "grade", value: "4th" },
];

const AVATARS: { id: string; alt: string }[] = [
  { id: "avatar_fox", alt: "Fox" },
  { id: "avatar_owl", alt: "Owl" },
  { id: "avatar_unicorn", alt: "Unicorn" },
  { id: "avatar_dragon", alt: "Dragon" },
  { id: "avatar_astronaut", alt: "Astronaut" },
  { id: "avatar_robot", alt: "Robot" },
  { id: "avatar_rabbit", alt: "Rabbit" },
  { id: "avatar_dino", alt: "Dino" },
  { id: "avatar_lion", alt: "Lion" },
  { id: "avatar_phoenix", alt: "Phoenix" },
];

const DRAFT_KEY = "readee.kidwelcome-draft";

const primaryBtn: React.CSSProperties = {
  border: 0, cursor: "pointer", background: INDIGO, color: "#fff", borderRadius: 999,
  padding: "18px 52px", font: `800 24px/1 ${BALOO}`, boxShadow: "0 10px 24px -8px rgba(67,56,202,.6)",
};

export default function KidWelcomeFlow({ onDone }: { onDone: (kids: Child[]) => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1..5
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string | null>(null);
  const [avatar, setAvatar] = useState("avatar_fox");
  const [greetIdx, setGreetIdx] = useState(0);
  // Runtime "Nice to meet you, {name}!" clip (Autonoe), pre-generated while the
  // kid is still on the name step so it's ready — with their real name — when
  // step 3 greets them. Keyed to the name so a re-type regenerates.
  const [nameAudio, setNameAudio] = useState<{ name: string; url: string } | null>(null);
  const nameAudioFetching = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const greetTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Rotate the hello bubble like the design (every ~5s, in sync with the wave).
  useEffect(() => {
    greetTimer.current = setInterval(() => setGreetIdx((i) => i + 1), 5000);
    return () => { if (greetTimer.current) clearInterval(greetTimer.current); };
  }, []);

  // Pre-generate the name greeting on the name step (downtime) so step 3 can
  // greet the kid by name in Autonoe's voice with no wait. Debounced; skips
  // work once we already hold the clip for this exact name.
  useEffect(() => {
    const n = name.trim();
    if (step !== 2 || n.length < 1 || nameAudio?.name === n || nameAudioFetching.current) return;
    const t = setTimeout(async () => {
      nameAudioFetching.current = true;
      try {
        const res = await fetch("/api/luna/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `Nice to meet you, ${n}!` }),
        });
        const j = await res.json();
        if (j?.ok && j.audioUrl) setNameAudio({ name: n, url: j.audioUrl });
      } catch { /* fall back to the recorded clip / browser speech */ }
      finally { nameAudioFetching.current = false; }
    }, 700);
    return () => clearTimeout(t);
  }, [name, step, nameAudio]);

  // Rehydrate an in-progress draft (a refresh mid-flow shouldn't wipe it).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { step?: number; name?: string; grade?: string | null; avatar?: string };
      if (typeof d.name === "string") setName(d.name);
      if (typeof d.grade === "string") setGrade(d.grade);
      if (typeof d.avatar === "string" && AVATARS.some((a) => a.id === d.avatar)) setAvatar(d.avatar);
      if (typeof d.step === "number" && d.step >= 1 && d.step <= 5) setStep(d.step);
    } catch { /* corrupt — start clean */ }
  }, []);

  // Persist the draft on every meaningful change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, name, grade, avatar })); } catch { /* non-fatal */ }
  }, [step, name, grade, avatar]);

  const shownName = name.trim() ? name.trim() : "Reader";

  // Stop any narration when the flow unmounts (e.g. we route to /assessment).
  useEffect(() => () => {
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  }, []);

  // Robotic browser voice — only used if the recorded clip can't play.
  const speakFallback = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    } catch { /* unsupported — silent */ }
  };

  // Play the recorded Autonoe clip for a step; fall back to browser speech.
  const playStep = (n: number) => {
    const fallback = () => speakFallback(currentSpokenText(n, name.trim() || "Reader"));
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis?.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      // Step 3 greets by name — play the runtime clip (pre-fetched on the name
      // step) so it actually says their name; else the generic recorded clip.
      const url = n === 3 && nameAudio && nameAudio.name === (name.trim() || "Reader")
        ? nameAudio.url
        : supabaseBrowser().storage.from("audio").getPublicUrl(`onboarding/welcome-${n}.mp3`).data.publicUrl;
      const a = new Audio(url);
      audioRef.current = a;
      a.play().catch(fallback);
    } catch { fallback(); }
  };

  // Advance and narrate the next step (both are triggered by a tap, so
  // audio is allowed to play under the browser's autoplay policy).
  const next = () => {
    const n = Math.min(5, step + 1);
    setStep(n);
    if (n !== step) playStep(n);
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not signed in. Refresh and try again."); setSaving(false); return; }

    const { data, error: insertError } = await supabase
      .from("children")
      .insert({
        parent_id: user.id,
        first_name: name.trim() || "Reader",
        grade: grade ?? "Kindergarten",
        equipped_items: { avatar },
      })
      .select()
      .single();

    if (insertError || !data) {
      console.error("Error saving child:", insertError);
      setError("Couldn't save. Try again.");
      setSaving(false);
      return;
    }

    const kid = data as Child;
    // NOTE: intentionally do NOT call onDone() here. It swaps the dashboard to
    // the home view, which flashed for a frame before the placement loaded. The
    // child is saved in the DB and the dashboard reloads it on return, so we
    // navigate straight into the reading placement (Luna's exam) instead.
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }

    void supabase
      .from("profiles")
      .update({ onboarding_complete: true, onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id);
    trackFunnelClient("funnel.kid_added", { grade: grade ?? "Kindergarten", source: "kid_welcome" });
    // Fire the welcome email now (don't wait for the daily cron). Fire-and-forget.
    void fetch("/api/lifecycle/welcome", { method: "POST" }).catch(() => {});

    router.push(`/placement?child=${kid.id}`);
  };

  const dotIdx = step - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "linear-gradient(160deg,#ffe8ed 0%,#ffffff 40%,#f0e8ff 80%,#e0ecff 100%)", display: "flex", flexDirection: "column", fontFamily: NUN, overflowY: "auto" }}>
      <style>{`
        @keyframes kwfIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes kwfRing{0%{box-shadow:0 0 0 0 rgba(67,56,202,.35)}70%{box-shadow:0 0 0 14px rgba(67,56,202,0)}100%{box-shadow:0 0 0 0 rgba(67,56,202,0)}}
        @keyframes kwfPop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes kwfShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .kwf-skel{background:linear-gradient(90deg,#eef2ff 25%,#f5f3ff 50%,#eef2ff 75%);background-size:200% 100%;animation:kwfShimmer 1.3s ease-in-out infinite}
        .kwf-in{animation:kwfIn .45s cubic-bezier(.34,1.56,.64,1) both}
        .kwf-ring{animation:kwfRing 2.6s ease-out infinite}
        .kwf-avatar{transition:transform .18s cubic-bezier(.34,1.56,.64,1)}
        .kwf-avatar:hover{transform:translateY(-4px)}
        .kwf-grade:hover,.kwf-btn:hover{filter:brightness(1.05)}
        @media (prefers-reduced-motion: reduce){.kwf-in,.kwf-ring{animation:none}}
      `}</style>

      {/* Header: progress dots + read-to-me */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 0", flex: "none" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ display: "block", width: i === dotIdx ? 26 : 8, height: 8, borderRadius: 99, background: i <= dotIdx ? INDIGO : "rgba(67,56,202,.22)", transition: "all .3s" }} />
          ))}
        </div>
        <button type="button" onClick={() => playStep(step)} aria-label="Read this to me" className="kwf-ring"
          style={{ border: `2px solid ${INDIGO}`, background: "#fff", color: INDIGO, width: 52, height: 52, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" /></svg>
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* STEP 1 — welcome */}
        {step === 1 && (
          <div className="kwf-in" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 48, padding: "0 40px 40px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 300, height: 320, flex: "none" }}>
              <BunnyReaction outfitId="bunny_classic" state="wave" bubbleText={GREETINGS[greetIdx % GREETINGS.length]} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 440, maxWidth: "100%", flex: "none" }}>
              <h1 style={{ margin: 0, font: `800 clamp(38px,7vw,54px)/1.06 ${BALOO}`, color: "#1e1b4b", letterSpacing: "-.02em" }}>Welcome to Readee!</h1>
              <p style={{ margin: "16px 0 0", font: `600 23px/1.35 ${NUN}`, color: "#52525b" }}>Let&apos;s get started</p>
              <button type="button" className="kwf-btn" onClick={next} style={{ ...primaryBtn, marginTop: 32 }}>Start</button>
            </div>
          </div>
        )}

        {/* STEP 2 — name */}
        {step === 2 && (
          <div className="kwf-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px 44px" }}>
            <div style={{ width: 480, maxWidth: "100%", flex: "none" }}><RoboWalk /></div>
            <h1 style={{ margin: "8px 0 0", font: `800 clamp(34px,6vw,50px)/1.06 ${BALOO}`, color: "#1e1b4b", letterSpacing: "-.02em", textAlign: "center" }}>What is your name?</h1>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your name" maxLength={16} autoComplete="off" autoFocus
              style={{ marginTop: 24, width: 460, maxWidth: "100%", boxSizing: "border-box", textAlign: "center", border: "3px solid #c7d2fe", borderRadius: 22, background: "#fff", padding: "16px 20px", font: `800 clamp(28px,5vw,38px)/1.1 ${BALOO}`, color: "#1e1b4b", outline: "none", boxShadow: "0 8px 20px -12px rgba(30,27,75,.35)" }} />
            <button type="button" className="kwf-btn" onClick={next} disabled={!name.trim()} style={{ ...primaryBtn, marginTop: 26, opacity: name.trim() ? 1 : 0.45, cursor: name.trim() ? "pointer" : "not-allowed" }}>That&apos;s me</button>
          </div>
        )}

        {/* STEP 3 — grade */}
        {step === 3 && (
          <div className="kwf-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px 44px" }}>
            <div style={{ width: 220, maxWidth: "100%", flex: "none" }}><MagicTrick /></div>
            <h1 style={{ margin: "6px 0 0", font: `800 clamp(30px,5.5vw,42px)/1.08 ${BALOO}`, color: "#1e1b4b", letterSpacing: "-.02em", textAlign: "center" }}>Nice to meet you, {shownName}!</h1>
            <p style={{ margin: "8px 0 0", font: `600 21px/1.35 ${NUN}`, color: "#52525b" }}>What grade are you in?</p>
            <div style={{ display: "flex", gap: 14, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {GRADE_OPTS.map((g) => {
                const on = grade === g.value;
                return (
                  <button key={g.value} type="button" className="kwf-grade" onClick={() => setGrade(g.value)}
                    style={{ cursor: "pointer", border: `3px solid ${on ? INDIGO : "rgba(30,27,75,.12)"}`, background: on ? INDIGO : "#fff", color: on ? "#fff" : "#1e1b4b", borderRadius: 24, width: 108, height: 92, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxShadow: on ? "0 10px 22px -10px rgba(67,56,202,.7)" : "0 6px 16px -12px rgba(30,27,75,.5)" }}>
                    <span style={{ font: `800 28px/1 ${BALOO}` }}>{g.label}</span>
                    <span style={{ font: `700 13px/1 ${NUN}`, opacity: 0.72 }}>{g.sub}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="kwf-btn" onClick={next} disabled={!grade} style={{ ...primaryBtn, marginTop: 20, padding: "16px 48px", fontSize: 22, opacity: grade ? 1 : 0.45, cursor: grade ? "pointer" : "not-allowed" }}>Next</button>
          </div>
        )}

        {/* STEP 4 — pick a buddy */}
        {step === 4 && (
          <div className="kwf-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "0 32px 32px" }}>
            <h1 style={{ margin: 0, font: `800 clamp(32px,6vw,46px)/1.06 ${BALOO}`, color: "#1e1b4b", letterSpacing: "-.02em" }}>Pick your buddy</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 16, width: "100%", maxWidth: 760 }}>
              {AVATARS.map((a) => {
                const on = avatar === a.id;
                return (
                  <button key={a.id} type="button" className="kwf-avatar" onClick={() => setAvatar(a.id)}
                    style={{ cursor: "pointer", padding: 8, borderRadius: 24, background: on ? "#e0e7ff" : "#fff", border: `3px solid ${on ? INDIGO : "rgba(30,27,75,.10)"}` }}>
                    <AvatarImg id={a.id} alt={a.alt} />
                  </button>
                );
              })}
            </div>
            <button type="button" className="kwf-btn" onClick={next} style={{ ...primaryBtn, padding: "16px 44px", fontSize: 22 }}>That&apos;s me</button>
          </div>
        )}

        {/* STEP 5 — reading skills handoff */}
        {step === 5 && (
          <div className="kwf-in" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 44, padding: "0 40px 40px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 280, height: 300, flex: "none" }}>
              <BunnyReaction outfitId="bunny_classic" state="levelup" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/avatars/${avatar}.png`} alt="Your buddy" style={{ position: "absolute", right: 0, bottom: 8, width: 100, height: 100, objectFit: "cover", borderRadius: 999, border: "5px solid #fff", boxShadow: "0 8px 20px -6px rgba(30,27,75,.35)", animation: "kwfPop .5s cubic-bezier(.34,1.56,.64,1) both" }} />
            </div>
            <div style={{ width: 430, maxWidth: "100%", flex: "none" }}>
              <p style={{ margin: "0 0 10px", font: `800 13px/1 ${NUN}`, letterSpacing: ".14em", textTransform: "uppercase", color: INDIGO }}>Last thing</p>
              <h1 style={{ margin: 0, font: `800 clamp(34px,6vw,48px)/1.08 ${BALOO}`, color: "#1e1b4b", letterSpacing: "-.02em" }}>Let&apos;s see those Reading Skills!</h1>
              <p style={{ margin: "16px 0 0", font: `600 22px/1.35 ${NUN}`, color: "#52525b" }}>A quick challenge!</p>
              {error && <p style={{ margin: "12px 0 0", color: "#dc2626", font: `700 15px ${NUN}` }}>{error}</p>}
              <button type="button" className="kwf-btn" onClick={finish} disabled={saving} style={{ ...primaryBtn, marginTop: 32, opacity: saving ? 0.7 : 1 }}>{saving ? "Getting ready…" : "Let's go"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Avatar image with a shimmer skeleton until it loads, then a quick fade-in —
 *  so the buddy grid never pops in raw. */
function AvatarImg({ id, alt }: { id: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={loaded ? "" : "kwf-skel"} style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: 18, overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/avatars/${id}.png`}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 18, display: "block", opacity: loaded ? 1 : 0, transition: "opacity .25s ease" }}
      />
    </div>
  );
}

function currentSpokenText(step: number, name: string): string {
  switch (step) {
    case 1: return "Welcome to Readee! Let's get started.";
    case 2: return "Welcome to Readee! What is your name?";
    case 3: return `Nice to meet you, ${name}! What grade are you in?`;
    case 4: return "Pick your buddy!";
    case 5: return "Let's see those reading skills! A quick challenge!";
    default: return "";
  }
}
