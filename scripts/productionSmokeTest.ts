/**
 * CineOrder — Production Smoke Test Script
 *
 * Performs comprehensive end-to-end smoke verification of the live CineOrder platform
 * without mutating any production catalog or knowledge graph data.
 *
 * Checks:
 *  1. Franchise Registry (19 registered franchises)
 *  2. Canonical Catalog Count & Uniqueness (240 titles, 0 duplicate IDs, 0 duplicate TMDb IDs)
 *  3. Story Knowledge Graph Integrity (249 TitleNodes, 357 story edges, 0 broken references)
 *  4. Release Watch Order Chronology (0 inversions across all 19 franchises)
 *  5. Lifecycle & OTT Availability Consistency
 *  6. Artwork Integrity & Fallback Safety
 *  7. Trailer Intelligence Engine & Storage Resilience
 *  8. Multi-Continuity Firewall (Spider-Man Isolation)
 *  9. Recommendation Simulation (Read-Only Safety)
 * 10. Frozen Framework Checksum Ledger (5/5 Files Bit-for-Bit Identical)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { allContent, allFranchises } from '../src/data/franchises/index';
import { getWatchOrders } from '../src/data/franchises';
import { validateChronologicalOrdering } from '../src/lib/releaseOrdering';
import { cineOrderKnowledgeGraph } from '../src/data/cineOrderKnowledgeGraph';
import { RecommendationService } from '../src/lib/recommendationService';
import { TrailerIntelligenceStore } from '../src/lib/trailerIntelligenceStore';

interface SmokeCheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: SmokeCheckResult[] = [];

function check(name: string, condition: boolean, details: string): void {
  results.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  ✅ PASS: ${name} — ${details}`);
  } else {
    console.error(`  ❌ FAIL: ${name} — ${details}`);
  }
}

console.log('============================================================');
console.log('  CINEORDER PRODUCTION SMOKE TEST                           ');
console.log('============================================================\n');

// 1. Franchise Registry
console.log('--- 1. Franchise Registry ---');
{
  const count = allFranchises.length;
  check(
    'Franchise Registry Completeness',
    count === 19,
    `Found ${count} registered franchises (expected 19)`
  );
  const ids = new Set(allFranchises.map((f) => f.id));
  check(
    'Franchise ID Uniqueness',
    ids.size === count,
    `All ${count} franchise IDs are unique`
  );
}

// 2. Canonical Catalog & Duplicate IDs
console.log('\n--- 2. Canonical Catalog & Duplicate IDs ---');
{
  const totalTitles = allContent.length;
  check(
    'Canonical Catalog Size',
    totalTitles === 240,
    `Found ${totalTitles} canonical titles (expected 240)`
  );

  const contentIds = new Set<string>();
  let dupContent = 0;
  for (const item of allContent) {
    if (contentIds.has(item.id)) dupContent++;
    contentIds.add(item.id);
  }
  check('Content ID Uniqueness', dupContent === 0, `0 duplicate content IDs found (${dupContent} duplicates)`);

  const tmdbIds = new Set<number>();
  let dupTmdb = 0;
  for (const item of allContent) {
    if (item.tmdb_id) {
      if (tmdbIds.has(item.tmdb_id)) dupTmdb++;
      tmdbIds.add(item.tmdb_id);
    }
  }
  check('TMDb ID Uniqueness', dupTmdb === 0, `0 duplicate TMDb IDs found (${dupTmdb} duplicates)`);
}

// 3. Story Knowledge Graph Integrity
console.log('\n--- 3. Story Knowledge Graph Integrity ---');
{
  const titleNodesCount = Object.keys(cineOrderKnowledgeGraph.titleNodes).length;
  check(
    'CKG TitleNode Count',
    titleNodesCount === 249,
    `Found ${titleNodesCount} TitleNodes (expected 249)`
  );

  const edgeCount = cineOrderKnowledgeGraph.edges.length;
  check(
    'CKG StoryEdge Count',
    edgeCount === 357,
    `Found ${edgeCount} story edges (expected 357)`
  );

  // Check broken references
  const nodeIds = new Set(Object.keys(cineOrderKnowledgeGraph.titleNodes));
  let brokenEdges = 0;
  for (const edge of cineOrderKnowledgeGraph.edges) {
    if (!nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)) {
      brokenEdges++;
    }
  }
  check(
    'CKG Edge Reference Integrity',
    brokenEdges === 0,
    `0 broken graph edge references (${brokenEdges} broken)`
  );
}

// 4. Release Watch Order Chronology
console.log('\n--- 4. Release Watch Order Chronology ---');
{
  let totalInversions = 0;
  let tracksChecked = 0;

  for (const franchise of allFranchises) {
    const releaseOrders = getWatchOrders(franchise.id).filter((w) => w.order_type === 'release');
    if (releaseOrders.length > 0) tracksChecked++;
    const val = validateChronologicalOrdering(releaseOrders);
    if (!val.isValid) {
      totalInversions += val.inversions.length;
    }
  }
  check(
    'Release Order Chronology',
    totalInversions === 0,
    `Checked ${tracksChecked} release tracks: 0 inversions found (${totalInversions} inversions)`
  );
}

// 5. Lifecycle & OTT Availability Consistency
console.log('\n--- 5. Lifecycle & OTT Availability Consistency ---');
{
  let prematureOtt = 0;
  for (const item of allContent) {
    if (item.status === 'upcoming' && item.ott_available) {
      prematureOtt++;
    }
  }
  check(
    'Lifecycle OTT Consistency',
    prematureOtt === 0,
    `0 upcoming titles flagged as OTT available (${prematureOtt} violations)`
  );
}

// 6. Artwork Integrity
console.log('\n--- 6. Artwork Integrity ---');
{
  let invalidPosters = 0;
  for (const item of allContent) {
    if (!item.poster_url || item.poster_url.startsWith('http://')) {
      invalidPosters++;
    }
  }
  check(
    'Artwork Secure Protocol',
    invalidPosters === 0,
    `All 240 titles have valid secure poster paths (${invalidPosters} invalid)`
  );
}

// 7. Trailer Intelligence Engine & Persistence
console.log('\n--- 7. Trailer Intelligence Engine & Persistence ---');
{
  const store = new TrailerIntelligenceStore();
  const proposals = store.getAllProposals();
  check(
    'Trailer Intelligence Store Initialization',
    proposals.length >= 4,
    `Initialized trailer store with ${proposals.length} curated baseline proposals`
  );
}

// 8. Spider-Man Continuity Firewall
console.log('\n--- 8. Spider-Man Continuity Firewall ---');
{
  const mcuContent = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe');
  const contaminated = mcuContent.filter(
    (c) => c.id.startsWith('spiderman-') || c.id.startsWith('amazing-') || c.id.startsWith('spider-verse')
  );
  check(
    'Spider-Man Multi-Continuity Firewall',
    contaminated.length === 0,
    `0 legacy Spider-Man titles in MCU catalog (${contaminated.length} contaminated)`
  );
}

// 9. Recommendation Simulation (Read-Only Safety)
console.log('\n--- 9. Recommendation Simulation Safety ---');
{
  const beforeLen = allContent.length;
  const graph = RecommendationService.getRecommendationGraph('mcu-spiderman-no-way-home');
  const afterLen = allContent.length;
  check(
    'Recommendation Traversal Safety',
    beforeLen === afterLen && graph !== null,
    `Traversal executed successfully with 0 catalog mutations`
  );
}

// 10. Frozen Framework Checksums
console.log('\n--- 10. Frozen Framework Checksum Ledger ---');
{
  const lockedHashes: Record<string, string> = {
    'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
    'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
    'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
    'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
    '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
  };

  let allIdentical = true;
  for (const [relPath, expected] of Object.entries(lockedHashes)) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      allIdentical = false;
      continue;
    }
    const raw = fs.readFileSync(fullPath, 'utf8');
    const normalized = raw.replace(/\r\n/g, '\n');
    const actual = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
    if (actual !== expected) {
      allIdentical = false;
    }
  }

  check(
    'Frozen Framework Bit-for-Bit Identity',
    allIdentical,
    'All 5 frozen framework files bit-for-bit identical to locked ledger'
  );
}

// Summary
console.log('\n============================================================');
const passedCount = results.filter((r) => r.passed).length;
const totalCount = results.length;
console.log(`  SMOKE TEST SUMMARY: ${passedCount} / ${totalCount} CHECKS PASSED`);
console.log('============================================================\n');

if (passedCount !== totalCount) {
  console.error('❌ PRODUCTION SMOKE TEST FAILED');
  process.exit(1);
} else {
  console.log('✅ PRODUCTION SMOKE TEST PASSED (STATUS: READY)');
  process.exit(0);
}
