import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectReferences, compileContent, stableStringify } from "./compiler.js";
import { ContentValidationError, type ValidationIssue } from "./validation.js";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "..", "..");
const contentDirectory = path.join(repositoryRoot, "content");
const outputDirectory = path.join(repositoryRoot, "generated");

const printIssue = (issue: ValidationIssue): void => {
  const location = [issue.file, issue.path].filter(Boolean).join(":");
  const prefix = location.length > 0 ? `${location}: ` : "";
  console.error(`${prefix}${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
};

const printSummary = (result: {
  report: { filesScanned: number; entitiesParsed: number; countsByType: Record<string, number> };
  manifest: { contentHash: string };
}): void => {
  console.log(
    `Validated ${String(result.report.entitiesParsed)} entities from ${String(
      result.report.filesScanned
    )} files.`
  );
  console.log(`Content hash: ${result.manifest.contentHash}`);
  for (const [type, count] of Object.entries(result.report.countsByType)) {
    console.log(`  ${type}: ${String(count)}`);
  }
};

const command = process.argv[2] ?? "validate";
const argument = (name: string): string | undefined => {
  const direct = process.argv.find((value) => value.startsWith(`${name}=`));
  if (direct !== undefined) {
    return direct.slice(name.length + 1);
  }
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
};

try {
  if (command === "report") {
    const report = JSON.parse(
      await readFile(path.join(outputDirectory, "content-validation-report.json"), "utf8")
    ) as {
      valid: boolean;
      filesScanned: number;
      entitiesParsed: number;
      issues: ValidationIssue[];
      countsByType: Record<string, number>;
    };
    console.log(
      `Last report: ${report.valid ? "valid" : "invalid"}, ${String(
        report.entitiesParsed
      )} entities from ${String(report.filesScanned)} files.`
    );
    for (const issue of report.issues) {
      printIssue(issue);
    }
  } else if (command === "check-generated") {
    const result = await compileContent({
      contentDirectory,
      writeOutput: false
    });
    const expectedFiles = new Map([
      ["catalog.json", stableStringify(result.catalog)],
      ["catalog.manifest.json", stableStringify(result.manifest)],
      ["content-validation-report.json", stableStringify(result.report)]
    ]);
    const stale: string[] = [];
    for (const [file, expected] of expectedFiles) {
      let actual = "";
      try {
        actual = await readFile(path.join(outputDirectory, file), "utf8");
      } catch {
        stale.push(file);
        continue;
      }
      if (actual !== expected) {
        stale.push(file);
      }
    }
    if (stale.length > 0) {
      throw new Error(
        `Generated catalog is stale: ${stale.join(", ")}. Run npm run content:compile.`
      );
    }
    console.log(`Generated catalog is current (${result.catalog.contentHash}).`);
  } else if (command === "new") {
    const type = argument("--type");
    const id = argument("--id");
    if (type === undefined || id === undefined) {
      throw new Error("Usage: content:new -- --type feat --id feat.example");
    }
    const templatePath = path.join(contentDirectory, "templates", `${type}.md`);
    const source = await readFile(templatePath, "utf8");
    const marker = `id: template.${type}`;
    if (!source.includes(marker)) {
      throw new Error(`Template ${type}.md does not contain ${marker}.`);
    }
    const target = path.join(contentDirectory, "custom", type, `${id}.md`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, source.replace(marker, `id: ${id}`), {
      encoding: "utf8",
      flag: "wx"
    });
    console.log(`Created ${path.relative(repositoryRoot, target)} from ${type}.md.`);
  } else if (command === "templates") {
    const result = await compileContent({
      contentDirectory,
      includeTemplates: true
    });
    const templateFiles = result.manifest.sourceFiles.filter((file) =>
      file.startsWith("templates/")
    );
    if (templateFiles.length !== 12) {
      throw new Error(`Expected 12 valid templates, found ${String(templateFiles.length)}.`);
    }
    console.log(`Validated ${String(templateFiles.length)} content templates.`);
  } else if (command === "explain" || command === "references") {
    const id = argument("--id");
    if (id === undefined) {
      throw new Error(`Usage: content:${command} -- --id feat.example`);
    }
    const result = await compileContent({ contentDirectory });
    const entity = result.catalog.entities.find((candidate) => candidate.id === id);
    if (entity === undefined) {
      throw new Error(`Unknown content ID: ${id}`);
    }
    if (command === "explain") {
      console.log(stableStringify(entity).trimEnd());
    } else {
      const outgoing = collectReferences(entity);
      const incoming = result.catalog.entities
        .filter((candidate) => collectReferences(candidate).includes(id))
        .map((candidate) => candidate.id)
        .sort((left, right) => left.localeCompare(right));
      console.log(`Outgoing (${String(outgoing.length)}): ${outgoing.join(", ") || "-"}`);
      console.log(`Incoming (${String(incoming.length)}): ${incoming.join(", ") || "-"}`);
    }
  } else if (command === "compile" || command === "validate") {
    const result = await compileContent({
      contentDirectory,
      outputDirectory,
      writeOutput: command === "compile"
    });
    const requestedFile = argument("--file");
    if (requestedFile !== undefined) {
      const relative = path
        .relative(contentDirectory, path.resolve(repositoryRoot, requestedFile))
        .split(path.sep)
        .join("/");
      if (!result.manifest.sourceFiles.includes(relative)) {
        throw new Error(`Validated file is outside the content catalog: ${requestedFile}`);
      }
      console.log(`Validated file: ${relative}`);
    }
    printSummary(result);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  if (error instanceof ContentValidationError) {
    for (const issue of error.report.issues) {
      printIssue(issue);
    }
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
}
