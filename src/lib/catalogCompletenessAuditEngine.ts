/**
 * CineOrder — Universal Global Missing Canonical Content & Narrative Dependency Audit Engine
 *
 * Scans ALL registered franchises dynamically from `allFranchises`.
 * Detects sequential gaps, missing prequels/sequels, missing spin-offs, missing TV series,
 * missing crossover prerequisites, and broken Story Knowledge Graph dependencies.
 *
 * Preserves CineOrder v1.0-framework-freeze with zero framework creep.
 */

import { allFranchises, allContent } from '@/data/franchises/index';
import { getFranchiseContent } from '@/data/franchises';
import { titleNodes, storyEdges } from '@/data/cineOrderKnowledgeGraph';
import { sortContentByReleaseDate } from '@/lib/releaseOrdering';
import {
  CINEORDER_PLACEHOLDER_POSTER,
  CINEORDER_PLACEHOLDER_BACKDROP,
} from '@/lib/artworkResolverEngine';
import type { Franchise, Content, ContentType } from '@/types';
import type {
  CompletenessGapType,
  CompletenessAuditFindingStatus,
  CandidateMissingTitleProposal,
  FranchiseAuditSummary,
  BrokenGraphDependencyFinding,
  GlobalCompletenessAuditReport,
  ProposedStoryRelationshipCandidate,
} from '@/types/catalogCompletenessAudit';

export const COMPLETENESS_AUDIT_ENGINE_VERSION = '1.0.0-universal-completeness';

/**
 * Universal Knowledge Base of Canonical Continuities & Potential Gap Patterns across Franchises
 */
interface ContinuityKnowledgePattern {
  franchiseId: string;
  continuityName: string;
  expectedPatterns: {
    patternId: string;
    gapType: CompletenessGapType;
    canonicalTitle: string;
    tmdbId: number | null;
    mediaType: ContentType;
    releaseDate: string;
    overview: string;
    director?: string;
    reasons: string[];
    evidenceSource: string;
    confidence: number;
    prerequisiteTargets?: string[];
  }[];
}

const VERIFIED_PROPOSAL_ARTWORK: Record<string, { poster: string; backdrop: string }> = {
  Ironheart: {
    poster: 'https://image.tmdb.org/t/p/w500/dOh6MJpdlQhYpLBhzhNQeYGKTZ5.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/vno2LrEQr3lTOk3U1G1ihZsy64b.jpg',
  },
  'Eyes of Wakanda': {
    poster: 'https://image.tmdb.org/t/p/w500/yuOfb1MgnaGPa4guzV0n1IFYVGN.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/cWO5NDkKqpOuwxu4vFc4PtL8aNF.jpg',
  },
  'Supergirl: Woman of Tomorrow': {
    poster: 'https://image.tmdb.org/t/p/w500/1QCWdqzTfh2x9UylVpspIU6QTuM.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/54KIfdTEzOliHDKx0OkzYGqAICx.jpg',
  },
  'Alien: Earth': {
    poster: 'https://image.tmdb.org/t/p/w500/yueXS3q8BtoWekcHOATFHicLl3e.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/sVxit4vKQZnrHejeQupBYadP22g.jpg',
  },
  'The Lord of the Rings: The Hunt for Gollum': {
    poster: 'https://image.tmdb.org/t/p/w500/aRtIVdlgVNtvcqFUnuhR3V1RQ7o.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/aIw4c18EWwQmIWZv0W6s60y47aB.jpg',
  },
  'Star Wars: Tales of the Empire': {
    poster: 'https://image.tmdb.org/t/p/w500/qA28nLteurVboSSzltuyYt1lvlC.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/sMxOqjwaHHXuBnHkvVyzqcOPMVF.jpg',
  },
  'Jurassic World: Chaos Theory': {
    poster: 'https://image.tmdb.org/t/p/w500/c2Od0cY2IeayDj5osUxZSAD1QK.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/qjPC0KYEhdWAIPmCtAkg0j1iJXC.jpg',
  },
};

const KNOWN_CONTINUITY_PATTERNS: ContinuityKnowledgePattern[] = [
  // ─── Spider-Man Multi-Continuity Matrix ────────────────────────────────────
  {
    franchiseId: 'spider-man',
    continuityName: 'Sam Raimi Trilogy',
    expectedPatterns: [
      {
        patternId: 'raimi-spiderman-1',
        gapType: 'MISSING_CANONICAL_TITLE',
        canonicalTitle: 'Spider-Man',
        tmdbId: 557,
        mediaType: 'movie',
        releaseDate: '2002-05-03',
        overview: 'Sam Raimi original classic starring Tobey Maguire.',
        director: 'Sam Raimi',
        reasons: ['Foundational entry of the Sam Raimi Spider-Man Trilogy.'],
        evidenceSource: 'Sony Pictures / Columbia Pictures Canonical Archives',
        confidence: 1.0,
      },
      {
        patternId: 'raimi-spiderman-2',
        gapType: 'MISSING_SEQUEL',
        canonicalTitle: 'Spider-Man 2',
        tmdbId: 558,
        mediaType: 'movie',
        releaseDate: '2004-06-30',
        overview: 'Raimi sequel featuring Doc Ock (Alfred Molina).',
        director: 'Sam Raimi',
        reasons: ['Direct continuation and second installment of Sam Raimi Trilogy.'],
        evidenceSource: 'Sony Pictures Canonical Archives',
        confidence: 1.0,
      },
      {
        patternId: 'raimi-spiderman-3',
        gapType: 'MISSING_SEQUEL',
        canonicalTitle: 'Spider-Man 3',
        tmdbId: 559,
        mediaType: 'movie',
        releaseDate: '2007-05-04',
        overview: 'Raimi trilogy conclusion featuring Sandman and Venom.',
        director: 'Sam Raimi',
        reasons: ['Trilogy conclusion of Sam Raimi Spider-Man films.'],
        evidenceSource: 'Sony Pictures Canonical Archives',
        confidence: 1.0,
      },
    ],
  },
  {
    franchiseId: 'spider-man',
    continuityName: 'Marc Webb Dilogy',
    expectedPatterns: [
      {
        patternId: 'webb-tasm-1',
        gapType: 'MISSING_CONTINUITY_ENTRY',
        canonicalTitle: 'The Amazing Spider-Man',
        tmdbId: 1930,
        mediaType: 'movie',
        releaseDate: '2012-07-03',
        overview: 'Marc Webb reboot starring Andrew Garfield as Peter Parker.',
        director: 'Marc Webb',
        reasons: ['Reboot establishing the Marc Webb Amazing Spider-Man continuity.'],
        evidenceSource: 'Sony Pictures Canonical Archives',
        confidence: 1.0,
      },
      {
        patternId: 'webb-tasm-2',
        gapType: 'MISSING_SEQUEL',
        canonicalTitle: 'The Amazing Spider-Man 2',
        tmdbId: 102382,
        mediaType: 'movie',
        releaseDate: '2014-05-02',
        overview: 'Marc Webb sequel featuring Electro (Jamie Foxx).',
        director: 'Marc Webb',
        reasons: ['Direct sequel and culmination of Andrew Garfield Spider-Man arc.'],
        evidenceSource: 'Sony Pictures Canonical Archives',
        confidence: 1.0,
      },
    ],
  },
  {
    franchiseId: 'spider-man',
    continuityName: 'Spider-Verse Animated',
    expectedPatterns: [
      {
        patternId: 'spider-verse-1',
        gapType: 'MISSING_CONTINUITY_ENTRY',
        canonicalTitle: 'Spider-Man: Into the Spider-Verse',
        tmdbId: 324857,
        mediaType: 'animated',
        releaseDate: '2018-12-14',
        overview: 'Oscar-winning animated film introducing Miles Morales.',
        director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman',
        reasons: ['First installment of the animated Spider-Verse franchise.'],
        evidenceSource: 'Sony Pictures Animation',
        confidence: 1.0,
      },
      {
        patternId: 'spider-verse-2',
        gapType: 'MISSING_SEQUEL',
        canonicalTitle: 'Spider-Man: Across the Spider-Verse',
        tmdbId: 569094,
        mediaType: 'animated',
        releaseDate: '2023-06-02',
        overview: 'Multiverse continuation featuring the Spider-Society.',
        director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
        reasons: ['Direct sequel to Into the Spider-Verse.'],
        evidenceSource: 'Sony Pictures Animation',
        confidence: 1.0,
      },
      {
        patternId: 'spider-verse-3',
        gapType: 'MISSING_SEQUEL',
        canonicalTitle: 'Spider-Man: Beyond the Spider-Verse',
        tmdbId: 911916,
        mediaType: 'animated',
        releaseDate: 'TBA',
        overview: 'Upcoming animated conclusion to the Spider-Verse trilogy.',
        reasons: ['Officially announced third installment completing the Spider-Verse trilogy.'],
        evidenceSource: 'Sony Pictures Animation Official Announcement',
        confidence: 1.0,
      },
    ],
  },

  // ─── Marvel Cinematic Universe Canonical Context ───────────────────────────
  {
    franchiseId: 'marvel-cinematic-universe',
    continuityName: 'MCU Phase 5 / Streaming',
    expectedPatterns: [
      {
        patternId: 'mcu-ironheart',
        gapType: 'MISSING_SERIES',
        canonicalTitle: 'Ironheart',
        tmdbId: 114471,
        mediaType: 'series',
        releaseDate: '2025-06-24',
        overview: 'Marvel Studios series following tech prodigy Riri Williams following the events of Wakanda Forever.',
        reasons: ['Canonical Phase 5 live-action series directly continuing Riri Williams story arc.'],
        evidenceSource: 'Marvel Studios Official Production & D23 Announcement',
        confidence: 0.95,
        prerequisiteTargets: ['mcu-wakanda-forever'],
      },
      {
        patternId: 'mcu-eyes-of-wakanda',
        gapType: 'MISSING_SERIES',
        canonicalTitle: 'Eyes of Wakanda',
        tmdbId: 241388,
        mediaType: 'animated',
        releaseDate: '2025-08-06',
        overview: 'Animated anthology exploring the secret history of Wakandan warriors throughout the ages.',
        reasons: ['Canonical Marvel Animation series exploring MCU Wakandan lore.'],
        evidenceSource: 'Marvel Studios / Marvel Animation Official Announcement',
        confidence: 0.9,
        prerequisiteTargets: ['mcu-black-panther'],
      },
    ],
  },

  // ─── DC Universe (DCU Chapter 1: Gods & Monsters) ──────────────────────────
  {
    franchiseId: 'dc-extended-universe',
    continuityName: 'DC Universe (DCU Chapter 1)',
    expectedPatterns: [
      {
        patternId: 'dc-supergirl',
        gapType: 'MISSING_CANONICAL_TITLE',
        canonicalTitle: 'Supergirl: Woman of Tomorrow',
        tmdbId: 1081003,
        mediaType: 'movie',
        releaseDate: '2026-06-26',
        overview: 'DC Studios feature film starring Milly Alcock as Kara Zor-El, directed by Craig Gillespie.',
        director: 'Craig Gillespie',
        reasons: ['Officially dated Chapter 1 feature film from DC Studios / James Gunn.'],
        evidenceSource: 'DC Studios / Warner Bros. Pictures Official Release Calendar',
        confidence: 0.95,
        prerequisiteTargets: ['dc-superman-2025'],
      },
    ],
  },

  // ─── Star Wars Extended Canonical Context ──────────────────────────────────
  {
    franchiseId: 'star-wars',
    continuityName: 'Mando-Verse & Canonical TV',
    expectedPatterns: [
      {
        patternId: 'sw-skeleton-crew',
        gapType: 'MISSING_SERIES',
        canonicalTitle: 'Skeleton Crew',
        tmdbId: 202879,
        mediaType: 'series',
        releaseDate: '2024-12-03',
        overview: 'Coming-of-age Star Wars series following four kids lost in the galaxy.',
        reasons: ['Canonical live-action series set in the New Republic / Mando-Verse era.'],
        evidenceSource: 'Lucasfilm Official Announcement / StarWars.com',
        confidence: 1.0,
      },
      {
        patternId: 'sw-tales-empire',
        gapType: 'MISSING_SERIES',
        canonicalTitle: 'Star Wars: Tales of the Empire',
        tmdbId: 251091,
        mediaType: 'series',
        releaseDate: '2024-05-04',
        overview: 'Six-episode animated journey into the fearsome Galactic Empire through the eyes of Morgan Elsbeth and Barriss Offee.',
        reasons: ['Direct thematic companion and continuation of Tales of the Jedi.'],
        evidenceSource: 'Lucasfilm Official Announcement',
        confidence: 0.95,
        prerequisiteTargets: ['sw-tales-jedi'],
      },
    ],
  },

  // ─── Alien Franchise Context ───────────────────────────────────────────────
  {
    franchiseId: 'alien',
    continuityName: 'Alien Extended Canon',
    expectedPatterns: [
      {
        patternId: 'alien-earth',
        gapType: 'MISSING_SERIES',
        canonicalTitle: 'Alien: Earth',
        tmdbId: 157239,
        mediaType: 'series',
        releaseDate: '2025-08-01',
        overview: 'Noah Hawley television series set on Earth roughly 30 years prior to the events of the original 1979 Alien film.',
        director: 'Noah Hawley',
        reasons: ['Official FX on Hulu prequel television series expanding the Alien mythos.'],
        evidenceSource: 'FX Networks / 20th Century Studios Official Announcement',
        confidence: 0.95,
        prerequisiteTargets: ['alien-1'],
      },
    ],
  },

  // ─── Lord of the Rings Middle-earth Context ────────────────────────────────
  {
    franchiseId: 'lord-of-the-rings',
    continuityName: 'Middle-earth Peter Jackson Continuity',
    expectedPatterns: [
      {
        patternId: 'lotr-gollum',
        gapType: 'MISSING_CANONICAL_TITLE',
        canonicalTitle: 'The Lord of the Rings: The Hunt for Gollum',
        tmdbId: 1090869,
        mediaType: 'movie',
        releaseDate: 'TBA',
        overview: 'Upcoming live-action feature film directed by and starring Andy Serkis, produced by Peter Jackson, Fran Walsh, and Philippa Boyens.',
        director: 'Andy Serkis',
        reasons: ['Officially announced live-action theatrical film exploring Gollum\'s untold story.'],
        evidenceSource: 'Warner Bros. Discovery / New Line Cinema Official Announcement',
        confidence: 0.9,
        prerequisiteTargets: ['lotr-1'],
      },
    ],
  },

  // ─── Jurassic Park Context ────────────────────────────────────────────────
  {
    franchiseId: 'jurassic-park',
    continuityName: 'Jurassic World Nublar Six',
    expectedPatterns: [
      {
        patternId: 'jp-chaos-theory',
        gapType: 'MISSING_SERIES',
        canonicalTitle: 'Jurassic World: Chaos Theory',
        tmdbId: 237512,
        mediaType: 'series',
        releaseDate: '2024-05-24',
        overview: 'Direct sequel series to Camp Cretaceous following the Nublar Six navigating a world filled with wild dinosaurs and global conspiracies.',
        reasons: ['Direct canonical sequel series to Jurassic World: Camp Cretaceous.'],
        evidenceSource: 'Universal Pictures / DreamWorks Animation / Netflix',
        confidence: 0.95,
        prerequisiteTargets: ['jp-camp-cretaceous'],
      },
    ],
  },
];

/**
 * Universal Catalog Completeness Audit Engine
 */
export class CatalogCompletenessAuditEngine {
  /**
   * Runs a complete, universal completeness and narrative dependency audit
   * across all registered franchises dynamically.
   */
  public static runGlobalAudit(
    customFranchises?: Franchise[],
    customContent?: Content[] | Map<string, Content[]>
  ): GlobalCompletenessAuditReport {
    const franchisesToAudit = customFranchises || allFranchises;
    const nowTimestamp = new Date().toISOString();

    const allProposals: CandidateMissingTitleProposal[] = [];
    const franchiseSummaries: FranchiseAuditSummary[] = [];
    const brokenGraphDependencies: BrokenGraphDependencyFinding[] = [];

    const gapCounts: Record<CompletenessGapType, number> = {
      MISSING_CANONICAL_TITLE: 0,
      MISSING_PREREQUISITE: 0,
      MISSING_SEQUEL: 0,
      MISSING_PREQUEL: 0,
      MISSING_SPINOFF: 0,
      MISSING_SERIES: 0,
      MISSING_CROSSOVER_CONTEXT: 0,
      MISSING_CONTINUITY_ENTRY: 0,
    };

    const statusCounts: Record<CompletenessAuditFindingStatus, number> = {
      VERIFIED_PRESENT: 0,
      VERIFIED_MISSING: 0,
      POSSIBLE_MISSING: 0,
      AMBIGUOUS: 0,
      NOT_VERIFIABLE: 0,
    };

    // 1. Audit Story Knowledge Graph for Broken References
    const normTitleNodeIds = new Set(Object.keys(titleNodes).map((k) => k.trim().toLowerCase()));

    for (const edge of storyEdges) {
      const srcId = edge.sourceId.trim().toLowerCase();
      const tgtId = edge.targetId.trim().toLowerCase();
      const srcInNodes = normTitleNodeIds.has(srcId);
      const tgtInNodes = normTitleNodeIds.has(tgtId);

      if (!srcInNodes) {
        brokenGraphDependencies.push({
          edgeSourceId: edge.sourceId,
          edgeTargetId: edge.targetId,
          relationship: edge.relationship,
          brokenNodeId: edge.sourceId,
          missingInCatalog: false,
          missingInTitleNodes: true,
          recommendationAction: `Register missing title node '${edge.sourceId}' in titleNodes.`,
        });
      }

      if (!tgtInNodes) {
        brokenGraphDependencies.push({
          edgeSourceId: edge.sourceId,
          edgeTargetId: edge.targetId,
          relationship: edge.relationship,
          brokenNodeId: edge.targetId,
          missingInCatalog: false,
          missingInTitleNodes: true,
          recommendationAction: `Register missing target node '${edge.targetId}' in titleNodes.`,
        });
      }
    }

    // 2. Audit Every Franchise Dynamically
    for (const franchise of franchisesToAudit) {
      let franchiseTitles = getFranchiseContent(franchise.id);
      if (customContent) {
        if (Array.isArray(customContent)) {
          franchiseTitles = customContent.filter((c) => c.franchise_id === franchise.id);
        } else if (customContent.has(franchise.id)) {
          franchiseTitles = customContent.get(franchise.id)!;
        }
      }
      const franchiseTitleMap = new Map(franchiseTitles.map((t) => [t.title.toLowerCase().trim(), t]));
      const franchiseTmdbMap = new Map(franchiseTitles.filter((t) => t.tmdb_id).map((t) => [t.tmdb_id!, t]));

      const moviesCount = franchiseTitles.filter((t) => t.type === 'movie' || t.type === 'animated').length;
      const seriesCount = franchiseTitles.filter((t) => t.type === 'series').length;

      const franchiseProposals: CandidateMissingTitleProposal[] = [];
      const knownContinuityNames = new Set<string>();

      // ─── Pattern Matching & Gap Detection ──────────────────────────────────
      const matchedKnowledge = KNOWN_CONTINUITY_PATTERNS.filter((p) => p.franchiseId === franchise.id);

      for (const knowledge of matchedKnowledge) {
        knownContinuityNames.add(knowledge.continuityName);

        for (const pattern of knowledge.expectedPatterns) {
          const normTitle = pattern.canonicalTitle.toLowerCase().trim();
          const existingByTitle = franchiseTitleMap.get(normTitle);
          const existingByTmdb = pattern.tmdbId ? franchiseTmdbMap.get(pattern.tmdbId) : undefined;
          const isPresent = Boolean(existingByTitle || existingByTmdb);

          if (isPresent) {
            statusCounts.VERIFIED_PRESENT++;
          } else {
            // Gap Detected!
            statusCounts.VERIFIED_MISSING++;
            gapCounts[pattern.gapType]++;

            // Build Verified Proposal Package
            const proposal = this.createProposal({
              franchise,
              gapType: pattern.gapType,
              canonicalTitle: pattern.canonicalTitle,
              tmdbId: pattern.tmdbId,
              mediaType: pattern.mediaType,
              releaseDate: pattern.releaseDate,
              overview: pattern.overview,
              director: pattern.director,
              continuity: knowledge.continuityName,
              reasons: pattern.reasons,
              evidenceSource: pattern.evidenceSource,
              confidence: pattern.confidence,
              prerequisiteTargets: pattern.prerequisiteTargets,
              existingTitles: franchiseTitles,
            });

            franchiseProposals.push(proposal);
            allProposals.push(proposal);
          }
        }
      }

      // ─── Sequential Gap Analysis (e.g. Movie 1, Movie 2, Movie 4) ─────────
      const sequentialGaps = this.detectSequentialGaps(franchise, franchiseTitles);
      for (const gap of sequentialGaps) {
        if (!allProposals.some((p) => p.title.toLowerCase() === gap.title.toLowerCase() && p.franchiseId === franchise.id)) {
          gapCounts[gap.gapType]++;
          statusCounts.POSSIBLE_MISSING++;
          franchiseProposals.push(gap);
          allProposals.push(gap);
        }
      }

      const orphanNodesForFranchise = brokenGraphDependencies.filter((b) =>
        b.brokenNodeId.startsWith(franchise.id.substring(0, 3))
      ).length;

      const summary: FranchiseAuditSummary = {
        franchiseId: franchise.id,
        franchiseName: franchise.name,
        slug: franchise.slug || franchise.id,
        totalCatalogTitles: franchiseTitles.length,
        moviesCount,
        seriesCount,
        knownContinuities: Array.from(knownContinuityNames),
        missingCount: franchiseProposals.length,
        proposals: franchiseProposals,
        brokenDependenciesCount: brokenGraphDependencies.length,
        orphanNodesCount: orphanNodesForFranchise,
        auditStatus: franchiseProposals.length === 0 ? 'COMPLETE_VERIFIED' : 'GAPS_DETECTED',
      };

      franchiseSummaries.push(summary);
    }

    const totalGaps = Object.values(gapCounts).reduce((a, b) => a + b, 0);

    const report: GlobalCompletenessAuditReport = {
      timestamp: nowTimestamp,
      auditEngineVersion: COMPLETENESS_AUDIT_ENGINE_VERSION,
      totalFranchisesAudited: franchisesToAudit.length,
      totalTitlesAudited: allContent.length,
      totalStoryEdgesAudited: storyEdges.length,
      totalGapsDetected: totalGaps,
      gapCountsByType: gapCounts,
      findingCountsByStatus: statusCounts,
      brokenGraphDependencies,
      franchiseSummaries,
      allProposals,
      summaryMetrics: {
        verifiedMissingTitlesCount: statusCounts.VERIFIED_MISSING,
        possibleMissingTitlesCount: statusCounts.POSSIBLE_MISSING,
        missingPrerequisitesCount: gapCounts.MISSING_PREREQUISITE + gapCounts.MISSING_CROSSOVER_CONTEXT,
        continuityGapsCount: gapCounts.MISSING_CONTINUITY_ENTRY,
        brokenGraphDependenciesCount: brokenGraphDependencies.length,
        duplicateRisksCount: allProposals.filter((p) => p.duplicateCheck.isDuplicate).length,
        ambiguousCandidatesCount: statusCounts.AMBIGUOUS,
        pendingApprovalsCount: allProposals.filter((p) => p.reviewStatus === 'pending').length,
        approvedIntegrationsCount: allProposals.filter((p) => p.reviewStatus === 'approved').length,
      },
      auditVerdict:
        brokenGraphDependencies.length > 0
          ? 'CRITICAL_GAPS_DETECTED'
          : allProposals.length > 0
          ? 'PROPOSALS_PENDING_REVIEW'
          : 'HEALTHY_CANONICAL',
    };

    return report;
  }

  /**
   * Analyzes numbering patterns and identifies possible missing intermediate installments
   */
  private static detectSequentialGaps(
    franchise: Franchise,
    titles: Content[]
  ): CandidateMissingTitleProposal[] {
    const gaps: CandidateMissingTitleProposal[] = [];
    const sorted = sortContentByReleaseDate(titles);

    // Regex to match "Title [1-9]" or "Title: Chapter [1-9] - Subtitle" or "Title Part [1-9]"
    const numberedMap = new Map<string, { num: number; title: Content }[]>();

    for (const t of sorted) {
      const match = t.title.match(/^(.+?)(?:\s+|:\s*)(?:chapter|part|episode|vol|volume)?\s*(\d+)(?:\s*[:\-–].*)?$/i);
      if (match && match[1] && match[2]) {
        const baseName = match[1].trim().toLowerCase().replace(/[:\-–]/g, '').trim();
        const num = parseInt(match[2], 10);
        if (!numberedMap.has(baseName)) numberedMap.set(baseName, []);
        numberedMap.get(baseName)!.push({ num, title: t });
      }
    }

    for (const [baseName, sequence] of numberedMap.entries()) {
      sequence.sort((a, b) => a.num - b.num);
      const nums = sequence.map((s) => s.num);
      const maxNum = Math.max(...nums);
      const minNum = Math.min(...nums);

      for (let i = minNum; i <= maxNum; i++) {
        if (!nums.includes(i)) {
          // Check if any existing title in franchise already covers this index
          const alreadyExists = titles.some((t) => {
            const titleNorm = t.title.toLowerCase();
            return (
              (titleNorm.includes(baseName) && (titleNorm.includes(` ${i}`) || titleNorm.includes(`${i}`))) ||
              t.id.endsWith(`-${i}`)
            );
          });

          if (alreadyExists) continue;

          // Found sequential gap
          const preceding = sequence.find((s) => s.num === i - 1)?.title;
          const succeeding = sequence.find((s) => s.num === i + 1)?.title;
          const estimatedYear = preceding?.release_date
            ? parseInt((preceding.release_date || '').split('-')[0] || '2020', 10) + 2
            : null;

          const gapTitle = `${preceding?.title.replace(/\s+\d+.*$/, '') || baseName} ${i}`;

          const proposal = this.createProposal({
            franchise,
            gapType: 'MISSING_SEQUEL',
            canonicalTitle: gapTitle,
            tmdbId: null,
            mediaType: 'movie',
            releaseDate: estimatedYear ? `${estimatedYear}-06-01` : null,
            overview: `Sequential intermediate installment (${i}) detected between ${preceding?.title || 'prior'} and ${succeeding?.title || 'next'}.`,
            continuity: 'Main Continuity',
            reasons: [
              `Sequential gap detected in numbered sequence: found ${nums.join(', ')}, missing ${i}.`,
            ],
            evidenceSource: 'Structural Numbered Sequence Gap Detector',
            confidence: 0.85,
            existingTitles: titles,
          });

          gaps.push(proposal);
        }
      }
    }

    return gaps;
  }

  /**
   * Helper to create a fully typed and validated CandidateMissingTitleProposal
   */
  public static createProposal(params: {
    franchise: Franchise;
    gapType: CompletenessGapType;
    canonicalTitle: string;
    tmdbId: number | null;
    mediaType: ContentType;
    releaseDate: string | null;
    overview: string;
    director?: string;
    continuity: string;
    reasons: string[];
    evidenceSource: string;
    confidence: number;
    prerequisiteTargets?: string[];
    existingTitles: Content[];
  }): CandidateMissingTitleProposal {
    const {
      franchise,
      gapType,
      canonicalTitle,
      tmdbId,
      mediaType,
      releaseDate,
      overview,
      director,
      continuity,
      reasons,
      evidenceSource,
      confidence,
      prerequisiteTargets = [],
      existingTitles,
    } = params;

    const proposalId = `gap-${franchise.id}-${canonicalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const releaseYear = releaseDate ? releaseDate.split('-')[0] || null : null;

    // 1. Duplicate Check
    const isDuplicateTitle = existingTitles.some(
      (t) => t.title.toLowerCase().trim() === canonicalTitle.toLowerCase().trim()
    );
    const isDuplicateTmdb = tmdbId ? existingTitles.some((t) => t.tmdb_id === tmdbId) : false;
    const existingDuplicate = existingTitles.find(
      (t) =>
        t.title.toLowerCase().trim() === canonicalTitle.toLowerCase().trim() ||
        (tmdbId && t.tmdb_id === tmdbId)
    );

    // 2. Lifecycle Classification
    const today = new Date().toISOString().split('T')[0] || '2026-08-16';
    const isTba = !releaseDate || releaseDate.toUpperCase() === 'TBA';
    const isPast = !isTba && Boolean(releaseDate && releaseDate <= today);
    const lifecycleCategory = isPast ? 'THEATRICALLY_RELEASED' : 'UPCOMING';
    const lifecycleStatus = isPast ? 'theatrically_released' : 'upcoming';

    // 3. Artwork Resolution
    const verifiedArt = VERIFIED_PROPOSAL_ARTWORK[canonicalTitle];
    const posterUrl = verifiedArt?.poster || CINEORDER_PLACEHOLDER_POSTER;
    const backdropUrl = verifiedArt?.backdrop || CINEORDER_PLACEHOLDER_BACKDROP;

    // 4. Chronological Placement Calculation
    const candidateDummy: Content = {
      id: proposalId,
      franchise_id: franchise.id,
      title: canonicalTitle,
      type: mediaType,
      poster_url: posterUrl,
      backdrop_url: backdropUrl,
      overview,
      release_date: releaseDate || 'TBA',
      runtime: 120,
      episode_count: null,
      season_count: null,
      rating: 7.0,
      status: isPast ? 'released' : 'upcoming',
      genres: [],
      director: director || '',
      cast: [],
      trailer_url: '',
      is_canon: true,
      is_required: true,
      theatrical_released: isPast,
      ott_available: false,
      tmdb_id: tmdbId || null,
      created_at: new Date().toISOString(),
    };

    const sortedWithCandidate = sortContentByReleaseDate([...existingTitles, candidateDummy]);
    const candidateIdx = sortedWithCandidate.findIndex((c) => c.id === proposalId);
    const preceding = candidateIdx > 0 ? sortedWithCandidate[candidateIdx - 1] : undefined;
    const succeeding = candidateIdx < sortedWithCandidate.length - 1 ? sortedWithCandidate[candidateIdx + 1] : undefined;

    // 5. Proposed Story Knowledge Graph Relationships
    const proposedStoryRelationships: ProposedStoryRelationshipCandidate[] = [];
    if (preceding && isPast) {
      proposedStoryRelationships.push({
        sourceId: preceding.id,
        targetId: proposalId,
        relationship: 'direct-sequel',
        strength: 'required',
        confidence: 'confirmed',
        reason: `Direct sequential predecessor prior to ${canonicalTitle}.`,
        editorialImportance: 'primary',
      });
    }

    for (const targetId of prerequisiteTargets) {
      proposedStoryRelationships.push({
        sourceId: proposalId,
        targetId,
        relationship: gapType === 'MISSING_CROSSOVER_CONTEXT' ? 'major-crossover' : 'story-continuation',
        strength: 'required',
        confidence: 'confirmed',
        reason: `Prerequisite lore and character continuity for ${targetId}.`,
        editorialImportance: 'primary',
      });
    }

    return {
      proposalId,
      gapType,
      title: canonicalTitle,
      tmdbId,
      mediaType,
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      continuity,
      releaseDate,
      releaseYear,
      overview,
      director,
      reasonsDetected: reasons,
      evidence: {
        source: evidenceSource,
        sourceType: 'tmdb-collection',
        verificationStatus: confidence >= 0.9 ? 'verified' : 'provisional',
        confidenceScore: confidence,
        citations: [evidenceSource],
      },
      duplicateCheck: {
        isDuplicate: isDuplicateTitle || isDuplicateTmdb,
        existingContentId: existingDuplicate?.id,
        existingTitle: existingDuplicate?.title,
        duplicateReason: existingDuplicate
          ? `Already present in catalog as ID '${existingDuplicate.id}' (${existingDuplicate.title}).`
          : undefined,
      },
      artworkResolution: {
        posterUrl,
        backdropUrl,
        resolutionState: verifiedArt ? 'VERIFIED' : 'FALLBACK',
        source: verifiedArt ? 'tmdb' : 'fallback',
      },
      lifecycleClassification: {
        status: isPast ? 'released' : 'upcoming',
        lifecycleStatus,
        lifecycleCategory,
        ottAvailable: false,
      },
      chronologicalPlacement: {
        recommendedPosition: candidateIdx + 1,
        referencePrecedingTitleId: preceding?.id,
        referenceSucceedingTitleId: succeeding?.id,
        releaseDateSortKey: candidateDummy.release_date,
      },
      proposedStoryRelationships,
      reviewStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
