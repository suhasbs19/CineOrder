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
 * CineOrder Editorial Overrides Registry.
 *
 * GOVERNANCE DIRECTIVE (v1.0-framework-freeze):
 * All recommendation logic is natively modeled in the CineOrder Knowledge Graph.
 * This registry is reserved exclusively for:
 * - 🟧 EDITORIAL EXCEPTION (e.g. cross-continuity multiverse prerequisite modeling)
 * - 🟥 FRAMEWORK LIMITATION (formally documented engine modeling limitations)
 */
const NO_WAY_HOME_OVERRIDE: EditorialOverrideConfig = {
  targetId: 'mcu-spiderman-no-way-home',
  overrideReason:
    'Spider-Man: No Way Home is a multiversal crossover directly incorporating characters, villain origins, and narrative resolutions from the Sam Raimi and Marc Webb Spider-Man continuities alongside MCU Spider-Man.',
  rules: [
    {
      sourceId: 'spiderman-1',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'major-crossover',
      reason:
        'Establishes Tobey Maguire Peter Parker (Peter-Two) origin and Green Goblin (Norman Osborn) villain arc directly resolved in No Way Home.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
    {
      sourceId: 'spiderman-2',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'major-crossover',
      reason:
        'Establishes Doc Ock (Dr. Otto Octavius) villain arc, inhibitor chip flaw, and redemption directly resolved in No Way Home.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
    {
      sourceId: 'spiderman-3',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'major-crossover',
      reason:
        'Establishes Sandman (Flint Marko) backstory and emotional resolution in No Way Home.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
    {
      sourceId: 'amazing-spiderman-1',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'major-crossover',
      reason:
        'Establishes Andrew Garfield Peter Parker (Peter-Three) and Lizard (Dr. Curt Connors) arc resolved in No Way Home.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
    {
      sourceId: 'amazing-spiderman-2',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'major-crossover',
      reason:
        'Establishes Electro (Max Dillon) arc and Andrew Garfield Peter Parker grief over Gwen Stacy resolved in No Way Home.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
    {
      sourceId: 'mcu-spider-man-homecoming',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'direct-sequel',
      reason:
        'Establishes Tom Holland Peter Parker, high school friends Ned and MJ, and the MCU Spider-Man trilogy foundation.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
    {
      sourceId: 'mcu-spider-man-ffh',
      targetId: 'mcu-spiderman-no-way-home',
      categoryOverride: 'must_watch',
      strengthOverride: 'required',
      relationshipOverride: 'direct-sequel',
      reason:
        'Mysterio unmasking of Peter Parker at the end of Far From Home directly triggers the events and crisis of No Way Home.',
      classification: '🟧 EDITORIAL EXCEPTION',
    },
  ],
};

export const EDITORIAL_OVERRIDES: Record<string, EditorialOverrideConfig> = {
  'mcu-spiderman-no-way-home': NO_WAY_HOME_OVERRIDE,
  'mcu-no-way-home': NO_WAY_HOME_OVERRIDE,
};

export default EDITORIAL_OVERRIDES;
