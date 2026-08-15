/**
 * scripts/runEditorialComparison.ts
 *
 * CLI runner for the CineOrder Editorial Comparison Engine.
 *
 * Usage:
 *   tsx scripts/runEditorialComparison.ts [options]
 *
 * Options:
 *   --target <titleId>         Compare a single target title (default: all titles)
 *   --csv                      Also write a CSV export to reports/comparison.csv
 *   --json                     Also write the full report JSON to reports/comparison.json
 *   --simulate <key=delta,...> Simulate calibration adjustments (comma-separated)
 *                              Example: --simulate "story-continuation=+4,shared-event=-12"
 *   --quiet                    Print only the summary (no per-title details)
 *
 * Examples:
 *   tsx scripts/runEditorialComparison.ts
 *   tsx scripts/runEditorialComparison.ts --target "mcu-iron-man"
 *   tsx scripts/runEditorialComparison.ts --csv --json
 *   tsx scripts/runEditorialComparison.ts --simulate "story-continuation=4,shared-event=-12"
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'local-dev';
  }
}

import {
  compareEntireKnowledgeGraph,
  compareEngineWithEditorial,
  simulateCalibration,
  generateMarkdownReport,
  generateSingleTargetMarkdownReport,
  generateCSVExport,
  generateExecutiveSummary,
  generateOverrideHealthJson,
  generateOverrideHealthMd,
} from '../src/lib/editorialComparisonEngine';

import { cineOrderKnowledgeGraph } from '../src/data/cineOrderKnowledgeGraph';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

const targetId  = getArg('--target');
const outputCsv = hasFlag('--csv');
const outputJson = hasFlag('--json');
const quiet     = hasFlag('--quiet');
const simArg    = getArg('--simulate');

// ---------------------------------------------------------------------------
// Parse simulation overrides
// ---------------------------------------------------------------------------

function parseSimulationOverrides(raw: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const pair of raw.split(',')) {
    const [key, valStr] = pair.trim().split('=');
    const val = Number(valStr?.replace('+', ''));
    if (key && !isNaN(val)) result[key.trim()] = val;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

const REPORTS_DIR = path.join(process.cwd(), 'reports');

function ensureReportsDir(): void {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function writeCsv(csv: string): void {
  ensureReportsDir();
  const outPath = path.join(REPORTS_DIR, 'comparison.csv');
  fs.writeFileSync(outPath, csv, 'utf-8');
  console.log(`\nCSV exported → ${outPath}`);
}

function writeJson(data: unknown): void {
  ensureReportsDir();
  const outPath = path.join(REPORTS_DIR, 'comparison.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`JSON exported → ${outPath}`);
}

function writeMd(md: string, filename: string = 'comparison.md'): void {
  ensureReportsDir();
  const outPath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(outPath, md, 'utf-8');
  console.log(`Markdown report → ${outPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function printSummaryLine(label: string, value: string | number): void {
  const l = String(label).padEnd(40, '.');
  console.log(`  ${l} ${value}`);
}

async function main(): Promise<void> {
  console.log('\n────────────────────────────────────────────────────────');
  console.log(' CineOrder Editorial Comparison Engine');
  console.log('────────────────────────────────────────────────────────\n');

  // ── Single-title mode ──
  if (targetId) {
    console.log(`Running single-title comparison for: ${targetId}\n`);
    const report = compareEngineWithEditorial(targetId);

    if (!report) {
      console.error(`Error: No traversal result for targetId "${targetId}". Check the ID against cineOrderKnowledgeGraph.titleNodes.`);
      process.exit(1);
    }

    console.log(generateSingleTargetMarkdownReport(report));

    console.log('\n── Summary ──');
    printSummaryLine('Accuracy',               `${report.accuracy}%`);
    printSummaryLine('Total recommendations',  report.totalRecommendations);
    printSummaryLine('Matching',               report.matchingRecommendations);
    printSummaryLine('Mismatches',             report.mismatches);
    printSummaryLine('Average Drift',          report.averageDrift);
    printSummaryLine('Max Drift',              report.maxDrift);
    printSummaryLine('Has Editorial Override', report.hasEditorialOverride ? 'Yes' : 'No');

    console.log('\n── Precision / Recall / F1 by Category ──');
    for (const cat of ['must_watch', 'recommended', 'optional', 'post_credit', 'safe_to_skip'] as const) {
      printSummaryLine(
        cat,
        `P:${report.precision[cat] ?? 0}%  R:${report.recall[cat] ?? 0}%  F1:${report.f1[cat] ?? 0}%`
      );
    }

    process.exit(0);
  }



  // ── Global mode ──
  console.log('Running global comparison across all Knowledge Graph title nodes...');
  console.log('(This may take a few seconds)\n');

  const startTime = Date.now();

  let prevSnapshot: any = undefined;
  const snapshotPath = path.join(REPORTS_DIR, 'snapshot.json');
  if (fs.existsSync(snapshotPath)) {
    try {
      prevSnapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    } catch { /* ignore */ }
  }

  const gitCommit = getGitCommitHash();
  const durationMs = Date.now() - startTime;
  const globalReport = compareEntireKnowledgeGraph(prevSnapshot, { gitCommit, durationMs });

  // Regression trend
  if (globalReport.previousAccuracy !== undefined && globalReport.accuracyDelta !== undefined) {
    const trend = globalReport.accuracyTrend === '+' ? '▲' : globalReport.accuracyTrend === '-' ? '▼' : '─';
    console.log(
      `Regression: Previous ${globalReport.previousAccuracy}% → Today ${globalReport.overallAccuracy}%  ` +
      `${trend} ${globalReport.accuracyDelta >= 0 ? '+' : ''}${globalReport.accuracyDelta}%\n`
    );
  }

  // Global summary
  console.log('── Global Summary ──');
  printSummaryLine('Overall Accuracy',        `${globalReport.overallAccuracy}%`);
  printSummaryLine('Overall Drift',           globalReport.overallDrift);
  printSummaryLine('Titles Analysed',         globalReport.titlesAnalyzed);
  printSummaryLine('Total Recommendations',   globalReport.totalRecommendations);
  printSummaryLine('Matching',                globalReport.matchingRecommendations);
  printSummaryLine('Mismatches',              globalReport.mismatches);

  // Coverage report
  const cr = globalReport.coverageReport;
  console.log('\n── Coverage Report ──');
  printSummaryLine('Titles With Overrides',                    cr.titlesWithOverrides);
  printSummaryLine('Titles Without Overrides',                 cr.titlesWithoutOverrides);
  printSummaryLine('Engine-Found Recommendations',             cr.totalEngineFound);
  printSummaryLine('Override-Injected Recommendations',        cr.totalOverrideInjected);
  printSummaryLine('Engine Accuracy (all titles, BFS-found)',  `${cr.engineAccuracy}%`);
  printSummaryLine('Engine Accuracy (override titles only)',   `${cr.engineAccuracyOnOverrideTitles}%`);
  // Recommendation Evidence Coverage
  const totalEdges = cineOrderKnowledgeGraph.edges.length;
  const edgesWithEvidence = cineOrderKnowledgeGraph.edges.filter((e) => !!e.recommendationEvidence).length;
  const fallbackGraphEdges = totalEdges - edgesWithEvidence;
  const evidenceCoveragePct = totalEdges > 0 ? ((edgesWithEvidence / totalEdges) * 100).toFixed(1) : '0';

  console.log('\n── Recommendation Evidence Coverage ──');
  printSummaryLine('Total Graph Edges',                       totalEdges);
  printSummaryLine('Edges with Editorial Evidence',           `${edgesWithEvidence} (${evidenceCoveragePct}%)`);
  printSummaryLine('Fallback Graph Evidence',                 `${fallbackGraphEdges} (${(100 - Number(evidenceCoveragePct)).toFixed(1)}%)`);
  printSummaryLine('MCU v1.0 Release Gate Target',            '≥95.0%');

  // Automated Forbidden Editorial Phrase Audit
  const FORBIDDEN_EDITORIAL_PHRASES = [
    'background context',
    'world building',
    'worldbuilding',
    'character background',
    'shared universe',
    'introduces events',
    'origin is background context',
    'lore setup',
  ];

  interface ForbiddenPhraseViolation {
    sourceId: string;
    targetId: string;
    phrase: string;
    foundIn: 'shortReason' | 'detailedReasons';
    textSnippet: string;
  }

  const phraseViolations: ForbiddenPhraseViolation[] = [];
  for (const edge of cineOrderKnowledgeGraph.edges) {
    if (!edge.recommendationEvidence) continue;

    const shortReason = edge.recommendationEvidence.shortReason || '';
    const detailedReasons = edge.recommendationEvidence.detailedReasons || [];

    for (const phrase of FORBIDDEN_EDITORIAL_PHRASES) {
      if (shortReason.toLowerCase().includes(phrase)) {
        phraseViolations.push({
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          phrase,
          foundIn: 'shortReason',
          textSnippet: shortReason,
        });
      }

      for (const detailed of detailedReasons) {
        if (detailed.toLowerCase().includes(phrase)) {
          phraseViolations.push({
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            phrase,
            foundIn: 'detailedReasons',
            textSnippet: detailed,
          });
        }
      }
    }
  }

  console.log('\n── Editorial Evidence Wording Audit ──');
  if (phraseViolations.length === 0) {
    printSummaryLine('Forbidden Wording Check', '✓ PASS (0 generic phrases detected)');
  } else {
    console.log(`\n❌ Forbidden editorial wording detected (${phraseViolations.length} violations):\n`);
    for (const v of phraseViolations) {
      console.log(`  Edge: ${v.sourceId} → ${v.targetId}`);
      console.log(`  Field: recommendationEvidence.${v.foundIn}`);
      console.log(`  Phrase: "${v.phrase}"`);
      console.log(`  Snippet: "${v.textSnippet}"`);
      console.log(`  Suggested action: Rewrite using target-perspective narrative consequences.\n`);
    }
  }

  // Precision / Recall / F1
  console.log('\n── Precision / Recall / F1 by Category ──');
  for (const cat of ['must_watch', 'recommended', 'optional', 'post_credit', 'safe_to_skip'] as const) {
    printSummaryLine(
      cat,
      `P:${globalReport.globalPrecision[cat] ?? 0}%  R:${globalReport.globalRecall[cat] ?? 0}%  F1:${globalReport.globalF1[cat] ?? 0}%`
    );
  }

  // Relationship stats
  if (!quiet) {
    console.log('\n── Relationship Statistics (sorted by accuracy asc) ──');
    for (const r of globalReport.relationshipStats) {
      printSummaryLine(
        r.relationship,
        `${r.accuracy}%  (${r.matchCount}/${r.totalCount})  avgDrift ${r.avgDrift}`
      );
    }

    // Strength stats
    console.log('\n── Strength Statistics (sorted by accuracy asc) ──');
    for (const s of globalReport.strengthStats) {
      printSummaryLine(
        s.strength,
        `${s.accuracy}%  (${s.matchCount}/${s.totalCount})  avgDrift ${s.avgDrift}`
      );
    }

    // Score Heatmap top 10
    console.log('\n── Score Heatmap (top 10 by |delta|) ──');
    for (const h of globalReport.scoreHeatmap.slice(0, 10)) {
      const deltaStr = `${h.scoreDelta >= 0 ? '+' : ''}${h.scoreDelta}`;
      printSummaryLine(h.relationship, `engine ${h.avgEngineScore}  editorial ${h.avgEditorialScore}  delta ${deltaStr}  n=${h.sampleCount}`);
    }

    // Confusion Matrix top 10
    console.log('\n── Top Confusion Matrix Entries ──');
    for (const c of globalReport.confusionMatrix.slice(0, 10)) {
      printSummaryLine(
        `${c.relationship}`,
        `engine ${c.engineCategory} → editorial ${c.editorialCategory}  count ${c.count}  avgDrift ${c.avgDrift}`
      );
    }

    // Override Analysis
    console.log('\n── Override Analysis ──');
    const necessary         = globalReport.overrideAnalysis.filter((o) => o.confidence === 'Necessary').length;
    const likelyNecessary   = globalReport.overrideAnalysis.filter((o) => o.confidence === 'Likely Necessary').length;
    const probRemovable     = globalReport.overrideAnalysis.filter((o) => o.confidence === 'Probably Removable').length;
    const defRemovable      = globalReport.overrideAnalysis.filter((o) => o.confidence === 'Definitely Removable').length;
    if (globalReport.overrideEffectiveness) {
      printSummaryLine('Override Effectiveness',   `${globalReport.overrideEffectiveness.effectiveness}%`);
      printSummaryLine('Active Overrides',          globalReport.overrideEffectiveness.activeOverrides);
      printSummaryLine('Redundant Overrides',       globalReport.overrideEffectiveness.redundantOverrides);
    }
    printSummaryLine('Total override rules',      globalReport.overrideAnalysis.length);
    printSummaryLine('Necessary',                  necessary);
    printSummaryLine('Likely Necessary',           likelyNecessary);
    printSummaryLine('Probably Removable',         probRemovable);
    printSummaryLine('Definitely Removable',       defRemovable);

    if (globalReport.overrideStability) {
      const st = globalReport.overrideStability;
      console.log('\n── Override Stability & Subsumption ──');
      printSummaryLine('Current Active Overrides', st.currentActiveCount);
      if (st.activeDelta !== undefined) {
        printSummaryLine('Active Overrides Delta', `${st.activeDelta >= 0 ? '+' : ''}${st.activeDelta}`);
      }
      printSummaryLine('Newly Redundant Overrides', st.newlyRedundant);
      printSummaryLine('Newly Necessary Overrides', st.newlyNecessary);
    }

    // Calibration suggestions
    console.log('\n── Engine Calibration Suggestions ──');
    for (const s of globalReport.calibrationSuggestions) {
      const dir = s.suggestedDelta >= 0 ? 'Increase' : 'Reduce';
      const abs = Math.abs(s.suggestedDelta);
      const priority = s.priority.padEnd(8);
      console.log(`  [${priority}] ${dir} '${s.key}' (${s.signal}) by ~${abs}pts  — ${s.supportingMismatchCount} mismatches  avgDrift ${s.avgDrift}`);
    }
  }

  // ── Simulation mode ──
  if (simArg) {
    const overrides = parseSimulationOverrides(simArg);
    console.log(`\n── Calibration Simulation ──`);
    console.log(`  Overrides: ${JSON.stringify(overrides)}`);
    const sim = simulateCalibration(overrides);
    console.log(`  ${sim.description}`);
    printSummaryLine('Original Accuracy',   `${sim.originalAccuracy}%`);
    printSummaryLine('Simulated Accuracy',  `${sim.simulatedAccuracy}%`);
    printSummaryLine('Delta',               `${sim.delta >= 0 ? '+' : ''}${sim.delta}%`);
  }

  // ── Generate reports ──
  const md = generateMarkdownReport(globalReport);
  const healthJson = generateOverrideHealthJson(globalReport);
  const healthMd   = generateOverrideHealthMd(globalReport);

  ensureReportsDir();
  const snapshotData = {
    previousAccuracy: globalReport.overallAccuracy,
    previousDrift: globalReport.overallDrift,
    activeOverrideKeys: globalReport.overrideAnalysis.filter((o) => o.changedAnything).map((o) => `${o.targetId}:${o.sourceId}`),
    redundantOverrideKeys: globalReport.overrideAnalysis.filter((o) => !o.changedAnything).map((o) => `${o.targetId}:${o.sourceId}`),
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(REPORTS_DIR, 'snapshot.json'), JSON.stringify(snapshotData, null, 2), 'utf-8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'override-health.json'), JSON.stringify(healthJson, null, 2), 'utf-8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'override-health.md'), healthMd, 'utf-8');

  if (!quiet) {
    writeMd(md);
  }

  // ── CSV export ──
  if (outputCsv) {
    const csv = generateCSVExport(globalReport);
    writeCsv(csv);
  }

  // ── JSON export ──
  if (outputJson) {
    writeJson(globalReport);
  }

  console.log('\nGenerated override health reports → reports/override-health.json & reports/override-health.md\n');
  console.log(generateExecutiveSummary(globalReport));

  console.log('\n────────────────────────────────────────────────────────');
  if (phraseViolations.length > 0) {
    console.error(' Run complete with ERRORS: Forbidden wording detected in recommendation evidence.');
    console.log('────────────────────────────────────────────────────────\n');
    process.exit(1);
  } else {
    console.log(' Run complete.');
    console.log('────────────────────────────────────────────────────────\n');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
