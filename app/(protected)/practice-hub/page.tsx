"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import {
  Shuffle, BookOpen, Type, Newspaper, MessageCircle,
  ChevronDown, ChevronRight, Zap,
} from "lucide-react";

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

const DOMAIN_META: Record<string, { Icon: typeof BookOpen; color: string; bg: string }> = {
  "Reading Literature": { Icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
  "Reading Informational Text": { Icon: Newspaper, color: "text-violet-600", bg: "bg-violet-50" },
  "Foundational Skills": { Icon: Type, color: "text-amber-600", bg: "bg-amber-50" },
  "Language": { Icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <PracticeHubContent />
    </Suspense>
  );
}

function PracticeHubContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const router = useRouter();

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("children").select("*").eq("id", childId).single();
      if (data) setChild(data as Child);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

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
      if (!domainMap.has(s.domain)) { domainMap.set(s.domain, []); domainOrder.push(s.domain); }
      domainMap.get(s.domain)!.push(s);
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

  const [openGrades, setOpenGrades] = useState<Set<string>>(() => {
    const gk = levelNameToGradeKey(child.reading_level);
    return new Set([gk]);
  });

  const toggleGrade = (g: string) => {
    setOpenGrades((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const toggleDomain = (d: string) => {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <Zap className="w-10 h-10 text-indigo-500 mx-auto mb-2" strokeWidth={1.5} />
        <h1 className="text-2xl font-extrabold text-zinc-900">Practice</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {allStandards.length} topics &middot; {totalQs} questions
        </p>
      </motion.div>

      {/* Random */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onClick={handleRandom}
        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Shuffle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">Random Practice</p>
          <p className="text-xs text-white/70">Surprise me with any topic</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
      </motion.button>

      {/* Grade → Domain → Topics */}
      {allGrades.map((grade, gIdx) => {
        const gradeOpen = openGrades.has(grade.gradeKey);

        return (
          <motion.div
            key={grade.gradeKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + gIdx * 0.04 }}
            className="rounded-2xl bg-white shadow-sm overflow-hidden"
          >
            {/* Grade header */}
            <button
              onClick={() => toggleGrade(grade.gradeKey)}
              className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors ${
                gradeOpen ? "bg-gradient-to-r from-indigo-600 to-violet-500" : "hover:bg-zinc-50"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold ${
                gradeOpen ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
              }`}>
                {grade.label.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${gradeOpen ? "text-white" : "text-zinc-900"}`}>{grade.label}</p>
                <p className={`text-[11px] ${gradeOpen ? "text-white/70" : "text-zinc-400"}`}>
                  {grade.standards.length} topics &middot; {grade.totalQs} questions
                </p>
              </div>
              <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                gradeOpen ? "text-white/60 rotate-180" : "text-zinc-400"
              }`} />
            </button>

            <AnimatePresence initial={false}>
              {gradeOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 py-2 space-y-1">
                    {grade.domains.map((domain) => {
                      const domainKey = `${grade.gradeKey}-${domain.domain}`;
                      const domOpen = openDomains.has(domainKey);
                      const meta = DOMAIN_META[domain.domain] || { Icon: BookOpen, color: "text-zinc-600", bg: "bg-zinc-50" };
                      const DIcon = meta.Icon;
                      const domainQs = domain.standards.reduce((sum, s) => sum + (s.questions?.length || 0), 0);

                      return (
                        <div key={domainKey} className="rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleDomain(domainKey)}
                            className={`w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-colors ${
                              domOpen ? "bg-indigo-50" : "hover:bg-zinc-50"
                            }`}
                          >
                            <DIcon className={`w-4 h-4 flex-shrink-0 ${meta.color}`} strokeWidth={1.5} />
                            <p className="flex-1 text-left text-[13px] font-semibold text-zinc-800">{domain.domain}</p>
                            <span className="text-[11px] text-zinc-400 font-medium mr-1">{domain.standards.length} topics</span>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${domOpen ? "rotate-180" : ""}`} />
                          </button>

                          <AnimatePresence initial={false}>
                            {domOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3 space-y-1">
                                  {domain.standards.map((std, sIdx) => {
                                    const kidMeta = KID_NAMES[std.standard_id];
                                    const name = kidMeta?.name || std.standard_id;
                                    const desc = kidMeta?.desc || "";
                                    const qCount = std.questions?.length || 0;

                                    return (
                                      <motion.div
                                        key={std.standard_id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: sIdx * 0.03 }}
                                      >
                                        <Link
                                          href={`/practice?child=${childId}&standard=${std.standard_id}`}
                                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-50 transition-colors group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-zinc-800 group-hover:text-indigo-700 transition-colors">
                                              {name} <span className="font-normal text-zinc-400">— {desc}</span>
                                            </p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5">{std.standard_id} &middot; {qCount} questions</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                                        </Link>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
