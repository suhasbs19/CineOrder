import React, { useState, useMemo } from 'react';
import {
  Film,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  History,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { globalTrailerIntelligenceStore } from '@/lib/trailerIntelligenceStore';
import { simulateTrailerRecommendationImpact } from '@/lib/trailerRecommendationImpactSimulator';
import { globalTrailerRecommendationImpactService } from '@/lib/trailerRecommendationImpactService';
import { TrailerImpactSimulatorModal } from './TrailerImpactSimulatorModal';
import { TrailerApprovalPreviewModal } from './TrailerApprovalPreviewModal';
import { allFranchises } from '@/data/franchises/index';
import type {
  TrailerProposalPackage,
  TrackedTrailerRecord,
  TrailerEvidenceEpistemicState,
  PrerequisiteImpact,
  TrailerRecommendationImpactReport,
  TrailerRecommendationImpactCategory,
  TrailerRecommendationImpactProposal,
  TrailerReviewAuditLogEntry,
} from '@/types/trailerIntelligence';
import type { ProposalStatus } from '@/types/ckgProposal';

interface TrailerIntelligenceReviewTabProps {
  onShowToast: (text: string, type?: 'success' | 'error') => void;
}

const ALL_IMPACT_CATEGORIES: TrailerRecommendationImpactCategory[] = [
  'NEW_PREREQUISITE',
  'NEW_RECOMMENDED_CONTEXT',
  'NEW_OPTIONAL_CONTEXT',
  'SEQUEL_RELATIONSHIP',
  'PREQUEL_RELATIONSHIP',
  'CROSSOVER_RELATIONSHIP',
  'CHARACTER_CONTEXT',
  'CONTINUITY_CONTEXT',
  'NO_RECOMMENDATION_IMPACT',
];

export const TrailerIntelligenceReviewTab: React.FC<TrailerIntelligenceReviewTabProps> = ({
  onShowToast,
}) => {
  const [proposals, setProposals] = useState<TrailerProposalPackage[]>(() =>
    globalTrailerIntelligenceStore.getAllProposals()
  );
  const [records, setRecords] = useState<TrackedTrailerRecord[]>(() =>
    globalTrailerIntelligenceStore.getTrackedRecords()
  );
  const [auditLogs, setAuditLogs] = useState<TrailerReviewAuditLogEntry[]>(() =>
    globalTrailerIntelligenceStore.getAuditLogs()
  );

  // Filters State
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('all');
  const [continuityFilter, setContinuityFilter] = useState<string>('all');
  const [impactCategoryFilter, setImpactCategoryFilter] = useState<TrailerRecommendationImpactCategory | 'all'>('all');
  const [mustWatchFilter, setMustWatchFilter] = useState<'all' | 'must-watch-only' | 'context-only'>('all');
  const [crossContinuityOnly, setCrossContinuityOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals and Drawers
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [selectedSimulatorProposal, setSelectedSimulatorProposal] = useState<TrailerProposalPackage | null>(null);
  const [simulationReport, setSimulationReport] = useState<TrailerRecommendationImpactReport | null>(null);
  const [selectedPreviewProposal, setSelectedPreviewProposal] = useState<{
    impactProposal: TrailerRecommendationImpactProposal;
    pkg: TrailerProposalPackage;
  } | null>(null);
  const [showAuditLogModal, setShowAuditLogModal] = useState<boolean>(false);

  const refreshData = () => {
    setProposals([...globalTrailerIntelligenceStore.getAllProposals()]);
    setRecords([...globalTrailerIntelligenceStore.getTrackedRecords()]);
    setAuditLogs([...globalTrailerIntelligenceStore.getAuditLogs()]);
  };

  const handleRescan = () => {
    globalTrailerIntelligenceStore.seedCuratedProposals();
    refreshData();
    onShowToast('Trailer Intelligence Store Refreshed!', 'success');
  };

  const handleArchiveProposal = (pkgId: string) => {
    const note = reviewNotes[pkgId] || 'Archived by Human Editorial Reviewer.';
    const success = globalTrailerIntelligenceStore.updateProposalStatus(pkgId, 'rejected', 'Editorial Admin', `[ARCHIVED] ${note}`);
    if (success) {
      refreshData();
      onShowToast('Trailer Proposal Package Archived.', 'success');
    }
  };

  const handleApproveProposal = (pkgId: string, reviewer = 'Editorial Admin', notes?: string) => {
    const note = notes || reviewNotes[pkgId] || 'Approved by Human Editorial Reviewer.';
    const success = globalTrailerIntelligenceStore.updateProposalStatus(pkgId, 'approved', reviewer, note);
    if (success) {
      refreshData();
      setSelectedPreviewProposal(null);
      onShowToast('Trailer Proposal Package Approved! Note: Production CKG remains unchanged until release tagging.', 'success');
    }
  };

  const handleRejectProposal = (pkgId: string, reviewer = 'Editorial Admin', notes?: string) => {
    const note = notes || reviewNotes[pkgId] || 'Rejected by Human Editorial Reviewer.';
    const success = globalTrailerIntelligenceStore.updateProposalStatus(pkgId, 'rejected', reviewer, note);
    if (success) {
      refreshData();
      setSelectedPreviewProposal(null);
      onShowToast('Trailer Proposal Package Rejected and recorded.', 'error');
    }
  };

  const handleOpenSimulator = (proposal: TrailerProposalPackage) => {
    const report = simulateTrailerRecommendationImpact(proposal);
    setSelectedSimulatorProposal(proposal);
    setSimulationReport(report);
  };

  const handleOpenPreview = (proposal: TrailerProposalPackage) => {
    const impactProposal = globalTrailerRecommendationImpactService.analyzeTrailerImpact(proposal);
    setSelectedPreviewProposal({
      impactProposal,
      pkg: proposal,
    });
  };

  const getEpistemicBadgeStyle = (state: TrailerEvidenceEpistemicState) => {
    switch (state) {
      case 'OBSERVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'INFERRED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'EDITORIAL':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'VERIFIED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-white/10 text-muted';
    }
  };

  const getImpactBadgeStyle = (impact: PrerequisiteImpact) => {
    switch (impact) {
      case 'MUST_WATCH_CANDIDATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'RECOMMENDED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'OPTIONAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getCategoryBadgeStyle = (cat: TrailerRecommendationImpactCategory) => {
    switch (cat) {
      case 'NEW_PREREQUISITE':
      case 'SEQUEL_RELATIONSHIP':
      case 'PREQUEL_RELATIONSHIP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
      case 'CROSSOVER_RELATIONSHIP':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold';
      case 'NEW_RECOMMENDED_CONTEXT':
      case 'CHARACTER_CONTEXT':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'NEW_OPTIONAL_CONTEXT':
      case 'CONTINUITY_CONTEXT':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const allContinuities = useMemo(() => {
    const set = new Set<string>();
    for (const p of proposals) {
      if (p.continuityId) set.add(p.continuityId);
    }
    return Array.from(set);
  }, [proposals]);

  const proposalImpactMap = useMemo(() => {
    const map = new Map<string, TrailerRecommendationImpactProposal>();
    for (const p of proposals) {
      map.set(p.id, globalTrailerRecommendationImpactService.analyzeTrailerImpact(p));
    }
    return map;
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const imp = proposalImpactMap.get(p.id);
      if (statusFilter !== 'all' && p.reviewStatus !== statusFilter) return false;
      if (franchiseFilter !== 'all' && p.franchiseId !== franchiseFilter) return false;
      if (continuityFilter !== 'all' && p.continuityId !== continuityFilter) return false;
      if (impactCategoryFilter !== 'all' && imp?.impactCategory !== impactCategoryFilter) return false;

      if (mustWatchFilter === 'must-watch-only') {
        const isMust = imp?.impactCategory === 'NEW_PREREQUISITE' || p.evidenceItems.some((e) => e.prerequisiteImpact === 'MUST_WATCH_CANDIDATE');
        if (!isMust) return false;
      }
      if (mustWatchFilter === 'context-only') {
        const isMust = imp?.impactCategory === 'NEW_PREREQUISITE' || p.evidenceItems.some((e) => e.prerequisiteImpact === 'MUST_WATCH_CANDIDATE');
        if (isMust) return false;
      }

      if (crossContinuityOnly) {
        const isCross = p.evidenceItems.some((e) => e.suggestedEdge?.isCrossover || (e.continuityId && e.continuityId !== p.continuityId));
        if (!isCross) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.contentId.toLowerCase().includes(q);
        const matchesVideo = p.videoTitle.toLowerCase().includes(q);
        const matchesEvidence = p.evidenceItems.some((e) =>
          e.subject.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
        );
        return matchesTitle || matchesVideo || matchesEvidence;
      }
      return true;
    });
  }, [
    proposals,
    proposalImpactMap,
    statusFilter,
    franchiseFilter,
    continuityFilter,
    impactCategoryFilter,
    mustWatchFilter,
    crossContinuityOnly,
    searchQuery,
  ]);

  const stats = useMemo(() => {
    const total = proposals.length;
    const pending = proposals.filter((p) => p.reviewStatus === 'pending').length;
    const approved = proposals.filter((p) => p.reviewStatus === 'approved').length;
    const rejected = proposals.filter((p) => p.reviewStatus === 'rejected').length;
    const totalEvidence = proposals.reduce((acc, p) => acc + p.evidenceItems.length, 0);
    const crossContinuity = proposals.filter((p) =>
      p.evidenceItems.some((e) => e.suggestedEdge?.isCrossover || (e.continuityId && e.continuityId !== p.continuityId))
    ).length;
    return { total, pending, approved, rejected, totalEvidence, crossContinuity };
  }, [proposals]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Telemetry Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-card to-purple-950/30 border border-rose-500/20 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <Film className="w-3.5 h-3.5 mr-1" /> Trailer Intelligence & Recommendation Evidence
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <ShieldCheck className="w-3 h-3 mr-1" /> Human Editorial Verification Gate
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 mr-1" /> Multi-Continuity Firewall Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Official Trailer Evidence Review Center
            </h2>
            <p className="text-xs text-muted max-w-3xl">
              Strict Invariant: <span className="text-amber-300 font-semibold">Trailers Propose. Humans Verify. Recommendation Engine Stays Pure.</span> Visual callbacks and cameos never inflate to Must Watch prerequisites.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAuditLogModal(true)}
              className="gap-1.5 font-mono text-xs text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
            >
              <History className="w-3.5 h-3.5" /> Decision Audit Log ({auditLogs.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRescan}
              className="gap-1.5 font-mono text-xs text-white border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Proposals
            </Button>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 font-mono text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted">Total Proposals</div>
            <div className="text-lg font-black text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 font-mono text-center">
            <div className="text-[10px] uppercase tracking-wider text-amber-300">Pending Review</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{stats.pending}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-center">
            <div className="text-[10px] uppercase tracking-wider text-emerald-300">Approved</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{stats.approved}</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 font-mono text-center">
            <div className="text-[10px] uppercase tracking-wider text-rose-300">Rejected</div>
            <div className="text-lg font-black text-rose-400 mt-0.5">{stats.rejected}</div>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 font-mono text-center">
            <div className="text-[10px] uppercase tracking-wider text-cyan-300">Evidence Items</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">{stats.totalEvidence}</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 font-mono text-center">
            <div className="text-[10px] uppercase tracking-wider text-purple-300">Cross-Continuity</div>
            <div className="text-lg font-black text-purple-400 mt-0.5">{stats.crossContinuity}</div>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by title, trailer video name, character, or evidence subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-muted focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Franchise Filter */}
            <select
              value={franchiseFilter}
              onChange={(e) => setFranchiseFilter(e.target.value)}
              aria-label="Filter proposals by franchise"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all" className="bg-slate-900 text-white">All Franchises</option>
              {allFranchises.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name}
                </option>
              ))}
            </select>

            {/* Continuity Filter */}
            <select
              value={continuityFilter}
              onChange={(e) => setContinuityFilter(e.target.value)}
              aria-label="Filter proposals by continuity"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all" className="bg-slate-900 text-white">All Continuities</option>
              {allContinuities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              aria-label="Filter proposals by review status"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all" className="bg-slate-900 text-white">All Statuses</option>
              <option value="pending" className="bg-slate-900 text-amber-300">Pending Review</option>
              <option value="approved" className="bg-slate-900 text-emerald-300">Approved</option>
              <option value="rejected" className="bg-slate-900 text-rose-300">Rejected / Archived</option>
            </select>

            {/* Impact Category Filter */}
            <select
              value={impactCategoryFilter}
              onChange={(e) => setImpactCategoryFilter(e.target.value as TrailerRecommendationImpactCategory | 'all')}
              aria-label="Filter proposals by impact category"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all" className="bg-slate-900 text-white">All Impact Classes (9)</option>
              {ALL_IMPACT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Toggles */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap text-xs font-mono">
          <button
            onClick={() => setMustWatchFilter(mustWatchFilter === 'must-watch-only' ? 'all' : 'must-watch-only')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              mustWatchFilter === 'must-watch-only'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-white/5 text-muted border-white/5 hover:text-white'
            }`}
          >
            ⚡ Must Watch Candidates
          </button>
          <button
            onClick={() => setMustWatchFilter(mustWatchFilter === 'context-only' ? 'all' : 'context-only')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              mustWatchFilter === 'context-only'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'bg-white/5 text-muted border-white/5 hover:text-white'
            }`}
          >
            🛡️ Context / Non-Must Watch Only
          </button>
          <button
            onClick={() => setCrossContinuityOnly(!crossContinuityOnly)}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              crossContinuityOnly
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                : 'bg-white/5 text-muted border-white/5 hover:text-white'
            }`}
          >
            🌐 Cross-Continuity Warnings
          </button>

          {(franchiseFilter !== 'all' ||
            continuityFilter !== 'all' ||
            statusFilter !== 'all' ||
            impactCategoryFilter !== 'all' ||
            mustWatchFilter !== 'all' ||
            crossContinuityOnly ||
            searchQuery) && (
            <button
              onClick={() => {
                setFranchiseFilter('all');
                setContinuityFilter('all');
                setStatusFilter('all');
                setImpactCategoryFilter('all');
                setMustWatchFilter('all');
                setCrossContinuityOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-white/10 space-y-3">
          <Film className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No Trailer Proposals Match Criteria</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Try adjusting your search filters or click "Refresh Proposals" to re-evaluate verified trailer feeds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((pkg) => {
            const matchingRecord = records.find((r) => r.contentId === pkg.contentId);
            const isHistoryOpen = expandedHistory[pkg.id] || false;
            const isCrossContinuity = pkg.evidenceItems.some(
              (e) => e.suggestedEdge?.isCrossover || (e.continuityId && e.continuityId !== pkg.continuityId)
            );
            const impactProposal = proposalImpactMap.get(pkg.id);
            const primaryImpactCat = impactProposal?.impactCategory || 'NEW_RECOMMENDED_CONTEXT';

            return (
              <div
                key={pkg.id}
                className="p-6 rounded-3xl bg-card border border-white/10 hover:border-white/20 transition-all space-y-5 shadow-xl"
              >
                {/* Header Information Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {pkg.franchiseId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {pkg.continuityId || 'canonical'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold ${getCategoryBadgeStyle(primaryImpactCat)}`}>
                        {primaryImpactCat}
                      </span>
                      {pkg.tmdbId > 0 && (
                        <span className="text-[10px] font-mono text-muted">TMDb #{pkg.tmdbId}</span>
                      )}
                      {isCrossContinuity && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/30 text-purple-300 border border-purple-500/50 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-purple-400" /> CROSS-CONTINUITY EVIDENCE
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{pkg.contentId}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                        pkg.reviewStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : pkg.reviewStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {pkg.reviewStatus}
                    </span>
                  </div>
                </div>

                {/* Narrative Reasoning Explanation Banner */}
                {impactProposal && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                        Impact Reasoning:
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{impactProposal.explanation}</p>
                    </div>
                  </div>
                )}

                {/* YouTube Preview Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    <div className="relative w-36 h-20 sm:w-44 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${pkg.videoKey}/hqdefault.jpg`}
                        alt={pkg.videoTitle}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-white uppercase border border-white/20">
                        {pkg.videoClassification}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1">
                        <Film className="w-3.5 h-3.5" /> {pkg.videoSite} Verified Source
                      </div>
                      <div className="text-sm font-bold text-white line-clamp-2">{pkg.videoTitle}</div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-muted flex-wrap">
                        <span>Key: <span className="text-amber-300">{pkg.videoKey}</span></span>
                        {pkg.publishedTimestamp && (
                          <span>Published: {pkg.publishedTimestamp.split('T')[0]}</span>
                        )}
                        <span>Confidence: <span className="text-emerald-400 font-bold">{(pkg.overallConfidence * 100).toFixed(0)}%</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <a
                      href={`https://www.youtube.com/watch?v=${pkg.videoKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors border border-white/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                    </a>
                  </div>
                </div>

                {/* Historical Versions Accordion */}
                {matchingRecord && matchingRecord.historicalVersions && matchingRecord.historicalVersions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                    <button
                      onClick={() =>
                        setExpandedHistory((prev) => ({ ...prev, [pkg.id]: !prev[pkg.id] }))
                      }
                      className="w-full flex items-center justify-between text-xs font-mono font-bold text-muted hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Trailer Version History ({matchingRecord.historicalVersions.length} superseded trailers)</span>
                      </div>
                      {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isHistoryOpen && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        {matchingRecord.historicalVersions.map((hist, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] flex items-center justify-between"
                          >
                            <span className="text-white">{hist.videoTitle} ({hist.classification})</span>
                            <span className="text-muted text-[10px]">Superseded at {hist.supersededAt.split('T')[0]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Items Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted font-bold uppercase tracking-wider">
                      Narrative Evidence Items ({pkg.evidenceItems.length})
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {pkg.continuitySafetyPassed ? '✓ Continuity Firewall Passed' : '⚠️ Multi-Continuity Warning'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pkg.evidenceItems.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                            {ev.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${getEpistemicBadgeStyle(ev.verificationState)}`}>
                              {ev.verificationState}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${getImpactBadgeStyle(ev.prerequisiteImpact)}`}>
                              {ev.prerequisiteImpact}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-white text-sm">{ev.subject}</div>
                          <p className="text-muted text-[11px] mt-0.5 leading-relaxed">{ev.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-white/5">
                          <span>Timestamp: <span className="text-white">{ev.timestampFormatted || '00:00'}</span></span>
                          <span>Confidence: <span className="text-cyan-400 font-bold">{(ev.confidence * 100).toFixed(0)}%</span></span>
                        </div>

                        {/* Cross Continuity Banner */}
                        {ev.continuityId && ev.continuityId !== pkg.continuityId && (
                          <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 font-mono text-[10px] text-purple-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            <span>
                              CROSS-CONTINUITY: {ev.continuityId} → {pkg.continuityId} ({ev.suggestedEdge?.relationship || 'multiverse'})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Notes & Actions */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Add optional reviewer rationale / notes before approving or rejecting..."
                      value={reviewNotes[pkg.id] || ''}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [pkg.id]: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-muted focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenPreview(pkg)}
                        className="gap-1.5 font-mono text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" /> Approval Preview & Diff
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenSimulator(pkg)}
                        className="gap-1.5 font-mono text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Impact Simulator
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchiveProposal(pkg.id)}
                        disabled={pkg.reviewStatus === 'rejected'}
                        className="gap-1.5 font-mono text-xs text-slate-300 border-white/20 hover:bg-white/10"
                      >
                        <History className="w-3.5 h-3.5" /> Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectProposal(pkg.id)}
                        disabled={pkg.reviewStatus === 'rejected'}
                        className="gap-1.5 font-mono text-xs text-rose-300 border-rose-500/40 hover:bg-rose-500/20"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApproveProposal(pkg.id)}
                        disabled={pkg.reviewStatus === 'approved'}
                        className="gap-1.5 font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Modal */}
      {selectedSimulatorProposal && simulationReport && (
        <TrailerImpactSimulatorModal
          proposal={selectedSimulatorProposal}
          report={simulationReport}
          onClose={() => {
            setSelectedSimulatorProposal(null);
            setSimulationReport(null);
          }}
        />
      )}

      {/* Approval Preview Modal */}
      {selectedPreviewProposal && (
        <TrailerApprovalPreviewModal
          proposal={selectedPreviewProposal.impactProposal}
          packageItem={selectedPreviewProposal.pkg}
          onApprove={(id, reviewer, notes) => handleApproveProposal(id, reviewer, notes)}
          onReject={(id, reviewer, notes) => handleRejectProposal(id, reviewer, notes)}
          onClose={() => setSelectedPreviewProposal(null)}
        />
      )}

      {/* Decision Audit Log Modal */}
      {showAuditLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8 p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-card to-slate-950 border border-purple-500/30 shadow-2xl space-y-5 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <History className="w-5 h-5 text-purple-400" /> Human Decision Audit Log
                </h3>
                <p className="text-xs text-muted font-mono">
                  Immutable record of all human editorial decisions, timestamps, and rationales.
                </p>
              </div>
              <button
                onClick={() => setShowAuditLogModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-white"
                title="Close Audit Log"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-muted text-xs font-mono">
                No human review actions recorded yet in this session.
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.action === 'APPROVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : log.action === 'ARCHIVE'
                              ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-white font-bold">{log.contentId}</span>
                      </div>
                      <span className="text-muted text-[11px]">{log.timestamp}</span>
                    </div>

                    <div className="text-slate-300 text-[11px]">
                      <span className="text-muted">Reviewer:</span> <span className="text-cyan-300 font-bold">{log.reviewer}</span> |{' '}
                      <span className="text-muted">Transition:</span> {log.previousStatus} → <span className="text-white font-bold">{log.newStatus}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 text-[11px] text-slate-300">
                      <span className="text-muted">Rationale:</span> {log.rationale}
                    </div>

                    {log.affectedTitles.length > 0 && (
                      <div className="text-[10px] text-muted">
                        Affected Titles: {log.affectedTitles.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuditLogModal(false)}
                className="font-mono text-xs"
              >
                Close Audit Log
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
