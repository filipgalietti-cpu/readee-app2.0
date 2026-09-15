export const bugHunt = {
  id: "pip-bug-hunt-v3",
  title: "Pip’s Bug Hunt",
  lessonTitle: "Pip’s Tree",
  seconds: 45,
  greeting: "Warm up! Pip’s Bug Hunt. Help Pip catch the bugs that match the clue. Ready to play?",
  ready: "Ready, set, go!",
  intro: "Look! Bugs are crawling around Pip’s tree. Listen for the clue. Tap the red bugs to catch them. Let the other bugs crawl away. Ready?",
  backdrop: "/lesson-studio/pips-tree/pip-forest-floor-v3.webp",
  ambience: "/lesson-studio/pips-tree/birdsong-ambience.mp3",
  finish: "You caught the clues! Now let’s follow Pip into the tree and find clues in a story.",
  targets: [
    { id: "red-bug", label: "Red bugs", instruction: "Catch the red bugs!" },
    { id: "blue-bug", label: "Blue bugs", instruction: "New clue! Catch the blue bugs!" },
    { id: "red-bug", label: "Red bugs", instruction: "One more hunt! Catch the red bugs!" },
  ],
  sprites: [
    { id: "red-bug", label: "Red bug" },
    { id: "blue-bug", label: "Blue bug" },
    { id: "gold-bug", label: "Gold bug" },
    { id: "leaf", label: "Leaf" },
  ].map((s) => ({ ...s, image: `/lesson-studio/pips-tree/art/${s.id}.svg` })),
};
export const bugHuntSpeech = [
  bugHunt.greeting,
  bugHunt.ready,
  bugHunt.intro,
  bugHunt.finish,
  ...bugHunt.targets.map((t) => t.instruction),
];
