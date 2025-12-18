import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const colors = [
    'hsl(0, 100%, 50%)',
    'hsl(60, 100%, 50%)',
    'hsl(120, 100%, 50%)',
    'hsl(180, 100%, 50%)',
    'hsl(270, 100%, 50%)',
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          gap: '40px',
          padding: '40px',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: '4px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ff6b9d, #c44569, #ffa502, #26de81, #0984e3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          COLOR CHASE
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: '#a0a0c0',
            textAlign: 'center',
            maxWidth: '1000px',
          }}
        >
          Guess the hidden 5-color palette in 5 tries
        </div>

        {/* Color Swatches */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
          }}
        >
          {colors.map((color, i) => (
            <div
              key={i}
              style={{
                width: '120px',
                height: '120px',
                background: color,
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: '24px',
            color: '#ffa500',
            fontWeight: '600',
            marginTop: '20px',
          }}
        >
          Play Daily • Collect Palettes • Build Your Collection
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
