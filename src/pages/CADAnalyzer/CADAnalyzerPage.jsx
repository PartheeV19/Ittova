import React from 'react';
import CADModelAnalyzer from '../../components/CADModelAnalyzer';

export default function CADAnalyzerPage() {
  return (
    <main className="container" style={{ padding: '1.5rem clamp(16px, 3vw, 48px) 4rem', minHeight: '85vh' }}>
      <div style={{ height: '820px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1c3552', boxShadow: '0 20px 48px rgba(0,0,0,0.4)' }}>
        <CADModelAnalyzer />
      </div>
    </main>
  );
}
