import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';

export const theHobbitFranchise: Franchise = {
  id: 'the-hobbit',
  name: 'The Hobbit',
  slug: 'the-hobbit',
  description: 'Peter Jackson\'s epic trilogy prequel to The Lord of the Rings, following Bilbo Baggins as he is swept into an epic quest to reclaim the Erebor Dwarf Kingdom from the fearsome dragon Smaug.',
  poster_url: 'https://image.tmdb.org/t/p/w500/hQghXOjSS2xfzx9XnMyZqt8brCF.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/7wO7MSnP5UcwR2cTHdJFF1vP4Ie.jpg',
  tmdb_collection_id: 121938,
  total_movies: 3,
  total_series: 0,
  total_runtime: 480,
  status: 'completed',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const theHobbitContent: Content[] = [
  buildContent({
    id: 'hobbit-1',
    franchise_id: 'the-hobbit',
    tmdb_id: 49051,
    title: 'The Hobbit: An Unexpected Journey',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/yHA9Fc37VmpUA5UncTxxo3rTGVA.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/h9SBRw5wX8xKngpBw2r3Pww9B6M.jpg',
    overview: 'Bilbo Baggins, a hobbit enjoying his quiet life, is swept into an epic quest by Gandalf the Grey and thirteen dwarves who seek to reclaim their mountain home from Smaug, the dragon.',
    release_date: '2012-12-12',
    runtime: 169,
    rating: 7.3,
    director: 'Peter Jackson',
    cast: [
      { name: 'Martin Freeman', character: 'Bilbo Baggins', profile_url: 'https://image.tmdb.org/t/p/w185/901Kj5T3j7B7b9B7b9B7b9B7.jpg' },
      { name: 'Ian McKellen', character: 'Gandalf', profile_url: 'https://image.tmdb.org/t/p/w185/a5nhFmdjF37vGzZ4A1zZ6z8rN7.jpg' },
      { name: 'Richard Armitage', character: 'Thorin Oakenshield', profile_url: 'https://image.tmdb.org/t/p/w185/l4fN7r2g1d3h5j6k7l8m9n0o1p2.jpg' },
    ],
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'hobbit-2',
    franchise_id: 'the-hobbit',
    tmdb_id: 57158,
    title: 'The Hobbit: The Desolation of Smaug',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/xQYiXsheRCDBA39DOrmaw1aSpbk.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8f9dnOtpArDrJOecg68dGzK2E3m.jpg',
    overview: 'The Dwarves, Bilbo and Gandalf have successfully escaped the Misty Mountains, and Bilbo has gained the One Ring. They all continue their journey to get their gold back from the Dragon, Smaug.',
    release_date: '2013-12-11',
    runtime: 161,
    rating: 7.5,
    director: 'Peter Jackson',
    providers: ['Max', 'Prime Video'],
  }),
  buildContent({
    id: 'hobbit-3',
    franchise_id: 'the-hobbit',
    tmdb_id: 122917,
    title: 'The Hobbit: The Battle of the Five Armies',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/xT98tLqatZPQApyRmlPL12LtiWp.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/6aUWe0GSl69wMTSWWexsorMIvwU.jpg',
    overview: 'After the Dragon leaves the Lonely Mountain, the people of Lake-town see a threat coming. Orcs, dwarves, elves and people prepare for war.',
    release_date: '2014-12-10',
    runtime: 144,
    rating: 7.3,
    director: 'Peter Jackson',
    providers: ['Max', 'Prime Video'],
  }),
];

export const theHobbitWatchOrders: WatchOrder[] = [
  // Release & Chronological Order (identical)
  buildWatchOrder({ id: 'hobbit-rel-1', franchise_id: 'the-hobbit', content_id: 'hobbit-1', order_type: 'release', position: 1 }),
  buildWatchOrder({ id: 'hobbit-rel-2', franchise_id: 'the-hobbit', content_id: 'hobbit-2', order_type: 'release', position: 2 }),
  buildWatchOrder({ id: 'hobbit-rel-3', franchise_id: 'the-hobbit', content_id: 'hobbit-3', order_type: 'release', position: 3 }),

  buildWatchOrder({ id: 'hobbit-chr-1', franchise_id: 'the-hobbit', content_id: 'hobbit-1', order_type: 'chronological', position: 1, notes: 'Set 60 years before The Lord of the Rings.' }),
  buildWatchOrder({ id: 'hobbit-chr-2', franchise_id: 'the-hobbit', content_id: 'hobbit-2', order_type: 'chronological', position: 2 }),
  buildWatchOrder({ id: 'hobbit-chr-3', franchise_id: 'the-hobbit', content_id: 'hobbit-3', order_type: 'chronological', position: 3 }),

  // Recommended Order
  buildWatchOrder({ id: 'hobbit-rec-1', franchise_id: 'the-hobbit', content_id: 'hobbit-1', order_type: 'recommended', position: 1 }),
  buildWatchOrder({ id: 'hobbit-rec-2', franchise_id: 'the-hobbit', content_id: 'hobbit-2', order_type: 'recommended', position: 2 }),
  buildWatchOrder({ id: 'hobbit-rec-3', franchise_id: 'the-hobbit', content_id: 'hobbit-3', order_type: 'recommended', position: 3 }),
];

export const franchise = theHobbitFranchise;
export const content = theHobbitContent;
export const watchOrders = theHobbitWatchOrders;
export const releaseOrder: WatchOrder[] = theHobbitWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = theHobbitWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = theHobbitWatchOrders.filter((o) => o.order_type === 'recommended');

