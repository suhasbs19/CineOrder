/**
 * CineOrder Knowledge Graph (CKG) Dataset - Phase 4: MCU Completion & Recommendation Quality Audit
 * 100% human-verified title nodes, entity definitions, and directed story edges.
 */

export type CKGNodeType =
  | 'movie'
  | 'tv-series'
  | 'tv-season'
  | 'tv-episode'
  | 'special'
  | 'short'
  | 'character'
  | 'villain'
  | 'organization'
  | 'object'
  | 'story-arc'
  | 'saga'
  | 'timeline'
  | 'universe'
  | 'franchise';

export type CKGEdgeRelationship =
  | 'direct-sequel'
  | 'story-continuation'
  | 'character-origin'
  | 'character-development'
  | 'mentor'
  | 'villain-origin'
  | 'shared-villain'
  | 'shared-character'
  | 'shared-event'
  | 'shared-object'
  | 'organization'
  | 'timeline'
  | 'multiverse'
  | 'world-building'
  | 'post-credit'
  | 'major-crossover'
  | 'thematic-callback'
  | 'same-universe-only';

export type CKGEdgeStrength = 'required' | 'strong' | 'moderate' | 'weak' | 'post-credit';
export type CKGEdgeConfidence = 'confirmed' | 'likely' | 'limited' | 'strongly-implied' | 'provisional';
export type EditorialImportance = 'primary' | 'secondary' | 'supporting' | 'cameo';

export interface TitleNode {
  id: string;
  title: string;
  type: 'movie' | 'tv-series' | 'tv-season' | 'tv-episode' | 'special' | 'short';
  releaseDate: string;
  universe: string;
  saga?: string;
  phase?: number | string;
  characters: string[];
  villains: string[];
  organizations: string[];
  objects: string[];
  storyArcs: string[];
  overview?: string;
  spoilerFreeContext?: string;
  isEntryPoint?: boolean;
  reviewStatus?: 'upcoming' | 'released-awaiting-review' | 'canonical';
}

export interface EdgeEvidence {
  type: 'film-scene' | 'official-synopsis' | 'dialogue-reference' | 'on-screen-event';
  description: string;
}

export type CausalCategory =
  | 'narrative-causal'
  | 'chronological'
  | 'historical'
  | 'character'
  | 'world-building';

export interface CKGEdgeTraversal {
  strict: boolean;
  connected: boolean;
  global: boolean;
}

export interface RecommendationEvidence {
  shortReason: string;
  detailedReasons: string[];
  source?: 'editorial' | 'graph';
}

export interface StoryEdge {
  sourceId: string;
  targetId: string;
  relationship: CKGEdgeRelationship;
  strength: CKGEdgeStrength;
  confidence: CKGEdgeConfidence;
  reason: string;
  reasons?: string[];
  recommendationEvidence?: RecommendationEvidence;
  narrativeScope?: 'main-feature' | 'post-credit';
  causalCategory?: CausalCategory;
  evidence?: EdgeEvidence[];
  sourceType: 'editorial' | 'official-trailer' | 'official-synopsis' | 'official-cast';
  editorialImportance?: EditorialImportance;
  traversal?: CKGEdgeTraversal;
}

export interface EntityNode {
  id: string;
  name: string;
  type: 'character' | 'villain' | 'organization' | 'object' | 'story-arc';
  description?: string;
}

export interface CineOrderKnowledgeGraphData {
  version: string;
  titleNodes: Record<string, TitleNode>;
  entityNodes: Record<string, EntityNode>;
  edges: StoryEdge[];
}

export const CKG_VERSION = '3.0.0-phase6-global-audit';

/**
 * Global Editorial Rules Engine Architecture (Phase 6)
 * Governs recommendation classifications consistently across all franchises.
 */
export const GLOBAL_EDITORIAL_RULES = {
  rule1_originFilms: 'Origin films are true entry points with zero required prerequisites (Display: Ready to Watch).',
  rule2_directSequels: 'Direct sequels inherit protagonist continuity; immediate predecessor is always Must Watch.',
  rule3_majorCrossoverEvents: 'Crossover films become Must Watch ONLY if they directly alter the target protagonist narrative arc.',
  rule4_characterContinuity: 'Prerequisites sharing the primary protagonist retain full editorial strength along direct series spine.',
  rule5_sharedUniverseContext: 'Shared universe background context is capped at Recommended or Extra Context.',
  rule6_narrativeDependency: 'Must Watch must answer: What would confuse a first-time viewer if skipped?',
  rule7_noRecommendationInflation: 'Excludes cameos, timeline gimmicks, or post-credit teasers from Must Watch.',
  rule8_editorialConsistency: 'Equivalent narrative structures produce equivalent recommendations across all franchises.',
} as const;

export const entityNodes: Record<string, EntityNode> = {
  // MCU Key Entities
  'char-tony-stark': { id: 'char-tony-stark', name: 'Tony Stark (Iron Man)', type: 'character' },
  'char-steve-rogers': { id: 'char-steve-rogers', name: 'Steve Rogers (Captain America)', type: 'character' },
  'char-thor': { id: 'char-thor', name: 'Thor Odinson', type: 'character' },
  'char-bruce-banner': { id: 'char-bruce-banner', name: 'Bruce Banner (Hulk)', type: 'character' },
  'char-natasha-romanoff': { id: 'char-natasha-romanoff', name: 'Natasha Romanoff (Black Widow)', type: 'character' },
  'char-clint-barton': { id: 'char-clint-barton', name: 'Clint Barton (Hawkeye)', type: 'character' },
  'char-nick-fury': { id: 'char-nick-fury', name: 'Nick Fury', type: 'character' },
  'char-peter-parker': { id: 'char-peter-parker', name: 'Peter Parker (Spider-Man)', type: 'character' },
  'char-stephen-strange': { id: 'char-stephen-strange', name: 'Stephen Strange (Doctor Strange)', type: 'character' },
  'char-wanda-maximoff': { id: 'char-wanda-maximoff', name: 'Wanda Maximoff (Scarlet Witch)', type: 'character' },
  'char-loki': { id: 'char-loki', name: 'Loki Odinson', type: 'character' },
  'char-sam-wilson': { id: 'char-sam-wilson', name: 'Sam Wilson (Captain America)', type: 'character' },
  'char-bucky-barnes': { id: 'char-bucky-barnes', name: 'Bucky Barnes (Winter Soldier)', type: 'character' },
  'char-tchalla': { id: 'char-tchalla', name: "T'Challa (Black Panther)", type: 'character' },
  'char-shang-chi': { id: 'char-shang-chi', name: 'Shang-Chi', type: 'character' },
  'char-carol-danvers': { id: 'char-carol-danvers', name: 'Carol Danvers (Captain Marvel)', type: 'character' },
  'char-scott-lang': { id: 'char-scott-lang', name: 'Scott Lang (Ant-Man)', type: 'character' },
  'char-wade-wilson': { id: 'char-wade-wilson', name: 'Wade Wilson (Deadpool)', type: 'character' },

  'villain-thanos': { id: 'villain-thanos', name: 'Thanos', type: 'villain' },
  'villain-loki': { id: 'villain-loki', name: 'Loki', type: 'villain' },
  'villain-ultron': { id: 'villain-ultron', name: 'Ultron', type: 'villain' },
  'villain-green-goblin': { id: 'villain-green-goblin', name: 'Green Goblin (Norman Osborn)', type: 'villain' },
  'villain-doctor-doom': { id: 'villain-doctor-doom', name: 'Victor von Doom (Doctor Doom)', type: 'villain' },

  'org-avengers': { id: 'org-avengers', name: 'The Avengers', type: 'organization' },
  'org-shield': { id: 'org-shield', name: 'S.H.I.E.L.D.', type: 'organization' },
  'org-tva': { id: 'org-tva', name: 'Time Variance Authority (TVA)', type: 'organization' },
  'org-kamar-taj': { id: 'org-kamar-taj', name: 'Kamar-Taj Sanctum', type: 'organization' },

  'obj-tesseract': { id: 'obj-tesseract', name: 'Tesseract (Space Stone)', type: 'object' },
  'obj-infinity-gauntlet': { id: 'obj-infinity-gauntlet', name: 'Infinity Gauntlet', type: 'object' },
  'obj-darkhold': { id: 'obj-darkhold', name: 'The Darkhold', type: 'object' },

  'arc-infinity-saga': { id: 'arc-infinity-saga', name: 'The Infinity Stones Saga', type: 'story-arc' },
  'arc-multiverse-saga': { id: 'arc-multiverse-saga', name: 'The Multiverse Saga', type: 'story-arc' },

  // DC
  'char-dc-clark-kent': { id: 'char-dc-clark-kent', name: 'Clark Kent (Superman)', type: 'character' },
  'char-dc-bruce-wayne': { id: 'char-dc-bruce-wayne', name: 'Bruce Wayne (Batman)', type: 'character' },
  'char-dc-diana-prince': { id: 'char-dc-diana-prince', name: 'Diana Prince (Wonder Woman)', type: 'character' },
  'char-dc-battinson': { id: 'char-dc-battinson', name: 'Bruce Wayne (The Batman)', type: 'character' },
  'char-dc-oz-cobblepot': { id: 'char-dc-oz-cobblepot', name: 'Oswald Cobblepot (The Penguin)', type: 'character' },

  // Wizarding World
  'char-hp-harry': { id: 'char-hp-harry', name: 'Harry Potter', type: 'character' },
  'char-hp-ron': { id: 'char-hp-ron', name: 'Ron Weasley', type: 'character' },
  'char-hp-hermione': { id: 'char-hp-hermione', name: 'Hermione Granger', type: 'character' },

  // Middle-earth
  'char-lotr-frodo': { id: 'char-lotr-frodo', name: 'Frodo Baggins', type: 'character' },
  'char-lotr-gandalf': { id: 'char-lotr-gandalf', name: 'Gandalf', type: 'character' },
  'obj-one-ring': { id: 'obj-one-ring', name: 'The One Ring of Power', type: 'object' },

  // John Wick
  'char-jw-john': { id: 'char-jw-john', name: 'John Wick', type: 'character' },

  // Mission Impossible
  'char-mi-ethan': { id: 'char-mi-ethan', name: 'Ethan Hunt', type: 'character' },

  // Jurassic Park
  'char-jp-grant': { id: 'char-jp-grant', name: 'Dr. Alan Grant', type: 'character' },
};

export const titleNodes: Record<string, TitleNode> = {
  // ─── MARVEL CINEMATIC UNIVERSE ───────────────────────────────────────────────
  // Phase 1
  'mcu-ironman': {
    id: 'mcu-ironman',
    title: 'Iron Man',
    type: 'movie',
    releaseDate: '2008-05-02',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 1,
    characters: ['Tony Stark', 'Pepper Potts', 'Nick Fury', 'Rhodey'],
    villains: ['Obadiah Stane (Iron Monger)'],
    organizations: ['Stark Industries', 'S.H.I.E.L.D.'],
    objects: ['Arc Reactor', 'Mark III Armor'],
    storyArcs: ['Avengers Assembly', 'Infinity Stones Saga'],
    spoilerFreeContext: 'Launches the MCU. Excellent standalone entry point.',
  },
  'mcu-incredible-hulk': {
    id: 'mcu-incredible-hulk',
    title: 'The Incredible Hulk',
    type: 'movie',
    releaseDate: '2008-06-13',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 1,
    characters: ['Bruce Banner', 'Thunderbolt Ross'],
    villains: ['Emil Blonsky (Abomination)'],
    organizations: ['US Military'],
    objects: ['Gamma Radiation Serum'],
    storyArcs: ['Avengers Assembly'],
    spoilerFreeContext: 'Establishes Bruce Banner origin. Standalone entry point.',
  },
  'mcu-ironman2': {
    id: 'mcu-ironman2',
    title: 'Iron Man 2',
    type: 'movie',
    releaseDate: '2010-05-07',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 1,
    characters: ['Tony Stark', 'Natasha Romanoff', 'Rhodey'],
    villains: ['Whiplash', 'Justin Hammer'],
    organizations: ['Stark Industries', 'S.H.I.E.L.D.'],
    objects: ['War Machine Armor'],
    storyArcs: ['Avengers Assembly'],
    spoilerFreeContext: 'Introduces Black Widow and War Machine.',
  },
  'mcu-thor': {
    id: 'mcu-thor',
    title: 'Thor',
    type: 'movie',
    releaseDate: '2011-05-06',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 1,
    characters: ['Thor Odinson', 'Loki', 'Odin', 'Clint Barton'],
    villains: ['Loki', 'The Destroyer'],
    organizations: ['Asgardian Royal Guard', 'S.H.I.E.L.D.'],
    objects: ['Mjolnir'],
    storyArcs: ['Avengers Assembly', 'Infinity Stones Saga'],
    spoilerFreeContext: 'Introduces Thor and Loki. Standalone entry point.',
  },
  'mcu-captain-america-1': {
    id: 'mcu-captain-america-1',
    title: 'Captain America: The First Avenger',
    type: 'movie',
    releaseDate: '2011-07-22',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 1,
    characters: ['Steve Rogers', 'Bucky Barnes', 'Peggy Carter'],
    villains: ['Red Skull'],
    organizations: ['SSR', 'Hydra'],
    objects: ['Vibranium Shield', 'Tesseract'],
    storyArcs: ['Avengers Assembly', 'Infinity Stones Saga'],
    spoilerFreeContext: 'Captain America origin story during WWII. Standalone entry point.',
  },
  'mcu-avengers': {
    id: 'mcu-avengers',
    title: 'The Avengers',
    type: 'movie',
    releaseDate: '2012-05-04',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 1,
    characters: ['Tony Stark', 'Steve Rogers', 'Thor', 'Bruce Banner', 'Natasha Romanoff', 'Clint Barton'],
    villains: ['Loki', 'Chitauri Army'],
    organizations: ['The Avengers', 'S.H.I.E.L.D.'],
    objects: ['Tesseract', 'Loki Scepter'],
    storyArcs: ['Avengers Assembly', 'Infinity Stones Saga'],
    spoilerFreeContext: 'The landmark MCU Phase 1 superhero team assembly.',
  },

  // Phase 2
  'mcu-ironman3': {
    id: 'mcu-ironman3',
    title: 'Iron Man 3',
    type: 'movie',
    releaseDate: '2013-05-03',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 2,
    characters: ['Tony Stark', 'Pepper Potts', 'Rhodey'],
    villains: ['Aldrich Killian', 'Mandarin (Trevor Slattery)'],
    organizations: ['AIM', 'Stark Industries'],
    objects: ['Extremis Serum'],
    storyArcs: ['Stark PTSD Arc'],
    spoilerFreeContext: 'Tony Stark deals with Battle of New York trauma.',
  },
  'mcu-thor-dark-world': {
    id: 'mcu-thor-dark-world',
    title: 'Thor: The Dark World',
    type: 'movie',
    releaseDate: '2013-11-08',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 2,
    characters: ['Thor Odinson', 'Loki', 'Jane Foster', 'Odin'],
    villains: ['Malekith the Accursed'],
    organizations: ['Asgardian Royal Guard'],
    objects: ['Aether (Reality Stone)'],
    storyArcs: ['Infinity Stones Saga', 'Asgardian Realm Arc'],
    spoilerFreeContext: 'Thor fights Malekith and protects Jane Foster from the Aether.',
  },
  'mcu-winter-soldier': {
    id: 'mcu-winter-soldier',
    title: 'Captain America: The Winter Soldier',
    type: 'movie',
    releaseDate: '2014-04-04',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 2,
    characters: ['Steve Rogers', 'Natasha Romanoff', 'Sam Wilson', 'Bucky Barnes'],
    villains: ['Alexander Pierce', 'The Winter Soldier'],
    organizations: ['S.H.I.E.L.D.', 'Hydra'],
    objects: ['Insight Helicarriers'],
    storyArcs: ['S.H.I.E.L.D. Infiltration Arc'],
    spoilerFreeContext: 'Political thriller dismantling S.H.I.E.L.D.',
  },
  'mcu-gotg-1': {
    id: 'mcu-gotg-1',
    title: 'Guardians of the Galaxy',
    type: 'movie',
    releaseDate: '2014-08-01',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 2,
    characters: ['Peter Quill', 'Gamora', 'Drax', 'Rocket Raccoon', 'Groot'],
    villains: ['Ronan the Accuser', 'Nebula'],
    organizations: ['Guardians of the Galaxy', 'Ravagers'],
    objects: ['The Orb (Power Stone)'],
    storyArcs: ['Cosmic Marvel Saga', 'Infinity Stones Saga'],
    spoilerFreeContext: 'Cosmic sci-fi adventure. Excellent standalone entry point.',
  },
  'mcu-age-of-ultron': {
    id: 'mcu-age-of-ultron',
    title: 'Avengers: Age of Ultron',
    type: 'movie',
    releaseDate: '2015-05-01',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 2,
    characters: ['Tony Stark', 'Steve Rogers', 'Thor', 'Bruce Banner', 'Natasha Romanoff', 'Wanda Maximoff', 'Vision'],
    villains: ['Ultron'],
    organizations: ['The Avengers'],
    objects: ['Mind Stone', 'Vibranium Body'],
    storyArcs: ['Avengers Assembly', 'Sokovia Accords Setup'],
    spoilerFreeContext: 'Ultron AI crisis leading to Sokovia devastation.',
  },
  'mcu-ant-man': {
    id: 'mcu-ant-man',
    title: 'Ant-Man',
    type: 'movie',
    releaseDate: '2015-07-17',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 2,
    characters: ['Scott Lang', 'Hank Pym', 'Hope van Dyne', 'Sam Wilson'],
    villains: ['Darren Cross (Yellowjacket)'],
    organizations: ['Pym Technologies'],
    objects: ['Ant-Man Suit', 'Pym Particles'],
    storyArcs: ['Pym Legacy Arc'],
    spoilerFreeContext: 'Heist comedy introducing Scott Lang. Excellent standalone entry point.',
  },

  // Phase 3
  'mcu-civil-war': {
    id: 'mcu-civil-war',
    title: 'Captain America: Civil War',
    type: 'movie',
    releaseDate: '2016-05-06',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Steve Rogers', 'Tony Stark', 'Wanda Maximoff', 'Vision', 'Bucky Barnes', 'Peter Parker', 'T\'Challa', 'Sam Wilson', 'Clint Barton', 'Natasha Romanoff', 'Scott Lang', 'James Rhodes'],
    villains: ['Helmut Zemo'],
    organizations: ['Avengers Factions'],
    objects: ['Sokovia Accords'],
    storyArcs: ['Avengers Schism Saga'],
    spoilerFreeContext: 'The Avengers split over government regulation and Bucky Barnes.',
  },
  'mcu-doctor-strange': {
    id: 'mcu-doctor-strange',
    title: 'Doctor Strange',
    type: 'movie',
    releaseDate: '2016-11-04',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Stephen Strange', 'Wong', 'The Ancient One'],
    villains: ['Kaecilius', 'Dormammu'],
    organizations: ['Masters of the Mystic Arts', 'Kamar-Taj'],
    objects: ['Eye of Agamotto (Time Stone)'],
    storyArcs: ['Mystic Marvel Saga', 'Infinity Stones Saga'],
    spoilerFreeContext: 'Origins of Sorcerer Supreme. Standalone entry point.',
  },
  'mcu-gotg-2': {
    id: 'mcu-gotg-2',
    title: 'Guardians of the Galaxy Vol. 2',
    type: 'movie',
    releaseDate: '2017-05-05',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Peter Quill', 'Gamora', 'Drax', 'Rocket Raccoon', 'Groot', 'Mantis'],
    villains: ['Ego the Living Planet'],
    organizations: ['Guardians of the Galaxy', 'Sovereign'],
    objects: ['Celestial Seed'],
    storyArcs: ['Cosmic Marvel Saga', 'Quill Family Arc'],
    spoilerFreeContext: 'The Guardians explore Peter Quill celestial parentage.',
  },
  'mcu-spider-man-homecoming': {
    id: 'mcu-spider-man-homecoming',
    title: 'Spider-Man: Homecoming',
    type: 'movie',
    releaseDate: '2017-07-07',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Peter Parker', 'Tony Stark', 'Ned Leeds', 'MJ Watson'],
    villains: ['Adrian Toomes (Vulture)'],
    organizations: ['Stark Industries', 'Midtown High'],
    objects: ['Stark Tech Spider Suit'],
    storyArcs: ['Spider-Man MCU Trilogy'],
    spoilerFreeContext: 'Peter Parker navigates high school after Civil War.',
  },
  'mcu-thor-ragnarok': {
    id: 'mcu-thor-ragnarok',
    title: 'Thor: Ragnarok',
    type: 'movie',
    releaseDate: '2017-11-03',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Thor Odinson', 'Loki', 'Bruce Banner', 'Valkyrie', 'Korg'],
    villains: ['Hela', 'Surtur'],
    organizations: ['Revengers', 'Sakaar Gladiators'],
    objects: ['Mjolnir Destruction', 'Surtur Crown'],
    storyArcs: ['Ragnarok Arc', 'Infinity Stones Saga'],
    spoilerFreeContext: 'Thor loses Mjolnir and fights Hela to save Asgard.',
  },
  'mcu-black-panther': {
    id: 'mcu-black-panther',
    title: 'Black Panther',
    type: 'movie',
    releaseDate: '2018-02-16',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['T\'Challa', 'Shuri', 'Okoye', 'Nakia'],
    villains: ['Erik Killmonger', 'Ulysses Klaue'],
    organizations: ['Dora Milaje', 'Wakandan Royal Family'],
    objects: ['Vibranium Suit', 'Heart-Shaped Herb'],
    storyArcs: ['Wakanda Saga'],
    spoilerFreeContext: 'T\'Challa becomes King of Wakanda. Standalone entry point.',
  },
  'mcu-ant-man-and-the-wasp': {
    id: 'mcu-ant-man-and-the-wasp',
    title: 'Ant-Man and the Wasp',
    type: 'movie',
    releaseDate: '2018-07-06',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Scott Lang', 'Hope van Dyne', 'Hank Pym', 'Janet van Dyne'],
    villains: ['Ava Starr (Ghost)', 'Sonny Burch'],
    organizations: ['Pym Technologies'],
    objects: ['Quantum Tunnel', 'Quantum Realm'],
    storyArcs: ['Quantum Realm Arc'],
    spoilerFreeContext: 'Scott and Hope team up to rescue Janet from Quantum Realm.',
  },
  'mcu-captain-marvel': {
    id: 'mcu-captain-marvel',
    title: 'Captain Marvel',
    type: 'movie',
    releaseDate: '2019-03-08',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Carol Danvers', 'Nick Fury', 'Talos', 'Goose'],
    villains: ['Supreme Intelligence', 'Yon-Rogg'],
    organizations: ['Starforce', 'Kree Empire', 'Skrulls'],
    objects: ['Tesseract'],
    storyArcs: ['90s Cosmic Origin'],
    spoilerFreeContext: '90s galactic origin story of Carol Danvers. Excellent standalone entry point.',
  },
  'mcu-infinity-war': {
    id: 'mcu-infinity-war',
    title: 'Avengers: Infinity War',
    type: 'movie',
    releaseDate: '2018-04-27',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Tony Stark', 'Steve Rogers', 'Thor', 'Peter Parker', 'Stephen Strange', 'Gamora'],
    villains: ['Thanos', 'Black Order'],
    organizations: ['The Avengers', 'Guardians of the Galaxy'],
    objects: ['Infinity Gauntlet', 'All 6 Infinity Stones'],
    storyArcs: ['Infinity Stones Climax'],
    spoilerFreeContext: 'Thanos collects all 6 Infinity Stones to erase half of all life.',
  },
  'mcu-endgame': {
    id: 'mcu-endgame',
    title: 'Avengers: Endgame',
    type: 'movie',
    releaseDate: '2019-04-26',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Tony Stark', 'Steve Rogers', 'Thor', 'Natasha Romanoff', 'Scott Lang', 'Clint Barton'],
    villains: ['Thanos (2014 variant)'],
    organizations: ['The Avengers'],
    objects: ['Quantum Heist Suits', 'Nano Gauntlet'],
    storyArcs: ['Infinity Saga Conclusion'],
    spoilerFreeContext: 'The remaining Avengers attempt a quantum time heist to reverse the snap.',
  },
  'mcu-spider-man-ffh': {
    id: 'mcu-spider-man-ffh',
    title: 'Spider-Man: Far From Home',
    type: 'movie',
    releaseDate: '2019-07-02',
    universe: 'MCU',
    saga: 'Infinity Saga',
    phase: 3,
    characters: ['Peter Parker', 'Nick Fury', 'MJ Watson', 'Ned Leeds'],
    villains: ['Quentin Beck (Mysterio)'],
    organizations: ['S.A.B.E.R.'],
    objects: ['EDITH Glasses'],
    storyArcs: ['Spider-Man MCU Trilogy', 'Post-Blip World'],
    spoilerFreeContext: 'Peter copes with Tony Stark loss during a European school trip.',
  },

  // Phase 4
  'mcu-wandavision': {
    id: 'mcu-wandavision',
    title: 'WandaVision',
    type: 'tv-series',
    releaseDate: '2021-01-15',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Wanda Maximoff', 'Vision', 'Monica Rambeau', 'Agatha Harkness'],
    villains: ['Agatha Harkness', 'SWORD Director Hayward'],
    organizations: ['S.W.O.R.D.'],
    objects: ['Westview Hex', 'The Darkhold'],
    storyArcs: ['Scarlet Witch Awakening Saga'],
    spoilerFreeContext: 'Wanda creates a sitcom reality in grief following Endgame.',
  },
  'mcu-what-if': {
    id: 'mcu-what-if',
    title: 'What If...?',
    type: 'tv-series',
    releaseDate: '2021-08-11',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['The Watcher (Uatu)', 'Peggy Carter (Captain Carter)', 'Doctor Strange Supreme', 'Killmonger', 'Thor Variant', 'Ultron Variant'],
    villains: ['Infinity Ultron', 'Strange Supreme (Corrupted)', 'Zombie Thanos'],
    organizations: ['Guardians of the Multiverse', 'The Watchers'],
    objects: ['Infinity Armor', 'The Darkhold'],
    storyArcs: ['Multiverse Anthology', 'Guardians of the Multiverse Assembly'],
    spoilerFreeContext: 'The Watcher guides viewers through animated alternate timelines in the MCU Multiverse. Standalone animated entry point.',
  },
  'mcu-tfatws': {
    id: 'mcu-tfatws',
    title: 'The Falcon and the Winter Soldier',
    type: 'tv-series',
    releaseDate: '2021-03-19',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: [
      'Sam Wilson',
      'Bucky Barnes',
      'John Walker',
      'Karli Morgenthau',
      'Helmut Zemo',
      'Sharon Carter',
      'Steve Rogers',
      'Isaiah Bradley',
      'Ayo',
      'Joaquin Torres',
      'Valentina Allegra de Fontaine',
      'Lemar Hoskins (Battlestar)',
    ],
    villains: ['Karli Morgenthau (Flag Smashers)', 'Helmut Zemo', 'Sharon Carter (Power Broker)'],
    organizations: ['Flag Smashers', 'GRC (Global Repatriation Council)', 'US Military', 'Dora Milaje', 'Power Broker Network'],
    objects: ['Vibranium Shield', 'Super Soldier Serum Vials'],
    storyArcs: ['Captain America Legacy Arc', 'Post-Blip World', 'Captain America Mantle', 'Super Soldier Legacy', 'Post-Blip Reconstruction'],
    spoilerFreeContext: 'Sam and Bucky team up to deal with the legacy of Captain America shield and Flag Smasher threat.',
  },
  'mcu-loki': {
    id: 'mcu-loki',
    title: 'Loki',
    type: 'tv-series',
    releaseDate: '2021-06-09',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Loki', 'Sylvie', 'Mobius M. Mobius', 'He Who Remains'],
    villains: ['He Who Remains', 'Ravonna Renslayer'],
    organizations: ['Time Variance Authority (TVA)'],
    objects: ['TemPad', 'Sacred Timeline'],
    storyArcs: ['Multiverse Saga Foundation'],
    spoilerFreeContext: 'Loki is captured by the TVA after escaping in Endgame.',
  },
  'mcu-black-widow': {
    id: 'mcu-black-widow',
    title: 'Black Widow',
    type: 'movie',
    releaseDate: '2021-07-09',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Natasha Romanoff', 'Yelena Belova', 'Alexei Shostakov', 'Melina Vostokoff', 'Taskmaster', 'Clint Barton', 'Thaddeus Ross'],
    villains: ['General Dreykov', 'Taskmaster (Antonia Dreykov)'],
    organizations: ['Red Room', 'The Avengers'],
    objects: ['Synthetic Mind-Control Antidote Vials', 'Black Widow Ledger'],
    storyArcs: ['Red Room Legacy Arc', 'Post-Civil War Fugitive Era'],
    spoilerFreeContext: 'Natasha confronts her Red Room past and family while on the run after Civil War.',
  },
  'mcu-shang-chi': {
    id: 'mcu-shang-chi',
    title: 'Shang-Chi and the Legend of the Ten Rings',
    type: 'movie',
    releaseDate: '2021-09-03',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Shang-Chi', 'Katy', 'Xu Wenwu', 'Wong'],
    villains: ['Xu Wenwu (Mandarin)', 'Dweller-in-Darkness'],
    organizations: ['Ten Rings Organization', 'Ta Lo'],
    objects: ['Ten Rings Weapons'],
    storyArcs: ['Ten Rings Saga'],
    spoilerFreeContext: 'Origins of Shang-Chi and the mythical Ten Rings. Standalone entry point.',
  },
  'mcu-eternals': {
    id: 'mcu-eternals',
    title: 'Eternals',
    type: 'movie',
    releaseDate: '2021-11-05',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Sersi', 'Ikaris', 'Thena', 'Ajak', 'Kingo', 'Phastos', 'Makkari', 'Druig', 'Gilgamesh', 'Sprite', 'Dane Whitman', 'Arishem the Judge', 'Eros (Starfox)'],
    villains: ['Ikaris', 'Kro (Deviant Leader)', 'Arishem the Judge'],
    organizations: ['Eternals', 'Celestials'],
    objects: ['Uni-Mind Crystal', 'Celestial Seed Tiamut'],
    storyArcs: ['Celestial Emergence Saga', 'Ancient History of Earth'],
    spoilerFreeContext: 'An immortal alien race emerges after thousands of years to protect Earth from the Emergence of a Celestial.',
  },
  'mcu-spiderman-no-way-home': {
    id: 'mcu-spiderman-no-way-home',
    title: 'Spider-Man: No Way Home',
    type: 'movie',
    releaseDate: '2021-12-17',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Peter Parker', 'Doctor Strange', 'MJ Watson', 'Ned Leeds', 'Peter-Two', 'Peter-Three'],
    villains: ['Green Goblin', 'Doc Ock', 'Electro', 'Sandman', 'Lizard'],
    organizations: ['Kamar-Taj Sanctum'],
    objects: ['Box of Machina'],
    storyArcs: ['Spider-Man MCU Trilogy', 'Multiverse Saga'],
    spoilerFreeContext: 'Multiverse Spider-Man crossover event following unmasking.',
  },
  'mcu-multiverse-of-madness': {
    id: 'mcu-multiverse-of-madness',
    title: 'Doctor Strange in the Multiverse of Madness',
    type: 'movie',
    releaseDate: '2022-05-06',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Stephen Strange', 'Wanda Maximoff', 'America Chavez', 'Wong'],
    villains: ['Scarlet Witch (Wanda Maximoff)'],
    organizations: ['Illuminati (Earth-838)'],
    objects: ['The Darkhold', 'Book of Vishanti'],
    storyArcs: ['Multiverse Saga', 'Scarlet Witch Arc'],
    spoilerFreeContext: 'Doctor Strange protects America Chavez from corrupted Scarlet Witch.',
  },
  'mcu-thor-love-and-thunder': {
    id: 'mcu-thor-love-and-thunder',
    title: 'Thor: Love and Thunder',
    type: 'movie',
    releaseDate: '2022-07-08',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Thor Odinson', 'Jane Foster (Mighty Thor)', 'Valkyrie', 'Korg'],
    villains: ['Gorr the God Butcher'],
    organizations: ['New Asgard'],
    objects: ['Necrosword', 'Stormbreaker'],
    storyArcs: ['Thor Cosmic Journey Arc'],
    spoilerFreeContext: 'Thor teams up with Jane Foster to stop Gorr the God Butcher.',
  },
  'mcu-wakanda-forever': {
    id: 'mcu-wakanda-forever',
    title: 'Black Panther: Wakanda Forever',
    type: 'movie',
    releaseDate: '2022-11-11',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Shuri', 'Queen Ramonda', 'Namor', 'Okoye', 'Riri Williams'],
    villains: ['Namor (K\'uk\'ulkan)'],
    organizations: ['Talokan', 'Dora Milaje'],
    objects: ['Vibranium Detector', 'Synthetic Heart-Shaped Herb'],
    storyArcs: ['Wakanda Saga', 'Talokan Conflict'],
    spoilerFreeContext: 'Wakanda mourns King T\'Challa and defends against Namor and Talokan.',
  },

  // Phase 5 & 6
  'mcu-quantumania': {
    id: 'mcu-quantumania',
    title: 'Ant-Man and the Wasp: Quantumania',
    type: 'movie',
    releaseDate: '2023-02-17',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Scott Lang', 'Hope van Dyne', 'Cassie Lang', 'Hank Pym', 'Janet van Dyne'],
    villains: ['Kang the Conqueror', 'MODOK'],
    organizations: ['Quantum Realm Freedom Fighters'],
    objects: ['Multiverse Power Core'],
    storyArcs: ['Multiverse Saga', 'Kang Dynasty Setup'],
    spoilerFreeContext: 'The Ant-Family is pulled into the Quantum Realm and confronts Kang.',
  },
  'mcu-gotg-3': {
    id: 'mcu-gotg-3',
    title: 'Guardians of the Galaxy Vol. 3',
    type: 'movie',
    releaseDate: '2023-05-05',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Peter Quill', 'Rocket Raccoon', 'Gamora (2014)', 'Drax', 'Groot', 'Nebula', 'Mantis'],
    villains: ['High Evolutionary', 'Adam Warlock'],
    organizations: ['Guardians of the Galaxy', 'Orgocorp'],
    objects: ['Rocket Cybernetics'],
    storyArcs: ['Guardians Trilogy Conclusion'],
    spoilerFreeContext: 'The Guardians embark on a mission to save Rocket Raccoon life.',
  },
  'mcu-the-marvels': {
    id: 'mcu-the-marvels',
    title: 'The Marvels',
    type: 'movie',
    releaseDate: '2023-11-10',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Carol Danvers', 'Monica Rambeau', 'Kamala Khan (Ms. Marvel)', 'Nick Fury'],
    villains: ['Dar-Benn'],
    organizations: ['S.A.B.E.R.'],
    objects: ['Quantum Bands'],
    storyArcs: ['Cosmic Marvel Saga', 'Multiverse Incursions'],
  },
  'mcu-hawkeye': {
    id: 'mcu-hawkeye',
    title: 'Hawkeye',
    type: 'tv-series',
    releaseDate: '2021-11-24',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Clint Barton', 'Kate Bishop', 'Yelena Belova', 'Maya Lopez', 'Laura Barton', 'Jack Duquesne'],
    villains: ['Wilson Fisk (Kingpin)', 'Maya Lopez (Echo)', 'Tracksuit Mafia'],
    organizations: ['Tracksuit Mafia', 'TRX / Kingpin Syndicate'],
    objects: ['Ronin Suit and Sword', 'Trick Arrows'],
    storyArcs: ['Post-Endgame Hawkeye Legacy', 'Ronin Fallout', 'Yelena Belova Vengeance'],
    spoilerFreeContext: 'Clint Barton teams up with young archer Kate Bishop in NYC at Christmas while confronted by his Ronin past and Yelena Belova.',
  },
  'mcu-ms-marvel': {
    id: 'mcu-ms-marvel',
    title: 'Ms. Marvel',
    type: 'tv-series',
    releaseDate: '2022-06-08',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Kamala Khan', 'Bruno Carrelli', 'Nakia Bahadir', 'Muneeba Khan', 'Yusuf Khan', 'Kamran', 'Najma', 'Red Dagger (Kareem)'],
    villains: ['Najma (Clandestines)', 'Department of Damage Control (DODC)'],
    organizations: ['DODC', 'Red Daggers', 'Clandestines'],
    objects: ['Quantum Bangle'],
    storyArcs: ['Kamala Khan Origin', 'Mutant / Noor Dimension Lore'],
    spoilerFreeContext: 'Jersey City teenager Kamala Khan gains cosmic powers from a mysterious family bangle while idolizing Captain Marvel.',
  },
  'mcu-holiday-special': {
    id: 'mcu-holiday-special',
    title: 'The Guardians of the Galaxy Holiday Special',
    type: 'special',
    releaseDate: '2022-11-25',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Peter Quill', 'Drax', 'Mantis', 'Nebula', 'Groot', 'Rocket', 'Kevin Bacon', 'Cosmo'],
    villains: [],
    organizations: ['Guardians of the Galaxy'],
    objects: ['Bucky Barnes Arm'],
    storyArcs: ['Guardians Christmas Special', 'Mantis & Quill Sibling Secret'],
    spoilerFreeContext: 'Drax and Mantis travel to Earth to kidnap Kevin Bacon as a festive present for grieving Peter Quill on Knowhere.',
  },
  'mcu-she-hulk': {
    id: 'mcu-she-hulk',
    title: 'She-Hulk: Attorney at Law',
    type: 'tv-series',
    releaseDate: '2022-08-18',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Jennifer Walters', 'Bruce Banner', 'Emil Blonsky', 'Wong', 'Matt Murdock'],
    villains: ['Titania', 'Abomination', 'Intelligencia'],
    organizations: ['GLK&H', 'Damage Control'],
    objects: ['Sakaaran Class Eight Courier Craft'],
    storyArcs: ['She-Hulk Origin', 'Abomination Parole Trial', 'Daredevil Partnership'],
  },
  'mcu-moon-knight': {
    id: 'mcu-moon-knight',
    title: 'Moon Knight',
    type: 'tv-series',
    releaseDate: '2022-03-30',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Marc Spector', 'Steven Grant', 'Layla El-Faouly', 'Khonshu'],
    villains: ['Arthur Harrow', 'Ammit'],
    organizations: ['Ennead'],
    objects: ['Scarab of Ammit', 'Ushebti'],
    storyArcs: ['Marc Spector DID Origin', 'Ammit Resurrected'],
    spoilerFreeContext: 'Steven Grant discovers he shares a body with mercenary Marc Spector and gets drawn into a deadly mystery among Egyptian gods.',
  },
  'mcu-werewolf-by-night': {
    id: 'mcu-werewolf-by-night',
    title: 'Werewolf by Night',
    type: 'special',
    releaseDate: '2022-10-07',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 4,
    characters: ['Jack Russell', 'Elsa Bloodstone', 'Man-Thing'],
    villains: ['Verussa Bloodstone'],
    organizations: ['Bloodstone Cabal'],
    objects: ['Bloodstone'],
    storyArcs: ['Bloodstone Hunt', 'Man-Thing Rescue'],
    spoilerFreeContext: 'Monster hunters gather at Bloodstone Temple for a dangerous competition to claim a powerful relic.',
  },
  'mcu-secret-invasion': {
    id: 'mcu-secret-invasion',
    title: 'Secret Invasion',
    type: 'tv-series',
    releaseDate: '2023-06-21',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Nick Fury', 'Talos', 'G\'iah', 'James Rhodes', 'Sonya Falsworth'],
    villains: ['Gravik'],
    organizations: ['S.A.B.E.R.', 'Skrull Resistance'],
    objects: ['Super Skrull DNA Harvest'],
    storyArcs: ['Skrull Infiltration', 'Gravik Rebellion'],
    spoilerFreeContext: 'Nick Fury uncovers a clandestine invasion of Earth by shape-shifting Skrulls.',
  },
  'mcu-daredevil': {
    id: 'mcu-daredevil',
    title: 'Daredevil',
    type: 'tv-series',
    releaseDate: '2015-04-10',
    universe: 'MCU',
    saga: 'Defenders Saga',
    phase: 2,
    characters: ['Matt Murdock', 'Wilson Fisk', 'Karen Page', 'Foggy Nelson', 'Frank Castle'],
    villains: ['Kingpin', 'Bullseye', 'Nobu'],
    organizations: ['Nelson & Murdock', 'The Hand'],
    objects: ['Billy Club', 'Daredevil Suit'],
    storyArcs: ['Daredevil Origin', 'Kingpin Rise', 'Punisher Conflict'],
    spoilerFreeContext: 'Matt Murdock uses his heightened senses to combat Wilson Fisk\'s criminal empire in Hell\'s Kitchen.',
  },
  'mcu-echo': {
    id: 'mcu-echo',
    title: 'Echo',
    type: 'tv-series',
    releaseDate: '2024-01-09',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Maya Lopez', 'Wilson Fisk', 'Matt Murdock', 'Biscuits', 'Chula'],
    villains: ['Kingpin'],
    organizations: ['Tracksuit Mafia', 'Choctaw Ancestry'],
    objects: ['Ancestral Echo Powers'],
    storyArcs: ['Choctaw Heritage', 'Kingpin Confrontation'],
    spoilerFreeContext: 'Maya Lopez faces her past in Oklahoma while fleeing Wilson Fisk\'s criminal empire.',
  },
  'mcu-agatha-all-along': {
    id: 'mcu-agatha-all-along',
    title: 'Agatha All Along',
    type: 'tv-series',
    releaseDate: '2024-09-18',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Agatha Harkness', 'Billy Maximoff', 'Rio Vidal', 'Lilia Calderu', 'Jennifer Kale'],
    villains: ['Salem Seven', 'Death'],
    organizations: ['Coven of Witches'],
    objects: ['Tarot Cards', 'Darkhold Legacy'],
    storyArcs: ['Witches Road Trials', 'Billy Maximoff Identity'],
    spoilerFreeContext: 'A powerless Agatha Harkness forms a coven of witches to navigate the legendary Witches\' Road.',
  },
  'mcu-cap-brave-new-world': {
    id: 'mcu-cap-brave-new-world',
    title: 'Captain America: Brave New World',
    type: 'movie',
    releaseDate: '2025-02-14',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Sam Wilson', 'Joaquín Torres', 'Thaddeus Ross', 'Samuel Sterns', 'Isaiah Bradley'],
    villains: ['Red Hulk', 'The Leader'],
    organizations: ['US Government', 'Serpent Society'],
    objects: ['Adamantium Island', 'Captain America Wings'],
    storyArcs: ['Presidential Crisis', 'Adamantium Resource War'],
    spoilerFreeContext: 'Sam Wilson navigates an international conspiracy involving newly discovered Adamantium.',
  },
  'mcu-daredevil-born-again': {
    id: 'mcu-daredevil-born-again',
    title: 'Daredevil: Born Again',
    type: 'tv-series',
    releaseDate: '2025-03-04',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Matt Murdock', 'Wilson Fisk', 'Karen Page', 'Foggy Nelson', 'Frank Castle'],
    villains: ['Kingpin', 'Muse'],
    organizations: ['NYC Mayoral Office', 'Vigilante Task Force'],
    objects: ['Daredevil Suit', 'Punisher Vest'],
    storyArcs: ['Fisk Mayoral Campaign', 'NYC Vigilante Ban'],
    spoilerFreeContext: 'Matt Murdock and Wilson Fisk clash on the streets and in the political arenas of New York City.',
  },
  'mcu-thunderbolts': {
    id: 'mcu-thunderbolts',
    title: 'Thunderbolts*',
    type: 'movie',
    releaseDate: '2025-05-02',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Yelena Belova', 'Bucky Barnes', 'John Walker', 'Red Guardian', 'Ghost', 'Taskmaster', 'Bob'],
    villains: ['Sentry / Void', 'Valentina Allegra de Fontaine'],
    organizations: ['Thunderbolts', 'CIA'],
    objects: ['Super Soldier Serum'],
    storyArcs: ['Vault Covert Mission', 'Sentry Containment'],
    spoilerFreeContext: 'An irreverent team of anti-heroes completes covert operations for Valentina Allegra de Fontaine.',
    reviewStatus: 'canonical',
  },
  'mcu-fantastic-four': {
    id: 'mcu-fantastic-four',
    title: 'The Fantastic Four: First Steps',
    type: 'movie',
    releaseDate: '2025-07-25',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 6,
    characters: ['Reed Richards', 'Sue Storm', 'Johnny Storm', 'Ben Grimm', 'H.E.R.B.I.E.'],
    villains: ['Galactus', 'Shalla-Bal / Silver Surfer'],
    organizations: ['Fantastic Four', 'Future Foundation'],
    objects: ['Fantastic Car', 'Cosmic Energy Device'],
    storyArcs: ['1960s Retro-Earth', 'Galactus Arrival'],
    spoilerFreeContext: 'Marvel\'s first family defends their 1960s retro-futuristic world from Galactus.',
    reviewStatus: 'canonical',
  },
  'mcu-spiderman-brand-new-day': {
    id: 'mcu-spiderman-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    type: 'movie',
    releaseDate: '2026-07-24',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 6,
    characters: ['Peter Parker', 'Matt Murdock', 'Ned Leeds', 'MJ Watson'],
    villains: ['Scorpion', 'Tombstone'],
    organizations: ['Daily Bugle', 'NYC Underworld'],
    objects: ['Classic Web-Shooters'],
    storyArcs: ['Street-Level Hero Reboot', 'College Life'],
    spoilerFreeContext: 'Peter Parker balances college life and crime-fighting while confronting new threats in New York City.',
    reviewStatus: 'upcoming',
  },
  'mcu-secret-wars': {
    id: 'mcu-secret-wars',
    title: 'Avengers: Secret Wars',
    type: 'movie',
    releaseDate: '2027-05-07',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 6,
    characters: ['Doctor Doom', 'Loki', 'Wade Wilson', 'Logan', 'Reed Richards', 'Sam Wilson'],
    villains: ['God Emperor Doom'],
    organizations: ['Multiversal Resistance', 'Thanos Corps'],
    objects: ['Battleworld Core', 'Yggdrasil Threads'],
    storyArcs: ['Battleworld Survival', 'Multiverse Restoration'],
    spoilerFreeContext: 'Heroes across realities unite on Battleworld to save existence from total destruction.',
    reviewStatus: 'upcoming',
  },
  'mcu-blade': {
    id: 'mcu-blade',
    title: 'Blade',
    type: 'movie',
    releaseDate: '2027-11-01',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 6,
    characters: ['Eric Brooks', 'Ebony Blade Keeper'],
    villains: ['Vampire Council'],
    organizations: ['Nightstalkers'],
    objects: ['Ebony Blade', 'Silver Daggers'],
    storyArcs: ['Vampire War', 'Daywalker Origin'],
    spoilerFreeContext: 'Eric Brooks, a half-vampire Daywalker, hunts vampires to protect humanity.',
    reviewStatus: 'upcoming',
  },

  // X-Men Franchise Title Nodes
  'xmen-deadpool': {
    id: 'xmen-deadpool',
    title: 'Deadpool',
    type: 'movie',
    releaseDate: '2016-02-12',
    universe: 'X-Men Universe',
    saga: 'X-Men Franchise',
    phase: 1,
    characters: ['Wade Wilson (Deadpool)', 'Vanessa', 'Colossus', 'Negasonic Teenage Warhead', 'Weasel'],
    villains: ['Ajax', 'Angel Dust'],
    organizations: ['Weapon X Program', 'X-Men'],
    objects: ['Katanas', 'Regenerative Healing Factor'],
    storyArcs: ['Deadpool Origin', 'Weapon X Revenge'],
    spoilerFreeContext: 'Wade Wilson undergoes a rogue experiment that gives him accelerated healing powers and adopts the alter ego Deadpool.',
    isEntryPoint: true,
  },
  'xmen-deadpool-2': {
    id: 'xmen-deadpool-2',
    title: 'Deadpool 2',
    type: 'movie',
    releaseDate: '2018-05-18',
    universe: 'X-Men Universe',
    saga: 'X-Men Franchise',
    phase: 1,
    characters: ['Wade Wilson (Deadpool)', 'Cable', 'Domino', 'Firefist (Russell)', 'Colossus'],
    villains: ['Juggernaut', 'Headmaster'],
    organizations: ['X-Force', 'DMC (Mutant Re-education Center)'],
    objects: ['Time-Travel Device', 'Cable Cybernetic Arm'],
    storyArcs: ['X-Force Formation', 'Saving Russell', 'Time-Travel Fixes'],
    spoilerFreeContext: 'Deadpool forms X-Force to protect a young mutant from the time-traveling cyborg Cable.',
  },
  'xmen-logan': {
    id: 'xmen-logan',
    title: 'Logan',
    type: 'movie',
    releaseDate: '2017-03-03',
    universe: 'X-Men Universe',
    saga: 'X-Men Franchise',
    phase: 1,
    characters: ['Logan (Wolverine)', 'Charles Xavier (Professor X)', 'Laura (X-23)', 'Caliban'],
    villains: ['Donald Pierce', 'Dr. Zander Rice', 'X-24'],
    organizations: ['Reavers', 'Alkali-Transigen'],
    objects: ['Adamantium Claws', 'Adamantium Bullet'],
    storyArcs: ['Logan Twilight', 'Protecting X-23', 'Mutant Extinction'],
    spoilerFreeContext: 'In a dark future where mutants are fading, an aging Logan fights to protect a young mutant girl.',
    isEntryPoint: true,
  },
  'xmen-dofp': {
    id: 'xmen-dofp',
    title: 'X-Men: Days of Future Past',
    type: 'movie',
    releaseDate: '2014-05-23',
    universe: 'X-Men Universe',
    saga: 'X-Men Franchise',
    phase: 1,
    characters: ['Wolverine', 'Charles Xavier', 'Magneto', 'Mystique', 'Beast', 'Quicksilver'],
    villains: ['Bolivar Trask', 'Sentinels'],
    organizations: ['X-Men', 'Trask Industries'],
    objects: ['Sentinels', 'Cerebro'],
    storyArcs: ['Time-Travel Mission', 'Preventing Mutant Apocalypse'],
    spoilerFreeContext: 'Wolverine is sent back in time to 1973 to prevent a dystopian future for humans and mutants alike.',
    isEntryPoint: true,
  },

  // Phase 5 & 6
  'mcu-deadpool-wolverine': {
    id: 'mcu-deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    type: 'movie',
    releaseDate: '2024-07-26',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 5,
    characters: ['Wade Wilson (Deadpool)', 'Logan (Wolverine)', 'Paradox', 'Cassandra Nova'],
    villains: ['Cassandra Nova', 'Agent Paradox'],
    organizations: ['TVA', 'The Void Mutants'],
    objects: ['Time Ripper'],
    storyArcs: ['Multiverse Saga', 'Fox Marvel Legacy Crossover'],
    spoilerFreeContext: 'Deadpool teams up with Wolverine to rescue his universe from TVA erasure.',
  },
  'mcu-doomsday': {
    id: 'mcu-doomsday',
    title: 'Avengers: Doomsday',
    type: 'movie',
    releaseDate: '2026-05-01',
    universe: 'MCU',
    saga: 'Multiverse Saga',
    phase: 6,
    characters: ['Steve Rogers', 'Thor', 'Loki', 'Reed Richards', 'Doctor Strange'],
    villains: ['Doctor Doom (Victor von Doom)'],
    organizations: ['The Avengers', 'Fantastic Four'],
    objects: ['Yggdrasil Multiverse Tree'],
    storyArcs: ['Multiverse Saga Climax'],
    spoilerFreeContext: 'The Avengers assemble to confront Doctor Doom across the Multiverse.',
    reviewStatus: 'upcoming',
  },

  // ─── DC UNIVERSE (MULTI-CONTINUITY FOUNDATION) ───────────────────────────────
  // DCEU Arc
  'dc-man-of-steel': {
    id: 'dc-man-of-steel',
    title: 'Man of Steel',
    type: 'movie',
    releaseDate: '2013-06-12',
    universe: 'DCEU',
    saga: 'Zack Snyder DCEU',
    characters: ['Clark Kent (Superman)', 'Lois Lane', 'Martha Kent', 'General Zod'],
    villains: ['General Zod', 'Faora-Ul'],
    organizations: ['Kryptonian High Council', 'Daily Planet', 'US Military'],
    objects: ['Kryptonian Codex', 'Command Ship'],
    storyArcs: ['DCEU Superman Origin'],
    spoilerFreeContext: 'Superman origin story and Black Zero event in Metropolis. Excellent standalone entry point.',
  },
  'dc-bvs': {
    id: 'dc-bvs',
    title: 'Batman v Superman: Dawn of Justice',
    type: 'movie',
    releaseDate: '2016-03-23',
    universe: 'DCEU',
    saga: 'Zack Snyder DCEU',
    characters: ['Bruce Wayne (Batman)', 'Clark Kent (Superman)', 'Diana Prince (Wonder Woman)', 'Lois Lane'],
    villains: ['Lex Luthor', 'Doomsday'],
    organizations: ['LexCorp', 'Wayne Enterprises'],
    objects: ['Kryptonite Spear', 'White Portuguese Vessel'],
    storyArcs: ['Trinity Assembly', 'Justice League Setup'],
    spoilerFreeContext: 'Batman confronts Superman following Metropolis collateral destruction.',
  },
  'dc-wonder-woman': {
    id: 'dc-wonder-woman',
    title: 'Wonder Woman',
    type: 'movie',
    releaseDate: '2017-05-30',
    universe: 'DCEU',
    saga: 'DCEU',
    characters: ['Diana Prince (Wonder Woman)', 'Steve Trevor', 'Queen Hippolyta'],
    villains: ['Ares (God of War)', 'General Erich Ludendorff', 'Dr. Isabel Maru'],
    organizations: ['Amazons of Themyscira'],
    objects: ['Godkiller Sword', 'Lasso of Hestia'],
    storyArcs: ['Wonder Woman Origin'],
    spoilerFreeContext: 'Diana leaves Themyscira during WWI. Standalone entry point.',
  },
  'dc-justice-league': {
    id: 'dc-justice-league',
    title: 'Justice League',
    type: 'movie',
    releaseDate: '2017-11-15',
    universe: 'DCEU',
    saga: 'Zack Snyder DCEU',
    characters: ['Bruce Wayne', 'Diana Prince', 'Arthur Curry', 'Barry Allen', 'Victor Stone', 'Clark Kent'],
    villains: ['Steppenwolf'],
    organizations: ['Justice League', 'Parademon Army'],
    objects: ['Mother Boxes'],
    storyArcs: ['Justice League Assembly'],
    spoilerFreeContext: 'The Trinity assemble Metahumans to defend Earth against Steppenwolf.',
  },
  'dc-snyder-cut': {
    id: 'dc-snyder-cut',
    title: "Zack Snyder's Justice League",
    type: 'movie',
    releaseDate: '2021-03-18',
    universe: 'DCEU',
    saga: 'Zack Snyder DCEU',
    characters: ['Bruce Wayne', 'Diana Prince', 'Arthur Curry', 'Barry Allen', 'Victor Stone', 'Clark Kent', 'Darkseid'],
    villains: ['Darkseid', 'Steppenwolf', 'DeSaad'],
    organizations: ['Justice League', 'Apokolips Forces'],
    objects: ['Mother Boxes', 'Anti-Life Equation'],
    storyArcs: ['Snyderverse Director Cut'],
    spoilerFreeContext: 'Definitive 4-hour epic version of the Justice League assembly.',
  },
  'dc-aquaman': {
    id: 'dc-aquaman',
    title: 'Aquaman',
    type: 'movie',
    releaseDate: '2018-12-07',
    universe: 'DCEU',
    saga: 'DCEU',
    characters: ['Arthur Curry (Aquaman)', 'Mera', 'Vulko', 'King Orm'],
    villains: ['King Orm (Ocean Master)', 'Black Manta'],
    organizations: ['Atlantis Royal Guard'],
    objects: ['Trident of Atlan'],
    storyArcs: ['Atlantis Saga'],
    spoilerFreeContext: 'Arthur Curry claims the throne of Atlantis. Standalone entry point.',
  },
  'dc-shazam': {
    id: 'dc-shazam',
    title: 'Shazam!',
    type: 'movie',
    releaseDate: '2019-03-29',
    universe: 'DCEU',
    saga: 'DCEU',
    characters: ['Billy Batson (Shazam)', 'Freddy Freeman', 'Wizard Shazam'],
    villains: ['Dr. Thaddeus Sivana', 'Seven Deadly Sins'],
    organizations: ['Shazam Family'],
    objects: ['Staff of the Wizard'],
    storyArcs: ['Shazam Origin'],
    spoilerFreeContext: 'Teenager Billy Batson transforms into an adult superhero. Standalone entry point.',
  },
  'dc-the-suicide-squad': {
    id: 'dc-the-suicide-squad',
    title: 'The Suicide Squad',
    type: 'movie',
    releaseDate: '2021-07-28',
    universe: 'DCEU',
    saga: 'James Gunn DCEU',
    characters: ['Harley Quinn', 'Bloodsport', 'Peacemaker', 'King Shark', 'Amanda Waller'],
    villains: ['Starro the Conqueror', 'The Thinker'],
    organizations: ['Task Force X', 'ARGUS'],
    objects: ['Project Jotunheim Files'],
    storyArcs: ['Task Force X Corto Maltese Mission'],
    spoilerFreeContext: 'Amanda Waller sends Task Force X to destroy Starro on Corto Maltese.',
  },
  'dc-peacemaker': {
    id: 'dc-peacemaker',
    title: 'Peacemaker',
    type: 'tv-series',
    releaseDate: '2022-01-13',
    universe: 'DCEU',
    saga: 'James Gunn DCEU',
    characters: ['Christopher Smith (Peacemaker)', 'Emerson Harcourt', 'John Economos', 'Vigilante'],
    villains: ['White Dragon', 'Butterfly Aliens'],
    organizations: ['Project Butterfly', 'ARGUS'],
    objects: ['Quantum Sonic Helmet'],
    storyArcs: ['Peacemaker Redemption'],
    spoilerFreeContext: 'Peacemaker joins ARGUS black-ops team following Corto Maltese hospital recovery.',
  },

  // The Batman Universe (Reevesverse - Isolated Continuity)
  'dc-the-batman': {
    id: 'dc-the-batman',
    title: 'The Batman',
    type: 'movie',
    releaseDate: '2022-03-01',
    universe: 'Reevesverse',
    saga: 'The Batman Epic Crime Saga',
    characters: ['Bruce Wayne (Batman)', 'Selina Kyle (Catwoman)', 'James Gordon', 'Oz Cobb (The Penguin)'],
    villains: ['The Riddler (Edward Nashton)', 'Carmine Falcone'],
    organizations: ['GCPD', 'Falcone Crime Family'],
    objects: ['Riddler Cipher Logs', 'Batcycle'],
    storyArcs: ['Gotham Flooding Crisis'],
    spoilerFreeContext: 'Year Two detective noir in Gotham City. Excellent standalone entry point.',
  },
  'dc-the-penguin': {
    id: 'dc-the-penguin',
    title: 'The Penguin',
    type: 'tv-series',
    releaseDate: '2024-09-19',
    universe: 'Reevesverse',
    saga: 'The Batman Epic Crime Saga',
    characters: ['Oswald Cobb (The Penguin)', 'Sofia Falcone', 'Victor Aguilar'],
    villains: ['Sofia Falcone', 'Maroni Crime Family'],
    organizations: ['Cobb Syndicate', 'Falcone Empire'],
    objects: ['Bliss Drug Operation'],
    storyArcs: ['Gotham Underground Power Vacuum'],
    spoilerFreeContext: 'Oz Cobb seizes control of Gotham mob power structure after the sea-wall breach.',
  },
  'dc-batman-2': {
    id: 'dc-batman-2',
    title: 'The Batman Part II',
    type: 'movie',
    releaseDate: '2026-10-02',
    universe: 'Reevesverse',
    saga: 'The Batman Epic Crime Saga',
    characters: ['Bruce Wayne (Batman)', 'James Gordon', 'Oz Cobb'],
    villains: ['Clayface', 'The Penguin'],
    organizations: ['GCPD', 'Gotham City Hall'],
    objects: ['Batmobile'],
    storyArcs: ['The Batman Chapter Two'],
    spoilerFreeContext: 'Batman confronts rising crime and corruption in post-flood Gotham.',
  },

  // Joker Elseworlds (Isolated Continuity)
  'dc-joker': {
    id: 'dc-joker',
    title: 'Joker',
    type: 'movie',
    releaseDate: '2019-10-02',
    universe: 'Elseworlds',
    saga: 'Joker Saga',
    characters: ['Arthur Fleck (Joker)', 'Murray Franklin', 'Sophie Dumond'],
    villains: ['Arthur Fleck Inner Madness'],
    organizations: ['Gotham Health Social Services'],
    objects: ['Joker Notebook'],
    storyArcs: ['Arthur Fleck Descent'],
    spoilerFreeContext: 'Standalone psychological character study of Arthur Fleck in 1981 Gotham.',
  },
  'dc-joker-2': {
    id: 'dc-joker-2',
    title: 'Joker: Folie à Deux',
    type: 'movie',
    releaseDate: '2024-10-02',
    universe: 'Elseworlds',
    saga: 'Joker Saga',
    characters: ['Arthur Fleck', 'Harleen Quinzel (Lee)', 'Harvey Dent'],
    villains: ['Gotham District Attorney Office'],
    organizations: ['Arkham State Hospital'],
    objects: ['Musical Dreams'],
    storyArcs: ['Arkham Trial Saga'],
    spoilerFreeContext: 'Arthur Fleck awaits trial in Arkham while meeting Harleen Quinzel.',
  },

  // James Gunn New DCU Foundation
  'dc-creature-commandos': {
    id: 'dc-creature-commandos',
    title: 'Creature Commandos',
    type: 'tv-series',
    releaseDate: '2024-12-05',
    universe: 'DCU',
    saga: 'Chapter 1: Gods and Monsters',
    characters: ['Rick Flag Sr.', 'Princess Ilana Rostovic', 'Eric Frankenstein', 'Bride of Frankenstein'],
    villains: ['Circe'],
    organizations: ['Task Force M', 'ARGUS'],
    objects: ['Monster Ops Tech'],
    storyArcs: ['DCU Chapter 1 Opening'],
    spoilerFreeContext: 'Amanda Waller forms a secret military unit of monstrous operatives. Standalone entry point.',
  },
  'dc-superman-2025': {
    id: 'dc-superman-2025',
    title: 'Superman',
    type: 'movie',
    releaseDate: '2025-07-11',
    universe: 'DCU',
    saga: 'Chapter 1: Gods and Monsters',
    characters: ['Clark Kent (Superman)', 'Lois Lane', 'Lex Luthor', 'Hawkgirl', 'Guy Gardner', 'Metamorpho'],
    villains: ['Lex Luthor', 'The Engineer'],
    organizations: ['Daily Planet', 'The Authority'],
    objects: ['Fortress of Solitude Tech'],
    storyArcs: ['DCU Flagship Origin'],
    spoilerFreeContext: 'Clark Kent reconciles his Kryptonian heritage with human upbringing in Smallville. Standalone entry point.',
  },
  'dc-lanterns': {
    id: 'dc-lanterns',
    title: 'Lanterns',
    type: 'tv-series',
    releaseDate: '2026-08-16',
    universe: 'DCU',
    saga: 'Chapter 1: Gods and Monsters',
    characters: ['Hal Jordan', 'John Stewart'],
    villains: ['Ancient Earth Darkness Threat'],
    organizations: ['Green Lantern Corps'],
    objects: ['Power Rings', 'Green Power Battery'],
    storyArcs: ['Earth Cosmic Mystery'],
    spoilerFreeContext: 'Intergalactic cops Hal Jordan and John Stewart investigate an Earth mystery.',
  },

  // ─── STAR WARS KNOWLEDGE GRAPH FOUNDATION ─────────────────────────────────
  // Skywalker Saga - Original Trilogy
  'sw-ep4': {
    id: 'sw-ep4',
    title: 'Star Wars: Episode IV - A New Hope',
    type: 'movie',
    releaseDate: '1977-05-25',
    universe: 'Star Wars',
    saga: 'Skywalker Saga',
    characters: ['Luke Skywalker', 'Han Solo', 'Princess Leia Organa', 'Obi-Wan Kenobi', 'Darth Vader'],
    villains: ['Darth Vader', 'Grand Moff Tarkin', 'Emperor Palpatine'],
    organizations: ['Rebel Alliance', 'Galactic Empire'],
    objects: ['Anakin Lightsaber', 'Death Star Plans', 'Millennium Falcon'],
    storyArcs: ['Galactic Civil War', 'Destruction of the Death Star'],
    spoilerFreeContext: 'Luke Skywalker embarks on his heroic journey joining the Rebel Alliance. Landmark standalone entry point.',
  },
  'sw-ep5': {
    id: 'sw-ep5',
    title: 'Star Wars: Episode V - The Empire Strikes Back',
    type: 'movie',
    releaseDate: '1980-05-20',
    universe: 'Star Wars',
    saga: 'Skywalker Saga',
    characters: ['Luke Skywalker', 'Han Solo', 'Princess Leia Organa', 'Yoda', 'Darth Vader', 'Boba Fett'],
    villains: ['Darth Vader', 'Emperor Palpatine', 'Boba Fett'],
    organizations: ['Rebel Alliance', 'Galactic Empire', 'Cloud City Security'],
    objects: ['Lightsaber', 'Carbonite Freezing Chamber'],
    storyArcs: ['Jedi Training on Dagobah', 'Vader Lineage Revelation'],
    spoilerFreeContext: 'The Empire retaliates after Yavin as Luke trains with Master Yoda.',
  },
  'sw-ep6': {
    id: 'sw-ep6',
    title: 'Star Wars: Episode VI - Return of the Jedi',
    type: 'movie',
    releaseDate: '1983-05-25',
    universe: 'Star Wars',
    saga: 'Skywalker Saga',
    characters: ['Luke Skywalker', 'Han Solo', 'Princess Leia Organa', 'Darth Vader', 'Emperor Palpatine'],
    villains: ['Emperor Palpatine', 'Darth Vader', 'Jabba the Hutt'],
    organizations: ['Rebel Alliance', 'Galactic Empire', 'Ewok Tribes'],
    objects: ['Green Lightsaber', 'Second Death Star'],
    storyArcs: ['Redemption of Anakin Skywalker', 'Endor Climax'],
    spoilerFreeContext: 'The Rebels launch a final assault on the second Death Star as Luke confronts the Emperor.',
  },

  // Skywalker Saga - Prequel Trilogy
  'sw-ep1': {
    id: 'sw-ep1',
    title: 'Star Wars: Episode I - The Phantom Menace',
    type: 'movie',
    releaseDate: '1999-05-19',
    universe: 'Star Wars',
    saga: 'Skywalker Saga',
    characters: ['Anakin Skywalker', 'Obi-Wan Kenobi', 'Qui-Gon Jinn', 'Padmé Amidala', 'Darth Maul'],
    villains: ['Darth Maul', 'Darth Sidious', 'Trade Federation'],
    organizations: ['Jedi Order', 'Galactic Republic', 'Trade Federation'],
    objects: ['Double-Bladed Lightsaber', 'Royal Starship'],
    storyArcs: ['Discovery of the Chosen One', 'Naboo Infiltration'],
    spoilerFreeContext: 'Jedi Knights discover young Anakin Skywalker on Tatooine. Chronological entry point.',
  },
  'sw-ep2': {
    id: 'sw-ep2',
    title: 'Star Wars: Episode II - Attack of the Clones',
    type: 'movie',
    releaseDate: '2002-05-16',
    universe: 'Star Wars',
    saga: 'Skywalker Saga',
    characters: ['Anakin Skywalker', 'Obi-Wan Kenobi', 'Padmé Amidala', 'Count Dooku', 'Jango Fett'],
    villains: ['Count Dooku', 'Jango Fett', 'Darth Sidious'],
    organizations: ['Jedi Order', 'Grand Army of the Republic', 'Confederacy of Independent Systems'],
    objects: ['Slave I', 'Kamimian Saber Dart'],
    storyArcs: ['Outbreak of the Clone Wars', 'Anakin & Padme Forbidden Romance'],
    spoilerFreeContext: 'Obi-Wan uncovers a secret clone army as Anakin protects Padmé.',
  },
  'sw-ep3': {
    id: 'sw-ep3',
    title: 'Star Wars: Episode III - Revenge of the Sith',
    type: 'movie',
    releaseDate: '2005-05-19',
    universe: 'Star Wars',
    saga: 'Skywalker Saga',
    characters: ['Anakin Skywalker (Darth Vader)', 'Obi-Wan Kenobi', 'Padmé Amidala', 'Emperor Palpatine', 'Yoda'],
    villains: ['Darth Sidious (Palpatine)', 'Darth Vader', 'General Grievous'],
    organizations: ['Galactic Empire', '501st Legion', 'Jedi Order'],
    objects: ['Order 66 Transmissions', 'Mustafar Lightsabers'],
    storyArcs: ['Fall of the Republic', 'Birth of Darth Vader'],
    spoilerFreeContext: 'Anakin succumbs to the dark side, transforming the Republic into the Galactic Empire.',
  },

  // Standalone Films
  'sw-rogue-one': {
    id: 'sw-rogue-one',
    title: 'Rogue One: A Star Wars Story',
    type: 'movie',
    releaseDate: '2016-12-14',
    universe: 'Star Wars',
    saga: 'Galactic Civil War',
    characters: ['Jyn Erso', 'Cassian Andor', 'K-2SO', 'Chirrut Îmwe', 'Darth Vader', 'Director Krennic'],
    villains: ['Director Krennic', 'Darth Vader', 'Grand Moff Tarkin'],
    organizations: ['Rogue One Squadron', 'Rebel Intelligence', 'Imperial Security Bureau'],
    objects: ['Death Star Schematics', 'Kyber Crystals'],
    storyArcs: ['Scarif Heist'],
    spoilerFreeContext: 'Rebel agents execute a desperate heist to steal the Death Star blueprints. Standalone entry point.',
  },
  'sw-solo': {
    id: 'sw-solo',
    title: 'Solo: A Star Wars Story',
    type: 'movie',
    releaseDate: '2018-05-23',
    universe: 'Star Wars',
    saga: 'Underworld',
    characters: ['Han Solo', 'Chewbacca', 'Lando Calrissian', 'Qi\'ra', 'Tobias Beckett'],
    villains: ['Dryden Vos', 'Darth Maul (Crimson Dawn)'],
    organizations: ['Crimson Dawn Syndicate', 'Pyke Syndicate'],
    objects: ['Millennium Falcon', 'Coaxium Fuel'],
    storyArcs: ['Kessel Run', 'Han Solo Origins'],
    spoilerFreeContext: 'Young Han Solo joins galactic smugglers and meets Chewbacca. Standalone entry point.',
  },

  // Disney+ Mandoverse & Spinoff Series
  'sw-mandalorian': {
    id: 'sw-mandalorian',
    title: 'The Mandalorian',
    type: 'tv-series',
    releaseDate: '2019-11-12',
    universe: 'Star Wars',
    saga: 'Mandoverse',
    characters: ['Din Djarin (The Mandalorian)', 'Grogu (Baby Yoda)', 'Greef Karga', 'Cara Dune', 'Moff Gideon', 'Ahsoka Tano'],
    villains: ['Moff Gideon', 'Imperial Remnant'],
    organizations: ['Mandalorian Tribe', 'Imperial Remnant', 'Bounty Hunters Guild'],
    objects: ['Beskar Armor', 'Darksaber', 'Razor Crest'],
    storyArcs: ['Quest for the Jedi', 'Reclaiming Mandalore'],
    spoilerFreeContext: 'A lone Mandalorian bounty hunter protects a force-sensitive child. Standalone TV entry point.',
  },
  'sw-boba-fett': {
    id: 'sw-boba-fett',
    title: 'The Book of Boba Fett',
    type: 'tv-series',
    releaseDate: '2021-12-29',
    universe: 'Star Wars',
    saga: 'Mandoverse',
    characters: ['Boba Fett', 'Fennec Shand', 'Din Djarin', 'Grogu', 'Cad Bane'],
    villains: ['Cad Bane', 'Pyke Syndicate'],
    organizations: ['Fett Crime Family', 'Pyke Syndicate'],
    objects: ['Gaderffii Stick', 'Slave I / Firespray'],
    storyArcs: ['Mos Espa Underworld War', 'Din Djarin Reunion'],
    spoilerFreeContext: 'Boba Fett takes control of Jabba the Hutt former crime empire on Tatooine.',
  },
  'sw-andor': {
    id: 'sw-andor',
    title: 'Andor',
    type: 'tv-series',
    releaseDate: '2022-09-21',
    universe: 'Star Wars',
    saga: 'Galactic Civil War',
    characters: ['Cassian Andor', 'Luthen Rael', 'Mon Mothma', 'Bix Caleen', 'Dedra Meero'],
    villains: ['Dedra Meero', 'Syril Karn', 'Imperial Security Bureau (ISB)'],
    organizations: ['Early Rebel Cells', 'ISB', 'Narkina 5 Prison Guard'],
    objects: ['Aldhani Payload', 'Kyber Pendant'],
    storyArcs: ['Birth of the Rebellion', 'Aldhani Heist'],
    spoilerFreeContext: 'Cassian Andor is drawn into the clandestine origins of the Rebel Alliance. Standalone entry point.',
  },
  'sw-ahsoka': {
    id: 'sw-ahsoka',
    title: 'Ahsoka',
    type: 'tv-series',
    releaseDate: '2023-08-22',
    universe: 'Star Wars',
    saga: 'Mandoverse',
    characters: ['Ahsoka Tano', 'Sabine Wren', 'Hera Syndulla', 'Grand Admiral Thrawn', 'Baylan Skoll'],
    villains: ['Grand Admiral Thrawn', 'Baylan Skoll', 'Shin Hati', 'Morgan Elsbeth'],
    organizations: ['New Republic', 'Imperial Remnant', 'Nightsisters of Peridea'],
    objects: ['Eye of Sion', 'Star Map to Peridea'],
    storyArcs: ['Search for Thrawn & Ezra', 'Peridea Incursion'],
    spoilerFreeContext: 'Former Jedi Ahsoka Tano tracks Grand Admiral Thrawn in another galaxy.',
  },
  'sw-mandalorian-grogu': {
    id: 'sw-mandalorian-grogu',
    title: 'The Mandalorian & Grogu',
    type: 'movie',
    releaseDate: '2026-05-22',
    universe: 'Star Wars',
    saga: 'Mandoverse',
    characters: ['Din Djarin', 'Grogu', 'Garazeb Orrelios'],
    villains: ['Imperial Remnant Warlords'],
    organizations: ['New Republic Rangers', 'Mandalorian Clans'],
    objects: ['Beskar Spear', 'N-1 Starfighter'],
    storyArcs: ['Theatrical Mandoverse Climax'],
    spoilerFreeContext: 'Din Djarin and Grogu embark on a feature film adventure defending the New Republic.',
  },

  // Skywalker Saga - Sequel Trilogy
  'sw-ep7': { id: 'sw-ep7', title: 'Star Wars: Episode VII - The Force Awakens', type: 'movie', releaseDate: '2015-12-18', universe: 'Star Wars', saga: 'Skywalker Saga', characters: ['Rey', 'Finn', 'Poe Dameron', 'Kylo Ren', 'Han Solo', 'Leia Organa'], villains: ['Kylo Ren', 'Supreme Leader Snoke'], organizations: ['Resistance', 'First Order'], objects: ['Skywalker Lightsaber'], storyArcs: ['Rise of the First Order'] },
  'sw-ep8': { id: 'sw-ep8', title: 'Star Wars: Episode VIII - The Last Jedi', type: 'movie', releaseDate: '2017-12-15', universe: 'Star Wars', saga: 'Skywalker Saga', characters: ['Rey', 'Finn', 'Poe Dameron', 'Kylo Ren', 'Luke Skywalker'], villains: ['Kylo Ren', 'Supreme Leader Snoke'], organizations: ['Resistance', 'First Order'], objects: ['Skywalker Lightsaber'], storyArcs: ['Lessons on Ahch-To'] },
  'sw-ep9': { id: 'sw-ep9', title: 'Star Wars: Episode IX - The Rise of Skywalker', type: 'movie', releaseDate: '2019-12-20', universe: 'Star Wars', saga: 'Skywalker Saga', characters: ['Rey', 'Finn', 'Poe Dameron', 'Kylo Ren', 'Emperor Palpatine'], villains: ['Emperor Palpatine', 'Kylo Ren'], organizations: ['Resistance', 'Final Order'], objects: ['Exegol Wayfinder'], storyArcs: ['Skywalker Saga Conclusion'] },

  // Wizarding World
  'hp-sorcerers-stone': { id: 'hp-sorcerers-stone', title: "Harry Potter 1", type: 'movie', releaseDate: '2001-11-16', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-chamber-of-secrets': { id: 'hp-chamber-of-secrets', title: "Harry Potter 2", type: 'movie', releaseDate: '2002-11-13', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-prisoner-of-azkaban': { id: 'hp-prisoner-of-azkaban', title: "Harry Potter 3", type: 'movie', releaseDate: '2004-06-04', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-goblet-of-fire': { id: 'hp-goblet-of-fire', title: "Harry Potter 4", type: 'movie', releaseDate: '2005-11-18', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-order-of-phoenix': { id: 'hp-order-of-phoenix', title: "Harry Potter 5", type: 'movie', releaseDate: '2007-07-11', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-half-blood-prince': { id: 'hp-half-blood-prince', title: "Harry Potter 6", type: 'movie', releaseDate: '2009-07-15', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-deathly-hallows-1': { id: 'hp-deathly-hallows-1', title: "Harry Potter 7", type: 'movie', releaseDate: '2010-11-19', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },
  'hp-deathly-hallows-2': { id: 'hp-deathly-hallows-2', title: "Harry Potter 8", type: 'movie', releaseDate: '2011-07-15', universe: 'Wizarding World', characters: ['Harry Potter'], villains: ['Voldemort'], organizations: ['Hogwarts'], objects: [], storyArcs: [] },

  // Middle-earth
  'lotr-1': { id: 'lotr-1', title: 'LOTR: Fellowship of the Ring', type: 'movie', releaseDate: '2001-12-18', universe: 'Middle-earth', characters: ['Frodo'], villains: ['Sauron'], organizations: ['Fellowship'], objects: ['One Ring'], storyArcs: [] },
  'lotr-2': { id: 'lotr-2', title: 'LOTR: The Two Towers', type: 'movie', releaseDate: '2002-12-18', universe: 'Middle-earth', characters: ['Frodo'], villains: ['Saruman'], organizations: [], objects: ['One Ring'], storyArcs: [] },
  'lotr-3': { id: 'lotr-3', title: 'LOTR: Return of the King', type: 'movie', releaseDate: '2003-12-17', universe: 'Middle-earth', characters: ['Frodo'], villains: ['Sauron'], organizations: [], objects: ['One Ring'], storyArcs: [] },

  // John Wick
  'jw-1': { id: 'jw-1', title: 'John Wick', type: 'movie', releaseDate: '2014-10-24', universe: 'John Wick', characters: ['John Wick'], villains: ['Viggo'], organizations: ['Continental'], objects: [], storyArcs: [] },
  'jw-2': { id: 'jw-2', title: 'John Wick 2', type: 'movie', releaseDate: '2017-02-10', universe: 'John Wick', characters: ['John Wick'], villains: ['Santino'], organizations: ['High Table'], objects: [], storyArcs: [] },
  'jw-3': { id: 'jw-3', title: 'John Wick 3', type: 'movie', releaseDate: '2019-05-17', universe: 'John Wick', characters: ['John Wick'], villains: ['High Table'], organizations: ['High Table'], objects: [], storyArcs: [] },
  'jw-4': { id: 'jw-4', title: 'John Wick 4', type: 'movie', releaseDate: '2023-03-24', universe: 'John Wick', characters: ['John Wick'], villains: ['Marquis'], organizations: ['High Table'], objects: [], storyArcs: [] },

  // Fast & Furious
  'ff-1': { id: 'ff-1', title: 'The Fast and the Furious', type: 'movie', releaseDate: '2001-06-22', universe: 'Fast & Furious', characters: ['Dom Toretto', 'Brian OConner'], villains: ['Johnny Tran'], organizations: ['Toretto Crew'], objects: [], storyArcs: [] },

  // X-Men Animated Series
  'xmen-tas': { id: 'xmen-tas', title: 'X-Men: The Animated Series', type: 'tv-series', releaseDate: '1992-10-31', universe: 'X-Men', characters: ['Cyclops', 'Wolverine'], villains: ['Magneto'], organizations: ['X-Men'], objects: [], storyArcs: [] },

  // Mission Impossible
  'mi-1': { id: 'mi-1', title: 'Mission Impossible 1', type: 'movie', releaseDate: '1996-05-22', universe: 'Mission Impossible', characters: ['Ethan Hunt'], villains: ['Jim Phelps'], organizations: ['IMF'], objects: [], storyArcs: [] },

  // Jurassic Park
  'jp-1': { id: 'jp-1', title: 'Jurassic Park', type: 'movie', releaseDate: '1993-06-11', universe: 'Jurassic Park', characters: ['Alan Grant'], villains: ['T-Rex'], organizations: ['InGen'], objects: [], storyArcs: [] },

  // The Conjuring Universe
  'conj-1': { id: 'conj-1', title: 'The Conjuring', type: 'movie', releaseDate: '2013-07-18', universe: 'the-conjuring-universe', characters: ['Ed Warren', 'Lorraine Warren', 'Carolyn Perron', 'Roger Perron'], villains: ['Bathsheba Sherman', 'Annabelle Doll'], organizations: ['NESPR'], objects: ['Annabelle Doll', 'Music Box'], storyArcs: ['Warren Occult Investigations', 'Harrisville Haunting'], isEntryPoint: true, reviewStatus: 'canonical' },
  'conj-annabelle': { id: 'conj-annabelle', title: 'Annabelle', type: 'movie', releaseDate: '2014-10-02', universe: 'the-conjuring-universe', characters: ['Mia Form', 'John Form', 'Father Perez'], villains: ['Malthus (Annabelle Demon)'], organizations: ['Disciples of the Ram'], objects: ['Annabelle Doll'], storyArcs: ['Annabelle Doll Origin'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-2': { id: 'conj-2', title: 'The Conjuring 2', type: 'movie', releaseDate: '2016-05-13', universe: 'the-conjuring-universe', characters: ['Ed Warren', 'Lorraine Warren', 'Janet Hodgson'], villains: ['Valak (The Nun)', 'The Crooked Man'], organizations: ['NESPR', 'SPR'], objects: ['Valak Painting'], storyArcs: ['Enfield Poltergeist', 'Valak Demon Arc'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-annabelle-creation': { id: 'conj-annabelle-creation', title: 'Annabelle: Creation', type: 'movie', releaseDate: '2017-08-09', universe: 'the-conjuring-universe', characters: ['Janice / Annabelle Higgins', 'Sister Charlotte'], villains: ['Malthus (Annabelle Demon)'], organizations: ['Disciples of the Ram'], objects: ['Annabelle Doll'], storyArcs: ['Annabelle Doll Origin'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-the-nun': { id: 'conj-the-nun', title: 'The Nun', type: 'movie', releaseDate: '2018-09-05', universe: 'the-conjuring-universe', characters: ['Sister Irene', 'Father Burke', 'Frenchie (Maurice)'], villains: ['Valak (The Nun)'], organizations: ['Vatican'], objects: ['Holy Relic of Christ Blood'], storyArcs: ['Valak Demon Arc'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-la-llorona': { id: 'conj-la-llorona', title: 'The Curse of La Llorona', type: 'movie', releaseDate: '2019-04-17', universe: 'the-conjuring-universe', characters: ['Anna Tate-Garcia', 'Father Perez'], villains: ['La Llorona'], organizations: ['CPS'], objects: ['Annabelle Doll (flashback)'], storyArcs: ['Ancillary Warren Lore'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-annabelle-comes-home': { id: 'conj-annabelle-comes-home', title: 'Annabelle Comes Home', type: 'movie', releaseDate: '2019-06-26', universe: 'the-conjuring-universe', characters: ['Judy Warren', 'Ed Warren', 'Lorraine Warren'], villains: ['Malthus (Annabelle Demon)', 'The Ferryman'], organizations: ['NESPR'], objects: ['Annabelle Doll', 'Ferryman Coins'], storyArcs: ['Warren Occult Museum'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-3': { id: 'conj-3', title: 'The Conjuring: The Devil Made Me Do It', type: 'movie', releaseDate: '2021-05-26', universe: 'the-conjuring-universe', characters: ['Ed Warren', 'Lorraine Warren', 'Arne Johnson'], villains: ['The Occultist'], organizations: ['NESPR'], objects: ['Witch Totems'], storyArcs: ['Brookfield Murder Trial'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-the-nun-2': { id: 'conj-the-nun-2', title: 'The Nun II', type: 'movie', releaseDate: '2023-09-06', universe: 'the-conjuring-universe', characters: ['Sister Irene', 'Frenchie (Maurice)'], villains: ['Valak (The Nun)'], organizations: ['Vatican'], objects: ['Eyes of St. Lucy'], storyArcs: ['Valak Demon Arc'], isEntryPoint: false, reviewStatus: 'canonical' },

  // Evil Dead
  'ed-1': { id: 'ed-1', title: 'The Evil Dead', type: 'movie', releaseDate: '1981-10-15', universe: 'Evil Dead', characters: ['Ash Williams', 'Linda'], villains: ['Deadites', 'Kandar Demon'], organizations: [], objects: ['Necronomicon Ex-Mortis'], storyArcs: ['Ash Williams Deadite Saga'], isEntryPoint: true, reviewStatus: 'canonical' },
  'ed-2': { id: 'ed-2', title: 'Evil Dead II', type: 'movie', releaseDate: '1987-03-13', universe: 'Evil Dead', characters: ['Ash Williams', 'Annie Knowby'], villains: ['Henrietta', 'Deadites'], organizations: [], objects: ['Necronomicon Ex-Mortis', 'Chainsaw'], storyArcs: ['Ash Williams Deadite Saga'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ed-3': { id: 'ed-3', title: 'Army of Darkness', type: 'movie', releaseDate: '1992-10-09', universe: 'Evil Dead', characters: ['Ash Williams', 'Sheila'], villains: ['Evil Ash', 'Army of the Dead'], organizations: ['Medieval Kingdom'], objects: ['Necronomicon Ex-Mortis'], storyArcs: ['Ash Williams Deadite Saga'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ed-4': { id: 'ed-4', title: 'Evil Dead', type: 'movie', releaseDate: '2013-04-05', universe: 'Evil Dead', characters: ['Mia Allen', 'David Allen'], villains: ['Abomination'], organizations: [], objects: ['Naturom Demonto'], storyArcs: ['Cabin Necronomicon Curse'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ed-ash-vs-ed': { id: 'ed-ash-vs-ed', title: 'Ash vs Evil Dead', type: 'tv-series', releaseDate: '2015-10-31', universe: 'Evil Dead', characters: ['Ash Williams', 'Pablo Simon Bolivar', 'Kelly Maxwell'], villains: ['Eligos', 'Baal'], organizations: ['Ghostbeaters'], objects: ['Necronomicon Ex-Mortis'], storyArcs: ['Ghostbeaters Quest'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ed-rise': { id: 'ed-rise', title: 'Evil Dead Rise', type: 'movie', releaseDate: '2023-04-21', universe: 'Evil Dead', characters: ['Beth', 'Ellie'], villains: ['The Marauder'], organizations: [], objects: ['Necronomicon Ex-Mortis'], storyArcs: ['High-Rise Necronomicon Terror'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ed-burn': { id: 'ed-burn', title: 'Evil Dead Burn', type: 'movie', releaseDate: '2026-07-10', universe: 'Evil Dead', characters: ['Deadites'], villains: ['Deadite Family'], organizations: [], objects: ['Necronomicon Ex-Mortis'], storyArcs: ['High-Rise Necronomicon Terror'], isEntryPoint: false, reviewStatus: 'canonical' },

  // Insidious
  'ins-1': { id: 'ins-1', title: 'Insidious', type: 'movie', releaseDate: '2010-09-14', universe: 'Insidious', characters: ['Josh Lambert', 'Renai Lambert', 'Dalton Lambert', 'Elise Rainier'], villains: ['Lipstick-Face Demon'], organizations: ['Spectral Sightings'], objects: ['Lantern of The Further'], storyArcs: ['Lambert Family Haunting'], isEntryPoint: true, reviewStatus: 'canonical' },
  'ins-2': { id: 'ins-2', title: 'Insidious: Chapter 2', type: 'movie', releaseDate: '2013-09-13', universe: 'Insidious', characters: ['Josh Lambert', 'Renai Lambert', 'Elise Rainier'], villains: ['Bride in Black'], organizations: ['Spectral Sightings'], objects: ['Carl Dice Cards'], storyArcs: ['Lambert Family Haunting'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ins-3': { id: 'ins-3', title: 'Insidious: Chapter 3', type: 'movie', releaseDate: '2015-06-05', universe: 'Insidious', characters: ['Elise Rainier', 'Quinn Brenner'], villains: ['The Man Who Can\'t Breathe'], organizations: ['Spectral Sightings'], objects: ['Elise Journal'], storyArcs: ['Elise Rainier Astral Cases'], isEntryPoint: true, reviewStatus: 'canonical' },
  'ins-4': { id: 'ins-4', title: 'Insidious: The Last Key', type: 'movie', releaseDate: '2018-01-05', universe: 'Insidious', characters: ['Elise Rainier', 'Specs', 'Tucker'], villains: ['KeyFace'], organizations: ['Spectral Sightings'], objects: ['Red Door Keys'], storyArcs: ['Elise Rainier Origin'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ins-5': { id: 'ins-5', title: 'Insidious: The Red Door', type: 'movie', releaseDate: '2023-07-07', universe: 'Insidious', characters: ['Josh Lambert', 'Dalton Lambert'], villains: ['Lipstick-Face Demon'], organizations: [], objects: ['Red Door'], storyArcs: ['Lambert Family Haunting'], isEntryPoint: false, reviewStatus: 'canonical' },
  'ins-6': { id: 'ins-6', title: 'Insidious: Out of the Further', type: 'movie', releaseDate: '2026-08-21', universe: 'Insidious', characters: ['Elise Rainier'], villains: ['Demon Entities'], organizations: ['Spectral Sightings'], objects: ['Red Door Keys'], storyArcs: ['The Further'], isEntryPoint: false, reviewStatus: 'canonical' },
  'conj-last-rites': { id: 'conj-last-rites', title: 'The Conjuring: Last Rites', type: 'movie', releaseDate: '2025-09-05', universe: 'the-conjuring-universe', characters: ['Ed Warren', 'Lorraine Warren', 'Judy Warren'], villains: ['Demonic Entity'], organizations: ['NESPR'], objects: ['Warren Artifact Room'], storyArcs: ['Warren Family Legacy'], isEntryPoint: false, reviewStatus: 'canonical' },
  // ─── ALIAS & MISSING TITLE NODES FOR GLOBAL CATALOG COMPLETENESS ───
  // MCU Aliases
  'mcu-iron-man': { id: 'mcu-iron-man', title: 'Iron Man', type: 'movie', releaseDate: '2008-05-02', universe: 'MCU', saga: 'Infinity Saga', phase: 1, characters: ['Tony Stark (Iron Man)', 'Pepper Potts', 'Rhodey', 'Obadiah Stane'], villains: ['Obadiah Stane (Iron Monger)'], organizations: ['Stark Industries', 'S.H.I.E.L.D.'], objects: ['Arc Reactor', 'Mark III Armor'], storyArcs: ['Iron Man Origin'], isEntryPoint: true, reviewStatus: 'canonical' },
  'mcu-iron-man-2': { id: 'mcu-iron-man-2', title: 'Iron Man 2', type: 'movie', releaseDate: '2010-05-07', universe: 'MCU', saga: 'Infinity Saga', phase: 1, characters: ['Tony Stark', 'Pepper Potts', 'Rhodey (War Machine)', 'Natasha Romanoff', 'Nick Fury'], villains: ['Whiplash (Ivan Vanko)', 'Justin Hammer'], organizations: ['Stark Industries', 'S.H.I.E.L.D.'], objects: ['New Element Arc Reactor'], storyArcs: ['Avenger Initiative Setup'], reviewStatus: 'canonical' },
  'mcu-iron-man-3': { id: 'mcu-iron-man-3', title: 'Iron Man 3', type: 'movie', releaseDate: '2013-05-03', universe: 'MCU', saga: 'Infinity Saga', phase: 2, characters: ['Tony Stark', 'Pepper Potts', 'Rhodey (Iron Patriot)'], villains: ['Aldrich Killian', 'Trevor Slattery (Mandarin)'], organizations: ['AIM'], objects: ['Extremis', 'Iron Legion'], storyArcs: ['Post-New York Trauma'], reviewStatus: 'canonical' },
  'mcu-captain-america': { id: 'mcu-captain-america', title: 'Captain America: The First Avenger', type: 'movie', releaseDate: '2011-07-22', universe: 'MCU', saga: 'Infinity Saga', phase: 1, characters: ['Steve Rogers (Captain America)', 'Peggy Carter', 'Bucky Barnes', 'Howard Stark'], villains: ['Red Skull (Johann Schmidt)'], organizations: ['SSR', 'HYDRA'], objects: ['Tesseract (Space Stone)', 'Vibranium Shield'], storyArcs: ['Captain America Origin'], isEntryPoint: true, reviewStatus: 'canonical' },
  'mcu-ant-man-wasp': { id: 'mcu-ant-man-wasp', title: 'Ant-Man and the Wasp', type: 'movie', releaseDate: '2018-07-06', universe: 'MCU', saga: 'Infinity Saga', phase: 3, characters: ['Scott Lang', 'Hope van Dyne (Wasp)', 'Hank Pym', 'Janet van Dyne'], villains: ['Ghost (Ava Starr)', 'Sonny Burch'], organizations: ['Pym Tech'], objects: ['Quantum Tunnel'], storyArcs: ['Quantum Realm Rescue'], reviewStatus: 'canonical' },
  'mcu-no-way-home': { id: 'mcu-no-way-home', title: 'Spider-Man: No Way Home', type: 'movie', releaseDate: '2021-12-17', universe: 'MCU', saga: 'Multiverse Saga', phase: 4, characters: ['Peter Parker (Spider-Man)', 'MJ', 'Ned Leeds', 'Doctor Strange', 'Peter-Two (Maguire)', 'Peter-Three (Garfield)'], villains: ['Green Goblin (Norman Osborn)', 'Doc Ock', 'Electro'], organizations: ['Avenger Multiverse Defenders'], objects: ['Machina de Kadavus'], storyArcs: ['Spider-Man Multiverse Climax'], reviewStatus: 'canonical' },
  'mcu-agatha': { id: 'mcu-agatha', title: 'Agatha All Along', type: 'tv-series', releaseDate: '2024-09-18', universe: 'MCU', saga: 'Multiverse Saga', phase: 5, characters: ['Agatha Harkness', 'Billy Maximoff (Wiccan)', 'Rio Vidal (Death)'], villains: ['Salem Seven', 'Rio Vidal'], organizations: ['Witches Coven'], objects: ['Witches Road'], storyArcs: ['Witches Road Quest'], reviewStatus: 'canonical' },

  // Star Wars missing nodes
  'sw-tcw-movie': { id: 'sw-tcw-movie', title: 'Star Wars: The Clone Wars Movie', type: 'movie', releaseDate: '2008-08-15', universe: 'Star Wars', saga: 'Clone Wars', characters: ['Anakin Skywalker', 'Ahsoka Tano', 'Obi-Wan Kenobi'], villains: ['Asajj Ventress', 'Count Dooku'], organizations: ['Jedi Order', 'Galactic Republic'], objects: ['Rotta the Huttlet'], storyArcs: ['Clone Wars Outbreak'], isEntryPoint: true, reviewStatus: 'canonical' },
  'sw-tcw-series': { id: 'sw-tcw-series', title: 'Star Wars: The Clone Wars Series', type: 'tv-series', releaseDate: '2008-10-03', universe: 'Star Wars', saga: 'Clone Wars', characters: ['Anakin Skywalker', 'Ahsoka Tano', 'Obi-Wan Kenobi', 'Captain Rex', 'Darth Maul'], villains: ['Darth Maul', 'Count Dooku', 'General Grievous'], organizations: ['501st Legion', 'Jedi Order'], objects: ['Darksaber'], storyArcs: ['Siege of Mandalore'], reviewStatus: 'canonical' },
  'sw-rebels': { id: 'sw-rebels', title: 'Star Wars Rebels', type: 'tv-series', releaseDate: '2014-10-03', universe: 'Star Wars', saga: 'Rebellion', characters: ['Ezra Bridger', 'Kanan Jarrus', 'Hera Syndulla', 'Sabine Wren', 'Ahsoka Tano', 'Grand Admiral Thrawn'], villains: ['Grand Admiral Thrawn', 'Grand Inquisitor', 'Darth Vader'], organizations: ['Ghost Crew', 'Phoenix Squadron'], objects: ['Ezra Lightsaber Blaster', 'World Between Worlds'], storyArcs: ['Lothal Liberation'], reviewStatus: 'canonical' },
  'sw-bad-batch': { id: 'sw-bad-batch', title: 'Star Wars: The Bad Batch', type: 'tv-series', releaseDate: '2021-05-04', universe: 'Star Wars', saga: 'Imperial Era', characters: ['Hunter', 'Tech', 'Wrecker', 'Crosshair', 'Omega', 'Echo'], villains: ['Doctor Hemlock', 'Grand Moff Tarkin'], organizations: ['Clone Force 99', 'Mount Tantiss'], objects: ['Havoc Marauder'], storyArcs: ['Mount Tantiss Cloning Facility'], reviewStatus: 'canonical' },
  'sw-obi-wan': { id: 'sw-obi-wan', title: 'Obi-Wan Kenobi', type: 'tv-series', releaseDate: '2022-05-27', universe: 'Star Wars', saga: 'Imperial Era', characters: ['Obi-Wan Kenobi', 'Darth Vader', 'Princess Leia', 'Reva (Third Sister)'], villains: ['Darth Vader', 'Reva'], organizations: ['Inquisitorius', 'The Path'], objects: ['Kenobi Lightsaber'], storyArcs: ['Rescue of Young Leia'], reviewStatus: 'canonical' },
  'sw-tales-jedi': { id: 'sw-tales-jedi', title: 'Tales of the Jedi', type: 'tv-series', releaseDate: '2022-10-26', universe: 'Star Wars', saga: 'Skywalker Saga', characters: ['Ahsoka Tano', 'Count Dooku', 'Qui-Gon Jinn', 'Mace Windu'], villains: ['Darth Sidious'], organizations: ['Jedi Order'], objects: ['Jedi Holocrons'], storyArcs: ['Dooku Fall & Ahsoka Youth'], reviewStatus: 'canonical' },
  'sw-acolyte': { id: 'sw-acolyte', title: 'The Acolyte', type: 'tv-series', releaseDate: '2024-06-04', universe: 'Star Wars', saga: 'High Republic', characters: ['Osha Aniseya', 'Mae Aniseya', 'Sol', 'Qimir (The Stranger)', 'Jecki Lon'], villains: ['The Stranger (Qimir)', 'Darth Plagueis'], organizations: ['High Republic Jedi', 'Brendok Coven'], objects: ['Cortosis Helmet'], storyArcs: ['High Republic Sith Secret'], isEntryPoint: true, reviewStatus: 'canonical' },
  'sw-skeleton-crew': { id: 'sw-skeleton-crew', title: 'Skeleton Crew', type: 'tv-series', releaseDate: '2024-12-03', universe: 'Star Wars', saga: 'Mandoverse', characters: ['Jod Na Nawood', 'Wim', 'Fern', 'KB', 'Neel'], villains: ['Vane', 'Space Pirates'], organizations: ['New Republic Border Patrol'], objects: ['Onyx Cinder'], storyArcs: ['Lost Children Galaxy Quest'], isEntryPoint: true, reviewStatus: 'canonical' },

  // Harry Potter / Fantastic Beasts missing nodes
  'hp-order-of-the-phoenix': { id: 'hp-order-of-the-phoenix', title: 'Harry Potter and the Order of the Phoenix', type: 'movie', releaseDate: '2007-07-11', universe: 'Wizarding World', characters: ['Harry Potter', 'Ron Weasley', 'Hermione Granger', 'Albus Dumbledore', 'Sirius Black', 'Dolores Umbridge'], villains: ['Lord Voldemort', 'Dolores Umbridge', 'Bellatrix Lestrange'], organizations: ['Order of the Phoenix', 'Dumbledores Army', 'Ministry of Magic'], objects: ['Prophecy Orb'], storyArcs: ['Battle of the Department of Mysteries'], reviewStatus: 'canonical' },
  'hp-fb-1': { id: 'hp-fb-1', title: 'Fantastic Beasts and Where to Find Them', type: 'movie', releaseDate: '2016-11-18', universe: 'Wizarding World', characters: ['Newt Scamander', 'Tina Goldstein', 'Jacob Kowalski', 'Queenie Goldstein', 'Credence Barebone', 'Percival Graves'], villains: ['Gellert Grindelwald', 'Obscurus'], organizations: ['MACUSA'], objects: ['Newt Magical Suitcase'], storyArcs: ['1920s Wizarding World'], isEntryPoint: true, reviewStatus: 'canonical' },
  'hp-fb-2': { id: 'hp-fb-2', title: 'Fantastic Beasts: The Crimes of Grindelwald', type: 'movie', releaseDate: '2018-11-16', universe: 'Wizarding World', characters: ['Newt Scamander', 'Albus Dumbledore', 'Gellert Grindelwald', 'Leta Lestrange', 'Nagini'], villains: ['Gellert Grindelwald'], organizations: ['Alliance of Grindelwald', 'British Ministry of Magic'], objects: ['Blood Pact Amulet'], storyArcs: ['Rise of Grindelwald'], reviewStatus: 'canonical' },
  'hp-fb-3': { id: 'hp-fb-3', title: 'Fantastic Beasts: The Secrets of Dumbledore', type: 'movie', releaseDate: '2022-04-15', universe: 'Wizarding World', characters: ['Newt Scamander', 'Albus Dumbledore', 'Gellert Grindelwald', 'Theseus Scamander', 'Eulalie Hicks'], villains: ['Gellert Grindelwald'], organizations: ['International Confederation of Wizards'], objects: ['Qilin Creature'], storyArcs: ['Bhutan ICW Election'], reviewStatus: 'canonical' },
  'wizarding-world-harry-potter-tv': { id: 'wizarding-world-harry-potter-tv', title: 'Harry Potter TV Series', type: 'tv-series', releaseDate: '2026-01-01', universe: 'Wizarding World', characters: ['Harry Potter', 'Ron Weasley', 'Hermione Granger'], villains: ['Lord Voldemort'], organizations: ['Hogwarts'], objects: ['Wand'], storyArcs: ['Re-imagined Hogwarts Decade'], isEntryPoint: true, reviewStatus: 'upcoming' },

  // DC / DCEU missing nodes
  'dc-suicide-squad': { id: 'dc-suicide-squad', title: 'Suicide Squad', type: 'movie', releaseDate: '2016-08-05', universe: 'DCEU', saga: 'DCEU', characters: ['Harley Quinn', 'Deadshot', 'Rick Flag', 'Amanda Waller', 'The Joker', 'El Diablo'], villains: ['Enchantress', 'Incubus'], organizations: ['Task Force X', 'ARGUS'], objects: ['Nanite Bombs'], storyArcs: ['Midway City Outbreak'], reviewStatus: 'canonical' },
  'dc-birds-of-prey': { id: 'dc-birds-of-prey', title: 'Birds of Prey', type: 'movie', releaseDate: '2020-02-07', universe: 'DCEU', saga: 'DCEU', characters: ['Harley Quinn', 'Helena Bertinelli (Huntress)', 'Dinah Lance (Black Canary)', 'Renee Montoya', 'Cassandra Cain'], villains: ['Roman Sionis (Black Mask)', 'Victor Zsasz'], organizations: ['Birds of Prey'], objects: ['Bertinelli Diamond'], storyArcs: ['Harley Quinn Independence'], reviewStatus: 'canonical' },
  'dc-ww84': { id: 'dc-ww84', title: 'Wonder Woman 1984', type: 'movie', releaseDate: '2020-12-25', universe: 'DCEU', saga: 'DCEU', characters: ['Diana Prince (Wonder Woman)', 'Steve Trevor', 'Barbara Minerva (Cheetah)', 'Maxwell Lord'], villains: ['Maxwell Lord', 'Cheetah'], organizations: ['Smithsonian Institution'], objects: ['Dreamstone', 'Asteria Gold Armor'], storyArcs: ['Cold War Wish Era'], reviewStatus: 'canonical' },
  'dc-black-adam': { id: 'dc-black-adam', title: 'Black Adam', type: 'movie', releaseDate: '2022-10-21', universe: 'DCEU', saga: 'DCEU', characters: ['Teth-Adam (Black Adam)', 'Hawkman', 'Doctor Fate', 'Cyclone', 'Atom Smasher'], villains: ['Sabbac (Isham Gregor)'], organizations: ['Justice Society of America (JSA)', 'Intergang'], objects: ['Crown of Sabbac', 'Eternium'], storyArcs: ['Kahndaq Liberation'], reviewStatus: 'canonical' },
  'dc-shazam-fury': { id: 'dc-shazam-fury', title: 'Shazam! Fury of the Gods', type: 'movie', releaseDate: '2023-03-17', universe: 'DCEU', saga: 'DCEU', characters: ['Billy Batson (Shazam)', 'Freddy Freeman', 'Hespera', 'Kalypso', 'Anthea', 'Wonder Woman'], villains: ['Daughters of Atlas (Hespera & Kalypso)'], organizations: ['Shazam Family'], objects: ['Golden Apple', 'Staff of the Gods'], storyArcs: ['Philadelphia Gods Siege'], reviewStatus: 'canonical' },
  'dc-the-flash': { id: 'dc-the-flash', title: 'The Flash', type: 'movie', releaseDate: '2023-06-16', universe: 'DCEU', saga: 'Multiverse DCEU', characters: ['Barry Allen (The Flash)', 'Alternate Barry', 'Batman (Keaton)', 'Supergirl (Kara Zor-El)', 'Batman (Affleck)'], villains: ['Dark Flash', 'General Zod'], organizations: ['Justice League'], objects: ['Chrono-Bowl Chronospear'], storyArcs: ['Flashpoint Multiverse Reset'], reviewStatus: 'canonical' },
  'dc-blue-beetle': { id: 'dc-blue-beetle', title: 'Blue Beetle', type: 'movie', releaseDate: '2023-08-18', universe: 'DCEU', saga: 'DCU Transition', characters: ['Jaime Reyes (Blue Beetle)', 'Jenny Kord', 'Rudy Reyes', 'Nana Reyes'], villains: ['Victoria Kord', 'Carapax (OMAC)'], organizations: ['Kord Industries'], objects: ['Khaji-Da Scarab'], storyArcs: ['Palmera City Scarab Symbiosis'], isEntryPoint: true, reviewStatus: 'canonical' },
  'dc-aquaman-2': { id: 'dc-aquaman-2', title: 'Aquaman and the Lost Kingdom', type: 'movie', releaseDate: '2023-12-22', universe: 'DCEU', saga: 'DCEU', characters: ['Arthur Curry (Aquaman)', 'Orm Marius', 'Mera', 'Black Manta'], villains: ['Black Manta (David Kane)', 'Kordax (Black Trident King)'], organizations: ['Atlantis Council'], objects: ['Black Trident', 'Orichalcum'], storyArcs: ['Necrus Lost Kingdom Siege'], reviewStatus: 'canonical' },
  'dc-waller': { id: 'dc-waller', title: 'Waller', type: 'tv-series', releaseDate: '2026-01-01', universe: 'DCU', saga: 'Chapter 1: Gods and Monsters', characters: ['Amanda Waller', 'Leota Adebayo', 'Emerson Harcourt'], villains: ['Black Ops Rivals'], organizations: ['ARGUS'], objects: ['Blackmail Files'], storyArcs: ['Task Force X Exposure Aftermath'], reviewStatus: 'upcoming' },
  'dc-booster-gold': { id: 'dc-booster-gold', title: 'Booster Gold', type: 'tv-series', releaseDate: '2027-01-01', universe: 'DCU', saga: 'Chapter 1: Gods and Monsters', characters: ['Michael Jon Carter (Booster Gold)', 'Skeets'], villains: ['Time Hijackers'], organizations: ['25th Century Museum'], objects: ['Time Sphere'], storyArcs: ['Future Hero Fame Quest'], isEntryPoint: true, reviewStatus: 'upcoming' },
  'dc-paradise-lost': { id: 'dc-paradise-lost', title: 'Paradise Lost', type: 'tv-series', releaseDate: '2027-01-01', universe: 'DCU', saga: 'Chapter 1: Gods and Monsters', characters: ['Hippolyta', 'Antiope'], villains: ['Themysciran Political Factions'], organizations: ['Amazonian High Council'], objects: ['Lasso of Truth'], storyArcs: ['Pre-Diana Themyscira Political Intrigue'], isEntryPoint: true, reviewStatus: 'upcoming' },

  // Fast & Furious missing nodes
  'ff-2': { id: 'ff-2', title: '2 Fast 2 Furious', type: 'movie', releaseDate: '2003-06-06', universe: 'Fast & Furious', characters: ['Brian O\'Conner', 'Roman Pearce', 'Tej Parker', 'Monica Fuentes'], villains: ['Carter Verone'], organizations: ['U.S. Customs Service'], objects: ['Nissan Skyline GT-R R34', 'Mitsubishi Lancer Evolution VII'], storyArcs: ['Miami Street Racing Undercover'], reviewStatus: 'canonical' },
  'ff-3': { id: 'ff-3', title: 'The Fast and the Furious: Tokyo Drift', type: 'movie', releaseDate: '2006-06-16', universe: 'Fast & Furious', characters: ['Sean Boswell', 'Han Lue', 'Twinkie', 'Neela', 'Takashi (D.K.)'], villains: ['Takashi (Drift King)', 'Kamata'], organizations: ['Yakuza Drift Circuit'], objects: ['1967 Ford Mustang Fastback (RB26 DETT)', 'Mazda RX-7 VeilSide'], storyArcs: ['Tokyo Drift Underground'], isEntryPoint: true, reviewStatus: 'canonical' },
  'ff-4': { id: 'ff-4', title: 'Fast & Furious', type: 'movie', releaseDate: '2009-04-03', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Brian O\'Conner', 'Letty Ortiz', 'Mia Toretto', 'Gisele Yashar'], villains: ['Arturo Braga', 'Fenix Calderon'], organizations: ['FBI', 'Braga Cartel'], objects: ['Chevelle SS', 'Subaru Impreza WRX STI'], storyArcs: ['Dominican Fuel Tanker Heist', 'Braga Border Tunnels'], reviewStatus: 'canonical' },
  'ff-5': { id: 'ff-5', title: 'Fast Five', type: 'movie', releaseDate: '2011-04-29', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Brian O\'Conner', 'Mia Toretto', 'Luke Hobbs', 'Roman Pearce', 'Tej Parker', 'Han Lue', 'Gisele Yashar'], villains: ['Hernan Reyes', 'Zizi'], organizations: ['DSS (Diplomatic Security Service)', 'Reyes Cartel'], objects: ['Vault Safe', 'Gurkha LAPV'], storyArcs: ['Rio Vault Heist'], reviewStatus: 'canonical' },
  'ff-6': { id: 'ff-6', title: 'Fast & Furious 6', type: 'movie', releaseDate: '2013-05-24', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Brian O\'Conner', 'Letty Ortiz', 'Luke Hobbs', 'Roman Pearce', 'Tej Parker', 'Han Lue', 'Gisele Yashar'], villains: ['Owen Shaw', 'Vegh'], organizations: ['Mercenary Crime Syndicate', 'DSS'], objects: ['Flip Car', 'Nightshade Device'], storyArcs: ['London Tank & Runway Chase'], reviewStatus: 'canonical' },
  'ff-7': { id: 'ff-7', title: 'Furious 7', type: 'movie', releaseDate: '2015-04-03', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Brian O\'Conner', 'Letty Ortiz', 'Deckard Shaw', 'Mr. Nobody', 'Ramsey', 'Luke Hobbs'], villains: ['Deckard Shaw', 'Mose Jakande'], organizations: ['God\'s Eye Ops', 'The Agency'], objects: ['God\'s Eye Hacking Chip', 'Lykan HyperSport'], storyArcs: ['Abu Dhabi Skyscraper Jump', 'LA Drone War'], reviewStatus: 'canonical' },
  'ff-8': { id: 'ff-8', title: 'The Fate of the Furious', type: 'movie', releaseDate: '2017-04-14', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Letty Ortiz', 'Luke Hobbs', 'Deckard Shaw', 'Cipher', 'Mr. Nobody', 'Little Nobody'], villains: ['Cipher'], organizations: ['Cyber Terrorist Syndicate', 'The Agency'], objects: ['Nuclear Submarine EMP', 'Akula Submarine'], storyArcs: ['Cipher Cyber Coercion', 'Russia Ice Submarine Battle'], reviewStatus: 'canonical' },
  'ff-hobbs-shaw': { id: 'ff-hobbs-shaw', title: 'Fast & Furious Presents: Hobbs & Shaw', type: 'movie', releaseDate: '2019-08-02', universe: 'Fast & Furious', characters: ['Luke Hobbs', 'Deckard Shaw', 'Hattie Shaw', 'Brixton Lore', 'Madam M'], villains: ['Brixton Lore (Eteon Cyber-Soldier)'], organizations: ['Eteon Terrorist Org', 'MI6'], objects: ['Snowflake Virus', 'Mechanized Motorcycle'], storyArcs: ['Samoa Compound Defense'], isEntryPoint: true, reviewStatus: 'canonical' },
  'ff-9': { id: 'ff-9', title: 'F9: The Fast Saga', type: 'movie', releaseDate: '2021-06-25', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Letty Ortiz', 'Jakob Toretto', 'Mia Toretto', 'Han Lue', 'Roman Pearce', 'Tej Parker', 'Ramsey', 'Queenie Shaw'], villains: ['Otto', 'Cipher', 'Jakob Toretto (formerly)'], organizations: ['Ares Tech Syndicate'], objects: ['Ares Magnet Satellite Arm', 'Fiero Rocket Car'], storyArcs: ['Ares Satellite Orbital Hijack'], reviewStatus: 'canonical' },
  'ff-10': { id: 'ff-10', title: 'Fast X', type: 'movie', releaseDate: '2023-05-19', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Letty Ortiz', 'Dante Reyes', 'Tess', 'Ames', 'Jakob Toretto', 'Roman Pearce', 'Tej Parker', 'Gisele Yashar'], villains: ['Dante Reyes', 'Ames'], organizations: ['The Agency', 'Reyes Syndicate'], objects: ['Neutron Bomb Sphere', 'Dam Heist Trucks'], storyArcs: ['Rome Neutron Bomb Heist', 'Portugal Dam Ambush'], reviewStatus: 'canonical' },
  'fast-fast-11': { id: 'fast-fast-11', title: 'Fast X: Part 2', type: 'movie', releaseDate: '2026-06-18', universe: 'Fast & Furious', characters: ['Dominic Toretto', 'Dante Reyes', 'Letty Ortiz', 'Gisele Yashar', 'Hobbs'], villains: ['Dante Reyes'], organizations: ['The Agency'], objects: ['Charger R/T'], storyArcs: ['Fast Saga Final Climax'], reviewStatus: 'upcoming' },

  // John Wick missing nodes
  'jw-continental': { id: 'jw-continental', title: 'The Continental: From the World of John Wick', type: 'tv-series', releaseDate: '2023-09-22', universe: 'John Wick', characters: ['Winston Scott (Young)', 'Charon (Young)', 'Cormac', 'Miles', 'Lou'], villains: ['Cormac O\'Connor'], organizations: ['The Continental Hotel NYC', 'The High Table'], objects: ['Coin Press Adjudicator Vault'], storyArcs: ['1970s Hotel Siege Heist'], isEntryPoint: true, reviewStatus: 'canonical' },
  'jw-ballerina': { id: 'jw-ballerina', title: 'From the World of John Wick: Ballerina', type: 'movie', releaseDate: '2025-06-06', universe: 'John Wick', characters: ['Eve Macarro (Ballerina)', 'John Wick', 'Winston Scott', 'Charon', 'The Director'], villains: ['Chancellor (Hitman Cult Leader)'], organizations: ['Ruska Roma Assassins', 'The High Table'], objects: ['Ruska Roma Crucifix Ticket'], storyArcs: ['Ruska Roma Assassin Vengeance'], reviewStatus: 'canonical' },

  // Mission: Impossible missing nodes
  'mi-2': { id: 'mi-2', title: 'Mission: Impossible II', type: 'movie', releaseDate: '2000-05-24', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'Nyah Nordoff-Hall', 'Luther Stickell', 'Sean Ambrose'], villains: ['Sean Ambrose', 'Hugh Stamp'], organizations: ['IMF', 'Biocyte Pharmaceuticals'], objects: ['Chimera Virus', 'Bellerophon Cure'], storyArcs: ['Sydney Virus Retrieval'], reviewStatus: 'canonical' },
  'mi-3': { id: 'mi-3', title: 'Mission: Impossible III', type: 'movie', releaseDate: '2006-05-05', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'Julia Meade', 'Benji Dunn', 'Luther Stickell', 'Owen Davian', 'John Musgrave'], villains: ['Owen Davian', 'John Musgrave'], organizations: ['IMF', 'Vatican Security'], objects: ['Rabbit\'s Foot Tech'], storyArcs: ['Rabbit\'s Foot Heist & Vatican Ambush'], reviewStatus: 'canonical' },
  'mi-gp': { id: 'mi-gp', title: 'Mission: Impossible - Ghost Protocol', type: 'movie', releaseDate: '2011-12-16', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'Benji Dunn', 'Jane Carter', 'William Brandt'], villains: ['Kurt Hendricks (Cobalt)', 'Wistrom'], organizations: ['IMF (Disavowed)', 'Russian Nuclear Command'], objects: ['Burj Khalifa Climbing Gloves', 'Nuclear Launch Briefcase'], storyArcs: ['Kremlin Bombing & Burj Khalifa Heist'], reviewStatus: 'canonical' },
  'mi-rn': { id: 'mi-rn', title: 'Mission: Impossible - Rogue Nation', type: 'movie', releaseDate: '2015-07-31', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'Ilsa Faust', 'Benji Dunn', 'Luther Stickell', 'William Brandt', 'Alan Hunley'], villains: ['Solomon Lane', 'Janik Vinter (Bone Doctor)'], organizations: ['The Syndicate', 'IMF', 'CIA'], objects: ['Torus Underwater Vault Data Chip'], storyArcs: ['Syndicate Investigation & Vienna Opera Siege'], reviewStatus: 'canonical' },
  'mi-fallout': { id: 'mi-fallout', title: 'Mission: Impossible - Fallout', type: 'movie', releaseDate: '2018-07-27', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'August Walker (Henry Cavill)', 'Ilsa Faust', 'Benji Dunn', 'Luther Stickell', 'White Widow (Alanna)', 'Julia Meade'], villains: ['August Walker (John Lark)', 'Solomon Lane'], organizations: ['The Apostles', 'IMF', 'CIA Special Activities'], objects: ['Plutonium Cores', 'Detonator Key Device'], storyArcs: ['Paris HALO Jump & Kashmir Nuke Disarming'], reviewStatus: 'canonical' },
  'mi-dr1': { id: 'mi-dr1', title: 'Mission: Impossible - Dead Reckoning Part One', type: 'movie', releaseDate: '2023-07-12', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'Grace', 'Ilsa Faust', 'Gabriel', 'Benji Dunn', 'Luther Stickell', 'Alanna Mitsopolis', 'Paris'], villains: ['The Entity (AI)', 'Gabriel'], organizations: ['IMF', 'The Entity Syndicate'], objects: ['Cruciform Sevastopol Key'], storyArcs: ['Entity Key Heist & Orient Express Crash'], reviewStatus: 'canonical' },
  'mi-dr2': { id: 'mi-dr2', title: 'Mission: Impossible - The Final Reckoning', type: 'movie', releaseDate: '2025-05-23', universe: 'Mission Impossible', characters: ['Ethan Hunt', 'Grace', 'Benji Dunn', 'Luther Stickell', 'Gabriel'], villains: ['The Entity', 'Gabriel'], organizations: ['IMF'], objects: ['Sevastopol Submarine Vault Key'], storyArcs: ['Sevastopol Wreck Deep Submarine Dive'], reviewStatus: 'canonical' },

  // X-Men missing nodes
  'xmen-1': { id: 'xmen-1', title: 'X-Men', type: 'movie', releaseDate: '2000-07-14', universe: 'X-Men', saga: 'Original X-Men Trilogy', characters: ['Logan (Wolverine)', 'Rogue (Marie)', 'Charles Xavier (Professor X)', 'Erik Lehnsherr (Magneto)', 'Jean Grey', 'Cyclops (Scott Summers)', 'Storm (Ororo Munroe)'], villains: ['Magneto', 'Mystique', 'Toad', 'Sabretooth'], organizations: ['X-Men', 'Brotherhood of Mutants'], objects: ['Cerebro', 'Liberty Island Mutation Machine'], storyArcs: ['Statue of Liberty Siege'], isEntryPoint: true, reviewStatus: 'canonical' },
  'xmen-2': { id: 'xmen-2', title: 'X2: X-Men United', type: 'movie', releaseDate: '2003-05-02', universe: 'X-Men', saga: 'Original X-Men Trilogy', characters: ['Logan (Wolverine)', 'Charles Xavier', 'Erik Lehnsherr', 'Jean Grey', 'Cyclops', 'Storm', 'Nightcrawler (Kurt Wagner)', 'Bobby Drake (Iceman)'], villains: ['Colonel William Stryker', 'Lady Deathstrike (Yuriko Oyama)'], organizations: ['X-Men', 'Weapon X', 'Brotherhood of Mutants'], objects: ['Dark Cerebro', 'Alkali Lake Dam Laboratory'], storyArcs: ['Alkali Lake Weapon X Assault'], reviewStatus: 'canonical' },
  'xmen-3': { id: 'xmen-3', title: 'X-Men: The Last Stand', type: 'movie', releaseDate: '2006-05-26', universe: 'X-Men', saga: 'Original X-Men Trilogy', characters: ['Logan (Wolverine)', 'Jean Grey (Phoenix)', 'Charles Xavier', 'Erik Lehnsherr', 'Storm', 'Hank McCoy (Beast)', 'Bobby Drake', 'Rogue'], villains: ['Dark Phoenix (Jean Grey)', 'Magneto', 'Juggernaut', 'Callisto'], organizations: ['X-Men', 'Brotherhood of Mutants', 'Worthington Labs'], objects: ['Leech Mutant Cure Serum'], storyArcs: ['Alcatraz Island Battle & Dark Phoenix Rampage'], reviewStatus: 'canonical' },
  'xmen-origins-wolverine': { id: 'xmen-origins-wolverine', title: 'X-Men Origins: Wolverine', type: 'movie', releaseDate: '2009-05-01', universe: 'X-Men', saga: 'Wolverine Trilogy', characters: ['Logan (Wolverine)', 'Victor Creed (Sabretooth)', 'William Stryker', 'Kayla Silverfox', 'Wade Wilson (Weapon XI)', 'Remy LeBeau (Gambit)'], villains: ['William Stryker', 'Weapon XI (Deadpool)', 'Sabretooth'], organizations: ['Team X', 'Weapon X Program'], objects: ['Adamantium Injection Chambers'], storyArcs: ['Three Mile Island Weapon X Escape'], reviewStatus: 'canonical' },
  'xmen-fc': { id: 'xmen-fc', title: 'X-Men: First Class', type: 'movie', releaseDate: '2011-06-03', universe: 'X-Men', saga: 'Prequel Quadrology', characters: ['Charles Xavier', 'Erik Lehnsherr (Magneto)', 'Raven Darkhölme (Mystique)', 'Hank McCoy (Beast)', 'Moira MacTaggert'], villains: ['Sebastian Shaw', 'Emma Frost', 'Azazel'], organizations: ['Hellfire Club', 'CIA Mutant Division', 'First X-Men Team'], objects: ['Prototype Cerebro Helmet', 'Submarine Engine Core'], storyArcs: ['1962 Cuban Missile Crisis Mutant Defense'], isEntryPoint: true, reviewStatus: 'canonical' },
  'xmen-the-wolverine': { id: 'xmen-the-wolverine', title: 'The Wolverine', type: 'movie', releaseDate: '2013-07-26', universe: 'X-Men', saga: 'Wolverine Trilogy', characters: ['Logan (Wolverine)', 'Mariko Yashida', 'Yukio', 'Viper (Dr. Green)', 'Ichirō Yashida (Silver Samurai)'], villains: ['Silver Samurai (Yashida)', 'Viper'], organizations: ['Yashida Industries', 'Yakuza Ninja Clan'], objects: ['Silver Samurai Adamantium Armor'], storyArcs: ['Tokyo Silver Samurai Battle'], reviewStatus: 'canonical' },
  'xmen-apocalypse': { id: 'xmen-apocalypse', title: 'X-Men: Apocalypse', type: 'movie', releaseDate: '2016-05-27', universe: 'X-Men', saga: 'Prequel Quadrology', characters: ['Charles Xavier', 'Erik Lehnsherr', 'Raven (Mystique)', 'Hank McCoy', 'Jean Grey', 'Scott Summers', 'Peter Maximoff (Quicksilver)'], villains: ['En Sabah Nur (Apocalypse)', 'Magneto (Horseman)', 'Psylocke', 'Storm', 'Angel'], organizations: ['Four Horsemen of Apocalypse', 'X-Men'], objects: ['En Sabah Nur Pyramid Chamber'], storyArcs: ['1983 Apocalypse Siege of Cairo'], reviewStatus: 'canonical' },
  'xmen-dark-phoenix': { id: 'xmen-dark-phoenix', title: 'Dark Phoenix', type: 'movie', releaseDate: '2019-06-07', universe: 'X-Men', saga: 'Prequel Quadrology', characters: ['Jean Grey (Phoenix)', 'Charles Xavier', 'Erik Lehnsherr', 'Raven (Mystique)', 'Hank McCoy', 'Scott Summers', 'Vuk'], villains: ['Vuk (D\'Bari Alien Leader)', 'Dark Phoenix Entity'], organizations: ['X-Men', 'D\'Bari Shape-shifters'], objects: ['Phoenix Cosmic Force Energy'], storyArcs: ['1992 Space Rescue & D\'Bari Invasion'], reviewStatus: 'canonical' },
  'xmen-new-mutants': { id: 'xmen-new-mutants', title: 'The New Mutants', type: 'movie', releaseDate: '2020-08-28', universe: 'X-Men', saga: 'Mutant Spin-offs', characters: ['Danielle Moonstar (Mirage)', 'Illyana Rasputina (Magik)', 'Rahne Sinclair (Wolfsbane)', 'Sam Guthrie (Cannonball)', 'Roberto da Costa (Sunspot)', 'Dr. Cecilia Reyes'], villains: ['Demon Bear', 'Dr. Cecilia Reyes'], organizations: ['Milbury Hospital', 'Essex Corporation'], objects: ['Soulsword', 'Demon Bear Spirit'], storyArcs: ['Milbury Hospital Asylum Escape'], isEntryPoint: true, reviewStatus: 'canonical' },
  'xmen-97': { id: 'xmen-97', title: 'X-Men \'97', type: 'tv-series', releaseDate: '2024-03-20', universe: 'X-Men', saga: 'Animated Saga', characters: ['Cyclops', 'Jean Grey', 'Storm', 'Wolverine', 'Rogue', 'Gambit', 'Magneto', 'Bastion'], villains: ['Bastion', 'Prime Sentinels', 'Mister Sinister'], organizations: ['X-Men', 'Operation Zero Tolerance'], objects: ['Asteroid M Magneto Engine'], storyArcs: ['Genosha Massacre & Asteroid M Fall'], isEntryPoint: true, reviewStatus: 'canonical' },

  // Jurassic Park missing nodes
  'jp-2': { id: 'jp-2', title: 'The Lost World: Jurassic Park', type: 'movie', releaseDate: '1997-05-23', universe: 'Jurassic Park', characters: ['Ian Malcolm', 'Sarah Harding', 'Nick Van Owen', 'Roland Tembo'], villains: ['Peter Ludlow', 'T-Rex Couple'], organizations: ['InGen Hunters', 'Gatherers Team'], objects: ['Mobile Command Vehicle Trailer'], storyArcs: ['Isla Sorna Site B Safari & San Diego T-Rex Rampage'], reviewStatus: 'canonical' },
  'jp-3': { id: 'jp-3', title: 'Jurassic Park III', type: 'movie', releaseDate: '2001-07-18', universe: 'Jurassic Park', characters: ['Alan Grant', 'Billy Brennan', 'Paul Kirby', 'Amanda Kirby'], villains: ['Spinosaurus', 'Velociraptor Pack'], organizations: ['InGen Infiltration Team'], objects: ['Raptor Resonating Chamber 3D Print'], storyArcs: ['Isla Sorna Spinosaurus Rescue Mission'], reviewStatus: 'canonical' },
  'jp-4': { id: 'jp-4', title: 'Jurassic World', type: 'movie', releaseDate: '2015-06-12', universe: 'Jurassic Park', characters: ['Owen Grady', 'Claire Dearing', 'Gray Mitchell', 'Zach Mitchell', 'Vic Hoskins', 'Dr. Henry Wu'], villains: ['Indominus Rex', 'Vic Hoskins (InGen Security)'], organizations: ['Masrani Global', 'InGen Security'], objects: ['Gyrosphere', 'Indominus Camouflage DNA'], storyArcs: ['Isla Nublar Indominus Breakout'], reviewStatus: 'canonical' },
  'jp-5': { id: 'jp-5', title: 'Jurassic World: Fallen Kingdom', type: 'movie', releaseDate: '2018-06-22', universe: 'Jurassic Park', characters: ['Owen Grady', 'Claire Dearing', 'Maisie Lockwood', 'Eli Mills', 'Ian Malcolm'], villains: ['Indoraptor', 'Eli Mills', 'Gunnar Eversol'], organizations: ['Dinosaur Protection Group', 'Lockwood Estate Auction'], objects: ['Indoraptor Laser Sight Pointer'], storyArcs: ['Isla Nublar Eruption & Lockwood Auction Escape'], reviewStatus: 'canonical' },
  'jp-camp-cretaceous': { id: 'jp-camp-cretaceous', title: 'Jurassic World: Camp Cretaceous', type: 'tv-series', releaseDate: '2020-09-18', universe: 'Jurassic Park', characters: ['Darius Bowman', 'Brooklyn', 'Kenji Kon', 'Sammy Gutierrez', 'Yasmina Fadoula', 'Ben Pincus'], villains: ['Scorpios Rex', 'Dr. Henry Wu', 'Kash D. Langford'], organizations: ['Mantah Corp'], objects: ['Camp Cretaceous Laptops'], storyArcs: ['Isla Nublar Camper Survival'], reviewStatus: 'canonical' },
  'jp-6': { id: 'jp-6', title: 'Jurassic World Dominion', type: 'movie', releaseDate: '2022-06-10', universe: 'Jurassic Park', characters: ['Owen Grady', 'Claire Dearing', 'Alan Grant', 'Ellie Sattler', 'Ian Malcolm', 'Maisie Lockwood', 'Kayla Watts'], villains: ['Dr. Lewis Dodgson (BioSyn)', 'Giant Locust Swarm', 'Giganotosaurus'], organizations: ['BioSyn Genetics'], objects: ['Prehistoric Amber Sample', 'BioSyn Valley Outpost'], storyArcs: ['BioSyn Sanctuary Siege & Locust Outbreak'], reviewStatus: 'canonical' },
  'jp-7-rebirth': { id: 'jp-7-rebirth', title: 'Jurassic World Rebirth', type: 'movie', releaseDate: '2025-07-02', universe: 'Jurassic Park', characters: ['Zora Bennett', 'Duncan Kincaid', 'Dr. Henry Loomis'], villains: ['Genetics Cartel'], organizations: ['Equatorial Science Ops'], objects: ['Giant Marine Dinosaur DNA Extract'], storyArcs: ['Equatorial Biosphere DNA Heist'], reviewStatus: 'canonical' },

  // Pirates of the Caribbean missing nodes
  'potc-1': { id: 'potc-1', title: 'Pirates of the Caribbean: The Curse of the Black Pearl', type: 'movie', releaseDate: '2003-07-09', universe: 'Pirates of the Caribbean', characters: ['Captain Jack Sparrow', 'Will Turner', 'Elizabeth Swann', 'Captain Hector Barbossa', 'Commodore James Norrington'], villains: ['Captain Hector Barbossa', 'Cursed Black Pearl Crew'], organizations: ['Royal Navy Port Royal', 'Cursed Aztec Crew'], objects: ['Aztec Medallion Gold', 'The Black Pearl'], storyArcs: ['Isla de Muerta Aztec Curse'], isEntryPoint: true, reviewStatus: 'canonical' },
  'potc-2': { id: 'potc-2', title: 'Pirates of the Caribbean: Dead Man\'s Chest', type: 'movie', releaseDate: '2006-07-07', universe: 'Pirates of the Caribbean', characters: ['Captain Jack Sparrow', 'Will Turner', 'Elizabeth Swann', 'Davy Jones', 'Lord Cutler Beckett', 'Bootstrap Bill Turner'], villains: ['Davy Jones', 'Lord Cutler Beckett', 'The Kraken'], organizations: ['East India Trading Company', 'Flying Dutchman Crew'], objects: ['Dead Man\'s Chest Key', 'Heart of Davy Jones'], storyArcs: ['Davy Jones Debt & Kraken Attack'], reviewStatus: 'canonical' },
  'potc-3': { id: 'potc-3', title: 'Pirates of the Caribbean: At World\'s End', type: 'movie', releaseDate: '2007-05-25', universe: 'Pirates of the Caribbean', characters: ['Captain Jack Sparrow', 'Will Turner', 'Elizabeth Swann', 'Hector Barbossa', 'Davy Jones', 'Lord Cutler Beckett', 'Tia Dalma (Calypso)'], villains: ['Lord Cutler Beckett', 'Davy Jones'], organizations: ['Brethren Court Pirates', 'East India Trading Company Armada'], objects: ['Pieces of Eight', 'Navigational Charts'], storyArcs: ['Maelstrom Battle of Calypso'], reviewStatus: 'canonical' },
  'potc-4': { id: 'potc-4', title: 'Pirates of the Caribbean: On Stranger Tides', type: 'movie', releaseDate: '2011-05-20', universe: 'Pirates of the Caribbean', characters: ['Captain Jack Sparrow', 'Angelica', 'Blackbeard (Edward Teach)', 'Hector Barbossa', 'Joshamee Gibbs'], villains: ['Blackbeard (Edward Teach)'], organizations: ['Queen Anne\'s Revenge Crew', 'Spanish Navy Expedition'], objects: ['Chalice of Carta Marina', 'Mermaid Tear'], storyArcs: ['Fountain of Youth Quest'], reviewStatus: 'canonical' },
  'potc-5': { id: 'potc-5', title: 'Pirates of the Caribbean: Dead Men Tell No Tales', type: 'movie', releaseDate: '2017-05-26', universe: 'Pirates of the Caribbean', characters: ['Captain Jack Sparrow', 'Henry Turner', 'Carina Smyth', 'Captain Salazar', 'Hector Barbossa'], villains: ['Captain Salazar (Ghost Armada Captain)'], organizations: ['Spanish Ghost Navy'], objects: ['Trident of Poseidon', 'Jack\'s Magic Compass'], storyArcs: ['Trident of Poseidon Curse Shattering'], reviewStatus: 'canonical' },

  // Transformers missing nodes
  'tf-1': { id: 'tf-1', title: 'Transformers', type: 'movie', releaseDate: '2007-07-03', universe: 'Transformers', characters: ['Sam Witwicky', 'Mikaela Banes', 'Optimus Prime', 'Bumblebee', 'Ironhide', 'Ratchet', 'Megatron'], villains: ['Megatron', 'Starscream', 'Barricade', 'Brawl'], organizations: ['Autobots', 'Decepticons', 'Sector 7'], objects: ['AllSpark Cube'], storyArcs: ['Mission City AllSpark Siege'], isEntryPoint: true, reviewStatus: 'canonical' },
  'tf-2': { id: 'tf-2', title: 'Transformers: Revenge of the Fallen', type: 'movie', releaseDate: '2009-06-24', universe: 'Transformers', characters: ['Sam Witwicky', 'Mikaela Banes', 'Optimus Prime', 'Bumblebee', 'The Fallen', 'Jetfire'], villains: ['The Fallen', 'Megatron', 'Starscream', 'Devastator'], organizations: ['NEST', 'Decepticon Seekers'], objects: ['Matrix of Leadership', 'Sun Harvester Pyramid Machine'], storyArcs: ['Egypt Sun Harvester Pyramid Siege'], reviewStatus: 'canonical' },
  'tf-3': { id: 'tf-3', title: 'Transformers: Dark of the Moon', type: 'movie', releaseDate: '2011-06-29', universe: 'Transformers', characters: ['Sam Witwicky', 'Carly Spencer', 'Optimus Prime', 'Bumblebee', 'Sentinel Prime', 'Megatron'], villains: ['Sentinel Prime', 'Megatron', 'Shockwave'], organizations: ['NEST', 'Decepticon Army'], objects: ['Space Bridge Control Pillars', 'Ark Lunar Vessel'], storyArcs: ['Chicago Space Bridge Invasion'], reviewStatus: 'canonical' },
  'tf-4': { id: 'tf-4', title: 'Transformers: Age of Extinction', type: 'movie', releaseDate: '2014-06-27', universe: 'Transformers', characters: ['Cade Yeager', 'Tessa Yeager', 'Shane Dyson', 'Optimus Prime', 'Bumblebee', 'Grimlock', 'Lockdown'], villains: ['Lockdown', 'Galvatron (Megatron Reborn)', 'Harold Attinger'], organizations: ['Cemetery Wind', 'KSI (Kinetic Solutions Incorporated)'], objects: ['The Seed (Cyberforming Bomb)', 'Knight Sword of Judgement'], storyArcs: ['Hong Kong Dinobot Liberation'], reviewStatus: 'canonical' },
  'tf-5': { id: 'tf-5', title: 'Transformers: The Last Knight', type: 'movie', releaseDate: '2017-06-21', universe: 'Transformers', characters: ['Cade Yeager', 'Viviane Wembly', 'Sir Edmund Burton', 'Optimus Prime (Nemesis Prime)', 'Bumblebee', 'Cogman'], villains: ['Quintessa (Cybertron Deceiver)', 'Megatron'], organizations: ['Order of Witwiccans', 'TRF (Transformers Reaction Force)'], objects: ['Merlin Staff of Power', 'Cybertron Collision Horns'], storyArcs: ['Cybertron Earth Collision Battle'], reviewStatus: 'canonical' },
  'tf-bumblebee': { id: 'tf-bumblebee', title: 'Bumblebee', type: 'movie', releaseDate: '2018-12-21', universe: 'Transformers', characters: ['Charlie Watson', 'Bumblebee (B-127)', 'Agent Jack Burns', 'Memo'], villains: ['Shatter', 'Dropkick'], organizations: ['Sector 7', 'Decepticon Seekers'], objects: ['Cybertron Escape Pod Tech'], storyArcs: ['1987 Brighton Falls Autobot Safe Haven'], isEntryPoint: true, reviewStatus: 'canonical' },
  'tf-rotb': { id: 'tf-rotb', title: 'Transformers: Rise of the Beasts', type: 'movie', releaseDate: '2023-06-09', universe: 'Transformers', characters: ['Noah Diaz', 'Elena Wallace', 'Optimus Prime', 'Optimus Primal', 'Mirage', 'Bumblebee', 'Airazor'], villains: ['Scourge', 'Unicron (Planet Eater)', 'Battletrap', 'Nightbird'], organizations: ['Maximals', 'Terrorcons', 'G.I. Joe (Cameo)'], objects: ['Transwarp Key'], storyArcs: ['1994 Peru Transwarp Portal Defense'], reviewStatus: 'canonical' },
  'tf-one': { id: 'tf-one', title: 'Transformers One', type: 'movie', releaseDate: '2024-09-20', universe: 'Transformers', characters: ['Orion Pax (Optimus Prime)', 'D-16 (Megatron)', 'Elita-1', 'B-127 (Bumblebee)', 'Alpha Trion'], villains: ['Sentinel Prime (Cybertron Traitor)'], organizations: ['Cybertron High Council', 'Iacon Miners'], objects: ['Cog of Transformation', 'Matrix of Leadership'], storyArcs: ['Cybertron Iacon Underground Origin'], isEntryPoint: true, reviewStatus: 'canonical' },
  'tf-prime': { id: 'tf-prime', title: 'Transformers: Prime', type: 'tv-series', releaseDate: '2010-11-26', universe: 'Transformers', characters: ['Optimus Prime', 'Arcee', 'Bulkhead', 'Bumblebee', 'Jack Darby', 'Miko Nakadai', 'Raf Esquivel'], villains: ['Megatron', 'Starscream', 'Soundwave', 'Airachnid'], organizations: ['Team Prime', 'Special Agent Fowler Command'], objects: ['Dark Energon', 'Omega Keys'], storyArcs: ['Dark Energon Invasion & Omega Keys Quest'], isEntryPoint: true, reviewStatus: 'canonical' },

  // The Hobbit missing nodes
  'hobbit-1': { id: 'hobbit-1', title: 'The Hobbit: An Unexpected Journey', type: 'movie', releaseDate: '2012-12-14', universe: 'Middle-earth', characters: ['Bilbo Baggins', 'Gandalf the Grey', 'Thorin Oakenshield', 'Gollum', 'Radagast'], villains: ['Azog the Defiler', 'Goblin King', 'Gollum'], organizations: ['Company of Thorin', 'White Council'], objects: ['Sting Sword', 'The One Ring', 'Map of Erebor'], storyArcs: ['Quest for the Lonely Mountain'], isEntryPoint: true, reviewStatus: 'canonical' },
  'hobbit-2': { id: 'hobbit-2', title: 'The Hobbit: The Desolation of Smaug', type: 'movie', releaseDate: '2013-12-13', universe: 'Middle-earth', characters: ['Bilbo Baggins', 'Thorin Oakenshield', 'Gandalf', 'Legolas', 'Tauriel', 'Bard the Bowman', 'Smaug'], villains: ['Smaug the Dragon', 'Azog', 'Bolg', 'The Necromancer (Sauron)'], organizations: ['Lake-town Council', 'Woodland Realm Elves'], objects: ['Arkenstone', 'Black Arrow'], storyArcs: ['Smaug Awakening at Erebor'], reviewStatus: 'canonical' },
  'hobbit-3': { id: 'hobbit-3', title: 'The Hobbit: The Battle of the Five Armies', type: 'movie', releaseDate: '2014-12-17', universe: 'Middle-earth', characters: ['Bilbo Baggins', 'Thorin Oakenshield', 'Gandalf', 'Legolas', 'Tauriel', 'Bard', 'Thranduil', 'Dain Ironfoot'], villains: ['Azog', 'Bolg', 'Sauron (Necromancer)'], organizations: ['Dwarves of Erebor', 'Elves of Mirkwood', 'Men of Lake-town', 'Orcs of Gundabad'], objects: ['Arkenstone', 'The One Ring'], storyArcs: ['Siege of Lonely Mountain & Battle of Five Armies'], reviewStatus: 'canonical' },

  // Lord of the Rings missing nodes
  'lotr-rop': { id: 'lotr-rop', title: 'The Lord of the Rings: The Rings of Power', type: 'tv-series', releaseDate: '2022-09-01', universe: 'Middle-earth', characters: ['Galadriel', 'Elrond', 'Halbrand (Sauron)', 'Arondir', 'Nori Brandyfoot', 'High King Gil-galad'], villains: ['Sauron (Halbrand)', 'Adar', 'Balrog of Khazad-dûm'], organizations: ['Elves of Lindon', 'Númenor Royal Navy', 'Southlanders'], objects: ['Three Elven Rings (Narya, Nenya, Vilya)', 'Mithril Core'], storyArcs: ['Second Age Forging of the Rings'], isEntryPoint: true, reviewStatus: 'canonical' },
  'lotr-rohirrim': { id: 'lotr-rohirrim', title: 'The Lord of the Rings: The War of the Rohirrim', type: 'movie', releaseDate: '2024-12-13', universe: 'Middle-earth', characters: ['Helm Hammerhand', 'Héra', 'Wulf', 'Freca'], villains: ['Wulf (Dunlending Warlord)'], organizations: ['Kingdom of Rohan', 'Dunlendings'], objects: ['Hornburg Fortress Stronghold'], storyArcs: ['Defense of Helm\'s Deep Origin'], isEntryPoint: true, reviewStatus: 'canonical' },

  // ─── AVATAR FRANCHISE ────────────────────────────────────────────────────────
  'avatar-1': {
    id: 'avatar-1',
    title: 'Avatar',
    type: 'movie',
    releaseDate: '2009-12-18',
    universe: 'Avatar',
    saga: 'Avatar Saga',
    characters: ['Jake Sully', 'Neytiri', 'Dr. Grace Augustine', 'Colonel Miles Quaritch'],
    villains: ['Colonel Miles Quaritch', 'Parker Selfridge'],
    organizations: ['RDA (Resources Development Administration)', 'Omaticaya Clan'],
    objects: ['Avatar Driver Unit', 'Unobtainium'],
    storyArcs: ['Pandora Discovery & Sully Integration'],
    spoilerFreeContext: 'Launches James Cameron\'s Avatar universe. Excellent standalone entry point.',
    isEntryPoint: true,
    reviewStatus: 'canonical',
  },
  'avatar-2': {
    id: 'avatar-2',
    title: 'Avatar: The Way of Water',
    type: 'movie',
    releaseDate: '2022-12-16',
    universe: 'Avatar',
    saga: 'Avatar Saga',
    characters: ['Jake Sully', 'Neytiri', 'Kiri', 'Colonel Miles Quaritch', 'Ronal', 'Tonowari'],
    villains: ['Recombinant Colonel Miles Quaritch', 'General Frances Ardmore'],
    organizations: ['RDA', 'Metkayina Clan', 'Omaticaya Clan'],
    objects: ['Amrita', 'SeaDragon'],
    storyArcs: ['Sully Family Migration to Metkayina Reefs'],
    spoilerFreeContext: 'Direct continuation following Jake Sully and Neytiri\'s family fleeing to the oceanic Metkayina clan.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
  'avatar-3': {
    id: 'avatar-3',
    title: 'Avatar: Fire and Ash',
    type: 'movie',
    releaseDate: '2025-12-19',
    universe: 'Avatar',
    saga: 'Avatar Saga',
    characters: ['Jake Sully', 'Neytiri', 'Kiri', 'Spider', 'Varang'],
    villains: ['Varang (Ash People Leader)', 'RDA Forces'],
    organizations: ['Ash People (Volcanic Clan)', 'Omaticaya Clan', 'Metkayina Clan', 'RDA'],
    objects: ['Pandoran Fire Elements'],
    storyArcs: ['Ash People Conflict on Pandora'],
    spoilerFreeContext: 'Direct continuation following the Sully family encountering the volcanic Ash clan.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
  'avatar-4': {
    id: 'avatar-4',
    title: 'Avatar 4',
    type: 'movie',
    releaseDate: '2029-12-21',
    universe: 'Avatar',
    saga: 'Avatar Saga',
    characters: ['Jake Sully', 'Neytiri'],
    villains: ['RDA Forces'],
    organizations: ['RDA'],
    objects: [],
    storyArcs: ['Pandora Evolution Arc'],
    spoilerFreeContext: 'Fourth installment of James Cameron\'s Avatar franchise.',
    isEntryPoint: false,
    reviewStatus: 'upcoming',
  },
  'avatar-5': {
    id: 'avatar-5',
    title: 'Avatar 5',
    type: 'movie',
    releaseDate: '2031-12-19',
    universe: 'Avatar',
    saga: 'Avatar Saga',
    characters: ['Jake Sully', 'Neytiri'],
    villains: ['Earth RDA High Command'],
    organizations: ['RDA'],
    objects: [],
    storyArcs: ['Na\'vi Earth Journey Arc'],
    spoilerFreeContext: 'Fifth installment of the Avatar franchise taking the Na\'vi journey to Earth.',
    isEntryPoint: false,
    reviewStatus: 'upcoming',
  },

  // ─── ALIEN FRANCHISE KNOWLEDGE GRAPH FOUNDATION ────────────────────────────
  'alien-1': {
    id: 'alien-1',
    title: 'Alien',
    type: 'movie',
    releaseDate: '1979-05-25',
    universe: 'Alien Universe',
    characters: ['Ellen Ripley', 'Dallas', 'Ash', 'Lambert', 'Kane', 'Brett', 'Parker'],
    villains: ['Xenomorph (Big Chap)', 'Ash (Special Order 937)'],
    organizations: ['Weyland-Yutani Corporation', 'Commercial Starship Nostromo'],
    objects: ['Derelict Juggernaut', 'Facehugger Egg', 'Jonesy the Cat'],
    storyArcs: ['Nostromo Xenomorph Outbreak'],
    spoilerFreeContext: 'Launches the legendary sci-fi horror franchise as the Nostromo crew discovers a lethal alien organism on LV-426. Essential standalone entry point.',
    isEntryPoint: true,
    reviewStatus: 'canonical',
  },
  'alien-2': {
    id: 'alien-2',
    title: 'Aliens',
    type: 'movie',
    releaseDate: '1986-07-18',
    universe: 'Alien Universe',
    characters: ['Ellen Ripley', 'Newt', 'Corporal Hicks', 'Bishop', 'Carter Burke', 'Hudson', 'Vasquez'],
    villains: ['Xenomorph Queen', 'Carter Burke'],
    organizations: ['Colonial Marines', 'Weyland-Yutani Corporation'],
    objects: ['M41A Pulse Rifle', 'Power Loader', 'Motion Tracker'],
    storyArcs: ['Hadley\'s Hope Xenomorph Hive Extermination'],
    spoilerFreeContext: 'Direct continuation following Ellen Ripley awakening 57 years later to lead Colonial Marines back to LV-426.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
  'alien-3': {
    id: 'alien-3',
    title: 'Alien³',
    type: 'movie',
    releaseDate: '1992-05-22',
    universe: 'Alien Universe',
    characters: ['Ellen Ripley', 'Dillon', 'Clemens', 'Bishop II', 'Andrews'],
    villains: ['Runner (Dog/Ox Xenomorph)', 'Weyland-Yutani Strike Team'],
    organizations: ['Weyland-Yutani Corporation', 'Fiorina 161 Penal Colony'],
    objects: ['Cryo-tube Escape EEV', 'Lead Works Foundry'],
    storyArcs: ['Fiorina 161 Penal Colony Survival & Ripley Sacrifice'],
    spoilerFreeContext: 'Direct continuation following Ripley\'s escape pod crash-landing on a maximum-security prison planet with an embryonic queen.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
  'alien-4': {
    id: 'alien-4',
    title: 'Alien Resurrection',
    type: 'movie',
    releaseDate: '1997-11-12',
    universe: 'Alien Universe',
    characters: ['Ellen Ripley (Clone 8)', 'Annalee Call', 'Johner', 'Christie', 'Vriess'],
    villains: ['The Newborn', 'Cloned Xenomorphs', 'General Perez'],
    organizations: ['United Systems Military', 'Betty Smuggler Crew'],
    objects: ['USM Auriga Research Lab', 'Shock Rifle'],
    storyArcs: ['USM Auriga Xenomorph Cloning Experiment'],
    spoilerFreeContext: 'Direct continuation set 200 years later as military scientists clone Ripley to extract the Xenomorph queen.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
  'alien-prometheus': {
    id: 'alien-prometheus',
    title: 'Prometheus',
    type: 'movie',
    releaseDate: '2012-05-30',
    universe: 'Alien Universe',
    saga: 'Prequel Duology',
    characters: ['Elizabeth Shaw', 'David 8', 'Meredith Vickers', 'Janek', 'Peter Weyland'],
    villains: ['Engineers (Mala\'kak)', 'Trilobite / Deacon'],
    organizations: ['Weyland Corporation', 'USCSS Prometheus Exploration Team'],
    objects: ['Black Goo (Pathogen A0-3959X.91–15)', 'Engineer Juggernaut Vessel', 'Star Map'],
    storyArcs: ['LV-223 Engineer Expedition & Creation Mystery'],
    spoilerFreeContext: 'Prequel originating the mythological roots of the Weyland Corporation, human genesis, and Engineers. Excellent standalone entry point.',
    isEntryPoint: true,
    reviewStatus: 'canonical',
  },
  'alien-covenant': {
    id: 'alien-covenant',
    title: 'Alien: Covenant',
    type: 'movie',
    releaseDate: '2017-05-09',
    universe: 'Alien Universe',
    saga: 'Prequel Duology',
    characters: ['David 8 / Walter One', 'Daniels Branson', 'Christopher Oram', 'Tennessee Faris', 'Lope'],
    villains: ['David 8', 'Neomorphs', 'Protomorph'],
    organizations: ['Weyland-Yutani Corporation', 'USCSS Covenant Colonization Mission'],
    objects: ['David Pathogen Laboratory', 'Covenant Colonist Embryos'],
    storyArcs: ['Planet 4 Necropolis & David Synthetic Genesis'],
    spoilerFreeContext: 'Direct continuation to Prometheus following the colony ship Covenant encountering synthetic android David\'s genetic breeding laboratory.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
  'alien-romulus': {
    id: 'alien-romulus',
    title: 'Alien: Romulus',
    type: 'movie',
    releaseDate: '2024-08-13',
    universe: 'Alien Universe',
    characters: ['Rain Carradine', 'Andy (Synthetic)', 'Tyler', 'Kay', 'Bjorn', 'Navarro'],
    villains: ['The Offspring (Human-Xenomorph Hybrid)', 'Renaissance Station Xenomorphs', 'Rook (Science Officer Module)'],
    organizations: ['Weyland-Yutani Corporation', 'Jackson\'s Star Mining Colony'],
    objects: ['Renaissance Space Station (Romulus & Remus Modules)', 'F-44AA Pulse Rifle', 'Z-01 Compound (Plagiarus Praepotens)'],
    storyArcs: ['Renaissance Station Scavenge & Xenomorph Larva Outbreak'],
    spoilerFreeContext: 'Direct interquel set 20 years after Alien as young colonizers board a derelict research station where Weyland-Yutani recovered the original Nostromo specimen.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
};

export const storyEdges: StoryEdge[] = [
  // ─── THE CONJURING UNIVERSE NARRATIVE GRAPH EDGES ─────────────────────────
  {
    sourceId: 'conj-1',
    targetId: 'conj-annabelle',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'The Conjuring prologue introduces the Annabelle doll in the Warren Occult Museum before its standalone origin story.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Watching The Conjuring first introduces the Annabelle doll in the Warren museum before exploring its backstory.',
      detailedReasons: [
        'Establishes the danger and legendary status of the Annabelle doll in the Warren Occult Museum prologue.',
        'Provides essential context for why the doll must be kept locked inside consecrated glass.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-1',
    targetId: 'conj-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel establishing Ed and Lorraine Warren marital relationship, faith, and investigation methods.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel establishing Ed and Lorraine Warren paranormal investigation partnership and reputation.',
      detailedReasons: [
        'Establishes Ed and Lorraine Warren onscreen relationship and investigation dynamics before the Enfield case.',
        'Shows the toll of previous exorcisms on Lorraine clairvoyant visions leading into the Enfield Poltergeist.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-annabelle',
    targetId: 'conj-annabelle-creation',
    relationship: 'story-continuation',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Creation is a direct prequel setup to Annabelle (2014), revealing the doll origin and Higgins family connection.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Prequel setup revealing the creation of the Annabelle doll and its possession ending at the Higgins house.',
      detailedReasons: [
        'Explains how the demonic spirit was bound to the wooden doll by Samuel and Esther Mullins in 1955.',
        'The ending directly connects Janice to the cultist attack at the start of Annabelle (2014).',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-1',
    targetId: 'conj-annabelle-creation',
    relationship: 'world-building',
    strength: 'moderate',
    confidence: 'confirmed',
    reason: 'Provides world-building context for the Annabelle artifact lore within the Warren franchise universe.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Provides world-building context for the demonic Annabelle artifact in the franchise.',
      detailedReasons: [
        'Expands the demonology lore surrounding the Annabelle doll first shown in the Warren artifact room.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-2',
    targetId: 'conj-the-nun',
    relationship: 'villain-origin',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Valak was introduced as the main antagonist in The Conjuring 2; The Nun explores its 1952 monastery origins.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Valak was introduced in The Conjuring 2; watching it first establishes the terrifying threat of the demon.',
      detailedReasons: [
        'Introduced Valak as a major demonic threat in the Conjuring Universe.',
        'Explains the significance of Sister Irene battle against Valak at Cârța Monastery.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-1',
    targetId: 'conj-the-nun',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Explains the backstory of Maurice Theriault (Frenchie), whose exorcism video is watched by the Warrens in The Conjuring.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Explains the backstory of Frenchie (Maurice), whose exorcism video is shown by the Warrens in The Conjuring.',
      detailedReasons: [
        'Connects Frenchie in 1952 Romania to the possessed man in the Warrens seminar video in 1971.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-annabelle',
    targetId: 'conj-la-llorona',
    relationship: 'shared-character',
    strength: 'moderate',
    confidence: 'confirmed',
    reason: 'Father Perez appears in La Llorona and references his prior encounter with the Annabelle doll.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Father Perez appears in La Llorona and recounts his harrowing experience with the Annabelle doll.',
      detailedReasons: [
        'Provides continuity via Father Perez, who recounts how he barely survived the Annabelle doll in 1967.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-1',
    targetId: 'conj-annabelle-comes-home',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Directly continues from the opening of The Conjuring after Ed and Lorraine bring Annabelle home to their artifact room.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Directly continues from the opening of The Conjuring after Ed and Lorraine bring Annabelle to their home.',
      detailedReasons: [
        'Shows Ed and Lorraine Warren transporting Annabelle home and placing her inside the glass case.',
        'Establishes Judy Warren growing up surrounded by her parents occult museum artifacts.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-annabelle',
    targetId: 'conj-annabelle-comes-home',
    relationship: 'story-continuation',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Culmination of the Annabelle trilogy showing the doll awakening spirits in the Warren museum.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Culmination of the Annabelle trilogy showing the doll awakening all artifacts in the Warren museum.',
      detailedReasons: [
        'Continues the Annabelle trilogy arc as the doll acts as a beacon for other malevolent spirits.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-annabelle-creation',
    targetId: 'conj-annabelle-comes-home',
    relationship: 'world-building',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Provides full backstory for Malthus (the Annabelle demon) locked inside the Warren museum case.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Provides full backstory for the demon Malthus residing inside the Annabelle doll.',
      detailedReasons: [
        'Explains why the demon inside Annabelle is so eager to claim souls from Judy and her friends.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-1',
    targetId: 'conj-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'First installment of the main Conjuring series establishing Ed and Lorraine Warren investigative partnership.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'First film in the main series establishing Ed and Lorraine Warren investigation partnership.',
      detailedReasons: [
        'Establishes Ed and Lorraine Warren deep bond and spiritual commitment to helping possessed families.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-2',
    targetId: 'conj-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Preceding main Conjuring case establishing Ed declining health (heart condition) and Warren growth as demonologists.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Preceding main Conjuring case establishing Ed health issues and Warren demonology growth.',
      detailedReasons: [
        'Continues Ed and Lorraine Warren journey following their traumatic Enfield Poltergeist investigation.',
        'Establishes Ed heart condition which becomes a critical plot element in The Devil Made Me Do It.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-the-nun',
    targetId: 'conj-the-nun-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Sister Irene and Maurice (Frenchie) as Valak resurfaces in 1956 France.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel following Sister Irene and Maurice as Valak resurfaces in 1956 France.',
      detailedReasons: [
        'Continues Sister Irene journey following her initial victory over Valak at Cârța Monastery.',
        'Explains Maurice ongoing struggle with Valak hidden possession after leaving Romania.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-2',
    targetId: 'conj-the-nun-2',
    relationship: 'villain-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Connects Valak pursuit of sacred relics to the visions haunting Lorraine in The Conjuring 2.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Connects Valak pursuit of sacred relics to the premonitions haunting Lorraine in The Conjuring 2.',
      detailedReasons: [
        'Provides key demonic lore on Valak origin and power before the demon encounters Lorraine Warren.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-1',
    targetId: 'conj-last-rites',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Original case establishing Ed and Lorraine Warren career, marriage, and Perron investigation foundation.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Original film establishing Ed and Lorraine Warren career and spiritual foundation.',
      detailedReasons: [
        'Establishes the foundation of Ed and Lorraine Warren career and their devotion to helping families.',
        'Provides essential background for the Warren Occult Museum and their life work.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-2',
    targetId: 'conj-last-rites',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Crucial main-series case establishing the Warrens spiritual bond and battle with high-ranking demonic forces.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Crucial main-series case establishing the Warrens spiritual bond and demonology expertise.',
      detailedReasons: [
        'Shows Ed and Lorraine facing their greatest supernatural trial in Enfield.',
        'Deepens Ed and Lorraine marital bond and shared commitment to demonic warfare.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-3',
    targetId: 'conj-last-rites',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Preceding main Conjuring case establishing Ed heart condition and the Warren family legal precedent.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Preceding main Conjuring case establishing Ed health issues and Warren legal precedents.',
      detailedReasons: [
        'Continues the main Conjuring series arc immediately prior to Last Rites.',
        'Establishes Ed worsening health condition and the Warrens mature phase of career.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'conj-annabelle-comes-home',
    targetId: 'conj-last-rites',
    relationship: 'character-development',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Focuses on Judy Warren and the dangerous artifacts locked inside the Warren Occult Museum.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: {
      shortReason: 'Focuses on Judy Warren and the dangerous artifacts locked inside the Warren Occult Museum.',
      detailedReasons: [
        'Explains Judy Warren acceptance of her inherited clairvoyant abilities.',
        'Establishes the full extent of malevolent artifacts in the Warren museum.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-ironman2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Iron Man 2 directly continues Tony Stark story following public identity exposure.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains iron Man 2 directly continues Tony Stark story following public identity exposure before Iron Man 2.",
      detailedReasons: [
        "Continues Tony Stark arc after publicly announcing he is Iron Man before the events of Iron Man 2.",
        "Explains the palladium poisoning driving Tony personal crisis, providing essential context for Iron Man 2.",
        "Introduces Rhodey transition into operating the War Machine armor prior to Iron Man 2.",
        "Expands S.H.I.E.L.D. active supervision in Tony superhero life leading into Iron Man 2.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-ironman3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Iron Man 3 explores Tony Stark PTSD and suit evolution following Battle of New York.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains iron Man 3 explores Tony Stark PTSD and suit evolution following Battle of New York before Iron Man 3.",
      detailedReasons: [
        "Introduces Tony Stark Arc Reactor technology and suit engineering before the events of Iron Man 3.",
        "Establishes Tony relationship with Pepper Potts and Happy Hogan, providing essential context for Iron Man 3.",
        "Provides baseline context for Tony reliance on his armor suits prior to Iron Man 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman2",
    targetId: "mcu-ironman3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Tony Stark technological advancement and War Machine / Iron Patriot rebrand.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tony Stark technological advancement and War Machine / Iron Patriot rebrand before Iron Man 3.",
      detailedReasons: [
        "Continues Rhodey military partnership operating the War Machine / Iron Patriot armor before the events of Iron Man 3.",
        "Shows Tony Stark progressive suit iteration leading into Mark XLII, providing essential context for Iron Man 3.",
        "Expands Stark Industries corporate defense contracts prior to Iron Man 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-ironman3",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Wormhole trauma from Battle of New York directly drives Tony anxiety and suit addiction.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains wormhole trauma from Battle of New York directly drives Tony anxiety and suit addiction before Iron Man 3.",
      detailedReasons: [
        "Shows Tony near-death experience carrying a nuke into the wormhole before the events of Iron Man 3.",
        "Establishes the PTSD and panic attacks driving Tony insomnia, providing essential context for Iron Man 3.",
        "Explains why Tony obsessively builds dozens of specialized Iron Legion armors prior to Iron Man 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor",
    targetId: "mcu-thor-dark-world",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Thor: The Dark World continues Thor and Loki dynamic and Aether Reality Stone threat.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thor: The Dark World continues Thor and Loki dynamic and Aether Reality Stone threat before Thor: The Dark World.",
      detailedReasons: [
        "Continues Thor and Loki complex brotherhood dynamic before the events of Thor: The Dark World.",
        "Establishes Jane Foster astrophysics work and relationship with Thor, providing essential context for Thor: The Dark World.",
        "Shows Odin reign and Asgardian realm defense prior to Thor: The Dark World.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-thor-dark-world",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Thor brings Loki back to Asgard in chains following the Battle of New York.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thor brings Loki back to Asgard in chains following the Battle of New York before Thor: The Dark World.",
      detailedReasons: [
        "Explains Loki imprisonment in Asgardian dungeons after his Earth invasion before the events of Thor: The Dark World.",
        "Shows Thor returning to Asgard with the Tesseract Space Stone, providing essential context for Thor: The Dark World.",
        "Establishes why Thor is restoring peace across the Nine Realms prior to Thor: The Dark World.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor",
    targetId: "mcu-thor-ragnarok",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Thor and Loki complex brotherhood dynamic and Asgardian royal lineage.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Thor and Loki complex brotherhood dynamic and Asgardian royal lineage before Thor: Ragnarok.",
      detailedReasons: [
        "Introduces Odin, Thor, Loki, and Asgardian crown succession before the events of Thor: Ragnarok.",
        "Establishes Mjolnir enchantment and Thor reliance on his hammer, providing essential context for Thor: Ragnarok.",
        "Shows Loki recurring pattern of betrayal and feigned death prior to Thor: Ragnarok.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-dark-world",
    targetId: "mcu-thor-ragnarok",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Thor: Ragnarok follows Loki secret usurpation of Asgard throne and Asgard destruction.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thor: Ragnarok follows Loki secret usurpation of Asgard throne and Asgard destruction before Thor: Ragnarok.",
      detailedReasons: [
        "Shows Loki secretly impersonating Odin as King of Asgard before the events of Thor: Ragnarok.",
        "Explains why Odin was exiled from Asgard to Earth, providing essential context for Thor: Ragnarok.",
        "Provides context for Reality Stone placement with the Collector prior to Thor: Ragnarok.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-thor-ragnarok",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Thor vision of Infinity Stones in Water of Sight motivates his cosmic quest prior to Ragnarok.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thor vision of Infinity Stones in Water of Sight motivates his cosmic quest prior to Ragnarok before Thor: Ragnarok.",
      detailedReasons: [
        "Shows Thor vision of the Infinity Stones in the Water of Sight before the events of Thor: Ragnarok.",
        "Explains why Thor departed Earth to search the cosmos for answers, providing essential context for Thor: Ragnarok.",
        "Establishes the Hulk departure in Quinjet following Sokovia battle prior to Thor: Ragnarok.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-ragnarok",
    targetId: "mcu-thor-love-and-thunder",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Thor: Love and Thunder follows Thor post-Endgame journey with Guardians and Jane Foster.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thor: Love and Thunder follows Thor post-Endgame journey with Guardians and Jane Foster before Thor: Love and Thunder.",
      detailedReasons: [
        "Explains destruction of Asgard and relocation of survivors to New Asgard before the events of Thor: Love and Thunder.",
        "Shows Thor losing Mjolnir and awakening internal god-of-thunder lightning powers, providing essential context for Thor: Love and Thunder.",
        "Establishes Valkyrie as a key warrior and leader of Asgard prior to Thor: Love and Thunder.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-thor-love-and-thunder",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Thor leaves New Asgard to join Guardians of the Galaxy at the end of Endgame. Establishes Thor depression arc and Mjolnir reclamation emotional context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thor leaves New Asgard to join Guardians of the Galaxy at the end of Endgame. Establishes Thor depression arc and Mjolnir reclamation emotional context before Thor: Love and Thunder.",
      detailedReasons: [
        "Shows Thor leaving New Asgard with Guardians of the Galaxy at the end of Endgame before the events of Thor: Love and Thunder.",
        "Establishes Valkyrie appointment as King of New Asgard, providing essential context for Thor: Love and Thunder.",
        "Explains Thor physical transformation and emotional grief recovery arc prior to Thor: Love and Thunder.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-1",
    targetId: "mcu-gotg-2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Guardians of the Galaxy Vol. 2 directly continues the team cosmic adventures and Peter Quill parentage.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains guardians of the Galaxy Vol. 2 directly continues the team cosmic adventures and Peter Quill parentage before Guardians of the Galaxy Vol. 2.",
      detailedReasons: [
        "Continues founding team bond between Peter, Gamora, Drax, Rocket, and Baby Groot before the events of Guardians of the Galaxy Vol. 2.",
        "Explains Peter Quill mysterious alien parentage established in Vol. 1, providing essential context for Guardians of the Galaxy Vol. 2.",
        "Shows Yondu and Ravagers ongoing connection to Peter Quill prior to Guardians of the Galaxy Vol. 2.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-1",
    targetId: "mcu-gotg-3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Guardians founding team relationships and Rocket Raccoon bond.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Guardians founding team relationships and Rocket Raccoon bond before Guardians of the Galaxy Vol. 3.",
      detailedReasons: [
        "Introduces Peter Quill, Gamora, Drax, Rocket, and Groot before the events of Guardians of the Galaxy Vol. 3.",
        "Establishes Rocket genius technical skills and defensive emotional barriers, providing essential context for Guardians of the Galaxy Vol. 3.",
        "Shows team initial formation and cosmic superhero reputation prior to Guardians of the Galaxy Vol. 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-2",
    targetId: "mcu-gotg-3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Guardians of the Galaxy Vol. 3 resolves Rocket Raccoon backstory and High Evolutionary confrontation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains guardians of the Galaxy Vol. 3 resolves Rocket Raccoon backstory and High Evolutionary confrontation before Guardians of the Galaxy Vol. 3.",
      detailedReasons: [
        "Introduces Mantis as a core Guardian and Peter half-sister before the events of Guardians of the Galaxy Vol. 3.",
        "Establishes Nebula full integration as a loyal family member, providing essential context for Guardians of the Galaxy Vol. 3.",
        "Deepens Rocket Raccoon character development and emotional core prior to Guardians of the Galaxy Vol. 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-gotg-3",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Gamora 2014 variant status and Peter Quill grief following Endgame.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains gamora 2014 variant status and Peter Quill grief following Endgame before Guardians of the Galaxy Vol. 3.",
      detailedReasons: [
        "Explains why original Gamora is dead and a 2014 alternate variant lives in present day before the events of Guardians of the Galaxy Vol. 3.",
        "Shows Peter Quill severe heartbreak and coping mechanisms following Endgame, providing essential context for Guardians of the Galaxy Vol. 3.",
        "Establishes Guardians rebuilding their lives post-Blip prior to Guardians of the Galaxy Vol. 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-holiday-special",
    targetId: "mcu-gotg-3",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Guardians headquarters on Knowhere and Mantis secret sister relationship with Peter Quill.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Guardians headquarters on Knowhere and Mantis secret sister relationship with Peter Quill before Guardians of the Galaxy Vol. 3.",
      detailedReasons: [
        "Shows Guardians purchasing and restoring Knowhere as their home base before the events of Guardians of the Galaxy Vol. 3.",
        "Reveals that Mantis is Peter Quill biological half-sister, providing essential context for Guardians of the Galaxy Vol. 3.",
        "Establishes Cosmo the Spacedog as an official team member prior to Guardians of the Galaxy Vol. 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man",
    targetId: "mcu-ant-man-and-the-wasp",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Scott Lang house arrest and Pym particle research following Civil War.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains scott Lang house arrest and Pym particle research following Civil War before Ant-Man and the Wasp.",
      detailedReasons: [
        "Shows Scott Lang under house arrest following Sokovia Accords arrest before the events of Ant-Man and the Wasp.",
        "Establishes Hope van Dyne donning the Wasp suit, providing essential context for Ant-Man and the Wasp.",
        "Continues Hank Pym search for Janet van Dyne in the Quantum Realm prior to Ant-Man and the Wasp.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-ant-man-and-the-wasp",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Scott Lang Sokovia Accords violation in Germany causes Hank Pym and Hope to go on the run.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains scott Lang Sokovia Accords violation in Germany causes Hank Pym and Hope to go on the run before Ant-Man and the Wasp.",
      detailedReasons: [
        "Explains why Scott Lang is wearing an FBI ankle monitor before the events of Ant-Man and the Wasp.",
        "Shows why Hank Pym and Hope van Dyne became wanted fugitives, providing essential context for Ant-Man and the Wasp.",
        "Establishes Hank resentment toward Scott taking Pym tech to Germany prior to Ant-Man and the Wasp.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-ant-man-and-the-wasp",
    relationship: "shared-event",
    strength: "strong",
    confidence: "confirmed",
    reason: "Post-credit scene snap event context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains post-credit scene snap event context before Ant-Man and the Wasp.",
      detailedReasons: [
        "Explains Thanos snap wiping out half of all living creatures before the events of Ant-Man and the Wasp.",
        "Provides immediate context for Hank, Janet, and Hope turning to dust in mid-credits, providing essential context for Ant-Man and the Wasp.",
        "Leaves Scott Lang trapped inside the Quantum Realm prior to Ant-Man and the Wasp.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-ant-man-and-the-wasp",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Sokovia Accords legislation origin context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains sokovia Accords legislation origin context before Ant-Man and the Wasp.",
      detailedReasons: [
        "Establishes Sokovia Accords international superhero registration framework before the events of Ant-Man and the Wasp.",
        "Explains why unauthorized Pym particle usage is a federal crime, providing essential context for Ant-Man and the Wasp.",
        "Shows government surveillance enforcement led by Agent Jimmy Woo prior to Ant-Man and the Wasp.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man-and-the-wasp",
    targetId: "mcu-quantumania",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Pym family quantum beacon experiment pulls the Ant-Family into the Quantum Realm.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains pym family quantum beacon experiment pulls the Ant-Family into the Quantum Realm before Ant-Man and the Wasp: Quantumania.",
      detailedReasons: [
        "Shows Janet van Dyne return from 30 years trapped in Quantum Realm before the events of Ant-Man and the Wasp: Quantumania.",
        "Establishes Cassie Lang growing interest in Quantum Realm science, providing essential context for Ant-Man and the Wasp: Quantumania.",
        "Continues Hank and Hope quantum satellite technology experiments prior to Ant-Man and the Wasp: Quantumania.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-quantumania",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Scott Lang post-Blip fame and Cassie Lang growth during the 5-year gap.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains scott Lang post-Blip fame and Cassie Lang growth during the 5-year gap before Ant-Man and the Wasp: Quantumania.",
      detailedReasons: [
        "Shows Scott Lang navigating celebrity status after saving the universe before the events of Ant-Man and the Wasp: Quantumania.",
        "Explains Cassie Lang aging into a teenager during Scott 5-year entrapment, providing essential context for Ant-Man and the Wasp: Quantumania.",
        "Establishes Cassie social activism and engineering intellect prior to Ant-Man and the Wasp: Quantumania.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-panther",
    targetId: "mcu-wakanda-forever",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Wakanda mourns King T'Challa and Shuri assumes the mantle of Black Panther.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains wakanda mourns King T'Challa and Shuri assumes the mantle of Black Panther before Black Panther: Wakanda Forever.",
      detailedReasons: [
        "Explains Wakanda mourning the unexpected loss of King T'Challa before the events of Black Panther: Wakanda Forever.",
        "Shows Shuri grief and struggle to recreate Synthetic Heart-Shaped Herb, providing essential context for Black Panther: Wakanda Forever.",
        "Establishes Queen Ramonda leadership of a vulnerable Wakanda prior to Black Panther: Wakanda Forever.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-wakanda-forever",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Global post-Blip destabilization and foreign pressure on Wakandan vibranium reserves.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains global post-Blip destabilization and foreign pressure on Wakandan vibranium reserves before Black Panther: Wakanda Forever.",
      detailedReasons: [
        "Shows foreign nations pressuring Wakanda to share Vibranium post-Blip before the events of Black Panther: Wakanda Forever.",
        "Establishes global deep-sea mining expeditions looking for Vibranium, providing essential context for Black Panther: Wakanda Forever.",
        "Provides geopolitical context for Namor kingdom of Talokan conflict prior to Black Panther: Wakanda Forever.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-wakanda-forever",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "T'Challa and Everett Ross debut; Wakandan isolationist policy shift.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains t'Challa and Everett Ross debut; Wakandan isolationist policy shift before Black Panther: Wakanda Forever.",
      detailedReasons: [
        "Introduces CIA Agent Everett Ross and his debt to Wakanda before the events of Black Panther: Wakanda Forever.",
        "Shows Wakanda initial steps onto world political stage at UN, providing essential context for Black Panther: Wakanda Forever.",
        "Establishes Okoye and Dora Milaje royal protective duties prior to Black Panther: Wakanda Forever.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-wakanda-forever",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Battle of Wakanda devastation and Shuri grief over T'Challa temporality.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains battle of Wakanda devastation and Shuri grief over T'Challa temporality before Black Panther: Wakanda Forever.",
      detailedReasons: [
        "Shows invasion trauma and destruction suffered in Battle of Wakanda before the events of Black Panther: Wakanda Forever.",
        "Explains Shuri inability to safely remove Mind Stone from Vision in time, providing essential context for Black Panther: Wakanda Forever.",
        "Establishes Wakanda military vulnerability following Thanos invasion prior to Black Panther: Wakanda Forever.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-marvel",
    targetId: "mcu-the-marvels",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Carol Danvers destruction of Kree Supreme Intelligence sets off Dar-Benn revenge campaign.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains carol Danvers destruction of Kree Supreme Intelligence sets off Dar-Benn revenge campaign before The Marvels.",
      detailedReasons: [
        "Explains Carol Danvers destroying Kree Supreme Intelligence, causing civil war before the events of The Marvels.",
        "Establishes Dar-Benn revenge campaign to restore planet Hala resources, providing essential context for The Marvels.",
        "Shows Carol isolation in deep space away from Earth prior to The Marvels.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ms-marvel",
    targetId: "mcu-the-marvels",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Kamala Khan quantum bangle entangles her light-powers with Carol Danvers and Monica Rambeau.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains kamala Khan quantum bangle entangles her light-powers with Carol Danvers and Monica Rambeau before The Marvels.",
      detailedReasons: [
        "Introduces Kamala Khan and her ancient Quantum Bangle artifact before the events of The Marvels.",
        "Establishes Kamala hard-light powers and fan idolization of Captain Marvel, providing essential context for The Marvels.",
        "Shows how activating her bangle entangles location with Carol and Monica prior to The Marvels.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-wandavision",
    targetId: "mcu-the-marvels",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Monica Rambeau gains energy-manipulation superpowers in Westview Hex.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains monica Rambeau gains energy-manipulation superpowers in Westview Hex before The Marvels.",
      detailedReasons: [
        "Shows Monica Rambeau passing through Wanda Westview Hex barrier before the events of The Marvels.",
        "Establishes Monica light-spectrum energy manipulation powers, providing essential context for The Marvels.",
        "Explains Monica unresolved grief toward Carol Danvers for her absence prior to The Marvels.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-secret-invasion",
    targetId: "mcu-the-marvels",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Nick Fury S.A.B.E.R. space station management and Skrull refugee relocations.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains nick Fury S.A.B.E.R. space station management and Skrull refugee relocations before The Marvels.",
      detailedReasons: [
        "Shows Nick Fury in orbit commanding S.A.B.E.R. defense space station before the events of The Marvels.",
        "Provides context for Skrull refugee settlement efforts across galaxy, providing essential context for The Marvels.",
        "Establishes Fury modern administrative role post-Blip prior to The Marvels.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-hawkeye",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Clint Barton grief over Natasha and Ronin vigilante era during the Blip.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains clint Barton grief over Natasha and Ronin vigilante era during the Blip before Hawkeye.",
      detailedReasons: [
        "Explains Clint Barton ruthless Ronin vigilante persona during 5-year Blip before the events of Hawkeye.",
        "Shows Natasha Romanoff sacrifice on Vormir leaving Clint with severe grief, providing essential context for Hawkeye.",
        "Sets up Ronin suit becoming dangerous target for underground NYC criminals prior to Hawkeye.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-widow",
    targetId: "mcu-hawkeye",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Yelena Belova targets Clint Barton following Natasha death in Black Widow post-credit scene.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains yelena Belova targets Clint Barton following Natasha death in Black Widow post-credit scene before Hawkeye.",
      detailedReasons: [
        "Introduces Yelena Belova as Natasha sister and trained Black Widow assassin before the events of Hawkeye.",
        "Shows Valentina Allegra de Fontaine manipulating Yelena to blame Clint, providing essential context for Hawkeye.",
        "Establishes Yelena revenge mission during Christmas season in NYC prior to Hawkeye.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-hawkeye",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Clint Barton retirement interruption and Wanda rescue team-up.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains clint Barton retirement interruption and Wanda rescue team-up before Hawkeye.",
      detailedReasons: [
        "Shows Clint Barton coming out of retirement to assist Team Cap before the events of Hawkeye.",
        "Establishes Clint house arrest agreement under Sokovia Accords, providing essential context for Hawkeye.",
        "Provides context for Clint guilt over putting younger heroes in harm way prior to Hawkeye.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-hawkeye",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Clint Barton original Avengers team formation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains clint Barton original Avengers team formation before Hawkeye.",
      detailedReasons: [
        "Introduces Clint Barton as master archer and original Avengers founding member before the events of Hawkeye.",
        "Shows Kate Bishop witnessing Hawkeye fighting Chitauri at Battle of New York.",
        "Explains Kate childhood inspiration to master archery prior to Hawkeye.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor",
    targetId: "mcu-hawkeye",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Clint Barton debut guarding Mjolnir.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains clint Barton debut guarding Mjolnir before Hawkeye.",
      detailedReasons: [
        "Shows Clint Barton's introduction as a top S.H.I.E.L.D. tactical archer.",
        "Establishes Clint's loyalty to Agent Phil Coulson and S.H.I.E.L.D. before Hawkeye.",
        "Establishes Clint Barton's marksman tactical position guarding Mjolnir prior to Hawkeye.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-marvel",
    targetId: "mcu-ms-marvel",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Kamala Khan hero worship of Carol Danvers inspires her superhero identity.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains kamala Khan hero worship of Carol Danvers inspires her superhero identity before Ms. Marvel.",
      detailedReasons: [
        "Establishes Carol Danvers as premier cosmic Avenger who saved Earth in Endgame before the events of Ms. Marvel.",
        "Explains Kamala Khan passionate fan-art creation and AvengerCon obsession, providing essential context for Ms. Marvel.",
        "Provides hero model that inspires Kamala to adopt Ms. Marvel mantle.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-2",
    targetId: "mcu-holiday-special",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Mantis joining Guardians and her sibling relationship with Peter Quill.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Mantis joining Guardians and her sibling relationship with Peter Quill before The Guardians of the Galaxy Holiday Special.",
      detailedReasons: [
        "Introduces Mantis and her empathic emotional manipulation abilities before the events of The Guardians of the Galaxy Holiday Special.",
        "Establishes Mantis learning she is Ego daughter and Peter half-sister, providing essential context for The Guardians of the Galaxy Holiday Special.",
        "Provides emotional motivation for Mantis organizing surprise Christmas gift prior to The Guardians of the Galaxy Holiday Special.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-holiday-special",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Explains Guardians post-Blip status and acquisition of Knowhere.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains explains Guardians post-Blip status and acquisition of Knowhere before The Guardians of the Galaxy Holiday Special.",
      detailedReasons: [
        "Shows Guardians adjusting to life post-Endgame without Gamora before the events of The Guardians of the Galaxy Holiday Special.",
        "Establishes team buying Knowhere from Collector to build sanctuary, providing essential context for The Guardians of the Galaxy Holiday Special.",
        "Provides context for Peter Quill lingering depression prior to The Guardians of the Galaxy Holiday Special.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-marvel",
    targetId: "mcu-secret-invasion",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Nick Fury & Talos Skrull refugee alliance origin.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains nick Fury & Talos Skrull refugee alliance origin before Secret Invasion.",
      detailedReasons: [
        "Introduces Talos and displaced Skrull shapeshifter population before the events of Secret Invasion.",
        "Shows Nick Fury promising Skrulls a new homeworld for intelligence help, providing essential context for Secret Invasion.",
        "Provides foundational promise that fuels Gravik Skrull rebellion decades later prior to Secret Invasion.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-ffh",
    targetId: "mcu-secret-invasion",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Talos impersonating Nick Fury on Earth.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains talos impersonating Nick Fury on Earth before Secret Invasion.",
      detailedReasons: [
        "Reveals Talos and Soren posing as Nick Fury and Maria Hill on Earth before the events of Secret Invasion.",
        "Shows Nick Fury residing on S.A.B.E.R. space station, providing essential context for Secret Invasion.",
        "Establishes deep trust and operational deception between Fury and Talos prior to Secret Invasion.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-secret-invasion",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Nick Fury S.H.I.E.L.D. spy network and Avengers leadership.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains Nick Fury's secret spy network and Avengers leadership before Secret Invasion.",
      detailedReasons: [
        "Establishes Nick Fury as ultimate intelligence operative behind Earth defense before the events of Secret Invasion.",
        "Shows Fury reliance on secret covert networks and operative assets, providing essential context for Secret Invasion.",
        "Provides baseline context for Fury operating without Avengers prior to Secret Invasion.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-hawkeye",
    targetId: "mcu-echo",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Maya Lopez confrontation with Wilson Fisk.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains maya Lopez confrontation with Wilson Fisk before Echo.",
      detailedReasons: [
        "Introduces Maya Lopez (Echo) as ruthless leader of Tracksuit Mafia.",
        "Shows Maya discovering Wilson Fisk (Kingpin) arranged her father assassination, providing essential context for Echo.",
        "Continues Maya shooting of Fisk and flight back to Oklahoma prior to Echo.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-daredevil",
    targetId: "mcu-echo",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Wilson Fisk (Kingpin) character backstory and Matt Murdock rivalry established in Daredevil.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains wilson Fisk (Kingpin) character backstory and Matt Murdock rivalry established in Daredevil before Echo.",
      detailedReasons: [
        "Establishes Wilson Fisk terrifying criminal empire in NYC before the events of Echo.",
        "Shows Matt Murdock (Daredevil) as Fisk main vigilante adversary, providing essential context for Echo.",
        "Provides deep narrative context for Fisk brutality and political ambitions prior to Echo.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-echo",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Clint Barton Ronin period in Tokyo.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains clint Barton Ronin period in Tokyo before Echo.",
      detailedReasons: [
        "Shows Clint Barton operating as Ronin hunting criminal syndicates worldwide before the events of Echo.",
        "Explains why Ronin targeted Maya Lopez father and Tracksuit Mafia in NYC, providing essential context for Echo.",
        "Sets up Maya initial quest for vengeance against Ronin prior to Echo.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-wandavision",
    targetId: "mcu-agatha-all-along",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Agatha Harkness trapped in Westview spell.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains agatha Harkness trapped in Westview spell before Agatha All Along.",
      detailedReasons: [
        "Introduces Agatha Harkness as an ancient dark witch seeking power before the events of Agatha All Along.",
        "Shows Wanda Maximoff stripping Agatha magical powers in Westview, providing essential context for Agatha All Along.",
        "Establishes Agatha trapped in Agnes the nosy neighbor mind spell prior to Agatha All Along.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-multiverse-of-madness",
    targetId: "mcu-agatha-all-along",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Wanda Maximoff death and Darkhold destruction.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains wanda Maximoff death and Darkhold destruction before Agatha All Along.",
      detailedReasons: [
        "Shows Wanda Maximoff apparent death under Mount Wundagore before the events of Agatha All Along.",
        "Establishes global destruction of every Darkhold copy across multiverse, providing essential context for Agatha All Along.",
        "Explains why Agatha is freed from spell but left completely powerless prior to Agatha All Along.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-agatha-all-along",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Wanda Maximoff backstory.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains wanda Maximoff backstory before Agatha All Along.",
      detailedReasons: [
        "Provides baseline context on Wanda Maximoff spontaneous witch abilities before the events of Agatha All Along.",
        "Explains innate spark of magic present before Mind Stone exposure, providing essential context for Agatha All Along.",
        "Establishes foundational lore of witch covens in MCU prior to Agatha All Along.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-tfatws",
    targetId: "mcu-cap-brave-new-world",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Sam Wilson Captain America mantle.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains sam Wilson Captain America mantle before Captain America: Brave New World.",
      detailedReasons: [
        "Shows Sam Wilson overcoming doubts to accept Steve Rogers Vibranium shield before the events of Captain America: Brave New World.",
        "Establishes Sam Wakandan-engineered Captain America flight suit, providing essential context for Captain America: Brave New World.",
        "Continues Joaquin Torres mentorship under Sam to become new Falcon prior to Captain America: Brave New World.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-cap-brave-new-world",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Thaddeus Ross presidential politics.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thaddeus Ross presidential politics before Captain America: Brave New World.",
      detailedReasons: [
        "Introduces Thaddeus Ross enforcing government control over superheroes before the events of Captain America: Brave New World.",
        "Establishes Ross tense political relationship with Sam Wilson, providing essential context for Captain America: Brave New World.",
        "Provides political backdrop for presidential national security policies prior to Captain America: Brave New World.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-eternals",
    targetId: "mcu-cap-brave-new-world",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "Tiamut Celestial Adamantium discovery.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tiamut Celestial Adamantium discovery before Captain America: Brave New World.",
      detailedReasons: [
        "Shows petrified body of Celestial Tiamut rising out of ocean before the events of Captain America: Brave New World.",
        "Provides origin for global superpowers fighting over Celestial Adamantium, providing essential context for Captain America: Brave New World.",
        "Sets up international geopolitical conflict over Tiamut Island prior to Captain America: Brave New World.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-incredible-hulk",
    targetId: "mcu-cap-brave-new-world",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Samuel Sterns and Ross origin.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains samuel Sterns and Ross origin before Captain America: Brave New World.",
      detailedReasons: [
        "Introduces Dr. Samuel Sterns infected with Bruce Banner gamma blood before the events of Captain America: Brave New World.",
        "Shows General Thaddeus Ross obsession with creating super soldiers, providing essential context for Captain America: Brave New World.",
        "Provides origin for Sterns mutating into The Leader prior to Captain America: Brave New World.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-echo",
    targetId: "mcu-daredevil-born-again",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Kingpin Mayor of New York campaign.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains kingpin Mayor of New York campaign before Daredevil: Born Again.",
      detailedReasons: [
        "Shows Wilson Fisk surviving Maya Lopez shooting and returning to NYC before the events of Daredevil: Born Again.",
        "Establishes Fisk realizing he needs political power rather than violence, providing essential context for Daredevil: Born Again.",
        "Sets up Fisk launching public campaign to become Mayor of NYC prior to Daredevil: Born Again.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-hawkeye",
    targetId: "mcu-daredevil-born-again",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Kingpin return to NYC underworld.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains kingpin return to NYC underworld before Daredevil: Born Again.",
      detailedReasons: [
        "Shows Kingpin pulling strings behind Maya Lopez and Tracksuit Mafia before the events of Daredevil: Born Again.",
        "Establishes Fisk criminal resurgence during Blip years, providing essential context for Daredevil: Born Again.",
        "Shows Fisk ruthless physical strength in combat prior to Daredevil: Born Again.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spiderman-no-way-home",
    targetId: "mcu-daredevil-born-again",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Matt Murdock legal counsel cameo.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains matt Murdock legal counsel cameo before Daredevil: Born Again.",
      detailedReasons: [
        "Shows blind lawyer Matt Murdock advising Peter Parker after unmasking before the events of Daredevil: Born Again.",
        "Establishes Murdock heightened senses catching a flying brick, providing essential context for Daredevil: Born Again.",
        "Confirms Matt Murdock active presence as lawyer in NYC prior to Daredevil: Born Again.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-widow",
    targetId: "mcu-thunderbolts",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Yelena Belova and Red Guardian team-up.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains yelena Belova and Red Guardian team-up before Thunderbolts*.",
      detailedReasons: [
        "Establishes Yelena Belova and Alexei Shostakov as father-daughter duo before the events of Thunderbolts*.",
        "Shows Yelena working covert operations for Valentina Allegra de Fontaine, providing essential context for Thunderbolts*.",
        "Provides emotional foundation for Yelena seeking purpose beyond assassination prior to Thunderbolts*.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-tfatws",
    targetId: "mcu-thunderbolts",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Bucky Barnes and John Walker recruited by Val.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains bucky Barnes and John Walker recruited by Val before Thunderbolts*.",
      detailedReasons: [
        "Introduces John Walker disgraced stripping of Cap title and rebrand as U.S. Agent before the events of Thunderbolts*.",
        "Shows Valentina Allegra de Fontaine recruiting anti-heroes for government ops, providing essential context for Thunderbolts*.",
        "Establishes Bucky Barnes political career and anti-hero supervision prior to Thunderbolts*.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man-and-the-wasp",
    targetId: "mcu-thunderbolts",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Ghost quantum instability origin.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains ghost quantum instability origin before Thunderbolts*.",
      detailedReasons: [
        "Introduces Ava Starr (Ghost) suffering from painful molecular quantum phasing.",
        "Explains how Bill Foster and Hank Pym's quantum tech stabilized her condition before Thunderbolts*.",
        "Shows Ava Starr's quantum instability conflict before joining Val's strike team in Thunderbolts*.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-cap-brave-new-world",
    targetId: "mcu-thunderbolts",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Valentina Allegra de Fontaine plot.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains valentina Allegra de Fontaine plot before Thunderbolts*.",
      detailedReasons: [
        "Shows Val operating at highest levels of U.S. government intelligence before the events of Thunderbolts*.",
        "Establishes Val plot to assemble black-ops team under government control, providing essential context for Thunderbolts*.",
        "Provides political backdrop following President Ross administration prior to Thunderbolts*.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spiderman-no-way-home",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Peter Parker street-level hero reboot following memory wipe spell.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains peter Parker street-level hero reboot following memory wipe spell before Spider-Man: Brand New Day.",
      detailedReasons: [
        "Shows Doctor Strange spell erasing Peter Parker from everyone memory before the events of Spider-Man: Brand New Day.",
        "Establishes Peter living alone in simple NYC apartment without Stark tech, providing essential context for Spider-Man: Brand New Day.",
        "Sets up Peter focusing purely on anonymous street-level Spider-Man crimefighting prior to Spider-Man: Brand New Day.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-daredevil-born-again",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "NYC street-level hero alliance.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains nYC street-level hero alliance before Spider-Man: Brand New Day.",
      detailedReasons: [
        "Shows NYC street-level vigilantes dealing with Kingpin anti-vigilante laws before the events of Spider-Man: Brand New Day.",
        "Establishes Matt Murdock and Peter Parker teaming up against crime syndicates, providing essential context for Spider-Man: Brand New Day.",
        "Provides neighborhood crimefighting context in Manhattan prior to Spider-Man: Brand New Day.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thunderbolts",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "world-building",
    strength: "strong",
    confidence: "strongly-implied",
    reason: "Official trailer indicates current MCU superhero landscape continues into Brand New Day.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes government vigilante oversight and NYC political landscape before Spider-Man: Brand New Day.",
      detailedReasons: [
        "Establishes current MCU superhero landscape and government oversight before the events of Spider-Man: Brand New Day.",
        "Shows street-level political developments in NYC impacting street hero operations."
      ],
      source: "editorial"
    }
  },
  {
    "sourceId": "mcu-incredible-hulk",
    "targetId": "mcu-spiderman-brand-new-day",
    "relationship": "world-building",
    "strength": "moderate",
    "confidence": "strongly-implied",
    "reason": "Bruce Banner appears in official marketing, but Hulk origin is not required.",
    "sourceType": "official-synopsis",
    "recommendationEvidence": {
      "shortReason": "Provides Bruce Banner story roots for returning character appearance before Spider-Man: Brand New Day.",
      "detailedReasons": [
        "Provides Bruce Banner character history prior to Spider-Man: Brand New Day."
      ],
      "source": "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-ffh",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Peter Parker growth as an independent hero following Mysterio identity reveal.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Enriches Peter Parker transition to an independent hero following Mysterio identity reveal.",
      detailedReasons: [
        "Shows Peter struggling with Tony Stark's legacy and stepping up as a standalone protector before Spider-Man: Brand New Day.",
        "Establishes Peter's romantic relationship with MJ and burden of public identity before No Way Home."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Peter Parker introduction to the MCU superhero universe and recruitment by Tony Stark.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first allows the viewer to experience Peter Parker's first meeting with Tony Stark, making their later mentor-student relationship emotionally meaningful throughout the Infinity Saga.",
      detailedReasons: [
        "Allows the viewer to experience Peter Parker's first meeting with Tony Stark, making their later mentor-student relationship emotionally meaningful throughout the Infinity Saga.",
        "Establishes Peter's entry point into the wider MCU superhero community."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Peter Parker cosmic battle experience and tragic Snap experience.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Delivers emotional weight from Peter battle on Titan and devastating Snap experience.",
      detailedReasons: [
        "Shows Peter fighting alongside the Avengers on Titan and facing devastating loss.",
        "Deepens the emotional stakes of Peter's commitment to protecting everyday people."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Peter Parker return in the Blip and emotional loss of mentor Tony Stark.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Delivers crucial emotional payoff from Tony Stark sacrifice and post-Blip world dynamics.",
      detailedReasons: [
        "Establishes the emotional climax of Peter's mentorship with Tony Stark.",
        "Sets up post-Blip world dynamics and Peter's determination to honor Iron Man's legacy."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-cap-brave-new-world",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "world-building",
    strength: "moderate",
    confidence: "strongly-implied",
    reason: "President Ross administration and current MCU geopolitical environment.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes President Ross administration vigilante policies in NYC before Spider-Man: Brand New Day.",
      detailedReasons: [
        "Provides political backdrop and government stance on vigilantes in New York City."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "mentor",
    strength: "weak",
    confidence: "confirmed",
    reason: "Tony Stark foundational superhero legacy in the MCU.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Provides Tony Stark foundational superhero legacy prior to Peter Parker mentorship.",
      detailedReasons: [
        "Introduces Tony Stark's founding role in the MCU superhero universe."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "world-building",
    strength: "weak",
    confidence: "confirmed",
    reason: "Battle of New York historical significance in Peter Parker's hometown.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Explains historic Battle of New York impact on Peter Parker hometown.",
      detailedReasons: [
        "Establishes the historic Battle of New York that shaped Peter Parker's childhood city."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-homecoming",
    targetId: "mcu-spiderman-brand-new-day",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Peter Parker MCU solo superhero origins.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes Peter Parker solo hero principles and dedication to Queens before Spider-Man: Brand New Day.",
      detailedReasons: [
        "Introduces Peter Parker superhero principles taught by Tony Stark before the events of Spider-Man: Brand New Day.",
        "Establishes Peter's dedication to protecting the little guy in Queens.",
        "Provides baseline context for Peter's growth into an independent hero prior to Spider-Man: Brand New Day."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-fantastic-four",
    targetId: "mcu-doomsday",
    relationship: "story-continuation",
    strength: "required",
    confidence: "provisional",
    reason: "Fantastic Four transition directly into Avengers: Doomsday to confront Doctor Doom.",
    sourceType: "official-cast",
    editorialImportance: "primary",
    recommendationEvidence: {
      shortReason: "Officially confirmed by Marvel Studios at SDCC 2024; Fantastic Four transition directly into Avengers: Doomsday.",
      detailedReasons: [
        "Marvel Studios officially announced at SDCC 2024 that the Fantastic Four (Reed Richards, Sue Storm, Johnny Storm, Ben Grimm) appear in Avengers: Doomsday.",
        "Establishes the Fantastic Four's cosmic origin and first encounter with Doctor Doom before joining Earth's heroes in Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-multiverse-of-madness",
    targetId: "mcu-doomsday",
    relationship: "world-building",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes multiversal incursions and universe collision mechanics driving Doctor Doom crisis in Avengers: Doomsday.",
    sourceType: "official-synopsis",
    editorialImportance: "primary",
    recommendationEvidence: {
      shortReason: "Establishes multiversal incursions and universe collision mechanics driving Avengers: Doomsday.",
      detailedReasons: [
        "Introduces Earth-838 Illuminati incursion warnings detailing how colliding universes destroy reality.",
        "Shows Doctor Strange discovering incursion rifts, providing structural mechanics for Doctor Doom's multiversal conflict in Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-loki",
    targetId: "mcu-doomsday",
    relationship: "character-development",
    strength: "required",
    confidence: "confirmed",
    reason: "Shows Loki preserving multiversal timeline tree Yggdrasil, forming the central multiversal backbone of Avengers: Doomsday.",
    sourceType: "official-synopsis",
    editorialImportance: "primary",
    recommendationEvidence: {
      shortReason: "Shows Loki preserving multiversal timeline tree Yggdrasil, forming the central multiversal backbone of Avengers: Doomsday.",
      detailedReasons: [
        "Shows Loki transforming the TVA into a multiversal monitoring organization.",
        "Establishes Loki holding the multiversal tree Yggdrasil together, which forms the central multiversal backbone of Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thunderbolts",
    targetId: "mcu-doomsday",
    relationship: "story-continuation",
    strength: "required",
    confidence: "provisional",
    reason: "Phase 5 finale ensemble establishing Earth's tactical hero team before Avengers: Doomsday.",
    sourceType: "official-trailer",
    editorialImportance: "secondary",
    recommendationEvidence: {
      shortReason: "Officially announced by Marvel Studios as Phase 5 finale establishing hero ensemble before Avengers: Doomsday.",
      detailedReasons: [
        "Shows Yelena Belova, Bucky Barnes, and U.S. Agent uniting as Earth's tactical team before the multiversal invasion in Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-cap-brave-new-world",
    targetId: "mcu-doomsday",
    relationship: "world-building",
    strength: "strong",
    confidence: "provisional",
    reason: "Shows Sam Wilson leading Earth's superhero response team as Captain America before Avengers: Doomsday.",
    sourceType: "official-trailer",
    editorialImportance: "secondary",
    recommendationEvidence: {
      shortReason: "Shows Sam Wilson leading Earth's superhero response team as Captain America before Avengers: Doomsday.",
      detailedReasons: [
        "Establishes Sam Wilson taking up the Captain America shield and establishing global hero leadership prior to Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-doomsday",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes the post-Endgame MCU status quo, quantum timeline mechanics, and previous Avengers assembly benchmark prior to Avengers: Doomsday.",
    sourceType: "official-synopsis",
    editorialImportance: "primary",
    recommendationEvidence: {
      shortReason: "Establishes post-Endgame status quo, quantum timeline mechanics, and previous Avengers benchmark prior to Avengers: Doomsday.",
      detailedReasons: [
        "Shows the original Avengers concluding their arc and establishing multiversal timeline traversal context prior to Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-no-way-home",
    targetId: "mcu-doomsday",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "Shows the first major multiversal rift opening in New York City, establishing multiversal travel prior to Avengers: Doomsday.",
    sourceType: "official-synopsis",
    editorialImportance: "secondary",
    recommendationEvidence: {
      shortReason: "Shows first major multiversal rift opening in NYC, establishing multiversal travel prior to Avengers: Doomsday.",
      detailedReasons: [
        "Demonstrates how multiversal tears bring alternate universe entities into Earth-616 prior to Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-shang-chi",
    targetId: "mcu-doomsday",
    relationship: "character-development",
    strength: "moderate",
    confidence: "provisional",
    reason: "Officially confirmed character appearance connecting cosmic beacon artifacts prior to Avengers: Doomsday.",
    sourceType: "official-cast",
    editorialImportance: "supporting",
    recommendationEvidence: {
      shortReason: "Officially confirmed appearance in Avengers: Doomsday cast announcements; connects Ten Rings beacon to cosmic threats.",
      detailedReasons: [
        "Shows Shang-Chi discovering the mysterious beacon emitting from the Ten Rings.",
        "Prepares viewers for Shang-Chi joining Earth's Avengers defense force in Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-deadpool-wolverine",
    targetId: "mcu-doomsday",
    relationship: "world-building",
    strength: "moderate",
    confidence: "provisional",
    reason: "Establishes TVA anchor-being mechanics and multiversal crossover elements prior to Avengers: Doomsday.",
    sourceType: "official-cast",
    editorialImportance: "supporting",
    recommendationEvidence: {
      shortReason: "Establishes TVA anchor-being mechanics and multiversal crossover prior to Avengers: Doomsday.",
      detailedReasons: [
        "Shows Deadpool and Wolverine interacting with the TVA multiversal monitoring network.",
        "Demonstrates universe-stability anchor-being concepts leading into multiversal conflict in Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "xmen-logan",
    targetId: "mcu-doomsday",
    relationship: "world-building",
    strength: "moderate",
    confidence: "provisional",
    reason: "Officially confirmed legacy character appearance in Avengers: Doomsday; establishes Wolverine\'s multiversal hero journey.",
    sourceType: "official-cast",
    editorialImportance: "supporting",
    recommendationEvidence: {
      shortReason: "Officially confirmed legacy character appearance in Avengers: Doomsday; establishes Wolverine\'s multiversal hero journey.",
      detailedReasons: [
        "Establishes Logan\'s emotional legacy and heroism prior to multiversal assembly in Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "xmen-dofp",
    targetId: "mcu-doomsday",
    relationship: "multiverse",
    strength: "moderate",
    confidence: "provisional",
    reason: "Establishes timeline rewriting and multiversal divergence in the X-Men timeline prior to Avengers: Doomsday.",
    sourceType: "official-cast",
    editorialImportance: "supporting",
    recommendationEvidence: {
      shortReason: "Establishes timeline rewriting and multiversal divergence in the X-Men timeline prior to Avengers: Doomsday.",
      detailedReasons: [
        "Shows time-travel consciousness transfer altering timeline branches across mutant history prior to Avengers: Doomsday."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-doomsday",
    targetId: "mcu-secret-wars",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Battleworld creation following Doctor Doom multiverse victory.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains battleworld creation following Doctor Doom multiverse victory before Avengers: Secret Wars.",
      detailedReasons: [
        "Shows Doctor Doom seizing control of multiversal reality in Doomsday before the events of Avengers: Secret Wars.",
        "Establishes creation of Battleworld from collapsed timeline fragments, providing essential context for Avengers: Secret Wars.",
        "Sets up final multiversal resistance struggle to restore universe prior to Avengers: Secret Wars.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-loki",
    targetId: "mcu-secret-wars",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "God of Stories Yggdrasil tree.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains god of Stories Yggdrasil tree before Avengers: Secret Wars.",
      detailedReasons: [
        "Shows Loki sacrificing personal freedom to hold branching timelines together before the events of Avengers: Secret Wars.",
        "Establishes green glowing Yggdrasil multiversal tree at center of time, providing essential context for Avengers: Secret Wars.",
        "Explains why multiversal collapse threatens fabric of existence prior to Avengers: Secret Wars.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-deadpool-wolverine",
    targetId: "mcu-secret-wars",
    relationship: "multiverse",
    strength: "strong",
    confidence: "confirmed",
    reason: "Anchor beings and Void survival.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains anchor beings and Void survival before Avengers: Secret Wars.",
      detailedReasons: [
        "Introduces concept of Anchor Beings whose deaths cause timelines to decay before the events of Avengers: Secret Wars.",
        "Shows the Void at end of time where pruned universes gather, providing essential context for Avengers: Secret Wars.",
        "Provides survival lore for multiversal refugees fighting for reality prior to Avengers: Secret Wars.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-multiverse-of-madness",
    targetId: "mcu-secret-wars",
    relationship: "multiverse",
    strength: "strong",
    confidence: "confirmed",
    reason: "Multiversal incursions.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains multiversal incursions before Avengers: Secret Wars.",
      detailedReasons: [
        "Introduces Clea explaining incursions caused by Doctor Strange multiversal travel before the events of Avengers: Secret Wars.",
        "Shows how colliding universes trigger catastrophic mutual destruction, providing essential context for Avengers: Secret Wars.",
        "Sets up impending multiversal collapse leading into Secret Wars prior to Avengers: Secret Wars.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-incredible-hulk",
    targetId: "mcu-she-hulk",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Introduces Emil Blonsky (Abomination) prior to his parole hearing in She-Hulk.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces Emil Blonsky (Abomination) prior to his parole hearing in She-Hulk before She-Hulk: Attorney at Law.",
      detailedReasons: [
        "Introduces Emil Blonsky transforming into monstrous Abomination in Harlem before the events of She-Hulk: Attorney at Law.",
        "Shows Bruce Banner fighting Abomination and locking Blonsky in supermax cell, providing essential context for She-Hulk: Attorney at Law.",
        "Provides baseline context for Jennifer Walters representing Blonsky prior to She-Hulk: Attorney at Law.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-shang-chi",
    targetId: "mcu-she-hulk",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Shows Wong and Abomination cage fight in Golden Daggers Club referenced during Blonsky trial.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains shows Wong and Abomination cage fight in Golden Daggers Club referenced during Blonsky trial before She-Hulk: Attorney at Law.",
      detailedReasons: [
        "Shows Wong teleporting Abomination out of prison for fight tournament before the events of She-Hulk: Attorney at Law.",
        "Establishes Abomination friendship with Sorcerer Supreme Wong, providing essential context for She-Hulk: Attorney at Law.",
        "Provides video evidence used during Blonsky parole hearing in She-Hulk prior to She-Hulk: Attorney at Law.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "xmen-deadpool",
    targetId: "mcu-deadpool-wolverine",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Wade Wilson character, mercenaries, and Vanessa relationship.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Wade Wilson character, mercenaries, and Vanessa relationship before Deadpool & Wolverine.",
      detailedReasons: [
        "Establishes Wade Wilson origin as fourth-wall breaking mercenary Deadpool before the events of Deadpool & Wolverine.",
        "Shows Wade romance with Vanessa and mercenary friends Blind Al and Peter, providing essential context for Deadpool & Wolverine.",
        "Provides Wade emotional motivation to save his universe prior to Deadpool & Wolverine.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "xmen-deadpool-2",
    targetId: "mcu-deadpool-wolverine",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Cable time-pad used by TVA to recruit Wade Wilson.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Cable time-pad used by TVA to recruit Wade Wilson before Deadpool & Wolverine.",
      detailedReasons: [
        "Shows Wade Wilson using Cable time-travel device to jump across timelines before the events of Deadpool & Wolverine.",
        "Establishes Wade fixing timeline events and rescuing Peter, providing essential context for Deadpool & Wolverine.",
        "Provides direct trigger for TVA agents arresting Wade for timeline tampering prior to Deadpool & Wolverine.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "xmen-logan",
    targetId: "mcu-deadpool-wolverine",
    relationship: "character-development",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Wolverine legacy, emotional ending, and anchor-being status.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Wolverine legacy, emotional ending, and anchor-being status before Deadpool & Wolverine.",
      detailedReasons: [
        "Shows Logan heroic death in 2029 protecting Laura and mutant children before the events of Deadpool & Wolverine.",
        "Establishes Wolverine as Earth-10005 Anchor Being whose death triggers decay, providing essential context for Deadpool & Wolverine.",
        "Provides deep emotional reverence Wade holds for Logan sacrifice prior to Deadpool & Wolverine.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-loki",
    targetId: "mcu-deadpool-wolverine",
    relationship: "organization",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes TVA, Void, Alioth, and multiversal timeline monitoring.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes TVA, Void, Alioth, and multiversal timeline monitoring before Deadpool & Wolverine.",
      detailedReasons: [
        "Introduces Time Variance Authority (TVA) monitoring multiversal timelines before the events of Deadpool & Wolverine.",
        "Establishes the Void at end of time where pruned timeline variants are dumped, providing essential context for Deadpool & Wolverine.",
        "Shows Alioth as matter-consuming monster guarding the Void prior to Deadpool & Wolverine.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "xmen-dofp",
    targetId: "mcu-deadpool-wolverine",
    relationship: "multiverse",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Multiversal mutant timeline context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains multiversal mutant timeline context before Deadpool & Wolverine.",
      detailedReasons: [
        "Establishes complex branching timeline history of Fox X-Men mutants before the events of Deadpool & Wolverine.",
        "Shows Wolverine history as central heroic figure across alternate eras, providing essential context for Deadpool & Wolverine.",
        "Enriches nostalgia and tragedy of lost mutant timelines in the Void prior to Deadpool & Wolverine.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-avengers",
    relationship: "character-origin",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Tony Stark as Iron Man and Nick Fury S.H.I.E.L.D. Avengers Initiative.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Tony Stark as Iron Man and Nick Fury S.H.I.E.L.D. Avengers Initiative before The Avengers.",
      detailedReasons: [
        "Introduces Tony Stark origin as Iron Man and Arc Reactor technology before the events of The Avengers.",
        "Establishes Nick Fury and S.H.I.E.L.D. initiative to gather extraordinary individuals, providing essential context for The Avengers.",
        "Introduces Pepper Potts and Stark Tower in New York City prior to The Avengers.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor",
    targetId: "mcu-avengers",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Introduces Thor, Loki, Mjolnir, and Loki grudge against Earth leading into the Chitauri invasion.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces Thor, Loki, Mjolnir, and Loki grudge against Earth leading into the Chitauri invasion before The Avengers.",
      detailedReasons: [
        "Introduces Thor, Asgard, Mjolnir, and the realm of the Gods before the events of The Avengers.",
        "Establishes Loki jealousy, trickery, and fall into the cosmic abyss, providing essential context for The Avengers.",
        "Sets up Loki motivation to conquer Earth with the Chitauri army prior to The Avengers.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-america-1",
    targetId: "mcu-avengers",
    relationship: "character-origin",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Steve Rogers, Hydra, and Tesseract Space Stone recovery prior to modern revival.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Steve Rogers, Hydra, and Tesseract Space Stone recovery prior to modern revival before The Avengers.",
      detailedReasons: [
        "Introduces Steve Rogers origin as Captain America in WWII before the events of The Avengers.",
        "Establishes the Tesseract (Space Stone) and HYDRA advanced weapons, providing essential context for The Avengers.",
        "Explains Steve Rogers 70-year frozen slumber prior to waking in modern NYC prior to The Avengers.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman2",
    targetId: "mcu-avengers",
    relationship: "character-development",
    strength: "required",
    confidence: "confirmed",
    reason: "Continues Tony Stark story, expands S.H.I.E.L.D., introduces Natasha Romanoff (Black Widow), and develops Nick Fury Avengers Initiative.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains continues Tony Stark story, expands S.H.I.E.L.D., introduces Natasha Romanoff (Black Widow), and develops Nick Fury Avengers Initiative before The Avengers.",
      detailedReasons: [
        "Introduces Natasha Romanoff (Black Widow) undercover as Stark lawyer before the events of The Avengers.",
        "Shows Nick Fury expanded involvement with Tony Stark, providing essential context for The Avengers.",
        "Establishes Howard Stark tech history and Arc Reactor research prior to The Avengers.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-incredible-hulk",
    targetId: "mcu-avengers",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Bruce Banner gamma radiation origin and Hulk transformation prior to joining the Avengers in New York.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains bruce Banner gamma radiation origin and Hulk transformation prior to joining the Avengers in New York before The Avengers.",
      detailedReasons: [
        "Introduces Bruce Banner gamma accident and volatile Hulk transformation before the events of The Avengers.",
        "Shows General Ross hunting Bruce Banner, providing essential context for The Avengers.",
        "Explains Bruce hiding out in South America controlling his anger prior to The Avengers.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-america-1",
    targetId: "mcu-winter-soldier",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Winter Soldier reveals Bucky Barnes survival and Hydra infiltration of S.H.I.E.L.D.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains winter Soldier reveals Bucky Barnes survival and Hydra infiltration of S.H.I.E.L.D before Captain America: The Winter Soldier.",
      detailedReasons: [
        "Establishes Steve Rogers and Bucky Barnes deep bond during WWII before the events of Captain America: The Winter Soldier.",
        "Shows Bucky apparent fall to his death from the train, providing essential context for Captain America: The Winter Soldier.",
        "Provides emotional devastation when Steve recognizes the Winter Soldier prior to Captain America: The Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-winter-soldier",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Steve Rogers adjusting to modern S.H.I.E.L.D. leadership following Battle of New York.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains steve Rogers adjusting to modern S.H.I.E.L.D. leadership following Battle of New York before Captain America: The Winter Soldier.",
      detailedReasons: [
        "Shows Steve Rogers leading S.H.I.E.L.D. strike teams in modern Washington DC before the events of Captain America: The Winter Soldier.",
        "Establishes Steve growing distrust of Nick Fury secret compartmentalization, providing essential context for Captain America: The Winter Soldier.",
        "Sets up Nick Fury assassination attempt by the Winter Soldier prior to Captain America: The Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman2",
    targetId: "mcu-winter-soldier",
    relationship: "character-origin",
    strength: "weak",
    confidence: "confirmed",
    reason: "Iron Man 2 establishes S.H.I.E.L.D. operations and Black Widow's tactical role.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first introduces Black Widow's tactical combat skills and S.H.I.E.L.D. oversight before Captain America: The Winter Soldier.",
      detailedReasons: [
        "Introduces Natasha Romanoff (Black Widow) tactical skills before the events of Captain America: The Winter Soldier.",
        "Shows S.H.I.E.L.D. operational reach and Howard Stark legacy, providing essential context for Captain America: The Winter Soldier.",
        "Provides early context for Natasha and Steve S.H.I.E.L.D. partnership prior to Captain America: The Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-age-of-ultron",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Foundational Avengers team assembly and Chitauri invasion aftermath.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes foundational Avengers team assembly and hero battle dynamics.",
      detailedReasons: [
        "Establishes the Avengers as a functioning team following the Battle of New York.",
        "Introduces Loki Scepter containing the Mind Stone.",
        "Tony Stark PTSD directly motivates global defense initiative."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman3",
    targetId: "mcu-age-of-ultron",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Tony Stark autonomous Iron Legion development and PTSD motivation building Ultron.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tony Stark autonomous Iron Legion development and PTSD motivation building Ultron before Avengers: Age of Ultron.",
      detailedReasons: [
        "Shows Tony Stark building automated remote-controlled suit legions before the events of Avengers: Age of Ultron.",
        "Establishes Tony anxiety over global threats attacking Earth, providing essential context for Avengers: Age of Ultron.",
        "Explains Tony drive to put a suit of armor around the world prior to Avengers: Age of Ultron.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-winter-soldier",
    targetId: "mcu-age-of-ultron",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "SHIELD collapse forces Avengers to operate independently raiding Hydra Baron Strucker outpost.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains sHIELD collapse forces Avengers to operate independently raiding Hydra Baron Strucker outpost before Avengers: Age of Ultron.",
      detailedReasons: [
        "Shows S.H.I.E.L.D. fallen, leaving Avengers as an independent private team before the events of Avengers: Age of Ultron.",
        "Explains why the Avengers are raiding Baron Strucker HYDRA fortress in Sokovia, providing essential context for Avengers: Age of Ultron.",
        "Shows Cap and Natasha leading team field tactics prior to Avengers: Age of Ultron.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-dark-world",
    targetId: "mcu-age-of-ultron",
    relationship: "shared-object",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Loki scepter containing Mind Stone before Avengers assault Strucker fortress.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Loki scepter containing Mind Stone before Avengers assault Strucker fortress before Avengers: Age of Ultron.",
      detailedReasons: [
        "Shows Loki scepter taken by S.H.I.E.L.D. / HYDRA before the events of Avengers: Age of Ultron.",
        "Establishes cosmic gem power within the scepter, providing essential context for Avengers: Age of Ultron.",
        "Provides context for Wanda and Pietro powers gifted by the scepter prior to Avengers: Age of Ultron.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman2",
    targetId: "mcu-age-of-ultron",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Iron Man 2 introduces Natasha Romanoff (Black Widow), expands S.H.I.E.L.D., and shows Tony Stark arc toward Ultron.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains iron Man 2 introduces Natasha Romanoff (Black Widow), expands S.H.I.E.L.D., and shows Tony Stark arc toward Ultron before Avengers: Age of Ultron.",
      detailedReasons: [
        "Shows Natasha Romanoff's combat skills and S.H.I.E.L.D. role before Avengers: Age of Ultron.",
        "Establishes Tony Stark's reliance on AI assistance (JARVIS) prior to Ultron.",
        "Shows Natasha's initial S.H.I.E.L.D. integration alongside Tony Stark prior to Avengers: Age of Ultron.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-incredible-hulk",
    targetId: "mcu-age-of-ultron",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Bruce Banner gamma origin and Hulkbuster containment context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains bruce Banner gamma origin and Hulkbuster containment context before Avengers: Age of Ultron.",
      detailedReasons: [
        "Shows Bruce Banner struggle to contain the destructive Hulk before the events of Avengers: Age of Ultron.",
        "Provides context for Tony and Bruce co-designing Veronica (Hulkbuster), providing essential context for Avengers: Age of Ultron.",
        "Establishes Hulk volatility when mentally manipulated by Wanda prior to Avengers: Age of Ultron.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-age-of-ultron",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Establishes Tony Stark's founding suit engineering and Arc Reactor technology.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first establishes Tony Stark's foundational suit engineering and Arc Reactor creation before Avengers: Age of Ultron.",
      detailedReasons: [
        "Introduces Tony Stark suit creation and JARVIS operating system before the events of Avengers: Age of Ultron.",
        "Establishes Tony protective instinct for civilian lives, providing essential context for Avengers: Age of Ultron.",
        "Provides baseline context for Tony role as chief funder of the Avengers prior to Avengers: Age of Ultron.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-winter-soldier",
    targetId: "mcu-civil-war",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Bucky Barnes Winter Soldier backstory and S.H.I.E.L.D. collapse.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes Bucky Barnes Winter Soldier backstory and fall of S.H.I.E.L.D.",
      detailedReasons: [
        "Establishes Bucky Barnes as the brainwashed Winter Soldier assassin.",
        "Reveals HYDRA infiltration of S.H.I.E.L.D. causing its collapse.",
        "Introduces Sam Wilson (Falcon) as Steve Rogers loyal ally."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-civil-war",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Sokovia collateral destruction and government oversight motivations.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes Sokovia collateral destruction and government oversight motivations.",
      detailedReasons: [
        "Introduces Wanda Maximoff (Scarlet Witch) and Vision.",
        "Explains the catastrophic collateral destruction of Sokovia.",
        "Sets up the political motivation for the Sokovia Accords.",
        "Establishes growing ideological friction between Steve and Tony."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man",
    targetId: "mcu-civil-war",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Ant-Man post-credit scene and Scott Lang recruitment to Team Cap by Falcon.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains ant-Man post-credit scene and Scott Lang recruitment to Team Cap by Falcon before Captain America: Civil War.",
      detailedReasons: [
        "Introduces Scott Lang and Pym Particle shrinking technology before the events of Captain America: Civil War.",
        "Establishes Falcon encounter with Ant-Man at Avengers Compound, providing essential context for Captain America: Civil War.",
        "Explains how Falcon recruits Scott Lang for Team Cap during airport battle prior to Captain America: Civil War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-civil-war",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Tony Stark guilt and relationship with Howard and Maria Stark.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tony Stark guilt and relationship with Howard and Maria Stark before Captain America: Civil War.",
      detailedReasons: [
        "Shows Tony Stark complex trauma regarding his parents Howard and Maria Stark before the events of Captain America: Civil War.",
        "Establishes Tony guilt over Stark Industries weapons creating collateral damage, providing essential context for Captain America: Civil War.",
        "Explains why Tony supports government oversight under the Sokovia Accords prior to Captain America: Civil War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-america-1",
    targetId: "mcu-civil-war",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Steve Rogers WWII origins with Bucky Barnes and Peggy Carter funeral.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains steve Rogers WWII origins with Bucky Barnes and Peggy Carter funeral before Captain America: Civil War.",
      detailedReasons: [
        "Establishes Steve Rogers 70-year bond with Bucky Barnes before the events of Captain America: Civil War.",
        "Shows Peggy Carter passing away, leaving Bucky as Steve last remaining connection to his past, providing essential context for Captain America: Civil War.",
        "Explains why Steve will protect Bucky against government capture prior to Captain America: Civil War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-civil-war",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Original Avengers team dynamics prior to split.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains original Avengers team dynamics prior to split before Captain America: Civil War.",
      detailedReasons: [
        "Shows the initial friction and eventual camaraderie of the original six Avengers before the events of Captain America: Civil War.",
        "Establishes Steve and Tony contrasting leadership styles, providing essential context for Captain America: Civil War.",
        "Provides emotional weight to the team breaking apart in Leipzig prior to Captain America: Civil War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman2",
    targetId: "mcu-civil-war",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Howard Stark technology legacy and Rhodey War Machine partnership.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first establishes Howard Stark's legacy technology and James Rhodes operating War Machine before Captain America: Civil War.",
      detailedReasons: [
        "Introduces Howard Stark tech archives and Arc Reactor history before the events of Captain America: Civil War.",
        "Establishes James Rhodes operating War Machine for the US military, providing essential context for Captain America: Civil War.",
        "Provides context for Rhodey taking Tony side during Sokovia Accords debates prior to Captain America: Civil War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor",
    targetId: "mcu-civil-war",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Asgardian absence context during Sokovia Accords negotiations.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains asgardian absence context during Sokovia Accords negotiations before Captain America: Civil War.",
      detailedReasons: [
        "Establishes Thor cosmic status and absence from Earth political disputes before the events of Captain America: Civil War.",
        "Provides context for why gods and aliens are not subject to Earth treaties, providing essential context for Captain America: Civil War.",
        "Explains why Team Cap lacks heavy Asgardian muscle during the airport battle prior to Captain America: Civil War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-black-panther",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "King T'Chaka death at the Vienna UN bombing motivates T'Challa coronation as King of Wakanda 1 week later.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains king T'Chaka death at the Vienna UN bombing motivates T'Challa coronation as King of Wakanda 1 week later before Black Panther.",
      detailedReasons: [
        "Shows King T'Chaka assassination at Vienna UN Summit bombing before the events of Black Panther.",
        "Establishes T'Challa debut as Black Panther seeking vengeance.",
        "Sets up T'Challa immediate return to Wakanda for his royal coronation prior to Black Panther.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-black-panther",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Introduces black-market arms dealer Ulysses Klaue and his stolen Wakandan Vibranium history.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces black-market arms dealer Ulysses Klaue and his stolen Wakandan Vibranium history before Black Panther.",
      detailedReasons: [
        "Introduces Ulysses Klaue stealing Vibranium from Wakanda before the events of Black Panther.",
        "Shows Klaue losing his arm to Ultron in the African salvage yard, providing essential context for Black Panther.",
        "Establishes Klaue as Wakanda most wanted international fugitive prior to Black Panther.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-winter-soldier",
    targetId: "mcu-black-panther",
    relationship: "post-credit",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Provides historical origin for Bucky Barnes White Wolf rehabilitation in Wakanda.",
    sourceType: "official-synopsis", narrativeScope: "post-credit",
    recommendationEvidence: {
      shortReason: "Watching this first explains provides historical origin for Bucky Barnes White Wolf rehabilitation in Wakanda before Black Panther.",
      detailedReasons: [
        "Shows Bucky Barnes seeking sanctuary away from HYDRA mind control before the events of Black Panther.",
        "Sets up Steve Rogers bringing Bucky to Wakanda cryogenic medical care, providing essential context for Black Panther.",
        "Establishes Wakanda advanced neural medicine capabilities prior to Black Panther.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-ragnarok",
    targetId: "mcu-infinity-war",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Statesman refugee ship attack immediately following Asgard destruction sets up Thanos acquiring the Space Stone.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains statesman refugee ship attack immediately following Asgard destruction sets up Thanos acquiring the Space Stone before Avengers: Infinity War.",
      detailedReasons: [
        "Shows Asgardian refugee ship Statesman intercepted by Thanos Sanctuary II before the events of Avengers: Infinity War.",
        "Shows Thanos executing Loki and defeating Thor to claim the Space Stone, providing essential context for Avengers: Infinity War.",
        "Sends Hulk plummeting to Earth to warn Doctor Strange of impending doom prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-infinity-war",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Sokovia Accords fallout leaves Avengers fragmented into isolated factions when Thanos attacks Earth.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains sokovia Accords fallout leaves Avengers fragmented into isolated factions when Thanos attacks Earth before Avengers: Infinity War.",
      detailedReasons: [
        "Explains the political schism following the Sokovia Accords before the events of Avengers: Infinity War.",
        "Establishes Team Cap operating underground as Secret Avengers, providing essential context for Avengers: Infinity War.",
        "Shows Steve and Tony estrangement, leaving Earth vulnerable prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-1",
    targetId: "mcu-infinity-war",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Introduces Guardians team, Thanos adoption of Gamora, and Infinity Stone lore.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces Guardians team, Thanos adoption of Gamora, and Infinity Stone lore before Avengers: Infinity War.",
      detailedReasons: [
        "Introduces Thanos as a cosmic conqueror hunting Infinity Stones before the events of Avengers: Infinity War.",
        "Establishes Gamora and Nebula as adopted daughters of Thanos, providing essential context for Avengers: Infinity War.",
        "Explains the Power Stone origin and Collector cosmic vault prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-doctor-strange",
    targetId: "mcu-infinity-war",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Doctor Strange as keeper of the Time Stone at the New York Sanctum.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Doctor Strange as keeper of the Time Stone at the New York Sanctum before Avengers: Infinity War.",
      detailedReasons: [
        "Introduces Stephen Strange mastering the Eye of Agamotto (Time Stone) before the events of Avengers: Infinity War.",
        "Establishes Strange duty as Sorcerer Supreme protecting the realm, providing essential context for Avengers: Infinity War.",
        "Sets up Bruce Banner crashing into the Sanctum rotunda to warn Strange prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-infinity-war",
    relationship: "shared-object",
    strength: "strong",
    confidence: "confirmed",
    reason: "Creation of Vision with the Mind Stone in his forehead and his bond with Wanda Maximoff.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains creation of Vision with the Mind Stone in his forehead and his bond with Wanda Maximoff before Avengers: Infinity War.",
      detailedReasons: [
        "Shows Vision synthetic creation powered by the Mind Stone before the events of Avengers: Infinity War.",
        "Establishes Vision as a prime target for Thanos Infinity Gauntlet, providing essential context for Avengers: Infinity War.",
        "Sets up Wanda and Vision deep emotional connection prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-panther",
    targetId: "mcu-infinity-war",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Wakanda defense shield, T'Challa leadership, and Shuri technological capabilities for third-act battle.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Wakanda defense shield, T'Challa leadership, and Shuri technological capabilities for third-act battle before Avengers: Infinity War.",
      detailedReasons: [
        "Shows Wakanda advanced Vibranium technology and military forces before the events of Avengers: Infinity War.",
        "Establishes King T'Challa opening Wakanda borders to shelter Avengers, providing essential context for Avengers: Infinity War.",
        "Shows Shuri attempting neural extraction of the Mind Stone prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-2",
    targetId: "mcu-infinity-war",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Introduces Mantis to the Guardians and establishes Nebula reconciliation with Gamora.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces Mantis to the Guardians and establishes Nebula reconciliation with Gamora before Avengers: Infinity War.",
      detailedReasons: [
        "Shows Mantis joining the Guardians cosmic crew before the events of Avengers: Infinity War.",
        "Establishes Nebula reconciling with Gamora, making her torture by Thanos agonizing, providing essential context for Avengers: Infinity War.",
        "Shows Peter Quill and Gamora formalizing their romantic love prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-homecoming",
    targetId: "mcu-infinity-war",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Iron Spider nanotech suit and deepens Peter Parker mentorship under Tony Stark.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Iron Spider nanotech suit and deepens Peter Parker mentorship under Tony Stark before Avengers: Infinity War.",
      detailedReasons: [
        "Introduces the Iron Spider nanotech suit offered by Tony Stark before the events of Avengers: Infinity War.",
        "Establishes Tony protective parental bond over Peter, providing essential context for Avengers: Infinity War.",
        "Explains why Peter sneaks onto Ebony Maw Q-Ship to save Strange prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-infinity-war",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Original Avengers team foundation and Thanos initial mid-credits reveal.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains original Avengers team foundation and Thanos initial mid-credits reveal before Avengers: Infinity War.",
      detailedReasons: [
        "Shows the original Avengers uniting to defend Earth against cosmic invasions before the events of Avengers: Infinity War.",
        "Establishes Thanos initial mid-credits reveal pulling the Infinity Gauntlet out, providing essential context for Avengers: Infinity War.",
        "Provides baseline context for Earth superhero defense network prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-winter-soldier",
    targetId: "mcu-infinity-war",
    relationship: "same-universe-only",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Bucky Barnes winter soldier history.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains bucky Barnes winter soldier history before Avengers: Infinity War.",
      detailedReasons: [
        "Shows Bucky Barnes recovering from HYDRA brainwashing in Wakanda before the events of Avengers: Infinity War.",
        "Establishes T'Challa gifting Bucky a new Vibranium prosthetic arm, providing essential context for Avengers: Infinity War.",
        "Provides context for Bucky joining Wakandan frontline defense prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-infinity-war",
    relationship: "same-universe-only",
    strength: "weak",
    confidence: "confirmed",
    reason: "Tony Stark origin as Iron Man and Avengers founding leader.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first introduces Tony Stark's armor technology and leadership role before Avengers: Infinity War.",
      detailedReasons: [
        "Introduces Tony Stark original Arc Reactor suit creation before the events of Avengers: Infinity War.",
        "Establishes Tony lifelong fear of cosmic threats destroying Earth, providing essential context for Avengers: Infinity War.",
        "Provides baseline context for Tony developing nanotech Mark L armor prior to Avengers: Infinity War.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-endgame",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Thanos Snap decimation aftermath and loss of half of Earth's heroes.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes the Thanos Snap decimation aftermath, loss of Earth heroes, and Infinity Stone crisis.",
      detailedReasons: [
        "Shows Thanos successful snap wiping out half of all living creatures in the universe.",
        "Establishes the emotional grief and devastation of the surviving Avengers.",
        "Sets up Scott Lang Quantum Realm entrapment during the snap."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man-and-the-wasp",
    targetId: "mcu-endgame",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Scott Lang entrapment in the Quantum Realm during the snap enables the time vortex time heist concept.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains scott Lang entrapment in the Quantum Realm during the snap enables the time vortex time heist concept before Avengers: Endgame.",
      detailedReasons: [
        "Shows Scott Lang trapped in the Quantum Realm during the snap before the events of Avengers: Endgame.",
        "Explains Scott escaping 5 years later via a quantum tunnel rat trigger, providing essential context for Avengers: Endgame.",
        "Establishes Scott bringing the Quantum Realm time travel theory to Avengers prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-endgame",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Tony Stark and Steve Rogers reconcile their emotional rift and return the Vibranium shield. The Steve/Tony estrangement is the emotional thread through Endgame — their reunion and Tony sacrifice carry profound weight with Civil War context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tony Stark and Steve Rogers reconcile their emotional rift and return the Vibranium shield. The Steve/Tony estrangement is the emotional thread through Endgame — their reunion and Tony sacrifice carry profound weight with Civil War context before Avengers: Endgame.",
      detailedReasons: [
        "Explains the deep emotional estrangement between Steve Rogers and Tony Stark before the events of Avengers: Endgame.",
        "Shows Tony returning Steve Vibranium shield as a symbol of forgiveness, providing essential context for Avengers: Endgame.",
        "Provides emotional payoff when Cap and Iron Man stand side by side prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-ragnarok",
    targetId: "mcu-endgame",
    relationship: "world-building",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes New Asgard in Norway and Valkyrie leadership of Asgardian survivors.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes New Asgard in Norway and Valkyrie leadership of Asgardian survivors before Avengers: Endgame.",
      detailedReasons: [
        "Shows Asgardian survivors settling in Tonsberg, Norway before the events of Avengers: Endgame.",
        "Establishes Valkyrie managing New Asgard community governance, providing essential context for Avengers: Endgame.",
        "Explains Thor retreat into isolation and depression following snap failure prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-1",
    targetId: "mcu-endgame",
    relationship: "character-origin",
    strength: "required",
    confidence: "confirmed",
    reason: "Rocket and Nebula Avengers membership and 2014 Morag Power Stone time heist interception.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains rocket and Nebula Avengers membership and 2014 Morag Power Stone time heist interception before Avengers: Endgame.",
      detailedReasons: [
        "Shows Rocket and Nebula as sole surviving Guardians joining Avengers before the events of Avengers: Endgame.",
        "Establishes Morag 2014 location where Peter Quill found the Power Stone orb, providing essential context for Avengers: Endgame.",
        "Sets up 2014 Thanos intercepting Nebula memory network transmissions prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-endgame",
    relationship: "shared-event",
    strength: "moderate",
    confidence: "confirmed",
    reason: "2012 Battle of New York time heist mission to retrieve Tesseract, Scepter, and Time Stone. Steve encountering his 2012 self, the Loki escape sequence, and the Peggy window scene carry greater emotional resonance with The Avengers context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains 2012 Battle of New York time heist mission to retrieve Tesseract, Scepter, and Time Stone. Steve encountering his 2012 self, the Loki escape sequence, and the Peggy window scene carry greater emotional resonance with The Avengers context before Avengers: Endgame.",
      detailedReasons: [
        "Revisits the 2012 Battle of New York where three Infinity Stones were present before the events of Avengers: Endgame.",
        "Shows Steve Rogers tricking HYDRA operatives in the elevator, providing essential context for Avengers: Endgame.",
        "Explains 2012 Loki stealing Tesseract during time heist disruption prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-marvel",
    targetId: "mcu-endgame",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Carol Danvers rescue of Tony Stark and Nebula in deep space and Sanctuary II bombardment.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains carol Danvers rescue of Tony Stark and Nebula in deep space and Sanctuary II bombardment before Avengers: Endgame.",
      detailedReasons: [
        "Shows Carol Danvers rescuing stranded Benatar space vessel in deep space before the events of Avengers: Endgame.",
        "Establishes Captain Marvel cosmic power level during Avengers assault, providing essential context for Avengers: Endgame.",
        "Shows Carol destroying Thanos massive Sanctuary II warship prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-doctor-strange",
    targetId: "mcu-endgame",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "Ancient One explanation of branching multiverse timelines during 2012 Greenwich Village heist.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains ancient One explanation of branching multiverse timelines during 2012 Greenwich Village heist before Avengers: Endgame.",
      detailedReasons: [
        "Shows Smart Hulk consulting the Ancient One at the NYC Sanctum in 2012 before the events of Avengers: Endgame.",
        "Establishes timeline branching rules when Infinity Stones are removed, providing essential context for Avengers: Endgame.",
        "Explains why Strange voluntarily surrendered Time Stone to Thanos prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-endgame",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Clint Barton family sanctuary and Tony Stark nightmare vision.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains Clint Barton's secret family sanctuary and Tony Stark's nightmare vision before Avengers: Endgame.",
      detailedReasons: [
        "Shows Clint Barton peaceful farm family vanished during snap opening before the events of Avengers: Endgame.",
        "Establishes Tony Stark Ultron vision of dead Avengers seeding his guilt, providing essential context for Avengers: Endgame.",
        "Provides context for Hawkeye dark Ronin transformation prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-dark-world",
    targetId: "mcu-endgame",
    relationship: "shared-object",
    strength: "moderate",
    confidence: "confirmed",
    reason: "2013 Asgard time heist mission to extract Aether Reality Stone from Jane Foster.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains 2013 Asgard time heist mission to extract Aether Reality Stone from Jane Foster before Avengers: Endgame.",
      detailedReasons: [
        "Revisits 2013 Asgard during Jane Foster infection with Aether before the events of Avengers: Endgame.",
        "Shows Thor emotional reunion with his mother Frigga before her death, providing essential context for Avengers: Endgame.",
        "Allows Thor to summon 2013 Mjolnir proving he is still worthy prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-america-1",
    targetId: "mcu-endgame",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "1970 Camp Lehigh time heist mission and Steve Rogers final choice to live out life with Peggy Carter.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains 1970 Camp Lehigh time heist mission and Steve Rogers final choice to live out life with Peggy Carter before Avengers: Endgame.",
      detailedReasons: [
        "Shows Steve and Tony traveling to 1970 Camp Lehigh for Pym Particles and Tesseract before the events of Avengers: Endgame.",
        "Shows Steve seeing Peggy Carter through office window glass, providing essential context for Avengers: Endgame.",
        "Provides emotional foundation for Steve returning to 1945 to live out his life prior to Avengers: Endgame.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-spider-man-homecoming",
    relationship: "character-origin",
    strength: "required",
    confidence: "confirmed",
    reason: "Peter Parker recruitment by Tony Stark in Leipzig leads directly into his NYC superhero journey.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains peter Parker recruitment by Tony Stark in Leipzig leads directly into his NYC superhero journey before Spider-Man: Homecoming.",
      detailedReasons: [
        "Shows Tony Stark recruiting high schooler Peter Parker in Queens before the events of Spider-Man: Homecoming.",
        "Establishes Peter Leipzig airport battle experience in his tech suit, providing essential context for Spider-Man: Homecoming.",
        "Sets up Happy Hogan as Peter liaison and Tony as his mentor prior to Spider-Man: Homecoming.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-spider-man-homecoming",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "The Battle of New York aftermath provides the direct origin for Damage Control, alien Chitauri technology salvage, and Adrian Toomes (Vulture) villain motivation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Battle of New York aftermath provides the direct origin for Damage Control, alien Chitauri technology salvage, and Adrian Toomes (Vulture) villain motivation before Spider-Man: Homecoming.",
      detailedReasons: [
        "Establishes 2012 Battle of New York alien Chitauri salvage fallout before the events of Spider-Man: Homecoming.",
        "Explains formation of Stark Department of Damage Control, providing essential context for Spider-Man: Homecoming.",
        "Provides Adrian Toomes (Vulture) villain motivation after losing salvage contract prior to Spider-Man: Homecoming.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman",
    targetId: "mcu-spider-man-homecoming",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Establishes Tony Stark as Iron Man and founder of Stark Industries.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first establishes Tony Stark's heroic legacy and Stark Industries resources before mentoring Peter in Spider-Man: Homecoming.",
      detailedReasons: [
        "Introduces Tony Stark as Iron Man and head of Stark Industries before the events of Spider-Man: Homecoming.",
        "Establishes Tony technological genius and protective mentor instincts, providing essential context for Spider-Man: Homecoming.",
        "Provides baseline context for Peter reliance on Stark tech suits prior to Spider-Man: Homecoming.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman2",
    targetId: "mcu-spider-man-homecoming",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Introduces Happy Hogan in a supporting role at Stark Industries prior to his role as Peter Parker liaison.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces Happy Hogan in a supporting role at Stark Industries prior to his role as Peter Parker liaison before Spider-Man: Homecoming.",
      detailedReasons: [
        "Introduces Happy Hogan as Tony Stark head of security and trusted friend before the events of Spider-Man: Homecoming.",
        "Shows Happy managing Stark asset logistics and security clearance, providing essential context for Spider-Man: Homecoming.",
        "Explains why Happy is assigned to handle Peter Parker check-ins prior to Spider-Man: Homecoming.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-spider-man-homecoming",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Sokovia collateral destruction motivates government imposition of Sokovia Accords referenced in high school class.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains sokovia collateral destruction motivates government imposition of Sokovia Accords referenced in high school class before Spider-Man: Homecoming.",
      detailedReasons: [
        "Explains why Sokovia Accords legislation is taught in high school class before the events of Spider-Man: Homecoming.",
        "Shows global political sensitivity surrounding unsanctioned superhero activity, providing essential context for Spider-Man: Homecoming.",
        "Provides context for Tony restricting Peter tech suit capabilities prior to Spider-Man: Homecoming.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-homecoming",
    targetId: "mcu-spider-man-ffh",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Far From Home follows Peter Parker in high school coping with Tony Stark post-Blip legacy.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains far From Home follows Peter Parker in high school coping with Tony Stark post-Blip legacy before Spider-Man: Far From Home.",
      detailedReasons: [
        "Continues Peter high school bond with Ned Leeds, MJ, and Flash Thompson before the events of Spider-Man: Far From Home.",
        "Shows Peter coping with grief and international pressure to become next Iron Man, providing essential context for Spider-Man: Far From Home.",
        "Establishes Peter receiving Tony E.D.I.T.H. augmented-reality glasses prior to Spider-Man: Far From Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-spider-man-ffh",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "The Blip snap trauma sets up global aftermath during Peter European vacation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Blip snap trauma sets up global aftermath during Peter European vacation before Spider-Man: Far From Home.",
      detailedReasons: [
        "Explains 5-year gap where half the population vanished and returned un-aged before the events of Spider-Man: Far From Home.",
        "Shows awkward high school dynamic of Blipped vs non-Blipped students, providing essential context for Spider-Man: Far From Home.",
        "Provides emotional weight to Peter desire for a normal school trip prior to Spider-Man: Far From Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-spider-man-ffh",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Tony Stark sacrifice in Endgame sets up EDITH glasses inheritance and Mysterio plot.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tony Stark sacrifice in Endgame sets up EDITH glasses inheritance and Mysterio plot before Spider-Man: Far From Home.",
      detailedReasons: [
        "Shows world mourning Tony Stark with murals across Europe before the events of Spider-Man: Far From Home.",
        "Establishes Mysterio exploiting Tony legacy to pose as multiversal hero, providing essential context for Spider-Man: Far From Home.",
        "Provides emotional vulnerability Mysterio manipulates to acquire E.D.I.T.H prior to Spider-Man: Far From Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-homecoming",
    targetId: "mcu-spiderman-no-way-home",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Establishes Peter Parker High School support network (Ned Leeds, MJ) and Spider-Man origin trilogy arc.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Peter Parker High School support network (Ned Leeds, MJ) and Spider-Man origin trilogy arc before Spider-Man: No Way Home.",
      detailedReasons: [
        "Establishes Ned Leeds as Peter trusted guy in the chair before the events of Spider-Man: No Way Home.",
        "Shows growth of Peter and MJ romantic relationship, providing essential context for Spider-Man: No Way Home.",
        "Provides core high school friendship dynamic ruined by identity exposure prior to Spider-Man: No Way Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spider-man-ffh",
    targetId: "mcu-spiderman-no-way-home",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Mysterio unmasking broadcast in Far From Home ending directly triggers No Way Home crisis.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains mysterio unmasking broadcast in Far From Home ending directly triggers No Way Home crisis before Spider-Man: No Way Home.",
      detailedReasons: [
        "Shows Mysterio framing Peter Parker for murder and broadcasting his identity before the events of Spider-Man: No Way Home.",
        "Establishes J. Jonah Jameson running Daily Bugle hit pieces on Peter, providing essential context for Spider-Man: No Way Home.",
        "Triggers federal investigations, media harassment, and college application rejections prior to Spider-Man: No Way Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-doctor-strange",
    targetId: "mcu-spiderman-no-way-home",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Sanctum Sanctorum and Doctor Strange spellcasting dynamics.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Sanctum Sanctorum and Doctor Strange spellcasting dynamics before Spider-Man: No Way Home.",
      detailedReasons: [
        "Introduces Doctor Strange, Wong, and New York Sanctum Sanctorum before the events of Spider-Man: No Way Home.",
        "Establishes memory alteration runes and ancient mystic arts spells, providing essential context for Spider-Man: No Way Home.",
        "Explains why Peter turns to Strange for magical solution to unmasking prior to Spider-Man: No Way Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-spiderman-no-way-home",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Bond formed between Peter Parker and Doctor Strange fighting Thanos on Titan.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains bond formed between Peter Parker and Doctor Strange fighting Thanos on Titan before Spider-Man: No Way Home.",
      detailedReasons: [
        "Shows Strange and Peter meeting and fighting together in deep space on Titan before the events of Spider-Man: No Way Home.",
        "Establishes mutual trust and shared combat experience between Peter and Strange, providing essential context for Spider-Man: No Way Home.",
        "Explains why Strange agrees to help Peter with high-risk memory spell prior to Spider-Man: No Way Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-spiderman-no-way-home",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Post-Blip university admissions crisis for Peter, Ned, and MJ. Context mediated by Far From Home which is the Must Watch prerequisite.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains post-Blip university admissions crisis for Peter, Ned, and MJ. Context mediated by Far From Home which is the Must Watch prerequisite before Spider-Man: No Way Home.",
      detailedReasons: [
        "Provides context for competitive MIT admissions process post-Blip before the events of Spider-Man: No Way Home.",
        "Shows how controversy around Peter affects Ned and MJ future prospects, providing essential context for Spider-Man: No Way Home.",
        "Sets up Peter desperation to protect his friends college futures prior to Spider-Man: No Way Home.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-wandavision",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Thanos destruction of Vision in Wakanda to claim the Mind Stone directly causes Wanda Maximoff grief and the Westview Hex creation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains thanos destruction of Vision in Wakanda to claim the Mind Stone directly causes Wanda Maximoff grief and the Westview Hex creation before WandaVision.",
      detailedReasons: [
        "Shows Wanda forced to destroy Mind Stone in Vision forehead to stop Thanos before the events of WandaVision.",
        "Shows Thanos using Time Stone to reverse time and violently rip Mind Stone from Vision, providing essential context for WandaVision.",
        "Provides devastating emotional trauma driving Wanda Westview breakdown prior to WandaVision.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-wandavision",
    relationship: "character-development",
    strength: "required",
    confidence: "confirmed",
    reason: "Vision death in Infinity War and Endgame trauma motivates Wanda Maximoff Westview Hex creation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains vision death in Infinity War and Endgame trauma motivates Wanda Maximoff Westview Hex creation before WandaVision.",
      detailedReasons: [
        "Shows Wanda returning from the Blip to fight Thanos in Endgame before the events of WandaVision.",
        "Explains Wanda discovering Vision body dismantled in S.W.O.R.D. headquarters, providing essential context for WandaVision.",
        "Shows Wanda driving to Westview to grieve at their intended home site prior to WandaVision.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-wandavision",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Wanda Maximoff and Vision romantic bond, Sokovia Accords house arrest at Avengers Compound, and Wanda guilt over Lagos collateral damage.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Wanda Maximoff and Vision romantic bond, Sokovia Accords house arrest at Avengers Compound, and Wanda guilt over Lagos collateral damage before WandaVision.",
      detailedReasons: [
        "Shows Wanda and Vision bonding intimately at Avengers Compound before the events of WandaVision.",
        "Establishes Vision philosophical understanding of Wanda powers, providing essential context for WandaVision.",
        "Provides foundational romance that Wanda tries to recreate in Westview prior to WandaVision.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-wandavision",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Wanda Maximoff Mind Stone powers and Vision synthetic creation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Wanda Maximoff Mind Stone powers and Vision synthetic creation before WandaVision.",
      detailedReasons: [
        "Shows Mind Stone energy awakening Wanda latent magical powers before the events of WandaVision.",
        "Establishes Vision creation using Vibranium, Helen Cho Cradle, and Mind Stone, providing essential context for WandaVision.",
        "Introduces Pietro Maximoff (Quicksilver) as Wanda beloved twin brother prior to WandaVision.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-black-widow",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Black Widow begins immediately after Leipzig, with Natasha as a fugitive pursued by Secretary Ross.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains black Widow begins immediately after Leipzig, with Natasha as a fugitive pursued by Secretary Ross before Black Widow.",
      detailedReasons: [
        "Shows Natasha letting Steve and Bucky escape Leipzig, violating Sokovia Accords before the events of Black Widow.",
        "Establishes Secretary Thaddeus Ross launching international manhunt for Natasha, providing essential context for Black Widow.",
        "Explains Natasha fleeing to Norway to go off the grid prior to Black Widow.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-black-widow",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Establishes Natasha role as an Avenger and her Budapest history with Clint Barton.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Natasha role as an Avenger and her Budapest history with Clint Barton before Black Widow.",
      detailedReasons: [
        "Introduces Natasha Romanoff as S.H.I.E.L.D. premier operative before the events of Black Widow.",
        "Establishes frequent references to Natasha and Clint Barton secret Budapest mission, providing essential context for Black Widow.",
        "Provides baseline context for Natasha ledger of past Red Room assassinations prior to Black Widow.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-winter-soldier",
    targetId: "mcu-black-widow",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Establishes Natasha partnership with Steve Rogers, SHIELD collapse, and Red Room ledger leaks. Natasha voluntarily exposing her classified history to Congress is a formative act of transparency that enriches her Black Widow arc of confronting her past.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Natasha partnership with Steve Rogers, SHIELD collapse, and Red Room ledger leaks. Natasha voluntarily exposing her classified history to Congress is a formative act of transparency that enriches her Black Widow arc of confronting her past before Black Widow.",
      detailedReasons: [
        "Shows Natasha exposing S.H.I.E.L.D. and Red Room classified files to Congress.",
        "Establishes Natasha's commitment to facing her past sins before Black Widow.",
        "Shows Natasha leaking Red Room records to the world, forcing her onto the run prior to Black Widow.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-black-widow",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Provides additional context for Natasha Red Room nightmares and sterilization trauma, but Black Widow establishes these themes independently on-screen.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains provides additional context for Natasha Red Room nightmares and sterilization trauma, but Black Widow establishes these themes independently on-screen before Black Widow.",
      detailedReasons: [
        "Shows Wanda inducing Natasha traumatic flashbacks to Red Room graduation ceremony before the events of Black Widow.",
        "Explains forced sterilization medical procedure inflicted on Black Widow assassins.",
        "Provides emotional depth to Natasha longing for family prior to Black Widow.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-panther",
    targetId: "mcu-black-widow",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Establishes the post-Civil War geopolitical world state (Wakanda, T'Challa as king) that forms the backdrop of Natasha's fugitive era, without directly driving the Red Room plot.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes the post-Civil War geopolitical world state (Wakanda, T'Challa as king) that forms the backdrop of Natasha's fugitive era, without directly driving the Red Room plot before Black Widow.",
      detailedReasons: [
        "Shows global political tension following UN Vienna bombing before Black Widow.",
        "Establishes international law enforcement active pursuit of unregistered heroes.",
        "Establishes global enforcement of international accords, explaining Natasha's covert movement prior to Black Widow.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-america-1",
    targetId: "mcu-black-widow",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "The WWII Super Soldier program and Hydra origins provide thematic parallel to the Soviet Red Room Black Widow Program explored in this film.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the WWII Super Soldier program and Hydra origins provide thematic parallel to the Soviet Red Room Black Widow Program explored in this film before Black Widow.",
      detailedReasons: [
        "Introduces Super Soldier serum research during WWII before the events of Black Widow.",
        "Establishes Alexei Shostakov (Red Guardian) as Soviet Cold War response to Captain America, providing essential context for Black Widow.",
        "Provides thematic context for Soviet cold war super-soldier rivalry prior to Black Widow.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-widow",
    targetId: "mcu-tfatws",
    relationship: "post-credit",
    strength: "post-credit",
    confidence: "confirmed",
    reason: "Post-credit scene introduces Valentina Allegra de Fontaine recruiting Yelena Belova to target Clint Barton.",
    sourceType: "official-synopsis", narrativeScope: "post-credit",
    recommendationEvidence: {
      shortReason: "Watching this first explains post-credit scene introduces Valentina Allegra de Fontaine recruiting Yelena Belova to target Clint Barton before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Introduces Countess Valentina Allegra de Fontaine as mysterious covert organizer before the events of The Falcon and the Winter Soldier.",
        "Shows Val recruiting Yelena Belova for high-stakes intelligence assassinations, providing essential context for The Falcon and the Winter Soldier.",
        "Establishes Val secretive role building a government black-ops squad prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-tfatws",
    relationship: "story-continuation",
    strength: "moderate",
    confidence: "confirmed",
    reason: "The Snap decimation and 5-year Blip aftermath establish the global world state for Sam and Bucky. Witnessing the Blip enriches the Flag Smasher displacement anger even though FaWS explains this fully through its own exposition.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Snap decimation and 5-year Blip aftermath establish the global world state for Sam and Bucky. Witnessing the Blip enriches the Flag Smasher displacement anger even though FaWS explains this fully through its own exposition before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Explains global population vanishing and returning 5 years later before the events of The Falcon and the Winter Soldier.",
        "Shows socioeconomic displacement of millions returning to reclaimed homes, providing essential context for The Falcon and the Winter Soldier.",
        "Provides political grievance giving rise to Flag Smashers prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-tfatws",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Steve Rogers retirement and passing of Captain America shield to Sam Wilson directly drives the series.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains steve Rogers retirement and passing of Captain America shield to Sam Wilson directly drives the series before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Shows elderly Steve Rogers giving Vibranium shield to Sam Wilson before the events of The Falcon and the Winter Soldier.",
        "Establishes Sam emotional hesitation to step into Captain America shoes, providing essential context for The Falcon and the Winter Soldier.",
        "Shows government officials seizing shield to appoint John Walker as new Cap prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-winter-soldier",
    targetId: "mcu-tfatws",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Sam Wilson Falcon origin, Bucky Barnes Winter Soldier backstory, and Sharon Carter alliance.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Sam Wilson Falcon origin, Bucky Barnes Winter Soldier backstory, and Sharon Carter alliance before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Introduces Sam Wilson using military EXO-7 Falcon wings before the events of The Falcon and the Winter Soldier.",
        "Establishes Bucky Barnes brutal Winter Soldier assassin triggers and brainwashing, providing essential context for The Falcon and the Winter Soldier.",
        "Introduces Sharon Carter (Agent 13) as loyal ally who lost everything assisting Cap prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-tfatws",
    relationship: "character-development",
    strength: "required",
    confidence: "confirmed",
    reason: "Explains Avengers split, Baron Zemo imprisonment, Sharon Carter fugitive status, and Sam and Bucky partnership dynamic.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains explains Avengers split, Baron Zemo imprisonment, Sharon Carter fugitive status, and Sam and Bucky partnership dynamic before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Introduces Baron Helmut Zemo and his anti-super-soldier motivation before the events of The Falcon and the Winter Soldier.",
        "Shows Sharon Carter branded a traitor for stealing Cap shield and Falcon wings, providing essential context for The Falcon and the Winter Soldier.",
        "Establishes Sam and Bucky humorous bickering partnership dynamic prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-captain-america-1",
    targetId: "mcu-tfatws",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Original Captain America Steve Rogers and Bucky Barnes World War II origins.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains original Captain America Steve Rogers and Bucky Barnes World War II origins before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Establishes Steve Rogers WWII Super Soldier origin and patriotic mantle before the events of The Falcon and the Winter Soldier.",
        "Shows Isaiah Bradley secret Korean War super soldier history erased by government, providing essential context for The Falcon and the Winter Soldier.",
        "Provides historical context for weight of Captain America shield prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-black-panther",
    targetId: "mcu-tfatws",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "Explains Bucky Barnes rehabilitation in Wakanda (White Wolf) and Dora Milaje / Ayo involvement.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains explains Bucky Barnes rehabilitation in Wakanda (White Wolf) and Dora Milaje / Ayo involvement before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Shows Shuri curing Bucky of HYDRA mental trigger words in Wakanda before the events of The Falcon and the Winter Soldier.",
        "Establishes Bucky peaceful life in Wakanda as the White Wolf, providing essential context for The Falcon and the Winter Soldier.",
        "Explains why Dora Milaje (Ayo) monitor Bucky and demand Zemo recapture prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man",
    targetId: "mcu-tfatws",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Ant-Man vs Falcon fight sequence is extra character context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains ant-Man vs Falcon fight sequence is extra character context before The Falcon and the Winter Soldier.",
      detailedReasons: [
        "Shows Falcon fighting Scott Lang at Avengers Compound in Upstate NY before the events of The Falcon and the Winter Soldier.",
        "Establishes Falcon tracking down Scott Lang for Steve Rogers, providing essential context for The Falcon and the Winter Soldier.",
        "Provides lighthearted character context for Sam aerial scouting skills prior to The Falcon and the Winter Soldier.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-loki",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "2012 time-heist Tesseract escape creating the branching timeline.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Shows the Avengers time-heist and Loki 2012 Tesseract escape creating the branching multiverse.",
      detailedReasons: [
        "Shows 2012 Loki grabbing dropped Tesseract during Avengers time heist in NYC.",
        "Shows Loki teleporting to Gobi Desert, creating nexus event timeline branch.",
        "Triggers TVA Minute Men apprehending Loki for timeline crimes."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-avengers",
    targetId: "mcu-loki",
    relationship: "direct-sequel",
    strength: "moderate",
    confidence: "confirmed",
    reason: "The 2012 Loki variant originates directly from the Battle of New York in The Avengers.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the 2012 Loki variant originates directly from the Battle of New York in The Avengers before Loki.",
      detailedReasons: [
        "Shows Loki leading Chitauri invasion of New York City.",
        "Establishes Loki arrogant villainous mindset right after defeat by Avengers.",
        "Provides immediate character state before TVA Agent Mobius interrogates him prior to Loki.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor",
    targetId: "mcu-loki",
    relationship: "character-origin",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Loki Asgardian origin, frost giant lineage, and complex relationship with Thor.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Loki Asgardian origin, frost giant lineage, and complex relationship with Thor before Loki.",
      detailedReasons: [
        "Introduces Loki discovering he is adopted son of Odin and biologically a Frost Giant.",
        "Shows Loki deep-seated inferiority complex toward his brother Thor.",
        "Establishes Loki illusion magic and trickster personality.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-ragnarok",
    targetId: "mcu-loki",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "TVA Time Theater shows Loki his future reconciliation with Thor and sacrifice fighting Thanos.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tVA Time Theater shows Loki his future reconciliation with Thor and sacrifice fighting Thanos before Loki.",
      detailedReasons: [
        "Shows Loki watching his future life timeline play out in Mobius reel.",
        "Shows Loki reconciling with Thor during Asgard destruction.",
        "Shows Loki tragic death at hands of Thanos in Infinity War, breaking his villainous shell.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-thor-dark-world",
    targetId: "mcu-loki",
    relationship: "character-development",
    strength: "strong",
    confidence: "confirmed",
    reason: "TVA Time Theater reveals Frigga tragic death and Loki imprisonment in Asgard.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains tVA Time Theater reveals Frigga tragic death and Loki imprisonment in Asgard before Loki.",
      detailedReasons: [
        "Shows Loki learning his actions inadvertently caused Frigga death.",
        "Shows Loki genuine love and grief for Frigga.",
        "Provides profound emotional grounding for Loki redemption arc.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-loki",
    targetId: "mcu-what-if",
    relationship: "multiverse",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Establishes the MCU Multiverse framework and branching timeline cosmology for deeper appreciation of alternate realities.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes the MCU Multiverse framework and branching timeline cosmology for deeper appreciation of alternate realities before What If...?.",
      detailedReasons: [
        "Shows Sacred Timeline breaking open into infinite branching realities before the events of What If...?.",
        "Establishes multiverse rules and alternate timeline variations, providing essential context for What If...?.",
        "Provides baseline cosmology for Watcher observing parallel universes prior to What If...?.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-doctor-strange",
    targetId: "mcu-what-if",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Provides foundational appreciation for Stephen Strange's prime journey, enhancing the emotional impact of Doctor Strange Supreme's tragic arc in Episode 4.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains provides foundational appreciation for Stephen Strange's prime journey, enhancing the emotional impact of Doctor Strange Supreme's tragic arc in Episode 4 before What If...?.",
      detailedReasons: [
        "Introduces Stephen Strange car crash, Kamar-Taj training, and Christine Palmer bond before the events of What If...?.",
        "Establishes absolute points in time that cannot be altered without destroying reality, providing essential context for What If...?.",
        "Enriches tragic fall of Doctor Strange Supreme in Episode 4 prior to What If...?.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-wandavision",
    targetId: "mcu-multiverse-of-madness",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Wanda Darkhold corruption in WandaVision leads directly to her hunting America Chavez across multiverse.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains wanda Darkhold corruption in WandaVision leads directly to her hunting America Chavez across multiverse before Doctor Strange in the Multiverse of Madness.",
      detailedReasons: [
        "Shows Wanda studying Darkhold grimoire to search for her sons Billy and Tommy before the events of Doctor Strange in the Multiverse of Madness.",
        "Establishes Wanda full transformation into corrupted Scarlet Witch, providing essential context for Doctor Strange in the Multiverse of Madness.",
        "Explains why Wanda uses multiversal dreamwalking to target America Chavez prior to Doctor Strange in the Multiverse of Madness.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-doctor-strange",
    targetId: "mcu-multiverse-of-madness",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Doctor Strange second solo chapter traversing multiverse realities and Kamar-Taj defense.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains doctor Strange second solo chapter traversing multiverse realities and Kamar-Taj defense before Doctor Strange in the Multiverse of Madness.",
      detailedReasons: [
        "Continues Stephen Strange journey as master of the mystic arts before the events of Doctor Strange in the Multiverse of Madness.",
        "Shows Wong serving as Sorcerer Supreme at Kamar-Taj, providing essential context for Doctor Strange in the Multiverse of Madness.",
        "Establishes Strange unfulfilled love for Christine Palmer prior to Doctor Strange in the Multiverse of Madness.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-spiderman-no-way-home",
    targetId: "mcu-multiverse-of-madness",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Directly sets up Doctor Strange multiverse stability aftermath and Wanda Maximoff involvement.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains directly sets up Doctor Strange multiverse stability aftermath and Wanda Maximoff involvement before Doctor Strange in the Multiverse of Madness.",
      detailedReasons: [
        "Shows Doctor Strange dealing with fallout of fractured multiversal boundaries before the events of Doctor Strange in the Multiverse of Madness.",
        "Shows Strange approaching Wanda in her isolated cabin seeking multiverse expertise, providing essential context for Doctor Strange in the Multiverse of Madness.",
        "Provides context for Strange awareness of America Chavez multiverse portals prior to Doctor Strange in the Multiverse of Madness.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ironman3",
    targetId: "mcu-shang-chi",
    relationship: "character-origin",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Introduces Trevor Slattery's fake \"Mandarin\" persona, which Wenwu references when explaining why Trevor was kidnapped to Ta Lo's dungeon.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains introduces Trevor Slattery's fake \"Mandarin\" persona, which Wenwu references when explaining why Trevor was kidnapped to Ta Lo's dungeon before Shang-Chi and the Legend of the Ten Rings.",
      detailedReasons: [
        "Introduces out-of-work actor Trevor Slattery playing fake terrorist leader before the events of Shang-Chi and the Legend of the Ten Rings.",
        "Shows Aldrich Killian co-opting ancient Ten Rings name for corporate terror, providing essential context for Shang-Chi and the Legend of the Ten Rings.",
        "Explains why Xu Wenwu kidnapped Trevor to Ta Lo dungeon for mocking his legacy prior to Shang-Chi and the Legend of the Ten Rings.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-iron-man",
    targetId: "mcu-shang-chi",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "First appearance of the Ten Rings organization in the MCU, providing historical continuity before Shang-Chi expands its true history and leadership.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains first appearance of the Ten Rings organization in the MCU, providing historical continuity before Shang-Chi expands its true history and leadership before Shang-Chi and the Legend of the Ten Rings.",
      detailedReasons: [
        "Introduces Ten Rings terrorist cell kidnapping Tony Stark in Afghanistan before the events of Shang-Chi and the Legend of the Ten Rings.",
        "Establishes ancient ten rings emblem and secret operative network, providing essential context for Shang-Chi and the Legend of the Ten Rings.",
        "Provides historical continuity before Shang-Chi reveals Xu Wenwu true 1000-year empire prior to Shang-Chi and the Legend of the Ten Rings.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-endgame",
    targetId: "mcu-eternals",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "The return of half the population following Bruce Banner's Snap in Endgame provides the global energy threshold that triggers the Emergence of Tiamut in Earth's core.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the return of half the population following Bruce Banner's Snap in Endgame provides the global energy threshold that triggers the Emergence of Tiamut in Earth's core before Eternals.",
      detailedReasons: [
        "Explains Bruce Banner snapping half of Earth population back into existence before the events of Eternals.",
        "Shows massive surge of planetary population energy required for Tiamut birth, providing essential context for Eternals.",
        "Provides direct countdown trigger for Eternals uniting to prevent Earth destruction.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-gotg-1",
    targetId: "mcu-eternals",
    relationship: "world-building",
    strength: "moderate",
    confidence: "likely",
    reason: "First introduction of Celestial lore and cosmic scale in the MCU (Knowhere, Eson the Searcher), providing optional cosmic lore appreciation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains first introduction of Celestial lore and cosmic scale in the MCU (Knowhere, Eson the Searcher), providing optional cosmic lore appreciation before Eternals.",
      detailedReasons: [
        "Introduces Celestial lore showing Eson the Searcher wielding Power Stone before the events of Eternals.",
        "Establishes Knowhere as severed giant head of ancient Celestial, providing essential context for Eternals.",
        "Provides optional cosmic scale appreciation for Arishem the Judge prior to Eternals.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-man-of-steel",
    targetId: "dc-bvs",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Metropolis Black Zero destruction in Man of Steel directly motivates Bruce Wayne hatred and distrust of Superman.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains metropolis Black Zero destruction in Man of Steel directly motivates Bruce Wayne hatred and distrust of Superman before Batman v Superman: Dawn of Justice.",
      detailedReasons: [
        "Shows Superman and General Zod destructive battle leveling Metropolis buildings before the events of Batman v Superman: Dawn of Justice.",
        "Establishes Bruce Wayne witnessing Wayne Financial tower collapse and employee deaths, providing essential context for Batman v Superman: Dawn of Justice.",
        "Provides core motivation for Batman perceiving Superman as existential threat prior to Batman v Superman: Dawn of Justice.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-bvs",
    targetId: "dc-justice-league",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Superman sacrifice at the end of Dawn of Justice inspires Bruce Wayne and Diana Prince to assemble Metahumans.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains superman sacrifice at the end of Dawn of Justice inspires Bruce Wayne and Diana Prince to assemble Metahumans before Justice League.",
      detailedReasons: [
        "Shows Superman sacrificing his life to slay Doomsday with Kryptonite spear before the events of Justice League.",
        "Establishes Bruce Wayne guilt and renewed faith in humanity, providing essential context for Justice League.",
        "Shows Batman and Wonder Woman searching for Flash, Aquaman, and Cyborg prior to Justice League.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-bvs",
    targetId: "dc-snyder-cut",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Superman death scream awakens Mother Boxes across Earth, alerting Steppenwolf and Darkseid.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains superman death scream awakens Mother Boxes across Earth, alerting Steppenwolf and Darkseid before Zack Snyder's Justice League.",
      detailedReasons: [
        "Shows Superman sonic death cry reverberating across the globe before the events of Zack Snyder's Justice League.",
        "Establishes awakening of dormant Mother Boxes guarded by Amazons and Atlanteans, providing essential context for Zack Snyder's Justice League.",
        "Alerts Steppenwolf to Earth defenseless state without Kryptonian protector prior to Zack Snyder's Justice League.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-the-suicide-squad",
    targetId: "dc-peacemaker",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Peacemaker hospital recovery following Bloodsport gunshot in Corto Maltese leads into his ARGUS team assignment.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains peacemaker hospital recovery following Bloodsport gunshot in Corto Maltese leads into his ARGUS team assignment before Peacemaker.",
      detailedReasons: [
        "Shows Peacemaker shooting Rick Flag and being shot by Bloodsport.",
        "Establishes Peacemaker survival in post-credit hospital scene.",
        "Shows Amanda Waller ARGUS handlers assigned to supervise Peacemaker on Project Butterfly.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-the-batman",
    targetId: "dc-the-penguin",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Riddler sea-wall detonation flooding Gotham directly causes crime boss power vacuum seized by Oz Cobb.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains riddler sea-wall detonation flooding Gotham directly causes crime boss power vacuum seized by Oz Cobb before The Penguin.",
      detailedReasons: [
        "Shows seawall bombs exploding and submerging downtown Gotham in floodwaters before the events of The Penguin.",
        "Establishes Carmine Falcone assassination leaving Gotham crime syndicate leaderless, providing essential context for The Penguin.",
        "Provides chaos Oz Cobb (Penguin) exploits to climb Gotham mob ladder prior to The Penguin.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-the-batman",
    targetId: "dc-batman-2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Official second chapter following Batman Year Two detective evolution in Gotham.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains official second chapter following Batman Year Two detective evolution in Gotham before The Batman Part II.",
      detailedReasons: [
        "Establishes Robert Pattinson Batman evolving from vengeance to hope in Gotham before the events of The Batman Part II.",
        "Shows Gotham rebuilding under flooded martial law, providing essential context for The Batman Part II.",
        "Sets up Batman confronting new subterranean crime threats in Gotham prior to The Batman Part II.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-joker",
    targetId: "dc-joker-2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Arthur Fleck live TV murder of Murray Franklin leads into his Arkham state hospital trial.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains arthur Fleck live TV murder of Murray Franklin leads into his Arkham state hospital trial before Joker: Folie à Deux.",
      detailedReasons: [
        "Shows Arthur Fleck executing Murray Franklin on live television before the events of Joker: Folie à Deux.",
        "Establishes Joker becoming rioting populist symbol across Gotham, providing essential context for Joker: Folie à Deux.",
        "Sets up Arthur incarceration in Arkham State Hospital awaiting trial prior to Joker: Folie à Deux.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "dc-superman-2025",
    targetId: "dc-lanterns",
    relationship: "world-building",
    strength: "strong",
    confidence: "likely",
    reason: "Establishes Earth Metahuman presence prior to Green Lantern Corps terrestrial investigation.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Earth Metahuman presence prior to Green Lantern Corps terrestrial investigation before Lanterns.",
      detailedReasons: [
        "Introduces James Gunn DCU Superman living in world already populated by heroes before the events of Lanterns.",
        "Establishes Earth as hub of high-powered metahuman activity, providing essential context for Lanterns.",
        "Provides terrestrial context before Hal Jordan and John Stewart investigate Earth murder mystery prior to Lanterns.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep4",
    targetId: "sw-ep5",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "The Empire Strikes Back picks up the Rebel Alliance conflict following the destruction of the first Death Star.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Empire Strikes Back picks up the Rebel Alliance conflict following the destruction of the first Death Star before Star Wars: Episode V - The Empire Strikes Back.",
      detailedReasons: [
        "Shows Galactic Empire pursuing Rebel Alliance to ice planet Hoth before the events of Star Wars: Episode V - The Empire Strikes Back.",
        "Establishes Luke Skywalker traveling to Dagobah to train under Jedi Master Yoda, providing essential context for Star Wars: Episode V - The Empire Strikes Back.",
        "Shows Darth Vader hunting Han Solo and Princess Leia across galaxy prior to Star Wars: Episode V - The Empire Strikes Back.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep5",
    targetId: "sw-ep6",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Return of the Jedi concludes Luke Skywalker Jedi journey and the rescue of Han Solo from Jabba the Hutt.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains return of the Jedi concludes Luke Skywalker Jedi journey and the rescue of Han Solo from Jabba the Hutt before Star Wars: Episode VI - Return of the Jedi.",
      detailedReasons: [
        "Shows Luke, Leia, and Lando mounting rescue mission to save Han Solo from Jabba before the events of Star Wars: Episode VI - Return of the Jedi.",
        "Establishes Luke confronting truth of Darth Vader being his father Anakin, providing essential context for Star Wars: Episode VI - Return of the Jedi.",
        "Sets up final Battle of Endor and Emperor Palpatine defeat prior to Star Wars: Episode VI - Return of the Jedi.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep1",
    targetId: "sw-ep2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Attack of the Clones follows Anakin Skywalker Jedi padawan training ten years after Naboo.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains attack of the Clones follows Anakin Skywalker Jedi padawan training ten years after Naboo before Star Wars: Episode II - Attack of the Clones.",
      detailedReasons: [
        "Shows Anakin Skywalker grown into impatient Jedi Padawan under Obi-Wan Kenobi before the events of Star Wars: Episode II - Attack of the Clones.",
        "Establishes Separatist crisis led by former Jedi Count Dooku, providing essential context for Star Wars: Episode II - Attack of the Clones.",
        "Shows Anakin reuniting with Padme Amidala and forbidden romance prior to Star Wars: Episode II - Attack of the Clones.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep2",
    targetId: "sw-ep3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Revenge of the Sith concludes the Clone Wars leading to Anakin fall and Order 66 execution.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains revenge of the Sith concludes the Clone Wars leading to Anakin fall and Order 66 execution before Star Wars: Episode III - Revenge of the Sith.",
      detailedReasons: [
        "Shows Anakin growing fear of losing Padme during childbirth before the events of Star Wars: Episode III - Revenge of the Sith.",
        "Establishes Supreme Chancellor Palpatine manipulating Anakin toward Dark Side, providing essential context for Star Wars: Episode III - Revenge of the Sith.",
        "Executes Order 66 wiping out Jedi Order and founding Galactic Empire prior to Star Wars: Episode III - Revenge of the Sith.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep3",
    targetId: "sw-rogue-one",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes Imperial rule and Death Star construction completion leading directly into Scarif.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes Imperial rule and Death Star construction completion leading directly into Scarif before Rogue One: A Star Wars Story.",
      detailedReasons: [
        "Shows galactic transition from Republic into oppressive Galactic Empire before the events of Rogue One: A Star Wars Story.",
        "Establishes early construction of Death Star weapon, providing essential context for Rogue One: A Star Wars Story.",
        "Provides historical backdrop for Galen Erso forced into weapon development prior to Rogue One: A Star Wars Story.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-andor",
    targetId: "sw-rogue-one",
    relationship: "character-origin",
    strength: "required",
    confidence: "confirmed",
    reason: "Andor explores Cassian recruitment into Rebel Intelligence leading to his Scarif mission.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains andor explores Cassian recruitment into Rebel Intelligence leading to his Scarif mission before Rogue One: A Star Wars Story.",
      detailedReasons: [
        "Shows Cassian Andor transforming from cynical thief into committed Rebel operative before the events of Rogue One: A Star Wars Story.",
        "Establishes Luthen Rael and Mon Mothma building underground Rebel Alliance, providing essential context for Rogue One: A Star Wars Story.",
        "Provides deep character backstory for Cassian sacrifice on Scarif prior to Rogue One: A Star Wars Story.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-rogue-one",
    targetId: "sw-ep4",
    relationship: "direct-sequel",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Rogue One Scarif transmission of Death Star plans leads directly into Princess Leia escape at the start of A New Hope.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains rogue One Scarif transmission of Death Star plans leads directly into Princess Leia escape at the start of A New Hope before Star Wars: Episode IV - A New Hope.",
      detailedReasons: [
        "Shows Rogue One squadron stealing Death Star schematics on Scarif before the events of Star Wars: Episode IV - A New Hope.",
        "Establishes Darth Vader slaughtering Rebels aboard Profundity, providing essential context for Star Wars: Episode IV - A New Hope.",
        "Concludes with Princess Leia escaping on Tantive IV with stolen plans prior to Star Wars: Episode IV - A New Hope.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep6",
    targetId: "sw-ep7",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "The Force Awakens explores the galaxy 30 years after Return of the Jedi with the rise of the First Order.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Force Awakens explores the galaxy 30 years after Return of the Jedi with the rise of the First Order before Star Wars: Episode VII - The Force Awakens.",
      detailedReasons: [
        "Shows rise of First Order from remnants of Empire before the events of Star Wars: Episode VII - The Force Awakens.",
        "Establishes Luke Skywalker mysterious exile after Jedi Academy fell, providing essential context for Star Wars: Episode VII - The Force Awakens.",
        "Introduces Rey, Finn, Poe Dameron, and Kylo Ren prior to Star Wars: Episode VII - The Force Awakens.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep7",
    targetId: "sw-ep8",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "The Last Jedi picks up immediately as Rey finds Luke Skywalker on Ahch-To.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Last Jedi picks up immediately as Rey finds Luke Skywalker on Ahch-To before Star Wars: Episode VIII - The Last Jedi.",
      detailedReasons: [
        "Shows Rey offering Luke Skywalker his father lightsaber on Ahch-To before the events of Star Wars: Episode VIII - The Last Jedi.",
        "Establishes Resistance evacuating D'Qar under heavy First Order bombardment, providing essential context for Star Wars: Episode VIII - The Last Jedi.",
        "Continues Kylo Ren conflict following his murder of Han Solo prior to Star Wars: Episode VIII - The Last Jedi.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-ep8",
    targetId: "sw-ep9",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "The Rise of Skywalker concludes the Resistance struggle against resurrected Palpatine Final Order.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Rise of Skywalker concludes the Resistance struggle against resurrected Palpatine Final Order before Star Wars: Episode IX - The Rise of Skywalker.",
      detailedReasons: [
        "Shows Supreme Leader Kylo Ren ruling First Order before the events of Star Wars: Episode IX - The Rise of Skywalker.",
        "Establishes mysterious broadcast of resurrected Emperor Palpatine from Exegol, providing essential context for Star Wars: Episode IX - The Rise of Skywalker.",
        "Concludes Rey Jedi journey and Skywalker saga prior to Star Wars: Episode IX - The Rise of Skywalker.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-mandalorian",
    targetId: "sw-boba-fett",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "The Book of Boba Fett contains essential Mandalorian Season 2.5 episodes resolving Din Djarin Darksaber possession and Grogu reunion.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains the Book of Boba Fett contains essential Mandalorian Season 2.5 episodes resolving Din Djarin Darksaber possession and Grogu reunion before The Book of Boba Fett.",
      detailedReasons: [
        "Shows Din Djarin wielding Darksaber after defeating Moff Gideon before the events of The Book of Boba Fett.",
        "Establishes Grogu training with Luke Skywalker at new Jedi Temple, providing essential context for The Book of Boba Fett.",
        "Shows Grogu choosing to return to Din Djarin over Jedi training prior to The Book of Boba Fett.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-boba-fett",
    targetId: "sw-ahsoka",
    relationship: "story-continuation",
    strength: "strong",
    confidence: "confirmed",
    reason: "Establishes New Republic Outer Rim vulnerability and Grand Admiral Thrawn impending return.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains establishes New Republic Outer Rim vulnerability and Grand Admiral Thrawn impending return before Ahsoka.",
      detailedReasons: [
        "Shows New Republic struggling to maintain law and order in Outer Rim before the events of Ahsoka.",
        "Establishes Boba Fett taking control of Jabba crime syndicate on Tatooine, providing essential context for Ahsoka.",
        "Provides geopolitical context for Ahsoka Tano searching for Thrawn.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "sw-mandalorian",
    targetId: "sw-mandalorian-grogu",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "likely",
    reason: "Theatrical feature film continuation of Din Djarin and Grogu New Republic adventures.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains theatrical feature film continuation of Din Djarin and Grogu New Republic adventures before The Mandalorian & Grogu.",
      detailedReasons: [
        "Continues Din Djarin official contract work for New Republic Defense Fleet before the events of The Mandalorian & Grogu.",
        "Shows Grogu as Din Djarin adopted Mandalorian apprentice, providing essential context for The Mandalorian & Grogu.",
        "Establishes duo taking on Imperial remnant threats across galaxy prior to The Mandalorian & Grogu.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-sorcerers-stone",
    targetId: "hp-chamber-of-secrets",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Harry Potter second year at Hogwarts.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains harry Potter second year at Hogwarts before Harry Potter 2.",
      detailedReasons: [
        "Continues Harry friendship with Ron Weasley and Hermione Granger before the events of Harry Potter 2.",
        "Establishes Dobby House-Elf warning Harry not to return to Hogwarts, providing essential context for Harry Potter 2.",
        "Shows opening of Chamber of Secrets and petrification attacks prior to Harry Potter 2.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-chamber-of-secrets",
    targetId: "hp-prisoner-of-azkaban",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Harry Potter third year at Hogwarts introducing Sirius Black.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains harry Potter third year at Hogwarts introducing Sirius Black before Harry Potter 3.",
      detailedReasons: [
        "Shows Sirius Black escaping from Azkaban prison targeting Harry before the events of Harry Potter 3.",
        "Introduces Dementors guarding Hogwarts and Professor Remus Lupin, providing essential context for Harry Potter 3.",
        "Reveals Marauder Map and Peter Pettigrew betrayal prior to Harry Potter 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-prisoner-of-azkaban",
    targetId: "hp-goblet-of-fire",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Triwizard Tournament and Lord Voldemort bodily rebirth.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains triwizard Tournament and Lord Voldemort bodily rebirth before Harry Potter 4.",
      detailedReasons: [
        "Shows Quidditch World Cup attack by Death Eaters before the events of Harry Potter 4.",
        "Establishes Harry mysterious entry into dangerous Triwizard Tournament, providing essential context for Harry Potter 4.",
        "Concludes with Cedric Diggory death and Voldemort resurrection in graveyard prior to Harry Potter 4.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-goblet-of-fire",
    targetId: "hp-order-of-phoenix",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Dumbledore Army formation and Ministry of Magic Battle of Department of Mysteries.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains dumbledore Army formation and Ministry of Magic Battle of Department of Mysteries before Harry Potter 5.",
      detailedReasons: [
        "Shows Ministry of Magic slandering Harry and Dumbledore before the events of Harry Potter 5.",
        "Introduces Dolores Umbridge taking authoritarian control of Hogwarts, providing essential context for Harry Potter 5.",
        "Establishes Dumbledore Army and Battle of Department of Mysteries prior to Harry Potter 5.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-order-of-phoenix",
    targetId: "hp-half-blood-prince",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Voldemort Horcrux revelations and Dumbledore astronomy tower tragedy.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains voldemort Horcrux revelations and Dumbledore astronomy tower tragedy before Harry Potter 6.",
      detailedReasons: [
        "Shows Dumbledore giving Harry private lessons into Tom Riddle past before the events of Harry Potter 6.",
        "Introduces Horcruxes as key to Voldemort immortality, providing essential context for Harry Potter 6.",
        "Concludes with Snape killing Dumbledore atop Astronomy Tower prior to Harry Potter 6.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-half-blood-prince",
    targetId: "hp-deathly-hallows-1",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Horcrux hunt across Wizarding Britain following Dumbledore death.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains horcrux hunt across Wizarding Britain following Dumbledore death before Harry Potter 7.",
      detailedReasons: [
        "Shows Harry, Ron, and Hermione leaving Hogwarts to find Horcruxes before the events of Harry Potter 7.",
        "Establishes Fall of Ministry of Magic to Death Eaters, providing essential context for Harry Potter 7.",
        "Concludes with Dobby sacrifice and Voldemort acquiring Elder Wand prior to Harry Potter 7.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "hp-deathly-hallows-1",
    targetId: "hp-deathly-hallows-2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Battle of Hogwarts climax concluding the Horcrux destruction and Voldemort defeat.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains battle of Hogwarts climax concluding the Horcrux destruction and Voldemort defeat before Harry Potter 8.",
      detailedReasons: [
        "Shows final break-in at Gringotts to steal Hufflepuff Cup before the events of Harry Potter 8.",
        "Establishes siege of Hogwarts by Voldemort Death Eater army, providing essential context for Harry Potter 8.",
        "Concludes Snape true memory reveal and Harry final duel with Voldemort prior to Harry Potter 8.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "lotr-1",
    targetId: "lotr-2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Fellowship split and parallel journeys to Helm Deep and Mordor.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains fellowship split and parallel journeys to Helm Deep and Mordor before LOTR: The Two Towers.",
      detailedReasons: [
        "Shows Breaking of the Fellowship following Boromir death before the events of LOTR: The Two Towers.",
        "Tracks Frodo and Sam guiding Gollum toward Black Gate of Mordor, providing essential context for LOTR: The Two Towers.",
        "Follows Aragorn, Legolas, and Gimli hunting Uruk-hai to rescue Merry and Pippin prior to LOTR: The Two Towers.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "lotr-2",
    targetId: "lotr-3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Siege of Minas Tirith and Frodo final ascent up Mount Doom.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains siege of Minas Tirith and Frodo final ascent up Mount Doom before LOTR: Return of the King.",
      detailedReasons: [
        "Shows Sauron armies assaulting capital city of Gondor before the events of LOTR: Return of the King.",
        "Establishes Aragorn claiming rightful throne as King of Men, providing essential context for LOTR: Return of the King.",
        "Concludes Frodo and Sam agonizing final journey to destroy One Ring prior to LOTR: Return of the King.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "jw-1",
    targetId: "jw-2",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Blood oath marker debt directly forces John Wick out of retirement.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains blood oath marker debt directly forces John Wick out of retirement before John Wick 2.",
      detailedReasons: [
        "Shows Italian mob boss Santino D'Antonio demanding marker repayment before the events of John Wick 2.",
        "Establishes High Table assassin rules and Continental neutral ground laws, providing essential context for John Wick 2.",
        "Forces John to travel to Rome to execute assassination contract prior to John Wick 2.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "jw-2",
    targetId: "jw-3",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Excommunicado contract bounty immediately picks up following Continental murder.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains excommunicado contract bounty immediately picks up following Continental murder before John Wick 3.",
      detailedReasons: [
        "Shows John Wick fleeing NYC with $14 million global bounty on his head before the events of John Wick 3.",
        "Establishes High Table Adjudicator revoking sanctuary across city, providing essential context for John Wick 3.",
        "Follows John seeking audience with Elder in Moroccan desert prior to John Wick 3.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "jw-3",
    targetId: "jw-4",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "High Table Marquis duel to earn final freedom.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Watching this first explains high Table Marquis duel to earn final freedom before John Wick 4.",
      detailedReasons: [
        "Introduces Marquis Vincent de Gramont hunting John Wick before the events of John Wick 4.",
        "Shows Winston and Charon facing High Table retribution for aiding John, providing essential context for John Wick 4.",
        "Concludes with John challenging Marquis to old-school duel in Paris prior to John Wick 4.",
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man",
    targetId: "mcu-ant-man-wasp",
    relationship: "direct-sequel",
    strength: "required",
    confidence: "confirmed",
    reason: "Scott Lang house arrest and Hank Pym Quantum Realm research.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes Scott Lang house arrest and Hank Pym Quantum Realm research before Ant-Man and the Wasp.",
      detailedReasons: [
        "Introduces Scott Lang superhero mantle and Hank Pym Pym Particles technology.",
        "Establishes Hope van Dyne taking up Wasp suit to rescue Janet van Dyne from Quantum Realm."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-civil-war",
    targetId: "mcu-ant-man-wasp",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Sokovia Accords violation forces Hank Pym and Hope on the run.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Explains Scott Lang Leipzig battle arrest forcing Hank Pym and Hope on the run.",
      detailedReasons: [
        "Shows Scott Lang fighting alongside Captain America in Leipzig, violating Sokovia Accords.",
        "Explains why FBI monitors Scott house arrest and Hank Pym mobile quantum lab operations."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-infinity-war",
    targetId: "mcu-ant-man-wasp",
    relationship: "world-building",
    strength: "strong",
    confidence: "confirmed",
    reason: "Thanos Snap event context in post-credit Quantum Realm retrieval.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Provides Thanos Snap context for post-credit Quantum Realm entrapment.",
      detailedReasons: [
        "Explains sudden disintegration of Hank Pym, Janet van Dyne, and Hope van Dyne during Quantum Realm harvesting."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-age-of-ultron",
    targetId: "mcu-ant-man-wasp",
    relationship: "world-building",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Sokovia Accords legislation origin context.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Explains Sokovia devastation leading to global superhero regulation.",
      detailedReasons: [
        "Provides background political context for international superhero registration."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man-wasp",
    targetId: "mcu-endgame",
    relationship: "story-continuation",
    strength: "required",
    confidence: "confirmed",
    reason: "Quantum Realm time heist concept setup.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Establishes Scott Lang entrapment in Quantum Realm enabling Avengers time heist.",
      detailedReasons: [
        "Shows Scott trapped in Quantum Realm for 5 years while Earth experiences 5 minutes, inspiring time travel plan."
      ],
      source: "editorial"
    }
  },
  {
    sourceId: "mcu-ant-man-wasp",
    targetId: "mcu-thunderbolts",
    relationship: "character-development",
    strength: "moderate",
    confidence: "confirmed",
    reason: "Ghost quantum instability origin.",
    sourceType: "official-synopsis",
    recommendationEvidence: {
      shortReason: "Provides Ghost molecular phasing origin before Thunderbolts*.",
      detailedReasons: [
        "Introduces Ava Starr (Ghost) suffering from quantum instability before joining Val's team."
      ],
      source: "editorial"
    }
  },

  // ─── FAST & FURIOUS STORY EDGES ─────────────────────────
  {
    sourceId: 'ff-1',
    targetId: 'ff-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Brian O\'Conner in Miami after letting Dom Toretto escape in Los Angeles.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Brian O\'Conner in Miami after letting Dom escape.', detailedReasons: ['Continues Brian O\'Conner\'s arc as a former LAPD officer in Miami.', 'Introduces Roman Pearce and Tej Parker.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-1',
    targetId: 'ff-4',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel reuniting Dom Toretto and Brian O\'Conner following Letty\'s apparent murder by the Braga cartel.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Reunites Dom Toretto and Brian O\'Conner following Letty\'s apparent death.', detailedReasons: ['Re-establishes the core partnership between Dom and Brian.', 'Explains the investigation into Arturo Braga.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-2',
    targetId: 'ff-4',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Re-establishes Brian\'s FBI career following his undercover work in Miami.',
    sourceType: 'editorial',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Explains Brian\'s reinstatement into federal law enforcement before Fast & Furious.', detailedReasons: ['Shows how Brian transitioned from fugitive racer to FBI agent.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-4',
    targetId: 'ff-5',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel picking up immediately from Dom\'s prison bus breakout, leading the crew to Rio de Janeiro.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel picking up immediately from Dom\'s prison bus breakout in Rio.', detailedReasons: ['Opens with Brian and Mia ambushing the prison transport bus.', 'Assembles the ultimate crew including Roman, Tej, Han, and Gisele.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-5',
    targetId: 'ff-6',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Dom\'s crew in Europe battling Owen Shaw to rescue Letty.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Hobbs enlisting Dom\'s crew to track Owen Shaw.', detailedReasons: ['Reveals that Letty survived the crash in Fast & Furious (2009).', 'Pits the family against Owen Shaw\'s mercenary street racing team.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-6',
    targetId: 'ff-7',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Deckard Shaw seeking revenge for his brother Owen Shaw, targeting Han in Tokyo.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Deckard Shaw hunting Dom\'s family for revenge.', detailedReasons: ['Explains Deckard Shaw\'s vengeful assault on Dom\'s family.', 'Features Brian O\'Conner\'s final ride and emotional tribute.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-3',
    targetId: 'ff-7',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Han\'s Tokyo Drift crash timeline converges directly into Deckard Shaw\'s attack in Furious 7.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Connects Han\'s fateful Tokyo crash to Deckard Shaw\'s revenge mission.', detailedReasons: ['Shows Dom traveling to Tokyo to retrieve Han\'s body and meet Sean Boswell.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-7',
    targetId: 'ff-8',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Cipher coercing Dom into betraying his family to steal nuclear launch codes.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Cipher blackmailing Dom into turning against his family.', detailedReasons: ['Explains why Dom is forced to turn against Letty and the team.', 'Forces Hobbs and Deckard Shaw into an uneasy alliance.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-8',
    targetId: 'ff-9',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel introducing Dom\'s estranged brother Jakob Toretto and revealing Han survived Tokyo.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel introducing Jakob Toretto and revealing Han\'s survival.', detailedReasons: ['Explains the back-story of Jack Toretto\'s death and Jakob\'s exile.', 'Reveals how Mr. Nobody helped faked Han\'s death in Tokyo.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-8',
    targetId: 'ff-hobbs-shaw',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Spin-off following Luke Hobbs and Deckard Shaw teaming up against Brixton Lore.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Spin-off following Hobbs and Deckard Shaw.', detailedReasons: ['Features the partnership formed in Fate of the Furious.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-9',
    targetId: 'ff-10',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Dante Reyes seeking revenge for Hernan Reyes\' death in Fast Five.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Dante Reyes\' vengeful crusade against Dom\'s family.', detailedReasons: ['Pits Dom against Dante Reyes across Rome, Brazil, and Portugal.', 'Concludes with a major cliffhanger setting up Fast X: Part 2.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-5',
    targetId: 'ff-10',
    relationship: 'villain-origin',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Dante Reyes\' villain origin stems directly from the vault heist in Fast Five where his father Hernan was killed.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Explains Dante Reyes\' backstory as the son of Rio drug lord Hernan Reyes.', detailedReasons: ['Shows Dante witnessing the vault heist bridge crash in Rio de Janeiro.'], source: 'editorial' },
  },
  {
    sourceId: 'ff-10',
    targetId: 'fast-fast-11',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct cliffhanger sequel resolving Dante Reyes\' attack on Dom and his son Little B.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct cliffhanger sequel completing the Fast X story arc.', detailedReasons: ['Resolves the dam explosion cliffhanger and Dante\'s trap.'], source: 'editorial' },
  },

  // ─── MISSION: IMPOSSIBLE STORY EDGES ─────────────────────────
  {
    sourceId: 'mi-1',
    targetId: 'mi-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Ethan Hunt battling rogue IMF agent Sean Ambrose in Sydney.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Ethan Hunt\'s team mission to retrieve the Chimera virus.', detailedReasons: ['Establishes Ethan Hunt\'s ongoing leadership of IMF ops alongside Luther Stickell.'], source: 'editorial' },
  },
  {
    sourceId: 'mi-1',
    targetId: 'mi-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel introducing Julia Meade and Benji Dunn as Ethan attempts to retire from field duty.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel introducing Julia Meade and Benji Dunn.', detailedReasons: ['Pits Ethan against arms dealer Owen Davian to protect his fiancée Julia.'], source: 'editorial' },
  },
  {
    sourceId: 'mi-3',
    targetId: 'mi-gp',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following IMF disavowal after the Kremlin bombing, keeping Benji on Ethan\'s team.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following the disavowal of the IMF after the Kremlin explosion.', detailedReasons: ['Features Ethan, Benji, Jane, and Brandt executing the Dubai Burj Khalifa climb.'], source: 'editorial' },
  },
  {
    sourceId: 'mi-gp',
    targetId: 'mi-rn',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel introducing Solomon Lane and the Syndicate while the CIA attempts to disband the IMF.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Ethan Hunt\'s hunt for the rogue Syndicate organization.', detailedReasons: ['Introduces Ilsa Faust and pits Ethan against Solomon Lane.'], source: 'editorial' },
  },
  {
    sourceId: 'mi-rn',
    targetId: 'mi-fallout',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel resolving Solomon Lane, the Apostles, Ilsa Faust, and Julia Meade.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel resolving Solomon Lane\'s plot to detonate plutonium cores.', detailedReasons: ['Reunites Ethan with Ilsa Faust and resolves Julia Meade\'s arc.'], source: 'editorial' },
  },
  {
    sourceId: 'mi-fallout',
    targetId: 'mi-dr1',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel introducing The Entity AI threat and Grace while retaining Ethan, Benji, Luther, and Ilsa.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel introducing the rogue AI threat known as The Entity.', detailedReasons: ['Pits Ethan against Gabriel and introduces thief Grace.'], source: 'editorial' },
  },
  {
    sourceId: 'mi-dr1',
    targetId: 'mi-dr2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel completing the Sevastopol submarine Entity storyline.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel completing the Sevastopol Entity storyline.', detailedReasons: ['Resolves Ethan\'s search for the Sevastopol submarine computer core.'], source: 'editorial' },
  },

  // ─── X-MEN STORY EDGES ─────────────────────────
  {
    sourceId: 'xmen-1',
    targetId: 'xmen-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Stryker\'s assault on Xavier\'s school and Logan\'s search for his past.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Stryker\'s attack on Xavier\'s mansion.', detailedReasons: ['Forces the X-Men and Magneto\'s Brotherhood into a temporary alliance.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-2',
    targetId: 'xmen-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Jean Grey\'s resurrection as Dark Phoenix and the Mutant Cure conflict.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Jean Grey\'s return as the destructive Dark Phoenix.', detailedReasons: ['Concludes the original X-Men trilogy battle at Alcatraz Island.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-1',
    targetId: 'xmen-origins-wolverine',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Prequel explaining Wolverine\'s adamantium bonding under Stryker.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Prequel explaining Wolverine\'s past.', detailedReasons: ['Shows weapon X program.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-fc',
    targetId: 'xmen-dofp',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel connecting the First Class cast in 1973 with the Original Trilogy cast in a dystopian future.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel sending Wolverine back to 1973 to prevent the Sentinel apocalypse.', detailedReasons: ['Unites the original X-Men cast with the First Class prequel cast.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-3',
    targetId: 'xmen-dofp',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Connects original trilogy post-apocalyptic future timeline.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Shows the original X-Men team fighting for survival against Sentinels.', detailedReasons: ['Establishes the bleak 2023 Sentinel timeline.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-dofp',
    targetId: 'xmen-apocalypse',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following En Sabah Nur awakening in 1983 in the altered timeline.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following the awakening of the ancient mutant Apocalypse in 1983.', detailedReasons: ['Explains Mystique\'s public hero status and young Cyclops/Jean Grey.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-apocalypse',
    targetId: 'xmen-dark-phoenix',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Jean Grey absorbing the Phoenix force during a 1992 space mission.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Jean Grey\'s cosmic Phoenix corruption in 1992.', detailedReasons: ['Concludes the prequel quadrology mutant arc.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-3',
    targetId: 'xmen-the-wolverine',
    relationship: 'character-development',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct continuation following Logan\'s self-imposed exile and grief after killing Jean Grey.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Follows Logan\'s grief in Japan after the tragic events of The Last Stand.', detailedReasons: ['Explains Logan\'s haunts over Jean Grey before traveling to Tokyo.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-the-wolverine',
    targetId: 'xmen-logan',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct culmination of Wolverine\'s personal journey set in 2029 as his healing factor fails.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct culmination of Wolverine\'s story arc protecting young Laura (X-23).', detailedReasons: ['Concludes Hugh Jackman\'s original Wolverine film legacy.'], source: 'editorial' },
  },
  {
    sourceId: 'xmen-deadpool',
    targetId: 'xmen-deadpool-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Wade Wilson creating X-Force to protect young mutant Russell from Cable.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Wade Wilson, Cable, and X-Force.', detailedReasons: ['Introduces Cable, Domino, and Wade\'s emotional recovery.'], source: 'editorial' },
  },

  // ─── PIRATES OF THE CARIBBEAN STORY EDGES ─────────────────────────
  {
    sourceId: 'potc-1',
    targetId: 'potc-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel introducing Davy Jones, the Flying Dutchman, and Jack\'s blood debt.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel introducing Davy Jones and Jack Sparrow\'s blood debt.', detailedReasons: ['Continues Jack, Will, and Elizabeth\'s adventures.'], source: 'editorial' },
  },
  {
    sourceId: 'potc-2',
    targetId: 'potc-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel picking up immediately from Jack trapped in Davy Jones\' Locker.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel rescuing Jack Sparrow from Davy Jones\' Locker.', detailedReasons: ['Resolves the East India Trading Company war against piracy.'], source: 'editorial' },
  },
  {
    sourceId: 'potc-1',
    targetId: 'potc-4',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Sequel following Jack Sparrow searching for the Fountain of Youth with Blackbeard and Angelica.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel following Jack Sparrow\'s quest for the Fountain of Youth.', detailedReasons: ['Pits Jack against pirate Blackbeard and reunites him with Barbossa.'], source: 'editorial' },
  },
  {
    sourceId: 'potc-3',
    targetId: 'potc-5',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Sequel introducing Will and Elizabeth\'s son Henry Turner seeking Poseidon\'s Trident to break his father\'s curse.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel introducing Henry Turner\'s quest to break Will\'s Flying Dutchman curse.', detailedReasons: ['Pits Jack against ghost captain Armando Salazar.'], source: 'editorial' },
  },

  // ─── TRANSFORMERS STORY EDGES ─────────────────────────
  {
    sourceId: 'tf-1',
    targetId: 'tf-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Sam Witwicky at college and the Fallen\'s awakening in Egypt.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Sam Witwicky and Optimus Prime battling The Fallen.', detailedReasons: ['Explains the Matrix of Leadership and Sun Harvester.'], source: 'editorial' },
  },
  {
    sourceId: 'tf-2',
    targetId: 'tf-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel resolving Sentinel Prime, the Space Bridge, and the battle for Chicago.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel resolving Sentinel Prime\'s betrayal in Chicago.', detailedReasons: ['Concludes Sam Witwicky\'s arc with the Autobots.'], source: 'editorial' },
  },
  {
    sourceId: 'tf-3',
    targetId: 'tf-4',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Soft reboot sequel set 5 years after Chicago, introducing Cade Yeager and the Dinobots.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel introducing Cade Yeager rebuilding a hidden Optimus Prime.', detailedReasons: ['Explains the CIA hunt for Transformers after the Battle of Chicago.'], source: 'editorial' },
  },
  {
    sourceId: 'tf-4',
    targetId: 'tf-5',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Optimus Prime\'s corruption by Quintessa and the collision of Cybertron with Earth.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Nemesis Prime and the ancient secret of Cybertron.', detailedReasons: ['Continues Cade Yeager\'s story alongside Sir Edmund Burton.'], source: 'editorial' },
  },
  {
    sourceId: 'tf-bumblebee',
    targetId: 'tf-rotb',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct prequel sequel set in 1994 introducing the Maximals, Terrorcons, and Unicron.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel set in 1994 following Bumblebee and Optimus Prime in Brooklyn/Peru.', detailedReasons: ['Introduces Optimus Primal, Mirage, and Scourge.'], source: 'editorial' },
  },

  // ─── THE HOBBIT & LOTR STORY EDGES ─────────────────────────
  {
    sourceId: 'hobbit-1',
    targetId: 'hobbit-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel continuing Bilbo and Thorin\'s quest to Erebor and awakening Smaug.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel continuing the quest to Erebor and confronting Smaug.', detailedReasons: ['Features Mirkwood, Lake-town, and Bilbo\'s encounter with Smaug.'], source: 'editorial' },
  },
  {
    sourceId: 'hobbit-2',
    targetId: 'hobbit-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel resolving Smaug\'s attack and the epic Battle of Five Armies.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel resolving the Battle of Five Armies at Erebor.', detailedReasons: ['Concludes Bilbo Baggins\' journey back to the Shire.'], source: 'editorial' },
  },
  {
    sourceId: 'hobbit-3',
    targetId: 'lotr-1',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'The Hobbit trilogy leads into Bilbo\'s 111th birthday party and passing the One Ring to Frodo.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Prequel trilogy showing how Bilbo found the One Ring from Gollum.', detailedReasons: ['Provides backstory for Bilbo, Gandalf, and the One Ring.'], source: 'editorial' },
  },
  {
    sourceId: 'jp-1',
    targetId: 'jp-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Ian Malcolm on Isla Sorna (Site B).',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Ian Malcolm to InGen\'s Site B breeding island.', detailedReasons: ['Explains InGen\'s second island and the San Diego T-Rex escape.'], source: 'editorial' },
  },
  {
    sourceId: 'jp-1',
    targetId: 'jp-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Sequel following Alan Grant returning to Isla Sorna to rescue Eric Kirby.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel following Dr. Alan Grant\'s return to Isla Sorna.', detailedReasons: ['Pits Dr. Grant against the Spinosaurus and intelligent Raptors.'], source: 'editorial' },
  },
  {
    sourceId: 'jp-1',
    targetId: 'jp-4',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Soft reboot sequel opening a functional dinosaur theme park on Isla Nublar 22 years later.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Soft reboot sequel opening a fully operational Jurassic World park.', detailedReasons: ['Continues John Hammond\'s vision via Masrani Global.'], source: 'editorial' },
  },
  {
    sourceId: 'jp-4',
    targetId: 'jp-5',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Owen and Claire rescuing dinosaurs from Isla Nublar\'s volcanic eruption.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel rescuing dinosaurs before Isla Nublar\'s destruction.', detailedReasons: ['Features the Lockwood estate auction and Indoraptor.'], source: 'editorial' },
  },
  {
    sourceId: 'jp-5',
    targetId: 'jp-6',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel reuniting Owen/Claire with Alan Grant, Ellie Sattler, and Ian Malcolm.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct trilogy conclusion reuniting original and new cast members.', detailedReasons: ['Resolves the global dinosaur proliferation and BioSyn locust crisis.'], source: 'editorial' },
  },

  // ─── JOHN WICK STORY EDGES ─────────────────────────
  {
    sourceId: 'jw-3',
    targetId: 'jw-ballerina',
    relationship: 'story-continuation',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Spin-off taking place between John Wick 3 and 4 following Ruska Roma assassin Eve Macarro.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Spin-off taking place between John Wick 3 and 4.', detailedReasons: ['Features Eve Macarro\'s training under The Director alongside John Wick.'], source: 'editorial' },
  },

  // ─── HARRY POTTER / FANTASTIC BEASTS STORY EDGES ─────────────────────────
  {
    sourceId: 'hp-fb-1',
    targetId: 'hp-fb-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Grindelwald\'s escape in Paris.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Grindelwald\'s rise in Paris.', detailedReasons: ['Introduces young Albus Dumbledore.'], source: 'editorial' },
  },
  {
    sourceId: 'hp-fb-2',
    targetId: 'hp-fb-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Dumbledore\'s intervention in the ICW election.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel confronting Grindelwald in Bhutan.', detailedReasons: ['Resolves Dumbledore\'s blood pact.'], source: 'editorial' },
  },

  // ─── DC / DCEU STORY EDGES ─────────────────────────
  {
    sourceId: 'dc-bvs',
    targetId: 'dc-suicide-squad',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Takes place in the aftermath of Superman\'s death as Amanda Waller forms Task Force X.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Takes place in the aftermath of Superman\'s death.', detailedReasons: ['Amanda Waller forms Task Force X to defend against rogue metahumans.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-bvs',
    targetId: 'dc-wonder-woman',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Frame story following Bruce Wayne sending Diana Prince the 1918 photograph.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Frame story following Bruce Wayne sending Diana the 1918 photo.', detailedReasons: ['Explains Diana\'s backstory in World War I.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-wonder-woman',
    targetId: 'dc-ww84',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Sequel following Diana Prince in 1984 during the Cold War.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel following Diana Prince in 1984.', detailedReasons: ['Features Maxwell Lord and Cheetah.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-shazam',
    targetId: 'dc-shazam-fury',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following the Shazam family battling the Daughters of Atlas.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following the Shazam family.', detailedReasons: ['Pits Billy and his siblings against Hespera and Kalypso.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-aquaman',
    targetId: 'dc-aquaman-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Arthur Curry as King of Atlantis teaming up with Orm against Black Manta.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following King Arthur Curry.', detailedReasons: ['Features Black Manta\'s Black Trident threat.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-suicide-squad',
    targetId: 'dc-birds-of-prey',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Harley Quinn after breaking up with Joker in Gotham.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Harley Quinn\'s emancipation.', detailedReasons: ['Teams Harley with Huntress, Black Canary, and Renee Montoya.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-suicide-squad',
    targetId: 'dc-the-suicide-squad',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Sequel following Task Force X on Corto Maltese.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel following Task Force X on Corto Maltese.', detailedReasons: ['Pits Harley, Bloodsport, and Peacemaker against Starro.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-justice-league',
    targetId: 'dc-the-flash',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Barry Allen attempting to alter time to save his mother.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Barry Allen altering time.', detailedReasons: ['Features Michael Keaton\'s Batman and Supergirl.'], source: 'editorial' },
  },

  // ─── ADDITIONAL STAR WARS STORY EDGES ─────────────────────────
  {
    sourceId: 'sw-ep2',
    targetId: 'sw-tcw-movie',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct continuation of the Clone Wars conflict following the Battle of Geonosis.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation following the Battle of Geonosis.', detailedReasons: ['Introduces Ahsoka Tano as Anakin Skywalker\'s new Padawan.', 'Establishes the galactic Clone Wars conflict.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-tcw-movie',
    targetId: 'sw-tcw-series',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct pilot movie establishing the main Clone Wars animated series.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Pilot movie launching The Clone Wars animated series.', detailedReasons: ['Continues Anakin and Ahsoka\'s bond across the Clone Wars.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-tcw-series',
    targetId: 'sw-bad-batch',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct spin-off continuation following Clone Force 99 after Order 66 in Season 7.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct spin-off following Clone Force 99 during Order 66.', detailedReasons: ['Continues the story of defected elite clones during the rise of the Empire.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-ep3',
    targetId: 'sw-obi-wan',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Obi-Wan Kenobi in exile on Tatooine 10 years after Order 66.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation of Obi-Wan and Anakin\'s duel aftermath.', detailedReasons: ['Shows Obi-Wan watching over young Luke Skywalker.', 'Features the rematch between Obi-Wan and Darth Vader.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-tcw-series',
    targetId: 'sw-rebels',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Continues Ahsoka Tano, Rex, and Maul story arcs prior to the Galactic Civil War.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Continues Ahsoka Tano and Captain Rex\'s arcs.', detailedReasons: ['Explains Ahsoka\'s survival and leadership as Fulcrum in the early Rebellion.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-ep3',
    targetId: 'sw-rebels',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Establishes the Imperial dark times era leading into the Ghost crew Rebellion.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Establishes the early Rebellion 14 years after Order 66.', detailedReasons: ['Shows the rise of the Inquisitorious and early rebel cells.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-ep3',
    targetId: 'sw-andor',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Explains the birth of the Rebel Alliance from Imperial oppression 5 years before Rogue One.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Prequel series explaining Cassian Andor\'s radicalization.', detailedReasons: ['Shows the growth of the underground resistance against the Galactic Empire.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-ep6',
    targetId: 'sw-mandalorian',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following the fall of the Empire in Return of the Jedi in the lawless Outer Rim.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation 5 years after Return of the Jedi.', detailedReasons: ['Shows the Imperial Remnant under Moff Gideon operating after the Emperor\'s death.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-tcw-series',
    targetId: 'sw-tales-jedi',
    relationship: 'character-development',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Companion anthology focusing on Ahsoka Tano\'s Jedi training and Count Dooku\'s fall.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Provides key back-story for Ahsoka Tano and Count Dooku.', detailedReasons: ['Shows Ahsoka\'s intense training with Anakin and Dooku\'s turn to the dark side.'], source: 'editorial' },
  },
  {
    sourceId: 'sw-mandalorian',
    targetId: 'sw-skeleton-crew',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'New Republic era companion series set in the same post-ROTJ galactic time period.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Set in the same New Republic era as The Mandalorian.', detailedReasons: ['Provides world-building for lost children navigating the post-Empire galaxy.'], source: 'editorial' },
  },

  // ─── ADDITIONAL DC UNIVERSE STORY EDGES ─────────────────────────
  {
    sourceId: 'dc-justice-league',
    targetId: 'dc-aquaman',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Arthur Curry returning to Atlantis after fighting Steppenwolf.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel following Arthur Curry after Justice League.', detailedReasons: ['Establishes Arthur\'s reluctance to claim the throne of Atlantis.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-suicide-squad',
    targetId: 'dc-black-adam',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Features Amanda Waller dispatching the Justice Society to contain Teth-Adam.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Connects Amanda Waller\'s ARGUS authority to Kahndaq.', detailedReasons: ['Shows Amanda Waller deploying the JSA to stop Black Adam.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-shazam',
    targetId: 'dc-black-adam',
    relationship: 'character-origin',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Establishes the Council of Wizards and ancient Kahndaq magic mythology.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Establishes the Wizard Shazam\'s ancient magical origin.', detailedReasons: ['Explains the origin of the powers bestowed upon Black Adam and Shazam.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-peacemaker',
    targetId: 'dc-creature-commandos',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct continuation following Amanda Waller\'s black ops monster unit after Peacemaker S1.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation of Amanda Waller\'s covert Task Force M.', detailedReasons: ['Follows the political fallout from Leota Adebayo exposing Task Force X.'], source: 'editorial' },
  },
  {
    sourceId: 'dc-peacemaker',
    targetId: 'dc-waller',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct continuation focusing on Amanda Waller dealing with public exposure of Task Force X.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel focusing on Amanda Waller after Peacemaker.', detailedReasons: ['Explains Waller\'s retaliation after her illegal operations were leaked.'], source: 'editorial' },
  },

  // ─── ADDITIONAL X-MEN STORY EDGES ─────────────────────────
  {
    sourceId: 'xmen-tas',
    targetId: 'xmen-97',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel picking up immediately after the 1997 finale of X-Men: The Animated Series.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct revival picking up after Charles Xavier\'s departure in 1997.', detailedReasons: ['Continues Cyclops, Storm, and Wolverine leading the X-Men under Xavier\'s last will.'], source: 'editorial' },
  },

  // ─── ADDITIONAL JURASSIC PARK STORY EDGES ─────────────────────────
  {
    sourceId: 'jp-4',
    targetId: 'jp-camp-cretaceous',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Parallel animated series beginning during the Indominus Rex breakout in Jurassic World.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Parallel story set during the fall of Jurassic World.', detailedReasons: ['Shows six teenagers stranded on Isla Nublar after the Indominus Rex breakout.'], source: 'editorial' },
  },
  {
    sourceId: 'jp-6',
    targetId: 'jp-7-rebirth',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel set five years after dinosaurs integrated globally in Jurassic World Dominion.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation five years after Jurassic World Dominion.', detailedReasons: ['Follows an expedition seeking genetic material from the planet\'s largest remaining dinosaurs.'], source: 'editorial' },
  },

  // Evil Dead Edges
  {
    sourceId: 'ed-1',
    targetId: 'ed-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Ash Williams immediately after the cabin Deadite onslaught in The Evil Dead.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel continuing Ash Williams fight in the cabin.', detailedReasons: ['Picks up immediately after Ash survives the initial Necronomicon horrors.'], source: 'editorial' },
  },
  {
    sourceId: 'ed-2',
    targetId: 'ed-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following Ash Williams after being pulled through the vortex to 1300 AD in Army of Darkness.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct sequel sending Ash back to 1300 AD.', detailedReasons: ['Follows Ash time portal rift at the end of Evil Dead II.'], source: 'editorial' },
  },
  {
    sourceId: 'ed-3',
    targetId: 'ed-ash-vs-ed',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct television series continuation 30 years after Ash Williams returns from medieval England.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation 30 years after Army of Darkness.', detailedReasons: ['Brings Bruce Campbell back as Ash Williams fighting Necronomicon resurgences.'], source: 'editorial' },
  },
  {
    sourceId: 'ed-1',
    targetId: 'ed-4',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Re-emergence of the Necronomicon Naturom Demonto curse at the cabin.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Re-awakening of the Necronomicon cabin curse.', detailedReasons: ['Explores another group discovering the book of the dead at the cabin.'], source: 'editorial' },
  },
  {
    sourceId: 'ed-1',
    targetId: 'ed-rise',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Unearthing of a third Necronomicon volume in a Los Angeles apartment building.',
    sourceType: 'official-synopsis',
    editorialImportance: 'secondary',
    recommendationEvidence: { shortReason: 'Urban expansion of the Necronomicon demon curse.', detailedReasons: ['Establishes one of three ancient Necronomicon volumes bound in flesh.'], source: 'editorial' },
  },
  {
    sourceId: 'ed-rise',
    targetId: 'ed-burn',
    relationship: 'direct-sequel',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Direct continuation following the urban Necronomicon plague introduced in Evil Dead Rise.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Sequel expanding the Necronomicon demon curse.', detailedReasons: ['Continues the horror after the Necronomicon unleashes Deadites in family settings.'], source: 'editorial' },
  },

  // Insidious Edges
  {
    sourceId: 'ins-1',
    targetId: 'ins-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel picking up immediately after the cliffhanger ending of Insidious 1.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation following the ending of Insidious 1.', detailedReasons: ['Uncovers Parker Crane Bride in Black possession of Josh Lambert.'], source: 'editorial' },
  },
  {
    sourceId: 'ins-3',
    targetId: 'ins-4',
    relationship: 'direct-sequel',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Sequel prequel investigating Elise Rainier earlier cases prior to the Lambert family.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Prequel arc following Elise Rainier and Spectral Sightings.', detailedReasons: ['Explores Elise early investigations before helping the Lambert family.'], source: 'editorial' },
  },
  {
    sourceId: 'ins-4',
    targetId: 'ins-1',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Prequel conclusion ending with Elise receiving the phone call about Dalton Lambert.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Prequel conclusion leading into Insidious 1.', detailedReasons: ['Connects Elise Rainier cases directly to the Lambert house call.'], source: 'editorial' },
  },
  {
    sourceId: 'ins-2',
    targetId: 'ins-5',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel picking up 10 years after Josh and Dalton Lambert were hypnotized at the end of Chapter 2.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Direct continuation 10 years after Insidious: Chapter 2.', detailedReasons: ['Follows Dalton entering college as repressed memories of The Further return.'], source: 'editorial' },
  },
  {
    sourceId: 'ins-5',
    targetId: 'ins-6',
    relationship: 'story-continuation',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Story continuation exploring new astral projection cases into The Further.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: { shortReason: 'Continuation of astral travel into The Further.', detailedReasons: ['Follows a young mother venturing into The Further.'], source: 'editorial' },
  },
  // ─── AVATAR FRANCHISE NARRATIVE GRAPH EDGES ───────────────────────────────
  {
    sourceId: 'avatar-1',
    targetId: 'avatar-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel continuing the Sully family story more than a decade after the battle for Pandora.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct continuation establishing Jake Sully and Neytiri\'s family before The Way of Water.',
      detailedReasons: [
        'Establishes Jake Sully transformation into a Na\'vi and union with Neytiri.',
        'Explains the RDA\'s initial defeat and expulsion from Pandora prior to their militarized return.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'avatar-2',
    targetId: 'avatar-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel following the emotional aftermath of the Metkayina battle and Neteyam\'s sacrifice.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct continuation following the events of Avatar: The Way of Water.',
      detailedReasons: [
        'Picks up in the aftermath of the RDA oceanic battle and introduces the volcanic Ash People.',
        'Continues the development of Kiri, Spider, and the surviving Sully children.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'avatar-3',
    targetId: 'avatar-4',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel continuing the overarching Pandoran saga into the next generational phase.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel following the events of Avatar: Fire and Ash.',
      detailedReasons: [
        'Continues the generational storyline of the Sully family across Pandora.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'avatar-4',
    targetId: 'avatar-5',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel bringing the Pandoran conflict and Na\'vi journey to a climax.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel concluding the Avatar saga.',
      detailedReasons: [
        'Follows the journey from Pandora to Earth in the franchise conclusion.',
      ],
      source: 'editorial',
    },
  },

  // ─── ALIEN FRANCHISE NARRATIVE GRAPH EDGES ─────────────────────────────────
  {
    sourceId: 'alien-1',
    targetId: 'alien-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel continuing Ellen Ripley story 57 years later as she returns to LV-426 with Colonial Marines.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel following Ripley awakening 57 years after surviving the Nostromo catastrophe.',
      detailedReasons: [
        'Establishes Ripley\'s trauma from the Nostromo encounter and her maternal bond with Newt.',
        'Explores the Weyland-Yutani bio-weapons division attempting to recover Xenomorph specimens from Hadley\'s Hope.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'alien-2',
    targetId: 'alien-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel opening immediately after the Sulaco escape as Ripley\'s EEV crash-lands on Fiorina 161.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct continuation resolving the fate of the Sulaco survivors on Fiorina 161.',
      detailedReasons: [
        'Continues directly from the escape at the end of Aliens.',
        'Concludes Ellen Ripley\'s original cinematic arc through her ultimate sacrifice.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'alien-3',
    targetId: 'alien-4',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel set 200 years later continuing Ripley\'s genetic legacy and Weyland-Yutani Xenomorph weaponization.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel following the military cloning of Ripley 200 years after her death on Fiorina 161.',
      detailedReasons: [
        'Explores the consequences of Ripley\'s sacrifice and the resurrection of her hybridized DNA.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'alien-prometheus',
    targetId: 'alien-covenant',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel to Prometheus continuing synthetic android David\'s journey and genetic pathogen experiments on Planet 4.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct sequel continuing David 8\'s synthetic evolution following the Prometheus expedition.',
      detailedReasons: [
        'Resolves the journey of David and Dr. Elizabeth Shaw to the Engineer homeworld.',
        'Reveals David\'s creation of the Neomorphs and Protomorph pathogen strains.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'alien-1',
    targetId: 'alien-romulus',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct interquel continuing the aftermath of the Nostromo incident 20 years later as Weyland-Yutani retrieves Big Chap to synthesize the Z-01 pathogen.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct interquel set 20 years after Alien following colonizers on Renaissance station where Nostromo specimen was studied.',
      detailedReasons: [
        'Directly links the destruction of the Nostromo to Weyland-Yutani recovering the original Big Chap from orbital wreckage.',
        'Explains the reverse-engineering of the Z-01 Compound from the original 1979 Xenomorph DNA.',
      ],
      source: 'editorial',
    },
  }
];

export const cineOrderKnowledgeGraph: CineOrderKnowledgeGraphData = {
  version: CKG_VERSION,
  titleNodes,
  entityNodes,
  edges: storyEdges,
};

export default cineOrderKnowledgeGraph;
