import { CatalogSchema, type Catalog, type ContentEntity } from "@sotc/shared";

import catalogJson from "../../../generated/catalog.json" with { type: "json" };

export const catalog: Catalog = CatalogSchema.parse(catalogJson);

export const entities = new Map<string, ContentEntity>(
  catalog.entities.map((entity) => [entity.id, entity])
);

export const entitiesOfType = <T extends ContentEntity["type"]>(
  type: T
): Array<Extract<ContentEntity, { type: T }>> =>
  catalog.entities.filter(
    (entity): entity is Extract<ContentEntity, { type: T }> => entity.type === type
  );

export const entityName = (id: string | undefined): string =>
  id === undefined ? "Nicht gewählt" : (entities.get(id)?.name ?? "Unbekannter Katalogeintrag");
