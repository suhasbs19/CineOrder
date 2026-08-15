import { allContent } from '../src/data/franchises/index';
import { tmdb, tmdbImage } from '../src/lib/tmdb';
import * as fs from 'fs';
import * as path from 'path';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAndCorrectAllPosters() {
  console.log('========================================================================');
  console.log('        FETCHING & REPLACING FABRICATED POSTERS WITH AUTHENTIC TMDB     ');
  console.log('========================================================================\n');

  const replacements: Array<{ id: string; oldUrl: string; newUrl: string; title: string }> = [];

  for (let i = 0; i < allContent.length; i++) {
    const c = allContent[i];
    if (!c.tmdb_id) continue;

    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        let tmdbPosterPath: string | null = null;
        let tmdbTitle = '';

        if (c.type === 'series') {
          const tv = await tmdb.getTVShow(c.tmdb_id);
          tmdbPosterPath = tv.poster_path;
          tmdbTitle = tv.name;
        } else {
          const m = await tmdb.getMovie(c.tmdb_id);
          tmdbPosterPath = m.poster_path;
          tmdbTitle = m.title;
        }

        if (tmdbPosterPath) {
          const authenticUrl = tmdbImage.poster(tmdbPosterPath, 'w500');
          if (c.poster_url !== authenticUrl) {
            replacements.push({
              id: c.id,
              oldUrl: c.poster_url || '',
              newUrl: authenticUrl,
              title: c.title,
            });
          }
        }
        success = true;
      } catch (err: any) {
        if (attempts >= 3) {
          console.warn(`[TMDB Fetch Skip] ${c.id} (${c.title}): ${err.message}`);
        } else {
          await delay(200);
        }
      }
    }
    await delay(30);
  }

  console.log(`\nFound ${replacements.length} poster URLs requiring authentic TMDB updates.\n`);

  const franchiseDir = path.join(process.cwd(), 'src', 'data', 'franchises');
  const files = fs.readdirSync(franchiseDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'utils.ts');

  let totalReplacedInFiles = 0;

  for (const filename of files) {
    const filePath = path.join(franchiseDir, filename);
    let content = fs.readFileSync(filePath, 'utf-8');
    let fileModified = false;

    for (const r of replacements) {
      if (r.oldUrl && content.includes(r.oldUrl)) {
        content = content.replaceAll(r.oldUrl, r.newUrl);
        console.log(`[UPDATED ${filename}] ${r.id} ("${r.title}"):`);
        console.log(`   Old: ${r.oldUrl}`);
        console.log(`   New: ${r.newUrl}\n`);
        fileModified = true;
        totalReplacedInFiles++;
      }
    }

    if (fileModified) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }

  console.log(`\n✅ Successfully updated ${totalReplacedInFiles} poster URLs across source catalog files!`);
}

fetchAndCorrectAllPosters().catch(console.error);
