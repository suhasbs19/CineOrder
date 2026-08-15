import { allContent, allFranchises } from '../src/data/franchises/index';

export interface ImageAuditResult {
  id: string;
  title: string;
  franchise_id: string;
  tmdb_id?: number;
  poster_url: string;
  backdrop_url?: string;
  status: 'PASS' | 'EXPECTED_FALLBACK' | 'MISSING' | 'INVALID_URL' | 'DUPLICATE_POSTER' | 'DUPLICATE_TMDB_ID' | 'FRANCHISE_POSTER_LEAK' | 'TMDB_TITLE_MISMATCH';
  issueDetails?: string;
}

export function auditCatalogImages(): {
  totalTitles: number;
  totalFranchises: number;
  results: ImageAuditResult[];
  summary: {
    passCount: number;
    expectedFallbackCount: number;
    missingCount: number;
    invalidUrlCount: number;
    duplicatePosterCount: number;
    duplicateTmdbIdCount: number;
    franchisePosterLeakCount: number;
    tmdbTitleMismatchCount: number;
  };
} {
  const results: ImageAuditResult[] = [];

  const posterMap = new Map<string, string[]>(); // poster_url -> title IDs
  const tmdbIdMap = new Map<number, string[]>(); // tmdb_id -> title IDs
  const franchisePosterSet = new Set<string>(
    allFranchises.map((f) => f.poster_url).filter(Boolean)
  );

  // Track occurrences
  for (const c of allContent) {
    if (c.poster_url && c.poster_url !== '/placeholder-poster.svg' && c.poster_url !== '/placeholder.svg') {
      const existing = posterMap.get(c.poster_url) || [];
      existing.push(c.id);
      posterMap.set(c.poster_url, existing);
    }
    if (c.tmdb_id) {
      const existing = tmdbIdMap.get(c.tmdb_id) || [];
      existing.push(c.id);
      tmdbIdMap.set(c.tmdb_id, existing);
    }
  }

  for (const c of allContent) {
    let status: ImageAuditResult['status'] = 'PASS';
    let issueDetails = '';

    // Check 1: Placeholder / Missing Poster
    if (!c.poster_url || c.poster_url.trim() === '' || c.poster_url === '/placeholder-poster.svg' || c.poster_url === '/placeholder.svg') {
      status = 'EXPECTED_FALLBACK';
      issueDetails = 'No official artwork available; correctly using CineOrder fallback';
    }
    // Check 2: Invalid Poster URL format
    else if (!c.poster_url.startsWith('http://') && !c.poster_url.startsWith('https://') && !c.poster_url.startsWith('/')) {
      status = 'INVALID_URL';
      issueDetails = `Poster URL "${c.poster_url}" is not a valid HTTP/HTTPS or relative URL`;
    }
    // Check 3: Franchise Poster Leak (movie using franchise poster)
    else if (franchisePosterSet.has(c.poster_url)) {
      status = 'FRANCHISE_POSTER_LEAK';
      issueDetails = `Movie poster URL matches franchise poster URL: ${c.poster_url}`;
    }
    // Check 4: Duplicate Poster Mapping (two distinct titles sharing exact same poster URL)
    else {
      const titlesWithSamePoster = posterMap.get(c.poster_url) || [];
      if (titlesWithSamePoster.length > 1) {
        status = 'DUPLICATE_POSTER';
        issueDetails = `Poster URL is shared with ${titlesWithSamePoster.filter((id) => id !== c.id).join(', ')}`;
      }
    }

    // Check 5: Duplicate TMDB ID Mapping (two distinct titles sharing exact same TMDB ID)
    if (c.tmdb_id && (status === 'PASS' || status === 'EXPECTED_FALLBACK')) {
      const titlesWithSameTmdbId = tmdbIdMap.get(c.tmdb_id) || [];
      if (titlesWithSameTmdbId.length > 1) {
        status = 'DUPLICATE_TMDB_ID';
        issueDetails = `TMDB ID ${c.tmdb_id} is shared with ${titlesWithSameTmdbId.filter((id) => id !== c.id).join(', ')}`;
      }
    }

    results.push({
      id: c.id,
      title: c.title,
      franchise_id: c.franchise_id,
      tmdb_id: c.tmdb_id,
      poster_url: c.poster_url || '',
      backdrop_url: c.backdrop_url || '',
      status,
      issueDetails,
    });
  }

  const summary = {
    passCount: results.filter((r) => r.status === 'PASS').length,
    expectedFallbackCount: results.filter((r) => r.status === 'EXPECTED_FALLBACK').length,
    missingCount: results.filter((r) => r.status === 'MISSING').length,
    invalidUrlCount: results.filter((r) => r.status === 'INVALID_URL').length,
    duplicatePosterCount: results.filter((r) => r.status === 'DUPLICATE_POSTER').length,
    duplicateTmdbIdCount: results.filter((r) => r.status === 'DUPLICATE_TMDB_ID').length,
    franchisePosterLeakCount: results.filter((r) => r.status === 'FRANCHISE_POSTER_LEAK').length,
    tmdbTitleMismatchCount: results.filter((r) => r.status === 'TMDB_TITLE_MISMATCH').length,
  };

  return {
    totalTitles: allContent.length,
    totalFranchises: allFranchises.length,
    results,
    summary,
  };
}

function main() {
  console.log('========================================================================');
  console.log('           CINEORDER GLOBAL CATALOG IMAGE INTEGRITY AUDIT               ');
  console.log('========================================================================\n');

  const audit = auditCatalogImages();

  console.log(`Total Franchises Evaluated: ${audit.totalFranchises}`);
  console.log(`Total Movie/Content Titles: ${audit.totalTitles}\n`);

  console.log('── Summary Statistics ──');
  console.log(`  ✅ PASS:                     ${audit.summary.passCount}`);
  console.log(`  ℹ️ EXPECTED FALLBACK:        ${audit.summary.expectedFallbackCount}`);
  console.log(`  ⚠️ MISSING:                  ${audit.summary.missingCount}`);
  console.log(`  ❌ INVALID URL:              ${audit.summary.invalidUrlCount}`);
  console.log(`  ❌ DUPLICATE POSTER:         ${audit.summary.duplicatePosterCount}`);
  console.log(`  ❌ DUPLICATE TMDB ID:        ${audit.summary.duplicateTmdbIdCount}`);
  console.log(`  ❌ FRANCHISE POSTER LEAK:    ${audit.summary.franchisePosterLeakCount}`);
  console.log(`  ❌ TMDB TITLE MISMATCH:      ${audit.summary.tmdbTitleMismatchCount}\n`);

  const issues = audit.results.filter((r) => r.status !== 'PASS' && r.status !== 'EXPECTED_FALLBACK');

  if (issues.length > 0) {
    console.log('── Detailed Catalog Anomalies ──');
    for (const item of issues) {
      console.log(`[${item.status}] ${item.id} ("${item.title}") [Franchise: ${item.franchise_id}] [TMDB: ${item.tmdb_id || 'N/A'}]`);
      console.log(`   Poster: ${item.poster_url}`);
      console.log(`   Details: ${item.issueDetails}\n`);
    }
  } else {
    console.log('✅ ZERO ANOMALIES DETECTED IN SOURCE CATALOG!');
  }
}

main();
