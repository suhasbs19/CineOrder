# CineOrder — AI Advisor Removal Inventory

**Date:** 2026-08-19  
**Scope:** Complete identification of all AI Advisor-specific components, engines, hooks, pages, routes, tests, and scripts prior to removal.  
**Directive:** Remove ONLY the AI Advisor feature. All core CineOrder intelligence (Story Knowledge Graph, CKG Explorer, deterministic recommendation engine, Trailer Intelligence, Global Announcement Monitor, Review Center, Lifecycle Engine) remains completely untouched and preserved.

---

## 1. Inventory of Files for Removal

The following files are verified to belong exclusively to the AI Advisor feature and will be removed:

| # | File Path | Type | Description |
|---|---|---|---|
| 1 | [`src/lib/aiAdvisorEngine.ts`](file:///c:/web/src/lib/aiAdvisorEngine.ts) | Service / Engine | AI Advisor intent classification, entity extraction, and conversational synthesis engine. |
| 2 | [`src/hooks/useAIAssistant.ts`](file:///c:/web/src/hooks/useAIAssistant.ts) | Hook | React hook managing AI conversation history, suggestions, and query dispatches. |
| 3 | [`src/components/ui/AIAssistantModal.tsx`](file:///c:/web/src/components/ui/AIAssistantModal.tsx) | Component | Modal chat UI for franchise-specific AI queries. |
| 4 | [`src/components/ui/AdvisorResponseCard.tsx`](file:///c:/web/src/components/ui/AdvisorResponseCard.tsx) | Component | Card rendering structured response metadata from AI Advisor. |
| 5 | [`src/components/home/AskCineOrderSection.tsx`](file:///c:/web/src/components/home/AskCineOrderSection.tsx) | Component | Homepage promo section with search input routing to `/assistant`. |
| 6 | [`src/pages/AssistantPage.tsx`](file:///c:/web/src/pages/AssistantPage.tsx) | Page | Full-page chat UI for the AI Movie Advisor (`/assistant`). |
| 7 | [`src/__tests__/aiAdvisor.test.ts`](file:///c:/web/src/__tests__/aiAdvisor.test.ts) | Test Suite | Unit tests for AI Advisor engine intents and responses. |
| 8 | [`scripts/testAiAdvisorResponseQuality.ts`](file:///c:/web/scripts/testAiAdvisorResponseQuality.ts) | Script | Standalone quality evaluation script for AI Advisor output. |

---

## 2. Inventory of Files Requiring Modification

The following files contain entry points, routes, or imports for the AI Advisor that will be removed or refactored:

| # | File Path | Modifications Required |
|---|---|---|
| 1 | [`src/App.tsx`](file:///c:/web/src/App.tsx) | Remove lazy import of `AssistantPage` and `/assistant` route definition. |
| 2 | [`src/components/layout/Navbar.tsx`](file:///c:/web/src/components/layout/Navbar.tsx) | Remove "AI Advisor" nav links from desktop and mobile navigation menus. |
| 3 | [`src/pages/HomePage.tsx`](file:///c:/web/src/pages/HomePage.tsx) | Remove `AskCineOrderSection` import and section render; remove "Ask AI Advisor" buttons and sample AI question chips from `ContinuePreparationWidget`. |
| 4 | [`src/pages/FranchisePage.tsx`](file:///c:/web/src/pages/FranchisePage.tsx) | Remove `AIAssistantModal` import, `isAIOpen` modal state, and "Ask AI Assistant" header button. |
| 5 | [`scripts/runProductionUxAudit.ts`](file:///c:/web/scripts/runProductionUxAudit.ts) | Remove `processAIQuery` import and section 5 (AI Advisor response audit). |
| 6 | [`scripts/verifyBrowserUI.ts`](file:///c:/web/scripts/verifyBrowserUI.ts) | Update Route 5 test to verify that `/assistant` is no longer a valid active route (returns 404/NotFoundPage) and that UI navigation is clean. |
| 7 | [`src/__tests__/productionUserAcceptance.test.ts`](file:///c:/web/src/__tests__/productionUserAcceptance.test.ts) | Update route list in Check 38 to reflect active production top-level routes. |

---

## 3. Inventory of Core Features Strictly Preserved

The following components and systems are confirmed distinct from the AI Advisor and will remain 100% active and unmodified:

| System | Component / Files | Status |
|---|---|---|
| **Story Knowledge Graph** | `src/data/cineOrderKnowledgeGraph.ts`, `src/data/franchises/*` | ✅ 100% PRESERVED |
| **Traversal & Recommendation Engine** | `src/lib/storyGraphEngine.ts`, `src/lib/storyKnowledgeGraphEngine.ts`, `src/lib/recommendationService.ts` | ✅ 100% PRESERVED (FROZEN) |
| **CKG Explorer & Preparation Guide** | `src/components/ui/PreparationGuide.tsx`, `src/components/ui/StoryGraphNodeHierarchy.tsx` | ✅ 100% PRESERVED |
| **Trailer Intelligence** | `src/lib/trailerIntelligence.ts`, `src/store/trailerIntelligenceStore.ts`, `TrailerIntelligenceReviewTab.tsx`, `TrailerApprovalPreviewModal.tsx` | ✅ 100% PRESERVED |
| **Trailer Recommendation Impact** | `src/lib/trailerRecommendationImpactSimulator.ts`, `src/lib/trailerRecommendationImpactService.ts` | ✅ 100% PRESERVED |
| **Global Announcement Monitor** | `src/lib/globalAnnouncementMonitor.ts`, `src/lib/announcementDiscovery.ts`, `scripts/monitorDaemon.ts` | ✅ 100% PRESERVED |
| **Production Review Center** | `src/pages/CkgProposalReviewPage.tsx` | ✅ 100% PRESERVED |
| **Lifecycle & Upcoming Engine** | `src/lib/metadataRefresh.ts`, `src/lib/upcomingUtils.ts`, `src/pages/UpcomingPage.tsx` | ✅ 100% PRESERVED |
| **Watch Planner & Tracking** | `src/store/plannerStore.ts`, `src/store/watchStore.ts`, `src/pages/PlannerPage.tsx` | ✅ 100% PRESERVED |
| **Search & Catalog** | `src/pages/SearchPage.tsx`, `src/lib/searchUtils.ts` | ✅ 100% PRESERVED |
| **Multi-Continuity Firewalls** | Raimi/Webb isolation in MCU, DCU/DCEU separation | ✅ 100% PRESERVED |

---

## 4. Frozen Framework Verification

All 5 frozen framework files will be verified to maintain identical bit-for-bit SHA-256 checksums:
- `src/lib/storyGraphEngine.ts`
- `src/lib/storyKnowledgeGraphEngine.ts`
- `src/lib/recommendationService.ts`
- `src/data/cineOrderKnowledgeGraph.ts`
- `.agents/AGENTS.md`
