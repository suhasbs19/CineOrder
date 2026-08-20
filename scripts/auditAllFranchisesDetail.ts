import { allFranchises, allContent } from '../src/data/franchises/index';
import { getFranchiseContent } from '../src/data/franchises';

console.log(`Total Franchises: ${allFranchises.length}`);
console.log(`Total Catalog Titles: ${allContent.length}\n`);

for (const f of allFranchises) {
  const titles = getFranchiseContent(f.id);
  console.log(`=== [${f.id}] ${f.name} (${titles.length} titles) ===`);
  for (const t of titles) {
    console.log(`  - [${t.id}] ${t.title} (${t.release_date || 'TBA'}) [TMDb: ${t.tmdb_id}] (Type: ${t.type}, Status: ${t.status})`);
  }
  console.log('');
}
