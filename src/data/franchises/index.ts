import type { Franchise, Content, WatchOrder } from '@/types';

import { mcuFranchise, mcuContent, mcuWatchOrders } from './marvel';
import { starwarsFranchise, starwarsContent, starwarsWatchOrders } from './starwars';
import { harryPotterFranchise, harryPotterContent, harryPotterWatchOrders } from './harrypotter';
import { dceuFranchise, dceuContent, dceuWatchOrders } from './dc';
import { conjuringFranchise, conjuringContent, conjuringWatchOrders } from './conjuring';
import { fastAndFuriousFranchise, fastAndFuriousContent, fastAndFuriousWatchOrders } from './fastfurious';
import { johnWickFranchise, johnWickContent, johnWickWatchOrders } from './johnwick';
import { missionImpossibleFranchise, missionImpossibleContent, missionImpossibleWatchOrders } from './missionimpossible';
import { xmenFranchise, xmenContent, xmenWatchOrders } from './xmen';
import { jurassicParkFranchise, jurassicParkContent, jurassicParkWatchOrders } from './jurassic';
import { piratesFranchise, piratesContent, piratesWatchOrders } from './pirates';
import { transformersFranchise, transformersContent, transformersWatchOrders } from './transformers';
import { lotrFranchise, lotrContent, lotrWatchOrders } from './lotr';
import { theHobbitFranchise, theHobbitContent, theHobbitWatchOrders } from './thehobbit';
import { evilDeadFranchise, evilDeadContent, evilDeadWatchOrders } from './evildead';
import { insidiousFranchise, insidiousContent, insidiousWatchOrders } from './insidious';
import { avatarFranchise, avatarContent, avatarWatchOrders } from './avatar';
import { alienFranchise, alienContent, alienWatchOrders } from './alien';

export const allFranchises: Franchise[] = [
  mcuFranchise,
  starwarsFranchise,
  harryPotterFranchise,
  dceuFranchise,
  conjuringFranchise,
  fastAndFuriousFranchise,
  johnWickFranchise,
  missionImpossibleFranchise,
  xmenFranchise,
  jurassicParkFranchise,
  piratesFranchise,
  transformersFranchise,
  lotrFranchise,
  theHobbitFranchise,
  evilDeadFranchise,
  insidiousFranchise,
  avatarFranchise,
  alienFranchise,
];

export const allContent: Content[] = [
  ...mcuContent,
  ...starwarsContent,
  ...harryPotterContent,
  ...dceuContent,
  ...conjuringContent,
  ...fastAndFuriousContent,
  ...johnWickContent,
  ...missionImpossibleContent,
  ...xmenContent,
  ...jurassicParkContent,
  ...piratesContent,
  ...transformersContent,
  ...lotrContent,
  ...theHobbitContent,
  ...evilDeadContent,
  ...insidiousContent,
  ...avatarContent,
  ...alienContent,
];

export const allWatchOrders: WatchOrder[] = [
  ...mcuWatchOrders,
  ...starwarsWatchOrders,
  ...harryPotterWatchOrders,
  ...dceuWatchOrders,
  ...conjuringWatchOrders,
  ...fastAndFuriousWatchOrders,
  ...johnWickWatchOrders,
  ...missionImpossibleWatchOrders,
  ...xmenWatchOrders,
  ...jurassicParkWatchOrders,
  ...piratesWatchOrders,
  ...transformersWatchOrders,
  ...lotrWatchOrders,
  ...theHobbitWatchOrders,
  ...evilDeadWatchOrders,
  ...insidiousWatchOrders,
  ...avatarWatchOrders,
  ...alienWatchOrders,
];
