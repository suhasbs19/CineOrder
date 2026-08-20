# CineOrder Repository Hygiene Audit

**Audit Date**: August 17, 2026  
**Platform Status**: `v1.0-framework-freeze` Enforced  
**Audit Scope**: Read-only inspection of 280 files across 26 directories

---

## 1. Repository Statistics

| Metric | Count |
| :--- | :--- |
| **Total Files** | **280** |
| **Total Folders** | **26** |
| **Source Files (`src/` excluding `__tests__/`)** | **134** |
| **Regression Test Suites (`src/__tests__/`)** | **26** |
| **Operational & Utility Scripts (`scripts/`)** | **26** |
| **Reports & Audit Ledgers (`reports/`)** | **33** |
| **Documentation Files (`.md` in root & `docs/`)** | **5** |
| **Configuration & Manifest Files (Root level)** | **12** |
| **Public Vector & Raster Artwork Assets (`public/`)** | **25** |
| **Database Schemas & Migrations (`supabase/`)** | **3** |
| **CI/CD Automation Workflows (`.github/`)** | **1** |
| **Agent Directives & Framework Governance (`.agents/`)** | **1** |

---

## 2. Definitely Required

The following core modules are essential to production runtime, routing, state management, and user interface delivery:

* **Entrypoint & Routing**: [`src/main.tsx`](file:///c:/web/src/main.tsx), [`src/App.tsx`](file:///c:/web/src/App.tsx), [`src/index.css`](file:///c:/web/src/index.css), [`index.html`](file:///c:/web/index.html)
* **Application Pages (16)**: [`HomePage.tsx`](file:///c:/web/src/pages/HomePage.tsx), [`FranchisePage.tsx`](file:///c:/web/src/pages/FranchisePage.tsx), [`PlannerPage.tsx`](file:///c:/web/src/pages/PlannerPage.tsx), [`AssistantPage.tsx`](file:///c:/web/src/pages/AssistantPage.tsx), [`MovieDetailPage.tsx`](file:///c:/web/src/pages/MovieDetailPage.tsx), [`UpcomingPage.tsx`](file:///c:/web/src/pages/UpcomingPage.tsx), [`SearchPage.tsx`](file:///c:/web/src/pages/SearchPage.tsx), [`ProfilePage.tsx`](file:///c:/web/src/pages/ProfilePage.tsx), [`PublicProfilePage.tsx`](file:///c:/web/src/pages/PublicProfilePage.tsx), [`LoginPage.tsx`](file:///c:/web/src/pages/LoginPage.tsx), [`SignupPage.tsx`](file:///c:/web/src/pages/SignupPage.tsx), [`ForgotPasswordPage.tsx`](file:///c:/web/src/pages/ForgotPasswordPage.tsx), [`AdminPage.tsx`](file:///c:/web/src/pages/AdminPage.tsx), [`DevDiagnosticsPage.tsx`](file:///c:/web/src/pages/DevDiagnosticsPage.tsx), [`CkgProposalReviewPage.tsx`](file:///c:/web/src/pages/CkgProposalReviewPage.tsx), [`NotFoundPage.tsx`](file:///c:/web/src/pages/NotFoundPage.tsx)
* **UI Components (29)**: Modals, badging, recommendation cards, timeline components, and preparation guide renderers in [`src/components/`](file:///c:/web/src/components/)
* **Franchise Catalogs (19)**: All 240 canonical titles across MCU, Star Wars, Spider-Man, DC, Harry Potter, Alien, Avatar, Middle-earth, Jurassic, Transformers, etc. in [`src/data/franchises/`](file:///c:/web/src/data/franchises/)
* **Runtime Engines (46)**: Traversal, Recommendation, AI Advisor, Announcement Discovery, Artwork Resolution, and Catalog Integration services in [`src/lib/`](file:///c:/web/src/lib/)
* **State Stores (6)**: [`authStore.ts`](file:///c:/web/src/store/authStore.ts), [`watchStore.ts`](file:///c:/web/src/store/watchStore.ts), [`plannerStore.ts`](file:///c:/web/src/store/plannerStore.ts), [`profileStore.ts`](file:///c:/web/src/store/profileStore.ts), [`settingsStore.ts`](file:///c:/web/src/store/settingsStore.ts), [`filterStore.ts`](file:///c:/web/src/store/filterStore.ts)

---

## 3. Active Tooling

The following 26 scripts in [`scripts/`](file:///c:/web/scripts/) serve active release, validation, monitoring, and developer tooling roles:

* **Release Gate & Integrity Enforcement**: [`releaseGate.ts`](file:///c:/web/scripts/releaseGate.ts), [`validateRecommendations.ts`](file:///c:/web/scripts/validateRecommendations.ts), [`auditMetadata.ts`](file:///c:/web/scripts/auditMetadata.ts), [`verifyFrozenFramework.ts`](file:///c:/web/scripts/verifyFrozenFramework.ts), [`verifyFranchiseVisualIdentity.ts`](file:///c:/web/scripts/verifyFranchiseVisualIdentity.ts)
* **Continuous Monitoring & Pipeline**: [`monitorDaemon.ts`](file:///c:/web/scripts/monitorDaemon.ts), [`runAnnouncementPipeline.ts`](file:///c:/web/scripts/runAnnouncementPipeline.ts), [`integrateApprovedProposal.ts`](file:///c:/web/scripts/integrateApprovedProposal.ts)
* **Catalog & Artwork Auditing**: [`auditGlobalCatalog.ts`](file:///c:/web/scripts/auditGlobalCatalog.ts), [`auditAllFranchises.ts`](file:///c:/web/scripts/auditAllFranchises.ts), [`auditAllFranchisesDetail.ts`](file:///c:/web/scripts/auditAllFranchisesDetail.ts), [`auditImageIntegrity.ts`](file:///c:/web/scripts/auditImageIntegrity.ts), [`checkAllPosters.ts`](file:///c:/web/scripts/checkAllPosters.ts), [`autoFixAllPostersFromTmdb.ts`](file:///c:/web/scripts/autoFixAllPostersFromTmdb.ts), [`verifyTmdbPosterIdentity.ts`](file:///c:/web/scripts/verifyTmdbPosterIdentity.ts), [`verifyRenderedCardsDom.ts`](file:///c:/web/scripts/verifyRenderedCardsDom.ts)
* **Governance & Baseline Engines**: [`runEditorialComparison.ts`](file:///c:/web/scripts/runEditorialComparison.ts), [`runGlobalCompletenessAuditReport.ts`](file:///c:/web/scripts/runGlobalCompletenessAuditReport.ts), [`runCatalogLifecycleAudit.ts`](file:///c:/web/scripts/runCatalogLifecycleAudit.ts), [`runProductionUxAudit.ts`](file:///c:/web/scripts/runProductionUxAudit.ts), [`testAiAdvisorResponseQuality.ts`](file:///c:/web/scripts/testAiAdvisorResponseQuality.ts), [`verifyBrowserUI.ts`](file:///c:/web/scripts/verifyBrowserUI.ts)
* **CKG Enrichment & Staging**: [`mergeCkgProposals.ts`](file:///c:/web/scripts/mergeCkgProposals.ts), [`proposeCkgEnrichment.ts`](file:///c:/web/scripts/proposeCkgEnrichment.ts)
* **Franchise Milestone Diagnostics**: [`verifyAlienArchitectureIntegration.ts`](file:///c:/web/scripts/verifyAlienArchitectureIntegration.ts), [`verifyAvatarArchitectureIntegration.ts`](file:///c:/web/scripts/verifyAvatarArchitectureIntegration.ts)

---

## 4. Historical but Intentionally Retained

The following audit files document key platform milestones, architectural benchmarks, and governance snapshots:

* **Governance Comparison Baselines**: [`reports/comparison.csv`](file:///c:/web/reports/comparison.csv), [`reports/comparison.json`](file:///c:/web/reports/comparison.json), [`reports/comparison.md`](file:///c:/web/reports/comparison.md), [`reports/snapshot.json`](file:///c:/web/reports/snapshot.json), [`reports/verified-baseline.md`](file:///c:/web/reports/verified-baseline.md)
* **Override Health Baselines**: [`reports/override-health.json`](file:///c:/web/reports/override-health.json), [`reports/override-health.md`](file:///c:/web/reports/override-health.md)
* **Live Audit Ledgers**: [`reports/global-catalog-completeness-audit.md`](file:///c:/web/reports/global-catalog-completeness-audit.md), [`reports/release-lifecycle-audit.md`](file:///c:/web/reports/release-lifecycle-audit.md), [`reports/unused-file-cleanup-audit.md`](file:///c:/web/reports/unused-file-cleanup-audit.md)
* **Milestone Architecture Ledgers**: [`reports/ai-advisor-deep-audit.md`](file:///c:/web/reports/ai-advisor-deep-audit.md), [`reports/alien-preintegration-audit.md`](file:///c:/web/reports/alien-preintegration-audit.md), [`reports/alien-reusable-architecture-test.md`](file:///c:/web/reports/alien-reusable-architecture-test.md), [`reports/architecture-audit.md`](file:///c:/web/reports/architecture-audit.md), [`reports/avatar-release-state-fix.md`](file:///c:/web/reports/avatar-release-state-fix.md), [`reports/avatar-removal-baseline-verification.md`](file:///c:/web/reports/avatar-removal-baseline-verification.md), [`reports/avatar-reusable-architecture-test.md`](file:///c:/web/reports/avatar-reusable-architecture-test.md), [`reports/candidate-verification.md`](file:///c:/web/reports/candidate-verification.md), [`reports/cleanup-candidates.md`](file:///c:/web/reports/cleanup-candidates.md), [`reports/cleanup-final-report.md`](file:///c:/web/reports/cleanup-final-report.md), [`reports/final-cleanup-candidate-verification.md`](file:///c:/web/reports/final-cleanup-candidate-verification.md), [`reports/final-github-actions-persistence-verification.md`](file:///c:/web/reports/final-github-actions-persistence-verification.md), [`reports/final-production-readiness-audit.md`](file:///c:/web/reports/final-production-readiness-audit.md), [`reports/final-production-ux-audit.md`](file:///c:/web/reports/final-production-ux-audit.md), [`reports/final-repository-hygiene-audit.md`](file:///c:/web/reports/final-repository-hygiene-audit.md), [`reports/final-safe-cleanup-report.md`](file:///c:/web/reports/final-safe-cleanup-report.md), [`reports/franchise-integration-architecture-audit.md`](file:///c:/web/reports/franchise-integration-architecture-audit.md), [`reports/full-regression-audit.md`](file:///c:/web/reports/full-regression-audit.md), [`reports/full-ui-ux-audit.md`](file:///c:/web/reports/full-ui-ux-audit.md), [`reports/github-production-verification.md`](file:///c:/web/reports/github-production-verification.md), [`reports/image-integrity-design-lock-investigation.md`](file:///c:/web/reports/image-integrity-design-lock-investigation.md), [`reports/medium-issues-fix-report.md`](file:///c:/web/reports/medium-issues-fix-report.md), [`reports/planner-story-graph-audit.md`](file:///c:/web/reports/planner-story-graph-audit.md)

---

## 5. Possible Obsolete Files

*(Candidates evaluated for future archival review without making any immediate modifications)*

| Path | Reason | References | Confidence |
| :--- | :--- | :--- | :--- |
| `scripts/verifyAlienArchitectureIntegration.ts` | Specialized diagnostic script written during initial Alien milestone. Globally superseded by Gate C / Gate G in `releaseGate.ts`. | 1 (`reports/alien-reusable-architecture-test.md`) | Low (Keep as diagnostic utility) |
| `scripts/verifyAvatarArchitectureIntegration.ts` | Specialized diagnostic script written during initial Avatar milestone. Globally superseded by Gate C / Gate G in `releaseGate.ts`. | 1 (`reports/avatar-reusable-architecture-test.md`) | Low (Keep as diagnostic utility) |
| `src/data/ckg-proposals/sample-proposal.json` | Static JSON template illustrating proposal package structure. Superseded by dynamic proposal store. | 0 references | Moderate (Keep as developer schema reference) |

---

## 6. Possible Duplicates

| Canonical | Possible Duplicate | Evidence | Confidence |
| :--- | :--- | :--- | :--- |
| `scripts/auditAllFranchises.ts` | `scripts/auditAllFranchisesDetail.ts` | `auditAllFranchises.ts` checks artwork tokens and brand badges; `auditAllFranchisesDetail.ts` outputs detailed per-title release dates and TMDb IDs. | **NOT DUPLICATES (Complementary)** |
| `src/__tests__/globalCatalogCompleteness.test.ts` | `src/__tests__/globalCatalogCompletenessAudit.test.ts` | `globalCatalogCompleteness.test.ts` tests basic title invariants; `globalCatalogCompletenessAudit.test.ts` tests gap detection and crossover heuristics. | **NOT DUPLICATES (Complementary)** |
| `src/__tests__/globalAnnouncementLifecycle.test.ts` | `src/__tests__/globalAnnouncementMonitor.test.ts` | `globalAnnouncementLifecycle.test.ts` tests review lifecycle states; `globalAnnouncementMonitor.test.ts` tests network ingestion and crawler rate limits. | **NOT DUPLICATES (Complementary)** |

---

## 7. Potential Generated Artifacts

| Path | Generator | Should Be Tracked? | Evidence |
| :--- | :--- | :--- | :--- |
| `reports/comparison.json` | `scripts/runEditorialComparison.ts` | **YES** | Official baseline artifact referenced by `ARCHITECTURE.md` and `.agents/AGENTS.md`. |
| `reports/comparison.csv` | `scripts/runEditorialComparison.ts` | **YES** | Governance spreadsheet export required for release auditing. |
| `reports/comparison.md` | `scripts/runEditorialComparison.ts` | **YES** | Governance markdown audit trail. |
| `reports/override-health.json` | Override health monitoring script | **YES** | Baseline snapshot for scaffolding override health. |
| `reports/global-catalog-completeness-audit.md` | `scripts/runGlobalCompletenessAuditReport.ts` | **YES** | Formal audit ledger for catalog gaps. |
| `reports/release-lifecycle-audit.md` | `scripts/runCatalogLifecycleAudit.ts` | **YES** | Formal audit ledger for theatrical/OTT lifecycle states. |
| `.cineorder_monitor_state.json` | `scripts/monitorDaemon.ts` | **NO (Ignored)** | Local crawler state; properly ignored in `.gitignore`. |
| `.cineorder_announcement_proposals.json` | `src/lib/announcementDiscoveryEngine.ts` | **NO (Ignored)** | Local pending proposal cache; properly ignored in `.gitignore`. |

---

## 8. Documentation Issues

| Document | Finding | Severity |
| :--- | :--- | :--- |
| `docs/ADDING_A_FRANCHISE.md` | References 16 existing franchises (written prior to Alien, Avatar, and Spider-Man standalone franchise expansions to 19 franchises). | **Low (Informational)** |
| `scripts/auditAllFranchises.ts` | CLI console banner displays `"CINEORDER 16-FRANCHISE VISUAL IDENTITY AUDIT"` while dynamically validating all 19 franchises. | **Low (Cosmetic)** |

---

## 9. Git Hygiene

| Item | Status | Evaluation |
| :--- | :--- | :--- |
| `.gitignore` Configuration | **Compliant** | Correctly excludes `node_modules`, `dist`, `.env`, `.env.*`, `*.log`, `.DS_Store`, `*.key`, `*.pem`, `.cineorder_monitor_state.json`, and `.cineorder_announcement_proposals.json`. |
| Tracked Secrets | **Clean (0)** | Zero private keys, tokens, or live production secrets tracked in git index. |
| Tracked Build Output | **Clean (0)** | `dist/` and temporary bundler cache are properly excluded. |
| Local Env Templates | **Compliant** | `.env.example` is tracked as template; `.env` is properly ignored. |

---

## 10. Tests That Must Be Preserved

All 26 test suites in [`src/__tests__/`](file:///c:/web/src/__tests__/) protect mission-critical platform invariants and must remain intact:

1. [`unifiedAutonomousPipeline.test.ts`](file:///c:/web/src/__tests__/unifiedAutonomousPipeline.test.ts) — 24 complete lifecycle scenarios (A–X)
2. [`globalCatalogCompletenessAudit.test.ts`](file:///c:/web/src/__tests__/globalCatalogCompletenessAudit.test.ts) — 61/61 completeness & gap-detection invariants
3. [`noWayHomeCrossContinuity.test.ts`](file:///c:/web/src/__tests__/noWayHomeCrossContinuity.test.ts) — Raimi / Webb / MCU cross-continuity & isolation
4. [`chronologicalOrderingRegression.test.ts`](file:///c:/web/src/__tests__/chronologicalOrderingRegression.test.ts) — Zero chronological inversions across 19 franchises
5. [`artworkResolutionAutomation.test.ts`](file:///c:/web/src/__tests__/artworkResolutionAutomation.test.ts) — Zero cross-title artwork contamination
6. [`beyondTheSpiderVerseIntegration.test.ts`](file:///c:/web/src/__tests__/beyondTheSpiderVerseIntegration.test.ts) — Spider-Verse trilogy & TBA release handling
7. [`canonicalLifecycle.test.ts`](file:///c:/web/src/__tests__/canonicalLifecycle.test.ts) — Lifecycle transitions & theatrical / OTT state rules
8. [`catalogIntegrationService.test.ts`](file:///c:/web/src/__tests__/catalogIntegrationService.test.ts) — Approval gate & rollback safety
9. [`crossRunPersistence.test.ts`](file:///c:/web/src/__tests__/crossRunPersistence.test.ts) — Multi-run idempotency & duplicate proposal suppression
10. [`franchiseCompleteness.test.ts`](file:///c:/web/src/__tests__/franchiseCompleteness.test.ts) — 19 franchise catalog integrity & watch order links
11. [`globalAnnouncementLifecycle.test.ts`](file:///c:/web/src/__tests__/globalAnnouncementLifecycle.test.ts) — End-to-end review lifecycle states
12. [`globalAnnouncementMonitor.test.ts`](file:///c:/web/src/__tests__/globalAnnouncementMonitor.test.ts) — Multi-source feed monitor & rate limiting
13. [`globalCatalogCompleteness.test.ts`](file:///c:/web/src/__tests__/globalCatalogCompleteness.test.ts) — Baseline franchise catalog completeness
14. [`imageIntegrity.test.ts`](file:///c:/web/src/__tests__/imageIntegrity.test.ts) — Image aspect ratios, syntax, and fallback assets
15. [`lifecycleConsistency.test.ts`](file:///c:/web/src/__tests__/lifecycleConsistency.test.ts) — Countdown math & upcoming date consistency
16. [`metadataRefresh.test.ts`](file:///c:/web/src/__tests__/metadataRefresh.test.ts) — Freshness thresholds (warning: 30d, error: 90d)
17. [`metadataVerification.test.ts`](file:///c:/web/src/__tests__/metadataVerification.test.ts) — Exact title, runtime, and director metadata
18. [`recommendationCompleteness.test.ts`](file:///c:/web/src/__tests__/recommendationCompleteness.test.ts) — Graph traversal & recommendation category coverage
19. [`strictFranchiseIsolation.test.ts`](file:///c:/web/src/__tests__/strictFranchiseIsolation.test.ts) — Multiverse continuity isolation
20. [`syntheticNewTitlePath.test.ts`](file:///c:/web/src/__tests__/syntheticNewTitlePath.test.ts) — Synthetic future title integration pipeline
21. [`upcomingReleases.test.ts`](file:///c:/web/src/__tests__/upcomingReleases.test.ts) — Upcoming release sorting & OTT availability
22. [`zeroEventPersistence.test.ts`](file:///c:/web/src/__tests__/zeroEventPersistence.test.ts) — Idempotent behavior on zero new events
23. [`aiAdvisor.test.ts`](file:///c:/web/src/__tests__/aiAdvisor.test.ts) — Natural language intent & recommendation matching
24. [`authAndProfile.test.ts`](file:///c:/web/src/__tests__/authAndProfile.test.ts) — User profile & watchlist persistence
25. [`browserImageAssertion.test.ts`](file:///c:/web/src/__tests__/browserImageAssertion.test.ts) — DOM image rendering & placeholder fallbacks

---

## 11. Frozen Framework Verification

```
============================================================
  FROZEN FRAMEWORK SHA-256 CHECKSUM AUDIT
============================================================
1. src/lib/storyGraphEngine.ts
   Expected: e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488
   Actual:   e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488
   Status:   ✅ BIT-FOR-BIT IDENTICAL

2. src/lib/storyKnowledgeGraphEngine.ts
   Expected: e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e
   Actual:   e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e
   Status:   ✅ BIT-FOR-BIT IDENTICAL

3. src/lib/recommendationService.ts
   Expected: d143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9
   Actual:   d143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9
   Status:   ✅ BIT-FOR-BIT IDENTICAL

4. src/data/cineOrderKnowledgeGraph.ts
   Expected: 3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af
   Actual:   3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af
   Status:   ✅ BIT-FOR-BIT IDENTICAL

5. .agents/AGENTS.md
   Expected: 47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363
   Actual:   47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363
   Status:   ✅ BIT-FOR-BIT IDENTICAL
============================================================
```

---

## 12. Recommendations

### Safe Future Cleanup (Optional / Non-Urgent)
* None required immediately. The repository is already lean and strictly pruned.

### Review Before Future Archival
* `src/data/ckg-proposals/sample-proposal.json`: Can be retained as documentation reference or archived if proposal schemas are fully documented in TypeScript types.
* `scripts/verifyAlienArchitectureIntegration.ts` & `scripts/verifyAvatarArchitectureIntegration.ts`: Can be archived into a diagnostics subdirectory in future milestone cycles if desired.

### DO NOT TOUCH
* All 5 Frozen Framework files (`storyGraphEngine.ts`, `storyKnowledgeGraphEngine.ts`, `recommendationService.ts`, `cineOrderKnowledgeGraph.ts`, `AGENTS.md`).
* All 26 regression test suites in `src/__tests__/`.
* All 19 franchise catalog files in `src/data/franchises/`.
* All 46 runtime engines and validators in `src/lib/`.
* All 29 UI components, 16 pages, and 6 stores.
* Core release gate scripts: `releaseGate.ts`, `validateRecommendations.ts`, `auditMetadata.ts`, `verifyFrozenFramework.ts`, `verifyFranchiseVisualIdentity.ts`.

---

**NO FILES WERE DELETED OR MODIFIED DURING THIS AUDIT.**
