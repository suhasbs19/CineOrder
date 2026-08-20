import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const insidiousFranchise: Franchise = {
  id: 'insidious',
  name: 'Insidious',
  slug: 'insidious',
  description:
    'Created by James Wan and Leigh Whannell, the Insidious franchise explores demonic entities, astral projection, and the terrifying dark realm known as The Further.',
  poster_url: 'https://image.tmdb.org/t/p/w500/1egpmVXuXed58TH2UOnX1nATTrf.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/tJvRdhlkonjBLBUpTqp0RPPujxJ.jpg',
  tmdb_collection_id: 228446,
  total_movies: 6,
  total_series: 0,
  total_runtime: 621,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2026-08-11',
};

export const insidiousContent: Content[] = [
  buildContent({
    id: 'ins-1',
    franchise_id: 'insidious',
    tmdb_id: 49018,
    title: 'Insidious',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/1egpmVXuXed58TH2UOnX1nATTrf.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ins1_backdrop.jpg',
    overview:
      'A family looks to prevent evil spirits from trapping their comatose child in a realm called The Further.',
    release_date: '2010-09-14',
    runtime: 103,
    rating: 6.8,
    director: 'James Wan',
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'ins-2',
    franchise_id: 'insidious',
    tmdb_id: 91586,
    title: 'Insidious: Chapter 2',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/w5JjiB3O1CLDXbTJe1QpU5RHmlU.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ins2_backdrop.jpg',
    overview:
      'The Lamberts seek to uncover the mysterious childhood secret that has left them dangerously connected to the spirit world.',
    release_date: '2013-09-13',
    runtime: 106,
    rating: 6.6,
    director: 'James Wan',
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'ins-3',
    franchise_id: 'insidious',
    tmdb_id: 280092,
    title: 'Insidious: Chapter 3',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/iDdGfdNvY1EX0uDdA4Ru77fwMfc.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ins3_backdrop.jpg',
    overview:
      'A prequel set before the haunting of the Lambert family that reveals how gifted psychic Elise Rainier reluctantly agrees to use her ability to contact the dead.',
    release_date: '2015-06-05',
    runtime: 97,
    rating: 6.1,
    director: 'Leigh Whannell',
    providers: ['Hulu', 'Prime Video'],
  }),
  buildContent({
    id: 'ins-4',
    franchise_id: 'insidious',
    tmdb_id: 406563,
    title: 'Insidious: The Last Key',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/6c9ti2JcR3dHyR3qFXoZqVMx0SH.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ins4_backdrop.jpg',
    overview:
      'Paranormal investigator Elise Rainier faces her most fearsome and personal haunting yet in her childhood family home.',
    release_date: '2018-01-05',
    runtime: 103,
    rating: 6.1,
    director: 'Adam Robitel',
    providers: ['Hulu', 'Max'],
  }),
  buildContent({
    id: 'ins-5',
    franchise_id: 'insidious',
    tmdb_id: 614479,
    title: 'Insidious: The Red Door',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/d07phJqCx6z5wILDYqkyraorDPi.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ins5_backdrop.jpg',
    overview:
      'Ten years after the events of Chapter 2, Josh Lambert heads east to drop his son Dalton off at an idyllic, ivy-league university, only for Dalton repressed demons to return.',
    release_date: '2023-07-07',
    runtime: 107,
    rating: 6.0,
    director: 'Patrick Wilson',
    providers: ['Peacock', 'Netflix'],
  }),
  buildContent({
    id: 'ins-6',
    franchise_id: 'insidious',
    tmdb_id: null,
    title: 'Insidious: Out of the Further',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/insidious6.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/ins6_backdrop.jpg',
    overview:
      'The sixth installment in the Insidious franchise follows a young mother who discovers she can travel into The Further and inadvertently brings terrifying entities back into the real world.',
    release_date: '2026-08-21',
    runtime: 105,
    rating: 0.0,
    status: 'upcoming',
    director: 'Jacob Chase',
    providers: [],
  }),
];

const sortedInsidiousForRelease = [...insidiousContent].sort(compareReleaseDates);

export const insidiousWatchOrders: WatchOrder[] = sortedInsidiousForRelease.map((item, index) =>
  buildWatchOrder({
    id: `wo-ins-rel-${index + 1}`,
    franchise_id: 'insidious',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat([

  // Chronological Order
  buildWatchOrder({ id: 'wo-ins-chr-1', franchise_id: 'insidious', content_id: 'ins-3', order_type: 'chronological', position: 1, notes: 'Prequel origin of Elise Rainier and Spectral Sightings.' }),
  buildWatchOrder({ id: 'wo-ins-chr-2', franchise_id: 'insidious', content_id: 'ins-4', order_type: 'chronological', position: 2, notes: 'Prequel exploring Elise childhood home leading into Insidious 1.' }),
  buildWatchOrder({ id: 'wo-ins-chr-3', franchise_id: 'insidious', content_id: 'ins-1', order_type: 'chronological', position: 3, notes: 'The original Lambert family haunting.' }),
  buildWatchOrder({ id: 'wo-ins-chr-4', franchise_id: 'insidious', content_id: 'ins-2', order_type: 'chronological', position: 4, notes: 'Direct continuation after Insidious 1.' }),
  buildWatchOrder({ id: 'wo-ins-chr-5', franchise_id: 'insidious', content_id: 'ins-5', order_type: 'chronological', position: 5, notes: 'Conclusion 10 years after Chapter 2.' }),
  buildWatchOrder({ id: 'wo-ins-chr-6', franchise_id: 'insidious', content_id: 'ins-6', order_type: 'chronological', position: 6, notes: 'Continuation of astral travel into The Further.' }),

  // Recommended Order
  buildWatchOrder({ id: 'wo-ins-rec-1', franchise_id: 'insidious', content_id: 'ins-1', order_type: 'recommended', position: 1 }),
  buildWatchOrder({ id: 'wo-ins-rec-2', franchise_id: 'insidious', content_id: 'ins-2', order_type: 'recommended', position: 2 }),
  buildWatchOrder({ id: 'wo-ins-rec-3', franchise_id: 'insidious', content_id: 'ins-3', order_type: 'recommended', position: 3 }),
  buildWatchOrder({ id: 'wo-ins-rec-4', franchise_id: 'insidious', content_id: 'ins-4', order_type: 'recommended', position: 4 }),
  buildWatchOrder({ id: 'wo-ins-rec-5', franchise_id: 'insidious', content_id: 'ins-5', order_type: 'recommended', position: 5 }),
  buildWatchOrder({ id: 'wo-ins-rec-6', franchise_id: 'insidious', content_id: 'ins-6', order_type: 'recommended', position: 6 }),
]);
