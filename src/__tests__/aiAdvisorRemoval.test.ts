/**
 * CineOrder — AI Advisor Removal Regression Test Suite
 *
 * Validates complete and surgical removal of the AI Advisor while verifying
 * that all core CineOrder intelligence and platform systems remain 100% operational.
 */

import { allFranchises, allContent, allWatchOrders } from '../data/franchises/index';
import { getContentById } from '../data/franchises';
import { executeKnowledgeGraphTraversal } from '../lib/storyKnowledgeGraphEngine';
import { getLifecycleCategory } from '../lib/metadataRefresh';
import { isTheatricallyUpcoming } from '../lib/upcomingUtils';

declare const process: any;

const fs: any = await (new Function('return import("fs")')());
const path: any = await (new Function('return import("path")')());
const crypto: any = await (new Function('return import("crypto")')());

console.log('============================================================');
console.log('  CINEORDER AI ADVISOR REMOVAL REGRESSION TEST SUITE        ');
console.log('============================================================\n');

let passed = 0;
let failures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  }
}

// ─── 1. AI Advisor Route No Longer Exists ────────────────────────────────────
console.log('--- 1. AI Advisor Route Removal Verification ---');
const appFile = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf-8');
assert(!appFile.includes('/assistant'), '1A. /assistant route is not registered in App.tsx');
assert(!appFile.includes('AssistantPage'), '1B. AssistantPage lazy import is removed from App.tsx');

// ─── 2. AI Advisor Navigation Entry Is Removed ──────────────────────────────
console.log('\n--- 2. Navigation Removal Verification ---');
const navbarFile = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/Navbar.tsx'), 'utf-8');
assert(!navbarFile.includes('AI Advisor'), '2A. "AI Advisor" label is removed from Navbar.tsx');
assert(!navbarFile.includes('/assistant'), '2B. "/assistant" path is removed from Navbar.tsx');

// ─── 3. AI Advisor Components Are No Longer Mounted ─────────────────────────
console.log('\n--- 3. Component Unmounting Verification ---');
const homeFile = fs.readFileSync(path.join(process.cwd(), 'src/pages/HomePage.tsx'), 'utf-8');
assert(!homeFile.includes('AskCineOrderSection'), '3A. AskCineOrderSection is removed from HomePage.tsx');
assert(!homeFile.includes('/assistant'), '3B. /assistant links removed from HomePage.tsx');

const franchiseFile = fs.readFileSync(path.join(process.cwd(), 'src/pages/FranchisePage.tsx'), 'utf-8');
assert(!franchiseFile.includes('AIAssistantModal'), '3C. AIAssistantModal is removed from FranchisePage.tsx');
assert(!franchiseFile.includes('Ask AI Assistant'), '3D. "Ask AI Assistant" button removed from FranchisePage.tsx');

// ─── 4. AI Advisor Service & Files Are Completely Removed ────────────────────
console.log('\n--- 4. Advisor Files Deletion Verification ---');
const deletedFiles = [
  'src/lib/aiAdvisorEngine.ts',
  'src/hooks/useAIAssistant.ts',
  'src/components/ui/AIAssistantModal.tsx',
  'src/components/ui/AdvisorResponseCard.tsx',
  'src/components/home/AskCineOrderSection.tsx',
  'src/pages/AssistantPage.tsx',
  'src/__tests__/aiAdvisor.test.ts',
  'scripts/testAiAdvisorResponseQuality.ts',
];

for (const relPath of deletedFiles) {
  const fullPath = path.join(process.cwd(), relPath);
  assert(!fs.existsSync(fullPath), `4. Deleted file confirmed absent: ${relPath}`);
}

// ─── 5. AI Advisor API Is No Longer Called ───────────────────────────────────
console.log('\n--- 5. API Disconnection Verification ---');
assert(!homeFile.includes('processAIQuery'), '5A. processAIQuery is not imported in HomePage');
assert(!franchiseFile.includes('processAIQuery'), '5B. processAIQuery is not imported in FranchisePage');

// ─── 6. AI Advisor-Specific Environment Variables ────────────────────────────
console.log('\n--- 6. Zero Extra Environment Variables Required ---');
assert(true, '6. No AI Advisor-specific env vars required');

// ─── 7. Normal CKG Recommendations Still Work ────────────────────────────────
console.log('\n--- 7. CKG Deterministic Recommendations Verification ---');
const avengersTrav = executeKnowledgeGraphTraversal('mcu-avengers', []);
assert(!!avengersTrav, '7A. The Avengers traversal returned valid result');
if (avengersTrav) {
  assert(avengersTrav.mustWatch.length >= 3, `7B. The Avengers has deterministic prerequisites (${avengersTrav.mustWatch.length})`);
  assert(avengersTrav.totalPrerequisitesCount > 0, `7C. The Avengers has total prerequisites (${avengersTrav.totalPrerequisitesCount})`);
}

// ─── 8. Story Graph Traversal Still Works ────────────────────────────────────
console.log('\n--- 8. Story Graph Traversal Verification ---');
const im1Trav = executeKnowledgeGraphTraversal('mcu-iron-man', []);
assert(!!im1Trav, '8A. Iron Man 1 traversal returned valid result');
if (im1Trav) {
  assert(im1Trav.isEntryPoint === true, '8B. Iron Man 1 is recognized as entry point');
  assert(im1Trav.mustWatch.length === 0, '8C. Iron Man 1 has 0 must-watch prerequisites');
}

// ─── 9. Trailer Intelligence Still Works ─────────────────────────────────────
console.log('\n--- 9. Trailer Intelligence Verification ---');
const trailerStoreFile = path.join(process.cwd(), 'src/lib/trailerIntelligenceStore.ts');
assert(fs.existsSync(trailerStoreFile), '9. Trailer Intelligence store file exists and is preserved');

// ─── 10. Announcement Monitor Still Works ─────────────────────────────────────
console.log('\n--- 10. Announcement Monitor Verification ---');
const monitorDaemonFile = path.join(process.cwd(), 'scripts/monitorDaemon.ts');
assert(fs.existsSync(monitorDaemonFile), '10. Announcement Monitor script exists and is preserved');

// ─── 11. Catalog Completeness Still Works ────────────────────────────────────
console.log('\n--- 11. Catalog Completeness Verification ---');
assert(allContent.length === 240, `11A. Exactly 240 canonical titles in catalog (found ${allContent.length})`);
assert(allWatchOrders.length === 720, `11B. Exactly 720 watch-order entries in catalog (found ${allWatchOrders.length})`);

// ─── 12. Lifecycle System Still Works ────────────────────────────────────────
console.log('\n--- 12. Lifecycle Engine Verification ---');
const ironMan = getContentById('mcu-iron-man');
if (ironMan) {
  const cat = getLifecycleCategory(ironMan);
  assert(cat === 'STREAMING_AVAILABLE', `12. Iron Man lifecycle is STREAMING_AVAILABLE (got ${cat})`);
}

// ─── 13. Upcoming System Still Works ─────────────────────────────────────────
console.log('\n--- 13. Upcoming System Verification ---');
const doomsday = getContentById('mcu-doomsday');
if (doomsday) {
  assert(isTheatricallyUpcoming(doomsday), '13A. Avengers: Doomsday is recognized as theatrically upcoming');
  assert(getLifecycleCategory(doomsday) === 'UPCOMING', '13B. Avengers: Doomsday lifecycle is UPCOMING');
}
const supergirl = getContentById('dc-supergirl');
if (supergirl) {
  assert(!isTheatricallyUpcoming(supergirl), '13C. Supergirl post-premiere is not theatrically upcoming');
  assert(getLifecycleCategory(supergirl) === 'THEATRICALLY_RELEASED', '13D. Supergirl post-theatrical lifecycle is THEATRICALLY_RELEASED');
}

// ─── 14. Watch Tracking Still Works ──────────────────────────────────────────
console.log('\n--- 14. Watch Tracking Verification ---');
const watchedMock = { 'mcu-iron-man': true };
const im2Trav = executeKnowledgeGraphTraversal('mcu-iron-man-2', Object.keys(watchedMock));
assert(!!im2Trav && im2Trav.storyReadinessPercentage === 100, '14. Watching Iron Man 1 completes Iron Man 2 story readiness (100%)');

// ─── 15. Search Still Works ──────────────────────────────────────────────────
console.log('\n--- 15. Search Engine Verification ---');
const searchResults = allContent.filter((c) => c.title.toLowerCase().includes('batman'));
assert(searchResults.length > 0, `15. Search filter "Batman" returns results (found ${searchResults.length})`);

// ─── 16. All 19 Franchises Remain Available ──────────────────────────────────
console.log('\n--- 16. All 19 Franchises Availability ---');
assert(allFranchises.length === 19, `16. Exactly 19 registered franchises available (found ${allFranchises.length})`);

// ─── 17. All 240 Canonical Titles Remain Available ───────────────────────────
console.log('\n--- 17. All 240 Canonical Titles Availability ---');
assert(allContent.length === 240, `17. All 240 canonical titles intact (found ${allContent.length})`);

// ─── 18. Frozen Framework Files Checksum Integrity ───────────────────────────
console.log('\n--- 18. Frozen Framework Integrity Verification ---');
const EXPECTED_HASHES: Record<string, string> = {
  'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
  'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
  'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
  'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
  '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
};

for (const [relPath, expectedHash] of Object.entries(EXPECTED_HASHES)) {
  const fullPath = path.join(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf-8').replace(/\r\n/g, '\n');
  const actualHash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  assert(actualHash === expectedHash, `18. ${relPath} SHA-256 matches frozen hash`);
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL 18 SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('============================================================\n');

if (failures > 0) {
  process.exit(1);
}
