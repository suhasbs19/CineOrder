import {
  CheckCircle,
  ArrowDown,
} from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { cn, formatYear } from '@/lib/utils';
import type { KnowledgeGraphTraversalResult } from '@/lib/storyKnowledgeGraphEngine';
import type { CategoryType } from '@/types/preparation';
import { getFranchiseBadgeLabel } from '@/components/ui/PreparationGuide';
import { isTheatricallyUpcoming } from '@/lib/upcomingUtils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

import {
  deduplicateRecommendationList,
} from '@/lib/officialPreparationOverrideService';

interface StoryGraphNodeHierarchyProps {
  graphResult: KnowledgeGraphTraversalResult;
  onToggleWatched: (id: string) => void;
  onNavigate: (path: string) => void;
}

export function StoryGraphNodeHierarchy({
  graphResult,
  onToggleWatched,
  onNavigate,
}: StoryGraphNodeHierarchyProps) {
  const targetTitle = graphResult.targetContent.title;

  // Collect all preparation items from every category
  const rawRecs =
    (graphResult as any).mode === 'OFFICIAL_OVERRIDE' && (graphResult as any).officialPreparationItems
      ? [
          ...((graphResult as any).officialPreparationItems || []),
          ...((graphResult as any).cineOrderExtraContent || []),
        ]
      : [
          ...graphResult.mustWatch,
          ...graphResult.recommended,
          ...graphResult.optional,
          ...(graphResult.postCreditContext || []),
        ];

  // Single chronological list — deduplicated and sorted earliest release first
  const chronologicalItems = [
    ...deduplicateRecommendationList(rawRecs),
  ].sort((a, b) => compareReleaseDates(a.content, b.content));

  const getPriorityBadge = (category: CategoryType) => {
    switch (category) {
      case 'must_watch':
        return (
          <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
            Must Watch
          </span>
        );
      case 'recommended':
        return (
          <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Recommended
          </span>
        );
      case 'optional':
        return (
          <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Extra Context
          </span>
        );
      case 'post_credit':
        return (
          <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Post-Credit
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
      {chronologicalItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-surface/30 rounded-2xl border border-white/10 space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="text-sm text-muted">No prior viewing required.</p>
        </div>
      ) : (
        <>
          {chronologicalItems.map((node, index) => {
            const c = node.content;

            return (
              <div key={c.id} className="space-y-0">
                {/* Node Card */}
                <div
                  data-testid="story-node-card"
                  className="p-2.5 sm:p-4 rounded-xl bg-surface/60 border border-white/10 hover:border-white/20 transition-all shadow-md"
                >
                  <div className="flex flex-row gap-3 sm:gap-4 items-start">
                    {/* Thumbnail */}
                    <div
                      onClick={() => onNavigate(`/movie/${c.id}`)}
                      className="w-[84px] min-w-[84px] max-w-[84px] sm:w-20 sm:min-w-0 sm:max-w-none aspect-[2/3] rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer group self-stretch sm:self-auto bg-surface/40"
                    >
                      <SafeImage
                        src={c.poster_url}
                        alt={c.title}
                        aspectRatio="poster"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-1.5 sm:gap-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                            <h4
                              onClick={() => onNavigate(`/movie/${c.id}`)}
                              className="text-xs sm:text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-snug"
                            >
                              {c.title}
                            </h4>
                            <span className="text-[10px] sm:text-xs text-muted flex-shrink-0">({formatYear(c.release_date)})</span>
                            {getPriorityBadge(node.category)}
                            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
                              {getFranchiseBadgeLabel(c.franchise_id)}
                            </span>
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {node.dependencyType}
                            </span>
                          </div>

                          <div className="flex-shrink-0">
                            {isTheatricallyUpcoming(c) ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled
                                className="text-[10px] sm:text-xs py-0.5 sm:py-1 px-2 sm:px-2.5 h-6 sm:h-7 opacity-60 cursor-not-allowed border border-white/10"
                                title="This title has not premiered yet and cannot be marked as watched."
                              >
                                Upcoming
                              </Button>
                            ) : (
                              <Button
                                variant={node.isWatched ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleWatched(c.id);
                                }}
                                className={cn(
                                  'text-[10px] sm:text-xs py-0.5 sm:py-1 px-2 sm:px-2.5 h-6 sm:h-7 gap-1 cursor-pointer',
                                  node.isWatched && 'bg-green-500/20 text-green-400 border border-green-500/30'
                                )}
                              >
                                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {node.isWatched ? 'Watched' : 'Mark Watched'}
                              </Button>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] sm:text-xs text-muted-light leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-3">
                          <span className="text-white font-semibold">Narrative Role:</span> {node.shortReason || node.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chronological arrow connector between items */}
                {index < chronologicalItems.length - 1 && (
                  <div data-testid="story-connection-bar" className="flex items-center justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-primary/50" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Arrow connector leading into the target destination */}
          <div data-testid="story-connection-bar" className="flex items-center justify-center py-1">
            <ArrowDown className="w-4 h-4 text-primary/50" />
          </div>
        </>
      )}

      {/* Target Root Node Destination */}
      <div className="pt-2 text-center space-y-2">
        <span className="text-[11px] font-mono text-muted uppercase tracking-widest">
          🎯 Target Narrative Destination
        </span>
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/20 text-white font-black text-base border border-primary/50 shadow-2xl shadow-primary/30">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          {targetTitle}
        </div>
      </div>
    </div>
  );
}
