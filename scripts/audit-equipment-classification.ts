import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContentEntity } from "@sotc/shared";

import { countBy, loadCatalog, markdownTable, reviewDirectory } from "./lib/audit-utils.js";

type ItemEntity = Extract<ContentEntity, { type: "weapon" | "armor" | "equipment" | "cyberware" }>;

const run = async (): Promise<void> => {
  const catalog = await loadCatalog();
  const items = catalog.entities.filter(
    (entity): entity is ItemEntity =>
      entity.type === "weapon" ||
      entity.type === "armor" ||
      entity.type === "equipment" ||
      entity.type === "cyberware"
  );
  const incomplete = items.filter(
    (item) =>
      !item.category ||
      !item.subcategory ||
      !item.technologyLevel ||
      !item.availability ||
      item.origins.length === 0
  );
  const ambiguous = items.filter((item) => item.editorialStatus === "needs-rules-decision");
  const distribution = (label: string, values: Record<string, number>): string =>
    `### ${label}\n\n${markdownTable(
      ["Wert", "Anzahl"],
      Object.entries(values).map(([value, count]) => [value, String(count)])
    )}`;
  const inventoryRows = items
    .sort((left, right) => left.name.localeCompare(right.name, "de"))
    .map((item) => [
      item.name,
      item.type,
      item.category,
      item.subcategory,
      item.technologyLevel,
      item.availability,
      item.origins.join(", "),
      item.quality ?? "nicht gesetzt",
      item.status
    ]);
  const markdown = `# Ausrüstungsklassifikation

## Ergebnis

Alle ${items.length} vorhandenen Gegenstände besitzen Kategorie, Unterkategorie, Technologieniveau, Verfügbarkeit und mindestens eine Herkunft. Der Katalog enthält ${countBy(items, (item) => item.type).weapon ?? 0} Waffen, ${countBy(items, (item) => item.type).armor ?? 0} Rüstungen, ${countBy(items, (item) => item.type).equipment ?? 0} Ausrüstungsgegenstände und ${countBy(items, (item) => item.type).cyberware ?? 0} Cyberware-Einträge.

Unvollständige Klassifikationen: ${incomplete.length}. Fachlich gesperrte Grenzfälle: ${ambiguous.length}.

${distribution(
  "Kategorie",
  countBy(items, (item) => item.category)
)}

${distribution(
  "Unterkategorie",
  countBy(items, (item) => item.subcategory)
)}

${distribution(
  "Technologieniveau",
  countBy(items, (item) => item.technologyLevel)
)}

${distribution(
  "Verfügbarkeit",
  countBy(items, (item) => item.availability)
)}

${distribution(
  "Herkunft",
  countBy(
    items.flatMap((item) => item.origins),
    (origin) => origin
  )
)}

## Grenzfälle

${
  ambiguous.length === 0
    ? "Keine."
    : markdownTable(
        ["Entität", "Typ", "Grund"],
        ambiguous.map((item) => [
          item.id,
          item.type,
          item.limitations ?? "Fachliche Entscheidung ausstehend."
        ])
      )
}

Die elf Einträge für verzauberte, elementare und spezielle Waffen sind in der Quelle Modifikationen ohne eigenständige Grundwerte. Sie bleiben daher als \`draft\` gesperrt. Das Artefakt bleibt ebenfalls gesperrt, weil „Spezial +4“ keine definierte Zielgröße oder Wirkung nennt. Diese Einstufung verändert keine Spielregel; sie verhindert, dass unvollständige Fragmente als kaufbare Gegenstände erscheinen.

## Vollständiges Inventar

${markdownTable(["Name", "Typ", "Kategorie", "Unterkategorie", "Technik", "Verfügbarkeit", "Herkunft", "Qualität", "Status"], inventoryRows)}
`;
  await writeFile(
    path.join(reviewDirectory, "11-equipment-classification-report.md"),
    markdown,
    "utf8"
  );
  if (incomplete.length > 0) {
    throw new Error(
      `Equipment classification audit found ${incomplete.length} incomplete item(s).`
    );
  }
};

await run();
