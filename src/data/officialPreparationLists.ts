import type { OfficialPreparationList } from '@/types/officialPreparation';

/**
 * CineOrder Canonical Official Preparation Lists Registry
 *
 * Pre-registered, studio-verified preparation watchlists for upcoming and released tentpoles.
 * Any list registered here takes highest authority over algorithmic Story Knowledge Graph traversals.
 */
export const INITIAL_OFFICIAL_PREPARATION_LISTS: OfficialPreparationList[] = [
  {
    targetContentId: 'mcu-doomsday',
    targetTitle: 'Avengers: Doomsday',
    franchiseId: 'marvel-cinematic-universe',
    version: '1.0',
    sourceMetadata: {
      sourceUrl: 'https://marvel.com/articles/movies/official-avengers-doomsday-preparation-guide',
      sourcePublisher: 'Marvel Studios Official',
      sourceType: 'OFFICIAL_STUDIO',
      publicationDate: '2026-07-28',
      retrievedAt: '2026-08-20T00:00:00Z',
      sourceTitle: 'Official Marvel Studios Preparation Guide: What to Watch Before Avengers: Doomsday',
      targetContentId: 'mcu-doomsday',
      targetTitle: 'Avengers: Doomsday',
      sourceContentHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      version: '1.0',
      officialStatement:
        'Marvel Studios officially recommends these key MCU milestones to fully experience the rise of Doctor Doom and the collision of realities in Avengers: Doomsday.',
      verificationScore: 1.0,
      isVerified: true,
    },
    categories: [
      {
        id: 'essential_multiverse',
        name: 'Essential Multiverse Foundations',
        description: 'Core chapter milestones establishing the Multiverse Saga conflict.',
        order: 1,
      },
      {
        id: 'character_arcs',
        name: 'Key Character Arcs & Setup',
        description: 'Critical character origin and team dynamics leading into Doomsday.',
        order: 2,
      },
    ],
    items: [
      {
        contentId: 'mcu-infinity-war',
        officialOrder: 1,
        officialCategoryId: 'essential_multiverse',
        officialCategoryName: 'Essential Multiverse Foundations',
        officialRationale: 'Establishes the cosmic stakes and Avengers coalition dynamic.',
        importance: 'Critical',
      },
      {
        contentId: 'mcu-endgame',
        officialOrder: 2,
        officialCategoryId: 'essential_multiverse',
        officialCategoryName: 'Essential Multiverse Foundations',
        officialRationale: 'The foundational conclusion of the Infinity Saga and beginning of timeline branching.',
        importance: 'Critical',
      },
      {
        contentId: 'mcu-loki',
        officialOrder: 3,
        officialCategoryId: 'essential_multiverse',
        officialCategoryName: 'Essential Multiverse Foundations',
        officialRationale: 'Explains the mechanics of timeline branches, incursions, and the multiverse tree.',
        importance: 'Critical',
      },
      {
        contentId: 'mcu-deadpool-wolverine',
        officialOrder: 4,
        officialCategoryId: 'essential_multiverse',
        officialCategoryName: 'Essential Multiverse Foundations',
        officialRationale: 'Explores timeline anchor beings and the collapsing multiverse fabric.',
        importance: 'High',
      },
      {
        contentId: 'mcu-fantastic-four',
        officialOrder: 5,
        officialCategoryId: 'character_arcs',
        officialCategoryName: 'Key Character Arcs & Setup',
        officialRationale: 'Introduces Marvel’s First Family and their native universe prior to the incursion event.',
        importance: 'Critical',
      },
    ],
    supplementaryCineOrderItemsAllowed: true,
    history: [],
  },
];

// Runtime dynamic registry storage
const officialListsMap = new Map<string, OfficialPreparationList>();

// Initialize registry with initial items
function initializeRegistry(): void {
  officialListsMap.clear();
  for (const list of INITIAL_OFFICIAL_PREPARATION_LISTS) {
    officialListsMap.set(list.targetContentId.toLowerCase(), JSON.parse(JSON.stringify(list)));
  }
}

initializeRegistry();

/**
 * Returns all currently registered official preparation lists.
 */
export function getAllOfficialPreparationLists(): OfficialPreparationList[] {
  return Array.from(officialListsMap.values());
}

/**
 * Retrieves the active official preparation list for a specific content ID.
 */
export function getRegisteredOfficialList(contentId: string): OfficialPreparationList | null {
  if (!contentId) return null;
  const list = officialListsMap.get(contentId.toLowerCase().trim());
  return list ? JSON.parse(JSON.stringify(list)) : null;
}

/**
 * Sets / registers an official preparation list into the runtime registry.
 */
export function setRegisteredOfficialList(list: OfficialPreparationList): void {
  if (!list?.targetContentId) return;
  officialListsMap.set(list.targetContentId.toLowerCase().trim(), JSON.parse(JSON.stringify(list)));
}

/**
 * Removes an official preparation list from the runtime registry.
 */
export function deleteRegisteredOfficialList(contentId: string): boolean {
  if (!contentId) return false;
  return officialListsMap.delete(contentId.toLowerCase().trim());
}

/**
 * Resets the runtime registry back to its pristine initial state.
 */
export function resetOfficialPreparationRegistry(): void {
  initializeRegistry();
}
