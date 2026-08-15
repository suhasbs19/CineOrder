import {
  validateRecommendationCompleteness,
  formatCompletenessReportCLI,
} from '../src/lib/recommendationCompletenessValidator';
import { validateDatasetIntegrity } from '../src/lib/datasetIntegrityValidator';

console.log('========================================');
console.log('CineOrder Global Release Gate Audit');
console.log('========================================\n');

// 1. Run Dataset Integrity Audit
const integrityReport = validateDatasetIntegrity();
if (!integrityReport.valid) {
  console.error(`❌ RELEASE GATE BLOCKED: ${integrityReport.errorCount} dataset integrity error(s) detected!\n`);
  integrityReport.issues
    .filter((i) => i.severity === 'error')
    .forEach((err, idx) => {
      console.error(`  ${idx + 1}. [${err.category}] ${err.message}`);
    });
  console.log('\n');
} else {
  console.log('✅ Dataset Integrity Audit: PASS (0 errors)');
}

// 2. Run Recommendation Completeness Audit
const report = validateRecommendationCompleteness();
const formattedReport = formatCompletenessReportCLI(report);

console.log(formattedReport);

declare const process: { exit: (code: number) => void };

if (!integrityReport.valid || report.status === 'FAIL') {
  console.error('❌ RELEASE GATE RESULT: FAILED');
  process.exit(1);
} else {
  console.log('✅ RELEASE GATE RESULT: PASSED');
  process.exit(0);
}
