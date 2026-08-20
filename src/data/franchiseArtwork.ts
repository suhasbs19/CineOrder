import { allFranchises } from './franchises/index';

export interface FranchiseArtworkConfig {
  franchise_id: string;
  poster: string;
  banner: string;
  logo: string;
}

export const franchiseArtworkMap: Record<string, FranchiseArtworkConfig> = {
  'marvel-cinematic-universe': {
    franchise_id: 'marvel-cinematic-universe',
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/muth4OYamE2aB116Z9y2yFRm2fW.jpg',
    logo: '/logos/marvel-cinematic-universe.svg',
  },
  'star-wars': {
    franchise_id: 'star-wars',
    poster: 'https://image.tmdb.org/t/p/w500/db32LaOibwEliAmSL2jjDF6oDdj.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/p2fRZzxla6NoBmIH03yKrGZq7BE.jpg',
    logo: '/logos/star-wars.svg',
  },
  'harry-potter': {
    franchise_id: 'harry-potter',
    poster: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/hziiv14OpD73u9gAak4XDDfBKa2.jpg',
    logo: '/logos/harry-potter.svg',
  },
  'dc-extended-universe': {
    franchise_id: 'dc-extended-universe',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/tMefBSGv6WvBGexXhYkjKW8hC9v.jpg',
    logo: '/logos/dc-extended-universe.svg',
  },
  'the-conjuring-universe': {
    franchise_id: 'the-conjuring-universe',
    poster: 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/5nwbkY81B7C5m2J6bE6d.jpg',
    logo: '/logos/the-conjuring-universe.svg',
  },
  'fast-and-furious': {
    franchise_id: 'fast-and-furious',
    poster: 'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg',
    logo: '/logos/fast-and-furious.svg',
  },
  'john-wick': {
    franchise_id: 'john-wick',
    poster: 'https://image.tmdb.org/t/p/w500/sm7rZZivZm2NhJDucFf3gpfFdVt.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/fSwYa5q2xRkBoOOjueLpkLf3N1m.jpg',
    logo: '/logos/john-wick.svg',
  },
  'mission-impossible': {
    franchise_id: 'mission-impossible',
    poster: 'https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
    logo: '/logos/mission-impossible.svg',
  },
  'x-men': {
    franchise_id: 'x-men',
    poster: 'https://image.tmdb.org/t/p/w500/31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/ykVHlrE3aSvHYeIXOrWDsYZ18vv.jpg',
    logo: '/logos/x-men.svg',
  },
  'jurassic-park': {
    franchise_id: 'jurassic-park',
    poster: 'https://image.tmdb.org/t/p/w500/9i3plLl89DHMz7mahksDaAo7HIS.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/9e3y2n57n84e3W92x9h4n55K.jpg',
    logo: '/logos/jurassic-park.svg',
  },
  'pirates-of-the-caribbean': {
    franchise_id: 'pirates-of-the-caribbean',
    poster: 'https://image.tmdb.org/t/p/w500/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/wxgD3fB5lQ2sGJLog0rvXW049Pf.jpg',
    logo: '/logos/pirates-of-the-caribbean.svg',
  },
  'transformers': {
    franchise_id: 'transformers',
    poster: 'https://image.tmdb.org/t/p/w500/nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/zvZBNNDWd5LcsIBpDhJyCB2MDT7.jpg',
    logo: '/logos/transformers.svg',
  },
  'lord-of-the-rings': {
    franchise_id: 'lord-of-the-rings',
    poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg',
    logo: '/logos/lord-of-the-rings.svg',
  },
  'the-hobbit': {
    franchise_id: 'the-hobbit',
    poster: 'https://image.tmdb.org/t/p/w500/hQghXOjSS2xfzx9XnMyZqt8brCF.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/7wO7MSnP5UcwR2cTHdJFF1vP4Ie.jpg',
    logo: '/logos/the-hobbit.svg',
  },
  'evil-dead': {
    franchise_id: 'evil-dead',
    poster: 'https://image.tmdb.org/t/p/w500/eWFADubShlTEUiNsPcN6BMOKakr.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/377E9KSoUGxKWuvyR1Zu9aXcU4I.jpg',
    logo: '/logos/evil-dead.svg',
  },
  'insidious': {
    franchise_id: 'insidious',
    poster: 'https://image.tmdb.org/t/p/w500/1egpmVXuXed58TH2UOnX1nATTrf.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/tJvRdhlkonjBLBUpTqp0RPPujxJ.jpg',
    logo: '/logos/insidious.svg',
  },
  'avatar': {
    franchise_id: 'avatar',
    poster: 'https://image.tmdb.org/t/p/w500/3C5brXxnBxfkeKWwA1Fh4xvy4wr.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/4uwX70EzaWVcGUXMtXPoexlNAff.jpg',
    logo: '/logos/avatar.svg',
  },
  'alien': {
    franchise_id: 'alien',
    poster: 'https://image.tmdb.org/t/p/w500/gWFHIY77cRVoBRGERwMHqpD27gc.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/6X42JnSMdo3dPAswOHUuvebdTq7.jpg',
    logo: '/logos/alien.svg',
  },
  'spider-man': {
    franchise_id: 'spider-man',
    poster: 'https://image.tmdb.org/t/p/w500/gh4c2ubi14WogAhvCDvceFkexIF.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/sWvxBXviRvmOpNq6rLShyW25b42.jpg',
    logo: '/logos/spider-man.svg',
  },
};

export function getFranchiseArtwork(franchiseId: string): FranchiseArtworkConfig {
  if (franchiseArtworkMap[franchiseId]) {
    return franchiseArtworkMap[franchiseId];
  }

  const found = allFranchises.find((f) => f.id === franchiseId);
  const poster = (found?.poster_url || '').trim() || '/placeholder-poster.svg';
  const banner = (found?.banner_url || '').trim() || '/placeholder-backdrop.svg';
  const logo = found?.slug ? `/logos/${found.slug}.svg` : `/logos/${franchiseId}.svg`;

  return {
    franchise_id: franchiseId,
    poster,
    banner,
    logo,
  };
}
