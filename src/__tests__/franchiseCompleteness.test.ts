import { allFranchises, allContent, allWatchOrders } from '../data/franchises/index';
import { getFranchiseContent, getWatchOrders } from '../data/franchises';
import type { Content } from '../types';

declare const process: { exit: (code: number) => void };

console.log('========================================================================');
console.log('      CINEORDER GLOBAL FRANCHISE COMPLETENESS TEST SUITE                ');
console.log('========================================================================\n');

let totalTestsRun = 0;
let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  totalTestsRun++;
  if (condition) {
    totalPassed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    totalFailed++;
    console.error(`  ❌ FAIL: ${testName}`);
    if (failureDetails) {
      console.error(`     Details: ${failureDetails}`);
    }
  }
}

// 1. Audit every registered franchise for matching canonical source, release order, and chrono order counts
console.log('--- 1. Canonical Source vs Watch Order Completeness ---');
for (const franchise of allFranchises) {
  const fId = franchise.id;
  const canonicalItems = getFranchiseContent(fId);

  const releaseOrders = getWatchOrders(fId).filter((w) => w.order_type === 'release');
  const chronoOrders = getWatchOrders(fId).filter((w) => w.order_type === 'chronological');

  const releaseIds = new Set(releaseOrders.map((w) => w.content_id));
  const chronoIds = new Set(chronoOrders.map((w) => w.content_id));

  const missingRelease = canonicalItems.filter((c) => !releaseIds.has(c.id));
  const missingChrono = canonicalItems.filter((c) => !chronoIds.has(c.id));

  const isReleaseComplete = missingRelease.length === 0 && releaseOrders.length === canonicalItems.length;
  const isChronoComplete = missingChrono.length === 0 && chronoOrders.length === canonicalItems.length;

  assert(
    isReleaseComplete,
    `Franchise [${fId}] Release Order matches canonical count (${canonicalItems.length})`,
    missingRelease.map((c) => c.id).join(', ')
  );

  assert(
    isChronoComplete,
    `Franchise [${fId}] Chronological Order matches canonical count (${canonicalItems.length})`,
    missingChrono.map((c) => c.id).join(', ')
  );
}

// 2. Global Duplicate ID Check
console.log('\n--- 2. Global Duplicate Content ID Audit ---');
const globalIdSet = new Set<string>();
let hasDuplicates = false;
for (const item of allContent) {
  if (globalIdSet.has(item.id)) {
    hasDuplicates = true;
    console.error(`     Duplicate ID found: "${item.id}"`);
  }
  globalIdSet.add(item.id);
}
assert(!hasDuplicates, `All ${allContent.length} canonical catalog items have globally unique IDs`);

// 3. Cross-Franchise Leak Check
console.log('\n--- 3. Cross-Franchise Isolation Audit ---');
const validFranchiseIds = new Set(allFranchises.map((f) => f.id));
let invalidFranchiseCount = 0;
for (const item of allContent) {
  if (!validFranchiseIds.has(item.franchise_id)) invalidFranchiseCount++;
}
assert(invalidFranchiseCount === 0, `All content items map to valid registered franchises`);

let leakingOrderCount = 0;
const contentMap = new Map(allContent.map((c) => [c.id, c]));
for (const order of allWatchOrders) {
  const targetContent = contentMap.get(order.content_id);
  if (!targetContent || order.franchise_id !== targetContent.franchise_id) {
    leakingOrderCount++;
  }
}
assert(leakingOrderCount === 0, `All watch orders map strictly to target content franchise ID`);

// 4. Content Types & Status Preservation
console.log('\n--- 4. Type, Status, & Metadata Resilience Audit ---');
for (const franchise of allFranchises) {
  const items = getFranchiseContent(franchise.id);
  const releaseOrders = getWatchOrders(franchise.id).filter((w) => w.order_type === 'release');
  const orderContentIds = new Set(releaseOrders.map((w) => w.content_id));

  // Verify non-OTT and missing TMDB ID items are retained
  const nonOttItems = items.filter((c) => !c.ott_available);
  const missingTmdbItems = items.filter((c) => !c.tmdb_id);

  const nonOttRetained = nonOttItems.every((c) => orderContentIds.has(c.id));
  const missingTmdbRetained = missingTmdbItems.every((c) => orderContentIds.has(c.id));

  assert(
    nonOttRetained,
    `Franchise [${franchise.id}] non-OTT items (${nonOttItems.length}) retained in watch orders`
  );
  assert(
    missingTmdbRetained,
    `Franchise [${franchise.id}] pending TMDB items (${missingTmdbItems.length}) retained in watch orders`
  );
}

// 5. Pipeline Resilience: Dynamic Fallback Generation Test
console.log('\n--- 5. Dynamic Fallback Generation Pipeline Test ---');
const testFranchiseId = 'insidious';
const existingContent = getFranchiseContent(testFranchiseId);

const dummyItem: Content = {
  id: 'test-synth-item',
  franchise_id: testFranchiseId,
  tmdb_id: null,
  title: 'Test Synthetic Insidious Film',
  type: 'movie',
  poster_url: '/placeholder.svg',
  backdrop_url: '/placeholder.svg',
  overview: 'Synthetic test item',
  release_date: '2026-12-31',
  runtime: 90,
  episode_count: null,
  season_count: null,
  rating: 7.0,
  status: 'upcoming',
  genres: ['Horror'],
  director: 'Test Director',
  cast: [],
  trailer_url: '',
  is_canon: true,
  is_required: true,
  streaming_providers: [],
  ott_available: false,
  created_at: '2026-01-01',
};

const augmentedContent = [...existingContent, dummyItem];
const augmentedOrders = getWatchOrders(testFranchiseId, augmentedContent);

const synthRelease = augmentedOrders.filter((w) => w.order_type === 'release');
const synthChrono = augmentedOrders.filter((w) => w.order_type === 'chronological');

const synthReleaseFound = synthRelease.some((w) => w.content_id === dummyItem.id);
const synthChronoFound = synthChrono.some((w) => w.content_id === dummyItem.id);

assert(
  synthReleaseFound && synthRelease.length === augmentedContent.length,
  `Dynamic release order generation automatically incorporates new content without manual code changes`
);
assert(
  synthChronoFound && synthChrono.length === augmentedContent.length,
  `Dynamic chronological order generation automatically incorporates new content without manual code changes`
);

console.log('\n========================================================================');
console.log(` SUMMARY: ${totalPassed} / ${totalTestsRun} assertions passed.`);
console.log('========================================================================\n');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
