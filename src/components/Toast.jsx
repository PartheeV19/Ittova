import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();



  return (
    <div id="toast-container" role="status" aria-live="polite" aria-relevant="additions" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ background: 'var(--text-heading)', color: '#fff', padding: '0.85rem 1.25rem', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-xl)', fontWeight: 600, fontSize: '0.875rem', borderLeft: '3.5px solid var(--accent)' }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
