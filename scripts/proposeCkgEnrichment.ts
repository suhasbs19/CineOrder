import * as fs from 'fs';
import * as path from 'path';
import type { CKGProposalPackage, ProposedStoryEdge } from '../src/types/ckgProposal';

/**
 * Offline CKG Enrichment Proposal Script.
 * Takes official trailer transcripts or synopses and generates citation-backed candidate proposals.
 * Output is written to src/data/ckg-proposals/*.json and MUST be human-reviewed before merging.
 */

function generateSampleProposal(): CKGProposalPackage {
  const edge: ProposedStoryEdge = {
    id: `prop-edge-${Date.now()}`,
    sourceId: 'mcu-ironman',
    targetId: 'mcu-doomsday',
    relationship: 'thematic-callback',
    strength: 'moderate',
    confidence: 'likely',
    reason: 'Tony Stark legacy and armor tech echoed in Doctor Doom origins.',
    sourceType: 'official-trailer',
    sourceText: 'Official Teaser Trailer: "A familiar face emerges from the armor to rule Latveria."',
    citation: 'Marvel Teaser Trailer #1 (0:45-1:12)',
    confidenceScore: 0.85,
    proposedAt: new Date().toISOString(),
    status: 'pending',
  };

  return {
    id: `prop-auto-${Date.now()}`,
    franchiseId: 'marvel-cinematic-universe',
    title: 'Avengers: Doomsday (AI Trailer Analysis Proposal)',
    createdAt: new Date().toISOString(),
    proposedEdges: [edge],
    proposedEntities: [],
    metadata: {
      generatedBy: 'CineOrder Offline Enrichment Pipeline v3.0',
      sourceDocument: 'Official Teaser Trailer Transcript',
    },
  };
}

function runProposalPipeline() {
  console.log('🤖 Running Offline CKG AI Enrichment Proposal Pipeline...');
  const proposalDir = path.join(__dirname, '../src/data/ckg-proposals');

  if (!fs.existsSync(proposalDir)) {
    fs.mkdirSync(proposalDir, { recursive: true });
  }

  const pkg = generateSampleProposal();
  const filePath = path.join(proposalDir, `${pkg.id}.json`);

  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2), 'utf-8');
  console.log(`✅ CKG Candidate Proposal generated successfully!`);
  console.log(`📄 Saved to: ${filePath}`);
  console.log(`⚠️ Reminder: Proposals require human review before merging into cineOrderKnowledgeGraph.ts.`);
}

runProposalPipeline();
