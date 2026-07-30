import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compileContent } from "./compiler.js";

interface MigrationManifest {
  sourceCount: number;
  generatedEntityCount: number;
  expectedMinimums: Record<string, number>;
  actualCounts: Record<string, number>;
  sources: Array<{
    path: string;
    entityIds: string[];
    warnings: string[];
    manualFields: string[];
  }>;
}

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDirectory, "../../..");
const contentDirectory = path.join(repositoryRoot, "content");
const manifestPath = path.join(contentDirectory, "migration-manifest.json");

const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as MigrationManifest;
const result = await compileContent({ contentDirectory, writeOutput: false });
const failures: string[] = [];

if (manifest.sourceCount !== 64 || manifest.sources.length !== 64) {
  failures.push(
    `Expected 64 indexed legacy sources, found sourceCount=${String(
      manifest.sourceCount
    )}, sources=${String(manifest.sources.length)}`
  );
}

if (manifest.generatedEntityCount !== result.catalog.entities.length) {
  failures.push(
    `Manifest says ${String(manifest.generatedEntityCount)} entities, compiler found ${String(
      result.catalog.entities.length
    )}`
  );
}

for (const [type, minimum] of Object.entries(manifest.expectedMinimums)) {
  const actual = result.report.countsByType[type] ?? 0;
  if (actual < minimum) {
    failures.push(`${type}: expected at least ${String(minimum)}, found ${String(actual)}`);
  }
  if (manifest.actualCounts[type] !== actual) {
    failures.push(
      `${type}: migration manifest records ${String(
        manifest.actualCounts[type]
      )}, compiler found ${String(actual)}`
    );
  }
}

const duplicatedSourcePaths = manifest.sources
  .map((source) => source.path)
  .filter((sourcePath, index, values) => values.indexOf(sourcePath) !== index);
if (duplicatedSourcePaths.length > 0) {
  failures.push(`Duplicate source entries: ${duplicatedSourcePaths.join(", ")}`);
}

const unaccountedMechanicalSources = manifest.sources.filter(
  (source) =>
    /^(classes|races|feats|spells|gear|bestiary)\//.test(source.path) &&
    source.entityIds.length === 0 &&
    !/(TOC|template)\.md$/.test(source.path)
);
if (unaccountedMechanicalSources.length > 0) {
  failures.push(
    `Mechanical sources without migrated entities: ${unaccountedMechanicalSources
      .map((source) => source.path)
      .join(", ")}`
  );
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`MIGRATION_INCOMPLETE: ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Migration complete: ${String(manifest.sources.length)} sources, ${String(
      result.catalog.entities.length
    )} validated entities.`
  );
}
