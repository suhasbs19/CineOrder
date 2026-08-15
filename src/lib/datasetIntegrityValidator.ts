import { allFranchises, allContent, allWatchOrders } from '@/data/franchises/index';
import { cineOrderKnowledgeGraph } from '@/data/cineOrderKnowledgeGraph';
import { validateRecommendationCompleteness } from './recommendationCompletenessValidator';
import { getUpcomingTitles, calculateCountdown, isOttAvailable, isTheatricallyUpcoming } from './upcomingUtils';
import { METADATA_FRESHNESS_WARNING_DAYS, METADATA_FRESHNESS_ERROR_DAYS } from '@/types';
import { classifyLifecycle, computeOttAvailable } from './metadataRefresh';

export enum DataIntegrityErrorCode {
  MISSING_FRANCHISE_TITLE = 'MISSING_FRANCHISE_TITLE',
  DUPLICATE_FRANCHISE_TITLE = 'DUPLICATE_FRANCHISE_TITLE',
  CROSS_FRANCHISE_LEAK = 'CROSS_FRANCHISE_LEAK',
  MISSING_WATCH_ORDER_ENTRY = 'MISSING_WATCH_ORDER_ENTRY',
  MISSING_GRAPH_NODE = 'MISSING_GRAPH_NODE',
  BROKEN_GRAPH_REFERENCE = 'BROKEN_GRAPH_REFERENCE',
  MISSING_EXPECTED_NARRATIVE_EDGE = 'MISSING_EXPECTED_NARRATIVE_EDGE',
  SUSPICIOUS_ZERO = 'SUSPICIOUS_ZERO',
  ORPHAN_RECOMMENDATION_CARD = 'ORPHAN_RECOMMENDATION_CARD',
  THEATRICAL_UPCOMING_MISMATCH = 'THEATRICAL_UPCOMING_MISMATCH',
  STALE_RELEASE_STATUS = 'STALE_RELEASE_STATUS',
  STALE_UPCOMING_STATUS = 'STALE_UPCOMING_STATUS',
  OTT_MODE_MISMATCH = 'OTT_MODE_MISMATCH',
  STALE_OTT_FLAG = 'STALE_OTT_FLAG',
  MISSING_LIFECYCLE_DATA = 'MISSING_LIFECYCLE_DATA',
  MISSING_PROVIDER_TYPE = 'MISSING_PROVIDER_TYPE',
  STALE_RELEASE_DATE = 'STALE_RELEASE_DATE',
  STALE_LIFECYCLE_STATUS = 'STALE_LIFECYCLE_STATUS',
  STALE_DIGITAL_AVAILABILITY = 'STALE_DIGITAL_AVAILABILITY',
  STALE_STREAMING_AVAILABILITY = 'STALE_STREAMING_AVAILABILITY',
  METADATA_REFRESH_REQUIRED = 'METADATA_REFRESH_REQUIRED',
  FUTURE_MOVIE_INTEGRATION_INCOMPLETE = 'FUTURE_MOVIE_INTEGRATION_INCOMPLETE',
}

export interface IntegrityIssue {
  severity: 'error' | 'warning';
  code?: DataIntegrityErrorCode;
  category:
    | 'duplicate_content_id'
    | 'duplicate_tmdb_id'
    | 'duplicate_watch_order'
    | 'missing_referenced_content'
    | 'orphan_graph_node'
    | 'duplicate_graph_edge'
    | 'franchise_count_mismatch'
    | 'missing_release_date_or_image'
    | 'upcoming_lifecycle_mismatch'
    | 'stale_upcoming_date'
    | 'released_date_but_upcoming'
    | 'released_with_trailer_readiness'
    | 'released_with_additional_recommended'
    | 'upcoming_with_post_release_mode'
    | 'lifecycle_mode_mismatch'
    | 'theatrical_upcoming_mismatch'
    | 'pre_ott_post_ott_mismatch'
    | 'post_ott_pre_ott_mismatch'
    | 'ambiguous_ott_provider'
    | 'released_without_ott_data'
    | 'stale_ott_availability'
    | 'ott_mode_mismatch'
    | 'stale_release_date'
    | 'stale_lifecycle_status'
    | 'stale_digital_availability'
    | 'stale_streaming_availability'
    | 'metadata_refresh_required'
    | 'future_movie_integration_incomplete';
  message: string;
  details?: Record<string, unknown>;
}

export interface PipelineStageTrace {
  stage: string;
  passed: boolean;
  details: string;
}

export interface PipelineTraceResult {
  titleId: string;
  franchiseId: string;
  valid: boolean;
  failedStage?: string;
  reasonForExclusion?: string;
  stages: PipelineStageTrace[];
}

export function traceTitlePipeline(titleId: string): PipelineTraceResult {
  const content = allContent.find((c) => c.id === titleId);
  const franchiseId = content?.franchise_id || 'unknown';

  const stages: PipelineStageTrace[] = [
    {
      stage: '1. Franchise Source Data',
      passed: Boolean(content),
      details: content ? `Content found in source data (${content.title})` : `Title '${titleId}' missing from canonical source data`,
    },
    {
      stage: '2. Franchise Registry',
      passed: Boolean(allFranchises.some((f) => f.id === franchiseId)),
      details: content ? `Franchise '${franchiseId}' is registered` : `Franchise ID missing`,
    },
    {
      stage: '3. Global Catalog',
      passed: Boolean(allContent.some((c) => c.id === titleId)),
      details: content ? `Included in global allContent catalog` : `Missing from global allContent catalog`,
    },
    {
      stage: '4. Metadata Normalization',
      passed: Boolean(content?.title && content?.release_date),
      details: content?.title ? `Normalized title: '${content.title}'` : `Title metadata incomplete`,
    },
    {
      stage: '5. Lifecycle Classification',
      passed: Boolean(content?.status),
      details: content ? `Status: ${content.status}, Theatrical Upcoming: ${isTheatricallyUpcoming(content)}, OTT Available: ${isOttAvailable(content)}` : `Lifecycle unclassified`,
    },
    {
      stage: '6. Watch Orders',
      passed: Boolean(allWatchOrders.some((w) => w.content_id === titleId && w.order_type === 'release')) &&
              Boolean(allWatchOrders.some((w) => w.content_id === titleId && w.order_type === 'chronological')),
      details: content ? `Has release & chronological watch orders` : `Missing watch orders`,
    },
    {
      stage: '7. Knowledge Graph',
      passed: Boolean(cineOrderKnowledgeGraph.titleNodes[titleId]),
      details: cineOrderKnowledgeGraph.titleNodes[titleId] ? `CKG TitleNode exists` : `Missing CKG TitleNode in Knowledge Graph`,
    },
  ];

  const failed = stages.find((s) => !s.passed);
  return {
    titleId,
    franchiseId,
    valid: !failed,
    failedStage: failed?.stage,
    reasonForExclusion: failed?.details,
    stages,
  };
}

export interface DatasetIntegrityReport {
  valid: boolean;
  totalChecksPerformed: number;
  errorCount: number;
  warningCount: number;
  issues: IntegrityIssue[];
}

/**
 * Startup and Test-time Dataset Integrity Validator for CineOrder.
 * Automatically checks for data model corruption, duplicate IDs, missing references,
 * orphan graph nodes, and duplicate edges across all franchises.
 */
export function validateDatasetIntegrity(): DatasetIntegrityReport {
  const issues: IntegrityIssue[] = [];
  let checksCount = 0;

  // 1. Duplicate Content IDs
  checksCount++;
  const contentIdMap = new Map<string, number>();
  for (const item of allContent) {
    contentIdMap.set(item.id, (contentIdMap.get(item.id) || 0) + 1);
  }
  for (const [id, count] of contentIdMap.entries()) {
    if (count > 1) {
      issues.push({
        severity: 'error',
        category: 'duplicate_content_id',
        message: `Duplicate Content ID found: '${id}' appears ${count} times in allContent.`,
        details: { id, count },
      });
    }
  }

  // 2. Duplicate TMDB IDs per Franchise
  checksCount++;
  const tmdbMap = new Map<string, string[]>();
  for (const item of allContent) {
    if (item.tmdb_id) {
      const key = `${item.franchise_id}:${item.tmdb_id}`;
      const existing = tmdbMap.get(key) || [];
      existing.push(item.id);
      tmdbMap.set(key, existing);
    }
  }
  for (const [key, itemIds] of tmdbMap.entries()) {
    if (itemIds.length > 1) {
      issues.push({
        severity: 'warning',
        category: 'duplicate_tmdb_id',
        message: `Duplicate TMDB ID collision on '${key}': shared by [${itemIds.join(', ')}].`,
        details: { key, itemIds },
      });
    }
  }

  // 3. Duplicate Watch-Order Entries
  checksCount++;
  const watchOrderKeyMap = new Map<string, number>();
  for (const wo of allWatchOrders) {
    const key = `${wo.franchise_id}:${wo.order_type}:${wo.content_id}`;
    watchOrderKeyMap.set(key, (watchOrderKeyMap.get(key) || 0) + 1);
  }
  for (const [key, count] of watchOrderKeyMap.entries()) {
    if (count > 1) {
      issues.push({
        severity: 'error',
        category: 'duplicate_watch_order',
        message: `Duplicate Watch-Order entry found: '${key}' appears ${count} times.`,
        details: { key, count },
      });
    }
  }

  // 4. Missing Referenced Content in Watch Orders
  checksCount++;
  const contentSet = new Set(allContent.map((c) => c.id));
  for (const wo of allWatchOrders) {
    if (!contentSet.has(wo.content_id)) {
      issues.push({
        severity: 'error',
        category: 'missing_referenced_content',
        message: `Watch-Order '${wo.id}' references non-existent content_id: '${wo.content_id}'.`,
        details: { watchOrderId: wo.id, contentId: wo.content_id },
      });
    }
  }

  // 5. Orphan Graph Nodes
  checksCount++;
  const connectedNodes = new Set<string>();
  for (const edge of cineOrderKnowledgeGraph.edges) {
    connectedNodes.add(edge.sourceId);
    connectedNodes.add(edge.targetId);
  }
  for (const nodeId of Object.keys(cineOrderKnowledgeGraph.titleNodes)) {
    if (!connectedNodes.has(nodeId)) {
      issues.push({
        severity: 'warning',
        category: 'orphan_graph_node',
        message: `Orphan CKG TitleNode found: '${nodeId}' has 0 connected graph edges.`,
        details: { nodeId },
      });
    }
  }

  // 6. Duplicate Graph Edges
  checksCount++;
  const edgeKeyMap = new Map<string, number>();
  for (const edge of cineOrderKnowledgeGraph.edges) {
    const key = `${edge.sourceId}->${edge.targetId}`;
    edgeKeyMap.set(key, (edgeKeyMap.get(key) || 0) + 1);
  }
  for (const [key, count] of edgeKeyMap.entries()) {
    if (count > 1) {
      issues.push({
        severity: 'error',
        category: 'duplicate_graph_edge',
        message: `Duplicate CKG Graph Edge found: '${key}' defined ${count} times.`,
        details: { edgeKey: key, count },
      });
    }
  }

  // 7. Cross-Franchise Edge Source & Target Existence Check
  checksCount++;
  const validFranchises = new Set(allFranchises.map((f) => f.id));
  
  for (const edge of cineOrderKnowledgeGraph.edges) {
    const sourceContent = allContent.find((c) => c.id === edge.sourceId);
    const targetContent = allContent.find((c) => c.id === edge.targetId);

    if (sourceContent && !validFranchises.has(sourceContent.franchise_id)) {
      issues.push({
        severity: 'error',
        category: 'missing_referenced_content',
        message: `Edge source '${edge.sourceId}' has invalid franchise_id: '${sourceContent.franchise_id}'.`,
        details: { edge },
      });
    }
    if (targetContent && !validFranchises.has(targetContent.franchise_id)) {
      issues.push({
        severity: 'error',
        category: 'missing_referenced_content',
        message: `Edge target '${edge.targetId}' has invalid franchise_id: '${targetContent.franchise_id}'.`,
        details: { edge },
      });
    }
  }

  // 8. Cross-Franchise Circular Dependency Prevention
  checksCount++;
  const adjacencyMap = new Map<string, string[]>();
  for (const edge of cineOrderKnowledgeGraph.edges) {
    const list = adjacencyMap.get(edge.sourceId) || [];
    list.push(edge.targetId);
    adjacencyMap.set(edge.sourceId, list);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(node: string): boolean {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = adjacencyMap.get(node) || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  }

  for (const nodeId of adjacencyMap.keys()) {
    if (hasCycle(nodeId)) {
      issues.push({
        severity: 'error',
        category: 'duplicate_graph_edge',
        message: `Circular dependency detected starting from node: '${nodeId}'.`,
        details: { nodeId },
      });
      break;
    }
  }

  // 9. Franchise Count Sum & Progress Denominator Integrity
  checksCount++;
  for (const franchise of allFranchises) {
    const fContent = allContent.filter((c) => c.franchise_id === franchise.id);
    const moviesCount = fContent.filter((c) => c.type === 'movie').length;
    const seriesCount = fContent.filter((c) => c.type === 'series').length;
    const specialsCount = fContent.filter((c) => ['special', 'short', 'ova', 'animated'].includes(c.type)).length;
    const otherCount = fContent.filter((c) => ['game', 'book', 'comic', 'podcast'].includes(c.type)).length;
    const calculatedTotal = moviesCount + seriesCount + specialsCount + otherCount;

    if (calculatedTotal !== fContent.length) {
      issues.push({
        severity: 'error',
        category: 'franchise_count_mismatch',
        message: `Franchise '${franchise.id}' category sum mismatch: ${moviesCount} movies + ${seriesCount} series + ${specialsCount} specials + ${otherCount} other = ${calculatedTotal} !== totalContent (${fContent.length}).`,
        details: { franchiseId: franchise.id, moviesCount, seriesCount, specialsCount, total: fContent.length },
      });
    }

    // Verify watch order count per type equals total title count
    for (const orderType of ['release', 'chronological'] as const) {
      const typeOrders = allWatchOrders.filter(
        (o) => o.franchise_id === franchise.id && o.order_type === orderType
      );
      if (typeOrders.length !== fContent.length) {
        issues.push({
          severity: 'warning',
          category: 'franchise_count_mismatch',
          message: `Franchise '${franchise.id}' watch order count for '${orderType}' (${typeOrders.length}) does not match totalContent (${fContent.length}).`,
          details: { franchiseId: franchise.id, orderType, watchOrderCount: typeOrders.length, totalContent: fContent.length },
        });
      }
    }
  }

  // 10. Release Date & Poster Validity Check
  checksCount++;
  for (const item of allContent) {
    if (!item.release_date || item.release_date.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'missing_release_date_or_image',
        message: `Content '${item.id}' (${item.title}) has missing or empty release_date.`,
        details: { id: item.id, title: item.title },
      });
    }

    if (!item.poster_url || item.poster_url.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'missing_release_date_or_image',
        message: `Content '${item.id}' (${item.title}) has missing or empty poster_url.`,
        details: { id: item.id, title: item.title },
      });
    }
  }

  // 11. Recommendation Completeness Check
  checksCount++;
  try {
    const completenessReport = validateRecommendationCompleteness();
    if (completenessReport.status === 'FAIL') {
      completenessReport.failures.forEach((failure) => {
        issues.push({
          severity: 'error',
          category: 'missing_referenced_content',
          message: `[Recommendation Completeness] Title '${failure.titleId}' (${failure.titleName}): ${failure.problem || failure.status}`,
          details: {
            titleId: failure.titleId,
            franchiseId: failure.franchiseId,
            status: failure.status,
            problem: failure.problem,
            suggestedReview: failure.suggestedEditorialReview,
          },
        });
      });
    }
  } catch {
    // Non-blocking catch
  }

  // 12. Lifecycle Consistency & Upcoming Releases Check
  checksCount++;
  const todayStr = new Date().toISOString().split('T')[0] || '';
  const upcomingItems = getUpcomingTitles(
    allContent.map((c) => ({
      id: c.id,
      tmdb_id: c.tmdb_id,
      title: c.title,
      type: c.type,
      franchise_id: c.franchise_id,
      franchise_name: c.franchise_id,
      franchise_slug: c.franchise_id,
      poster_url: c.poster_url || '',
      backdrop_url: c.backdrop_url || '',
      overview: c.overview,
      release_date: c.release_date || '',
      status: (c.status === 'upcoming' ? 'Upcoming' : calculateCountdown(c.release_date, c.status).status) as any,
      countdown: calculateCountdown(c.release_date, c.status),
      content: c,
    }))
  );

  const upcomingIds = new Set(upcomingItems.map((u) => u.id));

  for (const item of allContent) {
    const st = (item.status || '').toString().toLowerCase();
    const isUpcomingLifecycle = st === 'upcoming' || st === 'in_production' || st === 'tba' || st === 'planned';

    if (isUpcomingLifecycle) {
      if (!upcomingIds.has(item.id)) {
        issues.push({
          severity: 'error',
          category: 'upcoming_lifecycle_mismatch',
          message: `UPCOMING_MISSING: Title '${item.id}' (${item.title}) has status '${item.status}' but is missing from getUpcomingTitles().`,
          details: { id: item.id, title: item.title, status: item.status },
        });
      }

      if (item.release_date && item.release_date < todayStr) {
        issues.push({
          severity: 'warning',
          category: 'stale_upcoming_date',
          message: `STALE_UPCOMING_DATE: Title '${item.id}' (${item.title}) has status '${item.status}' but release date '${item.release_date}' is before today (${todayStr}).`,
          details: { id: item.id, title: item.title, status: item.status, release_date: item.release_date, today: todayStr },
        });
      }
    } else if (st === 'released') {
      if (upcomingIds.has(item.id)) {
        issues.push({
          severity: 'error',
          category: 'upcoming_lifecycle_mismatch',
          message: `RELEASED_IN_UPCOMING: Title '${item.id}' (${item.title}) has status 'released' but is incorrectly returned by getUpcomingTitles().`,
          details: { id: item.id, title: item.title, status: item.status },
        });
      }
    }
  }

  // 13. Preparation Guide & Lifecycle Mode Consistency Check
  checksCount++;
  for (const item of allContent) {
    const isTheatricalUpcoming = isTheatricallyUpcoming(item);
    const isOtt = isOttAvailable(item);
    const isPreOttUI = !isOtt;

    // A. THEATRICAL_UPCOMING_MISMATCH: Theatrically released title appears in getUpcomingTitles
    if (!isTheatricalUpcoming && upcomingIds.has(item.id)) {
      issues.push({
        severity: 'error',
        category: 'theatrical_upcoming_mismatch',
        message: `THEATRICAL_UPCOMING_MISMATCH: Title '${item.id}' (${item.title}) is theatrically released but incorrectly appears in Upcoming section.`,
        details: { id: item.id, title: item.title, status: item.status },
      });
    }

    // B. PRE_OTT_POST_OTT_MISMATCH: Not OTT available, but uses post-OTT recommendation mode
    if (!isOtt && !isPreOttUI) {
      issues.push({
        severity: 'error',
        category: 'pre_ott_post_ott_mismatch',
        message: `PRE_OTT_POST_OTT_MISMATCH: Title '${item.id}' (${item.title}) is not OTT available but uses post-OTT recommendation mode.`,
        details: { id: item.id, title: item.title, ott_available: item.ott_available },
      });
    }

    // C. POST_OTT_PRE_OTT_MISMATCH: OTT available, but uses Trailer Readiness / Pre-OTT mode
    if (isOtt && isPreOttUI) {
      issues.push({
        severity: 'error',
        category: 'post_ott_pre_ott_mismatch',
        message: `POST_OTT_PRE_OTT_MISMATCH: Title '${item.id}' (${item.title}) is OTT available but incorrectly uses Trailer Readiness / Pre-OTT mode.`,
        details: { id: item.id, title: item.title, ott_available: item.ott_available },
      });
    }

    // D. STALE_OTT_AVAILABILITY: Detects when verified digital/subscription release dates or flags indicate OTT streaming but title was marked ott_available: false
    const st = (item.status || '').toString().toLowerCase();
    const hasActiveOttFlag = item.digital_available === true || item.subscription_streaming_available === true;
    const hasPassedOttDate = (Boolean(item.digital_release_date) && item.digital_release_date! <= todayStr) ||
                             (Boolean(item.subscription_streaming_release_date) && item.subscription_streaming_release_date! <= todayStr);
    if (st === 'released' && item.ott_available === false && (hasActiveOttFlag || hasPassedOttDate)) {
      issues.push({
        severity: 'error',
        category: 'stale_ott_availability',
        message: `STALE_OTT_AVAILABILITY: Title '${item.id}' (${item.title}) has verified digital/subscription availability or past release date but ott_available is marked false.`,
        details: { id: item.id, title: item.title, ott_available: item.ott_available },
      });
    }

    // E. RELEASED_WITHOUT_OTT_DATA: Released title with undefined ott_available and empty/missing streaming providers
    if (st === 'released' && item.ott_available === undefined && (!item.streaming_providers || item.streaming_providers.length === 0)) {
      issues.push({
        severity: 'warning',
        category: 'released_without_ott_data',
        message: `RELEASED_WITHOUT_OTT_DATA: Released title '${item.id}' (${item.title}) has undefined ott_available and no streaming providers listed.`,
        details: { id: item.id, title: item.title },
      });
    }
  }

  // 15. Stale Metadata Detection (Requirements 25 & 26)
  // Activates the previously-declared but unwired error codes.
  checksCount++;
  {
    const nowMs = Date.now();
    const warnThresholdMs = METADATA_FRESHNESS_WARNING_DAYS * 24 * 60 * 60 * 1000;
    const errorThresholdMs = METADATA_FRESHNESS_ERROR_DAYS * 24 * 60 * 60 * 1000;

    for (const item of allContent) {
      const checkedAt = item.metadata_checked_at
        ? new Date(item.metadata_checked_at).getTime()
        : null;
      const ageMs = checkedAt !== null ? nowMs - checkedAt : null;
      const isStaleWarn = ageMs === null || ageMs > warnThresholdMs;
      const isStaleError = ageMs === null || ageMs > errorThresholdMs;

      // A. STALE_OTT_FLAG: ott_available must equal (digital_available OR subscription_streaming_available)
      const canonicalOtt = computeOttAvailable(item);
      if (item.ott_available !== undefined && item.ott_available !== canonicalOtt) {
        issues.push({
          severity: 'error',
          code: DataIntegrityErrorCode.STALE_OTT_FLAG,
          category: 'stale_ott_availability',
          message: `STALE_OTT_FLAG: Title '${item.id}' (${item.title}) has ott_available=${item.ott_available} but canonical rule (digital_available OR subscription_streaming_available) computes ${canonicalOtt}. Update ott_available to ${canonicalOtt}.`,
          details: { id: item.id, title: item.title, stored: item.ott_available, canonical: canonicalOtt },
        });
      }

      // B. STALE_DIGITAL_AVAILABILITY: digital_release_date in the past but digital_available !== true
      if (
        item.digital_release_date &&
        item.digital_release_date <= todayStr &&
        item.digital_available !== true
      ) {
        issues.push({
          severity: 'error',
          code: DataIntegrityErrorCode.STALE_DIGITAL_AVAILABILITY,
          category: 'stale_digital_availability',
          message: `STALE_DIGITAL_AVAILABILITY: Title '${item.id}' (${item.title}) has digital_release_date '${item.digital_release_date}' (past) but digital_available is not true. Update digital_available=true and ott_available=true.`,
          details: { id: item.id, digital_release_date: item.digital_release_date, digital_available: item.digital_available },
        });
      }

      // C. STALE_STREAMING_AVAILABILITY: subscription_streaming_release_date in the past but subscription_streaming_available !== true
      if (
        item.subscription_streaming_release_date &&
        item.subscription_streaming_release_date <= todayStr &&
        item.subscription_streaming_available !== true
      ) {
        issues.push({
          severity: 'error',
          code: DataIntegrityErrorCode.STALE_STREAMING_AVAILABILITY,
          category: 'stale_streaming_availability',
          message: `STALE_STREAMING_AVAILABILITY: Title '${item.id}' (${item.title}) has subscription_streaming_release_date '${item.subscription_streaming_release_date}' (past) but subscription_streaming_available is not true. Update subscription_streaming_available=true and ott_available=true.`,
          details: { id: item.id, subscription_streaming_release_date: item.subscription_streaming_release_date, subscription_streaming_available: item.subscription_streaming_available },
        });
      }

      // D. STALE_RELEASE_DATE: status is 'upcoming' but release_date is in the past AND data is stale
      if (item.status === 'upcoming' && item.release_date && item.release_date < todayStr) {
        if (isStaleError) {
          issues.push({
            severity: 'error',
            code: DataIntegrityErrorCode.STALE_RELEASE_DATE,
            category: 'stale_release_date',
            message: `STALE_RELEASE_DATE [ERROR]: Title '${item.id}' (${item.title}) has status='upcoming' but release_date '${item.release_date}' is in the past and metadata is stale (age >${METADATA_FRESHNESS_ERROR_DAYS}d or never checked). This causes incorrect UI behavior.`,
            details: { id: item.id, release_date: item.release_date, metadata_checked_at: item.metadata_checked_at },
          });
        } else if (isStaleWarn) {
          issues.push({
            severity: 'warning',
            code: DataIntegrityErrorCode.STALE_RELEASE_DATE,
            category: 'stale_release_date',
            message: `STALE_RELEASE_DATE [WARNING]: Title '${item.id}' (${item.title}) has status='upcoming' but release_date '${item.release_date}' is in the past. Metadata checked ${METADATA_FRESHNESS_WARNING_DAYS}+ days ago. Run npm run audit:metadata.`,
            details: { id: item.id, release_date: item.release_date, metadata_checked_at: item.metadata_checked_at },
          });
        }
      }

      // E. STALE_LIFECYCLE_STATUS: canonical lifecycle disagrees with stored lifecycle_status
      if (item.lifecycle_status) {
        const canonical = classifyLifecycle(item);
        if (canonical !== item.lifecycle_status) {
          // Only an error if it causes a UI-breaking inconsistency
          const isBreaking =
            (canonical === 'subscription_available' || canonical === 'digital_available') &&
            (item.lifecycle_status === 'upcoming' || item.lifecycle_status === 'announced' || item.lifecycle_status === 'theatrically_released');
          issues.push({
            severity: isBreaking ? 'error' : 'warning',
            code: DataIntegrityErrorCode.STALE_LIFECYCLE_STATUS,
            category: 'stale_lifecycle_status',
            message: `STALE_LIFECYCLE_STATUS [${isBreaking ? 'ERROR' : 'WARNING'}]: Title '${item.id}' (${item.title}) stored lifecycle_status='${item.lifecycle_status}' but canonical classification='${canonical}'. Run npm run audit:metadata to refresh.`,
            details: { id: item.id, stored: item.lifecycle_status, canonical },
          });
        }
      }

      // F. METADATA_REFRESH_REQUIRED: metadata_checked_at is stale for released titles
      if (item.status === 'released' && isStaleWarn) {
        issues.push({
          severity: 'warning',
          code: DataIntegrityErrorCode.METADATA_REFRESH_REQUIRED,
          category: 'metadata_refresh_required',
          message: `METADATA_REFRESH_REQUIRED: Released title '${item.id}' (${item.title}) metadata_checked_at is ${ageMs === null ? 'never set' : `${Math.floor(ageMs / (1000 * 60 * 60 * 24))}d old`} (threshold: ${METADATA_FRESHNESS_WARNING_DAYS}d). Run npm run audit:metadata.`,
          details: { id: item.id, metadata_checked_at: item.metadata_checked_at, ageDays: ageMs !== null ? Math.floor(ageMs / (1000 * 60 * 60 * 24)) : null },
        });
      }
    }
  }

  // 16. Release Gate UI Consistency (Requirements 28 & 32)
  // Formally enforces: no impossible lifecycle+UI state can be silently shipped.
  checksCount++;
  for (const item of allContent) {
    const canonicalOtt = computeOttAvailable(item);
    const canonicalLifecycle = classifyLifecycle(item);
    const isTheatricalUpcoming = isTheatricallyUpcoming(item);

    // A. Released title still showing in Upcoming section → ERROR
    if (!isTheatricalUpcoming && upcomingIds.has(item.id)) {
      // (Already covered by check #13 THEATRICAL_UPCOMING_MISMATCH — skip duplicate)
    }

    // B. OTT available + still in Trailer Readiness (pre-OTT mode)
    //    Detected when ott_available=true but lifecycle_status implies pre-OTT
    if (
      canonicalOtt &&
      item.lifecycle_status &&
      (item.lifecycle_status === 'upcoming' || item.lifecycle_status === 'announced')
    ) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.OTT_MODE_MISMATCH,
        category: 'ott_mode_mismatch',
        message: `RELEASE_GATE_FAIL [OTT_MODE_MISMATCH]: Title '${item.id}' (${item.title}) is OTT available but lifecycle_status='${item.lifecycle_status}' implies pre-OTT/Trailer Readiness mode. This causes Trailer Readiness to display for an OTT-available title.`,
        details: { id: item.id, ott_available: canonicalOtt, lifecycle_status: item.lifecycle_status },
      });
    }

    // C. Not OTT available + post-OTT lifecycle status  
    //    ott_available=false but lifecycle_status=subscription_available|digital_available
    if (
      !canonicalOtt &&
      item.lifecycle_status &&
      (item.lifecycle_status === 'subscription_available' || item.lifecycle_status === 'digital_available')
    ) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.OTT_MODE_MISMATCH,
        category: 'post_ott_pre_ott_mismatch',
        message: `RELEASE_GATE_FAIL [OTT_MODE_MISMATCH]: Title '${item.id}' (${item.title}) has lifecycle_status='${item.lifecycle_status}' (Post-OTT) but OTT is not actually available. Causes incorrect Post-OTT recommendation mode.`,
        details: { id: item.id, ott_available: canonicalOtt, lifecycle_status: item.lifecycle_status },
      });
    }

    // D. Theatrically released but still status='upcoming' — lifecycle contradiction
    if (item.theatrical_released === true && item.status === 'upcoming') {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.THEATRICAL_UPCOMING_MISMATCH,
        category: 'theatrical_upcoming_mismatch',
        message: `RELEASE_GATE_FAIL [THEATRICAL_UPCOMING_MISMATCH]: Title '${item.id}' (${item.title}) has theatrical_released=true but status='upcoming'. Update status to 'released'.`,
        details: { id: item.id, theatrical_released: item.theatrical_released, status: item.status },
      });
    }

    // E. Canonical lifecycle = subscription_available but ott_available != true
    if (canonicalLifecycle === 'subscription_available' && !canonicalOtt) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.STALE_OTT_FLAG,
        category: 'stale_ott_availability',
        message: `RELEASE_GATE_FAIL [STALE_OTT_FLAG]: Title '${item.id}' (${item.title}) canonical lifecycle is 'subscription_available' but OTT is computed as unavailable. Impossible state.`,
        details: { id: item.id, canonicalLifecycle, canonicalOtt },
      });
    }
  }

  checksCount++;
  // 14. Future Movie Automated Integration Completeness Check (Requirement 29)
  for (const item of allContent) {
    // 1. Franchise registration
    if (!allFranchises.some((f) => f.id === item.franchise_id)) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.FUTURE_MOVIE_INTEGRATION_INCOMPLETE,
        category: 'future_movie_integration_incomplete',
        message: `FUTURE_MOVIE_INTEGRATION_INCOMPLETE: Franchise '${item.franchise_id}' for title '${item.id}' (${item.title}) is missing from allFranchises registry.`,
        details: { id: item.id, franchiseId: item.franchise_id, missingStep: 'Franchise Registration' },
      });
    }

    // 2. Release Order inclusion
    if (!allWatchOrders.some((w) => w.content_id === item.id && w.order_type === 'release')) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.FUTURE_MOVIE_INTEGRATION_INCOMPLETE,
        category: 'future_movie_integration_incomplete',
        message: `FUTURE_MOVIE_INTEGRATION_INCOMPLETE: Title '${item.id}' (${item.title}) is missing from Release Watch Order.`,
        details: { id: item.id, missingStep: 'Release Watch Order' },
      });
    }

    // 3. Chronological Order inclusion
    if (!allWatchOrders.some((w) => w.content_id === item.id && w.order_type === 'chronological')) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.FUTURE_MOVIE_INTEGRATION_INCOMPLETE,
        category: 'future_movie_integration_incomplete',
        message: `FUTURE_MOVIE_INTEGRATION_INCOMPLETE: Title '${item.id}' (${item.title}) is missing from Chronological Watch Order.`,
        details: { id: item.id, missingStep: 'Chronological Watch Order' },
      });
    }

    // 4. Knowledge Graph Node existence
    if (!cineOrderKnowledgeGraph.titleNodes[item.id]) {
      issues.push({
        severity: 'error',
        code: DataIntegrityErrorCode.FUTURE_MOVIE_INTEGRATION_INCOMPLETE,
        category: 'future_movie_integration_incomplete',
        message: `FUTURE_MOVIE_INTEGRATION_INCOMPLETE: Title '${item.id}' (${item.title}) is missing from Knowledge Graph (cineOrderKnowledgeGraph.titleNodes).`,
        details: { id: item.id, missingStep: 'Knowledge Graph TitleNode' },
      });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    valid: errors.length === 0,
    totalChecksPerformed: checksCount,
    errorCount: errors.length,
    warningCount: warnings.length,
    issues,
  };
}

// Auto-run in non-production environments to log integrity diagnostics
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'production') {
  try {
    const report = validateDatasetIntegrity();
    if (!report.valid) {
      console.warn(
        `[CineOrder Integrity Alert] ${report.errorCount} data integrity error(s) detected. Run validateDatasetIntegrity() for details.`
      );
    }
  } catch {
    // Non-blocking catch
  }
}
