# CineOrder Platform Freeze & Knowledge Engineering Directive

## System Status: LOCKED (`v1.0-framework-freeze`)

The CineOrder platform has reached architectural maturity. The project has officially transitioned from **Platform Engineering** to **Knowledge Engineering**.

### 1. Frozen Framework (Zero Framework Creep Enforced)

The following modules are locked and MUST NOT be modified:
- **Runtime Engines**: Traversal Engine (`src/lib/storyGraphEngine.ts`), BFS algorithms, Recommendation Engine (`src/lib/recommendationEngine.ts`), Recommendation Service, Scoring Engine (`src/lib/narrativeScoring.ts`), Category Thresholds, DTO Generators, Snapshot Pipelines.
- **Governance Tools**: Comparison Engine (`scripts/runEditorialComparison.ts`), Editorial Knowledge Alignment Protocol, Graph Improvement Taxonomy, Override Health Reports, Regression Framework.
- **Governance Core Specs**: `ARCHITECTURE.md`, `EDITORIAL_POLICY.md`, `GRAPH_STYLE_GUIDE.md`.

### 2. Allowed Development Scope

Daily development and maintenance occur ONLY inside `src/data/`:
- `src/data/cineOrderKnowledgeGraph.ts` (Graph topology, title nodes, edges, relationships, strengths)
- `src/data/editorialOverrides.ts` (Temporary scaffolding overrides)
- `src/data/titleMetadata.ts` & Franchise Data
- Narrative evidence & explanations
- Unit / Integration tests (`src/__tests__/`)
- Documentation (`.md`)

### 3. Resolution Hierarchy & Diagnostic Workflow

When the engine disagrees with editorial intent:
1. **Never modify framework code first**.
2. Run the **Editorial Knowledge Alignment Protocol**.
3. Evaluate measurable evidence, decision paths, policy rules, primary root causes, and secondary factors.
4. Classify the outcome into one of 4 outcomes:
   - `✅ ENGINE ALREADY CORRECT` (Delete override)
   - `🟨 GRAPH IMPROVEMENT REQUIRED` (Improve graph data via fixed taxonomy, then delete override)
   - `🟧 EDITORIAL EXCEPTION` (Retain override; document exception rationale)
   - `🟥 FRAMEWORK LIMITATION` (Document modeling limitation for RFC)

### 4. Mandatory Rule for Framework Modifications

> **CRITICAL RULE**: Every framework modification MUST first fail at least one complete Editorial Knowledge Alignment cycle.
> Framework changes are prohibited unless ALL conditions are met:
> 1. Editorial Knowledge Alignment classifies `🟥 FRAMEWORK LIMITATION`.
> 2. The issue cannot be solved by graph topology, relationship type, edge strength, or narrative evidence.
> 3. A formal RFC documents the modeling limitation.
> 4. Regression suite passes with 0 breakage.
> 5. Comparison Engine confirms measurable global accuracy improvement.

### 5. Pull Request Governance Questions

Every proposed pull request must explicitly answer:
1. What editorial disagreement exists?
2. What measurable evidence supports it?
3. What is the primary root cause?
4. Can the problem be solved through graph modeling?
5. Does the solution preserve the frozen framework?
6. Does the regression suite pass?
7. Does comparison accuracy improve or remain stable?

### 6. Simplified Content Production Roadmap

Following `v1.0-framework-freeze`, all future milestones represent **content production mode**:
- `v1.1` MCU Editorial Knowledge Alignment
- `v1.2` MCU v1.0 Release (Release Gate Verified)
- `v2.0` Star Wars Knowledge Graph
- `v3.0` DC Multiverse Knowledge Graph
- `v4.0` Harry Potter & Wizarding World
- `v5.0` Middle-earth Legendarium

### 7. Franchise Release Gate Criteria

Before tagging any franchise v1.0 release:
1. `✓ Overall Accuracy ≥ 95.0%`
2. `✓ Average Category Drift ≤ 0.15`
3. `✓ Regression Suite PASS (0 breakage)`
4. `✓ Alignment Protocol Complete`
5. `✓ Zero Unexplained Scaffolding`: Every remaining active override is explicitly classified as either `🟧 EDITORIAL EXCEPTION` or `🟥 FRAMEWORK LIMITATION`.

