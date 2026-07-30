import {
  APP_VERSION,
  CharacterDocumentSchema,
  SCHEMA_VERSION,
  type Catalog,
  type CharacterDocument
} from "@sotc/shared";
import { z } from "zod";

import type { AttributeId, CharacterState } from "@sotc/rules-engine";

const storageKey = "shadows-of-the-city.characters.v2";
const legacyStorageKeys = ["shadows-of-the-city.characters.v1", "shadows-of-the-city.character"];

const AttributeSchema = z.enum([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
]);

const LegacyCharacterSchema = z
  .object({
    formatVersion: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
    catalogHash: z.string().optional(),
    name: z.string().default("Importierter Charakter"),
    level: z.number().int().min(1).max(20).default(1),
    ancestryId: z.string().optional(),
    heritageId: z.string().optional(),
    backgroundId: z.string().optional(),
    classId: z.string().optional(),
    choices: z.record(z.string(), z.array(z.string())).default({}),
    attributeBoosts: z.array(AttributeSchema).default([]),
    inventoryIds: z.array(z.string()).default([]),
    equippedItemIds: z.array(z.string()).optional(),
    options: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    notes: z.string().optional(),
    migrations: z.array(z.unknown()).optional()
  })
  .passthrough();

const StoredCollectionSchema = z
  .object({
    formatVersion: z.number().int(),
    active: z.unknown(),
    savedAt: z.string().optional()
  })
  .passthrough();

export type CatalogCompatibility =
  "compatible" | "migrated" | "partially-incompatible" | "unreadable";

export interface CharacterReadResult {
  character: CharacterState;
  compatibility: CatalogCompatibility;
  conflicts: string[];
  sourceFormatVersion: number | "unknown";
}

export type ImportResult = CharacterReadResult;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const createMigration = (
  migrationId: string,
  fromFormatVersion: number,
  catalog: Catalog,
  conflicts: string[],
  preservedValues: Record<string, unknown>,
  fromCatalogHash?: string
): CharacterDocument["migrations"][number] => ({
  migrationId,
  fromFormatVersion,
  toFormatVersion: 2,
  ...(fromCatalogHash === undefined ? {} : { fromCatalogHash }),
  toCatalogHash: catalog.contentHash,
  conflicts,
  preservedValues
});

export const emptyCharacter = (catalogHash: string): CharacterState => ({
  formatVersion: 2,
  contentSchemaVersion: SCHEMA_VERSION,
  catalogHash,
  createdWithVersion: APP_VERSION,
  lastSavedWithVersion: APP_VERSION,
  name: "Neuer Charakter",
  level: 1,
  choices: {},
  attributeBoosts: [],
  inventoryIds: [],
  equippedItemIds: [],
  options: {},
  migrations: [],
  legacyValues: {}
});

const resolveAlias = (id: string, catalog: Catalog): string => {
  const visited = new Set<string>();
  let current = id;
  while (catalog.aliases[current] !== undefined) {
    if (visited.has(current)) {
      return id;
    }
    visited.add(current);
    current = catalog.aliases[current] as string;
  }
  return current;
};

const migrateIds = (
  input: z.infer<typeof LegacyCharacterSchema>,
  catalog: Catalog
): { values: Omit<CharacterDocument, "migrations" | "legacyValues">; conflicts: string[] } => {
  const knownIds = new Set(catalog.entities.map((entity) => entity.id));
  const conflicts: string[] = [];
  const resolve = (value: string | undefined, path: string): string | undefined => {
    if (value === undefined) {
      return undefined;
    }
    const resolved = resolveAlias(value, catalog);
    if (!knownIds.has(resolved)) {
      conflicts.push(`${path}: Unbekannte Legacy-ID ${value} wurde unverändert erhalten.`);
      return value;
    }
    return resolved;
  };
  const choices = Object.fromEntries(
    Object.entries(input.choices).map(([choiceId, selectedIds]) => [
      resolve(choiceId, `choices.${choiceId}`) ?? choiceId,
      selectedIds.map((id, index) => resolve(id, `choices.${choiceId}.${String(index)}`) ?? id)
    ])
  );
  const inventoryIds = input.inventoryIds.map(
    (id, index) => resolve(id, `inventoryIds.${String(index)}`) ?? id
  );
  const equippedItemIds = (input.equippedItemIds ?? input.inventoryIds).map(
    (id, index) => resolve(id, `equippedItemIds.${String(index)}`) ?? id
  );
  for (const id of equippedItemIds) {
    if (!inventoryIds.includes(id)) {
      inventoryIds.push(id);
      conflicts.push(`equippedItemIds: ${id} wurde dem Inventar hinzugefügt.`);
    }
  }
  const ancestryId = resolve(input.ancestryId, "ancestryId");
  const heritageId = resolve(input.heritageId, "heritageId");
  const backgroundId = resolve(input.backgroundId, "backgroundId");
  const classId = resolve(input.classId, "classId");
  return {
    values: {
      formatVersion: 2,
      contentSchemaVersion: SCHEMA_VERSION,
      catalogHash:
        conflicts.length === 0 ? catalog.contentHash : (input.catalogHash ?? catalog.contentHash),
      createdWithVersion: APP_VERSION,
      lastSavedWithVersion: APP_VERSION,
      name: input.name,
      level: input.level,
      ...(ancestryId === undefined ? {} : { ancestryId }),
      ...(heritageId === undefined ? {} : { heritageId }),
      ...(backgroundId === undefined ? {} : { backgroundId }),
      ...(classId === undefined ? {} : { classId }),
      choices,
      attributeBoosts: input.attributeBoosts,
      inventoryIds,
      equippedItemIds,
      options: input.options ?? {},
      ...(input.notes === undefined ? {} : { notes: input.notes })
    },
    conflicts
  };
};

const compatibilityFor = (
  sourceHash: string | undefined,
  catalogHash: string,
  conflicts: string[],
  migrated: boolean
): CatalogCompatibility => {
  if (conflicts.length > 0) {
    return "partially-incompatible";
  }
  if (migrated || (sourceHash !== undefined && sourceHash !== catalogHash)) {
    return "migrated";
  }
  return "compatible";
};

export const migrateCharacter = (input: unknown, catalog: Catalog): CharacterReadResult => {
  const current = CharacterDocumentSchema.safeParse(input);
  if (current.success) {
    const legacy = LegacyCharacterSchema.parse(current.data);
    const migrated = migrateIds(legacy, catalog);
    const hashChanged = current.data.catalogHash !== catalog.contentHash;
    const character = CharacterDocumentSchema.parse({
      ...current.data,
      ...migrated.values,
      createdWithVersion: current.data.createdWithVersion,
      equippedItemIds: migrated.values.equippedItemIds,
      options: current.data.options,
      catalogHash: migrated.conflicts.length === 0 ? catalog.contentHash : current.data.catalogHash,
      migrations:
        hashChanged || migrated.conflicts.length > 0
          ? [
              ...current.data.migrations,
              createMigration(
                "migration.character.catalog-aliases",
                2,
                catalog,
                migrated.conflicts,
                {},
                current.data.catalogHash
              )
            ]
          : current.data.migrations,
      legacyValues: current.data.legacyValues
    });
    return {
      character,
      compatibility: compatibilityFor(
        current.data.catalogHash,
        catalog.contentHash,
        migrated.conflicts,
        hashChanged
      ),
      conflicts: migrated.conflicts,
      sourceFormatVersion: 2
    };
  }

  const legacy = LegacyCharacterSchema.parse(input);
  const sourceFormatVersion = legacy.formatVersion ?? 0;
  const migrated = migrateIds(legacy, catalog);
  const knownKeys = new Set(Object.keys(LegacyCharacterSchema.shape));
  const preservedValues = Object.fromEntries(
    Object.entries(legacy).filter(([key]) => !knownKeys.has(key))
  );
  if (legacy.migrations !== undefined) {
    preservedValues["legacyMigrations"] = legacy.migrations;
  }
  const character = CharacterDocumentSchema.parse({
    ...migrated.values,
    migrations: [
      createMigration(
        sourceFormatVersion === 0 ? "migration.character.v0-to-v2" : "migration.character.v1-to-v2",
        sourceFormatVersion,
        catalog,
        migrated.conflicts,
        preservedValues,
        legacy.catalogHash
      )
    ],
    legacyValues: preservedValues
  });
  return {
    character,
    compatibility: compatibilityFor(
      legacy.catalogHash,
      catalog.contentHash,
      migrated.conflicts,
      true
    ),
    conflicts: migrated.conflicts,
    sourceFormatVersion
  };
};

export const saveCharacter = (
  character: CharacterState,
  storage: StorageLike = window.localStorage
): void => {
  const validated = CharacterDocumentSchema.parse({
    ...character,
    lastSavedWithVersion: APP_VERSION
  });
  storage.setItem(
    storageKey,
    JSON.stringify({
      formatVersion: 2,
      active: validated
    })
  );
};

export const loadCharacter = (
  catalog: Catalog,
  storage: StorageLike = window.localStorage
): CharacterReadResult => {
  const candidates = [storageKey, ...legacyStorageKeys]
    .map((key) => ({ key, value: storage.getItem(key) }))
    .filter((candidate): candidate is { key: string; value: string } => candidate.value !== null);
  if (candidates.length === 0) {
    return {
      character: emptyCharacter(catalog.contentHash),
      compatibility: "compatible",
      conflicts: [],
      sourceFormatVersion: 2
    };
  }
  const candidate = candidates[0]!;
  try {
    const parsed = JSON.parse(candidate.value) as unknown;
    const collection = StoredCollectionSchema.safeParse(parsed);
    return migrateCharacter(collection.success ? collection.data.active : parsed, catalog);
  } catch (error) {
    return {
      character: emptyCharacter(catalog.contentHash),
      compatibility: "unreadable",
      conflicts: [
        error instanceof Error
          ? `Gespeicherter Charakter ist beschädigt: ${error.message}`
          : "Gespeicherter Charakter ist beschädigt."
      ],
      sourceFormatVersion: "unknown"
    };
  }
};

export const serializeCharacter = (character: CharacterState): string =>
  `${JSON.stringify(CharacterDocumentSchema.parse(character), null, 2)}\n`;

export const importCharacter = (source: string, catalog: Catalog): ImportResult =>
  migrateCharacter(JSON.parse(source) as unknown, catalog);

export const downloadCharacter = (character: CharacterState): void => {
  const blob = new Blob([serializeCharacter(character)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${
    character.name
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase() || "character"
  }.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const toggleAttributeBoost = (
  boosts: AttributeId[],
  attribute: AttributeId,
  maximum: number
): AttributeId[] => {
  const index = boosts.indexOf(attribute);
  if (index >= 0) {
    return boosts.filter((_, candidateIndex) => candidateIndex !== index);
  }
  return boosts.length >= maximum ? boosts : [...boosts, attribute];
};
