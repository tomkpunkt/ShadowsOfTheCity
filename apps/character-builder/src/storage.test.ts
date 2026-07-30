import { describe, expect, it } from "vitest";

import type { Catalog } from "@sotc/shared";

import {
  emptyCharacter,
  importCharacter,
  loadCharacter,
  saveCharacter,
  serializeCharacter,
  type StorageLike
} from "./storage.js";

const hash = "a".repeat(64);

const memoryStorage = (): StorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
};

const catalog: Catalog = {
  schemaVersion: 1,
  contentHash: hash,
  aliases: {
    "legacy.trait.test": "trait.test"
  },
  entities: [
    {
      schemaVersion: 1,
      id: "trait.test",
      type: "trait",
      name: "Test",
      source: "test.source",
      status: "canonical",
      summary: "Ein konkretes Testmerkmal für die Speichermigration.",
      rulesText: "Dieses Merkmal dient ausschließlich als auflösbares Testziel.",
      editorialStatus: "reviewed",
      description: "",
      traits: [],
      references: [],
      examples: [],
      appliesTo: []
    }
  ]
};

describe("character storage", () => {
  it("round-trips a versioned character", () => {
    const storage = memoryStorage();
    const character = {
      ...emptyCharacter(hash),
      name: "Nyx",
      attributeBoosts: ["dexterity" as const],
      inventoryIds: ["trait.test"],
      equippedItemIds: [],
      options: { "option.test": true }
    };

    saveCharacter(character, storage);
    const loaded = loadCharacter(catalog, storage);

    expect(loaded.character).toEqual(character);
    expect(loaded.compatibility).toBe("compatible");
    expect(loaded.conflicts).toEqual([]);
  });

  it("reports malformed local data instead of silently accepting it", () => {
    const storage: StorageLike = {
      getItem: () => "{broken",
      setItem: () => undefined
    };

    const loaded = loadCharacter(catalog, storage);

    expect(loaded.character).toEqual(emptyCharacter(hash));
    expect(loaded.compatibility).toBe("unreadable");
    expect(loaded.conflicts[0]).toContain("beschädigt");
  });

  it("preserves unknown IDs during import and reports every conflict", () => {
    const character = {
      ...emptyCharacter("b".repeat(64)),
      ancestryId: "ancestry.unknown",
      choices: {
        "choice.unknown": ["feat.unknown"]
      }
    };

    const imported = importCharacter(serializeCharacter(character), catalog);

    expect(imported.character).toMatchObject({
      ancestryId: character.ancestryId,
      choices: character.choices,
      catalogHash: character.catalogHash
    });
    expect(imported.character.migrations).toEqual([
      expect.objectContaining({
        migrationId: "migration.character.catalog-aliases",
        fromCatalogHash: "b".repeat(64),
        toCatalogHash: hash
      })
    ]);
    expect(imported.compatibility).toBe("partially-incompatible");
    expect(imported.conflicts).toEqual(
      expect.arrayContaining([
        "ancestryId: Unbekannte Legacy-ID ancestry.unknown wurde unverändert erhalten.",
        "choices.choice.unknown: Unbekannte Legacy-ID choice.unknown wurde unverändert erhalten.",
        "choices.choice.unknown.0: Unbekannte Legacy-ID feat.unknown wurde unverändert erhalten."
      ])
    );
  });

  it("migrates the catalog hash when every referenced ID remains valid", () => {
    const character = {
      ...emptyCharacter("b".repeat(64)),
      name: "Mira"
    };

    const imported = importCharacter(serializeCharacter(character), catalog);

    expect(imported.character.catalogHash).toBe(hash);
    expect(imported.conflicts).toEqual([]);
    expect(imported.compatibility).toBe("migrated");
    expect(imported.character.migrations).toHaveLength(1);
  });

  it("migrates format 1 deterministically and equips its inventory", () => {
    const imported = importCharacter(
      JSON.stringify({
        formatVersion: 1,
        catalogHash: hash,
        name: "Legacy",
        level: 2,
        choices: {},
        attributeBoosts: [],
        inventoryIds: ["legacy.trait.test"]
      }),
      catalog
    );

    expect(imported.character).toMatchObject({
      formatVersion: 2,
      contentSchemaVersion: 1,
      inventoryIds: ["trait.test"],
      equippedItemIds: ["trait.test"]
    });
    expect(imported.character.migrations[0]?.migrationId).toBe("migration.character.v1-to-v2");
    expect(imported.sourceFormatVersion).toBe(1);
  });
});
