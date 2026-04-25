/**
 * Minimal cn() helper.
 *
 * shadcn / Magic UI components expect a `cn(...)` utility for
 * conditional class composition. We don't pull in clsx + tailwind-merge
 * because (a) we don't need the merge logic — none of our components
 * stack conflicting Tailwind utilities, and (b) every dep we don't add
 * is a dep we don't have to maintain.
 *
 * Drop-in replacement signature: takes any number of class arguments
 * (strings, undefined, false, arrays) and joins the truthy ones with
 * a space.
 */

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const stack: ClassValue[] = [...inputs];
  while (stack.length) {
    const v = stack.shift();
    if (!v && v !== 0) continue;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
      continue;
    }
    if (Array.isArray(v)) {
      stack.unshift(...v);
    }
  }
  return out.join(" ");
}
