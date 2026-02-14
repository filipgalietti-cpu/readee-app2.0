"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ───────────────────────── DATA ───────────────────────── */

const GRADES = ["Pre-K", "Kindergarten", "1st", "2nd", "3rd"] as const;

const INTERESTS = [
  { id: "adventure", emoji: "🏴‍☠️", label: "Adventure" },
  { id: "animals", emoji: "🐾", label: "Animals" },
  { id: "space", emoji: "🚀", label: "Space" },
  { id: "magic", emoji: "✨", label: "Magic" },
  { id: "sports", emoji: "⚽", label: "Sports" },
  { id: "science", emoji: "🔬", label: "Science" },
  { id: "art", emoji: "🎨", label: "Art" },
  { id: "music", emoji: "🎵", label: "Music" },
  { id: "nature", emoji: "🌿", label: "Nature" },
  { id: "cooking", emoji: "🍳", label: "Cooking" },
  { id: "dinosaurs", emoji: "🦕", label: "Dinosaurs" },
  { id: "mystery", emoji: "🔍", label: "Mystery" },
];

const COLORS = [
  { id: "red", hex: "#FF6B6B", name: "Red" },
  { id: "orange", hex: "#FFA94D", name: "Orange" },
  { id: "yellow", hex: "#FFD43B", name: "Yellow" },
  { id: "green", hex: "#69DB7C", name: "Green" },
  { id: "teal", hex: "#38D9A9", name: "Teal" },
  { id: "blue", hex: "#74C0FC", name: "Blue" },
  { id: "purple", hex: "#B197FC", name: "Purple" },
  { id: "pink", hex: "#F783AC", name: "Pink" },
];

/* ──────────────────── STYLES ──────────────────── */

const FONT_FAMILY = "'Quicksand', 'Nunito', 'Baloo 2', sans-serif";

const baseCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 560,
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.7)",
  borderRadius: 32,
  padding: "34px 28px",
  boxShadow: "0 16px 60px rgba(44,24,16,0.1)",
  textAlign: "center",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'Baloo 2', cursive",
  fontSize: "clamp(1.7rem, 4.5vw, 2.3rem)",
  color: "#2C1810",
  marginBottom: 8,
};

const subtextStyle: React.CSSProperties = {
  color: "#7A6B5D",
  fontSize: "1rem",
  marginBottom: 22,
  fontWeight: 500,
};

function primaryButton(color: string, disabled: boolean): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    color: "white",
    fontSize: "1.05rem",
    padding: "14px 40px",
    borderRadius: 999,
    border: "none",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
  };
}

const backButton: React.CSSProperties = {
  background: "none",
  border: "none",
  fontWeight: 800,
  color: "#7A6B5D",
  cursor: "pointer",
};

/* ──────────────────── MAIN ──────────────────── */

export default function WelcomePage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const activeColor = useMemo(
    () => COLORS.find((c) => c.id === selectedColor)?.hex ?? "#74C0FC",
    [selectedColor]
  );

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const handleFinish = async () => {
    const profile = {
      name,
      grade,
      favoriteColor: selectedColor,
      favoriteColorHex: activeColor,
      interests: selectedInterests,
      onboardingComplete: true,
    };

    localStorage.setItem("readee-profile", JSON.stringify(profile));

    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  };

  const handleStartReading = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    router.push("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(170deg, #FFF9F0 0%, #FFF3E6 40%, ${activeColor}08 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        padding: 20,
      }}
    >
      {/* STEP 0 */}
      {step === 0 && (
        <div style={baseCard}>
          <h1 style={headingStyle}>Welcome to Readee!</h1>
          <p style={subtextStyle}>Your very own reading buddy 📚</p>
          <button style={primaryButton("#74C0FC", false)} onClick={goNext}>
            Let’s Go →
          </button>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div style={baseCard}>
          <h2 style={headingStyle}>What’s your name?</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              padding: 16,
              width: "100%",
              maxWidth: 300,
              borderRadius: 16,
              border: "2px solid #ddd",
              fontSize: "1.1rem",
              textAlign: "center",
              fontWeight: 700,
            }}
          />
          <div style={{ marginTop: 24 }}>
            <button style={backButton} onClick={goBack}>
              ← Back
            </button>{" "}
            <button
              style={primaryButton(activeColor, !name.trim())}
              onClick={goNext}
              disabled={!name.trim()}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — NEW GRADE STEP */}
      {step === 2 && (
        <div style={baseCard}>
          <h2 style={headingStyle}>What grade are you in?</h2>
          <p style={subtextStyle}>This helps us pick the best stories for you</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 999,
                  border: `2px solid ${grade === g ? activeColor : "#e5ddd4"}`,
                  background: grade === g ? activeColor : "white",
                  color: grade === g ? "white" : "#2C1810",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <button style={backButton} onClick={goBack}>
              ← Back
            </button>{" "}
            <button
              style={primaryButton(activeColor, !grade)}
              onClick={goNext}
              disabled={!grade}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={baseCard}>
          <h2 style={headingStyle}>Pick your favorite color</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                style={{
                  background: c.hex,
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  border: selectedColor === c.id ? "3px solid #2C1810" : "none",
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <button style={backButton} onClick={goBack}>
              ← Back
            </button>{" "}
            <button
              style={primaryButton(activeColor, !selectedColor)}
              onClick={goNext}
              disabled={!selectedColor}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div style={baseCard}>
          <h2 style={headingStyle}>What do you love?</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {INTERESTS.map((i) => (
              <button
                key={i.id}
                onClick={() =>
                  setSelectedInterests((prev) =>
                    prev.includes(i.id)
                      ? prev.filter((x) => x !== i.id)
                      : prev.length < 5
                      ? [...prev, i.id]
                      : prev
                  )
                }
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: selectedInterests.includes(i.id) ? activeColor : "white",
                  color: selectedInterests.includes(i.id) ? "white" : "#2C1810",
                  fontWeight: 800,
                  border: `2px solid ${selectedInterests.includes(i.id) ? activeColor : "#ddd"}`,
                }}
              >
                {i.emoji} {i.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <button style={backButton} onClick={goBack}>
              ← Back
            </button>{" "}
            <button
              style={primaryButton(activeColor, selectedInterests.length === 0)}
              onClick={() => {
                goNext();
                handleFinish();
              }}
              disabled={selectedInterests.length === 0}
            >
              Finish 🎉
            </button>
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div style={baseCard}>
          <h2 style={headingStyle}>You’re all set, {name}! 🎉</h2>
          <p style={subtextStyle}>
            Grade: <strong>{grade}</strong>
          </p>
          <button
            style={primaryButton(activeColor, false)}
            onClick={handleStartReading}
          >
            {saving ? "Loading..." : "Start Reading 📚"}
          </button>
        </div>
      )}
    </div>
  );
}