# CineOrder — Verified Project Baseline

> **OFFICIAL PROJECT BASELINE CAPTURE**
> - **Baseline Status:** ✅ VERIFIED & LOCKED
> - **Platform State:** `v1.0-framework-freeze`
> - **Website Modifications During Capture:** 0
> - **Total Repository Files:** 218

```text
============================================================
              BASELINE CERTIFICATION STATEMENT
============================================================
Website state:                      VERIFIED
Website modifications during baseline: 0
Files deleted:                      0
Files moved:                        0
Files renamed:                      0
Files consolidated:                 0
Frozen framework modifications:     0
Current Application Status:         100% PRODUCTION READY
============================================================
```

---

## 1. Frozen Framework Architecture & Cryptographic Checksums

All modules subject to the CineOrder platform freeze directive ([AGENTS.md](file:///c:/web/.agents/AGENTS.md)) have their SHA-256 cryptographic checksums locked below:

| Active Locked Framework File | Status | SHA-256 Checksum |
|:---|:---:|:---|
| `src/lib/storyGraphEngine.ts` | 🔒 LOCKED | `e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488` |
| `src/lib/storyKnowledgeGraphEngine.ts` | 🔒 LOCKED | `e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e` |
| `src/lib/recommendationService.ts` | 🔒 LOCKED | `d143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9` |
| `src/data/cineOrderKnowledgeGraph.ts` | 🔒 LOCKED | `2629a417004111498bbe8235cc01c6daf95eea53fa5008ffd5d9d48b86615575` |
| `.agents/AGENTS.md` | 🔒 LOCKED | `47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363` |

> *Note: Legacy specification aliases referenced in historical documentation (`recommendationEngine.ts`, `narrativeScoring.ts`) are implemented directly within `recommendationService.ts` and `storyKnowledgeGraphEngine.ts`.*

---

## 2. Pirates of the Caribbean Visual Identity Verification

A dedicated multi-layer inspection was conducted across the runtime resolver, franchise source definitions, and artwork map:

| Dimension | Configured Value | Status |
|:---|:---|:---:|
| **Franchise ID** | `pirates-of-the-caribbean` | ✅ Authentic |
| **TMDB Collection ID** | `295` (Pirates of the Caribbean Collection) | ✅ Authentic |
| **Franchise Data (`src/data/franchises/pirates.ts`)** | `https://image.tmdb.org/t/p/w500/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg` | ✅ Verified Authentic |
| **Artwork Map (`src/data/franchiseArtwork.ts`)** | `https://image.tmdb.org/t/p/w500/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg` | ✅ Verified Authentic |
| **Rendered Value (`resolveFranchiseArtwork()`)** | `https://image.tmdb.org/t/p/w500/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg` | ✅ Verified Authentic |
| **Vector Logo** | `/logos/pirates-of-the-caribbean.svg` | ✅ Verified |
| **Forbidden Ahsoka / Star Wars Hash Leak Check** | `laCJxobHoPVaLQTKxc14Y2zV64J.jpg` / `db32LaOibwEliAmSL2jjDF6oDdj.jpg` | 🛡️ ZERO LEAKS (PASS) |

**Conclusion:** All 3 data layers (`franchises/pirates.ts`, `franchiseArtwork.ts`, `imageResolver.ts`) are **100% IDENTICAL and CONSISTENT** with canonical TMDB Collection 295 artwork.

---

## 3. All 16 Canonical Franchise Visual Identities

| Franchise ID | Franchise Name | TMDB Collection | Poster URL Hash | Consistency |
|:---|:---|:---:|:---|:---:|
| `marvel-cinematic-universe` | Marvel Cinematic Universe | `N/A (Universe)` | `or06FN3Dka5tukK1e9sl16pB3iy.jpg` | ✅ 100% MATCH |
| `star-wars` | Star Wars | `10` | `db32LaOibwEliAmSL2jjDF6oDdj.jpg` | ✅ 100% MATCH |
| `harry-potter` | Wizarding World (Harry Potter) | `1241` | `wuMc08IPKEatf9rnMNXvIDxqP4W.jpg` | ✅ 100% MATCH |
| `dc-extended-universe` | DC Universe | `N/A (Universe)` | `qJ2tW6WMUDux911r6m7haRef0WH.jpg` | ✅ 100% MATCH |
| `the-conjuring-universe` | The Conjuring Universe | `2806` | `wVYREutTvI2tmxr6ujrHT704wGF.jpg` | ✅ 100% MATCH |
| `fast-and-furious` | Fast & Furious | `9485` | `fiVW06jE7z9YnO4trhaMEdclSiC.jpg` | ✅ 100% MATCH |
| `john-wick` | John Wick | `404609` | `sm7rZZivZm2NhJDucFf3gpfFdVt.jpg` | ✅ 100% MATCH |
| `mission-impossible` | Mission: Impossible | `87359` | `AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg` | ✅ 100% MATCH |
| `x-men` | X-Men | `748` | `31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg` | ✅ 100% MATCH |
| `jurassic-park` | Jurassic Park | `328` | `9i3plLl89DHMz7mahksDaAo7HIS.jpg` | ✅ 100% MATCH |
| `pirates-of-the-caribbean` | Pirates of the Caribbean | `295` | `zRBaZxS5YauLvRYjAdL4AUCwlht.jpg` | ✅ 100% MATCH |
| `transformers` | Transformers | `8650` | `nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg` | ✅ 100% MATCH |
| `lord-of-the-rings` | Lord of the Rings / Middle-earth | `119` | `6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg` | ✅ 100% MATCH |
| `the-hobbit` | The Hobbit | `121938` | `hQghXOjSS2xfzx9XnMyZqt8brCF.jpg` | ✅ 100% MATCH |
| `evil-dead` | Evil Dead | `1960` | `eWFADubShlTEUiNsPcN6BMOKakr.jpg` | ✅ 100% MATCH |
| `insidious` | Insidious | `228446` | `1egpmVXuXed58TH2UOnX1nATTrf.jpg` | ✅ 100% MATCH |

---

## 4. Upcoming Page Tracker Dataset Invariants

| Category Metric | Canonical Count | Mathematical Verification |
|:---|:---:|:---|
| **Upcoming Releases** | **10** | Unreleased / Future / TBA titles |
| **Recently Released** | **4** | Titles released within past 90 days |
| **All Tracked Releases** | **14** | **All (14) = Upcoming (10) + Recently Released (4)** |
| **Disjoint Set Invariant** | **0 Overlap** | Verified no title appears in both lists simultaneously |
| **Filter Synchronization** | **Active** | Badges update in real-time on search, franchise, and format filters |

---

## 5. Personal Watch Planner Baseline

- **Gamified Achievements Section:** **REMOVED** (Zero traces of "Finished MCU", "Finished Star Wars", "100 Movies Watched", "Completed Preparation Plan", or "Weekend Marathon").
- **Account Statistics Section:** **PRESERVED & FULL-WIDTH** (Displays Movies Watched, TV Episodes Watched, Total Hours Watched, Plans Completed, Most Watched Franchise, Favorite Character, Favorite Genre in a responsive 4-column card).
- **Watch Plan Generator:** **100% Functional** (Generates day-by-day schedules with CSV and checklist export).

---

## 6. AI Advisor & Markdown Rendering

- **Markdown Parser:** Pure React `SafeMarkdown` implementation preventing raw `**` or Markdown artifacts from leaking into DOM.
- **Supported Intents:** All 9 intents active (`character_series`, `whats_next`, `skip_advice`, `prepare_for`, `watch_tonight`, `time_budget`, `character_journey`, `franchise_start`, `lore_explain`).
- **Context-Aware Suggestions:** Dynamic follow-up suggestion chips rendered after each message.

---

## 7. Authentication & Profile Privacy Matrix

- **Account Registration:** Dual-mode `EMAIL` (with recovery) vs `USERNAME_ONLY` (mandatory acknowledgment, recovery blocked).
- **Username Normalization:** Lowercase normalization, length constraints (3-24 chars), regex safety, reserved name protection.
- **Privacy Security:** Private profiles return `null`; public profiles omit internal credentials, password hashes, and tokens.

---

## 8. Complete Application Route Inventory (18 Routes)

| Route | Page Component | Health / HTTP Status |
|:---|:---|:---:|
| `/` | `HomePage.tsx` | ✅ 200 OK |
| `/franchise/:slug` | `FranchisePage.tsx` | ✅ 200 OK |
| `/movie/:id` | `MovieDetailPage.tsx` | ✅ 200 OK |
| `/search` | `SearchPage.tsx` | ✅ 200 OK |
| `/upcoming` | `UpcomingPage.tsx` | ✅ 200 OK |
| `/assistant` | `AssistantPage.tsx` | ✅ 200 OK |
| `/planner` | `PlannerPage.tsx` | ✅ 200 OK |
| `/dashboard` | `PlannerPage.tsx` (Alias) | ✅ 200 OK |
| `/login` | `LoginPage.tsx` | ✅ 200 OK |
| `/signup` | `SignupPage.tsx` | ✅ 200 OK |
| `/forgot-password` | `ForgotPasswordPage.tsx` | ✅ 200 OK |
| `/profile` | `ProfilePage.tsx` | ✅ 200 OK |
| `/@:username` | `PublicProfilePage.tsx` | ✅ 200 OK |
| `/u/:username` | `PublicProfilePage.tsx` | ✅ 200 OK |
| `/admin` | `AdminPage.tsx` | ✅ 200 OK |
| `/dev-diagnostics` | `DevDiagnosticsPage.tsx` | ✅ 200 OK |
| `/developer/ckg-review` | `CkgProposalReviewPage.tsx` | ✅ 200 OK |
| `*` | `NotFoundPage.tsx` | ✅ 200 OK |

---

## 9. Verification & Release Gate Results

| Verification Suite | Command | Result |
|:---|:---|:---:|
| **TypeScript Typecheck** | `npx tsc --noEmit` | ✅ **0 errors** |
| **Production Build** | `npm run build` | ✅ **Built in 4.4s (0 errors)** |
| **Release Gate (7 Gates)** | `npm run release:gate` | ✅ **ALL 7 GATES PASSED** |
| **Upcoming Releases Regression** | `npx tsx src/__tests__/upcomingReleases.test.ts` | ✅ **17/17 PASSED** |
| **AI Advisor Intent Regression** | `npx tsx src/__tests__/aiAdvisor.test.ts` | ✅ **43/43 PASSED** |
| **AI Advisor Response Quality** | `npx tsx scripts/testAiAdvisorResponseQuality.ts` | ✅ **31/31 PASSED** |
| **Auth & Profile Identity Suite** | `npx tsx src/__tests__/authAndProfile.test.ts` | ✅ **ALL PASSED** |
| **Franchise Completeness Suite** | `npx tsx src/__tests__/franchiseCompleteness.test.ts` | ✅ **69/69 PASSED** |
| **Lifecycle Consistency Suite** | `npx tsx src/__tests__/lifecycleConsistency.test.ts` | ✅ **10/10 PASSED** |

---

## 10. Complete Repository Inventory (218 Files)

| Relative File Path | Extension | Lines | Size (Bytes) |
|:---|:---:|:---:|:---:|
| `.agents/AGENTS.md` | `.md` | 76 | 3835 |
| `.env` | `` | 13 | 503 |
| `.env.example` | `.example` | 13 | 491 |
| `.gitignore` | `` | 8 | 63 |
| `ARCHITECTURE.md` | `.md` | 558 | 24591 |
| `CHANGELOG.md` | `.md` | 71 | 6453 |
| `EDITORIAL_POLICY.md` | `.md` | 968 | 49417 |
| `GRAPH_STYLE_GUIDE.md` | `.md` | 163 | 8640 |
| `index.html` | `.html` | 24 | 1384 |
| `package-lock.json` | `.json` | 4521 | 154901 |
| `package.json` | `.json` | 49 | 1341 |
| `postcss.config.js` | `.js` | 7 | 81 |
| `public/logos/dc-extended-universe.svg` | `.svg` | 6 | 418 |
| `public/logos/evil-dead.svg` | `.svg` | 4 | 308 |
| `public/logos/fast-and-furious.svg` | `.svg` | 4 | 301 |
| `public/logos/harry-potter.svg` | `.svg` | 4 | 270 |
| `public/logos/insidious.svg` | `.svg` | 4 | 306 |
| `public/logos/john-wick.svg` | `.svg` | 4 | 298 |
| `public/logos/jurassic-park.svg` | `.svg` | 5 | 425 |
| `public/logos/lord-of-the-rings.svg` | `.svg` | 5 | 463 |
| `public/logos/marvel-cinematic-universe.svg` | `.svg` | 11 | 558 |
| `public/logos/mission-impossible.svg` | `.svg` | 4 | 274 |
| `public/logos/pirates-of-the-caribbean.svg` | `.svg` | 5 | 415 |
| `public/logos/star-wars.svg` | `.svg` | 4 | 308 |
| `public/logos/the-conjuring-universe.svg` | `.svg` | 4 | 266 |
| `public/logos/the-hobbit.svg` | `.svg` | 4 | 309 |
| `public/logos/transformers.svg` | `.svg` | 4 | 309 |
| `public/logos/x-men.svg` | `.svg` | 7 | 475 |
| `public/placeholder-avatar.png` | `.png` | 13 | 522 |
| `public/placeholder-avatar.svg` | `.svg` | 13 | 522 |
| `public/placeholder-backdrop.png` | `.png` | 23 | 1343 |
| `public/placeholder-backdrop.svg` | `.svg` | 23 | 1343 |
| `public/placeholder-poster.png` | `.png` | 23 | 1336 |
| `public/placeholder-poster.svg` | `.svg` | 22 | 1147 |
| `public/vite.svg` | `.svg` | 5 | 228 |
| `reports/architecture-audit.md` | `.md` | 191 | 12677 |
| `reports/candidate-verification.md` | `.md` | 308 | 15141 |
| `reports/cleanup-candidates.md` | `.md` | 255 | 53512 |
| `reports/cleanup-final-report.md` | `.md` | 130 | 5499 |
| `reports/comparison.csv` | `.csv` | 251 | 28457 |
| `reports/comparison.json` | `.json` | 13285 | 422863 |
| `reports/comparison.md` | `.md` | 2102 | 78538 |
| `reports/full-regression-audit.md` | `.md` | 489 | 43373 |
| `reports/override-health.json` | `.json` | 28 | 663 |
| `reports/override-health.md` | `.md` | 54 | 2249 |
| `reports/snapshot.json` | `.json` | 7 | 153 |
| `scripts/auditAllFranchises.ts` | `.ts` | 44 | 2067 |
| `scripts/auditImageIntegrity.ts` | `.ts` | 154 | 6271 |
| `scripts/auditMetadata.ts` | `.ts` | 303 | 10747 |
| `scripts/autoFixAllPostersFromTmdb.ts` | `.ts` | 95 | 3050 |
| `scripts/checkAllPosters.ts` | `.ts` | 48 | 1646 |
| `scripts/checkFranchiseLeak.ts` | `.ts` | 11 | 475 |
| `scripts/inspectHobbitAndXmenVisual.ts` | `.ts` | 75 | 3298 |
| `scripts/inspectPiratesVisual.ts` | `.ts` | 69 | 3210 |
| `scripts/mergeCkgProposals.ts` | `.ts` | 53 | 2031 |
| `scripts/proposeCkgEnrichment.ts` | `.ts` | 60 | 2151 |
| `scripts/releaseGate.ts` | `.ts` | 463 | 17386 |
| `scripts/runEditorialComparison.ts` | `.ts` | 434 | 18185 |
| `scripts/testAiAdvisorResponseQuality.ts` | `.ts` | 114 | 7764 |
| `scripts/validateRecommendations.ts` | `.ts` | 40 | 1346 |
| `scripts/verifyBrowserUI.ts` | `.ts` | 193 | 9913 |
| `scripts/verifyFranchiseVisualIdentity.ts` | `.ts` | 386 | 16613 |
| `scripts/verifyRenderedCardsDom.ts` | `.ts` | 136 | 4620 |
| `scripts/verifyTmdbPosterIdentity.ts` | `.ts` | 324 | 11690 |
| `src/App.tsx` | `.tsx` | 87 | 4586 |
| `src/components/home/AskCineOrderSection.tsx` | `.tsx` | 88 | 3550 |
| `src/components/home/ContinuePreparationWidget.tsx` | `.tsx` | 67 | 3021 |
| `src/components/layout/Footer.tsx` | `.tsx` | 103 | 4014 |
| `src/components/layout/Navbar.tsx` | `.tsx` | 313 | 12185 |
| `src/components/layout/PageTransition.tsx` | `.tsx` | 23 | 528 |
| `src/components/layout/ScrollToTop.tsx` | `.tsx` | 13 | 238 |
| `src/components/planner/TargetCombobox.tsx` | `.tsx` | 309 | 12856 |
| `src/components/ui/AdvisorResponseCard.tsx` | `.tsx` | 473 | 22568 |
| `src/components/ui/AIAssistantModal.tsx` | `.tsx` | 172 | 7335 |
| `src/components/ui/Avatar.tsx` | `.tsx` | 51 | 1148 |
| `src/components/ui/Badge.tsx` | `.tsx` | 47 | 1210 |
| `src/components/ui/Button.tsx` | `.tsx` | 58 | 2178 |
| `src/components/ui/Card.tsx` | `.tsx` | 61 | 1724 |
| `src/components/ui/Input.tsx` | `.tsx` | 68 | 2005 |
| `src/components/ui/Modal.tsx` | `.tsx` | 97 | 2865 |
| `src/components/ui/PreparationGuide.tsx` | `.tsx` | 941 | 49791 |
| `src/components/ui/ProgressBar.tsx` | `.tsx` | 79 | 2261 |
| `src/components/ui/SafeImage.tsx` | `.tsx` | 72 | 2305 |
| `src/components/ui/SafeMarkdown.tsx` | `.tsx` | 325 | 9745 |
| `src/components/ui/SearchResultCard.tsx` | `.tsx` | 188 | 6270 |
| `src/components/ui/SearchSkeleton.tsx` | `.tsx` | 26 | 954 |
| `src/components/ui/Skeleton.tsx` | `.tsx` | 68 | 1954 |
| `src/components/ui/SmartRecommendation.tsx` | `.tsx` | 87 | 3069 |
| `src/components/ui/StoryGraphNodeHierarchy.tsx` | `.tsx` | 431 | 18466 |
| `src/components/ui/StreamingBadges.tsx` | `.tsx` | 132 | 4678 |
| `src/components/ui/StreamingProviders.tsx` | `.tsx` | 150 | 4553 |
| `src/components/ui/Tabs.tsx` | `.tsx` | 208 | 7213 |
| `src/components/ui/Timeline.tsx` | `.tsx` | 275 | 10803 |
| `src/components/ui/Toggle.tsx` | `.tsx` | 43 | 1246 |
| `src/components/ui/UpcomingCard.tsx` | `.tsx` | 191 | 7678 |
| `src/data/cineOrderKnowledgeGraph.ts` | `.ts` | 7081 | 386885 |
| `src/data/ckg-proposals/sample-proposal.json` | `.json` | 40 | 1457 |
| `src/data/editorialOverrides.ts` | `.ts` | 34 | 1275 |
| `src/data/franchiseArtwork.ts` | `.ts` | 117 | 4693 |
| `src/data/franchises/conjuring.ts` | `.ts` | 215 | 11228 |
| `src/data/franchises/dc.ts` | `.ts` | 495 | 19482 |
| `src/data/franchises/evildead.ts` | `.ts` | 165 | 8345 |
| `src/data/franchises/fastfurious.ts` | `.ts` | 246 | 9755 |
| `src/data/franchises/harrypotter.ts` | `.ts` | 254 | 10112 |
| `src/data/franchises/index.ts` | `.ts` | 76 | 2756 |
| `src/data/franchises/insidious.ts` | `.ts` | 146 | 7216 |
| `src/data/franchises/johnwick.ts` | `.ts` | 151 | 5707 |
| `src/data/franchises/jurassic.ts` | `.ts` | 184 | 7465 |
| `src/data/franchises/lotr.ts` | `.ts` | 137 | 7408 |
| `src/data/franchises/marvel.ts` | `.ts` | 941 | 38535 |
| `src/data/franchises/missionimpossible.ts` | `.ts` | 187 | 10391 |
| `src/data/franchises/pirates.ts` | `.ts` | 133 | 7634 |
| `src/data/franchises/starwars.ts` | `.ts` | 442 | 17320 |
| `src/data/franchises/thehobbit.ts` | `.ts` | 96 | 5108 |
| `src/data/franchises/transformers.ts` | `.ts` | 207 | 11121 |
| `src/data/franchises/utils.ts` | `.ts` | 185 | 5777 |
| `src/data/franchises/xmen.ts` | `.ts` | 270 | 10254 |
| `src/data/franchises.ts` | `.ts` | 178 | 6381 |
| `src/data/goldenTraversalSnapshots.ts` | `.ts` | 97 | 2534 |
| `src/data/storyGraph.ts` | `.ts` | 310 | 13058 |
| `src/data/storyKnowledgeGraph.ts` | `.ts` | 931 | 39681 |
| `src/data/storyRecommendations.ts` | `.ts` | 832 | 40618 |
| `src/hooks/useAIAssistant.ts` | `.ts` | 87 | 2346 |
| `src/hooks/useDebounce.ts` | `.ts` | 33 | 802 |
| `src/hooks/useIntersectionObserver.ts` | `.ts` | 52 | 1361 |
| `src/hooks/useRecommendation.ts` | `.ts` | 131 | 4112 |
| `src/hooks/useTMDbContent.ts` | `.ts` | 442 | 15042 |
| `src/hooks/useUpcomingReleases.ts` | `.ts` | 187 | 6524 |
| `src/index.css` | `.css` | 158 | 3453 |
| `src/lib/aiAdvisorEngine.ts` | `.ts` | 1728 | 61951 |
| `src/lib/auditRepository.ts` | `.ts` | 305 | 9751 |
| `src/lib/authService.ts` | `.ts` | 418 | 12076 |
| `src/lib/ckgProposalStore.ts` | `.ts` | 548 | 18188 |
| `src/lib/contentAddressableSnapshotStore.ts` | `.ts` | 373 | 12095 |
| `src/lib/cqvRecommendationValidator.ts` | `.ts` | 213 | 7366 |
| `src/lib/datasetIntegrityValidator.ts` | `.ts` | 780 | 33804 |
| `src/lib/editorialComparisonEngine.ts` | `.ts` | 1587 | 63637 |
| `src/lib/editorialExperienceAuditor.ts` | `.ts` | 94 | 4062 |
| `src/lib/goldenRegressionTest.ts` | `.ts` | 174 | 5262 |
| `src/lib/goldenTraversalFramework.ts` | `.ts` | 110 | 3618 |
| `src/lib/graphIntegrityValidator.ts` | `.ts` | 272 | 8721 |
| `src/lib/graphRegressionValidator.ts` | `.ts` | 200 | 7627 |
| `src/lib/graphValidator.ts` | `.ts` | 183 | 5494 |
| `src/lib/imageResolver.ts` | `.ts` | 92 | 2778 |
| `src/lib/metadataRefresh.ts` | `.ts` | 301 | 10477 |
| `src/lib/metadataVerifier.ts` | `.ts` | 256 | 8102 |
| `src/lib/narrativeSatisfactionAuditor.ts` | `.ts` | 127 | 5368 |
| `src/lib/plannerEngine.ts` | `.ts` | 135 | 4412 |
| `src/lib/policyCalibrationFramework.ts` | `.ts` | 172 | 4991 |
| `src/lib/preparationGuide.ts` | `.ts` | 33 | 1325 |
| `src/lib/recommendationCompletenessValidator.ts` | `.ts` | 400 | 14313 |
| `src/lib/recommendationConfidenceEngine.ts` | `.ts` | 54 | 1592 |
| `src/lib/recommendationService.ts` | `.ts` | 270 | 9490 |
| `src/lib/recommendationValidator.ts` | `.ts` | 203 | 6400 |
| `src/lib/relationshipRegistry.ts` | `.ts` | 197 | 6250 |
| `src/lib/reviewLifecycleValidator.ts` | `.ts` | 139 | 4887 |
| `src/lib/searchAnalyticsStore.ts` | `.ts` | 96 | 2535 |
| `src/lib/searchUtils.tsx` | `.tsx` | 81 | 2117 |
| `src/lib/storyGraphEngine.ts` | `.ts` | 702 | 26312 |
| `src/lib/storyKnowledgeGraphEngine.ts` | `.ts` | 1047 | 39412 |
| `src/lib/supabase.ts` | `.ts` | 18 | 883 |
| `src/lib/tmdb.ts` | `.ts` | 466 | 13594 |
| `src/lib/tmdbCache.ts` | `.ts` | 192 | 5444 |
| `src/lib/upcomingUtils.ts` | `.ts` | 246 | 7584 |
| `src/lib/usernameValidator.ts` | `.ts` | 100 | 2205 |
| `src/lib/utils.ts` | `.ts` | 244 | 8535 |
| `src/main.tsx` | `.tsx` | 17 | 426 |
| `src/pages/AdminPage.tsx` | `.tsx` | 218 | 9877 |
| `src/pages/AssistantPage.tsx` | `.tsx` | 355 | 15127 |
| `src/pages/CkgProposalReviewPage.tsx` | `.tsx` | 603 | 29969 |
| `src/pages/DevDiagnosticsPage.tsx` | `.tsx` | 1374 | 69753 |
| `src/pages/ForgotPasswordPage.tsx` | `.tsx` | 111 | 4197 |
| `src/pages/FranchisePage.tsx` | `.tsx` | 534 | 22322 |
| `src/pages/HomePage.tsx` | `.tsx` | 551 | 24835 |
| `src/pages/LoginPage.tsx` | `.tsx` | 213 | 8249 |
| `src/pages/MovieDetailPage.tsx` | `.tsx` | 289 | 12934 |
| `src/pages/NotFoundPage.tsx` | `.tsx` | 63 | 2237 |
| `src/pages/PlannerPage.tsx` | `.tsx` | 487 | 23278 |
| `src/pages/ProfilePage.tsx` | `.tsx` | 503 | 23953 |
| `src/pages/PublicProfilePage.tsx` | `.tsx` | 252 | 11062 |
| `src/pages/SearchPage.tsx` | `.tsx` | 1150 | 46808 |
| `src/pages/SignupPage.tsx` | `.tsx` | 276 | 11047 |
| `src/pages/UpcomingPage.tsx` | `.tsx` | 346 | 15252 |
| `src/policy/index.ts` | `.ts` | 12 | 392 |
| `src/policy/types.ts` | `.ts` | 50 | 1519 |
| `src/policy/v5.ts` | `.ts` | 76 | 3207 |
| `src/policy/v6.ts` | `.ts` | 90 | 3956 |
| `src/policy/v6_1.ts` | `.ts` | 134 | 4118 |
| `src/policy/v6_2.ts` | `.ts` | 141 | 4603 |
| `src/store/authStore.ts` | `.ts` | 172 | 4541 |
| `src/store/filterStore.ts` | `.ts` | 55 | 1589 |
| `src/store/plannerStore.ts` | `.ts` | 198 | 5475 |
| `src/store/profileStore.ts` | `.ts` | 28 | 910 |
| `src/store/settingsStore.ts` | `.ts` | 23 | 565 |
| `src/store/watchStore.ts` | `.ts` | 130 | 4251 |
| `src/types/ckgProposal.ts` | `.ts` | 87 | 2130 |
| `src/types/index.ts` | `.ts` | 308 | 9720 |
| `src/types/planner.ts` | `.ts` | 54 | 1125 |
| `src/types/preparation.ts` | `.ts` | 121 | 3127 |
| `src/types/recommendationService.ts` | `.ts` | 193 | 5068 |
| `src/vite-env.d.ts` | `.ts` | 13 | 276 |
| `src/__tests__/aiAdvisor.test.ts` | `.ts` | 103 | 6447 |
| `src/__tests__/authAndProfile.test.ts` | `.ts` | 203 | 9654 |
| `src/__tests__/browserImageAssertion.test.ts` | `.ts` | 117 | 5212 |
| `src/__tests__/franchiseCompleteness.test.ts` | `.ts` | 174 | 6548 |
| `src/__tests__/imageIntegrity.test.ts` | `.ts` | 131 | 5830 |
| `src/__tests__/lifecycleConsistency.test.ts` | `.ts` | 133 | 5819 |
| `src/__tests__/metadataRefresh.test.ts` | `.ts` | 338 | 15050 |
| `src/__tests__/metadataVerification.test.ts` | `.ts` | 185 | 7692 |
| `src/__tests__/recommendationCompleteness.test.ts` | `.ts` | 112 | 4184 |
| `src/__tests__/strictFranchiseIsolation.test.ts` | `.ts` | 172 | 7186 |
| `src/__tests__/upcomingReleases.test.ts` | `.ts` | 171 | 8035 |
| `supabase/migrations/20260813_auth_identity.sql` | `.sql` | 40 | 2045 |
| `supabase/schema.sql` | `.sql` | 275 | 15012 |
| `supabase/seed.sql` | `.sql` | 158 | 7815 |
| `tailwind.config.js` | `.js` | 63 | 1861 |
| `tsconfig.json` | `.json` | 27 | 685 |
| `vite.config.ts` | `.ts` | 24 | 494 |
