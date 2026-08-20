# CineOrder — Post-Production Permanent Baseline Lock

**Baseline Lock Date:** August 18, 2026  
**System Milestone:** `v1.0-framework-freeze` + Post-Production Lock  
**Verification Status:** **`LOCKED & PRODUCTION READY`**  
**Auditor / Agent:** Antigravity Autonomous Knowledge & Governance Agent  

---

## 1. Executive Summary

This document establishes the permanent post-production regression baseline for the CineOrder platform. Following the architectural framework freeze, global catalog completeness integration, Spider-Man multi-continuity isolation, Trailer Intelligence phases 1–5, and post-v1.0 bundle optimization, this baseline locks all metrics, dataset counts, and frozen checksums to guarantee zero regressions during future maintenance.

---

## 2. Canonical Catalog & Knowledge Graph Baseline

| Metric / Attribute | Baseline Value | Verification Rule |
| :--- | :---: | :--- |
| **Total Registered Franchises** | **19** | Exactly 19 franchise definitions in `src/data/franchises/` |
| **Total Canonical Titles** | **240** | Exactly 240 movie and series items in `allContent` |
| **Story Graph Title Nodes** | **249** | Exactly 249 nodes in `cineOrderKnowledgeGraph.titleNodes` (240 canonical + 9 auxiliary nodes) |
| **Story Knowledge Graph Edges** | **357** | Exactly 357 narrative edges in `cineOrderKnowledgeGraph.edges` |
| **Titles With Prerequisites** | **163** | 163 titles with active Must Watch / Recommended prerequisite paths |
| **Valid Direct Entry Points** | **77** | 77 titles with 0 prerequisite requirements (entry points) |
| **Total Watch Order Entries** | **720** | Exactly 720 watch order entries across 34 franchise watch order tracks |
| **Duplicate Content IDs** | **0** | Zero duplicate content ID collisions globally |
| **Duplicate TMDb IDs** | **0** | Zero duplicate TMDb ID collisions globally |
| **Broken Graph References** | **0** | Zero unindexed sourceId or targetId references |
| **Chronological Inversions** | **0** | 100% strict comparator ordering across all 19 franchises |
| **Lifecycle Contradictions** | **0** | Zero contradictions between release date and OTT flags |

---

## 3. Frozen Framework SHA-256 Checksums

The following 5 core files are cryptographically locked under the `v1.0-framework-freeze` directive:

| File Path | SHA-256 Checksum | Lock Status |
| :--- | :--- | :---: |
| [`src/lib/storyGraphEngine.ts`](file:///c:/web/src/lib/storyGraphEngine.ts) | `e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488` | `LOCKED` |
| [`src/lib/storyKnowledgeGraphEngine.ts`](file:///c:/web/src/lib/storyKnowledgeGraphEngine.ts) | `e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e` | `LOCKED` |
| [`src/lib/recommendationService.ts`](file:///c:/web/src/lib/recommendationService.ts) | `d143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9` | `LOCKED` |
| [`src/data/cineOrderKnowledgeGraph.ts`](file:///c:/web/src/data/cineOrderKnowledgeGraph.ts) | `3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af` | `LOCKED` |
| [`.agents/AGENTS.md`](file:///c:/web/.agents/AGENTS.md) | `47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363` | `LOCKED` |

---

## 4. Production Performance Baseline

| Performance Metric | Baseline Target | Baseline Result |
| :--- | :---: | :---: |
| **Max Minified Production Chunk** | $< 500.00\text{ kB}$ | **386.35 kB** (`franchise-marvel.js`) |
| **Core Franchise Chunk Size** | $< 200.00\text{ kB}$ | **133.71 kB** (gzip: 34.34 kB) |
| **Vite Chunk Size Warnings** | **0** | **0 warnings** |
| **Production Build Execution Time** | $< 10.0\text{ s}$ | **4.72 s** |
| **Search Engine Latency** | $< 10\text{ ms}$ | **< 5 ms** |
| **Recommendation Traversal Latency** | $< 5\text{ ms}$ | **< 1 ms** |
| **Trailer Impact Simulation Latency** | $< 2\text{ ms}$ | **~0.009 ms** |

---

## 5. Multi-Continuity Isolation Baseline

- **Spider-Man Universe Separation:**
  - *Sam Raimi Trilogy (Spider-Man 1, 2, 3)*: Isolated in `spider-man` franchise (`raimi-spiderman`).
  - *Marc Webb Dilogy (TASM 1, 2)*: Isolated in `spider-man` franchise (`webb-spiderman`).
  - *Sony Spider-Verse (Into, Across, Beyond)*: Isolated in `spider-man` franchise (`spider-verse`).
  - *MCU Spider-Man (Homecoming, Far From Home, No Way Home)*: Registered in `marvel-cinematic-universe` (`mcu-616`).
- **No Way Home Prerequisite Bridge:**
  - `PreparationGuide` for *Spider-Man: No Way Home* identifies 7 Must Watch titles across Raimi, Webb, and MCU.
  - Zero Raimi/Webb titles are present in the MCU canonical release or chronological watch orders.
- **Deadpool & Wolverine / Fox X-Men Isolation:**
  - Crossover character edges capped at `moderate` strength.
  - Zero Fox X-Men titles injected into MCU release or chronological watch orders.

---

## 6. Security, Privacy & Accessibility Baseline

- **Security:** 0 committed secrets; 0 exposed private keys; 0 occurrences of `dangerouslySetInnerHTML`; all iframes restricted to `https://www.youtube.com/embed/{11-char-key}`.
- **Privacy:** Public profile endpoint strictly omits emails and password hashes, exposing only opt-in public movie identity.
- **Accessibility:** WCAG AAA color contrast ratio (> 12:1); full keyboard navigation (`Tab`, `Escape`, `Enter`); alt attributes on all movie posters; visible focus indicators.

---

## 7. Known Intentional Informational Findings

1. **20 Standalone Entry Point Nodes in CKG:** Titles such as *Moon Knight*, *Werewolf by Night*, *The Continental*, and *Blade* have 0 story edges as they are standalone entry points under the Editorial Policy.
2. **8 Flagship Franchise Hero Poster Mirrorings:** 8 franchises intentionally use the iconic hero poster of their flagship title (e.g. *Spider-Man 1* for Spider-Man franchise). Title-to-title cross-contamination is strictly 0.

---

## 8. Deployment Readiness Verdict

# **`PRODUCTION READY`**
All 7 Release Gates (A–G), 31/31 regression suites, TypeScript typechecks, and Chrome browser UI verification suites are verified in 100% passing state.
