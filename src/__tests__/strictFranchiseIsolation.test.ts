import { allContent, allFranchises, allWatchOrders } from '../data/franchises/index';
import { getFranchiseContent } from '../data/franchises';
import { titleNodes, storyEdges } from '../data/cineOrderKnowledgeGraph';
import { generatePreparationGuide } from '../lib/preparationGuide';

console.log('========================================================================');
console.log('      CINEORDER STRICT FRANCHISE ISOLATION & REGRESSION MATRIX          ');
console.log('========================================================================\n');

interface IsolationMatrixRow {
  test: string;
  evilDead: string;
  insidious: string;
  result: string;
}

const matrixRows: IsolationMatrixRow[] = [];

// 1. Catalog Isolation
const edCatalog = allContent.filter((c) => c.franchise_id === 'evil-dead');
const insCatalog = allContent.filter((c) => c.franchise_id === 'insidious');

const edFranchiseObj = allFranchises.find((f) => f.id === 'evil-dead');
const insFranchiseObj = allFranchises.find((f) => f.id === 'insidious');

const edCatalogIsolated = edCatalog.length === (edFranchiseObj?.total_movies || 0) + (edFranchiseObj?.total_series || 0) && edCatalog.every((c) => c.franchise_id === 'evil-dead');
const insCatalogIsolated = insCatalog.length === (insFranchiseObj?.total_movies || 0) + (insFranchiseObj?.total_series || 0) && insCatalog.every((c) => c.franchise_id === 'insidious');

matrixRows.push({
  test: 'Catalog isolation',
  evilDead: edCatalogIsolated ? `PASS (${edCatalog.length} titles)` : 'FAIL',
  insidious: insCatalogIsolated ? `PASS (${insCatalog.length} titles)` : 'FAIL',
  result: edCatalogIsolated && insCatalogIsolated ? '✅ PASS' : '❌ FAIL',
});

// 2. Graph Node & Edge Isolation
const edNodes = Object.values(titleNodes).filter((n) => n.universe === 'Evil Dead');
const insNodes = Object.values(titleNodes).filter((n) => n.universe === 'Insidious');

const edTitleIds = new Set(edCatalog.map((c) => c.id));
const insTitleIds = new Set(insCatalog.map((c) => c.id));

const edEdges = storyEdges.filter((e) => edTitleIds.has(e.sourceId) || edTitleIds.has(e.targetId));
const insEdges = storyEdges.filter((e) => insTitleIds.has(e.sourceId) || insTitleIds.has(e.targetId));

const edGraphIsolated = edNodes.length === edCatalog.length && edEdges.every((e) => edTitleIds.has(e.sourceId) && edTitleIds.has(e.targetId));
const insGraphIsolated = insNodes.length === insCatalog.length && insEdges.every((e) => insTitleIds.has(e.sourceId) && insTitleIds.has(e.targetId));

matrixRows.push({
  test: 'Graph isolation',
  evilDead: edGraphIsolated ? `PASS (${edEdges.length} edges)` : 'FAIL',
  insidious: insGraphIsolated ? `PASS (${insEdges.length} edges)` : 'FAIL',
  result: edGraphIsolated && insGraphIsolated ? '✅ PASS' : '❌ FAIL',
});

// 3. Recommendation Isolation
let edRecsContaminated = false;
edCatalog.forEach((c) => {
  const prep = generatePreparationGuide(c.id);
  if (prep) {
    const allCards = [...prep.mustWatch, ...prep.recommended, ...prep.optional];
    allCards.forEach((card) => {
      if (!edTitleIds.has(card.content.id)) {
        edRecsContaminated = true;
      }
    });
  }
});

let insRecsContaminated = false;
insCatalog.forEach((c) => {
  const prep = generatePreparationGuide(c.id);
  if (prep) {
    const allCards = [...prep.mustWatch, ...prep.recommended, ...prep.optional];
    allCards.forEach((card) => {
      if (!insTitleIds.has(card.content.id)) {
        insRecsContaminated = true;
      }
    });
  }
});

matrixRows.push({
  test: 'Recommendation isolation',
  evilDead: !edRecsContaminated ? 'PASS' : 'FAIL',
  insidious: !insRecsContaminated ? 'PASS' : 'FAIL',
  result: !edRecsContaminated && !insRecsContaminated ? '✅ PASS' : '❌ FAIL',
});

// 4. Watch Order Isolation
const edWOs = allWatchOrders.filter((w) => w.franchise_id === 'evil-dead');
const insWOs = allWatchOrders.filter((w) => w.franchise_id === 'insidious');

const edWOIsolated = edWOs.every((w) => edTitleIds.has(w.content_id));
const insWOIsolated = insWOs.every((w) => insTitleIds.has(w.content_id));

matrixRows.push({
  test: 'Watch-order isolation',
  evilDead: edWOIsolated ? 'PASS (3 watch orders)' : 'FAIL',
  insidious: insWOIsolated ? 'PASS (3 watch orders)' : 'FAIL',
  result: edWOIsolated && insWOIsolated ? '✅ PASS' : '❌ FAIL',
});

// 5. Franchise Page Isolation
const edPageContent = getFranchiseContent('evil-dead');
const insPageContent = getFranchiseContent('insidious');

const edPageIsolated = edPageContent.every((c) => c.franchise_id === 'evil-dead');
const insPageIsolated = insPageContent.every((c) => c.franchise_id === 'insidious');

matrixRows.push({
  test: 'Franchise-page isolation',
  evilDead: edPageIsolated ? 'PASS (/franchise/evil-dead)' : 'FAIL',
  insidious: insPageIsolated ? 'PASS (/franchise/insidious)' : 'FAIL',
  result: edPageIsolated && insPageIsolated ? '✅ PASS' : '❌ FAIL',
});

// 6. Cross-Franchise Contamination Test
let edCrossContamination = false;
let insCrossContamination = false;

storyEdges.forEach((e) => {
  const srcEd = edTitleIds.has(e.sourceId);
  const tgtEd = edTitleIds.has(e.targetId);
  if ((srcEd && !tgtEd) || (!srcEd && tgtEd)) {
    edCrossContamination = true;
  }

  const srcIns = insTitleIds.has(e.sourceId);
  const tgtIns = insTitleIds.has(e.targetId);
  if ((srcIns && !tgtIns) || (!srcIns && tgtIns)) {
    insCrossContamination = true;
  }
});

matrixRows.push({
  test: 'Cross-franchise contamination',
  evilDead: !edCrossContamination ? 'PASS (0 external edges)' : 'FAIL',
  insidious: !insCrossContamination ? 'PASS (0 external edges)' : 'FAIL',
  result: !edCrossContamination && !insCrossContamination ? '✅ PASS' : '❌ FAIL',
});

// Print Matrix
console.table(matrixRows);

// Additional Single-Source Counting Check
console.log('\n--- SINGLE-SOURCE DATA COUNTING CHECK ---');
console.log(
  `Evil Dead:  Movies = ${edCatalog.filter((c) => c.type === 'movie').length} (Header: ${edFranchiseObj?.total_movies}) | Series = ${edCatalog.filter((c) => c.type === 'series').length} (Header: ${edFranchiseObj?.total_series})`
);
console.log(
  `Insidious:  Movies = ${insCatalog.filter((c) => c.type === 'movie').length} (Header: ${insFranchiseObj?.total_movies}) | Series = ${insCatalog.filter((c) => c.type === 'series').length} (Header: ${insFranchiseObj?.total_series})`
);

const countingPassed =
  edCatalog.filter((c) => c.type === 'movie').length === edFranchiseObj?.total_movies &&
  edCatalog.filter((c) => c.type === 'series').length === edFranchiseObj?.total_series &&
  insCatalog.filter((c) => c.type === 'movie').length === insFranchiseObj?.total_movies &&
  insCatalog.filter((c) => c.type === 'series').length === insFranchiseObj?.total_series;

console.log(`Single-Source Counting Result: ${countingPassed ? '✅ PASS' : '❌ FAIL'}\n`);

const allMatrixPassed = matrixRows.every((r) => r.result.includes('PASS')) && countingPassed;

console.log(`Overall Isolation Suite Result: ${allMatrixPassed ? '✅ ALL ISOLATION TESTS PASSED' : '❌ ISOLATION FAILURES DETECTED'}\n`);

declare const process: { exit: (code: number) => void };

if (!allMatrixPassed && typeof process !== 'undefined') {
  process.exit(1);
}
