import { allFranchises } from '../src/data/franchises/index';
import { franchiseArtworkMap } from '../src/data/franchiseArtwork';
import { resolveFranchiseArtwork } from '../src/lib/imageResolver';
import { validateFranchiseVisualIdentities } from './verifyFranchiseVisualIdentity';

console.log('========================================================================');
console.log('            CINEORDER GLOBAL FRANCHISE VISUAL IDENTITY AUDIT            ');
console.log('========================================================================\n');

for (const f of allFranchises) {
  const art = franchiseArtworkMap[f.id];
  const rendered = resolveFranchiseArtwork(f);

  console.log(`Franchise ID: ${f.id}`);
  console.log(`  Name:                 ${f.name}`);
  console.log(`  TMDB Collection ID:   ${f.tmdb_collection_id || 'N/A (Universe)'}`);
  console.log(`  franchises/*.ts:`);
  console.log(`    poster_url:         ${f.poster_url}`);
  console.log(`    banner_url:         ${f.banner_url}`);
  console.log(`  franchiseArtworkMap:`);
  console.log(`    poster:             ${art ? art.poster : 'MISSING'}`);
  console.log(`    banner:             ${art ? art.banner : 'MISSING'}`);
  console.log(`    logo:               ${art ? art.logo : 'MISSING'}`);
  console.log(`  Rendered Output:`);
  console.log(`    resolved_poster:    ${rendered.poster}`);
  console.log(`    resolved_banner:    ${rendered.banner}`);
  console.log(`    logo_asset:         ${art ? art.logo : 'MISSING'}`);
  console.log('--------------------------------------------------');
}

const validation = validateFranchiseVisualIdentities();

console.log(`\nAudit Summary:`);
console.log(`Total Franchises:                 ${validation.totalFranchises}`);
console.log(`Canonical Verified Identities:   ${validation.verifiedCount}`);
console.log(`Identity Errors:                 ${validation.errorCount}`);
console.log(`Status:                          ${validation.passed ? '✅ PASS' : '❌ FAIL'}\n`);

if (!validation.passed) {
  process.exit(1);
} else {
  process.exit(0);
}
