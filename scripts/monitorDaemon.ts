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

const STATE_FILE_PATH = path.resolve(process.cwd(), '.cineorder_monitor_state.json');
const PROPOSALS_FILE_PATH = path.resolve(process.cwd(), '.cineorder_announcement_proposals.json');
const LOCK_FILE_PATH = path.resolve(process.cwd(), '.cineorder_monitor.lock');

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
  } catch (err) {
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
        return JSON.parse(raw);
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
    }
  }
}

/**
 * Persist generated proposals to disk for editorial review
 */
export function saveProposalsToDisk(proposals: any[]): void {
  try {
    let existing: any[] = [];
    if (fs.existsSync(PROPOSALS_FILE_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(PROPOSALS_FILE_PATH, 'utf-8'));
      } catch {
        existing = [];
      }
    }
    const existingIds = new Set(existing.map((p) => p.id));
    const newlyAdded = proposals.filter((p) => !existingIds.has(p.id));
    const combined = [...existing, ...newlyAdded];
    fs.writeFileSync(PROPOSALS_FILE_PATH, JSON.stringify(combined, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MonitorDaemon] Error persisting proposals to disk:', err);
  }
}

let isScanRunning = false;

export function runMonitoringScan(options?: { verbose?: boolean; force?: boolean }): DiscoveryScanResult | null {
  if (isScanRunning) {
    console.warn('[MonitorDaemon] Scan is already running in current process. Skipping overlapping execution.');
    return null;
  }

  if (!acquireLock()) {
    return null;
  }

  isScanRunning = true;
  try {
    const adapter = new NodeFsStorageAdapter();
    const monitor = new GlobalAnnouncementMonitor({}, adapter);

    console.log(`\n============================================================`);
    console.log(`📡 CINEORDER CONTINUOUS ANNOUNCEMENT MONITOR — RUNNING SCAN`);
    console.log(`============================================================`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`State File: ${STATE_FILE_PATH}`);

    const eventsToProcess: NormalizedSourceEvent[] = [...CURATED_MONITOR_EVENTS];
    const result = monitor.processEvents(eventsToProcess, { forceScan: options?.force });

    if (result.proposalsGenerated.length > 0) {
      saveProposalsToDisk(result.proposalsGenerated);
    }

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

    console.log(`\n✅ Monitor scan complete. State safely saved to disk.\n`);
    return result;
  } finally {
    isScanRunning = false;
    releaseLock();
  }
}

// CLI Execution Entry Point
async function main() {
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

if (process.argv[1] && process.argv[1].includes('monitorDaemon')) {
  main().catch((err) => {
    console.error('[MonitorDaemon] Fatal error:', err);
    releaseLock();
    process.exit(1);
  });
}
