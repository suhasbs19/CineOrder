import { allFranchises, allContent, allWatchOrders } from '../src/data/franchises/index';
import { titleNodes, storyEdges } from '../src/data/cineOrderKnowledgeGraph';
import { FRANCHISE_ID_PREFIXES } from '../src/lib/announcementDiscoveryEngine';

console.log('========================================================================');
console.log('         CINEORDER GLOBAL CATALOG READ-ONLY COMPLETENESS AUDIT          ');
console.log('========================================================================\n');

console.log(`Total Franchises Registered: ${allFranchises.length}`);
console.log(`Total Canonical Content Titles: ${allContent.length}`);
console.log(`Total Watch Orders: ${allWatchOrders.length}`);
console.log(`Total Story Graph Nodes: ${Object.keys(titleNodes).length}`);
console.log(`Total Story Graph Edges: ${storyEdges.length}\n`);

// 1. Franchise Breakdown
console.log('--- 1. FRANCHISE CATALOG BREAKDOWN ---');
for (const f of allFranchises) {
  const items = allContent.filter((c) => c.franchise_id === f.id);
  const movies = items.filter((c) => c.type === 'movie').length;
  const series = items.filter((c) => c.type === 'series').length;
  const animated = items.filter((c) => c.type === 'animated').length;
  const watchOrders = allWatchOrders.filter((w) => w.franchise_id === f.id);
  const releaseOrders = watchOrders.filter((w) => w.order_type === 'release');

  console.log(`• [${f.id}] "${f.name}":`);
  console.log(`    Total Items: ${items.length} (Movies: ${movies}, Series: ${series}, Animated: ${animated})`);
  console.log(`    Watch Orders: ${watchOrders.length} (Release: ${releaseOrders.length})`);
}

// 2. Duplicate Checks
console.log('\n--- 2. DUPLICATE & ID COLLISION AUDIT ---');
const contentIdCounts = new Map<string, number>();
const tmdbIdCounts = new Map<number, string[]>();

for (const c of allContent) {
  contentIdCounts.set(c.id, (contentIdCounts.get(c.id) || 0) + 1);
  if (c.tmdb_id) {
    const list = tmdbIdCounts.get(c.tmdb_id) || [];
    list.push(c.id);
    tmdbIdCounts.set(c.tmdb_id, list);
  }
}

let duplicateContentIds = 0;
for (const [id, count] of contentIdCounts) {
  if (count > 1) {
    console.error(`  ❌ Duplicate Content ID: '${id}' appears ${count} times`);
    duplicateContentIds++;
  }
}
if (duplicateContentIds === 0) {
  console.log('  ✅ 0 Duplicate Content IDs found.');
}

let duplicateTmdbIds = 0;
for (const [tmdbId, ids] of tmdbIdCounts) {
  if (ids.length > 1) {
    console.error(`  ❌ Duplicate TMDb ID: ${tmdbId} shared by [${ids.join(', ')}]`);
    duplicateTmdbIds++;
  }
}
if (duplicateTmdbIds === 0) {
  console.log('  ✅ 0 Duplicate TMDb IDs found.');
}

// 3. Artwork & Fallbacks Audit
console.log('\n--- 3. ARTWORK & PLACEHOLDER AUDIT ---');
const placeholderPosters = allContent.filter(
  (c) => !c.poster_url || c.poster_url.includes('placeholder')
);
const placeholderBackdrops = allContent.filter(
  (c) => !c.backdrop_url || c.backdrop_url.includes('placeholder')
);

console.log(`  Placeholder Posters (${placeholderPosters.length} titles):`);
for (const p of placeholderPosters) {
  console.log(`    - [${p.franchise_id}] ${p.id} (${p.title}, ${p.release_date || 'TBA'})`);
}

console.log(`\n  Placeholder Backdrops (${placeholderBackdrops.length} titles):`);
for (const p of placeholderBackdrops) {
  console.log(`    - [${p.franchise_id}] ${p.id} (${p.title}, ${p.release_date || 'TBA'})`);
}

// 4. Franchise Prefix Registry Check
console.log('\n--- 4. FRANCHISE PREFIX REGISTRY COMPLETENESS ---');
for (const f of allFranchises) {
  const prefix = FRANCHISE_ID_PREFIXES[f.id];
  if (!prefix) {
    console.warn(`  ⚠️ Missing FRANCHISE_ID_PREFIXES entry for franchise '${f.id}'`);
  } else {
    console.log(`  ✅ Franchise '${f.id}' -> prefix '${prefix}'`);
  }
}

console.log('\n========================================================================');
console.log('                    AUDIT COMPLETED SUCCESSFULLY                        ');
console.log('========================================================================\n');
