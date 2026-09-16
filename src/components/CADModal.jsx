import React from 'react';
import { useApp } from '../context/AppContext';

export default function CADModal() {
  const { cadModal, setCadModal } = useApp();

  if (!cadModal) return null;

  return (
    <div id="viewerModal" onClick={() => setCadModal(null)}>
      <div className="viewer-box" onClick={e => e.stopPropagation()}>
        <div className="flex-between">
          <div>
            <div className="kicker">3D CAD Inspection Suite</div>
            <h3 style={{ margin: '0.2rem 0' }}>Drawing &amp; Geometry Viewer &mdash; {cadModal.pid}</h3>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setCadModal(null)}
          >
            &times; Close Viewer
          </button>
        </div>

        <div className="canvas-container">
          <div style={{ textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, marginBottom: '0.75rem' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Interactive Mesh &amp; Feature Inspection</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              STEP / IGES 3D Wireframe Model: <strong>DWG-A101.STEP</strong> &bull; Tolerance: &plusmn;0.05 mm &bull; Material: MS Plate 12mm
            </div>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 'var(--sp-4)' }}>
          <div className="inner-panel">
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Outer Dimensions</span>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>450 &times; 320 &times; 12 mm</div>
          </div>
          <div className="inner-panel">
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Extracted Stages</span>
            <div style={{ fontWeight: 700, marginTop: '2px', color: 'var(--accent)' }}>Laser Cutting + VMC Milling</div>
          </div>
          <div className="inner-panel">
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>DFM Status</span>
            <div style={{ fontWeight: 700, marginTop: '2px', color: 'var(--success)' }}>100% Manufacturable</div>
          </div>
        </div>
      </div>
    </div>
  );
}
