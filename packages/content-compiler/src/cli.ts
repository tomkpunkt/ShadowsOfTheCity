import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compileContent, stableStringify } from "./compiler.js";
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
  } else if (command === "compile" || command === "validate") {
    const result = await compileContent({
      contentDirectory,
      outputDirectory,
      writeOutput: command === "compile"
    });
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
