/**
 * CineOrder Metadata Freshness Audit
 *
 * Run: npm run audit:metadata
 *
 * Produces a full per-title metadata freshness report covering:
 *   - Theatrical Status
 *   - Digital/PVOD Status
 *   - Subscription OTT Status
 *   - OTT Availability
 *   - Metadata Freshness (age of metadata_checked_at)
 *   - TMDB Verification Status
 *   - Lifecycle Consistency (canonical vs stored)
 *   - Per-row Result
 *
 * Exit code policy (Requirement 30):
 *   Exit 1  → actual application inconsistency (lifecycle errors, OTT mode errors, integrity errors)
 *   Exit 0  → warnings or pending only (temporary unavailability, stale-but-non-breaking data)
 *
 * DO NOT fail the build merely because external metadata is temporarily unavailable.
 */

import { allContent, allFranchises } from '../src/data/franchises/index';
import { refreshMetadata } from '../src/lib/metadataRefresh';
import { classifyLifecycle, computeOttAvailable } from '../src/lib/metadataRefresh';
import { validateDatasetIntegrity } from '../src/lib/datasetIntegrityValidator';
import { isOttAvailable, isTheatricallyUpcoming } from '../src/lib/upcomingUtils';
import { METADATA_FRESHNESS_WARNING_DAYS } from '../src/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function padEnd(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function padStart(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
}

function metadataFreshnessLabel(checkedAt?: string): string {
  if (!checkedAt) return 'NEVER';
  const ageMs = Date.now() - new Date(checkedAt).getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  if (ageDays <= METADATA_FRESHNESS_WARNING_DAYS) return `current(${ageDays}d)`;
  return `STALE(${ageDays}d)`;
}

function tmdbLabel(item: { tmdb_id: number | null; status: string }): string {
  if (item.tmdb_id) return 'verified';
  if (item.status === 'released') return 'MISSING';
  return 'pending';
}

// ─── Run Refresh & Integrity ─────────────────────────────────────────────────

const refreshResult = refreshMetadata(allContent);
const integrityReport = validateDatasetIntegrity();
const todayStr = (new Date().toISOString().split('T')[0]) ?? '';

// ─── Summarise Counts ────────────────────────────────────────────────────────

let currentCount = 0;
let pendingCount = 0;
let staleCount = 0;
let lifecycleErrors = 0;
let ottModeErrors = 0;

type RowResult = 'PASS' | 'WARN' | 'ERROR';

interface AuditRow {
  title: string;
  franchise: string;
  theatrical: string;
  digital: string;
  subOtt: string;
  ott: string;
  freshness: string;
  tmdb: string;
  lifecycle: string;
  result: RowResult;
}

const rows: AuditRow[] = [];

for (const item of allContent) {
  const franchise = allFranchises.find((f) => f.id === item.franchise_id)?.name ?? item.franchise_id;

  // Theatrical status
  const theatricalStatus = item.theatrical_released
    ? 'released'
    : isTheatricallyUpcoming(item)
    ? 'upcoming'
    : item.status;

  // Digital status
  const digitalStatus = item.digital_available
    ? 'available'
    : item.digital_release_date
    ? `pending(${item.digital_release_date})`
    : 'N/A';

  // Subscription OTT status
  const subOttStatus = item.subscription_streaming_available
    ? 'available'
    : item.subscription_streaming_release_date
    ? `pending(${item.subscription_streaming_release_date})`
    : 'N/A';

  // OTT status
  const ottStatus = computeOttAvailable(item) ? 'available' : 'not-available';

  // Freshness
  const freshness = metadataFreshnessLabel(item.metadata_checked_at);

  // TMDB
  const tmdb = tmdbLabel(item);

  // Lifecycle consistency
  const canonicalLifecycle = classifyLifecycle(item);
  const storedLifecycle = item.lifecycle_status ?? '(unset)';
  let lifecycleConsistency: string;
  let rowResult: RowResult = 'PASS';

  if (storedLifecycle === '(unset)') {
    lifecycleConsistency = `⚠️ unset(should=${canonicalLifecycle})`;
    rowResult = 'WARN';
  } else if (canonicalLifecycle !== storedLifecycle) {
    const isBreaking =
      (canonicalLifecycle === 'subscription_available' || canonicalLifecycle === 'digital_available') &&
      (storedLifecycle === 'upcoming' || storedLifecycle === 'announced' || storedLifecycle === 'theatrically_released');
    lifecycleConsistency = isBreaking
      ? `❌ stored=${storedLifecycle} canonical=${canonicalLifecycle}`
      : `⚠️ stored=${storedLifecycle} canonical=${canonicalLifecycle}`;
    rowResult = isBreaking ? 'ERROR' : 'WARN';
  } else {
    lifecycleConsistency = `✅ ${canonicalLifecycle}`;
  }

  // Staleness counts
  if (item.tmdb_id === null) {
    pendingCount++;
  } else if (freshness.startsWith('STALE') || freshness === 'NEVER') {
    staleCount++;
  } else {
    currentCount++;
  }

  // Error counting
  if (rowResult === 'ERROR') lifecycleErrors++;

  // OTT consistency check
  const ottIsOtt = isOttAvailable(item);
  const isUpcoming = isTheatricallyUpcoming(item);
  if (ottIsOtt && isUpcoming) ottModeErrors++;

  rows.push({
    title: item.title,
    franchise,
    theatrical: theatricalStatus,
    digital: digitalStatus,
    subOtt: subOttStatus,
    ott: ottStatus,
    freshness,
    tmdb,
    lifecycle: lifecycleConsistency,
    result: rowResult,
  });
}

// Integrate integrity report errors
const integrityErrors = integrityReport.issues.filter((i) => i.severity === 'error');
lifecycleErrors += integrityErrors.filter((i) =>
  ['upcoming_lifecycle_mismatch', 'theatrical_upcoming_mismatch'].includes(i.category)
).length;
ottModeErrors += integrityErrors.filter((i) =>
  ['pre_ott_post_ott_mismatch', 'post_ott_pre_ott_mismatch', 'stale_ott_availability', 'ott_mode_mismatch'].includes(i.category)
).length;

// ─── Print Full Per-Title Table ───────────────────────────────────────────────

const COL_TITLE   = 42;
const COL_FR      = 20;
const COL_THEAT   = 10;
const COL_DIG     = 8;
const COL_SUB     = 8;
const COL_OTT     = 13;
const COL_FRESH   = 14;
const COL_TMDB    = 8;
const COL_LIFE    = 40;
const COL_RESULT  = 6;

function printRow(row: AuditRow): void {
  const r = row.result === 'PASS' ? '✅' : row.result === 'WARN' ? '⚠️' : '❌';
  console.log(
    padEnd(row.title, COL_TITLE) + ' | ' +
    padEnd(row.franchise, COL_FR) + ' | ' +
    padEnd(row.theatrical, COL_THEAT) + ' | ' +
    padEnd(row.digital, COL_DIG) + ' | ' +
    padEnd(row.subOtt, COL_SUB) + ' | ' +
    padEnd(row.ott, COL_OTT) + ' | ' +
    padEnd(row.freshness, COL_FRESH) + ' | ' +
    padEnd(row.tmdb, COL_TMDB) + ' | ' +
    padEnd(row.lifecycle, COL_LIFE) + ' | ' +
    r
  );
}

function printDivider(): void {
  const total =
    COL_TITLE + COL_FR + COL_THEAT + COL_DIG + COL_SUB + COL_OTT + COL_FRESH + COL_TMDB + COL_LIFE + COL_RESULT +
    (9 * 3); // ' | ' separators
  console.log('-'.repeat(total));
}

console.log('');
console.log('============================================================');
console.log('  CINEORDER METADATA FRESHNESS AUDIT');
console.log('============================================================');
console.log('');

// Header
console.log(
  padEnd('Title', COL_TITLE) + ' | ' +
  padEnd('Franchise', COL_FR) + ' | ' +
  padEnd('Theatrical', COL_THEAT) + ' | ' +
  padEnd('Digital', COL_DIG) + ' | ' +
  padEnd('Sub OTT', COL_SUB) + ' | ' +
  padEnd('OTT Status', COL_OTT) + ' | ' +
  padEnd('Freshness', COL_FRESH) + ' | ' +
  padEnd('TMDB', COL_TMDB) + ' | ' +
  padEnd('Lifecycle Consistency', COL_LIFE) + ' | ' +
  'Result'
);
printDivider();

// Sort: ERRORs first, then WARNs, then PASSes
rows.sort((a, b) => {
  const rank = { ERROR: 0, WARN: 1, PASS: 2 };
  return rank[a.result] - rank[b.result];
});

for (const row of rows) {
  printRow(row);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('');
console.log('============================================================');
console.log(`Total Titles:           ${allContent.length}`);
console.log(`Current:                ${currentCount}`);
console.log(`Pending Verification:   ${pendingCount}`);
console.log(`Stale:                  ${staleCount}`);
console.log(`Lifecycle Errors:       ${lifecycleErrors}`);
console.log(`OTT Mode Errors:        ${ottModeErrors}`);
console.log(`Integrity Errors:       ${integrityReport.errorCount}`);
console.log(`Integrity Warnings:     ${integrityReport.warningCount}`);
console.log('');

if (refreshResult.warnings.length > 0) {
  console.log('--- Metadata Refresh Warnings ---');
  refreshResult.warnings.slice(0, 10).forEach((w) => console.log(`  ⚠️  ${w}`));
  if (refreshResult.warnings.length > 10) {
    console.log(`  ... and ${refreshResult.warnings.length - 10} more warnings.`);
  }
  console.log('');
}

if (integrityReport.issues.filter((i) => i.severity === 'error').length > 0) {
  console.log('--- Integrity Errors ---');
  integrityReport.issues
    .filter((i) => i.severity === 'error')
    .slice(0, 20)
    .forEach((i) => console.log(`  ❌ ${i.message}`));
  if (integrityReport.issues.filter((i) => i.severity === 'error').length > 20) {
    const extra = integrityReport.issues.filter((i) => i.severity === 'error').length - 20;
    console.log(`  ... and ${extra} more errors.`);
  }
  console.log('');
}

// Exit code policy:
//   Exit 1 → actual application inconsistency (lifecycle/OTT errors, hard integrity errors)
//   Exit 0 → only warnings/pending (does not fail the build for temporary unavailability)
const hasApplicationInconsistency =
  lifecycleErrors > 0 ||
  ottModeErrors > 0 ||
  integrityErrors.filter((i) =>
    !['metadata_refresh_required', 'released_without_ott_data', 'stale_lifecycle_status'].includes(i.category)
  ).length > 0;

const result = hasApplicationInconsistency ? 'FAIL' : 'PASS';
console.log(`Result: ${result}`);
console.log('============================================================');
console.log('');

declare const process: { exit: (code: number) => void };
if (hasApplicationInconsistency) {
  process.exit(1);
} else {
  process.exit(0);
}
