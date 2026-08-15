/**
 * Content-Addressable Recommendation Snapshot Store
 * Keys immutable RecommendationSnapshots by deterministic SHA-256 checksums:
 * - Automatic deduplication across identical graph states
 * - Reference counting & garbage collection
 * - Two-Tier L1 Cache / L2 Durable Repository re-hydration
 * - Operational insights tracking (createdAt, lastAccessedAt, accessCount)
 * - Structured Cache Telemetry & Source Attribution (L1, L2, NONE)
 * - Decoupled Cache Event System (SnapshotLoaded, SnapshotRehydrated, SnapshotEvicted, SnapshotPersisted, SnapshotReleased)
 * - LRU Cache Eviction strategy for memory management
 * - Historical diffing between snapshot checksums
 */

import type { RecommendationSnapshot } from '@/types/recommendationService';

export interface SnapshotStoreEntry {
  checksum: string;
  targetId: string;
  snapshot: RecommendationSnapshot;
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
  referenceCount: number;
}

export interface SnapshotDiffResult {
  targetId: string;
  checksumA: string;
  checksumB: string;
  mustWatchDiff: { added: string[]; removed: string[] };
  recommendedDiff: { added: string[]; removed: string[] };
  readinessDeltaPercentage: number;
  watchTimeDeltaMinutes: number;
  isIdentical: boolean;
}

export type CacheLookupStatus = 'HIT_L1' | 'REHYDRATED_FROM_L2' | 'NOT_FOUND';
export type CacheSourceType = 'L1' | 'L2' | 'NONE';

export interface CacheQueryResult<T> {
  status: CacheLookupStatus;
  source: CacheSourceType;
  lookupDurationMs: number;
  checksum: string;
  data?: T;
}

export interface CacheTelemetryMetrics {
  totalLookups: number;
  l1HitCount: number;
  l2RehydrationCount: number;
  repositoryMissCount: number;
  l1HitRatePercentage: number;
  l2RehydrationRatePercentage: number;
  repositoryMissRatePercentage: number;
  averageLookupTimeMs: number;
}

export type CacheEventType =
  | 'SnapshotLoaded'
  | 'SnapshotRehydrated'
  | 'SnapshotEvicted'
  | 'SnapshotPersisted'
  | 'SnapshotReleased';

export interface CacheEvent {
  type: CacheEventType;
  checksum: string;
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type CacheEventListener = (event: CacheEvent) => void;

export class ContentAddressableSnapshotStore {
  private static store = new Map<string, SnapshotStoreEntry>();
  private static listeners = new Set<CacheEventListener>();
  private static l1HitCount = 0;
  private static l2RehydrationCount = 0;
  private static repositoryMissCount = 0;
  private static totalLookupDurationMs = 0;

  /**
   * Subscribes to cache events for diagnostics, logging, and performance telemetry
   */
  static subscribe(listener: CacheEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emits a cache event to all subscribed listeners
   */
  private static emitEvent(type: CacheEventType, checksum: string, targetId?: string, metadata?: Record<string, any>): void {
    if (this.listeners.size === 0) return;
    const event: CacheEvent = {
      type,
      checksum,
      targetId,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('CacheEventListener error:', err);
      }
    });
  }

  /**
   * Saves a snapshot into content-addressable storage keyed by checksum.
   * Performs automatic deduplication, reference counting, and lastAccessedAt tracking.
   */
  static saveSnapshot(snapshot: RecommendationSnapshot): SnapshotStoreEntry {
    const checksum = snapshot.checksum;
    const now = new Date().toISOString();

    if (this.store.has(checksum)) {
      const existing = this.store.get(checksum)!;
      existing.accessCount++;
      existing.referenceCount++;
      existing.lastAccessedAt = now;
      this.emitEvent('SnapshotPersisted', checksum, snapshot.targetId, { deduplicated: true, referenceCount: existing.referenceCount });
      return existing;
    }

    const entry: SnapshotStoreEntry = {
      checksum,
      targetId: snapshot.targetId,
      snapshot,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
      referenceCount: 1,
    };

    this.store.set(checksum, entry);
    this.emitEvent('SnapshotPersisted', checksum, snapshot.targetId, { deduplicated: false, referenceCount: 1 });
    return entry;
  }

  /**
   * Releases a reference to a snapshot by checksum.
   * Garbage-collects the snapshot when referenceCount reaches 0.
   */
  static releaseSnapshot(checksum: string): boolean {
    const entry = this.store.get(checksum);
    if (!entry) return false;

    entry.referenceCount--;
    this.emitEvent('SnapshotReleased', checksum, entry.targetId, { remainingRefCount: entry.referenceCount });

    if (entry.referenceCount <= 0) {
      this.store.delete(checksum);
      this.emitEvent('SnapshotEvicted', checksum, entry.targetId, { reason: 'garbage-collected' });
      return true;
    }
    return false;
  }

  private static l2FallbackHandler?: (checksum: string) => RecommendationSnapshot | undefined;

  /**
   * Registers a durable L2 repository fallback handler (e.g. AuditRepository).
   * Automatically re-hydrates L1 cache on cache misses.
   */
  static registerL2Fallback(handler: (checksum: string) => RecommendationSnapshot | undefined): void {
    this.l2FallbackHandler = handler;
  }

  /**
   * Performs an explicit cache query returning structured telemetry status & source attribution:
   * - HIT_L1 (source: 'L1'): Served directly from L1 memory performance cache
   * - REHYDRATED_FROM_L2 (source: 'L2'): L1 cache miss, re-hydrated from L2 durable repository and served
   * - NOT_FOUND (source: 'NONE'): Repository miss (never silently auto-creates snapshots)
   */
  static querySnapshot(checksum: string): CacheQueryResult<RecommendationSnapshot> {
    const start = performance.now();
    const l1Entry = this.store.get(checksum);

    if (l1Entry) {
      l1Entry.accessCount++;
      l1Entry.lastAccessedAt = new Date().toISOString();
      const duration = Number((performance.now() - start).toFixed(3));

      this.l1HitCount++;
      this.totalLookupDurationMs += duration;
      this.emitEvent('SnapshotLoaded', checksum, l1Entry.targetId, { source: 'L1', durationMs: duration });

      return {
        status: 'HIT_L1',
        source: 'L1',
        lookupDurationMs: duration,
        checksum,
        data: l1Entry.snapshot,
      };
    }

    if (this.l2FallbackHandler) {
      const l2Snapshot = this.l2FallbackHandler(checksum);
      if (l2Snapshot) {
        const entry = this.saveSnapshot(l2Snapshot);
        const duration = Number((performance.now() - start).toFixed(3));

        this.l2RehydrationCount++;
        this.totalLookupDurationMs += duration;
        this.emitEvent('SnapshotRehydrated', checksum, l2Snapshot.targetId, { source: 'L2', durationMs: duration });

        return {
          status: 'REHYDRATED_FROM_L2',
          source: 'L2',
          lookupDurationMs: duration,
          checksum,
          data: entry.snapshot,
        };
      }
    }

    const duration = Number((performance.now() - start).toFixed(3));
    this.repositoryMissCount++;
    this.totalLookupDurationMs += duration;

    return {
      status: 'NOT_FOUND',
      source: 'NONE',
      lookupDurationMs: duration,
      checksum,
    };
  }

  /**
   * Retrieves a snapshot by checksum (L1 performance cache).
   * Re-hydrates from L2 durable repository on cache misses.
   */
  static getSnapshotByChecksum(checksum: string): RecommendationSnapshot | undefined {
    const result = this.querySnapshot(checksum);
    return result.data;
  }

  /**
   * Checks if a snapshot checksum exists in storage
   */
  static hasChecksum(checksum: string): boolean {
    return this.store.has(checksum);
  }

  /**
   * Performs LRU Cache Eviction to keep store size within maxEntries bounds.
   * Returns count of evicted entries.
   */
  static evictLru(maxEntries: number): number {
    if (this.store.size <= maxEntries) return 0;

    const entries = Array.from(this.store.values()).sort(
      (a, b) => new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime()
    );

    const toEvictCount = this.store.size - maxEntries;
    let evictedCount = 0;

    for (let i = 0; i < toEvictCount; i++) {
      const target = entries[i];
      if (target) {
        this.store.delete(target.checksum);
        this.emitEvent('SnapshotEvicted', target.checksum, target.targetId, { reason: 'lru-eviction' });
        evictedCount++;
      }
    }

    return evictedCount;
  }

  /**
   * Diffs two snapshots by checksums to generate semantic changesets
   */
  static diffSnapshots(checksumA: string, checksumB: string): SnapshotDiffResult | null {
    const snapA = this.getSnapshotByChecksum(checksumA);
    const snapB = this.getSnapshotByChecksum(checksumB);
    if (!snapA || !snapB) return null;

    const computeSetDiff = (a: string[], b: string[]) => ({
      added: b.filter((id) => !a.includes(id)),
      removed: a.filter((id) => !b.includes(id)),
    });

    const mwDiff = computeSetDiff(snapA.mustWatchIds, snapB.mustWatchIds);
    const recDiff = computeSetDiff(snapA.recommendedIds, snapB.recommendedIds);
    const isIdentical =
      checksumA === checksumB ||
      (mwDiff.added.length === 0 &&
        mwDiff.removed.length === 0 &&
        recDiff.added.length === 0 &&
        recDiff.removed.length === 0 &&
        snapA.isEntryPoint === snapB.isEntryPoint);

    return {
      targetId: snapA.targetId,
      checksumA,
      checksumB,
      mustWatchDiff: mwDiff,
      recommendedDiff: recDiff,
      readinessDeltaPercentage: snapB.storyReadinessPercentage - snapA.storyReadinessPercentage,
      watchTimeDeltaMinutes: snapB.estimatedWatchTimeMinutes - snapA.estimatedWatchTimeMinutes,
      isIdentical,
    };
  }

  /**
   * Returns live performance telemetry metrics (hit rates, rehydrations, miss rates, lookup time ms)
   */
  static getTelemetryMetrics(): CacheTelemetryMetrics {
    const totalLookups = this.l1HitCount + this.l2RehydrationCount + this.repositoryMissCount;
    const l1HitRatePercentage = totalLookups > 0 ? Number(((this.l1HitCount / totalLookups) * 100).toFixed(1)) : 0;
    const l2RehydrationRatePercentage = totalLookups > 0 ? Number(((this.l2RehydrationCount / totalLookups) * 100).toFixed(1)) : 0;
    const repositoryMissRatePercentage = totalLookups > 0 ? Number(((this.repositoryMissCount / totalLookups) * 100).toFixed(1)) : 0;
    const averageLookupTimeMs = totalLookups > 0 ? Number((this.totalLookupDurationMs / totalLookups).toFixed(3)) : 0;

    return {
      totalLookups,
      l1HitCount: this.l1HitCount,
      l2RehydrationCount: this.l2RehydrationCount,
      repositoryMissCount: this.repositoryMissCount,
      l1HitRatePercentage,
      l2RehydrationRatePercentage,
      repositoryMissRatePercentage,
      averageLookupTimeMs,
    };
  }

  /**
   * Returns store operational insights statistics
   */
  static getStats(): {
    totalUniqueSnapshots: number;
    totalAccessCount: number;
    oldestEntryTimestamp?: string;
    newestEntryTimestamp?: string;
    telemetry: CacheTelemetryMetrics;
  } {
    let totalAccessCount = 0;
    let oldest: string | undefined;
    let newest: string | undefined;

    this.store.forEach((entry) => {
      totalAccessCount += entry.accessCount;
      if (!oldest || entry.createdAt < oldest) oldest = entry.createdAt;
      if (!newest || entry.createdAt > newest) newest = entry.createdAt;
    });

    return {
      totalUniqueSnapshots: this.store.size,
      totalAccessCount,
      oldestEntryTimestamp: oldest,
      newestEntryTimestamp: newest,
      telemetry: this.getTelemetryMetrics(),
    };
  }

  /**
   * Clears stored snapshots and resets telemetry counters
   */
  static clear(): void {
    this.store.clear();
    this.l1HitCount = 0;
    this.l2RehydrationCount = 0;
    this.repositoryMissCount = 0;
    this.totalLookupDurationMs = 0;
  }
}
