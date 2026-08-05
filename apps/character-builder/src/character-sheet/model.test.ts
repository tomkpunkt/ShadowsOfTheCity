import { describe, expect, it } from "vitest";

import { CatalogSchema, type CharacterDocument } from "@sotc/shared";
import { calculateCharacter, emptySessionState } from "@sotc/rules-engine";

import catalogJson from "../../../../generated/catalog.json" with { type: "json" };

import { buildSheetModel } from "./model.js";

const catalog = CatalogSchema.parse(catalogJson);

describe("character sheet model", () => {
  it("deduplicates features and derives sheet lists from the engine result", () => {
    const document: CharacterDocument = {
      formatVersion: 3,
      contentSchemaVersion: 1,
      catalogHash: catalog.contentHash,
      createdWithVersion: "0.1.0",
      lastSavedWithVersion: "0.1.0",
      build: {
        name: "Mira",
        level: 1,
        ancestryId: "ancestry.elf",
        backgroundId: "background.academic",
        classId: "class.magier",
        choices: {},
        attributeBoosts: ["intelligence", "wisdom"],
        inventoryIds: [],
        options: {},
        biography: {
          description: "",
          appearance: "",
          personality: "",
          motivation: "",
          relationships: "",
          organizations: "",
          contacts: "",
          goals: "",
          backgroundNotes: ""
        }
      },
      session: emptySessionState(),
      migrations: [],
      legacyValues: {}
    };
    const result = calculateCharacter(catalog, document);
    const model = buildSheetModel(catalog, document, result);

    expect(model.identity.className).toBe("Magier");
    expect(new Set(model.features.map((feature) => feature.id)).size).toBe(model.features.length);
    expect(model.skills).toHaveLength(19);
  });
});
