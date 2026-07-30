import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { compileContent } from "./compiler.js";
import { ContentValidationError } from "./validation.js";

const temporaryDirectories: string[] = [];

const createFixture = async (files: Record<string, string>): Promise<string> => {
  const root = await mkdtemp(path.join(tmpdir(), "sotc-content-"));
  temporaryDirectories.push(root);
  await Promise.all(
    Object.entries(files).map(async ([relativePath, source]) => {
      const target = path.join(root, relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, source, "utf8");
    })
  );
  return root;
};

const skill = (id = "skill.athletics"): string => `---
schemaVersion: 1
id: ${id}
type: skill
name: Athletik
source: source.core
status: canonical
attribute: strength
---

# Athletik

Klettern, Springen und Schwimmen.
`;

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
  );
});

describe("compileContent", () => {
  it("compiles valid entities and writes deterministic output", async () => {
    const contentDirectory = await createFixture({
      "skills/athletics.md": skill()
    });
    const outputDirectory = path.join(contentDirectory, ".generated");
    const first = await compileContent({ contentDirectory, outputDirectory, writeOutput: true });
    const firstCatalog = await readFile(path.join(outputDirectory, "catalog.json"), "utf8");
    const second = await compileContent({ contentDirectory, outputDirectory, writeOutput: true });
    const secondCatalog = await readFile(path.join(outputDirectory, "catalog.json"), "utf8");

    expect(first.report.valid).toBe(true);
    expect(first.catalog.contentHash).toBe(second.catalog.contentHash);
    expect(firstCatalog).toBe(secondCatalog);
  });

  it("rejects a missing required field", async () => {
    const contentDirectory = await createFixture({
      "invalid.md": skill().replace("attribute: strength\n", "")
    });
    await expect(compileContent({ contentDirectory })).rejects.toBeInstanceOf(
      ContentValidationError
    );
  });

  it("rejects duplicate IDs", async () => {
    const contentDirectory = await createFixture({
      "one.md": skill(),
      "two.md": skill()
    });
    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([expect.objectContaining({ code: "DUPLICATE_ID" })])
      }
    });
  });

  it("rejects unresolved references", async () => {
    const contentDirectory = await createFixture({
      "skill.md": skill().replace(
        "status: canonical",
        "status: canonical\ntraits:\n  - trait.missing"
      )
    });
    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([expect.objectContaining({ code: "UNRESOLVED_REFERENCE" })])
      }
    });
  });

  it("rejects an invalid predicate", async () => {
    const contentDirectory = await createFixture({
      "choice.md": `---
schemaVersion: 1
id: choice.invalid
type: choice
name: Ungültig
source: source.core
status: draft
choice:
  id: choice.invalid-selection
  level: 1
  kind: skill
  min: 0
  max: 1
  prerequisites:
    - maybe: []
---
`
    });
    await expect(compileContent({ contentDirectory })).rejects.toBeInstanceOf(
      ContentValidationError
    );
  });

  it("rejects an invalid effect", async () => {
    const contentDirectory = await createFixture({
      "feat.md": `---
schemaVersion: 1
id: feat.invalid
type: feat
name: Ungültig
source: source.core
status: draft
category: general
level: 1
effects:
  - kind: teleport-everywhere
---
`
    });
    await expect(compileContent({ contentDirectory })).rejects.toBeInstanceOf(
      ContentValidationError
    );
  });

  it("rejects a required choice without matching options", async () => {
    const contentDirectory = await createFixture({
      "choice.md": `---
schemaVersion: 1
id: choice.no-options
type: choice
name: Keine Optionen
source: source.core
status: draft
choice:
  id: choice.no-options.selection
  level: 1
  kind: feat
  min: 1
  max: 1
  filter:
    entityTypes:
      - feat
---
`
    });
    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([
          expect.objectContaining({ code: "CHOICE_WITHOUT_OPTIONS" })
        ])
      }
    });
  });
});
