import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommit,
  ArrowDown,
  CheckCircle,
  Zap,
  Users,
  Film,
  Layers,
  HelpCircle,
  X,
} from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { cn, formatYear } from '@/lib/utils';
import {
  cineOrderKnowledgeGraph,
  type StoryEdge,
  type CKGEdgeStrength,
} from '@/data/cineOrderKnowledgeGraph';
import type { KnowledgeGraphTraversalResult } from '@/lib/storyKnowledgeGraphEngine';
import type { CategoryType } from '@/types/preparation';
import { getFranchiseBadgeLabel } from '@/components/ui/PreparationGuide';

interface StoryGraphNodeHierarchyProps {
  graphResult: KnowledgeGraphTraversalResult;
  onToggleWatched: (id: string) => void;
  onNavigate: (path: string) => void;
}

interface EdgeTooltipData {
  sourceTitle: string;
  targetTitle: string;
  relationshipLabel: string;
  strengthLabel: string;
  strengthStyle: string;
  reason: string;
}

function findCkgEdge(sourceId: string, targetId: string): StoryEdge | undefined {
  const s = sourceId.toLowerCase();
  const t = targetId.toLowerCase();
  return cineOrderKnowledgeGraph.edges.find(
    (e) => e.sourceId.toLowerCase() === s && e.targetId.toLowerCase() === t
  );
}

function formatRelationshipType(rel?: string): string {
  if (!rel) return 'Story Connection';
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
    'shared-object': 'Technology / Object Origin',
    organization: 'Organization Setup',
    timeline: 'Timeline Impact',
    multiverse: 'Multiverse Connection',
    'world-building': 'World Building',
    'post-credit': 'Post-Credit Scene',
    'major-crossover': 'Major Crossover',
    'thematic-callback': 'Thematic Callback',
    'same-universe-only': 'Optional Context',
  };
  return map[rel] || rel.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatEdgeStrength(strength?: CKGEdgeStrength): { label: string; style: string } {
  switch (strength) {
    case 'required':
      return { label: 'Required', style: 'bg-red-500/20 text-red-300 border-red-500/40' };
    case 'strong':
      return { label: 'Strong', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case 'moderate':
      return { label: 'Moderate', style: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    case 'weak':
    default:
      return { label: 'Weak', style: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40' };
  }
}

export function StoryGraphNodeHierarchy({
  graphResult,
  onToggleWatched,
  onNavigate,
}: StoryGraphNodeHierarchyProps) {
  const [activeEdgeTooltip, setActiveEdgeTooltip] = useState<EdgeTooltipData | null>(null);

  const targetTitle = graphResult.targetContent.title;
  const targetId = graphResult.targetContent.id;

  const allRecs = [
    ...graphResult.mustWatch,
    ...graphResult.recommended,
    ...graphResult.optional,
    ...(graphResult.postCreditContext || []),
  ];

  // Group recs into distinct narrative journey chapters (Editorial Experience Framework v2.0)
  const branches = [
    {
      id: 'direct-story',
      title: 'Chapter 1 — Direct Story Continuation & Sequels',
      icon: <GitCommit className="w-4 h-4 text-cyan-400" />,
      items: allRecs.filter(
        (r) => r.dependencyType === 'Story'
      ),
    },
    {
      id: 'character-journeys',
      title: 'Chapter 2 — Character Arcs & Protagonist Journeys',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      items: allRecs.filter(
        (r) => r.dependencyType === 'Character'
      ),
    },
    {
      id: 'team-assemblies',
      title: 'Chapter 3 — Team Assemblies & Hero Dynamics',
      icon: <Film className="w-4 h-4 text-amber-400" />,
      items: allRecs.filter(
        (r) => r.dependencyType === 'Team' || r.dependencyType === 'Villain'
      ),
    },
    {
      id: 'world-events',
      title: 'Chapter 4 — World Events & Multiverse Mechanics',
      icon: <Layers className="w-4 h-4 text-rose-400" />,
      items: allRecs.filter(
        (r) => r.dependencyType === 'Multiverse' || r.dependencyType === 'World Building'
      ),
    },
    {
      id: 'legacy-lore',
      title: 'Chapter 5 — Legacy Stories & Shared Lore',
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      items: allRecs.filter(
        (r) => r.dependencyType === 'Timeline' || r.dependencyType === 'Post-credit'
      ),
    },
  ].filter((b) => b.items.length > 0);

  // Fallback chapter for unassigned narrative items
  const categorizedIds = new Set(branches.flatMap((b) => b.items.map((i) => i.content.id)));
  const unassigned = allRecs.filter((r) => !categorizedIds.has(r.content.id));
  if (unassigned.length > 0) {
    branches.push({
      id: 'general',
      title: 'Chapter 6 — General Narrative Enrichment',
      icon: <GitCommit className="w-4 h-4 text-emerald-400" />,
      items: unassigned,
    });
  }

  // Sort items within each chapter chronologically ascending by release date (earliest release first)
  branches.forEach((b) => {
    b.items.sort((x, y) => {
      const dateX = x.content.release_date || '';
      const dateY = y.content.release_date || '';
      if (dateX !== dateY) {
        return dateX.localeCompare(dateY);
      }
      return 0;
    });
  });

  const getPriorityBadge = (category: CategoryType) => {
    switch (category) {
      case 'must_watch':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
            Must Watch
          </span>
        );
      case 'recommended':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Recommended
          </span>
        );
      case 'optional':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Extra Context
          </span>
        );
      case 'post_credit':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Post-Credit Context
          </span>
        );
      default:
        return null;
    }
  };

  const showEdgeTooltip = (srcId: string, srcTitle: string, tgtTitle: string, fallbackReason: string) => {
    const edge = findCkgEdge(srcId, targetId);
    const relLabel = formatRelationshipType(edge?.relationship);
    const strengthInfo = formatEdgeStrength(edge?.strength);
    const reasonText = edge?.reason || fallbackReason;

    setActiveEdgeTooltip({
      sourceTitle: srcTitle,
      targetTitle: tgtTitle,
      relationshipLabel: relLabel,
      strengthLabel: strengthInfo.label,
      strengthStyle: strengthInfo.style,
      reason: reasonText,
    });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Story Graph Node Hierarchy
              </h3>
              <p className="text-xs text-muted">
                Directed narrative dependency paths & labeled edge rationale
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
              🔴 Required Edge
            </span>
            <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              🟠 Strong Edge
            </span>
            <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              🔵 Moderate Edge
            </span>
          </div>
        </div>

        {/* Narrative Branches */}
        <div className="space-y-8 pt-2">
          {branches.map((branch) => (
            <div key={branch.id} className="space-y-4 p-4 rounded-xl bg-surface/30 border border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                {branch.icon}
                <span>{branch.title}</span>
                <span className="text-muted text-[11px] font-mono">({branch.items.length} nodes)</span>
              </div>

              <div className="space-y-4">
                {branch.items.map((node) => {
                  const c = node.content;
                  const edge = findCkgEdge(c.id, targetId);
                  const relLabel = formatRelationshipType(edge?.relationship);
                  const strengthInfo = formatEdgeStrength(edge?.strength);

                  return (
                    <div key={c.id} className="space-y-3">
                      {/* Node Card */}
                      <div className="p-4 rounded-xl bg-surface/60 border border-white/10 hover:border-white/20 transition-all space-y-3">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Thumbnail */}
                          <div
                            onClick={() => onNavigate(`/movie/${c.id}`)}
                            className="w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer group"
                          >
                            <SafeImage
                              src={c.poster_url}
                              alt={c.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4
                                  onClick={() => onNavigate(`/movie/${c.id}`)}
                                  className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer"
                                >
                                  {c.title}
                                </h4>
                                <span className="text-xs text-muted">({formatYear(c.release_date)})</span>
                                {getPriorityBadge(node.category)}
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
                                  {getFranchiseBadgeLabel(c.franchise_id)}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {node.dependencyType}
                                </span>
                              </div>

                              <Button
                                variant={node.isWatched ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => onToggleWatched(c.id)}
                                className={cn(
                                  'text-xs py-1 px-2.5 gap-1',
                                  node.isWatched && 'bg-green-500/20 text-green-400 border border-green-500/30'
                                )}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {node.isWatched ? 'Watched' : 'Mark Watched'}
                              </Button>
                            </div>

                            <p className="text-xs text-muted-light leading-relaxed">
                              <span className="text-white font-semibold">Narrative Role:</span> {node.shortReason || node.reason}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Labeled Graph Edge Connection to Target */}
                      <div className="flex items-center justify-center py-1">
                        <div
                          onClick={() => showEdgeTooltip(c.id, c.title, targetTitle, node.shortReason || node.reason)}
                          className="group relative cursor-pointer px-3 py-1.5 rounded-full bg-black/60 border border-white/20 hover:border-primary/60 transition-all flex items-center gap-2 shadow-lg"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-primary group-hover:translate-y-0.5 transition-transform" />
                          <span className="text-[11px] font-bold text-cyan-300">
                            {relLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            {edge?.narrativeScope === 'post-credit' ? 'Post-Credit' : 'Main Feature'}
                          </span>
                          <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black border', strengthInfo.style)}>
                            {strengthInfo.label}
                          </span>
                          <HelpCircle className="w-3 h-3 text-muted group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Target Root Node Destination */}
        <div className="pt-4 text-center space-y-2 border-t border-white/10">
          <span className="text-[11px] font-mono text-muted uppercase tracking-widest">
            🎯 Target Narrative Destination
          </span>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/20 text-white font-black text-base border border-primary/50 shadow-2xl shadow-primary/30">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            {targetTitle}
          </div>
        </div>
      </div>

      {/* Edge Rationale Interactive Tooltip Overlay */}
      <AnimatePresence>
        {activeEdgeTooltip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveEdgeTooltip(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-5 rounded-2xl bg-surface/90 border border-white/20 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <GitCommit className="w-4 h-4" />
                  <span>Graph Edge Connection Rationale</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveEdgeTooltip(null)}
                  className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="truncate">{activeEdgeTooltip.sourceTitle}</span>
                  <span className="text-muted">➔</span>
                  <span className="truncate text-primary">{activeEdgeTooltip.targetTitle}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    {activeEdgeTooltip.relationshipLabel}
                  </span>
                  <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', activeEdgeTooltip.strengthStyle)}>
                    Strength: {activeEdgeTooltip.strengthLabel}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Canonical Graph Rationale:</span>
                <p className="text-white/90 leading-relaxed font-medium">
                  {activeEdgeTooltip.reason}
                </p>
              </div>

              <div className="text-right pt-2">
                <Button size="sm" variant="secondary" onClick={() => setActiveEdgeTooltip(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
