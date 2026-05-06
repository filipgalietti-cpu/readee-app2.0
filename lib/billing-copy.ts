/**
 * Single source of truth for billing copy + pricing.
 *
 * Every billing-adjacent surface (/upgrade, /billing, paywall reasons,
 * marketing site FAQ, etc.) reads from THIS file. If a price or
 * feature line shows up anywhere else as a string literal, that's a
 * bug — refactor it to read from here.
 *
 * Why: prevents the "$9.99 here, $6.99 there, $79.99/yr in one FAQ
 * but $83.88/yr in Stripe" drift that erodes parent trust.
 */

/* ─── Pricing ────────────────────────────────────────────── */
// These values must match Stripe live products exactly. If you
// change these, also update the Stripe products + price IDs and
// re-deploy.
export const PRICING = {
  monthly: {
    perMonth: 9.99,
    perYear: 119.88, // 9.99 × 12
    label: "$9.99/mo",
    cadence: "billed monthly",
  },
  annual: {
    perMonth: 6.99, // 83.88 / 12, rounded for display
    perYear: 83.88,
    label: "$6.99/mo",
    cadence: "billed annually as $83.88",
    savingsLabel: "Save 30%",
  },
  trialDays: 7,
  currency: "USD" as const,
} as const;

/* ─── What's included in each tier ───────────────────────── */
export const PREMIUM_FEATURES = [
  "Full K–4 lesson library — 162 interactive lessons",
  "Unlimited practice across 200+ Common Core standards",
  "All 25 decodable stories with read-aloud audio",
  "Reading Buddy — live AI conversation partner",
  "Homework Scanner — photo to instant practice",
  "Ask Readee — generate custom passages on any topic",
  "Daily question of the day",
  "Spaced-repetition review engine",
  "Parent progress reports + skill mastery analytics",
  "Cancel anytime",
] as const;

export const FREE_FEATURES = [
  "Adaptive K–4 placement test",
  "First lesson per grade level",
  "10 practice questions per standard",
  "2 stories per grade",
  "Daily question (free, no login)",
  "Community library (free, no login)",
] as const;

/* ─── Plan metadata ──────────────────────────────────────── */
export const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  premium: "Readee+",
  teacher_solo: "Teacher Solo",
  classroom: "Classroom",
  school: "School",
  district: "District",
};

/* ─── Trust signals shown near checkout ──────────────────── */
export const TRUST_SIGNALS = [
  "7-day free trial · No charge until day 8",
  "Cancel anytime — one click, no questions",
  "Secure checkout via Stripe",
  "COPPA + FERPA compliant",
] as const;

/* ─── Refund + support copy ──────────────────────────────── */
export const SUPPORT = {
  email: "hello@readee.app",
  refundPolicy:
    "Cancel during the 7-day trial and you won't be charged. After the trial, cancel anytime — your access continues through the end of your current billing period, then drops to Free. We don't offer prorated refunds for partial months.",
} as const;

/* ─── Paywall reason copy (used by /upgrade?reason=…) ────── */
export const REASON_COPY: Record<string, { title: string; subtitle: string }> = {
  lesson: {
    title: "Keep the streak going.",
    subtitle:
      "Your reader finished the free lesson. Readee+ unlocks the full 162-lesson library — every CCSS standard, K–4.",
  },
  practice: {
    title: "Practice without a wall.",
    subtitle:
      "Free accounts cap at 10 practice questions per standard. Readee+ removes the cap and unlocks every question across 200+ standards.",
  },
  analytics: {
    title: "See exactly what they've mastered.",
    subtitle:
      "Per-skill mastery, growth over time, and the standards your child needs more reps on. Readee+ only.",
  },
  story: {
    title: "All 25 stories. None of the gates.",
    subtitle:
      "Free includes 2 stories per grade. Readee+ unlocks the whole decodable library plus read-aloud audio.",
  },
  child: {
    title: "Unlock everything.",
    subtitle:
      "Lessons, stories, practice, parent reports — Readee+ removes every gate.",
  },
  ask_readee: {
    title: "Ask Readee. Get a passage.",
    subtitle:
      "Generate a reading passage on any topic in seconds — kid-safe, level-perfect, with audio + comprehension questions baked in. Readee+ only.",
  },
  homework_scan: {
    title: "Snap any worksheet, get instant practice.",
    subtitle:
      "Take a photo of a school packet. Readee identifies the skill being tested and pulls live practice on the same standard. Readee+ only.",
  },
  reading_buddy: {
    title: "A reading partner that listens back.",
    subtitle:
      "Live conversational AI that reads stories, coaches pronunciation, and remembers what you read together. Readee+ only.",
  },
  smart_search: {
    title: "Find any passage by what it's about.",
    subtitle:
      "Search 911 questions and 162 lessons by meaning, not just keywords. Readee+ only.",
  },
  tools_hub: {
    title: "Unlock everything in Readee+.",
    subtitle:
      "Reading Buddy, Homework Scanner, Ask Readee, and the full reading toolkit — at your child's exact level.",
  },
};

/* ─── FAQ — same questions across /upgrade + marketing ─── */
export const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click in your account, no questions asked. You keep access through the end of your billing period, then drop to Free.",
  },
  {
    q: "Is there a free trial?",
    a: `Yes. ${PRICING.trialDays} days free. No credit card charged until the trial ends. Cancel before day ${PRICING.trialDays + 1} and you won't be charged a cent.`,
  },
  {
    q: "What's included in the free plan?",
    a: "The adaptive placement test, the first lesson per grade, 10 practice questions per standard, 2 stories per grade, the daily question, and the public Community library.",
  },
  {
    q: "What happens to my child's progress if I cancel?",
    a: "All progress is saved permanently. You won't have access to premium features until you resubscribe — but every standard mastered, every lesson completed, stays exactly where you left off.",
  },
  {
    q: "What ages is Readee designed for?",
    a: "Readee covers Kindergarten through 4th grade — ages 5 to 10. The adaptive placement test puts your child at exactly the right level on day one.",
  },
  {
    q: "How is Readee different from other reading apps?",
    a: "Readee is built on real Common Core ELA standards — the same ones teachers use in school — and follows the Science of Reading. Most reading apps are dressed-up games. Readee teaches.",
  },
  {
    q: "Is my child's data safe?",
    a: "Yes. Readee is COPPA and FERPA compliant. We never sell student data, never run third-party ads, and offer schools a Data Processing Agreement on request.",
  },
];
