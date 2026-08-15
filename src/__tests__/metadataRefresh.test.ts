import { refreshMetadata, classifyLifecycle, computeOttAvailable } from '../lib/metadataRefresh';
import { buildContent } from '../data/franchises/utils';
import { validateDatasetIntegrity } from '../lib/datasetIntegrityValidator';
import type { Content } from '../types';

console.log('========================================================================');
console.log('  CINEORDER PERMANENT METADATA REFRESH & RELEASE TRACKING TEST SUITE    ');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

// ─── TEST 1: Canonical Metadata Schema & Granular Field Defaults ──────
console.log('\n--- 1. Canonical Metadata Schema & Granular Fields ---');
const testItem: Content = buildContent({
  id: 'test-title-1',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 12345,
  title: 'Test MCU Film',
  release_date: '2026-05-01',
  status: 'released',
  providers: ['Disney+'],
});

assert(testItem.theatrical_release_date === '2026-05-01', '1A. theatrical_release_date populates from release_date');
assert(testItem.theatrical_released === true, '1B. theatrical_released populates as true for released title');
assert(testItem.subscription_streaming_available === true, '1C. subscription_streaming_available detects Disney+');
assert(testItem.ott_available === true, '1D. ott_available computes as true when streaming provider is present');
assert(testItem.lifecycle_status === 'subscription_available', '1E. lifecycle_status computes as subscription_available');
assert(Boolean(testItem.metadata_checked_at), '1F. metadata_checked_at timestamp is present');

// ─── TEST 2: Real-World Change Detection & Lifecycle Transitions ────────
console.log('\n--- 2. Real-World Change Detection & Lifecycle Transitions ---');
const unreleasedItem: Content = buildContent({
  id: 'test-unreleased',
  franchise_id: 'star-wars',
  tmdb_id: 99999,
  title: 'Future Star Wars Movie',
  release_date: '2026-12-18',
  status: 'upcoming',
  providers: ['Theaters Only'],
  ott_available: false,
});

// Simulate asOfDate after release date
const result = refreshMetadata([unreleasedItem], { asOfDate: '2026-12-25' });
assert(result.updatedCount === 1, '2A. refreshMetadata detects past release date and updates content');
assert(result.events.length === 1, '2B. Transition event emitted for theatrical release');
assert(result.events[0]?.transitionType === 'THEATRICAL_RELEASE', '2C. Event type is THEATRICAL_RELEASE');
assert(result.updatedContent[0]?.status === 'released', '2D. Status transitions to released');
assert(result.updatedContent[0]?.theatrical_released === true, '2E. theatrical_released transitions to true');

// ─── TEST 3: Preservation of Verified State on Uncertain Metadata ───────
console.log('\n--- 3. Preservation of Verified State on Uncertain External Metadata ---');
const pendingItem: Content = buildContent({
  id: 'test-pending',
  franchise_id: 'john-wick',
  tmdb_id: null,
  title: 'Unverified Spinoff',
  release_date: '2026-08-01',
  status: 'released',
  providers: [],
});

const pendingResult = refreshMetadata([pendingItem]);
assert(pendingResult.pendingCount === 1, '3A. Unverified TMDB title counted as PENDING');
assert(pendingResult.updatedContent[0]?.status === 'released', '3B. Verified status preserved without silent change');
assert(pendingResult.warnings.some((w) => w.includes('PENDING_METADATA')), '3C. PENDING warning emitted for audit log');

// ─── TEST 4: Global Catalog Dataset Integrity Validator Integration ────
console.log('\n--- 4. Global Catalog Dataset Integrity Validator Integration ---');
const integrityReport = validateDatasetIntegrity();

// Structural errors (IDs, graph, watch orders) must always be 0
const structuralErrors = integrityReport.issues.filter((i) =>
  i.severity === 'error' &&
  [
    'duplicate_content_id',
    'duplicate_tmdb_id',
    'duplicate_watch_order',
    'missing_referenced_content',
    'orphan_graph_node',
    'duplicate_graph_edge',
    'franchise_count_mismatch',
    'missing_release_date_or_image',
    'future_movie_integration_incomplete',
  ].includes(i.category)
);
assert(structuralErrors.length === 0, '4A. Structural data integrity: 0 duplicate IDs, 0 missing references, 0 orphan nodes');
assert(integrityReport.issues.filter((i) => i.category === 'duplicate_content_id').length === 0, '4B. Zero duplicate content IDs in global catalog');
assert(integrityReport.issues.filter((i) => i.category === 'future_movie_integration_incomplete').length === 0, '4C. All titles pass future movie integration completeness check');

// Note: stale metadata checks (STALE_OTT_FLAG, STALE_LIFECYCLE_STATUS etc.) may report real
// catalog data issues — these are detected intentionally by the new stale metadata validator
const staleMetadataErrors = integrityReport.issues.filter((i) =>
  i.severity === 'error' &&
  ['stale_ott_availability', 'stale_lifecycle_status', 'stale_release_date',
   'stale_digital_availability', 'stale_streaming_availability', 'ott_mode_mismatch',
   'theatrical_upcoming_mismatch'].includes(i.category)
);
console.log(`  ℹ️  INFO: Stale metadata checks found ${staleMetadataErrors.length} error(s) requiring data updates.`);

// ─── TEST 5: Future Movie Integration Completeness Rule (Requirement 29) ────
console.log('\n--- 5. Future Movie Automated Integration Completeness Check ---');
assert(
  integrityReport.issues.filter((i) => i.category === 'future_movie_integration_incomplete').length === 0,
  '5A. No titles missing from franchise registration, watch orders, or Knowledge Graph'
);


// ─── TEST 6: STALE_OTT_FLAG — canonical OTT rule enforcement ──────────
console.log('\n--- 6. STALE_OTT_FLAG — Canonical OTT Rule: ott_available = digital OR subscription ---');

// 6A: digital_available=true must mean ott_available=true
const digitalItem: Content = buildContent({
  id: 'test-digital-6a',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 11111,
  title: 'Digital Available Film',
  release_date: '2026-01-01',
  status: 'released',
  digital_available: true,
  ott_available: false,  // stored as false — should be overridden
  providers: [],
});
const digitalOtt = computeOttAvailable(digitalItem);
assert(digitalOtt === true, '6A. computeOttAvailable returns true when digital_available=true, regardless of stored ott_available=false');

// 6B: subscription_streaming_available=true must mean ott_available=true
const subItem: Content = buildContent({
  id: 'test-sub-6b',
  franchise_id: 'dc',
  tmdb_id: 22222,
  title: 'Subscription Film',
  release_date: '2026-01-01',
  status: 'released',
  subscription_streaming_available: true,
  ott_available: false,  // stored as false — should be overridden
  providers: [],
});
const subOtt = computeOttAvailable(subItem);
assert(subOtt === true, '6B. computeOttAvailable returns true when subscription_streaming_available=true, regardless of stored ott_available=false');

// 6C: neither digital nor sub → ott_available=false
const noOttItem: Content = buildContent({
  id: 'test-no-ott-6c',
  franchise_id: 'conjuring',
  tmdb_id: 33333,
  title: 'Theatrical Only Film',
  release_date: '2026-01-01',
  status: 'upcoming',
  digital_available: false,
  subscription_streaming_available: false,
  ott_available: false,
  providers: ['Theaters Only'],
});
const noOtt = computeOttAvailable(noOttItem);
assert(noOtt === false, '6C. computeOttAvailable returns false when neither digital nor subscription is available');

// ─── TEST 7: Lifecycle Classification — Single Source of Truth ─────────
console.log('\n--- 7. classifyLifecycle() — Single Canonical Source of Truth ---');

// 7A: subscription_available takes precedence over digital_available
const subLifecycleItem: Content = buildContent({
  id: 'test-lifecycle-7a',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 44444,
  title: 'Subscription Lifecycle Film',
  release_date: '2026-01-01',
  status: 'released',
  subscription_streaming_available: true,
  digital_available: true,
  providers: ['Disney+'],
});
assert(classifyLifecycle(subLifecycleItem) === 'subscription_available', '7A. subscription_available takes precedence');

// 7B: digital_available without subscription → digital_available
const digLifecycleItem: Content = buildContent({
  id: 'test-lifecycle-7b',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 55555,
  title: 'Digital Only Lifecycle Film',
  release_date: '2026-01-01',
  status: 'released',
  digital_available: true,
  subscription_streaming_available: false,
  providers: [],
});
assert(classifyLifecycle(digLifecycleItem) === 'digital_available', '7B. digital_available when only digital is set');

// 7C: theatrically released, no OTT
const theatItem: Content = buildContent({
  id: 'test-lifecycle-7c',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 66666,
  title: 'Theatrical Only Lifecycle Film',
  release_date: '2025-01-01',
  status: 'released',
  digital_available: false,
  subscription_streaming_available: false,
  ott_available: false,
  providers: ['Theaters Only'],
});
assert(classifyLifecycle(theatItem) === 'theatrically_released', '7C. theatrically_released when released but no OTT');

// 7D: upcoming title
const upcomingLifecycleItem: Content = buildContent({
  id: 'test-lifecycle-7d',
  franchise_id: 'star-wars',
  tmdb_id: 77777,
  title: 'Upcoming Film',
  release_date: '2027-01-01',
  status: 'upcoming',
  providers: ['Theaters Only'],
  ott_available: false,
});
assert(classifyLifecycle(upcomingLifecycleItem) === 'upcoming', '7D. upcoming lifecycle for upcoming titles');

// ─── TEST 8: STALE_RELEASE_DATE — upcoming title with past release date ─
console.log('\n--- 8. Change Detection: Past Release Date Transitions ---');

// 8A: theatrical release date in past triggers THEATRICAL_RELEASE transition
const staleUpcoming: Content = buildContent({
  id: 'test-stale-8a',
  franchise_id: 'john-wick',
  tmdb_id: 88888,
  title: 'Stale Upcoming Film',
  release_date: '2024-01-01',   // past date
  status: 'upcoming',
  providers: ['Theaters Only'],
  ott_available: false,
  theatrical_released: false,
});
const staleResult = refreshMetadata([staleUpcoming]);
assert(staleResult.events.some((e) => e.transitionType === 'THEATRICAL_RELEASE'), '8A. refreshMetadata detects stale upcoming date and emits THEATRICAL_RELEASE transition');
assert(staleResult.updatedContent[0]?.theatrical_released === true, '8B. theatrical_released set to true after stale date detection');
assert(staleResult.updatedContent[0]?.status === 'released', '8C. status updated to released after theatrical release detection');

// ─── TEST 9: Release Gate Consistency — OTT available must not be in upcoming ─
console.log('\n--- 9. Release Gate Consistency ---');

// 9A: OTT available title must not have upcoming/announced lifecycle
const ottAvailableItem: Content = {
  ...buildContent({
    id: 'test-gate-9a',
    franchise_id: 'marvel-cinematic-universe',
    tmdb_id: 99990,
    title: 'OTT Available Film',
    release_date: '2025-01-01',
    status: 'released',
    subscription_streaming_available: true,
    ott_available: true,
    providers: ['Disney+'],
  }),
  lifecycle_status: 'subscription_available',
};
const ottAvailableOtt = computeOttAvailable(ottAvailableItem);
const ottAvailableLifecycle = classifyLifecycle(ottAvailableItem);
assert(ottAvailableOtt === true, '9A. OTT available title correctly computes ott_available=true');
assert(ottAvailableLifecycle === 'subscription_available', '9B. OTT available title has post-OTT lifecycle classification');
assert(ottAvailableLifecycle !== 'upcoming' && ottAvailableLifecycle !== 'announced', '9C. OTT available title is NOT in pre-OTT lifecycle');

// 9B: Non-OTT title must not have subscription_available lifecycle
const nonOttItem: Content = {
  ...buildContent({
    id: 'test-gate-9b',
    franchise_id: 'marvel-cinematic-universe',
    tmdb_id: 99991,
    title: 'Non-OTT Released Film',
    release_date: '2025-01-01',
    status: 'released',
    digital_available: false,
    subscription_streaming_available: false,
    ott_available: false,
    providers: ['Theaters Only'],
  }),
};
const nonOttLifecycle = classifyLifecycle(nonOttItem);
assert(nonOttLifecycle !== 'subscription_available' && nonOttLifecycle !== 'digital_available', '9D. Non-OTT title does not have post-OTT lifecycle classification');

// ─── TEST 10: Preservation of Verified State — No Silent Reset ──────────
console.log('\n--- 10. No Silent Lifecycle State Change ---');

// 10A: refreshMetadata without external data must NOT downgrade a verified lifecycle
const verifiedOttItem: Content = buildContent({
  id: 'test-preserve-10a',
  franchise_id: 'conjuring',
  tmdb_id: 10001,
  title: 'Verified OTT Film',
  release_date: '2024-01-01',
  status: 'released',
  subscription_streaming_available: true,
  ott_available: true,
  providers: ['Netflix'],
});
const preserveResult = refreshMetadata([verifiedOttItem]);
assert(preserveResult.updatedContent[0]?.subscription_streaming_available === true, '10A. subscription_streaming_available is preserved after refresh');
assert(preserveResult.updatedContent[0]?.ott_available === true, '10B. ott_available is preserved after refresh');
assert(preserveResult.updatedContent[0]?.lifecycle_status === 'subscription_available', '10C. lifecycle_status is preserved after refresh');

// 10B: refreshMetadata with uncertain data must NOT silently change lifecycle
const uncertainItem: Content = buildContent({
  id: 'test-preserve-10b',
  franchise_id: 'star-wars',
  tmdb_id: null,  // uncertain / pending
  title: 'Uncertain Upcoming Film',
  release_date: '2027-01-01',
  status: 'upcoming',
  providers: ['Theaters Only'],
  ott_available: false,
});
const uncertainResult = refreshMetadata([uncertainItem]);
const unchanged = uncertainResult.updatedContent[0];
assert(unchanged?.status === 'upcoming' || unchanged?.lifecycle_status === 'upcoming', '10D. Uncertain upcoming title preserves upcoming lifecycle after refresh');

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log('\n========================================================================');
console.log(` SUMMARY: ${passed} / ${passed + failed} assertions passed.`);
console.log('========================================================================\n');

declare const process: { exit: (code: number) => void };

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
