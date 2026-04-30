/**
 * Resolve an intervention-plan session to an assignable Readee target.
 *
 * The plan generator emits structured fields per session: material_kind,
 * standard_id, grade. The resolver maps those to a real lesson the teacher
 * can push to the kid via the assignments table.
 *
 * v1 strategy:
 * - "lesson" kind with a known standard_id → readee_lesson assignment
 *   (kid plays /practice for that standard). Uses the kid-friendly title
 *   from sample-lessons.json when available, falls back to the formal
 *   CCSS description.
 * - "passage" kind → tries to match a teacher-owned differentiated_passage
 *   at the right grade. If none, downgrades to a readee_lesson on the
 *   nearest fluency standard.
 * - "fluency_probe" / "teacher_led" → not assignable; teacher runs in person.
 */

import sampleLessons from "@/app/data/sample-lessons.json";
import { getAllStandards } from "@/lib/data/standards";
import { createClient } from "@/lib/supabase/server";
import type {
  InterventionSession,
  MaterialKind,
} from "@/lib/ai/build-intervention-plan";

export type ResolvedMaterial =
  | {
      assignable: true;
      assignmentKind: "readee_lesson";
      sourceId: string; // standard_id for readee_lesson
      title: string;
      standardId: string;
      grade: string | null;
      confidence: "exact" | "approx";
      sourcePassageId?: string;
      sourceLevel?: "easy" | "on_level" | "advanced";
      reason?: string;
    }
  | {
      assignable: false;
      reason: string;
      kind: MaterialKind;
    };

type LessonMeta = { standardId: string; title: string; grade?: string };

let cachedLessonsByStandard: Map<string, LessonMeta> | null = null;
function lessonByStandard(): Map<string, LessonMeta> {
  if (cachedLessonsByStandard) return cachedLessonsByStandard;
  const map = new Map<string, LessonMeta>();
  for (const l of sampleLessons as any[]) {
    if (l?.standardId && l?.title) {
      map.set(String(l.standardId).toUpperCase(), {
        standardId: l.standardId,
        title: l.title,
        grade: l.grade,
      });
    }
  }
  cachedLessonsByStandard = map;
  return map;
}

let cachedStandards: Map<string, { id: string; description: string; grade: string }> | null = null;
function standardsById(): Map<string, { id: string; description: string; grade: string }> {
  if (cachedStandards) return cachedStandards;
  const map = new Map<string, { id: string; description: string; grade: string }>();
  for (const s of getAllStandards()) {
    map.set(s.standard_id.toUpperCase(), {
      id: s.standard_id,
      description: s.standard_description,
      grade: s.grade,
    });
  }
  cachedStandards = map;
  return map;
}

const STANDARD_REGEX = /\b((?:RL|RI|RF|L|SL|W)\.[K0-9]+\.\d+[a-z]?)\b/i;

/** Extract a CCSS standard from a free-text material hint. */
export function extractStandardId(text: string): string | null {
  const m = text.match(STANDARD_REGEX);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Resolve one session. May query Supabase when the kind is "passage".
 * Pass `teacherId` so we only match the teacher's own differentiated
 * passages.
 */
export async function resolveSessionMaterial(input: {
  session: InterventionSession;
  teacherId: string;
}): Promise<ResolvedMaterial> {
  const { session, teacherId } = input;
  const fallbackStandardId =
    session.standardId?.toUpperCase() || extractStandardId(session.materialHint);

  if (session.materialKind === "fluency_probe") {
    return {
      assignable: false,
      kind: "fluency_probe",
      reason: "Cold-read or repeated read with a timer — teacher-led.",
    };
  }
  if (session.materialKind === "teacher_led") {
    return {
      assignable: false,
      kind: "teacher_led",
      reason: "Small-group / 1:1 instruction — teacher-led.",
    };
  }

  if (session.materialKind === "lesson") {
    if (!fallbackStandardId) {
      return {
        assignable: false,
        kind: "lesson",
        reason: "AI didn't tag a CCSS standard. Add one manually or skip.",
      };
    }
    const lessonMap = lessonByStandard();
    const lesson = lessonMap.get(fallbackStandardId);
    if (lesson) {
      return {
        assignable: true,
        assignmentKind: "readee_lesson",
        sourceId: lesson.standardId,
        title: lesson.title,
        standardId: lesson.standardId,
        grade: session.grade ?? null,
        confidence: "exact",
      };
    }
    // No kid-friendly lesson title, but the standard still exists in the
    // question bank — kid can still practice it via the standards page.
    const stdMap = standardsById();
    const std = stdMap.get(fallbackStandardId);
    if (std) {
      return {
        assignable: true,
        assignmentKind: "readee_lesson",
        sourceId: std.id,
        title: std.description,
        standardId: std.id,
        grade: session.grade ?? null,
        confidence: "approx",
        reason: "No dedicated lesson; kid will get standards practice instead.",
      };
    }
    return {
      assignable: false,
      kind: "lesson",
      reason: `Standard ${fallbackStandardId} not found in catalog.`,
    };
  }

  if (session.materialKind === "passage") {
    // Prefer a teacher-owned differentiated passage at the requested grade.
    const supabase = await createClient();
    const gradeFilter = session.grade ?? null;
    let q = supabase
      .from("differentiated_passages")
      .select("id, title, base_grade, versions")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (gradeFilter) q = q.eq("base_grade", gradeFilter);
    const { data: passages } = await q;
    const passage = ((passages ?? []) as any[]).find(
      (p) => Array.isArray(p.versions) && p.versions.some((v: any) => v.level === "on_level"),
    );
    if (passage) {
      return {
        assignable: true,
        assignmentKind: "readee_lesson",
        sourceId: fallbackStandardId ?? "RF.1.4",
        title: passage.title,
        standardId: fallbackStandardId ?? "RF.1.4",
        grade: passage.base_grade ?? session.grade ?? null,
        confidence: "approx",
        sourcePassageId: passage.id,
        sourceLevel: "on_level",
        reason: "Matched one of your leveled passages at on-level.",
      };
    }
    // Fall back to the standard if the AI gave us one.
    if (fallbackStandardId) {
      const lesson = lessonByStandard().get(fallbackStandardId);
      if (lesson) {
        return {
          assignable: true,
          assignmentKind: "readee_lesson",
          sourceId: lesson.standardId,
          title: lesson.title,
          standardId: lesson.standardId,
          grade: session.grade ?? null,
          confidence: "approx",
          reason:
            "No matching leveled passage; falling back to standards practice for this skill.",
        };
      }
    }
    return {
      assignable: false,
      kind: "passage",
      reason:
        "No matching leveled passage in your library. Generate one in /classroom/leveled, then re-push.",
    };
  }

  return {
    assignable: false,
    kind: session.materialKind,
    reason: "Unknown material kind.",
  };
}

export async function resolvePlanMaterials(input: {
  sessions: InterventionSession[];
  teacherId: string;
}): Promise<ResolvedMaterial[]> {
  const out: ResolvedMaterial[] = [];
  for (const s of input.sessions) {
    out.push(await resolveSessionMaterial({ session: s, teacherId: input.teacherId }));
  }
  return out;
}
