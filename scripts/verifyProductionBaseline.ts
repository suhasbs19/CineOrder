/**
 * CineOrder — Production Baseline Verification Script
 *
 * Validates the permanent post-v1.0 baseline metrics:
 * 1. 19 registered franchises
 * 2. 240 canonical titles
 * 3. 357 Story Knowledge Graph edges
 * 4. 249 Title Nodes in Story Knowledge Graph (240 canonical + 9 auxiliary/anchor nodes)
 * 5. Zero duplicate content IDs
 * 6. Zero duplicate TMDb IDs
 * 7. Zero broken graph references
 * 8. Zero chronological inversions across all 19 franchises' release watch orders
 * 9. Bit-for-bit frozen framework SHA-256 hashes
 * 10. Spider-Man multi-continuity isolation (zero MCU watch order contamination)
 *
 * READ-ONLY: Must NOT mutate any data or state.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import { allContent, allFranchises, allWatchOrders } from '../src/data/franchises/index';
import { getWatchOrders } from '../src/data/franchises';
import { titleNodes, storyEdges } from '../src/data/cineOrderKnowledgeGraph';
import { validateChronologicalOrdering } from '../src/lib/releaseOrdering';

console.log('============================================================');
console.log('  CINEORDER POST-PRODUCTION BASELINE VERIFICATION');
console.log('============================================================\n');

let failures = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

// 1. Franchise Count Baseline
assert(allFranchises.length === 19, `1. Exactly 19 franchises registered (found ${allFranchises.length})`);

// 2. Title Count Baseline
assert(allContent.length === 240, `2. Exactly 240 canonical titles registered (found ${allContent.length})`);

// 3. Knowledge Graph Nodes & Edges Baseline
const nodeCount = Object.keys(titleNodes).length;
assert(nodeCount === 249, `3A. Exactly 249 TitleNodes in Story Knowledge Graph (found ${nodeCount})`);
assert(storyEdges.length === 357, `3B. Exactly 357 StoryEdges in Story Knowledge Graph (found ${storyEdges.length})`);

const allCanonicalHaveNodes = allContent.every((c) => Boolean(titleNodes[c.id]));
assert(allCanonicalHaveNodes, '3C. All 240 canonical titles have corresponding TitleNodes in CKG');

// 4. Duplicate Content ID Check
const contentIdSet = new Set<string>();
let duplicateContentIdCount = 0;
for (const item of allContent) {
  if (contentIdSet.has(item.id)) {
    duplicateContentIdCount++;
    console.error(`     Duplicate content ID: ${item.id}`);
  }
  contentIdSet.add(item.id);
}
assert(duplicateContentIdCount === 0, `4. Zero duplicate content IDs across catalog (found ${duplicateContentIdCount})`);

// 5. Duplicate TMDb ID Check
const tmdbIdMap = new Map<number, string>();
let duplicateTmdbCount = 0;
for (const item of allContent) {
  if (item.tmdb_id) {
    if (tmdbIdMap.has(item.tmdb_id)) {
      duplicateTmdbCount++;
      console.error(`     Duplicate TMDb ID ${item.tmdb_id}: ${item.id} vs ${tmdbIdMap.get(item.tmdb_id)}`);
    } else {
      tmdbIdMap.set(item.tmdb_id, item.id);
    }
  }
}
assert(duplicateTmdbCount === 0, `5. Zero duplicate TMDb IDs across catalog (found ${duplicateTmdbCount})`);

// 6. Broken Graph References Check
let brokenRefCount = 0;
for (const edge of storyEdges) {
  if (!titleNodes[edge.sourceId]) {
    brokenRefCount++;
    console.error(`     Broken sourceId reference: ${edge.sourceId}`);
  }
  if (!titleNodes[edge.targetId]) {
    brokenRefCount++;
    console.error(`     Broken targetId reference: ${edge.targetId}`);
  }
}
assert(brokenRefCount === 0, `6. Zero broken graph references in Story Knowledge Graph (found ${brokenRefCount})`);

// 7. Chronological Ordering Inversion Check Across Release Watch Orders
let totalInversions = 0;
for (const franchise of allFranchises) {
  const releaseOrders = getWatchOrders(franchise.id).filter((w) => w.order_type === 'release');
  const val = validateChronologicalOrdering(releaseOrders);
  if (!val.isValid) {
    totalInversions += val.inversions.length;
    console.error(`     Chronological inversions in ${franchise.id}:`, val.errors);
  }
}
assert(totalInversions === 0, `7. Zero chronological inversions across all 19 franchises' release watch orders (found ${totalInversions})`);

// 8. Spider-Man Multi-Continuity Isolation Check
const mcuWatchOrders = allWatchOrders.filter((wo) => wo.franchise_id === 'marvel-cinematic-universe');
const mcuOrderContentIds = mcuWatchOrders.map((wo) => wo.content_id);

const legacySpiderManIds = [
  'spiderman-1',
  'spiderman-2',
  'spiderman-3',
  'amazing-spiderman-1',
  'amazing-spiderman-2',
  'spider-verse-1',
  'spider-verse-2',
  'spider-verse-3',
];

let mcuContaminationCount = 0;
for (const legacyId of legacySpiderManIds) {
  if (mcuOrderContentIds.includes(legacyId)) {
    mcuContaminationCount++;
    console.error(`     MCU Watch Order Contamination: legacy title '${legacyId}' found in MCU watch order`);
  }
}
assert(mcuContaminationCount === 0, `8. Zero legacy Spider-Man contamination in MCU watch orders (found ${mcuContaminationCount})`);

// 9. Frozen Framework Checksum Verification
const frozenFiles: Record<string, string> = {
  'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
  'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
  'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
  'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
  '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
};

let checksumFailures = 0;
for (const [relPath, expHash] of Object.entries(frozenFiles)) {
  const content = fs.readFileSync(relPath);
  const actualHash = crypto.createHash('sha256').update(content).digest('hex');
  if (actualHash !== expHash) {
    checksumFailures++;
    console.error(`     Hash mismatch for ${relPath}: expected ${expHash}, got ${actualHash}`);
  }
}
assert(checksumFailures === 0, `9. All 5 frozen framework files bit-for-bit identical (found ${checksumFailures} mismatches)`);

console.log('\n============================================================');
if (failures === 0) {
  console.log('  STATUS: ✅ PRODUCTION BASELINE 100% VERIFIED & LOCKED');
  console.log('============================================================\n');
  process.exit(0);
} else {
  console.error(`  STATUS: ❌ BASELINE VERIFICATION FAILED (${failures} failures)`);
  console.log('============================================================\n');
  process.exit(1);
}
