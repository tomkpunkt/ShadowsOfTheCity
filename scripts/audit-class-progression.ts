import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContentEntity } from "@sotc/shared";

import {
  entityMatchesChoice,
  generatedDirectory,
  loadCatalog,
  markdownTable,
  reviewDirectory,
  writeJson
} from "./lib/audit-utils.js";

interface LevelAudit {
  level: number;
  automaticFeatures: string[];
  choices: string[];
  feats: string[];
  skills: string[];
  spells: string[];
  proficiencyChanges: string[];
  resources: string[];
  errors: string[];
}

const effectKind = (effect: unknown): string | undefined =>
  effect !== null &&
  typeof effect === "object" &&
  "kind" in effect &&
  typeof effect.kind === "string"
    ? effect.kind
    : undefined;

const run = async (): Promise<void> => {
  const catalog = await loadCatalog();
  const classes = catalog.entities.filter(
    (entity): entity is Extract<ContentEntity, { type: "class" }> => entity.type === "class"
  );
  const features = catalog.entities.filter(
    (entity): entity is Extract<ContentEntity, { type: "class-feature" }> =>
      entity.type === "class-feature"
  );
  const choices = catalog.entities.filter(
    (entity): entity is Extract<ContentEntity, { type: "choice" }> => entity.type === "choice"
  );
  const byClass = classes.map((characterClass) => {
    const classFeatures = features.filter((feature) => feature.classId === characterClass.id);
    const classChoices = choices.filter(
      (choice) =>
        choice.choice.filter.classId === characterClass.id ||
        JSON.stringify(choice.choice.prerequisites).includes(`"id":"${characterClass.id}"`) ||
        characterClass.choiceIds.includes(choice.id)
    );
    const maximumLevel = Math.max(
      1,
      ...classFeatures.map((feature) => feature.level),
      ...classChoices.map((choice) => choice.choice.level),
      ...Object.keys(
        characterClass.spellcastingProgressionId === undefined
          ? {}
          : ((
              catalog.entities.find(
                (entity) => entity.id === characterClass.spellcastingProgressionId
              ) as Extract<ContentEntity, { type: "spellcasting-progression" }> | undefined
            )?.slotsByLevel ?? {})
      ).map(Number)
    );
    const levels: LevelAudit[] = Array.from({ length: maximumLevel }, (_, index) => {
      const level = index + 1;
      const atLevelFeatures = classFeatures.filter((feature) => feature.level === level);
      const atLevelChoices = classChoices.filter((choice) => choice.choice.level === level);
      const errors = atLevelChoices.flatMap((choice) => {
        const options = catalog.entities.filter((entity) => entityMatchesChoice(entity, choice));
        return options.length < choice.choice.min
          ? [
              `${choice.name}: ${String(options.length)} Optionen für Minimum ${String(choice.choice.min)}`
            ]
          : [];
      });
      const duplicateFeatures = atLevelFeatures
        .map((feature) => feature.id)
        .filter((id, position, values) => values.indexOf(id) !== position);
      errors.push(...duplicateFeatures.map((id) => `Doppelte Feature-Vergabe: ${id}`));
      const featureEffects = atLevelFeatures.flatMap((feature) => feature.effects);
      return {
        level,
        automaticFeatures: atLevelFeatures.map((feature) => feature.id),
        choices: atLevelChoices.map((choice) => choice.id),
        feats: atLevelChoices
          .filter((choice) => choice.choice.kind === "feat")
          .map((choice) => choice.id),
        skills: atLevelChoices
          .filter((choice) => choice.choice.kind === "skill")
          .map((choice) => choice.id),
        spells: atLevelChoices
          .filter((choice) => choice.choice.kind === "spell")
          .map((choice) => choice.id),
        proficiencyChanges: featureEffects
          .filter(
            (effect) =>
              effectKind(effect) === "proficiency" ||
              effectKind(effect) === "weapon-proficiency" ||
              effectKind(effect) === "armor-proficiency"
          )
          .map((effect) => JSON.stringify(effect)),
        resources: featureEffects
          .filter((effect) => effectKind(effect) === "resource")
          .map((effect) => JSON.stringify(effect)),
        errors
      };
    });
    const errors = levels.flatMap((level) =>
      level.errors.map((error) => `Stufe ${String(level.level)}: ${error}`)
    );
    return {
      classId: characterClass.id,
      name: characterClass.name,
      maximumLevel,
      support: errors.length === 0 ? "playtest-through-maximum" : "incomplete",
      errors,
      levels
    };
  });
  const errors = byClass.flatMap((entry) =>
    entry.errors.map((error) => `${entry.classId}: ${error}`)
  );
  const report = {
    schemaVersion: 1,
    catalogHash: catalog.contentHash,
    summary: {
      classes: byClass.length,
      fullyAudited: byClass.filter((entry) => entry.errors.length === 0).length,
      incomplete: byClass.filter((entry) => entry.errors.length > 0).length,
      maximumLevel: Math.max(...byClass.map((entry) => entry.maximumLevel)),
      errors: errors.length
    },
    classes: byClass,
    errors
  };
  await writeJson(path.join(generatedDirectory, "class-progression-audit.json"), report);

  const classSections = byClass
    .map(
      (entry) => `## ${entry.name}

- Unterstütztes Prüfmaximum: Stufe ${String(entry.maximumLevel)}
- Status: ${entry.support === "playtest-through-maximum" ? "bis zum Maximum technisch geprüft; Regeln aus dem Altbestand bleiben Testinhalt" : "unvollständig"}

${markdownTable(
  ["Stufe", "Automatische Merkmale", "Auswahlen", "Talente", "Fertigkeiten", "Zauber", "Fehler"],
  entry.levels.map((level) => [
    String(level.level),
    level.automaticFeatures.join("<br>") || "-",
    level.choices.join("<br>") || "-",
    level.feats.join("<br>") || "-",
    level.skills.join("<br>") || "-",
    level.spells.join("<br>") || "-",
    level.errors.join("<br>") || "-"
  ])
)}
`
    )
    .join("\n");
  await writeFile(
    path.join(reviewDirectory, "07-class-progression-audit.md"),
    `# Klassenprogressionsaudit

Automatischer Stand für Katalog \`${catalog.contentHash}\`.

- ${String(report.summary.classes)} Klassen
- ${String(report.summary.fullyAudited)} ohne strukturelle Progressionsfehler
- ${String(report.summary.incomplete)} mit strukturellen Lücken
- höchstes geprüftes Content-Level: ${String(report.summary.maximumLevel)}
- ${String(report.summary.errors)} blockierende Befunde

Die Einstufung bestätigt technische Erreichbarkeit und nicht die fachliche
Balance. Da die Klassen aus dem Legacy-Regelwerk stammen, werden Stufen über 1
im Builder als Playtest-Progression bezeichnet.

${classSections.trimEnd()}
`,
    "utf8"
  );
  process.stdout.write(
    `Progression: ${String(report.summary.fullyAudited)}/${String(report.summary.classes)} Klassen ohne strukturelle Fehler.\n`
  );
  if (errors.length > 0) {
    process.exitCode = 1;
  }
};

await run();
