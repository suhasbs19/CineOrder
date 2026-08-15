# CineOrder Global Editorial Policy & Curation Guidelines

**Version**: `2.0-narrative-experience` | **Effective**: `2026-08-07` | **Applies To**: All Knowledge Graph Franchises

---

## 1. Core Editorial Philosophy — Narrative Experience Platform

CineOrder's goal is to help viewers watch cinematic universes for **maximum narrative enjoyment and rich storytelling experience**.

CineOrder has evolved from a *Minimal Prerequisite Platform* into a **Narrative Experience Recommendation Platform**.

### The Guiding Question
Instead of asking:
> *"What is the minimum required to understand this movie?"*

CineOrder contributors ask:
> *"What should someone watch to get the richest narrative experience before this movie?"*

Understanding alone is no longer the objective. **Narrative enjoyment is the objective.**

### The Maximum Narrative Value Principle
> **Maximum Narrative Value Principle**: Recommend every title that meaningfully improves the viewing experience of the target.
> A recommendation is justified whenever it significantly contributes to one or more of:
> • Plot understanding
> • Character development
> • Emotional payoff
> • Relationship development
> • World-state evolution
> • Major consequences
> • Important callbacks
>
> A title does NOT need to be strictly required. If it substantially improves the viewing experience, it deserves recommendation.

### The Unique Narrative Value Principle
> **Unique Narrative Value Principle**: A movie should ONLY be recommended if it contributes meaningful narrative value that is not already substantially provided by another recommended title.
>
> Recommendations must maximize narrative enjoyment while eliminating redundant recommendations. Quality over quantity is strictly enforced.

### The Narrative Satisfaction Principle
> **Narrative Satisfaction Principle**: The goal of CineOrder is to answer: *"What should I watch so that this movie delivers its maximum narrative, emotional, and thematic impact?"*
>
> A recommendation list is successful when viewers feel fully prepared for the target movie, experiencing every major emotional moment, character decision, relationship, and callback as **earned**.

### The Editorial Excellence Standard
> **Editorial Excellence Standard**: Every recommendation list must answer: *"If an experienced film editor recommended these movies to a first-time viewer, would the recommendation feel complete, intentional, and satisfying?"*
>
> If not, contributors **improve the Knowledge Graph**, never the engine.

### The Editorial Completeness Principle
> **Editorial Completeness Principle**: CineOrder does NOT optimize for recommendation count. CineOrder optimizes for **editorial completeness**.
>
> There is **NO minimum**. There is **NO maximum**.
> Every recommendation must earn its place through unique narrative value. Every recommendation that earns its place should remain.
> Recommendation count is an **editorial outcome**, never an editorial objective or constraint.

### Narrative Value Propagation Policy
> **Narrative Value Propagation Policy**: Narrative importance must **NEVER** automatically propagate indefinitely down graph paths.
>
> Each edge represents editorial value **only** between its direct source and target. Narrative value must be re-evaluated at every hop. Graph connectivity alone must never justify a recommendation.

### The Supersession Principle
> **Supersession Principle**: Later stories may absorb the narrative value of earlier stories. When this occurs, earlier distant recommendations weaken naturally.
>
> *Example*: Tony Stark's mentorship is fully experienced through *Civil War*, *Homecoming*, *Far From Home*, and *Endgame*. Therefore, *Iron Man* is absorbed and relegated to **Extra Context** / **Safe to Skip** for *Brand New Day*.

### The Dependency Locality Principle
> **Dependency Locality Principle**: Recommendations prefer the nearest meaningful narrative source. Do not recommend distant ancestors if a later title delivers the relevant experience.
>
> *Example*: *Echo* $\rightarrow$ *Born Again* $\rightarrow$ *Brand New Day*. If *Brand New Day* depends on *Born Again*, recommend *Born Again*. Do **NOT** automatically recommend *Echo* unless *Echo* independently enriches *Brand New Day*.

### Canonical Review Inheritance Re-evaluation
When OTT/home release review occurs, contributors must re-evaluate every inherited recommendation and ask:
> *"Does this recommendation still contribute unique value after seeing the completed story?"*
> • If **NO**: Downgrade or remove edge.
> • Inherited value alone is **insufficient** to preserve a recommendation.

### Prohibited Editorial Practices
Contributors must NEVER:
- ✗ **Limit recommendations** to a predefined number or quota.
- ✗ **Inflate recommendations** to artificially appear comprehensive.
- ✗ **Remove editorially justified recommendations** merely to make a list shorter.
- ✗ **Keep recommendations** solely because graph connectivity or traversal paths exist.

### Crossover vs. Standalone Dynamic Curation
- **Large Crossover Events** (*Avengers: Endgame*, *Avengers: Secret Wars*, *Avengers: Doomsday*, *Justice League*): Naturally produce larger recommendation sets. This is expected and editorially desirable.
- **Standalone Stories** (*Iron Man*, *Shang-Chi*, *Moon Knight*): Naturally produce concise recommendation sets. The list remains small if additional titles provide no unique narrative value.
- *Neither outcome is superior*: Recommendation size must reflect the narrative requirements of the story.

---

## 3. Upcoming & Theatrical Editorial Policy v2.0 — Trailer Readiness Mode

CineOrder distinguishes between two operational curation modes based on a title's release and review lifecycle:

1. **Mode A — Trailer Readiness Mode (Upcoming & Theatrical Titles)**
2. **Mode B — Canonical Editorial Review Mode (Post-OTT / Home Media Titles)**

---

### Mode A — Trailer Readiness Mode (Upcoming & Theatrical)

#### Scope
Applies to:
- Upcoming movies and series
- Titles currently in theatrical release
- Titles that have **NOT** completed Canonical Review (`status: "upcoming" | "released-awaiting-review"`)

#### Editorial Objective
> **Objective**: Prepare viewers for every officially confirmed major character, team, organization, world-state, and ongoing storyline before watching the new movie.
>
> Because the complete story is unreleased or awaiting canonical review, CineOrder optimizes for **Maximum Viewer Readiness**, NOT **Maximum Canonical Accuracy**.

#### Curation Criteria for Trailer Readiness Mode
Provisional recommendations may be justified under any of the following continuity pillars when grounded in official material:
- **Character Continuity**: Returning character officially confirmed (e.g. Shang-Chi confirmed $\rightarrow$ Recommend *Shang-Chi and the Legend of the Ten Rings*).
- **Team Continuity**: Fantastic Four officially confirmed $\rightarrow$ Recommend *The Fantastic Four: First Steps*.
- **Legacy Character Continuity**: Returning legacy heroes or villains (e.g. Wolverine $\rightarrow$ Recommend *Logan* or *Deadpool & Wolverine*).
- **Organization Continuity**: TVA, S.H.I.E.L.D., Fantastic Four, Young Avengers, Thunderbolts, etc.
- **World-State Continuity**: Multiverse disruptions, government legislation, political shifts, cosmic changes.
- **Storyline Continuity**: Official trailers indicating ongoing conflicts, unresolved cliffhangers, or continuing storylines.

#### Official Source Hierarchy
Contributors MUST restrict evidence to the following official hierarchy:
1. **Released MCU content**
2. **Released Disney+ MCU content**
3. **Official Marvel Studios trailers**
4. **Official synopses**
5. **Official cast announcements**
6. **Official Marvel Studios press releases**
7. **Official Marvel Studios interviews**

> **Strictly Prohibited**: Leaks, rumors, Reddit posts, Twitter/X speculation, YouTube fan theories, fan wikis, and insider reports.

#### Allowed Confidence Levels
Trailer Readiness edges MUST be tagged with one of:
- `confirmed`: Fully verified by released content or official synopsis.
- `strongly-implied`: Clearly demonstrated in official trailers or official press statements.
- `provisional`: Based on official cast announcements or upcoming phase roadmap.

---

### Mode B — Canonical Editorial Review Mode (Post-OTT / Home Media Release)

#### Scope
Applies after:
- Feature film OTT / digital / Blu-ray release
- Full series season conclusion
- Completion of formal **Canonical Review** (`status: "canonical"`)

#### Editorial Objective
> **Objective**: Determine which recommendations actually mattered after watching the completed narrative.
>
> The completed narrative becomes the **only authoritative source of truth**. Trailer-based assumptions are superseded.

#### Canonical Review Evolution Protocol
Following Canonical Review, recommendations may:
- **Remain** or **Upgrade** (if the completed film proves deeper narrative dependency).
- **Downgrade** or **Disappear** (if trailer-implied setups turned out to be minor cameos or non-essential callbacks).
- **New recommendations may appear** (for unteased plot twists, secret cameos, or unexpected narrative prerequisites).

---

### Lifecycle Evolution Example: Avengers: Doomsday

#### Phase 1: Pre-OTT / Trailer Readiness Mode (`mcu-doomsday`)
*Objective*: Maximize viewer readiness before release.
- 🚨 **Must Watch**: *The Fantastic Four: First Steps* (`provisional` - team transition)
- 👍 **Recommended**: *Loki* (`confirmed` - Yggdrasil tree), *Doctor Strange 2* (`confirmed` - incursions), *Thunderbolts** (`provisional` - Phase 5 ensemble), *Shang-Chi* (`provisional` - confirmed appearance), *Deadpool & Wolverine* (`provisional` - multiversal crossover)
- 💡 **Extra Context**: *Captain America: Brave New World* (`provisional`), *Avengers: Endgame* (`confirmed`), *Logan* (`provisional`), *Spider-Man: No Way Home* (`confirmed`)

#### Phase 2: Post-OTT / Canonical Editorial Review Mode (`mcu-doomsday`)
*Objective*: Refine graph to reflect completed story dependencies.
- Recommendations are re-evaluated against the completed narrative.
- Non-essential trailer setups are downgraded to *Extra Context* or *Safe to Skip*.
- Crucial thematic/plot dependencies are locked into the permanent Knowledge Graph topology.

---

### Section 3.4 — Editorial Importance Framework v1.0

Trailer Readiness Mode intentionally recommends titles broadly because the complete narrative is unreleased. However, **NOT every officially confirmed character, team, organization, or storyline possesses identical narrative weight**.

CineOrder introduces **Editorial Importance** (`editorialImportance`) as an independent metadata dimension on graph edges.

#### Allowed Values & Definitions

1. **`primary`**: Official marketing indicates this character, team, organization, or storyline is a **major narrative pillar** of the movie.
   - *Marketing presence*: Features in title, posters, multiple trailers, official synopsis, cast announcements.
   - *Default Category*: **Must Watch** or **Recommended** (depending on unique narrative value).
   - *Examples*: Fantastic Four in *Doomsday*, Doctor Doom in *Doomsday*, Loki in *Doomsday* (multiverse focus).

2. **`secondary`**: Clearly important with significant marketing presence and meaningful story relevance.
   - *Marketing presence*: Prominently featured in secondary trailers or official press announcements.
   - *Default Category*: **Recommended** or **Extra Context**.
   - *Examples*: Thunderbolts* in *Doomsday*, Captain America (Sam Wilson) in *Doomsday*, Spider-Man in *Doomsday*.

3. **`supporting`**: Officially confirmed appearance or thematic setup, but official material does not establish central narrative focus.
   - *Marketing presence*: Confirmed in cast list or single trailer shot.
   - *Default Category*: **Extra Context**.
   - *Examples*: Shang-Chi in *Doomsday*, Deadpool & Wolverine in *Doomsday*.

4. **`cameo`**: Officially confirmed appearance only, with no evidence that prior story materially enriches understanding of the target.
   - *Marketing presence*: Minor cameo announcement or brief trailer glimpse.
   - *Default Category*: **Safe to Skip** (no recommendation edge created unless future evidence upgrades importance).

---

#### Editorial Decision Matrix

| Editorial Importance | Narrative Value | Recommended Category |
| :--- | :--- | :--- |
| **`primary`** | High | 🚨 **Must Watch** / 👍 **Recommended** |
| **`secondary`** | High / Moderate | 👍 **Recommended** |
| **`supporting`** | Moderate / Contextual | 💡 **Extra Context** |
| **`cameo`** | Low / Brief | 🟢 **Safe to Skip** (No Edge) |

---

#### Curation Scope Across Entities

Contributors evaluate Editorial Importance independently across:
- **Character Importance**: Returning heroes, villains, legacy characters, or multiversal variants evaluated individually.
- **Team Importance**: Fantastic Four, Thunderbolts, Young Avengers, Guardians, Avengers evaluated independently.
- **Organization Importance**: TVA, S.H.I.E.L.D., Damage Control, SWORD, Ten Rings, Daily Bugle.
- **Storyline Importance**: Incursions, Multiverse collapse, Mutant emergence, Superhero registration, Celestial emergence. (Sometimes the overarching storyline carries higher importance than any individual character).

---

#### Confidence vs. Editorial Importance Principle

> **Confidence vs. Importance Principle**:
> - **Confidence** answers: *"How certain are we this relationship exists?"* (`confirmed` | `strongly-implied` | `provisional`)
> - **Editorial Importance** answers: *"How important does official material indicate this relationship is?"* (`primary` | `secondary` | `supporting` | `cameo`)
>
> These dimensions are completely independent. An edge can be `confidence: "confirmed"` but `editorialImportance: "supporting"` (e.g. Marvel officially confirmed the appearance, but current evidence shows it is supporting rather than central).

---

#### Dynamic Evolution Protocol

Editorial Importance is **dynamic** during the title lifecycle:
- Upon OTT/Home Media Release, every provisional `editorialImportance` is re-evaluated against the completed narrative.
- Edges may evolve: `primary` $\rightarrow$ `secondary` $\rightarrow$ `supporting` $\rightarrow$ `removed`, or `supporting` $\rightarrow$ `primary` if the completed film reveals unexpected central importance.

---

### Section 3.5 — Temporary Recommendation Consolidation Policy (Upcoming & Pre-OTT Movies)

#### Objective
To provide a simpler, more honest presentation before release, CineOrder consolidates non-essential recommendation categories for movies that have not completed Canonical Review.

Before OTT/Home Media release, CineOrder cannot determine with certainty which recommendations will ultimately prove to be *Recommended* versus *Extra Context*. Rather than forcing artificial distinctions prior to release, CineOrder temporarily merges both categories into a single presentation group.

#### Scope
Applies ONLY when `reviewStatus == "upcoming" | "released-awaiting-review"`.

Does NOT apply when `reviewStatus == "canonical"`.

#### Presentation Rules
For pre-OTT titles:
1. **🚨 Must Watch**: Kept separate as a distinct category for direct, high-importance prerequisites.
2. **🎬 Additional Recommended Viewing**: Merges 🟠 **Recommended** + 🔵 **Extra Context** into a single presentation section.

> **Presentation Purpose**:
> *"These titles prepare viewers for officially confirmed characters, teams, organizations, world states, and ongoing storylines before release."*

#### Ordering & Readiness Consistency
- Internal ordering within **Additional Recommended Viewing** follows Editorial Importance (`primary` $\rightarrow$ `secondary` $\rightarrow$ `supporting`) and `relevanceScore`.
- Story Readiness percentage (`Must Watch + Additional Recommended Viewing = 100%`) remains unchanged.

#### Post-Canonical Review Restoral
When `reviewStatus == "canonical"` (following OTT/digital release and completed Canonical Review), CineOrder automatically restores the standard 3-tier presentation:
- 🚨 **Must Watch**
- 🟠 **Recommended**
- 🔵 **Extra Context**

---

### Section 3.6 — Event Film Editorial Policy v1.0 (Saga Finale & Crossover Framework)

#### Objective
To establish specialized editorial curation standards for large crossover events, phase finales, and saga finales (*Avengers: Doomsday*, *Avengers: Secret Wars*, *Deadpool & Wolverine*, *Avengers: Endgame*).

Standalone films and major crossover event films have fundamentally different narrative goals. The recommendation system MUST naturally adapt its recommendation scale according to narrative scope without modifying the frozen recommendation engine.

#### Event Film Definition
An **Event Film** is a title satisfying one or more of the following criteria:
- Multiple franchises converge (e.g. MCU + X-Men Universe + Sony Spider-Verse)
- Multiple hero teams assemble (e.g. Avengers + Fantastic Four + Thunderbolts)
- Multiple ongoing storylines merge into a central conflict
- Multiple universes collide (Multiversal Incursions / Battleworld)
- Saga finale or Phase finale
- Universe-wide or multiverse-wide consequences

#### Dual Recommendation Scales

1. **Focused Narrative Journey (Standalone Titles)**:
   - *Scope*: Character origins and standalone adventures (*Iron Man*, *Shang-Chi*, *Moon Knight*).
   - *Outcome*: Concise, highly focused recommendation journeys.

2. **Event Narrative Journey (Event Titles)**:
   - *Scope*: Saga finales and multiversal crossover events (*Avengers: Doomsday*, *Secret Wars*).
   - *Objective*: Optimize for **Maximum Narrative Readiness**, NOT **Minimum Prerequisite Count**.
   - *Outcome*: Broad, multi-franchise recommendation journeys reflecting the narrative scale of the event.

> **Editorial Principle**: CineOrder does **NOT** reduce recommendations for Event Films merely to keep a list short. The recommendation list MUST reflect the full narrative scale of the event.

---

#### The 5 Coverage Principles for Event Films

When authoring edges for Event Films, contributors evaluate coverage across 5 pillars:

1. **Franchise Coverage Principle**:
   When official marketing confirms multiple participating franchises, each franchise MUST receive appropriate representative recommendations. Do NOT artificially restrict recommendations to a single universe.
   - *Example*: *Avengers: Doomsday* confirms MCU + Fantastic Four + X-Men Universe + TVA $\rightarrow$ Graph naturally includes representative titles from each franchise.

2. **Character Coverage Principle**:
   If a major returning hero, villain, or legacy character is officially confirmed, recommend the strongest prior story for that character.
   - *Wolverine* $\rightarrow$ *Logan* or *Deadpool & Wolverine*
   - *Shang-Chi* $\rightarrow$ *Shang-Chi and the Legend of the Ten Rings*
   - *Loki* $\rightarrow$ *Loki*
   - *Fantastic Four* $\rightarrow$ *The Fantastic Four: First Steps*

3. **Team Coverage Principle**:
   Recommend prior stories establishing participating hero teams (Fantastic Four, Thunderbolts, Avengers, Guardians, Young Avengers, Defenders, X-Men).

4. **Organization Coverage Principle**:
   Recommend prior stories introducing key organizations (TVA, S.H.I.E.L.D., Ten Rings, Hand, Damage Control) when officially relevant.

5. **World-State Coverage Principle**:
   Recommend titles establishing multiversal incursions, political landscapes, cosmic threats, or government legislation.

---

#### Lifecycle Evolution Protocol for Event Films

- **Pre-OTT (Trailer Readiness Mode)**: Prioritizes **Viewer Readiness**. Broad, multi-franchise recommendations are justified by officially confirmed character, team, organization, or storyline participation.
- **Post-OTT (Canonical Editorial Review Mode)**: After digital/Blu-ray release, every provisional recommendation is re-evaluated against the completed film. Non-essential cameo setups are downgraded or removed, while core narrative dependencies are locked into permanent graph topology.

---

## 4. CineOrder Editorial Experience Framework v2.0 — Narrative Journey Authoring Standard

### Editorial Mission
CineOrder is no longer simply answering *"What should I watch?"*.
CineOrder is answering:
> **"What viewing journey gives the richest narrative experience before this title?"**

Every recommendation MUST feel intentional. Every recommendation MUST tell part of a larger story.

---

### The Recommendation Journey Principle
> **Recommendation Journey Principle**: Every movie page MUST read like a professionally curated viewing guide—not a database lookup, graph traversal output, or prerequisite list.
>
> Recommendations are organized into thematic **Narrative Chapters** that create a cohesive, immersive viewing flow.

---

### Narrative Chapters System

Recommendations are grouped into 5 distinct narrative chapters:

1. 📖 **Direct Story Continuation**:
   - Primary direct sequels and core storyline predecessors (*Homecoming* $\rightarrow$ *Far From Home* $\rightarrow$ *No Way Home* $\rightarrow$ *Brand New Day*).
2. 👤 **Character Journeys**:
   - Prior stories establishing major returning character growth, transformations, or arcs (*Loki*, *Shang-Chi*, *Wolverine*, *Fantastic Four*).
3. 🛡️ **Team & Hero Assemblies**:
   - Ensemble origin and team-up titles (*The Fantastic Four: First Steps*, *Thunderbolts**, *The Avengers*).
4. 🌐 **World & Multiverse Events**:
   - Universal or multiversal events altering geopolitical or cosmic landscapes (*Infinity War*, *Endgame*, *Multiverse of Madness*, *Brave New World*).
5. 🏛️ **Legacy Stories & Enrichment**:
   - Legacy hero sagas and thematic callback foundations (*Logan*, *X-Men*, *Iron Man*, *Captain America: The First Avenger*).

---

### Experience-Focused Evidence Rule
> **Experience-Focused Evidence Rule**: Every `recommendationEvidence` entry MUST answer: **"What experience does the viewer gain?"** Never merely *"What happens?"*.
>
> - ❌ **Bad (Plot Summary)**: *"Captain America: Civil War introduces Spider-Man."*
> - ✅ **Good (Viewer Experience)**: *"Watching this first lets the viewer experience Peter Parker's first step into the Avengers world, making his later growth feel earned."*

---

### Cross-Franchise Natural Interleaving Principle
Do **NOT** segregate recommendations by franchise in isolated buckets. Interleave cross-franchise recommendations naturally by narrative flow and release continuity.
- *Example (Avengers: Doomsday Journey Flow)*:
  *Fantastic Four: First Steps* $\rightarrow$ *Loki* $\rightarrow$ *Deadpool & Wolverine* $\rightarrow$ *Logan* $\rightarrow$ *Thunderbolts** $\rightarrow$ *Shang-Chi* $\rightarrow$ *Avengers: Endgame*.

---

### The Viewer Experience Litmus Test
Before approving a recommendation journey, contributors MUST ask:
> *"If someone watched this exact journey, would they finish the target movie feeling that every major character, callback, emotional beat, and story development felt earned?"*
>
> If NOT $\rightarrow$ **Improve the Knowledge Graph**, NEVER the engine.

### The 10-Dimension Editorial Quality Rubric
Every recommendation is evaluated across 10 dimensions:
1. **Narrative Necessity**: Does this movie genuinely improve understanding?
2. **Unique Narrative Value**: Does it provide something another recommendation does not?
3. **Emotional Payoff**: Does it strengthen emotional moments in the target?
4. **Character Continuity**: Does it meaningfully continue a character's journey?
5. **Relationship Continuity**: Does it deepen important relationships?
6. **World Continuity**: Does it explain important changes to the world?
7. **Legacy Continuity**: Does it improve appreciation of returning heroes or villains?
8. **Narrative Callback Value**: Does it make callbacks feel earned?
9. **Recommendation Satisfaction**: Would viewers be disappointed if this recommendation were removed?
10. **Editorial Confidence**: Could another experienced MCU editor reasonably reach the same conclusion?

### Recommendation Evaluation & Deduplication Protocol
For every potential recommendation edge, contributors evaluate:
1. **What unique understanding does this movie provide?**
2. **Is that understanding already covered by another Recommended movie?**
   - *If YES*: Downgrade to *Extra Context* or *Safe to Skip*.
   - *If NO*: Retain recommendation.

*Deduplication Example*:
- *Iron Man* $\rightarrow$ Tony Stark origin.
- *Civil War*, *Homecoming*, *Infinity War*, *Endgame* $\rightarrow$ Tony & Peter mentorship arc and emotional sacrifice.
- *Evaluation for Spider-Man: Brand New Day*: Does *Iron Man* provide unique value for Peter Parker's journey? **No**. Tony's mentorship is fully represented by later recommended films.
- *Decision*: Downgrade *Iron Man* to **Extra Context**.

### The Returning Character Rule
> **Returning Character Rule**: Character appearance alone is **never** sufficient for a *Must Watch* or *Recommended* classification.
> Contributors must ask: *"Does the previous story meaningfully enrich this specific appearance in the target?"*
> • **If YES**: Minimum *Extra Context*.
> • **If NO**: Relegate to *Safe to Skip* or do not add edge.
>
> *Baseline Character Examples*:
> • Bruce Banner appears $\rightarrow$ *The Incredible Hulk* $\rightarrow$ **Extra Context**
> • Frank Castle appears $\rightarrow$ *The Punisher* $\rightarrow$ **Extra Context**
> • Matt Murdock appears $\rightarrow$ *Daredevil* $\rightarrow$ **Extra Context**
> *(Unless Canonical Review after release proves a deeper direct narrative continuation).*

### Recommendation Inflation Prevention Rule
Do **NOT** recommend titles simply because:
- ✗ They are connected in the universe graph.
- ✗ A graph traversal path exists.
- ✗ A character makes a cameo appearance.
- ✗ They share the same protagonist.

Instead, recommend titles because they **uniquely improve**:
- ✓ Plot continuity
- ✓ Character transformation
- ✓ Relationship payoff
- ✓ Emotional resonance
- ✓ World evolution
- ✓ Narrative callbacks

---

## 2. Recommendation Category Standards

| Category | Narrative Weight | Threshold | Description |
|---|---|---|---|
| **Must Watch** | Essential Knowledge | $\ge 95$ / `required` | The target explicitly assumes knowledge from this title. Missing it causes significant confusion. |
| **Recommended** | High Narrative Value *(Primary Category)* | $\ge 78$ / `strong` | Watching this title significantly improves emotional investment, character arcs, relationships, or narrative payoff, even if the target remains understandable. Must provide **Unique Narrative Value**. |
| **Extra Context** | Enjoyable Context | $\ge 50$ / `moderate` | Provides enjoyable additional context (e.g. origin stories, optional lore, supporting character history, expanded world-building). |
| **Safe To Skip** | Low Value | $< 50$ / `weak` | Adds little meaningful narrative value to the target title viewing experience. |

---

## 3. Franchise Curation Policies

### Marvel Cinematic Universe (MCU)
- **Complete Narrative Journey**: Recommend complete character journey spines (e.g. Peter Parker's arc from *Civil War* through *No Way Home*) to maximize emotional payoff for future chapters like *Spider-Man: Brand New Day*.
- **Unique Value Curation**: Deduplicate redundant origins when later journey films fully represent the character relationship.
- **Character Arc Continuations**: Prioritize character transformation milestones and ensemble team-up impacts over bare plot prerequisites.
- **Multiverse Saga**: Multiversal lore projects are evaluated based on emotional payoff and character arc continuation.

### Star Wars Universe
- **Skywalker Saga Core**: The episodic films (Episodes I–IX) form the core narrative spine.
- **Mandoverse Interconnection**: Shows like *The Mandalorian*, *The Book of Boba Fett*, and *Ahsoka* recommend complete character journey chapters where arcs cross over to maximize emotional investment.
- **Animated Canon**: Key animated arcs (*The Clone Wars*, *Rebels*) transition to *Recommended* for live-action sequels (*Ahsoka*) to deliver full relationship and callback payoffs.

### DC Multiverse
- **Multiverse Isolation**: DC projects across distinct continuities remain isolated unless explicit crossover edges connect them.
- **Animated Movie Universe (DCAMU)**: Full character and relationship continuity across the 16-movie DCAMU arc.

### Wizarding World (Harry Potter)
- **Main Saga Priority**: *Harry Potter* 1–8 forms a linear narrative journey where every predecessor enriches character and emotional payoff.
- **Fantastic Beasts Prequels**: Prequel films serve as *Extra Context* for the main saga, providing world-building and wizarding lore.

### Middle-earth (Lord of the Rings)
- **Legendarium Spine**: *The Hobbit* trilogy and *The Lord of the Rings* trilogy form the primary narrative spine.
- **Second Age Lore**: Projects like *The Rings of Power* are curated as antecedent lore (*Extra Context*) relative to Third Age adaptations.

---

## 4. Recommendation Evidence Quality Standard (Unique Narrative Value)

Every recommendation explanation (`shortReason` and `detailedReasons`) must answer: **"What unique experience does this movie add before the target?"**

Contributors evaluate every edge using the **7 Narrative Value Dimensions**:

1. **Plot Consequence**: What major narrative event carries directly into the target title?
2. **Character Consequence**: Which specific character arc or transformation continues into the target?
3. **Relationship Consequence**: How does a key bond, romance, rivalry, or team dynamic pay off in the target?
4. **Emotional Consequence**: Does the target deliver emotional payoff from prior loss, betrayal, or sacrifice?
5. **World Consequence**: What lasting change to the geopolitical or cosmic world state enriches the target?
6. **Artifact / Technology Consequence**: How does a key object or technology set up the target?
7. **Narrative Callback Value**: What important thematic callbacks or payoffs are unlocked in the target?

#### Recommendation Justification Rule ("What the Viewer Gains")
Every recommendation explanation must explain **NOT** *"What happens"*, but **"What the viewer gains"**.

- ✗ **Bad (Plot summary)**: *"Civil War introduces Spider-Man."*
- ✓ **Good (Narrative gain)**: *"Watching this first allows the viewer to experience Peter Parker's first meeting with Tony Stark, making their later mentor-student relationship emotionally meaningful throughout the Infinity Saga."*

#### Evidence Writing & Wording Rules:
- **Forbidden Buzzwords**: Avoid generic words like `background`, `context`, `setup`, `origin`, `introduces`, and `world building`.
- **Preferred Value Vocabulary**: Explain **why this movie matters**, **what changes**, **relationship continuation**, **emotional payoff**, **lasting consequences**, **returning conflict**, and **earned callbacks**.

*Litmus Test Question*:
> *"If I skip this movie, what meaningful narrative experience will I lose?"*
> • If *"Nothing important"* $\rightarrow$ Must **NOT** remain Recommended.
> • If *"A meaningful emotional, character, plot, relationship, or world payoff"* $\rightarrow$ Deserves place as Recommended.

---

## 9. Upcoming & Theatrical Release Editorial Policy

### 9.1 Purpose
CineOrder supports both released titles and upcoming theatrical releases.

Because upcoming titles have incomplete narrative information, recommendations must be based only on officially confirmed evidence and remain clearly distinguishable from fully validated recommendations.

This policy ensures the Knowledge Graph remains editorially accurate while avoiding speculation.

### 9.1 Evidence Hierarchy
Editorial decisions must follow the following order of authority:
1. **Released Film / Series**
2. **Official Disney+ Series**
3. **Official Trailer**
4. **Official Synopsis**
5. **Marvel Studios Interviews / Press Releases**

The following sources **MUST NEVER** be used:
- ❌ Leaks
- ❌ Rumors
- ❌ Insider Reports
- ❌ Reddit
- ❌ Twitter/X
- ❌ YouTube Theory Videos
- ❌ Fan Wikis

### 9.2 Upcoming Edge Confidence
Every graph edge for an unreleased title must specify one of the following confidence levels:

- **`confirmed`**: Used when the dependency is established by released content.
  *Example*: `Captain America: Civil War` $\rightarrow$ `Spider-Man: Homecoming`
- **`strongly-implied`**: Used when official trailers or official synopses clearly demonstrate a narrative dependency.
  *Example*: `Spider-Man: No Way Home` $\rightarrow$ `Spider-Man: Brand New Day` (The official trailer confirms *Brand New Day* continues Peter Parker's post-memory-wipe status quo).
- **`provisional`**: Used when a character or organization is confirmed to appear, but narrative importance has not yet been established.
  *Example*: `Punisher` $\rightarrow$ `Spider-Man: Brand New Day` (Frank Castle appears, but his story importance remains unknown).

### 9.3 Recommendation Categories
- **Must Watch**: Allowed ONLY if official material explicitly shows the target assumes prior knowledge. Character appearance alone is NOT sufficient.
- **Recommended**: Allowed when official material demonstrates meaningful continuation of:
  - Plot
  - Character Arc
  - Emotional Arc
  - World State
  - Major Conflict
- **Extra Context**: Used when the source enriches understanding without being necessary.
  *Examples*:
  - `Iron Man` $\rightarrow$ `Avengers: Age of Ultron`
  - `The Incredible Hulk` $\rightarrow$ `Spider-Man: Brand New Day`
- **Safe To Skip**: Used when no meaningful narrative dependency has been demonstrated.

### 9.4 Trailer Modeling Rules
Official trailers **MAY** justify:
- ✓ New graph edges
- ✓ Edge strength adjustments
- ✓ Recommendation evidence authoring

Official trailers **MUST NOT** justify:
- ✗ Framework modifications
- ✗ Must Watch classification without explicit narrative dependency
- ✗ Speculative relationships

### 9.5 Post-Release Validation
Every `provisional` or `strongly-implied` edge must be re-evaluated immediately after theatrical release.

```text
  Official Trailer
         │
         ▼
  Graph Modeling
         │
         ▼
  Movie Release
         │
         ▼
  Editorial Knowledge Alignment
         │
         ▼
  [Keep | Modify | Remove]
```

### 9.6 OTT Validation & Canonical Review Supersession
Once the title becomes available for home viewing or streaming:
- Review the complete narrative.
- Validate every recommendation against the finished film.
- Update recommendation evidence where necessary.
- Remove provisional classifications.

> 🔒 **Canonical Review Supersession Rule**:
> Once a title has completed Canonical Review ([Section 10](file:///c:/web/EDITORIAL_POLICY.md#10-canonical-review-protocol)), all trailer-based assumptions are considered obsolete. The Knowledge Graph, recommendation evidence, edge strengths, and confidence levels must reflect the completed narrative.
> Trailer-based rationale should not remain unless it is also supported by the finished title.
> This establishes a single, unambiguous authoritative state post-review.

### 9.7 Editorial Lifecycle: Section 9 $\rightarrow$ Section 10 Transition
Governance covers the complete content lifecycle across Section 9 (provisional upcoming modeling) and Section 10 (canonical verification):

```text
  Announcement
        │
        ▼
  Official Sources
        │
        ▼
  Provisional Graph (Section 9)
        │
        ▼
  Theatrical Release
        │
        ▼
  Canonical Review (Section 10)
        │
        ▼
  Verified Knowledge Graph
        │
        ▼
  Regression & Comparison
        │
        ▼
  Stable Recommendation Platform
```

### 9.8 Editorial Principle
Upcoming recommendations should answer: **"What is officially known today?"**
Released recommendations should answer: **"What does the completed story actually require?"**

### 9.9 Zero Speculation Rule
CineOrder is an editorial recommendation platform—**not a prediction engine**.

No recommendation may rely on assumptions, speculation, or unreleased story details. If official evidence is insufficient, the graph should remain conservative until additional information becomes available.

### 9.10 Examples — Spider-Man: Brand New Day
- **Spider-Man: No Way Home** $\rightarrow$ **Must Watch**
  *Reason*: Official trailer confirms *Brand New Day* continues Peter's post-memory-wipe status.
- **Thunderbolts\*** $\rightarrow$ **Recommended**
  *Reason*: Official trailer indicates the current MCU superhero landscape continues into *Brand New Day*.
- **The Incredible Hulk** $\rightarrow$ **Extra Context**
  *Reason*: Bruce Banner appears in official marketing, but Hulk's origin is not required.
- **Punisher: One Last Kill** $\rightarrow$ **No Recommendation**
  *Reason*: Character appearance alone does not establish narrative dependency.

### Editorial Philosophy
Recommend only what is justified by official narrative evidence. When evidence is incomplete, prefer conservative recommendations over speculative ones.


---

## 10. Canonical Review Protocol

### 10.1 Objective & Section 9 Lifecycle Handoff
Implement a formal Canonical Review workflow for titles that transition from **theatrical/upcoming** ([Section 9](file:///c:/web/EDITORIAL_POLICY.md#9-upcoming--theatrical-release-editorial-policy)) to **fully reviewable** (typically after OTT/home release).

While Section 9 governs provisional trailer and marketing modeling, **Section 10 governs replacing those provisional assumptions with canonical, movie-verified knowledge**.

This protocol ensures CineOrder recommendations evolve through **Knowledge Graph refinement**, never through framework modifications. This is a governance and editorial workflow only.

### 10.2 Framework Status
CineOrder is operating under **`v1.0-framework-freeze`**.

The following modules remain **LOCKED**:
- Traversal Engine
- Recommendation Engine
- BFS Algorithms
- Narrative Scoring Engine
- Category Thresholds
- Recommendation Service
- DTO Pipeline
- Comparison Engine
- Editorial Knowledge Alignment Protocol

**Strict Enforcement**: No framework modifications are permitted.

### 10.3 Canonical Review Trigger
A Canonical Review begins when a title becomes fully reviewable.

Examples:
- ✓ OTT / Streaming release
- ✓ Home media release
- ✓ Internal editorial access to the complete finished title

The review is based on the **completed narrative**, NOT trailers or marketing assumptions.

### 10.4 Canonical Review Workflow
Every review follows the exact sequence:

```text
  Official Trailer
         │
         ▼
  Provisional Knowledge Graph
         │
         ▼
  Theatrical Release
         │
         ▼
  OTT / Full Narrative Available
         │
         ▼
  Canonical Review
         │
         ▼
  Knowledge Graph Refinement
         │
         ▼
  Editorial Knowledge Alignment
         │
         ▼
  Regression Suite
         │
         ▼
  Comparison Engine
         │
         ▼
  Merge
         │
         ▼
  Snapshot Update
```

### 10.5 Editorial Review Checklist
For the released title, review every incoming recommendation edge and answer:

1. **Is this recommendation still correct?**
2. **Should the recommendation category change?**
3. **Does the edge strength accurately reflect the completed story?**
4. **Does the relationship type remain appropriate?**
5. **Should recommendation evidence be updated?**
6. **Should the edge confidence change?**
7. **Should the edge be removed?**
8. **Is a new edge required?**

### 10.6 Recommendation Validation
For every incoming edge, evaluate using the **5-Consequence Editorial Standard**:

- ✓ **Plot Consequence**
- ✓ **Character Consequence**
- ✓ **World Consequence**
- ✓ **Artifact / Technology Consequence**
- ✓ **Emotional Consequence**

*Rule*: Do not invent consequences. Only include dimensions materially supported by the completed title.

### 10.7 Confidence Lifecycle
```text
  Trailer Modeling (confidence: strongly-implied)
                         │
                         ▼
  Canonical Review (confidence: confirmed)
```

*Disproven Evidence Rule*: If trailer evidence is disproven upon viewing the completed title, remove the edge or downgrade its recommendation category.

### 10.8 Editorial Evidence Refresh
Update:
- `recommendationEvidence.shortReason`
- `recommendationEvidence.detailedReasons`

to reflect the completed narrative. Trailer assumptions must be replaced with movie-verified editorial evidence.

### 10.9 Graph Changes Scope

**Allowed**:
- ✓ Add edges
- ✓ Remove edges
- ✓ Change relationship type
- ✓ Change edge strength
- ✓ Update recommendation evidence
- ✓ Update confidence level

**Not Allowed**:
- ✗ Framework changes
- ✗ Traversal changes
- ✗ BFS changes
- ✗ Recommendation algorithm changes
- ✗ Scoring changes

### 10.10 Validation Commands & Criteria
After every Canonical Review, run:

```bash
npx tsc --noEmit
npx tsx -e "import { validateReviewLifecycle } from './src/lib/reviewLifecycleValidator'; console.log(validateReviewLifecycle());"
npx tsx scripts/runEditorialComparison.ts
```

Verify:
- ✓ **Review Lifecycle Validator PASS**: Ensures pre-review titles rely strictly on trailer-based evidence and canonical titles have upgraded confidence tags.
- ✓ **Regression Suite PASS**: 0 breakage across existing benchmark titles.
- ✓ **Overall Accuracy**: Maintained or improved ($\ge 95.0\%$).
- ✓ **Average Drift**: Maintained or improved ($\le 0.15$).
- ✓ **Recommendation Categories**: Validated against verified story consequences.
- ✓ **Evidence Coverage**: 100% maintained.

### 10.11 Canonical Review CHANGELOG Record Format
Record every Canonical Review in the governance log following this structure:

```markdown
## Canonical Review — [Title Name]

Updated:
• X recommendation edges
• Y edge strengths
• Z new narrative relationships
• A recommendation evidence entries
• B confidence values

Result:
✓ Regression PASS
✓ Editorial Alignment Complete
```

### 10.12 Editorial Principle
Trailer-based recommendations represent the best available editorial understanding. Canonical Review replaces assumptions with verified narrative knowledge from the completed title.

The Knowledge Graph becomes progressively more accurate over time while the runtime framework remains permanently frozen.

### 10.13 Success Criteria
The Canonical Review process must ensure:
- ✓ Recommendations improve through Knowledge Graph refinement.
- ✓ The recommendation engine remains unchanged.
- ✓ Editorial evidence reflects the completed story.
- ✓ All updates are validated through the Editorial Knowledge Alignment Protocol and Regression Suite before merging.

---

## 11. Unique Narrative Value Audit Protocol

### 11.1 Purpose
The Unique Narrative Value Audit Protocol guarantees that every recommendation in the Knowledge Graph provides non-redundant, distinct story value for the target title viewing experience.

### 11.2 Audit Template
For every audited target title, contributors document:
- **Title**: Target movie/series name
- **Source Candidate**: Candidate recommendation title
- **Unique Narrative Value**: What distinct narrative/emotional contribution it offers
- **Covered Elsewhere?**: Whether this value is already provided by another recommended title
- **Recommendation Decision**: `Must Watch` | `Recommended` | `Extra Context` | `Safe to Skip`
- **Reason**: Rationale for the decision

### 11.3 MCU Graph Audit Log: Spider-Man: Brand New Day (`mcu-spiderman-brand-new-day`)

| Source Title | Unique Narrative Value | Covered Elsewhere? | Decision | Reason |
|---|---|---|---|---|
| **Spider-Man: No Way Home** | Erased identity, memory wipe spell, post-spell street hero status | **No** | **Must Watch** | Target directly assumes knowledge of Peter's erased identity. |
| **Spider-Man: Far From Home** | Identity reveal stakes, Mysterio conflict, Peter stepping out of Tony's shadow | **No** | **Recommended** | Provides unique character transformation into an independent hero. |
| **Spider-Man: Homecoming** | Peter's solo MCU origin, street-level Queens ethos, Tony mentorship origin | **No** | **Recommended** | Establishes baseline hero ethos and street-level roots. |
| **Captain America: Civil War** | Peter's recruitment by Tony Stark, initial MCU introduction | **No** | **Recommended** | First introduction to wider superhero universe. |
| **Avengers: Infinity War** | Titan cosmic battle, emotional stakes of the Snap | **No** | **Recommended** | Peak cosmic combat experience and tragic blip loss. |
| **Avengers: Endgame** | Tony Stark's sacrifice, post-Blip world dynamics | **No** | **Recommended** | Emotional climax of mentor relationship and Blip return. |
| **Thunderbolts\*** | Post-Blip NYC vigilante legislation & government oversight | **No** | **Recommended** | Establishes current MCU superhero political landscape. |
| **Captain America: Brave New World** | President Ross administration vigilante stance | **No** | **Recommended** | Sets up geopolitical backdrop for NYC heroes. |
| **Iron Man** | Tony Stark solo origin | **Yes** *(by Civil War, Homecoming, Endgame)* | **Extra Context** | Tony's mentorship is already represented by later recommended films. |
| **The Avengers** | Battle of New York historical lore | **Yes** *(by Homecoming)* | **Extra Context** | Battle of NYC lore is already referenced in Homecoming. |
| **The Incredible Hulk** | Bruce Banner character origin | **Yes** *(by Endgame)* | **Extra Context** | Returning character rule: Banner appearance doesn't require Hulk origin. |
| **Daredevil** | Matt Murdock street vigilante origin | **Yes** *(by No Way Home)* | **Extra Context** | Returning character rule: Murdock cameo doesn't require 3-season origin. |

---

## 12. Narrative Satisfaction Audit Protocol

### 12.1 Purpose
The Narrative Satisfaction Audit Protocol evaluates whether a recommendation list delivers a complete, emotionally earned viewing journey rather than a bare minimum prerequisite path.

### 12.2 The 7 Narrative Satisfaction Audit Dimensions
1. **Plot Satisfaction**: Will the viewer understand every major conflict?
2. **Character Satisfaction**: Will the viewer understand why every important character behaves the way they do?
3. **Relationship Satisfaction**: Will important relationships already feel earned?
4. **Emotional Satisfaction**: Will emotional scenes have their intended impact?
5. **World Satisfaction**: Will the viewer understand the current state of the universe?
6. **Callback Satisfaction**: Will returning jokes, references, locations, and story beats feel rewarding?
7. **Legacy Satisfaction**: Will returning heroes and villains feel familiar rather than random appearances?

### 12.3 Audit Report Format

```text
========================================
Narrative Satisfaction Audit
========================================

Target:                           [Title Name]
Plot Satisfaction:                PASS
Character Satisfaction:           PASS
Relationship Satisfaction:        PASS
Emotional Satisfaction:           PASS
World Satisfaction:               PASS
Callback Satisfaction:            PASS
Legacy Satisfaction:              PASS
Missing Experiences:              None
Overall Narrative Satisfaction:   Excellent
Editorial Decision:               Recommendation Journey Approved

========================================
```

---

## 13. Enhanced Franchise Release Gate Criteria (10 Checkmarks)

Before tagging any franchise v1.0 release (e.g. MCU v1.0, Star Wars v1.0), all 10 release gate criteria must be satisfied:

1. `✓ Engine Overall Accuracy ≥ 95.0%`
2. `✓ Average Category Drift ≤ 0.15`
3. `✓ Regression Suite PASS (0 breakage)`
4. `✓ Alignment Protocol Complete`
5. `✓ Evidence Coverage 100% (0 generic buzzwords)`
6. `✓ Zero Unexplained Overrides (Active Overrides classified)`
7. `✓ Review Lifecycle Validator PASS`
8. `✓ Narrative Satisfaction Audit Approved`
9. `✓ Unique Narrative Value Curation Verified`
10. `✓ Editorial Experience Report Approved (Professional Quality)`

Only when all 10 criteria are met is a franchise considered editorially complete.

---

## 14. Editorial Experience Report Protocol

### 14.1 Purpose
The Editorial Experience Report evaluates whether recommendations read like a curated viewing story rather than an uninspired graph traversal output.

### 14.2 Audit Output Format

```text
========================================
Editorial Experience Report
========================================

Target:                           [Title Name]
Story Journey:                    Excellent
Narrative Flow:                   Excellent
Character Continuity:             Excellent
Relationship Continuity:          Excellent
Emotional Continuity:             Excellent
World Continuity:                 Good
Legacy Continuity:                Excellent
Recommendation Redundancy:        None
Viewer Satisfaction:              Excellent
Editorial Verdict:                Professional Quality

========================================
```





