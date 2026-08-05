import type { CalculatedCharacter } from "@sotc/rules-engine";
import type { CharacterDocument } from "@sotc/shared";

import { attributeLabels, formatDamageType } from "../i18n/de.js";
import type { CharacterSheetModel } from "./model.js";

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${String(value)}`;

export const createStatblock = (
  document: CharacterDocument,
  result: CalculatedCharacter,
  model: CharacterSheetModel
): string => {
  const items = model.inventory
    .filter((item) => (document.session.itemStates[item.id]?.quantity ?? 1) > 0)
    .map((item) => {
      const quantity = document.session.itemStates[item.id]?.quantity ?? 1;
      return quantity === 1 ? item.name : `${item.name} (${String(quantity)})`;
    });
  const skills = model.skills
    .filter((skill) => skill.rank !== "untrained")
    .map((skill) => `${skill.name} ${signed(skill.value.value)}`);

  return [
    `${model.identity.name} · Stufe ${String(model.identity.level)}`,
    `${model.identity.ancestry} ${model.identity.className} · ${model.identity.background}`,
    `Wahrnehmung ${signed(result.perception.value)}; Sprachen ${result.languages.map(model.name).join(", ") || "–"}`,
    `Fertigkeiten ${skills.join(", ") || "–"}`,
    `Attribute ${Object.entries(result.attributes)
      .map(
        ([id, value]) =>
          `${attributeLabels[id as keyof typeof attributeLabels]} ${String(value.value)}`
      )
      .join(", ")}`,
    `Gegenstände ${items.join(", ") || "–"}`,
    `RK ${String(result.armorClass.value)}; Zäh ${signed(result.saves.fortitude.value)}, Ref ${signed(result.saves.reflex.value)}, Wil ${signed(result.saves.will.value)}`,
    `TP ${String(result.session.currentHp)}/${String(result.hitPoints.value)}; Bewegung ${String(result.speed.value)} Fuß`,
    `Angriffe ${
      model.attacks
        .map(
          (attack) =>
            `${attack.name} ${signed(attack.attack.value)} (${attack.damage.dice}${signed(attack.damage.flat.value)} ${formatDamageType(attack.damage.type)})`
        )
        .join("; ") || "–"
    }`,
    `Aktionen ${
      model.actions
        .filter((action) => action.category !== "passive")
        .slice(0, 8)
        .map((action) => action.name)
        .join(", ") || "–"
    }`,
    `Merkmale ${
      model.features
        .slice(0, 12)
        .map((feature) => feature.name)
        .join(", ") || "–"
    }`,
    `Zauber ${model.spells.map((spell) => spell.name).join(", ") || "–"}`
  ].join("\n");
};
