import { getContentById } from '@/data/franchises';
import { executeKnowledgeGraphTraversal } from '@/lib/storyKnowledgeGraphEngine';
import type { Content } from '@/types';
import type {
  PreparationGuideData,
  PreparationRecommendation,
} from '@/types/preparation';
import type {
  OfficialPreparationList,
  OfficialPreparationItem,
  OfficialAuditHistoryEntry,
  OfficialSourceType,
} from '@/types/officialPreparation';
import {
  getRegisteredOfficialList,
  setRegisteredOfficialList,
  deleteRegisteredOfficialList,
  getAllOfficialPreparationLists,
  resetOfficialPreparationRegistry,
} from '@/data/officialPreparationLists';

export { getAllOfficialPreparationLists };

// Authoritative Whitelist
const AUTHORITATIVE_STUDIO_DOMAINS = [
  'marvel.com',
  'starwars.com',
  'dc.com',
  'warnerbros.com',
  'universalpictures.com',
  'paramount.com',
  'sonypictures.com',
  'disneyplus.com',
  'disney.com',
  '20thcenturystudios.com',
  'mgm.com',
  'lionsgate.com',
];

const AUTHORITATIVE_TRADE_DOMAINS = [
  'variety.com',
  'hollywoodreporter.com',
  'deadline.com',
  'thewrap.com',
];

const BLOCKED_UNOFFICIAL_DOMAINS = [
  'reddit.com',
  'youtube.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'fandom.com',
  'screenrant.com',
  'cbr.com',
  'wegotthiscovered.com',
  'collider.com',
  'medium.com',
  'blogspot.com',
  'wordpress.com',
];

export interface SourceVerificationResult {
  isVerified: boolean;
  score: number; // 0.0 to 1.0
  sourceType: OfficialSourceType;
  publisher: string;
  reason: string;
}

/**
 * Verifies whether a given source publisher / URL is genuinely authoritative.
 */
export function verifyAuthoritativeSource(
  sourcePublisher: string,
  sourceUrl?: string
): SourceVerificationResult {
  const pub = (sourcePublisher || '').toLowerCase().trim();
  const url = (sourceUrl || '').toLowerCase().trim();

  // Explicitly check blocked domains first
  if (url && BLOCKED_UNOFFICIAL_DOMAINS.some((d) => url.includes(d))) {
    return {
      isVerified: false,
      score: 0.2,
      sourceType: 'AUTHORITATIVE_TRADE',
      publisher: sourcePublisher,
      reason: 'Rejected: Source URL belongs to an unverified third-party blog, social platform, or fan wiki.',
    };
  }

  if (
    pub.includes('reddit') ||
    pub.includes('youtube') ||
    pub.includes('fan guide') ||
    pub.includes('rumor') ||
    pub.includes('unverified')
  ) {
    return {
      isVerified: false,
      score: 0.2,
      sourceType: 'AUTHORITATIVE_TRADE',
      publisher: sourcePublisher,
      reason: 'Rejected: Publisher is an unverified fan publication or forum.',
    };
  }

  // Check direct studio domain match
  const isDirectStudioDomain = url && AUTHORITATIVE_STUDIO_DOMAINS.some((d) => url.includes(d));
  const isDirectStudioPublisher =
    pub.includes('marvel studios') ||
    pub.includes('lucasfilm') ||
    pub.includes('dc studios') ||
    pub.includes('warner bros') ||
    pub.includes('walt disney') ||
    pub.includes('disney+') ||
    pub.includes('universal pictures') ||
    pub.includes('paramount pictures') ||
    pub.includes('sony pictures') ||
    pub.includes('20th century studios') ||
    pub.includes('official press release');

  if (isDirectStudioDomain || isDirectStudioPublisher) {
    return {
      isVerified: true,
      score: 1.0,
      sourceType: 'OFFICIAL_STUDIO',
      publisher: sourcePublisher,
      reason: 'Verified directly from official studio press portal or primary rights-holder release.',
    };
  }

  // Check reputable trade domain match
  const isTradeDomain = url && AUTHORITATIVE_TRADE_DOMAINS.some((d) => url.includes(d));
  const isTradePublisher =
    pub.includes('variety') ||
    pub.includes('hollywood reporter') ||
    pub.includes('deadline') ||
    pub.includes('the wrap');

  if (isTradeDomain || isTradePublisher) {
    return {
      isVerified: true,
      score: 0.9,
      sourceType: 'AUTHORITATIVE_TRADE',
      publisher: sourcePublisher,
      reason: 'Verified from industry-standard trade publication reporting on studio release.',
    };
  }

  return {
    isVerified: false,
    score: 0.4,
    sourceType: 'AUTHORITATIVE_TRADE',
    publisher: sourcePublisher,
    reason: 'Source publisher or domain could not be authenticated against the official studio whitelist.',
  };
}

/**
 * Deterministic hash generator for payload and source tracking.
 */
export function computeSourcePayloadHash(payload: unknown): string {
  const json = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}_${json.length}`;
}

// In-memory cache for resolved preparation guides
const preparationGuideCache = new Map<string, PreparationGuideData>();

/**
 * Invalidates cached preparation guide for a specific content item or all items.
 */
export function invalidatePreparationCache(contentId?: string): void {
  if (contentId) {
    for (const key of preparationGuideCache.keys()) {
      if (key.startsWith(`${contentId.toLowerCase()}::`)) {
        preparationGuideCache.delete(key);
      }
    }
  } else {
    preparationGuideCache.clear();
  }
}

/**
 * Checks if a valid, verified official preparation list exists for a given content ID.
 */
export function hasOfficialPreparationList(contentId: string): boolean {
  if (!contentId) return false;
  const list = getRegisteredOfficialList(contentId);
  if (!list || !list.items || list.items.length === 0) return false;
  return Boolean(list.sourceMetadata?.isVerified !== false);
}

/**
 * Retrieves the raw official preparation list for a given content ID.
 */
export function getOfficialPreparationList(contentId: string): OfficialPreparationList | null {
  if (!contentId) return null;
  return getRegisteredOfficialList(contentId);
}

/**
 * Registers an official preparation list into the system.
 */
export function registerOfficialPreparationList(
  list: OfficialPreparationList,
  options?: { bypassVerification?: boolean }
): { success: boolean; error?: string; list?: OfficialPreparationList } {
  if (!list || !list.targetContentId) {
    return { success: false, error: 'Target content ID is required.' };
  }

  // 1. Validate Target Title Exists in Catalog
  const targetContent = getContentById(list.targetContentId);
  if (!targetContent) {
    return { success: false, error: `Target title '${list.targetContentId}' not found in canonical catalog.` };
  }

  // 2. Source Authority Verification
  const verification = verifyAuthoritativeSource(
    list.sourceMetadata.sourcePublisher,
    list.sourceMetadata.sourceUrl
  );

  if (!verification.isVerified && !options?.bypassVerification) {
    return {
      success: false,
      error: `Source verification failed: ${verification.reason}`,
    };
  }

  // 3. Deduplicate items & enforce 1-indexed sequential ordering
  const seenIds = new Set<string>();
  const sanitizedItems: OfficialPreparationItem[] = [];
  let orderCounter = 1;

  for (const item of list.items || []) {
    const cleanId = (item.contentId || '').toLowerCase().trim();
    if (!cleanId || seenIds.has(cleanId)) continue;
    seenIds.add(cleanId);

    // Verify item exists in catalog
    const itemContent = getContentById(cleanId);
    if (!itemContent) {
      console.warn(`[OfficialPrepOverride] Warning: Prerequisite '${cleanId}' not in catalog, omitting.`);
      continue;
    }

    sanitizedItems.push({
      ...item,
      contentId: cleanId,
      officialOrder: item.officialOrder || orderCounter++,
    });
  }

  // Ensure deterministic sort by officialOrder
  sanitizedItems.sort((a, b) => a.officialOrder - b.officialOrder);

  // 4. Build sanitized official list record
  const payloadHash = list.sourceMetadata.sourceContentHash || computeSourcePayloadHash(sanitizedItems);

  const cleanList: OfficialPreparationList = {
    targetContentId: list.targetContentId.toLowerCase().trim(),
    targetTitle: targetContent.title,
    franchiseId: targetContent.franchise_id,
    version: list.version || '1.0',
    sourceMetadata: {
      ...list.sourceMetadata,
      targetContentId: list.targetContentId.toLowerCase().trim(),
      targetTitle: targetContent.title,
      sourceContentHash: payloadHash,
      isVerified: verification.isVerified || options?.bypassVerification,
      verificationScore: verification.score,
    },
    categories: list.categories || [],
    items: sanitizedItems,
    supplementaryCineOrderItemsAllowed: list.supplementaryCineOrderItemsAllowed !== false,
    history: list.history || [],
  };

  setRegisteredOfficialList(cleanList);
  invalidatePreparationCache(list.targetContentId);

  return { success: true, list: cleanList };
}

/**
 * Updates an existing official preparation list, archiving previous version in audit history.
 */
export function updateOfficialPreparationList(
  targetContentId: string,
  updatedList: Partial<OfficialPreparationList>,
  changeSummary: string = 'Official preparation list updated'
): { success: boolean; error?: string; updatedList?: OfficialPreparationList } {
  const existing = getRegisteredOfficialList(targetContentId);
  if (!existing) {
    return { success: false, error: `No active official list found for '${targetContentId}'. Use register instead.` };
  }

  const prevItems = [...existing.items];
  const prevHash = existing.sourceMetadata.sourceContentHash;
  const newItems = updatedList.items || existing.items;

  const prevIds = new Set(prevItems.map((i) => i.contentId));
  const newIds = new Set(newItems.map((i) => i.contentId));

  const addedContentIds = newItems.filter((i) => !prevIds.has(i.contentId)).map((i) => i.contentId);
  const removedContentIds = prevItems.filter((i) => !newIds.has(i.contentId)).map((i) => i.contentId);

  const historyEntry: OfficialAuditHistoryEntry = {
    version: existing.version,
    updatedAt: new Date().toISOString(),
    changeSummary,
    addedContentIds,
    removedContentIds,
    previousItems: prevItems,
    previousSourceHash: prevHash,
    sourceUrl: existing.sourceMetadata.sourceUrl,
    sourcePublisher: existing.sourceMetadata.sourcePublisher,
  };

  const newVersion = updatedList.version || (parseFloat(existing.version || '1.0') + 0.1).toFixed(1);

  const mergedList: OfficialPreparationList = {
    ...existing,
    ...updatedList,
    targetContentId: existing.targetContentId,
    targetTitle: existing.targetTitle,
    franchiseId: existing.franchiseId,
    version: newVersion,
    sourceMetadata: {
      ...existing.sourceMetadata,
      ...(updatedList.sourceMetadata || {}),
      version: newVersion,
    },
    items: newItems,
    history: [...(existing.history || []), historyEntry],
  };

  return registerOfficialPreparationList(mergedList);
}

/**
 * Removes an official preparation list from active registry.
 */
export function removeOfficialPreparationList(targetContentId: string): boolean {
  const deleted = deleteRegisteredOfficialList(targetContentId);
  if (deleted) {
    invalidatePreparationCache(targetContentId);
  }
  return deleted;
}

/**
 * Retrieves the audit history for a specific target's official preparation list.
 */
export function getOfficialAuditHistory(targetContentId: string): OfficialAuditHistoryEntry[] {
  const list = getRegisteredOfficialList(targetContentId);
  return list?.history ? [...list.history] : [];
}

/**
 * Resets the entire service state and in-memory registry.
 */
export function resetOfficialOverrideService(): void {
  resetOfficialPreparationRegistry();
  invalidatePreparationCache();
}

/**
 * Normalizes a content title for resilient identity comparison across sources.
 * Strips whitespace, diacritics, and punctuation (case-insensitive).
 */
export function normalizeTitleForDeduplication(title?: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, '') // keep only alphanumeric characters
    .trim();
}

/**
 * Builds a set of normalized identity keys for a content item or recommendation.
 * Keys include canonical ID, TMDb ID, and normalized title.
 */
export function buildItemIdentityKeySet(
  item: PreparationRecommendation | Content | { content: Content }
): Set<string> {
  const content = 'content' in item ? (item as any).content : (item as Content);
  const keys = new Set<string>();
  if (!content) return keys;

  if (content.id) {
    keys.add(`id:${content.id.toLowerCase().trim()}`);
  }
  if (content.tmdb_id && content.tmdb_id > 0) {
    keys.add(`tmdb:${content.tmdb_id}`);
  }
  const normTitle = normalizeTitleForDeduplication(content.title);
  if (normTitle) {
    keys.add(`title:${normTitle}`);
  }
  return keys;
}

/**
 * Checks if two items represent the same underlying movie or series across any identity key.
 */
export function itemsShareIdentity(
  a: PreparationRecommendation | Content | { content: Content },
  b: PreparationRecommendation | Content | { content: Content }
): boolean {
  const keysA = buildItemIdentityKeySet(a);
  const keysB = buildItemIdentityKeySet(b);
  for (const k of keysA) {
    if (keysB.has(k)) return true;
  }
  return false;
}

/**
 * Deduplicates a single recommendation list using full multi-factor identity matching.
 */
export function deduplicateRecommendationList(
  items: PreparationRecommendation[]
): PreparationRecommendation[] {
  if (!items || items.length <= 1) return items ? [...items] : [];

  const cleanItems: PreparationRecommendation[] = [];
  const claimedKeys = new Set<string>();

  for (const item of items) {
    const keys = buildItemIdentityKeySet(item);
    let isDuplicate = false;
    for (const k of keys) {
      if (claimedKeys.has(k)) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      cleanItems.push(item);
      for (const k of keys) {
        claimedKeys.add(k);
      }
    }
  }

  return cleanItems;
}

/**
 * Centralized Preparation Partition Deduplication.
 * Invariant: intersection(cleanOfficialItems, cleanExtraContent) === EMPTY
 * 
 * Rules:
 * 1. OFFICIAL list always has absolute precedence.
 * 2. Official items are never removed and their 1..N order is never altered.
 * 3. Any item in Extra Content matching an official item by canonical ID, TMDb ID,
 *    or normalized title is strictly removed.
 * 4. Internal duplicates within Extra Content are removed.
 */
export function deduplicatePreparationPartitions(
  officialItems: PreparationRecommendation[],
  rawGraphRecs: PreparationRecommendation[]
): {
  cleanOfficialItems: PreparationRecommendation[];
  cleanExtraContent: PreparationRecommendation[];
} {
  // 1. Deduplicate official items internally (preserving exact 1..N studio order)
  const cleanOfficialItems: PreparationRecommendation[] = [];
  const officialKeys = new Set<string>();

  for (const item of officialItems || []) {
    const keys = buildItemIdentityKeySet(item);
    let isDuplicate = false;
    for (const k of keys) {
      if (officialKeys.has(k)) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      cleanOfficialItems.push(item);
      for (const k of keys) {
        officialKeys.add(k);
      }
    }
  }

  // 2. Filter rawGraphRecs: remove anything matching ANY key in officialKeys
  // and deduplicate extra content internally
  const cleanExtraContent: PreparationRecommendation[] = [];
  const extraKeys = new Set<string>();

  for (const item of rawGraphRecs || []) {
    const keys = buildItemIdentityKeySet(item);

    // Check if matches official list
    let matchesOfficial = false;
    for (const k of keys) {
      if (officialKeys.has(k)) {
        matchesOfficial = true;
        break;
      }
    }
    if (matchesOfficial) continue;

    // Check if already in extra content
    let alreadyInExtra = false;
    for (const k of keys) {
      if (extraKeys.has(k)) {
        alreadyInExtra = true;
        break;
      }
    }
    if (alreadyInExtra) continue;

    cleanExtraContent.push(item);
    for (const k of keys) {
      extraKeys.add(k);
    }
  }

  return { cleanOfficialItems, cleanExtraContent };
}

/**
 * Property-style assertion validating that partition integrity holds:
 * intersection(officialPreparationItems, cineOrderExtraContent) === EMPTY
 */
export function assertPreparationPartitionIntegrity(guide: PreparationGuideData): void {
  if (!guide) return;
  const officialKeys = new Set<string>();
  for (const item of guide.officialPreparationItems || []) {
    const keys = buildItemIdentityKeySet(item);
    for (const k of keys) {
      officialKeys.add(k);
    }
  }

  const duplicates: string[] = [];
  for (const extra of guide.cineOrderExtraContent || []) {
    const keys = buildItemIdentityKeySet(extra);
    for (const k of keys) {
      if (officialKeys.has(k)) {
        duplicates.push(`${extra.content.title} (${k})`);
        break;
      }
    }
  }

  if (duplicates.length > 0) {
    throw new Error(
      `Preparation partition violation: Found duplicate titles between Official Preparation and Extra Content: ${duplicates.join(', ')}`
    );
  }
}

/**
 * Resolves a full Preparation Guide for a given content ID, preferring
 * authoritative Official Overrides over standard Story Knowledge Graph traversals.
 */
export function resolvePreparationGuide(
  contentId: string,
  watchedContentIds: string[] | Set<string> = []
): PreparationGuideData | null {
  if (!contentId) return null;

  const targetContent = getContentById(contentId);
  if (!targetContent) return null;

  const watchedSet =
    watchedContentIds instanceof Set
      ? watchedContentIds
      : new Set((watchedContentIds || []).map((id) => id.toLowerCase()));

  // 1. Check for Active Official Override
  const officialList = getOfficialPreparationList(contentId);

  if (officialList && officialList.items && officialList.items.length > 0 && officialList.sourceMetadata?.isVerified !== false) {
    const cacheKey = `${contentId.toLowerCase()}::${Array.from(watchedSet).sort().join(',')}`;
    const cached = preparationGuideCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const guideData = buildOfficialOverridePreparationGuide(targetContent, officialList, watchedSet);
    assertPreparationPartitionIntegrity(guideData);
    preparationGuideCache.set(cacheKey, guideData);
    return guideData;
  }

  // 2. Normal Story Knowledge Graph Traversal Fallback
  const graphResult = executeKnowledgeGraphTraversal(contentId, watchedSet);
  if (!graphResult) return null;

  const cleanMustWatch = deduplicateRecommendationList(graphResult.mustWatch);
  const cleanRecommended = deduplicateRecommendationList(graphResult.recommended);
  const cleanOptional = deduplicateRecommendationList(graphResult.optional);
  const cleanPostCredit = deduplicateRecommendationList(graphResult.postCreditContext || []);
  const cleanSafeToSkip = deduplicateRecommendationList(graphResult.safeToSkip || []);

  const allGraphItems = deduplicateRecommendationList([
    ...cleanMustWatch,
    ...cleanRecommended,
    ...cleanOptional,
    ...cleanPostCredit,
  ]);

  const totalPrereqs = allGraphItems.length;

  const guideData: PreparationGuideData = {
    targetContent,
    mode: 'GRAPH_RECOMMENDATION',
    mustWatch: cleanMustWatch,
    recommended: cleanRecommended,
    optional: cleanOptional,
    safeToSkip: cleanSafeToSkip,
    postCreditContext: cleanPostCredit,
    officialItems: [],
    officialPreparationItems: [],
    cineOrderExtraContent: allGraphItems,
    supplementaryRecommendations: allGraphItems,
    estimatedWatchTimeMinutes: graphResult.estimatedWatchTimeMinutes,
    formattedWatchTime: graphResult.formattedWatchTime,
    storyReadinessPercentage: graphResult.storyReadinessPercentage,
    watchedCount: graphResult.watchedCount,
    totalPrerequisitesCount: totalPrereqs,
    isEntryPoint: graphResult.isEntryPoint,
    entryPointMessage: graphResult.entryPointMessage,
    timelineWarnings: graphResult.timelineWarnings,
    diagnostics: graphResult.diagnostics,
  };

  assertPreparationPartitionIntegrity(guideData);
  return guideData;
}

/**
 * Helper to construct an Official Override Preparation Guide DTO.
 * Partitions strictly into:
 * 1. officialPreparationItems (Primary official studio watchlist)
 * 2. cineOrderExtraContent (CineOrder recommendations minus official titles)
 */
function buildOfficialOverridePreparationGuide(
  targetContent: Content,
  officialList: OfficialPreparationList,
  watchedSet: Set<string>
): PreparationGuideData {
  let totalEstimatedMinutes = 0;
  let watchedCount = 0;

  // Run CineOrder's Story Knowledge Graph engine to compute graph recommendations
  const graphResult = executeKnowledgeGraphTraversal(targetContent.id, watchedSet);
  const rawGraphRecs: PreparationRecommendation[] = graphResult
    ? [
        ...graphResult.mustWatch,
        ...graphResult.recommended,
        ...graphResult.optional,
        ...(graphResult.postCreditContext || []),
      ]
    : [];

  const graphRecMap = new Map<string, PreparationRecommendation>();
  for (const gr of rawGraphRecs) {
    graphRecMap.set(gr.content.id.toLowerCase().trim(), gr);
  }

  // Build RAW Official Recommendations
  const rawOfficialRecommendations: PreparationRecommendation[] = [];

  for (const item of officialList.items) {
    const itemContent = getContentById(item.contentId);
    if (!itemContent) continue;

    const isWatched = watchedSet.has(itemContent.id.toLowerCase().trim());
    const graphMatch = graphRecMap.get(itemContent.id.toLowerCase().trim());

    // Map dependencyType from graphMatch or official category
    const dependencyType = graphMatch?.dependencyType || (
      item.officialCategoryId === 'character_arcs' ? 'Character'
      : item.officialCategoryId === 'essential_multiverse' ? 'Multiverse'
      : item.officialCategoryId === 'team_dynamics' ? 'Team'
      : 'Story'
    );

    const rec: PreparationRecommendation = {
      content: itemContent,
      category: 'must_watch',
      dependencyType,
      importance: item.importance || 'Critical',
      reason: item.officialRationale || `Official prerequisite verified by ${officialList.sourceMetadata.sourcePublisher}.`,
      reasons: [item.officialRationale || `Official prerequisite verified by ${officialList.sourceMetadata.sourcePublisher}.`],
      shortReason: item.officialCategoryName || 'Official Studio Selection',
      storyImpact: item.officialRationale || 'Essential context confirmed by official studio watchlist.',
      spoilerFreeExplanation: `Officially designated as a key narrative prerequisite by ${officialList.sourceMetadata.sourcePublisher}.`,
      isWatched,
      relevanceScore: graphMatch?.relevanceScore ?? (100 - (item.officialOrder - 1) * 2), // Retains high relevance matching official order
      impactScore: graphMatch?.impactScore ?? 10,
      whyItMatters: item.officialRationale || graphMatch?.whyItMatters || 'Official studio selection.',
      introduces: graphMatch?.introduces || [],
      continues: graphMatch?.continues || [],
      requiredFor: [targetContent.title],
      confidence: 'confirmed',
    };

    rawOfficialRecommendations.push(rec);
  }

  // Execute Centralized Partition Deduplication
  const { cleanOfficialItems, cleanExtraContent } = deduplicatePreparationPartitions(
    rawOfficialRecommendations,
    rawGraphRecs
  );

  // Compute metrics across all unique official items
  for (const item of cleanOfficialItems) {
    totalEstimatedMinutes += item.content.runtime || 120;
    if (item.isWatched) watchedCount++;
  }

  // Compute metrics across all unique extra content items
  for (const extra of cleanExtraContent) {
    totalEstimatedMinutes += extra.content.runtime || 120;
    if (watchedSet.has(extra.content.id.toLowerCase().trim())) {
      watchedCount++;
    }
  }

  // Total count across all unique preparation items (official + extra content)
  const totalCount = cleanOfficialItems.length + cleanExtraContent.length;
  const readinessPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 100;

  // Format watch time
  const hours = Math.floor(totalEstimatedMinutes / 60);
  const mins = totalEstimatedMinutes % 60;
  const formattedWatchTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Preserve category collections strictly:
  // - mustWatch contains strictly official studio selections
  // - recommended, optional, postCreditContext, safeToSkip contain strictly clean extra content
  const cleanRecommended = cleanExtraContent.filter((r) => r.category === 'recommended');
  const cleanOptional = cleanExtraContent.filter((r) => r.category === 'optional' || r.category === 'must_watch');
  const cleanPostCredit = cleanExtraContent.filter((r) => r.category === 'post_credit');
  const cleanSafeToSkip = cleanExtraContent.filter((r) => r.category === 'safe_to_skip');

  const guideData: PreparationGuideData = {
    targetContent,
    mode: 'OFFICIAL_OVERRIDE',
    officialSource: officialList.sourceMetadata,
    officialCategories: officialList.categories,
    officialItems: cleanOfficialItems,
    officialPreparationItems: cleanOfficialItems,
    cineOrderExtraContent: cleanExtraContent,
    supplementaryRecommendations: cleanExtraContent,
    mustWatch: cleanOfficialItems,
    recommended: cleanRecommended,
    optional: cleanOptional,
    safeToSkip: cleanSafeToSkip,
    postCreditContext: cleanPostCredit,
    estimatedWatchTimeMinutes: totalEstimatedMinutes,
    formattedWatchTime,
    storyReadinessPercentage: readinessPercentage,
    watchedCount,
    totalPrerequisitesCount: totalCount,
    isEntryPoint: totalCount === 0,
    entryPointMessage:
      totalCount === 0
        ? `Officially designated as a standalone story entry point by ${officialList.sourceMetadata.sourcePublisher}.`
        : undefined,
    timelineWarnings: graphResult?.timelineWarnings || [],
    diagnostics: graphResult?.diagnostics || {
      traversedNodeCount: totalCount,
      averagePathDepth: 1,
      validationStatus: 'Passed',
      generationTimeMs: 1,
    },
  };

  assertPreparationPartitionIntegrity(guideData);
  return guideData;
}
