import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  CatalogSchema,
  ContentEntitySchema,
  SCHEMA_VERSION,
  type Catalog,
  type ContentEntity
} from "@sotc/shared";
import matter from "gray-matter";

import {
  ContentValidationError,
  type ValidationIssue,
  type ValidationReport
} from "./validation.js";

export interface CompileOptions {
  contentDirectory: string;
  outputDirectory?: string;
  writeOutput?: boolean;
}

export interface CompileResult {
  catalog: Catalog;
  manifest: CatalogManifest;
  report: ValidationReport;
}

export interface CatalogManifest {
  schemaVersion: number;
  contentHash: string;
  entityCount: number;
  countsByType: Record<string, number>;
  sourceFiles: string[];
}

interface ParsedEntity {
  entity: ContentEntity;
  file: string;
}

const normalizePath = (value: string): string => value.split(path.sep).join("/");

const stableObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stableObject);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableObject(nested)])
    );
  }
  return value;
};

export const stableStringify = (value: unknown, indentation = 2): string =>
  `${JSON.stringify(stableObject(value), null, indentation)}\n`;

const findMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(absolutePath);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : [];
    })
  );
  return nested.flat().sort((left, right) => left.localeCompare(right));
};

const issuePath = (pathParts: PropertyKey[]): string =>
  pathParts.map((part) => String(part)).join(".");

const parseEntityFile = async (
  file: string,
  contentDirectory: string
): Promise<{ parsed?: ParsedEntity; issues: ValidationIssue[] }> => {
  const relativeFile = normalizePath(path.relative(contentDirectory, file));
  let source: string;
  try {
    source = await readFile(file, "utf8");
  } catch (error) {
    return {
      issues: [
        {
          code: "CONTENT_READ_FAILED",
          severity: "error",
          file: relativeFile,
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    };
  }

  let parsedMatter: matter.GrayMatterFile<string>;
  try {
    parsedMatter = matter(source);
  } catch (error) {
    return {
      issues: [
        {
          code: "INVALID_FRONTMATTER",
          severity: "error",
          file: relativeFile,
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    };
  }

  if (Object.keys(parsedMatter.data).length === 0) {
    return {
      issues: [
        {
          code: "MISSING_FRONTMATTER",
          severity: "error",
          file: relativeFile,
          message: "Content file has no frontmatter"
        }
      ]
    };
  }

  const validation = ContentEntitySchema.safeParse({
    ...parsedMatter.data,
    description: parsedMatter.content.trim()
  });
  if (!validation.success) {
    return {
      issues: validation.error.issues.map((schemaIssue) => ({
        code: "SCHEMA_VALIDATION_FAILED",
        severity: "error" as const,
        file: relativeFile,
        entityId: typeof parsedMatter.data["id"] === "string" ? parsedMatter.data["id"] : undefined,
        path: issuePath(schemaIssue.path),
        message: schemaIssue.message
      }))
    };
  }

  return {
    parsed: {
      entity: validation.data,
      file: relativeFile
    },
    issues: []
  };
};

const addPotentialReferences = (value: unknown, references: Set<string>, key?: string): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      addPotentialReferences(item, references, key);
    }
    return;
  }
  if (value === null || typeof value !== "object") {
    if (
      typeof value === "string" &&
      key !== undefined &&
      (key.endsWith("Id") ||
        key.endsWith("Ids") ||
        key === "traits" ||
        key === "references" ||
        key === "excludes")
    ) {
      references.add(value);
    }
    return;
  }
  for (const [nestedKey, nestedValue] of Object.entries(value)) {
    if (nestedKey === "id" || nestedKey === "source") {
      continue;
    }
    addPotentialReferences(nestedValue, references, nestedKey);
  }
};

export const collectReferences = (entity: ContentEntity): string[] => {
  const references = new Set<string>();
  addPotentialReferences(entity, references);
  references.delete(entity.id);
  return [...references].sort((left, right) => left.localeCompare(right));
};

const entityMatchesChoice = (
  entity: ContentEntity,
  choiceEntity: Extract<ContentEntity, { type: "choice" }>
): boolean => {
  const { filter } = choiceEntity.choice;
  if (filter.entityTypes !== undefined && !filter.entityTypes.includes(entity.type)) {
    return false;
  }
  if (
    filter.traitsAll !== undefined &&
    !filter.traitsAll.every((trait) => entity.traits.includes(trait))
  ) {
    return false;
  }
  if (
    filter.traitsAny !== undefined &&
    !filter.traitsAny.some((trait) => entity.traits.includes(trait))
  ) {
    return false;
  }
  if ("level" in entity && typeof entity.level === "number") {
    if (filter.minLevel !== undefined && entity.level < filter.minLevel) {
      return false;
    }
    if (filter.maxLevel !== undefined && entity.level > filter.maxLevel) {
      return false;
    }
  } else if (filter.minLevel !== undefined || filter.maxLevel !== undefined) {
    return false;
  }
  if (filter.classId !== undefined) {
    if (!("classId" in entity) || entity.classId !== filter.classId) {
      return false;
    }
  }
  if (filter.ancestryId !== undefined) {
    if (!("ancestryId" in entity) || entity.ancestryId !== filter.ancestryId) {
      return false;
    }
  }
  if (filter.category !== undefined) {
    if (!("category" in entity) || entity.category !== filter.category) {
      return false;
    }
  }
  if (
    "traditions" in entity &&
    filter.traditions !== undefined &&
    !filter.traditions.some((tradition) => entity.traditions.includes(tradition))
  ) {
    return false;
  }
  return entity.id !== choiceEntity.id && !choiceEntity.choice.excludes.includes(entity.id);
};

const collectUnlockedChoices = (value: unknown, unlocked: string[]): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectUnlockedChoices(item, unlocked);
    }
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }
  const record = value as Record<string, unknown>;
  if (record["kind"] === "unlock-choice" && typeof record["choiceId"] === "string") {
    unlocked.push(record["choiceId"]);
  }
  for (const nestedValue of Object.values(record)) {
    collectUnlockedChoices(nestedValue, unlocked);
  }
};

const findChoiceCycles = (entities: ContentEntity[]): string[][] => {
  const graph = new Map<string, string[]>();
  for (const entity of entities) {
    if (entity.type !== "choice") {
      continue;
    }
    const unlocked: string[] = [];
    collectUnlockedChoices(entity.choice.effects, unlocked);
    graph.set(entity.id, unlocked);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const active = new Set<string>();
  const trail: string[] = [];

  const visit = (id: string): void => {
    if (active.has(id)) {
      const start = trail.indexOf(id);
      cycles.push([...trail.slice(start), id]);
      return;
    }
    if (visited.has(id)) {
      return;
    }
    visited.add(id);
    active.add(id);
    trail.push(id);
    for (const dependency of graph.get(id) ?? []) {
      if (graph.has(dependency)) {
        visit(dependency);
      }
    }
    trail.pop();
    active.delete(id);
  };

  for (const id of graph.keys()) {
    visit(id);
  }
  return cycles;
};

const validateEntities = (parsed: ParsedEntity[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const byId = new Map<string, ParsedEntity>();

  for (const candidate of parsed) {
    const previous = byId.get(candidate.entity.id);
    if (previous !== undefined) {
      issues.push({
        code: "DUPLICATE_ID",
        severity: "error",
        file: candidate.file,
        entityId: candidate.entity.id,
        message: `ID is also defined in ${previous.file}`
      });
    } else {
      byId.set(candidate.entity.id, candidate);
    }
  }

  for (const candidate of parsed) {
    for (const reference of collectReferences(candidate.entity)) {
      if (!byId.has(reference)) {
        issues.push({
          code: "UNRESOLVED_REFERENCE",
          severity: "error",
          file: candidate.file,
          entityId: candidate.entity.id,
          message: `Reference does not resolve: ${reference}`
        });
      }
    }
    if (candidate.entity.type === "choice" && candidate.entity.choice.min > 0) {
      const optionCount = parsed.filter(({ entity }) =>
        entityMatchesChoice(entity, candidate.entity as Extract<ContentEntity, { type: "choice" }>)
      ).length;
      if (optionCount < candidate.entity.choice.min) {
        issues.push({
          code: "CHOICE_WITHOUT_OPTIONS",
          severity: "error",
          file: candidate.file,
          entityId: candidate.entity.id,
          message: `Choice requires ${String(candidate.entity.choice.min)} option(s), but only ${String(
            optionCount
          )} match`
        });
      }
    }
  }

  for (const cycle of findChoiceCycles(parsed.map(({ entity }) => entity))) {
    issues.push({
      code: "CHOICE_DEPENDENCY_CYCLE",
      severity: "error",
      entityId: cycle[0],
      message: `Choice unlock cycle: ${cycle.join(" -> ")}`
    });
  }
  return issues;
};

const countTypes = (entities: ContentEntity[]): Record<string, number> =>
  Object.fromEntries(
    [...new Set(entities.map((entity) => entity.type))]
      .sort((left, right) => left.localeCompare(right))
      .map((type) => [type, entities.filter((entity) => entity.type === type).length])
  );

export const compileContent = async (options: CompileOptions): Promise<CompileResult> => {
  const files = await findMarkdownFiles(options.contentDirectory);
  const parseResults = await Promise.all(
    files.map((file) => parseEntityFile(file, options.contentDirectory))
  );
  const parsed = parseResults.flatMap((result) =>
    result.parsed === undefined ? [] : [result.parsed]
  );
  const issues = [
    ...parseResults.flatMap((result) => result.issues),
    ...validateEntities(parsed)
  ].sort((left, right) => {
    const fileComparison = (left.file ?? "").localeCompare(right.file ?? "");
    return fileComparison !== 0 ? fileComparison : left.message.localeCompare(right.message);
  });

  const entities = parsed
    .map(({ entity }) => entity)
    .sort((left, right) => left.id.localeCompare(right.id));
  const countsByType = countTypes(entities);
  const report: ValidationReport = {
    valid: !issues.some((issue) => issue.severity === "error"),
    filesScanned: files.length,
    entitiesParsed: entities.length,
    issues,
    countsByType
  };

  const hashInput = stableStringify({ schemaVersion: SCHEMA_VERSION, entities }, 0);
  const contentHash = createHash("sha256").update(hashInput).digest("hex");
  const catalog = CatalogSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    contentHash,
    entities
  });
  const manifest: CatalogManifest = {
    schemaVersion: SCHEMA_VERSION,
    contentHash,
    entityCount: entities.length,
    countsByType,
    sourceFiles: parsed.map(({ file }) => file).sort((left, right) => left.localeCompare(right))
  };

  if (options.writeOutput === true && options.outputDirectory !== undefined) {
    await mkdir(options.outputDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        path.join(options.outputDirectory, "catalog.json"),
        stableStringify(catalog),
        "utf8"
      ),
      writeFile(
        path.join(options.outputDirectory, "catalog.manifest.json"),
        stableStringify(manifest),
        "utf8"
      ),
      writeFile(
        path.join(options.outputDirectory, "content-validation-report.json"),
        stableStringify(report),
        "utf8"
      )
    ]);
  }

  if (!report.valid) {
    throw new ContentValidationError(report);
  }
  return { catalog, manifest, report };
};
