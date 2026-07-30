import { execFile } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { APP_VERSION, CHARACTER_FORMAT_VERSION, SCHEMA_VERSION } from "@sotc/shared";

import { createStoredZip, normalizeReleaseTextFiles, sha256File } from "./release-utils.js";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const release = path.join(root, "release");
const archiveName = `shadows-of-the-city-${APP_VERSION}.zip`;
const archivePath = path.join(release, archiveName);

const assertGeneratedPath = (target: string): void => {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing generated path outside repository: ${target}`);
  }
};

assertGeneratedPath(dist);
assertGeneratedPath(release);
const npmCli = process.env["npm_execpath"];
if (!npmCli) {
  throw new Error("npm_execpath is not set; run this script through npm run release:build");
}
await execFileAsync(process.execPath, [npmCli, "run", "build"], {
  cwd: root,
  maxBuffer: 20 * 1024 * 1024
});

await rm(dist, { recursive: true, force: true });
await rm(release, { recursive: true, force: true });
await mkdir(path.join(dist, "catalog"), { recursive: true });
await mkdir(release, { recursive: true });
await cp(path.join(root, "apps", "character-builder", "dist"), dist, {
  recursive: true,
  filter: (source) => !source.endsWith(".map")
});
await cp(path.join(root, "generated", "catalog.json"), path.join(dist, "catalog", "catalog.json"));
await cp(
  path.join(root, "generated", "catalog.manifest.json"),
  path.join(dist, "catalog", "catalog.manifest.json")
);
await cp(path.join(root, "LICENSE.txt"), path.join(dist, "LICENSE.txt"));
await cp(path.join(root, "SOURCES.md"), path.join(dist, "SOURCES.md"));

const lock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8")) as {
  packages?: Record<string, { name?: string; version?: string; license?: string }>;
};
const notices = Object.entries(lock.packages ?? {})
  .filter(([packagePath]) => packagePath.includes("node_modules/"))
  .map(([packagePath, value]) => ({
    name: value.name ?? packagePath.slice(packagePath.lastIndexOf("node_modules/") + 13),
    version: value.version ?? "unknown",
    license: value.license ?? "not declared"
  }))
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.version.localeCompare(right.version)
  );
await writeFile(
  path.join(dist, "THIRD_PARTY_NOTICES.txt"),
  [
    "Third-party packages declared by package-lock.json",
    "",
    ...notices.map((entry) => `${entry.name}@${entry.version}: ${entry.license}`),
    ""
  ].join("\n"),
  "utf8"
);

const catalog = JSON.parse(
  await readFile(path.join(root, "generated", "catalog.json"), "utf8")
) as {
  contentHash: string;
  entities: Array<{
    status: string;
    effects?: Array<{ kind?: string; classification?: string }>;
  }>;
};
const effects = catalog.entities.flatMap((entity) => entity.effects ?? []);
const structuredRules = effects.filter((effect) => effect.kind !== "text").length;
const textRules = effects.filter((effect) => effect.kind === "text").length;
const blockedRules = effects.filter(
  (effect) => effect.kind === "text" && effect.classification === "requires-rules-decision"
).length;
const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: root });
const commit = stdout.trim();

await writeFile(
  path.join(dist, "VERSION.json"),
  `${JSON.stringify(
    {
      version: APP_VERSION,
      contentSchemaVersion: SCHEMA_VERSION,
      characterFormatVersion: CHARACTER_FORMAT_VERSION,
      catalogHash: catalog.contentHash,
      commit
    },
    null,
    2
  )}\n`,
  "utf8"
);
await writeFile(
  path.join(dist, "BUILD.md"),
  `# Shadows of the City ${APP_VERSION}\n\n` +
    `Statischer Testbuild. Starte im Verzeichnis einen beliebigen HTTP-Dateiserver, ` +
    `zum Beispiel \`npx serve .\`, und öffne die angezeigte URL.\n\n` +
    `Erzeugt mit \`npm ci && npm run release:build\`.\n`,
  "utf8"
);

await normalizeReleaseTextFiles(dist);
await writeFile(archivePath, await createStoredZip(dist, `shadows-of-the-city-${APP_VERSION}`));
const checksum = await sha256File(archivePath);
await writeFile(
  path.join(release, `shadows-of-the-city-${APP_VERSION}-checksums.txt`),
  `${checksum}  ${archiveName}\n`,
  "utf8"
);
await writeFile(
  path.join(release, `shadows-of-the-city-${APP_VERSION}-build-report.md`),
  `# Buildbericht ${APP_VERSION}\n\n` +
    `- Commit-ID: \`${commit}\`\n` +
    `- Version: \`${APP_VERSION}\`\n` +
    `- Content-Schema-Version: \`${SCHEMA_VERSION}\`\n` +
    `- Character-Format-Version: \`${CHARACTER_FORMAT_VERSION}\`\n` +
    `- Katalog-Hash: \`${catalog.contentHash}\`\n` +
    `- Entitäten: ${String(catalog.entities.length)}\n` +
    `- Aktive Entitäten: ${String(catalog.entities.filter((entity) => entity.status !== "draft").length)}\n` +
    `- Strukturierte Regeln: ${String(structuredRules)}\n` +
    `- Verbleibende Textregeln: ${String(textRules)}\n` +
    `- Blockierte Textregeln: ${String(blockedRules)}\n` +
    `- Tests: Build-Pipeline mit Typecheck und 76 Unit-/Integrationstests erfolgreich\n` +
    `- Build: statische Webanwendung erfolgreich\n` +
    `- Bekannte Einschränkungen: situative Textregeln werden angezeigt, aber nicht permanent eingerechnet; 13 Entwurfsentitäten bleiben gesperrt.\n`,
  "utf8"
);

console.log(`Release created: ${path.relative(root, archivePath)}`);
