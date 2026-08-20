# Changelog

All notable changes to the CineOrder Recommendation Engine and Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1] Universal Release-State & Timezone Detection - 2026-08-19

### Fixed
- **Lanterns Post-Premiere Lifecycle Detection**: Resolved bug where *Lanterns* remained classified as `UPCOMING` following its August 16, 2026 premiere on HBO/Max.
- **Universal Date Precedence in Lifecycle Classifier**: Refactored `classifyLifecycle` in `src/lib/metadataRefresh.ts` so elapsed release dates promote titles deterministically to `theatrically_released` or `subscription_available` without being blocked by seed status.
- **Countdown & Hook Override Removal**: Corrected `calculateCountdown` (`src/lib/upcomingUtils.ts`) and `useUpcomingReleases` (`src/hooks/useUpcomingReleases.ts`) so elapsed dates output `status: 'Released'` and `"Now Available"`.
- **Dynamic Helper Promotion**: Updated `buildContent` in `src/data/franchises/utils.ts` to automatically derive released lifecycle and OTT availability when confirmed release dates pass.

### Added
- **Market & Timezone-Aware Instant Engine** (`src/lib/dateUtils.ts`): Added `ReleaseInstantOptions`, `getMarketReleaseDate`, and `isReleaseInstantPassed` supporting broadcast premiere times (e.g. US Eastern 21:00 ET converting to India next-day IST morning).
- **10-Scenario Lifecycle Regression Suite** (`src/__tests__/lanternsLifecycle.test.ts`): Permanent automated verification covering pre-premiere, post-premiere, timezone conversion, weekly series rollout integrity, movie lifecycle preservation, future/TBA series handling, and zero OTT fabrication.

### Verified
- **Zero Framework Creep**: 5/5 frozen framework SHA-256 hashes bit-for-bit identical.
- **Release Gate Passed**: 7/7 release gates and 40/40 test suites pass with 0 errors.

---

## [v1.2] MCU v1.0 Release - 2026-08-06

### Added
- **Complete MCU Knowledge Graph**: Finalized release gate verification for MCU v1.0.
- **198 Editorial Evidence Entries**: Authored structured `recommendationEvidence` (`shortReason`, `detailedReasons`, `source: 'editorial'`) across all Knowledge Graph edges.
- **100% Recommendation Evidence Coverage**: Expanded evidence coverage from 6.1% to 100.0% (`198/198` edges), far exceeding the $\ge 95.0\%$ MCU Release Gate threshold.
- **Provenance Tracking**: Added `evidenceSource` (`'editorial'` vs `'graph'`) provenance to `RecommendationDTO` and `PreparationRecommendation`.
- **UI Evidence Inspector**: Enhanced `PreparationGuide.tsx` Inspector Modal to display structured **Editorial Evidence Points**.

### Improved
- **Recommendation Explainability**: Every recommendation naturally articulates narrative dependencies (character arcs, plot setup, lore, consequences) without relying on release chronology or trivia.
- **Editorial Alignment**: Graph-driven explainability fully aligns with editorial policy principles.

### Verified
- **95.6% Overall Recommendation Accuracy**: Verified against the global editorial baseline.
- **0.07 Average Category Drift**: Well within the $\le 0.15$ maximum drift tolerance.
- **100% Evidence Coverage**: Achieved full coverage across all story edges.
- **Zero Regression Failures**: 100% pass rate with zero breaking changes.

### Status
Official MCU Knowledge Graph v1.0 (Content Production Milestone Complete)

---

## [v1.1] - 2026-08-06 (MCU Audit Phase)

### Removed
- **Deleted Editorial Override**: `The Avengers ← The Incredible Hulk`
  - *Reason*: The recommendation engine natively classifies this relationship as Extra Context (`optional`) without editorial intervention. Phase 2.5 validation increased overall accuracy from 92.4% to 92.8% while reducing active override count from 19 to 18.
- **Deleted Editorial Override**: `Captain America: The Winter Soldier ← Iron Man 2`
  - *Reason*: The recommendation engine natively classifies Iron Man 2 as Extra Context (`optional`) without editorial intervention. Removing the override increased overall accuracy from 92.8% to 93.2%, reduced average drift from 0.10 to 0.09, and lowered active override count from 18 to 17.
- **Deleted Editorial Override**: `Thor: The Dark World ← The Avengers`
  - *Reason*: The recommendation engine natively classifies The Avengers as Extra Context (`optional`) without editorial intervention. Removing the override increased overall accuracy from 93.2% to 93.6%, maintained average drift at 0.09, and lowered active override count from 17 to 16.
- **Deleted Editorial Override**: `Captain America: Civil War ← The Avengers`
  - *Reason*: The recommendation engine natively classifies The Avengers as Recommended (`recommended`, score 82) without editorial intervention. Removing the override increased overall engine accuracy to 94.0%, reduced average drift to 0.08, and lowered active override count from 16 to 15.
- **Deleted Editorial Override**: `Avengers: Age of Ultron ← Thor: The Dark World`
  - *Reason*: The recommendation engine natively classifies Thor: The Dark World as Extra Context (`optional`, score 69) without editorial intervention. Removing the override increased overall engine accuracy to 94.4%, maintained average drift at 0.08, and lowered active override count from 15 to 14.
- **Deleted Editorial Override**: `Captain America: Civil War ← Ant-Man`
  - *Reason*: The recommendation engine natively classifies Ant-Man as Extra Context (`optional`, score 74.8) without editorial intervention. Removing the override increased overall engine accuracy to 94.8%, maintained average drift at 0.08, improved Civil War single-title accuracy to 100% (9/9), and lowered active override count from 14 to 13.
- **Deleted Editorial Override**: `Spider-Man: Homecoming ← The Avengers`
  - *Reason*: The recommendation engine natively classifies The Avengers as Extra Context (`optional`, score 74.5) without editorial intervention. Removing the override increased overall engine accuracy to 95.2%, reduced average drift to 0.07, upgraded engine health to Healthy status, improved Homecoming single-title accuracy to 100% (6/6), and lowered active override count from 13 to 12.
- **Knowledge Graph Alignment**: `Avengers: Age of Ultron ← Iron Man`
  - *Action*: Added explicit `character-origin` edge with `moderate` strength in `cineOrderKnowledgeGraph.ts`.
  - *Outcome*: Engine natively calculates `Extra Context` (`optional`, score 72.8, drift 0). Deleted temporary override scaffolding. Overall engine accuracy increased from 95.2% to **95.6%**, reducing active overrides from 12 to 11.

---

## [v1.0-framework-freeze] - 2026-08-06

### Added
- **Editorial Comparison Engine** (`editorialComparisonEngine.ts`): Dual traversal comparison comparing raw engine BFS output against editorial intent across all Knowledge Graph title nodes.
- **Override Health & Subsumption Metrics** (`override-health.json` & `override-health.md`): Tracks rule effectiveness (% active vs. redundant) and subsumption stability.
- **Executive Health Dashboard**: ASCII terminal dashboard box with data-driven status evaluation (`Excellent`, `Healthy`, `Stable`, `Needs Calibration`, `Unstable`).
- **Calibration Simulator**: In-memory scoring weight simulation (`--simulate "character-origin=-5"`) without source code mutations.
- **Centralized System Metadata**: Tracked version numbers (`KNOWLEDGE_GRAPH_VERSION 3.4`, `TRAVERSAL_VERSION 2.1`, `POLICY_VERSION 6.2`, `COMPARISON_ENGINE_VERSION 1.0`), Git commit hash, and execution duration.
- **Project Documentation Suite**: `ARCHITECTURE.md`, `EDITORIAL_POLICY.md`, `GRAPH_STYLE_GUIDE.md`, and `CHANGELOG.md`.

### Changed
- **Engine Accuracy Metric**: Shifted to true BFS-reachable accuracy baseline (94.8%), removing tautological split logic.
- **Regression Persistence**: Unified snapshot tracking in `reports/snapshot.json` and browser `localStorage`.

### Removed
- **Derived Status from Source Code**: Removed `status` and `redundant` fields from `editorialOverrides.ts` to preserve source-of-truth purity.
