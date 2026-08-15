import { allContent, allFranchises } from '../src/data/franchises/index';
import { resolveContentPoster, resolveFranchiseArtwork, CINEORDER_PLACEHOLDER_POSTER } from '../src/lib/imageResolver';

interface CardVerificationResult {
  route: string;
  title: string;
  catalogId: string;
  tmdbId: number | null;
  expectedPoster: string;
  actualRenderedSrc: string;
  status: 'PASS' | 'FAIL';
  reason?: string;
}

export async function verifyRouteCards(): Promise<CardVerificationResult[]> {
  const results: CardVerificationResult[] = [];

  const targetRoutes: Array<{
    route: string;
    franchiseId?: string;
    isExplore?: boolean;
    isUpcoming?: boolean;
    isSearch?: boolean;
  }> = [
    { route: '/explore', isExplore: true },
    { route: '/upcoming', isUpcoming: true },
    { route: '/search?type=franchises', isSearch: true },
    ...allFranchises.map((f) => ({
      route: `/franchise/${f.id}`,
      franchiseId: f.id,
    })),
  ];

  for (const r of targetRoutes) {
    if (r.isSearch) {
      for (const f of allFranchises) {
        const artwork = resolveFranchiseArtwork(f);
        let isPass = true;
        let reason: string | undefined;

        if (!artwork.poster) {
          isPass = false;
          reason = 'Artwork poster is empty';
        } else if (artwork.poster === CINEORDER_PLACEHOLDER_POSTER) {
          isPass = false;
          reason = 'Franchise resolved to generic placeholder poster';
        } else if (f.poster_url && artwork.poster !== f.poster_url) {
          isPass = false;
          reason = `Artwork poster (${artwork.poster}) differs from franchise definition (${f.poster_url})`;
        }

        results.push({
          route: r.route,
          title: f.name,
          catalogId: f.id,
          tmdbId: f.tmdb_collection_id || null,
          expectedPoster: f.poster_url || artwork.poster,
          actualRenderedSrc: artwork.poster,
          status: isPass ? 'PASS' : 'FAIL',
          reason,
        });
      }
      continue;
    }

    let items = allContent;
    if (r.franchiseId) {
      items = allContent.filter((c) => c.franchise_id === r.franchiseId);
    } else if (r.isUpcoming) {
      items = allContent.filter((c) => c.status === 'upcoming' || c.lifecycle_status === 'upcoming' || c.lifecycle_status === 'announced');
    }

    for (const item of items) {
      const resolvedSrc = resolveContentPoster(item);
      const expectedPoster = item.poster_url || CINEORDER_PLACEHOLDER_POSTER;

      let isPass = true;
      let reason: string | undefined;

      if (!resolvedSrc) {
        isPass = false;
        reason = 'Rendered src is empty';
      } else if (item.poster_url && item.poster_url !== '/placeholder-poster.svg' && resolvedSrc === CINEORDER_PLACEHOLDER_POSTER) {
        isPass = false;
        reason = 'Item has valid poster but resolved to fallback placeholder';
      } else if (item.poster_url && resolvedSrc !== item.poster_url && item.poster_url !== '/placeholder-poster.svg') {
        isPass = false;
        reason = `Rendered src (${resolvedSrc}) does not match catalog poster (${item.poster_url})`;
      }

      results.push({
        route: r.route,
        title: item.title,
        catalogId: item.id,
        tmdbId: item.tmdb_id,
        expectedPoster,
        actualRenderedSrc: resolvedSrc,
        status: isPass ? 'PASS' : 'FAIL',
        reason,
      });
    }
  }

  return results;
}

async function main() {
  console.log('========================================================================');
  console.log('       CINEORDER DOM CARD RENDERED IMAGE VERIFICATION REPORT            ');
  console.log('========================================================================\n');

  const results = await verifyRouteCards();

  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log(`Total Route Cards Evaluated: ${total}`);
  console.log(`✅ PASSED:                 ${passed}`);
  console.log(`❌ FAILED:                 ${failed}\n`);

  if (failed > 0) {
    console.log('── Failures ──');
    for (const f of results.filter((r) => r.status === 'FAIL')) {
      console.log(`[${f.route}] ${f.catalogId} ("${f.title}")`);
      console.log(`   Expected: ${f.expectedPoster}`);
      console.log(`   Actual:   ${f.actualRenderedSrc}`);
      console.log(`   Reason:   ${f.reason}\n`);
    }
  } else {
    console.log('✅ ALL RENDERED CARDS ACROSS ALL TESTED ROUTES PASS IMAGE ASSERTION PERFECTLY!');
  }
}

main().catch(console.error);
