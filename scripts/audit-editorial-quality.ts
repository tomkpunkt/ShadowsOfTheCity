import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContentEntity } from "@sotc/shared";

import {
  contentPath,
  countBy,
  generatedDirectory,
  hasMachineRule,
  hasTextRule,
  loadCatalog,
  markdownTable,
  normalizeWhitespace,
  reviewDirectory,
  writeJson
} from "./lib/audit-utils.js";

type FindingSeverity = "blocker" | "manual-review";

interface EditorialFinding {
  entityId: string;
  type: ContentEntity["type"];
  path: string;
  field: string;
  severity: FindingSeverity;
  code: string;
  message: string;
}

const sentenceEnd = /[.!?](?:["')\]]*)$/;
const genericText =
  /\b(?:Inhalt aus dem bestehenden Regelwerk|Kanonischer Skill|Aus dem Altbestand migriert|Beschreibung folgt|TODO|TBD|Placeholder)\b/i;

const numbers = (value: string): string[] =>
  [...value.matchAll(/\b\d+(?:[.,]\d+)?\b/g)].map((m) => m[0] ?? "");

const summaryTokens = (value: string): Set<string> =>
  new Set(
    value
      .toLocaleLowerCase("de")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .split(" ")
      .filter((word) => word.length >= 4)
  );

const similarity = (left: string, right: string): number => {
  const leftTokens = summaryTokens(left);
  const rightTokens = summaryTokens(right);
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
};

const run = async (): Promise<void> => {
  const catalog = await loadCatalog();
  const findings: EditorialFinding[] = [];
  const duplicateGroups = new Map<string, ContentEntity[]>();
  const add = (
    entity: ContentEntity,
    field: string,
    severity: FindingSeverity,
    code: string,
    message: string
  ): void => {
    findings.push({
      entityId: entity.id,
      type: entity.type,
      path: contentPath(entity),
      field,
      severity,
      code,
      message
    });
  };

  for (const entity of catalog.entities) {
    const active = entity.status !== "draft";
    const normalizedSummary = normalizeWhitespace(entity.summary).toLocaleLowerCase("de");
    const duplicates = duplicateGroups.get(normalizedSummary) ?? [];
    duplicates.push(entity);
    duplicateGroups.set(normalizedSummary, duplicates);

    if (entity.summary.trim().length < 20) {
      add(
        entity,
        "summary",
        "blocker",
        "summary-too-short",
        "Die Zusammenfassung ist kürzer als 20 Zeichen."
      );
    }
    if (
      normalizeWhitespace(entity.summary).toLocaleLowerCase("de") ===
      entity.name.toLocaleLowerCase("de")
    ) {
      add(
        entity,
        "summary",
        "blocker",
        "summary-repeats-name",
        "Die Zusammenfassung wiederholt ausschließlich den Namen."
      );
    }
    if (!sentenceEnd.test(entity.summary.trim())) {
      add(
        entity,
        "summary",
        "manual-review",
        "summary-not-sentence",
        "Die Zusammenfassung endet nicht als vollständiger Satz."
      );
    }
    if (genericText.test(entity.summary) || genericText.test(entity.rulesText)) {
      add(
        entity,
        "summary/rulesText",
        "blocker",
        "generic-copy",
        "Der sichtbare Text enthält eine generische Migrations- oder Platzhalterformulierung."
      );
    }
    if (
      /\b(?:class|feat|skill|trait|weapon|armor|equipment|spell|choice)\.[a-z0-9.-]+\b/.test(
        `${entity.summary} ${entity.rulesText}`
      )
    ) {
      add(
        entity,
        "summary/rulesText",
        "blocker",
        "technical-id-visible",
        "Der redaktionelle Text enthält eine technische Entitäts-ID."
      );
    }
    if (entity.rulesText.includes("|") && !/^\s*\|.+\|\s*$/m.test(entity.rulesText)) {
      add(
        entity,
        "rulesText",
        "manual-review",
        "collapsed-table",
        "Der Regeltext enthält Tabellen-Trennzeichen ohne erkennbare Markdown-Tabelle."
      );
    }
    if (entity.rulesText.trim().length < 20) {
      add(
        entity,
        "rulesText",
        "blocker",
        "rules-too-short",
        "Der Regeltext ist kürzer als 20 Zeichen."
      );
    }
    if (active && !["reviewed", "rewritten"].includes(entity.editorialStatus)) {
      add(
        entity,
        "editorialStatus",
        "blocker",
        "active-not-reviewed",
        "Eine aktive Entität ist redaktionell nicht mindestens geprüft."
      );
    }
    if (entity.editorialStatus === "needs-rules-decision" && entity.status !== "draft") {
      add(
        entity,
        "status",
        "blocker",
        "unresolved-active",
        "Eine ungeklärte Regelentscheidung ist nicht als Entwurf gesperrt."
      );
    }
    if (entity.status === "draft" && entity.editorialStatus !== "needs-rules-decision") {
      add(
        entity,
        "editorialStatus",
        "manual-review",
        "draft-without-decision",
        "Der Entwurf nennt keine offene Regelentscheidung."
      );
    }

    if ("priceGp" in entity) {
      const visibleNumbers = new Set(numbers(`${entity.summary} ${entity.rulesText}`));
      if (!visibleNumbers.has(String(entity.priceGp))) {
        add(
          entity,
          "rulesText",
          "manual-review",
          "price-not-visible",
          "Der strukturierte Preis ist im redaktionellen Text nicht erkennbar."
        );
      }
      if (!visibleNumbers.has(String(entity.bulk))) {
        add(
          entity,
          "rulesText",
          "manual-review",
          "bulk-not-visible",
          "Die strukturierte Last ist im redaktionellen Text nicht erkennbar."
        );
      }
    }
    if (entity.type === "choice" && !/\b(?:wähle|Auswahl)\b/i.test(entity.rulesText)) {
      add(
        entity,
        "rulesText",
        "manual-review",
        "choice-purpose-unclear",
        "Der Text erklärt den Auswahlzweck nicht ausdrücklich."
      );
    }
    if (entity.type === "feat" && entity.prerequisites.length > 0 && !entity.rulesText.trim()) {
      add(
        entity,
        "rulesText",
        "blocker",
        "prerequisite-without-rule",
        "Das Talent hat Voraussetzungen, aber keinen Regeltext."
      );
    }
  }

  const exactDuplicates = [...duplicateGroups.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      summary: group[0]?.summary ?? "",
      entityIds: group.map((entity) => entity.id).sort()
    }))
    .sort((left, right) => right.entityIds.length - left.entityIds.length);
  for (const group of exactDuplicates) {
    for (const entityId of group.entityIds) {
      const entity = catalog.entities.find((candidate) => candidate.id === entityId);
      if (entity !== undefined) {
        add(
          entity,
          "summary",
          "blocker",
          "duplicate-summary",
          `Die Zusammenfassung wird von ${group.entityIds.length} Entitäten wortgleich verwendet.`
        );
      }
    }
  }

  const nearestSimilar = new Map<string, { entityId: string; score: number }>();
  for (let leftIndex = 0; leftIndex < catalog.entities.length; leftIndex += 1) {
    const left = catalog.entities[leftIndex];
    if (left === undefined) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < catalog.entities.length; rightIndex += 1) {
      const right = catalog.entities[rightIndex];
      if (right === undefined || left.summary === right.summary) continue;
      const score = similarity(left.summary, right.summary);
      if (score < 0.72) continue;
      if ((nearestSimilar.get(left.id)?.score ?? 0) < score) {
        nearestSimilar.set(left.id, { entityId: right.id, score });
      }
      if ((nearestSimilar.get(right.id)?.score ?? 0) < score) {
        nearestSimilar.set(right.id, { entityId: left.id, score });
      }
    }
  }

  const entityAssessments = catalog.entities.map((entity) => {
    const entityFindings = findings.filter((finding) => finding.entityId === entity.id);
    const prerequisites =
      "prerequisites" in entity && Array.isArray(entity.prerequisites)
        ? entity.prerequisites.length
        : entity.type === "choice"
          ? entity.choice.prerequisites.length
          : 0;
    const recognizableEffect =
      hasMachineRule(entity) ||
      hasTextRule(entity) ||
      /\b(?:gewährt|verursacht|erhöht|reduziert|Bonus|Malus|wähle|ermöglicht|schützt|heilt|Schaden|Rüstung)\b/i.test(
        entity.rulesText
      );
    const recognizableUse =
      /\b(?:wenn|während|für|mit|durch|gegen|wähle|dient|ermöglicht|verwendet|Anwendung|Nutzung)\b/i.test(
        `${entity.summary} ${entity.rulesText}`
      );
    const fields = [
      "summary",
      ...(entity.flavorText === undefined ? [] : ["flavorText"]),
      "rulesText",
      ...(entity.usageNotes === undefined ? [] : ["usageNotes"]),
      ...(entity.limitations === undefined ? [] : ["limitations"]),
      ...(entity.examples.length === 0 ? [] : ["examples"]),
      "description"
    ];
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      path: contentPath(entity),
      sourceFiles: entity.legacy?.paths ?? [],
      status: entity.status,
      editorialStatus: entity.editorialStatus,
      summaryLength: entity.summary.length,
      rulesTextLength: entity.rulesText.length,
      presentTextFields: fields,
      concrete: !genericText.test(`${entity.summary} ${entity.rulesText}`),
      completeSummarySentence: sentenceEnd.test(entity.summary.trim()),
      recognizableEffect,
      recognizableUse,
      prerequisiteCount: prerequisites,
      typedTextContradictionFindings: entityFindings
        .filter((finding) => finding.code.includes("visible"))
        .map((finding) => finding.code),
      repeatedSummary: exactDuplicates.some((group) => group.entityIds.includes(entity.id)),
      nearestSimilarSummary: nearestSimilar.get(entity.id) ?? null,
      semanticReviewHints: [
        ...(!recognizableEffect ? ["effect-not-recognized-by-heuristic"] : []),
        ...(!recognizableUse ? ["use-not-recognized-by-heuristic"] : []),
        ...entityFindings.map((finding) => finding.code)
      ],
      manualReviewRequired:
        entity.editorialStatus === "needs-rules-decision" ||
        entityFindings.some((finding) => finding.severity === "blocker")
    };
  });
  const summaryLengths = entityAssessments
    .map((assessment) => assessment.summaryLength)
    .sort((left, right) => left - right);
  const averageSummaryLength =
    summaryLengths.reduce((total, length) => total + length, 0) / summaryLengths.length;
  const medianSummaryLength = summaryLengths[Math.floor(summaryLengths.length / 2)] ?? 0;
  const blockers = findings.filter((finding) => finding.severity === "blocker");
  const report = {
    schemaVersion: 1,
    catalogHash: catalog.contentHash,
    summary: {
      entities: catalog.entities.length,
      activeEntities: catalog.entities.filter((entity) => entity.status !== "draft").length,
      drafts: catalog.entities.filter((entity) => entity.status === "draft").length,
      editorialStatus: countBy(catalog.entities, (entity) => entity.editorialStatus),
      textRuleEntities: catalog.entities.filter(hasTextRule).length,
      machineRuleEntities: catalog.entities.filter(hasMachineRule).length,
      exactDuplicateGroups: exactDuplicates.length,
      nearSimilarSummaries: nearestSimilar.size,
      averageSummaryLength: Number(averageSummaryLength.toFixed(1)),
      medianSummaryLength,
      summariesBelow80Characters: summaryLengths.filter((length) => length < 80).length,
      manualReviewRequired: entityAssessments.filter(
        (assessment) => assessment.manualReviewRequired
      ).length,
      blockers: blockers.length,
      manualReview: findings.length - blockers.length
    },
    byType: Object.fromEntries(
      [...new Set(catalog.entities.map((entity) => entity.type))].sort().map((type) => {
        const entities = catalog.entities.filter((entity) => entity.type === type);
        return [
          type,
          {
            entities: entities.length,
            reviewed: entities.filter((entity) =>
              ["reviewed", "rewritten"].includes(entity.editorialStatus)
            ).length,
            rewritten: entities.filter((entity) => entity.editorialStatus === "rewritten").length,
            drafts: entities.filter((entity) => entity.status === "draft").length
          }
        ];
      })
    ),
    exactDuplicates,
    entityAssessments,
    findings
  };

  await writeJson(path.join(generatedDirectory, "editorial-quality-report.json"), report);
  const typeRows = Object.entries(report.byType).map(([type, value]) => [
    type,
    String(value.entities),
    String(value.reviewed),
    String(value.rewritten),
    String(value.drafts)
  ]);
  const blockerRows = blockers
    .slice(0, 200)
    .map((finding) => [finding.entityId, finding.field, finding.code, finding.message]);
  const markdown = `# Redaktionelle Qualitätsbaseline

## Ergebnis

- Katalog: ${report.summary.entities} Entitäten, davon ${report.summary.activeEntities} aktiv und ${report.summary.drafts} Entwürfe.
- Status: ${Object.entries(report.summary.editorialStatus)
    .map(([status, count]) => `${status} ${count}`)
    .join(", ")}.
- Wortgleiche Zusammenfassungsgruppen: ${report.summary.exactDuplicateGroups}.
- Durchschnittliche/mediane Kurztextlänge: ${report.summary.averageSummaryLength}/${report.summary.medianSummaryLength} Zeichen; ${report.summary.summariesBelow80Characters} Kurztexte liegen unter dem Orientierungswert von 80 Zeichen.
- Ähnlichkeitskandidaten: ${report.summary.nearSimilarSummaries}; manuelle Nachprüfung laut Heuristik: ${report.summary.manualReviewRequired}.
- Blocker: ${report.summary.blockers}; manuell zu prüfende Hinweise: ${report.summary.manualReview}.

## Abdeckung nach Typ

${markdownTable(["Typ", "Entitäten", "geprüft+", "neu gefasst", "Entwürfe"], typeRows)}

## Qualitätsregeln

Aktive Entitäten müssen mindestens den Status \`reviewed\` tragen. \`needs-rules-decision\` ist nur zusammen mit \`draft\` zulässig. Zusammenfassungen und Regeltexte müssen mindestens 20 Zeichen umfassen; generische Migrationstexte und wortgleiche Zusammenfassungen sind Blocker. Zahlenabgleiche für Preis und Last sowie Satzform und Auswahlformulierung werden als manuelle Hinweise dokumentiert.

## Blocker

${blockerRows.length === 0 ? "Keine." : markdownTable(["Entität", "Feld", "Code", "Befund"], blockerRows)}

Die vollständigen maschinenlesbaren Befunde stehen in \`generated/editorial-quality-report.json\`.
`;
  await writeFile(path.join(reviewDirectory, "10-editorial-quality-baseline.md"), markdown, "utf8");

  if (blockers.length > 0) {
    throw new Error(`Editorial quality audit found ${blockers.length} blocker(s).`);
  }
};

await run();
