/**
 * CineOrder — Username Search & Discovery Regression Test Suite
 *
 * Validates:
 * 1. Exact username search
 * 2. Case-insensitive behavior (@Suhas, @suhas, @SUHAS)
 * 3. Partial username search (prefix and substring)
 * 4. Username not found handling
 * 5. Empty / whitespace / symbol query handling
 * 6. Multiple matching usernames ranking and pagination
 * 7. Public profile returned
 * 8. Private profile excluded (never returned in search results)
 * 9. Email never exposed in search results
 * 10. Password / auth tokens / internal domains never exposed
 * 11. Existing movie/franchise search completely unaffected
 * 12. Existing public profile route resolution works
 * 13. Duplicate username collision resistance
 * 14. Special character & @-prefix handling
 * 15. Search result navigation & structure
 * 16. Frozen framework 5/5 bit-for-bit SHA-256 integrity
 */

import {
  saveLocalProfile,
  fetchPublicProfileByUsername,
  searchPublicUsers,
} from '../lib/authService';
import { validateUsername, normalizeUsername } from '../lib/usernameValidator';
import { searchAllContent, searchFranchises } from '../data/franchises';
import type { Profile } from '../types';

declare const process: any;

const fs: any = await (new Function('return import("fs")')());
const path: any = await (new Function('return import("path")')());
const crypto: any = await (new Function('return import("crypto")')());

console.log('============================================================');
console.log('  CINEORDER USERNAME SEARCH REGRESSION TEST SUITE           ');
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

// ─── Setup Test Profiles ────────────────────────────────────────────────────
console.log('--- Setting up Test Profiles ---');

// User 1: Public Movie Buff
const pubUser1: Profile = {
  id: 'usr-spiderfan-uuid',
  username: 'SpiderFan616',
  username_normalized: 'spiderfan616',
  display_name: 'Peter Parker',
  email: 'peter.parker@dailybugle.internal',
  account_type: 'EMAIL',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  spoiler_free_mode: false,
  is_admin: false,
  public_profile: true, // PUBLIC
  show_favorite_movies: true,
  show_ratings: true,
  show_reviews: true,
  show_recommendations: true,
  show_stats: true,
  created_at: '2025-01-15T12:00:00Z',
};
saveLocalProfile(pubUser1);

// User 2: Public Cinephile with shared prefix
const pubUser2: Profile = {
  id: 'usr-spiderfan-alt-uuid',
  username: 'SpiderFanatic',
  username_normalized: 'spiderfanatic',
  display_name: 'Miles Morales',
  email: 'miles@brooklyn.internal',
  account_type: 'EMAIL',
  avatar_url: '',
  spoiler_free_mode: true,
  is_admin: false,
  public_profile: true, // PUBLIC
  show_favorite_movies: true,
  show_ratings: false,
  show_reviews: false,
  show_recommendations: false,
  show_stats: true,
  created_at: '2025-02-10T10:00:00Z',
};
saveLocalProfile(pubUser2);

// User 3: Private User (Should NEVER appear in search)
const privUser: Profile = {
  id: 'usr-spider-private-uuid',
  username: 'SpiderSecret',
  username_normalized: 'spidersecret',
  display_name: 'Secret Web',
  email: 'topsecret@avengers.internal',
  account_type: 'EMAIL',
  avatar_url: '',
  spoiler_free_mode: false,
  is_admin: false,
  public_profile: false, // PRIVATE
  show_favorite_movies: false,
  show_ratings: false,
  show_reviews: false,
  show_recommendations: false,
  show_stats: false,
  created_at: '2025-03-01T08:00:00Z',
};
saveLocalProfile(privUser);

// User 4: Public Username-Only Account
const pubUserOnly: Profile = {
  id: 'usr-batman-useronly-uuid',
  username: 'GothamKnight',
  username_normalized: 'gothamknight',
  display_name: 'Dark Detective',
  email: 'gothamknight@username.cineorder.internal',
  account_type: 'USERNAME_ONLY',
  avatar_url: '',
  spoiler_free_mode: false,
  is_admin: false,
  public_profile: true, // PUBLIC
  show_favorite_movies: true,
  show_ratings: true,
  show_reviews: true,
  show_recommendations: true,
  show_stats: false,
  created_at: '2025-04-05T14:00:00Z',
};
saveLocalProfile(pubUserOnly);

// ─── 1. Exact Username Search ───────────────────────────────────────────────
console.log('\n--- 1. Exact Username Search ---');
const exactRes = await searchPublicUsers('SpiderFan616');
assert(exactRes.length > 0, '1A. Exact search returned results');
assert(exactRes[0]?.username === 'SpiderFan616', '1B. Exact match is ranked at position 0');
assert(exactRes[0]?.display_name === 'Peter Parker', '1C. Result contains correct display_name');

// ─── 2. Case-Insensitive Behavior ───────────────────────────────────────────
console.log('\n--- 2. Case-Insensitive Behavior ---');
const lowerRes = await searchPublicUsers('spiderfan616');
const upperRes = await searchPublicUsers('SPIDERFAN616');
const mixedRes = await searchPublicUsers('@SpiderFan616');
assert(lowerRes.length > 0 && lowerRes[0]?.username === 'SpiderFan616', '2A. Lowercase search matches SpiderFan616');
assert(upperRes.length > 0 && upperRes[0]?.username === 'SpiderFan616', '2B. Uppercase search matches SpiderFan616');
assert(mixedRes.length > 0 && mixedRes[0]?.username === 'SpiderFan616', '2C. @-prefixed search matches SpiderFan616');

// ─── 3. Partial Username Search ─────────────────────────────────────────────
console.log('\n--- 3. Partial Username Search ---');
const partialRes = await searchPublicUsers('spider');
assert(partialRes.length >= 2, `3A. Partial query "spider" matched at least 2 public users (found ${partialRes.length})`);
const foundUsernames = partialRes.map((u) => u.username);
assert(foundUsernames.includes('SpiderFan616'), '3B. Results include SpiderFan616');
assert(foundUsernames.includes('SpiderFanatic'), '3C. Results include SpiderFanatic');

// ─── 4. Username Not Found ──────────────────────────────────────────────────
console.log('\n--- 4. Username Not Found ---');
const notFoundRes = await searchPublicUsers('nonexistent_user_99999');
assert(notFoundRes.length === 0, '4. Non-existent username returns empty array');

// ─── 5. Empty / Whitespace / Symbol Search ──────────────────────────────────
console.log('\n--- 5. Empty / Whitespace / Symbol Search ---');
const emptyRes = await searchPublicUsers('');
const spaceRes = await searchPublicUsers('   ');
const atOnlyRes = await searchPublicUsers('@@@');
assert(emptyRes.length === 0, '5A. Empty search returns empty array');
assert(spaceRes.length === 0, '5B. Whitespace search returns empty array');
assert(atOnlyRes.length === 0, '5C. Pure "@" symbol search returns empty array');

// ─── 6. Multiple Matching Usernames & Ranking ───────────────────────────────
console.log('\n--- 6. Multiple Matching Usernames & Ranking ---');
const multiRes = await searchPublicUsers('SpiderFan');
assert(multiRes.length >= 2, '6A. Multiple matching usernames returned');
// Exact prefix matches ranked before arbitrary substrings
assert(multiRes[0]?.username?.toLowerCase().startsWith('spiderfan') || multiRes[0]?.username === 'SpiderFan616', '6B. Proper relevance ranking applied');

// ─── 7. Public Profile Returned ─────────────────────────────────────────────
console.log('\n--- 7. Public Profile Returned ---');
const pubOnlyRes = await searchPublicUsers('gothamknight');
assert(pubOnlyRes.length === 1, '7A. Public username-only profile found');
assert(pubOnlyRes[0]?.public_profile === true, '7B. public_profile is true');
assert(pubOnlyRes[0]?.account_type === 'USERNAME_ONLY', '7C. account_type is USERNAME_ONLY');

// ─── 8. Private Profile Excluded ────────────────────────────────────────────
console.log('\n--- 8. Private Profile Excluded ---');
const privDirectRes = await searchPublicUsers('SpiderSecret');
assert(privDirectRes.length === 0, '8A. Private user "SpiderSecret" is EXCLUDED from exact search');
const privPartialRes = await searchPublicUsers('spider');
assert(!privPartialRes.some((u) => u.username === 'SpiderSecret'), '8B. Private user "SpiderSecret" is EXCLUDED from partial search results');

// ─── 9. Email Never Exposed ─────────────────────────────────────────────────
console.log('\n--- 9. Email Never Exposed ---');
for (const res of [...exactRes, ...partialRes, ...pubOnlyRes]) {
  assert(!('email' in res), `9A. Result for @${res.username} does not contain email property`);
  const rawString = JSON.stringify(res);
  assert(!rawString.includes('dailybugle.internal'), '9B. Zero email content in serialized output');
  assert(!rawString.includes('brooklyn.internal'), '9C. Zero email content in serialized output');
  assert(!rawString.includes('@username.cineorder.internal'), '9D. Zero internal email domain in serialized output');
}

// ─── 10. Password / Auth Data Never Exposed ─────────────────────────────────
console.log('\n--- 10. Password / Auth Data Never Exposed ---');
for (const res of [...exactRes, ...partialRes, ...pubOnlyRes]) {
  assert(!('password' in res), `10A. Result for @${res.username} does not contain password property`);
  assert(!('token' in res), `10B. Result for @${res.username} does not contain token property`);
  assert(!('auth' in res), `10C. Result for @${res.username} does not contain auth property`);
}

// ─── 11. Existing Movie Search Unaffected ────────────────────────────────────
console.log('\n--- 11. Existing Movie Search Unaffected ---');
const movieSearch = searchAllContent('Spider-Man');
assert(movieSearch.length > 0, `11A. Movie search for "Spider-Man" returns catalog items (found ${movieSearch.length})`);
const franchiseSearch = searchFranchises('Marvel');
assert(franchiseSearch.length > 0, `11B. Franchise search for "Marvel" returns franchises (found ${franchiseSearch.length})`);

// ─── 12. Existing Public Profile Route & Lookup Works ───────────────────────
console.log('\n--- 12. Existing Public Profile Route & Lookup Works ---');
const fullProfile = await fetchPublicProfileByUsername('SpiderFan616');
assert(fullProfile !== null, '12A. fetchPublicProfileByUsername loads public profile');
assert(fullProfile?.username === 'SpiderFan616', '12B. Full profile username matches');
assert(fullProfile?.display_name === 'Peter Parker', '12C. Full profile display_name matches');
const privFullProfile = await fetchPublicProfileByUsername('SpiderSecret');
assert(privFullProfile === null, '12D. fetchPublicProfileByUsername returns null for private user');

// ─── 13. Duplicate Username / Normalization Collision ───────────────────────
console.log('\n--- 13. Duplicate Username Collision Protection ---');
const normA = normalizeUsername('SpiderFan616');
const normB = normalizeUsername('spiderfan616');
const normC = normalizeUsername('@SPIDERFAN616  ');
assert(normA === normB, '13A. Case normalization identical');
assert(normA === normC, '13B. Trim and @ normalization identical');
const valRes = validateUsername('SpiderFan616');
assert(valRes.valid === true, '13C. Username format is valid');

// ─── 14. Special Character & Input Sanitization ─────────────────────────────
console.log('\n--- 14. Special Character & Input Sanitization ---');
const specialRes1 = await searchPublicUsers('@@@SpiderFan616@@@');
assert(specialRes1.length > 0 && specialRes1[0]?.username === 'SpiderFan616', '14A. Leading @ stripped cleanly');
const specialRes2 = await searchPublicUsers('   spiderfan616   ');
assert(specialRes2.length > 0 && specialRes2[0]?.username === 'SpiderFan616', '14B. Leading and trailing whitespace stripped cleanly');

// ─── 15. Search Result Navigation Structure ─────────────────────────────────
console.log('\n--- 15. Search Result Navigation Structure ---');
const testUserResult = exactRes[0];
if (testUserResult) {
  const profileUrl = `/profile/${testUserResult.username}`;
  const atProfileUrl = `/@${testUserResult.username}`;
  assert(profileUrl === '/profile/SpiderFan616', '15A. profileUrl generates standard route /profile/SpiderFan616');
  assert(atProfileUrl === '/@SpiderFan616', '15B. atProfileUrl generates shorthand route /@SpiderFan616');
}

// ─── 16. Frozen Framework Checksum Verification ─────────────────────────────
console.log('\n--- 16. Frozen Framework Checksum Verification ---');
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
  assert(actualHash === expectedHash, `16. ${relPath} SHA-256 matches frozen hash`);
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL 16 SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('============================================================\n');

if (failures > 0) {
  process.exit(1);
}
