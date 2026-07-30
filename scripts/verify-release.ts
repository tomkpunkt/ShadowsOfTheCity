import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { APP_VERSION, CHARACTER_FORMAT_VERSION, SCHEMA_VERSION } from "@sotc/shared";

import { sha256File, zipEntryNames } from "./release-utils.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archiveName = `shadows-of-the-city-${APP_VERSION}.zip`;
const archivePath = path.join(root, "release", archiveName);
const checksumPath = path.join(root, "release", `shadows-of-the-city-${APP_VERSION}-checksums.txt`);
const checksum = (await readFile(checksumPath, "utf8")).split(/\s+/)[0];
if (checksum !== (await sha256File(archivePath))) {
  throw new Error("Release checksum does not match the ZIP artifact.");
}

const version = JSON.parse(await readFile(path.join(root, "dist", "VERSION.json"), "utf8")) as {
  version: string;
  contentSchemaVersion: number;
  characterFormatVersion: number;
  catalogHash: string;
};
if (
  version.version !== APP_VERSION ||
  version.contentSchemaVersion !== SCHEMA_VERSION ||
  version.characterFormatVersion !== CHARACTER_FORMAT_VERSION
) {
  throw new Error("Release version metadata is inconsistent.");
}

for (const packageFile of [
  "package.json",
  "apps/character-builder/package.json",
  "packages/content-compiler/package.json",
  "packages/rules-engine/package.json",
  "packages/shared/package.json"
]) {
  const packageData = JSON.parse(await readFile(path.join(root, packageFile), "utf8")) as {
    version?: string;
  };
  if (packageData.version !== APP_VERSION) {
    throw new Error(`${packageFile} does not use version ${APP_VERSION}.`);
  }
}

const archive = await readFile(archivePath);
const entries = zipEntryNames(archive);
const required = [
  "index.html",
  "catalog/catalog.json",
  "catalog/catalog.manifest.json",
  "LICENSE.txt",
  "SOURCES.md",
  "THIRD_PARTY_NOTICES.txt",
  "VERSION.json",
  "BUILD.md"
];
for (const suffix of required) {
  if (!entries.some((entry) => entry.endsWith(`/${suffix}`))) {
    throw new Error(`Release ZIP is missing ${suffix}.`);
  }
}
const forbidden = entries.filter((entry) =>
  /(?:^|\/)(?:node_modules|tests?|test-results|screenshots|coverage|\.git|\.vite)(?:\/|$)|\.map$/.test(
    entry
  )
);
if (forbidden.length > 0) {
  throw new Error(`Release ZIP contains forbidden files: ${forbidden.join(", ")}`);
}

const catalog = JSON.parse(
  await readFile(path.join(root, "dist", "catalog", "catalog.json"), "utf8")
) as {
  contentHash?: string;
  entities?: unknown[];
};
if (catalog.contentHash !== version.catalogHash || catalog.entities?.length !== 737) {
  throw new Error("Release catalog metadata is inconsistent.");
}

console.log(`Release verified: ${archiveName} (${String(entries.length)} files).`);
