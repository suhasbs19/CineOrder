import type { ImportanceLevel } from './preparation';

export type OfficialSourceType =
  | 'OFFICIAL_STUDIO'
  | 'RIGHTS_HOLDER'
  | 'OFFICIAL_PRESS_RELEASE'
  | 'PRIMARY_DISTRIBUTOR'
  | 'AUTHORITATIVE_TRADE';

export interface OfficialSourceMetadata {
  sourceUrl: string;
  sourcePublisher: string;
  sourceType: OfficialSourceType;
  publicationDate: string; // ISO or YYYY-MM-DD
  retrievedAt: string; // ISO date string
  sourceTitle: string;
  targetContentId: string;
  targetTitle: string;
  sourceContentHash: string; // Deterministic SHA-256
  version: string; // e.g. "1.0", "1.1"
  officialStatement?: string;
  verificationScore?: number; // 0.0 - 1.0
  isVerified?: boolean;
}

export interface OfficialPreparationCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface OfficialPreparationItem {
  contentId: string;
  officialOrder: number; // 1-indexed explicit order
  officialCategoryId?: string;
  officialCategoryName?: string;
  officialRationale?: string;
  importance?: ImportanceLevel;
}

export interface OfficialAuditHistoryEntry {
  version: string;
  updatedAt: string;
  changeSummary: string;
  addedContentIds: string[];
  removedContentIds: string[];
  previousItems: OfficialPreparationItem[];
  previousSourceHash: string;
  sourceUrl: string;
  sourcePublisher: string;
}

export interface OfficialPreparationList {
  targetContentId: string;
  targetTitle: string;
  franchiseId: string;
  version: string;
  sourceMetadata: OfficialSourceMetadata;
  categories?: OfficialPreparationCategory[];
  items: OfficialPreparationItem[];
  supplementaryCineOrderItemsAllowed?: boolean;
  history?: OfficialAuditHistoryEntry[];
}
