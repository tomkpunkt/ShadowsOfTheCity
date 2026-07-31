import type { CalculatedCharacter, ExplainedValue, ProficiencyRank } from "@sotc/rules-engine";
import type { Catalog, CharacterDocument, ContentEntity } from "@sotc/shared";

export type SheetView = CharacterDocument["session"]["activeView"];

export interface SheetAction {
  id: string;
  name: string;
  sourceId: string;
  sourceName: string;
  cost: string;
  category:
    | "one"
    | "two"
    | "three"
    | "free"
    | "reaction"
    | "exploration"
    | "downtime"
    | "passive"
    | "activity";
  traits: string[];
  summary: string;
  used: number;
  maximum?: number;
}

export interface SheetSkill {
  id: string;
  name: string;
  attribute: string;
  value: ExplainedValue;
  rank: ProficiencyRank;
}

export interface SheetAttack {
  id: string;
  name: string;
  attack: ExplainedValue;
  damage: { dice: string; flat: ExplainedValue; type: string };
  range?: string;
  hands: number;
  capacity?: number;
  reload?: number;
  traits: string[];
}

const actionCost = (
  cost:
    | Extract<ContentEntity, { type: "feat" }>["actionCost"]
    | Extract<ContentEntity, { type: "spell" }>["actions"]
    | undefined
): Pick<SheetAction, "cost" | "category"> => {
  if (cost === undefined) {
    return { cost: "Aktivität", category: "activity" };
  }
  if (cost.kind === "fixed") {
    return {
      cost: `${String(cost.value)} ${cost.value === 1 ? "Aktion" : "Aktionen"}`,
      category: cost.value === 1 ? "one" : cost.value === 2 ? "two" : "three"
    };
  }
  if (cost.kind === "variable") {
    return {
      cost: `${String(cost.min)}-${String(cost.max)} Aktionen`,
      category: "activity"
    };
  }
  return {
    cost: {
      reaction: "Reaktion",
      free: "Freie Aktion",
      passive: "Passiv",
      exploration: "Erkundung",
      downtime: "Ausfallzeit"
    }[cost.kind],
    category: {
      reaction: "reaction",
      free: "free",
      passive: "passive",
      exploration: "exploration",
      downtime: "downtime"
    }[cost.kind] as SheetAction["category"]
  };
};

const entityActionCost = (entity: ContentEntity) => {
  if (entity.type === "spell") {
    return entity.actions;
  }
  if (entity.type === "feat" || entity.type === "class-feature") {
    return entity.actionCost;
  }
  return undefined;
};

export const buildSheetModel = (
  catalog: Catalog,
  document: CharacterDocument,
  result: CalculatedCharacter
) => {
  const entities = new Map(catalog.entities.map((entity) => [entity.id, entity]));
  const name = (id: string | undefined): string =>
    id === undefined ? "Nicht gewählt" : (entities.get(id)?.name ?? id);
  const featureIds = [...new Set([...result.featureIds, ...result.featIds])];
  const actionEntities = new Map<string, ContentEntity>();
  for (const id of [...featureIds, ...result.spellIds]) {
    const entity = entities.get(id);
    if (
      entity !== undefined &&
      (entity.type === "spell" ||
        ((entity.type === "feat" || entity.type === "class-feature") &&
          entity.actionCost !== undefined))
    ) {
      actionEntities.set(entity.id, entity);
    }
  }
  for (const action of result.actions) {
    const entity = entities.get(action.id) ?? entities.get(action.sourceId);
    if (entity !== undefined) {
      actionEntities.set(entity.id, entity);
    }
  }
  const actions: SheetAction[] = [...actionEntities.values()]
    .map((entity) => {
      const cost = actionCost(entityActionCost(entity));
      const granted = result.actions.find(
        (action) => action.id === entity.id || action.sourceId === entity.id
      );
      const maximum =
        typeof granted?.parameters["maximum"] === "number"
          ? granted.parameters["maximum"]
          : undefined;
      return {
        id: entity.id,
        name: entity.name,
        sourceId: granted?.sourceId ?? entity.id,
        sourceName: name(granted?.sourceId ?? entity.source),
        ...cost,
        traits: entity.traits,
        summary: entity.summary,
        used: result.session.actionUses[entity.id] ?? 0,
        ...(maximum === undefined ? {} : { maximum })
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "de"));
  const skills: SheetSkill[] = Object.entries(result.skills)
    .map(([id, value]) => {
      const skill = entities.get(id);
      return {
        id,
        name: name(id),
        attribute: skill?.type === "skill" ? skill.attribute : "unknown",
        value,
        rank: result.proficiencies[id] ?? "untrained"
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "de"));
  const attacks: SheetAttack[] = Object.entries(result.weaponAttacks)
    .map(([id, attack]) => {
      const weapon = entities.get(id);
      return {
        id,
        name: name(id),
        attack: attack.attack,
        damage: attack.damage,
        ...(attack.range === undefined
          ? {}
          : {
              range:
                typeof attack.range === "number"
                  ? `${String(attack.range)} Fuß`
                  : `${String(attack.range.increment)} / ${String(attack.range.maximum)} Fuß`
            }),
        hands: weapon?.type === "weapon" ? weapon.hands : 0,
        ...(attack.capacity === undefined ? {} : { capacity: attack.capacity }),
        ...(attack.reload === undefined ? {} : { reload: attack.reload }),
        traits: attack.traits
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "de"));

  return {
    identity: {
      name: document.build.name,
      level: document.build.level,
      ancestry: name(document.build.ancestryId),
      heritage: name(document.build.heritageId),
      background: name(document.build.backgroundId),
      className: name(document.build.classId)
    },
    actions,
    skills,
    attacks,
    features: featureIds
      .map((id) => entities.get(id))
      .filter((entity): entity is ContentEntity => entity !== undefined),
    spells: result.spellIds
      .map((id) => entities.get(id))
      .filter(
        (entity): entity is Extract<ContentEntity, { type: "spell" }> => entity?.type === "spell"
      )
      .sort((left, right) => left.rank - right.rank || left.name.localeCompare(right.name, "de")),
    inventory: result.inventoryIds
      .map((id) => entities.get(id))
      .filter(
        (
          entity
        ): entity is Extract<
          ContentEntity,
          { type: "weapon" | "armor" | "equipment" | "cyberware" }
        > =>
          entity !== undefined &&
          ["weapon", "armor", "equipment", "cyberware"].includes(entity.type)
      ),
    conditionEntities: catalog.entities.filter(
      (entity): entity is Extract<ContentEntity, { type: "condition" }> =>
        entity.type === "condition"
    ),
    name
  };
};

export type CharacterSheetModel = ReturnType<typeof buildSheetModel>;
