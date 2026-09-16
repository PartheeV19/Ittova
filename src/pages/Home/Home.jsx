import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Home() {
  const { setCurrentView, showToast, resetDatabase } = useApp();

  return (
    <div className="view">
      {/* Hero */}
      <div className="hero-wrapper">
        <div className="kicker">Precision Sourcing Platform</div>
        <h1 className="hero-title">
          Custom Manufacturing,<br />
          <span>Managed End-to-End</span>
        </h1>
        <p className="hero-subtitle">
          ITTOVA connects engineering companies with verified precision manufacturers across Hyderabad.
          AI-assisted drawing analysis, multi-stage process scoping, and structured quality inspection &mdash;
          from RFQ to final delivery.
        </p>
        <div className="hero-cta-row">
          <button className="btn btn-lg" onClick={() => setCurrentView('customer')}>
            Submit Engineering Drawings
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => setCurrentView('vendor')}>
            Register as Supplier
          </button>
        </div>
      </div>

      {/* Quoting Engine */}
      <div className="quote-engine">
        <div className="quote-engine-header">
          <div>
            <div className="kicker">AI Quoting Engine</div>
            <h3 style={{ marginBottom: '0.25rem' }}>Instant Drawing Analysis &amp; Quoting</h3>
            <p className="subtitle" style={{ marginBottom: 0 }}>
              Upload 3D CAD (.STEP, .IGES, .SLDPRT) or 2D Engineering Drawings (PDF, DWG) along with a BOM to begin.
            </p>
          </div>
          <span className="badge badge-approved">DFM Analysis Active</span>
        </div>

        <div className="grid-2">
          <div 
            className="file-upload-mock" 
            id="hero-dropzone"
            onClick={() => {
              setCurrentView('customer');
              showToast('Opening Customer Portal &mdash; Drawing Release panel.');
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', opacity: 0.7 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <strong style={{ color: 'var(--text-body)' }}>Drop CAD / Drawing Files Here</strong>
            <span style={{ fontSize: '0.78rem' }}>Supports .STEP, .IGES, .SLDPRT, .PDF, .DWG, .XLSX</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div>
              <label>Delivery Location</label>
              <input type="text" defaultValue="Hyderabad Industrial Area" />
            </div>
            <div className="grid-2">
              <div>
                <label>Supplier Radius</label>
                <select defaultValue="50">
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                  <option value="100">Within 100 km</option>
                  <option value="All">All Telangana &amp; AP</option>
                </select>
              </div>
              <div>
                <label>Batch Size</label>
                <select defaultValue="Batch">
                  <option>Prototype (1–5 pcs)</option>
                  <option>Batch (10–100 pcs)</option>
                  <option>Production (100+ pcs)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Steps */}
      <div className="section-header-block" style={{ marginTop: 'var(--sp-12)' }}>
        <div className="section-label">How ITTOVA Operates</div>
        <h3>Structured Manufacturing in Four Steps</h3>
      </div>

      <div className="workflow-grid">
        <div className="workflow-step">
          <span className="workflow-step-num">01</span>
          <h4>Drawing Intake &amp; AI DFM</h4>
          <p>CAD and 2D drawings are processed. Process steps, critical tolerances, materials, and envelope sizes are automatically extracted.</p>
        </div>
        <div className="workflow-step">
          <span className="workflow-step-num">02</span>
          <h4>Process Validation &amp; Scoping</h4>
          <p>Human Process Validators review AI outputs, confirm sequence, and specify whether raw material and finishing are in-house or outsourced.</p>
        </div>
        <div className="workflow-step">
          <span className="workflow-step-num">03</span>
          <h4>Supplier Matching &amp; Bidding</h4>
          <p>Verified supplier machines are matched to required processes. RFQs are dispatched. Quotes are reviewed and presented to the customer with platform fee included.</p>
        </div>
        <div className="workflow-step">
          <span className="workflow-step-num">04</span>
          <h4>QA Inspection &amp; Delivery</h4>
          <p>Parts received at ITTOX warehouse undergo dimensional inspection against drawing specs. Approved parts are dispatched to the customer.</p>
        </div>
      </div>

      {/* Platform Modules */}
      <div className="section-header-block" style={{ marginTop: 'var(--sp-12)' }}>
        <div className="section-label">Platform</div>
        <h3>Eight Integrated Work Platforms</h3>
        <p className="subtitle">
          Each stakeholder &mdash; customer, supplier, bank, material trader, and internal team &mdash; operates through a dedicated module.
        </p>
      </div>

      <div className="module-grid">
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h4>Customer Platform</h4>
          <p>Drawing release, real-time order tracking, process scope selection, vendor quote comparison, and chat board.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <h4>Vendor Platform</h4>
          <p>Machinery registration, RFQ inbox, production order management, inward material tracking, and daily status updates.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <h4>Bank / NBFC Finance</h4>
          <p>Embedded financing module for vendors. Banks and NBFCs can pre-approve working capital lines for verified ITTOVA suppliers.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h4>Raw Material Network</h4>
          <p>Integration with material traders and manufacturers. Enables cost-optimal raw material procurement directly to the vendor facility.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <h4>Process Validator App</h4>
          <p>WFH / part-time team tool. Validators review AI-extracted drawing specs, confirm manufacturing stages, and authorize vendor routing.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8zM5 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM19 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
          </div>
          <h4>Logistics App</h4>
          <p>Pickup coordination from vendor, transit tracking to ITTOX warehouse, and last-mile delivery to the customer facility.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h4>IGI / QC App</h4>
          <p>Inward and outward quality inspection. CMM dimensional checks, QC report generation, and ISO conformance certificate issuance.</p>
        </div>
        <div className="module-card">
          <div className="module-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <h4>Stores App</h4>
          <p>ITTOX warehouse intake management, post-QC dispatch authorization, and inventory tracking for inbound and outbound parts.</p>
        </div>
      </div>

      <div style={{ marginTop: 'var(--sp-10)', textAlign: 'center' }}>
        <button className="btn-reset-link" onClick={resetDatabase}>
          Reset application data to default seed state
        </button>
      </div>
    </div>
  );
}
