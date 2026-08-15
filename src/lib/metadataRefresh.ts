import type { Content, DetailedLifecycleStatus } from '@/types';
import { isPastDate, isFutureDate, getCanonicalTodayStr } from './dateUtils';
import { classifyProviderType } from './upcomingUtils';

export interface MetadataRefreshOptions {
  force?: boolean;
  asOfDate?: string; // ISO date string YYYY-MM-DD for deterministic testing
  titlesToRefresh?: string[];
}

export interface MetadataTransitionEvent {
  titleId: string;
  titleName: string;
  previousLifecycle: DetailedLifecycleStatus | string;
  newLifecycle: DetailedLifecycleStatus;
  transitionType:
    | 'THEATRICAL_RELEASE'
    | 'DIGITAL_PVOD_RELEASE'
    | 'SUBSCRIPTION_STREAMING_RELEASE'
    | 'LIFECYCLE_PROMOTION';
  details: string;
}

export interface MetadataRefreshResult {
  totalProcessed: number;
  updatedCount: number;
  unchangedCount: number;
  pendingCount: number;
  warningCount: number;
  events: MetadataTransitionEvent[];
  updatedContent: Content[];
  warnings: string[];
}

export type CanonicalLifecycleCategory = 'UPCOMING' | 'THEATRICALLY_RELEASED' | 'STREAMING_AVAILABLE';

/**
 * Maps granular DetailedLifecycleStatus to macro 3-tier lifecycle category:
 * 1. UPCOMING -> announced / upcoming (pre-theatrical)
 * 2. THEATRICALLY_RELEASED -> theatrically_released (in theaters / physical home video before OTT)
 * 3. STREAMING_AVAILABLE -> digital_available / subscription_available (available to stream on OTT)
 */
export function getLifecycleCategory(item: Content, asOfDate?: string): CanonicalLifecycleCategory {
  const status = classifyLifecycle(item, asOfDate);
  if (status === 'subscription_available' || status === 'digital_available') {
    return 'STREAMING_AVAILABLE';
  }
  if (status === 'theatrically_released') {
    return 'THEATRICALLY_RELEASED';
  }
  return 'UPCOMING';
}

/**
 * Canonical OTT availability computation.
 *
 * Rule (immutable):
 *   ott_available = digital_available OR subscription_streaming_available
 *
 * Priority:
 *   1. If digital_available === true  → ott_available = true
 *   2. If subscription_streaming_available === true → ott_available = true
 *   3. Explicit verified false state (both digital and subscription false) → ott_available = false
 *   4. Verified streaming provider list (non-theatrical) for released titles → ott_available = true
 *   5. Explicit ott_available boolean, when set
 *   6. Default → false
 *
 * This function is the SINGLE canonical source for OTT state computation.
 * UI components must call isOttAvailable() (which delegates here).
 */
export function computeOttAvailable(item: Content): boolean {
  // Rule 1: Explicit verified availability state
  if (item.digital_available === true || item.subscription_streaming_available === true) {
    return true;
  }

  // Rule 2: Explicit verified unavailability state
  if (item.digital_available === false && item.subscription_streaming_available === false) {
    return false;
  }

  // Rule 3: Provider inspection for released titles (overrides stale ott_available: false)
  const isActuallyReleased =
    item.theatrical_released === true ||
    item.status === 'released';

  if (isActuallyReleased && item.streaming_providers && item.streaming_providers.length > 0) {
    const hasValidOttProvider = item.streaming_providers.some((p) => {
      const pType = classifyProviderType(p.provider_name);
      return pType === 'DIGITAL_PVOD' || pType === 'SUBSCRIPTION' || pType === 'HOME_VIDEO';
    });
    if (hasValidOttProvider) return true;
  }

  // Rule 4: Explicit ott_available boolean, when defined
  if (item.ott_available !== undefined) {
    return Boolean(item.ott_available);
  }

  // Rule 5: Default fallback -> false
  return false;
}

/**
 * Canonical lifecycle classification function.
 *
 * Single source of truth for DetailedLifecycleStatus.
 * All downstream components (buildContent, refreshMetadata, validators, UI)
 * must derive lifecycle state from this function — never infer it independently.
 *
 * Lifecycle progression:
 *   announced → upcoming → theatrically_released → digital_available → subscription_available
 *
 * @param item   Content record (may be partial during construction)
 * @param asOfDate  Optional ISO date string (YYYY-MM-DD) for deterministic testing. Defaults to today.
 */
export function classifyLifecycle(item: Content, asOfDate?: string): DetailedLifecycleStatus {
  const asOfStr = getCanonicalTodayStr(asOfDate);

  const isSub = item.subscription_streaming_available === true;
  const isDigital = item.digital_available === true;

  // Check provider-based OTT
  const isProviderOtt = computeOttAvailable(item);

  const releaseDate = item.theatrical_release_date || item.release_date;

  // Evaluate Theatrical Release status deterministically:
  let isTheatricallyReleased = false;

  if (item.theatrical_released === true) {
    isTheatricallyReleased = true;
  } else if (item.theatrical_released === false) {
    isTheatricallyReleased = false;
  } else if (
    item.status === 'upcoming' ||
    item.status === 'in_production' ||
    item.status === 'tba' ||
    item.status === 'planned'
  ) {
    // Explicit unreleased status takes precedence (e.g. delayed upcoming title with stale date)
    isTheatricallyReleased = false;
  } else if (Boolean(releaseDate)) {
    if (isFutureDate(releaseDate, asOfStr)) {
      isTheatricallyReleased = false;
    } else if (isPastDate(releaseDate, asOfStr)) {
      isTheatricallyReleased = true;
    }
  } else if (item.status === 'released') {
    isTheatricallyReleased = true;
  }

  // Hierarchy: subscription > digital > theatrical > upcoming > announced
  if (isTheatricallyReleased) {
    if (isSub) return 'subscription_available';
    if (isDigital) return 'digital_available';
    if (isProviderOtt) return 'subscription_available';
    return 'theatrically_released';
  }

  const isUpcoming =
    item.status === 'upcoming' ||
    item.status === 'in_production' ||
    item.status === 'tba' ||
    item.status === 'planned' ||
    (Boolean(releaseDate) && isFutureDate(releaseDate, asOfStr));

  if (isUpcoming) return 'upcoming';

  return 'announced';
}

/**
 * Evaluates change detection rules and updates canonical Content metadata.
 *
 * Rules:
 * 1. theatrical_release_date < asOfDate -> theatrical_released = true
 * 2. digital_release_date < asOfDate -> digital_available = true, ott_available = true
 * 3. subscription_streaming_release_date < asOfDate -> subscription_streaming_available = true, ott_available = true
 * 4. Verified streaming provider exists -> ott_available = true
 * 5. When ott_available transitions false -> true: UI dynamically consumes POST-OTT mode without patch
 * 6. Uncertain/missing external data -> preserve existing verified state, set PENDING warning
 *
 * This function updates the canonical data layer. Never patch individual UI components.
 */
export function refreshMetadata(
  contentItems: Content[],
  options: MetadataRefreshOptions = {}
): MetadataRefreshResult {
  const asOfStr: string = getCanonicalTodayStr(options.asOfDate);
  const targetIds = options.titlesToRefresh ? new Set(options.titlesToRefresh) : null;
  const nowIso = new Date().toISOString();

  const events: MetadataTransitionEvent[] = [];
  const warnings: string[] = [];
  let updatedCount = 0;
  let unchangedCount = 0;
  let pendingCount = 0;
  let warningCount = 0;

  const updatedContent: Content[] = contentItems.map((item) => {
    if (targetIds && !targetIds.has(item.id)) {
      return item;
    }

    const previousLifecycle = item.lifecycle_status || item.status;
    const previousOtt = computeOttAvailable(item);
    const releaseDate = item.theatrical_release_date || item.release_date;

    let isTheatrical = item.theatrical_released ?? (item.status === 'released');
    let isDigital = item.digital_available ?? false;
    let isSub = item.subscription_streaming_available ?? false;
    let isOtt = previousOtt;
    let status = item.status;

    let modified = false;

    // Rule 1: Change detection for Theatrical Release
    if (releaseDate && isPastDate(releaseDate, asOfStr) && !isTheatrical) {
      isTheatrical = true;
      status = 'released';
      modified = true;
      events.push({
        titleId: item.id,
        titleName: item.title,
        previousLifecycle: previousLifecycle,
        newLifecycle: 'theatrically_released',
        transitionType: 'THEATRICAL_RELEASE',
        details: `Title '${item.title}' released theatrically on ${releaseDate} (as of ${asOfStr}).`,
      });
    }

    // Rule 2: Change detection for Digital/PVOD Availability
    if (item.digital_release_date && isPastDate(item.digital_release_date, asOfStr) && !isDigital) {
      isDigital = true;
      isOtt = true;
      modified = true;
      events.push({
        titleId: item.id,
        titleName: item.title,
        previousLifecycle: previousLifecycle,
        newLifecycle: 'digital_available',
        transitionType: 'DIGITAL_PVOD_RELEASE',
        details: `Title '${item.title}' became digitally available on ${item.digital_release_date}.`,
      });
    }

    // Rule 3: Change detection for Subscription Streaming
    if (
      item.subscription_streaming_release_date &&
      isPastDate(item.subscription_streaming_release_date, asOfStr) &&
      !isSub
    ) {
      isSub = true;
      isOtt = true;
      modified = true;
      events.push({
        titleId: item.id,
        titleName: item.title,
        previousLifecycle: previousLifecycle,
        newLifecycle: 'subscription_available',
        transitionType: 'SUBSCRIPTION_STREAMING_RELEASE',
        details: `Title '${item.title}' became available on subscription streaming on ${item.subscription_streaming_release_date}.`,
      });
    }

    // Rule 4: Provider-based verified OTT override
    if (item.streaming_providers && item.streaming_providers.length > 0) {
      const hasValidOttProvider = item.streaming_providers.some((p) => {
        const pType = classifyProviderType(p.provider_name);
        return pType === 'DIGITAL_PVOD' || pType === 'SUBSCRIPTION' || pType === 'HOME_VIDEO';
      });
      if (hasValidOttProvider && !isOtt) {
        isOtt = true;
        modified = true;
      }
    }

    // Canonical OTT rule enforcement: ott_available = digital OR subscription
    const canonicalOtt = isSub || isDigital || isOtt;

    // Evaluate canonical lifecycle_status using the single canonical function
    const patchedItem: Content = {
      ...item,
      status,
      theatrical_released: isTheatrical,
      digital_available: isDigital,
      subscription_streaming_available: isSub,
      ott_available: canonicalOtt,
    };
    const newLifecycle = classifyLifecycle(patchedItem, asOfStr);

    if (newLifecycle !== previousLifecycle && !modified) {
      modified = true;
      events.push({
        titleId: item.id,
        titleName: item.title,
        previousLifecycle,
        newLifecycle,
        transitionType: 'LIFECYCLE_PROMOTION',
        details: `Title '${item.title}' promoted from '${previousLifecycle}' to '${newLifecycle}'.`,
      });
    }

    // Rule 6: Missing / uncertain TMDB metadata check
    if (item.tmdb_id === null && status === 'released') {
      pendingCount++;
      warningCount++;
      warnings.push(
        `[PENDING_METADATA] Title '${item.id}' (${item.title}) is released but lacks verified TMDB ID. Preserving verified state.`
      );
    }

    if (modified) {
      updatedCount++;
      unchangedCount = Math.max(0, unchangedCount);
    } else {
      unchangedCount++;
    }

    return {
      ...item,
      status,
      ott_available: canonicalOtt,
      theatrical_released: isTheatrical,
      digital_available: isDigital,
      subscription_streaming_available: isSub,
      lifecycle_status: newLifecycle,
      metadata_checked_at: nowIso,
      release_metadata_checked_at: nowIso,
      ott_metadata_checked_at: nowIso,
    };
  });

  return {
    totalProcessed: contentItems.length,
    updatedCount,
    unchangedCount,
    pendingCount,
    warningCount,
    events,
    updatedContent,
    warnings,
  };
}
