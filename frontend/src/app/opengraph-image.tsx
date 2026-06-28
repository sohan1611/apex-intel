import { ImageResponse } from 'next/og';
 
// Route segment config
export const runtime = 'edge';
 
// Image metadata
export const alt = 'Apex Intel — Investment Intelligence Platform';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#09090B',
          color: '#FAFAFA',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          borderTop: '16px solid #3B82F6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#3B82F6', borderRadius: '12px', marginRight: '24px' }}></div>
          <span style={{ fontWeight: 'bold', letterSpacing: '-0.02em', fontSize: 72 }}>Apex Intel</span>
        </div>
        <p style={{ fontSize: 32, color: '#A1A1AA', marginTop: 10, maxWidth: '80%', textAlign: 'center' }}>
          Institutional Due Diligence. Powered by AI.
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
