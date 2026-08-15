import { allFranchises, allContent } from '../data/franchises/index';
import { getFranchiseContent } from '../data/franchises';
import { storyEdges, titleNodes } from '../data/cineOrderKnowledgeGraph';
import { generatePreparationGuide } from './preparationGuide';

export type CompletenessStatus =
  | 'VALID_RECOMMENDATIONS'
  | 'VALID_ZERO'
  | 'MISSING_GRAPH_DATA'
  | 'GRAPH_DATA_PRESENT_BUT_NOT_RETURNING'
  | 'SUSPICIOUS_ZERO';

export interface TitleCompletenessAudit {
  titleId: string;
  titleName: string;
  franchiseId: string;
  franchiseName: string;
  releaseYear: string;
  status: CompletenessStatus;
  problem?: string;
  expected?: string;
  actual?: string;
  suggestedEditorialReview?: string;
  incomingEdgesCount: number;
  outgoingEdgesCount: number;
  mustWatchCount: number;
  recommendedCount: number;
  extraContextCount: number;
  totalRecs: number;
}

export interface FranchiseCompletenessAudit {
  franchiseId: string;
  franchiseName: string;
  titleCount: number;
  storyEdgeCount: number;
  titlesWithRecsCount: number;
  validZeroCount: number;
  suspiciousZeroCount: number;
  missingGraphDataCount: number;
  graphPresentNotReturningCount: number;
  status: 'PASS' | 'FAIL' | 'WARN';
}

export interface CompletenessReport {
  timestamp: string;
  totalTitles: number;
  totalFranchises: number;
  totalStoryEdges: number;
  titlesWithRecommendations: number;
  validStandaloneTitles: number;
  suspiciousZeroTitles: number;
  missingGraphNodes: number;
  missingExpectedEdges: number;
  brokenGraphReferences: number;
  engineTraversalFailures: number;
  uiRecommendationFailures: number;
  status: 'PASS' | 'FAIL';
  franchiseAudits: FranchiseCompletenessAudit[];
  titleAudits: TitleCompletenessAudit[];
  failures: TitleCompletenessAudit[];
}

/**
 * List of canonically verified standalone entry points across CineOrder catalog.
 * Titles in this list genuinely require 0 prerequisite viewing preparation.
 */
const VERIFIED_STANDALONE_REGISTRY = new Set<string>([
  // MCU
  'mcu-iron-man',
  'mcu-incredible-hulk',
  'mcu-thor',
  'mcu-captain-america',
  'mcu-gotg-1',
  'mcu-ant-man',
  'mcu-doctor-strange',
  'mcu-captain-marvel',
  'mcu-moon-knight',
  'mcu-werewolf-by-night',
  'mcu-daredevil',
  'mcu-fantastic-four',
  'mcu-blade',
  // Star Wars
  'sw-ep4',
  'sw-ep1',
  'sw-solo',
  'sw-acolyte',
  // Wizarding World
  'hp-sorcerers-stone',
  'hp-fb-1',
  'wizarding-world-harry-potter-tv',
  // DC
  'dc-man-of-steel',
  'dc-shazam',
  'dc-joker',
  'dc-the-batman',
  'dc-blue-beetle',
  'dc-superman-2025',
  'dc-booster-gold',
  'dc-paradise-lost',
  // Conjuring
  'conj-1',
  // Fast & Furious
  'ff-1',
  'ff-3',
  // John Wick
  'jw-1',
  'jw-continental',
  // Mission: Impossible
  'mi-1',
  // X-Men
  'xmen-1',
  'xmen-fc',
  'xmen-deadpool',
  'xmen-new-mutants',
  'xmen-97',
  // Jurassic Park
  'jp-1',
  // Pirates
  'potc-1',
  // Transformers
  'tf-1',
  'tf-bumblebee',
  'tf-one',
  'tf-prime',
  // Middle-earth
  'lotr-1',
  'lotr-rop',
  'lotr-rohirrim',
  'hobbit-1',
  // Evil Dead
  'ed-1',
  // Insidious
  'ins-1',
  'ins-3',
]);

/**
 * Sequel/Prequel Structural Pattern Matching Regex
 * Identifies titles whose names imply a narrative continuation or sequence.
 */
const SEQUEL_PREQUEL_TITLE_REGEX = /\b(2|3|4|5|6|7|8|9|part|chapter|vol|ii|iii|iv|v|vi|vii|viii|returns|rebirth|kingdom|legacy|continuation|dawn|ragnarok|endgame|infinity|war|fast\s*\d+)\b/i;

/**
 * Permanent Global Recommendation Completeness Validator for CineOrder.
 * Automatically inspects every catalog title & franchise for graph modeling completeness.
 */
export function validateRecommendationCompleteness(): CompletenessReport {
  const titleAudits: TitleCompletenessAudit[] = [];
  const franchiseAudits: FranchiseCompletenessAudit[] = [];
  const failures: TitleCompletenessAudit[] = [];

  const catalogMap = new Map(allContent.map((c) => [c.id, c]));
  const nodeMap = new Map(Object.entries(titleNodes));

  let totalTitlesCount = allContent.length;
  let totalFranchisesCount = allFranchises.length;
  let totalStoryEdgesCount = storyEdges.length;

  let titlesWithRecs = 0;
  let validStandaloneCount = 0;
  let suspiciousZeroCount = 0;
  let missingGraphNodesCount = 0;
  let missingExpectedEdgesCount = 0;
  let brokenGraphReferencesCount = 0;
  let engineTraversalFailuresCount = 0;
  let uiRecommendationFailuresCount = 0;

  // 1. Check for broken graph edge references (referencing non-existent catalog or node IDs)
  storyEdges.forEach((edge) => {
    const srcExists = catalogMap.has(edge.sourceId) || nodeMap.has(edge.sourceId);
    const tgtExists = catalogMap.has(edge.targetId) || nodeMap.has(edge.targetId);
    if (!srcExists || !tgtExists) {
      brokenGraphReferencesCount++;
    }
  });

  // 2. Audit each registered franchise
  allFranchises.forEach((franchise) => {
    const franchiseContent = getFranchiseContent(franchise.id);
    const franchiseTitleIds = new Set(franchiseContent.map((c) => c.id));

    // Get story edges where source or target belongs to this franchise
    const franchiseEdges = storyEdges.filter(
      (e) => franchiseTitleIds.has(e.sourceId) || franchiseTitleIds.has(e.targetId)
    );

    let fTitlesWithRecs = 0;
    let fValidZeros = 0;
    let fSuspiciousZeros = 0;
    let fMissingGraphData = 0;
    let fGraphPresentNotReturning = 0;

    // Check Conjuring failure pattern: multi-title franchise with 0 edges
    const isMultiTitleZeroEdgeFranchise = franchiseContent.length > 1 && franchiseEdges.length === 0;

    franchiseContent.forEach((item) => {
      const node = nodeMap.get(item.id);
      const incomingEdges = storyEdges.filter((e) => e.targetId === item.id);
      const catalogIncomingEdges = incomingEdges.filter((e) => catalogMap.has(e.sourceId));
      const outgoingEdges = storyEdges.filter((e) => e.sourceId === item.id);

      // Run recommendation engine
      const prep = generatePreparationGuide(item.id);
      const mustWatchCount = prep?.mustWatch.length || 0;
      const recommendedCount = prep?.recommended.length || 0;
      const extraContextCount = prep?.optional.length || 0;
      const totalRecs = mustWatchCount + recommendedCount + extraContextCount;

      // Check card orphan IDs in returned payload
      const allReturnedCards = [
        ...(prep?.mustWatch || []),
        ...(prep?.recommended || []),
        ...(prep?.optional || []),
      ];
      allReturnedCards.forEach((card) => {
        if (!card.content || !catalogMap.has(card.content.id)) {
          uiRecommendationFailuresCount++;
        }
      });

      let status: CompletenessStatus = 'VALID_RECOMMENDATIONS';
      let problem: string | undefined;
      let expected: string | undefined;
      let actual: string | undefined;
      let suggestedEditorialReview: string | undefined;

      // Determine explicit entry point status
      const isExplicitEntryPoint =
        Boolean(node?.isEntryPoint) ||
        VERIFIED_STANDALONE_REGISTRY.has(item.id) ||
        (item as unknown as { is_entry_point?: boolean }).is_entry_point === true;

      if (!node) {
        status = 'MISSING_GRAPH_DATA';
        problem = `Catalog item '${item.id}' has no corresponding node in titleNodes.`;
        expected = `TitleNode definition in cineOrderKnowledgeGraph.ts.`;
        actual = `Node missing.`;
        suggestedEditorialReview = `Add titleNode entry for '${item.id}' in cineOrderKnowledgeGraph.ts.`;
        missingGraphNodesCount++;
        fMissingGraphData++;
      } else if (isMultiTitleZeroEdgeFranchise) {
        status = 'MISSING_GRAPH_DATA';
        problem = `Franchise '${franchise.name}' has ${franchiseContent.length} titles but 0 Knowledge Graph story edges.`;
        expected = `Modeled narrative story edges connecting titles.`;
        actual = `0 edges found.`;
        suggestedEditorialReview = `Model narrative edges for franchise '${franchise.name}' in cineOrderKnowledgeGraph.ts.`;
        missingExpectedEdgesCount++;
        fMissingGraphData++;
      } else if (totalRecs > 0) {
        status = 'VALID_RECOMMENDATIONS';
        titlesWithRecs++;
        fTitlesWithRecs++;
      } else if (isExplicitEntryPoint) {
        status = 'VALID_ZERO';
        validStandaloneCount++;
        fValidZeros++;
      } else if (catalogIncomingEdges.length > 0 && totalRecs === 0) {
        status = 'GRAPH_DATA_PRESENT_BUT_NOT_RETURNING';
        problem = `Title '${item.id}' has ${catalogIncomingEdges.length} incoming graph edge(s) from catalog titles, but recommendation engine returned 0 recommendations.`;
        expected = `Recommendation items returned for incoming edges.`;
        actual = `0 items returned.`;
        suggestedEditorialReview = `Verify traversal scoring and thresholds for title '${item.id}'.`;
        engineTraversalFailuresCount++;
        fGraphPresentNotReturning++;
      } else {
        // Evaluate non-entry-point 0-recommendation title
        const impliesSequel = SEQUEL_PREQUEL_TITLE_REGEX.test(item.title);

        status = 'SUSPICIOUS_ZERO';
        problem = impliesSequel
          ? `Title '${item.title}' implies sequel/prequel continuation, but has 0 incoming graph edges and 0 recommendations.`
          : `Title '${item.title}' belongs to multi-title franchise but has 0 recommendations and is not marked as entry point.`;
        expected = `Modeled incoming story edges OR explicit entry point declaration.`;
        actual = `0 incoming edges, 0 recommendations.`;
        suggestedEditorialReview = `Review title '${item.id}' for predecessor relationships or declare isEntryPoint: true if standalone.`;

        suspiciousZeroCount++;
        fSuspiciousZeros++;
        if (impliesSequel) {
          missingExpectedEdgesCount++;
        }
      }

      const auditRecord: TitleCompletenessAudit = {
        titleId: item.id,
        titleName: item.title,
        franchiseId: franchise.id,
        franchiseName: franchise.name,
        releaseYear: item.release_date ? item.release_date.slice(0, 4) : 'N/A',
        status,
        problem,
        expected,
        actual,
        suggestedEditorialReview,
        incomingEdgesCount: incomingEdges.length,
        outgoingEdgesCount: outgoingEdges.length,
        mustWatchCount,
        recommendedCount,
        extraContextCount,
        totalRecs,
      };

      titleAudits.push(auditRecord);

      if (
        status === 'SUSPICIOUS_ZERO' ||
        status === 'MISSING_GRAPH_DATA' ||
        status === 'GRAPH_DATA_PRESENT_BUT_NOT_RETURNING'
      ) {
        failures.push(auditRecord);
      }
    });

    let franchiseStatus: 'PASS' | 'FAIL' | 'WARN' = 'PASS';
    if (fMissingGraphData > 0 || fGraphPresentNotReturning > 0 || fSuspiciousZeros > 0) {
      franchiseStatus = 'FAIL';
    }

    franchiseAudits.push({
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      titleCount: franchiseContent.length,
      storyEdgeCount: franchiseEdges.length,
      titlesWithRecsCount: fTitlesWithRecs,
      validZeroCount: fValidZeros,
      suspiciousZeroCount: fSuspiciousZeros,
      missingGraphDataCount: fMissingGraphData,
      graphPresentNotReturningCount: fGraphPresentNotReturning,
      status: franchiseStatus,
    });
  });

  const overallStatus: 'PASS' | 'FAIL' =
    failures.length === 0 && brokenGraphReferencesCount === 0 ? 'PASS' : 'FAIL';

  return {
    timestamp: new Date().toISOString(),
    totalTitles: totalTitlesCount,
    totalFranchises: totalFranchisesCount,
    totalStoryEdges: totalStoryEdgesCount,
    titlesWithRecommendations: titlesWithRecs,
    validStandaloneTitles: validStandaloneCount,
    suspiciousZeroTitles: suspiciousZeroCount,
    missingGraphNodes: missingGraphNodesCount,
    missingExpectedEdges: missingExpectedEdgesCount,
    brokenGraphReferences: brokenGraphReferencesCount,
    engineTraversalFailures: engineTraversalFailuresCount,
    uiRecommendationFailures: uiRecommendationFailuresCount,
    status: overallStatus,
    franchiseAudits,
    titleAudits,
    failures,
  };
}

/**
 * Formats the CompletenessReport into the exact CLI report block matching CineOrder Specification 13.
 */
export function formatCompletenessReportCLI(report: CompletenessReport): string {
  const lines: string[] = [];

  lines.push('========================================');
  lines.push('Recommendation Completeness Audit');
  lines.push('========================================\n');

  lines.push(`Total Titles:                   ${report.totalTitles}`);
  lines.push(`Total Franchises:               ${report.totalFranchises}`);
  lines.push(`Total Story Edges:              ${report.totalStoryEdges}`);
  lines.push(`Titles With Recommendations:    ${report.titlesWithRecommendations}`);
  lines.push(`Valid Standalone Titles:        ${report.validStandaloneTitles}`);
  lines.push(`Suspicious Zero Titles:         ${report.suspiciousZeroTitles}`);
  lines.push(`Missing Graph Nodes:            ${report.missingGraphNodes}`);
  lines.push(`Missing Expected Edges:         ${report.missingExpectedEdges}`);
  lines.push(`Broken Graph References:        ${report.brokenGraphReferences}`);
  lines.push(`Engine Traversal Failures:      ${report.engineTraversalFailures}`);
  lines.push(`UI Recommendation Failures:     ${report.uiRecommendationFailures}`);
  lines.push('');
  lines.push(`Status: ${report.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  lines.push('========================================\n');

  if (report.failures.length > 0) {
    lines.push('Detailed Failures & Editorial Action Required:\n');
    report.failures.forEach((f, idx) => {
      lines.push(`Failure #${idx + 1}:`);
      lines.push(`  Title:                      ${f.titleName} [${f.titleId}]`);
      lines.push(`  Franchise:                  ${f.franchiseName} [${f.franchiseId}]`);
      lines.push(`  Problem:                    ${f.problem || 'Unspecified completeness failure'}`);
      lines.push(`  Expected:                   ${f.expected || 'N/A'}`);
      lines.push(`  Actual:                     ${f.actual || 'N/A'}`);
      lines.push(`  Suggested Editorial Review: ${f.suggestedEditorialReview || 'Review graph modeling.'}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

export default validateRecommendationCompleteness;
