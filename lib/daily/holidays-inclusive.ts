/**
 * Celebrations the old holiday table did not have, dated properly.
 *
 * What existed was almost entirely US and Western: New Year, Groundhog Day,
 * Valentine's, Pi Day, St Patrick's, Independence Day, Thanksgiving, Veterans
 * Day. A child reading Readee every day for a year met Groundhog Day and never
 * Diwali, which is a strange picture of the world to hand a seven-year-old.
 *
 * ‼️ THESE DATES ARE COMPUTED, NOT TYPED IN.
 *
 * The first version of this file hand-listed "moon-dependent" dates per year
 * and asked for an annual human check. That was wrong twice over. It was wrong
 * in principle, because most of these calendars are arithmetic rather than
 * observational and a table just goes stale. And it was wrong in fact, three
 * times over. It pinned Nowruz to March 20 every year (it is the 21st in 2026
 * and 2027). It put Hanukkah on 4 December 2026 (25 Kislev is the 5th). And it
 * gave Lunar New Year 2027 as 6 February, when the Chinese calendar says the
 * 6th is still 12/30 of the old year and the new year starts on the 7th. Each
 * of those would have published somebody's holiday on the wrong day, which is
 * precisely the mistake that tells a family this was not built with them in
 * mind.
 *
 * `Intl.DateTimeFormat` ships the Chinese, Hebrew, Persian and Umm al-Qura
 * calendars, so the real dates are one conversion away and correct forever:
 *
 *   Lunar New Year     chinese 1/1        Mid-Autumn      chinese 8/15
 *   Dragon Boat        chinese 5/5        Hanukkah        hebrew 25 Kislev
 *   Rosh Hashanah      hebrew 1 Tishri    Passover        hebrew 15 Nisan
 *   Nowruz             persian 1/1        Eid al-Fitr     islamic 1 Shawwal
 *   Eid al-Adha        islamic 10 Dhu al-Hijjah
 *
 * The one genuine exception is the Hindu festival calendar. Diwali and Holi
 * depend on Panchang tithi calculations that `Intl` does not expose, so they
 * stay in a small table that DOES need extending. A year that is not listed
 * produces nothing, which is the safe failure.
 *
 * ‼️ One honest caveat on the Eids: `islamic-umalqura` is the Saudi civil
 * calendar, and many communities begin on local moon sighting instead, so the
 * observed day can differ by one. The passages are therefore written as "Eid
 * al-Fitr is celebrated..." rather than "today is Eid", which reads correctly
 * either way.
 */

export type InclusiveHoliday = { label: string; topic: string };

/** Calendar fields for an ISO date, in the requested non-Gregorian calendar. */
function fieldsIn(calendar: string, iso: string): { month: string; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  const fmt = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
    year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC",
  });
  const out: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(Date.UTC(y, m - 1, d)))) out[p.type] = p.value;
  return { month: out.month ?? "", day: Number(out.day ?? "0") };
}

/** Hebrew months come back as names ("Kislev"), Chinese and Persian as numbers. */
const on = (cal: string, iso: string, month: string, day: number): boolean => {
  const f = fieldsIn(cal, iso);
  return f.month === month && f.day === day;
};

const COMPUTED: { label: string; topic: string; when: (iso: string) => boolean }[] = [
  {
    label: "Lunar New Year",
    topic: "A short, warm passage about Lunar New Year: red envelopes, family dinner, lion dances and the animal whose year it is.",
    when: (iso) => on("chinese", iso, "1", 1),
  },
  {
    label: "Mid-Autumn Festival",
    topic: "A short, warm passage about the Mid-Autumn Festival: mooncakes, lanterns, and looking at the full moon with family.",
    when: (iso) => on("chinese", iso, "8", 15),
  },
  {
    label: "Dragon Boat Festival",
    topic: "A short, lively passage about the Dragon Boat Festival: the long boats, the drums, the racing teams and sticky rice dumplings.",
    when: (iso) => on("chinese", iso, "5", 5),
  },
  {
    label: "Hanukkah begins",
    topic: "A short, warm passage about Hanukkah: the menorah, one more candle each night, latkes and the dreidel game.",
    when: (iso) => on("hebrew", iso, "Kislev", 25),
  },
  {
    label: "Rosh Hashanah",
    topic: "A short, warm passage about Rosh Hashanah, the Jewish new year: apples dipped in honey for a sweet year, and the sound of the shofar.",
    when: (iso) => on("hebrew", iso, "Tishri", 1),
  },
  {
    label: "Passover begins",
    topic: "A short, warm passage about Passover: the seder table, matzah, and the youngest child asking the four questions.",
    when: (iso) => on("hebrew", iso, "Nisan", 15),
  },
  {
    label: "Nowruz",
    topic: "A short, warm passage about Nowruz, Persian New Year, which begins at the spring equinox: the haft-sin table, spring cleaning, and starting fresh.",
    when: (iso) => on("persian", iso, "1", 1),
  },
  {
    label: "Eid al-Fitr",
    topic: "A short, warm passage about Eid al-Fitr, which is celebrated at the end of Ramadan: new clothes, family visits, sweets and gifts for children. Write it as a description of the celebration, not as an announcement that today is Eid.",
    when: (iso) => on("islamic-umalqura", iso, "10", 1),
  },
  {
    label: "Eid al-Adha",
    topic: "A short, warm passage about Eid al-Adha: family gatherings, sharing food with neighbours and people in need. Write it as a description of the celebration, not as an announcement that today is Eid.",
    when: (iso) => on("islamic-umalqura", iso, "12", 10),
  },
];

/**
 * Hindu festival dates. ‼️ THE ONLY TABLE LEFT, AND IT NEEDS EXTENDING.
 * Panchang tithi is not available through Intl. An unlisted year fires nothing.
 */
export const HINDU_DATES: Record<string, InclusiveHoliday> = {
  "2026-11-08": {
    label: "Diwali",
    topic: "A short, warm passage about Diwali, the festival of lights: clay lamps, rangoli patterns, sweets and family.",
  },
  "2027-10-29": {
    label: "Diwali",
    topic: "A short, warm passage about Diwali, the festival of lights: clay lamps, rangoli patterns, sweets and family.",
  },
  "2026-03-04": {
    label: "Holi",
    topic: "A short, joyful passage about Holi, the festival of colours: coloured powder, water, music and welcoming spring.",
  },
  "2027-03-22": {
    label: "Holi",
    topic: "A short, joyful passage about Holi, the festival of colours: coloured powder, water, music and welcoming spring.",
  },
};

/** month-day -> celebration. Genuinely fixed in the Gregorian calendar. */
export const FIXED: Record<string, InclusiveHoliday> = {
  "02-01": {
    label: "Black History Month begins",
    topic: "A short passage introducing Black History Month for young readers: what it celebrates and why people mark it, warm and factual, focused on achievement.",
  },
  "03-01": {
    label: "Women's History Month begins",
    topic: "A short passage introducing Women's History Month for young readers, focused on one concrete achievement a child can picture.",
  },
  "05-01": {
    label: "Asian Pacific American Heritage Month begins",
    topic: "A short passage introducing Asian Pacific American Heritage Month for young readers, focused on one concrete story or tradition.",
  },
  "05-05": {
    label: "Cinco de Mayo",
    topic: "A short, factual passage about Cinco de Mayo: what it actually commemorates in Mexico, plus the music and food of the celebration.",
  },
  "06-19": {
    label: "Juneteenth",
    topic: "A short, age-appropriate passage about Juneteenth: the day in 1865 when the last enslaved people in Texas learned they were free, and how families celebrate it now with parades, red foods and music. Warm and factual. Do not describe cruelty.",
  },
  "09-15": {
    label: "Hispanic Heritage Month begins",
    topic: "A short passage introducing Hispanic Heritage Month for young readers, focused on one concrete tradition, food or achievement.",
  },
  "10-02": {
    label: "International Day of Non-Violence",
    topic: "A short passage about Mahatma Gandhi's birthday and the idea of solving problems without fighting, pitched at a child's playground scale.",
  },
  "11-01": {
    label: "Day of the Dead",
    topic: "A short, warm passage about Día de los Muertos: marigolds, sugar skulls, photographs and food set out to remember family members. Celebratory, not frightening or sad.",
  },
  "11-14": {
    label: "Children's Day (India)",
    topic: "A short passage about Children's Day in India and why some countries set aside a day for children.",
  },
  "12-26": {
    label: "Kwanzaa begins",
    topic: "A short, warm passage about Kwanzaa: the seven days, the candles, and what families do together.",
  },
};

/**
 * The celebration for a date, or null.
 *
 * ‼️ FIXED WINS. Collisions are real - 19 June 2026 is both Juneteenth and the
 * Dragon Boat Festival - and the fixed list has to take precedence because
 * those dates never move. Juneteenth is always 19 June, so if it lost a
 * collision it would simply be missed that year; Dragon Boat lands somewhere
 * else next year and loses nothing but this one occurrence.
 */
export function inclusiveHolidayFor(isoDate: string): InclusiveHoliday | null {
  const fixed = FIXED[isoDate.slice(5)];
  if (fixed) return fixed;
  for (const c of COMPUTED) {
    if (c.when(isoDate)) return { label: c.label, topic: c.topic };
  }
  return HINDU_DATES[isoDate] ?? null;
}
