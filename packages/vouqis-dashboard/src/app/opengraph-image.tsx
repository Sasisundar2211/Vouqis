import { ImageResponse } from '@vercel/og'

export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
          fontFamily: 'Geist, Helvetica, Arial, sans-serif',
        }}
      >
        <p
          style={{
            fontSize: 52,
            color: '#7f7f7f',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Your agent said success.
        </p>
        <p
          style={{
            fontSize: 60,
            color: '#fafafa',
            margin: '16px 0 0 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            fontWeight: 600,
          }}
        >
          The action never happened.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 48 }}>
          <span
            style={{
              fontSize: 28,
              color: '#7f7f7f',
              letterSpacing: '0.34em',
            }}
          >
            VOUQIS
          </span>
          <span
            style={{
              fontSize: 24,
              color: '#505050',
              letterSpacing: '-0.01em',
              fontWeight: 400,
            }}
          >
            catches that.
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
