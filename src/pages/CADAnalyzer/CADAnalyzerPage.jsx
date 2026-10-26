import React from 'react';
import { Link } from 'react-router-dom';
import CADModelAnalyzer from '../../components/CADModelAnalyzer';

export default function CADAnalyzerPage() {
  return (
    <main className="cad-analyzer-page">
      <div className="cad-page-container">
        <div className="cad-page-subnav">
          <Link className="cad-page-back-link" to="/home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to overview</span>
          </Link>
        </div>

        <div className="cad-analyzer-shell">
          <CADModelAnalyzer allowSampleDrawings={false} />
        </div>
      </div>
    </main>
  );
}
