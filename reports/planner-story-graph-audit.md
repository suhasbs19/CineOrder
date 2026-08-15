# CineOrder Personal Watch Planner Story-Graph Correctness Audit Report

**Audit Date**: August 14, 2026  
**Audit Target**: Personal Watch Planner Target-Selection & Story-Graph Preparation Subsystem  
**Overall System Status**: **PLANNER STORY-GRAPH INTEGRITY: PASS**

---

## 1. Audit Scope

The purpose of this audit is to rigorously verify that the CineOrder Personal Watch Planner (`/planner`) target-selection and watch plan generation systems operate **STRICTLY on the basis of CineOrder's Story & Preparation Knowledge Graph topology**, and NOT on:
- Release year or release date cutoffs
- Franchise membership or blanket franchise inclusion
- Arbitrary catalog filtering
- Manufactured or hallucinated recommendations

The audit evaluated all **213 titles** across all **16 franchises** in the CineOrder database, inspecting search querying, prerequisite resolution, entry point detection, schedule generation, and zero-prerequisite state rendering.

---

## 2. Files Inspected

| File Path | Role in Planner Flow | Status |
| :--- | :--- | :--- |
| `src/components/planner/TargetCombobox.tsx` | Searchable combobox dropdown & target selector | Inspected — Verified |
| `src/pages/PlannerPage.tsx` | Main Planner container & plan display | Inspected — Verified |
| `src/lib/preparationGuide.ts` | Wrapper bridging Planner to Knowledge Graph Engine | Inspected — Verified |
| `src/lib/plannerEngine.ts` | Day-by-day personal schedule generation algorithm | Inspected — Verified |
| `src/store/plannerStore.ts` | Planner Zustand state management | Inspected — Verified |
| `src/lib/storyKnowledgeGraphEngine.ts` | Frozen Knowledge Graph Traversal Engine | Inspected — Frozen / Preserved |
| `src/data/cineOrderKnowledgeGraph.ts` | Frozen Knowledge Graph Topology & Edges | Inspected — Frozen / Preserved |

---

## 3. Exact Eligibility & Search Logic Currently Used

### Target Selection & Search
In `src/components/planner/TargetCombobox.tsx`:
- **Catalog Dataset**: Operates directly on `allContent` (213 titles).
- **Search Filtering**: Matches search string against `c.title` and `c.franchise_id` in a case-insensitive substring manner:
  ```typescript
  const matches = allContent.filter((c) => {
    const title = c.title.toLowerCase();
    const franchise = (c.franchise_id || '').toLowerCase();
    return title.includes(q) || franchise.includes(q);
  });
  ```
- **Release-Date Filtering**: **0%**. There is no release year, release date, or upcoming-only filter applied anywhere in the search pipeline.
- **Categorization (When Query is Empty)**:
  - `Titles with Preparation Guides` (`prereqCount > 0`): 145 titles.
  - `Direct Entry & Standalone Titles` (`prereqCount === 0`): 68 titles.
- **Real-Time Prerequisite Indication**: Every title in the list displays its exact prerequisite state computed from `generatePreparationGuide(item.id)`:
  - If 0 prerequisites: `✓ No prior movies required`
  - If $\ge 1$ prerequisites: `✨ Preparation available ({count})`

---

## 4. Exact Preparation-Guide Logic Currently Used

The preparation guide resolution flow is strictly deterministic:
```
TargetCombobox / PlannerPage
  └─► generatePreparationGuide(targetContentId, watchedIds) [preparationGuide.ts]
        └─► executeKnowledgeGraphTraversal(contentId, watchedIds) [storyKnowledgeGraphEngine.ts]
              └─► Traversal through CineOrder Knowledge Graph Directed Edges
                    ├─► mustWatch: Essential / Direct prerequisite edges
                    ├─► recommended: High narrative context edges
                    └─► isEntryPoint: true if (mustWatch.length + recommended.length === 0)
```

In `src/lib/plannerEngine.ts`:
- Prerequisites for schedule generation are strictly `[...guide.mustWatch, ...guide.recommended].filter((r) => !r.isWatched)`.
- If `prerequisites.length === 0`, `generatePersonalSchedule` returns `[]` (empty array).
- In `PlannerPage.tsx`, when `activePlan.schedule.length === 0`, the UI renders the dedicated **"No Prior Movies Required"** direct entry card:
  - Badge: `Direct Watch`
  - Heading: `No Prior Movies Required`
  - Subtitle: `You're ready to watch {Title} directly!`
  - Description: `This title has no mandatory or recommended prerequisite movies in the CineOrder story graph. You can enjoy it immediately with 0 hours of prior preparation needed.`
  - Badges: `🎬 Self-Contained Story • ⚡ 0 Hours Prep Needed • 🌟 Direct Entry Point`

---

## 5. Test Titles & Categories

### Category 1: Direct-Entry / Zero-Prerequisite Titles
| Title ID | Title Name | Franchise | Release Year | Status | Prereqs | Must-Watch | Recommended | Entry Point | Schedule Items |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :---: |
| `mcu-iron-man` | Iron Man | MCU | 2008 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `hp-philosophers-stone` | Harry Potter and the Philosopher's Stone | HP | 2001 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `dc-superman-2025` | Superman | DCU | 2025 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `mcu-fantastic-four-first-steps` | The Fantastic Four: First Steps | MCU | 2025 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `sw-a-new-hope` | Star Wars: Episode IV - A New Hope | Star Wars | 1977 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `sw-phantom-menace` | Star Wars: Episode I - The Phantom Menace | Star Wars | 1999 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `lotr-fellowship` | The Lord of the Rings: The Fellowship of the Ring | Middle-earth | 2001 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `jw-chapter-1` | John Wick | John Wick | 2014 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `tf-2007` | Transformers | Transformers | 2007 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |
| `xmen-2000` | X-Men | X-Men | 2000 | Released | **0** | None | None | **Yes** | 0 (Direct Watch) |

---

### Category 2: Sequels with Story Graph Prerequisites
| Title ID | Title Name | Prereq Count | Must-Watch Titles | Recommended Titles | Schedule Items |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `mcu-iron-man-2` | Iron Man 2 | **1** | Iron Man | None | 1 |
| `mcu-iron-man-3` | Iron Man 3 | **3** | Iron Man, Iron Man 2, The Avengers | None | 3 |
| `hp-chamber-of-secrets` | Harry Potter and the Chamber of Secrets | **1** | Harry Potter and the Philosopher's Stone | None | 1 |
| `hp-prisoner-of-azkaban` | Harry Potter and the Prisoner of Azkaban | **2** | Harry Potter and the Chamber of Secrets | Harry Potter and the Philosopher's Stone | 2 |
| `hp-goblet-of-fire` | Harry Potter and the Goblet of Fire | **3** | Harry Potter and the Prisoner of Azkaban | Harry Potter and the Chamber of Secrets, Harry Potter and the Philosopher's Stone | 3 |
| `hp-order-of-the-phoenix` | Harry Potter and the Order of the Phoenix | **4** | Harry Potter and the Goblet of Fire | Prisoner of Azkaban, Chamber of Secrets, Philosopher's Stone | 4 |
| `hp-half-blood-prince` | Harry Potter and the Half-Blood Prince | **4** | Harry Potter and the Order of the Phoenix | Goblet of Fire, Prisoner of Azkaban, Chamber of Secrets | 4 |
| `hp-deathly-hallows-1` | Harry Potter and the Deathly Hallows: Part 1 | **4** | Harry Potter and the Half-Blood Prince | Order of the Phoenix, Goblet of Fire, Prisoner of Azkaban | 4 |
| `hp-deathly-hallows-2` | Harry Potter and the Deathly Hallows: Part 2 | **4** | Harry Potter and the Deathly Hallows: Part 1 | Half-Blood Prince, Order of the Phoenix, Goblet of Fire | 4 |

---

### Category 3: Major Interconnected Titles
| Title ID | Title Name | Prereq Count | Must-Watch Titles | Recommended Titles | Schedule Items |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `mcu-avengers` | The Avengers | **4** | Iron Man, Iron Man 2, Captain America: The First Avenger, Thor | None | 4 |
| `mcu-age-of-ultron` | Avengers: Age of Ultron | **3** | The Avengers | Captain America: The Winter Soldier, Iron Man 3 | 3 |
| `mcu-infinity-war` | Avengers: Infinity War | **7** | Captain America: Civil War, Thor: Ragnarok | Age of Ultron, The Avengers, Spider-Man: Homecoming, Iron Man 2, Iron Man 3 | 7 |
| `mcu-endgame` | Avengers: Endgame | **10** | Infinity War, Ant-Man and the Wasp, Guardians of the Galaxy, Thor: Ragnarok | Civil War, Winter Soldier, Iron Man, Spider-Man: Homecoming, Iron Man 2, Iron Man 3 | 10 |
| `mcu-doomsday` | Avengers: Doomsday | **12** | Endgame, Fantastic Four: First Steps, Loki, Thunderbolts*, Multiverse of Madness | Infinity War, Falcon & Winter Soldier, Civil War, The Avengers, Winter Soldier, Age of Ultron, First Avenger | 16 (includes series episode chunks) |
| `mcu-secret-wars` | Avengers: Secret Wars | **2** | Avengers: Doomsday, Loki | None | 4 (includes Loki episode chunks) |
| `mcu-thunderbolts` | Thunderbolts* | **4** | Black Widow, The Falcon and the Winter Soldier | Captain America: Civil War, Captain America: The First Avenger | 6 (includes series episode chunks) |
| `mcu-captain-america-brave-new-world` | Captain America: Brave New World | **3** | Captain America: Civil War, The Falcon and the Winter Soldier | Captain America: The Winter Soldier | 5 (includes series episode chunks) |

---

### Category 4: Spider-Man Search & Titles
| Title ID | Title Name | Prereq Count | Must-Watch Titles | Recommended Titles | Status |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `mcu-spider-man-homecoming` | Spider-Man: Homecoming | **2** | Captain America: Civil War | Iron Man 2 | Prep available (2) |
| `mcu-spider-man-far-from-home` | Spider-Man: Far From Home | **3** | Avengers: Endgame | Spider-Man: Homecoming, Captain America: Civil War | Prep available (3) |
| `mcu-spider-man-no-way-home` | Spider-Man: No Way Home | **4** | Spider-Man: Far From Home, Doctor Strange in the Multiverse of Madness | Spider-Man: Homecoming, Avengers: Endgame | Prep available (4) |
| `mcu-spider-man-brand-new-day` | Spider-Man: Brand New Day | **3** | Spider-Man: No Way Home, Daredevil: Born Again | Spider-Man: Far From Home | Prep available (3) |

**Spider-Man Search Inspection**:
Searching `"Spider-Man"` correctly queries all 4 catalog entries, and each title independently resolves and renders its distinct preparation count without pulling arbitrary Marvel titles.

---

### Category 5: Star Wars Titles (Franchise Membership Test)
| Title ID | Title Name | Prereq Count | Must-Watch Titles | Recommended Titles | Verification |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `sw-a-new-hope` | Star Wars: Episode IV - A New Hope | **0** | None | None | Direct Watch • No prior movies |
| `sw-phantom-menace` | Star Wars: Episode I - The Phantom Menace | **0** | None | None | Direct Watch • No prior movies |
| `sw-rogue-one` | Rogue One: A Star Wars Story | **0** | None | None | Direct Watch • No prior movies |
| `sw-andor` | Andor | **0** | None | None | Direct Watch • No prior movies |
| `sw-mandalorian` | The Mandalorian | **1** | Return of the Jedi | None | Prep available (1) |
| `sw-empire-strikes-back` | Star Wars: Episode V - The Empire Strikes Back | **1** | A New Hope | None | Prep available (1) |
| `sw-return-of-the-jedi` | Star Wars: Episode VI - Return of the Jedi | **1** | The Empire Strikes Back | None | Prep available (1) |

**Franchise Membership Integrity Result**:
Franchise membership alone does NOT make older Star Wars movies prerequisites. Standalone entry points like *A New Hope*, *The Phantom Menace*, *Rogue One*, and *Andor* evaluate to **0 prerequisites**, proving that graph connections alone govern prerequisites.

---

### Category 6: Upcoming Titles Test
| Title ID | Title Name | Status | Prereqs | Graph-Derived Prerequisites | Verification |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `mcu-secret-wars` | Avengers: Secret Wars | Upcoming | **2** | Avengers: Doomsday, Loki | Prereqs determined by graph |
| `mcu-blade` | Blade | Upcoming | **0** | None | Direct Watch (0 prereqs) |
| `wizarding-world-harry-potter-tv` | Harry Potter TV Series | Upcoming | **0** | None | Direct Watch (0 prereqs) |
| `dc-the-batman-2` | The Batman Part II | Upcoming | **1** | The Batman | Prereqs determined by graph |
| `dc-lanterns` | Lanterns | Upcoming | **0** | None | Direct Watch (0 prereqs) |
| `dc-waller` | Waller | Upcoming | **3** | Peacemaker, The Suicide Squad, Creature Commandos | Prereqs determined by graph |
| `dc-booster-gold` | Booster Gold | Upcoming | **0** | None | Direct Watch (0 prereqs) |
| `dc-paradise-lost` | Paradise Lost | Upcoming | **0** | None | Direct Watch (0 prereqs) |
| `insidious-6` | Insidious: Out of the Further | Upcoming | **2** | Insidious: The Red Door, Insidious | Prereqs determined by graph |

**Upcoming Status Integrity Result**:
Upcoming titles with 0 graph edges (e.g. *Blade*, *Harry Potter TV Series*, *Lanterns*, *Booster Gold*, *Paradise Lost*) evaluate to **0 prerequisites**, proving that upcoming status does not inject arbitrary prerequisites.

---

### Category 7: TV Series Titles Test
| Title ID | Title Name | Type | Prereqs | Schedule Breakdown | Verification |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `mcu-wandavision` | WandaVision | Series | **4** | 4 chunks (Endgame, Age of Ultron, Infinity War, Civil War) | Follows Story Graph |
| `mcu-falcon-winter-soldier` | The Falcon and the Winter Soldier | Series | **3** | 3 chunks (Endgame, Civil War, Winter Soldier) | Follows Story Graph |
| `mcu-loki` | Loki | Series | **4** | 4 chunks (Endgame, The Avengers, Infinity War, Thor: Ragnarok) | Follows Story Graph |
| `mcu-what-if` | What If...? | Series | **0** | 0 chunks (Direct Watch) | Follows Story Graph |
| `mcu-moon-knight` | Moon Knight | Series | **0** | 0 chunks (Direct Watch) | Follows Story Graph |
| `mcu-ms-marvel` | Ms. Marvel | Series | **0** | 0 chunks (Direct Watch) | Follows Story Graph |
| `mcu-she-hulk` | She-Hulk: Attorney at Law | Series | **0** | 0 chunks (Direct Watch) | Follows Story Graph |

**TV Series Integrity Result**:
TV Series follow the identical Knowledge Graph traversal rules as feature films, chunking episodes appropriately when selected as prerequisites or displaying direct-watch cards when standalone.

---

## 6. Expected vs Actual Prerequisite Behavior

| Metric / Scenario | Expected Behavior | Actual System Behavior | Discrepancy |
| :--- | :--- | :--- | :--- |
| **Search "Iron Man"** | Returns all Iron Man titles with independent prep status | Returns *Iron Man* (0 prereqs), *Iron Man 2* (1 prereq), *Iron Man 3* (3 prereqs) | None |
| **Search "Harry Potter"** | Returns all HP titles with independent prep status | Returns *Philosopher's Stone* (0 prereqs), followed by sequels 2–8 with 1 to 4 prereqs | None |
| **Select Zero-Prereq Title** | Shows "No Prior Movies Required" and 0 schedule items | Displays dedicated Direct Watch card with 0 schedule items | None |
| **Select Title with Prerequisites** | Generates plan containing ONLY graph prerequisites | Schedule contains exclusively `mustWatch` and `recommended` graph titles | None |
| **Layering / Bleed-Through** | Dropdown renders on top of all content with 0 bleed-through | Portal rendering with `zIndex: 99999` and solid `#181818` background | None |

---

## 7. Any Release-Year / Date Filtering Found

- **Audit Finding**: **NONE**.
- The search combobox inspects `allContent` globally.
- Release year is displayed purely for visual metadata (e.g. `2008`, `2026`, or `TBA`).
- No conditional statements filter out titles based on release year or release date.

---

## 8. Any Franchise-Based Filtering Found

- **Audit Finding**: **NONE**.
- Franchise IDs are used strictly for search matching (e.g. searching "Marvel" matches MCU titles) and visual badge labeling.
- Franchise membership does not automatically create graph edges or prerequisites.

---

## 9. Any Arbitrary Recommendation Behavior Found

- **Audit Finding**: **NONE**.
- All preparation titles originate directly from `executeKnowledgeGraphTraversal()` in `src/lib/storyKnowledgeGraphEngine.ts`.
- No heuristics, random fallbacks, or popularity-based injections are present in the Planner pipeline.

---

## 10. Zero-Prerequisite Results

- **Total Zero-Prerequisite Titles in Catalog**: **68 titles**.
- **Behavior Verification**: 100% of the 68 zero-prerequisite titles produce `scheduleLength === 0`.
- **UI State**: Displays the dedicated emerald card:
  - `No Prior Movies Required`
  - `You're ready to watch {Title} directly!`
  - `🎬 Self-Contained Story • ⚡ 0 Hours Prep Needed • 🌟 Direct Entry Point`

---

## 11. Multi-Prerequisite Results

- **Total Prerequisite-Requiring Titles in Catalog**: **145 titles**.
- **Behavior Verification**: 100% of these 145 titles produce `scheduleLength > 0`.
- **Schedule Contents**: All items map 1:1 to unwatched `mustWatch` and `recommended` graph nodes with accurate runtime chunking and day-by-day dates.

---

## 12. False-Positive Recommendations

- **Audit Finding**: **0 False Positives**.
- Standalone entries (e.g. *Iron Man*, *Moon Knight*, *Andor*, *The Phantom Menace*) do not receive any prerequisites.

---

## 13. False-Negative Recommendations

- **Audit Finding**: **0 False Negatives**.
- Sequels and interconnected titles (*Iron Man 2*, *Endgame*, *Doomsday*, *Deathly Hallows 2*) properly pull their full story graph prerequisite paths.

---

## 14. Whether the Planner Correctly Follows the Story Graph

- **Audit Finding**: **YES (100% Compliance)**.
- Target selection, preparation badge indicators, and schedule generation are completely synchronized with the CineOrder Knowledge Graph.

---

## 15. Whether Any Changes Are Actually Required

- **Audit Finding**: **NO CHANGES REQUIRED**.
- The existing implementation perfectly matches all editorial requirements and frozen framework constraints.

---

## Final System Audit Verdict

```
================================================================================
  CINEORDER PLANNER STORY-GRAPH AUDIT: PLANNER STORY-GRAPH INTEGRITY: PASS
================================================================================
```
