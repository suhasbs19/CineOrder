/**
 * CineOrder AI Advisor Engine v3.0
 * 
 * Intelligence layer that transforms natural language queries into
 * beautifully formatted, structured CineOrder responses backed by the
 * Story Knowledge Graph, traversal engine, catalog data, watch orders, and lifecycle state.
 * 
 * Architecture:
 *   1. Intent Classification → pattern-match user query to structured intent
 *   2. Entity Resolution → fuzzy-match titles, characters, villains, objects, franchises
 *   3. KG Integration → call existing frozen APIs (read-only)
 *   4. Response Builder → assemble rich structured response + context-aware follow-ups
 * 
 * FROZEN FRAMEWORK COMPLIANCE:
 *   This file READS from but never MODIFIES:
 *   - storyGraphEngine.ts / storyKnowledgeGraphEngine.ts
 *   - recommendationEngine.ts / recommendationService.ts
 *   - narrativeScoring.ts
 *   - cineOrderKnowledgeGraph.ts
 */

import { allContent, allFranchises, allWatchOrders } from '@/data/franchises/index';
import { generatePreparationGuide } from '@/lib/preparationGuide';
import {
  cineOrderKnowledgeGraph,
  titleNodes,
  entityNodes,
} from '@/data/cineOrderKnowledgeGraph';
import type { Content, Franchise, WatchOrder } from '@/types';
import type { PreparationGuideData } from '@/types/preparation';
import { formatRuntime, formatDate } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

export type AdvisorIntent =
  | 'prepare_for'
  | 'skip_advice'
  | 'time_budget'
  | 'character_journey'
  | 'character_series'
  | 'franchise_start'
  | 'watch_tonight'
  | 'whats_next'
  | 'compare_orders'
  | 'lore_explain'
  | 'ott_status'
  | 'upcoming'
  | 'general';

export interface ResolvedEntity {
  type: 'title' | 'character' | 'villain' | 'organization' | 'object' | 'franchise' | 'lore';
  id: string;
  name: string;
  content?: Content;
  franchise?: Franchise;
}

export interface ConversationContext {
  lastIntent?: AdvisorIntent;
  lastEntity?: ResolvedEntity;
  lastFranchise?: string;
  lastTitleId?: string;
  turnCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: ResponseMetadata;
  spoilersRevealed?: boolean;
}

export interface ResponseMetadata {
  type: AdvisorIntent;
  intent: AdvisorIntent;
  resolvedEntities: ResolvedEntity[];
  targetContent?: Content;
  preparationData?: PreparationGuideData;
  importance?: string;
  storyReadiness?: number;
  seriesData?: {
    title: string;
    franchiseName: string;
    movies: Content[];
    recommendedOrder: Content[];
  };
  timePlan?: {
    budgetMinutes: number;
    recommendedTitles: Content[];
    totalMinutes: number;
    storyCoveragePercentage: number;
    remainingTitlesCount: number;
  };
  characterData?: {
    name: string;
    franchise: string;
    description: string;
    appearances: Content[];
    keyEvents: string[];
    entityId?: string;
  };
  villainData?: {
    name: string;
    franchise: string;
    threatLevel: string;
    description: string;
    appearances: Content[];
    keyEvents: string[];
    entityId?: string;
  };
  loreData?: {
    term: string;
    franchise: string;
    explanation: string;
    relatedTitles: Content[];
  };
  skipData?: {
    targetTitle: Content;
    isSafeToSkip: boolean;
    storyImpactPercentage: number;
    dependentTitles: string[];
    reasoning: string;
  };
  watchOrders?: {
    release: Content[];
    chronological: Content[];
  };
  ottData?: {
    title: Content;
    isAvailable: boolean;
    providers: string[];
  };
  upcomingData?: {
    titles: Content[];
  };
  franchiseStartData?: {
    franchise: Franchise;
    entryPoints: Content[];
    totalTitles: number;
    totalRuntime: number;
  };
  whatToWatchData?: {
    suggestions: Content[];
    basedOn: string;
  };
  spoilerContent?: string;
  followUpSuggestions?: string[];
}

// ═══════════════════════════════════════════════════════════════════════
// CONVERSATION CONTEXT (SESSION STATE)
// ═══════════════════════════════════════════════════════════════════════

let sessionContext: ConversationContext = {
  turnCount: 0,
};

export function resetConversationContext(): void {
  sessionContext = { turnCount: 0 };
}

export function getConversationContext(): ConversationContext {
  return { ...sessionContext };
}

// ═══════════════════════════════════════════════════════════════════════
// INTENT CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════

interface IntentPattern {
  intent: AdvisorIntent;
  patterns: RegExp[];
  keywords: string[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'prepare_for',
    patterns: [
      /(?:prepare|get ready|watch before|what.*watch.*before|prerequisites?\s+for|prep\s+(?:me\s+)?for)/i,
      /(?:what do i need.*(?:before|watch)|ready for|catch up.*for)/i,
    ],
    keywords: ['prepare', 'before', 'prerequisite', 'get ready', 'catch up for', 'prep for', 'prep me'],
  },
  {
    intent: 'skip_advice',
    patterns: [
      /(?:can i skip|should i skip|is .* skippable|skip .+|do i need to watch|is .* necessary|is .* required|is .* optional)/i,
      /(?:safe to skip|skip(?:ping)?)/i,
    ],
    keywords: ['skip', 'skippable', 'necessary', 'need to watch', 'can i skip', 'should i skip'],
  },
  {
    intent: 'whats_next',
    patterns: [
      /(?:what.*(?:after|next after|comes after|follow)|sequel|continuation|after (?:watching|finishing))/i,
      /(?:what should i watch after|what to watch after|next title after)/i,
    ],
    keywords: ['after', 'next after', 'comes after', 'sequel', 'continuation', 'after watching', 'what should i watch after'],
  },
  {
    intent: 'character_series',
    patterns: [
      /(?:movies|films|trilogy|quadrilogy|series|all movies)\b/i,
      /(?:list|show|all)\s+.+\s+(?:movies|films|trilogy)/i,
    ],
    keywords: ['movies', 'films', 'trilogy', 'movie series', 'film series', 'all films', 'all movies'],
  },
  {
    intent: 'time_budget',
    patterns: [
      /(\d+)\s*(?:hour|hr|hours|h)\b/i,
      /(?:time budget|only have|limited time|marathon|binge|how long|how much time)/i,
    ],
    keywords: ['hour', 'hours', 'time budget', 'only have', 'limited time', 'marathon', 'binge'],
  },
  {
    intent: 'character_journey',
    patterns: [
      /(?:show|tell me about|journey|roadmap|arc|story of|timeline of|path of)\s+.+(?:journey|roadmap|arc|story|timeline|path)?/i,
      /(?:character|hero)\s+(?:journey|arc|roadmap|timeline)/i,
    ],
    keywords: ['journey', 'roadmap', 'arc', 'character story', 'timeline of'],
  },
  {
    intent: 'franchise_start',
    patterns: [
      /(?:where.*start|how.*start|begin(?:ning)?|first.*watch|new to|getting into|start(?:ing)? with)/i,
      /(?:never (?:seen|watched)|beginner|newcomer|entry point)/i,
    ],
    keywords: ['where to start', 'how to start', 'begin', 'new to', 'getting into', 'entry point', 'never seen'],
  },
  {
    intent: 'watch_tonight',
    patterns: [
      /(?:what.*watch\s*(?:tonight|today|now|next)|suggest|recommend me|pick .* for me|what.*next)/i,
    ],
    keywords: ['watch tonight', 'watch today', 'suggest', 'recommend me', 'what to watch', 'pick for me'],
  },
  {
    intent: 'compare_orders',
    patterns: [
      /(?:release.*(?:vs|versus|or|compared).*chronological|chronological.*(?:vs|versus|or|compared).*release|difference.*between.*order|which order)/i,
    ],
    keywords: ['release vs chronological', 'which order', 'difference between', 'release order', 'chronological order'],
  },
  {
    intent: 'lore_explain',
    patterns: [
      /(?:explain|what (?:is|are)|tell me about|lore|meaning of|concept of)/i,
    ],
    keywords: ['explain', 'what is', 'what are', 'lore', 'meaning of'],
  },
  {
    intent: 'ott_status',
    patterns: [
      /(?:stream(?:ing)?|available|where.*watch|\bott\b|disney\+|netflix|prime|hulu|on .+\?)/i,
    ],
    keywords: ['streaming', 'available', 'where to watch', 'disney+', 'netflix', 'stream'],
  },
  {
    intent: 'upcoming',
    patterns: [
      /(?:upcoming|coming soon|new releases|unreleased|future|coming out)/i,
    ],
    keywords: ['upcoming', 'coming soon', 'new releases', 'unreleased', 'future', 'coming out'],
  },
];

function classifyIntent(query: string, history: ChatMessage[]): AdvisorIntent {
  const q = query.toLowerCase().trim();

  // 1. Check explicit query patterns
  for (const { intent, patterns, keywords } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(q)) return intent;
    }
    for (const kw of keywords) {
      if (q.includes(kw)) return intent;
    }
  }

  // 2. Follow-up detection
  const lastAssistant = [...history].reverse().find((m) => m.sender === 'assistant');
  if (lastAssistant?.data?.intent && /^(why|more|details|tell me more|go on|explain)\b/i.test(q)) {
    return lastAssistant.data.intent;
  }

  return 'general';
}

// ═══════════════════════════════════════════════════════════════════════
// ENTITY RESOLUTION
// ═══════════════════════════════════════════════════════════════════════

function fuzzyScore(needle: string, haystack: string): number {
  const n = needle.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const h = haystack.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (h === n) return 1.0;
  if (h.includes(n)) return 0.85;
  if (n.includes(h)) return 0.7;

  const nWords = n.split(/\s+/);
  const hWords = h.split(/\s+/);
  const matchedWords = nWords.filter((w) => hWords.some((hw) => hw.includes(w) || w.includes(hw)));
  if (matchedWords.length > 0) {
    return (matchedWords.length / Math.max(nWords.length, 1)) * 0.6;
  }

  return 0;
}

const LORE_CONCEPTS: Record<string, { term: string; franchise: string; explanation: string; searchKey: string }> = {
  multiverse: {
    term: 'The Multiverse',
    franchise: 'Marvel Cinematic Universe',
    explanation:
      'A vast collection of alternate realities sharing a universal framework. Different timelines branch when key events diverge, creating parallel worlds where alternate versions of characters exist. The Sacred Timeline was enforced by He Who Remains until Sylvie disrupted it, unleashing infinite branches and variants.',
    searchKey: 'multiverse',
  },
  'infinity stones': {
    term: 'The Infinity Stones',
    franchise: 'Marvel Cinematic Universe',
    explanation:
      'Six powerful cosmic gems — Space (Tesseract), Mind (Scepter/Vision), Reality (Aether), Power (Orb), Time (Eye of Agamotto), and Soul — created at the dawn of the universe. Collecting all six in the Infinity Gauntlet grants godlike power over reality itself.',
    searchKey: 'infinity',
  },
  'sacred timeline': {
    term: 'The Sacred Timeline',
    franchise: 'Marvel Cinematic Universe',
    explanation:
      'The single approved timeline maintained by the TVA (Time Variance Authority) under orders from He Who Remains. Any deviation from the Sacred Timeline creates a nexus event and a "variant" that the TVA prunes to prevent dangerous Kang variants from emerging.',
    searchKey: 'loki',
  },
  'infinity saga': {
    term: 'The Infinity Saga',
    franchise: 'Marvel Cinematic Universe',
    explanation:
      "The first major meta-arc of the MCU spanning Phases 1-3 (23 films). It follows the Avengers assembling, Thanos collecting the Infinity Stones, the Snap that erased half of all life, and the heroes' time-traveling counter-mission to reverse the decimation.",
    searchKey: 'avengers',
  },
  'multiverse saga': {
    term: 'The Multiverse Saga',
    franchise: 'Marvel Cinematic Universe',
    explanation:
      'The second major meta-arc of the MCU spanning Phases 4-6. After Loki broke the Sacred Timeline, the Multiverse Saga explores branching realities, variant characters, incursions between universes, and the looming threat of Kang/Doctor Doom.',
    searchKey: 'multiverse',
  },
  'deathly hallows': {
    term: 'The Deathly Hallows',
    franchise: 'Wizarding World',
    explanation:
      'Three legendary magical objects — the Elder Wand (unbeatable), the Resurrection Stone (summons shades of the dead), and the Invisibility Cloak (perfect concealment). Legend says possessing all three makes one the Master of Death.',
    searchKey: 'harry potter',
  },
  horcrux: {
    term: 'Horcruxes',
    franchise: 'Wizarding World',
    explanation:
      "Objects containing fragments of a dark wizard's soul, created through murder. Voldemort split his soul into seven Horcruxes (Diary, Ring, Locket, Cup, Diadem, Nagini, and unknowingly Harry Potter), making him nearly immortal until each was destroyed.",
    searchKey: 'harry potter',
  },
  'the force': {
    term: 'The Force',
    franchise: 'Star Wars',
    explanation:
      'An energy field created by all living things that surrounds, penetrates, and binds the galaxy together. Force-sensitives can harness it for telekinesis, precognition, mind influence, and more. The Light Side empowers Jedi; the Dark Side fuels the Sith.',
    searchKey: 'star wars',
  },
  'high table': {
    term: 'The High Table',
    franchise: 'John Wick',
    explanation:
      'A council of twelve crime lords governing the global underworld assassin ecosystem. They enforce strict rules, blood oaths, and operate through a network of Continental Hotels. Defying the High Table means excommunicado — removal of all services and a global bounty.',
    searchKey: 'john wick',
  },
  'one ring': {
    term: 'The One Ring',
    franchise: 'Middle-earth',
    explanation:
      'Forged by the Dark Lord Sauron in Mount Doom, the One Ring is the master ring that controls all other Rings of Power. It corrupts its bearer over time, grants invisibility, extends life unnaturally, and can only be destroyed where it was made.',
    searchKey: 'lord of the rings',
  },
};

function resolveEntities(query: string): ResolvedEntity[] {
  const q = query.toLowerCase();
  const resolved: ResolvedEntity[] = [];

  // 1. Resolve franchise mentions
  for (const franchise of allFranchises) {
    const fName = franchise.name.toLowerCase();
    const fSlug = franchise.slug.toLowerCase();
    if (
      q.includes(fName) ||
      q.includes(fSlug) ||
      (q.includes('marvel') && fName.includes('marvel')) ||
      (q.includes('star wars') && fName.includes('star wars')) ||
      (q.includes('harry potter') && fName.includes('harry potter')) ||
      (q.includes('dc') && (fName.includes('dc') || fSlug.includes('dceu'))) ||
      (q.includes('transformers') && fName.includes('transformers')) ||
      (q.includes('pirates') && fName.includes('pirates')) ||
      (q.includes('jurassic') && fName.includes('jurassic')) ||
      (q.includes('lord of the rings') && fName.includes('lord of the rings'))
    ) {
      resolved.push({ type: 'franchise', id: franchise.id, name: franchise.name, franchise });
      break;
    }
  }

  // 2. Resolve character / villain / object entity mentions from KG
  for (const [id, entity] of Object.entries(entityNodes)) {
    const entityName = entity.name.toLowerCase();
    const shortNames = entityName.split(/[(/]/)[0]?.trim() || entityName;
    const parenMatch = entityName.match(/\(([^)]+)\)/);
    const alias = parenMatch?.[1]?.trim() || '';

    if (q.includes(shortNames) || (alias && q.includes(alias))) {
      resolved.push({
        type: entity.type as 'character' | 'villain' | 'organization' | 'object',
        id,
        name: entity.name,
      });
    }
  }

  // 3. Resolve title mentions from catalog (fuzzy & exact)
  const titleCandidates: { content: Content; score: number }[] = [];
  for (const content of allContent) {
    const score = fuzzyScore(q, content.title);
    if (score >= 0.5 || q.includes(content.title.toLowerCase())) {
      titleCandidates.push({ content, score: Math.max(score, q.includes(content.title.toLowerCase()) ? 0.95 : score) });
    }
  }
  titleCandidates.sort((a, b) => b.score - a.score);
  for (const candidate of titleCandidates.slice(0, 3)) {
    resolved.push({
      type: 'title',
      id: candidate.content.id,
      name: candidate.content.title,
      content: candidate.content,
    });
  }

  return resolved;
}

function findTargetContent(query: string, entities: ResolvedEntity[]): Content | null {
  const titleEntity = entities.find((e) => e.type === 'title' && e.content);
  if (titleEntity?.content) return titleEntity.content;

  const q = query.toLowerCase();
  const match = allContent.find((c) => q.includes(c.title.toLowerCase()));
  return match || null;
}

function findFranchise(query: string, entities: ResolvedEntity[]): Franchise | null {
  const franchiseEntity = entities.find((e) => e.type === 'franchise' && e.franchise);
  if (franchiseEntity?.franchise) return franchiseEntity.franchise;

  const titleEntity = entities.find((e) => e.type === 'title' && e.content);
  if (titleEntity?.content) {
    return allFranchises.find((f: Franchise) => f.id === titleEntity.content!.franchise_id) || null;
  }

  const q = query.toLowerCase();
  if (q.includes('marvel') || q.includes('mcu') || q.includes('avenger'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('marvel')) || null;
  if (q.includes('star wars') || q.includes('jedi') || q.includes('sith'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('star wars')) || null;
  if (q.includes('harry potter') || q.includes('hogwarts') || q.includes('wizard'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('harry potter')) || null;
  if (q.includes('dc') || q.includes('batman') || q.includes('superman'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('dc')) || null;
  if (q.includes('lord of the rings') || q.includes('lotr') || q.includes('middle'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('lord of the rings')) || null;
  if (q.includes('john wick'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('john wick')) || null;
  if (q.includes('transformers'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('transformers')) || null;
  if (q.includes('pirates'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('pirates')) || null;
  if (q.includes('jurassic'))
    return allFranchises.find((f: Franchise) => f.name.toLowerCase().includes('jurassic')) || null;

  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// KG QUERY HELPERS
// ═══════════════════════════════════════════════════════════════════════

function findCharacterAppearances(characterName: string): Content[] {
  const charLower = characterName.toLowerCase();
  const matchingTitleIds: string[] = [];

  for (const [id, node] of Object.entries(titleNodes)) {
    const chars = node.characters.map((c) => c.toLowerCase());
    if (chars.some((c) => c.includes(charLower) || charLower.includes(c))) {
      matchingTitleIds.push(id);
    }
  }

  return matchingTitleIds
    .map((id) => allContent.find((c) => c.id === id))
    .filter((c): c is Content => c !== null && c !== undefined)
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
}

function findVillainAppearances(villainName: string): Content[] {
  const villainLower = villainName.toLowerCase();
  const matchingTitleIds: string[] = [];

  for (const [id, node] of Object.entries(titleNodes)) {
    const villains = node.villains.map((v) => v.toLowerCase());
    if (villains.some((v) => v.includes(villainLower) || villainLower.includes(v))) {
      matchingTitleIds.push(id);
    }
  }

  return matchingTitleIds
    .map((id) => allContent.find((c) => c.id === id))
    .filter((c): c is Content => c !== null && c !== undefined)
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
}

function findDependentTitles(contentId: string): { title: string; id: string; relationship: string }[] {
  const edges = cineOrderKnowledgeGraph.edges;
  return edges
    .filter((e) => e.sourceId === contentId && (e.strength === 'required' || e.strength === 'strong'))
    .map((e) => {
      const targetNode = titleNodes[e.targetId];
      return {
        title: targetNode?.title || e.targetId,
        id: e.targetId,
        relationship: e.relationship,
      };
    });
}

function analyzeSkipSafety(contentId: string): {
  isSafe: boolean;
  impactPercentage: number;
  dependentTitles: string[];
  reasoning: string;
} {
  const edges = cineOrderKnowledgeGraph.edges;

  const outgoing = edges.filter((e) => e.sourceId === contentId);
  const requiredBy = outgoing.filter((e) => e.strength === 'required');
  const strongBy = outgoing.filter((e) => e.strength === 'strong');

  const dependentTitles = [...requiredBy, ...strongBy].map((e) => {
    const node = titleNodes[e.targetId];
    return node?.title || e.targetId;
  });

  const titleNode = titleNodes[contentId];
  const titleName = titleNode?.title || contentId;

  if (requiredBy.length > 2) {
    return {
      isSafe: false,
      impactPercentage: Math.max(75, Math.min(95, requiredBy.length * 20)),
      dependentTitles,
      reasoning: `**${titleName}** is a critical prerequisite for ${requiredBy.length} titles. Skipping it would leave significant story gaps in key sequels and crossover events.`,
    };
  }

  if (requiredBy.length > 0) {
    return {
      isSafe: false,
      impactPercentage: Math.max(50, Math.min(70, requiredBy.length * 25)),
      dependentTitles,
      reasoning: `**${titleName}** is directly required by ${requiredBy.length} title${requiredBy.length > 1 ? 's' : ''}. You'd miss context for: ${dependentTitles.slice(0, 3).join(', ')}.`,
    };
  }

  if (strongBy.length > 0) {
    return {
      isSafe: true,
      impactPercentage: Math.min(15, strongBy.length * 5),
      dependentTitles,
      reasoning: `**${titleName}** is recommended but not strictly required. You can skip it, though you'll miss enriching context for ${strongBy.length} related title${strongBy.length > 1 ? 's' : ''}.`,
    };
  }

  const isEntryPoint = titleNode?.isEntryPoint;
  return {
    isSafe: true,
    impactPercentage: 5,
    dependentTitles: [],
    reasoning: `**${titleName}** is largely self-contained${isEntryPoint ? ' and serves as an entry point' : ''}. You can safely skip it without impacting understanding of other titles.`,
  };
}

function getFranchiseEntryPoints(franchiseId: string): Content[] {
  const franchiseContent = allContent.filter((c) => c.franchise_id === franchiseId);

  const entryPointIds = Object.entries(titleNodes)
    .filter(([, node]) => node.isEntryPoint)
    .map(([id]) => id);

  const entryPoints = franchiseContent.filter(
    (c) => entryPointIds.includes(c.id) || franchiseContent.indexOf(c) < 3
  );

  return entryPoints.length > 0 ? entryPoints.slice(0, 5) : franchiseContent.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════════
// RESPONSE BUILDERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Handles character sub-series / movie lists (e.g. "iron man movies", "spider-man films", "thor movies")
 */
function buildCharacterSeriesResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const q = query.toLowerCase();
  let subjectName = '';

  if (q.includes('iron man')) {
    subjectName = 'Iron Man';
  } else if (q.includes('spider-man') || q.includes('spiderman')) {
    subjectName = 'Spider-Man';
  } else if (q.includes('captain america')) {
    subjectName = 'Captain America';
  } else if (q.includes('thor')) {
    subjectName = 'Thor';
  } else if (q.includes('avengers')) {
    subjectName = 'Avengers';
  } else if (q.includes('guardians')) {
    subjectName = 'Guardians of the Galaxy';
  } else if (q.includes('ant-man') || q.includes('ant man')) {
    subjectName = 'Ant-Man';
  } else if (q.includes('harry potter')) {
    subjectName = 'Harry Potter';
  } else if (q.includes('john wick')) {
    subjectName = 'John Wick';
  } else if (q.includes('transformers')) {
    subjectName = 'Transformers';
  } else if (q.includes('jurassic')) {
    subjectName = 'Jurassic Park';
  } else if (q.includes('pirates')) {
    subjectName = 'Pirates of the Caribbean';
  } else {
    const cleaned = q.replace(/\b(movies|movie|films|film|trilogy|series|collection|all|show|list)\b/g, '').trim();
    const charEntity = entities.find((e) => e.type === 'character' || e.type === 'title');
    if (charEntity) {
      subjectName = charEntity.name.split('(')[0]?.trim() || charEntity.name;
    } else {
      subjectName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  // Find all movies matching subject
  const subjectLower = subjectName.toLowerCase();
  let matchedMovies = allContent
    .filter((c) => (c.type === 'movie' || c.type === 'animated') && c.title.toLowerCase().includes(subjectLower))
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());

  // Fallback to character appearances if no direct title match
  if (matchedMovies.length === 0) {
    matchedMovies = findCharacterAppearances(subjectName)
      .filter((c) => c.type === 'movie' || c.type === 'animated')
      .slice(0, 6);
  }

  if (matchedMovies.length === 0) {
    return buildGeneralResponse(query, entities, [], msgId, timestamp);
  }

  const franchise = allFranchises.find((f) => f.id === matchedMovies[0]?.franchise_id);
  const franchiseName = franchise?.name || 'the franchise';

  let text = `## ${subjectName} Movies\n\n`;
  text += `Here are the ${subjectName} movies in story order:\n\n`;

  matchedMovies.forEach((m, idx) => {
    text += `### ${idx + 1}. ${m.title}\n`;
    text += `**Release:** ${formatDate(m.release_date)}\n`;
    text += `**Runtime:** ${formatRuntime(m.runtime || 120)}\n`;
    text += `**Status:** ${m.status === 'released' ? 'Released' : (m.status || 'Released')}\n`;
    if (m.ott_available) {
      text += `**Streaming:** Available now\n`;
    }
    text += `\n`;
  });

  text += `**Recommended order**\n`;
  matchedMovies.forEach((m, idx) => {
    text += `${idx + 1}. ${m.title}\n`;
  });

  let followUpSuggestions: string[];
  if (subjectLower.includes('iron man')) {
    followUpSuggestions = [
      'Show full Iron Man order',
      'What should I watch next?',
      'Prepare me for Avengers',
    ];
  } else {
    followUpSuggestions = [
      `Show full ${subjectName} order`,
      `What should I watch after ${matchedMovies[matchedMovies.length - 1]?.title || subjectName}?`,
      `Prepare me for ${matchedMovies[0]?.title || 'the next release'}`,
    ];
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'character_series',
      intent: 'character_series',
      resolvedEntities: entities,
      seriesData: {
        title: `${subjectName} Movies`,
        franchiseName,
        movies: matchedMovies,
        recommendedOrder: matchedMovies,
      },
      followUpSuggestions,
    },
  };
}

function buildPrepareForResponse(
  query: string,
  entities: ResolvedEntity[],
  watchedIds: string[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const target = findTargetContent(query, entities);

  if (!target) {
    return buildFallbackWithHint(
      msgId,
      timestamp,
      entities,
      `I'd love to build a preparation guide, but I couldn't identify the target title. Try asking: **"Prepare me for Avengers: Endgame"** or **"What should I watch before Spider-Man: No Way Home?"**`,
      ['Prepare me for Avengers: Endgame.', 'Prepare me for The Fantastic Four.', 'Where should I start with Marvel?']
    );
  }

  const prepData = generatePreparationGuide(target.id, watchedIds);

  const mustWatchCount = prepData?.mustWatch.filter((r) => !r.isWatched).length || 0;
  const recommendedCount = prepData?.recommended.filter((r) => !r.isWatched).length || 0;
  const readiness = prepData?.storyReadinessPercentage || 0;

  let text = `## Preparation Guide: ${target.title}\n\n`;

  text += `**Story Readiness:** ${readiness}%\n`;
  text += `**Prep Watch Time:** ${prepData?.formattedWatchTime || 'N/A'}\n\n`;

  if (prepData?.isEntryPoint) {
    text += `**${target.title}** is an entry point — ${prepData.entryPointMessage || 'you can jump right in without mandatory prior watching!'}\n\n`;
  } else {
    text += `${target.title} is an essential chapter in the story arc. Watching key prerequisites guarantees full context for character motivations and major plot points.\n\n`;
  }

  if (prepData?.mustWatch && prepData.mustWatch.length > 0) {
    text += `### Essential Prerequisites:\n`;
    prepData.mustWatch.forEach((rec, idx) => {
      text += `${idx + 1}. **${rec.content.title}** — ${rec.reason}\n`;
    });
    text += `\n`;
  }

  if (prepData?.recommended && prepData.recommended.length > 0) {
    text += `### Recommended Enhancements:\n`;
    prepData.recommended.slice(0, 3).forEach((rec, idx) => {
      text += `${idx + 1}. **${rec.content.title}** — ${rec.reason}\n`;
    });
    text += `\n`;
  }

  if (mustWatchCount === 0 && recommendedCount === 0) {
    text += `You are 100% prepared! No unwatched prerequisites remain for this title.`;
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'prepare_for',
      intent: 'prepare_for',
      resolvedEntities: entities,
      targetContent: target,
      preparationData: prepData || undefined,
      storyReadiness: readiness,
      followUpSuggestions: [
        `Show essential movies`,
        `Full preparation order`,
        `Give me a shorter version`,
      ],
    },
  };
}

function buildSkipAdviceResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const target = findTargetContent(query, entities);

  if (!target) {
    return buildFallbackWithHint(
      msgId,
      timestamp,
      entities,
      `Which title are you thinking of skipping? Try: **"Can I skip Eternals?"** or **"Is Loki necessary?"**`,
      ['Can I skip Eternals?', 'Can I skip Loki?', 'Is The Incredible Hulk required?']
    );
  }

  const analysis = analyzeSkipSafety(target.id);

  let text = `## Skip Advice: ${target.title}\n\n`;
  text += `**Verdict:** ${analysis.isSafe ? 'Safe to skip' : 'Not recommended to skip'}\n`;
  text += `**Story Impact:** ${analysis.impactPercentage}%\n\n`;
  text += `${analysis.reasoning}\n\n`;

  if (analysis.dependentTitles.length > 0) {
    text += `**Key affected titles:** ${analysis.dependentTitles.slice(0, 4).join(', ')}`;
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'skip_advice',
      intent: 'skip_advice',
      resolvedEntities: entities,
      targetContent: target,
      importance: analysis.isSafe ? 'Skippable' : 'Not Recommended to Skip',
      storyReadiness: 100 - analysis.impactPercentage,
      skipData: {
        targetTitle: target,
        isSafeToSkip: analysis.isSafe,
        storyImpactPercentage: analysis.impactPercentage,
        dependentTitles: analysis.dependentTitles,
        reasoning: analysis.reasoning,
      },
      followUpSuggestions: [
        `Why can I skip it?`,
        `Show required movies`,
        `Continue my watch order`,
      ],
    },
  };
}

function buildWhatsNextResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const target = findTargetContent(query, entities);

  if (!target) {
    return buildFallbackWithHint(
      msgId,
      timestamp,
      entities,
      `Which title did you just finish? Try: **"What comes after Iron Man?"** or **"What should I watch after Avengers: Endgame?"**`,
      ['What comes after Iron Man?', 'What should I watch after Endgame?', "What's next in the MCU?"]
    );
  }

  const dependents = findDependentTitles(target.id);
  const nextTitles = dependents
    .map((d) => allContent.find((c) => c.id === d.id))
    .filter((c): c is Content => c != null);

  const franchise = allFranchises.find((f: Franchise) => f.id === target.franchise_id);
  const releaseOrders = allWatchOrders
    .filter((wo: WatchOrder) => wo.franchise_id === target.franchise_id && wo.order_type === 'release')
    .sort((a: WatchOrder, b: WatchOrder) => a.position - b.position);

  const currentPos = releaseOrders.find((wo: WatchOrder) => wo.content_id === target.id)?.position;
  const releaseNext =
    currentPos != null
      ? releaseOrders
          .filter((wo: WatchOrder) => wo.position > currentPos)
          .slice(0, 3)
          .map((wo: WatchOrder) => allContent.find((c) => c.id === wo.content_id))
          .filter((c): c is Content => c != null)
      : [];

  const allNext = [...new Map([...nextTitles, ...releaseNext].map((c) => [c.id, c])).values()].slice(0, 4);

  const primaryNext = (target.id === 'mcu-iron-man'
    ? allContent.find((c) => c.id === 'mcu-iron-man-2')
    : null) || allNext[0];

  let text = `## What to Watch After ${target.title}\n\n`;

  if (primaryNext) {
    text += `**Recommended next:** **${primaryNext.title}** (${primaryNext.release_date?.slice(0, 4) || 'TBA'})\n\n`;
    text += `**Why:** ${primaryNext.title} continues the story progression from ${target.title} and develops the overarching narrative.\n\n`;
  }

  const alternatives = allNext.filter((alt) => alt.id !== primaryNext?.id);
  if (alternatives.length > 0) {
    text += `**Alternative next steps:**\n`;
    alternatives.slice(0, 3).forEach((alt) => {
      text += `• **${alt.title}** (${alt.release_date?.slice(0, 4) || 'TBA'}) — Next in story line\n`;
    });
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'whats_next',
      intent: 'whats_next',
      resolvedEntities: entities,
      targetContent: target,
      whatToWatchData: {
        suggestions: primaryNext ? [primaryNext, ...alternatives] : allNext,
        basedOn: `Story Graph progression from ${target.title}`,
      },
      followUpSuggestions: [
        primaryNext ? `Prepare me for ${primaryNext.title}` : `Show full ${franchise?.name || 'Marvel Cinematic Universe'} watch order`,
        `Show full ${franchise?.name || 'Marvel Cinematic Universe'} watch order`,
        `What should I watch next?`,
      ],
    },
  };
}

function buildTimeBudgetResponse(
  query: string,
  entities: ResolvedEntity[],
  watchedIds: string[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const hourMatch = query.match(/(\d+)\s*(?:hour|hr|hours|h)\b/i);
  const hours = hourMatch ? parseInt(hourMatch[1] || '6', 10) : 6;
  const budgetMinutes = hours * 60;

  const franchise = findFranchise(query, entities);
  const scope = franchise
    ? allContent.filter((c) => c.franchise_id === franchise.id)
    : allContent;

  const pool = scope
    .filter((c) => c.is_required && c.is_canon && !watchedIds.includes(c.id) && c.status === 'released')
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());

  let accumulated = 0;
  const recommended: Content[] = [];
  for (const c of pool) {
    const runtime = c.runtime || 120;
    if (accumulated + runtime <= budgetMinutes) {
      recommended.push(c);
      accumulated += runtime;
    }
  }

  const coverage = Math.min(100, Math.round((recommended.length / Math.max(1, pool.length)) * 100));
  const franchiseName = franchise?.name || 'CineOrder catalog';

  let text = `## ⏱️ ${hours}-Hour Watch Plan\n\n`;
  text += `**Story Coverage:** ${coverage}%\n`;
  text += `**Watch Time:** ${formatRuntime(accumulated)}\n\n`;
  text += `**${recommended.length} titles** fit your **${hours}h budget** (${formatRuntime(accumulated)} total) from ${franchiseName}.\n\n`;

  if (recommended.length > 0) {
    text += `### Recommended Plan:\n`;
    recommended.slice(0, 5).forEach((c, idx) => {
      text += `${idx + 1}. **${c.title}** (${formatRuntime(c.runtime || 120)})\n`;
    });
    text += `\n`;
  }

  if (pool.length - recommended.length > 0) {
    text += `${pool.length - recommended.length} essential title${pool.length - recommended.length > 1 ? 's' : ''} didn't fit — consider expanding your budget for full narrative coverage.`;
  } else {
    text += `All essential titles fit within your time budget! 🎉`;
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'time_budget',
      intent: 'time_budget',
      resolvedEntities: entities,
      timePlan: {
        budgetMinutes,
        recommendedTitles: recommended,
        totalMinutes: accumulated,
        storyCoveragePercentage: Math.max(coverage, 30),
        remainingTitlesCount: Math.max(0, pool.length - recommended.length),
      },
      followUpSuggestions: [
        hours < 12 ? `Give me a ${hours * 2} hour plan instead.` : 'Show the full watch order.',
        `Can I skip any of these?`,
        franchise ? `Where should I start with ${franchise.name}?` : 'Prepare me for the next MCU release.',
      ],
    },
  };
}

function buildCharacterJourneyResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const charEntity = entities.find((e) => e.type === 'character');
  const villainEntity = entities.find((e) => e.type === 'villain');

  if (villainEntity) {
    return buildVillainJourneyResponse(villainEntity, entities, msgId, timestamp);
  }

  if (!charEntity) {
    const namePatterns = [
      /(?:journey|roadmap|arc|story|timeline)\s+(?:of\s+)?(.+)/i,
      /(?:show|tell me about)\s+(.+?)(?:'s|s')?\s*(?:journey|roadmap|arc|story|timeline)?$/i,
    ];
    let extractedName: string | null = null;
    for (const pattern of namePatterns) {
      const match = query.match(pattern);
      if (match?.[1]) {
        extractedName = match[1].trim();
        break;
      }
    }

    if (extractedName) {
      const appearances = findCharacterAppearances(extractedName);
      if (appearances.length > 0) {
        return buildCharacterCard(extractedName, appearances, entities, msgId, timestamp);
      }
    }

    return buildFallbackWithHint(
      msgId,
      timestamp,
      entities,
      `Which character's journey would you like to explore? Try: **"Show Iron Man's journey"** or **"Tell me about Spider-Man's arc"**`,
      ["Show Iron Man's journey.", "Show Spider-Man's arc.", "Tell me about Thor's story."]
    );
  }

  const appearances = findCharacterAppearances(charEntity.name.split('(')[0]?.trim() || charEntity.name);
  return buildCharacterCard(charEntity.name, appearances, entities, msgId, timestamp);
}

function buildCharacterCard(
  charName: string,
  appearances: Content[],
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const franchise = appearances[0] ? allFranchises.find((f: Franchise) => f.id === appearances[0]!.franchise_id) : null;
  const franchiseName = franchise?.name || 'the franchise';

  const keyArcs = new Set<string>();
  for (const app of appearances) {
    const node = titleNodes[app.id];
    if (node) {
      node.storyArcs.forEach((arc) => keyArcs.add(arc));
    }
  }

  let text = `## ${charName} — Character Journey\n\n`;
  text += `**${appearances.length} appearance${appearances.length > 1 ? 's' : ''}** across ${franchiseName}.\n\n`;
  text += `Key story arcs: ${[...keyArcs].slice(0, 4).join(', ') || 'Core narrative evolution'}\n\n`;

  if (appearances.length > 0) {
    text += `### Key Appearances:\n`;
    appearances.slice(0, 5).forEach((app, idx) => {
      text += `${idx + 1}. **${app.title}** (${app.release_date?.slice(0, 4) || 'TBA'})\n`;
    });
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'character_journey',
      intent: 'character_journey',
      resolvedEntities: entities,
      characterData: {
        name: charName,
        franchise: franchiseName,
        description: `Follow ${charName}'s complete journey across ${franchiseName}, from origin to latest appearance.`,
        appearances: appearances.slice(0, 12),
        keyEvents: [...keyArcs].slice(0, 6),
      },
      followUpSuggestions: [
        `Show full ${charName.split('(')[0]?.trim()} order`,
        `What should I watch next?`,
        `Prepare me for Avengers: Endgame`,
      ],
    },
  };
}

function buildVillainJourneyResponse(
  villainEntity: ResolvedEntity,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const villainName = villainEntity.name.split('(')[0]?.trim() || villainEntity.name;
  const appearances = findVillainAppearances(villainName);
  const franchise = appearances[0] ? allFranchises.find((f: Franchise) => f.id === appearances[0]!.franchise_id) : null;
  const franchiseName = franchise?.name || 'the franchise';

  let text = `## ${villainEntity.name} — Villain Dossier\n\n`;
  text += `**Threat Level:** ${appearances.length > 3 ? 'Multi-Film Threat' : 'Contained Threat'}\n\n`;
  text += `**${appearances.length} appearance${appearances.length > 1 ? 's' : ''}** across ${franchiseName}.\n\n`;

  if (appearances.length > 0) {
    text += `### Key Appearances:\n`;
    appearances.slice(0, 4).forEach((app, idx) => {
      text += `${idx + 1}. **${app.title}** (${app.release_date?.slice(0, 4) || 'TBA'})\n`;
    });
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'character_journey',
      intent: 'character_journey',
      resolvedEntities: entities,
      villainData: {
        name: villainEntity.name,
        franchise: franchiseName,
        threatLevel: appearances.length > 3 ? 'Multi-Film Threat' : 'Contained Threat',
        description: `Antagonist spanning ${appearances.length} title${appearances.length > 1 ? 's' : ''} in ${franchiseName}.`,
        appearances: appearances.slice(0, 10),
        keyEvents: ['First Appearance', 'Major Confrontation', 'Resolution'],
        entityId: villainEntity.id,
      },
      followUpSuggestions: [
        `Which titles are mandatory to understand ${villainName}?`,
        `Can I skip ${villainName}'s early appearances?`,
        `Show the franchise timeline.`,
      ],
    },
  };
}

function buildFranchiseStartResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const franchise = findFranchise(query, entities);

  if (!franchise) {
    const topFranchises = allFranchises.slice(0, 6);
    let text = `## Where to Start?\n\n`;
    text += `I can guide your entry into any cinematic universe! Pick a franchise below to see recommended starting points:\n\n`;
    topFranchises.forEach((f) => {
      text += `• **${f.name}** — ${f.total_movies} movies, ${f.total_series || 0} series\n`;
    });

    return {
      id: msgId,
      sender: 'assistant',
      timestamp,
      text,
      data: {
        type: 'franchise_start',
        intent: 'franchise_start',
        resolvedEntities: entities,
        followUpSuggestions: topFranchises.slice(0, 4).map((f: Franchise) => `Where should I start with ${f.name}?`),
      },
    };
  }

  const entryPoints = getFranchiseEntryPoints(franchise.id);
  const franchiseContent = allContent.filter((c) => c.franchise_id === franchise.id);
  const totalRuntime = franchiseContent.reduce((sum, c) => sum + (c.runtime || 0), 0);

  let text = `## Starting ${franchise.name}\n\n`;
  text += `**Total Titles:** ${franchiseContent.length}\n`;
  text += `**Total Runtime:** ${formatRuntime(totalRuntime)}\n\n`;
  text += `Here are the premier entry points to begin your marathon:\n\n`;

  entryPoints.forEach((c, i) => {
    text += `${i + 1}. **${c.title}** (${c.release_date?.slice(0, 4) || 'TBA'}) — ${formatRuntime(c.runtime || 120)}\n`;
  });

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'franchise_start',
      intent: 'franchise_start',
      resolvedEntities: entities,
      franchiseStartData: {
        franchise,
        entryPoints,
        totalTitles: franchiseContent.length,
        totalRuntime,
      },
      followUpSuggestions: [
        `Prepare me for ${entryPoints[0]?.title || 'the first title'}.`,
        `I only have 8 hours for ${franchise.name}.`,
        `What is the release order for ${franchise.name}?`,
      ],
    },
  };
}

function buildWatchTonightResponse(
  query: string,
  entities: ResolvedEntity[],
  watchedIds: string[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const franchise = findFranchise(query, entities);

  const scope = franchise
    ? allContent.filter((c) => c.franchise_id === franchise.id)
    : allContent;

  const suggestions = scope
    .filter((c) => !watchedIds.includes(c.id) && c.status === 'released' && c.is_canon)
    .sort((a, b) => {
      const aOtt = a.ott_available ? 1 : 0;
      const bOtt = b.ott_available ? 1 : 0;
      if (aOtt !== bOtt) return bOtt - aOtt;
      const aReq = a.is_required ? 1 : 0;
      const bReq = b.is_required ? 1 : 0;
      if (aReq !== bReq) return bReq - aReq;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 4);

  const basedOn = franchise ? franchise.name : 'your unwatched catalog';

  let text = `## What to Watch Tonight\n\n`;
  text += `Here are personalized recommendations based on ${basedOn}, prioritized by streaming availability and story importance:\n\n`;

  if (suggestions.length === 0) {
    text += `You've watched everything available in this selection! 🎉 Check back when new titles release.`;
  } else {
    suggestions.forEach((s, idx) => {
      text += `### ${idx + 1}. ${s.title}\n`;
      text += `**Release:** ${formatDate(s.release_date)}\n`;
      text += `**Runtime:** ${formatRuntime(s.runtime || 120)}\n`;
      text += `**Status:** ${s.status === 'released' ? 'Released' : (s.status || 'Released')}\n`;
      if (s.ott_available) {
        text += `**Streaming:** Available now\n`;
      }
      text += `\n`;
    });
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'watch_tonight',
      intent: 'watch_tonight',
      resolvedEntities: entities,
      whatToWatchData: {
        suggestions,
        basedOn,
      },
      followUpSuggestions: [
        'Pick something short',
        'Start a new franchise',
        'Show trending movies',
      ],
    },
  };
}

function buildCompareOrdersResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const franchise = findFranchise(query, entities);

  if (!franchise) {
    return buildFallbackWithHint(
      msgId,
      timestamp,
      entities,
      `Which franchise's watch orders would you like to compare? Try: **"Release vs chronological for Marvel"**`,
      ['Release vs chronological for Marvel?', 'Which order for Star Wars?', 'Best order for Harry Potter?']
    );
  }

  const releaseOrders = allWatchOrders
    .filter((wo: WatchOrder) => wo.franchise_id === franchise.id && wo.order_type === 'release')
    .sort((a: WatchOrder, b: WatchOrder) => a.position - b.position);
  const chronoOrders = allWatchOrders
    .filter((wo: WatchOrder) => wo.franchise_id === franchise.id && wo.order_type === 'chronological')
    .sort((a: WatchOrder, b: WatchOrder) => a.position - b.position);

  const releaseContent = releaseOrders
    .map((wo: WatchOrder) => allContent.find((c) => c.id === wo.content_id))
    .filter((c): c is Content => c != null);
  const chronoContent = chronoOrders
    .map((wo: WatchOrder) => allContent.find((c) => c.id === wo.content_id))
    .filter((c): c is Content => c != null);

  let text = `## Watch Order Comparison: ${franchise.name}\n\n`;
  text += `**Release Order** — Experience the franchise in the order it was originally presented in theaters. Ideal for first-time viewers.\n\n`;
  text += `**Chronological Order** — Follow events in the universe's internal timeline. Best for rewatches and deep lore connections.\n\n`;
  text += `Both orders contain **${Math.max(releaseContent.length, chronoContent.length)} titles**.`;

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'compare_orders',
      intent: 'compare_orders',
      resolvedEntities: entities,
      watchOrders: {
        release: releaseContent.slice(0, 10),
        chronological: chronoContent.slice(0, 10),
      },
      followUpSuggestions: [
        `Where should I start with ${franchise.name}?`,
        `I only have 10 hours for ${franchise.name}.`,
        `Prepare me for the next ${franchise.name} release.`,
      ],
    },
  };
}

function buildLoreExplainResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const q = query.toLowerCase();

  for (const [key, concept] of Object.entries(LORE_CONCEPTS)) {
    if (q.includes(key)) {
      const relatedTitles = allContent
        .filter((c) => c.title.toLowerCase().includes(concept.searchKey) || c.overview.toLowerCase().includes(concept.searchKey))
        .slice(0, 5);

      const text = `## 📖 ${concept.term}\n\n` + `*${concept.franchise}*\n\n` + concept.explanation;

      return {
        id: msgId,
        sender: 'assistant',
        timestamp,
        text,
        data: {
          type: 'lore_explain',
          intent: 'lore_explain',
          resolvedEntities: entities,
          loreData: {
            term: concept.term,
            franchise: concept.franchise,
            explanation: concept.explanation,
            relatedTitles,
          },
          followUpSuggestions: [
            `Which titles explain ${concept.term} best?`,
            `Prepare me for the next release.`,
            `I only have 6 hours.`,
          ],
        },
      };
    }
  }

  const charEntity = entities.find((e) => e.type === 'character' || e.type === 'villain');
  if (charEntity) {
    return buildCharacterJourneyResponse(query, entities, msgId, timestamp);
  }

  return buildFallbackWithHint(
    msgId,
    timestamp,
    entities,
    `I can explain franchise lore concepts! Try: **"Explain the Multiverse"**, **"What are the Infinity Stones?"**, or **"What is the One Ring?"**`,
    ['Explain the Multiverse.', 'What are the Infinity Stones?', 'Explain Horcruxes.']
  );
}

function buildOttStatusResponse(
  query: string,
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const target = findTargetContent(query, entities);

  if (!target) {
    return buildFallbackWithHint(
      msgId,
      timestamp,
      entities,
      `Which title would you like to check streaming availability for? Try: **"Is Endgame on Disney+?"** or **"Where can I watch Spider-Man?"**`,
      ['Is Endgame streaming?', 'Where can I watch Loki?', "What's on Disney+?"]
    );
  }

  const isAvailable = target.ott_available === true;
  const providers = target.streaming_providers?.map((p) => p.provider_name) || [];

  let text = `## Streaming: ${target.title}\n\n`;
  if (isAvailable) {
    text += `**Streaming:** Available now\n`;
    text += `**Providers:** ${providers.length > 0 ? providers.join(', ') : 'Major streaming platforms'}\n\n`;
    text += `You can stream this title at home right now!`;
  } else {
    text += `**Streaming:** Not currently available\n\n`;
    text += `${target.status === 'released' ? 'This title is theatrically released but not yet available on streaming platforms.' : 'This title has not been released yet.'}`;
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'ott_status',
      intent: 'ott_status',
      resolvedEntities: entities,
      targetContent: target,
      ottData: {
        title: target,
        isAvailable,
        providers,
      },
      followUpSuggestions: [
        `Prepare me for ${target.title}`,
        `What should I watch after ${target.title}?`,
        `What's coming soon?`,
      ],
    },
  };
}

function buildUpcomingResponse(
  entities: ResolvedEntity[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const upcomingTitles = allContent
    .filter((c) => {
      const st = (c.status || '').toLowerCase();
      return st === 'upcoming' || st === 'in_production' || st === 'tba' || st === 'planned';
    })
    .sort((a, b) => {
      if (!a.release_date && !b.release_date) return 0;
      if (!a.release_date) return 1;
      if (!b.release_date) return -1;
      return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
    });

  let text = `## 🔮 Upcoming Releases\n\n`;
  text += `**${upcomingTitles.length} title${upcomingTitles.length !== 1 ? 's' : ''}** are currently in production or scheduled:\n\n`;

  if (upcomingTitles.length === 0) {
    text += 'No upcoming titles currently scheduled. Check back soon!';
  } else {
    upcomingTitles.slice(0, 6).forEach((t) => {
      text += `• **${t.title}** — ${t.release_date ? formatDate(t.release_date) : 'TBA'}\n`;
    });
  }

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'upcoming',
      intent: 'upcoming',
      resolvedEntities: entities,
      upcomingData: {
        titles: upcomingTitles,
      },
      followUpSuggestions:
        upcomingTitles.length > 0
          ? [
              `Prepare me for ${upcomingTitles[0]?.title || 'the next release'}`,
              `Where should I start with Marvel?`,
              `I only have 10 hours`,
            ]
          : ['Where should I start with Marvel?', 'What should I watch tonight?'],
    },
  };
}

function buildFallbackWithHint(
  msgId: string,
  timestamp: string,
  entities: ResolvedEntity[],
  text: string,
  suggestions: string[]
): ChatMessage {
  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'general',
      intent: 'general',
      resolvedEntities: entities,
      followUpSuggestions: suggestions,
    },
  };
}

function buildGeneralResponse(
  query: string,
  entities: ResolvedEntity[],
  watchedIds: string[],
  msgId: string,
  timestamp: string
): ChatMessage {
  const target = findTargetContent(query, entities);
  const franchise = findFranchise(query, entities);

  if (target) {
    const prepData = generatePreparationGuide(target.id, watchedIds);
    const dependents = findDependentTitles(target.id);
    const nextTitle = dependents[0]?.title || (target.id === 'mcu-iron-man' ? 'Iron Man 2' : null);

    let text = `## ${target.title}\n\n`;
    text += `**Release:** ${formatDate(target.release_date)}\n`;
    text += `**Runtime:** ${formatRuntime(target.runtime || 120)}\n`;
    text += `**Status:** ${target.status === 'released' ? 'Released' : (target.status || 'Released')}\n`;
    if (target.ott_available) {
      text += `**Streaming:** Available now\n`;
    }
    if (prepData) {
      text += `**Story Readiness:** ${prepData.storyReadinessPercentage}%\n`;
    }
    text += `\n`;

    if (target.overview) {
      text += `${target.overview}\n\n`;
    } else {
      text += `${target.title} is an important chapter in the story arc.\n\n`;
    }

    if (nextTitle) {
      text += `### What next?\n`;
      text += `→ ${nextTitle}\n`;
    }

    return {
      id: msgId,
      sender: 'assistant',
      timestamp,
      text,
      data: {
        type: 'general',
        intent: 'general',
        resolvedEntities: entities,
        targetContent: target,
        preparationData: prepData || undefined,
        storyReadiness: prepData?.storyReadinessPercentage || undefined,
        followUpSuggestions: [
          `Show full ${target.title.split(':')[0]?.trim() || target.title} order`,
          `What should I watch next?`,
          `Prepare me for Avengers: Endgame`,
        ],
      },
    };
  }

  if (franchise) {
    return buildFranchiseStartResponse(query, entities, msgId, timestamp);
  }

  const text =
    `I'm your **CineOrder AI Movie Advisor**, powered by our **Story Knowledge Graph**.\n\n` +
    `Here's what I can help you with:\n\n` +
    `🎯 **Preparation Guides** — "Prepare me for Endgame"\n` +
    `⏱️ **Time Budgets** — "I only have 8 hours"\n` +
    `🦸 **Character Journeys** — "Show Iron Man's journey"\n` +
    `⏭️ **Skip Advice** — "Can I skip Eternals?"\n` +
    `🏁 **Where to Start** — "Where should I start with Marvel?"\n` +
    `📖 **Lore Explanations** — "Explain the Multiverse"\n` +
    `🍿 **Watch Tonight** — "What should I watch tonight?"`;

  return {
    id: msgId,
    sender: 'assistant',
    timestamp,
    text,
    data: {
      type: 'general',
      intent: 'general',
      resolvedEntities: entities,
      followUpSuggestions: [
        'Where should I start with Marvel?',
        'I only have 6 hours.',
        'Prepare me for Avengers: Endgame.',
        "What's coming soon?",
      ],
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

export function processAIQuery(
  query: string,
  userWatchedIds: string[] = [],
  history: ChatMessage[] = []
): ChatMessage {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = `msg-${Date.now()}`;

  const intent = classifyIntent(query, history);
  const entities = resolveEntities(query);

  if (/\b(it|that|this one)\b/i.test(query) && sessionContext.lastEntity) {
    entities.unshift(sessionContext.lastEntity);
  }

  let response: ChatMessage;

  switch (intent) {
    case 'character_series':
      response = buildCharacterSeriesResponse(query, entities, msgId, timestamp);
      break;
    case 'prepare_for':
      response = buildPrepareForResponse(query, entities, userWatchedIds, msgId, timestamp);
      break;
    case 'skip_advice':
      response = buildSkipAdviceResponse(query, entities, msgId, timestamp);
      break;
    case 'time_budget':
      response = buildTimeBudgetResponse(query, entities, userWatchedIds, msgId, timestamp);
      break;
    case 'character_journey':
      response = buildCharacterJourneyResponse(query, entities, msgId, timestamp);
      break;
    case 'franchise_start':
      response = buildFranchiseStartResponse(query, entities, msgId, timestamp);
      break;
    case 'watch_tonight':
      response = buildWatchTonightResponse(query, entities, userWatchedIds, msgId, timestamp);
      break;
    case 'whats_next':
      response = buildWhatsNextResponse(query, entities, msgId, timestamp);
      break;
    case 'compare_orders':
      response = buildCompareOrdersResponse(query, entities, msgId, timestamp);
      break;
    case 'lore_explain':
      response = buildLoreExplainResponse(query, entities, msgId, timestamp);
      break;
    case 'ott_status':
      response = buildOttStatusResponse(query, entities, msgId, timestamp);
      break;
    case 'upcoming':
      response = buildUpcomingResponse(entities, msgId, timestamp);
      break;
    default:
      response = buildGeneralResponse(query, entities, userWatchedIds, msgId, timestamp);
  }

  sessionContext.turnCount++;
  sessionContext.lastIntent = intent;
  const resolvedTitle = entities.find((e) => e.type === 'title');
  if (resolvedTitle) {
    sessionContext.lastEntity = resolvedTitle;
    sessionContext.lastTitleId = resolvedTitle.id;
  }
  const resolvedFranchise = entities.find((e) => e.type === 'franchise');
  if (resolvedFranchise) {
    sessionContext.lastFranchise = resolvedFranchise.id;
  }

  return response;
}
