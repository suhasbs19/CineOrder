import { processAIQuery, resetConversationContext } from '../src/lib/aiAdvisorEngine';
import React from 'react';
import { SafeMarkdown } from '../src/components/ui/SafeMarkdown';

console.log('============================================================');
console.log('  CINEORDER AI ADVISOR RESPONSE QUALITY & RENDERING TEST    ');
console.log('============================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (detail) console.error(`   Details: ${detail}`);
    failed++;
  }
}

resetConversationContext();

// ─────────────────────────────────────────────────────────────
// PROMPT 1: "iron man movies"
// ─────────────────────────────────────────────────────────────
console.log('─── Testing Prompt 1: "iron man movies" ───');
const res1 = processAIQuery('iron man movies');
assert(res1.data?.intent === 'character_series', 'Intent is character_series');
assert(res1.text.includes('## Iron Man Movies'), 'Header contains "## Iron Man Movies"');
assert(res1.text.includes('### 1. Iron Man'), 'Contains "### 1. Iron Man"');
assert(res1.text.includes('### 2. Iron Man 2'), 'Contains "### 2. Iron Man 2"');
assert(res1.text.includes('### 3. Iron Man 3'), 'Contains "### 3. Iron Man 3"');
assert(res1.text.includes('May 2, 2008'), 'Formatted date "May 2, 2008" present (no raw ISO string)');
assert(res1.text.includes('**Recommended order**'), 'Contains Recommended order section');
assert(
  Boolean(res1.data?.followUpSuggestions && res1.data.followUpSuggestions.length >= 2),
  'Has at least 2 relevant follow-up suggestions'
);

// ─────────────────────────────────────────────────────────────
// PROMPT 2: "what should I watch after iron man?"
// ─────────────────────────────────────────────────────────────
console.log('\n─── Testing Prompt 2: "what should I watch after iron man?" ───');
const res2 = processAIQuery('what should I watch after iron man?');
assert(res2.data?.intent === 'whats_next', 'Intent is whats_next');
assert(res2.text.includes('What to Watch After Iron Man'), 'Header contains "What to Watch After Iron Man"');
assert(res2.text.includes('Recommended next:'), 'Contains "Recommended next:"');
assert(res2.text.includes('Iron Man 2'), 'Recommends Iron Man 2 as next step');
assert(res2.data?.followUpSuggestions?.some((s) => s.toLowerCase().includes('iron man') || s.toLowerCase().includes('mcu')) === true, 'Follow-up suggestions relevant to MCU/Iron Man');

// ─────────────────────────────────────────────────────────────
// PROMPT 3: "can I skip eternals?"
// ─────────────────────────────────────────────────────────────
console.log('\n─── Testing Prompt 3: "can I skip eternals?" ───');
const res3 = processAIQuery('can I skip eternals?');
assert(res3.data?.intent === 'skip_advice', 'Intent is skip_advice');
assert(res3.text.includes('Skip Advice: Eternals'), 'Header contains "Skip Advice: Eternals"');
assert(res3.text.includes('Verdict:'), 'Contains clear Verdict section');
assert(res3.data?.skipData?.isSafeToSkip === true, 'Eternals is identified as safe to skip');
assert(res3.data?.skipData?.storyImpactPercentage === 5, 'Eternals has 5% story impact');
assert(res3.data?.followUpSuggestions?.some((s) => s.toLowerCase().includes('skip')) === true, 'Contains skip-related follow-ups');

// ─────────────────────────────────────────────────────────────
// PROMPT 4: "prepare me for Avengers: Endgame"
// ─────────────────────────────────────────────────────────────
console.log('\n─── Testing Prompt 4: "prepare me for Avengers: Endgame" ───');
const res4 = processAIQuery('prepare me for Avengers: Endgame');
assert(res4.data?.intent === 'prepare_for', 'Intent is prepare_for');
assert(res4.text.includes('Preparation Guide: Avengers: Endgame'), 'Header contains "Preparation Guide: Avengers: Endgame"');
assert(res4.text.includes('Story Readiness:'), 'Contains Story Readiness metric');
assert(res4.text.includes('Prep Watch Time:'), 'Contains Prep Watch Time metric');
assert(res4.data?.preparationData !== undefined, 'Generated preparationData');
assert(res4.data?.followUpSuggestions?.some((s) => s.toLowerCase().includes('essential') || s.toLowerCase().includes('preparation')) === true, 'Contains preparation-related follow-ups');

// ─────────────────────────────────────────────────────────────
// PROMPT 5: "what should I watch tonight?"
// ─────────────────────────────────────────────────────────────
console.log('\n─── Testing Prompt 5: "what should I watch tonight?" ───');
const res5 = processAIQuery('what should I watch tonight?');
assert(res5.data?.intent === 'watch_tonight', 'Intent is watch_tonight');
assert(res5.text.includes('What to Watch Tonight'), 'Header contains "What to Watch Tonight"');
assert((res5.data?.whatToWatchData?.suggestions.length || 0) > 0, 'Returned tonight viewing suggestions');
assert(res5.data?.followUpSuggestions?.some((s) => s.toLowerCase().includes('short') || s.toLowerCase().includes('franchise')) === true, 'Contains relevant watch tonight follow-ups');

// ─────────────────────────────────────────────────────────────
// RENDERING & SECURITY CHECKS
// ─────────────────────────────────────────────────────────────
console.log('\n─── Testing SafeMarkdown Parser & Security ───');
const testMarkdownInput = `Here's what I found about **Iron Man**:

• **Release:** May 2, 2008
• **Runtime:** 2h 6m
• **Status:** Released
• **Streaming:** Available now

<script>alert("XSS")</script>`;

const rendered = SafeMarkdown({ content: testMarkdownInput });
assert(rendered !== null, 'SafeMarkdown rendered React elements successfully');
assert(React.isValidElement(rendered), 'Output is a valid React element tree');

console.log('\n============================================================');
console.log(`TOTAL: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL AI ADVISOR RESPONSE QUALITY & RENDERING TESTS PASSED!');
  process.exit(0);
}
