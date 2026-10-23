import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import CADModelAnalyzer from './CADModelAnalyzer';

export default function CADModal() {
  const { cadModal, setCadModal } = useApp();
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

  const presetId = cadModal.presetId || (cadModal.pid === 'PRJ-1082' ? 'shaft-precision-drive' : 'flange-hydraulic-manifold');

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
        onClose={() => setCadModal(null)}
      />
    </dialog>
  );
}
