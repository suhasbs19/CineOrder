import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';

export const harryPotterFranchise: Franchise = {
  id: 'harry-potter',
  name: 'Wizarding World (Harry Potter)',
  slug: 'harry-potter',
  description: 'The Wizarding World franchise began with Harry Potter, following a young wizard\'s journey through Hogwarts School of Witchcraft and Wizardry. Expanded with Fantastic Beasts prequels exploring the magical world\'s past.',
  poster_url: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
  banner_url: 'https://image.tmdb.org/t/p/w1280/hziiv14OpD73u9gAak4XDDfBKa2.jpg',
  tmdb_collection_id: 1241,
  total_movies: 11,
  total_series: 0,
  total_runtime: 1620,
  status: 'active',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

export const harryPotterContent: Content[] = [
  buildContent({
    id: 'hp-sorcerers-stone',
    franchise_id: 'harry-potter',
    tmdb_id: 671,
    title: 'Harry Potter and the Philosopher\'s Stone',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/hziiv14OpD73u9gAak4XDDfBKa2.jpg',
    overview: 'Harry Potter has lived under the stairs at his aunt and uncle\'s house his whole life. But on his 11th birthday, he learns he\'s a powerful wizard.',
    release_date: '2001-11-16',
    runtime: 152,
    rating: 7.9,
    director: 'Chris Columbus',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-chamber-of-secrets',
    franchise_id: 'harry-potter',
    tmdb_id: 672,
    title: 'Harry Potter and the Chamber of Secrets',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/8UCMuOivmX0k6Dq7R3tYmX5h6cE.jpg',
    overview: 'Cars fly, trees fight back, and a mysterious house-elf comes to warn Harry Potter at the start of his second year at Hogwarts.',
    release_date: '2002-11-13',
    runtime: 161,
    rating: 7.7,
    director: 'Chris Columbus',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-prisoner-of-azkaban',
    franchise_id: 'harry-potter',
    tmdb_id: 673,
    title: 'Harry Potter and the Prisoner of Azkaban',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/aWxwnYoe8p2d2fcxOqtvAtJ72Rw.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Harry, Ron and Hermione return to Hogwarts School of Witchcraft and Wizardry for their third year of study, where they delve into the mystery surrounding an escaped prisoner.',
    release_date: '2004-05-31',
    runtime: 141,
    rating: 8.0,
    director: 'Alfonso Cuarón',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-goblet-of-fire',
    franchise_id: 'harry-potter',
    tmdb_id: 674,
    title: 'Harry Potter and the Goblet of Fire',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/fECBtHlr0RB3foNHDiCBXeg9Bv9.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'When Harry Potter\'s name emerges from the Goblet of Fire, he becomes a competitor in a grueling battle for glory among three wizarding schools.',
    release_date: '2005-11-16',
    runtime: 157,
    rating: 7.8,
    director: 'Mike Newell',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-order-of-the-phoenix',
    franchise_id: 'harry-potter',
    tmdb_id: 675,
    title: 'Harry Potter and the Order of the Phoenix',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/5aOyriWkPec0zUDxmHFP9qMmBaj.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Returning for his fifth year of study at Hogwarts, Harry is shocked to find that the wizarding community is in denial about his recent encounter with the evil Lord Voldemort.',
    release_date: '2007-06-28',
    runtime: 138,
    rating: 7.7,
    director: 'David Yates',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-half-blood-prince',
    franchise_id: 'harry-potter',
    tmdb_id: 767,
    title: 'Harry Potter and the Half-Blood Prince',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/z7uo9zmQdQwU5ZJHFpv2Upl30i1.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'As Lord Voldemort tightens his grip on both the Muggle and wizarding worlds, Hogwarts is no longer a safe haven.',
    release_date: '2009-07-15',
    runtime: 153,
    rating: 7.7,
    director: 'David Yates',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-deathly-hallows-1',
    franchise_id: 'harry-potter',
    tmdb_id: 12444,
    title: 'Harry Potter and the Deathly Hallows: Part 1',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/iGoXIpQb7Pot00EEdwpwPajheZ5.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Harry, Ron and Hermione walk away from their last year at Hogwarts to find and destroy the remaining Horcruxes.',
    release_date: '2010-11-17',
    runtime: 146,
    rating: 7.8,
    director: 'David Yates',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-deathly-hallows-2',
    franchise_id: 'harry-potter',
    tmdb_id: 12445,
    title: 'Harry Potter and the Deathly Hallows: Part 2',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/c54HpQmuwXjHq2C9wmoACjxoom3.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Harry, Ron and Hermione continue their quest of finding and destroying Voldemort\'s three remaining Horcruxes, leading to the ultimate battle at Hogwarts.',
    release_date: '2011-07-13',
    runtime: 130,
    rating: 8.1,
    director: 'David Yates',
    providers: ['Max', 'Peacock'],
  }),
  buildContent({
    id: 'hp-fb-1',
    franchise_id: 'harry-potter',
    tmdb_id: 259316,
    title: 'Fantastic Beasts and Where to Find Them',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/fLsaFKExQt05yqjoAvKsmOMYvJR.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/6gIJuFHh5Lj4dNaPG3TzIMl7L68.jpg',
    overview: 'In 1926, Newt Scamander arrives at the Magical Congress of the United States of America with a magically expanded briefcase.',
    release_date: '2016-11-16',
    runtime: 133,
    rating: 7.2,
    director: 'David Yates',
    providers: ['Max'],
  }),
  buildContent({
    id: 'hp-fb-2',
    franchise_id: 'harry-potter',
    tmdb_id: 338952,
    title: 'Fantastic Beasts: The Crimes of Grindelwald',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/fMMrl8fD9gRCFJvsx0SuFwkEOop.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Gellert Grindelwald has escaped imprisonment and has begun gathering followers to his cause—elevating wizards above all non-magical beings.',
    release_date: '2018-11-14',
    runtime: 134,
    rating: 6.8,
    director: 'David Yates',
    providers: ['Max'],
  }),
  buildContent({
    id: 'hp-fb-3',
    franchise_id: 'harry-potter',
    tmdb_id: 338953,
    title: 'Fantastic Beasts: The Secrets of Dumbledore',
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/3c5GNLB4yRSLBby0trHoA1DSQxQ.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/a46LWeTWe6aUv2Nn5c6v7R8E9f0.jpg',
    overview: 'Professor Albus Dumbledore knows the powerful, dark wizard Gellert Grindelwald is moving to seize control of the wizarding world.',
    release_date: '2022-04-06',
    runtime: 142,
    rating: 6.7,
    director: 'David Yates',
    providers: ['Max'],
  }),
  buildContent({
    id: 'wizarding-world-harry-potter-tv',
    franchise_id: 'harry-potter',
    tmdb_id: 224377,
    title: 'Harry Potter TV Series',
    type: 'series',
    poster_url: 'https://image.tmdb.org/t/p/w500/SJCnXVBJZh7X7ePLt6XMp6TZAj.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/liHWCTCi3PK56P7fUJrxhu4OuJZ.jpg',
    overview: 'A faithful adaptation of J.K. Rowling’s iconic Harry Potter book series spanning a decade.',
    release_date: '2026-12-25',
    runtime: 60,
    episode_count: 10,
    season_count: 1,
    rating: 9.0,
    status: 'upcoming',
    providers: ['Max'],
  }),
];

export const harryPotterWatchOrders: WatchOrder[] = harryPotterContent.map((item, index) =>
  buildWatchOrder({
    id: `hp-rel-${index + 1}`,
    franchise_id: 'harry-potter',
    content_id: item.id,
    order_type: 'release',
    position: index + 1,
  })
).concat(
  [
    harryPotterContent[8], // FB 1
    harryPotterContent[9], // FB 2
    harryPotterContent[10], // FB 3
    harryPotterContent[0], // SS
    harryPotterContent[1], // CS
    harryPotterContent[2], // PA
    harryPotterContent[3], // GF
    harryPotterContent[4], // OP
    harryPotterContent[5], // HBP
    harryPotterContent[6], // DH1
    harryPotterContent[7], // DH2
    harryPotterContent[11], // TV Series
  ].map((item, index) =>
    buildWatchOrder({
      id: `hp-chr-${index + 1}`,
      franchise_id: 'harry-potter',
      content_id: item!.id,
      order_type: 'chronological',
      position: index + 1,
    })
  )
).concat(
  harryPotterContent.map((item, index) =>
    buildWatchOrder({
      id: `hp-rec-${index + 1}`,
      franchise_id: 'harry-potter',
      content_id: item.id,
      order_type: 'recommended',
      position: index + 1,
    })
  )
);

export const franchise = harryPotterFranchise;
export const content = harryPotterContent;
export const watchOrders = harryPotterWatchOrders;
export const releaseOrder: WatchOrder[] = harryPotterWatchOrders.filter((o) => o.order_type === 'release');
export const chronologicalOrder: WatchOrder[] = harryPotterWatchOrders.filter((o) => o.order_type === 'chronological');
export const recommendedOrder: WatchOrder[] = harryPotterWatchOrders.filter((o) => o.order_type === 'recommended');
