export interface DiceTerm {
  count: number;
  sides: number;
  sign: 1 | -1;
}

export interface ParsedDiceFormula {
  formula: string;
  dice: DiceTerm[];
  modifier: number;
}

export interface DiceRollResult extends ParsedDiceFormula {
  rolls: number[];
  total: number;
}

const maximumTerms = 20;
const maximumDice = 100;
const maximumSides = 1000;
const maximumModifier = 10_000;

export const parseDiceFormula = (input: string): ParsedDiceFormula => {
  const formula = input.replace(/\s+/g, "").toLowerCase();
  if (formula.length === 0 || formula.length > 100) {
    throw new Error("Die Würfelformel ist leer oder zu lang.");
  }
  const tokens = formula.match(/[+-]?(?:\d+d\d+|\d+)/g);
  if (tokens === null || tokens.join("") !== formula || tokens.length > maximumTerms) {
    throw new Error("Die Würfelformel ist ungültig.");
  }

  const dice: DiceTerm[] = [];
  let modifier = 0;
  for (const token of tokens) {
    const sign: 1 | -1 = token.startsWith("-") ? -1 : 1;
    const unsigned = token.replace(/^[+-]/, "");
    if (unsigned.includes("d")) {
      const [countText, sidesText] = unsigned.split("d");
      const count = Number(countText);
      const sides = Number(sidesText);
      if (
        !Number.isInteger(count) ||
        !Number.isInteger(sides) ||
        count < 1 ||
        sides < 2 ||
        sides > maximumSides
      ) {
        throw new Error("Würfelanzahl und Seitenzahl liegen außerhalb des erlaubten Bereichs.");
      }
      dice.push({ count, sides, sign });
    } else {
      modifier += sign * Number(unsigned);
    }
  }

  if (dice.length === 0) {
    throw new Error("Die Formel muss mindestens einen Würfel enthalten.");
  }
  if (dice.reduce((sum, term) => sum + term.count, 0) > maximumDice) {
    throw new Error(`Eine Formel darf höchstens ${String(maximumDice)} Würfel enthalten.`);
  }
  if (!Number.isFinite(modifier) || Math.abs(modifier) > maximumModifier) {
    throw new Error("Der feste Modifikator ist zu groß.");
  }
  return { formula, dice, modifier };
};

export const rollDiceFormula = (
  input: string,
  random: () => number = Math.random
): DiceRollResult => {
  const parsed = parseDiceFormula(input);
  const rolls: number[] = [];
  let total = parsed.modifier;
  for (const term of parsed.dice) {
    for (let index = 0; index < term.count; index += 1) {
      const randomValue = random();
      if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
        throw new Error("Die Zufallsquelle lieferte einen ungültigen Wert.");
      }
      const roll = Math.floor(randomValue * term.sides) + 1;
      rolls.push(term.sign * roll);
      total += term.sign * roll;
    }
  }
  return {
    ...parsed,
    rolls,
    total
  };
};
