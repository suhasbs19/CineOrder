import {
  processAIQuery,
  resetConversationContext,
} from '../lib/aiAdvisorEngine';

export function runAIAdvisorTests() {
  console.log('🧪 Running AI Advisor Unit Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  resetConversationContext();

  // Test 1: Intent Classification — Character Series ("iron man movies")
  const ironManMoviesRes = processAIQuery('iron man movies');
  assert(ironManMoviesRes.data?.intent === 'character_series', 'Intent classified as character_series');
  assert(ironManMoviesRes.data?.seriesData !== undefined, 'Generated seriesData');
  assert((ironManMoviesRes.data?.seriesData?.movies.length || 0) >= 3, 'Found at least 3 Iron Man movies');
  assert(ironManMoviesRes.text.includes('## Iron Man Movies'), 'Header rendered as ## Iron Man Movies');
  assert(ironManMoviesRes.text.includes('**Recommended order**'), 'Contains Recommended order section');
  assert(ironManMoviesRes.data?.followUpSuggestions?.some(s => s.toLowerCase().includes('iron man')) === true, 'Follow-up suggestions relevant to Iron Man');

  // Test 2: Intent Classification — What Should I Watch After ("what should I watch after iron man?")
  const afterRes = processAIQuery('what should I watch after iron man?');
  assert(afterRes.data?.intent === 'whats_next', 'Intent classified as whats_next');
  assert(afterRes.data?.targetContent?.title.includes('Iron Man') === true, 'Resolved target title Iron Man');
  assert(afterRes.text.includes('What to Watch After Iron Man'), 'Header rendered as What to Watch After Iron Man');
  assert(afterRes.text.includes('Recommended next:'), 'Includes Recommended next');
  assert(afterRes.data?.followUpSuggestions?.length! > 0, 'Generated follow-up suggestions for whats_next');

  // Test 3: Intent Classification — Skip Advice ("can I skip eternals?")
  const skipRes = processAIQuery('can I skip eternals?');
  assert(skipRes.data?.intent === 'skip_advice', 'Intent classified as skip_advice');
  assert(skipRes.data?.targetContent?.title.includes('Eternals') === true, 'Resolved target title Eternals');
  assert(skipRes.data?.skipData !== undefined, 'Generated skipData from Knowledge Graph analysis');
  assert(skipRes.data?.skipData?.isSafeToSkip === true, 'Eternals classified as safe to skip');
  assert(skipRes.text.includes('Skip Advice: Eternals'), 'Header rendered as Skip Advice: Eternals');
  assert(skipRes.data?.followUpSuggestions?.some(s => s.toLowerCase().includes('skip')) === true, 'Follow-up suggestions relevant to skipping');

  // Test 4: Intent Classification — Prepare For ("prepare me for Avengers: Endgame")
  const prepRes = processAIQuery('prepare me for Avengers: Endgame');
  assert(prepRes.data?.intent === 'prepare_for', 'Intent classified as prepare_for');
  assert(prepRes.data?.targetContent?.title.includes('Endgame') === true, 'Resolved target title Endgame');
  assert(prepRes.data?.preparationData !== undefined, 'Generated preparationData from Knowledge Graph');
  assert(prepRes.text.includes('Preparation Guide: Avengers: Endgame'), 'Header rendered as Preparation Guide');
  assert(prepRes.text.includes('Story Readiness:'), 'Includes Story Readiness metric');
  assert(prepRes.data?.followUpSuggestions?.some(s => s.toLowerCase().includes('movies') || s.toLowerCase().includes('order')) === true, 'Generated relevant prep follow-ups');

  // Test 5: Intent Classification — Watch Tonight ("what should I watch tonight?")
  const tonightRes = processAIQuery('what should I watch tonight?');
  assert(tonightRes.data?.intent === 'watch_tonight', 'Intent classified as watch_tonight');
  assert(tonightRes.data?.whatToWatchData !== undefined, 'Generated whatToWatchData');
  assert(tonightRes.text.includes('What to Watch Tonight'), 'Header rendered as What to Watch Tonight');
  assert((tonightRes.data?.whatToWatchData?.suggestions.length || 0) > 0, 'Found suggestions for tonight');

  // Test 6: Intent Classification — Time Budget
  const timeRes = processAIQuery('I only have 8 hours for Marvel');
  assert(timeRes.data?.intent === 'time_budget', 'Intent classified as time_budget');
  assert(timeRes.data?.timePlan !== undefined, 'Generated timePlan');
  assert(timeRes.data?.timePlan?.budgetMinutes === 480, 'Budget set to 480 minutes (8h)');
  assert((timeRes.data?.timePlan?.recommendedTitles.length || 0) > 0, 'Populated recommended titles within budget');

  // Test 7: Intent Classification — Character Journey
  const charRes = processAIQuery("Show Iron Man's journey");
  assert(charRes.data?.intent === 'character_journey', 'Intent classified as character_journey');
  assert(charRes.data?.characterData !== undefined, 'Generated characterData');
  assert(charRes.data?.characterData?.name.includes('Iron Man') === true, 'Resolved character name Iron Man');
  assert((charRes.data?.characterData?.appearances.length || 0) > 0, 'Found character appearances');

  // Test 8: Intent Classification — Franchise Start
  const startRes = processAIQuery('Where should I start with Marvel?');
  assert(startRes.data?.intent === 'franchise_start', 'Intent classified as franchise_start');
  assert(startRes.data?.franchiseStartData !== undefined, 'Generated franchiseStartData');
  assert((startRes.data?.franchiseStartData?.entryPoints.length || 0) > 0, 'Returned entry points');

  // Test 9: Intent Classification — Lore Explanation
  const loreRes = processAIQuery('Explain the Multiverse');
  assert(loreRes.data?.intent === 'lore_explain', 'Intent classified as lore_explain');
  assert(loreRes.data?.loreData !== undefined, 'Generated loreData');
  assert(loreRes.data?.loreData?.term.includes('Multiverse') === true, 'Resolved lore term Multiverse');

  // Test 10: Context Tracking and Pronoun Resolution
  resetConversationContext();
  processAIQuery('Prepare me for Iron Man');
  const pronounRes = processAIQuery('Can I skip it?');
  assert(pronounRes.data?.intent === 'skip_advice', 'Pronoun query classified as skip_advice');
  assert(pronounRes.data?.targetContent?.title.includes('Iron Man') === true, 'Pronoun "it" resolved to Iron Man from session context');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  return failed === 0;
}

runAIAdvisorTests();
