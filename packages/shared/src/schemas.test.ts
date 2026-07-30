import { describe, expect, it } from "vitest";

import { ChoiceSchema, ContentEntitySchema, EntityIdSchema, PredicateSchema } from "./schemas.js";

describe("EntityIdSchema", () => {
  it("accepts stable lowercase IDs", () => {
    expect(EntityIdSchema.parse("feat.athletic-fighting-style")).toBe(
      "feat.athletic-fighting-style"
    );
  });

  it("rejects display names and uppercase IDs", () => {
    expect(EntityIdSchema.safeParse("Feat.Zähigkeit").success).toBe(false);
  });
});

describe("PredicateSchema", () => {
  it("accepts nested declarative prerequisites", () => {
    const result = PredicateSchema.safeParse({
      all: [
        { characterLevel: { gte: 4 } },
        {
          any: [
            { hasFeat: { id: "feat.athletic-fighting-style" } },
            { attribute: { id: "strength", gte: 16 } }
          ]
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown operators", () => {
    expect(PredicateSchema.safeParse({ maybe: [] }).success).toBe(false);
  });
});

describe("ChoiceSchema", () => {
  it("rejects contradictory selection bounds", () => {
    const result = ChoiceSchema.safeParse({
      id: "choice.test",
      level: 1,
      kind: "skill",
      min: 2,
      max: 1
    });

    expect(result.success).toBe(false);
  });
});

describe("ContentEntitySchema", () => {
  it("validates a complete skill entity", () => {
    const result = ContentEntitySchema.safeParse({
      schemaVersion: 1,
      id: "skill.athletics",
      type: "skill",
      name: "Athletik",
      source: "source.core",
      status: "canonical",
      description: "Klettern, Springen und Schwimmen.",
      attribute: "strength"
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown entity types", () => {
    const result = ContentEntitySchema.safeParse({
      schemaVersion: 1,
      id: "mystery.unknown",
      type: "mystery",
      name: "Unbekannt",
      source: "source.core",
      status: "draft",
      description: ""
    });

    expect(result.success).toBe(false);
  });
});
