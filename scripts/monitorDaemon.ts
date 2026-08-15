/**
 * CineOrder — Continuous Global Announcement Monitor Daemon & Scheduler
 *
 * Usage:
 *   npx tsx scripts/monitorDaemon.ts --once
 *   npx tsx scripts/monitorDaemon.ts --daemon --interval 360
 *   npx tsx scripts/monitorDaemon.ts --status
 *   npx tsx scripts/monitorDaemon.ts --reset
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  GlobalAnnouncementMonitor,
  CURATED_MONITOR_EVENTS,
  MonitorStorageAdapter,
} from '../src/lib/globalAnnouncementMonitor';
import type {
  MonitorScanState,
  NormalizedSourceEvent,
  DiscoveryScanResult,
} from '../src/types/announcementDiscovery';

const WORKSPACE_ROOT = path.resolve(process.env.GITHUB_WORKSPACE || process.cwd());
export const STATE_FILE_PATH = path.join(WORKSPACE_ROOT, '.cineorder_monitor_state.json');
export const PROPOSALS_FILE_PATH = path.join(WORKSPACE_ROOT, '.cineorder_announcement_proposals.json');
export const LOCK_FILE_PATH = path.join(WORKSPACE_ROOT, '.cineorder_monitor.lock');

/**
 * Generates a valid clean initial monitor state
 */
export function createDefaultMonitorState(): MonitorScanState {
  const now = new Date().toISOString();
  return {
    lastScanAt: now,
    lastSuccessfulScanAt: now,
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
}

/**
 * Ensure persistence files exist on disk for artifact upload and caching BEFORE and AFTER scan
 */
export function ensurePersistenceFilesExist(monitor?: GlobalAnnouncementMonitor): void {
  try {
    if (!fs.existsSync(STATE_FILE_PATH)) {
      const defaultState = monitor ? monitor.getState() : createDefaultMonitorState();
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(defaultState, null, 2), 'utf-8');
    }
    if (!fs.existsSync(PROPOSALS_FILE_PATH)) {
      fs.writeFileSync(PROPOSALS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[MonitorDaemon] Error ensuring persistence files:', err);
    throw err;
  }
}

/**
 * Concurrency Lock Management
 */
export function acquireLock(): boolean {
  try {
    if (fs.existsSync(LOCK_FILE_PATH)) {
      const lockData = fs.readFileSync(LOCK_FILE_PATH, 'utf-8');
      try {
        const { pid, timestamp } = JSON.parse(lockData);
        const lockAgeMs = Date.now() - new Date(timestamp).getTime();
        // If lock is older than 15 minutes, consider it stale from a dead process
        if (lockAgeMs < 15 * 60 * 1000) {
          console.warn(`[MonitorDaemon] Another scan is currently active (PID: ${pid}, Age: ${Math.round(lockAgeMs / 1000)}s). Skipping concurrent run.`);
          return false;
        }
      } catch {
        // Corrupted lock file -> override
      }
    }
    fs.writeFileSync(
      LOCK_FILE_PATH,
      JSON.stringify({ pid: process.pid, timestamp: new Date().toISOString() }),
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error('[MonitorDaemon] Error acquiring lock:', err);
    return false;
  }
}

export function releaseLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE_PATH)) {
      fs.unlinkSync(LOCK_FILE_PATH);
    }
  } catch {
    // Ignore cleanup error
  }
}

// Clean up lock on unexpected exit
process.on('SIGINT', () => { releaseLock(); process.exit(0); });
process.on('SIGTERM', () => { releaseLock(); process.exit(0); });
process.on('exit', () => { releaseLock(); });

/**
 * Node File System Storage Adapter for persistent scan checkpoints
 */
export class NodeFsStorageAdapter implements MonitorStorageAdapter {
  load(): MonitorScanState | null {
    try {
      if (fs.existsSync(STATE_FILE_PATH)) {
        const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        if (raw.trim().length > 0) {
          return JSON.parse(raw);
        }
      }
    } catch (err) {
      console.warn('[MonitorDaemon] Corrupted monitor state file detected on disk. Safely reinitializing clean state:', err);
    }
    return null;
  }

  save(state: MonitorScanState): void {
    try {
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[MonitorDaemon] Error saving persistent state to disk:', err);
      throw err;
    }
  }
}

/**
 * Persist generated proposals to disk for editorial review
 */
export function saveProposalsToDisk(proposals: any[] = []): void {
  try {
    let existing: any[] = [];
    if (fs.existsSync(PROPOSALS_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(PROPOSALS_FILE_PATH, 'utf-8');
        if (raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            existing = parsed;
          }
        }
      } catch (err) {
        console.warn('[MonitorDaemon] Corrupted proposals file on disk. Resetting proposals list:', err);
        existing = [];
      }
    }
    const existingIds = new Set(existing.map((p) => p.id));
    const newlyAdded = (proposals || []).filter((p) => !existingIds.has(p.id));
    const combined = [...existing, ...newlyAdded];
    fs.writeFileSync(PROPOSALS_FILE_PATH, JSON.stringify(combined, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MonitorDaemon] Error persisting proposals to disk:', err);
    throw err;
  }
}

let isScanRunning = false;

export function runMonitoringScan(options?: {
  verbose?: boolean;
  force?: boolean;
  overrideEvents?: NormalizedSourceEvent[];
}): DiscoveryScanResult | null {
  if (isScanRunning) {
    console.warn('[MonitorDaemon] Scan is already running in current process. Skipping overlapping execution.');
    return null;
  }

  if (!acquireLock()) {
    return null;
  }

  isScanRunning = true;
  let monitor: GlobalAnnouncementMonitor | null = null;
  let result: DiscoveryScanResult | null = null;
  const adapter = new NodeFsStorageAdapter();

  try {
    // 1. Explicit Runtime Diagnostics Logging
    console.log(`\n============================================================`);
    console.log(`MONITOR RUNTIME`);
    console.log(`---------------`);
    console.log(`process.cwd():                ${process.cwd()}`);
    console.log(`process.env.GITHUB_WORKSPACE: ${process.env.GITHUB_WORKSPACE || '(not set)'}`);
    console.log(`platform:                     ${process.platform}`);
    console.log(`runtime:                      Node.js ${process.version}`);
    console.log(`storage adapter selected:     NodeFsStorageAdapter`);
    console.log(`state path:                   ${STATE_FILE_PATH}`);
    console.log(`proposal path:                ${PROPOSALS_FILE_PATH}`);
    console.log(`\nSTORAGE ADAPTER: NodeFsStorageAdapter`);
    console.log(`============================================================\n`);

    // 2. Guarantee files physically exist BEFORE scanning
    ensurePersistenceFilesExist();

    monitor = new GlobalAnnouncementMonitor({}, adapter);

    const eventsToProcess: NormalizedSourceEvent[] = options?.overrideEvents ?? [...CURATED_MONITOR_EVENTS];
    result = monitor.processEvents(eventsToProcess, { forceScan: options?.force });

    // 3. Persist proposals immediately
    saveProposalsToDisk(result.proposalsGenerated);

    console.log(`\n--- SCAN RESULTS ---`);
    console.log(`Total Authoritative Events Discovered: ${result.totalAnnouncementsDiscovered}`);
    console.log(`Verified Announcements:                 ${result.verifiedAnnouncementsCount}`);
    console.log(`Rejected Rumors / Unverified:           ${result.rejectedRumorsCount}`);
    console.log(`Duplicate Proposals Ignored:            ${result.duplicateEventsIgnoredCount || 0}`);
    console.log(`Proposals Staged for Human Review:      ${result.proposalsGenerated.length}`);
    console.log(`Execution Duration:                     ${result.scanDurationMs || 0} ms`);

    console.log(`\n--- CATEGORY BREAKDOWN ---`);
    for (const [cat, count] of Object.entries(result.categoryBreakdown)) {
      if (count > 0) {
        console.log(`  • ${cat.padEnd(24)}: ${count}`);
      }
    }

    if (options?.verbose && result.proposalsGenerated.length > 0) {
      console.log(`\n--- NEW STAGED PROPOSALS ---`);
      for (const p of result.proposalsGenerated) {
        console.log(`  [${p.category}] ${p.title} (Franchise: ${p.franchiseName})`);
        if (p.diff) {
          console.log(`    Diff: ${p.diff.diffSummary}`);
        }
        if (p.isConflict) {
          console.log(`    Conflict: ${p.conflictDetails?.resolutionNote}`);
        }
      }
    }

    return result;
  } finally {
    try {
      // 4. Finally-safe persistence guarantee
      if (monitor) {
        adapter.save(monitor.getState());
      }
      ensurePersistenceFilesExist(monitor ?? undefined);
      saveProposalsToDisk(result?.proposalsGenerated ?? []);

      // 5. Strict Physical File Verification
      if (!fs.existsSync(STATE_FILE_PATH)) {
        throw new Error(`[Persistence Failure] State file not found on disk at: ${STATE_FILE_PATH}`);
      }
      if (!fs.existsSync(PROPOSALS_FILE_PATH)) {
        throw new Error(`[Persistence Failure] Proposals file not found on disk at: ${PROPOSALS_FILE_PATH}`);
      }

      const stateSize = fs.statSync(STATE_FILE_PATH).size;
      const propSize = fs.statSync(PROPOSALS_FILE_PATH).size;

      if (stateSize === 0) {
        throw new Error(`[Persistence Failure] State file is empty (0 bytes) at ${STATE_FILE_PATH}`);
      }
      if (propSize === 0) {
        throw new Error(`[Persistence Failure] Proposals file is empty (0 bytes) at ${PROPOSALS_FILE_PATH}`);
      }

      JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf-8'));
      JSON.parse(fs.readFileSync(PROPOSALS_FILE_PATH, 'utf-8'));

      console.log(`\nSTATE FILE: EXISTS (${stateSize} bytes)`);
      console.log(`PROPOSAL FILE: EXISTS (${propSize} bytes)`);
      console.log(`JSON VALIDATION: PASS`);
      console.log(`PERSISTENCE VERIFICATION: PASS`);
      console.log(`✅ Monitor scan complete. State & proposals safely verified on disk.\n`);
    } catch (persistErr) {
      console.error('[MonitorDaemon] Fatal persistence failure during scan finalization:', persistErr);
      releaseLock();
      process.exit(1);
    } finally {
      isScanRunning = false;
      releaseLock();
    }
  }
}

// CLI Execution Entry Point
export async function main() {
  const args = process.argv.slice(2);
  const isOnce = args.includes('--once') || args.length === 0;
  const isDaemon = args.includes('--daemon');
  const isStatus = args.includes('--status');
  const isReset = args.includes('--reset');
  const isVerbose = args.includes('--verbose') || args.includes('-v');

  const adapter = new NodeFsStorageAdapter();
  const monitor = new GlobalAnnouncementMonitor({}, adapter);

  if (isReset) {
    monitor.resetState();
    releaseLock();
    if (fs.existsSync(STATE_FILE_PATH)) fs.unlinkSync(STATE_FILE_PATH);
    if (fs.existsSync(PROPOSALS_FILE_PATH)) fs.unlinkSync(PROPOSALS_FILE_PATH);
    console.log(`[MonitorDaemon] Persistent state and proposals reset successfully.`);
    return;
  }

  if (isStatus) {
    const state = monitor.getState();
    console.log(`\n--- CINEORDER MONITOR PERSISTENT STATE ---`);
    console.log(JSON.stringify(state, null, 2));
    return;
  }

  if (isDaemon) {
    const intervalArgIdx = args.indexOf('--interval');
    const intervalMinutes = intervalArgIdx !== -1 && args[intervalArgIdx + 1]
      ? parseInt(args[intervalArgIdx + 1], 10)
      : 360; // default 6 hours

    console.log(`🚀 Starting CineOrder Announcement Monitor in DAEMON mode (Interval: ${intervalMinutes} mins)...`);
    
    // Initial scan
    runMonitoringScan({ verbose: isVerbose });

    // Recurring schedule with overlapping protection
    setInterval(() => {
      try {
        runMonitoringScan({ verbose: isVerbose });
      } catch (err) {
        console.error('[MonitorDaemon] Error in scheduled run:', err);
      }
    }, intervalMinutes * 60 * 1000);
    return;
  }

  if (isOnce) {
    runMonitoringScan({ verbose: isVerbose });
  }
}

// Check if running directly as a script
const isDirectScriptExecution =
  typeof process !== 'undefined' &&
  Boolean(
    process.argv &&
    process.argv.length > 1 &&
    (process.argv[1].endsWith('monitorDaemon.ts') ||
     process.argv[1].endsWith('monitorDaemon.js') ||
     process.argv[1].includes('monitorDaemon'))
  );

if (isDirectScriptExecution) {
  main().catch((err) => {
    console.error('[MonitorDaemon] Fatal error:', err);
    releaseLock();
    process.exit(1);
  });
}
