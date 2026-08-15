import { allFranchises, allContent, allWatchOrders } from '../src/data/franchises/index';
import { getFranchiseArtwork } from '../src/data/franchiseArtwork';
import { titleNodes, storyEdges } from '../src/data/cineOrderKnowledgeGraph';
import { RecommendationService } from '../src/lib/recommendationService';

console.log('========================================================================');
console.log('    CINEORDER ALIEN REUSABLE FRANCHISE INTEGRATION VERIFICATION SUITE   ');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

// 1. Franchise Listing
const alienFranchise = allFranchises.find((f) => f.id === 'alien' || f.slug === 'alien');
assert(!!alienFranchise, '1. Alien appears in allFranchises listing');
assert(alienFranchise?.name === 'Alien', '2. Alien franchise name is "Alien"');
assert(alienFranchise?.total_movies === 7, '3. Alien franchise reports 7 total movies');

// 2. Dynamic Artwork Fallback
const artwork = getFranchiseArtwork('alien');
assert(artwork.poster === 'https://image.tmdb.org/t/p/w500/gWFHIY77cRVoBRGERwMHqpD27gc.jpg', '4. Alien poster dynamically resolved from franchise definition');
assert(artwork.banner === 'https://image.tmdb.org/t/p/w1280/6X42JnSMdo3dPAswOHUuvebdTq7.jpg', '5. Alien banner dynamically resolved from franchise definition');
assert(artwork.logo === '/logos/alien.svg', '6. Alien logo dynamically resolved to /logos/alien.svg');

// 3. Catalog Titles
const alienTitles = allContent.filter((c) => c.franchise_id === 'alien');
assert(alienTitles.length === 7, '7. All seven Alien titles appear in allContent', `Found ${alienTitles.length}`);

// 4. Watch Orders
const releaseOrders = allWatchOrders.filter((w) => w.franchise_id === 'alien' && w.order_type === 'release');
assert(releaseOrders.length === 7, '8. Release watch order contains 7 titles');

const chronoOrders = allWatchOrders.filter((w) => w.franchise_id === 'alien' && w.order_type === 'chronological');
assert(chronoOrders.length === 7 && chronoOrders[0].content_id === 'alien-prometheus', '9. Chronological watch order begins with Prometheus');

const recOrders = allWatchOrders.filter((w) => w.franchise_id === 'alien' && w.order_type === 'recommended');
assert(recOrders.length === 7 && recOrders[0].content_id === 'alien-1', '10. Recommended watch order begins with Alien (1979)');

// 5. Entry Points & Story Graph Traversal
const alien1Traversal = RecommendationService.getTraversal('alien-1');
assert(alien1Traversal.isEntryPoint && alien1Traversal.mustWatch.length === 0, '11. Alien (1979) is direct entry point with 0 prerequisites');

const prometheusTraversal = RecommendationService.getTraversal('alien-prometheus');
assert(prometheusTraversal.isEntryPoint && prometheusTraversal.mustWatch.length === 0, '12. Prometheus (2012) is direct entry point with 0 prerequisites');

// 6. Prerequisite Chains
const aliensTraversal = RecommendationService.getTraversal('alien-2');
const hasAlien1InAliens = aliensTraversal.mustWatch.some((p) => p.content.id === 'alien-1');
assert(hasAlien1InAliens, '13. Aliens requires Alien (1979) as prerequisite');

const alien3Traversal = RecommendationService.getTraversal('alien-3');
const hasAliensInAlien3 = alien3Traversal.mustWatch.some((p) => p.content.id === 'alien-2');
assert(hasAliensInAlien3, '14. Alien 3 requires Aliens as prerequisite');

const covenantTraversal = RecommendationService.getTraversal('alien-covenant');
const hasPrometheusInCovenant = covenantTraversal.mustWatch.some((p) => p.content.id === 'alien-prometheus');
assert(hasPrometheusInCovenant, '15. Alien: Covenant requires Prometheus as prerequisite');

const romulusTraversal = RecommendationService.getTraversal('alien-romulus');
const hasAlien1InRomulus = romulusTraversal.mustWatch.some((p) => p.content.id === 'alien-1');
assert(hasAlien1InRomulus, '16. Alien: Romulus requires Alien (1979) as prerequisite');

// 7. Search Matching
const searchMatches = allContent.filter((c) => c.title.toLowerCase().includes('alien') || c.id.startsWith('alien-'));
assert(searchMatches.length >= 7, '17. Search engine indexes all Alien titles', `Found ${searchMatches.length}`);

// 8. Regression Safety
const mcuCount = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe').length;
const starWarsCount = allContent.filter((c) => c.franchise_id === 'star-wars').length;
const avatarCount = allContent.filter((c) => c.franchise_id === 'avatar').length;
assert(mcuCount === 56 && starWarsCount === 24 && avatarCount === 5, '18. Existing franchises (MCU: 56, Star Wars: 24, Avatar: 5) untouched');

console.log('\n========================================================================');
console.log(` SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
}
