# Claude Design brief — Placement reveal (from scratch)

Paste the block below into Claude Design as a NEW file. It replaces the v2
report card direction, which Filip judged too barebones. The DATA is the same
(it comes from `lib/placement/decide.ts`); everything else starts over. The
Readee bunny and its outfit catalogue are in this project under
`app/_components/Bunny/`; use them. Treat the sandbox output as a draft: keep
the tokens, strip anything not asked for.

```
Design the PLACEMENT REVEAL for Readee, a K-4 reading app. A child has just
finished a ten-minute reading placement with Luna, Readee's AI reading tutor,
and it was fun. This flow starts on the child's last screen and ends with the
parent starting Readee+. It is a produced reveal, not a form: one fact per
card, numbers that move as they are spoken, the Readee bunny in the room, and
a calm audio guide that reads the report to the parent from the first card
to the last. It must feel like the payoff of the show the child just did and
still read like a reading specialist's report. Never a marketing quiz.

PHONE FIRST (390 wide). One desktop adaptation of the number card at 1024.
The parent takes the phone from the child.

THE DATA (state A, Maya, 4th grade, September). Use only these numbers.
- Reading speed on the 4th-grade passage: 61 words per minute. The fall
  benchmark for 4th grade is 94. About the 11th percentile. Similar to the
  average 2nd grader in the middle of the year. Accuracy 87 percent.
- Placement: Growing Reader (2nd-grade level), two grade levels below.
- Strengths: reads 2nd-grade words; understands what she reads.
- Skills: decoding at 2nd-grade words; fluency 61 words per minute; comprehension 3 of 3.
- Moments from the exam (the audio guide cites these): she read every word
  on the 2nd-grade list; "umbrella" and "remember" are where the 3rd-grade
  list got hard; in the story she slowed down but kept going; she answered
  all three questions.
- Plan: 10 minutes a day, 5 days a week. Reads like a 3rd grader by late
  April. Reaches the 4th-grade bar by next fall.
- Path (curated from the placement): starts at 2nd grade, skips the
  2nd-grade sounds unit she already showed, targets 3rd-grade words, then
  reading speed with Luna listening daily, then the 4th-grade bar. 23
  lessons, about 8 weeks at 10 minutes a day.
- Vocabulary: say "benchmark" for the grade number and "the average 4th
  grader" in prose. Never "typical," never "behind," never "failing" except
  inside the reassurance sentence.

THE AUDIO GUIDE. Readee's voice (the same warm voice the child heard, but not
introduced as Luna to the parent). It speaks on every card, and each card's
motion happens WHILE it speaks: the number counts up as the number is said,
the bar fills as the bar is described. A caption line shows the sentence
being spoken, with a speaker toggle top right. When the voice is on, cards
auto-advance 1.5 seconds after it finishes; when off, the parent taps Next.
Show the caption line and the toggle as a reusable frame.

THE BEATS (nine artboards, in order)

R0 · FINISH, the child's screen. Luna's last line: "That's everything. You
did it." Confetti once. The bunny in the child's own equipped outfit does its
celebration pose with the bubble "Wow, Maya, look how far you climbed."
Carrots earned count up: "+30 carrots." Then Luna: "Now hand the screen to a
grown-up, so I can show them what you did today." Nothing for the child to
tap that leads onward. No label about grown-ups anywhere.

R1 · HOLD TO BUILD. One big button: "Hold to build Maya's report." A ring
fills around it over two seconds while it is held; let go early and it
drains. While it fills, the bunny in the ROBOT outfit (outfitId bunny_robot) walks back and forth
along a small workbench, and three lines rotate beneath, one at a time:
"Comparing Maya's reading with the 4th-grade benchmark," "Checking three
skills," "Curating Maya's path." When the ring completes: a soft chime and
the first card rises. Show two frames: holding, complete. This is the only
screen with a looping animation, because it is a wait.

R2 · "MAYA DID A GREAT JOB TODAY." The guide says it. Strengths tick in one
at a time as they are named, icon pops 0.35 seconds apart. Then one moment
from the exam appears as a quiet line: "She read every word on the 2nd-grade
list." Meta line: "10 minutes with Luna · September 2."

R3 · THE NUMBER. Eyebrow: "Reading speed · 4th-grade passage." As the guide
says "Maya read 61 words per minute," the big number counts up from 0 to 61
over 1.2 seconds. As it says "the fall benchmark for 4th grade is 94," the
benchmark marker fades in on the right. As it says "about the 11th
percentile," the percentile bar draws left to right and the marker slides to
11. The sentence settles beneath: "The fall benchmark for 4th grade is 94
words per minute. Maya read 61, about the 11th percentile, similar to the
average 2nd grader in the middle of the year." Source line: "Hasbrouck and
Tindal 2017 national norms." Optional beat below the sentence: a small
player, "Hear 8 seconds of Maya reading the 4th-grade passage," so the
parent hears the evidence. Calm and violet. No red, no shake. Show two
frames: mid-count, settled. This is the card that changes a parent's mind;
it wins by precision.

R4 · PLACEMENT. Band and category on one line: "Growing Reader · Two grade
levels below." Support sentence: "Maya will benefit from targeted practice in
3rd-grade words, reading speed, and accuracy." One beat later, in its own
quiet style: "Below grade level does not mean failing. It means the practice
needs to be aimed."

R5 · THREE SKILLS, one at a time. The guide says one sentence per skill and
that skill's bar fills while it speaks: "Decoding: she reads 2nd-grade
words; 3rd-grade words are next." "Fluency: 61 words per minute at 87
percent accuracy; speed is the skill to build." "Comprehension: three of
three; she understands what she reads." Fill fluency by percentile, decoding
by band ratio, comprehension by correct over total. Show two frames: second
bar filling, all filled.

R6 · THE PATH. This is the card that proves the plan is Maya's, not a
grade's. A route with nodes, drawn as the guide describes it: "Maya's path
starts at 2nd grade" (start node), "she skips the 2nd-grade sounds unit,
because she already showed us those" (a node marked skipped, with the
reason), "3rd-grade words come first, because that is where the word list
got hard" (a target node, with the reason), "then reading speed, with Luna
listening every day and adjusting" (the Luna node), "and the 4th-grade bar"
(the end node). Milestone flags on the route: "late April" and "next fall."
A count under the route: "23 lessons · about 8 weeks at 10 minutes a day."
Then "Curated from Maya's placement · Reviewed by Jennifer Klingerman,
certified reading specialist." Show the route as a component with node
states: start, skipped, target, Luna, end.

R7 · THE PLAN, this week. "10 minutes a day, 5 days a week." The two
milestones with their months. "Three things to do at home this week," three
short items. Small line: "Projected from published growth rates at this
practice dose."

R8 · THE ASK. Headline: "Maya's plan is ready." One line: "Everything on her
path is included with Readee+." The bunny (bunny_classic) small beside the
button. Primary button: "Start Maya's plan." Fine print: "14-day free trial,
then $9.99 a month. Cancel anytime." Trust line: "Reviewed by Jennifer
Klingerman, certified reading specialist." Secondary link, plain and
factual, never shaming: "Not now. Keep the free lessons." Under it: "The full
report stays on your dashboard." Nothing else competes with the button.

CHROME on R2 to R8: progress dots, Next arrow, swipe, "Skip to full report"
text link (opens a static, printable version of the same content), the
speaker toggle, reduced-motion fallback (counts and bars jump to final).

MOTION (the app's canon, copy it)
- Entrances rise 16 px over 0.35 s. Card-to-card slide 24 px over 0.5 s.
- Count-up 1.2 s ease-out, tied to the spoken number. Bar fills 0.6 s
  ease-out, tied to the spoken sentence. Percentile marker 0.8 s. Route
  nodes light up in the order they are spoken, 0.3 s apart.
- Confetti once on R0. The robot walk loops on R1 only. Micro-animations are
  welcome on the number, the bars, the route and the bunny. No shimmer,
  pulse, meteors, floating shapes, or animated backgrounds anywhere.
- Deliver motion as real CSS keyframes where the sandbox can, plus
  before/after frames.

VISUAL SYSTEM (the Readee design system in this project)
- One font family, regular and semibold. Violet is the brand; indigo only in
  soft tints. Light theme only. Off-white ground.
- The action gradient token on buttons, band chips and bar fills only. No
  gradient anywhere else, never on text.
- Icons: Glyph, the single-colour set in this project. Carrots are Readee's
  carrot art. No emoji, no Lucide.
- Semantic colour is information: emerald for strengths and the start node,
  amber for targets, grey for skipped, never red.
- Characters: only the Readee bunny, using the outfit catalogue in this
  project. The child's own outfit on R0, bunny_robot on R1, bunny_classic on R8. The catalogue is in this project at app/_components/Bunny/OUTFITS.md. The
  bunny never sits beside the number on R3.
- Not everything is a card: the sentence on R3 and the headline on R4 sit on
  the page. The route on R6 and the plan on R7 get one bordered surface each.

HARD CONSTRAINTS
- "Child," never "kid." No em-dashes. No countdown, no strike-through price,
  no "guaranteed." One primary button, on R8 only.
- Every number is from THE DATA. No stars, no reading age, no Lexile.
- Under 90 seconds with the voice on. Always skippable.

DELIVERABLE
Nine artboards R0 to R8 at phone width, with R1, R3 and R5 shown as two
frames each; one desktop adaptation of R3; the caption-and-toggle frame; the
percentile bar, the skill bar, and the route as reusable components.

SLOP CHECK. Before presenting, verify: gradients only on buttons, chips and
bar fills; no pill or eyebrow above a headline except the data label on R3;
no hero; no animated background; no emoji; no Lucide; no em-dash; every
number from THE DATA; motion only where named. Fix anything that fails
before showing me. Do not add sections.
```

## Engineering notes (for the port, not the sandbox)

- Moments: the runner records exam moments as they happen (list passed, the
  words where a list got hard, passage pace and whether she kept going,
  comprehension answers). The narration is composed from the decision plus
  those moments with sentence templates per state, then synthesized in the
  Readee voice server-side at completion (the same Vertex call generateSpeech
  uses, under 700 characters per clip), and cached on the assessments row.
  Synthesis starts while the child is still on the celebration screen, so
  the hold-to-build beat is real loading time.
- The path: a plan builder in lib/placement/plan.ts derives it from the
  decision and the lesson catalogue: entry at the placed band, units the
  evidence already covers marked skipped with the reason, target units
  inserted from the needs, Luna's daily read as a standing node, lesson and
  week counts from the real units. Bounded personalization, not a bespoke
  curriculum: the catalogue stays the catalogue.
- The 8-second playback: the runner keeps the passage recording in the
  private child-audio bucket (signed URL, parent only), the same store Luna's
  sessions use.
- The ask: decline copy is factual, never confirmshaming (FTC, Bringing Dark
  Patterns to Light, 2022). Stripe Checkout with Apple Pay, Google Pay and
  Link enabled; email prefilled.
- "Skip to full report" and "Not now" open the static report page, which is
  also what prints and what the email links to.
