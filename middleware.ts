// Auth gate: every /api/* route (except /api/health) requires a Bearer token.
// The HALEX app sends HALEX_API_TOKEN. Vercel is display-only — it never
// executes trades, so this gate protects read access to internal feed data.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public: health check + the landing page (which itself shows nothing sensitive)
  if (pathname === '/api/health' || pathname === '/') {
    return NextResponse.next();
  }

  const expected = process.env.HALEX_API_TOKEN;
  if (!expected) {
    // Fail closed: no token configured means no access.
    return NextResponse.json({ ok: false, error: 'auth not configured' }, { status: 503 });
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
