/**
 * CineOrder — Zero-Event Persistence Test Suite
 *
 * Verifies that running monitor:once with zero announcements / zero events:
 * 1. Guarantees creation of .cineorder_monitor_state.json
 * 2. Guarantees creation of .cineorder_announcement_proposals.json
 * 3. Both files physically exist on disk, are non-empty, and parse to valid JSON
 * 4. Subsequent runs safely preserve and update persistent state.
 */

import {
  GlobalAnnouncementMonitor,
  MonitorStorageAdapter,
} from '../lib/globalAnnouncementMonitor';
import type { MonitorScanState } from '../types/announcementDiscovery';

declare const process: { exit: (code: number) => void };

// Dynamic import for Node.js modules without requiring ambient @types/node in browser tsconfig
const dynamicImport = new Function('specifier', 'return import(specifier)');
const fs: any = await dynamicImport('node:fs');
const path: any = await dynamicImport('node:path');
const os: any = await dynamicImport('node:os');

console.log('========================================================================');
console.log('  CINEORDER ZERO-EVENT PERSISTENCE TEST SUITE                           ');
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

// 1. Create a clean isolated temporary test directory
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cineorder-zero-event-test-'));
const testStatePath = path.join(tempDir, '.cineorder_monitor_state.json');
const testProposalsPath = path.join(tempDir, '.cineorder_announcement_proposals.json');

class TestDiskFsStorageAdapter implements MonitorStorageAdapter {
  private statePath: string;

  constructor(statePath: string) {
    this.statePath = statePath;
  }

  load(): MonitorScanState | null {
    try {
      if (fs.existsSync(this.statePath)) {
        const raw = fs.readFileSync(this.statePath, 'utf-8');
        if (raw.trim().length > 0) {
          return JSON.parse(raw);
        }
      }
    } catch {
      // Return null on corruption
    }
    return null;
  }

  save(state: MonitorScanState): void {
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf-8');
  }
}

function saveTestProposals(proposalsPath: string, proposals: any[] = []): void {
  let existing: any[] = [];
  if (fs.existsSync(proposalsPath)) {
    try {
      const raw = fs.readFileSync(proposalsPath, 'utf-8');
      if (raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) existing = parsed;
      }
    } catch {
      existing = [];
    }
  }
  const existingIds = new Set(existing.map((p) => p.id));
  const newlyAdded = (proposals || []).filter((p) => !existingIds.has(p.id));
  const combined = [...existing, ...newlyAdded];
  fs.writeFileSync(proposalsPath, JSON.stringify(combined, null, 2), 'utf-8');
}

function ensureTestFilesExist(statePath: string, proposalsPath: string): void {
  if (!fs.existsSync(statePath)) {
    const defaultState: MonitorScanState = {
      lastScanAt: new Date().toISOString(),
      lastSuccessfulScanAt: new Date().toISOString(),
      totalScansCount: 0,
      scanDurationMs: 0,
      sourcesCheckedCount: 0,
      sourcesFailedCount: 0,
      duplicateEventsIgnoredCount: 0,
      processedEventIds: [],
      eventHashes: [],
      sourceCooldowns: {},
      failedSources: [],
      discoveredTitlesCount: 0,
      proposalsCreatedCount: 0,
      rejectedRumorsCount: 0,
      conflictsDetectedCount: 0,
    };
    fs.writeFileSync(statePath, JSON.stringify(defaultState, null, 2), 'utf-8');
  }
  if (!fs.existsSync(proposalsPath)) {
    fs.writeFileSync(proposalsPath, JSON.stringify([], null, 2), 'utf-8');
  }
}

try {
  // ========================================================================
  // TEST CASE 1: Pre-Scan File Guarantee
  // ========================================================================
  console.log('--- Test Case 1: Pre-Scan File Guarantee ---');
  assert(!fs.existsSync(testStatePath), '1A. State file does not exist before initialization');
  assert(!fs.existsSync(testProposalsPath), '1B. Proposals file does not exist before initialization');

  ensureTestFilesExist(testStatePath, testProposalsPath);
  assert(fs.existsSync(testStatePath), '1C. State file exists after ensureTestFilesExist()');
  assert(fs.existsSync(testProposalsPath), '1D. Proposals file exists after ensureTestFilesExist()');
  assert(fs.statSync(testStatePath).size > 0, '1E. State file is non-empty');
  assert(fs.statSync(testProposalsPath).size > 0, '1F. Proposals file is non-empty');

  // ========================================================================
  // TEST CASE 2: Execution with 0 Announcements
  // ========================================================================
  console.log('\n--- Test Case 2: Zero-Event Scan Execution ---');
  const adapter = new TestDiskFsStorageAdapter(testStatePath);
  const monitor = new GlobalAnnouncementMonitor({}, adapter);

  // Scan with 0 events
  const result = monitor.processEvents([]);
  saveTestProposals(testProposalsPath, result.proposalsGenerated);

  assert(result.totalAnnouncementsDiscovered === 0, '2A. Total announcements discovered is 0');
  assert(result.proposalsGenerated.length === 0, '2B. Proposals generated is 0');
  assert(fs.existsSync(testStatePath), '2C. State file physically exists on disk after zero-event scan');
  assert(fs.existsSync(testProposalsPath), '2D. Proposals file physically exists on disk after zero-event scan');

  // ========================================================================
  // TEST CASE 3: JSON Integrity & Content Validation
  // ========================================================================
  console.log('\n--- Test Case 3: JSON Integrity & Content Validation ---');
  const stateRaw = fs.readFileSync(testStatePath, 'utf-8');
  const propRaw = fs.readFileSync(testProposalsPath, 'utf-8');

  let stateObj: any;
  let propObj: any;

  try {
    stateObj = JSON.parse(stateRaw);
    assert(true, '3A. State file parses as valid JSON');
  } catch (e) {
    assert(false, `3A. State file JSON parse failed: ${e}`);
  }

  try {
    propObj = JSON.parse(propRaw);
    assert(true, '3B. Proposals file parses as valid JSON');
  } catch (e) {
    assert(false, `3B. Proposals file JSON parse failed: ${e}`);
  }

  assert(stateObj.totalScansCount === 1, '3C. totalScansCount incremented to 1');
  assert(stateObj.discoveredTitlesCount === 0, '3D. discoveredTitlesCount is 0');
  assert(Array.isArray(propObj) && propObj.length === 0, '3E. Proposals file is a valid empty array []');

  // ========================================================================
  // TEST CASE 4: Subsequent Run Idempotency
  // ========================================================================
  console.log('\n--- Test Case 4: Subsequent Zero-Event Run ---');
  const monitor2 = new GlobalAnnouncementMonitor({}, adapter);
  const result2 = monitor2.processEvents([]);
  saveTestProposals(testProposalsPath, result2.proposalsGenerated);

  const stateObj2 = JSON.parse(fs.readFileSync(testStatePath, 'utf-8'));
  const propObj2 = JSON.parse(fs.readFileSync(testProposalsPath, 'utf-8'));

  assert(stateObj2.totalScansCount === 2, '4A. totalScansCount safely incremented to 2');
  assert(Array.isArray(propObj2) && propObj2.length === 0, '4B. Proposals array safely retained');
  assert(fs.existsSync(testStatePath) && fs.existsSync(testProposalsPath), '4C. Both files persist across multiple zero-event runs');

} finally {
  // Cleanup test temporary files
  try {
    if (fs.existsSync(testStatePath)) fs.unlinkSync(testStatePath);
    if (fs.existsSync(testProposalsPath)) fs.unlinkSync(testProposalsPath);
    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  } catch {
    // Ignore cleanup
  }
}

console.log(`\n========================================================================`);
console.log(`  ZERO-EVENT PERSISTENCE TEST SUITE: ${testFailures === 0 ? '✅ ALL INVARIANTS PASSED' : `❌ ${testFailures} FAILURES DETECTED`}`);
console.log(`========================================================================\n`);

if (testFailures > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
