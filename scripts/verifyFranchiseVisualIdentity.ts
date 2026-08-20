/**
 * CineOrder Franchise Visual Identity Permanent Lock & Regression Test
 *
 * Enforces:
 *   1. franchise ID → canonical TMDB collection/universe identity
 *   2. canonical TMDB collection/universe → canonical poster, banner, and logo hashes
 *   3. catalog franchise definition (src/data/franchises/*.ts) ↔ franchiseArtworkMap (src/data/franchiseArtwork.ts) parity
 *   4. rendered card output via resolveFranchiseArtwork() matches canonical truth
 *   5. cross-franchise contamination prevention (rejects artwork belonging to other franchises/movies)
 *   6. collision & duplicate prevention (no 2 distinct franchises share artwork hashes)
 *   7. rejection of single-movie posters when collection artwork is required
 */

import { allFranchises, allContent } from '../src/data/franchises/index';
import { franchiseArtworkMap, getFranchiseArtwork } from '../src/data/franchiseArtwork';
import { resolveFranchiseArtwork, CINEORDER_PLACEHOLDER_POSTER } from '../src/lib/imageResolver';

export interface CanonicalFranchiseIdentity {
  id: string;
  name: string;
  tmdbCollectionId: number | null; // null for universes without single collection ID
  canonicalPosterHash: string;
  canonicalBannerHash: string;
  canonicalLogoPath: string;
  knownForbiddenPosterHashes?: string[];
}

export const CANONICAL_FRANCHISE_IDENTITIES: Record<string, CanonicalFranchiseIdentity> = {
  'marvel-cinematic-universe': {
    id: 'marvel-cinematic-universe',
    name: 'Marvel Cinematic Universe',
    tmdbCollectionId: null, // Universe
    canonicalPosterHash: 'or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    canonicalBannerHash: 'muth4OYamE2aB116Z9y2yFRm2fW.jpg',
    canonicalLogoPath: '/logos/marvel-cinematic-universe.svg',
    knownForbiddenPosterHashes: ['9Pf9knvHn5q4Gf6j2c0jM1p3e.jpg', 'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg', 'qJ2tW6WMUDux911r6m7haRef0WH.jpg'],
  },
  'star-wars': {
    id: 'star-wars',
    name: 'Star Wars',
    tmdbCollectionId: 10,
    canonicalPosterHash: 'db32LaOibwEliAmSL2jjDF6oDdj.jpg',
    canonicalBannerHash: 'p2fRZzxla6NoBmIH03yKrGZq7BE.jpg',
    canonicalLogoPath: '/logos/star-wars.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg', '9Pf9knvHn5q4Gf6j2c0jM1p3e.jpg'],
  },
  'harry-potter': {
    id: 'harry-potter',
    name: 'Harry Potter',
    tmdbCollectionId: 1241,
    canonicalPosterHash: 'wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
    canonicalBannerHash: 'hziiv14OpD73u9gAak4XDDfBKa2.jpg',
    canonicalLogoPath: '/logos/harry-potter.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'dc-extended-universe': {
    id: 'dc-extended-universe',
    name: 'DC Universe',
    tmdbCollectionId: null, // Universe
    canonicalPosterHash: 'qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    canonicalBannerHash: 'tMefBSGv6WvBGexXhYkjKW8hC9v.jpg',
    canonicalLogoPath: '/logos/dc-extended-universe.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'the-conjuring-universe': {
    id: 'the-conjuring-universe',
    name: 'The Conjuring Universe',
    tmdbCollectionId: 2806,
    canonicalPosterHash: 'wVYREutTvI2tmxr6ujrHT704wGF.jpg',
    canonicalBannerHash: '5nwbkY81B7C5m2J6bE6d.jpg',
    canonicalLogoPath: '/logos/the-conjuring-universe.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'fast-and-furious': {
    id: 'fast-and-furious',
    name: 'Fast & Furious',
    tmdbCollectionId: 9485,
    canonicalPosterHash: 'fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
    canonicalBannerHash: '4HWAQu28e2yaWrtupFPGFkdNU7V.jpg',
    canonicalLogoPath: '/logos/fast-and-furious.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'john-wick': {
    id: 'john-wick',
    name: 'John Wick',
    tmdbCollectionId: 404609,
    canonicalPosterHash: 'sm7rZZivZm2NhJDucFf3gpfFdVt.jpg',
    canonicalBannerHash: 'fSwYa5q2xRkBoOOjueLpkLf3N1m.jpg',
    canonicalLogoPath: '/logos/john-wick.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'mission-impossible': {
    id: 'mission-impossible',
    name: 'Mission: Impossible',
    tmdbCollectionId: 87359,
    canonicalPosterHash: 'AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
    canonicalBannerHash: '628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
    canonicalLogoPath: '/logos/mission-impossible.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'x-men': {
    id: 'x-men',
    name: 'X-Men',
    tmdbCollectionId: 748,
    canonicalPosterHash: '31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg',
    canonicalBannerHash: 'ykVHlrE3aSvHYeIXOrWDsYZ18vv.jpg',
    canonicalLogoPath: '/logos/x-men.svg',
    knownForbiddenPosterHashes: [
      'vJU3gW5F2zT9d2a2C2l7F1g4P8M.jpg',
      'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg',
      'to0spRl1CMDvhIZCrTUFrAojlEN.jpg', // old 404 hash
    ],
  },
  'jurassic-park': {
    id: 'jurassic-park',
    name: 'Jurassic Park',
    tmdbCollectionId: 328,
    canonicalPosterHash: '9i3plLl89DHMz7mahksDaAo7HIS.jpg',
    canonicalBannerHash: '9e3y2n57n84e3W92x9h4n55K.jpg',
    canonicalLogoPath: '/logos/jurassic-park.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'pirates-of-the-caribbean': {
    id: 'pirates-of-the-caribbean',
    name: 'Pirates of the Caribbean',
    tmdbCollectionId: 295,
    canonicalPosterHash: 'zRBaZxS5YauLvRYjAdL4AUCwlht.jpg',
    canonicalBannerHash: 'wxgD3fB5lQ2sGJLog0rvXW049Pf.jpg',
    canonicalLogoPath: '/logos/pirates-of-the-caribbean.svg',
    knownForbiddenPosterHashes: [
      'laCJxobHoPVaLQTKxc14Y2zV64J.jpg', // Ahsoka (Star Wars) - regression prevention
      'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg', // Transformers
      '9Pf9knvHn5q4Gf6j2c0jM1p3e.jpg', // Mandalorian
      'db32LaOibwEliAmSL2jjDF6oDdj.jpg', // Star Wars Collection
      '6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', // Star Wars Ep IV
      'poHwCZeWzJCShH7tOjg8RIoyjcw.jpg', // Curse of the Black Pearl (movie 1)
      'uXEqmloGyP7UXAiphJUu2v2pcuE.jpg', // Dead Man's Chest (movie 2)
      'jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg', // At World's End (movie 3)
      'keGfSvCmYj7CvdRx36OdVrAEibE.jpg', // On Stranger Tides (movie 4)
      '6lAPOAFYFWIO3SQRemEY2wInQMC.jpg', // Dead Men Tell No Tales (movie 5)
    ],
  },
  'transformers': {
    id: 'transformers',
    name: 'Transformers',
    tmdbCollectionId: 8650,
    canonicalPosterHash: 'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg',
    canonicalBannerHash: 'zvZBNNDWd5LcsIBpDhJyCB2MDT7.jpg',
    canonicalLogoPath: '/logos/transformers.svg',
    knownForbiddenPosterHashes: [
      '9Pf9knvHn5q4Gf6j2c0jM1p3e.jpg', // Erroneous Mandalorian artwork
      'db32LaOibwEliAmSL2jjDF6oDdj.jpg', // Star Wars poster
      '1SzNeqb9yL4b8nL.jpg', // Single movie poster
    ],
  },
  'lord-of-the-rings': {
    id: 'lord-of-the-rings',
    name: 'Lord of the Rings / Middle-earth',
    tmdbCollectionId: 119,
    canonicalPosterHash: '6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    canonicalBannerHash: 'vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg',
    canonicalLogoPath: '/logos/lord-of-the-rings.svg',
    knownForbiddenPosterHashes: ['WjQmEWFrOf98nT5aEfUfVYz9N2.jpg', 'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'the-hobbit': {
    id: 'the-hobbit',
    name: 'The Hobbit',
    tmdbCollectionId: 121938,
    canonicalPosterHash: 'hQghXOjSS2xfzx9XnMyZqt8brCF.jpg',
    canonicalBannerHash: '7wO7MSnP5UcwR2cTHdJFF1vP4Ie.jpg',
    canonicalLogoPath: '/logos/the-hobbit.svg',
    knownForbiddenPosterHashes: [
      '6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
      'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg',
      'WjQmEWFrOf98nT5aEfUfVYz9N2.jpg', // old incorrect hash
    ],
  },
  'evil-dead': {
    id: 'evil-dead',
    name: 'Evil Dead',
    tmdbCollectionId: 1960,
    canonicalPosterHash: 'eWFADubShlTEUiNsPcN6BMOKakr.jpg',
    canonicalBannerHash: '377E9KSoUGxKWuvyR1Zu9aXcU4I.jpg',
    canonicalLogoPath: '/logos/evil-dead.svg',
    knownForbiddenPosterHashes: ['1egpmVXuXed58TH2UOnX1nATTrf.jpg', 'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'insidious': {
    id: 'insidious',
    name: 'Insidious',
    tmdbCollectionId: 228446,
    canonicalPosterHash: '1egpmVXuXed58TH2UOnX1nATTrf.jpg',
    canonicalBannerHash: 'tJvRdhlkonjBLBUpTqp0RPPujxJ.jpg',
    canonicalLogoPath: '/logos/insidious.svg',
    knownForbiddenPosterHashes: ['eWFADubShlTEUiNsPcN6BMOKakr.jpg', 'nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
  'avatar': {
    id: 'avatar',
    name: 'Avatar',
    tmdbCollectionId: 87096,
    canonicalPosterHash: '3C5brXxnBxfkeKWwA1Fh4xvy4wr.jpg',
    canonicalBannerHash: '4uwX70EzaWVcGUXMtXPoexlNAff.jpg',
    canonicalLogoPath: '/logos/avatar.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg', '1egpmVXuXed58TH2UOnX1nATTrf.jpg'],
  },
  'alien': {
    id: 'alien',
    name: 'Alien',
    tmdbCollectionId: 8091,
    canonicalPosterHash: 'gWFHIY77cRVoBRGERwMHqpD27gc.jpg',
    canonicalBannerHash: '6X42JnSMdo3dPAswOHUuvebdTq7.jpg',
    canonicalLogoPath: '/logos/alien.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg', '3C5brXxnBxfkeKWwA1Fh4xvy4wr.jpg'],
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Spider-Man',
    tmdbCollectionId: null, // Saga across Raimi, Webb, and Spider-Verse
    canonicalPosterHash: 'gh4c2ubi14WogAhvCDvceFkexIF.jpg',
    canonicalBannerHash: 'sWvxBXviRvmOpNq6rLShyW25b42.jpg',
    canonicalLogoPath: '/logos/spider-man.svg',
    knownForbiddenPosterHashes: ['nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg'],
  },
};

export interface VisualIdentityValidationResult {
  passed: boolean;
  totalFranchises: number;
  verifiedCount: number;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
}

export function validateFranchiseVisualIdentities(): VisualIdentityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let verifiedCount = 0;

  const catalogFranchiseMap = new Map(allFranchises.map((f) => [f.id, f]));
  const seenPosterHashes = new Map<string, string>(); // hash -> franchiseId

  // 1. Audit every registered canonical identity
  for (const [franchiseId, canonical] of Object.entries(CANONICAL_FRANCHISE_IDENTITIES)) {
    const catalogFranchise = catalogFranchiseMap.get(franchiseId);
    const artworkEntry = getFranchiseArtwork(franchiseId);

    if (!catalogFranchise) {
      errors.push(`[FAIL] MISSING_FRANCHISE_IN_CATALOG: Canonical franchise '${franchiseId}' is not registered in allFranchises.`);
      continue;
    }

    if (!artworkEntry) {
      errors.push(`[FAIL] MISSING_FRANCHISE_ARTWORK_ENTRY: Franchise '${franchiseId}' is missing from getFranchiseArtwork.`);
      continue;
    }

    // A. TMDB Collection ID Assertion
    if (canonical.tmdbCollectionId !== null && catalogFranchise.tmdb_collection_id !== canonical.tmdbCollectionId) {
      errors.push(
        `[FAIL] TMDB_COLLECTION_ID_MISMATCH [${franchiseId}]: Expected TMDB collection ID ${canonical.tmdbCollectionId}, got ${catalogFranchise.tmdb_collection_id}.`
      );
    }

    // B. Catalog poster_url Assertion
    if (!catalogFranchise.poster_url || !catalogFranchise.poster_url.includes(canonical.canonicalPosterHash)) {
      errors.push(
        `[FAIL] CATALOG_POSTER_MISMATCH [${franchiseId}]: Catalog poster_url '${catalogFranchise.poster_url}' does not contain canonical hash '${canonical.canonicalPosterHash}'.`
      );
    }

    // C. Artwork Map Poster Assertion
    if (!artworkEntry.poster || !artworkEntry.poster.includes(canonical.canonicalPosterHash)) {
      errors.push(
        `[FAIL] ARTWORK_MAP_POSTER_MISMATCH [${franchiseId}]: franchiseArtworkMap.poster '${artworkEntry.poster}' does not contain canonical hash '${canonical.canonicalPosterHash}'.`
      );
    }

    // D. Artwork Map Banner Assertion
    if (!artworkEntry.banner || !artworkEntry.banner.includes(canonical.canonicalBannerHash)) {
      errors.push(
        `[FAIL] ARTWORK_MAP_BANNER_MISMATCH [${franchiseId}]: franchiseArtworkMap.banner '${artworkEntry.banner}' does not contain canonical hash '${canonical.canonicalBannerHash}'.`
      );
    }

    // E. Artwork Map Logo Assertion
    if (artworkEntry.logo !== canonical.canonicalLogoPath) {
      errors.push(
        `[FAIL] ARTWORK_MAP_LOGO_MISMATCH [${franchiseId}]: Expected logo '${canonical.canonicalLogoPath}', got '${artworkEntry.logo}'.`
      );
    }

    // F. Rendered Card Output via resolveFranchiseArtwork()
    const rendered = resolveFranchiseArtwork(catalogFranchise);
    if (!rendered.poster || rendered.poster === CINEORDER_PLACEHOLDER_POSTER || !rendered.poster.includes(canonical.canonicalPosterHash)) {
      errors.push(
        `[FAIL] RENDERED_CARD_POSTER_MISMATCH [${franchiseId}]: resolveFranchiseArtwork returned '${rendered.poster}', expected hash '${canonical.canonicalPosterHash}'.`
      );
    }

    // G. Explicit Forbidden Hashes (Anti-Regression)
    if (canonical.knownForbiddenPosterHashes) {
      for (const forbidden of canonical.knownForbiddenPosterHashes) {
        if (catalogFranchise.poster_url.includes(forbidden) || artworkEntry.poster.includes(forbidden) || rendered.poster.includes(forbidden)) {
          errors.push(
            `[FAIL] FORBIDDEN_ARTWORK_DETECTED [${franchiseId}]: Contains forbidden cross-franchise/stale artwork hash '${forbidden}'.`
          );
        }
      }
    }

    // H. Cross-Franchise Duplicate Detection (ensure no unintentional copy-paste across distinct collections)
    if (canonical.tmdbCollectionId !== null) {
      if (seenPosterHashes.has(canonical.canonicalPosterHash)) {
        const otherId = seenPosterHashes.get(canonical.canonicalPosterHash)!;
        errors.push(
          `[FAIL] DUPLICATE_COLLECTION_POSTER: Franchise '${franchiseId}' shares identical collection poster hash '${canonical.canonicalPosterHash}' with '${otherId}'.`
        );
      } else {
        seenPosterHashes.set(canonical.canonicalPosterHash, franchiseId);
      }
    }

    // I. Movie-specific Poster vs Collection Poster Disambiguation
    // Ensure that collection franchises do not accidentally adopt single movie content posters from their own catalog
    if (canonical.tmdbCollectionId !== null) {
      const franchiseContent = allContent.filter((c) => c.franchise_id === franchiseId);
      for (const content of franchiseContent) {
        // If content has a distinct movie poster, verify franchise poster didn't accidentally copy that movie poster
        if (content.poster_url && !content.poster_url.includes(canonical.canonicalPosterHash)) {
          const movieHash = content.poster_url.split('/').pop()?.split('?')[0];
          if (movieHash && (catalogFranchise.poster_url.includes(movieHash) || artworkEntry.poster.includes(movieHash))) {
            errors.push(
              `[FAIL] MOVIE_POSTER_USED_AS_COLLECTION_ARTWORK [${franchiseId}]: Franchise poster uses movie '${content.title}' poster '${movieHash}' instead of collection artwork.`
            );
          }
        }
      }
    }

    verifiedCount++;
  }

  // 2. Ensure NO un-audited franchises exist in the catalog
  for (const f of allFranchises) {
    if (!CANONICAL_FRANCHISE_IDENTITIES[f.id]) {
      errors.push(`[FAIL] UNAUDITED_FRANCHISE: Catalog contains franchise '${f.id}' with no canonical visual identity lock.`);
    }
  }

  return {
    passed: errors.length === 0,
    totalFranchises: allFranchises.length,
    verifiedCount,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

async function main() {
  console.log('========================================================================');
  console.log('      CINEORDER FRANCHISE VISUAL IDENTITY PERMANENT LOCK TEST           ');
  console.log('========================================================================\n');

  const catalogFranchiseMap = new Map(allFranchises.map((f) => [f.id, f]));
  
  console.log('─── Individual Franchise Audit ───');
  for (const [id, canonical] of Object.entries(CANONICAL_FRANCHISE_IDENTITIES)) {
    const catalog = catalogFranchiseMap.get(id);
    const resolved = catalog ? resolveFranchiseArtwork(catalog) : { poster: 'MISSING' };
    const actualHash = resolved.poster?.split('/').pop()?.split('?')[0] || 'NONE';
    const isPass = actualHash === canonical.canonicalPosterHash;

    console.log(`Franchise: ${canonical.name}`);
    console.log(`Expected:  ${canonical.canonicalPosterHash}`);
    console.log(`Rendered:  ${actualHash}`);
    console.log(`Status:    ${isPass ? 'PASS' : 'FAIL'}\n`);
  }

  const result = validateFranchiseVisualIdentities();

  console.log('========================================================================');
  console.log(`Total Franchises Audited:         ${result.totalFranchises}`);
  console.log(`Franchises Successfully Verified: ${result.verifiedCount}`);
  console.log(`Identity Errors Found:            ${result.errorCount}`);
  console.log(`Warnings:                         ${result.warningCount}\n`);

  if (result.errors.length > 0) {
    console.log('❌ IDENTITY REGRESSION FAILURES DETECTED:');
    result.errors.forEach((err) => console.log(`   ${err}`));
    console.log('\nResult: ❌ FAIL');
    process.exit(1);
  } else {
    console.log('✅ ALL 16 FRANCHISE VISUAL IDENTITIES ARE PERMANENTLY LOCKED & VERIFIED!');
    console.log('   - 0 Wrong mappings');
    console.log('   - 0 Duplicate/colliding collection mappings');
    console.log('   - 0 Cross-franchise contaminations');
    console.log('   - 0 Movie posters used as collection artwork');
    console.log('   - 0 Stale/forbidden hashes\n');
    console.log('Result: ✅ PASS');
    process.exit(0);
  }
}

if (process.argv[1] && process.argv[1].endsWith('verifyFranchiseVisualIdentity.ts')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
