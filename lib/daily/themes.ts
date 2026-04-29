/**
 * Theme bank for the daily question of the day.
 *
 * Picks a theme by date in this priority order:
 *   1. Fixed-date holidays (Earth Day, Independence Day, Pi Day, etc.)
 *   2. Movable holidays (Thanksgiving = 4th Thursday of November)
 *   3. Monthly observances (Black History Month → Feb)
 *   4. Seasonal fallback (winter / spring / summer / fall)
 *   5. Day-of-week defaults (Monday: nature, Friday: fun fact, etc.)
 *
 * Each theme returns a `topic` prompt that gets fed to the wizard
 * orchestrator — same input shape as a teacher would type into the
 * Build with AI textarea.
 *
 * Add new themes by appending to FIXED_HOLIDAYS or MONTHLY_THEMES.
 */

export type DailyTheme = {
  /** Display name on the parent / teacher widget. */
  label: string;
  /** Topic prompt fed to the AI orchestrator. */
  topic: string;
  /** Optional emoji-free icon hint for the widget (one Lucide name). */
  iconHint?: string;
};

// ───── Fixed-date holidays ─────────────────────────────────────────
// Format: "MM-DD" → theme. Add freely.
const FIXED_HOLIDAYS: Record<string, DailyTheme> = {
  "01-01": {
    label: "New Year's Day",
    topic:
      "A short kid-friendly passage about why people make New Year's resolutions and how a child sets one good goal for the year.",
  },
  "01-15": {
    label: "MLK Day (around)",
    topic:
      "An age-appropriate informational passage about Dr. Martin Luther King Jr. — who he was, why we honor him, and one famous thing he taught about kindness and fairness.",
  },
  "02-02": {
    label: "Groundhog Day",
    topic:
      "A short passage about Groundhog Day — what a groundhog is, why people watch it, and what its shadow is supposed to mean.",
  },
  "02-14": {
    label: "Valentine's Day",
    topic:
      "A warm short story about a child making a Valentine's Day card for someone who would not expect it.",
  },
  "03-14": {
    label: "Pi Day",
    topic:
      "A friendly informational passage explaining what Pi (π) is in terms a 2nd-3rd grader can understand, with one example using a circle.",
  },
  "03-17": {
    label: "St. Patrick's Day",
    topic:
      "A short passage about the colors and traditions of St. Patrick's Day, including shamrocks and parades — kept secular and informational.",
  },
  "04-22": {
    label: "Earth Day",
    topic:
      "A short informational passage about Earth Day — what it celebrates and three small things a child can do to help the planet.",
    iconHint: "Leaf",
  },
  "05-04": {
    label: "Star Wars Day (May the 4th)",
    topic:
      "A short kid-friendly informational passage celebrating Star Wars Day on May 4th — fans worldwide use the date as a pun on 'May the Force be with you'. Keep it ABOUT the cultural day and the broader fun of space stories: why people love science fiction, what real astronauts and astronomers actually do, or how stars and planets work. Do NOT name Star Wars characters, planets, vehicles, organizations, factions, droids, or quote signature phrases. Do NOT describe specific Star Wars storylines. Refer only to the franchise generically (\"the popular space adventure movies\") and pivot to real space science the kid can learn.",
    iconHint: "Sparkles",
  },
  "05-05": {
    label: "Cinco de Mayo",
    topic:
      "An age-appropriate informational passage about Cinco de Mayo — the historical event in Mexico it commemorates and how it is celebrated today.",
  },
  "06-19": {
    label: "Juneteenth",
    topic:
      "An age-appropriate informational passage about Juneteenth — what it commemorates and why it became a federal holiday.",
  },
  "07-04": {
    label: "Independence Day",
    topic:
      "A short informational passage about why Americans celebrate the 4th of July and what the Declaration of Independence is.",
  },
  "10-31": {
    label: "Halloween",
    topic:
      "A short, gentle, NOT scary story about a child carving a pumpkin and trick-or-treating with a friend.",
  },
  "11-11": {
    label: "Veterans Day",
    topic:
      "An age-appropriate informational passage about Veterans Day — who veterans are and one way kids can show appreciation.",
  },
  "12-25": {
    label: "Winter holidays",
    topic:
      "A warm short story about a family enjoying a winter celebration together — keep it inclusive (no specific religious tradition) and focused on togetherness.",
  },
  "12-31": {
    label: "New Year's Eve",
    topic:
      "A short passage about what people around the world do to welcome the new year, including fireworks and traditions in different countries.",
  },
};

// ───── Movable US holidays ────────────────────────────────────────
// Computed by month + ordinal weekday (e.g. "3rd Monday of January").
// Add freely. Easter-family holidays are intentionally skipped (the
// computus is messy and they're religious, not academic anchors).

type MovableMatcher = (d: Date) => boolean;
function nthWeekdayOfMonth(month: number, weekday: number, n: number): MovableMatcher {
  return (d) => {
    if (d.getUTCMonth() + 1 !== month) return false;
    if (d.getUTCDay() !== weekday) return false;
    return Math.floor((d.getUTCDate() - 1) / 7) + 1 === n;
  };
}
function lastWeekdayOfMonth(month: number, weekday: number): MovableMatcher {
  return (d) => {
    if (d.getUTCMonth() + 1 !== month) return false;
    if (d.getUTCDay() !== weekday) return false;
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 7));
    return next.getUTCMonth() + 1 !== month;
  };
}

const MOVABLE_HOLIDAYS: { match: MovableMatcher; theme: DailyTheme }[] = [
  {
    match: nthWeekdayOfMonth(1, 1, 3),
    theme: {
      label: "MLK Day",
      topic: "An age-appropriate informational passage about Dr. Martin Luther King Jr. — who he was, why we observe his birthday with a federal holiday, and one famous lesson he taught about kindness and fairness.",
    },
  },
  {
    match: nthWeekdayOfMonth(2, 1, 3),
    theme: {
      label: "Presidents Day",
      topic: "An age-appropriate informational passage about Presidents Day — what it celebrates, the two presidents (Washington and Lincoln) it traditionally honors, and one thing each is known for.",
    },
  },
  {
    match: nthWeekdayOfMonth(5, 0, 2),
    theme: {
      label: "Mother's Day",
      topic: "A warm short story about a child planning a small surprise for their mom or a mother-figure in their life.",
    },
  },
  {
    match: lastWeekdayOfMonth(5, 1),
    theme: {
      label: "Memorial Day",
      topic: "An age-appropriate informational passage about Memorial Day — what it honors, the difference between Memorial Day and Veterans Day, and one quiet way families observe it.",
    },
  },
  {
    match: nthWeekdayOfMonth(6, 0, 3),
    theme: {
      label: "Father's Day",
      topic: "A warm short story about a child planning a small surprise for their dad or a father-figure in their life.",
    },
  },
  {
    match: nthWeekdayOfMonth(9, 1, 1),
    theme: {
      label: "Labor Day",
      topic: "An age-appropriate informational passage about Labor Day — what it celebrates, why workers get a federal holiday, and one job kids might know that didn't exist 100 years ago.",
    },
  },
  {
    match: nthWeekdayOfMonth(10, 1, 2),
    theme: {
      label: "Indigenous Peoples Day",
      topic: "An age-appropriate informational passage about Indigenous Peoples Day — what it honors and one tradition of an Indigenous nation in North America.",
    },
  },
  {
    match: nthWeekdayOfMonth(11, 4, 4),
    theme: {
      label: "Thanksgiving",
      topic: "A warm short story about a family Thanksgiving — gratitude, a shared meal, and one small tradition the child remembers — kept inclusive and not centered on a single historical narrative.",
    },
  },
];

// ───── Monthly observances ────────────────────────────────────────
const MONTHLY_THEMES: Record<number, DailyTheme[]> = {
  2: [
    {
      label: "Black History Month",
      topic:
        "An age-appropriate informational passage about a notable Black American who made an important contribution to science, art, sports, or civil rights.",
    },
  ],
  3: [
    {
      label: "Women's History Month",
      topic:
        "An age-appropriate informational passage about a notable woman who made an important contribution to history, science, or the arts.",
    },
  ],
  4: [
    {
      label: "National Poetry Month",
      topic:
        "A short, fun, age-appropriate poem (4-8 lines, rhyming) about something kids love — pets, weather, or the playground — with a comprehension question.",
    },
  ],
  5: [
    {
      label: "Asian Pacific American Heritage Month",
      topic:
        "An age-appropriate informational passage celebrating an Asian or Pacific Islander tradition, food, or notable person.",
    },
  ],
  9: [
    {
      label: "Hispanic Heritage Month",
      topic:
        "An age-appropriate informational passage celebrating Hispanic culture, traditions, or a notable Hispanic American.",
    },
  ],
  11: [
    {
      label: "Native American Heritage Month",
      topic:
        "An age-appropriate informational passage about a Native American tradition, story, or notable person.",
    },
  ],
};

// ───── Seasonal fallbacks ─────────────────────────────────────────
const SEASONAL_THEMES: Record<"winter" | "spring" | "summer" | "fall", DailyTheme[]> = {
  winter: [
    { label: "Winter wonders", topic: "A short informational passage about how snow forms and why no two snowflakes are alike." },
    { label: "Animals in winter", topic: "A short informational passage about how three different animals (a bear, a squirrel, a goose) prepare for winter." },
    { label: "Cozy story", topic: "A warm short story about a child making hot cocoa with a parent on a snowy day." },
  ],
  spring: [
    { label: "Spring blooms", topic: "A short informational passage about how a seed turns into a flower, in terms a 1st grader can follow." },
    { label: "Baby animals", topic: "A short informational passage about three different baby animals born in spring and what they're called." },
    { label: "Rainy day", topic: "A short informational passage about why it rains and what a rainbow is." },
  ],
  summer: [
    { label: "Beach day", topic: "A short story about a family's day at the beach, finding a seashell that turns out to belong to a little crab." },
    { label: "Why we sweat", topic: "A short kid-friendly informational passage about why our bodies sweat in hot weather." },
    { label: "Fireflies", topic: "A short informational passage about fireflies and why they glow." },
  ],
  fall: [
    { label: "Why leaves change", topic: "A short informational passage about why leaves change color in the fall." },
    { label: "Apple harvest", topic: "A short story about a child picking apples in an orchard for the first time." },
    { label: "Migrating birds", topic: "A short informational passage about why some birds fly south for the winter." },
  ],
};

// ───── Day-of-week defaults ────────────────────────────────────────
// When no other theme matches, vary by weekday so two adjacent days
// don't both end up "an animal fact passage".
const WEEKDAY_THEMES: Record<number, DailyTheme[]> = {
  // 0 = Sunday … 6 = Saturday
  0: [
    { label: "Sunday story", topic: "A warm short story about a child solving a small problem (lost toy, tangled kite string) with help from a friend." },
  ],
  1: [
    { label: "Monday science", topic: "A short kid-friendly informational passage about a science fact a 2nd grader could repeat at the dinner table." },
  ],
  2: [
    { label: "Tuesday animals", topic: "A short informational passage about an animal kids might not know much about (e.g., axolotl, narwhal, capybara) and one cool thing about it." },
  ],
  3: [
    {
      label: "On this day in history",
      topic:
        "Write an age-appropriate informational passage about ONE notable historical event that happened on this exact calendar day in history (any year before this year). Lead with 'On this day,' or '[Month Day], [year]:'. Pick something a 2nd-3rd grader would find interesting (an invention, a discovery, a famous first, a landmark moment). If you genuinely cannot recall a notable event for this date, pick a famous person whose birthday is today instead and lead with their name.",
    },
  ],
  4: [
    {
      label: "Thursday nature",
      topic:
        "A short informational passage about a plant, animal, weather phenomenon, or seasonal change a kid could observe in their own neighborhood RIGHT NOW (this month, this season). Anchor the passage to the current month or season — what's blooming, who's migrating, what's hatching, what's changing. Avoid generic 'animals in winter' if it's spring; pick what's actually happening today.",
    },
  ],
  5: [
    { label: "Friday fun fact", topic: "A short, surprising kid-friendly fun fact passage — something that makes a child say wait, really? — with a comprehension question." },
  ],
  6: [
    { label: "Saturday adventure", topic: "A short adventure story about a child or animal exploring somewhere new." },
  ],
};

function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

function seasonOf(month: number): "winter" | "spring" | "summer" | "fall" {
  if (month === 12 || month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "fall";
}

/**
 * Pick a deterministic theme for the given date. Same date always
 * returns the same theme so re-running the cron is safe.
 */
export function pickThemeForDate(d: Date): DailyTheme {
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const dow = d.getUTCDay();

  const fixedKey = `${pad(month)}-${pad(day)}`;
  if (FIXED_HOLIDAYS[fixedKey]) return FIXED_HOLIDAYS[fixedKey];

  // Movable US holidays (Thanksgiving, MLK Day, Memorial Day, etc.)
  // are anchored after fixed-date so e.g. July 4 always wins, but a
  // floating Monday holiday gets picked up reliably.
  for (const m of MOVABLE_HOLIDAYS) {
    if (m.match(d)) return m.theme;
  }

  // Use day-of-month as a stable seed so monthly observances rotate
  // through the array deterministically over a month.
  const seed = day - 1;
  const monthly = MONTHLY_THEMES[month];
  if (monthly && day % 7 === 0) {
    return monthly[seed % monthly.length];
  }

  // Weekday default is the most common path.
  const weekday = WEEKDAY_THEMES[dow];
  if (weekday && weekday.length > 0) {
    return weekday[seed % weekday.length];
  }

  // Fallback to seasonal.
  const season = SEASONAL_THEMES[seasonOf(month)];
  return season[seed % season.length];
}

export function slugForDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
