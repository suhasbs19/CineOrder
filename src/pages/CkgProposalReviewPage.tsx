import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  ExternalLink, Eye, ArrowRight, GitPullRequest, Layers, Edit3,
  Sparkles, Globe, PlusCircle, Check, Copy, Film, Tv, Calendar, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ckgProposalStore } from '@/lib/ckgProposalStore';
import { cineOrderKnowledgeGraph } from '@/data/cineOrderKnowledgeGraph';
import { normalizeCkgId } from '@/lib/storyKnowledgeGraphEngine';
import {
  createAnnouncementProposal,
} from '@/lib/announcementDiscoveryEngine';
import {
  globalAnnouncementMonitor,
  CURATED_MONITOR_EVENTS,
} from '@/lib/globalAnnouncementMonitor';
import { mergeAnnouncementProposal, generateFranchiseContentSnippet } from '@/lib/announcementMerger';
import { allFranchises } from '@/data/franchises/index';
import { catalogCompletenessStore } from '@/lib/catalogCompletenessStore';
import { TrailerIntelligenceReviewTab } from '@/components/TrailerIntelligenceReviewTab';
import type {
  CKGProposalPackage,
  ProposedStoryEdge,
  ProposalStatus,
  ProposalSourceType,
} from '@/types/ckgProposal';
import type {
  AnnouncementProposalPackage,
  DiscoveredAnnouncement,
  ProposalCategory,
} from '@/types/announcementDiscovery';
import type {
  CandidateMissingTitleProposal,
  GlobalCompletenessAuditReport,
  CompletenessGapType,
  ProposalReviewStatus,
} from '@/types/catalogCompletenessAudit';

export default function CkgProposalReviewPage() {
  const [activeTab, setActiveTab] = useState<'ckg-edges' | 'announcements' | 'completeness' | 'trailer-intelligence'>('trailer-intelligence');
  const [proposals, setProposals] = useState<CKGProposalPackage[]>(() => ckgProposalStore.getProposals());
  const [versionState, setVersionState] = useState(() => ckgProposalStore.getVersioningState());
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('pending');
  const [sourceFilter, setSourceFilter] = useState<ProposalSourceType | 'all'>('all');
  const [diffEdge, setDiffEdge] = useState<ProposedStoryEdge | null>(null);
  const [editEdge, setEditEdge] = useState<ProposedStoryEdge | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Global Catalog Completeness State
  const [completenessReport, setCompletenessReport] = useState<GlobalCompletenessAuditReport>(() =>
    catalogCompletenessStore.getReport()
  );
  const [completenessStatusFilter, setCompletenessStatusFilter] = useState<ProposalReviewStatus | 'all'>('all');
  const [completenessGapFilter, setCompletenessGapFilter] = useState<CompletenessGapType | 'all'>('all');
  const [completenessFranchiseFilter, setCompletenessFranchiseFilter] = useState<string>('all');
  const [completenessSearchQuery, setCompletenessSearchQuery] = useState<string>('');
  const [completenessPrModalProposal, setCompletenessPrModalProposal] = useState<CandidateMissingTitleProposal | null>(null);
  const [isRescanningCompleteness, setIsRescanningCompleteness] = useState<boolean>(false);

  // Announcement Discovery & Continuous Monitoring State
  const [announcementProposals, setAnnouncementProposals] = useState<AnnouncementProposalPackage[]>(() => {
    const scan = globalAnnouncementMonitor.processEvents(CURATED_MONITOR_EVENTS, { forceScan: true });
    return scan.proposalsGenerated;
  });
  const [announcementFranchiseFilter, setAnnouncementFranchiseFilter] = useState<string>('all');
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState<ProposalCategory | 'all'>('all');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [monitorStats, setMonitorStats] = useState(() => globalAnnouncementMonitor.getState());

  // Manual Ingestion Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualFranchise, setManualFranchise] = useState('marvel-cinematic-universe');
  const [manualMediaType, setManualMediaType] = useState<'movie' | 'series'>('movie');
  const [manualReleaseDate, setManualReleaseDate] = useState('');
  const [manualSynopsis, setManualSynopsis] = useState('');
  const [manualSourceUrl, setManualSourceUrl] = useState('');
  const [manualSourcePublisher, setManualSourcePublisher] = useState('Marvel Studios Official');
  const [manualDirector, setManualDirector] = useState('');

  const refreshState = () => {
    setProposals([...ckgProposalStore.getProposals()]);
    setVersionState({ ...ckgProposalStore.getVersioningState() });
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const stats = useMemo(() => {
    return ckgProposalStore.getReviewStats();
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && p.metadata.sourceType !== sourceFilter) return false;
      return true;
    });
  }, [proposals, statusFilter, sourceFilter]);

  const filteredAnnouncements = useMemo(() => {
    return announcementProposals.filter((p) => {
      if (announcementFranchiseFilter !== 'all' && p.franchiseId !== announcementFranchiseFilter) return false;
      if (announcementCategoryFilter !== 'all' && p.category !== announcementCategoryFilter) return false;
      return true;
    });
  }, [announcementProposals, announcementFranchiseFilter, announcementCategoryFilter]);

  const filteredCompletenessProposals = useMemo(() => {
    return catalogCompletenessStore.filterProposals({
      status: completenessStatusFilter,
      gapType: completenessGapFilter,
      franchiseId: completenessFranchiseFilter,
      searchQuery: completenessSearchQuery,
    });
  }, [
    completenessReport,
    completenessStatusFilter,
    completenessGapFilter,
    completenessFranchiseFilter,
    completenessSearchQuery,
  ]);

  const handleCompletenessApprove = (proposalId: string) => {
    const success = catalogCompletenessStore.updateProposalStatus(proposalId, 'approved');
    if (success) {
      setCompletenessReport(catalogCompletenessStore.getReport());
      showToast('Missing title proposal approved for catalog integration!', 'success');
    }
  };

  const handleCompletenessReject = (proposalId: string) => {
    const success = catalogCompletenessStore.updateProposalStatus(proposalId, 'rejected');
    if (success) {
      setCompletenessReport(catalogCompletenessStore.getReport());
      showToast('Proposal rejected and archived in audit log.', 'error');
    }
  };

  const handleRescanCompleteness = () => {
    setIsRescanningCompleteness(true);
    setTimeout(() => {
      const freshReport = catalogCompletenessStore.getReport(true);
      setCompletenessReport(freshReport);
      setIsRescanningCompleteness(false);
      showToast(`Global completeness audit completed: ${freshReport.totalGapsDetected} gap(s) analyzed across ${freshReport.totalFranchisesAudited} franchises.`, 'success');
    }, 400);
  };

  const handleApprove = (pkgId: string) => {
    const success = ckgProposalStore.updateProposalStatus(pkgId, 'approved');
    if (success) {
      refreshState();
      showToast('Proposal Package Approved! Ready for CKG production merge.', 'success');
    }
  };

  const handleReject = (pkgId: string) => {
    const success = ckgProposalStore.updateProposalStatus(pkgId, 'rejected');
    if (success) {
      refreshState();
      showToast('Proposal Package Rejected and archived.', 'error');
    }
  };

  const handleMerge = (pkgId: string) => {
    const res = ckgProposalStore.mergeProposalPackage(pkgId);
    if (res.success) {
      refreshState();
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleEditSave = (pkgId: string, edgeId: string, updatedReason: string, updatedStrength: any) => {
    const success = ckgProposalStore.editProposalEdge(pkgId, edgeId, {
      reason: updatedReason,
      strength: updatedStrength,
    });
    if (success) {
      refreshState();
      setEditEdge(null);
      showToast('Edge fields updated and re-evaluated.', 'success');
    }
  };

  // Continuous Announcement Monitoring Handlers
  const handleRunDiscoveryScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scan = globalAnnouncementMonitor.processEvents(CURATED_MONITOR_EVENTS, { forceScan: true });
      setAnnouncementProposals(scan.proposalsGenerated);
      setMonitorStats(globalAnnouncementMonitor.getState());
      setIsScanning(false);
      showToast(`Continuous Monitor Scan Complete: ${scan.totalAnnouncementsDiscovered} authoritative events processed across 18 franchises.`, 'success');
    }, 400);
  };

  const handleCreateManualAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      showToast('Please enter an announcement title.', 'error');
      return;
    }

    const newAnnouncement: DiscoveredAnnouncement = {
      rawTitle: manualTitle.trim(),
      franchiseId: manualFranchise,
      mediaType: manualMediaType,
      expectedReleaseDate: manualReleaseDate.trim() || undefined,
      synopsis: manualSynopsis.trim() || undefined,
      director: manualDirector.trim() || undefined,
      sourceUrl: manualSourceUrl.trim() || undefined,
      sourcePublisher: manualSourcePublisher.trim() || 'Official Press',
      citation: `${manualSourcePublisher.trim() || 'Official Press'} Announcement`,
    };

    const pkg = createAnnouncementProposal(newAnnouncement);
    setAnnouncementProposals([pkg, ...announcementProposals]);
    setShowManualModal(false);
    setManualTitle('');
    setManualSynopsis('');
    setManualReleaseDate('');
    setManualSourceUrl('');
    showToast(`Proposal created for '${newAnnouncement.rawTitle}' (Quality Score: ${pkg.overallQualityScore}/100)!`, 'success');
  };

  const handleApproveAnnouncement = (pkgId: string) => {
    setAnnouncementProposals((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, status: 'approved' } : p))
    );
    showToast('Announcement Approved for Production Staging!', 'success');
  };

  const handleRejectAnnouncement = (pkgId: string) => {
    setAnnouncementProposals((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, status: 'rejected' } : p))
    );
    showToast('Announcement proposal rejected and archived.', 'error');
  };

  const handleMergeAnnouncement = (pkgId: string) => {
    const target = announcementProposals.find((p) => p.id === pkgId);
    if (!target) return;

    if (target.status !== 'approved') {
      showToast('Please approve the announcement before merging into production catalog.', 'error');
      return;
    }

    const res = mergeAnnouncementProposal(target, 'Editorial Admin');
    if (res.success) {
      setAnnouncementProposals([...announcementProposals]);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCopySnippet = (pkg: AnnouncementProposalPackage) => {
    const snippet = generateFranchiseContentSnippet(pkg);
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(pkg.id);
    showToast('TypeScript buildContent snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedSnippetId(null), 3000);
  };

  return (
    <>
      <Helmet>
        <title>CKG Proposal Review Dashboard | CineOrder Developer</title>
        <meta name="description" content="AI Proposal Review & Knowledge Graph Integrity Dashboard" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {toastMessage.text}
          </div>
        )}

        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-white/10 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
              <GitPullRequest className="w-4 h-4 text-cyan-400" /> Editorial Review & Graph Integrity Pipeline
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              CineOrder Knowledge Graph Proposal Review
            </h1>
            <p className="text-xs text-muted mt-1">
              Strict Rule: <span className="text-amber-300 font-semibold">"AI Proposes. Humans Approve. The Knowledge Graph Decides."</span> 0 unreviewed edges reach production.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <div className="text-muted text-[10px]">CURRENT CKG VERSION</div>
              <div className="text-emerald-400 font-bold text-base flex items-center gap-1 justify-end">
                <ShieldCheck className="w-4 h-4" /> {versionState.currentVersion}
              </div>
              <div className="text-[10px] text-muted">Pending: {versionState.pendingVersion}</div>
            </div>
            <Link to="/dev-diagnostics">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-mono">
                <Layers className="w-3.5 h-3.5" /> Diagnostics Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('completeness')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'completeness'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg'
                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-amber-400" />
            Global Catalog Completeness
            <Badge variant="default" className="text-[10px] bg-amber-950 text-amber-300 border-amber-500/30">
              {completenessReport.totalGapsDetected} Gaps
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            Global Announcement Discovery
            <Badge variant="default" className="text-[10px] bg-cyan-950 text-cyan-300 border-cyan-500/30">
              {announcementProposals.length} Discovered
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('trailer-intelligence')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'trailer-intelligence'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-rose-400" />
            Trailer Intelligence
            <Badge variant="default" className="text-[10px] bg-rose-950 text-rose-300 border-rose-500/30">
              Trailers & Evidence
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('ckg-edges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'ckg-edges'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg'
                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-purple-400" />
            Graph Relationship Proposals (CKG)
            <Badge variant="default" className="text-[10px] bg-purple-950 text-purple-300 border-purple-500/30">
              {proposals.length} Packages
            </Badge>
          </button>
        </div>

        {/* TAB 0: GLOBAL CATALOG COMPLETENESS AUDIT */}
        {activeTab === 'completeness' && (
          <div className="space-y-6">
            {/* Header Banner & Telemetry Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-card to-purple-950/30 border border-amber-500/20 shadow-2xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sparkles className="w-3 h-3 mr-1 animate-pulse" /> Universal Completeness Audit
                    </span>
                    <span className="text-xs font-mono text-muted">
                      Franchises Audited: <strong className="text-amber-300">{completenessReport.totalFranchisesAudited}</strong> • Total Titles: <strong className="text-white">{completenessReport.totalTitlesAudited}</strong>
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">Global Missing Canonical Content & Narrative Dependency Auditor</h2>
                  <p className="text-xs text-muted font-mono">
                    Dynamic audit scanner for sequential gaps, missing sequels/prequels, spin-offs, TV series, crossover multiverse dependencies, and broken graph links across all franchises.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={handleRescanCompleteness}
                    disabled={isRescanningCompleteness}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-mono bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRescanningCompleteness ? 'animate-spin' : ''}`} />
                    {isRescanningCompleteness ? 'Auditing Catalog...' : 'Rescan All Franchises'}
                  </Button>
                </div>
              </div>

              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2 border-t border-white/5">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Franchises</div>
                  <div className="text-lg font-black text-amber-300 mt-0.5">{completenessReport.totalFranchisesAudited}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Titles Audited</div>
                  <div className="text-lg font-black text-white mt-0.5">{completenessReport.totalTitlesAudited}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Gaps Detected</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">{completenessReport.totalGapsDetected}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Continuity Gaps</div>
                  <div className="text-lg font-black text-cyan-300 mt-0.5">{completenessReport.summaryMetrics.continuityGapsCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Prerequisites</div>
                  <div className="text-lg font-black text-purple-300 mt-0.5">{completenessReport.summaryMetrics.missingPrerequisitesCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Broken Edges</div>
                  <div className={`text-lg font-black mt-0.5 ${completenessReport.brokenGraphDependencies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {completenessReport.brokenGraphDependencies.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-muted uppercase">Pending Review</div>
                  <div className="text-lg font-black text-amber-300 mt-0.5">{completenessReport.summaryMetrics.pendingApprovalsCount}</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-card border border-white/10">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search missing title proposals by name, franchise, or continuity..."
                  value={completenessSearchQuery}
                  onChange={(e) => setCompletenessSearchQuery(e.target.value)}
                  className="w-full bg-background border border-white/10 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={completenessFranchiseFilter}
                  onChange={(e) => setCompletenessFranchiseFilter(e.target.value)}
                  className="bg-background border border-white/10 text-xs font-mono text-white rounded-lg px-3 py-2"
                >
                  <option value="all">All Franchises ({completenessReport.totalFranchisesAudited})</option>
                  {allFranchises.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <select
                  value={completenessGapFilter}
                  onChange={(e) => setCompletenessGapFilter(e.target.value as any)}
                  className="bg-background border border-white/10 text-xs font-mono text-white rounded-lg px-3 py-2"
                >
                  <option value="all">All Gap Categories</option>
                  <option value="MISSING_CANONICAL_TITLE">Missing Canonical Title</option>
                  <option value="MISSING_SEQUEL">Missing Sequel</option>
                  <option value="MISSING_PREQUEL">Missing Prequel</option>
                  <option value="MISSING_SPINOFF">Missing Spin-Off</option>
                  <option value="MISSING_SERIES">Missing Series</option>
                  <option value="MISSING_CROSSOVER_CONTEXT">Crossover Context</option>
                  <option value="MISSING_CONTINUITY_ENTRY">Continuity Entry</option>
                </select>

                <select
                  value={completenessStatusFilter}
                  onChange={(e) => setCompletenessStatusFilter(e.target.value as any)}
                  className="bg-background border border-white/10 text-xs font-mono text-white rounded-lg px-3 py-2"
                >
                  <option value="all">All Review States</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Proposal Cards List */}
            <div className="space-y-4">
              {filteredCompletenessProposals.length === 0 ? (
                <div className="p-8 rounded-2xl bg-card border border-white/10 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">No Missing Content Proposals Found</div>
                  <p className="text-xs font-mono text-muted max-w-md mx-auto">
                    The active filters did not match any missing canonical titles or narrative dependency gaps.
                  </p>
                </div>
              ) : (
                filteredCompletenessProposals.map((proposal) => (
                  <div
                    key={proposal.proposalId}
                    className="p-5 rounded-2xl bg-card border border-white/10 shadow-xl space-y-4 hover:border-amber-500/30 transition-all"
                  >
                    {/* Proposal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="default" className="text-[10px] bg-amber-950 text-amber-300 border-amber-500/30 font-mono font-bold">
                          {proposal.gapType.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="default" className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                          {proposal.franchiseName}
                        </Badge>
                        <Badge variant="default" className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30 font-mono">
                          Continuity: {proposal.continuity}
                        </Badge>
                        <Badge
                          variant="default"
                          className={`text-[10px] font-mono border ${
                            proposal.reviewStatus === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : proposal.reviewStatus === 'rejected'
                              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                              : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          Status: {proposal.reviewStatus.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-[11px] font-mono text-muted flex items-center gap-2">
                        <span>Confidence: <strong className="text-emerald-400">{(proposal.evidence.confidenceScore * 100).toFixed(0)}%</strong></span>
                        {proposal.tmdbId && <span>TMDb: <strong className="text-white">{proposal.tmdbId}</strong></span>}
                      </div>
                    </div>

                    {/* Proposal Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
                      <div className="lg:col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-sans">{proposal.title}</h3>
                          {proposal.releaseYear && (
                            <span className="text-xs text-muted font-mono">({proposal.releaseYear})</span>
                          )}
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-muted">
                            {proposal.mediaType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">{proposal.overview}</p>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                          <div className="text-[10px] font-bold text-amber-300 uppercase">Detection Reasons:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted font-sans">
                            {proposal.reasonsDetected.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Evidence & Placement Sidebar */}
                      <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2 text-[11px]">
                        <div>
                          <span className="text-muted">Source:</span> <strong className="text-white">{proposal.evidence.source}</strong>
                        </div>
                        <div>
                          <span className="text-muted">Lifecycle:</span> <strong className="text-cyan-300">{proposal.lifecycleClassification.lifecycleCategory}</strong>
                        </div>
                        <div>
                          <span className="text-muted">Chronological Sort Key:</span> <span className="text-amber-300">{proposal.chronologicalPlacement.releaseDateSortKey}</span>
                        </div>
                        {proposal.director && (
                          <div>
                            <span className="text-muted">Director:</span> <strong className="text-white">{proposal.director}</strong>
                          </div>
                        )}
                        {proposal.duplicateCheck.isDuplicate && (
                          <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300 text-[10px]">
                            ⚠️ {proposal.duplicateCheck.duplicateReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proposed Story Knowledge Graph Linkages */}
                    {proposal.proposedStoryRelationships.length > 0 && (
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                        <div className="text-[10px] font-mono font-bold text-purple-300 uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Proposed Story Graph Linkages ({proposal.proposedStoryRelationships.length})
                        </div>
                        {proposal.proposedStoryRelationships.map((rel, idx) => (
                          <div key={idx} className="text-xs font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-black/40">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-300 font-bold">{rel.sourceId}</span>
                              <ArrowRight className="w-3 h-3 text-muted" />
                              <span className="text-emerald-300 font-bold">{rel.targetId}</span>
                              <span className="text-muted">({rel.relationship} • {rel.strength})</span>
                            </div>
                            <span className="text-muted text-[11px] font-sans">{rel.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
                      <div className="text-[10px] font-mono text-muted">
                        Proposal ID: <span className="text-white">{proposal.proposalId}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCompletenessPrModalProposal(proposal)}
                          className="gap-1 text-xs font-mono"
                        >
                          <GitPullRequest className="w-3.5 h-3.5" /> Pull Request Snippet
                        </Button>

                        {proposal.reviewStatus !== 'approved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCompletenessApprove(proposal.proposalId)}
                            className="gap-1 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}

                        {proposal.reviewStatus !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompletenessReject(proposal.proposalId)}
                            className="gap-1 text-xs font-mono text-rose-300 hover:text-white hover:bg-rose-500/20 border-rose-500/30"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 1: GLOBAL ANNOUNCEMENT DISCOVERY & CONTINUOUS MONITORING */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Continuous Monitoring Header Banner & Telemetry Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-card to-purple-950/30 border border-cyan-500/20 shadow-2xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      <Sparkles className="w-3 h-3 mr-1 animate-pulse" /> Continuous Background Monitoring
                    </span>
                    <span className="text-xs font-mono text-muted">
                      Scheduler: <strong className="text-white">Daemon / 6h Cron</strong> • Dynamic Franchises: <strong className="text-cyan-300">18 / 18 Active</strong>
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">Global Studio & Trade Monitoring Engine</h2>
                  <p className="text-xs text-muted font-mono">
                    Autonomous background pipeline for official studio announcements, release-date shifts, and OTT streaming confirmations. Discovery stages proposals — production merge requires explicit editorial approval.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRunDiscoveryScan}
                    disabled={isScanning}
                    className="font-mono text-xs gap-1.5 shadow-cyan-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'Scanning 18 Franchises...' : 'Run Global Auto-Monitor'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualModal(true)}
                    className="font-mono text-xs gap-1.5 border-white/20 hover:bg-white/10"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Submit Official Announcement
                  </Button>
                </div>
              </div>

              {/* SCAN STATUS TELEMETRY GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-3 border-t border-white/10 font-mono text-[11px]">
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-muted text-[9px] uppercase">Last Scan</div>
                  <div className="text-white font-bold truncate">{new Date(monitorStats.lastScanAt).toLocaleTimeString()}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-muted text-[9px] uppercase">Scan Duration</div>
                  <div className="text-cyan-400 font-bold">{monitorStats.scanDurationMs || 15} ms</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-muted text-[9px] uppercase">Total Scans</div>
                  <div className="text-white font-bold">{monitorStats.totalScansCount}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-muted text-[9px] uppercase">Duplicates Ignored</div>
                  <div className="text-emerald-400 font-bold">{monitorStats.duplicateEventsIgnoredCount || 0}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-muted text-[9px] uppercase">Rumors Blocked</div>
                  <div className="text-amber-400 font-bold">{monitorStats.rejectedRumorsCount || 1}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-muted text-[9px] uppercase">Failed Sources</div>
                  <div className="text-emerald-400 font-bold">{monitorStats.sourcesFailedCount || 0}</div>
                </div>
              </div>
            </div>

            {/* Proposal Category Filters & Franchise Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-white/10 shadow-xl">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    ['all', 'All Proposals'],
                    ['NEW_TITLES', 'New Titles'],
                    ['RELEASE_DATE_CHANGES', 'Release Dates'],
                    ['OTT_CHANGES', 'OTT & Streaming'],
                    ['CANCELLATIONS', 'Cancellations'],
                    ['TITLE_CHANGES', 'Title Changes'],
                    ['CONFLICTS', 'Conflicts'],
                  ] as const
                ).map(([cat, label]) => {
                  const count =
                    cat === 'all'
                      ? announcementProposals.length
                      : announcementProposals.filter((p) => p.category === cat).length;
                  const isActive = announcementCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setAnnouncementCategoryFilter(cat as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                          : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {label}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-muted'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted uppercase">Franchise:</span>
                <select
                  value={announcementFranchiseFilter}
                  onChange={(e) => setAnnouncementFranchiseFilter(e.target.value)}
                  className="bg-background border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-mono max-w-[220px]"
                >
                  <option value="all">All 18 Franchises</option>
                  {allFranchises.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Announcement Telemetry Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Monitored Events</div>
                <div className="text-xl font-black text-cyan-400 mt-1">{announcementProposals.length}</div>
                <div className="text-[10px] text-muted font-mono mt-0.5">Across All Franchises</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Verified Sources</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {announcementProposals.filter((p) => p.sourceVerification.isVerified).length}
                </div>
                <div className="text-[10px] text-emerald-300 font-mono mt-0.5">Studio Direct & Trades</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Release & OTT Shifts</div>
                <div className="text-xl font-black text-purple-400 mt-1">
                  {announcementProposals.filter((p) => p.category === 'RELEASE_DATE_CHANGES' || p.category === 'OTT_CHANGES').length}
                </div>
                <div className="text-[10px] text-purple-300 font-mono mt-0.5">Existing Catalog Diffs</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Ready for Production</div>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {announcementProposals.filter((p) => p.status === 'approved').length}
                </div>
                <div className="text-[10px] text-amber-300 font-mono mt-0.5">Editorial Approved</div>
              </div>
            </div>

            {/* Announcement Proposals List */}
            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-card border border-white/10 text-muted font-mono text-xs">
                  No announcements found for selected franchise filter.
                </div>
              ) : (
                filteredAnnouncements.map((pkg) => {
                  const c = pkg.candidate;
                  return (
                    <div
                      key={pkg.id}
                      className="p-6 rounded-2xl bg-card border border-white/10 shadow-xl space-y-4 hover:border-white/20 transition-all"
                    >
                      {/* Candidate Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant={
                                pkg.status === 'approved'
                                  ? 'success'
                                  : pkg.status === 'merged'
                                  ? 'default'
                                  : pkg.status === 'rejected'
                                  ? 'default'
                                  : 'warning'
                              }
                              className="uppercase font-mono text-[10px]"
                            >
                              {pkg.status}
                            </Badge>

                            <Badge variant="default" className="font-mono text-[10px] text-cyan-300 border-cyan-500/30">
                              {pkg.franchiseName}
                            </Badge>

                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-muted uppercase flex items-center gap-1">
                              {c.mediaType === 'movie' ? <Film className="w-3 h-3 text-amber-400" /> : <Tv className="w-3 h-3 text-cyan-400" />}
                              {c.mediaType}
                            </span>

                            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                              ID: {c.id}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {c.title}
                          </h3>
                        </div>

                        {/* Quality & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="text-[10px] text-muted uppercase">Quality Score</div>
                            <div
                              className={`text-xl font-black ${
                                pkg.overallQualityScore >= 90
                                  ? 'text-emerald-400'
                                  : pkg.overallQualityScore >= 80
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {pkg.overallQualityScore}%
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {pkg.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveAnnouncement(pkg.id)}
                                  className="text-xs font-mono text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectAnnouncement(pkg.id)}
                                  className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-950/40"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </>
                            )}

                            {pkg.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleMergeAnnouncement(pkg.id)}
                                className="text-xs font-mono gap-1"
                              >
                                <GitPullRequest className="w-3.5 h-3.5" /> Merge to Staging
                              </Button>
                            )}

                            {pkg.status === 'merged' && (
                              <Badge variant="success" className="gap-1 font-mono text-xs py-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Merged to Staging
                              </Badge>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopySnippet(pkg)}
                              className="text-xs font-mono text-cyan-300 border-white/10 hover:bg-white/10"
                              title="Copy TypeScript buildContent definition"
                            >
                              {copiedSnippetId === pkg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Source Credibility & Verification Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <div className="text-[10px] text-muted uppercase">Official Source Verification</div>
                          <div className="flex items-center gap-2">
                            {pkg.sourceVerification.isVerified ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> {pkg.sourceVerification.credibility.toUpperCase()} ({(pkg.sourceVerification.verificationScore * 100).toFixed(0)}%)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 text-[11px] font-bold">
                                <AlertTriangle className="w-3 h-3" /> UNVERIFIED RUMOR
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1">
                            <span className="text-muted">Citation:</span> "{pkg.sourceVerification.citation}"
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <div className="text-[10px] text-muted uppercase">Lifecycle & Catalog Uniqueness</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold text-[11px]">
                              {c.lifecycleCategory}
                            </span>
                            <span className="text-muted flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {c.releaseDate || 'TBA'}
                            </span>
                            {c.duplicateCheck.isDuplicate ? (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                                Duplicate: {c.duplicateCheck.matchedTitle}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px]">
                                Unique Title
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted truncate">
                            {c.overview}
                          </div>
                        </div>
                      </div>

                      {/* Universal Automatic Artwork Verification & Visual Preview Card */}
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 space-y-3 font-mono text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Automatic Artwork Resolution & Visual Preview
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted uppercase">Artwork Status:</span>
                            {(() => {
                              const artStatus = c.artworkVerification?.status || (c.posterUrl.includes('placeholder') ? 'FALLBACK' : 'VERIFIED');
                              const colorClass =
                                artStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : artStatus === 'PARTIAL'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : artStatus === 'AMBIGUOUS'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : artStatus === 'FAILED'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-slate-500/20 text-slate-300 border-slate-500/40';
                              return (
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${colorClass}`}>
                                  {artStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                  {artStatus === 'PARTIAL' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                                  {artStatus === 'AMBIGUOUS' && <AlertTriangle className="w-3 h-3 text-purple-400" />}
                                  {artStatus === 'FAILED' && <XCircle className="w-3 h-3 text-rose-400" />}
                                  {artStatus}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Image Previews & Key Metadata Attributes */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Poster Thumbnail */}
                          <div className="md:col-span-2 flex flex-col items-center">
                            <div className="relative group overflow-hidden rounded-lg border border-white/10 shadow-lg bg-black/50 aspect-[2/3] w-20 flex items-center justify-center">
                              <img
                                src={c.posterUrl}
                                alt={`${c.title} Poster`}
                                className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-muted mt-1 uppercase">Poster (w500)</span>
                          </div>

                          {/* Backdrop Thumbnail */}
                          <div className="md:col-span-4 flex flex-col items-center">
                            <div className="relative group overflow-hidden rounded-lg border border-white/10 shadow-lg bg-black/50 aspect-video w-44 flex items-center justify-center">
                              <img
                                src={c.backdropUrl}
                                alt={`${c.title} Backdrop`}
                                className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-backdrop.svg';
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-muted mt-1 uppercase">Backdrop (w1280)</span>
                          </div>

                          {/* Verification Breakdown Grid */}
                          <div className="md:col-span-6 grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-3 rounded-lg border border-white/5">
                            <div>
                              <span className="text-muted block text-[10px] uppercase">TMDb Match</span>
                              <span className="font-bold text-white">
                                {c.artworkVerification?.tmdbMatchStatus || (c.tmdbId ? 'VERIFIED' : 'PENDING')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted block text-[10px] uppercase">TMDb ID</span>
                              <span className="font-bold text-cyan-300">
                                {c.tmdbId || c.artworkVerification?.tmdbId || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted block text-[10px] uppercase">Media Type</span>
                              <span className="font-bold text-white capitalize">
                                {c.mediaType === 'series' ? 'TV' : 'Movie'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted block text-[10px] uppercase">Release Date</span>
                              <span className="font-bold text-slate-300">
                                {c.releaseDate || 'TBA'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted block text-[10px] uppercase">Poster Status</span>
                              <span className={`font-bold ${!c.posterUrl.includes('placeholder') ? 'text-emerald-300' : 'text-slate-400'}`}>
                                {!c.posterUrl.includes('placeholder') ? 'VERIFIED' : 'FALLBACK'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted block text-[10px] uppercase">Backdrop Status</span>
                              <span className={`font-bold ${!c.backdropUrl.includes('placeholder') ? 'text-emerald-300' : 'text-slate-400'}`}>
                                {!c.backdropUrl.includes('placeholder') ? 'VERIFIED' : 'FALLBACK'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Direct URLs & Fallback Reason */}
                        <div className="space-y-1 pt-1 border-t border-white/5 text-[11px]">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-muted min-w-[70px]">Poster URL:</span>
                            <a
                              href={c.posterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline truncate flex items-center gap-1"
                            >
                              {c.posterUrl} <ExternalLink className="w-2.5 h-2.5 inline" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-muted min-w-[70px]">Backdrop:</span>
                            <a
                              href={c.backdropUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline truncate flex items-center gap-1"
                            >
                              {c.backdropUrl} <ExternalLink className="w-2.5 h-2.5 inline" />
                            </a>
                          </div>
                          {c.artworkVerification?.reason && (
                            <div className="text-slate-300 italic pt-1 text-[10px] text-amber-300/80">
                              ℹ️ {c.artworkVerification.reason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Change Diff Panel (for modifications) */}
                      {pkg.diff && (
                        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2 font-mono text-xs">
                          <div className="text-[10px] font-bold text-purple-300 uppercase flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5" /> Proposed Catalog Modification: {pkg.diff.fieldName.toUpperCase()}
                            </span>
                            {pkg.diff.lifecycleBefore && pkg.diff.lifecycleAfter && (
                              <span className="text-[10px] text-muted flex items-center gap-1">
                                Lifecycle: <strong className="text-slate-300">{pkg.diff.lifecycleBefore}</strong> → <strong className="text-emerald-300">{pkg.diff.lifecycleAfter}</strong>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                            <div>
                              <div className="text-[10px] text-rose-300 uppercase font-bold">Current Production Value:</div>
                              <div className="text-slate-300 line-through mt-0.5">{pkg.diff.previousValue}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-emerald-300 uppercase font-bold">Proposed Verified Value:</div>
                              <div className="text-emerald-400 font-bold mt-0.5">{pkg.diff.proposedValue}</div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-300 italic">
                            {pkg.diff.diffSummary}
                          </div>
                        </div>
                      )}

                      {/* Conflicting Sources Alert Panel */}
                      {pkg.isConflict && pkg.conflictDetails && (
                        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2 font-mono text-xs">
                          <div className="text-[10px] font-bold text-rose-300 uppercase flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Conflict Detected: Contradictory Authoritative Reports
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/50 p-2.5 rounded-lg border border-rose-500/20">
                            <div>
                              <div className="text-[10px] text-cyan-300 uppercase font-bold">Source A ({pkg.conflictDetails.primarySource}):</div>
                              <div className="text-white mt-0.5">{pkg.conflictDetails.primaryValue}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-amber-300 uppercase font-bold">Source B ({pkg.conflictDetails.conflictingSource}):</div>
                              <div className="text-amber-300 mt-0.5">{pkg.conflictDetails.conflictingValue}</div>
                            </div>
                          </div>

                          <div className="text-[11px] text-rose-200">
                            {pkg.conflictDetails.resolutionNote}
                          </div>
                        </div>
                      )}
                      {c.proposedEdges.length > 0 && (
                        <div className="p-3 rounded-xl bg-cyan-950/10 border border-cyan-500/20 space-y-2">
                          <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Proposed Narrative Linkages ({c.proposedEdges.length})
                          </div>
                          {c.proposedEdges.map((edge) => (
                            <div key={edge.id} className="text-xs font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-black/40">
                              <div className="flex items-center gap-2">
                                <span className="text-cyan-300 font-bold">{edge.sourceId}</span>
                                <ArrowRight className="w-3 h-3 text-muted" />
                                <span className="text-emerald-300 font-bold">{edge.targetId}</span>
                                <span className="text-muted">({edge.relationship})</span>
                              </div>
                              <span className="text-muted text-[11px]">
                                Confidence: <strong className="text-white">{(edge.confidenceScore * 100).toFixed(0)}%</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TRAILER INTELLIGENCE & RECOMMENDATION EVIDENCE */}
        {activeTab === 'trailer-intelligence' && (
          <TrailerIntelligenceReviewTab onShowToast={showToast} />
        )}

        {/* TAB 2: CKG RELATIONSHIP PROPOSALS */}
        {activeTab === 'ckg-edges' && (
          <div className="space-y-6">
            {/* Quality Metrics & Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Total Proposals</div>
                <div className="text-xl font-black text-white mt-1">{stats.totalPackages}</div>
                <div className="text-[10px] text-muted font-mono mt-0.5">{stats.totalEdgesCount} Edges Evaluated</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Pending Review</div>
                <div className="text-xl font-black text-amber-400 mt-1">{stats.pendingCount}</div>
                <div className="text-[10px] text-amber-300 font-mono mt-0.5">Awaiting Human Approval</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Editorial Accuracy</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{stats.editorialAccuracy}</div>
                <div className="text-[10px] text-emerald-300 font-mono mt-0.5">{stats.approvedPercentage} Approved</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Avg Confidence</div>
                <div className="text-xl font-black text-cyan-400 mt-1">{stats.averageConfidence}</div>
                <div className="text-[10px] text-muted font-mono mt-0.5">{stats.averageCitationCount} Citations/Pkg</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Duplicate Risk</div>
                <div className="text-xl font-black text-purple-400 mt-1">{stats.duplicateRiskCount}</div>
                <div className="text-[10px] text-muted font-mono mt-0.5">Pre-existing Graph Edges</div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-white/10 shadow-lg">
                <div className="text-[10px] font-mono text-muted uppercase">Conflict Risk</div>
                <div className="text-xl font-black text-rose-400 mt-1">{stats.conflictRiskCount}</div>
                <div className="text-[10px] text-rose-300 font-mono mt-0.5">Relationship Differences</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-mono text-muted uppercase mr-1">Status:</span>
                {(['pending', 'approved', 'rejected', 'merged', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-white/5 text-muted hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-mono text-muted uppercase">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as any)}
                  className="bg-background border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-mono"
                >
                  <option value="all">All Sources</option>
                  <option value="official-synopsis">Official Synopsis</option>
                  <option value="official-trailer">Official Trailer</option>
                  <option value="tmdb">TMDb Metadata</option>
                  <option value="wikidata">Wikidata</option>
                </select>
              </div>
            </div>

            {/* Proposal Package List */}
            <div className="space-y-4">
              {filteredProposals.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-card border border-white/10 text-muted font-mono text-xs">
                  No proposal packages found matching filter '{statusFilter}'.
                </div>
              ) : (
                filteredProposals.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-6 rounded-2xl bg-card border border-white/10 shadow-xl space-y-4 hover:border-white/20 transition-all"
                  >
                    {/* Package Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              pkg.status === 'approved'
                                ? 'success'
                                : pkg.status === 'merged'
                                ? 'default'
                                : 'warning'
                            }
                            className="uppercase font-mono text-[10px]"
                          >
                            {pkg.status}
                          </Badge>
                          <Badge variant="default" className="font-mono text-[10px] text-cyan-300 border-cyan-500/30">
                            {pkg.metadata.sourceType}
                          </Badge>
                          <span className="text-xs font-mono text-muted">• Created {new Date(pkg.createdAt).toLocaleDateString()}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {pkg.title}
                        </h3>
                        <div className="text-xs text-muted font-mono mt-0.5">
                          Source: {pkg.metadata.sourceDocument} ({pkg.metadata.generatedBy})
                        </div>
                      </div>

                      {/* Quality Score Badge */}
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="text-[10px] text-muted uppercase">Proposal Quality</div>
                          <div
                            className={`text-xl font-black ${
                              pkg.overallQualityScore >= 90
                                ? 'text-emerald-400'
                                : pkg.overallQualityScore >= 80
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {pkg.overallQualityScore}%
                          </div>
                        </div>

                        {/* Action Controls for Package */}
                        <div className="flex items-center gap-1">
                          {pkg.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(pkg.id)}
                                className="text-xs font-mono text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(pkg.id)}
                                className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-950/40"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                          {pkg.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleMerge(pkg.id)}
                              className="text-xs font-mono gap-1"
                            >
                              <GitPullRequest className="w-3.5 h-3.5" /> Merge into Production CKG
                            </Button>
                          )}

                          {pkg.status === 'merged' && (
                            <Badge variant="success" className="gap-1 font-mono text-xs py-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Merged into CKG {versionState.currentVersion}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Proposed Edges List */}
                    <div className="space-y-3">
                      <div className="text-xs font-mono uppercase text-muted font-semibold flex items-center justify-between">
                        <span>Proposed Edges ({pkg.proposedEdges.length})</span>
                        <span>Citation & Confidence Status</span>
                      </div>

                      {pkg.proposedEdges.map((edge) => (
                        <div
                          key={edge.id}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="text-cyan-300 font-bold">{edge.sourceId}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-muted" />
                              <span className="text-emerald-300 font-bold">{edge.targetId}</span>
                              <span className="text-muted">({edge.relationship})</span>
                              <Badge variant="default" className="text-[10px] uppercase font-mono">
                                {edge.strength}
                              </Badge>
                            </div>

                            {/* Citation & Quality Badges */}
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              {edge.citation ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Citation Verified
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Missing Citation
                                </span>
                              )}

                              {edge.duplicateMatch?.isDuplicate && (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Duplicate Flag
                                </span>
                              )}

                              {edge.conflictMatch?.isConflict && (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse">
                                  Conflict ({edge.conflictMatch.field})
                                </span>
                              )}

                              <span className="text-muted">
                                Conf: <strong className="text-white">{(edge.confidenceScore * 100).toFixed(0)}%</strong>
                              </span>
                            </div>
                          </div>

                          {/* Reason & Source Text */}
                          <p className="text-xs text-slate-200">
                            <strong className="text-muted font-mono">Reason:</strong> {edge.reason}
                          </p>

                          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-muted space-y-1">
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Quoted Source Text:</span>
                              <span>Extracted: {edge.extractionDate}</span>
                            </div>
                            <p className="text-amber-200/90 italic font-sans">"{edge.sourceText}"</p>
                            <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                              <span>Citation:</span> <strong>{edge.citation}</strong>
                              {edge.sourceUrl && (
                                <a
                                  href={edge.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-2 underline flex items-center gap-0.5 text-cyan-300 hover:text-white"
                                >
                                  Source URL <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Edge Action Toolbar */}
                          <div className="flex items-center justify-end gap-2 pt-1 font-mono text-xs">
                            <button
                              onClick={() => setDiffEdge(edge)}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 flex items-center gap-1 transition-colors text-[11px]"
                            >
                              <Eye className="w-3 h-3" /> Compare with Production Graph
                            </button>
                            <button
                              onClick={() => setEditEdge(edge)}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-300 flex items-center gap-1 transition-colors text-[11px]"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Reason / Strength
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Manual Announcement Ingestion Modal */}
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-card border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-sm font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Ingest Official Studio Announcement
                </div>
                <button onClick={() => setShowManualModal(false)} className="text-muted hover:text-white font-mono text-xs">
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateManualAnnouncement} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-muted uppercase text-[10px]">Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Star Wars: Dawn of the Jedi"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted uppercase text-[10px]">Franchise:</label>
                    <select
                      value={manualFranchise}
                      onChange={(e) => setManualFranchise(e.target.value)}
                      className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                    >
                      {allFranchises.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted uppercase text-[10px]">Media Type:</label>
                    <select
                      value={manualMediaType}
                      onChange={(e) => setManualMediaType(e.target.value as 'movie' | 'series')}
                      className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                    >
                      <option value="movie">Movie</option>
                      <option value="series">TV Show / Series</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted uppercase text-[10px]">Expected Release Date (YYYY-MM-DD):</label>
                    <input
                      type="text"
                      placeholder="e.g. 2028-12-15"
                      value={manualReleaseDate}
                      onChange={(e) => setManualReleaseDate(e.target.value)}
                      className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-muted uppercase text-[10px]">Director / Showrunner:</label>
                    <input
                      type="text"
                      placeholder="e.g. James Mangold"
                      value={manualDirector}
                      onChange={(e) => setManualDirector(e.target.value)}
                      className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted uppercase text-[10px]">Official Source URL:</label>
                    <input
                      type="url"
                      placeholder="https://starwars.com/news/..."
                      value={manualSourceUrl}
                      onChange={(e) => setManualSourceUrl(e.target.value)}
                      className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-muted uppercase text-[10px]">Source Publisher / Press:</label>
                    <input
                      type="text"
                      placeholder="e.g. Lucasfilm Official Press"
                      value={manualSourcePublisher}
                      onChange={(e) => setManualSourcePublisher(e.target.value)}
                      className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted uppercase text-[10px]">Official Synopsis / Announcement Text:</label>
                  <textarea
                    rows={3}
                    placeholder="Enter official press announcement details..."
                    value={manualSynopsis}
                    onChange={(e) => setManualSynopsis(e.target.value)}
                    className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowManualModal(false)} className="font-mono text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" type="submit" className="font-mono text-xs">
                    Run Verification & Generate Proposal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Diff Inspection Modal */}
        {diffEdge && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-card border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Production CKG Diff Comparison
                </div>
                <button onClick={() => setDiffEdge(null)} className="text-muted hover:text-white font-mono text-xs">
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Current Production CKG */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-muted flex items-center justify-between">
                    <span>Current Production Graph</span>
                    <Badge variant="default" className="text-[10px] text-muted">
                      Live
                    </Badge>
                  </div>
                  <div className="font-mono text-xs space-y-2">
                    <div>
                      <span className="text-muted">Edge:</span>{' '}
                      <strong className="text-white">
                        {diffEdge.sourceId} → {diffEdge.targetId}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted">Relationship:</span>{' '}
                      <strong className="text-slate-300">
                        {cineOrderKnowledgeGraph.edges.find(
                          (e) =>
                            normalizeCkgId(e.sourceId) === normalizeCkgId(diffEdge.sourceId) &&
                            normalizeCkgId(e.targetId) === normalizeCkgId(diffEdge.targetId)
                        )?.relationship || 'None'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted">Strength:</span>{' '}
                      <strong className="text-slate-300">
                        {cineOrderKnowledgeGraph.edges.find(
                          (e) =>
                            normalizeCkgId(e.sourceId) === normalizeCkgId(diffEdge.sourceId) &&
                            normalizeCkgId(e.targetId) === normalizeCkgId(diffEdge.targetId)
                        )?.strength || 'None'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Proposed Changes */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center justify-between">
                    <span>Proposed Changes</span>
                    <Badge variant="success" className="text-[10px]">
                      Candidate
                    </Badge>
                  </div>
                  <div className="font-mono text-xs space-y-2">
                    <div>
                      <span className="text-muted">Relationship:</span>{' '}
                      <strong className="text-amber-300 font-bold bg-amber-500/10 px-1 py-0.5 rounded">
                        {diffEdge.relationship}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted">Strength:</span>{' '}
                      <strong className="text-emerald-300 font-bold bg-emerald-500/10 px-1 py-0.5 rounded">
                        {diffEdge.strength}
                      </strong>
                    </div>
                    <div className="text-[11px] text-slate-200 mt-2">
                      <span className="text-muted">Reasoning:</span> {diffEdge.reason}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inline Edge Editing Modal */}
        {editEdge && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-card border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Proposed Edge Fields
                </div>
                <button onClick={() => setEditEdge(null)} className="text-muted hover:text-white font-mono text-xs">
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-muted uppercase text-[10px]">Reason Explanation:</label>
                  <textarea
                    value={editEdge.reason}
                    onChange={(e) => setEditEdge({ ...editEdge, reason: e.target.value })}
                    rows={3}
                    className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="text-muted uppercase text-[10px]">Edge Strength:</label>
                  <select
                    value={editEdge.strength}
                    onChange={(e) => setEditEdge({ ...editEdge, strength: e.target.value as any })}
                    className="w-full mt-1 bg-background border border-white/10 text-white rounded-lg p-2 text-xs"
                  >
                    <option value="required">Required (Must Watch)</option>
                    <option value="strong">Strong (Recommended)</option>
                    <option value="moderate">Moderate (Optional)</option>
                    <option value="weak">Weak (Safe to Skip)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setEditEdge(null)} className="font-mono text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleEditSave(proposals[0]?.id || '', editEdge.id, editEdge.reason, editEdge.strength)}
                  className="font-mono text-xs"
                >
                  Save Field Changes
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Completeness Pull Request Snippet Modal */}
        {completenessPrModalProposal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-card border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" /> Catalog Integration PR Snippet
                </div>
                <button
                  onClick={() => setCompletenessPrModalProposal(null)}
                  className="text-muted hover:text-white font-mono text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="text-muted text-[11px]">
                  Copy and paste the following snippet into{' '}
                  <code className="text-amber-300">src/data/franchises/{completenessPrModalProposal.franchiseId}.ts</code>:
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-emerald-300 text-[11px] overflow-x-auto max-h-72">
{`// [PR] Missing Title: ${completenessPrModalProposal.title} (${completenessPrModalProposal.gapType})
{
  id: '${completenessPrModalProposal.proposalId}',
  franchise_id: '${completenessPrModalProposal.franchiseId}',
  title: '${completenessPrModalProposal.title.replace(/'/g, "\\'")}',
  type: '${completenessPrModalProposal.mediaType}',
  release_date: '${completenessPrModalProposal.releaseDate || '2026-12-31'}',
  overview: '${completenessPrModalProposal.overview.replace(/'/g, "\\'")}',
  runtime: 120,
  rating: 7.5,
  status: '${completenessPrModalProposal.lifecycleClassification.status}',
  created_at: new Date().toISOString(),
  theatrical_released: ${completenessPrModalProposal.lifecycleClassification.lifecycleCategory === 'THEATRICALLY_RELEASED'},
  ott_available: false,
  ${completenessPrModalProposal.tmdbId ? `tmdb_id: ${completenessPrModalProposal.tmdbId},` : ''}
  ${completenessPrModalProposal.director ? `director: '${completenessPrModalProposal.director.replace(/'/g, "\\'")}',` : ''}
}`}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCompletenessPrModalProposal(null)}
                  className="font-mono text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const snippet = `// [PR] Missing Title: ${completenessPrModalProposal.title} (${completenessPrModalProposal.gapType})\n{\n  id: '${completenessPrModalProposal.proposalId}',\n  franchise_id: '${completenessPrModalProposal.franchiseId}',\n  title: '${completenessPrModalProposal.title.replace(/'/g, "\\'")}',\n  type: '${completenessPrModalProposal.mediaType}',\n  release_date: '${completenessPrModalProposal.releaseDate || '2026-12-31'}',\n  overview: '${completenessPrModalProposal.overview.replace(/'/g, "\\'")}',\n  runtime: 120,\n  rating: 7.5,\n  status: '${completenessPrModalProposal.lifecycleClassification.status}',\n  created_at: new Date().toISOString(),\n  theatrical_released: ${completenessPrModalProposal.lifecycleClassification.lifecycleCategory === 'THEATRICALLY_RELEASED'},\n  ott_available: false,\n  ${completenessPrModalProposal.tmdbId ? `tmdb_id: ${completenessPrModalProposal.tmdbId},` : ''}\n  ${completenessPrModalProposal.director ? `director: '${completenessPrModalProposal.director.replace(/'/g, "\\'")}',` : ''}\n}`;
                    navigator.clipboard?.writeText(snippet);
                    showToast('PR snippet copied to clipboard!', 'success');
                  }}
                  className="gap-1 font-mono text-xs bg-amber-600 hover:bg-amber-500 text-white"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Snippet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
