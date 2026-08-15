# CineOrder Candidate Verification Report

> **GOVERNANCE & TOOLING AUDIT ONLY**
> - **Execution Mode:** Deep 20-Dimension Inspection (Zero Code Changes / Zero Deletions)
> - **Subject:** 12 Candidate Standalone Scripts in `scripts/`
> - **Website & Platform Status:** 100% Untouched, Identical & Fully Functional

---

## Executive Summary

- **Total Candidates Evaluated:** 12
- **🟢 KEEP — PERMANENT:** 3
- **🟡 KEEP — MANUAL TOOL:** 4
- **🟠 CONSOLIDATION CANDIDATES:** 2
- **🔴 SAFE DELETE CANDIDATES:** 3
- **⚪ UNCERTAIN:** 0

```text
============================================================
              CANDIDATE CLASSIFICATION MATRIX
============================================================
Permanent Tools (Ongoing Protection):      3 (25%)
Manual Diagnostic & Workflow Tools:        4 (33.3%)
Consolidation Candidates:                  2 (16.7%)
Safe Deletion Candidates (Historical):     3 (25%)
Uncertain:                                 0 (0%)
============================================================
```

---

## Candidate-by-Candidate Analysis

---

### 1. `scripts/inspectPiratesVisual.ts`

- **Purpose:** Standalone visual forensic validator asserting that Pirates of the Caribbean renders TMDB Collection 295 poster (`zRBaZxS5YauLvRYjAdL4AUCwlht.jpg`) and contains zero Ahsoka or Star Wars poster leaks.
- **Imports:** `allFranchises` (`src/data/franchises/index`), `franchiseArtworkMap` (`src/data/franchiseArtwork`), `resolveFranchiseArtwork` (`src/lib/imageResolver`).
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None (subsumed by Gate G).
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Specific hash assertion for Pirates Collection 295.
- **Repeatable:** Yes (deterministic, pure TypeScript).
- **Regression value:** Moderate for Pirates specifically, but completely subsumed by global visual verifier.
- **Modification behavior:** Read-only (zero disk writes).
- **Equivalent script:** `scripts/verifyFranchiseVisualIdentity.ts` (validates all 16 franchises including Pirates collection 295).
- **Classification:** 🟠 CONSOLIDATION
- **Reason:** Functionality is fully subsumed by `scripts/verifyFranchiseVisualIdentity.ts` which runs as Gate G in `scripts/releaseGate.ts`.

---

### 2. `scripts/inspectHobbitAndXmenVisual.ts`

- **Purpose:** Standalone visual forensic script asserting that The Hobbit (Collection 121938, `hQghXOjSS2xfzx9XnMyZqt8brCF.jpg`) and X-Men (Collection 748, `31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg`) render canonical collection artwork without placeholders.
- **Imports:** `allFranchises`, `franchiseArtworkMap`, `resolveFranchiseArtwork`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Specific hash check for Hobbit and X-Men collections.
- **Repeatable:** Yes (deterministic, pure TypeScript).
- **Regression value:** Low to moderate (tested in global visual verifier).
- **Modification behavior:** Read-only (zero disk writes).
- **Equivalent script:** `scripts/verifyFranchiseVisualIdentity.ts`.
- **Classification:** 🟠 CONSOLIDATION
- **Reason:** Functionality is completely covered by `scripts/verifyFranchiseVisualIdentity.ts` and `src/__tests__/browserImageAssertion.test.ts`.

---

### 3. `scripts/queryTmdbTransformers.js`

- **Purpose:** One-time REST exploration probe used during manual investigation to query TMDB Movie 1858 and search collection endpoints for Transformers.
- **Imports:** None (Vanilla Node.js with hardcoded API key).
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** One-time live API query probe.
- **Repeatable:** Yes, but requires live internet connection and TMDB API reachability.
- **Regression value:** None (investigation artifact).
- **Modification behavior:** Read-only (logs to console).
- **Equivalent script:** `src/lib/tmdb.ts`.
- **Classification:** 🔴 SAFE DELETE
- **Reason:** Single-use exploratory probe created during past TMDB collection debugging; no longer needed.

---

### 4. `scripts/testUpcomingText.ts`

- **Purpose:** Playwright script that launches headless Chrome, navigates to `http://localhost:5173/upcoming`, and prints the first 1500 characters of page innerText to the terminal.
- **Imports:** `playwright`, `fs`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Terminal body dump of upcoming page.
- **Repeatable:** Yes, provided `npm run dev` is running.
- **Regression value:** Very Low (does not assert pass/fail; only prints raw text).
- **Modification behavior:** Read-only.
- **Equivalent script:** `src/__tests__/upcomingReleases.test.ts` (17 automated unit tests) and `scripts/verifyBrowserUI.ts` (full browser assertions).
- **Classification:** 🔴 SAFE DELETE
- **Reason:** Historical diagnostic dump script superseded by automated unit and E2E regression tests.

---

### 5. `scripts/checkUnreleasedPosters.ts`

- **Purpose:** Live TMDB API probe querying poster paths for two unreleased movie IDs (Blade 617127 and Conjuring 1038392).
- **Imports:** `src/lib/tmdb`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Two-movie probe.
- **Repeatable:** Yes, but makes external network calls.
- **Regression value:** None (diagnostic probe).
- **Modification behavior:** Read-only.
- **Equivalent script:** `src/lib/tmdb.ts`.
- **Classification:** 🔴 SAFE DELETE
- **Reason:** Single-use diagnostic probe created during past metadata verification.

---

### 6. `scripts/checkFranchiseLeak.ts`

- **Purpose:** Audits whether any movie in `allContent` accidentally reuses a franchise collection poster URL from `allFranchises`.
- **Imports:** `src/data/franchises/index`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Compares movie poster URLs against franchise collection poster URLs.
- **Repeatable:** 100% deterministic pure TS.
- **Regression value:** Useful fast developer utility.
- **Modification behavior:** Read-only.
- **Equivalent script:** `src/__tests__/imageIntegrity.test.ts` (Test 9).
- **Classification:** 🟡 KEEP — MANUAL TOOL
- **Reason:** Fast, lightweight (11 lines) developer diagnostic utility for quick manual sanity checks.

---

### 7. `scripts/autoFixAllPostersFromTmdb.ts`

- **Purpose:** Production catalog batch updater that fetches verified poster paths for all 213 catalog titles from TMDB API and updates source code files (`src/data/franchises/*.ts`) using `fs.writeFileSync`.
- **Imports:** `src/data/franchises/index`, `src/lib/tmdb`, `fs`, `path`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Automated batch source file updater for TMDB poster synchronization.
- **Repeatable:** Yes, but modifies source code on disk.
- **Regression value:** High administrative maintenance utility.
- **Modification behavior:** **MODIFIES SOURCE FILES** (`src/data/franchises/*.ts`).
- **Equivalent script:** None (unique catalog migration utility).
- **Classification:** 🟡 KEEP — MANUAL TOOL
- **Reason:** Critical administrative developer tool for automated catalog updates when adding new franchises.

---

### 8. `scripts/verifyRenderedCardsDom.ts`

- **Purpose:** Exhaustively validates card image resolution across all key routes (`/explore`, `/upcoming`, `/search?type=franchises`, and all 16 `/franchise/:id` routes), ensuring that every catalog item and franchise resolves to a valid, non-placeholder image.
- **Imports:** `src/data/franchises/index`, `src/lib/imageResolver`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** Standalone regression tool.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Evaluates complete route card rendering matrix across all 213 titles and 16 franchises.
- **Repeatable:** 100% deterministic pure TS (no network required).
- **Regression value:** Very High (catches subtle card-level image resolution bugs before release).
- **Modification behavior:** Read-only.
- **Equivalent script:** None (unique route card matrix verifier).
- **Classification:** 🟢 KEEP — PERMANENT
- **Reason:** Provides essential ongoing regression protection across all application routes.

---

### 9. `scripts/verifyBrowserUI.ts`

- **Purpose:** Automated Playwright browser smoke test that spins up headless Chrome, verifies server health, navigates across major routes (`/movie/mcu-fantastic-four`, `/movie/mcu-blade`, `/`, `/upcoming`), and asserts rendered DOM text, readiness modes, and UI integrity.
- **Imports:** `playwright`, `fs`, `http`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** Standalone E2E runner.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Real browser headless smoke test.
- **Repeatable:** Yes (requires local dev server on localhost:5173).
- **Regression value:** High (validates rendered React DOM output in real Chromium).
- **Modification behavior:** Read-only.
- **Equivalent script:** None (unique Playwright browser smoke test).
- **Classification:** 🟡 KEEP — MANUAL TOOL
- **Reason:** Powerful developer diagnostic tool for verifying real browser rendering behavior.

---

### 10. `scripts/auditAllFranchises.ts`

- **Purpose:** Formatted terminal diagnostic tool that dumps all 16 franchises, their TMDB collection IDs, poster/banner/logo paths, and executes `validateFranchiseVisualIdentities()`.
- **Imports:** `src/data/franchises/index`, `src/data/franchiseArtwork`, `src/lib/imageResolver`, `./verifyFranchiseVisualIdentity`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None (wraps Gate G helper).
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Human-readable terminal matrix for all 16 franchise visual identities.
- **Repeatable:** 100% deterministic pure TS.
- **Regression value:** High for manual franchise verification.
- **Modification behavior:** Read-only.
- **Equivalent script:** `scripts/verifyFranchiseVisualIdentity.ts`.
- **Classification:** 🟡 KEEP — MANUAL TOOL
- **Reason:** Useful developer CLI utility for inspecting complete franchise visual identity tables.

---

### 11. `scripts/proposeCkgEnrichment.ts`

- **Purpose:** Generates structured candidate CKG proposals (`CKGProposalPackage`) containing citations, confidence scores, and source evidence, saving them to `src/data/ckg-proposals/*.json` for human review.
- **Imports:** `fs`, `path`, `src/types/ckgProposal`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** Core proposal generator for CineOrder Knowledge Engineering workflow.
- **Repeatable:** Yes (generates new proposal package with timestamp ID).
- **Regression value:** High for ongoing CKG development (`v1.1`, `v2.0` roadmap).
- **Modification behavior:** Writes proposal JSON files to `src/data/ckg-proposals/`.
- **Equivalent script:** None (unique CKG proposal generator).
- **Classification:** 🟢 KEEP — PERMANENT
- **Reason:** Essential Knowledge Engineering tooling mandated by AGENTS.md content production mode.

---

### 12. `scripts/mergeCkgProposals.ts`

- **Purpose:** Scans `src/data/ckg-proposals/*.json`, validates pending vs approved story edges, verifies citation integrity and confidence scores, and enforces governance rules (zero unreviewed AI edges merged into production).
- **Imports:** `fs`, `path`, `src/types/ckgProposal`.
- **Incoming references:** 0.
- **Package references:** None.
- **Release-gate references:** None.
- **CI references:** None.
- **Documentation references:** None.
- **Unique functionality:** CKG proposal review and validation tool.
- **Repeatable:** 100% deterministic pure TS.
- **Regression value:** High for Knowledge Engineering workflow.
- **Modification behavior:** Read-only scanner / reporter.
- **Equivalent script:** None (unique CKG proposal review tool).
- **Classification:** 🟢 KEEP — PERMANENT
- **Reason:** Essential Knowledge Engineering governance tool for proposal validation.

---

## 🟢 KEEP — PERMANENT

1. `scripts/verifyRenderedCardsDom.ts` — Deterministic route-by-route card image assertion engine.
2. `scripts/proposeCkgEnrichment.ts` — Core CKG candidate proposal generator for Knowledge Engineering.
3. `scripts/mergeCkgProposals.ts` — CKG proposal queue validator enforcing zero unreviewed AI edges.

---

## 🟡 KEEP — MANUAL TOOL

1. `scripts/verifyBrowserUI.ts` — Playwright real browser E2E smoke tester.
2. `scripts/auditAllFranchises.ts` — Formatted terminal visual identity table dump.
3. `scripts/autoFixAllPostersFromTmdb.ts` — Batch TMDB poster updater for catalog maintenance.
4. `scripts/checkFranchiseLeak.ts` — Fast 11-line developer sanity check for poster collisions.

---

## 🟠 CONSOLIDATION

1. `scripts/inspectPiratesVisual.ts` — Subsumed by `scripts/verifyFranchiseVisualIdentity.ts`.
2. `scripts/inspectHobbitAndXmenVisual.ts` — Subsumed by `scripts/verifyFranchiseVisualIdentity.ts`.

---

## 🔴 SAFE DELETE

1. `scripts/queryTmdbTransformers.js` — Single-use live TMDB REST query probe.
2. `scripts/testUpcomingText.ts` — Single-use raw text dumper superseded by unit tests.
3. `scripts/checkUnreleasedPosters.ts` — Single-use 2-movie API probe.

---

## ⚪ UNCERTAIN

*None. All 12 candidates have established purposes and unambiguous classifications.*

---

## Final Recommendation

1. **Retain Permanent & Manual Tools:** Keep all 7 scripts classified as 🟢 PERMANENT or 🟡 MANUAL TOOL (`verifyRenderedCardsDom.ts`, `proposeCkgEnrichment.ts`, `mergeCkgProposals.ts`, `verifyBrowserUI.ts`, `auditAllFranchises.ts`, `autoFixAllPostersFromTmdb.ts`, `checkFranchiseLeak.ts`). They provide genuine long-term value for automated testing, release verification, and knowledge governance.
2. **Optional Phase 2 Cleanup:** If desired in the future, only the **3 strictly obsolete scripts** (`queryTmdbTransformers.js`, `testUpcomingText.ts`, `checkUnreleasedPosters.ts`) and the **2 fully subsumed scripts** (`inspectPiratesVisual.ts`, `inspectHobbitAndXmenVisual.ts`) should be considered for deletion.
3. **Zero Risk Policy:** Retaining these scripts causes zero runtime overhead and zero build impact.
