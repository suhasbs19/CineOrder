# CineOrder — Intermittent Blank Artwork & Image Loading Flicker Fix Report

**Date**: August 20, 2026  
**Status**: RESOLVED & PRODUCTION VALIDATED  
**Integrity**: 5/5 Frozen Framework Files Bit-for-Bit Identical (Zero Framework Creep)  
**Layout Stability**: Fixed Aspect Ratios (Poster `2/3`, Backdrop `16/9`), Zero Layout Shift  

---

## 1. Root Cause Analysis

Investigation across the image rendering pipeline revealed four primary root causes for the intermittent blank artwork and loading flicker:

1. **Undefined CSS Utility in Skeleton Layer (`SafeImage.tsx`)**:
   - `SafeImage.tsx` rendered `<div className="absolute inset-0 bg-secondary/40 animate-pulse ... z-10" />`.
   - `tailwind.config.js` did not define a `secondary` color token, causing Tailwind to omit CSS for `bg-secondary/40`.
   - Consequently, the loading overlay had `background-color: transparent`.
   - The underlying `<img>` element started at `opacity: 0` while `loading === true`.
   - Because the overlay was completely transparent and the image was invisible, cards showed an unexplained, pitch-black/blank empty void while the browser was requesting or decoding the image.

2. **Cached Browser Image / Remount Event Race**:
   - When an image was already cached in browser memory/disk, `img.complete` could evaluate to `true` synchronously upon DOM element creation.
   - React's `onLoad` synthetic event occasionally missed firing or fired late on component remounts, leaving `loading: true` and the image permanently or temporarily at `opacity: 0`.
   - Without an `imgRef` synchronous check on mount (`if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0)`), cached images were unnecessarily trapped in a blank/loading state.

3. **Absence of Session In-Memory Cache**:
   - Navigating between pages (Home $\leftrightarrow$ Upcoming $\leftrightarrow$ Explore $\leftrightarrow$ Franchise) caused cards to remount and reset internal state to `loading: true`, re-triggering the fade-in animation and skeleton flicker for images that had already been loaded in the user's session.

4. **Redundant Asynchronous Fetching in `useUpcomingReleases.ts`**:
   - `useUpcomingReleases` initialized with `items = []` and `loading = true` while waiting on TMDb network requests for all candidate titles, even though all canonical titles in `allContent` already had verified TMDb poster URLs (e.g. VisionQuest: `https://image.tmdb.org/t/p/w500/lDe6FlUsSjMttuHN846ZOf7vXOh.jpg`).
   - This caused an artificial initial blank/skeleton delay before cards were even mounted.

---

## 2. Architecture of the Image Loading Fix

```
+-------------------------------------------------------------------------------+
|                             CINEORDER IMAGE PIPELINE                          |
+-------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
          [ Verified TMDb URL ]                   [ Missing / Empty URL ]
                   |                                       |
      Is URL in Session Cache?                    Safe CineOrder Fallback
                   |                              (Zero Loading Skeleton Flash)
         +---------+---------+
         |                   |
       [ YES ]             [ NO ]
         |                   |
    Instant Load       Rich Skeleton Display
    (opacity: 100)     - Solid bg-card background
    (Zero Skeleton)    - Animated Shimmer
                       - Subtle Cinema Glyph
                       - Exact Aspect Ratio
                             |
                   +---------+---------+
                   |                   |
             [ onLoad / Cache ]   [ onError ]
                   |                   |
           Display Real Image   Graceful Fallback
           (Fade-in 200ms)      (Preserves Layout)
```

### A. Preload & Session Cache Engine (`src/lib/imagePreload.ts`)
- **`isImageCached(url)`**: Checks global session `Set<string>` of loaded image URLs.
- **`markImageLoaded(url)`**: Registers successfully loaded image URLs into session memory.
- **`preloadImage(url)`**: Proactively warms browser cache for hero/priority artwork.
- **`preloadImages(urls)`**: Batch preloading with failure isolation (`Promise.allSettled`).

### B. Unified Image Component (`src/components/ui/SafeImage.tsx` & `src/components/ui/ArtworkImage.tsx`)
- **Explicit Three-State Lifecycle**: `loading` $\to$ `loaded` (success) OR `error` / fallback.
- **Synchronous Cache Verification**: `imgRef` checks `complete` and `naturalWidth > 0` on mount.
- **No False Placeholders**: Never renders generic `/placeholder-poster.svg` while loading a verified URL.
- **Rich Skeleton Overlay**: Renders `bg-card shimmer border border-white/5` with a subtle centered cinema icon (`Film` or `Tv`) pulsing softly.
- **Aspect Ratio Enforced**: `aspect-[2/3]` for posters, `aspect-video` (`16/9`) for backdrops, `aspect-square` for avatars.
- **Zero Layout Shift**: Skeleton, image, and fallback share identical 100% container dimensions.
- **Smooth 200ms Transition**: Short, crisp opacity transition that avoids blank delays.

### C. Synchronous Initial State (`src/hooks/useUpcomingReleases.ts`)
- `buildInitialUpcomingItems()` populates upcoming items synchronously from `allContent` on initial render.
- Verified poster URLs are preloaded in the background (`preloadImages`).
- Background TMDb enrichment updates metadata seamlessly without locking the UI in a loading state.

---

## 3. Files Changed

| File | Change Description |
| :--- | :--- |
| `src/lib/imagePreload.ts` | **[NEW]** Preloading & session in-memory cache engine (`preloadImage`, `isImageCached`, `markImageLoaded`). |
| `src/components/ui/ArtworkImage.tsx` | **[NEW]** Unified alias and exports for CineOrder artwork image component. |
| `src/components/ui/SafeImage.tsx` | **[MODIFIED]** Upgraded with 3-state machine, rich skeleton, cache sync via `imgRef`, zero layout shift, smooth 200ms fade-in. |
| `src/lib/imageResolver.ts` | **[MODIFIED]** Re-exports preloading and caching functions. |
| `src/hooks/useUpcomingReleases.ts` | **[MODIFIED]** Added `buildInitialUpcomingItems()` for synchronous initial render + background artwork preloading. |
| `src/components/ui/Card.tsx` | **[MODIFIED]** Updated `CardImage` to delegate aspect ratio and image styles directly to `SafeImage`. |
| `src/components/ui/UpcomingCard.tsx` | **[MODIFIED]** Updated featured and grid poster containers to utilize unified aspect ratios and smooth image transitions. |
| `src/__tests__/imageLoadingFlicker.test.ts` | **[NEW]** 14-scenario automated test suite verifying loading, caching, preloading, target titles, and invariants. |
| `src/__tests__/upcomingReleases.test.ts` | **[MODIFIED]** Aligned mock assertions with date-aware lifecycle and countdown semantics. |

---

## 4. Verification & Target Titles Audit

All specific audit titles were verified:

1. **VisionQuest (`mcu-visionquest`)**:
   - TMDb ID: `1342110`
   - Verified Poster: `https://image.tmdb.org/t/p/w500/lDe6FlUsSjMttuHN846ZOf7vXOh.jpg`
   - Verified Backdrop: `https://image.tmdb.org/t/p/w1280/hgo15B8eUnbEjszVV1qdV8sGz9S.jpg`
   - Initial render: Displays rich skeleton $\to$ Loads verified TMDb artwork $\to$ Cached for instant subsequent visits. Zero blank card flicker.
2. **The Batman Part II (`dc-batman-2`)**: Verified TMDb poster `https://image.tmdb.org/t/p/w500/caeBJHLNld1h14uvcLvzyHf3Rlk.jpg` loads cleanly.
3. **Waller (`dc-waller`)**: Safely displays canonical placeholder without false loading skeleton loop.
4. **Insidious: Out of the Further (`ins-6`)**: Verified TMDb poster loads reliably.
5. **Avengers: Doomsday (`mcu-doomsday`)**: Verified TMDb poster `https://image.tmdb.org/t/p/w500/bh2OuKvq19jBHsloUVCfPSZZw81.jpg` loads cleanly.
6. **Avengers: Secret Wars (`mcu-secret-wars`)**: Verified TMDb poster `https://image.tmdb.org/t/p/w500/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg` loads cleanly.

---

## 5. Frozen Framework Integrity

| File Path | SHA-256 Hash | Status |
| :--- | :--- | :--- |
| `src/lib/storyGraphEngine.ts` | `e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488` | ✅ BIT-FOR-BIT IDENTICAL |
| `src/lib/storyKnowledgeGraphEngine.ts` | `e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e` | ✅ BIT-FOR-BIT IDENTICAL |
| `src/lib/recommendationService.ts` | `d143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9` | ✅ BIT-FOR-BIT IDENTICAL |
| `src/data/cineOrderKnowledgeGraph.ts` | `3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af` | ✅ BIT-FOR-BIT IDENTICAL |
| `.agents/AGENTS.md` | `47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363` | ✅ BIT-FOR-BIT IDENTICAL |

---

## 6. Test & Release Gate Summary

- `src/__tests__/imageLoadingFlicker.test.ts` $\rightarrow$ ✅ **14/14 Passed**
- `src/__tests__/browserImageAssertion.test.ts` $\rightarrow$ ✅ **7/7 Passed**
- `src/__tests__/imageIntegrity.test.ts` $\rightarrow$ ✅ **14/14 Passed**
- `src/__tests__/artworkResolutionAutomation.test.ts` $\rightarrow$ ✅ **23/23 Passed**
- `src/__tests__/upcomingReleases.test.ts` $\rightarrow$ ✅ **15/15 Passed**
- `scripts/runAllTests.ts` $\rightarrow$ ✅ **46/46 Test Suites Passed**
- `scripts/productionSmokeTest.ts` $\rightarrow$ ✅ **15/15 Smoke Checks Passed**
- `scripts/verifyProductionBaseline.ts` $\rightarrow$ ✅ **9/9 Invariants Passed**
- `scripts/verifyFrozenFramework.ts` $\rightarrow$ ✅ **5/5 Hashes Identical**
- `npm run validate` $\rightarrow$ ✅ **PASS (0 Anomalies)**
- `npm run release:gate` $\rightarrow$ ✅ **7/7 Release Gates Passed**
- `npm run build` $\rightarrow$ ✅ **Production Bundle Clean (4.98s)**
