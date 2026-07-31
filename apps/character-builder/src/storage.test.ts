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
  it("round-trips a versioned build and session state", () => {
    const storage = memoryStorage();
    const empty = emptyCharacter(hash);
    const character = {
      ...empty,
      build: {
        ...empty.build,
        name: "Nyx",
        attributeBoosts: ["dexterity" as const],
        inventoryIds: ["trait.test"],
        options: { "option.test": true }
      },
      session: {
        ...empty.session,
        currentHp: 12,
        itemStates: {
          "trait.test": {
            quantity: 2,
            equipped: true,
            active: false,
            consumed: 0,
            location: "equipped" as const
          }
        }
      }
    };

    saveCharacter(character, storage);
    const loaded = loadCharacter(catalog, storage);

    expect(loaded.document).toEqual(character);
    expect(loaded.compatibility).toBe("compatible");
    expect(loaded.conflicts).toEqual([]);
  });

  it("reports malformed local data instead of silently accepting it", () => {
    const storage: StorageLike = {
      getItem: () => "{broken",
      setItem: () => undefined
    };

    const loaded = loadCharacter(catalog, storage);

    expect(loaded.document).toEqual(emptyCharacter(hash));
    expect(loaded.compatibility).toBe("unreadable");
    expect(loaded.conflicts[0]).toContain("beschädigt");
  });

  it("preserves unknown IDs during import and reports every conflict", () => {
    const empty = emptyCharacter("b".repeat(64));
    const character = {
      ...empty,
      build: {
        ...empty.build,
        ancestryId: "ancestry.unknown",
        choices: {
          "choice.unknown": ["feat.unknown"]
        }
      }
    };

    const imported = importCharacter(serializeCharacter(character), catalog);

    expect(imported.document.build).toMatchObject({
      ancestryId: character.build.ancestryId,
      choices: character.build.choices
    });
    expect(imported.document.catalogHash).toBe(character.catalogHash);
    expect(imported.document.migrations).toEqual([
      expect.objectContaining({
        migrationId: "migration.character.v3-catalog-aliases",
        fromCatalogHash: "b".repeat(64),
        toCatalogHash: hash
      })
    ]);
    expect(imported.compatibility).toBe("partially-incompatible");
    expect(imported.conflicts).toEqual(
      expect.arrayContaining([
        "build.ancestryId: Unbekannte Legacy-ID ancestry.unknown wurde unverändert erhalten.",
        "build.choices.choice.unknown: Unbekannte Legacy-ID choice.unknown wurde unverändert erhalten.",
        "build.choices.choice.unknown.0: Unbekannte Legacy-ID feat.unknown wurde unverändert erhalten."
      ])
    );
  });

  it("migrates the catalog hash when every referenced ID remains valid", () => {
    const empty = emptyCharacter("b".repeat(64));
    const character = {
      ...empty,
      build: {
        ...empty.build,
        name: "Mira"
      }
    };

    const imported = importCharacter(serializeCharacter(character), catalog);

    expect(imported.document.catalogHash).toBe(hash);
    expect(imported.conflicts).toEqual([]);
    expect(imported.compatibility).toBe("migrated");
    expect(imported.document.migrations).toHaveLength(1);
  });

  it("migrates format 1 deterministically and moves equipment into the session", () => {
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

    expect(imported.document).toMatchObject({
      formatVersion: 3,
      contentSchemaVersion: 1,
      build: {
        inventoryIds: ["trait.test"]
      },
      session: {
        itemStates: {
          "trait.test": {
            equipped: true
          }
        }
      }
    });
    expect(imported.document.migrations[0]?.migrationId).toBe("migration.character.v1-to-v3");
    expect(imported.sourceFormatVersion).toBe(1);
  });

  it("migrates format 2 without losing build choices or notes", () => {
    const imported = importCharacter(
      JSON.stringify({
        formatVersion: 2,
        contentSchemaVersion: 1,
        catalogHash: hash,
        createdWithVersion: "0.1.0",
        lastSavedWithVersion: "0.1.0",
        name: "Format Zwei",
        level: 1,
        choices: {},
        attributeBoosts: [],
        inventoryIds: ["trait.test"],
        equippedItemIds: [],
        options: {},
        notes: "Bleibt erhalten",
        migrations: [],
        legacyValues: {}
      }),
      catalog
    );

    expect(imported.document.build).toMatchObject({
      name: "Format Zwei",
      notes: "Bleibt erhalten",
      inventoryIds: ["trait.test"]
    });
    expect(imported.document.session.itemStates["trait.test"]?.equipped).toBe(false);
    expect(imported.sourceFormatVersion).toBe(2);
  });

  it("isolates a malformed session state without discarding a valid build", () => {
    const character = emptyCharacter(hash);
    const imported = importCharacter(
      JSON.stringify({
        ...character,
        build: {
          ...character.build,
          name: "Gerettete Nyx"
        },
        session: {
          version: 1,
          currentHp: "defekt"
        }
      }),
      catalog
    );

    expect(imported.document.build.name).toBe("Gerettete Nyx");
    expect(imported.document.session.currentHp).toBeNull();
    expect(imported.document.legacyValues["unreadableSessionState"]).toEqual({
      version: 1,
      currentHp: "defekt"
    });
    expect(imported.compatibility).toBe("partially-incompatible");
    expect(imported.conflicts).toContain(
      "Der Session State war beschädigt und wurde isoliert zurückgesetzt."
    );
  });
});
