import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  GitCommit,
  CheckCircle,
  Network,
  Users,
  Film,
  Flame,
  Star,
  Zap,
  ChevronRight,
  Info,
  X,
  Sparkles,
  Tv,
  ShieldCheck,
  ExternalLink,
  BookmarkCheck,
} from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StoryGraphNodeHierarchy } from '@/components/ui/StoryGraphNodeHierarchy';
import { cn, formatYear } from '@/lib/utils';
import { useWatchStore } from '@/store/watchStore';
import { cineOrderKnowledgeGraph, type StoryEdge } from '@/data/cineOrderKnowledgeGraph';
import type { KnowledgeGraphTraversalResult } from '@/lib/storyKnowledgeGraphEngine';
import {
  resolvePreparationGuide,
  deduplicateRecommendationList,
} from '@/lib/officialPreparationOverrideService';
import type { CategoryType } from '@/types/preparation';
import { franchises } from '@/data/franchises';
import { getLifecycleCategory } from '@/lib/metadataRefresh';
import { isTheatricallyUpcoming } from '@/lib/upcomingUtils';
import { compareReleaseDates } from '@/lib/releaseOrdering';

export function getFranchiseBadgeLabel(franchiseId?: string): string {
  if (!franchiseId) return 'Unknown Franchise';
  const map: Record<string, string> = {
    'marvel-cinematic-universe': 'MCU',
    'x-men': 'X-Men Universe',
    'x-men-universe': 'X-Men Universe',
    'sony-spider-verse': 'Sony Spider-Verse',
    'defenders-saga': 'Defenders Saga',
    'dc-universe': 'DCEU',
    dceu: 'DCEU',
    'wizarding-world': 'Wizarding World',
    'middle-earth': 'Middle-earth',
    'star-wars': 'Star Wars',
    'john-wick': 'John Wick',
  };
  if (map[franchiseId]) return map[franchiseId];
  const found = franchises.find((f) => f.id === franchiseId || f.slug === franchiseId);
  return found?.name || franchiseId.toUpperCase();
}

interface PreparationGuideProps {
  contentId?: string;
  graphResult?: KnowledgeGraphTraversalResult;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number | string;
  badgeColor: string;
}

function TabButton({ active, onClick, label, count, badgeColor }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border flex-shrink-0 cursor-pointer',
        active
          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
          : 'bg-surface/60 text-muted hover:text-white border-white/10 hover:border-white/20'
      )}
    >
      <span>{label}</span>
      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black', badgeColor)}>
        {count}
      </span>
    </button>
  );
}

function findEdgeMetadata(srcId: string, tgtId: string): StoryEdge | undefined {
  const s = srcId.toLowerCase();
  const t = tgtId.toLowerCase();
  return cineOrderKnowledgeGraph.edges.find(
    (e) => e.sourceId.toLowerCase() === s && e.targetId.toLowerCase() === t
  );
}

function formatRelationshipLabel(rel?: string): string {
  if (!rel) return 'Story Continuation';
  const map: Record<string, string> = {
    'direct-sequel': 'Direct Sequel',
    'story-continuation': 'Story Continuation',
    'character-origin': 'Character Origin',
    'character-development': 'Character Development',
    mentor: 'Mentor Relationship',
    'villain-origin': 'Villain Origin',
    'shared-villain': 'Shared Villain',
    'shared-character': 'Shared Character',
    'shared-event': 'Shared Event',
    'shared-object': 'Technology Origin',
    organization: 'Organization Setup',
    timeline: 'Timeline Impact',
    multiverse: 'Multiverse Connection',
    'world-building': 'World Building',
    'post-credit': 'Post-Credit Setup',
    'major-crossover': 'Major Crossover',
  };
  return map[rel] || rel.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function PreparationGuide({ contentId, graphResult: providedGraphResult }: PreparationGuideProps) {
  const navigate = useNavigate();
  const { watchHistory, toggleWatched } = useWatchStore();

  // Make Story Graph Tree the Hero default view
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph');
  const [activeTab, setActiveTab] = useState<CategoryType>('must_watch');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [inspectedItem, setInspectedItem] = useState<{ rec: any; edge: any } | null>(null);

  const toggleDetailsFor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const guideData = useMemo(() => {
    if (providedGraphResult) {
      return {
        ...providedGraphResult,
        mode: 'GRAPH_RECOMMENDATION' as const,
      };
    }
    if (contentId) {
      const watchedList = Object.keys(watchHistory).filter((k) => watchHistory[k]);
      return resolvePreparationGuide(contentId, watchedList);
    }
    return null;
  }, [providedGraphResult, contentId, watchHistory]);

  if (!guideData) {
    return null;
  }

  const graphResult = guideData;
  const isOfficialOverride = guideData.mode === 'OFFICIAL_OVERRIDE';

  const remainingCritical = graphResult.mustWatch.filter((r) => !r.isWatched).length;
  const remainingRecommended = graphResult.recommended.filter((r) => !r.isWatched).length;
  const remainingOptional = graphResult.optional.filter((r) => !r.isWatched).length;

  const getPriorityBadge = (category: CategoryType) => {
    if (isOfficialOverride) {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <BookmarkCheck className="w-3 h-3" /> OFFICIAL PREREQUISITE
        </span>
      );
    }
    switch (category) {
      case 'must_watch':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
            MUST WATCH
          </span>
        );
      case 'recommended':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            RECOMMENDED
          </span>
        );
      case 'optional':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
            EXTRA CONTEXT
          </span>
        );
      case 'post_credit':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
            POST-CREDIT
          </span>
        );
      default:
        return null;
    }
  };

  const lifecycleCategory = getLifecycleCategory(graphResult.targetContent);
  const isUpcoming = lifecycleCategory === 'UPCOMING';
  const isTheatrical = lifecycleCategory === 'THEATRICALLY_RELEASED';
  const isStreaming = lifecycleCategory === 'STREAMING_AVAILABLE';

  const availableTabs = useMemo(() => {
    const tabs: { key: CategoryType; label: string; count: number; watchedCount: number; badgeColor: string }[] = [];

    if (isOfficialOverride) {
      const watched = (guideData.officialItems || []).filter((r) => r.isWatched).length;
      tabs.push({
        key: 'must_watch',
        label: 'Official Studio Watchlist',
        count: guideData.officialItems?.length || 0,
        watchedCount: watched,
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      });
      return tabs;
    }

    if (graphResult.mustWatch.length > 0) {
      const watched = graphResult.mustWatch.filter((r) => r.isWatched).length;
      tabs.push({
        key: 'must_watch',
        label: 'Must Watch',
        count: graphResult.mustWatch.length,
        watchedCount: watched,
        badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
      });
    }

    if (isUpcoming) {
      const consolidatedCount = graphResult.recommended.length + graphResult.optional.length;
      if (consolidatedCount > 0) {
        const watched =
          graphResult.recommended.filter((r) => r.isWatched).length +
          graphResult.optional.filter((r) => r.isWatched).length;
        tabs.push({
          key: 'recommended',
          label: 'Additional Recommended Viewing',
          count: consolidatedCount,
          watchedCount: watched,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        });
      }
    } else {
      if (graphResult.recommended.length > 0) {
        const watched = graphResult.recommended.filter((r) => r.isWatched).length;
        tabs.push({
          key: 'recommended',
          label: 'Recommended',
          count: graphResult.recommended.length,
          watchedCount: watched,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        });
      }
      if (graphResult.optional.length > 0) {
        const watched = graphResult.optional.filter((r) => r.isWatched).length;
        tabs.push({
          key: 'optional',
          label: 'Extra Context',
          count: graphResult.optional.length,
          watchedCount: watched,
          badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        });
      }
    }

    if (graphResult.postCreditContext && graphResult.postCreditContext.length > 0) {
      const watched = graphResult.postCreditContext.filter((r) => r.isWatched).length;
      tabs.push({
        key: 'post_credit',
        label: 'Post-Credit Context',
        count: graphResult.postCreditContext.length,
        watchedCount: watched,
        badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      });
    }
    return tabs;
  }, [graphResult, isUpcoming, isOfficialOverride, guideData]);

  const effectiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key || 'must_watch';

  const currentTabItems = useMemo(() => {
    if (isOfficialOverride) {
      // In official override mode, preserve exact official order without sorting by release date
      return deduplicateRecommendationList(guideData.officialPreparationItems || guideData.officialItems || []);
    }

    let items = graphResult.mustWatch;
    if (effectiveTab === 'must_watch') {
      items = graphResult.mustWatch;
    } else if (effectiveTab === 'recommended') {
      if (isUpcoming) {
        items = [...graphResult.recommended, ...graphResult.optional];
      } else {
        items = graphResult.recommended;
      }
    } else if (effectiveTab === 'optional') {
      items = graphResult.optional;
    } else {
      items = graphResult.postCreditContext || [];
    }

    const cleanItems = deduplicateRecommendationList(items);

    // Sort chronologically ascending by canonical release date (earliest release first)
    return [...cleanItems].sort((a, b) => compareReleaseDates(a.content, b.content));
  }, [effectiveTab, graphResult, isUpcoming, isOfficialOverride, guideData]);

  const filteredTabItems = currentTabItems;

  const handleToggleWatched = (cId: string) => {
    toggleWatched('guest-user', cId);
  };

  const categoryBannerConfig: Record<CategoryType, { title: string; description: string; style: string; icon: React.ReactNode }> = {
    must_watch: {
      title: 'Must Watch',
      description: 'Required to understand the main story.',
      style: 'bg-red-500/10 border-red-500/30 text-red-300',
      icon: <Flame className="w-4 h-4 text-red-400" />,
    },
    recommended: {
      title: 'Recommended',
      description: 'Adds meaningful narrative context but isn\'t required.',
      style: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />,
    },
    optional: {
      title: 'Extra Context',
      description: 'Optional lore that enriches the experience.',
      style: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      icon: <Film className="w-4 h-4 text-blue-400" />,
    },
    post_credit: {
      title: 'Post-Credit Context',
      description: 'Explains optional end-credit scenes and future story setup.',
      style: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
    },
    safe_to_skip: {
      title: 'Safe to Skip',
      description: 'Contains minimal or redundant story connection.',
      style: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-300',
      icon: <CheckCircle className="w-4 h-4 text-zinc-400" />,
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {isOfficialOverride ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
              ) : (
                <Network className="w-6 h-6 text-primary animate-pulse" />
              )}
              <h2 className="text-2xl font-black text-white">
                {isOfficialOverride ? 'Official Preparation' : 'Narrative Knowledge Graph Explorer'}
              </h2>
              {isOfficialOverride ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3 text-emerald-400" /> OFFICIAL STUDIO OVERRIDE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                  CKG Engine v1.0
                </span>
              )}
              {isUpcoming && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Pre-Release Story Preparation
                </span>
              )}
              {isTheatrical && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                  <Film className="w-3 h-3 text-blue-400" /> In Theaters / Catch-Up Mode
                </span>
              )}
              {isStreaming && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Tv className="w-3 h-3 text-emerald-400" /> Available to Stream
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              {isOfficialOverride
                ? `Authoritative studio preparation list verified from ${guideData.officialSource?.sourcePublisher}.`
                : `Directed narrative graph traversal for ${graphResult.targetContent.title}.`}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-surface border border-white/10 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'graph'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-muted hover:text-white'
              )}
            >
              <GitCommit className="w-3.5 h-3.5 text-cyan-300" /> Story Graph Tree
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-muted hover:text-white'
              )}
            >
              <Layers className="w-3.5 h-3.5" /> List View
            </button>
          </div>
        </div>

        {/* Official Source Metadata Card */}
        {isOfficialOverride && guideData.officialSource && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-300">Verified Publisher:</span>
                <span className="font-semibold text-white">{guideData.officialSource.sourcePublisher}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  v{guideData.officialSource.version}
                </span>
                <span className="text-emerald-400/80 text-[11px]">
                  • Published: {guideData.officialSource.publicationDate}
                </span>
              </div>
              {guideData.officialSource.sourceUrl && (
                <a
                  href={guideData.officialSource.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-100 underline decoration-emerald-400/50 hover:decoration-emerald-200 transition-colors"
                >
                  View Official Studio Release <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {guideData.officialSource.officialStatement && (
              <p className="text-xs text-emerald-100/90 italic bg-black/20 p-2.5 rounded-lg border border-emerald-500/20">
                "{guideData.officialSource.officialStatement}"
              </p>
            )}
          </div>
        )}

        {/* Entry Point Banner */}
        {graphResult.isEntryPoint && (
          <div
            className={cn(
              'p-4 rounded-xl border space-y-1',
              isUpcoming
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 text-sm font-black',
                isUpcoming ? 'text-amber-300' : 'text-emerald-300'
              )}
            >
              {isUpcoming ? (
                <Sparkles className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {isUpcoming
                  ? 'Upcoming — Story Preparation Available'
                  : 'Ready to Watch — Standalone Entry Point'}
              </span>
            </div>
            <p
              className={cn(
                'text-xs font-medium',
                isUpcoming ? 'text-amber-100' : 'text-emerald-100'
              )}
            >
              {isUpcoming
                ? graphResult.recommended.length > 0 || graphResult.optional.length > 0
                  ? 'No previous movies are required before this upcoming title. Recommended background viewing provides optional character and world context before release.'
                  : 'This upcoming title is an excellent standalone entry point. No prior movies or series are required.'
                : graphResult.recommended.length > 0 || graphResult.optional.length > 0
                ? 'No previous movies are required to understand the main feature story. Recommended titles provide additional character and world context.'
                : 'This title is an excellent entry point. No previous movies or TV series are required.'}
            </p>
          </div>
        )}

        {/* Timeline / Readiness Warning Banner */}
        {!graphResult.isEntryPoint && (
          <div
            className={cn(
              'p-3.5 rounded-xl border flex items-center gap-3 text-xs',
              isOfficialOverride
                ? graphResult.storyReadinessPercentage === 100
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : isUpcoming
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            )}
          >
            {isOfficialOverride ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : isUpcoming ? (
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <p className="font-semibold">
              {isOfficialOverride
                ? graphResult.storyReadinessPercentage === 100
                  ? '✨ Official Preparation Complete. All studio-designated prerequisites watched!'
                  : `📋 Official Studio Watchlist: ${graphResult.watchedCount} of ${graphResult.totalPrerequisitesCount} prerequisites watched.`
                : isUpcoming
                ? '✨ Story Preparation Available — catch up before premiere.'
                : '✅ Ready to Watch.'}
            </p>
          </div>
        )}

        {/* Curated Editorial Narrative Journey Header */}
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-surface/60 to-surface/60 border border-amber-500/20 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
            {isOfficialOverride ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isOfficialOverride
                ? 'Official Studio Watchlist'
                : isUpcoming
                ? 'Pre-Release Story Preparation'
                : isTheatrical
                ? 'Theatrical Catch-Up Guide'
                : 'Narrative Story Guide'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] sm:text-xs leading-normal sm:leading-relaxed">
            {isOfficialOverride
              ? `Officially published preparation guide directly from ${guideData.officialSource?.sourcePublisher}. CineOrder strictly adheres to official studio authority.`
              : isUpcoming
              ? 'Professionally curated pre-release recommendations designed to prepare your story context, character continuity, and emotional payoff before this title premieres in theaters.'
              : isTheatrical
              ? 'Professionally curated recommendations to catch up on critical character arcs and narrative backstory before watching this movie in theaters.'
              : 'Professionally curated recommendations designed to provide the richest viewing experience, character continuity, emotional payoff, and narrative understanding for this title.'}
          </p>
        </div>

        {/* Completion Progress Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 sm:gap-3">
          <div className="p-2 sm:p-3.5 rounded-xl bg-surface/50 border border-white/5 flex flex-col justify-between min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase truncate">
              {isOfficialOverride
                ? 'Official Readiness'
                : isUpcoming
                ? 'Preparation'
                : isTheatrical
                ? 'Catch-Up Readiness'
                : 'Viewing Readiness'}
            </span>
            <span className="text-sm sm:text-xl font-black text-gradient mt-0.5 sm:mt-1">{graphResult.storyReadinessPercentage}%</span>
          </div>

          <div className="p-2 sm:p-3.5 rounded-xl bg-surface/50 border border-white/5 flex flex-col justify-between min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase truncate">
              {isOfficialOverride ? 'Official Prereqs' : 'Must Watch'}
            </span>
            <span className="text-sm sm:text-xl font-black text-red-400 mt-0.5 sm:mt-1 truncate">
              {remainingCritical} <span className="text-[10px] sm:text-xs font-normal text-muted">Left • {graphResult.mustWatch.length} Total</span>
            </span>
          </div>

          {isUpcoming ? (
            <div className="p-2 sm:p-3.5 rounded-xl bg-surface/50 border border-amber-500/20 col-span-2 md:col-span-2 flex flex-col justify-between min-w-0">
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1 truncate">
                <span>Recommended Viewing</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">Pre-Release</span>
              </span>
              <span className="text-sm sm:text-xl font-black text-amber-400 mt-0.5 sm:mt-1">
                {remainingRecommended + remainingOptional} <span className="text-[10px] sm:text-xs font-normal text-muted">Left • {graphResult.recommended.length + graphResult.optional.length} Total</span>
              </span>
            </div>
          ) : (
            <>
              <div className="p-2 sm:p-3.5 rounded-xl bg-surface/50 border border-white/5 flex flex-col justify-between min-w-0">
                <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase truncate">Recommended</span>
                <span className="text-sm sm:text-xl font-black text-amber-400 mt-0.5 sm:mt-1 truncate">
                  {remainingRecommended} <span className="text-[10px] sm:text-xs font-normal text-muted">Left • {graphResult.recommended.length} Total</span>
                </span>
              </div>

              <div className="p-2 sm:p-3.5 rounded-xl bg-surface/50 border border-white/5 flex flex-col justify-between min-w-0">
                <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase truncate">Extra Context</span>
                <span className="text-sm sm:text-xl font-black text-blue-400 mt-0.5 sm:mt-1 truncate">
                  {remainingOptional} <span className="text-[10px] sm:text-xs font-normal text-muted">Left • {graphResult.optional.length} Total</span>
                </span>
              </div>
            </>
          )}

          <div className="p-2 sm:p-3.5 rounded-xl bg-surface/50 border border-white/5 col-span-2 md:col-span-1 flex flex-col justify-between min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase truncate">Est. Watch Time</span>
            <div className="mt-0.5 sm:mt-1 flex items-baseline sm:flex-col gap-1.5 sm:gap-0">
              <span className="text-sm sm:text-xl font-black text-white">{graphResult.formattedWatchTime}</span>
              <span className="text-[10px] font-normal text-muted">{graphResult.totalPrerequisitesCount} {graphResult.totalPrerequisitesCount === 1 ? 'title' : 'titles'} total</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Sentence */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-muted leading-relaxed">
          {graphResult.isEntryPoint ? (
            <span>
              To fully understand <strong className="text-white">{graphResult.targetContent.title}</strong>, no previous movies or series are required.
              {graphResult.recommended.length > 0 && ` ${graphResult.recommended.length} recommended ${graphResult.recommended.length === 1 ? 'title provides' : 'titles provide'} additional character and world context.`}
            </span>
          ) : (
            <span>
              To fully understand <strong className="text-white">{graphResult.targetContent.title}</strong>, you should watch{' '}
              <strong className="text-red-400 font-bold">{graphResult.mustWatch.length} required {graphResult.mustWatch.length === 1 ? 'film' : 'films'}</strong>.
              {graphResult.recommended.length > 0 && (
                <>
                  {' '}An additional <strong className="text-amber-400 font-bold">{graphResult.recommended.length} {graphResult.recommended.length === 1 ? 'film provides' : 'films provide'}</strong> character and world-building context.
                </>
              )}
            </span>
          )}
        </div>

        {/* Legend Bar */}
        <div className="p-3 rounded-xl bg-surface/40 border border-white/5 flex flex-wrap items-center gap-4 text-[11px] text-muted">
          <span className="font-bold uppercase tracking-wider text-[10px] text-white">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Character Arc</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Main Feature Story</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> Required Prerequisites</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Recommended Background</span>
        </div>

        {/* Progress Bar */}
        <div className="bg-surface/40 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Graph Path Readiness Progress</span>
            <span className="text-muted font-medium">
              {remainingCritical > 0
                ? `Watch ${remainingCritical} required ${remainingCritical === 1 ? 'film' : 'films'} to reach 100% Story Readiness`
                : `${graphResult.watchedCount} of ${graphResult.totalPrerequisitesCount} Prerequisites Watched`}
            </span>
          </div>
          <ProgressBar value={graphResult.storyReadinessPercentage} size="md" />
        </div>
      </div>

      {/* STORY GRAPH TREE VIEW MODE (HERO VISUALIZATION) */}
      {viewMode === 'graph' ? (
        <StoryGraphNodeHierarchy
          graphResult={graphResult as any}
          onToggleWatched={handleToggleWatched}
          onNavigate={(path) => navigate(path)}
        />
      ) : (
        /* STANDARD LIST VIEW MODE */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {availableTabs.map((tab) => (
                <TabButton
                  key={tab.key}
                  active={effectiveTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  label={tab.label}
                  count={`${tab.watchedCount}/${tab.count}`}
                  badgeColor={tab.badgeColor}
                />
              ))}
            </div>
          </div>

          {/* Editorial Category Explanation Banner */}
          {categoryBannerConfig[effectiveTab] && (
            <div className={cn('p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs', categoryBannerConfig[effectiveTab].style)}>
              <div className="flex items-center gap-2">
                {categoryBannerConfig[effectiveTab].icon}
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  {categoryBannerConfig[effectiveTab].title}:
                </span>
                <span className="font-medium text-white/90">
                  {categoryBannerConfig[effectiveTab].description}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/60 hidden sm:inline">
                CineOrder Standard
              </span>
            </div>
          )}

          {/* Tab Items List */}
          <div className="space-y-4 pt-1">
            {graphResult.totalPrerequisitesCount === 0 ? (
              <div className="text-center py-12 px-4 bg-surface/30 rounded-2xl border border-white/10 space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Prior Viewing Required</h3>
                <p className="text-sm text-muted max-w-lg mx-auto">
                  No prior viewing is required based on CineOrder's current knowledge graph. You can jump directly into <strong className="text-white">{graphResult.targetContent.title}</strong>!
                </p>
              </div>
            ) : filteredTabItems.length === 0 ? (
              <div className="text-center py-10 bg-surface/30 rounded-xl border border-white/5 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-base font-bold text-white">✓ No matching titles found.</p>
                <p className="text-xs text-muted font-medium">
                  No additional movies or TV series are required in this category.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTabItems.map((rec) => {
                  const c = rec.content;
                  const edge = findEdgeMetadata(c.id, graphResult.targetContent.id);
                  const isDetailsExpanded = !!showDetails[c.id];

                  const relationshipLabel = formatRelationshipLabel(edge?.relationship);
                  const scopeLabel = edge?.narrativeScope === 'post-credit' ? 'Post-Credit' : 'Main Feature';
                  const strengthLabel = edge?.strength === 'required' ? 'Required' : edge?.strength === 'strong' ? 'Strong' : 'Moderate';
                  const strengthStyle = edge?.strength === 'required' ? 'bg-red-500/20 text-red-300 border-red-500/40' : edge?.strength === 'strong' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40';

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-4 rounded-xl border transition-all duration-200 bg-surface/50 space-y-3.5 shadow-xl',
                        rec.isWatched ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-white/20'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Poster Thumbnail */}
                        <div
                          onClick={() => navigate(`/movie/${c.id}`)}
                          className="w-20 sm:w-24 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden border border-white/10 cursor-pointer group"
                        >
                          <SafeImage
                            src={c.poster_url}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Recommendation Content */}
                        <div className="flex-1 space-y-3 w-full">
                          {/* LEVEL 1: Title & First-Class Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                onClick={() => navigate(`/movie/${c.id}`)}
                                className="text-base font-bold text-white hover:text-primary transition-colors cursor-pointer"
                              >
                                {c.title}
                              </h3>
                              <span className="text-xs text-muted">({formatYear(c.release_date)})</span>

                              {/* Priority Badges */}
                              {getPriorityBadge(rec.category)}

                              {/* Franchise Badge */}
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
                                {getFranchiseBadgeLabel(c.franchise_id)}
                              </span>

                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {relationshipLabel}
                              </span>

                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {scopeLabel}
                              </span>

                              <span className={cn('px-2.5 py-0.5 rounded-md text-[10px] font-bold border', strengthStyle)}>
                                {strengthLabel}
                              </span>

                              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 font-black">
                                <Flame className="w-3 h-3" />
                                <span>{rec.relevanceScore}% Relevance</span>
                              </div>
                            </div>

                            {isTheatricallyUpcoming(c) ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled
                                className="text-xs py-1 px-2.5 opacity-60 cursor-not-allowed border border-white/10"
                                title="This title has not premiered yet and cannot be marked as watched."
                              >
                                Not Yet Released
                              </Button>
                            ) : (
                              <Button
                                variant={rec.isWatched ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleWatched(c.id)}
                                className={cn(
                                  'text-xs gap-1.5 py-1 px-2.5 cursor-pointer',
                                  rec.isWatched && 'bg-green-500/20 text-green-400 border border-green-500/30'
                                )}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {rec.isWatched ? 'Watched' : 'Mark Watched'}
                              </Button>
                            )}
                          </div>

                          {/* LEVEL 2: Concise Rationale (Max 2 lines) */}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                                Why You Need To Watch This:
                              </span>
                              <button
                                type="button"
                                onClick={() => setInspectedItem({ rec, edge })}
                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20 transition-colors"
                              >
                                <Info className="w-3 h-3" />
                                <span>ⓘ Why? Inspector</span>
                              </button>
                            </div>
                            <p className="text-xs text-white/90 leading-relaxed font-medium line-clamp-2">
                              {rec.shortReason || rec.reason}
                            </p>
                          </div>

                          {/* LEVEL 3: Collapsible Secondary CKG Graph Details */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => toggleDetailsFor(c.id, e)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isDetailsExpanded && 'rotate-90')} />
                              {isDetailsExpanded ? 'Hide Graph Details' : 'Show Graph Details'}
                            </button>

                            <span className="text-[11px] text-muted font-mono">
                              Impact Score: {rec.impactScore}/10
                            </span>
                          </div>

                          <AnimatePresence>
                            {isDetailsExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2.5 pt-2 border-t border-white/10 text-xs overflow-hidden"
                              >
                                {rec.storyImpact && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                                      Graph Edge Impact:
                                    </span>
                                    <p className="text-muted-light">{rec.storyImpact}</p>
                                  </div>
                                )}

                                {rec.whyItMatters && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                                      Context & Character Arc:
                                    </span>
                                    <p className="text-emerald-200/90">{rec.whyItMatters}</p>
                                  </div>
                                )}

                                {/* Characters & Lore Chips */}
                                {((rec.introduces && rec.introduces.length > 0) || (rec.continues && rec.continues.length > 0)) && (
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {rec.introduces && rec.introduces.length > 0 && (
                                      <div className="flex items-center gap-1.5 text-purple-300 flex-wrap text-[11px]">
                                        <Users className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                        <span className="font-semibold text-muted">Characters:</span>
                                        {rec.introduces.map((item: string) => (
                                          <span key={item} className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-200 font-semibold">
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {rec.continues && rec.continues.length > 0 && (
                                      <div className="flex items-center gap-1.5 text-cyan-300 flex-wrap text-[11px]">
                                        <Film className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                        <span className="font-semibold text-muted">Lore Arcs:</span>
                                        {rec.continues.map((item: string) => (
                                          <span key={item} className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 font-semibold">
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {rec.spoilerFreeExplanation && (
                                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[11px] text-muted space-y-0.5">
                                    <span className="text-[10px] font-bold text-green-400 uppercase">
                                      Spoiler-Free Guide:
                                    </span>
                                    <p>{rec.spoilerFreeExplanation}</p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXTRA CONTENT: CineOrder Recommendations (Partitioned Section) */}
      {isOfficialOverride && guideData.cineOrderExtraContent && guideData.cineOrderExtraContent.length > 0 && (
        <div className="mt-10 p-6 rounded-2xl bg-surface/70 border border-amber-500/20 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  EXTRA CONTENT
                </span>
                <h3 className="text-xl font-black text-white">CineOrder Recommendations</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-muted">
                  {deduplicateRecommendationList(guideData.cineOrderExtraContent || []).length}{' '}
                  {deduplicateRecommendationList(guideData.cineOrderExtraContent || []).length === 1 ? 'Title' : 'Titles'}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed max-w-3xl">
                Independent story-graph recommendations discovered by CineOrder's narrative intelligence engine. These titles provide valuable lore and character context, but are <strong className="text-amber-300">not part of the official studio watchlist</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {deduplicateRecommendationList(guideData.cineOrderExtraContent || []).map((rec) => {
              const watched = watchHistory[rec.content.id];
              return (
                <div
                  key={rec.content.id}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-card border border-white/10 hover:border-amber-500/30 transition-all duration-200"
                >
                  <div
                    onClick={() => navigate(`/movie/${rec.content.id}`)}
                    className="w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group border border-white/10"
                  >
                    <SafeImage
                      src={rec.content.poster_url}
                      alt={rec.content.title}
                      aspectRatio="poster"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => navigate(`/movie/${rec.content.id}`)}
                          className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-primary transition-colors"
                        >
                          {rec.content.title}
                        </h4>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 border',
                            rec.category === 'must_watch'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : rec.category === 'recommended'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          )}
                        >
                          {rec.category === 'must_watch'
                            ? 'Must Watch'
                            : rec.category === 'recommended'
                            ? 'Recommended'
                            : 'Extra Context'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted">{formatYear(rec.content.release_date)}</p>
                      <p className="text-[11px] text-muted-light line-clamp-2 leading-snug">
                        {rec.shortReason || rec.reason}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setInspectedItem({
                            rec,
                            edge: findEdgeMetadata(rec.content.id, graphResult.targetContent.id),
                          })
                        }
                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded border border-primary/20 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        <span>Why Inspector</span>
                      </button>

                      {isTheatricallyUpcoming(rec.content) ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled
                          className="h-6 text-[10px] px-2.5 py-0 opacity-60 cursor-not-allowed border border-white/10"
                          title="This title has not premiered yet and cannot be marked as watched."
                        >
                          Not Yet Released
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={watched ? 'secondary' : 'outline'}
                          className={cn(
                            'h-6 text-[10px] px-2.5 py-0 cursor-pointer',
                            watched && 'bg-green-500/20 text-green-400 border border-green-500/30'
                          )}
                          onClick={() => handleToggleWatched(rec.content.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {watched ? 'Watched' : 'Mark Watched'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECOMMENDATION INSPECTOR MODAL */}
      <AnimatePresence>
        {inspectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-surface border border-white/15 shadow-2xl p-6 space-y-4 relative text-white"
            >
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black">Recommendation Inspector</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-muted">
                  Policy v{inspectedItem.rec.decisionPath?.policyVersion || '5.2'}
                </span>
              </div>

              {/* Policy Decision Path Summary */}
              <div className="p-3 rounded-xl bg-surface/60 border border-white/10 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✓ Gate 1: PASS</span>
                  <span>•</span>
                  <span>✓ Gate 2: PASS</span>
                  <span>•</span>
                  <span>✓ Independence: PASS</span>
                </div>
                {getPriorityBadge(inspectedItem.rec.category)}
              </div>

              {/* Franchise Context Box */}
              <div className="p-3 rounded-xl bg-surface/60 border border-white/10 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted font-semibold">Source Franchise:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-violet-500/20 text-violet-300 border border-violet-500/40">
                      {getFranchiseBadgeLabel(inspectedItem.rec.content.franchise_id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted font-semibold">Target Franchise:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-primary/20 text-primary border border-primary/40">
                      {getFranchiseBadgeLabel(graphResult.targetContent.franchise_id)}
                    </span>
                  </div>
                </div>

                {inspectedItem.rec.content.franchise_id !== graphResult.targetContent.franchise_id && (
                  <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/40 text-violet-200 text-xs font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span>Cross-Franchise Recommendation — Narrative connection crosses universe boundaries.</span>
                  </div>
                )}
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Title & Reason Box */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="font-bold text-white text-sm">{inspectedItem.rec.content.title}</span>
                  <p className="text-muted-light leading-relaxed">{inspectedItem.rec.shortReason || inspectedItem.rec.reason}</p>
                  {inspectedItem.rec.detailedReasons && inspectedItem.rec.detailedReasons.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-primary/80 tracking-wider">Editorial Evidence Points</span>
                      <ul className="list-disc list-inside space-y-1 text-white/80">
                        {inspectedItem.rec.detailedReasons.map((point: string, idx: number) => (
                          <li key={idx} className="leading-snug">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Explainability Decision Path & Contribution Breakdown Box */}
                {inspectedItem.rec.decisionPath && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[10px] text-purple-400">Scoring Engine v{inspectedItem.rec.decisionPath.policyVersion}</span>
                      {inspectedItem.rec.decisionPath.narrativeScore !== undefined && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40">
                          Total Score: {inspectedItem.rec.decisionPath.narrativeScore.toFixed(1)}/100
                        </span>
                      )}
                    </div>

                    {/* Contribution Breakdown Grid */}
                    {inspectedItem.rec.decisionPath.contributionBreakdown && (
                      <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 space-y-1 text-[11px]">
                        <span className="font-bold uppercase text-[9px] text-purple-300">Point Contribution Breakdown</span>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-purple-200">
                          <div className="flex justify-between"><span>Edge Strength (40%):</span> <span className="font-bold text-amber-300">+{inspectedItem.rec.decisionPath.contributionBreakdown.edgeStrength.toFixed(1)}</span></div>
                          <div className="flex justify-between"><span>Relationship (20%):</span> <span className="font-bold text-amber-300">+{inspectedItem.rec.decisionPath.contributionBreakdown.relationship.toFixed(1)}</span></div>
                          <div className="flex justify-between"><span>Protagonist (15%):</span> <span className="font-bold text-amber-300">+{inspectedItem.rec.decisionPath.contributionBreakdown.protagonist.toFixed(1)}</span></div>
                          <div className="flex justify-between"><span>Importance (15%):</span> <span className="font-bold text-amber-300">+{inspectedItem.rec.decisionPath.contributionBreakdown.narrativeImportance.toFixed(1)}</span></div>
                          <div className="flex justify-between"><span>Depth Penalty (10%):</span> <span className="font-bold text-amber-300">+{inspectedItem.rec.decisionPath.contributionBreakdown.depth.toFixed(1)}</span></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-purple-200">
                      <div><span className="text-muted font-sans">Edge Strength:</span> {inspectedItem.rec.decisionPath.governingEdge.strength}</div>
                      <div><span className="text-muted font-sans">Relationship:</span> {inspectedItem.rec.decisionPath.governingEdge.relationship}</div>
                      <div><span className="text-muted font-sans">Traversal Depth:</span> Depth {inspectedItem.rec.decisionPath.governingEdge.depth}</div>
                      <div><span className="text-muted font-sans">Spoiler Risk:</span> {inspectedItem.rec.decisionPath.governingEdge.spoilerRisk || 'low'}</div>
                      <div><span className="text-muted font-sans">Protagonist Overlap:</span> {inspectedItem.rec.decisionPath.governingEdge.protagonistOverlap || 'primary-protagonist'}</div>
                      <div><span className="text-muted font-sans">Narrative Importance:</span> <span className="font-bold text-amber-300">{inspectedItem.rec.decisionPath.governingEdge.narrativeImportance || 'major-arc'}</span></div>
                      {inspectedItem.rec.decisionPath.editorialOverrideApplied && (
                        <div className="col-span-2 text-amber-300 font-sans font-bold">⭐ Editorial Override Rule Applied</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confidence Engine Evaluation Box */}
                {inspectedItem.rec.decisionPath?.confidenceMetrics && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[10px] text-blue-400">Confidence Engine Stage</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                        {inspectedItem.rec.decisionPath.confidenceMetrics.confidenceLevel} ({inspectedItem.rec.decisionPath.confidenceMetrics.confidenceScore}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-blue-200">
                      <div><span className="text-muted font-sans">Edge Quality:</span> {inspectedItem.rec.decisionPath.confidenceMetrics.edgeConfidence}</div>
                      <div><span className="text-muted font-sans">Path Consensus:</span> {inspectedItem.rec.decisionPath.confidenceMetrics.consensusCount} edge(s)</div>
                    </div>
                  </div>
                )}

                {/* Policy Decision Justification */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="font-bold uppercase text-[10px] text-emerald-400">Policy Engine Decision</span>
                  <p className="text-emerald-200">
                    {inspectedItem.rec.category === 'must_watch'
                      ? 'Mandatory Prerequisite: The target title relies on plot outcomes established in this film.'
                      : 'Recommended Context: The target movie sufficiently establishes essential story points on-screen for main plot comprehension, allowing this film to be classified as Recommended rather than Must Watch.'}
                  </p>
                </div>

                {/* Visual Badges & Audit Footer */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px] text-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Confidence:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 HIGH</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                    <span>Engine: v5.1</span>
                    <span>•</span>
                    <span>Audit: MCU-00412</span>
                    <span>•</span>
                    <span>2026</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => setInspectedItem(null)}>
                Close Inspector
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
