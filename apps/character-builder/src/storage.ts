import {
  APP_VERSION,
  CHARACTER_FORMAT_VERSION,
  CharacterBuildSchema,
  CharacterDocumentSchema,
  CharacterSessionStateSchema,
  SCHEMA_VERSION,
  type Catalog,
  type CharacterBuild,
  type CharacterDocument,
  type CharacterSessionState
} from "@sotc/shared";
import { z } from "zod";

import type { AttributeId } from "@sotc/rules-engine";
import { emptySessionState } from "@sotc/rules-engine";

const storageKey = "shadows-of-the-city.characters.v3";
const legacyStorageKeys = [
  "shadows-of-the-city.characters.v2",
  "shadows-of-the-city.characters.v1",
  "shadows-of-the-city.character"
];

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
    migrations: z.array(z.unknown()).optional(),
    legacyValues: z.record(z.string(), z.unknown()).optional()
  })
  .passthrough();

const FormatThreeEnvelopeSchema = z
  .object({
    formatVersion: z.literal(3),
    contentSchemaVersion: z.literal(SCHEMA_VERSION),
    catalogHash: z.string().regex(/^[a-f0-9]{64}$/),
    createdWithVersion: z.string(),
    lastSavedWithVersion: z.string(),
    build: z.unknown(),
    session: z.unknown(),
    migrations: z.array(z.unknown()).default([]),
    legacyValues: z.record(z.string(), z.unknown()).default({})
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
  document: CharacterDocument;
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
  toFormatVersion: CHARACTER_FORMAT_VERSION,
  ...(fromCatalogHash === undefined ? {} : { fromCatalogHash }),
  toCatalogHash: catalog.contentHash,
  conflicts,
  preservedValues
});

const emptyBuild = (): CharacterBuild =>
  CharacterBuildSchema.parse({
    name: "Neuer Charakter",
    level: 1,
    choices: {},
    attributeBoosts: [],
    inventoryIds: [],
    options: {}
  });

export const emptyCharacter = (catalogHash: string): CharacterDocument =>
  CharacterDocumentSchema.parse({
    formatVersion: CHARACTER_FORMAT_VERSION,
    contentSchemaVersion: SCHEMA_VERSION,
    catalogHash,
    createdWithVersion: APP_VERSION,
    lastSavedWithVersion: APP_VERSION,
    build: emptyBuild(),
    session: emptySessionState(),
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

const resolverFor = (catalog: Catalog, conflicts: string[]) => {
  const knownIds = new Set(catalog.entities.map((entity) => entity.id));
  return (value: string | undefined, path: string): string | undefined => {
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
};

const migrateBuild = (
  input: CharacterBuild,
  catalog: Catalog,
  conflicts: string[]
): CharacterBuild => {
  const resolve = resolverFor(catalog, conflicts);
  const choices = Object.fromEntries(
    Object.entries(input.choices).map(([choiceId, selectedIds]) => [
      resolve(choiceId, `build.choices.${choiceId}`) ?? choiceId,
      selectedIds.map(
        (id, index) => resolve(id, `build.choices.${choiceId}.${String(index)}`) ?? id
      )
    ])
  );
  return CharacterBuildSchema.parse({
    ...input,
    ...(input.ancestryId === undefined
      ? {}
      : { ancestryId: resolve(input.ancestryId, "build.ancestryId") }),
    ...(input.heritageId === undefined
      ? {}
      : { heritageId: resolve(input.heritageId, "build.heritageId") }),
    ...(input.backgroundId === undefined
      ? {}
      : { backgroundId: resolve(input.backgroundId, "build.backgroundId") }),
    ...(input.classId === undefined ? {} : { classId: resolve(input.classId, "build.classId") }),
    choices,
    inventoryIds: input.inventoryIds.map(
      (id, index) => resolve(id, `build.inventoryIds.${String(index)}`) ?? id
    )
  });
};

const migrateSession = (
  input: CharacterSessionState,
  catalog: Catalog,
  conflicts: string[]
): CharacterSessionState => {
  const resolve = resolverFor(catalog, conflicts);
  return CharacterSessionStateSchema.parse({
    ...input,
    conditions: input.conditions.map((condition, index) => ({
      ...condition,
      ...(condition.conditionId === undefined
        ? {}
        : {
            conditionId:
              resolve(condition.conditionId, `session.conditions.${String(index)}.conditionId`) ??
              condition.conditionId
          })
    })),
    resources: Object.fromEntries(
      Object.entries(input.resources).map(([id, state]) => [
        resolve(id, `session.resources.${id}`) ?? id,
        state
      ])
    ),
    actionUses: Object.fromEntries(
      Object.entries(input.actionUses).map(([id, used]) => [
        resolve(id, `session.actionUses.${id}`) ?? id,
        used
      ])
    ),
    itemStates: Object.fromEntries(
      Object.entries(input.itemStates).map(([id, state]) => [
        resolve(id, `session.itemStates.${id}`) ?? id,
        state
      ])
    ),
    manualModifiers: input.manualModifiers.map((modifier, index) => ({
      ...modifier,
      ...(modifier.selector === undefined
        ? {}
        : {
            selector:
              resolve(modifier.selector, `session.manualModifiers.${String(index)}.selector`) ??
              modifier.selector
          })
    }))
  });
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

const normalizeCurrentDocument = (
  input: CharacterDocument,
  catalog: Catalog,
  additionalConflicts: string[] = [],
  preservedValues: Record<string, unknown> = {}
): CharacterReadResult => {
  const conflicts = [...additionalConflicts];
  const build = migrateBuild(input.build, catalog, conflicts);
  const session = migrateSession(input.session, catalog, conflicts);
  const hashChanged = input.catalogHash !== catalog.contentHash;
  const changed = hashChanged || conflicts.length > 0;
  const document = CharacterDocumentSchema.parse({
    ...input,
    build,
    session,
    catalogHash: conflicts.length === 0 ? catalog.contentHash : input.catalogHash,
    migrations: changed
      ? [
          ...input.migrations,
          createMigration(
            "migration.character.v3-catalog-aliases",
            3,
            catalog,
            conflicts,
            preservedValues,
            input.catalogHash
          )
        ]
      : input.migrations,
    legacyValues: {
      ...input.legacyValues,
      ...preservedValues
    }
  });
  return {
    document,
    compatibility: compatibilityFor(input.catalogHash, catalog.contentHash, conflicts, changed),
    conflicts,
    sourceFormatVersion: 3
  };
};

const migrateLegacyCharacter = (
  input: z.infer<typeof LegacyCharacterSchema>,
  catalog: Catalog
): CharacterReadResult => {
  const sourceFormatVersion = input.formatVersion ?? 0;
  const conflicts: string[] = [];
  const resolve = resolverFor(catalog, conflicts);
  const inventoryIds = input.inventoryIds.map(
    (id, index) => resolve(id, `build.inventoryIds.${String(index)}`) ?? id
  );
  const equippedItemIds = (input.equippedItemIds ?? input.inventoryIds).map(
    (id, index) => resolve(id, `session.itemStates.${String(index)}`) ?? id
  );
  for (const id of equippedItemIds) {
    if (!inventoryIds.includes(id)) {
      inventoryIds.push(id);
      conflicts.push(`session.itemStates: ${id} wurde dem Inventar hinzugefügt.`);
    }
  }
  const build = CharacterBuildSchema.parse({
    name: input.name,
    level: input.level,
    ...(input.ancestryId === undefined
      ? {}
      : { ancestryId: resolve(input.ancestryId, "build.ancestryId") }),
    ...(input.heritageId === undefined
      ? {}
      : { heritageId: resolve(input.heritageId, "build.heritageId") }),
    ...(input.backgroundId === undefined
      ? {}
      : { backgroundId: resolve(input.backgroundId, "build.backgroundId") }),
    ...(input.classId === undefined ? {} : { classId: resolve(input.classId, "build.classId") }),
    choices: Object.fromEntries(
      Object.entries(input.choices).map(([choiceId, selectedIds]) => [
        resolve(choiceId, `build.choices.${choiceId}`) ?? choiceId,
        selectedIds.map(
          (id, index) => resolve(id, `build.choices.${choiceId}.${String(index)}`) ?? id
        )
      ])
    ),
    attributeBoosts: input.attributeBoosts,
    inventoryIds,
    options: input.options ?? {},
    ...(input.notes === undefined ? {} : { notes: input.notes })
  });
  const session = CharacterSessionStateSchema.parse({
    ...emptySessionState(),
    itemStates: Object.fromEntries(
      inventoryIds.map((id) => [
        id,
        {
          quantity: 1,
          equipped: equippedItemIds.includes(id),
          active: false,
          consumed: 0,
          location: equippedItemIds.includes(id) ? "equipped" : "carried"
        }
      ])
    )
  });
  const knownKeys = new Set(Object.keys(LegacyCharacterSchema.shape));
  const preservedValues = {
    ...Object.fromEntries(Object.entries(input).filter(([key]) => !knownKeys.has(key))),
    ...(input.legacyValues ?? {})
  };
  if (input.migrations !== undefined) {
    preservedValues["legacyMigrations"] = input.migrations;
  }
  const document = CharacterDocumentSchema.parse({
    formatVersion: 3,
    contentSchemaVersion: SCHEMA_VERSION,
    catalogHash:
      conflicts.length === 0 ? catalog.contentHash : (input.catalogHash ?? catalog.contentHash),
    createdWithVersion: APP_VERSION,
    lastSavedWithVersion: APP_VERSION,
    build,
    session,
    migrations: [
      createMigration(
        `migration.character.v${String(sourceFormatVersion)}-to-v3`,
        sourceFormatVersion,
        catalog,
        conflicts,
        preservedValues,
        input.catalogHash
      )
    ],
    legacyValues: preservedValues
  });
  return {
    document,
    compatibility: compatibilityFor(input.catalogHash, catalog.contentHash, conflicts, true),
    conflicts,
    sourceFormatVersion
  };
};

export const migrateCharacter = (input: unknown, catalog: Catalog): CharacterReadResult => {
  const current = CharacterDocumentSchema.safeParse(input);
  if (current.success) {
    return normalizeCurrentDocument(current.data, catalog);
  }

  const envelope = FormatThreeEnvelopeSchema.safeParse(input);
  if (envelope.success) {
    const build = CharacterBuildSchema.parse(envelope.data.build);
    const parsedSession = CharacterSessionStateSchema.safeParse(envelope.data.session);
    const sessionConflict = parsedSession.success
      ? []
      : ["Der Session State war beschädigt und wurde isoliert zurückgesetzt."];
    const preservedValues = parsedSession.success
      ? {}
      : { unreadableSessionState: envelope.data.session };
    const document = CharacterDocumentSchema.parse({
      ...envelope.data,
      build,
      session: parsedSession.success ? parsedSession.data : emptySessionState(),
      migrations: [],
      legacyValues: envelope.data.legacyValues
    });
    return normalizeCurrentDocument(document, catalog, sessionConflict, preservedValues);
  }

  return migrateLegacyCharacter(LegacyCharacterSchema.parse(input), catalog);
};

export const saveCharacter = (
  document: CharacterDocument,
  storage: StorageLike = window.localStorage
): void => {
  const validated = CharacterDocumentSchema.parse({
    ...document,
    lastSavedWithVersion: APP_VERSION
  });
  storage.setItem(
    storageKey,
    JSON.stringify({
      formatVersion: CHARACTER_FORMAT_VERSION,
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
      document: emptyCharacter(catalog.contentHash),
      compatibility: "compatible",
      conflicts: [],
      sourceFormatVersion: 3
    };
  }
  const candidate = candidates[0]!;
  try {
    const parsed = JSON.parse(candidate.value) as unknown;
    const collection = StoredCollectionSchema.safeParse(parsed);
    return migrateCharacter(collection.success ? collection.data.active : parsed, catalog);
  } catch (error) {
    return {
      document: emptyCharacter(catalog.contentHash),
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

export const serializeCharacter = (document: CharacterDocument): string =>
  `${JSON.stringify(CharacterDocumentSchema.parse(document), null, 2)}\n`;

export const importCharacter = (source: string, catalog: Catalog): ImportResult =>
  migrateCharacter(JSON.parse(source) as unknown, catalog);

export const downloadCharacter = (characterDocument: CharacterDocument): void => {
  const blob = new Blob([serializeCharacter(characterDocument)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${
    characterDocument.build.name
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
