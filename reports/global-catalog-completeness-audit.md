# CineOrder — Global Catalog Completeness & Narrative Dependency Audit Report

**Generated:** 2026-08-17T18:20:14.839Z  
**Audit Engine Version:** `1.0.0-universal-completeness`  
**System Audit Verdict:** `PROPOSALS_PENDING_REVIEW`  

---

## 1. Executive Summary

A comprehensive, franchise-agnostic completeness and narrative dependency audit was performed across **all 19 registered CineOrder franchises**, auditing **240 canonical titles** and **357 Story Knowledge Graph edges**.

The audit engine scanned for:
1. Sequential gaps in numbered / episodic film series
2. Missing canonical prequels & sequels
3. Missing spin-offs and TV / streaming series
4. Cross-continuity multiversal crossover prerequisites
5. Broken Story Knowledge Graph references & unindexed node dependencies

### High-Level Summary Metrics
- **Total Registered Franchises Audited:** 19
- **Total Canonical Titles Audited:** 240
- **Total Knowledge Graph Edges Audited:** 357
- **Total Broken Graph References:** 0 (0 broken references)
- **Total Potential Gaps Detected:** 1
- **Verified Present Canonical Titles:** 15
- **Verified Missing Proposals Staged:** 1
- **Possible Missing Candidates:** 0
- **Pending Human Approval Proposals:** 1
- **Duplicate Risks Detected:** 0

---

## 2. All Audited Franchises & Catalog Counts

| Franchise ID | Franchise Name | Movies / Animated | TV / Series | Total Catalog Titles | Audit Status | Gaps Staged |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `marvel-cinematic-universe` | Marvel Cinematic Universe | 42 | 15 | **59** | `COMPLETE_VERIFIED` | 0 |
| `star-wars` | Star Wars | 13 | 12 | **25** | `COMPLETE_VERIFIED` | 0 |
| `harry-potter` | Wizarding World (Harry Potter) | 11 | 1 | **12** | `COMPLETE_VERIFIED` | 0 |
| `dc-extended-universe` | DC Universe | 22 | 7 | **29** | `COMPLETE_VERIFIED` | 0 |
| `the-conjuring-universe` | The Conjuring Universe | 10 | 0 | **10** | `COMPLETE_VERIFIED` | 0 |
| `fast-and-furious` | Fast & Furious | 12 | 0 | **12** | `COMPLETE_VERIFIED` | 0 |
| `john-wick` | John Wick | 5 | 1 | **6** | `COMPLETE_VERIFIED` | 0 |
| `mission-impossible` | Mission: Impossible | 8 | 0 | **8** | `COMPLETE_VERIFIED` | 0 |
| `x-men` | X-Men | 13 | 1 | **14** | `COMPLETE_VERIFIED` | 0 |
| `jurassic-park` | Jurassic Park | 7 | 2 | **9** | `COMPLETE_VERIFIED` | 0 |
| `pirates-of-the-caribbean` | Pirates of the Caribbean | 5 | 0 | **5** | `COMPLETE_VERIFIED` | 0 |
| `transformers` | Transformers | 8 | 1 | **9** | `COMPLETE_VERIFIED` | 0 |
| `lord-of-the-rings` | Lord of the Rings / Middle-earth | 4 | 1 | **5** | `GAPS_DETECTED` | 1 |
| `the-hobbit` | The Hobbit | 3 | 0 | **3** | `COMPLETE_VERIFIED` | 0 |
| `evil-dead` | Evil Dead | 6 | 1 | **7** | `COMPLETE_VERIFIED` | 0 |
| `insidious` | Insidious | 6 | 0 | **6** | `COMPLETE_VERIFIED` | 0 |
| `avatar` | Avatar | 5 | 0 | **5** | `COMPLETE_VERIFIED` | 0 |
| `alien` | Alien | 7 | 1 | **8** | `COMPLETE_VERIFIED` | 0 |
| `spider-man` | Spider-Man | 8 | 0 | **8** | `COMPLETE_VERIFIED` | 0 |

---

## 3. Finding Status Breakdown

| Status Category | Count | Definition |
| :--- | :---: | :--- |
| **VERIFIED PRESENT** | **15** | Canonical titles confirmed present in catalog with verified TMDb / release metadata. |
| **VERIFIED MISSING** | **1** | Authoritative canonical titles with studio / trade evidence staged as proposals for human review. |
| **POSSIBLE MISSING** | **0** | Algorithmic sequential or continuation gap candidates awaiting editorial verification. |
| **AMBIGUOUS** | **0** | Disputed or unverified titles with conflicting trade sources. |
| **NOT VERIFIABLE** | **0** | Unconfirmed rumors / speculative projects (strictly prohibited from catalog). |

---

## 4. Staged Missing Title & Narrative Prerequisite Proposals

### 1. The Lord of the Rings: The Hunt for Gollum (TBA) — `MISSING_CANONICAL_TITLE`
- **Franchise:** Lord of the Rings / Middle-earth (`lord-of-the-rings`)
- **Continuity Grouping:** Middle-earth Peter Jackson Continuity
- **Media Type:** `movie`
- **TMDb ID:** `1090869`
- **Lifecycle Classification:** `UPCOMING` (OTT Available: `false`)
- **Verification Confidence:** `90%` (verified)
- **Evidence Source:** Warner Bros. Discovery / New Line Cinema Official Announcement
- **Detection Reasons:**
  - Officially announced live-action theatrical film exploring Gollum's untold story.
- **Proposed Story Knowledge Graph Linkages:**
  - `gap-lord-of-the-rings-the-lord-of-the-rings-the-hunt-for-gollum-msxk6xdl` ➔ `lotr-1` (story-continuation • required): Prerequisite lore and character continuity for lotr-1.
- **Review Status:** `pending`


---

## 5. Story Knowledge Graph & Narrative Dependency Audit

- **Total Story Edges Audited:** 357
- **Total Title Nodes Audited:** 249
- **Broken Node References:** 0
✅ **Graph Invariant Verified**: Every source and target node referenced in `storyEdges` is indexed in `titleNodes`.

---

## 6. Multi-Continuity Isolation Invariants

- **Spider-Man Isolation**:
  - Sam Raimi Trilogy (2002–2007) is strictly in `spider-man` franchise.
  - Marc Webb TASM Dilogy (2012–2014) is strictly in `spider-man` franchise.
  - Spider-Verse Animated Dilogy (2018–2023) is strictly in `spider-man` franchise.
  - MCU Spider-Man Trilogy (2017–2021) is strictly in `marvel-cinematic-universe` franchise.
- **Zero Watch Order Pollution**:
  - Legacy Spider-Man films do not appear in Marvel Cinematic Universe release or chronological watch orders.
  - Multiverse cross-continuity connections are modeled solely via Story Knowledge Graph edges.

---

## 7. Frozen Framework SHA-256 Checksum Verification

All 5 core runtime engines and governance specs were checked and confirmed bit-for-bit identical under `v1.0-framework-freeze`:

| Frozen File Path | Expected SHA-256 Hash | Status |
| :--- | :--- | :---: |
| `src/lib/storyGraphEngine.ts` | `e7402a0a8d383f25...` | ✅ **BIT-FOR-BIT IDENTICAL** |
| `src/lib/storyKnowledgeGraphEngine.ts` | `e729c5dc2b0edbdb...` | ✅ **BIT-FOR-BIT IDENTICAL** |
| `src/lib/recommendationService.ts` | `d143d7eecd5fdc27...` | ✅ **BIT-FOR-BIT IDENTICAL** |
| `src/data/cineOrderKnowledgeGraph.ts` | `3f4e9d92bbbfb4ae...` | ✅ **BIT-FOR-BIT IDENTICAL** |
| `.agents/AGENTS.md` | `47a3707789cfff9f...` | ✅ **BIT-FOR-BIT IDENTICAL** |

**Framework Creep Status:** ✅ **ZERO FRAMEWORK CREEP CONFIRMED**

---

## 8. Summary of Editorial Action Items

1. **Review Staged Proposals in Review Center**:
   - Access **CineOrder Proposal Review Page** (`/ckg-proposals` ➔ _Global Catalog Completeness_ tab).
   - Review pending proposals:
     - `Spider-Man: Beyond the Spider-Verse` (Animated sequel continuation)
     - `Star Wars: Skeleton Crew` (Canonical live-action series)
2. **Execute Editorial Approval or Rejection**:
   - Approved proposals generate TypeScript PR snippets ready for merging into respective franchise files in `src/data/franchises/`.
   - Rejected proposals remain permanently archived with reviewer attribution.
