import {
  globalAnnouncementMonitor,
  CURATED_MONITOR_EVENTS,
} from '../src/lib/globalAnnouncementMonitor';

function runAnnouncementPipeline() {
  console.log('========================================================================');
  console.log('  CINEORDER GLOBAL CONTINUOUS ANNOUNCEMENT MONITOR & DISCOVERY PIPELINE ');
  console.log('========================================================================\n');

  console.log('🔍 Initiating global multi-franchise continuous monitor scan...');
  globalAnnouncementMonitor.resetState();
  const result = globalAnnouncementMonitor.processEvents(CURATED_MONITOR_EVENTS);

  console.log(`\n📊 Monitor Scan Telemetry:`);
  console.log(`   - Scan Timestamp:             ${result.scanTimestamp}`);
  console.log(`   - Total Events Processed:     ${result.totalAnnouncementsDiscovered}`);
  console.log(`   - Verified Official Sources:  ${result.verifiedAnnouncementsCount}`);
  console.log(`   - Unverified Rumors Rejected: ${result.rejectedRumorsCount}`);
  console.log(`   - Duplicates Blocked:         ${result.duplicatesBlockedCount}`);
  console.log(`   - Total Proposals Generated:  ${result.proposalsGenerated.length}`);

  console.log(`\n📂 Proposal Category Breakdown:`);
  for (const [category, count] of Object.entries(result.categoryBreakdown)) {
    console.log(`   • ${category.padEnd(25)} : ${count} proposal(s)`);
  }

  console.log(`\n📦 Franchise Distribution:`);
  for (const [franchiseId, count] of Object.entries(result.franchiseBreakdown)) {
    console.log(`   • ${franchiseId.padEnd(30)} : ${count} announcement(s)`);
  }

  console.log(`\n========================================================================`);
  console.log(`  DETAILED REVIEW OF CANDIDATE PROPOSALS (SAMPLE RUN)                   `);
  console.log(`========================================================================\n`);

  for (const pkg of result.proposalsGenerated) {
    const c = pkg.candidate;
    console.log(`🎬 Title:              ${c.title} (${c.mediaType.toUpperCase()})`);
    console.log(`   Category:           [${pkg.category}]`);
    console.log(`   Franchise:          ${pkg.franchiseName} [${c.franchiseId}]`);
    console.log(`   Canonical ID:       ${c.id}`);
    console.log(`   Expected Release:   ${c.releaseDate || 'TBA'}`);
    console.log(`   Lifecycle Category: ${c.lifecycleCategory}`);
    console.log(`   Source Credibility: ${c.sourceVerification.credibility} (Score: ${(c.sourceVerification.verificationScore * 100).toFixed(0)}%)`);
    console.log(`   Citation:           "${c.sourceVerification.citation}"`);

    if (pkg.diff) {
      console.log(`   Proposed Diff:      ${pkg.diff.fieldName} (${pkg.diff.previousValue} -> ${pkg.diff.proposedValue})`);
      console.log(`   Diff Summary:       "${pkg.diff.diffSummary}"`);
    }

    if (pkg.isConflict && pkg.conflictDetails) {
      console.log(`   ⚠️ Conflict:        Source A: ${pkg.conflictDetails.primaryValue} vs Source B: ${pkg.conflictDetails.conflictingValue}`);
    }

    console.log(`   Quality Score:      ${pkg.overallQualityScore}/100`);
    console.log('   ---------------------------------------------------------------------');
  }

  console.log('\n✅ Pipeline execution complete. All proposals staged for editorial review.\n');
}

runAnnouncementPipeline();
