# CineOrder Knowledge Graph Style Guide

**Version**: `1.0` | **Applies To**: All Knowledge Graph Nodes, Edges, and Franchise Datasets

---

## 1. Naming Conventions

To prevent data drift and schema mismatch, all identifiers, relationships, and attributes must strictly follow these casing rules:

### Node IDs & Franchise Keys
- Use `kebab-case` prefixed by franchise identifier.
- Format: `<franchise>-<title-slug>`
- **Correct**: `mcu-ironman`, `sw-a-new-hope`, `dc-the-batman`
- **Incorrect**: `mcuIronMan`, `MCU_Ironman`, `Iron-Man`

### Relationship Identifiers (`CKGEdgeRelationship`)
- Casing: `kebab-case` only.
- Allowed values:
  - `direct-sequel`
  - `story-continuation`
  - `character-origin`
  - `character-development`
  - `major-crossover`
  - `timeline`
  - `multiverse`
  - `world-building`
  - `organization`
  - `thematic-callback`
  - `same-universe-only`
  - `post-credit`
- **Incorrect**: `directSequel`, `DIRECT_SEQUEL`, `storyContinuationEdge`

### Edge Strength Values (`CKGEdgeStrength`)
- Allowed lowercase strings:
  - `required` (100 pts)
  - `strong` (80 pts)
  - `moderate` (60 pts)
  - `post-credit` (40 pts)
  - `weak` (20 pts)
- **Incorrect**: `Required`, `STRONG`, `high`

### Override Confidence Levels (`OverrideConfidence`)
- Allowed PascalCase values:
  - `Necessary`
  - `Likely Necessary`
  - `Probably Removable`
  - `Definitely Removable`

### Edge Confidence Levels (`StoryEdge.confidence`)
- Allowed lowercase values for unreleased / theatrical upcoming titles:
  - `confirmed`: Established by released content.
  - `strongly-implied`: Official marketing/trailers clearly demonstrate dependency.
  - `provisional`: Character/org appearance confirmed, story weight unconfirmed.

### Editorial Importance Metadata (`StoryEdge.editorialImportance`)
- Allowed lowercase values for Trailer Readiness Mode:
  - `primary`: Major narrative pillar (title, posters, trailers, main cast).
  - `secondary`: Prominent storyline/character with significant marketing focus.
  - `supporting`: Officially confirmed appearance or thematic setup without central focus.
  - `cameo`: Brief appearance or cameo (no recommendation edge created).


---

## 2. Edge Creation & Authoring Standards

1. **Maximum Narrative Value & Editorial Completeness Optimization**:
   - Do **NOT** optimize for prerequisite minimization or arbitrary recommendation counts.
   - There is **NO minimum** and **NO maximum** count quota.
   - Optimize for **Editorial Completeness**: Recommend every title that substantially enriches the viewing experience, emotional investment, character development, or narrative payoff of the target.
   - **Narrative Value Non-Propagation**: Narrative importance must **NEVER** automatically propagate indefinitely down graph paths. Evaluate unique value for *this* target at every hop.
   - **Dependency Locality & Supersession**: Prefer nearest meaningful narrative sources. Relegate distant ancestors whose value is absorbed by later titles.
   - Do **NOT** add edges solely because graph paths exist; every edge must satisfy [EDITORIAL_POLICY.md Section 1 & Section 4](file:///c:/web/EDITORIAL_POLICY.md).
   - Large crossovers (*Avengers: Endgame*, *Secret Wars*) naturally produce larger recommendation sets; standalone titles (*Shang-Chi*) naturally produce concise sets. Both are valid editorial outcomes.

2. **Directionality**: Edges always point from **prerequisite / source** to **target / consumer**.
   - Example: `Iron Man` $\rightarrow$ `The Avengers` (Source: `mcu-ironman`, Target: `mcu-avengers`).

3. **Symmetry**: Never create bi-directional edges between the same two nodes unless explicit chronological feedback exists.

---

## 3. Override Guidelines

- Keep `src/data/editorialOverrides.ts` free of temporary derived flags.
- Follow the **Phase 2.5 Subsumption Protocol** documented in `ARCHITECTURE.md` before deleting any override.

---

## 4. Editorial Evidence Quality Checklist (Unique Narrative Value)

Every `recommendationEvidence` entry (`shortReason` and `detailedReasons`) must answer: **"What unique experience does this movie add before the target?"**

Contributors evaluate every edge using the **7 Narrative Value Dimensions**:

1. **Plot Consequence**: What major narrative event carries directly into the target title?
2. **Character Consequence**: Which specific character arc or transformation continues into the target?
3. **Relationship Consequence**: How does a key bond, romance, rivalry, or team dynamic pay off in the target?
4. **Emotional Consequence**: Does the target deliver emotional payoff from prior loss, betrayal, or sacrifice?
5. **World Consequence**: What lasting change to the geopolitical or cosmic world state enriches the target?
6. **Artifact / Technology Consequence**: How does a key object or technology set up the target?
7. **Narrative Callback Value**: What important thematic callbacks or payoffs are unlocked in the target?

#### Evidence Writing & Wording Rules:
- **Forbidden Buzzwords**: Avoid generic words like `background`, `context`, `origin`, and `world building`.
- **Required Explanation Style**: Explain **why this movie matters**, **what changes**, **what relationships continue**, and **what emotional payoff returns**.

#### Litmus Test Question:
> *"If I skip this movie, what meaningful narrative experience will I lose?"*
> • If *"Nothing important"* $\rightarrow$ Relegate to **Safe to Skip** or **Extra Context**.
> • If *"A meaningful emotional, character, plot, relationship, or world payoff"* $\rightarrow$ Deserves **Recommended**.

#### Application Examples:
- *Captain America: Civil War* $\rightarrow$ *Spider-Man: Brand New Day*: Explains Peter's original MCU recruitment and superhero ethos taught by Tony Stark.
- *Avengers: Endgame* $\rightarrow$ *Spider-Man: Brand New Day*: Delivers the emotional climax of Tony Stark's sacrifice and post-Blip world dynamics.
- *Doctor Strange* $\rightarrow$ *No Way Home*: Sets up multiversal magic spell consequences and Peter's tragic moral choice.

---

## 5. Trailer Readiness Mode Edge Authoring Guidelines (Upcoming / Theatrical)

When authoring edges targeting upcoming or theatrical titles (`status: "upcoming" | "released-awaiting-review"`):

1. **Target-Focused Objective**:
   - Edges MUST optimize for **Maximum Viewer Readiness**.
   - Every incoming edge MUST answer: *"What officially confirmed character, team, organization, world-state, or storyline does the viewer need to appreciate before watching this new release?"*

2. **Source Grounding Requirement**:
   - Edge `sourceType` MUST be one of: `"official-cast"`, `"official-trailer"`, `"official-synopsis"`, `"editorial"`.
   - Never use speculative sources (leaks, rumors, fan wikis).

3. **Confidence Level Assignment**:
   - Tag edge `confidence` as `"provisional"` for upcoming cast/team setups, `"strongly-implied"` for trailer-confirmed setups, or `"confirmed"` for released prerequisites.

4. **Pre-OTT Presentation Consolidation**:
   - For pre-OTT titles (`status: "upcoming" | "released-awaiting-review"`), non-essential categories (Recommended + Extra Context) are consolidated in presentation into **Additional Recommended Viewing**.
   - Upon OTT release, full 3-tier categorization (Must Watch, Recommended, Extra Context) is automatically restored.

5. **Event Film Curation Standards**:
   - For Event Films (*Avengers: Doomsday*, *Avengers: Secret Wars*, *Deadpool & Wolverine*), apply the 5 Coverage Principles (Franchise, Character, Team, Organization, World-State).
   - Event Film recommendation sets naturally expand across participating universes to achieve **Maximum Narrative Readiness**.

6. **Lifecycle State Transition**:
   - Upon OTT release, run the **Canonical Review Evolution Protocol**: convert trailer readiness edges into canonical graph edges or downgrade/remove non-essential setups.

---

## 6. Narrative Chapter Authoring & Experience Evidence Guidelines

1. **Chaptering Rules**:
   - Group recommendations into 5 narrative chapters (Direct Story, Character Journeys, Team Assemblies, World Events, Legacy Stories).
   - Ensure the recommendation sequence flows naturally as a story journey rather than a technical prerequisite list.

2. **Experience-Focused Wording**:
   - Describe what the viewer **gains emotionally, character-wise, or narratively**.
   - Prohibit raw plot summaries. Focus on **earned payoffs**, **character growth**, and **world appreciation**.

3. **Natural Cross-Franchise Interleaving**:
   - Interleave cross-franchise recommendations chronologically and narratively rather than grouping by franchise silos.


