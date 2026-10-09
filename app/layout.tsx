import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HALEX',
  description: 'HALEX web layer — trading intelligence dashboards and feed APIs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#0a0a0f', color: '#e8e8ec' }}>
        {children}
      </body>
    </html>
  );
}
