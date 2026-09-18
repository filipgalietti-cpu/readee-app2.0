import { describe, it, expect } from "vitest";
import {
  renderSpecAsBrief,
  indefiniteArticle,
  type SceneSpec,
} from "@/lib/ai/scene-spec";

/**
 * The 2026-09-16 traffic lights daily: the passage was about Tariq and
 * Mohammed, with Tariq's mom the engineer, and the illustration was two white
 * children, one of them redrawn as a girl.
 *
 * Nothing in the pipeline had lied. REPRESENTATION_RULE had done its job in the
 * passage, and the brief was accurate as far as it went. The brief simply said
 * "a boy; a boy; a woman", because names are deliberately kept away from the
 * illustrator, and an image model given no appearance draws its default. So the
 * system produced diverse names and a white picture, which is worse than either
 * half alone.
 *
 * These tests hold the two halves of the fix: the brief carries appearance, and
 * it tells the illustrator not to substitute.
 */

function spec(partial: Partial<SceneSpec> = {}): SceneSpec {
  return {
    characters: [],
    setting: "street corner",
    time_of_day: null,
    mood: null,
    key_action: "two boys wait to cross",
    genre: "nonfiction",
    ...partial,
  };
}

describe("renderSpecAsBrief — appearance reaches the illustrator", () => {
  it("puts each person's skin and hair in the roster", () => {
    const brief = renderSpecAsBrief(
      spec({
        characters: [
          {
            species: "boy",
            name: "Tariq",
            appearance: "brown skin, short black hair",
            is_person: true,
          },
          {
            species: "boy",
            name: "Mohammed",
            appearance: "brown skin, short black hair",
            is_person: true,
          },
        ],
      }),
    );
    expect(brief).toContain("a boy with brown skin, short black hair");
    // Twice, once per boy: the count is part of what went wrong.
    expect(brief.match(/a boy with brown skin, short black hair/g)).toHaveLength(2);
  });

  it("never sends the name, which an illustrator cannot draw", () => {
    const brief = renderSpecAsBrief(
      spec({
        characters: [
          { species: "girl", name: "Meg", appearance: "pale skin, red hair", is_person: true },
        ],
      }),
    );
    expect(brief).not.toContain("Meg");
    expect(brief).toContain("pale skin, red hair");
  });

  it("tells the illustrator not to substitute, when people are in the scene", () => {
    const brief = renderSpecAsBrief(
      spec({
        characters: [{ species: "boy", appearance: "brown skin, black hair", is_person: true }],
      }),
    );
    expect(brief).toMatch(/same number, the same gender, and the same skin tone and hair/);
  });

  it("omits the people rule when nobody is in the picture", () => {
    // The depiction guard strips the cast for real, identifiable subjects. A
    // "draw each person as described" line under a "NO people" instruction is
    // the contradiction the QC judge caught on 2026-09-11.
    const brief = renderSpecAsBrief(
      spec({
        characters: [{ species: "rabbit", color: "grey", is_person: false }],
      }),
    );
    expect(brief).not.toMatch(/same skin tone and hair/);
    expect(brief).toContain("a grey rabbit");
  });

  it("forbids writing on the surfaces that attract it", () => {
    // A generator drawing a street letters the shopfronts, and a police car
    // gets POLICE on the door. That comes back garbled, the judge fails it, and
    // under the ship-gate a failed image means the day publishes with no
    // picture at all.
    const brief = renderSpecAsBrief(spec());
    expect(brief).toMatch(/vehicle doors, shopfronts, street signs/);
  });
});

describe("indefiniteArticle", () => {
  it("says an before a vowel", () => {
    // meta.adversarial warned on the brief itself for "a engineer woman".
    expect(indefiniteArticle("engineer woman")).toBe("an");
    expect(indefiniteArticle("astronaut")).toBe("an");
  });

  it("says a before a consonant", () => {
    expect(indefiniteArticle("boy")).toBe("a");
    expect(indefiniteArticle("grey rabbit")).toBe("a");
  });
});
