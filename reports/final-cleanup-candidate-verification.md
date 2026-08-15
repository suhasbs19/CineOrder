# CineOrder — Final Cleanup Candidate Dependency Verification Report

**Date & Time**: August 14, 2026  
**Auditor**: Antigravity Autonomous Knowledge & Governance Agent  
**Status**: Complete Candidate Verification  
**Scope**: In-depth dependency, runtime reachability, and risk investigation of 7 cleanup candidates  
**Audit Policy**: **ZERO PROJECT MODIFICATIONS**

---

## 1. Candidate Verification Summary

| Candidate | Category | Production Reachability | Deletion Risk | Recommendation | Confidence |
|---|---|---|---|---|---|
| `scripts/checkAllPosters.ts` | Development Diagnostic | 0% (CLI only) | None | **CONSOLIDATE FIRST** | **HIGH** |
| `scripts/checkFranchiseLeak.ts` | Historical Scratch Tool | 0% (CLI only) | None | **SAFE TO DELETE** | **HIGH** |
| `scripts/inspectPiratesVisual.ts` | One-off Visual Inspector | 0% (CLI only) | None | **SAFE TO DELETE** | **HIGH** |
| `scripts/inspectHobbitAndXmenVisual.ts` | One-off Visual Inspector | 0% (CLI only) | None | **SAFE TO DELETE** | **HIGH** |
| `src/data/storyGraph.ts` | Legacy Seed Dataset | 0% (Subsumed by CKG) | None | **SAFE TO DELETE** | **HIGH** |
| `src/data/storyKnowledgeGraph.ts` | Legacy Seed Dataset | 0% (Subsumed by CKG) | None | **SAFE TO DELETE** | **HIGH** |
| `src/components/ui/SmartRecommendation.tsx` | Unused UI Prototype | 0% (Unrendered) | None | **SAFE TO DELETE** | **HIGH** |

---

## 2. Detailed Investigation per Candidate

### Candidate 1: `scripts/checkAllPosters.ts`

```yaml
FILE: scripts/checkAllPosters.ts
CATEGORY: Development Diagnostic Script
STATIC IMPORTS: 0 (Imports only ../src/data/franchises/index)
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0 (Not in package.json)
RELEASE GATE REFERENCES: 0 (Not invoked by releaseGate.ts)
PRODUCTION REACHABILITY: 0% (Standalone Node CLI script)
DUPLICATED BY: scripts/verifyTmdbPosterIdentity.ts, scripts/auditImageIntegrity.ts
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: CONSOLIDATE FIRST
```

**Forensic Analysis**:
- `checkAllPosters.ts` is a simple 48-line script checking for duplicate poster URLs and duplicate TMDb IDs within `allContent`.
- It is fully subsumed by `scripts/verifyTmdbPosterIdentity.ts` (which checks both uniqueness and makes authentic live TMDb API verification calls for all 213 titles) and `scripts/auditImageIntegrity.ts`.
- It is not invoked in any CI or release gate pipeline.

---

### Candidate 2: `scripts/checkFranchiseLeak.ts`

```yaml
FILE: scripts/checkFranchiseLeak.ts
CATEGORY: Historical Scratch Tool
STATIC IMPORTS: 0 (Imports only ../src/data/franchises/index)
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0 (Not in package.json)
RELEASE GATE REFERENCES: 0 (Not invoked by releaseGate.ts)
PRODUCTION REACHABILITY: 0% (Standalone Node CLI script)
DUPLICATED BY: scripts/verifyFranchiseVisualIdentity.ts, src/__tests__/strictFranchiseIsolation.test.ts
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: SAFE TO DELETE
```

**Forensic Analysis**:
- `checkFranchiseLeak.ts` is an 11-line ad-hoc diagnostic written during previous image cross-contamination audits.
- Its checks are permanently formalized in `src/__tests__/strictFranchiseIsolation.test.ts` and `scripts/verifyFranchiseVisualIdentity.ts`.
- Safe to delete in any future repository cleanup milestone.

---

### Candidate 3: `scripts/inspectPiratesVisual.ts`

```yaml
FILE: scripts/inspectPiratesVisual.ts
CATEGORY: Historical Visual Diagnostic
STATIC IMPORTS: 0 (Imports only ../src/data/franchises/index, ../src/data/franchiseArtwork, ../src/lib/imageResolver)
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0 (Not in package.json)
RELEASE GATE REFERENCES: 0 (Not invoked by releaseGate.ts)
PRODUCTION REACHABILITY: 0% (Standalone Node CLI script)
DUPLICATED BY: scripts/verifyFranchiseVisualIdentity.ts
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: SAFE TO DELETE
```

**Forensic Analysis**:
- `inspectPiratesVisual.ts` was created to diagnose an Ahsoka/Star Wars poster leak into the Pirates of the Caribbean card.
- That issue was permanently resolved, and `scripts/verifyFranchiseVisualIdentity.ts` now enforces permanent hash assertions for all 16 franchises (including Pirates of the Caribbean).
- Safe to delete.

---

### Candidate 4: `scripts/inspectHobbitAndXmenVisual.ts`

```yaml
FILE: scripts/inspectHobbitAndXmenVisual.ts
CATEGORY: Historical Visual Diagnostic
STATIC IMPORTS: 0 (Imports only ../src/data/franchises/index, ../src/data/franchiseArtwork, ../src/lib/imageResolver)
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0 (Not in package.json)
RELEASE GATE REFERENCES: 0 (Not invoked by releaseGate.ts)
PRODUCTION REACHABILITY: 0% (Standalone Node CLI script)
DUPLICATED BY: scripts/verifyFranchiseVisualIdentity.ts
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: SAFE TO DELETE
```

**Forensic Analysis**:
- `inspectHobbitAndXmenVisual.ts` was created to verify that The Hobbit and X-Men franchise collection posters did not fall back to generic placeholders or duplicate hashes.
- `scripts/verifyFranchiseVisualIdentity.ts` now permanently checks both franchises in the unified 16-franchise lock suite.
- Safe to delete.

---

### Candidate 5: `src/data/storyGraph.ts`

```yaml
FILE: src/data/storyGraph.ts
CATEGORY: Legacy Seed Dataset
STATIC IMPORTS: 0
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0
RELEASE GATE REFERENCES: 0
PRODUCTION REACHABILITY: 0% (Not imported by any runtime file)
DUPLICATED BY: src/data/cineOrderKnowledgeGraph.ts
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: SAFE TO DELETE
```

**Forensic Analysis**:
- `storyGraph.ts` contains the legacy `storyGraphRegistry` with 10 hardcoded MCU entries (`mcu-multiverse-of-madness`, `mcu-black-widow`, etc.).
- When CineOrder transitioned to Knowledge Engineering, all story relationships and title nodes were unified into `src/data/cineOrderKnowledgeGraph.ts` (386 KB, 221 TitleNodes, 329 edges).
- All runtime engines (`storyKnowledgeGraphEngine.ts`, `storyGraphEngine.ts`, `recommendationService.ts`, `editorialComparisonEngine.ts`, `preparationGuide.ts`) import directly from `cineOrderKnowledgeGraph.ts`.
- Deleting `storyGraph.ts` has **zero impact** on recommendation scoring, traversal, or UI rendering.

---

### Candidate 6: `src/data/storyKnowledgeGraph.ts`

```yaml
FILE: src/data/storyKnowledgeGraph.ts
CATEGORY: Legacy Seed Dataset
STATIC IMPORTS: 0
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0
RELEASE GATE REFERENCES: 0
PRODUCTION REACHABILITY: 0% (Not imported by any runtime file)
DUPLICATED BY: src/data/cineOrderKnowledgeGraph.ts
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: SAFE TO DELETE
```

**Forensic Analysis**:
- `storyKnowledgeGraph.ts` contains the legacy `storyKnowledgeGraph` record defining `StoryKnowledgeNode` entries.
- It was the predecessor data structure before `cineOrderKnowledgeGraph.ts` was authored.
- Zero files in `src/`, `src/__tests__/`, or `scripts/` import `storyKnowledgeGraph.ts`.
- All runtime engines consume `src/data/cineOrderKnowledgeGraph.ts`.
- Deleting `storyKnowledgeGraph.ts` has **zero impact** on recommendation scoring, traversal, or UI rendering.

---

### Candidate 7: `src/components/ui/SmartRecommendation.tsx`

```yaml
FILE: src/components/ui/SmartRecommendation.tsx
CATEGORY: Unused UI Component Prototype
STATIC IMPORTS: 0
DYNAMIC IMPORTS: 0
RUNTIME REFERENCES: 0
TEST REFERENCES: 0
PACKAGE REFERENCES: 0
RELEASE GATE REFERENCES: 0
PRODUCTION REACHABILITY: 0% (Unrendered in React component tree; tree-shaken by Vite)
DUPLICATED BY: src/components/ui/PreparationGuide.tsx, src/components/ui/AdvisorResponseCard.tsx
DELETION RISK: None
CONFIDENCE: HIGH
RECOMMENDATION: SAFE TO DELETE
```

**Forensic Analysis**:
- `SmartRecommendation.tsx` is an 87-line early card prototype.
- It is not imported, re-exported, or rendered in any JSX tree in `src/`.
- Production recommendations are rendered exclusively through `PreparationGuide.tsx` (on movie & franchise pages) and `AdvisorResponseCard.tsx` (in the AI Advisor).
- Vite tree-shaking completely omits it from production distribution bundles.
- Safe to delete.

---

## 3. Verification Commands Results

### 1. TypeScript Type Check (`npx tsc --noEmit`)
```
npm notice run cineorder@1.0.0 npx
npm notice run tsc --noEmit
Exit code: 0 (0 errors)
```

### 2. Production Build (`npm run build`)
```
vite v6.4.3 building for production...
transforming...
✓ 2112 modules transformed.
rendering chunks...
dist/index.html                                  1.72 kB │ gzip:  0.77 kB
dist/assets/index-BIe0qhE1.css                  60.99 kB │ gzip: 10.71 kB
dist/assets/preparationGuide-CbvtlGDT.js       384.73 kB │ gzip: 84.72 kB
✓ built in 4.88s
Exit code: 0
```

### 3. CineOrder Release Gate (`npm run release:gate`)
```
============================================================
  CINEORDER RELEASE GATE (7 GATES)
============================================================

  ✅ PASS   Gate A: Catalog Integrity
  ✅ PASS   Gate B: Lifecycle Integrity
  ✅ PASS   Gate C: Franchise Completeness
  ✅ PASS   Gate D: Knowledge Graph Integrity (20 warnings)
  ✅ PASS   Gate E: Recommendation Integrity
  ✅ PASS   Gate F: Metadata Freshness
  ✅ PASS   Gate G: Browser/UI Integrity

------------------------------------------------------------
  OVERALL: ✅ PASS
============================================================
```

---

## 4. Final Recommendation Summary

- **SAFE TO DELETE (6 files)**:
  - `scripts/checkFranchiseLeak.ts`
  - `scripts/inspectPiratesVisual.ts`
  - `scripts/inspectHobbitAndXmenVisual.ts`
  - `src/data/storyGraph.ts`
  - `src/data/storyKnowledgeGraph.ts`
  - `src/components/ui/SmartRecommendation.tsx`
- **CONSOLIDATE FIRST (1 file)**:
  - `scripts/checkAllPosters.ts`

---

ZERO PROJECT MODIFICATIONS  
ZERO FILE DELETIONS  
ZERO FILE MOVES  
ZERO FILE RENAMES  
ZERO REFACTORING
