import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const avatarFranchise: Franchise = {
  id: 'avatar',
  name: 'Avatar',
  slug: 'avatar',
  description: 'James Cameron\'s visionary science-fiction saga chronicling humanity\'s exploration of Pandora, the Na\'vi clans, and the Sully family across generations.',
  poster_url: 'https://image.tmdb.org/t/p/w500/3C5brXxnBxfkeKWwA1Fh4xvy4wr.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/4uwX70EzaWVcGUXMtXPoexlNAff.jpg',
  tmdb_collection_id: 87096,
  total_movies: 5,
  total_series: 0,
  total_runtime: 354,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const avatarContent: Content[] = [
  buildContent({
    id: 'avatar-1',
    franchise_id: 'avatar',
    tmdb_id: 19995,
    title: 'Avatar',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/vL5LR6WdxWPjC365r2Nn8cozUu5.jpg',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.',
    release_date: '2009-12-18',
    runtime: 162,
    rating: 7.6,
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully', profile_url: 'https://image.tmdb.org/t/p/w185/blKKsHBoUJpL1Qezw193WMp053s.jpg' },
      { name: 'Zoe Saldaña', character: 'Neytiri', profile_url: 'https://image.tmdb.org/t/p/w185/vYBWIv75IYQiWAAbaqVwwZGFAOJ.jpg' },
      { name: 'Sigourney Weaver', character: 'Dr. Grace Augustine', profile_url: 'https://image.tmdb.org/t/p/w185/flf238mxn0y957f12e8p68gV.jpg' },
      { name: 'Stephen Lang', character: 'Colonel Miles Quaritch', profile_url: 'https://image.tmdb.org/t/p/w185/pTxG94tXh5T4u9E1b5i8j4tL8V2.jpg' },
    ],
    providers: ['Disney+', 'Max'],
    status: 'released',
    metadata_checked_at: new Date().toISOString(),
  }),
  buildContent({
    id: 'avatar-2',
    franchise_id: 'avatar',
    tmdb_id: 76600,
    title: 'Avatar: The Way of Water',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg',
    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',
    release_date: '2022-12-16',
    runtime: 192,
    rating: 7.6,
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully', profile_url: 'https://image.tmdb.org/t/p/w185/blKKsHBoUJpL1Qezw193WMp053s.jpg' },
      { name: 'Zoe Saldaña', character: 'Neytiri', profile_url: 'https://image.tmdb.org/t/p/w185/vYBWIv75IYQiWAAbaqVwwZGFAOJ.jpg' },
      { name: 'Sigourney Weaver', character: 'Kiri', profile_url: 'https://image.tmdb.org/t/p/w185/flf238mxn0y957f12e8p68gV.jpg' },
      { name: 'Stephen Lang', character: 'Colonel Miles Quaritch', profile_url: 'https://image.tmdb.org/t/p/w185/pTxG94tXh5T4u9E1b5i8j4tL8V2.jpg' },
      { name: 'Kate Winslet', character: 'Ronal', profile_url: 'https://image.tmdb.org/t/p/w185/e3td5e6VU8m54kK9.jpg' },
    ],
    providers: ['Disney+', 'Max'],
    status: 'released',
    metadata_checked_at: new Date().toISOString(),
  }),
  buildContent({
    id: 'avatar-3',
    franchise_id: 'avatar',
    tmdb_id: 83533,
    title: 'Avatar: Fire and Ash',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'The third entry in James Cameron\'s science-fiction franchise exploring the fiery, aggressive Ash People clan of Na\'vi on Pandora.',
    release_date: '2025-12-19',
    runtime: 180,
    rating: 0,
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully', profile_url: 'https://image.tmdb.org/t/p/w185/blKKsHBoUJpL1Qezw193WMp053s.jpg' },
      { name: 'Zoe Saldaña', character: 'Neytiri', profile_url: 'https://image.tmdb.org/t/p/w185/vYBWIv75IYQiWAAbaqVwwZGFAOJ.jpg' },
      { name: 'Oona Chaplin', character: 'Varang', profile_url: 'https://image.tmdb.org/t/p/w185/oona.jpg' },
    ],
    // Theatrically released 2025-12-19. OTT streaming available from 2026-06-24 on Disney+ and JioHotstar.
    providers: ['Disney+', 'JioHotstar'],
    status: 'released',
    theatrical_released: true,
    subscription_streaming_available: true,
    subscription_streaming_release_date: '2026-06-24',
    metadata_checked_at: '2026-08-14T00:00:00.000Z',
  }),
  buildContent({
    id: 'avatar-4',
    franchise_id: 'avatar',
    tmdb_id: 216527,
    title: 'Avatar 4',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'The fourth installment of James Cameron\'s Avatar franchise continuing the epic generational saga on Pandora.',
    release_date: '2029-12-21',
    runtime: 180,
    rating: 0,
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully', profile_url: 'https://image.tmdb.org/t/p/w185/blKKsHBoUJpL1Qezw193WMp053s.jpg' },
      { name: 'Zoe Saldaña', character: 'Neytiri', profile_url: 'https://image.tmdb.org/t/p/w185/vYBWIv75IYQiWAAbaqVwwZGFAOJ.jpg' },
    ],
    providers: [],
    status: 'planned',
    metadata_checked_at: new Date().toISOString(),
  }),
  buildContent({
    id: 'avatar-5',
    franchise_id: 'avatar',
    tmdb_id: 393209,
    title: 'Avatar 5',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'The fifth installment of the Avatar franchise which will take the Na\'vi journey to Earth.',
    release_date: '2031-12-19',
    runtime: 180,
    rating: 0,
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully', profile_url: 'https://image.tmdb.org/t/p/w185/blKKsHBoUJpL1Qezw193WMp053s.jpg' },
      { name: 'Zoe Saldaña', character: 'Neytiri', profile_url: 'https://image.tmdb.org/t/p/w185/vYBWIv75IYQiWAAbaqVwwZGFAOJ.jpg' },
    ],
    providers: [],
    status: 'planned',
    metadata_checked_at: new Date().toISOString(),
  }),
];

const sortedAvatarForRelease = [...avatarContent].sort(compareReleaseDates);

export const avatarWatchOrders: WatchOrder[] = sortedAvatarForRelease.map((item, index) =>
  buildWatchOrder({
    id: `wo-avatar-rel-${index + 1}`,
    franchise_id: 'avatar',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat([

  // ─── CHRONOLOGICAL ORDER ────────────────────────────────────
  buildWatchOrder({ id: 'wo-avatar-chr-1', franchise_id: 'avatar', content_id: 'avatar-1', order_type: 'chronological', position: 1, notes: 'Jake Sully arrives on Pandora in 2154.' }),
  buildWatchOrder({ id: 'wo-avatar-chr-2', franchise_id: 'avatar', content_id: 'avatar-2', order_type: 'chronological', position: 2, notes: 'Set 14-15 years after the first film, following the Sully family.' }),
  buildWatchOrder({ id: 'wo-avatar-chr-3', franchise_id: 'avatar', content_id: 'avatar-3', order_type: 'chronological', position: 3, notes: 'Direct continuation in the aftermath of the Metkayina reef battle.' }),
  buildWatchOrder({ id: 'wo-avatar-chr-4', franchise_id: 'avatar', content_id: 'avatar-4', order_type: 'chronological', position: 4, notes: 'Direct continuation of the Pandoran generational story.' }),
  buildWatchOrder({ id: 'wo-avatar-chr-5', franchise_id: 'avatar', content_id: 'avatar-5', order_type: 'chronological', position: 5, notes: 'Climax of the saga connecting Pandora to Earth.' }),

  // ─── RECOMMENDED ORDER ──────────────────────────────────────
  buildWatchOrder({ id: 'wo-avatar-rec-1', franchise_id: 'avatar', content_id: 'avatar-1', order_type: 'recommended', position: 1 }),
  buildWatchOrder({ id: 'wo-avatar-rec-2', franchise_id: 'avatar', content_id: 'avatar-2', order_type: 'recommended', position: 2 }),
  buildWatchOrder({ id: 'wo-avatar-rec-3', franchise_id: 'avatar', content_id: 'avatar-3', order_type: 'recommended', position: 3 }),
  buildWatchOrder({ id: 'wo-avatar-rec-4', franchise_id: 'avatar', content_id: 'avatar-4', order_type: 'recommended', position: 4 }),
  buildWatchOrder({ id: 'wo-avatar-rec-5', franchise_id: 'avatar', content_id: 'avatar-5', order_type: 'recommended', position: 5 }),
]);

export const franchise = avatarFranchise;
export const content = avatarContent;
export const watchOrders = avatarWatchOrders;
export const releaseOrder: WatchOrder[] = avatarWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = avatarWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = avatarWatchOrders.filter((o) => o.order_type === 'recommended');
