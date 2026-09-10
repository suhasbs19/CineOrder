import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const evilDeadFranchise: Franchise = {
  id: 'evil-dead',
  name: 'Evil Dead',
  slug: 'evil-dead',
  description:
    'Created by Sam Raimi, the Evil Dead franchise follows Ash Williams and others fighting against ancient demonic forces unleashed by the Necronomicon Ex-Mortis (Book of the Dead).',
  poster_url: 'https://image.tmdb.org/t/p/w500/eWFADubShlTEUiNsPcN6BMOKakr.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/377E9KSoUGxKWuvyR1Zu9aXcU4I.jpg',
  tmdb_collection_id: 1960,
  total_movies: 6,
  total_series: 1,
  total_runtime: 1432,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2026-08-11',
};

export const evilDeadContent: Content[] = [
  buildContent({
    id: 'ed-1',
    franchise_id: 'evil-dead',
    tmdb_id: 764,
    title: 'The Evil Dead',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/54C1qdaiSijIU5NeNb4WsPJdNkG.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8U2FpYx1S6zZ94.jpg',
    overview:
      'Five friends travel to a cabin in the woods, where they unknowingly release flesh-possessing demons after playing an audiotape recording from the Necronomicon.',
    release_date: '1981-10-15',
    runtime: 85,
    rating: 7.4,
    director: 'Sam Raimi',
    providers: ['Shudder', 'AMC+'],
  }),
  buildContent({
    id: 'ed-2',
    franchise_id: 'evil-dead',
    tmdb_id: 765,
    title: 'Evil Dead II',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/4zqCKJVHUolGs6C5AZwAZqLWixW.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ed2_backdrop.jpg',
    overview:
      'Ash Williams encounters demonic possession again while trapped in a remote cabin, battling Deadites and his own severed hand armed with a chainsaw.',
    release_date: '1987-03-13',
    runtime: 84,
    rating: 7.7,
    director: 'Sam Raimi',
    providers: ['Shudder', 'Max'],
  }),
  buildContent({
    id: 'ed-3',
    franchise_id: 'evil-dead',
    tmdb_id: 766,
    title: 'Army of Darkness',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/xsgTuAtR2zSH8Umg3jWZcZjlDpe.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/aod_backdrop.jpg',
    overview:
      'Ash Williams is accidentally transported back to 1300 AD, where he must retrieve the Necronomicon and lead a medieval kingdom against an army of the dead.',
    release_date: '1992-10-09',
    runtime: 81,
    rating: 7.4,
    director: 'Sam Raimi',
    providers: ['Peacock', 'Prime Video'],
  }),
  buildContent({
    id: 'ed-4',
    franchise_id: 'evil-dead',
    tmdb_id: 109428,
    title: 'Evil Dead',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/1gDV0Lm9y8ufIKzyf0h0GBgb9Zj.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ed2013_backdrop.jpg',
    overview:
      'Five young adults head to a remote cabin where they discover the Naturom Demonto, accidentally awakening an ancient bloodthirsty demon.',
    release_date: '2013-04-05',
    runtime: 91,
    rating: 6.5,
    director: 'Fede Álvarez',
    providers: ['Hulu', 'Max'],
  }),
  buildContent({
    id: 'ed-ash-vs-ed',
    franchise_id: 'evil-dead',
    tmdb_id: 62264,
    title: 'Ash vs Evil Dead',
    type: 'series',
    poster_url: 'https://image.tmdb.org/t/p/w500/9tNtSk46s3f1ePr59p0JG6uacc8.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ash_backdrop.jpg',
    overview:
      'Thirty years after his Deadite battles, Ash Williams is forced out of retirement alongside new allies Pablo and Kelly when the Necronomicon plague returns.',
    release_date: '2015-10-31',
    runtime: 30,
    episode_count: 30,
    season_count: 3,
    rating: 8.4,
    providers: ['Hulu', 'Starz'],
  }),
  buildContent({
    id: 'ed-rise',
    franchise_id: 'evil-dead',
    tmdb_id: 713704,
    title: 'Evil Dead Rise',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/5ik4ATKmNtmJU6AYD0bLm56BCVM.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/edrise_backdrop.jpg',
    overview:
      'A twisted tale of two estranged sisters whose reunion is cut short by the rise of flesh-possessing demons in a Los Angeles apartment building.',
    release_date: '2023-04-21',
    runtime: 96,
    rating: 6.6,
    director: 'Lee Cronin',
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'ed-burn',
    franchise_id: 'evil-dead',
    tmdb_id: null,
    title: 'Evil Dead Burn',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview:
      'Serving as a sequel to Evil Dead Rise, the story follows a young woman seeking solace with her in-laws, only for the family gathering to turn into a nightmare as Deadite possession erupts.',
    release_date: '2026-07-10',
    runtime: 95,
    rating: 7.2,
    director: 'Sébastien Vaniček',
    providers: ['Prime Video', 'Apple TV'],
  }),
];

const sortedEvilDeadForRelease = [...evilDeadContent].sort(compareReleaseDates);

export const evilDeadWatchOrders: WatchOrder[] = sortedEvilDeadForRelease.map((item, index) =>
  buildWatchOrder({
    id: `wo-ed-rel-${index + 1}`,
    franchise_id: 'evil-dead',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat([

  // Chronological Order
  buildWatchOrder({ id: 'wo-ed-chr-1', franchise_id: 'evil-dead', content_id: 'ed-1', order_type: 'chronological', position: 1 }),
  buildWatchOrder({ id: 'wo-ed-chr-2', franchise_id: 'evil-dead', content_id: 'ed-2', order_type: 'chronological', position: 2 }),
  buildWatchOrder({ id: 'wo-ed-chr-3', franchise_id: 'evil-dead', content_id: 'ed-3', order_type: 'chronological', position: 3 }),
  buildWatchOrder({ id: 'wo-ed-chr-4', franchise_id: 'evil-dead', content_id: 'ed-ash-vs-ed', order_type: 'chronological', position: 4 }),
  buildWatchOrder({ id: 'wo-ed-chr-5', franchise_id: 'evil-dead', content_id: 'ed-4', order_type: 'chronological', position: 5 }),
  buildWatchOrder({ id: 'wo-ed-chr-6', franchise_id: 'evil-dead', content_id: 'ed-rise', order_type: 'chronological', position: 6 }),
  buildWatchOrder({ id: 'wo-ed-chr-7', franchise_id: 'evil-dead', content_id: 'ed-burn', order_type: 'chronological', position: 7, notes: 'Sequel to Evil Dead Rise expanding the Necronomicon curse.' }),

  // Recommended Order
  buildWatchOrder({ id: 'wo-ed-rec-1', franchise_id: 'evil-dead', content_id: 'ed-1', order_type: 'recommended', position: 1, notes: 'The original 1981 classic introducing Ash Williams.' }),
  buildWatchOrder({ id: 'wo-ed-rec-2', franchise_id: 'evil-dead', content_id: 'ed-2', order_type: 'recommended', position: 2, notes: 'Direct continuation refining comedic horror tones.' }),
  buildWatchOrder({ id: 'wo-ed-rec-3', franchise_id: 'evil-dead', content_id: 'ed-3', order_type: 'recommended', position: 3, notes: 'Medieval fantasy action continuation.' }),
  buildWatchOrder({ id: 'wo-ed-rec-4', franchise_id: 'evil-dead', content_id: 'ed-ash-vs-ed', order_type: 'recommended', position: 4, notes: 'TV series continuation 30 years after Army of Darkness.' }),
  buildWatchOrder({ id: 'wo-ed-rec-5', franchise_id: 'evil-dead', content_id: 'ed-4', order_type: 'recommended', position: 5, notes: 'Gory 2013 reboot expansion.' }),
  buildWatchOrder({ id: 'wo-ed-rec-6', franchise_id: 'evil-dead', content_id: 'ed-rise', order_type: 'recommended', position: 6, notes: 'Urban apartment expansion of the Necronomicon curse.' }),
  buildWatchOrder({ id: 'wo-ed-rec-7', franchise_id: 'evil-dead', content_id: 'ed-burn', order_type: 'recommended', position: 7, notes: 'Sequel to Evil Dead Rise.' }),
]);
