# Claude Design brief — Placement report card flow (`/placement/report`)

Paste the block below into Claude Design. Grounded in the real data model
(`lib/placement/decide.ts` → `PlacementDecision`): the placement exam produces a
placed band with its Readee band name, an i-Ready-style relative placement, the
fluency numbers against the Hasbrouck & Tindal norms, strengths first, needs,
and a dated plan. The child-facing exam is NOT in scope (it reuses Luna, Speak,
Choose and the celebration). Treat the sandbox output as a draft: keep the
tokens, strip anything it adds that is not in this brief.

```
Design the PARENT REPORT CARD FLOW for Readee, a K-4 reading app. A child has
just finished a short reading placement with Luna, Readee's AI tutor. The child
saw a celebration. Now the parent sees the truth, calmly, with precise numbers,
and a plan. This flow is the single highest-stakes screen in the business: it is
where a parent who believed their child was "doing fine" learns a real number
and decides to start Readee+. It must read like a report from a reading
specialist, not like a sales page. Calm authority. No urgency tricks.

WHO IT'S FOR
A parent of ONE child, most often on a phone (the report is also emailed), who
signed up ten minutes ago and knows nothing about reading levels. They already
trust one mental model: the pediatrician's percentile chart. Use it.

THE FLOW (three screens plus one email block)
1. HANDOFF. The child's celebration ends with "Great reading, [name]! Now hand
   the device to a grown-up." Then a simple grown-up gate (propose one: press
   and hold, or a year-of-birth question). Small screen, warm, no numbers yet.
2. THE REPORT CARD. One scrolling page. Sections in this exact order, because
   the order is the persuasion:
   a. Header: "[Name]'s reading snapshot", the date, the enrolled grade, and a
      quiet line: "From a ten-minute placement with Luna."
   b. STRENGTHS FIRST. Two to four short phrases, each with a Glyph icon
      (examples: "reads 2nd-grade words", "understands what she reads").
      Always before any gap. If there are no strengths yet (a brand-new
      reader), show what the child CAN do in a warm sentence instead of an
      empty block.
   c. THE TWO NUMBERS. Words correct per minute on the grade-level passage
      against the typical number for that grade and season, drawn as a
      pediatrician-style percentile bar: a horizontal 1 to 99 scale with light
      marks at 10, 25, 50, 75, 90, the child's marker, and a "typical" marker
      at 50. Under it, one precise sentence: "Typical 4th graders read about
      94 words per minute in the fall. Maya read 61, about the 11th
      percentile, similar to a mid-2nd-grade reader." Cite the source in
      small type: "Hasbrouck and Tindal 2017 national norms."
   d. PLACEMENT. The band name as a chip (Growing Reader, Independent Reader),
      then the category with its support sentence, the pattern every school
      report uses: "Two grade levels below. Maya will benefit from targeted
      practice in 3rd-grade words, reading speed, and accuracy." Directly
      under it, the disarming line in its own quiet style: "Below grade level
      does not mean failing. It means the practice needs to be aimed."
   e. THREE SKILL BARS, not gauges: Decoding ("2nd-grade words"), Fluency
      ("61 words per minute, typical 94"), Comprehension ("3 of 3"). Each bar
      has a one-line "what this means" in plain words.
   f. THE PLAN. A dated plan with a headline the parent can repeat: "10
      minutes a day, 5 days a week." Two milestones with months: "Reads like
      a 3rd grader by late April" and "Reaches the 4th-grade bar by next
      fall." One evidence line in small type: "Projected from published
      growth rates at this practice dose." Then "Three things to do at home
      this week" (three short items with Glyph icons).
   g. THE ASK. Primary button "Start Maya's plan" with fine print under it:
      "14-day free trial, then $9.99 a month. Cancel anytime." Secondary,
      quiet link: "Not now" (the report stays on the dashboard). Nothing
      else competes with the button.
   h. Footer: "How this was measured" (one short paragraph naming the word
      lists, the one-minute passage, and the questions) and a print link.
3. PLAN PREVIEW (optional, if it helps): tapping "Start Maya's plan" shows
   the pathway in one glance before checkout: the first unit name, the number
   of lessons, "about 6 weeks at 10 minutes a day", then the checkout button.
4. EMAIL BLOCK. The top of the emailed version: header, the two-number
   sentence, the category sentence, one button "See Maya's full report".
   Same data, phone width, no bars that need JavaScript.

THREE STATES TO DESIGN (same layout, real data)
A. Maya, 4th grade, September. Placed: Growing Reader (2nd-grade level), "two
   grade levels below." Strengths: reads 2nd-grade words; understands what she
   reads. Fluency on the 4th-grade passage: 61 words per minute, typical 94,
   about the 11th percentile, similar to a mid-2nd-grade reader, accuracy 87
   percent. Comprehension 3 of 3. Needs: 3rd-grade words; reading speed and
   smoothness; accurate reading. Plan: 10 minutes a day, 5 days a week; reads
   like a 3rd grader by late April; reaches the 4th-grade bar by next fall.
B. Theo, kindergarten, September. A brand-new reader. Placed: Beginning
   Reader, "on grade level," with a descriptive paragraph instead of numbers:
   what Theo can do now (knows some letter sounds) and what comes next.
   Foundations: letter sounds 3 of 8, blending 2 of 6, sounding out new words
   1 of 6. No words-per-minute (kindergartners are not measured on passages;
   say so plainly). Needs: letter sounds; blending sounds into words; sounding
   out new words. Plan: 10 minutes a day; letter sounds this month; first
   words by winter. The tone is bright: this is where every reader starts.
C. Rosa, 2nd grade, April. Placed: Independent Reader (3rd-grade level), "one
   grade level above." Strengths: reads grade-level words; reads accurately;
   reads at a good pace; understands what she reads. Fluency on the 2nd-grade
   passage: 118 words per minute, typical 100, about the 69th percentile,
   similar to an early-4th-grade reader. Comprehension 3 of 3. No needs: the
   plan is a stretch plan ("3rd-grade words and longer stories"), same
   button. Readee+ sells to families aiming above grade level too.

COPY RULES (non-negotiable)
- Strengths before gaps, always. Numbers are precise, never rounded to
  "a bit behind." The card never says "behind" or "failing" in its own voice.
- Never "guaranteed," never "in 30 days," never a countdown or a fake
  discount. The plan is dated because it is projected, and it says so.
- "Child," never "kid." No em-dashes anywhere. No exclamation marks in the
  numbers section. Warm but level.
- Parent-facing words are allowed here ("placement," "reading level"). The
  child never sees this screen.

VISUAL SYSTEM (match the current app, not a rebrand)
- One font family, regular and semibold only. Violet is the brand; indigo
  lives only in soft tints.
- The one primary button uses the action gradient from-violet-600 to
  violet-500. Callouts use the soft surface tint from-violet-50 to indigo-50.
  Never a gradient on text, never a gradient that is the same colour at both
  ends.
- Icons: Glyph (Fluent System Icons, single colour) on this parent surface.
  No Lucide anywhere on customer surfaces. No child reward icons here.
- Semantic colour is information: emerald for strengths, amber for needs,
  never red on this card. The percentile bar's markers use the violet accent.
- One resting-card shadow depth, the Tailwind spacing scale, rounded cards
  but not everything is a card: the two-number sentence and the category
  sentence sit on the page, not in boxes, so they read as statements.
- The bunny may appear once, small, near the handoff, never near the numbers.
- Light theme only. No pills above the headline, no animated dots, no
  floating shapes, no shimmer.

HARD CONSTRAINTS
- Phone width first (the email lands on a phone), then desktop. Printable:
  a parent will print this for a teacher, so the page must survive black and
  white on paper.
- ONE child per account: no child pickers.
- No native emoji. No black text on coloured surfaces.
- Every number on the card exists in the data model listed above; do not
  invent metrics (no "reading age," no letter levels, no Lexile).

DELIVERABLE
The report card page in states A, B and C at phone width, plus A at desktop
width; the handoff screen; the email block for state A. Show the percentile
bar and the three skill bars as reusable components.
```

## Slop check (paste this as the last block of the prompt, and run it against the output)

```
SLOP CHECK. Before you present the design, verify every line below. If any
line fails, fix it before showing me. Do not add anything this brief did not
ask for; when in doubt, leave white space.
- Exactly ONE gradient on the whole page: the primary button. It runs
  violet-600 to violet-500, same hue, a soft sheen. No gradient on any
  headline, chip, bar, background, or card. No text with a gradient fill.
- No pill, badge, eyebrow label, or animated dot above the headline.
- No floating shapes, blobs, orbs, meteors, shimmer, border beams, sparkles,
  confetti, or animated grid patterns anywhere.
- No hero. This is a report, not a landing page: it starts with the child's
  name and the date.
- Light theme only. Off-white or white ground, violet accent, ink text.
- Not everything is a card. The two-number sentence and the category
  sentence sit directly on the page. Only the plan and the skill bars get a
  bordered surface, and they share one radius and one shadow.
- Icons are single-colour Glyph icons, all the same size in a row. No
  emoji, no Lucide, no illustrations except one small bunny near the
  handoff.
- Every number on the page is one from this brief. No invented metrics,
  no "reading age," no letter levels, no stars out of five.
- No em-dash anywhere. "Child," never "kid." No exclamation marks in the
  numbers section. No "guaranteed," no countdown, no strike-through price.
- One primary button per screen. The secondary action is a plain link.
- Print it mentally in black and white: every meaning survives without
  colour (the percentile bar still reads from its marker labels).
```
