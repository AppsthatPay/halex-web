'use client';

import { useEffect, useState } from 'react';

interface FeedStatus {
  name: string;
  description: string;
  ok: boolean;
  stale: boolean;
  uploadedAt: string | null;
}

const FEED_NAMES = ['launches', 'oasis', 'market-index', 'enrichment'];

export default function Dashboard() {
  const [statuses, setStatuses] = useState<FeedStatus[]>([]);
  const [health, setHealth] = useState<string>('checking…');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => setHealth(j.ok ? `ok · ${j.time}` : 'unhealthy'))
      .catch(() => setHealth('unreachable'));

    // NOTE: the dashboard shell is public; feed contents require the API token.
    // This page only shows feed availability, never feed data.
    Promise.all(
      FEED_NAMES.map(async (name): Promise<FeedStatus> => {
        try {
          const r = await fetch(`/api/feeds/${name}`, { method: 'HEAD' });
          return {
            name,
            description: name,
            ok: r.ok,
            stale: false,
            uploadedAt: null,
          };
        } catch {
          return { name, description: name, ok: false, stale: true, uploadedAt: null };
        }
      })
    ).then(setStatuses);
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>HALEX Web Layer</h1>
      <p style={{ color: '#9a9aa5', marginBottom: 32 }}>
        Display-only serving layer. The always-on machine publishes finished feed data;
        this service caches and serves it to the app. It never executes trades.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18 }}>Service health</h2>
        <p>
          <code>{health}</code>
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 18 }}>Feed endpoints</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {FEED_NAMES.map((name) => {
            const s = statuses.find((x) => x.name === name);
            return (
              <li
                key={name}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #26262e',
                  borderRadius: 8,
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <code>/api/feeds/{name}</code>
                <span style={{ color: s ? (s.ok ? '#4ade80' : '#f87171') : '#9a9aa5' }}>
                  {s ? (s.ok ? '● live' : '● unavailable') : '…'}
                </span>
              </li>
            );
          })}
        </ul>
        <p style={{ color: '#9a9aa5', fontSize: 14 }}>
          Feed bodies require the <code>Authorization: Bearer</code> API token.
          On 503 the app falls back to its shadow copy.
        </p>
      </section>
    </main>
  );
}
