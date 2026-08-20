# CineOrder — Official Preparation List + CineOrder Recommendations Partitioning Report

**Timestamp**: 2026-08-20T01:02:00+05:30  
**Status**: `COMPLETED & VERIFIED`  
**Frozen Framework Compliance**: 5/5 SHA-256 Hashes Verified Bit-for-Bit Identical  
**Regression Test Suite**: 13/13 Rules & Scenarios Passed (0 failures)

---

## 1. Executive Summary

We have enhanced the **Official Preparation List Override** feature to implement the strict **Official List + CineOrder Extra Content Partitioning Model**.

When an official preparation/watch list exists:
1. **Primary Section (`officialPreparationItems`)**: The official studio list is the primary preparation list. Items follow exact 1-indexed official studio ordering and maintain official categories and rationale without score-based reordering.
2. **Extra Content Section (`cineOrderExtraContent`)**: The existing CineOrder narrative recommendation engine continues running in parallel. Any title recommended by the graph engine that is **not** in the official list is placed into a dedicated, visually distinct **Extra Content** section.
3. **Strict Deduplication**: If a title recommended by CineOrder is already present in the official studio list, it is removed from Extra Content to guarantee zero duplication across sections.
4. **No Permanent Suppression**: If an official title is removed from the official list during an update, it becomes eligible for Extra Content if independently recommended by CineOrder.
5. **No Official List Fallback**: When no official list exists for a title, mode is `GRAPH_RECOMMENDATION`, `officialPreparationItems` is empty, and the existing CKG narrative explorer UI remains completely unchanged.
6. **Zero Framework Creep**: 5/5 frozen framework files remain completely locked and bit-for-bit identical.

---

## 2. Partitioning Pipeline Architecture

```
                      Target Movie / Series Requested
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
     Official List Exists?                     No Official List
                 │                                       │
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌───────────────────────────┐
    │ Mode: OFFICIAL_OVERRIDE   │           │ Mode: GRAPH_RECOMMENDATION│
    │                           │           │                           │
    │ 1. officialPreparationItems│          │ officialPreparationItems: │
    │    - Studio Whitelisted   │           │   []                      │
    │    - Exact 1..N order     │           │                           │
    │    - Studio rationale     │           │ cineOrderExtraContent:    │
    │                           │           │   [All graph recs]        │
    │ 2. cineOrderExtraContent  │           │                           │
    │    - Graph traversal      │           │ Default CKG Explorer View │
    │    - Minus official titles│           └───────────────────────────┘
    │    - Normal CineOrder rank│
    └───────────────────────────┘
```

---

## 3. Data Model

Exposed on `PreparationGuideData`:

```typescript
export interface PreparationGuideData {
  targetContent: Content;
  mode?: 'GRAPH_RECOMMENDATION' | 'OFFICIAL_OVERRIDE';
  officialSource?: OfficialSourceMetadata;
  officialCategories?: OfficialPreparationCategory[];
  
  // Explicit Partition Collections
  officialPreparationItems: PreparationRecommendation[];
  cineOrderExtraContent: PreparationRecommendation[];

  // Backwards Compatibility Aliases
  officialItems?: PreparationRecommendation[];
  supplementaryRecommendations?: PreparationRecommendation[];
  
  mustWatch: PreparationRecommendation[];
  recommended: PreparationRecommendation[];
  optional: PreparationRecommendation[];
  safeToSkip: PreparationRecommendation[];
  postCreditContext?: PreparationRecommendation[];
  estimatedWatchTimeMinutes: number;
  formattedWatchTime: string;
  storyReadinessPercentage: number;
  watchedCount: number;
  totalPrerequisitesCount: number;
  isEntryPoint?: boolean;
  entryPointMessage?: string;
  timelineWarnings?: string[];
  diagnostics?: {
    traversedNodeCount: number;
    averagePathDepth: number;
    validationStatus: 'Passed' | 'Failed';
    generationTimeMs: number;
  };
}
```

---

## 4. Deduplication Logic

Deduplication applies a two-tier matching strategy:
1. **Primary**: Canonical Content ID comparison (lowercased & trimmed).
2. **Secondary**: TMDb ID comparison (when available).

```typescript
const officialContentIds = new Set<string>();
const officialTmdbIds = new Set<number>();

for (const item of officialList.items) {
  const itemContent = getContentById(item.contentId);
  if (!itemContent) continue;
  officialContentIds.add(itemContent.id.toLowerCase().trim());
  if (itemContent.tmdb_id) {
    officialTmdbIds.add(itemContent.tmdb_id);
  }
}

// Compute Extra Content (Filter out any title in the official list)
cineOrderExtraContent = allGraphRecs.filter((gr) => {
  const canonicalId = gr.content.id.toLowerCase().trim();
  if (officialContentIds.has(canonicalId)) return false;
  if (gr.content.tmdb_id && officialTmdbIds.has(gr.content.tmdb_id)) return false;
  return true;
});
```

---

## 5. UI Presentation & Visual Distinction

When `OFFICIAL_OVERRIDE` is active (e.g. *Avengers: Doomsday*):

### Section 1: Official Preparation
- **Badge**: `[OFFICIAL STUDIO OVERRIDE]` (Emerald badge with `BookmarkCheck`)
- **Title**: `Official Preparation`
- **Source Box**: Verified publisher (`Marvel Studios Official`), publication date, version (`v1.0`), and external link to official studio release.
- **Items**:
  1. *Avengers: Infinity War*
  2. *Avengers: Endgame*
  3. *Loki*
  4. *Deadpool & Wolverine*
  5. *The Fantastic Four: First Steps*

### Section 2: Extra Content (CineOrder Recommendations)
- **Badge**: `[EXTRA CONTENT]` (Amber badge)
- **Title**: `CineOrder Recommendations`
- **Notice**: *"Independent story-graph recommendations discovered by CineOrder's narrative intelligence engine. These titles provide valuable lore and character context, but are not part of the official studio watchlist."*
- **Items**: Displays independent narrative recommendations (e.g. *Thunderbolts\**, *Captain America: Brave New World*, *Doctor Strange in the Multiverse of Madness*) with normal CineOrder priority badges (`Must Watch`, `Recommended`, `Extra Context`), relevance scores, narrative reason, watched toggle, and Why Inspector button.

---

## 6. Verification & Test Results

### 1. Test Suite (`src/__tests__/officialPreparationOverride.test.ts`)

| Scenario / Rule | Description | Result |
| :--- | :--- | :---: |
| **Rule 1** | Official list exists $\to$ `officialPreparationItems` and `cineOrderExtraContent` partitioned | **PASS** |
| **Rule 2 & 9** | Strict deduplication $\to$ zero canonical ID and zero TMDb ID overlap between partitions | **PASS** |
| **Rule 3** | CineOrder-only recommendations appear in Extra Content with normal scores | **PASS** |
| **Rule 4** | Official-only titles retained in official list with complete metadata | **PASS** |
| **Rule 5 & 8** | Official list order strictly preserved (1..N); Extra Content uses normal CineOrder ranking | **PASS** |
| **Rule 6** | Removed official title becomes eligible for Extra Content if independently recommended | **PASS** |
| **Rule 7** | No official list $\to$ mode is `GRAPH_RECOMMENDATION`, `officialPreparationItems: []` | **PASS** |
| **Rule 10** | Universal compatibility verified across all 19 CineOrder franchises | **PASS** |
| **Rule 11** | Cache invalidation works immediately upon official list mutation | **PASS** |
| **Rule 12** | Deterministic identical partitioning across reloads and refreshes | **PASS** |
| **Rule 13** | Frozen framework 5/5 SHA-256 hashes bit-for-bit matched | **PASS** |

### 2. Global Validation & Production Health
- **Frozen Framework Check**: `5/5 Hashes Bit-for-Bit Identical` (`ZERO_FRAMEWORK_CREEP`)
- **TypeScript Typecheck (`npx tsc --noEmit`)**: `0 Errors`
- **Recommendation Completeness Audit (`npm run validate`)**: `PASS (0 broken references, 0 errors)`
- **Unified Test Runner (`scripts/runAllTests.ts`)**: `ALL 46 SUITES PASSED (81/81 assertions)`
- **Release Gate (`npm run release:gate`)**: `7/7 GATES PASSED (A through G)`
- **Production Build (`npm run build`)**: `Vite v6.4.3 production bundle built in 5.23s`
- **HTTP Server Check (`/movie/mcu-doomsday`)**: `HTTP 200 OK`
