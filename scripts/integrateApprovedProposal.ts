import * as fs from 'fs';
import * as path from 'path';
import type { AnnouncementProposalPackage } from '../src/types/announcementDiscovery';
import { integrateApprovedProposal } from '../src/lib/catalogIntegrationService';

/**
 * CLI Tool: Approve and Integrate Staged Announcement Proposals into Production Catalog.
 * 
 * Usage:
 *   npx tsx scripts/integrateApprovedProposal.ts --id <proposal-id> [--approve] [--dry-run] [--reviewer <name>]
 *   npx tsx scripts/integrateApprovedProposal.ts --list
 *   npx tsx scripts/integrateApprovedProposal.ts --all-approved
 */

function main() {
  const args = process.argv.slice(2);
  const workspaceRoot = process.cwd();
  const proposalsPath = path.join(workspaceRoot, '.cineorder_announcement_proposals.json');

  console.log('========================================================================');
  console.log('  CINEORDER AUTOMATIC APPROVED ANNOUNCEMENT CATALOG INTEGRATION ENGINE  ');
  console.log('========================================================================\n');

  if (!fs.existsSync(proposalsPath)) {
    console.error(`❌ Proposal store not found at: ${proposalsPath}`);
    process.exit(1);
  }

  const proposals: AnnouncementProposalPackage[] = JSON.parse(fs.readFileSync(proposalsPath, 'utf-8'));

  if (args.includes('--list')) {
    console.log(`📋 Active Announcement Proposals in Staging Store (${proposals.length} total):\n`);
    for (const p of proposals) {
      console.log(` • [${p.status.toUpperCase().padEnd(8)}] ID: ${p.id.padEnd(45)} Franchise: ${p.franchiseName.padEnd(25)} Title: ${p.candidate.title}`);
    }
    console.log('');
    return;
  }

  const idIdx = args.indexOf('--id');
  const targetId = idIdx !== -1 && args[idIdx + 1] ? args[idIdx + 1] : null;
  const isAllApproved = args.includes('--all-approved');
  const doApprove = args.includes('--approve');
  const isDryRun = args.includes('--dry-run');

  const reviewerIdx = args.indexOf('--reviewer');
  const reviewer = reviewerIdx !== -1 && args[reviewerIdx + 1] ? args[reviewerIdx + 1] : 'Editorial Admin';

  if (!targetId && !isAllApproved) {
    console.log('ℹ️ Usage:');
    console.log('  npx tsx scripts/integrateApprovedProposal.ts --id <proposal-id> [--approve] [--dry-run]');
    console.log('  npx tsx scripts/integrateApprovedProposal.ts --list');
    console.log('  npx tsx scripts/integrateApprovedProposal.ts --all-approved [--dry-run]\n');
    return;
  }

  const targets = isAllApproved
    ? proposals.filter((p) => p.status === 'approved')
    : proposals.filter((p) => p.id === targetId);

  if (targets.length === 0) {
    console.error(`❌ No matching proposals found for target ${targetId ? `'${targetId}'` : 'approved queue'}.`);
    process.exit(1);
  }

  for (const pkg of targets) {
    console.log(`\n🔍 Processing Proposal Package: [${pkg.id}]`);
    console.log(`   Title:              ${pkg.candidate.title} (${pkg.candidate.mediaType.toUpperCase()})`);
    console.log(`   Franchise:          ${pkg.franchiseName} [${pkg.franchiseId}]`);
    console.log(`   Initial Status:     ${pkg.status.toUpperCase()}`);
    console.log(`   Source Credibility: ${pkg.sourceVerification.credibility} (Score: ${(pkg.sourceVerification.verificationScore * 100).toFixed(0)}%)`);
    console.log(`   Citation:           "${pkg.sourceVerification.citation}"`);

    if (pkg.status === 'pending') {
      if (doApprove) {
        console.log(`   ✏️ Explicit human approval granted by '${reviewer}'. Marking status: 'approved'...`);
        pkg.status = 'approved';
      } else {
        console.log(`   ⛔ Proposal is currently 'pending'. Automatic catalog integration requires explicit human approval.`);
        console.log(`   👉 Run with '--approve' flag to grant editorial approval.\n`);
        continue;
      }
    }

    console.log(`\n🚀 Initiating Automatic Catalog Integration Pipeline...`);
    const result = integrateApprovedProposal(pkg, {
      dryRun: isDryRun,
      reviewer,
      workspaceRoot,
      fsAdapter: {
        existsSync: (p: string) => fs.existsSync(p),
        readFileSync: (p: string, enc: string) => fs.readFileSync(p, enc as any),
        writeFileSync: (p: string, c: string, enc: string) => fs.writeFileSync(p, c, enc as any),
      },
    });

    if (result.success) {
      console.log(`   ✅ INTEGRATION SUCCESS: ${result.message}`);
      if (result.prPayload) {
        console.log(`\n📦 Generated GitHub Pull Request Metadata:`);
        console.log(`   - Branch: ${result.prPayload.branchName}`);
        console.log(`   - Title:  ${result.prPayload.prTitle}`);
        console.log(`   - Files:  ${result.prPayload.filesModified.join(', ')}`);
        console.log(`\n📄 Git Branch & PR Workflow Commands:`);
        for (const cmd of result.prPayload.gitCommands) {
          console.log(`     $ ${cmd}`);
        }
      }
    } else {
      console.error(`   ❌ INTEGRATION FAILED: ${result.message}`);
      if (result.rolledBack) {
        console.log(`   🛡️ Safety Guard: Disk modifications were safely rolled back.`);
      }
    }
  }

  console.log('\n========================================================================\n');
}

main();
