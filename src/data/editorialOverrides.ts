import type { CategoryType } from '@/types/preparation';
import type { CKGEdgeRelationship, CKGEdgeStrength } from '@/data/cineOrderKnowledgeGraph';

export interface EditorialOverrideRule {
  sourceId: string;
  targetId: string;
  categoryOverride?: CategoryType;
  strengthOverride?: CKGEdgeStrength;
  relationshipOverride?: CKGEdgeRelationship;
  reason: string;
  classification?: '🟧 EDITORIAL EXCEPTION' | '🟥 FRAMEWORK LIMITATION';
}

export interface EditorialOverrideConfig {
  targetId: string;
  overrideReason: string;
  rules: EditorialOverrideRule[];
}

/**
 * CineOrder Editorial Overrides Scaffolding Registry.
 *
 * GOVERNANCE DIRECTIVE (v1.0-framework-freeze):
 * All recommendation logic is natively modeled in the CineOrder Knowledge Graph (src/data/cineOrderKnowledgeGraph.ts).
 * This registry is reserved exclusively for temporary scaffolding:
 * - 🟧 EDITORIAL EXCEPTION (e.g. pre-OTT theatrical trailer policy / cross-franchise licensing)
 * - 🟥 FRAMEWORK LIMITATION (formally documented engine modeling limitations)
 *
 * Current Status: 100% Native Knowledge Graph Recommendation Engine Active (0 Active Overrides).
 */
export const EDITORIAL_OVERRIDES: Record<string, EditorialOverrideConfig> = {};

export default EDITORIAL_OVERRIDES;
