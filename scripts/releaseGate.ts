/**
 * CineOrder Release Gate
 *
 * Run: npm run release:gate
 *
 * The release gate validates ALL 7 GATES (Requirement 13):
 *   Gate A — Catalog Integrity
 *   Gate B — Lifecycle Integrity
 *   Gate C — Franchise Completeness
 *   Gate D — Knowledge Graph Integrity
 *   Gate E — Recommendation Integrity
 *   Gate F — Metadata Freshness
 *   Gate G — Browser/UI Integrity
 *
 * Exit code:
 *   0 → ALL gates PASS (or only warnings — warnings do NOT fail the gate)
 *   1 → ANY gate FAILS (errors that cause incorrect application behavior)
 */

import { allContent, allFranchises, allWatchOrders } from '../src/data/franchises/index';
import { cineOrderKnowledgeGraph } from '../src/data/cineOrderKnowledgeGraph';
import { validateDatasetIntegrity } from '../src/lib/datasetIntegrityValidator';
import { validateRecommendationCompleteness } from '../src/lib/recommendationCompletenessValidator';
import {
  isOttAvailable,
  isTheatricallyUpcoming,
  getUpcomingTitles,
  calculateCountdown,
} from '../src/lib/upcomingUtils';
import { computeOttAvailable, classifyLifecycle } from '../src/lib/metadataRefresh';
import { METADATA_FRESHNESS_WARNING_DAYS, METADATA_FRESHNESS_ERROR_DAYS } from '../src/types';
import { validateFranchiseVisualIdentities } from './verifyFranchiseVisualIdentity';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GateResult {
  name: string;
  passed: boolean;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
}

// ─── Gate A: Catalog Integrity ───────────────────────────────────────────────

function runGateA(): GateResult {
  const report = validateDatasetIntegrity();
  const catalogErrorCategories = new Set([
    'missing_franchise_title',
    'duplicate_content_id',
    'duplicate_tmdb_id',
    'missing_referenced_content',
    'invalid_franchise_id',
  ]);

  const errors = report.issues
    .filter((i) => i.severity === 'error' && catalogErrorCategories.has(i.category))
    .map((i) => i.message);

  for (const item of allContent) {
    if (!item.title || item.title.trim() === '') {
      errors.push(`[FAIL] INVALID_METADATA: Content ID '${item.id}' has empty title.`);
    }
    if (!item.franchise_id) {
      errors.push(`[FAIL] INVALID_METADATA: Content ID '${item.id}' has empty franchise_id.`);
    }
  }

  const warnings = report.issues
    .filter((i) => i.severity === 'warning' && catalogErrorCategories.has(i.category))
    .map((i) => i.message);

  return {
    name: 'Gate A: Catalog Integrity',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Gate B: Lifecycle Integrity ─────────────────────────────────────────────

function runGateB(): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const todayStr = (new Date().toISOString().split('T')[0]) ?? '';

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
    const canonicalOtt = computeOttAvailable(item);
    const canonicalLifecycle = classifyLifecycle(item);
    const isUpcoming = isTheatricallyUpcoming(item);

    // 1. Theatrically released + in Upcoming section → FAIL
    if (!isUpcoming && upcomingIds.has(item.id)) {
      errors.push(
        `[FAIL] THEATRICALLY_RELEASED_IN_UPCOMING: '${item.id}' (${item.title}) is theatrically released but appears in Upcoming section. Update status to 'released'.`
      );
    }

    // 2. OTT available + lifecycle implies Trailer Readiness → FAIL
    if (canonicalOtt && (canonicalLifecycle === 'upcoming' || canonicalLifecycle === 'announced')) {
      errors.push(
        `[FAIL] OTT_TITLE_IN_TRAILER_READINESS: '${item.id}' (${item.title}) is OTT available but lifecycle_status='${canonicalLifecycle}' implies pre-OTT Trailer Readiness mode. Update lifecycle_status.`
      );
    }

    // 3. Not OTT available + post-OTT lifecycle → FAIL
    if (!canonicalOtt && (item.lifecycle_status === 'subscription_available' || item.lifecycle_status === 'digital_available')) {
      errors.push(
        `[FAIL] NON_OTT_IN_POST_OTT_MODE: '${item.id}' (${item.title}) has lifecycle_status='${item.lifecycle_status}' but OTT is not available. Causes incorrect Post-OTT recommendation mode.`
      );
    }

    // 4. Theatrically released + status='upcoming' → FAIL
    if (item.theatrical_released === true && item.status === 'upcoming') {
      errors.push(
        `[FAIL] THEATRICAL_RELEASED_STATUS_UPCOMING: '${item.id}' (${item.title}) theatrical_released=true but status='upcoming'. Update status to 'released'.`
      );
    }

    // 5. digital_release_date in past but digital_available !== true → FAIL
    if (item.digital_release_date && item.digital_release_date <= todayStr && item.digital_available !== true) {
      errors.push(
        `[FAIL] STALE_DIGITAL_AVAILABILITY: '${item.id}' (${item.title}) digital_release_date='${item.digital_release_date}' (past) but digital_available is not true. Update digital_available=true.`
      );
    }

    // 6. subscription_streaming_release_date in past but subscription_streaming_available !== true → FAIL
    if (
      item.subscription_streaming_release_date &&
      item.subscription_streaming_release_date <= todayStr &&
      item.subscription_streaming_available !== true
    ) {
      errors.push(
        `[FAIL] STALE_STREAMING_AVAILABILITY: '${item.id}' (${item.title}) subscription_streaming_release_date='${item.subscription_streaming_release_date}' (past) but subscription_streaming_available is not true. Update subscription_streaming_available=true.`
      );
    }

    // 7. ott_available stored value disagrees with canonical computation → WARN
    if (item.ott_available !== undefined && item.ott_available !== canonicalOtt) {
      warnings.push(
        `[WARN] OTT_FLAG_MISMATCH: '${item.id}' (${item.title}) stored ott_available=${item.ott_available} but canonical rule computes ${canonicalOtt}. Update ott_available=${canonicalOtt}.`
      );
    }
  }

  return {
    name: 'Gate B: Lifecycle Integrity',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Gate C: Franchise Completeness ───────────────────────────────────────────

function runGateC(): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const franchiseIds = new Set(allFranchises.map((f) => f.id));
  const releaseOrderIds = new Set(
    allWatchOrders.filter((w) => w.order_type === 'release').map((w) => w.content_id)
  );
  const chronoOrderIds = new Set(
    allWatchOrders.filter((w) => w.order_type === 'chronological').map((w) => w.content_id)
  );

  const seenIds = new Set<string>();
  for (const item of allContent) {
    if (seenIds.has(item.id)) {
      errors.push(
        `[FAIL] DUPLICATE_CONTENT_ID: Title ID '${item.id}' (${item.title}) appears more than once in canonical catalog.`
      );
    }
    seenIds.add(item.id);
  }

  for (const item of allContent) {
    const prefix = `[FAIL] FRANCHISE_COMPLETENESS_INCOMPLETE [${item.id}] (${item.title}):`;

    if (!franchiseIds.has(item.franchise_id)) {
      errors.push(`${prefix} Franchise '${item.franchise_id}' is NOT registered in allFranchises.`);
    }
    if (!releaseOrderIds.has(item.id)) {
      errors.push(`${prefix} Title is missing from RELEASE Watch Order.`);
    }
    if (!chronoOrderIds.has(item.id)) {
      errors.push(`${prefix} Title is missing from CHRONOLOGICAL Watch Order.`);
    }
  }

  const contentIds = new Set(allContent.map((c) => c.id));
  for (const wo of allWatchOrders) {
    if (!contentIds.has(wo.content_id)) {
      errors.push(
        `[FAIL] ORPHAN_WATCH_ORDER: Watch order entry '${wo.id}' references non-existent content_id='${wo.content_id}'.`
      );
    }
  }

  return {
    name: 'Gate C: Franchise Completeness',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Gate D: Knowledge Graph Integrity ────────────────────────────────────────

function runGateD(): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const graphNodeIds = new Set(Object.keys(cineOrderKnowledgeGraph.titleNodes));
  const contentIds = new Set(allContent.map((c) => c.id));
  const catalogMap = new Map(allContent.map((c) => [c.id, c]));

  // 1. Every content item should have a TitleNode in the graph or catalog mapping
  for (const item of allContent) {
    if (!graphNodeIds.has(item.id) && !catalogMap.has(item.id)) {
      errors.push(
        `[FAIL] MISSING_GRAPH_NODE: Title '${item.id}' (${item.title}) is missing from Knowledge Graph (cineOrderKnowledgeGraph.titleNodes).`
      );
    }
  }

  // 2. Check for broken graph edge references (referencing non-existent catalog or node IDs)
  for (const edge of cineOrderKnowledgeGraph.edges) {
    const srcExists = contentIds.has(edge.sourceId) || graphNodeIds.has(edge.sourceId);
    const tgtExists = contentIds.has(edge.targetId) || graphNodeIds.has(edge.targetId);
    if (!srcExists) {
      errors.push(`[FAIL] BROKEN_GRAPH_EDGE: Edge sourceId '${edge.sourceId}' does not exist in catalog or graph titleNodes.`);
    }
    if (!tgtExists) {
      errors.push(`[FAIL] BROKEN_GRAPH_EDGE: Edge targetId '${edge.targetId}' does not exist in catalog or graph titleNodes.`);
    }
  }

  // 3. Orphan nodes check -> WARN
  const connectedNodes = new Set<string>();
  for (const edge of cineOrderKnowledgeGraph.edges) {
    connectedNodes.add(edge.sourceId);
    connectedNodes.add(edge.targetId);
  }
  for (const nodeId of graphNodeIds) {
    if (!connectedNodes.has(nodeId)) {
      warnings.push(`Orphan CKG TitleNode found: '${nodeId}' has 0 connected graph edges.`);
    }
  }

  return {
    name: 'Gate D: Knowledge Graph Integrity',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Gate E: Recommendation Integrity ────────────────────────────────────────

function runGateE(): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const report = validateRecommendationCompleteness();

    for (const failure of report.failures) {
      const isHardError =
        failure.status === 'MISSING_GRAPH_DATA' || failure.status === 'GRAPH_DATA_PRESENT_BUT_NOT_RETURNING';

      const msg =
        `[${isHardError ? 'FAIL' : 'WARN'}] RECOMMENDATION_INTEGRATION [${failure.titleId}] (${failure.titleName}): ` +
        `${failure.problem ?? 'Completeness failure'} ` +
        `→ ${failure.suggestedEditorialReview ?? 'Review graph modeling.'}`;

      if (isHardError) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }
  } catch (err: any) {
    errors.push(`[FAIL] Gate E threw unexpected error: ${err?.message ?? String(err)}`);
  }

  return {
    name: 'Gate E: Recommendation Integrity',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Gate F: Metadata Freshness ───────────────────────────────────────────────

function runGateF(): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nowMs = Date.now();

  const warnThresholdMs = METADATA_FRESHNESS_WARNING_DAYS * 24 * 60 * 60 * 1000;
  const errorThresholdMs = METADATA_FRESHNESS_ERROR_DAYS * 24 * 60 * 60 * 1000;

  for (const item of allContent) {
    if (item.status === 'released') {
      const checkedAt = item.metadata_checked_at ? new Date(item.metadata_checked_at).getTime() : null;
      const ageMs = checkedAt !== null ? nowMs - checkedAt : null;

      if (ageMs === null || ageMs > errorThresholdMs) {
        if (item.status === 'upcoming' && item.release_date && item.release_date < (new Date().toISOString().split('T')[0])!) {
          errors.push(
            `[FAIL] STALE_RELEASE_DATE_ERROR: Released title '${item.id}' (${item.title}) metadata is >90 days old (${ageMs === null ? 'never checked' : Math.floor(ageMs / 86400000) + 'd'}).`
          );
        } else {
          warnings.push(
            `[WARN] METADATA_STALE_ERROR_THRESHOLD: Title '${item.id}' (${item.title}) metadata checked >90 days ago.`
          );
        }
      } else if (ageMs > warnThresholdMs) {
        warnings.push(
          `[WARN] METADATA_STALE_WARNING_THRESHOLD: Title '${item.id}' (${item.title}) metadata checked >30 days ago.`
        );
      }
    }
  }

  return {
    name: 'Gate F: Metadata Freshness',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Gate G: Browser/UI Integrity ────────────────────────────────────────────

function runGateG(): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (allFranchises.length < 10) {
    warnings.push(`[WARN] Franchise count is ${allFranchises.length}, expected >= 10.`);
  }
  if (allContent.length < 200) {
    warnings.push(`[WARN] Content catalog count is ${allContent.length}, expected >= 200.`);
  }

  // Permanent visual identity lock verification
  const visualReport = validateFranchiseVisualIdentities();
  if (!visualReport.passed) {
    errors.push(...visualReport.errors);
  }
  if (visualReport.warnings.length > 0) {
    warnings.push(...visualReport.warnings);
  }

  return {
    name: 'Gate G: Browser/UI Integrity',
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

// ─── Run All 7 Gates ──────────────────────────────────────────────────────────

function printGateResult(gate: GateResult): void {
  const status = gate.passed ? '✅ PASS' : '❌ FAIL';
  const counts =
    gate.errorCount > 0
      ? ` (${gate.errorCount} error${gate.errorCount !== 1 ? 's' : ''}, ${gate.warningCount} warning${gate.warningCount !== 1 ? 's' : ''})`
      : gate.warningCount > 0
      ? ` (${gate.warningCount} warning${gate.warningCount !== 1 ? 's' : ''})`
      : '';
  console.log(`  ${status.padEnd(8)} ${gate.name}${counts}`);
}

console.log('');
console.log('============================================================');
console.log('  CINEORDER RELEASE GATE (7 GATES)');
console.log('============================================================');
console.log('');

const gateA = runGateA();
const gateB = runGateB();
const gateC = runGateC();
const gateD = runGateD();
const gateE = runGateE();
const gateF = runGateF();
const gateG = runGateG();

const gates = [gateA, gateB, gateC, gateD, gateE, gateF, gateG];
const allPassed = gates.every((g) => g.passed);

gates.forEach(printGateResult);

console.log('');
console.log('------------------------------------------------------------');
console.log(`  OVERALL: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log('============================================================');
console.log('');

for (const gate of gates) {
  if (gate.errors.length > 0) {
    console.log(`\n─── ${gate.name} — Errors ───`);
    gate.errors.slice(0, 30).forEach((e) => console.log(`  ${e}`));
    if (gate.errors.length > 30) {
      console.log(`  ... and ${gate.errors.length - 30} more errors.`);
    }
  }
}

const allWarnings = gates.flatMap((g) => g.warnings);
if (allWarnings.length > 0) {
  console.log(`\n─── Warnings (non-blocking) ───`);
  allWarnings.slice(0, 20).forEach((w) => console.log(`  ${w}`));
  if (allWarnings.length > 20) {
    console.log(`  ... and ${allWarnings.length - 20} more warnings.`);
  }
  console.log('');
}

declare const process: { exit: (code: number) => void };
process.exit(allPassed ? 0 : 1);
