import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export const piratesFranchise: Franchise = {
  id: 'pirates-of-the-caribbean',
  name: 'Pirates of the Caribbean',
  slug: 'pirates-of-the-caribbean',
  description: 'Follow Captain Jack Sparrow through supernatural adventures across the seven seas. A swashbuckling franchise mixing pirate lore, undead curses, and the mysteries of the deep.',
  poster_url: 'https://image.tmdb.org/t/p/w500/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/wxgD3fB5lQ2sGJLog0rvXW049Pf.jpg',
  tmdb_collection_id: 295,
  total_movies: 5,
  total_series: 0,
  total_runtime: 680,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const piratesContent: Content[] = [
  buildContent({
    id: 'potc-1',
    franchise_id: 'pirates-of-the-caribbean',
    tmdb_id: 22,
    title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/poHwCZeWzJCShH7tOjg8RIoyjcw.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/5bdHjmGH5csCWyTE8sTcG2JJcpP.jpg',
    overview: 'Jack Sparrow, a freewheeling 17th-century pirate, crosses the Caribbean Sea to retrieve his ship, the Black Pearl, which was stolen by his rival Captain Barbossa.',
    release_date: '2003-07-09',
    runtime: 143,
    rating: 7.8,
    director: 'Gore Verbinski',
    cast: [
      { name: 'Johnny Depp', character: 'Captain Jack Sparrow', profile_url: 'https://image.tmdb.org/t/p/w185/ilPBHd3r3kahmAFXXHIbjtPEN23.jpg' },
      { name: 'Geoffrey Rush', character: 'Captain Hector Barbossa', profile_url: 'https://image.tmdb.org/t/p/w185/o2z36dM3f5M6j1d0h5N8q4N8q4N.jpg' },
      { name: 'Orlando Bloom', character: 'Will Turner', profile_url: 'https://image.tmdb.org/t/p/w185/kF2i3w8j4N7q6W4k2f5F7b2p6n2.jpg' },
      { name: 'Keira Knightley', character: 'Elizabeth Swann', profile_url: 'https://image.tmdb.org/t/p/w185/b6n7r8l5g4g5F4d2b5v4p6n2k8l.jpg' },
    ],
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'potc-2',
    franchise_id: 'pirates-of-the-caribbean',
    tmdb_id: 58,
    title: 'Pirates of the Caribbean: Dead Man\'s Chest',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/uXEqmloGyP7UXAiphJUu2v2pcuE.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8f9dnOtpArDrJOecg68dGzK2E3m.jpg',
    overview: 'Captain Jack Sparrow works his way out of a blood debt with the ghostly Davy Jones to avoid eternal damnation.',
    release_date: '2006-07-06',
    runtime: 151,
    rating: 7.4,
    director: 'Gore Verbinski',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'potc-3',
    franchise_id: 'pirates-of-the-caribbean',
    tmdb_id: 285,
    title: 'Pirates of the Caribbean: At World\'s End',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/6aUWe0GSl69wMTSWWexsorMIvwU.jpg',
    overview: 'Captain Barbossa, Will Turner and Elizabeth Swann must sail off the edge of the map, navigate treachery and betrayal, find Jack Sparrow, and make their final alliances for one last decisive battle.',
    release_date: '2007-05-19',
    runtime: 169,
    rating: 7.3,
    director: 'Gore Verbinski',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'potc-4',
    franchise_id: 'pirates-of-the-caribbean',
    tmdb_id: 1865,
    title: 'Pirates of the Caribbean: On Stranger Tides',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/keGfSvCmYj7CvdRx36OdVrAEibE.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/5bdHjmGH5csCWyTE8sTcG2JJcpP.jpg',
    overview: 'Captain Jack Sparrow crosses paths with a woman from his past, and he\'s not sure if it\'s love -- or if she\'s a ruthless con artist who\'s using him to find the fabled Fountain of Youth.',
    release_date: '2011-05-14',
    runtime: 136,
    rating: 6.5,
    director: 'Rob Marshall',
    providers: ['Disney+'],
  }),
  buildContent({
    id: 'potc-5',
    franchise_id: 'pirates-of-the-caribbean',
    tmdb_id: 166426,
    title: 'Pirates of the Caribbean: Dead Men Tell No Tales',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/6lAPOAFYFWIO3SQRemEY2wInQMC.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/5bdHjmGH5csCWyTE8sTcG2JJcpP.jpg',
    overview: 'Thrust into an all-new adventure, a down-on-his-luck Capt. Jack Sparrow feels the winds of ill-fortune blowing even more strongly when deadly ghost sailors led by his old nemesis, the evil Capt. Salazar, escape from the Devil\'s Triangle.',
    release_date: '2017-05-23',
    runtime: 129,
    rating: 6.6,
    director: 'Joachim Rønning, Espen Sandberg',
    providers: ['Disney+'],
  }),
];

const sortedPiratesForRelease = [...piratesContent].sort(compareReleaseDates);

export const piratesWatchOrders: WatchOrder[] = sortedPiratesForRelease.map((item, index) =>
  buildWatchOrder({
    id: `potc-rel-${index + 1}`,
    franchise_id: 'pirates-of-the-caribbean',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat([

  buildWatchOrder({ id: 'potc-chr-1', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-1', order_type: 'chronological', position: 1 }),
  buildWatchOrder({ id: 'potc-chr-2', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-2', order_type: 'chronological', position: 2 }),
  buildWatchOrder({ id: 'potc-chr-3', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-3', order_type: 'chronological', position: 3 }),
  buildWatchOrder({ id: 'potc-chr-4', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-4', order_type: 'chronological', position: 4 }),
  buildWatchOrder({ id: 'potc-chr-5', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-5', order_type: 'chronological', position: 5 }),

  // Recommended (Original Trilogy + later adventures)
  buildWatchOrder({ id: 'potc-rec-1', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-1', order_type: 'recommended', position: 1 }),
  buildWatchOrder({ id: 'potc-rec-2', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-2', order_type: 'recommended', position: 2 }),
  buildWatchOrder({ id: 'potc-rec-3', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-3', order_type: 'recommended', position: 3 }),
  buildWatchOrder({ id: 'potc-rec-4', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-4', order_type: 'recommended', position: 4 }),
  buildWatchOrder({ id: 'potc-rec-5', franchise_id: 'pirates-of-the-caribbean', content_id: 'potc-5', order_type: 'recommended', position: 5 }),
]);

export const franchise = piratesFranchise;
export const content = piratesContent;
export const watchOrders = piratesWatchOrders;
export const releaseOrder: WatchOrder[] = piratesWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = piratesWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = piratesWatchOrders.filter((o) => o.order_type === 'recommended');

