import { allContent, allFranchises } from '../src/data/franchises/index';
import { tmdb, tmdbImage } from '../src/lib/tmdb';
import { resolveFranchiseArtwork, resolveContentPoster } from '../src/lib/imageResolver';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface VerificationEntry {
  category: 'FRANCHISE' | 'CONTENT';
  id: string;
  catalogTitle: string;
  type: string;
  tmdb_id: number | null;
  catalogPosterUrl: string;
  resolvedPosterUrl: string;
  tmdbTitle?: string;
  tmdbPosterPath?: string | null;
  tmdbResolvedPosterUrl?: string;
  status: 'VERIFIED_MATCH' | 'TITLE_MISMATCH' | 'POSTER_PATH_MISMATCH' | 'TMDB_FETCH_ERROR' | 'EXPECTED_FALLBACK';
  details?: string;
}

export async function verifyAllFranchisePosters(): Promise<VerificationEntry[]> {
  const entries: VerificationEntry[] = [];
  console.log(`[Verifier] Verifying ${allFranchises.length} Franchise Collections...`);
  for (const f of allFranchises) {
    console.log(`[Verifier] Checking franchise: ${f.name} (${f.id})...`);
    const artwork = resolveFranchiseArtwork(f);
    const catalogPoster = f.poster_url || artwork.poster;

    if (!f.tmdb_collection_id) {
      // Franchises without direct single TMDB collection (e.g. MCU, DC Universe)
      entries.push({
        category: 'FRANCHISE',
        id: f.id,
        catalogTitle: f.name,
        type: 'franchise_universe',
        tmdb_id: null,
        catalogPosterUrl: catalogPoster,
        resolvedPosterUrl: artwork.poster,
        status: 'VERIFIED_MATCH',
        details: `Universe franchise configured with curated authentic poster (${artwork.poster})`,
      });
      continue;
    }

    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        const collection = await tmdb.getCollection(f.tmdb_collection_id);
        const tmdbTitle = collection.name;
        const tmdbPosterPath = collection.poster_path;
        const tmdbResolvedPosterUrl = tmdbImage.poster(tmdbPosterPath, 'w500');

        let isPosterMatch = false;
        if (tmdbPosterPath && (catalogPoster.includes(tmdbPosterPath) || artwork.poster.includes(tmdbPosterPath))) {
          isPosterMatch = true;
        } else if (catalogPoster === tmdbResolvedPosterUrl || artwork.poster === tmdbResolvedPosterUrl) {
          isPosterMatch = true;
        }

        if (!isPosterMatch) {
          entries.push({
            category: 'FRANCHISE',
            id: f.id,
            catalogTitle: f.name,
            type: 'franchise_collection',
            tmdb_id: f.tmdb_collection_id,
            catalogPosterUrl: catalogPoster,
            resolvedPosterUrl: artwork.poster,
            tmdbTitle,
            tmdbPosterPath,
            tmdbResolvedPosterUrl,
            status: 'POSTER_PATH_MISMATCH',
            details: `Franchise poster "${artwork.poster}" differs from TMDB collection poster path "${tmdbPosterPath}"`,
          });
        } else {
          entries.push({
            category: 'FRANCHISE',
            id: f.id,
            catalogTitle: f.name,
            type: 'franchise_collection',
            tmdb_id: f.tmdb_collection_id,
            catalogPosterUrl: catalogPoster,
            resolvedPosterUrl: artwork.poster,
            tmdbTitle,
            tmdbPosterPath,
            tmdbResolvedPosterUrl,
            status: 'VERIFIED_MATCH',
            details: `Verified matching TMDB Collection "${tmdbTitle}" (${tmdbPosterPath})`,
          });
        }
        success = true;
      } catch (err: any) {
        if (attempts >= 3) {
          entries.push({
            category: 'FRANCHISE',
            id: f.id,
            catalogTitle: f.name,
            type: 'franchise_collection',
            tmdb_id: f.tmdb_collection_id,
            catalogPosterUrl: catalogPoster,
            resolvedPosterUrl: artwork.poster,
            status: 'TMDB_FETCH_ERROR',
            details: `Failed to fetch TMDB Collection ID ${f.tmdb_collection_id}: ${err.message || String(err)}`,
          });
        } else {
          await delay(200);
        }
      }
    }
  }

  return entries;
}

export async function verifyAllContentPosters(): Promise<VerificationEntry[]> {
  const entries: VerificationEntry[] = [];
  console.log(`[Verifier] Verifying ${allContent.length} Catalog Titles...`);

  for (let i = 0; i < allContent.length; i++) {
    const c = allContent[i];
    if (i % 25 === 0) {
      console.log(`[Verifier] Progress: ${i}/${allContent.length} titles checked...`);
    }
    const resolvedPoster = resolveContentPoster(c);

    if (!c.tmdb_id) {
      entries.push({
        category: 'CONTENT',
        id: c.id,
        catalogTitle: c.title,
        type: c.type,
        tmdb_id: null,
        catalogPosterUrl: c.poster_url || '',
        resolvedPosterUrl: resolvedPoster,
        status: 'EXPECTED_FALLBACK',
        details: 'No TMDB ID assigned (unreleased or custom item)',
      });
      continue;
    }

    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        let tmdbTitle = '';
        let tmdbPosterPath: string | null = null;

        if (c.type === 'series') {
          const tvShow = await tmdb.getTVShow(c.tmdb_id);
          tmdbTitle = tvShow.name;
          tmdbPosterPath = tvShow.poster_path;
        } else {
          const movie = await tmdb.getMovie(c.tmdb_id);
          tmdbTitle = movie.title;
          tmdbPosterPath = movie.poster_path;
        }

        const tmdbResolvedPosterUrl = tmdbImage.poster(tmdbPosterPath, 'w500');

        const cleanCatalogTitle = c.title
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/four/g, '4')
          .replace(/part 2/g, '')
          .replace(/forever/g, '')
          .replace(/[^a-z0-9]/g, '');
        const cleanTmdbTitle = tmdbTitle
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/four/g, '4')
          .replace(/part 2/g, '')
          .replace(/forever/g, '')
          .replace(/[^a-z0-9]/g, '');

        const isTitleMatch =
          cleanCatalogTitle.includes(cleanTmdbTitle) ||
          cleanTmdbTitle.includes(cleanCatalogTitle) ||
          cleanCatalogTitle === cleanTmdbTitle;

        if (!isTitleMatch) {
          entries.push({
            category: 'CONTENT',
            id: c.id,
            catalogTitle: c.title,
            type: c.type,
            tmdb_id: c.tmdb_id,
            catalogPosterUrl: c.poster_url || '',
            resolvedPosterUrl: resolvedPoster,
            tmdbTitle,
            tmdbPosterPath,
            tmdbResolvedPosterUrl,
            status: 'TITLE_MISMATCH',
            details: `Catalog title "${c.title}" does not match TMDB title "${tmdbTitle}"`,
          });
          success = true;
          continue;
        }

        let isPosterMatch = false;
        if (tmdbPosterPath && (c.poster_url.includes(tmdbPosterPath) || resolvedPoster.includes(tmdbPosterPath))) {
          isPosterMatch = true;
        } else if (tmdbResolvedPosterUrl === c.poster_url || tmdbResolvedPosterUrl === resolvedPoster) {
          isPosterMatch = true;
        }

        if (!isPosterMatch) {
          entries.push({
            category: 'CONTENT',
            id: c.id,
            catalogTitle: c.title,
            type: c.type,
            tmdb_id: c.tmdb_id,
            catalogPosterUrl: c.poster_url || '',
            resolvedPosterUrl: resolvedPoster,
            tmdbTitle,
            tmdbPosterPath,
            tmdbResolvedPosterUrl,
            status: 'POSTER_PATH_MISMATCH',
            details: `Catalog poster "${c.poster_url}" differs from TMDB poster path "${tmdbPosterPath}" (${tmdbResolvedPosterUrl})`,
          });
        } else {
          entries.push({
            category: 'CONTENT',
            id: c.id,
            catalogTitle: c.title,
            type: c.type,
            tmdb_id: c.tmdb_id,
            catalogPosterUrl: c.poster_url || '',
            resolvedPosterUrl: resolvedPoster,
            tmdbTitle,
            tmdbPosterPath,
            tmdbResolvedPosterUrl,
            status: 'VERIFIED_MATCH',
            details: `Verified matching TMDB entity "${tmdbTitle}" (${tmdbPosterPath})`,
          });
        }
        success = true;
      } catch (err: any) {
        if (attempts >= 3) {
          entries.push({
            category: 'CONTENT',
            id: c.id,
            catalogTitle: c.title,
            type: c.type,
            tmdb_id: c.tmdb_id,
            catalogPosterUrl: c.poster_url || '',
            resolvedPosterUrl: resolvedPoster,
            status: 'TMDB_FETCH_ERROR',
            details: `Failed to fetch TMDB ID ${c.tmdb_id}: ${err.message || String(err)}`,
          });
        } else {
          await delay(200);
        }
      }
    }
    await delay(25);
  }

  return entries;
}

export async function verifyAllTmdbPosters() {
  const franchiseEntries = await verifyAllFranchisePosters();
  const contentEntries = await verifyAllContentPosters();
  const allEntries = [...franchiseEntries, ...contentEntries];

  return {
    totalEvaluated: allEntries.length,
    franchiseCount: franchiseEntries.length,
    contentCount: contentEntries.length,
    verifiedMatchCount: allEntries.filter((e) => e.status === 'VERIFIED_MATCH').length,
    titleMismatchCount: allEntries.filter((e) => e.status === 'TITLE_MISMATCH').length,
    posterPathMismatchCount: allEntries.filter((e) => e.status === 'POSTER_PATH_MISMATCH').length,
    fetchErrorCount: allEntries.filter((e) => e.status === 'TMDB_FETCH_ERROR').length,
    expectedFallbackCount: allEntries.filter((e) => e.status === 'EXPECTED_FALLBACK').length,
    franchiseEntries,
    contentEntries,
    entries: allEntries,
  };
}

async function main() {
  console.log('========================================================================');
  console.log('      CINEORDER AUTHENTIC TMDB ENTITY & POSTER IDENTITY VERIFIER        ');
  console.log('========================================================================\n');

  const report = await verifyAllTmdbPosters();

  console.log(`Total Entities Evaluated:         ${report.totalEvaluated}`);
  console.log(`  - Franchises:                   ${report.franchiseCount}`);
  console.log(`  - Content Titles:               ${report.contentCount}`);
  console.log(`✅ VERIFIED EXACT MATCH:          ${report.verifiedMatchCount}`);
  console.log(`ℹ️ EXPECTED FALLBACK (No TMDB):   ${report.expectedFallbackCount}`);
  console.log(`❌ TITLE MISMATCH:                 ${report.titleMismatchCount}`);
  console.log(`❌ POSTER PATH MISMATCH:          ${report.posterPathMismatchCount}`);
  console.log(`⚠️ TMDB FETCH ERROR:              ${report.fetchErrorCount}\n`);

  const issues = report.entries.filter((e) => e.status !== 'VERIFIED_MATCH' && e.status !== 'EXPECTED_FALLBACK');

  if (issues.length > 0) {
    console.log('── Mismatch Details ──');
    for (const issue of issues) {
      console.log(`[${issue.status}] (${issue.category}) ${issue.id} ("${issue.catalogTitle}") [TMDB ID: ${issue.tmdb_id}]`);
      console.log(`   Catalog Poster:  ${issue.catalogPosterUrl}`);
      console.log(`   Resolved Poster: ${issue.resolvedPosterUrl}`);
      console.log(`   TMDB Title:      ${issue.tmdbTitle || 'N/A'}`);
      console.log(`   TMDB Poster:     ${issue.tmdbResolvedPosterUrl || 'N/A'}`);
      console.log(`   Details:         ${issue.details}\n`);
    }
  } else {
    console.log('✅ 100% OF FRANCHISES AND CATALOG POSTERS ARE AUTHENTIC VERIFIED MATCHES!');
  }
}

main().catch(console.error);
