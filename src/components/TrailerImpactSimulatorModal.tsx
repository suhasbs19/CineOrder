import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type {
  TrailerRecommendationImpactReport,
  TrailerProposalPackage,
} from '@/types/trailerIntelligence';

interface TrailerImpactSimulatorModalProps {
  proposal: TrailerProposalPackage;
  report: TrailerRecommendationImpactReport;
  onClose: () => void;
}

export const TrailerImpactSimulatorModal: React.FC<TrailerImpactSimulatorModalProps> = ({
  proposal,
  report,
  onClose,
}) => {
  const getImpactBadgeVariant = (category: string) => {
    switch (category) {
      case 'NEW_MUST_WATCH_CANDIDATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'CROSS_CONTINUITY_IMPACT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'NEW_RECOMMENDED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'NEW_OPTIONAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'CONFLICTING_EVIDENCE':
      case 'REVIEW_REQUIRED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-card to-slate-950 border border-cyan-500/30 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Read-Only Recommendation Simulator
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 mr-1" /> Zero Graph Mutation Enforced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              Hypothetical Impact Projection: <span className="text-cyan-300">{report.targetTitle}</span>
            </h2>
            <p className="text-xs text-muted font-mono">
              Target ID: <span className="text-white">{report.targetContentId}</span> | Continuity:{' '}
              <span className="text-purple-300">{report.continuityId}</span> | Trailer Key:{' '}
              <span className="text-amber-300">{proposal.videoKey}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors"
            title="Close Simulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Read-Only Governance Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-card to-purple-950/40 border border-cyan-500/40 shadow-inner flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                PRIMARY SIMULATED IMPACT CATEGORY
              </div>
              <div className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${getImpactBadgeVariant(report.primaryImpactCategory)}`}>
                  {report.primaryImpactCategory}
                </span>
                <span className="text-xs text-muted font-normal">
                  (Calculated from {proposal.evidenceItems.length} verified trailer evidence items)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> SIMULATION ONLY — PRODUCTION GRAPH UNCHANGED
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison: Current vs Simulated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CURRENT PRODUCTION STATE */}
          <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-white">CURRENT PRODUCTION PREREQUISITES</h3>
              </div>
              <Badge variant="default" className="text-[10px] font-mono text-emerald-400 border-emerald-500/40">
                {report.currentProductionPrerequisites.totalCount} Active
              </Badge>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {report.currentProductionPrerequisites.totalCount === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-muted font-mono">
                  No production prerequisites indexed (Standalone or unreleased title).
                </div>
              ) : (
                <>
                  {report.currentProductionPrerequisites.mustWatch.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono font-bold text-amber-400 uppercase">Must Watch</div>
                      {report.currentProductionPrerequisites.mustWatch.map((item) => (
                        <div key={item.contentId} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] text-muted block font-mono">{item.contentId}</span>
                          </div>
                          <Badge variant="default" className="text-[10px] bg-amber-950 text-amber-300 border-amber-500/30">
                            {item.strength}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {report.currentProductionPrerequisites.recommended.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase">Recommended</div>
                      {report.currentProductionPrerequisites.recommended.map((item) => (
                        <div key={item.contentId} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] text-muted block font-mono">{item.contentId}</span>
                          </div>
                          <Badge variant="default" className="text-[10px] bg-cyan-950 text-cyan-300 border-cyan-500/30">
                            {item.strength}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {report.currentProductionPrerequisites.optional.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono font-bold text-blue-400 uppercase">Optional Context</div>
                      {report.currentProductionPrerequisites.optional.map((item) => (
                        <div key={item.contentId} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] text-muted block font-mono">{item.contentId}</span>
                          </div>
                          <Badge variant="default" className="text-[10px] bg-blue-950 text-blue-300 border-blue-500/30">
                            {item.strength}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* SIMULATED STATE (IF APPROVED) */}
          <div className="p-5 rounded-2xl bg-card border border-cyan-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-cyan-300">SIMULATED PREREQUISITES (IF APPROVED)</h3>
              </div>
              <Badge variant="default" className="text-[10px] font-mono text-cyan-300 border-cyan-500/40">
                {report.simulatedPrerequisites.totalCount} Projected
              </Badge>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {report.simulatedPrerequisites.mustWatch.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-amber-400 uppercase">Must Watch Candidates</div>
                  {report.simulatedPrerequisites.mustWatch.map((item) => (
                    <div
                      key={item.contentId}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        item.isSimulatedNew
                          ? 'bg-amber-950/40 border-amber-500/50 shadow-md'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{item.title}</span>
                          {item.isSimulatedNew && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-black">
                              + NEW CANDIDATE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted block font-mono">{item.reason}</span>
                      </div>
                      <Badge variant="default" className="text-[10px] bg-amber-950 text-amber-300 border-amber-500/30">
                        {item.strength}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {report.simulatedPrerequisites.recommended.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase">Recommended</div>
                  {report.simulatedPrerequisites.recommended.map((item) => (
                    <div
                      key={item.contentId}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        item.isSimulatedNew
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{item.title}</span>
                          {item.isSimulatedNew && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-black">
                              + NEW
                            </span>
                          )}
                          {item.isCrossContinuity && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                              CROSS-CONTINUITY
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted block font-mono">{item.reason}</span>
                      </div>
                      <Badge variant="default" className="text-[10px] bg-cyan-950 text-cyan-300 border-cyan-500/30">
                        {item.strength}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {report.simulatedPrerequisites.optional.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-blue-400 uppercase">Optional Context</div>
                  {report.simulatedPrerequisites.optional.map((item) => (
                    <div
                      key={item.contentId}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        item.isSimulatedNew
                          ? 'bg-blue-950/40 border-blue-500/50 shadow-md'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{item.title}</span>
                          {item.isSimulatedNew && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500 text-black">
                              + NEW
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted block font-mono">{item.reason}</span>
                      </div>
                      <Badge variant="default" className="text-[10px] bg-blue-950 text-blue-300 border-blue-500/30">
                        {item.strength}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diff Summary Breakdown */}
        <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold font-mono text-white">SIMULATED DIFF SUMMARY</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">New Must Watch Candidates</div>
              <div className="text-xl font-black text-white mt-1">+{report.diff.newMustWatchCandidates.length}</div>
              <div className="text-[10px] text-muted mt-0.5">High-confidence narrative continuations</div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">New Recommended Links</div>
              <div className="text-xl font-black text-white mt-1">+{report.diff.newRecommended.length}</div>
              <div className="text-[10px] text-muted mt-0.5">Villains, organizations & direct sequels</div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs">
              <div className="text-[10px] font-mono font-bold text-blue-400 uppercase">New Optional Links</div>
              <div className="text-xl font-black text-white mt-1">+{report.diff.newOptional.length}</div>
              <div className="text-[10px] text-muted mt-0.5">Cameos, callbacks & timeline clues</div>
            </div>
          </div>

          {/* Cross Continuity Links If Any */}
          {report.diff.crossContinuityLinks.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Multi-Continuity Firewall Isolations ({report.diff.crossContinuityLinks.length})
              </div>
              <div className="space-y-1.5 text-xs">
                {report.diff.crossContinuityLinks.map((link, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-black/40 border border-purple-500/20 font-mono text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-purple-300 font-bold">{link.sourceContinuity}</span> ({link.sourceContentId})
                      <span className="text-muted mx-2">→</span>
                      <span className="text-purple-300 font-bold">{link.targetContinuity}</span> ({link.targetContentId})
                    </div>
                    <Badge variant="default" className="text-[9px] text-purple-300 border-purple-500/40">
                      {link.relationship}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Item Contributions */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-muted uppercase">Evidence Item Contributions</div>
            <div className="space-y-1.5">
              {report.evidenceSummary.map((item) => (
                <div key={item.evidenceId} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                      {item.category}
                    </span>
                    <span className="font-semibold text-white">{item.subject}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[10px] font-mono text-muted">{item.simulatedContribution}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{(item.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Governance Safety Notices */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 font-mono text-[11px] text-muted">
          {report.safetyNotes.map((note, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="font-mono text-xs text-white"
          >
            Close Simulator
          </Button>
        </div>
      </div>
    </div>
  );
};
