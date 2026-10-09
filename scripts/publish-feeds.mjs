// Feed publisher — runs on the always-on machine (NOT on Vercel).
// Reads finished feed JSON from the local pipeline and uploads each
// to Vercel Blob, where the /api/feeds/[name] routes serve it.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=... HALEX_FEED_DIR=/path/to/feeds node scripts/publish-feeds.mjs
//
// HALEX_FEED_DIR should contain: launches.json, oasis.json,
// market-index.json, enrichment.json (any subset is fine).
import { put } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const FEED_FILES = ['launches.json', 'oasis.json', 'market-index.json', 'enrichment.json'];

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN is not set');
  process.exit(1);
}

const feedDir = process.env.HALEX_FEED_DIR || './feeds';

let uploaded = 0;
for (const file of FEED_FILES) {
  const localPath = join(feedDir, file);
  let body;
  try {
    body = await readFile(localPath, 'utf8');
  } catch {
    console.log(`skip ${file}: not present in ${feedDir}`);
    continue;
  }
  // Validate it's parseable JSON before publishing.
  JSON.parse(body);
  const blobPath = `feeds/${file}`;
  const { url } = await put(blobPath, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    token,
  });
  console.log(`published ${file} -> ${url} (${body.length} bytes)`);
  uploaded++;
}

console.log(`done: ${uploaded} feed(s) published`);
