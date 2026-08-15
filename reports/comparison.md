# CineOrder Editorial Comparison Report

## System Metadata

| System Component | Version / Value |
|------------------|-----------------|
| **Generated** | 2026-08-14 |
| **Knowledge Graph** | v3.4 |
| **Traversal Engine** | v2.1 |
| **Policy Version** | v6.2 |
| **Comparison Engine** | v1.0 |
| **Git Commit** | `local-dev` |
| **Duration** | 24ms |

> **Regression Trend**: Previous 100% → Today 100%  ─ +0%

## Global Statistics

| Metric | Value |
|--------|-------|
| Overall Accuracy | **100%** |
| Overall Drift | 0 |
| Titles Analysed | 233 |
| Total Recommendations | 510 |
| Matching | 510 |
| Mismatches | 0 |

## Coverage Report

| Metric | Value |
|--------|-------|
| Titles Analysed | 233 |
| Titles With Overrides | 0 |
| Titles Without Overrides | 233 |
| Engine-Found Recommendations | 510 |
| Override-Injected Recommendations | 0 |
| Engine Accuracy (all titles, BFS-found) | 100% |
| Engine Accuracy (override titles only) | 100% |
| Engine Accuracy (non-override titles) | 100% _(tautological)_ |

## Precision / Recall / F1 by Category

| Category | Precision | Recall | F1 |
|----------|-----------|--------|-----|
| Must Watch | 100% | 100% | 100% |
| Recommended | 100% | 100% | 100% |
| Extra Context | 100% | 100% | 100% |
| Post Credit | 100% | 100% | 100% |
| Safe To Skip | 0% | 0% | 0% |

## Relationship Statistics

| Relationship | Total | Matches | Mismatches | Accuracy | Avg Drift |
|-------------|-------|---------|------------|----------|-----------|
| direct-sequel | 270 | 270 | 0 | 100% | 0 |
| character-origin | 55 | 55 | 0 | 100% | 0 |
| character-development | 62 | 62 | 0 | 100% | 0 |
| story-continuation | 76 | 76 | 0 | 100% | 0 |
| shared-object | 3 | 3 | 0 | 100% | 0 |
| world-building | 29 | 29 | 0 | 100% | 0 |
| post-credit | 1 | 1 | 0 | 100% | 0 |
| same-universe-only | 2 | 2 | 0 | 100% | 0 |
| shared-event | 1 | 1 | 0 | 100% | 0 |
| multiverse | 5 | 5 | 0 | 100% | 0 |
| organization | 1 | 1 | 0 | 100% | 0 |
| villain-origin | 4 | 4 | 0 | 100% | 0 |
| shared-character | 1 | 1 | 0 | 100% | 0 |

## Strength Statistics

| Strength | Total | Matches | Mismatches | Accuracy | Avg Drift |
|----------|-------|---------|------------|----------|-----------|
| required | 187 | 187 | 0 | 100% | 0 |
| strong | 252 | 252 | 0 | 100% | 0 |
| weak | 2 | 2 | 0 | 100% | 0 |
| moderate | 69 | 69 | 0 | 100% | 0 |

## Score Heatmap

| Relationship | Avg Engine | Avg Editorial | Delta | Samples |
|-------------|-----------|--------------|-------|---------|
| direct-sequel | 92.8 | 92.8 | +0 | 270 |
| character-origin | 76.1 | 76.1 | +0 | 55 |
| character-development | 75.4 | 75.4 | +0 | 62 |
| story-continuation | 82.8 | 82.8 | +0 | 76 |
| shared-object | 71.3 | 71.3 | +0 | 3 |
| world-building | 59.2 | 59.2 | +0 | 29 |
| post-credit | 47.3 | 47.3 | +0 | 1 |
| same-universe-only | 56.4 | 56.4 | +0 | 2 |
| shared-event | 72.3 | 72.3 | +0 | 1 |
| multiverse | 60.4 | 60.4 | +0 | 5 |
| organization | 61 | 61 | +0 | 1 |
| villain-origin | 75.8 | 75.8 | +0 | 4 |
| shared-character | 67.5 | 67.5 | +0 | 1 |

## Relationship Confusion Matrix

| Relationship | Engine | Editorial | Count | Avg Drift |
|-------------|--------|-----------|-------|-----------|

## Override Analysis

### Override Effectiveness: 0%
- **Total Overrides:** 0
- **Active Overrides:** 0 _(rules that alter engine recommendation)_
- **Redundant Overrides:** 0 _(rules subsumed by engine, candidate for removal)_

| Target | Source | Override | Engine | Drift | Confidence | Changed? |
|--------|--------|----------|--------|-------|------------|---------|

## Engine Calibration Suggestions

---

## Per-Title Reports

========================================================
**Target: Iron Man 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Iron Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Avengers**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Iron Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Iron Man 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: The First Avenger**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Incredible Hulk**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Iron Man 3**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Iron Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Iron Man 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Avengers**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Thor: The Dark World**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Thor**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Captain America: The Winter Soldier**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain America: The First Avenger**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Avengers**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Iron Man 2**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Avengers: Age of Ultron**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Avengers**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: The Winter Soldier**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man 3**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The First Avenger**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man 2**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor: The Dark World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**The Incredible Hulk**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Captain America: Civil War**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain America: The Winter Soldier**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Age of Ultron**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: The First Avenger**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Ant-Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man 3**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man 2**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Guardians of the Galaxy Vol. 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Guardians of the Galaxy**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Spider-Man: Homecoming**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Iron Man 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man 3**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Thor: Ragnarok**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Thor**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor: The Dark World**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Age of Ultron**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Black Panther**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The Winter Soldier**  Engine: Post Credit  Editorial: Post Credit  ✓ Match

Accuracy: 100%

========================================================
**Target: Ant-Man and the Wasp**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Ant-Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Avengers: Infinity War**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor: Ragnarok**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Age of Ultron**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Spider-Man: Homecoming**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man 3**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Guardians of the Galaxy**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Doctor Strange**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The First Avenger**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Guardians of the Galaxy Vol. 2**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The Winter Soldier**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Black Panther**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Avengers: Endgame**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Infinity War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Ant-Man and the Wasp**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Guardians of the Galaxy**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor: Ragnarok**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The Winter Soldier**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Spider-Man: Homecoming**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man 3**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain Marvel**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The First Avenger**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Doctor Strange**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor: The Dark World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Spider-Man: Far From Home**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Spider-Man: Homecoming**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain Marvel**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: WandaVision**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Infinity War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Endgame**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Age of Ultron**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: What If...?**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Doctor Strange**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Loki**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Falcon and the Winter Soldier**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Endgame**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: The Winter Soldier**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Ant-Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Infinity War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Black Panther**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The First Avenger**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Loki**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Endgame**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Thor: Ragnarok**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Thor: The Dark World**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Black Widow**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Iron Man 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The Winter Soldier**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Black Panther**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: The First Avenger**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Shang-Chi and the Legend of the Ten Rings**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Iron Man 3**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Iron Man**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Eternals**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Guardians of the Galaxy**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Spider-Man: No Way Home**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Spider-Man: Homecoming**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Spider-Man: Far From Home**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Doctor Strange**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Doctor Strange in the Multiverse of Madness**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Doctor Strange**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**WandaVision**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: Civil War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Spider-Man: No Way Home**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Thor: Love and Thunder**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Thor: Ragnarok**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Thor: The Dark World**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Infinity War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Black Panther: Wakanda Forever**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Black Panther**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Infinity War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: Civil War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Ant-Man and the Wasp: Quantumania**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Ant-Man and the Wasp**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Endgame**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Ant-Man**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Guardians of the Galaxy Vol. 3**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Guardians of the Galaxy**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Guardians of the Galaxy Vol. 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Guardians of the Galaxy Holiday Special**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Marvels**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain Marvel**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Ms. Marvel**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**WandaVision**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Secret Invasion**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Hawkeye**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Endgame**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Black Widow**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Ms. Marvel**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain Marvel**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Guardians of the Galaxy Holiday Special**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Guardians of the Galaxy Vol. 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Guardians of the Galaxy**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: She-Hulk: Attorney at Law**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Incredible Hulk**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Shang-Chi and the Legend of the Ten Rings**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Secret Invasion**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Captain Marvel**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Spider-Man: Far From Home**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Iron Man**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Echo**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Hawkeye**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Daredevil**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Agatha All Along**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**WandaVision**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Doctor Strange in the Multiverse of Madness**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Captain America: Brave New World**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Falcon and the Winter Soldier**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The Winter Soldier**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Ant-Man**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Incredible Hulk**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Eternals**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Daredevil: Born Again**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Echo**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Daredevil**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Hawkeye**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Spider-Man: No Way Home**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Thunderbolts***  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Black Widow**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Falcon and the Winter Soldier**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The First Avenger**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The Winter Soldier**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Ant-Man and the Wasp**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: Brave New World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Spider-Man: Brand New Day**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Spider-Man: No Way Home**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Spider-Man: Homecoming**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Spider-Man: Far From Home**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Infinity War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Daredevil: Born Again**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Echo**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Daredevil**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thunderbolts***  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**The Incredible Hulk**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: Brave New World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Avengers: Secret Wars**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Doomsday**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Loki**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thor**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor: Ragnarok**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor: The Dark World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Deadpool & Wolverine**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Doctor Strange in the Multiverse of Madness**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Deadpool 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Deadpool**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Logan**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Wolverine**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X2: X-Men United**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men: The Last Stand**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: X-Men: Days of Future Past**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X-Men: The Last Stand**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X-Men: First Class**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X2: X-Men United**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Deadpool & Wolverine**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Deadpool**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Deadpool 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Logan**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Wolverine**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men: The Last Stand**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X2: X-Men United**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Loki**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**X-Men: Days of Future Past**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Avengers: Doomsday**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avengers: Endgame**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Fantastic Four: First Steps**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Loki**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Thunderbolts***  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Doctor Strange in the Multiverse of Madness**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Falcon and the Winter Soldier**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Avengers**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The Winter Soldier**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avengers: Age of Ultron**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: The First Avenger**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Thor**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor: Ragnarok**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Thor: The Dark World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Spider-Man: No Way Home**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Captain America: Brave New World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Shang-Chi and the Legend of the Ten Rings**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**X-Men: Days of Future Past**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Deadpool & Wolverine**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Logan**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Batman v Superman: Dawn of Justice**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Man of Steel**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Wonder Woman**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Batman v Superman: Dawn of Justice**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Justice League**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Batman v Superman: Dawn of Justice**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Zack Snyder's Justice League**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Batman v Superman: Dawn of Justice**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Aquaman**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Justice League**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Suicide Squad**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Suicide Squad**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Peacemaker**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Suicide Squad**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Penguin**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Batman**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Batman Part II**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Batman**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Joker: Folie à Deux**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Joker**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Creature Commandos**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Peacemaker**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Lanterns**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Superman**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: Episode V - The Empire Strikes Back**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode IV - A New Hope**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: Episode VI - Return of the Jedi**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode V - The Empire Strikes Back**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Star Wars: Episode IV - A New Hope**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: Episode II - Attack of the Clones**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode I - The Phantom Menace**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: Episode III - Revenge of the Sith**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode II - Attack of the Clones**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Star Wars: Episode I - The Phantom Menace**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Rogue One: A Star Wars Story**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode III - Revenge of the Sith**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Mandalorian**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode VI - Return of the Jedi**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Book of Boba Fett**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Mandalorian**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Andor**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode III - Revenge of the Sith**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Ahsoka**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Mandalorian**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Book of Boba Fett**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Mandalorian & Grogu**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Mandalorian**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: The Force Awakens**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode VI - Return of the Jedi**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: The Last Jedi**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: The Force Awakens**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: The Rise of Skywalker**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: The Last Jedi**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Star Wars: The Force Awakens**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Chamber of Secrets**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Philosopher's Stone**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Prisoner of Azkaban**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Chamber of Secrets**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Philosopher's Stone**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Goblet of Fire**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Prisoner of Azkaban**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Chamber of Secrets**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Philosopher's Stone**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Order of the Phoenix**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Goblet of Fire**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Prisoner of Azkaban**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Chamber of Secrets**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Philosopher's Stone**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Half-Blood Prince**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Order of the Phoenix**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Goblet of Fire**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Prisoner of Azkaban**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Chamber of Secrets**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Deathly Hallows: Part 1**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Half-Blood Prince**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Order of the Phoenix**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Goblet of Fire**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Prisoner of Azkaban**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Deathly Hallows: Part 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Deathly Hallows: Part 1**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Half-Blood Prince**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Order of the Phoenix**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Goblet of Fire**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: The Lord of the Rings: The Two Towers**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Lord of the Rings: The Fellowship of the Ring**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Lord of the Rings: The Return of the King**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Lord of the Rings: The Two Towers**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Lord of the Rings: The Fellowship of the Ring**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: John Wick: Chapter 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**John Wick**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: John Wick: Chapter 3 - Parabellum**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**John Wick: Chapter 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**John Wick**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: John Wick: Chapter 4**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**John Wick: Chapter 3 - Parabellum**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**John Wick: Chapter 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**John Wick**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Annabelle**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Conjuring**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Conjuring 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Conjuring**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Annabelle: Creation**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Annabelle**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Conjuring**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Nun**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Conjuring 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Conjuring**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Curse of La Llorona**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Annabelle**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Annabelle Comes Home**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Conjuring**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Annabelle**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Annabelle: Creation**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Conjuring: The Devil Made Me Do It**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Conjuring**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Conjuring 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Nun II**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Nun**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Conjuring 2**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Evil Dead II**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Evil Dead**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Army of Darkness**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Evil Dead II**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Evil Dead**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Evil Dead**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Evil Dead**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Ash vs Evil Dead**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Army of Darkness**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Evil Dead II**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Evil Dead**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Evil Dead Rise**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Evil Dead**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Evil Dead Burn**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Evil Dead Rise**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Insidious: Chapter 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Insidious**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Insidious: The Last Key**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Insidious: Chapter 3**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Insidious: The Red Door**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Insidious: Chapter 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Insidious**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Insidious: Out of the Further**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Insidious: Chapter 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Insidious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Insidious: The Last Key**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Insidious: The Red Door**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Conjuring: Last Rites**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Conjuring**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Conjuring 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Conjuring: The Devil Made Me Do It**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Annabelle Comes Home**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Iron Man 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Iron Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Iron Man 3**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Iron Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Iron Man 2**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Avengers**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Ant-Man and the Wasp**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Ant-Man**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Captain America: Civil War**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Spider-Man: No Way Home**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Spider-Man: Homecoming**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Spider-Man: Far From Home**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avengers: Infinity War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Captain America: Civil War**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Doctor Strange**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Endgame**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Agatha All Along**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**WandaVision**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Doctor Strange in the Multiverse of Madness**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Avengers: Age of Ultron**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: The Clone Wars**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode II - Attack of the Clones**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Star Wars: Episode I - The Phantom Menace**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: The Clone Wars**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: The Clone Wars**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Star Wars: Episode II - Attack of the Clones**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Star Wars: Episode I - The Phantom Menace**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars Rebels**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: The Clone Wars**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Star Wars: Episode III - Revenge of the Sith**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Star Wars: The Bad Batch**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: The Clone Wars**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Obi-Wan Kenobi**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: Episode III - Revenge of the Sith**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Star Wars: Episode II - Attack of the Clones**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Star Wars: Episode I - The Phantom Menace**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Tales of the Jedi**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Star Wars: The Clone Wars**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Star Wars: The Clone Wars**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Star Wars: Episode II - Attack of the Clones**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Skeleton Crew**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Mandalorian**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Harry Potter and the Order of the Phoenix**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Harry Potter and the Goblet of Fire**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Harry Potter and the Prisoner of Azkaban**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Chamber of Secrets**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Harry Potter and the Philosopher's Stone**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Fantastic Beasts: The Crimes of Grindelwald**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Fantastic Beasts and Where to Find Them**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Fantastic Beasts: The Secrets of Dumbledore**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Fantastic Beasts: The Crimes of Grindelwald**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Fantastic Beasts and Where to Find Them**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Suicide Squad**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Batman v Superman: Dawn of Justice**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Birds of Prey**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Suicide Squad**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Wonder Woman 1984**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Wonder Woman**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Batman v Superman: Dawn of Justice**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Black Adam**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Suicide Squad**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**Shazam!**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Shazam! Fury of the Gods**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Shazam!**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Flash**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Justice League**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Aquaman and the Lost Kingdom**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Aquaman**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Justice League**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Waller**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Peacemaker**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Suicide Squad**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Suicide Squad**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: 2 Fast 2 Furious**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Fast and the Furious**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Fast & Furious**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Fast and the Furious**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**2 Fast 2 Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Fast Five**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Fast & Furious**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**2 Fast 2 Furious**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Fast & Furious 6**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Fast Five**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Fast & Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**2 Fast 2 Furious**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Furious 7**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Fast & Furious 6**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Fast Five**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Fast and the Furious: Tokyo Drift**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

**2 Fast 2 Furious**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: The Fate of the Furious**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Furious 7**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Fast & Furious 6**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast Five**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Fast & Furious Presents: Hobbs & Shaw**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Fate of the Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Furious 7**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious 6**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast Five**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: F9: The Fast Saga**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Fate of the Furious**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Furious 7**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious 6**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast Five**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Fast X**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**F9: The Fast Saga**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Fast Five**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Fate of the Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Furious 7**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious 6**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Fast X: Part 2**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Fast X**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**F9: The Fast Saga**  Engine: Recommended  Editorial: Recommended  ✓ Match

**The Fate of the Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast & Furious**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Furious 7**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Fast Five**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: From the World of John Wick: Ballerina**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**John Wick: Chapter 3 - Parabellum**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**John Wick: Chapter 2**  Engine: Recommended  Editorial: Recommended  ✓ Match

**John Wick**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible II**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible III**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible - Ghost Protocol**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible III**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Mission: Impossible**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible - Rogue Nation**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible - Ghost Protocol**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Mission: Impossible III**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible - Fallout**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible - Rogue Nation**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Mission: Impossible - Ghost Protocol**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible III**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible - Dead Reckoning Part One**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible - Fallout**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Mission: Impossible - Rogue Nation**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible - Ghost Protocol**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible III**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Mission: Impossible - The Final Reckoning**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Mission: Impossible - Dead Reckoning Part One**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Mission: Impossible - Fallout**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible - Rogue Nation**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Mission: Impossible - Ghost Protocol**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: X2: X-Men United**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X-Men**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: X-Men: The Last Stand**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X2: X-Men United**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: X-Men Origins: Wolverine**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: The Wolverine**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X-Men: The Last Stand**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X2: X-Men United**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: X-Men: Apocalypse**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X-Men: Days of Future Past**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X-Men: First Class**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men: The Last Stand**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X2: X-Men United**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Dark Phoenix**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**X-Men: Apocalypse**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**X-Men: The Last Stand**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men: Days of Future Past**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X2: X-Men United**  Engine: Recommended  Editorial: Recommended  ✓ Match

**X-Men: First Class**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: The Lost World: Jurassic Park**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic Park**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Jurassic Park III**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic Park**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Jurassic World**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic Park**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Jurassic World: Fallen Kingdom**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic World**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Jurassic World: Camp Cretaceous**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic World**  Engine: Extra Context  Editorial: Extra Context  ✓ Match

Accuracy: 100%

========================================================
**Target: Jurassic World Dominion**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic World: Fallen Kingdom**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Jurassic World**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Jurassic World Rebirth**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Jurassic World Dominion**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Pirates of the Caribbean: Dead Man's Chest**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Pirates of the Caribbean: The Curse of the Black Pearl**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Pirates of the Caribbean: At World's End**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Pirates of the Caribbean: Dead Man's Chest**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Pirates of the Caribbean: The Curse of the Black Pearl**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Pirates of the Caribbean: On Stranger Tides**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Pirates of the Caribbean: The Curse of the Black Pearl**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Pirates of the Caribbean: Dead Men Tell No Tales**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Pirates of the Caribbean: At World's End**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Pirates of the Caribbean: Dead Man's Chest**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Pirates of the Caribbean: The Curse of the Black Pearl**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Transformers: Revenge of the Fallen**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Transformers**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Transformers: Dark of the Moon**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Transformers: Revenge of the Fallen**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Transformers**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Transformers: Age of Extinction**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Transformers: Dark of the Moon**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Transformers: The Last Knight**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Transformers: Age of Extinction**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Transformers: Rise of the Beasts**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Bumblebee**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Hobbit: The Desolation of Smaug**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Hobbit: An Unexpected Journey**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: The Hobbit: The Battle of the Five Armies**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**The Hobbit: The Desolation of Smaug**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**The Hobbit: An Unexpected Journey**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Avatar: The Way of Water**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avatar**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Avatar: Fire and Ash**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avatar: The Way of Water**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avatar**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Avatar 4**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avatar: Fire and Ash**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avatar: The Way of Water**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avatar**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Avatar 5**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Avatar 4**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Avatar: Fire and Ash**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avatar: The Way of Water**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Avatar**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Aliens**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Alien**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Alien³**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Aliens**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Alien**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Alien Resurrection**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Alien³**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

**Aliens**  Engine: Recommended  Editorial: Recommended  ✓ Match

**Alien**  Engine: Recommended  Editorial: Recommended  ✓ Match

Accuracy: 100%

========================================================
**Target: Alien: Covenant**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Prometheus**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%

========================================================
**Target: Alien: Romulus**  Accuracy: 100%  Drift: avg 0 max 0
========================================================

**Alien**  Engine: Must Watch  Editorial: Must Watch  ✓ Match

Accuracy: 100%
