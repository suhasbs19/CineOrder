import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  Layers,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  TrailerRecommendationImpactProposal,
  TrailerProposalPackage,
} from '@/types/trailerIntelligence';

interface TrailerApprovalPreviewModalProps {
  proposal: TrailerRecommendationImpactProposal;
  packageItem?: TrailerProposalPackage;
  onApprove: (proposalId: string, reviewer: string, notes: string) => void;
  onReject: (proposalId: string, reviewer: string, notes: string) => void;
  onClose: () => void;
}

export const TrailerApprovalPreviewModal: React.FC<TrailerApprovalPreviewModalProps> = ({
  proposal,
  onApprove,
  onReject,
  onClose,
}) => {
  const [reviewerName, setReviewerName] = useState<string>('Editorial Lead');
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const getImpactBadgeVariant = (category: string) => {
    switch (category) {
      case 'NEW_PREREQUISITE':
      case 'SEQUEL_RELATIONSHIP':
      case 'PREQUEL_RELATIONSHIP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'CROSSOVER_RELATIONSHIP':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'NEW_RECOMMENDED_CONTEXT':
      case 'CHARACTER_CONTEXT':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'NEW_OPTIONAL_CONTEXT':
      case 'CONTINUITY_CONTEXT':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const isMustWatch =
    proposal.impactCategory === 'NEW_PREREQUISITE' ||
    proposal.proposedRelationships.some((r) => r.recommendationStrength === 'strong' || r.recommendationStrength === 'required');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-card to-slate-950 border border-emerald-500/30 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Approval Preview & Impact Assessment
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <ShieldCheck className="w-3 h-3 mr-1" /> Zero Mutation on Preview
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              Target Title: <span className="text-emerald-300">{proposal.title}</span>
            </h2>
            <p className="text-xs text-muted font-mono">
              Content ID: <span className="text-white">{proposal.contentId}</span> | Franchise:{' '}
              <span className="text-cyan-300">{proposal.franchiseId}</span> | Continuity:{' '}
              <span className="text-purple-300">{proposal.continuityId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Classification & Anti-Inflation Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-card to-cyan-950/40 border border-emerald-500/40 shadow-inner space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                PROPOSED NARRATIVE IMPACT CLASSIFICATION
              </div>
              <div className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${getImpactBadgeVariant(proposal.impactCategory)}`}>
                  {proposal.impactCategory}
                </span>
                <span className="text-xs text-muted font-normal">
                  (Confidence: {(proposal.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isMustWatch ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ⚡ MUST WATCH CANDIDATE
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  🛡️ CONTEXTUAL / ANTI-INFLATION SAFEGUARD ACTIVE
                </span>
              )}
              {proposal.continuitySafetyPassed ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ Multi-Continuity Firewall Safe
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  ⚠️ Cross-Continuity Warning
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            <span className="font-semibold text-white">Narrative Reasoning:</span> {proposal.explanation}
          </p>
          {proposal.continuitySafetyNotes.length > 0 && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-1">
              <div className="font-bold font-mono uppercase">Firewall Alerts:</div>
              {proposal.continuitySafetyNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison: CURRENT vs PROPOSED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current State */}
          <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> CURRENT PRODUCTION STATE
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-muted">
                {proposal.currentRecommendationState.totalCount} Prerequisites
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="font-mono text-[11px] font-bold text-amber-400">MUST WATCH ({proposal.currentRecommendationState.mustWatch.length})</div>
                {proposal.currentRecommendationState.mustWatch.length === 0 ? (
                  <div className="text-muted italic pl-2 py-1">None</div>
                ) : (
                  proposal.currentRecommendationState.mustWatch.map((item, idx) => (
                    <div key={idx} className="text-slate-300 pl-2 py-0.5 flex items-center justify-between">
                      <span>• {item.title}</span>
                      <span className="text-[10px] text-muted">{item.relationship}</span>
                    </div>
                  ))
                )}
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold text-cyan-400">RECOMMENDED ({proposal.currentRecommendationState.recommended.length})</div>
                {proposal.currentRecommendationState.recommended.length === 0 ? (
                  <div className="text-muted italic pl-2 py-1">None</div>
                ) : (
                  proposal.currentRecommendationState.recommended.map((item, idx) => (
                    <div key={idx} className="text-slate-300 pl-2 py-0.5 flex items-center justify-between">
                      <span>• {item.title}</span>
                      <span className="text-[10px] text-muted">{item.relationship}</span>
                    </div>
                  ))
                )}
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold text-blue-400">OPTIONAL CONTEXT ({proposal.currentRecommendationState.optional.length})</div>
                {proposal.currentRecommendationState.optional.length === 0 ? (
                  <div className="text-muted italic pl-2 py-1">None</div>
                ) : (
                  proposal.currentRecommendationState.optional.map((item, idx) => (
                    <div key={idx} className="text-slate-300 pl-2 py-0.5 flex items-center justify-between">
                      <span>• {item.title}</span>
                      <span className="text-[10px] text-muted">{item.relationship}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Proposed State */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> PROPOSED AFTER APPROVAL
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {proposal.proposedRecommendationState.totalCount} Prerequisites
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="font-mono text-[11px] font-bold text-amber-400">MUST WATCH ({proposal.proposedRecommendationState.mustWatch.length})</div>
                {proposal.proposedRecommendationState.mustWatch.length === 0 ? (
                  <div className="text-muted italic pl-2 py-1">None</div>
                ) : (
                  proposal.proposedRecommendationState.mustWatch.map((item, idx) => (
                    <div
                      key={idx}
                      className={`pl-2 py-0.5 flex items-center justify-between rounded ${
                        item.isSimulatedNew ? 'bg-amber-500/20 text-amber-200 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span>• {item.title} {item.isSimulatedNew && '[NEW]'}</span>
                      <span className="text-[10px] text-muted">{item.relationship}</span>
                    </div>
                  ))
                )}
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold text-cyan-400">RECOMMENDED ({proposal.proposedRecommendationState.recommended.length})</div>
                {proposal.proposedRecommendationState.recommended.length === 0 ? (
                  <div className="text-muted italic pl-2 py-1">None</div>
                ) : (
                  proposal.proposedRecommendationState.recommended.map((item, idx) => (
                    <div
                      key={idx}
                      className={`pl-2 py-0.5 flex items-center justify-between rounded ${
                        item.isSimulatedNew ? 'bg-cyan-500/20 text-cyan-200 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span>• {item.title} {item.isSimulatedNew && '[NEW]'}</span>
                      <span className="text-[10px] text-muted">{item.relationship}</span>
                    </div>
                  ))
                )}
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold text-blue-400">OPTIONAL CONTEXT ({proposal.proposedRecommendationState.optional.length})</div>
                {proposal.proposedRecommendationState.optional.length === 0 ? (
                  <div className="text-muted italic pl-2 py-1">None</div>
                ) : (
                  proposal.proposedRecommendationState.optional.map((item, idx) => (
                    <div
                      key={idx}
                      className={`pl-2 py-0.5 flex items-center justify-between rounded ${
                        item.isSimulatedNew ? 'bg-blue-500/20 text-blue-200 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span>• {item.title} {item.isSimulatedNew && '[NEW]'}</span>
                      <span className="text-[10px] text-muted">{item.relationship}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence & Official Citations */}
        <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-2.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" /> SOURCE EVIDENCE & VERIFICATION CITATIONS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {proposal.sourceCitations.map((cit, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                {cit}
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer Input & Governance Actions */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-card to-slate-900 border border-white/15 space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" /> EDITORIAL DECISION & AUDIT RECORDING
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-muted mb-1">Reviewer Name / Role</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                placeholder="e.g. Lead Reviewer"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-muted mb-1">Editorial Rationale Notes</label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                placeholder="Document approval reasoning or rejection rationale..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 flex-wrap">
            <div className="text-[11px] text-muted font-mono">
              Rollback Policy: Rejection or archiving creates 0 modifications in production catalog or CKG.
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-muted hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onReject(proposal.id, reviewerName, reviewNotes || 'Rejected by Editorial Reviewer')}
                className="flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Proposal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(proposal.id, reviewerName, reviewNotes || 'Verified trailer narrative evidence and approved')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
