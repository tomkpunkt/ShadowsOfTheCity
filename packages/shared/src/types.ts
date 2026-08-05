import type { z } from "zod";

import type {
  CatalogSchema,
  CharacterBuildSchema,
  CharacterDocumentSchema,
  CharacterSessionStateSchema,
  ChoiceSchema,
  ContentEntitySchema,
  EffectSchema,
  PredicateSchema
} from "./schemas.js";

export type Catalog = z.infer<typeof CatalogSchema>;
export type CharacterBuild = z.infer<typeof CharacterBuildSchema>;
export type CharacterDocument = z.infer<typeof CharacterDocumentSchema>;
export type CharacterSessionState = z.infer<typeof CharacterSessionStateSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type ContentEntity = z.infer<typeof ContentEntitySchema>;
export type Effect = z.infer<typeof EffectSchema>;
export type Predicate = z.infer<typeof PredicateSchema>;
