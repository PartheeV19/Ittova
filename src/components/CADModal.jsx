import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function CADModal() {
  const { cadModal, setCadModal, db } = useApp();
  const dialog = useRef(null);
  useEffect(() => {
    if (!cadModal) return;
    const previous = document.activeElement;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [cadModal]);
  if (!cadModal) return null;
  const project = db.projects.find(p => p.id === cadModal.pid);
  return (
    <dialog ref={dialog} className="cad-dialog viewer-box" aria-labelledby="cad-title" onCancel={() => setCadModal(null)} onClick={event => { if (event.target === dialog.current) setCadModal(null); }}>
      <div onClick={event => event.stopPropagation()}>
        <div className="flex-between"><h2 id="cad-title">Drawing details ? {cadModal.pid}</h2><button type="button" className="btn btn-secondary btn-sm" onClick={() => setCadModal(null)}>Close viewer</button></div>
        <p role="status">Interactive CAD preview is not available. The project details below do not constitute a geometry or manufacturability assessment.</p>
        {project?.drawings?.length ? project.drawings.map((drawing, index) => <section className="inner-panel" key={drawing.dwgNo || index}>
          <h3>{drawing.dwgNo || `Drawing ${index + 1}`}</h3>
          <p>Material: {drawing.material || 'Not provided'} ? Quantity: {drawing.qty ?? 'Not provided'}</p>
          <p>Processes: {drawing.processes?.map(process => process.name).join(', ') || drawing.proc || 'Not provided'}</p>
        </section>) : <p>No drawing details are available for this project.</p>}
      </div>
    </dialog>
  );
}
