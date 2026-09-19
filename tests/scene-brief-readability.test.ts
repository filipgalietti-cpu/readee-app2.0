import { describe, it, expect } from "vitest";
import {
  renderSpecAsBrief,
  normalizeCharacter,
  cleanAttribute,
  pluralize,
  type SceneSpec,
} from "@/lib/ai/scene-spec";

/**
 * 2026-09-19, the Hispanic Heritage daily. Three image candidates in a row came
 * back "The model didn't return an image. Try rephrasing." That is not an
 * outage and not a quota: it is the model declining to draw something it could
 * not parse.
 *
 * The brief was asking for this:
 *
 *   Show exactly: a girl with light brown skin, dark brown hair; a boy with
 *   light brown skin, short black hair; 2 dancing, in brightly colored clothes
 *   child.
 *
 * The extractor had written a clause into an attribute field, and "child" is a
 * species word its own instructions forbid. A brief is generated text, so it
 * has to survive the extractor having a bad day.
 */

function spec(characters: SceneSpec["characters"]): SceneSpec {
  return {
    characters,
    setting: "cultural celebration",
    time_of_day: null,
    mood: "happy",
    key_action: "Lila clapping her hands",
    genre: "nonfiction",
  };
}

describe("cleanAttribute", () => {
  it("keeps a cue and drops a clause", () => {
    expect(cleanAttribute("dancing, in brightly colored clothes")).toBe("dancing");
  });

  it("caps a run-on that has no comma to hide behind", () => {
    expect(cleanAttribute("wearing a very long flowing ceremonial gown")).toBe("wearing a very long");
  });

  it("leaves an ordinary cue alone", () => {
    expect(cleanAttribute("fluffy")).toBe("fluffy");
    expect(cleanAttribute("in a red coat")).toBe("in a red coat");
  });

  it("treats empty and missing as absent", () => {
    expect(cleanAttribute("")).toBeNull();
    expect(cleanAttribute("   ")).toBeNull();
    expect(cleanAttribute(null)).toBeNull();
    expect(cleanAttribute(undefined)).toBeNull();
  });
});

describe("pluralize", () => {
  it("says children, not childs", () => {
    expect(pluralize("child")).toBe("children");
    expect(pluralize("dancing child")).toBe("dancing children");
  });

  it("pluralises the head noun, not the appearance clause", () => {
    expect(pluralize("boy with brown skin, short black hair")).toBe(
      "boys with brown skin, short black hair",
    );
  });

  it("handles the ordinary and the irregular", () => {
    expect(pluralize("rabbit")).toBe("rabbits");
    expect(pluralize("fox")).toBe("foxes");
    expect(pluralize("puppy")).toBe("puppies");
    expect(pluralize("woman")).toBe("women");
    expect(pluralize("glasses")).toBe("glasses");
  });
});

describe("the brief that was refused", () => {
  it("no longer ships a sentence fragment", () => {
    const brief = renderSpecAsBrief(
      spec([
        normalizeCharacter({ species: "girl", appearance: "light brown skin, dark brown hair", is_person: true }),
        normalizeCharacter({
          species: "child",
          attribute: "dancing, in brightly colored clothes",
          count: 2,
          is_person: true,
        }),
      ]),
    );
    expect(brief).not.toContain("in brightly colored clothes child");
    expect(brief).toContain("2 dancing children");
  });

  it("still carries the appearance that the names imply", () => {
    // The 09-16 fix must survive the 09-19 one.
    const brief = renderSpecAsBrief(
      spec([normalizeCharacter({ species: "girl", appearance: "light brown skin, dark brown hair", is_person: true })]),
    );
    expect(brief).toContain("a girl with light brown skin, dark brown hair");
  });
});

describe("the plain rendering, used when every candidate is refused", () => {
  const cast = spec([
    normalizeCharacter({ species: "girl", appearance: "light brown skin, dark brown hair", is_person: true }),
    normalizeCharacter({ species: "boy", appearance: "light brown skin, short black hair", is_person: true }),
  ]);

  it("keeps the scene, the cast and the counts", () => {
    const plain = renderSpecAsBrief(cast, { plain: true });
    expect(plain).toContain("a girl");
    expect(plain).toContain("a boy");
    expect(plain).toContain("Lila clapping her hands");
  });

  it("drops the wordiest part, which is what a refusal is usually choking on", () => {
    const plain = renderSpecAsBrief(cast, { plain: true });
    expect(plain).not.toContain("light brown skin");
    expect(plain).not.toContain("same skin tone and hair");
  });

  it("differs from the full brief, so the retry is actually a different request", () => {
    expect(renderSpecAsBrief(cast, { plain: true })).not.toBe(renderSpecAsBrief(cast));
  });
});
