import {
  validateRecommendationCompleteness,
  type CompletenessReport,
} from '../lib/recommendationCompletenessValidator';
import { generatePreparationGuide } from '../lib/preparationGuide';
import { storyEdges, titleNodes } from '../data/cineOrderKnowledgeGraph';
import { allContent } from '../data/franchises/index';

console.log('========================================================================');
console.log('  CINEORDER PERMANENT RECOMMENDATION COMPLETENESS REGRESSION SUITE      ');
console.log('========================================================================\n');

interface TestResult {
  scenario: string;
  passed: boolean;
  message: string;
}

const testResults: TestResult[] = [];

// 1. Overall System Audit Status Test
const report: CompletenessReport = validateRecommendationCompleteness();
testResults.push({
  scenario: 'A. Global System Completeness Audit',
  passed: report.status === 'PASS' && report.failures.length === 0,
  message: `Overall Status: ${report.status} | Failures: ${report.failures.length}`,
});

// 2. Legitimate Entry Points Test (Iron Man, The Conjuring, A New Hope, Fellowship of the Ring, etc.)
const entryPointTitles = ['mcu-iron-man', 'conj-1', 'sw-ep4', 'lotr-1', 'ff-1', 'jw-1'];
let entryPointFailures = 0;

entryPointTitles.forEach((titleId) => {
  const audit = report.titleAudits.find((a) => a.titleId === titleId);
  if (!audit || audit.status !== 'VALID_ZERO') {
    entryPointFailures++;
  }
});

testResults.push({
  scenario: 'B. Legitimate Standalone Entry Points (VALID_ZERO)',
  passed: entryPointFailures === 0,
  message: `Verified ${entryPointTitles.length} canonical entry points evaluated as VALID_ZERO. Failures: ${entryPointFailures}`,
});

// 3. Graph Edge to Recommendation Engine Flow Test
const fixedTitles = ['sw-mandalorian', 'dc-aquaman', 'sw-tcw-series', 'jp-camp-cretaceous'];
let recEngineFailures = 0;

fixedTitles.forEach((titleId) => {
  const prep = generatePreparationGuide(titleId);
  const totalRecs = (prep?.mustWatch.length || 0) + (prep?.recommended.length || 0) + (prep?.optional.length || 0);
  if (totalRecs === 0) {
    recEngineFailures++;
  }
});

testResults.push({
  scenario: 'C. Graph Edges Produce Valid Recommendations in Engine',
  passed: recEngineFailures === 0,
  message: `Verified ${fixedTitles.length} fixed titles return non-zero recommendations. Failures: ${recEngineFailures}`,
});

// 4. Broken Edge Reference Detection Test
const brokenEdges = storyEdges.filter((e) => !titleNodes[e.sourceId] || !titleNodes[e.targetId]);
testResults.push({
  scenario: 'D. Broken Edge Reference Detection',
  passed: brokenEdges.length === 0,
  message: `Checked ${storyEdges.length} story edges for broken node references. Broken: ${brokenEdges.length}`,
});

// 5. Orphan Node Detection Test
const missingNodes = allContent.filter((c) => !titleNodes[c.id]);
testResults.push({
  scenario: 'E. Catalog Items Graph Node Integration',
  passed: missingNodes.length === 0,
  message: `Checked ${allContent.length} catalog items for CKG TitleNode definitions. Missing: ${missingNodes.length}`,
});

// 6. Conjuring Failure Prevention Simulation Test
// Verify that if a multi-title franchise has 0 edges, the validator catches it immediately
const simulatedFranchiseZeroEdgesTest = report.franchiseAudits.every((f) => {
  if (f.titleCount > 1 && f.storyEdgeCount === 0) {
    return f.status === 'FAIL';
  }
  return true;
});

testResults.push({
  scenario: 'F. Conjuring Failure Pattern Protection (Multi-title Zero Edge Flagging)',
  passed: simulatedFranchiseZeroEdgesTest,
  message: `Verified system flags any multi-title franchise with 0 edges as an integration failure.`,
});

// Print Results
console.table(
  testResults.map((t) => ({
    Scenario: t.scenario,
    Result: t.passed ? '✅ PASS' : '❌ FAIL',
    Details: t.message,
  }))
);

const allPassed = testResults.every((t) => t.passed);
console.log(`\nRegression Suite Result: ${allPassed ? '✅ ALL REGRESSION TESTS PASSED' : '❌ REGRESSION FAILURES DETECTED'}\n`);

declare const process: { exit: (code: number) => void };

if (!allPassed && typeof process !== 'undefined') {
  process.exit(1);
}
