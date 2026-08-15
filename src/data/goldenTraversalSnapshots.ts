/**
 * Immutable Golden Recommendation Traversal Snapshots
 * Used for automated regression testing of CineOrder traversal engine outputs.
 */

export interface GoldenBenchmarkSnapshot {
  targetId: string;
  targetTitle: string;
  expectedMustWatch: string[];
  expectedRecommended: string[];
  expectedOptional: string[];
  expectedPostCredit: string[];
  expectedIsEntryPoint: boolean;
}

export const GOLDEN_TRAVERSAL_SNAPSHOTS: Record<string, GoldenBenchmarkSnapshot> = {
  'mcu-endgame': {
    targetId: 'mcu-endgame',
    targetTitle: 'Avengers: Endgame',
    expectedMustWatch: [
      'mcu-infinity-war',
      'mcu-ant-man-and-the-wasp',
      'mcu-thor-ragnarok',
      'mcu-gotg-1',
    ],
    expectedRecommended: [
      'mcu-civil-war',
      'mcu-winter-soldier',
      'mcu-ironman',
      'mcu-ironman2',
      'mcu-ironman3',
      'mcu-spider-man-homecoming',
    ],
    expectedOptional: [
      'mcu-avengers',
      'mcu-age-of-ultron',
      'mcu-thor-dark-world',
      'mcu-captain-america-1',
    ],
    expectedPostCredit: [],
    expectedIsEntryPoint: false,
  },
  'mcu-wandavision': {
    targetId: 'mcu-wandavision',
    targetTitle: 'WandaVision',
    expectedMustWatch: ['mcu-infinity-war', 'mcu-endgame'],
    expectedRecommended: ['mcu-civil-war', 'mcu-age-of-ultron'],
    expectedOptional: [],
    expectedPostCredit: [],
    expectedIsEntryPoint: false,
  },
  'mcu-tfatws': {
    targetId: 'mcu-tfatws',
    targetTitle: 'The Falcon and the Winter Soldier',
    expectedMustWatch: ['mcu-endgame', 'mcu-civil-war'],
    expectedRecommended: ['mcu-winter-soldier'],
    expectedOptional: [
      'mcu-ant-man',
      'mcu-infinity-war',
      'mcu-black-panther',
      'mcu-captain-america-1',
    ],
    expectedPostCredit: [],
    expectedIsEntryPoint: false,
  },
  'mcu-loki': {
    targetId: 'mcu-loki',
    targetTitle: 'Loki',
    expectedMustWatch: ['mcu-endgame'],
    expectedRecommended: [
      'mcu-thor',
      'mcu-thor-ragnarok',
      'mcu-thor-dark-world',
    ],
    expectedOptional: [
      'mcu-avengers',
    ],
    expectedPostCredit: [],
    expectedIsEntryPoint: false,
  },
  'mcu-black-widow': {
    targetId: 'mcu-black-widow',
    targetTitle: 'Black Widow',
    expectedMustWatch: ['mcu-civil-war'],
    expectedRecommended: [],
    expectedOptional: [
      'mcu-avengers',
      'mcu-winter-soldier',
      'mcu-age-of-ultron',
      'mcu-black-panther',
      'mcu-captain-america-1',
    ],
    expectedPostCredit: [],
    expectedIsEntryPoint: false,
  },
};
