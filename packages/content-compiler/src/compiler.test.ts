import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { collectReferences, compileContent } from "./compiler.js";
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
  it("does not resolve rules decision IDs as content entities", () => {
    const references = collectReferences({
      id: "feat.example",
      description: "",
      effects: [
        {
          kind: "text",
          text: "Die Kernregel benötigt eine redaktionelle Entscheidung.",
          machineReadable: false,
          classification: "requires-rules-decision",
          decisionId: "rules-decision.feat.example"
        }
      ]
    } as never);

    expect(references).not.toContain("rules-decision.feat.example");
  });

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

  it("validates internal Markdown entity references", async () => {
    const contentDirectory = await createFixture({
      "athletics.md": skill().replace(
        "Klettern, Springen und Schwimmen.",
        "Klettern, Springen und Schwimmen. Siehe [[skill.science|Wissenschaft]]."
      ),
      "science.md": skill("skill.science").replace("name: Athletik", "name: Wissenschaft")
    });

    const result = await compileContent({ contentDirectory });

    expect(result.report.valid).toBe(true);
  });

  it("rejects unresolved internal Markdown entity references", async () => {
    const contentDirectory = await createFixture({
      "athletics.md": skill().replace(
        "Klettern, Springen und Schwimmen.",
        "Klettern, Springen und Schwimmen. Siehe [[skill.missing|Unbekannt]]."
      )
    });

    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            code: "UNRESOLVED_REFERENCE",
            entityId: "skill.athletics"
          })
        ])
      }
    });
  });

  it("rejects references to the wrong entity type", async () => {
    const contentDirectory = await createFixture({
      "skill.md": skill(),
      "feature.md": `---
schemaVersion: 1
id: class-feature.invalid-owner
type: class-feature
name: Falscher Besitzer
source: source.core
status: draft
classId: skill.athletics
level: 1
---
`
    });
    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            code: "REFERENCE_TYPE_MISMATCH",
            path: "classId"
          })
        ])
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

  it("rejects levels outside the supported range", async () => {
    const contentDirectory = await createFixture({
      "feat.md": `---
schemaVersion: 1
id: feat.invalid-level
type: feat
name: Zu spÃ¤t
source: source.core
status: draft
category: general
level: 21
---
`
    });
    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            code: "SCHEMA_VALIDATION_FAILED",
            path: expect.stringContaining("level")
          })
        ])
      }
    });
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

  it("rejects choice dependency cycles", async () => {
    const choice = (id: string, unlocks: string): string => `---
schemaVersion: 1
id: ${id}
type: choice
name: ${id}
source: source.core
status: draft
choice:
  id: ${id}
  level: 1
  kind: generic
  min: 0
  max: 1
  effects:
    - kind: unlock-choice
      choiceId: ${unlocks}
---
`;
    const contentDirectory = await createFixture({
      "one.md": choice("choice.one", "choice.two"),
      "two.md": choice("choice.two", "choice.one")
    });

    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([
          expect.objectContaining({ code: "CHOICE_DEPENDENCY_CYCLE" })
        ])
      }
    });
  });

  it("migrates schema version 0 through the explicit content migration", async () => {
    const contentDirectory = await createFixture({
      "legacy.md": skill().replace("schemaVersion: 1", "schemaVersion: 0")
    });

    const result = await compileContent({ contentDirectory });

    expect(result.catalog.entities[0]?.schemaVersion).toBe(1);
  });

  it("rejects unsupported future schema versions", async () => {
    const contentDirectory = await createFixture({
      "future.md": skill().replace("schemaVersion: 1", "schemaVersion: 99")
    });

    await expect(compileContent({ contentDirectory })).rejects.toBeInstanceOf(
      ContentValidationError
    );
  });

  it("includes validated legacy aliases in the deterministic catalog", async () => {
    const contentDirectory = await createFixture({
      "skill.md": skill(),
      "legacy-aliases.json": JSON.stringify({
        "legacy.skill.athletik": "skill.athletics"
      })
    });

    const result = await compileContent({ contentDirectory });

    expect(result.catalog.aliases).toEqual({
      "legacy.skill.athletik": "skill.athletics"
    });
    expect(result.manifest.aliasCount).toBe(1);
  });

  it("rejects alias cycles and unresolved alias targets", async () => {
    const contentDirectory = await createFixture({
      "skill.md": skill(),
      "legacy-aliases.json": JSON.stringify({
        "legacy.one": "legacy.two",
        "legacy.two": "legacy.one",
        "legacy.missing": "skill.missing"
      })
    });

    await expect(compileContent({ contentDirectory })).rejects.toMatchObject({
      report: {
        issues: expect.arrayContaining([
          expect.objectContaining({ code: "LEGACY_ALIAS_CYCLE" }),
          expect.objectContaining({ code: "UNRESOLVED_LEGACY_ALIAS" })
        ])
      }
    });
  });
});
