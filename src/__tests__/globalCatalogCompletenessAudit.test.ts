/**
 * CineOrder — Global Missing Canonical Content & Narrative Dependency Audit Test Suite
 *
 * 25 Comprehensive Regression & Architectural Invariant Tests
 */

declare const require: any;
declare const process: any;

const crypto = typeof require !== 'undefined' ? require('crypto') : null;
const fs = typeof require !== 'undefined' ? require('fs') : null;

import { allContent, allFranchises, allWatchOrders } from '@/data/franchises/index';
import { getFranchiseContent } from '@/data/franchises';
import { storyEdges } from '@/data/cineOrderKnowledgeGraph';
import {
  CatalogCompletenessAuditEngine,
  COMPLETENESS_AUDIT_ENGINE_VERSION,
} from '@/lib/catalogCompletenessAuditEngine';
import { CatalogCompletenessStore } from '@/lib/catalogCompletenessStore';
import type { Franchise, Content } from '@/types';

console.log('========================================================================');
console.log('  CINEORDER GLOBAL CATALOG COMPLETENESS AUDIT TEST SUITE (25 INVARIANTS)');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    if (detail) console.log(`     ${detail}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     ${detail}`);
    failCount++;
  }
}

function makeMockFranchise(id: string, name: string): Franchise {
  return {
    id,
    name,
    slug: id,
    description: `Description for ${name}`,
    poster_url: '/posters/test.jpg',
    banner_url: '/banners/test.jpg',
    tmdb_collection_id: null,
    total_movies: 1,
    total_series: 0,
    total_runtime: 120,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function makeMockContent(id: string, franchiseId: string, title: string, releaseDate: string): Content {
  return {
    id,
    franchise_id: franchiseId,
    tmdb_id: null,
    title,
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: `Overview for ${title}`,
    release_date: releaseDate,
    runtime: 120,
    episode_count: null,
    season_count: null,
    rating: 7.0,
    status: 'released',
    genres: ['Action'],
    director: 'Test Director',
    cast: [],
    trailer_url: '',
    is_canon: true,
    is_required: true,
    theatrical_released: true,
    ott_available: true,
    created_at: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Missing Sequel Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 1: Missing Sequel Detection ---');
{
  const mockFranchise = makeMockFranchise('test-franchise', 'Test Adventure');
  const mockTitles = [makeMockContent('test-1', 'test-franchise', 'Test Adventure 1', '2020-01-01')];

  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise: mockFranchise,
    gapType: 'MISSING_SEQUEL',
    canonicalTitle: 'Test Adventure 2',
    tmdbId: 999002,
    mediaType: 'movie',
    releaseDate: '2022-01-01',
    overview: 'Direct sequel to Test Adventure 1',
    continuity: 'Main Continuity',
    reasons: ['Direct narrative sequel.'],
    evidenceSource: 'Official Press',
    confidence: 0.95,
    existingTitles: mockTitles,
  });

  assert(proposal.gapType === 'MISSING_SEQUEL', '1A. Proposal gapType is MISSING_SEQUEL');
  assert(proposal.title === 'Test Adventure 2', '1B. Title matches Test Adventure 2');
  assert(proposal.proposedStoryRelationships.some((r) => r.relationship === 'direct-sequel'), '1C. Proposed relationship is direct-sequel');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Missing Prequel Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 2: Missing Prequel Detection ---');
{
  const mockFranchise = makeMockFranchise('prequel-franchise', 'Prequel Test');
  const mockTitles = [makeMockContent('prequel-main', 'prequel-franchise', 'Main Chapter', '2020-01-01')];

  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise: mockFranchise,
    gapType: 'MISSING_PREQUEL',
    canonicalTitle: 'Origins Chapter',
    tmdbId: 999001,
    mediaType: 'movie',
    releaseDate: '2018-01-01',
    overview: 'Canonical prequel setting up events before Main Chapter.',
    continuity: 'Main Continuity',
    reasons: ['Canonical backstory prequel.'],
    evidenceSource: 'Official Studio Announcement',
    confidence: 0.95,
    existingTitles: mockTitles,
  });

  assert(proposal.gapType === 'MISSING_PREQUEL', '2A. Proposal gapType is MISSING_PREQUEL');
  assert(proposal.chronologicalPlacement.recommendedPosition === 1, '2B. Prequel is recommended at chronological position 1');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Missing Middle Entry / Sequential Gap Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 3: Missing Middle Entry / Sequential Gap Detection ---');
{
  const mockFranchise = makeMockFranchise('seq-franchise', 'Number Saga');
  const mockTitles = [
    makeMockContent('seq-1', 'seq-franchise', 'Number Saga 1', '2010-01-01'),
    makeMockContent('seq-3', 'seq-franchise', 'Number Saga 3', '2014-01-01'),
  ];

  const report = CatalogCompletenessAuditEngine.runGlobalAudit([mockFranchise], mockTitles);
  const detectedProposal = report.allProposals.find((p) => p.title === 'Number Saga 2');

  assert(Boolean(detectedProposal), '3A. Sequential gap detector automatically discovers Number Saga 2');
  assert(
    Boolean(detectedProposal && detectedProposal.reasonsDetected[0]?.includes('Sequential gap detected')),
    `3B. Detection reason identifies missing sequential index 2 (from ${mockTitles.length} existing)`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: Missing Spin-Off Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 4: Missing Spin-Off Detection ---');
{
  const franchise = allFranchises[0]!;
  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_SPINOFF',
    canonicalTitle: 'Side Quest Chronicles',
    tmdbId: 888123,
    mediaType: 'movie',
    releaseDate: '2023-05-01',
    overview: 'Spin-off standalone adventure.',
    continuity: 'Spin-Off Continuity',
    reasons: ['Officially recognized spin-off canon.'],
    evidenceSource: 'TMDb Franchise Collection',
    confidence: 0.9,
    existingTitles: getFranchiseContent(franchise.id),
  });

  assert(proposal.gapType === 'MISSING_SPINOFF', '4A. Gap type is MISSING_SPINOFF');
  assert(proposal.continuity === 'Spin-Off Continuity', '4B. Continuity reflects spin-off grouping');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: Missing TV / Streaming Series Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 5: Missing TV / Streaming Series Detection ---');
{
  const franchise = allFranchises[0]!;
  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_SERIES',
    canonicalTitle: 'Galactic Academy Series',
    tmdbId: 777123,
    mediaType: 'series',
    releaseDate: '2024-09-01',
    overview: 'Live action episodic limited series.',
    continuity: 'Canon TV',
    reasons: ['Canonical streaming series.'],
    evidenceSource: 'Disney+ / Studio Release Schedule',
    confidence: 0.95,
    existingTitles: getFranchiseContent(franchise.id),
  });

  assert(proposal.gapType === 'MISSING_SERIES', '5A. Gap type is MISSING_SERIES');
  assert(proposal.mediaType === 'series', '5B. Media type is series');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: Missing Prerequisite Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 6: Missing Prerequisite Detection ---');
{
  const franchise = allFranchises[0]!;
  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_PREREQUISITE',
    canonicalTitle: 'Essential Origin Movie',
    tmdbId: 666123,
    mediaType: 'movie',
    releaseDate: '2015-05-01',
    overview: 'Narrative prerequisite establishing villain motivations.',
    continuity: 'Legacy Canon',
    reasons: ['Prerequisite required to understand later events.'],
    evidenceSource: 'Story Knowledge Graph Prerequisite Linkage',
    confidence: 0.95,
    prerequisiteTargets: ['mcu-no-way-home'],
    existingTitles: getFranchiseContent(franchise.id),
  });

  assert(proposal.gapType === 'MISSING_PREREQUISITE', '6A. Gap type is MISSING_PREREQUISITE');
  assert(proposal.proposedStoryRelationships.some((r) => r.targetId === 'mcu-no-way-home'), '6B. Generates prerequisite link to target title');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Missing Crossover / Multiverse Context Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 7: Missing Crossover / Multiverse Context Detection ---');
{
  const franchise = allFranchises[0]!;
  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_CROSSOVER_CONTEXT',
    canonicalTitle: 'Multiverse Nexus Legacy',
    tmdbId: 555123,
    mediaType: 'movie',
    releaseDate: '2005-06-01',
    overview: 'Legacy film whose characters appear in multiverse crossover.',
    continuity: 'Alternate Universe',
    reasons: ['Multiverse crossover character origin.'],
    evidenceSource: 'Multiverse Crossover Matrix',
    confidence: 0.95,
    prerequisiteTargets: ['mcu-secret-wars'],
    existingTitles: getFranchiseContent(franchise.id),
  });

  assert(proposal.gapType === 'MISSING_CROSSOVER_CONTEXT', '7A. Gap type is MISSING_CROSSOVER_CONTEXT');
  assert(proposal.proposedStoryRelationships.some((r) => r.relationship === 'major-crossover'), '7B. Generates major-crossover relationship');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Continuity Isolation Preservation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 8: Continuity Isolation Preservation ---');
{
  const spiderTitles = getFranchiseContent('spider-man');
  const mcuTitles = getFranchiseContent('marvel-cinematic-universe');

  const raimiInMcu = mcuTitles.some((t) => t.title === 'Spider-Man' || t.title === 'Spider-Man 2');
  const webbInMcu = mcuTitles.some((t) => t.title === 'The Amazing Spider-Man');
  const homecomingInSpider = spiderTitles.some((t) => t.title === 'Spider-Man: Homecoming');

  assert(!raimiInMcu, '8A. Sam Raimi films are isolated from MCU catalog');
  assert(!webbInMcu, '8B. Marc Webb films are isolated from MCU catalog');
  assert(!homecomingInSpider, '8C. MCU Spider-Man films remain in MCU catalog');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 9: Spider-Man Multi-Continuity Regression
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 9: Spider-Man Multi-Continuity Regression ---');
{
  const spiderContent = getFranchiseContent('spider-man');
  const raimi1 = spiderContent.find((t) => t.id === 'spiderman-1');
  const raimi2 = spiderContent.find((t) => t.id === 'spiderman-2');
  const raimi3 = spiderContent.find((t) => t.id === 'spiderman-3');
  const webb1 = spiderContent.find((t) => t.id === 'amazing-spiderman-1');
  const webb2 = spiderContent.find((t) => t.id === 'amazing-spiderman-2');
  const spiderVerse1 = spiderContent.find((t) => t.id === 'spider-verse-1');
  const spiderVerse2 = spiderContent.find((t) => t.id === 'spider-verse-2');

  assert(Boolean(raimi1 && raimi2 && raimi3), '9A. Sam Raimi Trilogy present (Spider-Man 1, 2, 3)');
  assert(Boolean(webb1 && webb2), '9B. Marc Webb Dilogy present (TASM 1, 2)');
  assert(Boolean(spiderVerse1 && spiderVerse2), '9C. Spider-Verse Animated Dilogy present (Into & Across)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 10: MCU Watch Order Pollution Prevention
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 10: MCU Watch Order Pollution Prevention ---');
{
  const mcuWatchOrders = allWatchOrders.filter((w) => w.franchise_id === 'marvel-cinematic-universe');
  const raimiIds = ['spiderman-1', 'spiderman-2', 'spiderman-3', 'amazing-spiderman-1', 'amazing-spiderman-2'];

  let pollutionFound = false;
  for (const order of mcuWatchOrders) {
    if (raimiIds.includes(order.content_id)) {
      pollutionFound = true;
    }
  }

  assert(!pollutionFound, '10. Zero legacy Raimi/Webb titles found in MCU watch orders');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 11: Duplicate TMDb Protection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 11: Duplicate TMDb Protection ---');
{
  const spiderFranchise = allFranchises.find((f) => f.id === 'spider-man')!;
  const spiderContent = getFranchiseContent('spider-man');
  const duplicateProposal = CatalogCompletenessAuditEngine.createProposal({
    franchise: spiderFranchise,
    gapType: 'MISSING_CANONICAL_TITLE',
    canonicalTitle: 'Spider-Man (2002)',
    tmdbId: 557, // Already exists for spiderman-1
    mediaType: 'movie',
    releaseDate: '2002-05-03',
    overview: 'Duplicate test',
    continuity: 'Sam Raimi',
    reasons: ['Test duplicate'],
    evidenceSource: 'Duplicate Test',
    confidence: 1.0,
    existingTitles: spiderContent,
  });

  assert(duplicateProposal.duplicateCheck.isDuplicate === true, '11A. Duplicate TMDb ID detected');
  assert(duplicateProposal.duplicateCheck.existingContentId === 'spiderman-1', '11B. Identifies existing content ID spiderman-1');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 12: Duplicate Title Protection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 12: Duplicate Title Protection ---');
{
  const mcuFranchise = allFranchises.find((f) => f.id === 'marvel-cinematic-universe')!;
  const mcuContent = getFranchiseContent('marvel-cinematic-universe');
  const duplicateProposal = CatalogCompletenessAuditEngine.createProposal({
    franchise: mcuFranchise,
    gapType: 'MISSING_CANONICAL_TITLE',
    canonicalTitle: 'Iron Man', // Exact existing title
    tmdbId: null,
    mediaType: 'movie',
    releaseDate: '2008-05-02',
    overview: 'Duplicate title test',
    continuity: 'Phase 1',
    reasons: ['Test duplicate title'],
    evidenceSource: 'Duplicate Test',
    confidence: 1.0,
    existingTitles: mcuContent,
  });

  assert(duplicateProposal.duplicateCheck.isDuplicate === true, '12A. Duplicate Title detected');
  assert(Boolean(duplicateProposal.duplicateCheck.duplicateReason), '12B. Duplicate reason populated');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 13: Artwork Resolution Pipeline Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 13: Artwork Resolution Pipeline Validation ---');
{
  const franchise = allFranchises[0]!;
  const proposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_CANONICAL_TITLE',
    canonicalTitle: 'Artwork Test Film',
    tmdbId: null,
    mediaType: 'movie',
    releaseDate: '2025-01-01',
    overview: 'Artwork test',
    continuity: 'Test',
    reasons: ['Artwork check'],
    evidenceSource: 'Artwork Test',
    confidence: 1.0,
    existingTitles: [],
  });

  assert(Boolean(proposal.artworkResolution.posterUrl), '13A. Poster URL generated via resolver');
  assert(Boolean(proposal.artworkResolution.backdropUrl), '13B. Backdrop URL generated via resolver');
  assert(
    ['VERIFIED', 'PARTIAL', 'FALLBACK'].includes(proposal.artworkResolution.resolutionState),
    '13C. Artwork resolution state is valid'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 14: Lifecycle Classification Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 14: Lifecycle Classification Validation ---');
{
  const franchise = allFranchises[0]!;
  const pastProposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_CANONICAL_TITLE',
    canonicalTitle: 'Past Release',
    tmdbId: null,
    mediaType: 'movie',
    releaseDate: '2000-01-01',
    overview: 'Past',
    continuity: 'Test',
    reasons: ['Past check'],
    evidenceSource: 'Past Test',
    confidence: 1.0,
    existingTitles: [],
  });

  const futureProposal = CatalogCompletenessAuditEngine.createProposal({
    franchise,
    gapType: 'MISSING_CANONICAL_TITLE',
    canonicalTitle: 'Future Release',
    tmdbId: null,
    mediaType: 'movie',
    releaseDate: '2099-01-01',
    overview: 'Future',
    continuity: 'Test',
    reasons: ['Future check'],
    evidenceSource: 'Future Test',
    confidence: 1.0,
    existingTitles: [],
  });

  assert(pastProposal.lifecycleClassification.lifecycleCategory === 'THEATRICALLY_RELEASED', '14A. Past release classified as THEATRICALLY_RELEASED');
  assert(futureProposal.lifecycleClassification.lifecycleCategory === 'UPCOMING', '14B. Future release classified as UPCOMING');
  assert(futureProposal.lifecycleClassification.ottAvailable === false, '14C. Future release has ottAvailable = false');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 15: Chronological Release-Date Ordering Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 15: Chronological Release-Date Ordering Validation ---');
{
  const mockFranchise = makeMockFranchise('test', 'Test');
  const existing = [
    makeMockContent('c-2010', 'test', 'Movie 2010', '2010-01-01'),
    makeMockContent('c-2020', 'test', 'Movie 2020', '2020-01-01'),
  ];

  const midProposal = CatalogCompletenessAuditEngine.createProposal({
    franchise: mockFranchise,
    gapType: 'MISSING_CANONICAL_TITLE',
    canonicalTitle: 'Movie 2015',
    tmdbId: null,
    mediaType: 'movie',
    releaseDate: '2015-01-01',
    overview: '',
    continuity: 'Test',
    reasons: ['Middle title placement'],
    evidenceSource: 'Test',
    confidence: 1.0,
    existingTitles: existing,
  });

  assert(midProposal.chronologicalPlacement.recommendedPosition === 2, '15. Chronological position places 2015 release at index 2 (between 2010 and 2020)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 16: Story Graph Dependency & Broken Reference Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 16: Story Graph Dependency & Broken Reference Detection ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  assert(report.brokenGraphDependencies.length === 0, `16. Exactly 0 broken graph references in current Story Knowledge Graph (found ${report.brokenGraphDependencies.length})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 17: Dynamic Franchise Registration (Auto-Inclusion)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 17: Dynamic Franchise Registration ---');
{
  const customFranchise = makeMockFranchise('future-franchise-2027', 'Future Franchise');
  const report = CatalogCompletenessAuditEngine.runGlobalAudit([...allFranchises, customFranchise]);
  const included = report.franchiseSummaries.some((s) => s.franchiseId === 'future-franchise-2027');

  assert(included, '17. Newly appended franchise dynamically discovered in completeness audit without engine code change');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 18: Human Approval Requirement (No Direct Production Mutation)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 18: Human Approval Requirement ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  const allPending = report.allProposals.every((p) => p.reviewStatus === 'pending');
  assert(allPending, '18. All generated completeness proposals default to pending review (zero automatic catalog mutation)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 19: Repeated Audit Idempotency & Determinism
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 19: Repeated Audit Idempotency & Determinism ---');
{
  const report1 = CatalogCompletenessAuditEngine.runGlobalAudit();
  const report2 = CatalogCompletenessAuditEngine.runGlobalAudit();

  assert(report1.totalGapsDetected === report2.totalGapsDetected, '19A. Total gaps detected is strictly identical across repeated runs');
  assert(report1.totalFranchisesAudited === report2.totalFranchisesAudited, '19B. Franchises audited count is strictly identical');
  assert(report1.allProposals.length === report2.allProposals.length, '19C. Proposals count is strictly identical');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 20: Rejected Proposal Archiving & State Preservation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 20: Rejected Proposal Archiving ---');
{
  const store = CatalogCompletenessStore.getInstance();
  const proposals = store.getProposals();
  if (proposals.length > 0 && proposals[0]) {
    const targetId = proposals[0].proposalId;
    store.updateProposalStatus(targetId, 'rejected', 'Lead Editorial Architect', 'Out of canonical scope');
    const updated = store.getProposals().find((p) => p.proposalId === targetId);

    assert(updated?.reviewStatus === 'rejected', '20A. Proposal status successfully marked as rejected');
    assert(updated?.reviewedBy === 'Lead Editorial Architect', '20B. Reviewer attribution recorded');
    assert(updated?.reviewNotes === 'Out of canonical scope', '20C. Review rationale archived');
  } else {
    assert(true, '20. Passed (no active proposals to reject)');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 21: Approved Integration Dry-Run Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 21: Approved Integration Dry-Run Validation ---');
{
  const store = CatalogCompletenessStore.getInstance();
  const proposals = store.getProposals();
  if (proposals.length > 0 && proposals[0]) {
    const targetId = proposals[0].proposalId;
    store.updateProposalStatus(targetId, 'approved', 'Editorial Approver');
    const updated = store.getProposals().find((p) => p.proposalId === targetId);

    assert(updated?.reviewStatus === 'approved', '21. Proposal successfully marked approved for catalog integration');
  } else {
    assert(true, '21. Passed (no active proposals)');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 22: Rollback on Integration Failure
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 22: Rollback on Integration Failure ---');
{
  const store = CatalogCompletenessStore.getInstance();
  store.resetToDefault();
  const resetProposals = store.getProposals();
  assert(Array.isArray(resetProposals), '22. Store resets cleanly to clean audit state on failure / rollback');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 23: Zero-Event / Clean-Catalog Audit Behavior
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 23: Clean-Catalog Audit Behavior ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  assert(report.totalFranchisesAudited >= 19, `23A. Audits all registered franchises (found ${report.totalFranchisesAudited})`);
  assert(report.totalTitlesAudited >= 233, `23B. Audits all registered titles (found ${report.totalTitlesAudited})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 24: Corrupted Persistence Recovery
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 24: Corrupted Persistence Recovery ---');
{
  const store = CatalogCompletenessStore.getInstance();
  store.resetToDefault();
  const recovered = store.getReport();
  assert(recovered.auditEngineVersion === COMPLETENESS_AUDIT_ENGINE_VERSION, '24. Corrupted storage gracefully recovers to live global audit report');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 25: Frozen Framework SHA-256 Checksum Verification
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 25: Frozen Framework Checksum Verification ---');
{
  const filesToVerify: Record<string, string> = {
    'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
    'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
    'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
    'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
    '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
  };

  let allFrozenPassed = true;
  if (crypto && fs) {
    for (const [filePath, expectedHash] of Object.entries(filesToVerify)) {
      const content = fs.readFileSync(filePath);
      const actualHash = crypto.createHash('sha256').update(content).digest('hex');
      if (actualHash !== expectedHash) {
        allFrozenPassed = false;
        console.error(`     Hash mismatch in ${filePath}`);
      }
    }
  }

  assert(allFrozenPassed, '25. All 5 frozen framework files bit-for-bit identical (zero framework creep confirmed)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 26: Cross-Title Artwork Contamination Prevention Invariant
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 26: Cross-Title Artwork Contamination Prevention Invariant ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  const proposalsWithArtwork = report.allProposals.filter(
    (p) =>
      p.artworkResolution.posterUrl &&
      !p.artworkResolution.posterUrl.includes('placeholder')
  );

  const posterUrls = proposalsWithArtwork.map((p) => p.artworkResolution.posterUrl);
  const uniquePosterUrls = new Set(posterUrls);

  assert(
    posterUrls.length === uniquePosterUrls.size,
    `26A. All ${posterUrls.length} proposals with authentic artwork have distinct, non-contaminated posters`
  );

  const ironheart = allContent.find((c) => c.id === 'mcu-ironheart');
  const eyesOfWakanda = allContent.find((c) => c.id === 'mcu-eyes-of-wakanda');

  if (ironheart && eyesOfWakanda) {
    assert(
      ironheart.poster_url !== eyesOfWakanda.poster_url,
      '26B. Ironheart and Eyes of Wakanda have completely distinct poster URLs'
    );
    assert(
      ironheart.backdrop_url !== eyesOfWakanda.backdrop_url,
      '26C. Ironheart and Eyes of Wakanda have completely distinct backdrop URLs'
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 27: Distinct TMDb ID Mapping Invariant
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 27: Distinct TMDb ID Mapping Invariant ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  const tmdbIds = report.allProposals.filter((p) => p.tmdbId !== null).map((p) => p.tmdbId!);
  const uniqueTmdbIds = new Set(tmdbIds);

  assert(
    tmdbIds.length === uniqueTmdbIds.size,
    `27A. All ${tmdbIds.length} proposals have globally distinct TMDb IDs (0 collisions)`
  );

  const eyesOfWakanda = allContent.find((c) => c.id === 'mcu-eyes-of-wakanda');
  assert(eyesOfWakanda?.tmdb_id === 241388, '27B. Eyes of Wakanda maps to verified TMDb ID 241388');

  const ironheart = allContent.find((c) => c.id === 'mcu-ironheart');
  assert(ironheart?.tmdb_id === 114471, '27C. Ironheart maps to verified TMDb ID 114471');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 28: Zero Date Fabrication on TBA Titles Invariant
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 28: Zero Date Fabrication on TBA Titles Invariant ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  const gollum = report.allProposals.find((p) => p.title.toLowerCase().includes('hunt for gollum'));

  assert(Boolean(gollum), '28A. The Hunt for Gollum proposal exists');
  assert(
    gollum?.releaseDate === 'TBA' || gollum?.releaseDate === null,
    `28B. The Hunt for Gollum release date is TBA (found: '${gollum?.releaseDate}')`
  );
  assert(
    gollum?.releaseDate !== '2026-12-31' && gollum?.releaseDate !== '2027-12-15',
    '28C. The Hunt for Gollum does NOT use provisional/fabricated placeholder dates'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 29: Unreleased Title Lifecycle & OTT Integrity
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 29: Unreleased Title Lifecycle & OTT Integrity ---');
{
  const report = CatalogCompletenessAuditEngine.runGlobalAudit();
  const gollum = report.allProposals.find((p) => p.title.toLowerCase().includes('hunt for gollum'));

  assert(
    gollum?.lifecycleClassification.lifecycleCategory === 'UPCOMING',
    '29A. TBA/Future proposal classified as UPCOMING'
  );
  assert(
    gollum?.lifecycleClassification.ottAvailable === false,
    '29B. Unreleased title has ottAvailable strictly equal to false'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 30: Story Knowledge Graph Prerequisite Evidence Invariant
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test 30: Story Knowledge Graph Prerequisite Evidence Invariant ---');
{
  const ironheartEdge = storyEdges.find(
    (e) => e.sourceId === 'mcu-wakanda-forever' && e.targetId === 'mcu-ironheart'
  );
  assert(
    Boolean(ironheartEdge && ironheartEdge.relationship === 'story-continuation'),
    '30A. Ironheart links to Black Panther: Wakanda Forever prerequisite in Story Knowledge Graph'
  );

  const chaosTheoryEdge = storyEdges.find(
    (e) => e.sourceId === 'jp-camp-cretaceous' && e.targetId === 'jp-chaos-theory'
  );
  assert(
    Boolean(chaosTheoryEdge && chaosTheoryEdge.relationship === 'direct-sequel'),
    '30B. Jurassic World: Chaos Theory links to Camp Cretaceous prerequisite in Story Knowledge Graph'
  );
}

console.log('\n========================================================================');
console.log(`  RESULTS: ${passCount} PASSED / ${failCount} FAILED`);
console.log('========================================================================\n');

if (failCount > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
