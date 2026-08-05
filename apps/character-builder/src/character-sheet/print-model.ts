import type { CalculatedCharacter, ExplainedValue } from "@sotc/rules-engine";
import type { CharacterDocument } from "@sotc/shared";

import type { CharacterSheetModel } from "./model.js";
import { createStatblock } from "./statblock.js";

export interface PrintValue {
  label: string;
  value: string;
  explanation?: ExplainedValue;
}

export interface CharacterPrintModel {
  identity: CharacterSheetModel["identity"];
  coreValues: PrintValue[];
  attributes: PrintValue[];
  saves: PrintValue[];
  skills: CharacterSheetModel["skills"];
  attacks: CharacterSheetModel["attacks"];
  actions: CharacterSheetModel["actions"];
  features: CharacterSheetModel["features"];
  spells: CharacterSheetModel["spells"];
  spellSlots: Array<{ rank: number; maximum: number; used: number }>;
  inventory: Array<
    CharacterSheetModel["inventory"][number] & {
      quantity: number;
      equipped: boolean;
      location: "equipped" | "carried" | "stowed";
    }
  >;
  resources: Array<{
    id: string;
    name: string;
    current: number;
    maximum: number;
    recovery: string;
  }>;
  conditions: CharacterDocument["session"]["conditions"];
  notes: CharacterDocument["session"]["notes"];
  biography: CharacterDocument["build"]["biography"];
  statblock: string;
  hasSpells: boolean;
}

export const buildCharacterPrintModel = (
  document: CharacterDocument,
  result: CalculatedCharacter,
  model: CharacterSheetModel
): CharacterPrintModel => ({
  identity: model.identity,
  coreValues: [
    {
      label: "Trefferpunkte",
      value: `${String(result.session.currentHp)} / ${String(result.hitPoints.value)}`,
      explanation: result.hitPoints
    },
    {
      label: "Temporäre TP",
      value: String(result.session.temporaryHp)
    },
    {
      label: "Rüstungsklasse",
      value: String(result.armorClass.value),
      explanation: result.armorClass
    },
    {
      label: "Wahrnehmung",
      value: String(result.perception.value),
      explanation: result.perception
    },
    {
      label: "Bewegung",
      value: `${String(result.speed.value)} Fuß`,
      explanation: result.speed
    },
    ...(result.classDc === undefined
      ? []
      : [
          {
            label: "Klassen-SG",
            value: String(result.classDc.value),
            explanation: result.classDc
          }
        ]),
    ...(result.spellDc === undefined
      ? []
      : [
          {
            label: "Zauber-SG",
            value: String(result.spellDc.value),
            explanation: result.spellDc
          }
        ]),
    ...(result.spellAttack === undefined
      ? []
      : [
          {
            label: "Zauberangriff",
            value: String(result.spellAttack.value),
            explanation: result.spellAttack
          }
        ])
  ],
  attributes: Object.entries(result.attributes).map(([id, value]) => ({
    label: id,
    value: `${String(value.value)} (${result.attributeModifiers[id as keyof typeof result.attributeModifiers] >= 0 ? "+" : ""}${String(result.attributeModifiers[id as keyof typeof result.attributeModifiers])})`,
    explanation: value
  })),
  saves: Object.entries(result.saves).map(([id, value]) => ({
    label: id,
    value: `${value.value >= 0 ? "+" : ""}${String(value.value)}`,
    explanation: value
  })),
  skills: model.skills,
  attacks: model.attacks,
  actions: model.actions,
  features: model.features,
  spells: model.spells,
  spellSlots: result.spellSlots.map((slot) => ({
    rank: slot.rank,
    maximum: slot.slots.value,
    used: result.session.spellSlotUsage[String(slot.rank)] ?? 0
  })),
  inventory: model.inventory.map((item) => {
    const state = document.session.itemStates[item.id];
    return {
      ...item,
      quantity: state?.quantity ?? 1,
      equipped: state?.equipped ?? false,
      location: state?.location ?? "carried"
    };
  }),
  resources: Object.entries(result.session.resources).map(([id, resource]) => ({
    id,
    name: document.session.resources[id]?.group ?? model.name(id),
    current: resource.current,
    maximum: resource.maximum,
    recovery: resource.recovery
  })),
  conditions: document.session.conditions.filter((condition) => condition.active),
  notes: document.session.notes,
  biography: document.build.biography,
  statblock: createStatblock(document, result, model),
  hasSpells: model.spells.length > 0 || result.spellSlots.length > 0
});
