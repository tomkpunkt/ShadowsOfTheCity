import { describe, expect, it } from "vitest";

import { parseDiceFormula, rollDiceFormula } from "./dice.js";

describe("dice formulas", () => {
  it.each(["1d20+8", "2d6+4", "1d8+1d6+3"])("parses %s", (formula) => {
    expect(parseDiceFormula(formula).formula).toBe(formula);
  });

  it("rolls with an injectable random source", () => {
    const result = rollDiceFormula("2d6+4", () => 0.5);

    expect(result.rolls).toEqual([4, 4]);
    expect(result.total).toBe(12);
  });

  it.each(["", "alert(1)", "1d1", "101d6", "1d1001", "1d20+Infinity", "1d20+10001"])(
    "rejects unsafe formula %s",
    (formula) => {
      expect(() => parseDiceFormula(formula)).toThrow();
    }
  );
});
