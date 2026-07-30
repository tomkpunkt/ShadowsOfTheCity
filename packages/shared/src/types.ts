import type { z } from "zod";

import type {
  CatalogSchema,
  ChoiceSchema,
  ContentEntitySchema,
  EffectSchema,
  PredicateSchema
} from "./schemas.js";

export type Catalog = z.infer<typeof CatalogSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type ContentEntity = z.infer<typeof ContentEntitySchema>;
export type Effect = z.infer<typeof EffectSchema>;
export type Predicate = z.infer<typeof PredicateSchema>;
