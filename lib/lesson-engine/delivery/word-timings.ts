import type { WordTiming } from "../types";
export type NarrationTimings = Record<
  string,
  { src: string; audioSha256: string; words: WordTiming[] }
>;
