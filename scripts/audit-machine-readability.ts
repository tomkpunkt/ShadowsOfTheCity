import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContentEntity } from "@sotc/shared";

import {
  countBy,
  generatedDirectory,
  hasMachineRule,
  loadCatalog,
  markdownTable,
  normalizeWhitespace,
  reviewDirectory,
  writeJson
} from "./lib/audit-utils.js";

type Classification =
  | "narrative"
  | "situational-text-rule"
  | "character-value"
  | "selection"
  | "prerequisite"
  | "combat-value"
  | "unresolved";

interface TextRuleRecord {
  entityId: string;
  entityType: ContentEntity["type"];
  sourceField: "rulesText";
  textEffectCount: number;
  classification: Classification;
  text: string;
  alreadyHasMachineRule: boolean;
  recommendation: string;
}

const classify = (entity: ContentEntity, text: string): Classification => {
  if (entity.editorialStatus === "needs-rules-decision") return "unresolved";
  if (entity.type === "choice" || /\bwähle|Auswahl\b/i.test(text)) return "selection";
  if (/\bVoraussetzung|benötigt|erfordert\b/i.test(text)) return "prerequisite";
  if (
    /\b(?:Schaden|Rüstungsklasse|Angriff|Reaktion|Rettungswurf|Trefferpunkte|Initiative)\b/i.test(
      text
    )
  )
    return "combat-value";
  if (/\b(?:Bonus|Malus|\+\d+|-\d+|Stufe|Rang|Fertigkeit|Attribut)\b/i.test(text))
    return "character-value";
  if (/\b(?:wenn|solange|falls|während|nachdem|bis|gegen)\b/i.test(text))
    return "situational-text-rule";
  return "narrative";
};

const effectsOf = (entity: ContentEntity): Array<{ kind: string; text?: string }> => {
  const effects =
    "effects" in entity && Array.isArray(entity.effects)
      ? entity.effects
      : entity.type === "effect"
        ? [entity.effect]
        : [];
  return effects as Array<{ kind: string; text?: string }>;
};

const run = async (): Promise<void> => {
  const catalog = await loadCatalog();
  const records: TextRuleRecord[] = [];
  for (const entity of catalog.entities) {
    const classification = classify(entity, entity.rulesText);
    records.push({
      entityId: entity.id,
      entityType: entity.type,
      sourceField: "rulesText",
      textEffectCount: effectsOf(entity).filter((effect) => effect.kind === "text").length,
      classification,
      text: normalizeWhitespace(entity.rulesText),
      alreadyHasMachineRule: hasMachineRule(entity),
      recommendation:
        classification === "unresolved"
          ? "Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren."
          : classification === "narrative"
            ? "Als redaktionellen Kontext belassen."
            : classification === "situational-text-rule"
              ? "Nur mit explizitem Trigger- und Geltungsbereichsschema formalisieren."
              : classification === "selection"
                ? "Gegen bestehende Choice-Filter prüfen und nur eindeutige Kandidatenmengen formalisieren."
                : classification === "prerequisite"
                  ? "Gegen das bestehende Voraussetzungsschema abgleichen."
                  : classification === "combat-value"
                    ? "Zielwert, Dauer, Stapelung und Auslöser fachlich bestätigen."
                    : "Ziel-ID, Modifikatortyp, Dauer und Stapelung fachlich bestätigen."
    });
  }
  const report = {
    schemaVersion: 1,
    catalogHash: catalog.contentHash,
    summary: {
      textRules: records.length,
      entitiesWithTextRules: new Set(records.map((record) => record.entityId)).size,
      explicitTextEffects: records.reduce((total, record) => total + record.textEffectCount, 0),
      entitiesWithMachineRules: catalog.entities.filter(hasMachineRule).length,
      classifications: countBy(records, (record) => record.classification),
      newlyFormalizedRules: 0,
      unresolved: records.filter((record) => record.classification === "unresolved").length
    },
    records
  };
  await writeJson(path.join(generatedDirectory, "machine-readability-classification.json"), report);
  const rows = Object.entries(report.summary.classifications).map(([classification, count]) => [
    classification,
    String(count)
  ]);
  const unresolvedRows = records
    .filter((record) => record.classification === "unresolved")
    .map((record) => [record.entityId, record.text, record.recommendation]);
  const markdown = `# Klassifikation der Maschinenlesbarkeit

## Ergebnis

Der Katalog enthält ${report.summary.textRules} redaktionelle Regeltexte für ${report.summary.entitiesWithTextRules} Entitäten, darunter ${report.summary.explicitTextEffects} ausdrücklich als Text-Effekt modellierte Wirkungen. ${report.summary.entitiesWithMachineRules} Entitäten besitzen mindestens einen strukturierten Regeleffekt. In diesem Auftrag wurden bewusst 0 Freitextregeln neu formalisiert: Die Quelle benennt bei vielen Boni weder Stapelungsart noch Dauer oder eindeutige Ziel-ID. Eine Automatisierung wäre daher eine neue Regelentscheidung.

${markdownTable(["Klasse", "Freitextregeln"], rows)}

## Bewertungsmaßstab

\`narrative\` bleibt beschreibend. \`situational-text-rule\` benötigt einen maschinenlesbaren Auslöser. \`character-value\` und \`combat-value\` benötigen Ziel-ID, Modifikatortyp, Dauer und Stapelung. \`selection\` und \`prerequisite\` werden gegen vorhandene Auswahl- und Voraussetzungsschemata geprüft. \`unresolved\` bleibt bis zur fachlichen Entscheidung gesperrt.

## Offene Regelentscheidungen

${unresolvedRows.length === 0 ? "Keine." : markdownTable(["Entität", "Quelltext", "Empfehlung"], unresolvedRows)}

Die vollständige Zuordnung jeder Freitextregel steht in \`generated/machine-readability-classification.json\`.
`;
  await writeFile(
    path.join(reviewDirectory, "12-machine-readability-classification.md"),
    markdown,
    "utf8"
  );
};

await run();
