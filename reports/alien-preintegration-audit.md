# CineOrder — Alien Franchise Pre-Integration Architectural Audit

## Overview
This pre-integration audit establishes the architectural boundaries and exact file footprint required to integrate the **Alien** franchise into CineOrder using the validated **Reusable Franchise Integration Architecture**.

---

## 1. Architectural Integrity & Boundary Assessment

### Reusable Architecture Invariants
- **FranchiseModule Contract**: `src/types/index.ts` defines `FranchiseModule` (`franchise`, `content`, `watchOrders`, `releaseOrder`, `chronologicalOrder`, `recommendedOrder`).
- **Dynamic Artwork Fallback**: `src/data/franchiseArtwork.ts` automatically resolves collection poster, banner, and `/logos/${slug}.svg` from the franchise definition without requiring hardcoded entries in `franchiseArtworkMap`.
- **Zero UI Modifications**:
  - `PlannerPage.tsx` (`NO CHANGES`)
  - `TargetCombobox.tsx` (`NO CHANGES`)
  - `SearchPage.tsx` (`NO CHANGES`)
  - `FranchisePage.tsx` (`NO CHANGES`)
  - `MovieDetailPage.tsx` (`NO CHANGES`)
  - `UpcomingPage.tsx` (`NO CHANGES`)
  - `imageResolver.ts` (`NO CHANGES`)
- **Zero Frozen Engine Modifications**:
  - `storyGraphEngine.ts` (`NO CHANGES`)
  - `storyKnowledgeGraphEngine.ts` (`NO CHANGES`)
  - `recommendationEngine.ts` (`NO CHANGES`)
  - `recommendationService.ts` (`NO CHANGES`)
  - `narrativeScoring.ts` (`NO CHANGES`)
  - `.agents/AGENTS.md` (`NO CHANGES`)

---

## 2. Exact Files to be Created & Modified

### Files to CREATE (2):
1. `src/data/franchises/alien.ts`:
   - Self-contained franchise module defining franchise metadata, 7 canonical titles, and release/chronological/recommended watch orders.
2. `public/logos/alien.svg`:
   - Vector logo badge following standard CineOrder SVG conventions (`viewBox="0 0 320 80"`).

### Files to MODIFY (3):
1. `src/data/franchises/index.ts`:
   - Import `alienFranchise`, `alienContent`, `alienWatchOrders` and spread into `allFranchises`, `allContent`, and `allWatchOrders`.
2. `src/data/cineOrderKnowledgeGraph.ts` (DATA ONLY):
   - Append 7 `TitleNodes` (`alien-1`, `alien-2`, `alien-3`, `alien-4`, `alien-prometheus`, `alien-covenant`, `alien-romulus`) to `titleNodes`.
   - Append 6 canonical `StoryEdges` to `storyEdges`.
3. `scripts/verifyFranchiseVisualIdentity.ts`:
   - Register the canonical visual identity lock for `alien` in `CANONICAL_FRANCHISE_IDENTITIES`.

---

## 3. Canonical Alien Content Specification

| ID | Title | TMDB ID | Release Date | Runtime | Rating | Director | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| `alien-1` | *Alien* | 348 | 1979-05-25 | 117 min | 8.2 | Ridley Scott | `released` |
| `alien-2` | *Aliens* | 679 | 1986-07-18 | 137 min | 7.9 | James Cameron | `released` |
| `alien-3` | *Alien³* | 8077 | 1992-05-22 | 114 min | 6.4 | David Fincher | `released` |
| `alien-4` | *Alien Resurrection* | 8078 | 1997-11-12 | 109 min | 6.2 | Jean-Pierre Jeunet | `released` |
| `alien-prometheus` | *Prometheus* | 70981 | 2012-05-30 | 124 min | 6.6 | Ridley Scott | `released` |
| `alien-covenant` | *Alien: Covenant* | 126889 | 2017-05-09 | 122 min | 6.2 | Ridley Scott | `released` |
| `alien-romulus` | *Alien: Romulus* | 945961 | 2024-08-13 | 119 min | 7.2 | Fede Álvarez | `released` |

**Collection Identity**:
- TMDB Collection ID: `8091` (*Alien Collection*)
- Poster: `https://image.tmdb.org/t/p/w500/gWFHIY77cRVoBRGERwMHqpD27gc.jpg`
- Banner: `https://image.tmdb.org/t/p/w1280/6X42JnSMdo3dPAswOHUuvebdTq7.jpg`

---

## 4. Narrative Story Graph Strategy

- **Entry Points (`isEntryPoint: true`)**:
  - `alien-1` (*Alien*, 1979) — 0 prerequisites (Origination of the Xenomorph saga & Ripley arc).
  - `alien-prometheus` (*Prometheus*, 2012) — 0 prerequisites (Origination of the Engineer & Black Goo prequel arc).
- **Sequel Chains**:
  - `alien-1` → `alien-2` (*Aliens*): Direct sequel (`direct-sequel`, `required`, 57-year stasis continuation).
  - `alien-2` → `alien-3` (*Alien³*): Direct sequel (`direct-sequel`, `required`, Fiorina 161 crash continuation).
  - `alien-3` → `alien-4` (*Alien Resurrection*): Direct sequel (`direct-sequel`, `required`, Ripley clone continuation).
  - `alien-prometheus` → `alien-covenant` (*Alien: Covenant*): Direct sequel (`direct-sequel`, `required`, David 8 synthetic godhood arc).
  - `alien-1` → `alien-romulus` (*Alien: Romulus*): Direct sequel / interquel (`direct-sequel`, `required`, Recovery of Big Chap from Nostromo debris).

---

## 5. Audit Verdict

```
==================================================
  PRE-INTEGRATION AUDIT: ✅ PASSED
  Non-Generic Dependencies Detected: 0
  UI Modifications Required: 0
  Frozen Engine Modifications Required: 0
==================================================
```
The Alien integration follows the 100% generic reusable architecture with zero framework leakage.
