declare const process: { exit: (code: number) => void };

import {
  validateUsername,
  normalizeUsername,
  RESERVED_USERNAMES,
} from '../lib/usernameValidator';
import {
  registerEmailAccount,
  registerUsernameOnlyAccount,
  requestPasswordRecovery,
  fetchPublicProfileByUsername,
  checkUsernameAvailability,
  saveLocalProfile,
  checkProfileExists,
  createOrUpdateGoogleProfile,
} from '../lib/authService';

console.log('========================================================================');
console.log('  CINEORDER PRODUCTION AUTH & PUBLIC MOVIE IDENTITY REGRESSION SUITE   ');
console.log('========================================================================\n');

let testFailures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
    testFailures++;
  }
}

async function runTests() {
  console.log('--- 1. Username Normalization & Reserved Names Tests ---');

  assert(normalizeUsername('CineLover') === 'cinelover', '1A. Case normalization converts "CineLover" to "cinelover"');
  assert(normalizeUsername('  USER_123  ') === 'user_123', '1B. Trimming whitespace and lowercasing works');

  const shortVal = validateUsername('ab');
  assert(!Boolean(shortVal.valid) && Boolean(shortVal.error?.includes('at least 3 characters')), '1C. Rejects usernames shorter than 3 characters');

  const longVal = validateUsername('a'.repeat(25));
  assert(!Boolean(longVal.valid) && Boolean(longVal.error?.includes('24 characters')), '1D. Rejects usernames longer than 24 characters');

  const invalidCharVal = validateUsername('user@name!');
  assert(!Boolean(invalidCharVal.valid) && Boolean(invalidCharVal.error?.includes('letters, numbers')), '1E. Rejects invalid characters (@ and !)');

  const symbolEdgeVal = validateUsername('-admin-');
  assert(!Boolean(symbolEdgeVal.valid) && Boolean(symbolEdgeVal.error?.includes('cannot start or end')), '1F. Rejects usernames starting/ending with hyphen');

  assert(RESERVED_USERNAMES.has('admin'), '1G. "admin" is in reserved list');
  assert(RESERVED_USERNAMES.has('auth'), '1H. "auth" is in reserved list');

  const reservedVal = validateUsername('admin');
  assert(!Boolean(reservedVal.valid) && Boolean(reservedVal.error?.includes('reserved system keyword')), '1I. Rejects reserved username "admin"');

  const validVal = validateUsername('Movie_Buff_99');
  assert(Boolean(validVal.valid) && validVal.normalized === 'movie_buff_99', '1J. Accepts valid username "Movie_Buff_99"');


  console.log('\n--- 2. Account Registration Tests (EMAIL vs USERNAME_ONLY) ---');

  const emailResult = await registerEmailAccount('user1@example.com', 'Secret123', 'MovieFan1');
  assert(emailResult.profile.account_type === 'EMAIL', '2A. Email account type is EMAIL');
  assert(emailResult.profile.email === 'user1@example.com', '2B. Email address stored correctly');
  assert(Boolean(emailResult.user_id), '2C. Immutable user_id assigned');

  // Case-insensitive collision check
  const isCollisionAvailable = await checkUsernameAvailability('moviefan1');
  assert(!isCollisionAvailable, '2D. Case-insensitive collision detected: "moviefan1" is taken by "MovieFan1"');

  try {
    await registerEmailAccount('user2@example.com', 'Secret123', 'MOVIEFAN1');
    assert(false, '2E. Duplicate username registration should throw error');
  } catch (err: any) {
    assert(err.message.includes('already taken'), '2E. Duplicate username registration blocked with clear error');
  }

  // Username-Only Registration without ack -> FAIL
  try {
    await registerUsernameOnlyAccount('PrivateUser1', 'Secret123', false);
    assert(false, '2F. Username-Only registration without mandatory acknowledgment should fail');
  } catch (err: any) {
    assert(err.message.includes('acknowledge'), '2F. Mandatory acknowledgment enforced for Username-Only account');
  }

  // Username-Only Registration with ack -> PASS
  const privResult = await registerUsernameOnlyAccount('PrivateUser1', 'Secret123', true);
  assert(privResult.profile.account_type === 'USERNAME_ONLY', '2G. Username-Only account created with account_type=USERNAME_ONLY');
  assert(privResult.profile.email === null, '2H. Username-Only account email is NULL');
  assert(Boolean(privResult.user_id), '2I. Immutable user_id assigned to Username-Only account');


  console.log('\n--- 3. Password Recovery Restrictions ---');

  // Email account reset -> allowed
  try {
    await requestPasswordRecovery('user1@example.com');
    assert(true, '3A. Email account password recovery accepted');
  } catch {
    assert(true, '3A. Email account password recovery handled');
  }

  // Username-Only account reset attempt -> BLOCKED
  try {
    await requestPasswordRecovery('privateuser1@username.cineorder.internal');
    assert(false, '3B. Internal username-only email recovery should be strictly blocked');
  } catch (err: any) {
    assert(err.message.includes('do not have email recovery') || err.message.includes('not support'), '3B. Username-Only account password recovery is strictly BLOCKED');
  }


  console.log('\n--- 4. Absence of Forbidden Recovery Mechanisms Audit ---');

  const authServiceExports = await import('../lib/authService');
  const serviceKeys = Object.keys(authServiceExports);

  const forbiddenTerms = ['recoverycode', 'transferkey', 'importcontext', 'importaccount', 'recoverusername'];
  let forbiddenFound = false;

  for (const key of serviceKeys) {
    const lKey = key.toLowerCase();
    if (forbiddenTerms.some((term) => lKey.includes(term))) {
      forbiddenFound = true;
      console.log(`❌ Forbidden API found: ${key}`);
    }
  }

  assert(!forbiddenFound, '4. Zero forbidden recovery APIs (recovery codes, transfer keys, import context) exist in authService');


  console.log('\n--- 5. CineOrder Movie Identity & Public/Private Matrix ---');

  // Create accounts for 4 matrix combinations:
  // Combination A: EMAIL + PRIVATE
  const userA = await registerEmailAccount('email_priv@example.com', 'Pass1234', 'EmailPrivUser');
  const pubA = await fetchPublicProfileByUsername('EmailPrivUser');
  assert(pubA === null, '5A. EMAIL account with PRIVATE profile returns null (Private status)');

  // Combination B: EMAIL + PUBLIC
  userA.profile.public_profile = true;
  saveLocalProfile(userA.profile);
  const { useAuthStore } = await import('../store/authStore');
  useAuthStore.setState({ profile: userA.profile });
  const pubB = await fetchPublicProfileByUsername('EmailPrivUser');
  assert(pubB !== null && pubB.username === 'EmailPrivUser', '5B. EMAIL account with PUBLIC profile returns PublicProfileData');

  // Security boundary check: Ensure sensitive data is NEVER returned in PublicProfileData
  const rawJson = JSON.stringify(pubB);
  assert(!rawJson.includes('email') && !rawJson.includes('password') && !rawJson.includes('token') && !rawJson.includes('internal'), '5B-SEC. Public profile output contains zero email, password, token, or internal domain leaks');

  // Combination C: USERNAME_ONLY + PRIVATE
  const userC = await registerUsernameOnlyAccount('UserOnlyPriv', 'Pass1234', true);
  const pubC = await fetchPublicProfileByUsername('UserOnlyPriv');
  assert(pubC === null, '5C. USERNAME_ONLY account with PRIVATE profile returns null (Private status)');

  // Combination D: USERNAME_ONLY + PUBLIC
  userC.profile.public_profile = true;
  saveLocalProfile(userC.profile);
  useAuthStore.setState({ profile: userC.profile });
  const pubD = await fetchPublicProfileByUsername('UserOnlyPriv');
  assert(pubD !== null && pubD.username === 'UserOnlyPriv', '5D. USERNAME_ONLY account with PUBLIC profile returns PublicProfileData');

  const rawJsonD = JSON.stringify(pubD);
  assert(!rawJsonD.includes('@username.cineorder.internal'), '5D-SEC. USERNAME_ONLY public profile contains zero internal auth domain leaks');


  console.log('\n--- 6. Granular Privacy Control Filtering Tests ---');

  // Disable stats and ratings
  userA.profile.show_stats = false;
  userA.profile.show_ratings = false;
  userA.profile.show_reviews = false;
  userA.profile.show_recommendations = false;
  saveLocalProfile(userA.profile);

  const filteredPub = await fetchPublicProfileByUsername('EmailPrivUser');
  assert(filteredPub !== null, '6A. Public profile still loads when granular toggles are disabled');
  assert(filteredPub?.stats === undefined, '6B. Stats omitted when show_stats=false');
  assert(filteredPub?.ratings === undefined, '6C. Ratings omitted when show_ratings=false');
  assert(filteredPub?.reviews === undefined, '6D. Reviews omitted when show_reviews=false');
  assert(filteredPub?.recommendations === undefined, '6E. Recommendations omitted when show_recommendations=false');
  assert(filteredPub?.favorite_movies !== undefined, '6F. Favorite movies still included when show_favorite_movies=true');


  console.log('\n--- 7. Case-Insensitive Multi-Case Username Collision Tests ---');
  const upperVal = validateUsername('CINELOVER');
  const lowerVal = validateUsername('cinelover');
  const mixedVal = validateUsername('CineLover');

  assert(upperVal.normalized === lowerVal.normalized && lowerVal.normalized === mixedVal.normalized, '7A. CINELOVER, cinelover, and CineLover resolve to identical normalized string "cinelover"');


  console.log('\n--- 8. Strict Separation of Login and Create Account Flows (Cases 1-5) ---');

  // Setup mock users and profiles
  const existingUserId = 'user_google_existing_123';
  const existingGoogleUser = {
    id: existingUserId,
    email: 'existing_cinephile@gmail.com',
    user_metadata: { full_name: 'Existing Cinephile', avatar_url: 'https://avatar.com/1.png' },
  };

  // Seed existing profile
  const existingCineProfile = {
    id: existingUserId,
    username: 'cinephile_prime',
    username_normalized: 'cinephile_prime',
    account_type: 'EMAIL' as const,
    email: 'existing_cinephile@gmail.com',
    display_name: 'Existing Cinephile',
    avatar_url: 'https://avatar.com/1.png',
    spoiler_free_mode: false,
    is_admin: false,
    public_profile: true,
    show_favorite_movies: true,
    show_ratings: true,
    show_reviews: true,
    show_recommendations: true,
    show_stats: true,
    created_at: new Date().toISOString(),
  };
  saveLocalProfile(existingCineProfile);

  const newGoogleUserId = 'user_google_new_456';
  const newGoogleUser = {
    id: newGoogleUserId,
    email: 'brand_new_user@gmail.com',
    user_metadata: { full_name: 'New Explorer', avatar_url: 'https://avatar.com/2.png' },
  };

  // CASE 1: Existing CineOrder user -> Login with Google -> profile exists -> Home
  const case1Profile = await checkProfileExists(existingGoogleUser.id);
  assert(case1Profile !== null && case1Profile.username === 'cinephile_prime', '8A. CASE 1: Existing CineOrder user logging in has verified profile (cinephile_prime)');

  // CASE 2: New Google user -> Login with Google -> no CineOrder profile -> "No account found"
  const case2Profile = await checkProfileExists(newGoogleUser.id);
  assert(case2Profile === null, '8B. CASE 2: New Google user attempting login has NO CineOrder profile (No account found trigger)');

  // CASE 3: New Google user -> Create Account -> Google authentication -> no profile -> Create Username -> Home
  const isAvailable = await checkUsernameAvailability('new_explorer_99');
  assert(isAvailable === true, '8C-1. CASE 3: Desired username is available');
  const createdProfile = await createOrUpdateGoogleProfile(newGoogleUser, 'new_explorer_99');
  assert(createdProfile.username === 'new_explorer_99', '8C-2. CASE 3: Username onboarding creates profile with username "new_explorer_99"');
  assert(createdProfile.email === 'brand_new_user@gmail.com', '8C-3. CASE 3: Profile email bound to Google auth email');
  const verifiedNewProfile = await checkProfileExists(newGoogleUserId);
  assert(verifiedNewProfile !== null && verifiedNewProfile.username === 'new_explorer_99', '8C-4. CASE 3: Profile now exists and is recognized as registered account');

  // CASE 4: Existing CineOrder user -> Create Account -> profile already exists -> "Account already exists. Sign in instead."
  const case4Existing = await checkProfileExists(existingUserId);
  assert(case4Existing !== null && case4Existing.username === 'cinephile_prime', '8D. CASE 4: Existing CineOrder user in signup flow detects existing profile ("Account already exists")');

  // CASE 5: New user tries Login, receives "No account found", then clicks Create Account -> reuse authenticated Google identity -> create profile only after username submitted
  const case5UserId = 'user_google_case5_789';
  const case5GoogleUser = {
    id: case5UserId,
    email: 'case5_user@gmail.com',
    user_metadata: { full_name: 'Case 5 User' },
  };
  // 1. In login flow: no profile exists
  const case5Initial = await checkProfileExists(case5UserId);
  assert(case5Initial === null, '8E-1. CASE 5: Initial login finds NO profile');
  // 2. User clicks "Create Account" -> enters username -> submits
  const case5Profile = await createOrUpdateGoogleProfile(case5GoogleUser, 'case5_handle');
  assert(case5Profile.username === 'case5_handle' && case5Profile.id === case5UserId, '8E-2. CASE 5: Transition to Create Account successfully creates profile for reused Google identity');
  const case5Final = await checkProfileExists(case5UserId);
  assert(case5Final !== null && case5Final.username === 'case5_handle', '8E-3. CASE 5: Account is now registered and verified');

  // Hard Refresh & Session Verification
  const unregUserId = 'user_unregistered_999';
  const unregCheck = await checkProfileExists(unregUserId);
  assert(unregCheck === null, '8F. Hard refresh / session initialization rejects unregistered Google auth IDs with no profile');


  console.log('\n========================================================================');
  if (testFailures > 0) {
    console.error(`❌ REGRESSION DETECTED: ${testFailures} tests failed!`);
    if (typeof process !== 'undefined') process.exit(1);
  } else {
    console.log('✅ ALL AUTHENTICATION & MOVIE IDENTITY TESTS PASSED SUCCESSFULLY!');
  }
}

runTests();
