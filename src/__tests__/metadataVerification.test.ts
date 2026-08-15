import { allContent } from '../data/franchises/index';
import { buildContent } from '../data/franchises/utils';
import { normalizeTitleForMetadataComparison, isTitleEquivalent } from '../lib/utils';
import { verifyTitleMetadata } from '../lib/metadataVerifier';
import type { Content } from '../types';

declare const process: any;

console.log('========================================================================');
console.log('  CINEORDER GLOBAL TMDB METADATA VERIFICATION & DIAGNOSTICS REPAIR     ');
console.log('========================================================================\n');

let testFailures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
    testFailures++;
  }
}

async function runTests() {
  console.log('--- Step 1: Title Normalization Tests ---');
  assert(
    normalizeTitleForMetadataComparison('Iron Man') === 'iron man',
    'Exact title normalizes cleanly'
  );
  assert(
    normalizeTitleForMetadataComparison('The Conjuring: Last Rites') === normalizeTitleForMetadataComparison('The Conjuring Last Rites'),
    'Colon subtitle difference normalizes identically'
  );
  assert(
    normalizeTitleForMetadataComparison('Daredevil') === normalizeTitleForMetadataComparison("Marvel's Daredevil"),
    'Apostrophe and brand prefix normalizes identically'
  );
  assert(
    normalizeTitleForMetadataComparison('Spider-Man: Brand New Day') === normalizeTitleForMetadataComparison('Spider-Man Brand New Day'),
    'Hyphen and punctuation differences normalize identically'
  );
  assert(
    normalizeTitleForMetadataComparison("X-Men '97") === normalizeTitleForMetadataComparison("X-Men ’97"),
    'Curly Unicode quotes normalize identically'
  );
  assert(
    normalizeTitleForMetadataComparison('Evil Dead II') === normalizeTitleForMetadataComparison('Evil Dead 2'),
    'Roman numeral II converts to numeric digit 2'
  );
  assert(
    normalizeTitleForMetadataComparison('Insidious: Chapter 2') === normalizeTitleForMetadataComparison('Insidious Chapter 2'),
    'Chapter keyword & colon normalize identically'
  );
  assert(
    normalizeTitleForMetadataComparison('The Fantastic Four: First Steps') === normalizeTitleForMetadataComparison('The Fantastic 4: First Steps'),
    'Word number Four converts to digit 4'
  );

  console.log('\n--- Step 2: Title Equivalence Tests ---');
  assert(
    isTitleEquivalent('The Conjuring: Last Rites', 'The Conjuring Last Rites'),
    'The Conjuring: Last Rites is equivalent to The Conjuring Last Rites'
  );
  assert(
    isTitleEquivalent('Evil Dead II', 'Evil Dead 2'),
    'Evil Dead II is equivalent to Evil Dead 2'
  );
  assert(
    isTitleEquivalent('Ash vs Evil Dead', 'Ash vs. Evil Dead'),
    'Ash vs Evil Dead is equivalent to Ash vs. Evil Dead'
  );
  assert(
    isTitleEquivalent('Insidious: Chapter 2', 'Insidious Chapter 2'),
    'Insidious: Chapter 2 is equivalent to Insidious Chapter 2'
  );
  assert(
    isTitleEquivalent('Insidious: Chapter 3', 'Insidious Chapter 3'),
    'Insidious: Chapter 3 is equivalent to Insidious Chapter 3'
  );
  assert(
    isTitleEquivalent('Insidious: The Red Door', 'Insidious The Red Door'),
    'Insidious: The Red Door is equivalent to Insidious The Red Door'
  );
  assert(
    isTitleEquivalent('The Fantastic Four: First Steps', 'The Fantastic 4: First Steps'),
    'The Fantastic Four: First Steps is equivalent to The Fantastic 4: First Steps'
  );
  assert(
    isTitleEquivalent('Daredevil', "Marvel's Daredevil"),
    'Daredevil is equivalent to Marvel\'s Daredevil'
  );

  assert(
    !isTitleEquivalent('Evil Dead', 'Evil Dead II'),
    'Evil Dead is NOT equivalent to Evil Dead II (distinct films)'
  );
  assert(
    !isTitleEquivalent('Insidious', 'Insidious: Chapter 2'),
    'Insidious is NOT equivalent to Insidious: Chapter 2 (distinct films)'
  );
  assert(
    !isTitleEquivalent('Insidious: Chapter 2', 'Insidious: Chapter 3'),
    'Insidious: Chapter 2 is NOT equivalent to Insidious: Chapter 3 (distinct films)'
  );
  assert(
    !isTitleEquivalent('Insidious: Chapter 2', 'Furious 7'),
    'Insidious: Chapter 2 is NOT equivalent to Furious 7'
  );

  console.log('\n--- Step 3: Status Classification Tests ---');
  const pendingItem: Content = buildContent({
    id: 'test-pending',
    franchise_id: 'test-franchise',
    tmdb_id: null,
    title: 'Upcoming Untitled Project',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'An upcoming unannounced movie.',
    release_date: '2028-01-01',
    runtime: 120,
    rating: 0,
    status: 'upcoming',
  });

  const pendingResult = await verifyTitleMetadata(pendingItem);
  assert(pendingResult.status === 'Pending', 'Unreleased title without TMDB ID returns Pending');
  assert(pendingResult.reason === 'PENDING — Official TMDB metadata not yet verified', 'Pending reason matches specification');

  const failItem: Content = buildContent({
    id: 'test-released-no-id',
    franchise_id: 'test-franchise',
    tmdb_id: null,
    title: 'Old Released Movie',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'An old released movie missing TMDB ID.',
    release_date: '1990-01-01',
    runtime: 90,
    rating: 6.0,
    status: 'released',
  });

  const failResult = await verifyTitleMetadata(failItem);
  assert(failResult.status === 'Pending', 'Title without TMDB ID returns Pending');
  assert(failResult.reason === 'PENDING — Official TMDB metadata not yet verified', 'Pending reason matches specification');

  console.log('\n--- Step 4: Catalog Specific Titles Inspection ---');
  const requiredTitles = [
    { id: 'conj-last-rites', expectedTitle: 'The Conjuring: Last Rites', expectedTmdbId: 1038392 },
    { id: 'ed-2', expectedTitle: 'Evil Dead II', expectedTmdbId: 765 },
    { id: 'ed-ash-vs-ed', expectedTitle: 'Ash vs Evil Dead', expectedTmdbId: 62264 },
    { id: 'ins-2', expectedTitle: 'Insidious: Chapter 2', expectedTmdbId: 91586 },
    { id: 'ins-3', expectedTitle: 'Insidious: Chapter 3', expectedTmdbId: 280092 },
    { id: 'ins-5', expectedTitle: 'Insidious: The Red Door', expectedTmdbId: 614479 },
  ];

  for (const req of requiredTitles) {
    const item = allContent.find((c) => c.id === req.id);
    assert(Boolean(item), `Catalog item '${req.id}' exists`);
    assert(item?.title === req.expectedTitle, `Catalog item '${req.id}' title matches '${req.expectedTitle}'`);
    assert(item?.tmdb_id === req.expectedTmdbId, `Catalog item '${req.id}' tmdb_id matches '${req.expectedTmdbId}'`);
  }

  console.log('\n--- Step 5: Metadata Freshness Thresholds & Stale Age Tests ---');
  const { METADATA_FRESHNESS_WARNING_DAYS, METADATA_FRESHNESS_ERROR_DAYS } = await import('../types');
  assert(METADATA_FRESHNESS_WARNING_DAYS === 30, 'METADATA_FRESHNESS_WARNING_DAYS is set to 30 days');
  assert(METADATA_FRESHNESS_ERROR_DAYS === 90, 'METADATA_FRESHNESS_ERROR_DAYS is set to 90 days');

  const { validateDatasetIntegrity } = await import('../lib/datasetIntegrityValidator');
  const integrity = validateDatasetIntegrity();
  assert(integrity.valid === true, 'Dataset integrity has 0 error-level issues');

  console.log('\n========================================================================');
  if (testFailures > 0) {
    console.error(`❌ REGRESSION DETECTED: ${testFailures} tests failed!`);
    if (typeof process !== 'undefined') process.exit(1);
  } else {
    console.log('✅ ALL METADATA VERIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runTests();
