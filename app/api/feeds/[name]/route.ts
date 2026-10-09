import { NextResponse } from 'next/server';
import { getFeedMeta, fetchFeedBlob } from '@/lib/feeds';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const meta = getFeedMeta(params.name);
  if (!meta) {
    return NextResponse.json({ ok: false, error: 'unknown feed' }, { status: 404 });
  }

  try {
    const { data, uploadedAt, stale } = await fetchFeedBlob(meta);
    if (data === null) {
      // Fail closed: tell the app the feed is unavailable so it uses its shadow copy.
      return NextResponse.json(
        { ok: false, feed: meta.name, error: 'feed unavailable', uploadedAt },
        { status: 503 }
      );
    }
    const res = NextResponse.json({
      ok: true,
      feed: meta.name,
      uploadedAt,
      stale,
      data,
    });
    // CDN cache: fresh for 15s, serve stale up to 60s while revalidating.
    res.headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, feed: meta.name, error: 'feed fetch failed' },
      { status: 503 }
    );
  }
}
