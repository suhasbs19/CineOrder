import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { titleNodes, storyEdges, type StoryEdge, type TitleNode } from '@/data/cineOrderKnowledgeGraph';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const spidermanFranchise: Franchise = {
  id: 'spider-man',
  name: 'Spider-Man',
  slug: 'spider-man',
  description:
    'The complete cinematic journey of Spider-Man across the Sam Raimi Trilogy, Marc Webb Amazing Spider-Man films, and the Academy Award-winning animated Spider-Verse saga.',
  poster_url: 'https://image.tmdb.org/t/p/w500/gh4c2ubi14WogAhvCDvceFkexIF.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/sWvxBXviRvmOpNq6rLShyW25b42.jpg',
  tmdb_collection_id: null,
  total_movies: 8,
  total_series: 0,
  total_runtime: 922,
  status: 'active',
  created_at: '2026-08-16T00:00:00.000Z',
  updated_at: '2026-08-16T00:00:00.000Z',
};

export const spidermanContent: Content[] = [
  // ─── Sam Raimi Trilogy (2002–2007) ──────────────────────────────────────────
  buildContent({
    id: 'spiderman-1',
    franchise_id: 'spider-man',
    tmdb_id: 557,
    title: 'Spider-Man',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/gh4c2ubi14WogAhvCDvceFkexIF.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/sWvxBXviRvmOpNq6rLShyW25b42.jpg',
    overview:
      'After being bitten by a genetically altered spider, nerdy high school student Peter Parker is endowed with amazing superpowers to fight crime as Spider-Man while confronting the menacing Green Goblin.',
    release_date: '2002-05-03',
    runtime: 121,
    rating: 7.3,
    director: 'Sam Raimi',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'spiderman-2',
    franchise_id: 'spider-man',
    tmdb_id: 558,
    title: 'Spider-Man 2',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/olxpyq94zl2TaIOJUy0Bgc9yiY2.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/6MQmtWk4mf04kuCw28obU6JQOr.jpg',
    overview:
      'Peter Parker struggles to balance his crime-fighting duties with his personal relationships as he faces the brilliant Dr. Otto Octavius, who has become the dangerous Doctor Octopus.',
    release_date: '2004-06-30',
    runtime: 127,
    rating: 7.5,
    director: 'Sam Raimi',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'spiderman-3',
    franchise_id: 'spider-man',
    tmdb_id: 559,
    title: 'Spider-Man 3',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/2jLxvdcaFVsQsmUBgvaNuuGQqc3.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/7e8F6B2fGvW21s0WkLg1T6CgQ3U.jpg',
    overview:
      'Peter Parker bonds with an alien symbiote that enhances his abilities while amplifying his anger, as he faces the tragic Flint Marko (Sandman), Harry Osborn, and Eddie Brock (Venom).',
    release_date: '2007-05-04',
    runtime: 139,
    rating: 6.4,
    director: 'Sam Raimi',
    providers: ['Disney+'],
  }),

  // ─── Marc Webb Dilogy (2012–2014) ───────────────────────────────────────────
  buildContent({
    id: 'amazing-spiderman-1',
    franchise_id: 'spider-man',
    tmdb_id: 1930,
    title: 'The Amazing Spider-Man',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/fSbkkpA9p1rWpQ1pZ1gG1wDkQ3.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/uTpA3u5QoQ1kR4vO4FvQ1xQ3.jpg',
    overview:
      'Peter Parker tries to uncover the mystery of his parents disappearance, leading him to Oscorp and his father former partner, Dr. Curt Connors, who transforms into the mutated Lizard.',
    release_date: '2012-07-03',
    runtime: 136,
    rating: 6.7,
    director: 'Marc Webb',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'amazing-spiderman-2',
    franchise_id: 'spider-man',
    tmdb_id: 102382,
    title: 'The Amazing Spider-Man 2',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/c3e9BfQ4L1yO4t6e5u2T9sWv8s.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/t5kK4Uu1kR4vO4FvQ1xQ3b2.jpg',
    overview:
      'Peter Parker confronts powerful new enemies including Max Dillon (Electro) and Harry Osborn (Green Goblin) while grappling with the protection of Gwen Stacy.',
    release_date: '2014-05-02',
    runtime: 142,
    rating: 6.5,
    director: 'Marc Webb',
    providers: ['Disney+'],
  }),

  // ─── Sony Pictures Animation Spider-Verse (2018–Present) ────────────────────
  buildContent({
    id: 'spider-verse-1',
    franchise_id: 'spider-man',
    tmdb_id: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    type: 'animated',
    poster_url: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/7d6AOdVgG9yG9rZ7Dk1j5xQ9.jpg',
    overview:
      'Brooklyn teenager Miles Morales is bitten by a radioactive spider and must team up with five alternate-dimension Spider-Heroes to stop Kingpin from destroying all reality.',
    release_date: '2018-12-14',
    runtime: 117,
    rating: 8.4,
    director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'spider-verse-2',
    franchise_id: 'spider-man',
    tmdb_id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'animated',
    poster_url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    overview:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence, and finds himself at odds with their leader, Miguel O\'Hara.',
    release_date: '2023-06-02',
    runtime: 140,
    rating: 8.4,
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'spider-verse-3',
    franchise_id: 'spider-man',
    tmdb_id: 911916,
    title: 'Spider-Man: Beyond the Spider-Verse',
    type: 'animated',
    poster_url: 'https://image.tmdb.org/t/p/w500/9KAe39xqyZnv9J4W3DRGdQqX82h.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/7tT2w75p69nll5PvALpWFCYx5dU.jpg',
    overview:
      'Hunted by Miguel O\'Hara\'s Spider Society and betrayed by his friends, Miles Morales ventures across the darkest reaches of the Multiverse to save his family and reunite everything he holds most dear in the conclusion of the Spider-Verse trilogy.',
    release_date: 'TBA',
    runtime: 140,
    rating: 8.5,
    status: 'upcoming',
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    providers: [],
  }),
];

const sortedSpiderForRelease = [...spidermanContent].sort(compareReleaseDates);

export const spidermanWatchOrders: WatchOrder[] = sortedSpiderForRelease.map((item, index) =>
  buildWatchOrder({
    id: `spiderman-rel-${index + 1}`,
    franchise_id: 'spider-man',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat(
  sortedSpiderForRelease.map((item, index) =>
    buildWatchOrder({
      id: `spiderman-chr-${index + 1}`,
      franchise_id: 'spider-man',
      content_id: item.id,
      order_type: 'chronological',
      position: index + 1,
    })
  )
).concat(
  spidermanContent.map((item, index) =>
    buildWatchOrder({
      id: `spiderman-rec-${index + 1}`,
      franchise_id: 'spider-man',
      content_id: item.id,
      order_type: 'recommended',
      position: index + 1,
    })
  )
);

export const franchise = spidermanFranchise;
export const content = spidermanContent;
export const watchOrders = spidermanWatchOrders;
export const releaseOrder: WatchOrder[] = spidermanWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = spidermanWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = spidermanWatchOrders.filter((o) => o.order_type === 'recommended');

// ─── Knowledge Graph In-Memory Registration for Spider-Man Legacy ────────────
const spiderTitleNodes: Record<string, TitleNode> = {
  'spiderman-1': {
    id: 'spiderman-1',
    title: 'Spider-Man',
    type: 'movie',
    releaseDate: '2002-05-03',
    universe: 'Raimi-Verse',
    characters: ['Peter Parker', 'Mary Jane Watson', 'Harry Osborn'],
    villains: ['Green Goblin (Norman Osborn)'],
    organizations: ['Daily Bugle', 'Oscorp'],
    objects: ['Goblin Glider', 'Pumpkin Bombs'],
    storyArcs: ['Raimi Spider-Man Trilogy', 'Norman Osborn Green Goblin Arc'],
    spoilerFreeContext: 'Sam Raimi classic origin story introducing Tobey Maguire Peter Parker.',
  },
  'spiderman-2': {
    id: 'spiderman-2',
    title: 'Spider-Man 2',
    type: 'movie',
    releaseDate: '2004-06-30',
    universe: 'Raimi-Verse',
    characters: ['Peter Parker', 'Mary Jane Watson', 'Harry Osborn', 'Doctor Otto Octavius'],
    villains: ['Doctor Octopus (Otto Octavius)'],
    organizations: ['Daily Bugle', 'Oscorp'],
    objects: ['Mechanical Tentacles', 'Fusion Reactor'],
    storyArcs: ['Raimi Spider-Man Trilogy', 'Otto Octavius Redemption Arc'],
    spoilerFreeContext: 'Peter Parker struggles with superhero burden and faces Doctor Octopus.',
  },
  'spiderman-3': {
    id: 'spiderman-3',
    title: 'Spider-Man 3',
    type: 'movie',
    releaseDate: '2007-05-04',
    universe: 'Raimi-Verse',
    characters: ['Peter Parker', 'Mary Jane Watson', 'Harry Osborn', 'Flint Marko'],
    villains: ['Sandman (Flint Marko)', 'Venom (Eddie Brock)', 'New Goblin'],
    organizations: ['Daily Bugle'],
    objects: ['Alien Symbiote Suit'],
    storyArcs: ['Raimi Spider-Man Trilogy', 'Sandman Origin Arc'],
    spoilerFreeContext: 'Peter Parker faces Sandman and the symbiote suit in trilogy climax.',
  },
  'amazing-spiderman-1': {
    id: 'amazing-spiderman-1',
    title: 'The Amazing Spider-Man',
    type: 'movie',
    releaseDate: '2012-07-03',
    universe: 'Webb-Verse',
    characters: ['Peter Parker', 'Gwen Stacy', 'Dr. Curt Connors'],
    villains: ['The Lizard (Dr. Curt Connors)'],
    organizations: ['Oscorp'],
    objects: ['Lizard Serum', 'Web Shooters'],
    storyArcs: ['Amazing Spider-Man Dilogy', 'Curt Connors Lizard Arc'],
    spoilerFreeContext: 'Marc Webb reboot starring Andrew Garfield as Peter Parker battling Lizard.',
  },
  'amazing-spiderman-2': {
    id: 'amazing-spiderman-2',
    title: 'The Amazing Spider-Man 2',
    type: 'movie',
    releaseDate: '2014-05-02',
    universe: 'Webb-Verse',
    characters: ['Peter Parker', 'Gwen Stacy', 'Max Dillon', 'Harry Osborn'],
    villains: ['Electro (Max Dillon)', 'Green Goblin (Harry Osborn)'],
    organizations: ['Oscorp', 'Ravencroft'],
    objects: ['Electrical Grid Containment'],
    storyArcs: ['Amazing Spider-Man Dilogy', 'Max Dillon Electro Arc'],
    spoilerFreeContext: 'Andrew Garfield Peter Parker faces Electro and suffers the tragic loss of Gwen Stacy.',
  },
  'spider-verse-1': {
    id: 'spider-verse-1',
    title: 'Spider-Man: Into the Spider-Verse',
    type: 'movie',
    releaseDate: '2018-12-14',
    universe: 'Spider-Verse',
    characters: ['Miles Morales', 'Peter B. Parker', 'Gwen Stacy', 'Kingpin'],
    villains: ['Kingpin (Wilson Fisk)', 'Prowler (Aaron Davis)', 'Doc Ock (Olivia Octavius)'],
    organizations: ['Spider-Society'],
    objects: ['Super Collider', 'Goober USB Drive'],
    storyArcs: ['Spider-Verse Animated Saga', 'Miles Morales Origin'],
    spoilerFreeContext: 'Miles Morales becomes Spider-Man and meets heroes across alternate dimensions.',
  },
  'spider-verse-2': {
    id: 'spider-verse-2',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    releaseDate: '2023-06-02',
    universe: 'Spider-Verse',
    characters: ['Miles Morales', 'Gwen Stacy', 'Miguel O\'Hara', 'The Spot', 'Peter B. Parker'],
    villains: ['The Spot', 'Miguel O\'Hara'],
    organizations: ['Spider-Society'],
    objects: ['Daypass Dimensional Gizmo', 'Go-Home Machine'],
    storyArcs: ['Spider-Verse Animated Saga', 'Canon Event Crisis'],
    spoilerFreeContext: 'Miles Morales travels the Multiverse and clashes with Spider-Society over canon events.',
  },
  'spider-verse-3': {
    id: 'spider-verse-3',
    title: 'Spider-Man: Beyond the Spider-Verse',
    type: 'movie',
    releaseDate: 'TBA',
    universe: 'Spider-Verse',
    characters: ['Miles Morales', 'Gwen Stacy', 'Peter B. Parker', 'Miguel O\'Hara'],
    villains: ['The Spot', 'Miguel O\'Hara'],
    organizations: ['Spider-Society'],
    objects: ['Daypass Dimensional Gizmo'],
    storyArcs: ['Spider-Verse Animated Saga', 'Multiverse Resolution Climax'],
    spoilerFreeContext: 'Miles Morales traverses the Multiverse to save his family and conclude the Spider-Verse saga.',
  },
};

const spiderStoryEdges: StoryEdge[] = [
  // ─── Internal Raimi Trilogy Edges ──────────────────────────────────────────
  {
    sourceId: 'spiderman-1',
    targetId: 'spiderman-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Peter Parker continues wrestling with Uncle Ben responsibility and love for MJ.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
  },
  {
    sourceId: 'spiderman-2',
    targetId: 'spiderman-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Harry Osborn discovers Peter secret identity, concluding the Osborn family saga.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
  },

  // ─── Internal Webb Dilogy Edges ─────────────────────────────────────────────
  {
    sourceId: 'amazing-spiderman-1',
    targetId: 'amazing-spiderman-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Peter continues investigating his parents past while navigating Captain Stacy deathbed promise.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
  },

  // ─── Internal Spider-Verse Edges ────────────────────────────────────────────
  {
    sourceId: 'spider-verse-1',
    targetId: 'spider-verse-2',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Gwen Stacy recruits Miles Morales into the multiversal Spider-Society.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
  },
  {
    sourceId: 'spider-verse-1',
    targetId: 'spider-verse-3',
    relationship: 'story-continuation',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Origin of Miles Morales and multiversal Spider-Heroes resolved in trilogy finale.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Origin of Miles Morales and multiversal Spider-Heroes resolved in trilogy finale.',
      detailedReasons: [
        'Introduces Miles Morales, Spider-Gwen, and the super-collider multiversal anomaly.',
        'Provides foundational emotional context for Miles family and Spider-Hero identity.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'spider-verse-2',
    targetId: 'spider-verse-3',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Direct continuation from Across the Spider-Verse cliffhanger ending.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Direct continuation from Across the Spider-Verse cliffhanger ending.',
      detailedReasons: [
        'Establishes the Spot multiversal escalation and Miguel OHara Canon Event conflict.',
        'Picks up directly from the Earth-42 alternate Miles Morales cliffhanger.',
      ],
      source: 'editorial',
    },
  },

  // ─── Cross-Continuity Multiverse Edges to No Way Home ───────────────────────
  {
    sourceId: 'spiderman-1',
    targetId: 'mcu-spiderman-no-way-home',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Establishes Tobey Maguire Peter Parker (Peter-Two) origin and Green Goblin (Norman Osborn) villain arc directly resolved in No Way Home.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Establishes Tobey Maguire Peter Parker and Green Goblin origin resolved in No Way Home.',
      detailedReasons: [
        'Introduces Willem Dafoe Norman Osborn (Green Goblin) before he crosses multiversal portals into the MCU.',
        'Provides critical backstory for Tobey Maguire Peter Parker mentorship and moral guidance to Tom Holland Peter.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'spiderman-2',
    targetId: 'mcu-spiderman-no-way-home',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Establishes Doc Ock (Dr. Otto Octavius) villain arc, inhibitor chip flaw, and redemption directly resolved in No Way Home.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Establishes Doc Ock villain arc and neural inhibitor chip flaw resolved in No Way Home.',
      detailedReasons: [
        'Introduces Alfred Molina Otto Octavius at the moment of his fusion reactor crisis before teleporting into the MCU.',
        'Explains why curing Doc Ock neural inhibitor chip restores his true heroic personality.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'spiderman-3',
    targetId: 'mcu-spiderman-no-way-home',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Establishes Sandman (Flint Marko) backstory, particle dispersion abilities, and emotional resolution in No Way Home.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Establishes Sandman (Flint Marko) backstory and motivation to return to his daughter.',
      detailedReasons: [
        'Introduces Thomas Haden Church Flint Marko as a tragic figure seeking cure and return to his home universe.',
        'Explains Sandman sand manipulation powers and why Peter cures his cellular instability.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'amazing-spiderman-1',
    targetId: 'mcu-spiderman-no-way-home',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Establishes Andrew Garfield Peter Parker (Peter-Three) and Lizard (Dr. Curt Connors) arc resolved in No Way Home.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Establishes Andrew Garfield Peter Parker and Dr. Curt Connors (Lizard) origin.',
      detailedReasons: [
        'Introduces Rhys Ifans Dr. Curt Connors and his reptilian cross-species genetics before entering the MCU.',
        'Establishes Andrew Garfield Peter Parker emotional vulnerability and scientific brilliance.',
      ],
      source: 'editorial',
    },
  },
  {
    sourceId: 'amazing-spiderman-2',
    targetId: 'mcu-spiderman-no-way-home',
    relationship: 'direct-sequel',
    strength: 'required',
    confidence: 'confirmed',
    reason: 'Establishes Electro (Max Dillon) arc and Andrew Garfield Peter Parker grief over Gwen Stacy resolved in No Way Home.',
    sourceType: 'official-synopsis',
    editorialImportance: 'primary',
    recommendationEvidence: {
      shortReason: 'Establishes Electro power transformation and Andrew Garfield Peter Parker grief over Gwen Stacy.',
      detailedReasons: [
        'Introduces Jamie Foxx Max Dillon before his transformation into living electrical energy.',
        'Sets up Andrew Garfield Peter Parker redemption arc when he catches MJ at the Statue of Liberty.',
      ],
      source: 'editorial',
    },
  },
];

// Register into titleNodes and storyEdges if not already present
for (const [key, node] of Object.entries(spiderTitleNodes)) {
  if (!titleNodes[key]) {
    titleNodes[key] = node;
  }
}

for (const edge of spiderStoryEdges) {
  const exists = storyEdges.some(
    (e) => e.sourceId === edge.sourceId && e.targetId === edge.targetId && e.relationship === edge.relationship
  );
  if (!exists) {
    storyEdges.push(edge);
  }
}
