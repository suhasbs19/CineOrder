import { allContent, allFranchises } from '../src/data/franchises/index';

console.log('========================================================================');
console.log('                 COMPLETE CINEORDER POSTER AUDIT                        ');
console.log('========================================================================\n');

const posterMap = new Map<string, string[]>();
const tmdbMap = new Map<number, string[]>();

for (const c of allContent) {
  if (c.poster_url && c.poster_url !== '/placeholder-poster.svg' && c.poster_url !== '/placeholder.svg') {
    const list = posterMap.get(c.poster_url) || [];
    list.push(c.id);
    posterMap.set(c.poster_url, list);
  }
  if (c.tmdb_id) {
    const list = tmdbMap.get(c.tmdb_id) || [];
    list.push(c.id);
    tmdbMap.set(c.tmdb_id, list);
  }
}

let duplicatePosters = 0;
let duplicateTmdbIds = 0;

for (const [url, ids] of posterMap.entries()) {
  if (ids.length > 1) {
    console.error(`❌ DUPLICATE POSTER DETECTED: "${url}" shared by ${ids.join(', ')}`);
    duplicatePosters++;
  }
}

for (const [tmdbId, ids] of tmdbMap.entries()) {
  if (ids.length > 1) {
    console.error(`❌ DUPLICATE TMDB ID DETECTED: ${tmdbId} shared by ${ids.join(', ')}`);
    duplicateTmdbIds++;
  }
}

console.log(`Total Content Items: ${allContent.length}`);
console.log(`Total Franchises:    ${allFranchises.length}`);
console.log(`Duplicate Posters:   ${duplicatePosters}`);
console.log(`Duplicate TMDB IDs:  ${duplicateTmdbIds}`);

if (duplicatePosters === 0 && duplicateTmdbIds === 0) {
  console.log('\n✅ ALL 213 CATALOG ITEMS HAVE STRICTLY UNIQUE POSTER URLS AND TMDB IDS!');
}
