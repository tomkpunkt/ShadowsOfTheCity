import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContentEntity } from "@sotc/shared";

import {
  collectEntityReferences,
  countBy,
  entityMatchesChoice,
  generatedDirectory,
  hasMachineRule,
  hasTextRule,
  loadAllowlist,
  loadCatalog,
  markdownTable,
  reviewDirectory,
  writeJson
} from "./lib/audit-utils.js";

type ReachabilityStatus =
  "selectable" | "automatic" | "informational" | "intentionally-unused" | "unreachable";

interface ReachabilityEntry {
  id: string;
  type: ContentEntity["type"];
  name: string;
  source: string;
  contentStatus: ContentEntity["status"];
  status: ReachabilityStatus;
  references: string[];
  referencedBy: string[];
  reachable: boolean;
  path: string[];
  detailDisplayable: boolean;
  ruleEffect: "machine-readable" | "text-rule" | "none";
  reason?: string;
  allowlisted: boolean;
}

const directSelectionTypes = new Set<ContentEntity["type"]>([
  "ancestry",
  "background",
  "class",
  "weapon",
  "armor",
  "equipment",
  "cyberware"
]);

const automaticTypes = new Set<ContentEntity["type"]>([
  "class-feature",
  "heritage",
  "language",
  "proficiency",
  "spellcasting-progression"
]);

const run = async (): Promise<void> => {
  const catalog = await loadCatalog();
  const allowlist = await loadAllowlist();
  const allowed = new Map(allowlist.entries.map((entry) => [entry.id, entry.reason]));
  const knownIds = new Set(catalog.entities.map((entity) => entity.id));
  const references = new Map(
    catalog.entities.map((entity) => [entity.id, collectEntityReferences(entity, knownIds)])
  );
  const referencedBy = new Map(catalog.entities.map((entity) => [entity.id, [] as string[]]));
  for (const [ownerId, targetIds] of references) {
    for (const targetId of targetIds) {
      referencedBy.get(targetId)?.push(ownerId);
    }
  }
  const choices = catalog.entities.filter(
    (entity): entity is Extract<ContentEntity, { type: "choice" }> => entity.type === "choice"
  );

  const entries: ReachabilityEntry[] = catalog.entities.map((entity) => {
    const matchingChoices = choices.filter((choice) => entityMatchesChoice(entity, choice));
    const allowReason = allowed.get(entity.id);
    let status: ReachabilityStatus = "informational";
    let pathParts = ["Kompendium", entity.type, entity.name];
    let reason: string | undefined;

    if (directSelectionTypes.has(entity.type)) {
      status = "selectable";
      pathParts = [
        entity.type === "ancestry"
          ? "Abstammung"
          : entity.type === "background"
            ? "Background"
            : entity.type === "class"
              ? "Klasse"
              : "Ausrüstung",
        entity.name
      ];
    } else if (entity.type === "choice") {
      status = "automatic";
      pathParts = ["Builder", `Choice ab Stufe ${String(entity.choice.level)}`, entity.name];
    } else if (matchingChoices.length > 0) {
      status = "selectable";
      pathParts = ["Builder", matchingChoices[0]?.name ?? "Auswahl", entity.name];
    } else if (automaticTypes.has(entity.type) || (referencedBy.get(entity.id)?.length ?? 0) > 0) {
      status = "automatic";
      pathParts = ["Builder", "Automatisch oder als Referenz vergeben", entity.name];
    }

    if (allowReason !== undefined) {
      status = "intentionally-unused";
      reason = allowReason;
      pathParts = [];
    }

    const reachable = status !== "intentionally-unused";
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      source: entity.source,
      contentStatus: entity.status,
      status,
      references: references.get(entity.id) ?? [],
      referencedBy: (referencedBy.get(entity.id) ?? []).sort(),
      reachable,
      path: pathParts,
      detailDisplayable: reachable,
      ruleEffect: hasMachineRule(entity)
        ? "machine-readable"
        : hasTextRule(entity)
          ? "text-rule"
          : "none",
      ...(reason === undefined ? {} : { reason }),
      allowlisted: allowReason !== undefined
    };
  });

  const choiceErrors = choices.flatMap((choice) => {
    const options = catalog.entities.filter((entity) => entityMatchesChoice(entity, choice));
    return choice.choice.min > options.length
      ? [
          `${choice.id}: ${String(options.length)} Optionen für Minimum ${String(choice.choice.min)}`
        ]
      : [];
  });
  const activeUnreachable = entries.filter(
    (entry) => entry.contentStatus !== "draft" && !entry.reachable && !entry.allowlisted
  );
  const unknownAllowlistIds = allowlist.entries
    .filter((entry) => !knownIds.has(entry.id))
    .map((entry) => entry.id);
  const errors = [
    ...activeUnreachable.map((entry) => `${entry.id}: aktive Entität ist nicht erreichbar`),
    ...choiceErrors,
    ...unknownAllowlistIds.map((id) => `${id}: unbekannte Allowlist-ID`)
  ];

  const report = {
    schemaVersion: 1,
    catalogHash: catalog.contentHash,
    summary: {
      entities: entries.length,
      reachable: entries.filter((entry) => entry.reachable).length,
      selectable: entries.filter((entry) => entry.status === "selectable").length,
      automatic: entries.filter((entry) => entry.status === "automatic").length,
      informational: entries.filter((entry) => entry.status === "informational").length,
      allowlisted: entries.filter((entry) => entry.allowlisted).length,
      unreachable: activeUnreachable.length,
      errors: errors.length,
      byType: countBy(entries, (entry) => entry.type)
    },
    errors,
    entries
  };
  await writeJson(path.join(generatedDirectory, "builder-reachability-report.json"), report);

  const rows = Object.keys(report.summary.byType).map((type) => {
    const typed = entries.filter((entry) => entry.type === type);
    return [
      `\`${type}\``,
      String(typed.length),
      String(typed.filter((entry) => entry.reachable).length),
      String(typed.filter((entry) => entry.status === "selectable").length),
      String(typed.filter((entry) => entry.status === "automatic").length),
      String(typed.filter((entry) => entry.status === "informational").length),
      String(typed.filter((entry) => entry.allowlisted).length)
    ];
  });
  const document = `# Builder-Reichweite

Automatischer Stand für Katalog \`${catalog.contentHash}\`.

## Ergebnis

- ${String(report.summary.entities)} Entitäten geprüft
- ${String(report.summary.reachable)} im Builder oder Kompendium erreichbar
- ${String(report.summary.selectable)} auswählbar
- ${String(report.summary.automatic)} automatisch oder durch eine Auswahl eingebunden
- ${String(report.summary.informational)} informativ im Kompendium
- ${String(report.summary.allowlisted)} ausdrücklich ausgenommen
- ${String(report.summary.errors)} blockierende Befunde

${markdownTable(
  ["Typ", "Gesamt", "Erreichbar", "Auswählbar", "Automatisch", "Informativ", "Ausnahme"],
  rows
)}

## Prüfvertrag

Der Audit bricht mit Exit-Code 1 ab, wenn eine aktive Entität weder erreichbar
noch mit konkreter Begründung in \`scripts/audit-allowlist.json\` ausgenommen
ist, eine Pflichtauswahl zu wenige Optionen besitzt oder die Allowlist eine
unbekannte ID enthält. Die maschinenlesbare Einzelprüfung aller Entitäten steht
in \`generated/builder-reachability-report.json\`.

## Blockierende Befunde

${errors.length === 0 ? "Keine." : errors.map((error) => `- ${error}`).join("\n")}
`;
  await writeFile(path.join(reviewDirectory, "05-builder-reachability.md"), document, "utf8");

  process.stdout.write(
    `Reachability: ${String(report.summary.reachable)}/${String(report.summary.entities)} erreichbar, ${String(errors.length)} Fehler.\n`
  );
  if (errors.length > 0) {
    process.exitCode = 1;
  }
};

await run();
