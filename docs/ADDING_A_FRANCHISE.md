# CineOrder — Canonical Guide: Adding a New Franchise

This document serves as the authoritative, step-by-step developer specification for adding a new movie/TV franchise to CineOrder.

---

## 1. Architectural Overview

CineOrder is a **data-driven** cinematic universe platform. Adding a new franchise requires **only supplying canonical data** and does **not** require modifying runtime traversal engines or building custom UI components.

The application automatically handles:
- Franchise hub rendering (`/franchise/:slug`)
- Multi-order watch sequencing (Release, Chronological, Recommended)
- Interactive Story Graph Preparation Guides
- Target selection in the Planner (`/planner`)
- Global Search discovery (`/search`)
- Lifecycle tracking & countdowns (`/upcoming`)
- Image resolution & fallback protection
- Global release gate verification

---

## 2. Step-by-Step Franchise Integration Workflow

### STEP 1: Create the Franchise Module
Create a new TypeScript file at:
```
src/data/franchises/<slug>.ts
```
*(e.g., `src/data/franchises/matrix.ts`)*

Use the `buildContent` and `buildWatchOrder` helpers from `./utils` to define:
1. `franchise`: Canonical metadata implementing `Franchise`
2. `content`: Array of catalog items implementing `Content[]`
3. `watchOrders`: Array of sequence entries implementing `WatchOrder[]`
4. Standard exports: `franchise`, `content`, `watchOrders`, `releaseOrder`, `chronologicalOrder`, `recommendedOrder`

---

### STEP 2: Create the Vector Logo Asset
Create an SVG vector logo at:
```
public/logos/<slug>.svg
```
*(e.g., `public/logos/matrix.svg`)*

Standard SVG dimensions: `viewBox="0 0 320 80"` with clean typography or vectorized emblem.

---

### STEP 3: Register in the Central Franchise Registry
In `src/data/franchises/index.ts`:
1. Import the new franchise module:
   ```typescript
   import { matrixFranchise, matrixContent, matrixWatchOrders } from './matrix';
   ```
2. Spread into `allFranchises`, `allContent`, and `allWatchOrders`:
   ```typescript
   export const allFranchises: Franchise[] = [
     // ...
     matrixFranchise,
   ];

   export const allContent: Content[] = [
     // ...
     ...matrixContent,
   ];

   export const allWatchOrders: WatchOrder[] = [
     // ...
     ...matrixWatchOrders,
   ];
   ```

---

### STEP 4: Append Knowledge Graph Data
In `src/data/cineOrderKnowledgeGraph.ts`:

#### A. Append `TitleNode` Definitions to `titleNodes`:
```typescript
  'matrix-1': {
    id: 'matrix-1',
    title: 'The Matrix',
    type: 'movie',
    releaseDate: '1999-03-31',
    universe: 'The Matrix',
    saga: 'Matrix Trilogy',
    characters: ['Neo (Thomas Anderson)', 'Trinity', 'Morpheus'],
    villains: ['Agent Smith'],
    organizations: ['Zion Resistance', 'The Machines'],
    objects: ['Red Pill', 'Nebuchadnezzar'],
    storyArcs: ['The One Awakening'],
    spoilerFreeContext: 'Launches the Matrix universe. Excellent standalone entry point.',
    isEntryPoint: true,
    reviewStatus: 'canonical',
  },
  'matrix-2': {
    id: 'matrix-2',
    title: 'The Matrix Reloaded',
    type: 'movie',
    releaseDate: '2003-05-15',
    universe: 'The Matrix',
    saga: 'Matrix Trilogy',
    characters: ['Neo', 'Trinity', 'Morpheus', 'The Architect'],
    villains: ['Agent Smith (Rogue)', 'The Merovingian'],
    organizations: ['Zion Council'],
    objects: ['Keymaker Key'],
    storyArcs: ['Zion Defense & Source Quest'],
    spoilerFreeContext: 'Direct sequel following Neo and Zion preparing for machine invasion.',
    isEntryPoint: false,
    reviewStatus: 'canonical',
  },
```

#### B. Append `StoryEdge` Definitions to `storyEdges`:
```typescript
  {
    sourceId: 'matrix-1',
    targetId: 'matrix-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel continuing Neo\'s journey as The One six months after the first film.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct continuation establishing Neo as The One before Matrix Reloaded.',
      detailedReasons: [
        'Explains how Thomas Anderson freed his mind and unlocked powers inside the Matrix.',
        'Establishes the threat of the Machine army tunneling toward Zion.',
      ],
      source: 'editorial',
    },
  },
```

---

### STEP 5 (Optional / Recommended): Register Canonical Artwork Lock
In `src/data/franchiseArtwork.ts`, add explicit collection poster/banner mapping to `franchiseArtworkMap`:
```typescript
  'matrix': {
    franchise_id: 'matrix',
    poster: 'https://image.tmdb.org/t/p/w500/...jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/...jpg',
    logo: '/logos/matrix.svg',
  },
```

In `scripts/verifyFranchiseVisualIdentity.ts`, add the permanent regression lock to `CANONICAL_FRANCHISE_IDENTITIES`:
```typescript
  'matrix': {
    id: 'matrix',
    name: 'The Matrix',
    tmdbCollectionId: 2344,
    canonicalPosterHash: '...jpg',
    canonicalBannerHash: '...jpg',
    canonicalLogoPath: '/logos/matrix.svg',
    knownForbiddenPosterHashes: ['...jpg'],
  },
```

---

## 3. Copy-Pasteable Franchise Template

```typescript
// src/data/franchises/<slug>.ts
import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';

export const exampleFranchise: Franchise = {
  id: 'example-slug',
  name: 'Example Universe',
  slug: 'example-slug',
  description: 'An official overview describing the overarching universe.',
  poster_url: 'https://image.tmdb.org/t/p/w500/collection-poster.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/collection-backdrop.jpg',
  tmdb_collection_id: 12345,
  total_movies: 2,
  total_series: 0,
  total_runtime: 240,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const exampleContent: Content[] = [
  buildContent({
    id: 'example-1',
    franchise_id: 'example-slug',
    tmdb_id: 101,
    title: 'Example: Chapter One',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/movie1-poster.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/movie1-backdrop.jpg',
    overview: 'Synopsis for the first movie.',
    release_date: '2010-06-01',
    runtime: 120,
    rating: 7.8,
    director: 'Director Name',
    cast: [
      { name: 'Lead Actor', character: 'Protagonist', profile_url: 'https://image.tmdb.org/t/p/w185/actor1.jpg' },
    ],
    providers: ['Max', 'Prime Video'],
    status: 'released',
    metadata_checked_at: new Date().toISOString(),
  }),
  buildContent({
    id: 'example-2',
    franchise_id: 'example-slug',
    tmdb_id: 102,
    title: 'Example: Chapter Two',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/movie2-poster.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/movie2-backdrop.jpg',
    overview: 'Synopsis for the second movie.',
    release_date: '2013-06-01',
    runtime: 120,
    rating: 7.5,
    director: 'Director Name',
    cast: [
      { name: 'Lead Actor', character: 'Protagonist', profile_url: 'https://image.tmdb.org/t/p/w185/actor1.jpg' },
    ],
    providers: ['Max', 'Prime Video'],
    status: 'released',
    metadata_checked_at: new Date().toISOString(),
  }),
];

export const exampleWatchOrders: WatchOrder[] = [
  // Release Order
  buildWatchOrder({ id: 'wo-example-rel-1', franchise_id: 'example-slug', content_id: 'example-1', order_type: 'release', position: 1 }),
  buildWatchOrder({ id: 'wo-example-rel-2', franchise_id: 'example-slug', content_id: 'example-2', order_type: 'release', position: 2 }),

  // Chronological Order
  buildWatchOrder({ id: 'wo-example-chr-1', franchise_id: 'example-slug', content_id: 'example-1', order_type: 'chronological', position: 1, notes: 'Chronological start.' }),
  buildWatchOrder({ id: 'wo-example-chr-2', franchise_id: 'example-slug', content_id: 'example-2', order_type: 'chronological', position: 2, notes: 'Direct continuation.' }),

  // Recommended Order
  buildWatchOrder({ id: 'wo-example-rec-1', franchise_id: 'example-slug', content_id: 'example-1', order_type: 'recommended', position: 1 }),
  buildWatchOrder({ id: 'wo-example-rec-2', franchise_id: 'example-slug', content_id: 'example-2', order_type: 'recommended', position: 2 }),
];

export const franchise = exampleFranchise;
export const content = exampleContent;
export const watchOrders = exampleWatchOrders;
export const releaseOrder: WatchOrder[] = exampleWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = exampleWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = exampleWatchOrders.filter((o) => o.order_type === 'recommended');
```

---

## 4. Frozen Framework Invariant Rules

Under the CineOrder Framework Freeze Directive (`.agents/AGENTS.md`), the following files must **never be modified**:
- `src/lib/storyGraphEngine.ts`
- `src/lib/storyKnowledgeGraphEngine.ts`
- `src/lib/recommendationEngine.ts`
- `src/lib/recommendationService.ts`
- `src/lib/narrativeScoring.ts`
- `.agents/AGENTS.md`

Adding a franchise is strictly an extension of **Graph Data** (`src/data/cineOrderKnowledgeGraph.ts`), not Graph Code.

---

## 5. Verification Suite & Release Gate Commands

Run the full validation suite whenever a new franchise is added:

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Production Build
npm run build

# 3. Release Gate (7 Automated Gates)
npm run release:gate

# 4. Recommendation & Dataset Integrity Validation
npm run validate

# 5. Franchise Completeness Audit
npx tsx src/__tests__/franchiseCompleteness.test.ts

# 6. Lifecycle Consistency Audit
npx tsx src/__tests__/lifecycleConsistency.test.ts

# 7. Image Integrity Suite
npx tsx src/__tests__/imageIntegrity.test.ts

# 8. Visual Identity Regression Lock
npx tsx scripts/verifyFranchiseVisualIdentity.ts

# 9. Rendered Cards DOM Test
npx tsx scripts/verifyRenderedCardsDom.ts

# 10. Editorial Accuracy & Drift Comparison
npx tsx scripts/runEditorialComparison.ts
```
