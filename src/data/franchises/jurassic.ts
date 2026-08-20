import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { titleNodes, storyEdges, type StoryEdge, type TitleNode } from '@/data/cineOrderKnowledgeGraph';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const jurassicParkFranchise: Franchise = {
  id: 'jurassic-park',
  name: 'Jurassic Park',
  slug: 'jurassic-park',
  description: 'The Jurassic Park and Jurassic World franchise chronicles the scientific resurrection of dinosaurs and the chaotic, awe-inspiring struggle for coexistence between mankind and prehistoric creatures.',
  poster_url: 'https://image.tmdb.org/t/p/w500/9i3plLl89DHMz7mahksDaAo7HIS.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/9e3y2n57n84e3W92x9h4n55K.jpg',
  tmdb_collection_id: 328,
  total_movies: 7,
  total_series: 2,
  total_runtime: 1064,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const jurassicParkContent: Content[] = [
  buildContent({
    id: 'jp-1',
    franchise_id: 'jurassic-park',
    tmdb_id: 329,
    title: 'Jurassic Park',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/63viWuPfYQjRYLSZSZNq7dglJP5.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'A wealthy entrepreneur secretly creates a theme park featuring living dinosaurs drawn from prehistoric DNA. Before opening day, he invites a team of experts and his two eager grandchildren to experience the park and help calm anxious investors.',
    release_date: '1993-06-11',
    runtime: 127,
    rating: 8.0,
    director: 'Steven Spielberg',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-2',
    franchise_id: 'jurassic-park',
    tmdb_id: 330,
    title: 'The Lost World: Jurassic Park',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/7st3JW0xpMAkwB3dYfv3iqAwD8Y.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Four years after Jurassic Park\'s genetically bred dinosaurs ran amok, multimillionaire John Hammond shocks chaos theorist Ian Malcolm by revealing that he has been breeding more beasties at a secret island location.',
    release_date: '1997-05-23',
    runtime: 129,
    rating: 6.5,
    director: 'Steven Spielberg',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-3',
    franchise_id: 'jurassic-park',
    tmdb_id: 331,
    title: 'Jurassic Park III',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/oQXj4NUfS3r3gHXtDOzcJgj1lLc.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'In need of funds for research, Dr. Alan Grant accepts a large sum of money to accompany Paul and Amanda Kirby on an aerial tour of the infamous Isla Sorna.',
    release_date: '2001-07-18',
    runtime: 92,
    rating: 6.1,
    director: 'Joe Johnston',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-4',
    franchise_id: 'jurassic-park',
    tmdb_id: 135397,
    title: 'Jurassic World',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/rhr4y79GpxQF9IsfJItRXVaoGs4.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Twenty-two years after the events of Jurassic Park, Isla Nublar now features a fully functioning dinosaur theme park, Jurassic World, as originally envisioned by John Hammond.',
    release_date: '2015-06-12',
    runtime: 124,
    rating: 6.7,
    director: 'Colin Trevorrow',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-5',
    franchise_id: 'jurassic-park',
    tmdb_id: 351286,
    title: 'Jurassic World: Fallen Kingdom',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/x2Us3jR6ToMJjbcPbLimYoxf6xr.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Three years after the destruction of the Jurassic World theme park, Owen Grady and Claire Dearing return to the island of Isla Nublar to save the remaining dinosaurs from a volcano that\'s about to erupt.',
    release_date: '2018-06-22',
    runtime: 128,
    rating: 6.5,
    director: 'J.A. Bayona',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-camp-cretaceous',
    franchise_id: 'jurassic-park',
    tmdb_id: 93741,
    title: 'Jurassic World: Camp Cretaceous',
    type: 'series',
    poster_url: 'https://image.tmdb.org/t/p/w500/pwte1p4ZySI1qAVSVdSTRKjuIAa.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Six teens attending an adventure camp on the opposite side of Isla Nublar must band together to survive when dinosaurs wreak havoc on the island.',
    release_date: '2020-09-18',
    runtime: 24,
    episode_count: 49,
    season_count: 5,
    rating: 7.9,
    providers: ['Netflix'],
  }),
  buildContent({
    id: 'jp-6',
    franchise_id: 'jurassic-park',
    tmdb_id: 507086,
    title: 'Jurassic World Dominion',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/jbAvCACjLf1ZG0unB2tdmx5HAf1.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Four years after Isla Nublar was destroyed, dinosaurs now live—and hunt—alongside humans all over the world.',
    release_date: '2022-06-10',
    runtime: 147,
    rating: 6.5,
    director: 'Colin Trevorrow',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-7-rebirth',
    franchise_id: 'jurassic-park',
    tmdb_id: 1234821,
    title: 'Jurassic World Rebirth',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/1RICxzeoNCAO5NpcRMIgg1XT6fm.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Five years after the events of Jurassic World Dominion, an expedition braves isolated equatorial regions to extract DNA from the three most colossal creatures left across land, sea and air.',
    release_date: '2025-07-02',
    runtime: 130,
    rating: 7.0,
    status: 'released',
    director: 'Gareth Edwards',
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jp-chaos-theory',
    franchise_id: 'jurassic-park',
    tmdb_id: 237512,
    title: 'Jurassic World: Chaos Theory',
    type: 'series',
    poster_url: 'https://image.tmdb.org/t/p/w500/c2Od0cY2IeayDj5osUxZSAD1QK.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/qjPC0KYEhdWAIPmCtAkg0j1iJXC.jpg',
    overview: 'Six years after the events of Camp Cretaceous, the members of the Nublar Six struggle to find their footing off the islands, navigating a world now filled with dinosaurs and people who want to hurt them.',
    release_date: '2024-05-24',
    theatrical_release_date: '2024-05-24',
    runtime: 24,
    rating: 8.1,
    status: 'released',
    theatrical_released: true,
    ott_available: false,
    digital_available: false,
    subscription_streaming_available: false,
    providers: ['Netflix'],
  }),
];

const jpExtraTitleNodes: Record<string, TitleNode> = {
  'jp-chaos-theory': {
    id: 'jp-chaos-theory',
    title: 'Jurassic World: Chaos Theory',
    type: 'tv-series',
    releaseDate: '2024-05-24',
    universe: 'Jurassic Park',
    characters: ['Darius Bowman', 'Ben Pincus', 'Yaz Fadoula', 'Sammy Gutierrez', 'Brooklynn', 'Kenji Kon'],
    villains: ['Broker Syndicate', 'Atrociraptor Handlers'],
    organizations: ['DPW (Department of Prehistoric Wildlife)'],
    objects: ['Dinosaur Tracking Beacon'],
    storyArcs: ['Nublar Six Conspiracy'],
    spoilerFreeContext: 'The Nublar Six reunite six years later to unravel a global dinosaur conspiracy.',
  },
};

const jpExtraStoryEdges: StoryEdge[] = [
  {
    sourceId: 'jp-camp-cretaceous',
    targetId: 'jp-chaos-theory',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct sequel series following the Nublar Six six years after their rescue from Isla Nublar.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct continuation following the Nublar Six characters from Camp Cretaceous.',
      detailedReasons: [
        'Essential for understanding the bond, trauma, and character dynamics of Darius, Ben, Yaz, Sammy, Kenji, and Brooklynn.',
        'Directly continues the storyline six years after their escape from Isla Nublar.',
      ],
      source: 'editorial',
    },
  },
];

for (const [key, node] of Object.entries(jpExtraTitleNodes)) {
  if (!titleNodes[key]) {
    titleNodes[key] = node;
  }
}

for (const edge of jpExtraStoryEdges) {
  const exists = storyEdges.some(
    (e) => e.sourceId === edge.sourceId && e.targetId === edge.targetId && e.relationship === edge.relationship
  );
  if (!exists) {
    storyEdges.push(edge);
  }
}

const sortedJurassicForRelease = [...jurassicParkContent].sort(compareReleaseDates);

export const jurassicParkWatchOrders: WatchOrder[] = sortedJurassicForRelease.map((item, index) =>
  buildWatchOrder({
    id: `jp-rel-${index + 1}`,
    franchise_id: 'jurassic-park',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat(
  sortedJurassicForRelease.map((item, index) =>
    buildWatchOrder({
      id: `jp-chr-${index + 1}`,
      franchise_id: 'jurassic-park',
      content_id: item.id,
      order_type: 'chronological',
      position: index + 1,
    })
  )
).concat(
  jurassicParkContent.map((item, index) =>
    buildWatchOrder({
      id: `jp-rec-${index + 1}`,
      franchise_id: 'jurassic-park',
      content_id: item.id,
      order_type: 'recommended',
      position: index + 1,
    })
  )
);

export const franchise = jurassicParkFranchise;
export const jurassicFranchise = jurassicParkFranchise;
export const content = jurassicParkContent;
export const jurassicContent = jurassicParkContent;
export const watchOrders = jurassicParkWatchOrders;
export const jurassicWatchOrders = jurassicParkWatchOrders;
export const releaseOrder: WatchOrder[] = jurassicParkWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = jurassicParkWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = jurassicParkWatchOrders.filter((o) => o.order_type === 'recommended');
