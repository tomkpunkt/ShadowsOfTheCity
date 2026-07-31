import { describe, expect, it } from "vitest";

import { catalog } from "./catalog.js";
import {
  countActiveItemFilters,
  emptyItemFilters,
  isItemEntity,
  itemMatchesFilters,
  sortItems
} from "./item-catalog.js";

const items = catalog.entities.filter(isItemEntity);

describe("redaktioneller Katalog und Ausrüstungstaxonomie", () => {
  it("keeps every active entity at least reviewed with a concrete unique summary", () => {
    const active = catalog.entities.filter((entity) => entity.status !== "draft");
    const summaries = active.map((entity) => entity.summary.toLocaleLowerCase("de"));

    expect(
      active.every((entity) => ["reviewed", "rewritten"].includes(entity.editorialStatus))
    ).toBe(true);
    expect(new Set(summaries).size).toBe(summaries.length);
    expect(
      active.some((entity) =>
        /Inhalt aus dem bestehenden Regelwerk|Kanonischer Skill|TODO|TBD/i.test(
          `${entity.summary} ${entity.rulesText}`
        )
      )
    ).toBe(false);
  });

  it("classifies every item across all required dimensions", () => {
    expect(items).toHaveLength(254);
    for (const item of items) {
      expect(item.category).toBeTruthy();
      expect(item.subcategory).toBeTruthy();
      expect(item.technologyLevel).toBeTruthy();
      expect(item.availability).toBeTruthy();
      expect(item.origins.length).toBeGreaterThan(0);
      expect(item.category).not.toBe("special");
    }
  });

  it("combines technology, availability, price, bulk, and origin filters", () => {
    const filters = {
      ...emptyItemFilters(),
      technologyLevel: "high-tech",
      availability: "common",
      origin: "corporate",
      maxPrice: "1000",
      maxBulk: "1"
    };
    const matches = items.filter((item) => itemMatchesFilters(item, filters));

    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (item) =>
          item.technologyLevel === "high-tech" &&
          item.availability === "common" &&
          item.origins.includes("corporate") &&
          item.priceGp <= 1000 &&
          item.bulk <= 1
      )
    ).toBe(true);
    expect(countActiveItemFilters(filters)).toBe(5);
  });

  it("sorts item results deterministically", () => {
    const byPrice = sortItems(items, "price-desc");
    expect(byPrice[0]?.priceGp).toBeGreaterThanOrEqual(byPrice.at(-1)?.priceGp ?? 0);
    expect(sortItems(items, "name").map((item) => item.id)).toEqual(
      sortItems(items, "name").map((item) => item.id)
    );
  });
});
