import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Armin Burkhardt';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: '#0a0a0a',
          color: '#fafaf9',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            color: '#52525b',
            textTransform: 'uppercase',
          }}
        >
          Tübingen
        </div>
        <div style={{ fontSize: 104, letterSpacing: -3, marginTop: 12 }}>Armin Burkhardt</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 16 }}>
          Quant Finance · Machine Learning · Interdisciplinary Applications
        </div>
        <div style={{ height: 4, width: 120, background: '#fb4a6b', marginTop: 40 }} />
      </div>
    ),
    size,
  );
}
