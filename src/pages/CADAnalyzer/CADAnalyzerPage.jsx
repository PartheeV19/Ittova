import React from 'react';
import { Link } from 'react-router-dom';
import CADModelAnalyzer from '../../components/CADModelAnalyzer';

export default function CADAnalyzerPage() {
  return (
    <main className="cad-analyzer-page">
      <div className="cad-page-topbar">
        <Link className="cad-page-back" to="/">
          <span aria-hidden="true">←</span> ITOVA
        </Link>
        <span className="cad-page-context">MANUFACTURING INTELLIGENCE <span>/</span> ENGINEERING WORKSPACE</span>
        <span className="cad-page-status"><span /> ANALYZER</span>
      </div>
      <div className="cad-analyzer-shell">
        <CADModelAnalyzer />
      </div>
    </main>
  );
}
