import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
}
 
export const contentType = 'image/png'
 
export default function AppleIcon() {
  // 12 colors evenly spaced around the color wheel
  const colors = [
    'hsl(0, 100%, 50%)',     // Red
    'hsl(30, 100%, 50%)',    // Orange
    'hsl(60, 100%, 50%)',    // Yellow
    'hsl(90, 100%, 50%)',    // Yellow-Green
    'hsl(120, 100%, 50%)',   // Green
    'hsl(150, 100%, 50%)',   // Cyan-Green
    'hsl(180, 100%, 50%)',   // Cyan
    'hsl(210, 100%, 50%)',   // Blue-Cyan
    'hsl(240, 100%, 50%)',   // Blue
    'hsl(270, 100%, 50%)',   // Purple
    'hsl(300, 100%, 50%)',   // Magenta
    'hsl(330, 100%, 50%)',   // Pink-Red
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
        }}
      >
        <svg width="160" height="160" viewBox="0 0 120 120">
          {colors.map((color, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const startAngle = angle;
            const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
            
            const x1 = 60 + 50 * Math.cos(startAngle);
            const y1 = 60 + 50 * Math.sin(startAngle);
            const x2 = 60 + 50 * Math.cos(endAngle);
            const y2 = 60 + 50 * Math.sin(endAngle);
            
            const largeArcFlag = 0;
            
            return (
              <path
                key={i}
                d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={color}
              />
            );
          })}
          {/* Center circle */}
          <circle cx="60" cy="60" r="15" fill="#1a1a2e" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
