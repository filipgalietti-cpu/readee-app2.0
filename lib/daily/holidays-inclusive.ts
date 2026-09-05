/**
 * Celebrations the old holiday table did not have.
 *
 * What was there was almost entirely US and Western: New Year, Groundhog Day,
 * Valentine's, Pi Day, St Patrick's, Independence Day, Thanksgiving, Veterans
 * Day. A child reading Readee every day for a year would meet Groundhog Day and
 * never Diwali, which is a strange picture of the world to hand a seven-year-old.
 *
 * ‼️ Two rules about dates, and they matter more than the list.
 *
 * FIXED-DATE holidays go in `FIXED`. Safe forever.
 *
 * MOON-DEPENDENT holidays - Lunar New Year, Diwali, Holi, Eid, Hanukkah, Obon -
 * do not fall on the same day each year, and several depend on local moon
 * sighting, so there is no formula that is right everywhere. They are listed
 * per-year in `DATED`, and a year that is not listed simply does not fire.
 * Silence is the correct failure: publishing "today is Eid" on the wrong day is
 * worse than not mentioning it, and a wrong date on someone's holiday is the
 * kind of mistake that tells a family this product was not built with them in
 * mind. **This table needs a human check once a year.** Do not extend it by
 * guessing, and do not replace it with a computed approximation.
 */

export type InclusiveHoliday = { label: string; topic: string };

/** month-day -> celebration. Safe in any year. */
export const FIXED: Record<string, InclusiveHoliday> = {
  "01-26": {
    label: "Australia's Wattle Day and Republic Day of India",
    topic: "A short, warm passage about Republic Day in India: parades, music and the flag, told simply and celebratory.",
  },
  "02-01": {
    label: "Black History Month begins",
    topic: "A short passage introducing Black History Month for young readers: what it celebrates and why people mark it, warm and factual, focused on achievement.",
  },
  "03-01": {
    label: "Women's History Month begins",
    topic: "A short passage introducing Women's History Month for young readers, focused on one concrete achievement a child can picture.",
  },
  "03-20": {
    label: "Nowruz",
    topic: "A short, warm passage about Nowruz, Persian New Year, which begins at the spring equinox: the haft-sin table, spring cleaning, and starting fresh.",
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
 * Moon-dependent and lunisolar dates, per year. VERIFY ANNUALLY.
 * A year not listed here simply produces no holiday, which is the safe outcome.
 */
export const DATED: Record<string, InclusiveHoliday> = {
  // ---- Lunar New Year
  "2026-02-17": {
    label: "Lunar New Year",
    topic: "A short, warm passage about Lunar New Year: red envelopes, family dinner, lion dances and the animal of the year.",
  },
  "2027-02-06": {
    label: "Lunar New Year",
    topic: "A short, warm passage about Lunar New Year: red envelopes, family dinner, lion dances and the animal of the year.",
  },
  // ---- Holi
  "2026-03-04": {
    label: "Holi",
    topic: "A short, joyful passage about Holi, the festival of colours: coloured powder, water, music and welcoming spring.",
  },
  "2027-03-22": {
    label: "Holi",
    topic: "A short, joyful passage about Holi, the festival of colours: coloured powder, water, music and welcoming spring.",
  },
  // ---- Diwali
  "2026-11-08": {
    label: "Diwali",
    topic: "A short, warm passage about Diwali, the festival of lights: clay lamps, rangoli patterns, sweets and family.",
  },
  "2027-10-29": {
    label: "Diwali",
    topic: "A short, warm passage about Diwali, the festival of lights: clay lamps, rangoli patterns, sweets and family.",
  },
  // ---- Hanukkah (first night)
  "2026-12-04": {
    label: "Hanukkah begins",
    topic: "A short, warm passage about Hanukkah: the menorah, one candle each night, latkes and the dreidel game.",
  },
  "2027-12-24": {
    label: "Hanukkah begins",
    topic: "A short, warm passage about Hanukkah: the menorah, one candle each night, latkes and the dreidel game.",
  },
  // ---- Mid-Autumn Festival
  "2026-09-25": {
    label: "Mid-Autumn Festival",
    topic: "A short, warm passage about the Mid-Autumn Festival: mooncakes, lanterns, and looking at the full moon with family.",
  },
};

/** The celebration for a date, or null. `DATED` wins over `FIXED`. */
export function inclusiveHolidayFor(isoDate: string): InclusiveHoliday | null {
  return DATED[isoDate] ?? FIXED[isoDate.slice(5)] ?? null;
}
