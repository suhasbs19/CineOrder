/**
 * CineOrder — Production Baseline Regression Test Suite
 *
 * Permanent regression suite validating that all production baseline invariants
 * remain intact across any future code edits, updates, or maintenance cycles.
 */

// @ts-ignore
import * as crypto from 'crypto';
// @ts-ignore
import * as fs from 'fs';
import { allContent, allFranchises, allWatchOrders } from '../data/franchises/index';
import { getWatchOrders } from '../data/franchises';
import { titleNodes, storyEdges } from '../data/cineOrderKnowledgeGraph';
import { validateChronologicalOrdering } from '../lib/releaseOrdering';
import { RecommendationService } from '../lib/recommendationService';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('  CINEORDER PRODUCTION BASELINE REGRESSION SUITE (12 INVARIANTS)        ');
console.log('========================================================================\n');

// ─── Invariant 1: Franchise Count ───────────────────────────────────────────
console.log('--- Invariant 1: Franchise Count ---');
{
  assert(allFranchises.length === 19, `1. Exactly 19 franchises registered (found ${allFranchises.length})`);
}

// ─── Invariant 2: Canonical Titles Count ─────────────────────────────────────
console.log('\n--- Invariant 2: Canonical Titles Count ---');
{
  assert(allContent.length === 240, `2. Exactly 240 canonical titles registered (found ${allContent.length})`);
}

// ─── Invariant 3: Story Knowledge Graph Nodes & Edges ───────────────────────
console.log('\n--- Invariant 3: Story Knowledge Graph Nodes & Edges ---');
{
  const nodeCount = Object.keys(titleNodes).length;
  assert(nodeCount === 249, `3A. Exactly 249 TitleNodes in Story Knowledge Graph (found ${nodeCount})`);
  assert(storyEdges.length === 357, `3B. Exactly 357 StoryEdges in Story Knowledge Graph (found ${storyEdges.length})`);
  const allCanonicalHaveNodes = allContent.every((c) => Boolean(titleNodes[c.id]));
  assert(allCanonicalHaveNodes, '3C. All 240 canonical titles have corresponding TitleNodes in CKG');
}

// ─── Invariant 4: Zero Duplicate Content IDs ────────────────────────────────
console.log('\n--- Invariant 4: Zero Duplicate Content IDs ---');
{
  const contentIdSet = new Set<string>();
  let duplicateCount = 0;
  for (const item of allContent) {
    if (contentIdSet.has(item.id)) {
      duplicateCount++;
    }
    contentIdSet.add(item.id);
  }
  assert(duplicateCount === 0, `4. Zero duplicate content IDs across catalog (found ${duplicateCount})`);
}

// ─── Invariant 5: Zero Duplicate TMDb IDs ───────────────────────────────────
console.log('\n--- Invariant 5: Zero Duplicate TMDb IDs ---');
{
  const tmdbIdMap = new Map<number, string>();
  let duplicateCount = 0;
  for (const item of allContent) {
    if (item.tmdb_id) {
      if (tmdbIdMap.has(item.tmdb_id)) {
        duplicateCount++;
      } else {
        tmdbIdMap.set(item.tmdb_id, item.id);
      }
    }
  }
  assert(duplicateCount === 0, `5. Zero duplicate TMDb IDs across catalog (found ${duplicateCount})`);
}

// ─── Invariant 6: Zero Broken Graph References ──────────────────────────────
console.log('\n--- Invariant 6: Zero Broken Graph References ---');
{
  let brokenRefs = 0;
  for (const edge of storyEdges) {
    if (!titleNodes[edge.sourceId] || !titleNodes[edge.targetId]) {
      brokenRefs++;
    }
  }
  assert(brokenRefs === 0, `6. Zero broken graph references in Story Knowledge Graph (found ${brokenRefs})`);
}

// ─── Invariant 7: Zero Chronological Inversions in Release Orders ───────────
console.log('\n--- Invariant 7: Zero Chronological Inversions in Release Orders ---');
{
  let totalInversions = 0;
  for (const franchise of allFranchises) {
    const releaseOrders = getWatchOrders(franchise.id).filter((w) => w.order_type === 'release');
    const val = validateChronologicalOrdering(releaseOrders);
    if (!val.isValid) {
      totalInversions += val.inversions.length;
    }
  }
  assert(totalInversions === 0, `7. Zero chronological inversions across all 19 franchises' release watch orders (found ${totalInversions})`);
}

// ─── Invariant 8: Spider-Man Multi-Continuity Isolation ─────────────────────
console.log('\n--- Invariant 8: Spider-Man Multi-Continuity Isolation ---');
{
  const mcuOrders = allWatchOrders.filter((wo) => wo.franchise_id === 'marvel-cinematic-universe');
  const mcuIds = mcuOrders.map((wo) => wo.content_id);
  const legacyIds = [
    'spiderman-1',
    'spiderman-2',
    'spiderman-3',
    'amazing-spiderman-1',
    'amazing-spiderman-2',
    'spider-verse-1',
    'spider-verse-2',
    'spider-verse-3',
  ];

  let contaminationCount = 0;
  for (const legId of legacyIds) {
    if (mcuIds.includes(legId)) {
      contaminationCount++;
    }
  }
  assert(contaminationCount === 0, `8. Zero legacy Spider-Man contamination in MCU watch orders (found ${contaminationCount})`);
}

// ─── Invariant 9: Spider-Man No Way Home Cross-Continuity Prerequisites ──────
console.log('\n--- Invariant 9: Spider-Man No Way Home Cross-Continuity Prerequisites ---');
{
  const nwhTraversal = RecommendationService.getTraversal('mcu-no-way-home');
  const mustWatchTitles = nwhTraversal.mustWatch.map((r) => r.content.title);

  assert(mustWatchTitles.includes('Spider-Man'), '9A. Must Watch includes Spider-Man (2002)');
  assert(mustWatchTitles.includes('Spider-Man 2'), '9B. Must Watch includes Spider-Man 2 (2004)');
  assert(mustWatchTitles.includes('Spider-Man 3'), '9C. Must Watch includes Spider-Man 3 (2007)');
  assert(mustWatchTitles.includes('The Amazing Spider-Man'), '9D. Must Watch includes The Amazing Spider-Man (2012)');
  assert(mustWatchTitles.includes('The Amazing Spider-Man 2'), '9E. Must Watch includes The Amazing Spider-Man 2 (2014)');
  assert(mustWatchTitles.includes('Spider-Man: Homecoming'), '9F. Must Watch includes Spider-Man: Homecoming (2017)');
  assert(mustWatchTitles.includes('Spider-Man: Far From Home'), '9G. Must Watch includes Spider-Man: Far From Home (2019)');
  assert(nwhTraversal.mustWatch.length === 7, `9H. Must Watch contains exactly 7 titles (found ${nwhTraversal.mustWatch.length})`);
}

// ─── Invariant 10: Frozen Framework Bit-for-Bit Checksums ───────────────────
console.log('\n--- Invariant 10: Frozen Framework Bit-for-Bit Checksums ---');
{
  const expectedHashes: Record<string, string> = {
    'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
    'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
    'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
    'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
    '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
  };

  for (const [relPath, expHash] of Object.entries(expectedHashes)) {
    const content = fs.readFileSync(relPath);
    const computedHash = crypto.createHash('sha256').update(content).digest('hex');
    assert(computedHash === expHash, `10. Bit-for-bit identical: ${relPath}`);
  }
}

// ─── Invariant 11: Release Watch Orders Integrity ───────────────────────────
console.log('\n--- Invariant 11: Release Watch Orders Integrity ---');
{
  assert(allWatchOrders.length === 720, `11. Exactly 720 watch order entries registered across 19 franchises (found ${allWatchOrders.length})`);
}

// ─── Invariant 12: Recommendation Coverage Integrity ───────────────────────
console.log('\n--- Invariant 12: Recommendation Coverage Integrity ---');
{
  let titlesWithPrereqs = 0;
  let entryPoints = 0;
  for (const title of allContent) {
    const traversal = RecommendationService.getTraversal(title.id);
    if (traversal.mustWatch.length > 0 || traversal.recommended.length > 0) {
      titlesWithPrereqs++;
    }
    if (traversal.mustWatch.length === 0 && traversal.recommended.length === 0) {
      entryPoints++;
    }
  }
  assert(titlesWithPrereqs === 163, `12A. Exactly 163 titles with active Must Watch/Recommended prerequisites (found ${titlesWithPrereqs})`);
  assert(entryPoints === 77, `12B. Exactly 77 direct entry points (found ${entryPoints})`);
  assert(titlesWithPrereqs + entryPoints === 240, '12C. Complete partition: 163 + 77 = 240 canonical titles');
}

console.log('\n========================================================================');
console.log('  🎉 ALL PRODUCTION BASELINE REGRESSION INVARIANTS PASSED!              ');
console.log('========================================================================\n');
