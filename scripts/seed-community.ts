/**
 * One-shot community seeder.
 *
 * Generates a batch of high-quality passages via the existing
 * factory pipeline (passage + image + audio + 3 MCQs + AI QC) and
 * inserts directly into community_passages with status='approved',
 * display_byline='Featured by Readee'.
 *
 *   npx tsx scripts/seed-community.ts --dry-run
 *   npx tsx scripts/seed-community.ts --grade=2nd --count=5
 *   npx tsx scripts/seed-community.ts                 (all grades, 6 each)
 *
 * Cost: ~$0.10 per passage (passage + image + audio + 3 MCQs + judges).
 * Default 30 passages = ~$3.
 *
 * Why "Featured by Readee" not faux parent bylines:
 *   School-audit-safe + honest about authorship. We can swap to real
 *   parent bylines as actual community submissions land.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import {
  generatePassage,
  generateMCQQuestions,
  generateImageBrief,
  generateImage,
  generateSpeech,
} from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + QC_BOT_TEACHER_ID",
  );
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const gradeArg = process.argv.find((a) => a.startsWith("--grade="));
const countArg = process.argv.find((a) => a.startsWith("--count="));
const COUNT_PER_GRADE = countArg ? Number(countArg.split("=")[1]) : 6;
const GRADE_FILTER = gradeArg ? gradeArg.split("=")[1] : null;

/** Curated kid-friendly topics per grade. Mix of fiction + non-fiction
 *  so the seeded library doesn't feel monotone. */
const TOPICS: Record<string, string[]> = {
  K: [
    "A puppy who learns to share his favorite toy",
    "Why we have day and night, kid-friendly",
    "A trip to the apple orchard with grandpa",
    "How butterflies start as caterpillars",
    "A mouse who is afraid of the dark",
    "What different animals eat for dinner",
    "A snowflake's journey from cloud to ground",
    "A friendly dragon who learns to roar quietly",
  ],
  "1st": [
    "How honeybees make honey",
    "A short adventure about a brave puppy named Biscuit",
    "Why leaves change color in the fall",
    "A little owl who can't fall asleep",
    "How seeds grow into giant trees",
    "Two best friends watching the stars come out",
    "A sleepy bear getting ready for winter",
    "What makes a rainbow appear after the rain",
  ],
  "2nd": [
    "How baby sea turtles find the ocean",
    "A team of kid astronauts exploring a new planet",
    "Why the moon changes shape every night",
    "A talking robot that wants to learn how to dance",
    "How earthquakes happen, explained simply",
    "A bunny tucking in the whole forest one by one",
    "The water cycle, kid-friendly",
    "How spiders weave their webs",
  ],
  "3rd": [
    "Why volcanoes erupt, kid-friendly",
    "How the postal service delivers mail across the country",
    "A short biography of Jane Goodall",
    "How airplanes stay up in the sky",
    "The difference between weather and climate",
    "How sound travels through the air",
    "A short biography of Ruth Bader Ginsburg",
    "How recycling actually works",
  ],
  "4th": [
    "How vaccines protect us from diseases",
    "The water cycle, with vocabulary like evaporation and precipitation",
    "A short biography of Marie Curie",
    "How tides work, with the moon's gravity",
    "The food chain in a forest ecosystem",
    "A short biography of Jackie Robinson",
    "How GPS satellites help us find our way",
    "Why some animals migrate every year",
  ],
};

const GRADES_TO_RUN = GRADE_FILTER
  ? [GRADE_FILTER]
  : ["K", "1st", "2nd", "3rd", "4th"];

function buildSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const salt = Math.random().toString(36).slice(2, 8);
  return `${base || "passage"}-${salt}`;
}

function staggeredCreatedAt(idx: number, total: number): string {
  // Spread across the past 30 days, newest first. Adds an hour-level
  // jitter so they don't all share a timestamp.
  const daysBack = Math.floor((idx / Math.max(1, total - 1)) * 30);
  const jitterMin = Math.floor(Math.random() * 60 * 24);
  const ms = Date.now() - (daysBack * 24 * 60 + jitterMin) * 60 * 1000;
  return new Date(ms).toISOString();
}

function organicViewCount(daysOld: number): number {
  // Older content gets a higher floor — gives a feeling of accumulation.
  const base = Math.max(1, Math.floor(daysOld * 1.5));
  const jitter = Math.floor(Math.random() * 25);
  return base + jitter;
}

async function buildOne(
  topic: string,
  grade: string,
  idx: number,
  total: number,
): Promise<{ ok: boolean; reason?: string }> {
  console.log(`  [${grade} #${idx + 1}/${total}] "${topic.slice(0, 60)}…"`);

  if (DRY) {
    return { ok: true };
  }

  // 1. Passage
  const passageRes = await generatePassage({
    teacherId: SYSTEM_TEACHER_ID!,
    topic,
    gradeLevel: grade,
    phonicsPattern: null,
    lengthLevel: "medium",
  });
  if (!passageRes.ok) {
    console.log(`    ! passage failed: ${passageRes.error}`);
    return { ok: false, reason: passageRes.error };
  }
  const title = passageRes.passage.title;
  const body = passageRes.passage.passage;

  // 2. Image
  let imageUrl: string | null = null;
  try {
    const briefRes = await generateImageBrief({
      teacherId: SYSTEM_TEACHER_ID!,
      passageTitle: title,
      passageBody: body,
    });
    if (briefRes.ok) {
      const imgRes = await generateImage({
        teacherId: SYSTEM_TEACHER_ID!,
        prompt: briefRes.brief,
      });
      if (imgRes.ok) imageUrl = imgRes.imageUrl;
    }
  } catch (e: any) {
    console.log(`    ! image failed: ${e?.message ?? "unknown"}`);
  }

  // 3. Audio
  let audioUrl: string | null = null;
  try {
    const ttsRes = await generateSpeech({
      teacherId: SYSTEM_TEACHER_ID!,
      text: body,
    });
    if (ttsRes.ok) audioUrl = ttsRes.audioUrl;
  } catch (e: any) {
    console.log(`    ! audio failed: ${e?.message ?? "unknown"}`);
  }

  // 4. 3 MCQs
  let questions: any[] = [];
  try {
    const qRes = await generateMCQQuestions({
      teacherId: SYSTEM_TEACHER_ID!,
      topic: `${topic}\n\nThe passage students read:\n"""\n${body}\n"""\n\nWrite questions strictly about the passage.`,
      gradeLevel: grade,
      count: 3,
    });
    if (qRes.ok) {
      questions = qRes.questions.map((q) => ({
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint,
      }));
    }
  } catch (e: any) {
    console.log(`    ! questions failed: ${e?.message ?? "unknown"}`);
  }

  // 5. Insert
  const slug = buildSlug(title);
  const createdAt = staggeredCreatedAt(idx, total);
  const daysOld = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000),
  );

  const { data: inserted, error: insErr } = await sb
    .from("community_passages")
    .insert({
      source_content_id: null, // factory-seeded, no parent source row
      source_parent_id: SYSTEM_TEACHER_ID,
      title,
      passage_text: body,
      questions,
      image_url: imageUrl,
      audio_url: audioUrl,
      grade_level: grade,
      topic,
      phonics_pattern: null,
      status: "approved",
      auto_approved: true,
      reviewed_at: createdAt,
      slug,
      display_byline: "Featured by Readee",
      view_count: organicViewCount(daysOld),
      created_at: createdAt,
    } as any)
    .select("id, slug")
    .single();
  if (insErr || !inserted) {
    console.log(`    ! insert failed: ${insErr?.message ?? "no row"}`);
    return { ok: false, reason: insErr?.message };
  }

  // Audit-trail.
  await sb.from("content_qc_log").insert({
    target_kind: "community_passage",
    target_id: (inserted as any).id,
    change_type: "factory_seed",
    before: null,
    after: { slug, title, grade },
    reason: "Seeded by scripts/seed-community.ts to bootstrap the community library.",
    finding_id: null,
    agent: "seed-community",
  });

  console.log(`    ✓ /community/${(inserted as any).slug}`);
  return { ok: true };
}

async function main() {
  console.log(
    `Seed community ${DRY ? "(DRY RUN)" : ""} grades=${GRADES_TO_RUN.join(",")} count/grade=${COUNT_PER_GRADE}`,
  );

  let totalOk = 0;
  let totalFail = 0;
  for (const grade of GRADES_TO_RUN) {
    const topics = (TOPICS[grade] ?? []).slice(0, COUNT_PER_GRADE);
    if (topics.length === 0) {
      console.log(`  [${grade}] no topics defined; skipping`);
      continue;
    }
    console.log(`\n[${grade}] ${topics.length} topics`);
    for (let i = 0; i < topics.length; i++) {
      const r = await buildOne(topics[i], grade, i, topics.length);
      if (r.ok) totalOk++;
      else totalFail++;
      // breather — Gemini hates rapid concurrent calls
      await new Promise((res) => setTimeout(res, 1500));
    }
  }

  console.log(`\nDone — seeded ${totalOk}, failed ${totalFail}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
