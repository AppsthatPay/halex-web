import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

// POST /api/publish — publish feed JSON to Blob storage.
// Auth: Authorization: Bearer <HALEX_API_TOKEN>
// Body: { "feed": "launches", "data": {...} }
// Uses the auto-injected BLOB_READ_WRITE_TOKEN (available on Vercel).
const VALID_FEEDS = ['launches', 'oasis', 'market-index', 'enrichment'];

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = process.env.HALEX_API_TOKEN;
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const { feed, data } = body;
  if (!feed || !VALID_FEEDS.includes(feed)) {
    return NextResponse.json({ ok: false, error: 'invalid feed name' }, { status: 400 });
  }
  if (data === undefined) {
    return NextResponse.json({ ok: false, error: 'missing data' }, { status: 400 });
  }

  const blobPath = `feeds/${feed}.json`;
  const json = JSON.stringify(data);

  try {
    const { url } = await put(blobPath, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true, feed, url, bytes: json.length });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: 'blob publish failed', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
