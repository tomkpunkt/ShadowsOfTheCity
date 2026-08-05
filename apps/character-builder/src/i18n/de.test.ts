import { describe, expect, it } from "vitest";

import { catalog } from "../catalog.js";
import {
  contentStatusLabels,
  entityTypeLabels,
  formatContentStatus,
  formatEntityType,
  itemAvailabilityLabels,
  itemCategoryLabels,
  itemOriginLabels,
  itemQualityLabels,
  itemSubcategoryLabels,
  technologyLevelLabels
} from "./de.js";
import { isItemEntity } from "../item-catalog.js";

describe("deutsche UI-Labels", () => {
  it("covers every entity type and content status used by the active catalog", () => {
    for (const entity of catalog.entities) {
      expect(formatEntityType(entity.type)).not.toBe("Nicht lokalisierter Wert");
      expect(formatContentStatus(entity.status)).not.toBe("Nicht lokalisierter Wert");
    }
  });

  it("contains no technical fallback labels", () => {
    expect(Object.values(entityTypeLabels)).not.toContain("class-feature");
    expect(Object.values(contentStatusLabels)).not.toContain("legacy");
    expect(entityTypeLabels["class-feature"]).toBe("Klassenmerkmal");
    expect(contentStatusLabels.legacy).toBe("Aus dem Altbestand");
  });

  it("localizes every closed item-classification value in the catalog", () => {
    for (const item of catalog.entities.filter(isItemEntity)) {
      expect(itemCategoryLabels[item.category]).toBeTruthy();
      expect(itemSubcategoryLabels[item.subcategory]).toBeTruthy();
      expect(technologyLevelLabels[item.technologyLevel]).toBeTruthy();
      expect(itemAvailabilityLabels[item.availability]).toBeTruthy();
      for (const origin of item.origins) {
        expect(itemOriginLabels[origin]).toBeTruthy();
      }
      if (item.quality !== undefined) {
        expect(itemQualityLabels[item.quality]).toBeTruthy();
      }
    }
  });
});
