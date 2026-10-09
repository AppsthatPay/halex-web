// Feed registry: the contract between the always-on machine (publisher)
// and Vercel (display layer). Each feed is a JSON blob uploaded by
// scripts/publish-feeds.mjs. API routes serve these with caching.
//
// Vercel never generates feed data — it only serves what the machine
// published. If a blob is missing/stale, routes fall back to a
// 503 with the last-known timestamp so the app can show its shadow copy.
import { list } from '@vercel/blob';

export interface FeedMeta {
  name: string;
  blobPath: string;
  description: string;
  maxAgeSeconds: number; // how stale is too stale
}

export const FEEDS: FeedMeta[] = [
  {
    name: 'launches',
    blobPath: 'feeds/launches.json',
    description: 'Latest launch detections (Solana, EVM, XRPL)',
    maxAgeSeconds: 60 * 45,
  },
  {
    name: 'oasis',
    blobPath: 'feeds/oasis.json',
    description: 'Oasis protocol snapshot (~30KB)',
    maxAgeSeconds: 60 * 15,
  },
  {
    name: 'market-index',
    blobPath: 'feeds/market-index.json',
    description: 'Full market-index payload',
    maxAgeSeconds: 60 * 30,
  },
  {
    name: 'enrichment',
    blobPath: 'feeds/enrichment.json',
    description: 'Launch enrichment rows',
    maxAgeSeconds: 60 * 60,
  },
];

export function getFeedMeta(name: string): FeedMeta | undefined {
  return FEEDS.find((f) => f.name === name);
}

export async function fetchFeedBlob(meta: FeedMeta): Promise<{ data: unknown; uploadedAt: string | null; stale: boolean }> {
  const { blobs } = await list({ prefix: meta.blobPath, limit: 1 });
  const blob = blobs[0];
  if (!blob) {
    return { data: null, uploadedAt: null, stale: true };
  }
  const res = await fetch(blob.url, { next: { revalidate: 15 } });
  if (!res.ok) {
    return { data: null, uploadedAt: blob.uploadedAt, stale: true };
  }
  const data = await res.json();
  const ageSeconds = (Date.now() - new Date(blob.uploadedAt).getTime()) / 1000;
  return { data, uploadedAt: blob.uploadedAt, stale: ageSeconds > meta.maxAgeSeconds };
}
