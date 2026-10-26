import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import CADModelAnalyzer from './CADModelAnalyzer';

export default function CADModal() {
  const { cadModal, setCadModal, db } = useApp();
  const dialog = useRef(null);

  useEffect(() => {
    if (!cadModal) return;
    const previous = document.activeElement;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [cadModal]);

  if (!cadModal) return null;

  const project = cadModal.pid ? db.projects.find((p) => p.id === cadModal.pid) : null;
  const firstDrawing = project?.drawings?.[0];
  const drawingImage = firstDrawing?.drawingData || cadModal.drawingData || null;
  const drawingMime = firstDrawing?.drawingMime || cadModal.drawingMime || 'image/png';
  const drawingSvg = firstDrawing?.drawingSvg || cadModal.drawingSvg || null;
  const presetId = cadModal.presetId || firstDrawing?.presetId || (cadModal.pid === 'PRJ-1082' ? 'shaft-precision-drive' : 'flange-hydraulic-manifold');

  return (
    <dialog
      ref={dialog}
      className="cad-dialog-full"
      aria-label="CAD Drawing & Manufacturing Process Analyzer"
      onCancel={() => setCadModal(null)}
      onClick={(e) => {
        if (e.target === dialog.current) setCadModal(null);
      }}
    >
      <CADModelAnalyzer
        initialPresetId={presetId}
        initialImage={drawingImage}
        initialMimeType={drawingMime}
        initialSvg={drawingSvg}
        project={project}
        onClose={() => setCadModal(null)}
      />
    </dialog>
  );
}
