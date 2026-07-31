import { describe, expect, it } from "vitest";

import {
  addCondition,
  applyDamage,
  applyHealing,
  changeResource,
  emptySessionState,
  resetResources,
  restoreSpellSlot,
  restoreLimitedAction,
  setConditionActive,
  setItemState,
  setManualModifierActive,
  setTemporaryHp,
  undoLastHpChange,
  upsertManualModifier,
  useLimitedAction,
  useSpellSlot
} from "./session.js";

const event = (id: string) => ({
  id,
  createdAt: "2026-07-31T08:00:00.000Z"
});

describe("session state", () => {
  it("applies temporary hit points before current hit points", () => {
    const session = applyDamage(
      setTemporaryHp(emptySessionState(), 30, 5, event("hp:temp")),
      30,
      8,
      event("hp:damage")
    );

    expect(session.temporaryHp).toBe(0);
    expect(session.currentHp).toBe(27);
    expect(session.hpHistory.at(-1)).toMatchObject({
      kind: "damage",
      previousHp: 30,
      nextHp: 27
    });
  });

  it("clamps healing and can undo the last HP change", () => {
    const damaged = applyDamage(emptySessionState(), 20, 9, event("hp:damage"));
    const healed = applyHealing(damaged, 20, 30, event("hp:healing"));
    const restored = undoLastHpChange(healed, event("hp:undo"));

    expect(healed.currentHp).toBe(20);
    expect(restored.currentHp).toBe(11);
    expect(restored.hpHistory.at(-1)?.kind).toBe("undo");
  });

  it("rejects invalid HP input", () => {
    expect(() => applyDamage(emptySessionState(), 20, -1, event("hp:invalid"))).toThrow(RangeError);
    expect(() => applyHealing(emptySessionState(), 20, Number.NaN, event("hp:nan"))).toThrow(
      RangeError
    );
  });

  it("consumes and restores only resources matching a rest", () => {
    let session = changeResource(emptySessionState(), "resource.focus", -2, 3, "short-rest");
    session = changeResource(session, "resource.daily", -1, 1, "daily");

    const shortRest = resetResources(session, "short-rest");
    expect(shortRest.resources["resource.focus"]?.current).toBe(3);
    expect(shortRest.resources["resource.daily"]?.current).toBe(0);

    const daily = resetResources(shortRest, "daily");
    expect(daily.resources["resource.daily"]?.current).toBe(1);
  });

  it("tracks spell slot usage without exceeding the available slots", () => {
    let session = useSpellSlot(emptySessionState(), 2, 1);
    session = useSpellSlot(session, 2, 1);
    expect(session.spellSlotUsage["2"]).toBe(1);

    session = restoreSpellSlot(session, 2);
    expect(session.spellSlotUsage["2"]).toBe(0);
  });

  it("tracks limited actions and manual modifiers", () => {
    let session = useLimitedAction(emptySessionState(), "action.test", 1);
    session = useLimitedAction(session, "action.test", 1);
    expect(session.actionUses["action.test"]).toBe(1);

    session = restoreLimitedAction(session, "action.test");
    session = upsertManualModifier(session, {
      id: "modifier:cover",
      target: "armor-class",
      value: 1,
      bonusType: "circumstance",
      source: "Deckung",
      active: true
    });
    session = setManualModifierActive(session, "modifier:cover", false);

    expect(session.actionUses["action.test"]).toBe(0);
    expect(session.manualModifiers[0]).toMatchObject({
      source: "Deckung",
      active: false
    });
  });

  it("keeps item and condition state separate from the build", () => {
    let session = setItemState(emptySessionState(), "weapon.test", {
      quantity: 2,
      equipped: true,
      ammunition: 6,
      location: "equipped"
    });
    session = addCondition(session, {
      id: "condition:one",
      conditionId: "condition.test",
      name: "Benommen",
      source: "Test",
      active: true
    });
    session = setConditionActive(session, "condition:one", false);

    expect(session.itemStates["weapon.test"]).toMatchObject({
      quantity: 2,
      equipped: true,
      ammunition: 6
    });
    expect(session.conditions[0]?.active).toBe(false);
  });
});
