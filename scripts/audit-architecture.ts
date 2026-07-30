import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const sourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return sourceFiles(absolute);
      }
      return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.includes(".test.")
        ? [absolute]
        : [];
    })
  );
  return nested.flat().sort((left, right) => left.localeCompare(right));
};

const importSpecifiers = (source: string): string[] =>
  [...source.matchAll(/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);

const violations: string[] = [];
const inspectLayer = async (
  relativeDirectory: string,
  forbidden: Array<{ label: string; matches: (specifier: string, source: string) => boolean }>
): Promise<void> => {
  for (const file of await sourceFiles(path.join(root, relativeDirectory))) {
    const source = await readFile(file, "utf8");
    for (const specifier of importSpecifiers(source)) {
      for (const rule of forbidden) {
        if (rule.matches(specifier, source)) {
          violations.push(
            `${path.relative(root, file).split(path.sep).join("/")}: ${rule.label} (${specifier})`
          );
        }
      }
    }
  }
};

await inspectLayer("packages/shared/src", [
  {
    label: "shared darf keine höhere Schicht importieren",
    matches: (specifier) =>
      specifier.includes("rules-engine") ||
      specifier.includes("content-compiler") ||
      specifier.includes("character-builder") ||
      specifier === "react"
  }
]);

await inspectLayer("packages/content-compiler/src", [
  {
    label: "Compiler darf keine Engine oder UI importieren",
    matches: (specifier) =>
      specifier.includes("rules-engine") ||
      specifier.includes("character-builder") ||
      specifier === "react"
  }
]);

await inspectLayer("packages/rules-engine/src", [
  {
    label: "Rules Engine darf keine Browser- oder UI-Abhängigkeit importieren",
    matches: (specifier) =>
      specifier === "react" ||
      specifier.startsWith("react-") ||
      specifier.includes("character-builder") ||
      specifier.includes("content-compiler")
  }
]);

await inspectLayer("apps/character-builder/src", [
  {
    label: "UI darf keinen Rohcontent oder Legacy-Pfad importieren",
    matches: (specifier) =>
      /(?:^|\/)(?:content|classes|races|feats|spells|gear|rules)(?:\/|$)/.test(specifier) &&
      !specifier.includes("generated")
  }
]);

if (violations.length > 0) {
  throw new Error(`Architecture violations:\n${violations.map((item) => `- ${item}`).join("\n")}`);
}

console.log("Architecture audit passed: content -> shared -> compiler -> catalog -> engine -> UI.");
