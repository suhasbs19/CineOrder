# CineOrder Override Health & Editorial Knowledge Alignment Report
_Last Checked: 2026-08-14_

```text
========================================
 Recommendation Engine Health           
========================================
 Generated............... 2026-08-14
 Knowledge Graph......... v3.4
 Traversal Engine........ v2.1
 Policy Version.......... v6.2
 Comparison Engine....... v1.0
 Git Commit.............. local-dev
 Execution Duration...... 24ms
 --------------------------------------
 Overall Accuracy........ 100%
 Average Drift........... 0
 Override Effectiveness.. 0%
 Active Overrides........ 0 (+0)
 Redundant Overrides..... 0 (0 definitely removable)
 Necessary Overrides..... 0
 Likely Necessary........ 0
 Calibration Priority.... None
 Engine Status........... Excellent
========================================
```

## Stability & Subsumption Metrics
- **Current Active Overrides:** 0 (Delta: +0)
- **Newly Redundant (this run):** 0
- **Newly Necessary (this run):** 0

## Recommendation Evidence Coverage
- **Total Graph Edges:** 338
- **Edges with Editorial Evidence:** 338 (100.0%)
- **Fallback Graph Evidence:** 0
- **MCU Release Gate Target:** ≥95.0%

## Editorial Knowledge Alignment Protocol
Overrides are temporary learning scaffolding. Active overrides must be resolved through graph improvements using the standardized taxonomy:

| Action Type | Description | Mandatory Fields |
| :--- | :--- | :--- |
| `EDGE_STRENGTH_CHANGE` | Adjust edge strength weight (`required`, `strong`, `moderate`, `weak`). | `Location`, `Old`, `New` |
| `RELATIONSHIP_CHANGE` | Modify taxonomy relationship type (`direct-sequel`, `story-continuation`, etc.). | `Location`, `Old`, `New` |
| `EDGE_ADDITION` | Insert a missing edge between two nodes. | `Location`, `Relationship`, `Strength` |
| `EDGE_REMOVAL` | Prune an invalid or non-existent dependency edge. | `Location`, `Reason` |
| `NARRATIVE_EVIDENCE_UPDATE` | Expand narrative text/rationale without affecting numerical score. | `Location`, `AddedEvidence` |

## Detailed Rule Health Ledger

| Target | Source | Status | Confidence | Engine Would Produce | Override Category | Reason |
|--------|--------|--------|------------|----------------------|-------------------|--------|
