import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';

export const johnWickFranchise: Franchise = {
  id: 'john-wick',
  name: 'John Wick',
  slug: 'john-wick',
  description: 'The John Wick series follows legendary hitman John Wick as he is pulled back into the criminal underworld. Known for its intricate world-building of assassin society and groundbreaking action choreography.',
  poster_url: 'https://image.tmdb.org/t/p/w500/sm7rZZivZm2NhJDucFf3gpfFdVt.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/fSwYa5q2xRkBoOOjueLpkLf3N1m.jpg',
  tmdb_collection_id: 404609,
  total_movies: 5,
  total_series: 1,
  total_runtime: 660,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const johnWickContent: Content[] = [
  buildContent({
    id: 'jw-1',
    franchise_id: 'john-wick',
    tmdb_id: 245891,
    title: 'John Wick',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg',
    overview: 'An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took his everything.',
    release_date: '2014-10-24',
    runtime: 101,
    rating: 7.4,
    director: 'Chad Stahelski',
    providers: ['Prime Video', 'Peacock'],
  }),
  buildContent({
    id: 'jw-2',
    franchise_id: 'john-wick',
    tmdb_id: 324552,
    title: 'John Wick: Chapter 2',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/hXWBc0ioZP3cN4zCu6SN3YHXZVO.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8f9dnOtpArDrJOecg68dGzK2E3m.jpg',
    overview: 'After returning to the criminal underworld to repay a debt, John Wick discovers that a large bounty has been put on his life.',
    release_date: '2017-02-10',
    runtime: 122,
    rating: 7.3,
    director: 'Chad Stahelski',
    providers: ['Prime Video', 'Peacock'],
  }),
  buildContent({
    id: 'jw-3',
    franchise_id: 'john-wick',
    tmdb_id: 458156,
    title: 'John Wick: Chapter 3 - Parabellum',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/vVpPqhuvSUCugXko0VEOIpnCldf.jpg',
    overview: 'Super-assassin John Wick returns with a $14 million price tag on his head and an army of bounty-hunting killers on his trail.',
    release_date: '2019-05-17',
    runtime: 131,
    rating: 7.4,
    director: 'Chad Stahelski',
    providers: ['Prime Video', 'Peacock'],
  }),
  buildContent({
    id: 'jw-4',
    franchise_id: 'john-wick',
    tmdb_id: 603692,
    title: 'John Wick: Chapter 4',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.',
    release_date: '2023-03-24',
    runtime: 169,
    rating: 7.8,
    director: 'Chad Stahelski',
    providers: ['Prime Video', 'Peacock'],
  }),
  buildContent({
    id: 'jw-continental',
    franchise_id: 'john-wick',
    tmdb_id: 72710,
    title: 'The Continental: From the World of John Wick',
    type: 'series',
    poster_url: 'https://image.tmdb.org/t/p/w500/2urdwqEL9FRkGMKAkhfvWTALG00.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8f9dnOtpArDrJOecg68dGzK2E3m.jpg',
    overview: 'A look at the origin behind the iconic hotel-for-assassins centerpiece of the John Wick universe through the eyes and actions of a young Winston Scott in 1970s New York.',
    release_date: '2023-09-22',
    runtime: 90,
    episode_count: 3,
    season_count: 1,
    rating: 7.6,
    providers: ['Peacock'],
  }),
  buildContent({
    id: 'jw-ballerina',
    franchise_id: 'john-wick',
    tmdb_id: 541671,
    title: 'From the World of John Wick: Ballerina',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/2VUmvqsHb6cEtdfscEA6fqqVzLg.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg',
    overview: 'Taking place during the events of John Wick: Chapter 3 – Parabellum, Eve Macarro begins her training in the assassin traditions of the Ruska Roma.',
    release_date: '2025-06-06',
    runtime: 120,
    rating: 7.0,
    status: 'released',
    director: 'Len Wiseman',
    providers: ['Peacock'],
  }),
];

export const johnWickWatchOrders: WatchOrder[] = johnWickContent.map((item, index) =>
  buildWatchOrder({
    id: `jw-rel-${index + 1}`,
    franchise_id: 'john-wick',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat(
  johnWickContent.map((item, index) =>
    buildWatchOrder({
      id: `jw-chr-${index + 1}`,
      franchise_id: 'john-wick',
      content_id: item.id,
      order_type: 'chronological',
      position: index + 1,
    })
  )
).concat(
  johnWickContent.map((item, index) =>
    buildWatchOrder({
      id: `jw-rec-${index + 1}`,
      franchise_id: 'john-wick',
      content_id: item.id,
      order_type: 'recommended',
      position: index + 1,
    })
  )
);

export const franchise = johnWickFranchise;
export const content = johnWickContent;
export const watchOrders = johnWickWatchOrders;
export const releaseOrder: WatchOrder[] = johnWickWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = johnWickWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = johnWickWatchOrders.filter((o) => o.order_type === 'recommended');
