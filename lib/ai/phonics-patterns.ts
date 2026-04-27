/**
 * Curated phonics pattern bank for the decodable book wizard.
 *
 * Each pattern has a key (used as the AI prompt anchor), a kid-facing
 * label, and a set of example words the teacher and AI can both
 * reference. Grouped by typical K-2 instructional sequence.
 *
 * Add patterns by appending to PATTERNS — wizard surfaces them all.
 */

export type PhonicsPattern = {
  key: string;
  label: string;
  examples: string[];
  /** Typical grade level the pattern is taught at. */
  grade: "K" | "1st" | "2nd";
  group: "short_vowels" | "long_vowels" | "blends" | "digraphs" | "r_controlled" | "vowel_teams" | "diphthongs";
};

export const PATTERNS: PhonicsPattern[] = [
  // Short vowels (K → 1st)
  { key: "short_a", label: "Short a (cat, hat)", examples: ["cat", "hat", "map", "bag", "ran"], grade: "K", group: "short_vowels" },
  { key: "short_e", label: "Short e (bed, red)", examples: ["bed", "red", "hen", "leg", "ten"], grade: "K", group: "short_vowels" },
  { key: "short_i", label: "Short i (sit, big)", examples: ["sit", "big", "pin", "lid", "hip"], grade: "K", group: "short_vowels" },
  { key: "short_o", label: "Short o (hot, dog)", examples: ["hot", "dog", "log", "pot", "mom"], grade: "K", group: "short_vowels" },
  { key: "short_u", label: "Short u (bus, cup)", examples: ["bus", "cup", "fun", "run", "mud"], grade: "K", group: "short_vowels" },

  // Magic e / silent e (1st)
  { key: "magic_e_a", label: "Magic e — long a (cake, lake)", examples: ["cake", "lake", "bake", "name", "tape"], grade: "1st", group: "long_vowels" },
  { key: "magic_e_i", label: "Magic e — long i (kite, bike)", examples: ["kite", "bike", "ride", "time", "line"], grade: "1st", group: "long_vowels" },
  { key: "magic_e_o", label: "Magic e — long o (bone, note)", examples: ["bone", "note", "rope", "home", "joke"], grade: "1st", group: "long_vowels" },
  { key: "magic_e_u", label: "Magic e — long u (cute, mule)", examples: ["cute", "mule", "tube", "rude", "tune"], grade: "1st", group: "long_vowels" },

  // Consonant blends (1st-2nd)
  { key: "blend_bl", label: "bl- blend (blue, black)", examples: ["blue", "black", "blast", "bloom"], grade: "1st", group: "blends" },
  { key: "blend_st", label: "st- blend (stop, star)", examples: ["stop", "star", "step", "still"], grade: "1st", group: "blends" },
  { key: "blend_sn", label: "sn- blend (snap, snug)", examples: ["snap", "snug", "snail", "snow"], grade: "1st", group: "blends" },
  { key: "blend_sp", label: "sp- blend (spin, spot)", examples: ["spin", "spot", "spell", "spend"], grade: "1st", group: "blends" },
  { key: "blend_tr", label: "tr- blend (tree, tray)", examples: ["tree", "tray", "trip", "truck"], grade: "1st", group: "blends" },
  { key: "blend_dr", label: "dr- blend (drum, drop)", examples: ["drum", "drop", "draw", "dress"], grade: "1st", group: "blends" },
  { key: "blend_fl", label: "fl- blend (flag, fly)", examples: ["flag", "fly", "flap", "flock"], grade: "1st", group: "blends" },
  { key: "blend_gr", label: "gr- blend (green, grab)", examples: ["green", "grab", "grow", "grand"], grade: "1st", group: "blends" },

  // Digraphs (1st)
  { key: "digraph_sh", label: "sh digraph (ship, fish)", examples: ["ship", "fish", "shop", "wish"], grade: "1st", group: "digraphs" },
  { key: "digraph_ch", label: "ch digraph (chip, chair)", examples: ["chip", "chair", "chase", "much"], grade: "1st", group: "digraphs" },
  { key: "digraph_th", label: "th digraph (this, thin)", examples: ["this", "thin", "thank", "with"], grade: "1st", group: "digraphs" },
  { key: "digraph_wh", label: "wh digraph (when, what)", examples: ["when", "what", "whale", "where"], grade: "1st", group: "digraphs" },

  // R-controlled (2nd)
  { key: "r_controlled_ar", label: "ar (car, star)", examples: ["car", "star", "park", "yard"], grade: "2nd", group: "r_controlled" },
  { key: "r_controlled_or", label: "or (corn, fork)", examples: ["corn", "fork", "horse", "story"], grade: "2nd", group: "r_controlled" },
  { key: "r_controlled_er", label: "er (her, paper)", examples: ["her", "paper", "river", "winter"], grade: "2nd", group: "r_controlled" },
  { key: "r_controlled_ir", label: "ir (bird, girl)", examples: ["bird", "girl", "first", "shirt"], grade: "2nd", group: "r_controlled" },
  { key: "r_controlled_ur", label: "ur (turn, hurt)", examples: ["turn", "hurt", "fur", "burn"], grade: "2nd", group: "r_controlled" },

  // Vowel teams (2nd)
  { key: "vowel_team_ai", label: "ai (rain, paint)", examples: ["rain", "paint", "train", "pail"], grade: "2nd", group: "vowel_teams" },
  { key: "vowel_team_ee", label: "ee (tree, sleep)", examples: ["tree", "sleep", "feet", "green"], grade: "2nd", group: "vowel_teams" },
  { key: "vowel_team_ea", label: "ea (eat, beach)", examples: ["eat", "beach", "team", "leaf"], grade: "2nd", group: "vowel_teams" },
  { key: "vowel_team_oa", label: "oa (boat, road)", examples: ["boat", "road", "soap", "coat"], grade: "2nd", group: "vowel_teams" },

  // Diphthongs (2nd)
  { key: "diphthong_oi", label: "oi (coin, boil)", examples: ["coin", "boil", "join", "soil"], grade: "2nd", group: "diphthongs" },
  { key: "diphthong_ow", label: "ow (cow, down)", examples: ["cow", "down", "town", "brown"], grade: "2nd", group: "diphthongs" },
];

export function getPattern(key: string): PhonicsPattern | undefined {
  return PATTERNS.find((p) => p.key === key);
}
