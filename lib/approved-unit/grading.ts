import type { SceneDef } from "@/lib/lesson-engine/types";
import { highlightTargetIndices } from "@/lib/lesson-engine/delivery/highlight";
/** Grade submitted choices against authored content. Never consume client correctness or currency. */
export function gradeSubmission(
  scene: SceneDef,
  item: string,
  raw: unknown,
  receipt: (value: unknown, rubric: string) => boolean | null,
): boolean | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>,
    i = scene.interaction;
  if (!i) return null;
  if (i.type === "choose" && i.collectAll)
    return Array.isArray(a.choices) && a.choices.every((x) => i.options.some((o) => o.id === x))
      ? a.choices.length === i.collectAll.ids.length &&
          i.collectAll.ids.every((x) => (a.choices as unknown[]).includes(x))
      : null;
  if (i.type === "choose")
    return typeof a.choice === "string" && i.options.some((o) => o.id === a.choice)
      ? (i.acceptedIds ?? [i.correctId]).includes(a.choice)
      : null;
  if (i.type === "sequence")
    return Array.isArray(a.order) &&
      a.order.length === i.order.length &&
      new Set(a.order).size === a.order.length &&
      a.order.every((x) => typeof x === "string" && i.items.some((t) => t.id === x))
      ? a.order.every((x, n) => x === i.order[n])
      : null;
  if (i.type === "sort")
    return /^\d+$/.test(item) &&
      i.items[Number(item)] &&
      typeof a.bucket === "string" &&
      i.buckets.includes(a.bucket)
      ? i.items[Number(item)].bucket === a.bucket
      : null;
  if (i.type === "match") {
    if (!a.pairs || typeof a.pairs !== "object") return null;
    const pairs = a.pairs as Record<string, unknown>;
    if (
      Object.keys(pairs).length !== i.pairs.length ||
      new Set(Object.values(pairs)).size !== i.pairs.length ||
      !i.pairs.every(
        (p) => Object.hasOwn(pairs, p.left) && i.pairs.some((q) => q.right === pairs[p.left]),
      )
    )
      return null;
    return i.pairs.every((p) => pairs[p.left] === p.right);
  }
  if (i.type === "highlight") {
    if (
      !Array.isArray(a.indices) ||
      !a.indices.length ||
      a.indices.some((n) => !Number.isInteger(n) || n < 0 || n > 500) ||
      new Set(a.indices).size !== a.indices.length
    )
      return null;
    const target = highlightTargetIndices(i);
    return (
      a.indices.length === target.length &&
      target.every((n) => (a.indices as unknown[]).includes(n))
    );
  }
  if (i.type === "speak" && i.rubricId) return receipt(a.receipt, i.rubricId);
  return null;
}
