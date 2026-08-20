/**
 * CineOrder — Comprehensive Regression Runner (Single Process Dynamic Import)
 */

import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import * as path from 'path';

async function main() {
  const testsDir = path.resolve('src/__tests__');
  const files = readdirSync(testsDir).filter((f) => f.endsWith('.test.ts'));
  console.log(`\n========================================================================`);
  console.log(`  RUNNING ${files.length} TEST SUITES (IN-PROCESS DYNAMIC IMPORTER)`);
  console.log(`========================================================================\n`);

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const fullPath = path.join(testsDir, file);
    const start = Date.now();
    try {
      // Import the test file directly
      await import(pathToFileURL(fullPath).href);
      const elapsed = Date.now() - start;
      console.log(`  ✅ ${file} (${elapsed}ms)`);
      passed++;
    } catch (err: any) {
      const elapsed = Date.now() - start;
      console.error(`  ❌ ${file} (${elapsed}ms):`, err?.message || err);
      failed++;
    }
  }

  console.log(`\n========================================================================`);
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${files.length})`);
  console.log(`========================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test runner encountered fatal error:', err);
  process.exit(1);
});
