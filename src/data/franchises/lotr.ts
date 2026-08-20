import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const lotrFranchise: Franchise = {
  id: 'lord-of-the-rings',
  name: 'Lord of the Rings / Middle-earth',
  slug: 'lord-of-the-rings',
  description: 'J.R.R. Tolkien\'s epic fantasy brought to life by Peter Jackson. Follow hobbits, elves, dwarves, and men in their quest to destroy the One Ring and defeat the Dark Lord Sauron in Middle-earth.',
  poster_url: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg',
  tmdb_collection_id: 119,
  total_movies: 6,
  total_series: 1,
  total_runtime: 1200,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const lotrContent: Content[] = [
  buildContent({
    id: 'lotr-1',
    franchise_id: 'lord-of-the-rings',
    tmdb_id: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg',
    overview: 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator.',
    release_date: '2001-12-18',
    runtime: 178,
    rating: 8.4,
    director: 'Peter Jackson',
    cast: [
      { name: 'Elijah Wood', character: 'Frodo Baggins', profile_url: 'https://image.tmdb.org/t/p/w185/7UKRbJBNG7mxBl2L5m2D0eW4fT.jpg' },
      { name: 'Ian McKellen', character: 'Gandalf', profile_url: 'https://image.tmdb.org/t/p/w185/a5nhFmdjF37vGzZ4A1zZ6z8rN7.jpg' },
      { name: 'Viggo Mortensen', character: 'Aragorn', profile_url: 'https://image.tmdb.org/t/p/w185/v3fRndy1Jcpk02aB5vF0rM3g6Z0.jpg' },
    ],
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'lotr-2',
    franchise_id: 'lord-of-the-rings',
    tmdb_id: 121,
    title: 'The Lord of the Rings: The Two Towers',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Frodo and Sam are trekking to Mordor to destroy the One Ring of Power while Gimli, Legolas and Aragorn search for the Orc-captured Merry and Pippin.',
    release_date: '2002-12-18',
    runtime: 179,
    rating: 8.4,
    director: 'Peter Jackson',
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'lotr-3',
    franchise_id: 'lord-of-the-rings',
    tmdb_id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8f9dnOtpArDrJOecg68dGzK2E3m.jpg',
    overview: 'Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron\'s forces.',
    release_date: '2003-12-17',
    runtime: 201,
    rating: 8.5,
    director: 'Peter Jackson',
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'lotr-rop',
    franchise_id: 'lord-of-the-rings',
    tmdb_id: 84773,
    title: 'The Lord of the Rings: The Rings of Power',
    type: 'series',
    poster_url: 'https://image.tmdb.org/t/p/w500/kf5Hz70tjNAHg4swGDzOr9BfoZ1.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Beginning in a time of relative peace, we follow an ensemble cast of characters as they confront the re-emergence of evil to Middle-earth.',
    release_date: '2022-09-01',
    runtime: 65,
    episode_count: 16,
    season_count: 2,
    rating: 7.3,
    is_required: false,
    providers: ['Prime Video'],
  }),
  buildContent({
    id: 'lotr-rohirrim',
    franchise_id: 'lord-of-the-rings',
    tmdb_id: 839033,
    title: 'The Lord of the Rings: The War of the Rohirrim',
    type: 'animated',
    poster_url: 'https://image.tmdb.org/t/p/w500/23WCoDo6wzBfzbX7BGTNwVUqZfi.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg',
    overview: 'A sudden attack by Wulf, a clever and ruthless Dunlending lord, forces Helm Hammerhand, the King of Rohan, and his people to make a daring last stand in the ancient stronghold of the Hornburg.',
    release_date: '2024-12-13',
    runtime: 130,
    rating: 7.2,
    director: 'Kenji Kamiyama',
    providers: ['Max'],
  }),
];

const sortedLotrForRelease = [...lotrContent].sort(compareReleaseDates);

export const lotrWatchOrders: WatchOrder[] = sortedLotrForRelease.map((item, index) =>
  buildWatchOrder({
    id: `lotr-rel-${index + 1}`,
    franchise_id: 'lord-of-the-rings',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat([

  // Chronological Order
  buildWatchOrder({ id: 'lotr-chr-1', franchise_id: 'lord-of-the-rings', content_id: 'lotr-rop', order_type: 'chronological', position: 1, notes: 'Set during the Second Age of Middle-earth.' }),
  buildWatchOrder({ id: 'lotr-chr-2', franchise_id: 'lord-of-the-rings', content_id: 'lotr-rohirrim', order_type: 'chronological', position: 2, notes: 'Set 183 years before the events of LOTR.' }),
  buildWatchOrder({ id: 'lotr-chr-3', franchise_id: 'lord-of-the-rings', content_id: 'lotr-1', order_type: 'chronological', position: 3, notes: 'Third Age (3018-3019)' }),
  buildWatchOrder({ id: 'lotr-chr-4', franchise_id: 'lord-of-the-rings', content_id: 'lotr-2', order_type: 'chronological', position: 4 }),
  buildWatchOrder({ id: 'lotr-chr-5', franchise_id: 'lord-of-the-rings', content_id: 'lotr-3', order_type: 'chronological', position: 5 }),

  // Recommended Order
  buildWatchOrder({ id: 'lotr-rec-1', franchise_id: 'lord-of-the-rings', content_id: 'lotr-1', order_type: 'recommended', position: 1 }),
  buildWatchOrder({ id: 'lotr-rec-2', franchise_id: 'lord-of-the-rings', content_id: 'lotr-2', order_type: 'recommended', position: 2 }),
  buildWatchOrder({ id: 'lotr-rec-3', franchise_id: 'lord-of-the-rings', content_id: 'lotr-3', order_type: 'recommended', position: 3 }),
  buildWatchOrder({ id: 'lotr-rec-4', franchise_id: 'lord-of-the-rings', content_id: 'lotr-rohirrim', order_type: 'recommended', position: 4 }),
  buildWatchOrder({ id: 'lotr-rec-5', franchise_id: 'lord-of-the-rings', content_id: 'lotr-rop', order_type: 'recommended', position: 5 }),
]);

export const franchise = lotrFranchise;
export const content = lotrContent;
export const watchOrders = lotrWatchOrders;
export const releaseOrder: WatchOrder[] = lotrWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = lotrWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = lotrWatchOrders.filter((o) => o.order_type === 'recommended');



