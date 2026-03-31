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

const KID_NAMES: Record<string, string> = {
  "RL.K.1": "Key Details", "RL.K.2": "Retelling", "RL.K.3": "Story People",
  "RL.K.4": "New Words", "RL.K.5": "Book Types", "RL.K.6": "Authors",
  "RL.K.7": "Story Art", "RL.K.9": "Compare Stories",
  "RI.K.1": "Info Details", "RI.K.2": "Main Topic", "RI.K.3": "Linking Ideas",
  "RI.K.4": "Info Words", "RI.K.5": "Book Parts", "RI.K.6": "Who Wrote?",
  "RI.K.7": "Art & Text", "RI.K.8": "Author's Why", "RI.K.9": "Compare Texts",
  "RF.K.1a": "Word Tracking", "RF.K.1b": "Print Concepts", "RF.K.1c": "Word Spaces",
  "RF.K.1d": "ABCs", "RF.K.2a": "Rhyming", "RF.K.2b": "Syllables",
  "RF.K.2c": "Blending", "RF.K.2d": "Sound Out", "RF.K.2e": "New Sounds",
  "RF.K.3a": "Letter Sounds", "RF.K.3b": "Vowel Sounds", "RF.K.3c": "Sight Words",
  "RF.K.3d": "Spelling Clues", "RF.K.4": "Reading Time",
  "K.L.1": "Grammar", "K.L.2": "Punctuation", "K.L.4": "Word Meaning",
  "K.L.5": "Word Play", "K.L.6": "Vocabulary",
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

  const gradeKey = levelNameToGradeKey(child.reading_level);
  const gradeData = GRADE_DATA[gradeKey];
  const standards: Standard[] = gradeData?.standards || gradeData || [];

  // Group by domain
  const domainMap = new Map<string, Standard[]>();
  const domainOrder: string[] = [];
  for (const s of standards) {
    if (!domainMap.has(s.domain)) { domainMap.set(s.domain, []); domainOrder.push(s.domain); }
    domainMap.get(s.domain)!.push(s);
  }

  const totalQs = standards.reduce((sum, s) => sum + (s.questions?.length || 0), 0);

  const handleRandom = () => {
    const s = standards[Math.floor(Math.random() * standards.length)];
    if (s) router.push(`/practice?child=${childId}&standard=${s.standard_id}`);
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
          {standards.length} topics &middot; {totalQs} questions
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

      {/* Domain accordions */}
      {domainOrder.map((domain, gIdx) => {
        const stds = domainMap.get(domain)!;
        const meta = DOMAIN_META[domain] || { Icon: BookOpen, color: "text-zinc-600", bg: "bg-zinc-50" };
        const DIcon = meta.Icon;
        const isOpen = openDomains.has(domain);
        const domainQs = stds.reduce((sum, s) => sum + (s.questions?.length || 0), 0);

        return (
          <motion.div
            key={domain}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + gIdx * 0.04 }}
            className="rounded-2xl bg-white shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleDomain(domain)}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                <DIcon className={`w-4 h-4 ${meta.color}`} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900">{domain}</p>
                <p className="text-[11px] text-zinc-400">{stds.length} topics &middot; {domainQs} questions</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-1">
                    {stds.map((std, sIdx) => {
                      const name = KID_NAMES[std.standard_id] || std.standard_id;
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
                                {name}
                              </p>
                              <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{std.standard_description}</p>
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
          </motion.div>
        );
      })}
    </div>
  );
}
