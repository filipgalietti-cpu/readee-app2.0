"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ───────────────────────── DATA ───────────────────────── */

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

/* ──────────────────── SMALL COMPONENTS ──────────────────── */

function FloatingShape({
  delay,
  left,
  size,
  color,
  shape,
}: {
  delay: number;
  left: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "leaf";
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `-${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        borderRadius:
          shape === "circle" ? "50%" : shape === "square" ? "8px" : "50% 0 50% 0",
        opacity: 0.12,
        animation: `floatDown ${12 + delay}s linear infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: "none" as const,
      }}
    />
  );
}

function MascotFace({
  color,
  expression,
}: {
  color: string;
  expression: "happy" | "excited" | "neutral";
}) {
  const eyeStyle = expression === "excited" ? "★" : "◠";
  const mouthStyle = expression === "excited" ? "D" : "◡";

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 8px 32px ${color}44`,
        margin: "0 auto 16px",
        animation: "mascotBounce 2s ease-in-out infinite",
        position: "relative" as const,
      }}
    >
      <div style={{ display: "flex", gap: 18, marginBottom: 4, fontSize: 22 }}>
        <span style={{ color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
          {eyeStyle}
        </span>
        <span style={{ color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
          {eyeStyle}
        </span>
      </div>
      <div
        style={{
          color: "white",
          fontSize: 28,
          lineHeight: 1,
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        {mouthStyle}
      </div>
      {/* Book on head */}
      <div
        style={{
          position: "absolute" as const,
          top: -14,
          width: 36,
          height: 24,
          background: "white",
          borderRadius: "3px 3px 0 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transform: "rotate(-8deg)",
        }}
      >
        <div
          style={{
            position: "absolute" as const,
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: "#e0e0e0",
          }}
        />
      </div>
    </div>
  );
}

/* ──────────────────── STYLE CONSTANTS ──────────────────── */

const STYLE = {
  heading: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "clamp(1.6rem, 4.5vw, 2.2rem)",
    color: "#2C1810",
    margin: "0 0 8px",
  },
  subtext: {
    color: "#7A6B5D",
    fontSize: "1rem",
    margin: "0 0 28px",
    fontWeight: 500,
  },
  backButton: {
    color: "#7A6B5D",
    fontSize: "0.95rem",
    fontWeight: 600,
    padding: "12px 20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Quicksand', sans-serif",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 32,
  },
} as const;

const createPrimaryButton = (activeColor: string, disabled: boolean) => ({
  background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
  color: "white",
  fontSize: "1.05rem",
  padding: "14px 40px",
  borderRadius: 50,
  boxShadow: `0 4px 20px ${activeColor}44`,
  border: "none",
  fontFamily: "'Quicksand', sans-serif",
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.4 : 1,
  transition: "all 0.2s ease",
});

/* ──────────────────── MAIN COMPONENT ──────────────────── */

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; delay: number; color: string; size: number; rotation: number }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const activeColor = selectedColor
    ? COLORS.find((c) => c.id === selectedColor)?.hex ?? "#74C0FC"
    : "#74C0FC";

  useEffect(() => {
    if (step === 1 && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 400);
    }
  }, [step]);

  const goNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const goBack = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev
    );
  };

  const handleFinish = async () => {
    // Confetti!
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)].hex,
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));
    setConfettiPieces(pieces);
    setShowConfetti(true);

    // Save profile to localStorage (works without Supabase)
    const profile = {
      name,
      favoriteColor: selectedColor,
      favoriteColorHex: activeColor,
      interests: selectedInterests,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("readee-profile", JSON.stringify(profile));

    // ─── OPTIONAL: Save to Supabase if available ───
    // Uncomment the block below once you have a `profiles` table in Supabase.
    //
    // try {
    //   const { createClient } = await import("@/lib/supabase/client");
    //   const supabase = createClient();
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (user) {
    //     await supabase.from("profiles").upsert({
    //       id: user.id,
    //       display_name: name,
    //       favorite_color: selectedColor,
    //       favorite_color_hex: activeColor,
    //       interests: selectedInterests,
    //       onboarding_complete: true,
    //     });
    //   }
    // } catch (err) {
    //   console.error("Failed to save profile to Supabase:", err);
    // }
  };

  const handleStartReading = async () => {
    setSaving(true);
    // Small delay so the button animation feels nice
    await new Promise((r) => setTimeout(r, 600));
    router.push("/");
  };

  const shapes: { delay: number; left: number; size: number; color: string; shape: "circle" | "square" | "leaf" }[] = [
    { delay: 0, left: 10, size: 40, color: "#FF6B6B22", shape: "circle" },
    { delay: 3, left: 30, size: 25, color: "#74C0FC22", shape: "square" },
    { delay: 6, left: 55, size: 35, color: "#69DB7C22", shape: "leaf" },
    { delay: 2, left: 75, size: 30, color: "#FFD43B22", shape: "circle" },
    { delay: 8, left: 90, size: 20, color: "#B197FC22", shape: "square" },
    { delay: 4, left: 45, size: 28, color: "#F783AC22", shape: "circle" },
  ];

  const progressDots = [0, 1, 2, 3, 4];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(170deg, #FFF9F0 0%, #FFF3E6 30%, ${activeColor}08 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Quicksand', 'Nunito', 'Baloo 2', sans-serif",
        overflow: "hidden",
        position: "relative",
        padding: "20px",
      }}
    >
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Baloo+2:wght@700;800&display=swap"
        rel="stylesheet"
      />

      {/* Floating background shapes */}
      {shapes.map((s, i) => (
        <FloatingShape key={i} {...s} />
      ))}

      {/* Confetti */}
      {showConfetti &&
        confettiPieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: "fixed",
              left: `${p.left}%`,
              top: -20,
              width: p.size,
              height: p.size * 0.6,
              background: p.color,
              borderRadius: 2,
              animation: `confettiFall ${1.8 + p.delay}s ease-in forwards`,
              animationDelay: `${p.delay}s`,
              transform: `rotate(${p.rotation}deg)`,
              zIndex: 100,
              pointerEvents: "none" as const,
            }}
          />
        ))}

      {/* Progress dots */}
      {step > 0 && step < 4 && (
        <div
          style={{
            position: "fixed",
            top: 32,
            display: "flex",
            gap: 10,
            zIndex: 10,
          }}
        >
          {progressDots.map((d) => (
            <div
              key={d}
              style={{
                width: d === step ? 28 : 10,
                height: 10,
                borderRadius: 5,
                background: d <= step ? activeColor : "#e0d8cf",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                opacity: d <= step ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      )}

      {/* ═══════════ STEP 0: Welcome Splash ═══════════ */}
      {step === 0 && (
        <div
          className={isTransitioning ? "animate-fadeSlideOut" : "animate-fadeSlideIn"}
          style={{ textAlign: "center", maxWidth: 440 }}
        >
          <div className="animate-scaleIn">
            <MascotFace color="#74C0FC" expression="happy" />
          </div>
          <h1
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: "clamp(2.4rem, 6vw, 3.2rem)",
              color: "#2C1810",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            Welcome to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #74C0FC, #4dabf7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Readee!
            </span>
          </h1>
          <p
            style={{
              color: "#7A6B5D",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              lineHeight: 1.6,
              margin: "0 0 36px",
              fontWeight: 500,
            }}
          >
            Your very own reading buddy!
            <br />
            Let&apos;s get to know each other 📖
          </p>
          <button
            onClick={goNext}
            style={{
              background: "linear-gradient(135deg, #74C0FC, #4dabf7)",
              color: "white",
              fontSize: "1.15rem",
              padding: "16px 48px",
              borderRadius: 50,
              letterSpacing: 0.5,
              boxShadow: "0 4px 20px #74C0FC44",
              border: "none",
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px #74C0FC66";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px #74C0FC44";
            }}
          >
            Let&apos;s Go! →
          </button>
        </div>
      )}

      {/* ═══════════ STEP 1: Name ═══════════ */}
      {step === 1 && (
        <div
          className={isTransitioning ? "animate-fadeSlideOut" : "animate-fadeSlideIn"}
          style={{ textAlign: "center", maxWidth: 440, width: "100%" }}
        >
          <MascotFace color={activeColor} expression="happy" />
          <h2 style={STYLE.heading}>What&apos;s your name?</h2>
          <p style={STYLE.subtext}>So we know what to call you!</p>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && goNext()}
            placeholder="Type your name here..."
            maxLength={24}
            style={{
              width: "100%",
              maxWidth: 340,
              padding: "16px 24px",
              fontSize: "1.2rem",
              borderRadius: 20,
              border: `2px solid ${activeColor}44`,
              background: "white",
              textAlign: "center",
              color: "#2C1810",
              fontWeight: 600,
              boxSizing: "border-box" as const,
              fontFamily: "'Quicksand', sans-serif",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = activeColor;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = `${activeColor}44`;
            }}
          />
          {name.trim() && (
            <p
              className="animate-fadeSlideIn"
              style={{
                color: activeColor,
                fontSize: "1rem",
                margin: "16px 0 0",
                fontWeight: 600,
              }}
            >
              Nice to meet you, {name}! 🎉
            </p>
          )}
          <div style={STYLE.buttonContainer}>
            <button
              onClick={goBack}
              style={STYLE.backButton}
              onMouseOver={(e) => (e.currentTarget.style.transform = "translateX(-3px)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "translateX(0)")}
            >
              ← Back
            </button>
            <button
              onClick={goNext}
              disabled={!name.trim()}
              style={createPrimaryButton(activeColor, !name.trim())}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 2: Favorite Color ═══════════ */}
      {step === 2 && (
        <div
          className={isTransitioning ? "animate-fadeSlideOut" : "animate-fadeSlideIn"}
          style={{ textAlign: "center", maxWidth: 480, width: "100%" }}
        >
          <MascotFace color={activeColor} expression="happy" />
          <h2 style={STYLE.heading}>Pick your favorite color!</h2>
          <p style={STYLE.subtext}>
            This will make Readee feel just right for you, {name}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              maxWidth: 320,
              margin: "0 auto",
            }}
          >
            {COLORS.map((c, i) => (
              <div
                key={c.id}
                className="animate-popIn"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div
                  onClick={() => setSelectedColor(c.id)}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    background: c.hex,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border:
                      selectedColor === c.id
                        ? "3px solid #333"
                        : "3px solid transparent",
                    transform: selectedColor === c.id ? "scale(1.18)" : "scale(1)",
                    boxShadow:
                      selectedColor === c.id
                        ? "0 4px 16px rgba(0,0,0,0.15)"
                        : "none",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  {selectedColor === c.id && (
                    <span
                      style={{
                        color: "white",
                        fontSize: 24,
                        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#7A6B5D",
                    fontWeight: 600,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>
          <div style={STYLE.buttonContainer}>
            <button onClick={goBack} style={STYLE.backButton}>
              ← Back
            </button>
            <button
              onClick={goNext}
              disabled={!selectedColor}
              style={createPrimaryButton(activeColor, !selectedColor)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 3: Interests ═══════════ */}
      {step === 3 && (
        <div
          className={isTransitioning ? "animate-fadeSlideOut" : "animate-fadeSlideIn"}
          style={{ textAlign: "center", maxWidth: 520, width: "100%" }}
        >
          <MascotFace color={activeColor} expression="excited" />
          <h2 style={STYLE.heading}>What do you love?</h2>
          <p style={{ ...STYLE.subtext, margin: "0 0 24px" }}>
            Pick up to 5 things you&apos;re interested in!
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              maxWidth: 460,
              margin: "0 auto",
            }}
          >
            {INTERESTS.map((interest, i) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className="animate-popIn"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 50,
                    background: isSelected ? activeColor : "white",
                    color: isSelected ? "white" : "#2C1810",
                    border: `2px solid ${isSelected ? activeColor : "#e8ddd3"}`,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    fontFamily: "'Quicksand', sans-serif",
                    boxShadow: isSelected
                      ? `0 4px 16px ${activeColor}33`
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    animationDelay: `${i * 0.03}s`,
                    opacity: 0,
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: isSelected ? "translateY(-3px) scale(1.04)" : "none",
                    userSelect: "none" as const,
                  }}
                >
                  <span style={{ marginRight: 6 }}>{interest.emoji}</span>
                  {interest.label}
                </div>
              );
            })}
          </div>
          <p style={{ color: "#a09080", fontSize: "0.85rem", margin: "16px 0 0", fontWeight: 500 }}>
            {selectedInterests.length}/5 selected
          </p>
          <div style={{ ...STYLE.buttonContainer, marginTop: 24 }}>
            <button onClick={goBack} style={STYLE.backButton}>
              ← Back
            </button>
            <button
              onClick={() => {
                goNext();
                setTimeout(handleFinish, 400);
              }}
              disabled={selectedInterests.length === 0}
              style={createPrimaryButton(activeColor, selectedInterests.length === 0)}
            >
              Finish! 🎉
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 4: All Done! ═══════════ */}
      {step === 4 && (
        <div
          className="animate-fadeSlideIn"
          style={{ textAlign: "center", maxWidth: 480 }}
        >
          <div className="animate-scaleIn">
            <MascotFace color={activeColor} expression="excited" />
          </div>
          <h2
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
              color: "#2C1810",
              margin: "0 0 8px",
            }}
          >
            You&apos;re all set,{" "}
            <span style={{ color: activeColor }}>{name}</span>! 🎉
          </h2>
          <p
            style={{
              color: "#7A6B5D",
              fontSize: "1.05rem",
              margin: "0 0 24px",
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Readee is ready to find awesome stories just for you!
          </p>

          {/* Summary Card */}
          <div
            className="animate-pulseGlow"
            style={{
              background: "white",
              borderRadius: 24,
              padding: "24px 28px",
              maxWidth: 360,
              margin: "0 auto 28px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              textAlign: "left" as const,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${activeColor}, ${activeColor}aa)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#2C1810", fontSize: "1.1rem" }}>
                  {name}
                </div>
                <div style={{ color: "#a09080", fontSize: "0.8rem", fontWeight: 500 }}>
                  Reading Explorer
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#a09080",
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: 1,
                }}
              >
                Favorite Color
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: activeColor,
                  }}
                />
                <span style={{ fontWeight: 600, color: "#2C1810" }}>
                  {COLORS.find((c) => c.id === selectedColor)?.name}
                </span>
              </div>
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#a09080",
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: 1,
                }}
              >
                Interests
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {selectedInterests.map((id) => {
                  const interest = INTERESTS.find((i) => i.id === id);
                  if (!interest) return null;
                  return (
                    <span
                      key={id}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 50,
                        background: `${activeColor}15`,
                        color: activeColor,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      {interest.emoji} {interest.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartReading}
            disabled={saving}
            className={saving ? "" : "animate-wiggle"}
            style={{
              background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
              color: "white",
              fontSize: "1.15rem",
              padding: "16px 48px",
              borderRadius: 50,
              boxShadow: `0 4px 20px ${activeColor}44`,
              border: "none",
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {saving ? "Loading..." : "Start Reading! 📚"}
          </button>
        </div>
      )}
    </div>
  );
}
