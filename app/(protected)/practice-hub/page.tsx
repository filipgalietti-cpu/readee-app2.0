"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import Image from "next/image";
import {
  Shuffle, BookOpen, Type, Newspaper, MessageCircle,
  ChevronDown, ChevronRight, Zap, Flame, Star, Check,
} from "lucide-react";
import TopCommunityPicks from "./_components/TopCommunityPicks";
import { SkeletonPage } from "@/app/_components/Skeleton";
import ProductSearchBar from "@/app/_components/ProductSearchBar";
import { usePlanStore } from "@/lib/stores/plan-store";
import { useChildStore } from "@/lib/stores/child-store";

const GRADE_BADGES: Record<string, string> = {
  kindergarten: "/images/ui/grades/grade-k.png",
  "1st": "/images/ui/grades/grade-1.png",
  "2nd": "/images/ui/grades/grade-2.png",
  "3rd": "/images/ui/grades/grade-3.png",
  "4th": "/images/ui/grades/grade-4.png",
};

/* ── Load standards data per grade ─────────────────── */

import kData from "@/app/data/kindergarten-standards-questions.json";
import g1Data from "@/app/data/1st-grade-standards-questions.json";
import g2Data from "@/app/data/2nd-grade-standards-questions.json";
import g3Data from "@/app/data/3rd-grade-standards-questions.json";
import g4Data from "@/app/data/4th-grade-standards-questions.json";

const GRADE_DATA: Record<string, any> = {
  kindergarten: kData, "1st": g1Data, "2nd": g2Data, "3rd": g3Data, "4th": g4Data,
};

/* ── Kid-friendly names ────────────────────────────── */

const KID_NAMES: Record<string, { name: string; desc: string }> = {
  // ── Kindergarten ──
  "RL.K.1": { name: "Key Details", desc: "Find details in a story" },
  "RL.K.2": { name: "Retelling", desc: "Retell a story" },
  "RL.K.3": { name: "Story People", desc: "Characters, settings, events" },
  "RL.K.4": { name: "New Words", desc: "Learn unknown words" },
  "RL.K.5": { name: "Book Types", desc: "Stories vs. poems" },
  "RL.K.6": { name: "Authors", desc: "Who wrote it?" },
  "RL.K.7": { name: "Story Art", desc: "Pictures tell the story" },
  "RL.K.9": { name: "Compare Stories", desc: "Two stories, same topic" },
  "RI.K.1": { name: "Info Details", desc: "Facts in nonfiction" },
  "RI.K.2": { name: "Main Topic", desc: "What's it mostly about?" },
  "RI.K.3": { name: "Linking Ideas", desc: "Connect ideas in a text" },
  "RI.K.4": { name: "Info Words", desc: "Words in nonfiction" },
  "RI.K.5": { name: "Book Parts", desc: "Cover, title, pages" },
  "RI.K.6": { name: "Who Wrote?", desc: "Author vs. illustrator" },
  "RI.K.7": { name: "Art & Text", desc: "Pictures help explain" },
  "RI.K.8": { name: "Author's Why", desc: "Reasons and support" },
  "RI.K.9": { name: "Compare Texts", desc: "Two texts, same topic" },
  "RF.K.1a": { name: "Word Tracking", desc: "Read left to right" },
  "RF.K.1b": { name: "Print Concepts", desc: "Words are made of letters" },
  "RF.K.1c": { name: "Word Spaces", desc: "Spaces between words" },
  "RF.K.1d": { name: "ABCs", desc: "Know your letters" },
  "RF.K.2a": { name: "Rhyming", desc: "Words that sound alike" },
  "RF.K.2b": { name: "Syllables", desc: "Clap the parts" },
  "RF.K.2c": { name: "Blending", desc: "First and last sounds" },
  "RF.K.2d": { name: "Sound Out", desc: "Sounds in words" },
  "RF.K.2e": { name: "New Sounds", desc: "Change a sound, new word" },
  "RF.K.3a": { name: "Letter Sounds", desc: "Letters make sounds" },
  "RF.K.3b": { name: "Vowel Sounds", desc: "A, E, I, O, U" },
  "RF.K.3c": { name: "Sight Words", desc: "Words to know by heart" },
  "RF.K.3d": { name: "Spelling Clues", desc: "Similar-looking words" },
  "RF.K.4": { name: "Reading Time", desc: "Read with purpose" },
  "K.L.1": { name: "Grammar", desc: "Nouns, verbs, sentences" },
  "K.L.2": { name: "Punctuation", desc: "Capitals and periods" },
  "K.L.4": { name: "Word Meaning", desc: "Figure out new words" },
  "K.L.5": { name: "Word Play", desc: "Word relationships" },
  "K.L.6": { name: "Vocabulary", desc: "Use new words" },
  // ── 1st Grade ──
  "RL.1.1": { name: "Story Details", desc: "Answer questions about a story" },
  "RL.1.2": { name: "Retelling", desc: "Retell with key details" },
  "RL.1.3": { name: "Characters", desc: "Describe characters and events" },
  "RL.1.4": { name: "Story Words", desc: "Feelings and senses in stories" },
  "RL.1.5": { name: "Story vs. Info", desc: "Fiction vs. nonfiction" },
  "RL.1.6": { name: "Who's Talking?", desc: "Identify the narrator" },
  "RL.1.7": { name: "Pictures + Story", desc: "Use pictures to understand" },
  "RL.1.9": { name: "Compare Characters", desc: "Same and different characters" },
  "RI.1.1": { name: "Info Questions", desc: "Answer questions about facts" },
  "RI.1.2": { name: "Main Topic", desc: "What's the text about?" },
  "RI.1.3": { name: "Connections", desc: "Link people, events, ideas" },
  "RI.1.4": { name: "Info Words", desc: "Figure out word meanings" },
  "RI.1.5": { name: "Text Features", desc: "Headings, tables, glossaries" },
  "RI.1.6": { name: "Pictures vs. Words", desc: "What pictures add" },
  "RI.1.7": { name: "Images + Details", desc: "Use images to understand" },
  "RI.1.8": { name: "Author's Reasons", desc: "Why the author wrote it" },
  "RI.1.9": { name: "Compare Texts", desc: "Two texts on same topic" },
  "RF.1.1a": { name: "Sentences", desc: "What makes a sentence" },
  "RF.1.2b": { name: "Blending", desc: "Blend sounds into words" },
  "RF.1.2c": { name: "Sound Isolation", desc: "First, middle, last sounds" },
  "RF.1.2d": { name: "Segmenting", desc: "Break words into sounds" },
  "RF.1.4b": { name: "Fluency", desc: "Read smoothly and clearly" },
  "RF.1.4c": { name: "Self-Correct", desc: "Fix mistakes while reading" },
  "L.1.4": { name: "Word Meaning", desc: "Figure out new words" },
  "L.1.4a": { name: "Context Clues", desc: "Use the sentence to guess" },
  "L.1.4b": { name: "Prefixes", desc: "Word beginnings change meaning" },
  "L.1.4c": { name: "Root Words", desc: "Find the base word" },
  "L.1.5": { name: "Word Relationships", desc: "How words connect" },
  "L.1.5a": { name: "Word Sorting", desc: "Group words by meaning" },
  "L.1.5b": { name: "Word Definitions", desc: "Define by category" },
  "L.1.5c": { name: "Real-Life Words", desc: "Words in everyday life" },
  "L.1.5d": { name: "Shades of Meaning", desc: "Similar but different words" },
  "L.1.6": { name: "New Vocabulary", desc: "Use words from reading" },
  // ── 2nd Grade ──
  "RL.2.1": { name: "Story Questions", desc: "Who, what, where, when, why" },
  "RL.2.2": { name: "Story Message", desc: "Lesson or moral of a story" },
  "RL.2.3": { name: "Characters React", desc: "How characters handle events" },
  "RL.2.4": { name: "Rhythm & Meaning", desc: "Words that create rhythm" },
  "RL.2.5": { name: "Story Structure", desc: "Beginning, middle, end" },
  "RL.2.6": { name: "Point of View", desc: "Different character views" },
  "RL.2.7": { name: "Pictures + Words", desc: "Images help understand" },
  "RL.2.9": { name: "Compare Versions", desc: "Same story, different versions" },
  "RL.2.10": { name: "Read on Level", desc: "Read grade-level stories" },
  "RI.2.1": { name: "Info Questions", desc: "Who, what, where, when, why" },
  "RI.2.2": { name: "Main Idea", desc: "Topic of longer texts" },
  "RI.2.3": { name: "History Links", desc: "Connect events and ideas" },
  "RI.2.4": { name: "Topic Words", desc: "Words specific to a subject" },
  "RI.2.5": { name: "Text Features", desc: "Captions, bold words, index" },
  "RI.2.6": { name: "Author's Purpose", desc: "Why the author wrote it" },
  "RI.2.7": { name: "Images Explain", desc: "How pictures add meaning" },
  "RI.2.8": { name: "Supporting Points", desc: "Reasons behind the text" },
  "RI.2.9": { name: "Compare Info", desc: "Two texts on same topic" },
  "RI.2.10": { name: "Read Info Texts", desc: "Read grade-level nonfiction" },
  "RF.2.3": { name: "Phonics", desc: "Sound out new words" },
  "RF.2.3a": { name: "Long & Short Vowels", desc: "Vowel sounds in words" },
  "RF.2.3b": { name: "Vowel Teams", desc: "Two vowels make one sound" },
  "RF.2.3c": { name: "Two-Syllable Words", desc: "Longer words with vowels" },
  "RF.2.3d": { name: "Prefixes & Suffixes", desc: "Word parts that change meaning" },
  "RF.2.3e": { name: "Tricky Spellings", desc: "Words that break the rules" },
  "RF.2.3f": { name: "Sight Words", desc: "Irregular words to memorize" },
  "RF.2.4": { name: "Fluency", desc: "Read smoothly and clearly" },
  "RF.2.4a": { name: "Read with Purpose", desc: "Understand what you read" },
  "RF.2.4b": { name: "Read Aloud", desc: "Read with expression" },
  "RF.2.4c": { name: "Self-Correct", desc: "Fix mistakes while reading" },
  "L.2.4": { name: "Word Meaning", desc: "Figure out new words" },
  "L.2.4a": { name: "Context Clues", desc: "Use the sentence to guess" },
  "L.2.4b": { name: "Prefix Meanings", desc: "How prefixes change words" },
  "L.2.4c": { name: "Root Words", desc: "Find the base word" },
  "L.2.4d": { name: "Compound Words", desc: "Two words make one" },
  "L.2.4e": { name: "Dictionary Skills", desc: "Look up word meanings" },
  "L.2.5": { name: "Word Relationships", desc: "How words connect" },
  "L.2.5a": { name: "Real-Life Words", desc: "Words in everyday life" },
  "L.2.5b": { name: "Shades of Meaning", desc: "Similar but different words" },
  "L.2.6": { name: "New Vocabulary", desc: "Use words from reading" },
  // ── 3rd Grade ──
  "RL.3.1": { name: "Text Evidence", desc: "Prove it from the story" },
  "RL.3.2": { name: "Theme", desc: "Central message or lesson" },
  "RL.3.3": { name: "Character Traits", desc: "Why characters do things" },
  "RL.3.4": { name: "Figurative Language", desc: "Beyond literal meaning" },
  "RL.3.5": { name: "Story Parts", desc: "Chapters, scenes, stanzas" },
  "RL.3.6": { name: "Point of View", desc: "Your view vs. narrator's" },
  "RL.3.7": { name: "Illustrations", desc: "How art adds to the story" },
  "RL.3.9": { name: "Compare Stories", desc: "Same author, different books" },
  "RL.3.10": { name: "Read on Level", desc: "Read grade-level literature" },
  "RI.3.1": { name: "Text Evidence", desc: "Prove it from the text" },
  "RI.3.2": { name: "Main Idea", desc: "Key idea and details" },
  "RI.3.3": { name: "Cause & Effect", desc: "What happened and why" },
  "RI.3.4": { name: "Academic Words", desc: "Subject-specific vocabulary" },
  "RI.3.5": { name: "Search Tools", desc: "Find info using features" },
  "RI.3.6": { name: "Author vs. You", desc: "Your opinion vs. author's" },
  "RI.3.7": { name: "Images + Words", desc: "Combine images and text" },
  "RI.3.8": { name: "Logical Connections", desc: "How sentences connect" },
  "RI.3.9": { name: "Compare Info", desc: "Two texts, same topic" },
  "RI.3.10": { name: "Read Info Texts", desc: "Read grade-level nonfiction" },
  "RF.3.3": { name: "Phonics", desc: "Sound out harder words" },
  "RF.3.3a": { name: "Prefixes & Suffixes", desc: "Common word parts" },
  "RF.3.3b": { name: "Latin Suffixes", desc: "-tion, -ment, -ness" },
  "RF.3.3c": { name: "Big Words", desc: "Break down long words" },
  "RF.3.3d": { name: "Tricky Words", desc: "Irregularly spelled words" },
  "RF.3.4": { name: "Fluency", desc: "Read smoothly and clearly" },
  "RF.3.4a": { name: "Read with Purpose", desc: "Understand what you read" },
  "RF.3.4b": { name: "Read Aloud", desc: "Read with expression" },
  "RF.3.4c": { name: "Self-Correct", desc: "Fix mistakes while reading" },
  "L.3.4": { name: "Word Meaning", desc: "Figure out new words" },
  "L.3.4a": { name: "Context Clues", desc: "Use the sentence to guess" },
  "L.3.4b": { name: "Affixes", desc: "Prefixes and suffixes" },
  "L.3.4c": { name: "Root Words", desc: "Find the base word" },
  "L.3.4d": { name: "Dictionary Skills", desc: "Look up word meanings" },
  "L.3.5": { name: "Figurative Language", desc: "Beyond literal meaning" },
  "L.3.5a": { name: "Literal vs. Not", desc: "What it really means" },
  "L.3.5b": { name: "Real-Life Words", desc: "Words in everyday life" },
  "L.3.5c": { name: "Shades of Meaning", desc: "Strong vs. weak words" },
  "L.3.6": { name: "Academic Vocab", desc: "Use precise language" },
  // ── 4th Grade ──
  "RL.4.1": { name: "Text Evidence", desc: "Support answers with details" },
  "RL.4.2": { name: "Theme", desc: "Find the story's message" },
  "RL.4.3": { name: "Deep Characters", desc: "Describe characters in depth" },
  "RL.4.4": { name: "Word Choice", desc: "Why the author chose words" },
  "RL.4.5": { name: "Genre Differences", desc: "Poems, plays, and stories" },
  "RL.4.6": { name: "Point of View", desc: "First person vs. third person" },
  "RL.4.7": { name: "Text + Visuals", desc: "Connect text to art/media" },
  "RL.4.9": { name: "Compare Themes", desc: "Same theme, different stories" },
  "RL.4.10": { name: "Read on Level", desc: "Read grade-level literature" },
  "RI.4.1": { name: "Text Evidence", desc: "Support answers with facts" },
  "RI.4.2": { name: "Main Idea", desc: "Central idea and support" },
  "RI.4.3": { name: "Explain Events", desc: "How and why things happen" },
  "RI.4.4": { name: "Academic Words", desc: "Subject-specific vocabulary" },
  "RI.4.5": { name: "Text Structure", desc: "How the text is organized" },
  "RI.4.6": { name: "Firsthand vs. Secondhand", desc: "Compare accounts" },
  "RI.4.7": { name: "Interpret Info", desc: "Read charts, graphs, images" },
  "RI.4.8": { name: "Author's Evidence", desc: "How authors prove points" },
  "RI.4.9": { name: "Combine Sources", desc: "Use two texts together" },
  "RI.4.10": { name: "Read Info Texts", desc: "Read grade-level nonfiction" },
  "RF.4.3": { name: "Phonics", desc: "Decode complex words" },
  "RF.4.3a": { name: "Word Analysis", desc: "Use all decoding skills" },
  "RF.4.4": { name: "Fluency", desc: "Read smoothly and clearly" },
  "L.4.4": { name: "Word Meaning", desc: "Figure out new words" },
  "L.4.4a": { name: "Context Clues", desc: "Use surrounding words" },
  "L.4.4b": { name: "Greek & Latin Roots", desc: "Word origins and parts" },
  "L.4.4c": { name: "Reference Tools", desc: "Use dictionaries and more" },
  "L.4.5": { name: "Figurative Language", desc: "Similes, metaphors, idioms" },
  "L.4.5a": { name: "Similes & Metaphors", desc: "Comparisons in writing" },
  "L.4.5b": { name: "Idioms & Proverbs", desc: "Common sayings and phrases" },
  "L.4.5c": { name: "Word Connections", desc: "Synonyms, antonyms, more" },
  "L.4.6": { name: "Academic Vocab", desc: "Use precise language" },
};

const DOMAIN_META: Record<string, {
  Icon: typeof BookOpen; color: string; bg: string;
  accent: string; accentText: string; tint: string; friendly: string;
}> = {
  "Reading Literature": { Icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50", accent: "#8b5cf6", accentText: "#6d28d9", tint: "#f5f3ff", friendly: "Stories, characters, and adventures" },
  "Reading Informational Text": { Icon: Newspaper, color: "text-sky-600", bg: "bg-sky-50", accent: "#38bdf8", accentText: "#0369a1", tint: "#f0f9ff", friendly: "Facts and real things" },
  "Foundational Skills": { Icon: Type, color: "text-amber-600", bg: "bg-amber-50", accent: "#f59e0b", accentText: "#b45309", tint: "#fffbeb", friendly: "Sounds, letters, and reading out loud" },
  "Language": { Icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50", accent: "#10b981", accentText: "#047857", tint: "#ecfdf5", friendly: "Words and grammar" },
};
const DOMAIN_FALLBACK = { Icon: BookOpen, color: "text-zinc-600", bg: "bg-zinc-50", accent: "#8b5cf6", accentText: "#6d28d9", tint: "#f5f3ff", friendly: "" };

// The data labels the same domain differently across grades (K/1 use
// "Foundational Skills"; 2-4 use "Reading Foundational Skills") and has a
// couple of stray 1-topic buckets. Normalize to the 4 canonical domains
// so every grade shows a consistent, color-coordinated board.
const DOMAIN_ALIAS: Record<string, string> = {
  "Reading Foundational Skills": "Foundational Skills",
  "Literature": "Reading Literature",
  "Informational": "Reading Informational Text",
};
const canonDomain = (d: string) => DOMAIN_ALIAS[d] ?? d;

// Rotating smart-search prompts (cycles every few seconds like the design).
const SEARCH_HINTS = [
  "What do you want to practice?",
  "Try “rhyming words”",
  "Describe what your kid needs…",
  "Try “a story about kindness”",
  "Try “context clues practice”",
  "Search a skill, a story, or a lesson…",
];

// Per-grade identity colors for the grade switcher bubbles.
const GRADE_META: Record<string, { letter: string; main: string; soft: string; text: string }> = {
  kindergarten: { letter: "K", main: "#8b5cf6", soft: "#ede9fe", text: "#6d28d9" },
  "1st": { letter: "1", main: "#f43f5e", soft: "#ffe4e6", text: "#be123c" },
  "2nd": { letter: "2", main: "#0d9488", soft: "#ccfbf1", text: "#0f766e" },
  "3rd": { letter: "3", main: "#22c55e", soft: "#dcfce7", text: "#15803d" },
  "4th": { letter: "4", main: "#f97316", soft: "#ffedd5", text: "#c2410c" },
};

/* ── Types ─────────────────────────────────────────── */

interface Standard {
  standard_id: string;
  domain: string;
  standard_description: string;
  questions: any[];
}

/* ── Page ──────────────────────────────────────────── */

export default function PracticeHubPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={4} />}>
      <PracticeHubContent />
    </Suspense>
  );
}

function PracticeHubContent() {
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("child");
  const router = useRouter();

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [questionsDone, setQuestionsDone] = useState(0);
  const [hintIdx, setHintIdx] = useState(0);
  const plan = usePlanStore((s) => s.plan);
  const fetchPlan = usePlanStore((s) => s.fetch);
  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  // Auto-open the kid's grade once they're loaded. MUST live with the
  // other top-level hooks (above any conditional return) — Rules of
  // Hooks. Previously placed below `if (loading) return …`, which
  // caused React error #310 (more hooks rendered after data loaded
  // than before) — that crash is what broke /practice-hub in prod.
  // Default to the kid's own grade once loaded. All domains start
  // collapsed (kid taps one to open); switching grades also folds all.
  useEffect(() => {
    if (child && !selectedGrade) {
      setSelectedGrade(levelNameToGradeKey(child.reading_level));
    }
  }, [child, selectedGrade]);

  // Real mastery: derive per-standard stars from the kid's practice
  // results (>=80% = 3 stars/mastered, >=50% = 2, any attempts = 1).
  useEffect(() => {
    if (!child) return;
    let alive = true;
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("practice_results")
        .select("standard_id, questions_correct, questions_attempted")
        .eq("child_id", child.id);
      if (!alive) return;
      const m: Record<string, number> = {};
      let done = 0;
      for (const r of (data as any[]) ?? []) {
        const att = r.questions_attempted ?? 0;
        const cor = r.questions_correct ?? 0;
        done += att;
        if (att <= 0) continue;
        const pct = cor / att;
        m[r.standard_id] = pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1;
      }
      setMastery(m);
      setQuestionsDone(done);
    })();
    return () => { alive = false; };
  }, [child]);

  // Rotate the smart-search placeholder every 3.5s.
  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => i + 1), 3500);
    return () => clearInterval(t);
  }, []);

  // Resolve a child even when the URL doesn't carry one.
  //
  // Reaching /practice-hub without ?child= is normal — the Homework
  // Scanner's "Practice this skill" CTA hands off without a child, and
  // the sidebar's parent links omit `child=` when the store hasn't
  // hydrated yet. Falling back to the child store → DB lookup lets
  // those flows resolve without bouncing the user back to /dashboard,
  // and silently URL-rewrites so refresh/bookmark works afterwards.
  //
  // Defensive contract: this resolver MUST set loading=false in every
  // branch, even unexpected ones. A spinner that never goes away is
  // the worst possible UX — better to show an error with a "Go to
  // dashboard" link than to silently get stuck.
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const supabase = supabaseBrowser();
        let resolvedId = childIdParam;

        if (!resolvedId) {
          const store = useChildStore.getState();
          const storeChild = store.childData || store.children[0] || null;
          if (storeChild) {
            resolvedId = storeChild.id;
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: kids } = await supabase
                .from("children")
                .select("*")
                .eq("parent_id", user.id)
                .order("created_at", { ascending: true })
                .limit(1);
              if (kids && kids.length > 0) resolvedId = kids[0].id;
            }
          }
        }

        if (!resolvedId) {
          if (alive) {
            setLoadError("We couldn't find a kid on this account. Head back to the dashboard and pick one.");
            setLoading(false);
          }
          return;
        }

        if (!childIdParam && resolvedId && typeof window !== "undefined") {
          // Preserve any other query params the caller passed (e.g. the
          // Homework Scanner hands off ?standard=X). We only fill the
          // missing child param.
          const url = new URL(window.location.href);
          url.searchParams.set("child", resolvedId);
          window.history.replaceState(null, "", url.toString());
        }

        const { data, error } = await supabase
          .from("children")
          .select("*")
          .eq("id", resolvedId)
          .maybeSingle();
        if (!alive) return;
        if (error) {
          setLoadError("Couldn't load your kid's profile. Try again in a moment.");
          setLoading(false);
          return;
        }
        if (!data) {
          setLoadError("This kid profile isn't on your account. Pick a different one from the dashboard.");
          setLoading(false);
          return;
        }
        setChild(data as Child);
        setLoading(false);
      } catch (e: any) {
        if (alive) {
          setLoadError(e?.message ?? "Something went wrong loading Practice.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [childIdParam, router]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-md py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-zinc-900">Hmm, something's off</h1>
        <p className="text-sm text-zinc-500">{loadError}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loading || !child) {
    return <SkeletonPage cards={4} />;
  }
  // From here on, the URL has been rewritten to include ?child= so
  // hit-link construction can rely on it.
  const childId = child.id;

  const GRADE_ORDER = ["kindergarten", "1st", "2nd", "3rd", "4th"];
  const GRADE_LABELS: Record<string, string> = {
    kindergarten: "Kindergarten", "1st": "1st Grade", "2nd": "2nd Grade", "3rd": "3rd Grade", "4th": "4th Grade",
  };

  // Build all grades with their standards
  const allGrades = GRADE_ORDER.map((gk) => {
    const data = GRADE_DATA[gk];
    const stds: Standard[] = data?.standards || data || [];
    const domainMap = new Map<string, Standard[]>();
    const domainOrder: string[] = [];
    for (const s of stds) {
      const dom = canonDomain(s.domain);
      if (!domainMap.has(dom)) { domainMap.set(dom, []); domainOrder.push(dom); }
      domainMap.get(dom)!.push(s);
    }
    return {
      gradeKey: gk,
      label: GRADE_LABELS[gk],
      standards: stds,
      domains: domainOrder.map((d) => ({ domain: d, standards: domainMap.get(d)! })),
      totalQs: stds.reduce((sum, s) => sum + (s.questions?.length || 0), 0),
    };
  });

  const allStandards = allGrades.flatMap((g) => g.standards);
  const totalQs = allStandards.reduce((sum, s) => sum + (s.questions?.length || 0), 0);

  const handleRandom = () => {
    const s = allStandards[Math.floor(Math.random() * allStandards.length)];
    if (s) router.push(`/practice?child=${childId}&standard=${s.standard_id}`);
  };

  const gk = selectedGrade || levelNameToGradeKey(child.reading_level);
  const grade = allGrades.find((g) => g.gradeKey === gk) || allGrades[0];
  const masteredTotal = allStandards.filter((s) => mastery[s.standard_id] === 3).length;
  const heroSubcopy = masteredTotal > 0
    ? `You've mastered ${masteredTotal} skill${masteredTotal === 1 ? "" : "s"} — keep collecting stars!`
    : "Pick a world and start collecting stars!";

  return (
    <div className="@container mx-auto max-w-6xl px-4 py-6 sm:px-6 pb-32 space-y-5 font-[family-name:var(--font-nunito)]">
      {/* ── Hero + grade switcher ── */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: "linear-gradient(160deg, #e8e0ff 0%, #ffffff 45%, #e0ecff 100%)" }}
        className="rounded-[24px] p-5 sm:p-7 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.15)] flex flex-col gap-5 @4xl:flex-row @4xl:items-center @4xl:gap-8"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Image
            src="/images/ui/bunny-stars.png"
            alt=""
            width={92}
            height={92}
            className="h-[76px] w-[76px] sm:h-[92px] sm:w-[92px] object-contain drop-shadow flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#1e1b4b] dark:text-white leading-[1.15] font-[family-name:var(--font-baloo)]">
              Welcome back, {child.first_name}!
            </h1>
            <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">{heroSubcopy}</p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/70 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                <Flame className="w-3.5 h-3.5 text-orange-500" strokeWidth={2} />
                {child.streak_days ?? 0}-day streak
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/70 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" strokeWidth={1} />
                {masteredTotal} skills mastered
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/70 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                {questionsDone} questions done
              </span>
            </div>
          </div>
        </div>

        {/* Grade switcher — wraps below the greeting when the content
            column is narrow (e.g. sidebar open) so the stat pills keep room. */}
        <div className="flex-shrink-0 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300 mb-2">
            Pick a grade
          </p>
          <div className="flex items-center justify-center gap-2">
            {GRADE_ORDER.map((gkey) => {
              const gmeta = GRADE_META[gkey];
              const sel = gkey === gk;
              return (
                <button
                  key={gkey}
                  onClick={() => { setSelectedGrade(gkey); setOpenDomain(null); }}
                  aria-label={GRADE_LABELS[gkey]}
                  className="rounded-full font-semibold flex items-center justify-center transition-transform hover:scale-[1.08] active:scale-95 font-[family-name:var(--font-baloo)]"
                  style={{
                    width: sel ? 56 : 42,
                    height: sel ? 56 : 42,
                    fontSize: sel ? 22 : 16,
                    background: sel ? gmeta.main : gmeta.soft,
                    color: sel ? "#ffffff" : gmeta.text,
                    boxShadow: sel ? `0 0 0 3px #ffffff, 0 8px 20px -4px ${gmeta.main}99` : "none",
                  }}
                >
                  {gmeta.letter}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-semibold" style={{ color: GRADE_META[gk].text }}>
            {grade.label} · {grade.standards.length} topics
          </p>
        </div>
      </motion.section>

      {/* ── Smart search ── */}
      <ProductSearchBar
        isPremium={plan === "premium"}
        childId={child.id}
        placeholder={SEARCH_HINTS[hintIdx % SEARCH_HINTS.length]}
      />

      {/* ── Domain board ── */}
      <section className="grid grid-cols-1 @3xl:grid-cols-2 gap-4">
        {grade.domains.map((domain) => {
          const meta = DOMAIN_META[domain.domain] || DOMAIN_FALLBACK;
          const DIcon = meta.Icon;
          const open = openDomain === domain.domain;
          const stds = domain.standards;
          const mastered = stds.filter((s) => mastery[s.standard_id] === 3).length;
          const pct = stds.length ? Math.round((mastered / stds.length) * 100) : 0;
          let nextMarked = false;
          return (
            <motion.div
              key={domain.domain}
              layout
              className={`rounded-3xl bg-white dark:bg-slate-800 border shadow-sm overflow-hidden ${open ? "@3xl:col-span-2" : ""}`}
              style={{ borderColor: open ? `${meta.accent}55` : "#e4e4e7" }}
            >
              <button
                onClick={() => setOpenDomain(open ? null : domain.domain)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 transition-colors"
                style={{ background: open ? meta.tint : undefined }}
              >
                <div
                  className="rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ width: 52, height: 52, background: meta.tint }}
                >
                  <DIcon className="w-6 h-6" strokeWidth={2} style={{ color: meta.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[18px] font-semibold text-[#18181b] dark:text-white leading-tight font-[family-name:var(--font-baloo)]">{domain.domain}</p>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mb-1.5">{meta.friendly}</p>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 max-w-[220px] h-2 rounded-full bg-zinc-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.accent }} />
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: meta.accentText }}>
                      {mastered} of {stds.length} mastered
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                      {stds.map((std) => {
                        const stars = mastery[std.standard_id] || 0;
                        const km = KID_NAMES[std.standard_id];
                        const name = km?.name || std.standard_description || std.standard_id;
                        const desc = km?.desc || (km ? "" : std.standard_description) || "";
                        const isNew = stars === 0;
                        const isNext = !nextMarked && stars > 0 && stars < 3;
                        if (isNext) nextMarked = true;
                        return (
                          <Link
                            key={std.standard_id}
                            href={`/practice?child=${childId}&standard=${std.standard_id}`}
                            className="flex flex-col gap-1.5 p-3.5 rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all"
                            style={{
                              border: isNext ? "2px solid #f59e0b" : isNew ? "1.5px dashed #d4d4d8" : "1px solid #e4e4e7",
                              background: stars === 3 ? meta.tint : "#ffffff",
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-zinc-900 leading-snug">{name}</p>
                              {isNext && (
                                <span className="inline-flex items-center gap-1 flex-shrink-0 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                  <Zap className="w-2.5 h-2.5 fill-amber-500" strokeWidth={1} />
                                  Next
                                </span>
                              )}
                              {isNew && (
                                <span className="flex-shrink-0 rounded-full bg-zinc-100 text-zinc-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                  New
                                </span>
                              )}
                            </div>
                            {desc && <p className="text-[11.5px] text-zinc-500 leading-snug">{desc}</p>}
                            <div className="flex items-center gap-0.5 mt-auto pt-0.5">
                              {[0, 1, 2].map((k) => (
                                <Star
                                  key={k}
                                  className="w-3.5 h-3.5"
                                  strokeWidth={1.5}
                                  style={{ fill: k < stars ? "#f59e0b" : "none", color: k < stars ? "#f59e0b" : "#d4d4d8" }}
                                />
                              ))}
                              <span className="ml-1.5 text-[10.5px] text-zinc-400">
                                {stars === 3 ? "Mastered!" : stars > 0 ? `${stars} of 3 stars` : "Not started"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </section>

      {/* ── Community ── */}
      <TopCommunityPicks />

      {/* ── Surprise me FAB ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleRandom}
        style={{ background: "linear-gradient(90deg, #4338ca, #7c3aed)", boxShadow: "0 10px 40px -8px rgba(67,56,202,0.55)" }}
        className="fixed right-6 bottom-6 z-40 inline-flex items-center gap-2.5 rounded-full px-6 py-4 text-white font-semibold text-[17px] hover:-translate-y-0.5 active:scale-95 transition-transform font-[family-name:var(--font-baloo)]"
      >
        <Shuffle className="w-5 h-5" strokeWidth={2} />
        Surprise me!
      </motion.button>
    </div>
  );
}
