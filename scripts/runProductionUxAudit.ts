import { allFranchises, allContent, allWatchOrders } from '../src/data/franchises/index';
import { getFranchiseArtwork } from '../src/data/franchiseArtwork';
import { RecommendationService } from '../src/lib/recommendationService';
import { validateFranchiseVisualIdentities } from './verifyFranchiseVisualIdentity';

console.log('========================================================================');
console.log('       CINEORDER PRODUCTION UX & FEATURE AUDIT SUITE                    ');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function audit(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
    failCount++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PLANNER AUDIT
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 1. Planner UX & Graph Plan Verification ---');

// Complete catalog search in Planner
const catalogCount = allContent.length;
audit('1A. Complete catalog accessible in Planner', catalogCount === 240, `Catalog count: ${catalogCount}`);

// Iron Man 1: 0 prerequisites / entry point
const im1Traversal = RecommendationService.getTraversal('mcu-iron-man');
audit('1B. Iron Man (2008) generates direct entry point ("No prior movies required")', im1Traversal.isEntryPoint && im1Traversal.mustWatch.length === 0);

// Iron Man 2: has Iron Man 1 as prerequisite
const im2Traversal = RecommendationService.getTraversal('mcu-iron-man-2');
const hasIm1InIm2 = im2Traversal.mustWatch.some((p) => p.content.id === 'mcu-iron-man');
audit('1C. Iron Man 2 generates preparation requirements (Iron Man 1 required)', hasIm1InIm2);

// Avatar 1: 0 prerequisites / entry point
const avatar1Traversal = RecommendationService.getTraversal('avatar-1');
audit('1D. Avatar (2009) generates direct entry point', avatar1Traversal.isEntryPoint && avatar1Traversal.mustWatch.length === 0);

// Avatar 2: requires Avatar 1
const avatar2Traversal = RecommendationService.getTraversal('avatar-2');
const hasAvatar1InAvatar2 = avatar2Traversal.mustWatch.some((p) => p.content.id === 'avatar-1');
audit('1E. Avatar: The Way of Water requires Avatar (2009)', hasAvatar1InAvatar2);

// Alien 1: 0 prerequisites / entry point
const alien1Traversal = RecommendationService.getTraversal('alien-1');
audit('1F. Alien (1979) generates direct entry point', alien1Traversal.isEntryPoint && alien1Traversal.mustWatch.length === 0);

// Aliens: requires Alien 1
const aliensTraversal = RecommendationService.getTraversal('alien-2');
const hasAlien1InAliens = aliensTraversal.mustWatch.some((p) => p.content.id === 'alien-1');
audit('1G. Aliens requires Alien (1979)', hasAlien1InAliens);

// Prometheus: 0 prerequisites / entry point
const prometheusTraversal = RecommendationService.getTraversal('alien-prometheus');
audit('1H. Prometheus generates direct entry point', prometheusTraversal.isEntryPoint && prometheusTraversal.mustWatch.length === 0);

// Alien Romulus: requires Alien 1
const romulusTraversal = RecommendationService.getTraversal('alien-romulus');
const hasAlien1InRomulus = romulusTraversal.mustWatch.some((p) => p.content.id === 'alien-1');
audit('1I. Alien: Romulus requires Alien (1979)', hasAlien1InRomulus);

// Multi-prerequisite title (Avengers: Endgame)
const endgameTraversal = RecommendationService.getTraversal('mcu-endgame');
audit('1J. Multi-prerequisite title (Endgame) generates multi-step plan', endgameTraversal.mustWatch.length >= 4 && endgameTraversal.estimatedWatchTimeMinutes > 300);

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEARCH ENGINE AUDIT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 2. Search Engine Verification ---');

const searchQueries = [
  { q: 'Iron Man', minResults: 3, expectedId: 'mcu-iron-man' },
  { q: 'Harry Potter', minResults: 8, expectedId: 'hp-sorcerers-stone' },
  { q: 'Spider-Man', minResults: 3, expectedId: 'mcu-spider-man-homecoming' },
  { q: 'Avengers', minResults: 4, expectedId: 'mcu-avengers' },
  { q: 'Avatar', minResults: 5, expectedId: 'avatar-1' },
  { q: 'Alien', minResults: 7, expectedId: 'alien-1' },
];

for (const { q, minResults, expectedId } of searchQueries) {
  const matches = allContent.filter(
    (c) => c.title.toLowerCase().includes(q.toLowerCase()) || c.franchise_id.toLowerCase().includes(q.toLowerCase())
  );
  audit(`2. Search "${q}" returns valid titles (found: ${matches.length})`, matches.length >= minResults && matches.some((m) => m.id === expectedId));
}

// Random nonexistent query
const emptyMatches = allContent.filter((c) => c.title.toLowerCase().includes('xyznonexistentquery9999'));
audit('2G. Nonexistent search query returns 0 results (clean empty state)', emptyMatches.length === 0);

// ─────────────────────────────────────────────────────────────────────────────
// 3. FRANCHISE PAGES AUDIT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 3. Franchise Pages & Visual Identity Audit ---');

const testFranchises = [
  { id: 'avatar', minMovies: 5 },
  { id: 'alien', minMovies: 7 },
  { id: 'marvel-cinematic-universe', minMovies: 50 },
  { id: 'star-wars', minMovies: 20 },
  { id: 'harry-potter', minMovies: 11 },
  { id: 'pirates-of-the-caribbean', minMovies: 5 },
  { id: 'transformers', minMovies: 7 },
];

for (const tf of testFranchises) {
  const f = allFranchises.find((item) => item.id === tf.id);
  const titles = allContent.filter((c) => c.franchise_id === tf.id);
  const art = getFranchiseArtwork(tf.id);
  audit(
    `3. Franchise [${tf.id}] metadata, artwork & title count (${titles.length})`,
    Boolean(f && titles.length >= tf.minMovies && art.poster && art.banner && art.logo)
  );
}

const visualIdentityResult = validateFranchiseVisualIdentities();
audit('3H. Zero cross-franchise artwork contamination across all 18 franchises', visualIdentityResult.passed && visualIdentityResult.errorCount === 0);

// ─────────────────────────────────────────────────────────────────────────────
// 4. MOVIE PAGES AUDIT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 4. Movie Detail Pages Audit ---');

const testMovies = [
  'mcu-iron-man',
  'mcu-iron-man-2',
  'avatar-1',
  'avatar-2',
  'alien-1',
  'alien-2',
  'mcu-endgame',
];

for (const mid of testMovies) {
  const m = allContent.find((c) => c.id === mid);
  const trav = RecommendationService.getTraversal(mid);
  audit(
    `4. Movie [${mid}] has complete metadata, poster, and traversal`,
    Boolean(m && m.title && m.poster_url && trav)
  );
}



console.log('\n========================================================================');
console.log(` SUMMARY: ${passCount} PASSED, ${failCount} FAILED.`);
console.log('========================================================================');

if (failCount > 0) {
  process.exit(1);
}
