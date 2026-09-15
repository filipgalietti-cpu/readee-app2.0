import type { AttemptStore, AttemptSnapshot } from "./types";
/** Preview-only adapter. Contains no child identity, transcript or audio.
 * Never use browser evidence as authoritative production mastery or currency.
 */
export const localAttemptStore: AttemptStore = {
  load(id) {
    const raw = localStorage.getItem(`readee:preview:${id}`);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw) as AttemptSnapshot;
      if (
        s.version !== 1 ||
        s.flowId !== id ||
        !s.evidence ||
        typeof s.sessionId !== "string" ||
        !Number.isInteger(s.phase) ||
        !Number.isInteger(s.scene)
      )
        return null;
      return s;
    } catch {
      return null;
    }
  },
  save(snapshot) {
    localStorage.setItem(`readee:preview:${snapshot.flowId}`, JSON.stringify(snapshot));
  },
};
