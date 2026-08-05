import { CharacterSessionStateSchema, type CharacterSessionState } from "@sotc/shared";

export interface SessionEventContext {
  id: string;
  createdAt: string;
  source?: string;
}

export type RestType = "encounter" | "short-rest" | "daily";

const validatedSession = (session: CharacterSessionState): CharacterSessionState =>
  CharacterSessionStateSchema.parse(session);

const validAmount = (amount: number): number => {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError("Amount must be a finite non-negative number.");
  }
  return amount;
};

const validMaximum = (maximum: number): number => {
  if (!Number.isFinite(maximum) || maximum < 0) {
    throw new RangeError("Maximum must be a finite non-negative number.");
  }
  return maximum;
};

const currentHp = (session: CharacterSessionState, maximumHp: number): number =>
  Math.min(session.currentHp ?? maximumHp, maximumHp);

const withHpHistory = (
  session: CharacterSessionState,
  entry: CharacterSessionState["hpHistory"][number]
): CharacterSessionState => ({
  ...session,
  hpHistory: [...session.hpHistory, entry].slice(-100)
});

export const emptySessionState = (): CharacterSessionState =>
  CharacterSessionStateSchema.parse({ version: 1 });

export const resolveCurrentHp = (session: CharacterSessionState, maximumHp: number): number =>
  currentHp(validatedSession(session), validMaximum(maximumHp));

export const applyDamage = (
  sessionInput: CharacterSessionState,
  maximumHpInput: number,
  amountInput: number,
  context: SessionEventContext
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const maximumHp = validMaximum(maximumHpInput);
  const amount = validAmount(amountInput);
  const previousHp = currentHp(session, maximumHp);
  const absorbed = Math.min(session.temporaryHp, amount);
  const nextTemporaryHp = session.temporaryHp - absorbed;
  const nextHp = Math.max(0, previousHp - (amount - absorbed));
  return withHpHistory(
    {
      ...session,
      currentHp: nextHp,
      temporaryHp: nextTemporaryHp
    },
    {
      id: context.id,
      kind: "damage",
      amount,
      previousHp,
      nextHp,
      previousTemporaryHp: session.temporaryHp,
      nextTemporaryHp,
      ...(context.source === undefined ? {} : { source: context.source }),
      createdAt: context.createdAt
    }
  );
};

export const applyHealing = (
  sessionInput: CharacterSessionState,
  maximumHpInput: number,
  amountInput: number,
  context: SessionEventContext
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const maximumHp = validMaximum(maximumHpInput);
  const amount = validAmount(amountInput);
  const previousHp = currentHp(session, maximumHp);
  const nextHp = Math.min(maximumHp, previousHp + amount);
  return withHpHistory(
    { ...session, currentHp: nextHp },
    {
      id: context.id,
      kind: "healing",
      amount,
      previousHp,
      nextHp,
      previousTemporaryHp: session.temporaryHp,
      nextTemporaryHp: session.temporaryHp,
      ...(context.source === undefined ? {} : { source: context.source }),
      createdAt: context.createdAt
    }
  );
};

export const setTemporaryHp = (
  sessionInput: CharacterSessionState,
  maximumHpInput: number,
  amountInput: number,
  context: SessionEventContext
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const maximumHp = validMaximum(maximumHpInput);
  const amount = validAmount(amountInput);
  const hp = currentHp(session, maximumHp);
  return withHpHistory(
    { ...session, currentHp: hp, temporaryHp: amount },
    {
      id: context.id,
      kind: "temporary-hp",
      amount: Math.abs(amount - session.temporaryHp),
      previousHp: hp,
      nextHp: hp,
      previousTemporaryHp: session.temporaryHp,
      nextTemporaryHp: amount,
      ...(context.source === undefined ? {} : { source: context.source }),
      createdAt: context.createdAt
    }
  );
};

export const undoLastHpChange = (
  sessionInput: CharacterSessionState,
  context: SessionEventContext
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const previous = session.hpHistory.at(-1);
  if (previous === undefined || previous.kind === "undo") {
    return session;
  }
  return withHpHistory(
    {
      ...session,
      currentHp: previous.previousHp,
      temporaryHp: previous.previousTemporaryHp
    },
    {
      id: context.id,
      kind: "undo",
      amount: previous.amount,
      previousHp: previous.nextHp,
      nextHp: previous.previousHp,
      previousTemporaryHp: previous.nextTemporaryHp,
      nextTemporaryHp: previous.previousTemporaryHp,
      ...(context.source === undefined ? {} : { source: context.source }),
      createdAt: context.createdAt
    }
  );
};

export const changeResource = (
  sessionInput: CharacterSessionState,
  resourceId: string,
  deltaInput: number,
  maximumInput: number,
  recovery: CharacterSessionState["resources"][string]["recovery"] = "manual",
  sourceId?: string
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const maximum = validMaximum(maximumInput);
  if (!Number.isFinite(deltaInput)) {
    throw new RangeError("Resource delta must be finite.");
  }
  const previous = session.resources[resourceId]?.current ?? maximum;
  const current = Math.max(0, Math.min(maximum, previous + deltaInput));
  return {
    ...session,
    resources: {
      ...session.resources,
      [resourceId]: {
        ...session.resources[resourceId],
        current,
        maximum,
        recovery,
        ...(sourceId === undefined ? {} : { sourceId })
      }
    }
  };
};

export const resetResources = (
  sessionInput: CharacterSessionState,
  rest: RestType
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const recoveries =
    rest === "daily"
      ? new Set(["daily", "short-rest", "encounter"])
      : rest === "short-rest"
        ? new Set(["short-rest", "encounter"])
        : new Set(["encounter"]);
  return {
    ...session,
    resources: Object.fromEntries(
      Object.entries(session.resources).map(([id, resource]) => [
        id,
        recoveries.has(resource.recovery) && resource.maximum !== undefined
          ? { ...resource, current: resource.maximum }
          : resource
      ])
    )
  };
};

export const useSpellSlot = (
  sessionInput: CharacterSessionState,
  rank: number,
  maximum: number
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  if (!Number.isInteger(rank) || rank < 1) {
    throw new RangeError("Spell rank must be a positive integer.");
  }
  const slotMaximum = validMaximum(maximum);
  const key = String(rank);
  const used = session.spellSlotUsage[key] ?? 0;
  if (used >= slotMaximum) {
    return session;
  }
  return {
    ...session,
    spellSlotUsage: {
      ...session.spellSlotUsage,
      [key]: used + 1
    }
  };
};

export const restoreSpellSlot = (
  sessionInput: CharacterSessionState,
  rank: number
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const key = String(rank);
  const used = session.spellSlotUsage[key] ?? 0;
  return {
    ...session,
    spellSlotUsage: {
      ...session.spellSlotUsage,
      [key]: Math.max(0, used - 1)
    }
  };
};

export const useLimitedAction = (
  sessionInput: CharacterSessionState,
  actionId: string,
  maximum: number
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const limit = validMaximum(maximum);
  const used = session.actionUses[actionId] ?? 0;
  if (used >= limit) {
    return session;
  }
  return {
    ...session,
    actionUses: {
      ...session.actionUses,
      [actionId]: used + 1
    }
  };
};

export const recordActionUse = (
  sessionInput: CharacterSessionState,
  actionId: string
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return {
    ...session,
    actionUses: {
      ...session.actionUses,
      [actionId]: (session.actionUses[actionId] ?? 0) + 1
    }
  };
};

export const restoreLimitedAction = (
  sessionInput: CharacterSessionState,
  actionId: string
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return {
    ...session,
    actionUses: {
      ...session.actionUses,
      [actionId]: Math.max(0, (session.actionUses[actionId] ?? 0) - 1)
    }
  };
};

export const setItemState = (
  sessionInput: CharacterSessionState,
  itemId: string,
  patch: Partial<CharacterSessionState["itemStates"][string]>
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  const current = session.itemStates[itemId] ?? {
    quantity: 1,
    equipped: false,
    active: false,
    consumed: 0,
    location: "carried" as const
  };
  const next = {
    ...current,
    ...patch
  };
  if (next.quantity < 0 || next.consumed < 0 || (next.ammunition ?? 0) < 0) {
    throw new RangeError("Item quantities must be non-negative.");
  }
  return validatedSession({
    ...session,
    itemStates: {
      ...session.itemStates,
      [itemId]: next
    }
  });
};

export const addCondition = (
  sessionInput: CharacterSessionState,
  condition: CharacterSessionState["conditions"][number]
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return validatedSession({
    ...session,
    conditions: [...session.conditions.filter((entry) => entry.id !== condition.id), condition]
  });
};

export const setConditionActive = (
  sessionInput: CharacterSessionState,
  conditionId: string,
  active: boolean
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return {
    ...session,
    conditions: session.conditions.map((condition) =>
      condition.id === conditionId ? { ...condition, active } : condition
    )
  };
};

export const removeCondition = (
  sessionInput: CharacterSessionState,
  conditionId: string
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return {
    ...session,
    conditions: session.conditions.filter((condition) => condition.id !== conditionId)
  };
};

export const upsertManualModifier = (
  sessionInput: CharacterSessionState,
  modifier: CharacterSessionState["manualModifiers"][number]
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return validatedSession({
    ...session,
    manualModifiers: [
      ...session.manualModifiers.filter((entry) => entry.id !== modifier.id),
      modifier
    ]
  });
};

export const setManualModifierActive = (
  sessionInput: CharacterSessionState,
  modifierId: string,
  active: boolean
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return {
    ...session,
    manualModifiers: session.manualModifiers.map((modifier) =>
      modifier.id === modifierId ? { ...modifier, active } : modifier
    )
  };
};

export const removeManualModifier = (
  sessionInput: CharacterSessionState,
  modifierId: string
): CharacterSessionState => {
  const session = validatedSession(sessionInput);
  return {
    ...session,
    manualModifiers: session.manualModifiers.filter((modifier) => modifier.id !== modifierId)
  };
};
