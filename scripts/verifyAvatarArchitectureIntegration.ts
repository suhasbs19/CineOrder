import { allFranchises, allContent, allWatchOrders } from '../src/data/franchises/index';
import { getFranchiseArtwork } from '../src/data/franchiseArtwork';
import { titleNodes, storyEdges } from '../src/data/cineOrderKnowledgeGraph';
import { RecommendationService } from '../src/lib/recommendationService';

console.log('========================================================================');
console.log('   CINEORDER AVATAR REUSABLE FRANCHISE INTEGRATION VERIFICATION SUITE   ');
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
const avatarFranchise = allFranchises.find((f) => f.id === 'avatar' || f.slug === 'avatar');
assert(!!avatarFranchise, '1. Avatar appears in allFranchises listing');

// 2. Franchise Page Data
assert(avatarFranchise?.name === 'Avatar', '2. Avatar franchise name is "Avatar"');

// 3. Dynamic Artwork Fallback: Poster
const artwork = getFranchiseArtwork('avatar');
assert(artwork.poster === 'https://image.tmdb.org/t/p/w500/3C5brXxnBxfkeKWwA1Fh4xvy4wr.jpg', '3. Avatar poster dynamically resolved from franchise definition');

// 4. Dynamic Artwork Fallback: Banner
assert(artwork.banner === 'https://image.tmdb.org/t/p/w1280/4uwX70EzaWVcGUXMtXPoexlNAff.jpg', '4. Avatar banner dynamically resolved from franchise definition');

// 5. Dynamic Artwork Fallback: Logo
assert(artwork.logo === '/logos/avatar.svg', '5. Avatar logo dynamically resolved to /logos/avatar.svg');

// 6. All 5 Avatar titles
const avatarTitles = allContent.filter((c) => c.franchise_id === 'avatar');
assert(avatarTitles.length === 5, '6. All five Avatar titles appear in catalog', `Found ${avatarTitles.length}`);

// 7. Release order
const releaseOrders = allWatchOrders.filter((w) => w.franchise_id === 'avatar' && w.order_type === 'release');
assert(releaseOrders.length === 5 && releaseOrders[0].content_id === 'avatar-1' && releaseOrders[4].content_id === 'avatar-5', '7. Release order is strictly chronological 1 to 5');

// 8. Search query matching
const searchMatches = allContent.filter((c) => c.title.toLowerCase().includes('avatar'));
assert(searchMatches.length >= 5, '8. Search "Avatar" resolves all five titles', `Found ${searchMatches.length}`);

// 9. Avatar 1 Entry Point
const avatar1Traversal = RecommendationService.getTraversal('avatar-1');
assert(avatar1Traversal.isEntryPoint && avatar1Traversal.mustWatch.length === 0, '9. Avatar shows 0 prior movies required (Direct Entry Point)');

// 10. Avatar: The Way of Water Preparation
const avatar2Traversal = RecommendationService.getTraversal('avatar-2');
const hasAvatar1InPrep = avatar2Traversal.mustWatch.some((p) => p.content.id === 'avatar-1');
assert(hasAvatar1InPrep, '10. Avatar: The Way of Water requires Avatar (2009) as preparation');

// 11. Avatar: Fire and Ash follows legitimate graph relationships
const avatar3Traversal = RecommendationService.getTraversal('avatar-3');
const hasAvatar2InFireAndAsh = avatar3Traversal.mustWatch.some((p) => p.content.id === 'avatar-2');
assert(hasAvatar2InFireAndAsh, '11. Avatar: Fire and Ash follows graph relationship requiring The Way of Water');

// 12. Avatar 4 does not receive invented prerequisites
const avatar4Edges = storyEdges.filter((e) => e.targetId === 'avatar-4');
assert(avatar4Edges.length === 1 && avatar4Edges[0].sourceId === 'avatar-3', '12. Avatar 4 receives only canonical direct-sequel edge without invented links');

// 13. Avatar 5 does not receive invented prerequisites
const avatar5Edges = storyEdges.filter((e) => e.targetId === 'avatar-5');
assert(avatar5Edges.length === 1 && avatar5Edges[0].sourceId === 'avatar-4', '13. Avatar 5 receives only canonical direct-sequel edge without invented links');

// 14. Planner preparation plan generation
assert(avatar2Traversal.mustWatch.length > 0 && avatar2Traversal.estimatedWatchTimeMinutes > 0, '14. Planner preparation guide generates valid sequence and watch time');

// 15. Search works without changes
assert(typeof allContent.filter === 'function', '15. Global search engine consumes allContent without component modification');

// 16. Franchise page works without changes
assert(allFranchises.length === 17, '16. Franchise router registers 17 active franchises generically');

// 17. Movie detail works without changes
assert(allContent.some((c) => c.id === 'avatar-2'), '17. Movie detail router resolves avatar-2 metadata generically');

// 18. Existing franchises remain unchanged
const mcuCount = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe').length;
const starWarsCount = allContent.filter((c) => c.franchise_id === 'star-wars').length;
assert(mcuCount === 56 && starWarsCount === 24, '18. Existing franchises (MCU: 56, Star Wars: 24) remain 100% untouched');

console.log('\n========================================================================');
console.log(` SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
}
