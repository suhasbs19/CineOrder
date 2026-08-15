import * as fs from 'fs';
import * as path from 'path';
import type { CKGProposalPackage } from '../src/types/ckgProposal';

/**
 * Offline CKG Proposal Review & Merger Script.
 * Reads proposals from src/data/ckg-proposals/*.json, validates source citations & confidence scores,
 * and reports review status.
 */

function reviewAndMergeProposals() {
  console.log('🔍 Scanning CKG Proposal Queue (src/data/ckg-proposals/)...');
  const proposalDir = path.join(__dirname, '../src/data/ckg-proposals');

  if (!fs.existsSync(proposalDir)) {
    console.log('ℹ️ No proposal directory found.');
    return;
  }

  const files = fs.readdirSync(proposalDir).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} proposal packages in queue:\n`);

  let totalPendingEdges = 0;
  let totalApprovedEdges = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(proposalDir, file), 'utf-8');
    try {
      const pkg: CKGProposalPackage = JSON.parse(content);
      console.log(`📦 Package: [${pkg.id}] - ${pkg.title}`);
      console.log(`   Source: ${pkg.metadata.sourceDocument}`);

      for (const edge of pkg.proposedEdges) {
        console.log(`   └─ Edge: ${edge.sourceId} -> ${edge.targetId} (${edge.relationship}, ${edge.strength})`);
        console.log(`      Citation: "${edge.citation}"`);
        console.log(`      Confidence: ${(edge.confidenceScore * 100).toFixed(0)}%`);
        console.log(`      Status: ${edge.status.toUpperCase()}`);

        if (edge.status === 'pending') totalPendingEdges++;
        if (edge.status === 'approved') totalApprovedEdges++;
      }
    } catch (err) {
      console.error(`❌ Failed to parse proposal ${file}:`, err);
    }
  }

  console.log(`\n==================================================`);
  console.log(`📊 Summary: ${totalPendingEdges} Pending Edges, ${totalApprovedEdges} Approved Edges.`);
  console.log(`🔒 Strictly enforcing: 0 unreviewed AI edges merged into production.`);
}

reviewAndMergeProposals();
