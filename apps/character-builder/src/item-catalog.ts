import type { ContentEntity } from "@sotc/shared";

export type ItemEntity = Extract<
  ContentEntity,
  { type: "weapon" | "armor" | "equipment" | "cyberware" }
>;

export interface ItemCatalogFilters {
  category: string;
  subcategory: string;
  technologyLevel: string;
  availability: string;
  origin: string;
  quality: string;
  trait: string;
  minLevel: string;
  maxLevel: string;
  maxPrice: string;
  maxBulk: string;
}

export type ItemSort = "name" | "level" | "price-asc" | "price-desc" | "bulk";
export type ItemGrouping = "none" | "category" | "subcategory";

export const emptyItemFilters = (): ItemCatalogFilters => ({
  category: "all",
  subcategory: "all",
  technologyLevel: "all",
  availability: "all",
  origin: "all",
  quality: "all",
  trait: "all",
  minLevel: "",
  maxLevel: "",
  maxPrice: "",
  maxBulk: ""
});

export const isItemEntity = (entity: ContentEntity): entity is ItemEntity =>
  entity.type === "weapon" ||
  entity.type === "armor" ||
  entity.type === "equipment" ||
  entity.type === "cyberware";

const withinMaximum = (value: number, maximum: string): boolean =>
  maximum === "" || value <= Number(maximum);

const aboveMinimum = (value: number, minimum: string): boolean =>
  minimum === "" || value >= Number(minimum);

export const itemMatchesFilters = (item: ItemEntity, filters: ItemCatalogFilters): boolean =>
  (filters.category === "all" || item.category === filters.category) &&
  (filters.subcategory === "all" || item.subcategory === filters.subcategory) &&
  (filters.technologyLevel === "all" || item.technologyLevel === filters.technologyLevel) &&
  (filters.availability === "all" || item.availability === filters.availability) &&
  (filters.origin === "all" || item.origins.includes(filters.origin as never)) &&
  (filters.quality === "all" || item.quality === filters.quality) &&
  (filters.trait === "all" || item.traits.includes(filters.trait)) &&
  aboveMinimum(item.level, filters.minLevel) &&
  withinMaximum(item.level, filters.maxLevel) &&
  withinMaximum(item.priceGp, filters.maxPrice) &&
  withinMaximum(item.bulk, filters.maxBulk);

export const countActiveItemFilters = (filters: ItemCatalogFilters): number =>
  Object.values(filters).filter((value) => value !== "" && value !== "all").length;

export const sortItems = (items: ItemEntity[], sort: ItemSort): ItemEntity[] =>
  [...items].sort((left, right) => {
    if (sort === "level")
      return left.level - right.level || left.name.localeCompare(right.name, "de");
    if (sort === "price-asc")
      return left.priceGp - right.priceGp || left.name.localeCompare(right.name, "de");
    if (sort === "price-desc")
      return right.priceGp - left.priceGp || left.name.localeCompare(right.name, "de");
    if (sort === "bulk") return left.bulk - right.bulk || left.name.localeCompare(right.name, "de");
    return left.name.localeCompare(right.name, "de");
  });

export const uniqueItemValues = (
  items: ItemEntity[],
  field: "category" | "subcategory" | "technologyLevel" | "availability" | "quality"
): string[] =>
  [
    ...new Set(
      items.flatMap((item) => {
        const value = item[field];
        return value === undefined ? [] : [value];
      })
    )
  ].sort((left, right) => left.localeCompare(right, "de"));
