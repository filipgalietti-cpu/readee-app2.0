export interface WordEntry {
  word: string;
  tags: string[];
  audio: string;
}

function w(word: string, tags: string[]): WordEntry {
  return { word, tags, audio: `/audio/words/${word}.mp3` };
}

export const wordBank: WordEntry[] = [
  // ── Animals ──
  w("ant",       ["animal", "small", "land", "living", "cvc", "noun", "short-a", "rhyme:-ant", "starts:a"]),
  w("bat",       ["animal", "small", "fly", "wild", "living", "cvc", "noun", "short-a", "rhyme:-at", "starts:b"]),
  w("bear",      ["animal", "big", "land", "wild", "living", "noun", "starts:b"]),
  w("bee",       ["animal", "small", "fly", "wild", "living", "noun", "starts:b"]),
  w("bird",      ["animal", "small", "fly", "wild", "living", "noun", "starts:b"]),
  w("bug",       ["animal", "small", "land", "wild", "living", "cvc", "noun", "short-u", "rhyme:-ug", "starts:b"]),
  w("cat",       ["animal", "pet", "small", "land", "living", "cvc", "noun", "short-a", "rhyme:-at", "starts:c"]),
  w("cob",       ["food", "thing", "nonliving", "cvc", "noun", "short-o", "rhyme:-ob", "starts:c"]),
  w("cow",       ["animal", "big", "land", "farm", "living", "noun", "starts:c"]),
  w("crab",      ["animal", "small", "water", "wild", "living", "noun", "starts:c"]),
  w("dog",       ["animal", "pet", "land", "living", "cvc", "noun", "short-o", "rhyme:-og", "starts:d"]),
  w("duck",      ["animal", "small", "water", "farm", "living", "noun", "short-u", "starts:d"]),
  w("elephant",  ["animal", "big", "land", "wild", "living", "noun", "starts:e"]),
  w("fin",       ["body", "thing", "nonliving", "cvc", "noun", "short-i", "rhyme:-in", "starts:f"]),
  w("fish",      ["animal", "small", "water", "pet", "living", "noun", "starts:f"]),
  w("fox",       ["animal", "small", "land", "wild", "living", "cvc", "noun", "short-o", "starts:f"]),
  w("frog",      ["animal", "small", "water", "land", "wild", "living", "noun", "short-o", "rhyme:-og", "starts:f"]),
  w("goat",      ["animal", "land", "farm", "living", "noun", "starts:g"]),
  w("hen",       ["animal", "small", "land", "farm", "living", "cvc", "noun", "short-e", "rhyme:-en", "starts:h"]),
  w("ladybug",   ["animal", "small", "fly", "wild", "living", "noun", "starts:l"]),
  w("lamb",      ["animal", "small", "land", "farm", "living", "noun", "starts:l"]),
  w("owl",       ["animal", "fly", "wild", "night", "living", "noun", "starts:o"]),
  w("pig",       ["animal", "land", "farm", "living", "cvc", "noun", "short-i", "rhyme:-ig", "starts:p"]),
  w("rat",       ["animal", "small", "land", "wild", "living", "cvc", "noun", "short-a", "rhyme:-at", "starts:r"]),
  w("seal",      ["animal", "water", "wild", "living", "noun", "starts:s"]),
  w("whale",     ["animal", "big", "water", "wild", "living", "noun", "starts:w"]),
  w("worm",      ["animal", "small", "land", "wild", "living", "noun", "starts:w"]),

  // ── Food ──
  w("apple",     ["food", "nature", "round", "living", "noun", "starts:a"]),
  w("banana",    ["food", "nature", "living", "noun", "starts:b"]),
  w("broccoli",  ["food", "nature", "living", "noun", "starts:b"]),
  w("cake",      ["food", "thing", "nonliving", "noun", "starts:c"]),
  w("carrot",    ["food", "nature", "living", "noun", "starts:c"]),
  w("grape",     ["food", "nature", "round", "living", "noun", "starts:g"]),
  w("gum",       ["food", "thing", "nonliving", "cvc", "noun", "short-u", "rhyme:-um", "starts:g"]),
  w("jam",       ["food", "thing", "nonliving", "cvc", "noun", "short-a", "rhyme:-am", "starts:j"]),
  w("pea",       ["food", "nature", "round", "small", "living", "noun", "starts:p"]),

  // ── Things / Objects ──
  w("ball",      ["thing", "round", "nonliving", "noun", "starts:b"]),
  w("bed",       ["thing", "nonliving", "inside", "noun", "cvc", "short-e", "rhyme:-ed", "starts:b"]),
  w("bell",      ["thing", "noisy", "nonliving", "noun", "starts:b"]),
  w("boat",      ["thing", "vehicle", "water", "nonliving", "noun", "starts:b"]),
  w("book",      ["thing", "quiet", "nonliving", "inside", "noun", "starts:b"]),
  w("bus",       ["thing", "vehicle", "land", "noisy", "nonliving", "noun", "cvc", "short-u", "rhyme:-us", "starts:b"]),
  w("cup",       ["thing", "nonliving", "inside", "noun", "cvc", "short-u", "rhyme:-up", "starts:c"]),
  w("door",      ["thing", "nonliving", "inside", "noun", "starts:d"]),
  w("drum",      ["thing", "noisy", "nonliving", "noun", "short-u", "rhyme:-um", "starts:d"]),
  w("fan",       ["thing", "nonliving", "inside", "noun", "cvc", "short-a", "rhyme:-an", "starts:f"]),
  w("hand",      ["body", "living", "noun", "starts:h"]),
  w("hat",       ["thing", "clothing", "nonliving", "noun", "cvc", "short-a", "rhyme:-at", "starts:h"]),
  w("jug",       ["thing", "nonliving", "inside", "noun", "cvc", "short-u", "rhyme:-ug", "starts:j"]),
  w("kit",       ["thing", "nonliving", "noun", "cvc", "short-i", "rhyme:-it", "starts:k"]),
  w("log",       ["thing", "nature", "nonliving", "outside", "noun", "cvc", "short-o", "rhyme:-og", "starts:l"]),
  w("map",       ["thing", "nonliving", "noun", "cvc", "short-a", "rhyme:-ap", "starts:m"]),
  w("mat",       ["thing", "nonliving", "inside", "noun", "cvc", "short-a", "rhyme:-at", "starts:m"]),
  w("moon",      ["nature", "thing", "night", "nonliving", "noun", "round", "starts:m"]),
  w("mop",       ["thing", "nonliving", "inside", "noun", "cvc", "short-o", "rhyme:-op", "starts:m"]),
  w("mud",       ["nature", "thing", "outside", "nonliving", "noun", "cvc", "short-u", "rhyme:-ud", "starts:m"]),
  w("nap",       ["thing", "noun", "cvc", "short-a", "rhyme:-ap", "starts:n"]),
  w("net",       ["thing", "nonliving", "noun", "cvc", "short-e", "rhyme:-et", "starts:n"]),
  w("pen",       ["thing", "nonliving", "inside", "noun", "cvc", "short-e", "rhyme:-en", "starts:p"]),
  w("pin",       ["thing", "nonliving", "noun", "cvc", "short-i", "rhyme:-in", "starts:p"]),
  w("pot",       ["thing", "nonliving", "inside", "noun", "cvc", "short-o", "rhyme:-ot", "starts:p"]),
  w("rain",      ["nature", "thing", "outside", "nonliving", "noun", "starts:r"]),
  w("ring",      ["thing", "nonliving", "noun", "short-i", "starts:r"]),
  w("rock",      ["nature", "thing", "outside", "quiet", "nonliving", "noun", "short-o", "starts:r"]),
  w("rug",       ["thing", "nonliving", "inside", "noun", "cvc", "short-u", "rhyme:-ug", "starts:r"]),
  w("seed",      ["nature", "thing", "small", "nonliving", "noun", "starts:s"]),
  w("sock",      ["thing", "clothing", "quiet", "nonliving", "noun", "short-o", "starts:s"]),
  w("star",      ["nature", "thing", "night", "nonliving", "noun", "starts:s"]),
  w("sun",       ["nature", "thing", "day", "nonliving", "noun", "cvc", "short-u", "rhyme:-un", "starts:s"]),
  w("tag",       ["thing", "nonliving", "noun", "cvc", "short-a", "rhyme:-ag", "starts:t"]),
  w("tree",      ["nature", "thing", "outside", "big", "living", "noun", "starts:t"]),
  w("van",       ["thing", "vehicle", "land", "nonliving", "noun", "cvc", "short-a", "rhyme:-an", "starts:v"]),
  w("wig",       ["thing", "clothing", "nonliving", "noun", "cvc", "short-i", "rhyme:-ig", "starts:w"]),
  w("zip",       ["thing", "nonliving", "noun", "cvc", "short-i", "rhyme:-ip", "starts:z"]),

  // ── Colors ──
  w("blue",      ["adjective", "starts:b"]),
  w("green",     ["adjective", "starts:g"]),
  w("red",       ["adjective", "cvc", "short-e", "rhyme:-ed", "starts:r"]),

  // ── Action / Verbs ──
  w("come",      ["verb", "sight", "starts:c"]),
  w("dig",       ["verb", "cvc", "short-i", "rhyme:-ig", "starts:d"]),
  w("go",        ["verb", "sight", "starts:g"]),
  w("have",      ["verb", "sight", "starts:h"]),
  w("hop",       ["verb", "cvc", "short-o", "rhyme:-op", "starts:h"]),
  w("hug",       ["verb", "cvc", "short-u", "rhyme:-ug", "starts:h"]),
  w("like",      ["verb", "sight", "starts:l"]),
  w("look",      ["verb", "sight", "starts:l"]),
  w("nap",       ["verb", "cvc", "short-a", "rhyme:-ap", "starts:n"]),
  w("play",      ["verb", "starts:p"]),
  w("ran",       ["verb", "cvc", "short-a", "rhyme:-an", "starts:r"]),
  w("read",      ["verb", "starts:r"]),
  w("run",       ["verb", "cvc", "short-u", "rhyme:-un", "starts:r"]),
  w("said",      ["verb", "sight", "starts:s"]),
  w("sat",       ["verb", "cvc", "short-a", "rhyme:-at", "starts:s"]),
  w("see",       ["verb", "sight", "starts:s"]),
  w("sit",       ["verb", "cvc", "short-i", "rhyme:-it", "starts:s"]),

  // ── Adjectives / Descriptors ──
  w("big",       ["adjective", "cvc", "short-i", "rhyme:-ig", "starts:b"]),
  w("fast",      ["adjective", "starts:f"]),
  w("wet",       ["adjective", "cvc", "short-e", "rhyme:-et", "starts:w"]),

  // ── Sight words / Function words ──
  w("and",       ["sight", "starts:a"]),
  w("are",       ["sight", "verb", "starts:a"]),
  w("can",       ["sight", "verb", "cvc", "short-a", "rhyme:-an", "starts:c"]),
  w("he",        ["sight", "noun", "starts:h"]),
  w("here",      ["sight", "starts:h"]),
  w("i",         ["sight", "noun", "starts:i"]),
  w("in",        ["sight", "cvc", "short-i", "rhyme:-in", "starts:i"]),
  w("is",        ["sight", "verb", "starts:i"]),
  w("it",        ["sight", "cvc", "short-i", "rhyme:-it", "starts:i"]),
  w("my",        ["sight", "starts:m"]),
  w("no",        ["sight", "starts:n"]),
  w("on",        ["sight", "cvc", "short-o", "starts:o"]),
  w("one",       ["sight", "noun", "starts:o"]),
  w("she",       ["sight", "noun", "starts:s"]),
  w("the",       ["sight", "starts:t"]),
  w("to",        ["sight", "starts:t"]),
  w("two",       ["sight", "noun", "starts:t"]),
  w("up",        ["sight", "cvc", "short-u", "rhyme:-up", "starts:u"]),
  w("we",        ["sight", "noun", "starts:w"]),
  w("yes",       ["sight", "starts:y"]),
  w("you",       ["sight", "starts:y"]),

  // ── Nature (non-animal, non-food) ──
  w("mountain",  ["nature", "thing", "big", "outside", "nonliving", "noun", "starts:m"]),

  // ═══════════════════════════════════════════════════════════
  // Batch 2 — 101 new words
  // ═══════════════════════════════════════════════════════════

  // ── Animals (batch 2) ──
  w("cub",       ["animal", "small", "land", "wild", "living", "cvc", "noun", "short-u", "rhyme:-ub", "starts:c"]),
  w("deer",      ["animal", "land", "wild", "living", "noun", "starts:d"]),
  w("hog",       ["animal", "big", "land", "farm", "living", "cvc", "noun", "short-o", "rhyme:-og", "starts:h"]),
  w("horse",     ["animal", "big", "land", "farm", "living", "noun", "starts:h"]),
  w("lion",      ["animal", "big", "land", "wild", "living", "noun", "starts:l"]),
  w("mouse",     ["animal", "small", "land", "wild", "living", "noun", "starts:m"]),
  w("pug",       ["animal", "small", "land", "pet", "living", "cvc", "noun", "short-u", "rhyme:-ug", "starts:p"]),
  w("pup",       ["animal", "small", "land", "pet", "living", "cvc", "noun", "short-u", "rhyme:-up", "starts:p"]),
  w("sheep",     ["animal", "land", "farm", "living", "noun", "starts:s"]),
  w("snake",     ["animal", "land", "wild", "living", "noun", "starts:s"]),

  // ── Food (batch 2) ──
  w("bun",       ["food", "thing", "nonliving", "cvc", "noun", "short-u", "rhyme:-un", "starts:b"]),
  w("fig",       ["food", "nature", "small", "living", "cvc", "noun", "short-i", "rhyme:-ig", "starts:f"]),
  w("ham",       ["food", "thing", "nonliving", "cvc", "noun", "short-a", "rhyme:-am", "starts:h"]),
  w("nut",       ["food", "nature", "small", "nonliving", "cvc", "noun", "short-u", "rhyme:-ut", "starts:n"]),
  w("yam",       ["food", "nature", "living", "cvc", "noun", "short-a", "rhyme:-am", "starts:y"]),

  // ── Things / Objects (batch 2) ──
  w("bag",       ["thing", "nonliving", "noun", "cvc", "short-a", "rhyme:-ag", "starts:b"]),
  w("bin",       ["thing", "nonliving", "inside", "noun", "cvc", "short-i", "rhyme:-in", "starts:b"]),
  w("cab",       ["thing", "vehicle", "land", "nonliving", "noun", "cvc", "short-a", "rhyme:-ab", "starts:c"]),
  w("cap",       ["thing", "clothing", "nonliving", "noun", "cvc", "short-a", "rhyme:-ap", "starts:c"]),
  w("cot",       ["thing", "nonliving", "inside", "noun", "cvc", "short-o", "rhyme:-ot", "starts:c"]),
  w("den",       ["thing", "nonliving", "inside", "noun", "cvc", "short-e", "rhyme:-en", "starts:d"]),
  w("dot",       ["thing", "nonliving", "noun", "cvc", "short-o", "rhyme:-ot", "starts:d"]),
  w("gap",       ["thing", "nonliving", "noun", "cvc", "short-a", "rhyme:-ap", "starts:g"]),
  w("hut",       ["thing", "nonliving", "outside", "noun", "cvc", "short-u", "rhyme:-ut", "starts:h"]),
  w("jet",       ["thing", "vehicle", "fly", "noisy", "nonliving", "noun", "cvc", "short-e", "rhyme:-et", "starts:j"]),
  w("job",       ["thing", "nonliving", "noun", "cvc", "short-o", "rhyme:-ob", "starts:j"]),
  w("lid",       ["thing", "nonliving", "inside", "noun", "cvc", "short-i", "rhyme:-id", "starts:l"]),
  w("mug",       ["thing", "nonliving", "inside", "noun", "cvc", "short-u", "rhyme:-ug", "starts:m"]),
  w("pad",       ["thing", "nonliving", "inside", "noun", "cvc", "short-a", "rhyme:-ad", "starts:p"]),
  w("pan",       ["thing", "nonliving", "inside", "noun", "cvc", "short-a", "rhyme:-an", "starts:p"]),
  w("peg",       ["thing", "nonliving", "noun", "cvc", "short-e", "rhyme:-eg", "starts:p"]),
  w("pet",       ["thing", "living", "noun", "cvc", "short-e", "rhyme:-et", "starts:p"]),
  w("pop",       ["thing", "noun", "cvc", "short-o", "rhyme:-op", "starts:p"]),
  w("rim",       ["thing", "nonliving", "noun", "cvc", "short-i", "rhyme:-im", "starts:r"]),
  w("rod",       ["thing", "nonliving", "outside", "noun", "cvc", "short-o", "rhyme:-od", "starts:r"]),
  w("sub",       ["thing", "vehicle", "water", "nonliving", "noun", "cvc", "short-u", "rhyme:-ub", "starts:s"]),
  w("tab",       ["thing", "nonliving", "noun", "cvc", "short-a", "rhyme:-ab", "starts:t"]),
  w("tin",       ["thing", "nonliving", "inside", "noun", "cvc", "short-i", "rhyme:-in", "starts:t"]),
  w("tip",       ["thing", "nonliving", "noun", "cvc", "short-i", "rhyme:-ip", "starts:t"]),
  w("top",       ["thing", "nonliving", "noun", "cvc", "short-o", "rhyme:-op", "starts:t"]),
  w("tub",       ["thing", "nonliving", "inside", "noun", "cvc", "short-u", "rhyme:-ub", "starts:t"]),
  w("vet",       ["thing", "nonliving", "noun", "cvc", "short-e", "rhyme:-et", "starts:v"]),
  w("web",       ["thing", "nonliving", "noun", "cvc", "short-e", "rhyme:-eb", "starts:w"]),

  // ── Body (batch 2) ──
  w("hip",       ["body", "living", "noun", "cvc", "short-i", "rhyme:-ip", "starts:h"]),
  w("lap",       ["body", "living", "noun", "cvc", "short-a", "rhyme:-ap", "starts:l"]),
  w("leg",       ["body", "living", "noun", "cvc", "short-e", "rhyme:-eg", "starts:l"]),
  w("lip",       ["body", "living", "noun", "cvc", "short-i", "rhyme:-ip", "starts:l"]),
  w("rib",       ["body", "living", "noun", "cvc", "short-i", "rhyme:-ib", "starts:r"]),

  // ── Adjectives (batch 2) ──
  w("dim",       ["adjective", "cvc", "short-i", "rhyme:-im", "starts:d"]),
  w("fun",       ["adjective", "cvc", "short-u", "rhyme:-un", "starts:f"]),
  w("hot",       ["adjective", "cvc", "short-o", "rhyme:-ot", "starts:h"]),
  w("tan",       ["adjective", "cvc", "short-a", "rhyme:-an", "starts:t"]),

  // ── Verbs (batch 2) ──
  w("ask",       ["verb", "starts:a"]),
  w("cut",       ["verb", "cvc", "short-u", "rhyme:-ut", "starts:c"]),
  w("dug",       ["verb", "cvc", "short-u", "rhyme:-ug", "starts:d"]),
  w("eat",       ["verb", "starts:e"]),
  w("help",      ["verb", "starts:h"]),
  w("jog",       ["verb", "cvc", "short-o", "rhyme:-og", "starts:j"]),
  w("jump",      ["verb", "starts:j"]),
  w("kick",      ["verb", "starts:k"]),
  w("pat",       ["verb", "cvc", "short-a", "rhyme:-at", "starts:p"]),
  w("pull",      ["verb", "starts:p"]),
  w("push",      ["verb", "starts:p"]),
  w("rip",       ["verb", "cvc", "short-i", "rhyme:-ip", "starts:r"]),
  w("stop",      ["verb", "starts:s"]),
  w("swim",      ["verb", "starts:s"]),
  w("tap",       ["verb", "cvc", "short-a", "rhyme:-ap", "starts:t"]),
  w("tug",       ["verb", "cvc", "short-u", "rhyme:-ug", "starts:t"]),
  w("walk",      ["verb", "starts:w"]),
  w("win",       ["verb", "cvc", "short-i", "rhyme:-in", "starts:w"]),

  // ── Sight words (batch 2) ──
  w("a",         ["sight", "starts:a"]),
  w("all",       ["sight", "starts:a"]),
  w("am",        ["sight", "cvc", "short-a", "rhyme:-am", "starts:a"]),
  w("an",        ["sight", "cvc", "short-a", "rhyme:-an", "starts:a"]),
  w("at",        ["sight", "cvc", "short-a", "rhyme:-at", "starts:a"]),
  w("be",        ["sight", "verb", "starts:b"]),
  w("but",       ["sight", "cvc", "short-u", "rhyme:-ut", "starts:b"]),
  w("did",       ["sight", "verb", "cvc", "short-i", "rhyme:-id", "starts:d"]),
  w("do",        ["sight", "verb", "starts:d"]),
  w("for",       ["sight", "starts:f"]),
  w("get",       ["sight", "verb", "cvc", "short-e", "rhyme:-et", "starts:g"]),
  w("got",       ["sight", "verb", "cvc", "short-o", "rhyme:-ot", "starts:g"]),
  w("had",       ["sight", "verb", "cvc", "short-a", "rhyme:-ad", "starts:h"]),
  w("has",       ["sight", "verb", "starts:h"]),
  w("him",       ["sight", "noun", "cvc", "short-i", "rhyme:-im", "starts:h"]),
  w("his",       ["sight", "starts:h"]),
  w("man",       ["sight", "noun", "cvc", "short-a", "rhyme:-an", "starts:m"]),
  w("men",       ["sight", "noun", "cvc", "short-e", "rhyme:-en", "starts:m"]),
  w("not",       ["sight", "cvc", "short-o", "rhyme:-ot", "starts:n"]),
  w("now",       ["sight", "starts:n"]),
  w("of",        ["sight", "starts:o"]),
  w("or",        ["sight", "starts:o"]),
  w("out",       ["sight", "starts:o"]),
  w("so",        ["sight", "starts:s"]),
  w("ten",       ["sight", "noun", "cvc", "short-e", "rhyme:-en", "starts:t"]),
  w("that",      ["sight", "starts:t"]),
  w("them",      ["sight", "starts:t"]),
  w("this",      ["sight", "starts:t"]),
  w("was",       ["sight", "verb", "starts:w"]),
  w("will",      ["sight", "verb", "starts:w"]),
  w("with",      ["sight", "starts:w"]),

  // ── Nature (batch 2) ──
  w("fog",       ["nature", "thing", "outside", "nonliving", "noun", "cvc", "short-o", "rhyme:-og", "starts:f"]),
];

/** Look up words by a single tag */
export function wordsByTag(tag: string): WordEntry[] {
  return wordBank.filter((w) => w.tags.includes(tag));
}

/** Look up words that have ALL given tags */
export function wordsByTags(tags: string[]): WordEntry[] {
  return wordBank.filter((w) => tags.every((t) => w.tags.includes(t)));
}

/** Look up a word entry by word string */
export function findWord(word: string): WordEntry | undefined {
  return wordBank.find((w) => w.word === word.toLowerCase());
}

/** Get all unique tags in the word bank */
export function allTags(): string[] {
  const set = new Set<string>();
  for (const entry of wordBank) {
    for (const tag of entry.tags) set.add(tag);
  }
  return [...set].sort();
}

/** Get all rhyme families present */
export function rhymeFamilies(): string[] {
  return allTags().filter((t) => t.startsWith("rhyme:"));
}

/** Get all starting letters present */
export function startingLetters(): string[] {
  return allTags()
    .filter((t) => t.startsWith("starts:"))
    .map((t) => t.slice(7));
}
