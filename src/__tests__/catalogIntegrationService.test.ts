import type { AnnouncementProposalPackage } from '../types/announcementDiscovery';
import {
  FRANCHISE_FILE_MAP,
  FRANCHISE_ARRAY_MAP,
  validateProposalForIntegration,
  generatePullRequestPayload,
  transformFranchiseFileContent,
  integrateApprovedProposal,
  type FileSystemAdapter,
} from '../lib/catalogIntegrationService';
import { allContent, allFranchises } from '../data/franchises/index';

declare const process: { cwd: () => string; exit: (code: number) => void };

let passedAssertions = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(msg);
  }
  console.log(`✅ PASS: ${msg}`);
  passedAssertions++;
}

console.log('========================================================================');
console.log('  CINEORDER APPROVED ANNOUNCEMENT CATALOG INTEGRATION TEST SUITE        ');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: DYNAMIC FRANCHISE FILE & ARRAY MAPPINGS (ALL 18 FRANCHISES)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Dynamic Franchise File & Array Registry ---');

const canonicalFranchiseIds = [
  'marvel-cinematic-universe',
  'star-wars',
  'harry-potter',
  'dc-extended-universe',
  'the-conjuring-universe',
  'fast-and-furious',
  'john-wick',
  'mission-impossible',
  'x-men',
  'jurassic-park',
  'pirates-of-the-caribbean',
  'transformers',
  'lord-of-the-rings',
  'the-hobbit',
  'evil-dead',
  'insidious',
  'avatar',
  'alien',
];

for (const fId of canonicalFranchiseIds) {
  const filePath = FRANCHISE_FILE_MAP[fId];
  const arrayName = FRANCHISE_ARRAY_MAP[fId];
  assert(Boolean(filePath), `Franchise '${fId}' maps to valid source file path: ${filePath}`);
  assert(Boolean(arrayName), `Franchise '${fId}' maps to valid content array name: ${arrayName}`);
  assert(allFranchises.some((f) => f.id === fId), `Franchise '${fId}' is present in allFranchises registry`);
}

assert(FRANCHISE_FILE_MAP['dc-universe'] === 'src/data/franchises/dc.ts', `Alias 'dc-universe' maps to dc.ts`);
assert(FRANCHISE_FILE_MAP['the-lord-of-the-rings'] === 'src/data/franchises/lotr.ts', `Alias 'the-lord-of-the-rings' maps to lotr.ts`);

// -----------------------------------------------------------------------------
// SECTION 2: PRE-INTEGRATION VALIDATION & SAFETY GATES
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Pre-Integration Validation & Safety Gates ---');

const baseApprovedPackage: AnnouncementProposalPackage = {
  id: 'prop-test-avatar-sequel-3',
  title: '[NEW TITLE] Avatar: Fire and Ash',
  category: 'NEW_TITLES',
  eventType: 'NEW_ANNOUNCEMENT',
  franchiseId: 'avatar',
  franchiseName: 'Avatar',
  candidate: {
    id: 'avatar-fire-ash-test',
    franchiseId: 'avatar',
    title: 'Avatar: Fire and Ash',
    mediaType: 'movie',
    overview: 'Jake Sully and Neytiri encounter the Ash People.',
    releaseDate: '2025-12-19',
    theatricalReleaseDate: '2025-12-19',
    runtime: 190,
    rating: 8.5,
    status: 'upcoming',
    theatricalReleased: false,
    ottAvailable: false,
    digitalAvailable: false,
    subscriptionStreamingAvailable: false,
    providers: ['Disney+'],
    isCanon: true,
    isRequired: true,
    posterUrl: 'https://image.tmdb.org/t/p/w500/test.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/test.jpg',
    lifecycleCategory: 'UPCOMING',
    sourceVerification: {
      isVerified: true,
      credibility: 'official-studio-press',
      sourcePublisher: '20th Century Studios',
      citation: '20th Century Studios Official Announcement',
      verificationScore: 0.98,
      verificationNotes: 'Verified at D23 Expo',
      verifiedAt: '2026-08-15T12:00:00Z',
    },
    duplicateCheck: {
      isDuplicate: false,
    },
    proposedEdges: [],
    candidateGeneratedAt: '2026-08-15T12:00:00Z',
    integrityValidationPassed: true,
    integrityNotes: [],
  },
  sourceVerification: {
    isVerified: true,
    credibility: 'official-studio-press',
    sourcePublisher: '20th Century Studios',
    citation: '20th Century Studios Official Announcement',
    verificationScore: 0.98,
    verificationNotes: 'Verified at D23 Expo',
    verifiedAt: '2026-08-15T12:00:00Z',
  },
  status: 'approved',
  createdAt: '2026-08-15T12:00:00Z',
  overallQualityScore: 98,
  proposedEdges: [],
};

// 2.1 Approved proposal passes validation
const validRes = validateProposalForIntegration(baseApprovedPackage, allContent);
assert(validRes.isValid, 'Valid approved package passes pre-flight integration validation');
assert(validRes.errors.length === 0, 'Valid approved package has 0 validation errors');

// 2.2 Pending proposal is blocked
const pendingPackage: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  status: 'pending',
};
const pendingRes = validateProposalForIntegration(pendingPackage, allContent);
assert(!pendingRes.isValid, 'Pending proposal is blocked from catalog integration');
assert(pendingRes.errors.some((e) => e.includes("status is 'pending'")), 'Error notes human approval requirement');

// 2.3 Rejected proposal is blocked
const rejectedPackage: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  status: 'rejected',
};
const rejectedRes = validateProposalForIntegration(rejectedPackage, allContent);
assert(!rejectedRes.isValid, 'Rejected proposal is blocked from catalog integration');

// 2.4 Unverified rumor is blocked
const rumorPackage: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  sourceVerification: {
    isVerified: false,
    credibility: 'unverified-rumor',
    sourcePublisher: 'Rumor Blog',
    citation: 'Anonymous Blog Post',
    verificationScore: 0.35,
    verificationNotes: 'Unsubstantiated leak',
    verifiedAt: '2026-08-15T12:00:00Z',
  },
};
const rumorRes = validateProposalForIntegration(rumorPackage, allContent);
assert(!rumorRes.isValid, 'Unverified rumor is blocked from catalog integration');
assert(rumorRes.errors.some((e) => e.includes('Source verification failed')), 'Error notes verification score below threshold');

// 2.5 Duplicate title is blocked for NEW_TITLES
const duplicatePackage: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-iron-man', // Existing catalog ID
  },
};
const dupRes = validateProposalForIntegration(duplicatePackage, allContent);
assert(!dupRes.isValid, 'Duplicate candidate ID is blocked for NEW_TITLES');
assert(dupRes.errors.some((e) => e.includes('Duplicate title detected')), 'Error notes duplicate title detection');

// 2.6 Unrecognized franchise is blocked
const invalidFranchisePackage: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  franchiseId: 'nonexistent-universe',
};
const invFranchiseRes = validateProposalForIntegration(invalidFranchisePackage, allContent);
assert(!invFranchiseRes.isValid, 'Unrecognized franchise ID is blocked');
assert(invFranchiseRes.errors.some((e) => e.includes('Unrecognized franchiseId')), 'Error notes unmapped franchise file');

// 2.7 Pre-release title with premature OTT availability is blocked
const prematureOttPackage: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  candidate: {
    ...baseApprovedPackage.candidate,
    lifecycleCategory: 'UPCOMING',
    ottAvailable: true,
  },
};
const premOttRes = validateProposalForIntegration(prematureOttPackage, allContent);
assert(!premOttRes.isValid, 'Pre-release title with premature ott_available: true is blocked');

// -----------------------------------------------------------------------------
// SECTION 3: CODE TRANSFORMATION & INSERTION ENGINE
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Code Transformation & Insertion Engine ---');

const mockMarvelSource = `import type { Franchise, Content, WatchOrder } from '@/types';
import { buildContent, buildWatchOrder } from './utils';

export const mcuFranchise: Franchise = { id: 'marvel-cinematic-universe' };

export const mcuContent: Content[] = [
  buildContent({
    id: 'mcu-iron-man',
    franchise_id: 'marvel-cinematic-universe',
    tmdb_id: 1726,
    title: 'Iron Man',
    type: 'movie',
    poster_url: '/poster.jpg',
    backdrop_url: '/backdrop.jpg',
    release_date: '2008-05-02',
    runtime: 126,
    status: 'released',
    providers: ['Disney+'],
  }),
];

export const mcuWatchOrders: WatchOrder[] = [];
`;

// 3.1 NEW_TITLES insertion
const newTitlePkg: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  franchiseId: 'marvel-cinematic-universe',
  franchiseName: 'Marvel Cinematic Universe',
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-visionquest-test',
    franchiseId: 'marvel-cinematic-universe',
    title: 'VisionQuest Test',
    mediaType: 'series',
    releaseDate: '2026-10-14',
    providers: ['Disney+'],
  },
};

const newTitleTrans = transformFranchiseFileContent(mockMarvelSource, newTitlePkg);
assert(!newTitleTrans.error, 'NEW_TITLES transformed without error');
assert(newTitleTrans.modifiedCode.includes("id: 'mcu-visionquest-test'"), "Transformed code contains new item id: 'mcu-visionquest-test'");
assert(newTitleTrans.modifiedCode.includes("title: \"VisionQuest Test\""), 'Transformed code contains title: "VisionQuest Test"');
assert(newTitleTrans.modifiedCode.includes("type: 'series'"), "Transformed code contains type: 'series'");
assert(newTitleTrans.modifiedCode.includes("release_date: '2026-10-14'"), "Transformed code contains release_date: '2026-10-14'");
assert(newTitleTrans.modifiedCode.includes("id: 'mcu-iron-man'"), 'Original item is preserved in content array');

// 3.2 RELEASE_DATE_CHANGES transformation
const relDatePkg: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  category: 'RELEASE_DATE_CHANGES',
  franchiseId: 'marvel-cinematic-universe',
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-iron-man',
    releaseDate: '2008-05-15',
    theatricalReleaseDate: '2008-05-15',
  },
};
const relDateTrans = transformFranchiseFileContent(mockMarvelSource, relDatePkg);
assert(!relDateTrans.error, 'RELEASE_DATE_CHANGES transformed without error');
assert(relDateTrans.modifiedCode.includes("release_date: '2008-05-15'"), 'Release date updated to proposed date');

// 3.3 OTT_CHANGES transformation
const ottPkg: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  category: 'OTT_CHANGES',
  franchiseId: 'marvel-cinematic-universe',
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-iron-man',
    providers: ['Disney+', 'Prime Video'],
    ottAvailable: true,
  },
};
const ottTrans = transformFranchiseFileContent(mockMarvelSource, ottPkg);
assert(!ottTrans.error, 'OTT_CHANGES transformed without error');
assert(ottTrans.modifiedCode.includes('["Disney+","Prime Video"]'), 'Providers updated to new array');

// 3.4 CANCELLATIONS transformation
const cancelPkg: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  category: 'CANCELLATIONS',
  franchiseId: 'marvel-cinematic-universe',
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-iron-man',
    status: 'cancelled',
  },
};
const cancelTrans = transformFranchiseFileContent(mockMarvelSource, cancelPkg);
assert(!cancelTrans.error, 'CANCELLATIONS transformed without error');
assert(cancelTrans.modifiedCode.includes("status: 'cancelled'"), "Status updated to 'cancelled'");

// 3.5 TITLE_CHANGES transformation
const renamePkg: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  category: 'TITLE_CHANGES',
  franchiseId: 'marvel-cinematic-universe',
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-iron-man',
    title: 'Iron Man: The First Armored Avenger',
  },
};
const renameTrans = transformFranchiseFileContent(mockMarvelSource, renamePkg);
assert(!renameTrans.error, 'TITLE_CHANGES transformed without error');
assert(renameTrans.modifiedCode.includes('"Iron Man: The First Armored Avenger"'), 'Title updated to new name');

// -----------------------------------------------------------------------------
// SECTION 4: GITHUB PULL REQUEST PAYLOAD GENERATION
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: GitHub Pull Request Payload Generation ---');

const prPayload = generatePullRequestPayload(newTitlePkg, 'Senior Editorial Admin');
assert(prPayload.branchName === 'announcement/test-avatar-sequel-3', `Branch name formatted: ${prPayload.branchName}`);
assert(prPayload.prTitle.includes("[Approved Announcement] Add 'VisionQuest Test' to Marvel Cinematic Universe Catalog"), `PR Title formatted: ${prPayload.prTitle}`);
assert(prPayload.prBody.includes('## 🎬 Editorial Approved Announcement Integration'), 'PR Body contains markdown summary');
assert(prPayload.prBody.includes('Senior Editorial Admin'), 'PR Body notes reviewer name');
assert(prPayload.prBody.includes('Automated Validation Checklist'), 'PR Body includes automated validation checklist');
assert(prPayload.filesModified.includes('src/data/franchises/marvel.ts'), 'PR payload filesModified includes target franchise file');
assert(prPayload.gitCommands.length === 4, 'PR payload provides 4 git workflow commands');

// -----------------------------------------------------------------------------
// SECTION 5: DRY RUN & AUTOMATIC ROLLBACK PROTECTION (WITH IN-MEMORY FS ADAPTER)
// -----------------------------------------------------------------------------
console.log('\n--- Section 5: Dry Run & Automatic Rollback Protection ---');

class MockFileSystemAdapter implements FileSystemAdapter {
  private files: Record<string, string> = {};

  constructor(initialFiles: Record<string, string> = {}) {
    this.files = { ...initialFiles };
  }

  private normalize(p: string): string {
    const norm = p.replace(/\\/g, '/');
    if (norm.includes('src/data/franchises/marvel.ts')) return 'src/data/franchises/marvel.ts';
    if (norm.includes('.cineorder_announcement_proposals.json')) return '.cineorder_announcement_proposals.json';
    return norm;
  }

  existsSync(p: string): boolean {
    return this.normalize(p) in this.files || p in this.files;
  }

  readFileSync(p: string, _enc: string): string {
    const k = this.normalize(p);
    const val = this.files[k] ?? this.files[p];
    if (val === undefined) throw new Error(`File not found: ${p}`);
    return val;
  }

  writeFileSync(p: string, content: string, _enc: string): void {
    const k = this.normalize(p);
    this.files[k] = content;
    this.files[p] = content;
  }

  getFile(p: string): string | undefined {
    return this.files[this.normalize(p)] ?? this.files[p];
  }
}

const mockFs = new MockFileSystemAdapter({
  'src/data/franchises/marvel.ts': mockMarvelSource,
  '.cineorder_announcement_proposals.json': JSON.stringify([newTitlePkg]),
});

// 5.1 Dry run execution
const dryRunRes = integrateApprovedProposal(newTitlePkg, {
  dryRun: true,
  reviewer: 'Reviewer Test',
  fsAdapter: mockFs,
});
assert(dryRunRes.success, 'Dry run execution succeeded');
assert(dryRunRes.targetFile === 'src/data/franchises/marvel.ts', 'Target file correctly identified as marvel.ts');
assert(Boolean(dryRunRes.prPayload), 'Dry run returns valid PR payload');

// 5.2 Rollback on validation failure
const rollbackPkg: AnnouncementProposalPackage = {
  ...baseApprovedPackage,
  franchiseId: 'marvel-cinematic-universe',
  candidate: {
    ...baseApprovedPackage.candidate,
    id: 'mcu-rollback-synthetic-item',
    franchiseId: 'marvel-cinematic-universe',
    title: 'Rollback Synthetic Title',
  },
};

const rollbackRes = integrateApprovedProposal(rollbackPkg, {
  dryRun: false,
  fsAdapter: mockFs,
  validateCallback: () => ({
    success: false,
    error: 'Synthetic validation simulated failure for rollback test',
  }),
});

assert(!rollbackRes.success, 'Integration fails when validation check fails');
assert(rollbackRes.rolledBack === true, 'Target file is safely rolled back to original state');
assert(rollbackRes.message.includes('safely rolled back'), 'Message confirms safe rollback');

// Verify mock file was not corrupted and does not contain the synthetic item
const marvelAfterRollback = mockFs.getFile('src/data/franchises/marvel.ts') || '';
assert(!marvelAfterRollback.includes('mcu-rollback-synthetic-item'), 'marvel.ts does NOT contain rolled-back synthetic item');

// 5.3 Successful write execution with mock FS
const successRes = integrateApprovedProposal(newTitlePkg, {
  dryRun: false,
  reviewer: 'Lead Reviewer',
  fsAdapter: mockFs,
});
assert(successRes.success, 'Successful integration returns success: true');
const marvelAfterSuccess = mockFs.getFile('src/data/franchises/marvel.ts') || '';
assert(marvelAfterSuccess.includes("id: 'mcu-visionquest-test'"), 'marvel.ts now contains new item after successful integration');

// -----------------------------------------------------------------------------
// SECTION 6: DIAGNOSIS OF VISIONQUEST PROPOSAL
// -----------------------------------------------------------------------------
console.log('\n--- Section 6: Diagnosis of VisionQuest Announcement ---');

const visionProposalPackage: AnnouncementProposalPackage = {
  id: 'prop-new-1786821977211-mcu-visionquest',
  franchiseId: 'marvel-cinematic-universe',
  franchiseName: 'Marvel Cinematic Universe',
  title: '[NEW TITLE] VisionQuest',
  category: 'NEW_TITLES',
  eventType: 'NEW_ANNOUNCEMENT',
  candidate: {
    id: 'mcu-visionquest',
    title: 'VisionQuest',
    franchiseId: 'marvel-cinematic-universe',
    mediaType: 'series',
    overview: 'Paul Bettany returns as White Vision exploring his memories and identity.',
    releaseDate: '2026-10-14',
    theatricalReleaseDate: '2026-10-14',
    runtime: 50,
    rating: 8.5,
    status: 'upcoming',
    theatricalReleased: false,
    ottAvailable: false,
    digitalAvailable: false,
    subscriptionStreamingAvailable: false,
    providers: ['Disney+'],
    isCanon: true,
    isRequired: true,
    posterUrl: '/placeholder-poster.svg',
    backdropUrl: '/placeholder-backdrop.svg',
    lifecycleCategory: 'UPCOMING',
    sourceVerification: {
      isVerified: true,
      credibility: 'official-studio-press',
      sourcePublisher: 'Marvel Studios Official',
      citation: 'Marvel Studios Official TV Production Announcement at SDCC',
      verificationScore: 0.98,
      verificationNotes: 'Verified at SDCC Marvel Studios Hall H panel',
      verifiedAt: '2026-08-15T12:00:00Z',
    },
    duplicateCheck: {
      isDuplicate: false,
    },
    proposedEdges: [],
    candidateGeneratedAt: '2026-08-15T12:00:00Z',
    integrityValidationPassed: true,
    integrityNotes: [],
  },
  sourceVerification: {
    isVerified: true,
    credibility: 'official-studio-press',
    sourcePublisher: 'Marvel Studios Official',
    citation: 'Marvel Studios Official TV Production Announcement at SDCC',
    verificationScore: 0.98,
    verificationNotes: 'Verified at SDCC Marvel Studios Hall H panel',
    verifiedAt: '2026-08-15T12:00:00Z',
  },
  status: 'pending',
  createdAt: '2026-08-15T12:00:00Z',
  overallQualityScore: 98,
  proposedEdges: [],
};

assert(visionProposalPackage.candidate.title === 'VisionQuest', "Candidate title is 'VisionQuest'");
assert(visionProposalPackage.franchiseId === 'marvel-cinematic-universe', "Franchise is 'marvel-cinematic-universe'");
assert(visionProposalPackage.sourceVerification.isVerified === true, 'Source verification is true');
assert(visionProposalPackage.sourceVerification.verificationScore >= 0.95, 'Source verification score is >= 95%');
assert(visionProposalPackage.status === 'pending', "Status is currently 'pending' (Awaiting human approval)");
assert(visionProposalPackage.candidate.lifecycleCategory === 'UPCOMING', "Lifecycle category is 'UPCOMING'");
assert(visionProposalPackage.candidate.releaseDate === '2026-10-14', "Release date is '2026-10-14'");

// Test approval validation on visionProposal against pre-integration catalog baseline
const preCatalog = allContent.filter((c) => c.id !== 'mcu-visionquest');
const approvedVision = { ...visionProposalPackage, status: 'approved' as const };
const valResult = validateProposalForIntegration(approvedVision, preCatalog);
assert(valResult.isValid, "VisionQuest passes pre-integration validation when marked 'approved'");

// Verify duplicate prevention against current catalog containing VisionQuest
const dupCheck = validateProposalForIntegration(approvedVision, allContent);
assert(!dupCheck.isValid, 'VisionQuest is safely blocked from duplicate insertion when already in allContent');
assert(dupCheck.errors.some((e) => e.includes('Duplicate title detected')), 'Duplicate title detection error is verified');

console.log('\n========================================================================');
console.log(`  INTEGRATION SUITE: ✅ ALL ${passedAssertions} ASSERTIONS PASSED SUCCESSFULLY`);
console.log('========================================================================\n');
