import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CustomerWizard from './CustomerWizard';
import LiveStepper from '../../components/LiveStepper';

export default function CustomerPortal() {
  const { 
    db, 
    selectedCustomerId, 
    setSelectedCustomerId, 
    submitDrawings, 
    updateProjectScope, 
    confirmScopes, 
    confirmCustomerVendorQuotes, 
    approveCustomerDelivery, 
    payCustomerFinal, 
    setCadModal,
    showToast,
    openMyAccount,
    navigateBack
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50);
  const [quoteSelections, setQuoteSelections] = useState({});
  const [uploadedDrawings, setUploadedDrawings] = useState([]);
  const [uploadedBom, setUploadedBom] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [paymentModes, setPaymentModes] = useState({});
  const [paymentRefs, setPaymentRefs] = useState({});
  const [isSettling, setIsSettling] = useState({});
  const [consentAiAnalysis, setConsentAiAnalysis] = useState(true);

  const drawingsInputRef = React.useRef(null);
  const bomInputRef = React.useRef(null);

  const activeCustomer = db.customers.find(c => c.id === selectedCustomerId);
  const myProjects = db.projects.filter(p => p.cust === selectedCustomerId).reverse();

  const handleDrawingsSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedDrawings((prev) => [
          ...prev.filter((d) => d.name !== file.name),
          {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl: reader.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    showToast(`${files.length} drawing file(s) attached.`);
  };

  const handleBomSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedBom({
      name: file.name,
      size: file.size,
      type: file.type
    });
    showToast(`BOM spreadsheet attached: ${file.name}`);
  };

  const handleRemoveDrawing = (index) => {
    setUploadedDrawings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadSampleDrawings = () => {
    setUploadedDrawings([
      { name: 'DWG-A101-Shaft.pdf', size: 1048576, type: 'application/pdf', presetId: 'shaft-precision-drive' },
      { name: 'DWG-B202-Manifold.pdf', size: 838860, type: 'application/pdf', presetId: 'flange-hydraulic-manifold' }
    ]);
    setUploadedBom({ name: 'Master_Assembly_BOM.xlsx', size: 45056, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    showToast('Loaded benchmark engineering drawings & BOM specification.');
  };

  const handleDrawingSubmit = async () => {
    if (!activeCustomer) return;

    if (!uploadedDrawings.length) {
      showToast('Please attach at least one engineering drawing (PDF, CAD, DXF, or image).');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('Reading drawing title blocks & CAD geometry...');

    try {
      const decomposedDrawings = [];

      for (let i = 0; i < uploadedDrawings.length; i++) {
        const file = uploadedDrawings[i];
        setAnalysisProgress(`Analyzing drawing ${i + 1}/${uploadedDrawings.length}: ${file.name}...`);

        let operations = [];
        let material = 'Alloy Steel / Aluminum';
        let dwgNo = file.name.replace(/\.[^/.]+$/, '');
        let drawingSvg = null;

        try {
          const res = await fetch('/api/v1/cad/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              file.dataUrl
                ? { imageBase64: file.dataUrl, mimeType: file.type, partHint: file.name, consentToCloudAnalysis: consentAiAnalysis }
                : { presetId: file.presetId || 'shaft-precision-drive' }
            )
          });

          if (res.ok) {
            const data = await res.json();
            if (data.analysis) {
              operations = data.analysis.operations || [];
              material = data.analysis.material || material;
              dwgNo = data.analysis.drawingNumber || dwgNo;
            }
            if (data.drawingSvg) drawingSvg = data.drawingSvg;
          }
        } catch (analysisErr) {
          console.warn('CAD Analyzer call failed, applying rule-based stages:', analysisErr);
        }

        // Map operations to stages
        const processes = (operations.length > 0 ? operations : [
          { name: 'CNC LASER CUTTING', machineCategory: 'Laser Cutting', estimatedCycleTimeSec: 120 },
          { name: 'CNC MILLING (4-Axis)', machineCategory: 'Milling', estimatedCycleTimeSec: 240 }
        ]).map((op, idx) => ({
          stageId: idx + 1,
          name: op.name || op.machineCategory || `Operation ${idx + 1}`,
          machineCategory: op.machineCategory || 'CNC Machining',
          topVendors: [],
          quotes: [],
          selectedVendor: null,
          prodStatus: 'Pending',
          rawScope: 'Vendor',
          mfgScope: 'Vendor',
          finScope: 'Vendor',
          cycleTimeSec: op.estimatedCycleTimeSec || 180
        }));

        decomposedDrawings.push({
          dwgNo,
          proc: processes.map(p => p.name).join(' ➔ '),
          qty: 25,
          material,
          rawScope: 'Vendor',
          mfgScope: 'Vendor',
          finScope: 'Vendor',
          drawingData: file.dataUrl || null,
          drawingMime: file.type || 'image/png',
          drawingSvg,
          presetId: file.presetId || null,
          processes
        });
      }

      setAnalysisProgress('Creating project & registering process stages...');

      await submitDrawings(activeCustomer.id, searchRadius, {
        searchLoc: activeCustomer.location || 'Hyderabad',
        files: uploadedDrawings.map(d => d.name).join(', '),
        bom: uploadedBom ? uploadedBom.name : 'Master_BOM.xlsx',
        drawings: decomposedDrawings
      });

      setUploadedDrawings([]);
      setUploadedBom(null);
    } catch (err) {
      console.error('Drawing submission failed:', err);
      showToast('Could not complete drawing analysis: ' + err.message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleQuoteSelect = (pid, dIdx, pIdx, vid) => {
    setQuoteSelections(prev => ({
      ...prev,
      [pid]: { ...prev[pid], [`${dIdx}_${pIdx}`]: vid }
    }));
  };

  const handleConfirmQuotes = (pid, drawings) => {
    let allSelected = true;
    drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
      const key = `${dIdx}_${pIdx}`;
      if (!quoteSelections[pid]?.[key] && !proc.selectedVendor) {
        allSelected = false;
      }
    }));

    if (!allSelected) {
      showToast('Please select a supplier quote for every process stage!');
      return;
    }
    confirmCustomerVendorQuotes(pid, quoteSelections[pid] || {});
  };

  return (
    <div className="view">
      {/* In-App Back Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          type="button" 
          className="btn-link" 
          onClick={navigateBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--ink)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Overview
        </button>
      </div>

      {/* Customer Identity Banner */}
      <div className="card">
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Corporate Customer Portal</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px' }}>
              {activeCustomer ? activeCustomer.name : 'Corporate Onboarding & KYC Registration'}
            </div>
            {activeCustomer && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Account: <strong>{activeCustomer.id}</strong> &bull; CIN: {activeCustomer.cin || 'N/A'} &bull; GSTIN: {activeCustomer.gst || 'N/A'}
              </div>
            )}
          </div>
          <div className="flex-gap">
            {activeCustomer ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${activeCustomer.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                  {activeCustomer.status === 'APPROVED' ? 'Verified Account' : 'KYC Audit Pending'}
                </span>
                <span className="badge badge-tier">
                  {activeCustomer.creditTier || activeCustomer.reqCreditTier || 'Advance Tier'}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRegistering(v => !v)}
                  style={{ fontSize: '0.82rem' }}
                >
                  {isRegistering ? 'View Requirements' : '+ Onboard Corporate Customer / Edit KYC'}
                </button>
              </div>
            ) : (
              <span className="badge badge-pending">Registration Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Registration Wizard */}
      {(!activeCustomer || isRegistering) && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <CustomerWizard 
            onComplete={(cid) => {
              setIsRegistering(false);
              setSelectedCustomerId(cid);
              openMyAccount(cid);
            }} 
            onCancel={() => setIsRegistering(false)} 
          />
        </div>
      )}

      {/* Pending Account Notice */}
      {activeCustomer && activeCustomer.status !== 'APPROVED' && !isRegistering && (
        <div className="card">
          <div className="alert alert-warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Onboarding &amp; KYC Audit in Progress</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                Your corporate KYC dossier and credit underwriting request for <strong>{activeCustomer.reqCreditTier}</strong> (Limit: {activeCustomer.reqCreditLimit}) is currently being reviewed by the ITTOVA Customer Audit team. You will be able to release CAD drawings as soon as account activation is authorized.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Approved Customer Dashboard */}
      {activeCustomer && activeCustomer.status === 'APPROVED' && !isRegistering && (
        <div>
          {/* Release Engineering Drawings */}
          <div className="card">
            <div className="kicker">Drawing Release &amp; Quoting</div>
            <h2 style={{ marginBottom: '0.3rem' }}>Release Engineering Drawings</h2>
            <p className="subtitle">
              Upload a minimum of two drawings (PDF or 3D CAD format) together with a Bill of Materials spreadsheet.
              The AI Quoting Engine extracts process stages and routes them for human validation.
            </p>

            {/* Hidden file inputs */}
            <input 
              ref={drawingsInputRef} 
              type="file" 
              multiple 
              accept=".pdf,.png,.jpg,.jpeg,.svg,.step,.stp,.dxf" 
              onChange={handleDrawingsSelect} 
              style={{ display: 'none' }} 
            />
            <input 
              ref={bomInputRef} 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleBomSelect} 
              style={{ display: 'none' }} 
            />

            <div className="grid-2" style={{ marginTop: 'var(--sp-5)' }}>
              {/* Drawings Upload Zone */}
              <div 
                className={`file-upload-mock ${uploadedDrawings.length >= 2 ? 'uploaded' : ''}`}
                style={{ cursor: 'pointer', padding: '16px', border: uploadedDrawings.length ? '1.5px solid var(--accent)' : '1.5px dashed var(--border)' }}
                onClick={() => drawingsInputRef.current?.click()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <strong>Engineering Drawings ({uploadedDrawings.length} attached)</strong>
                  {uploadedDrawings.length < 2 && (
                    <span className="badge badge-pending" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>Min 2 required</span>
                  )}
                </div>
                {uploadedDrawings.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Click to select CAD drawings or PDF blueprints (PDF, STEP, DXF, PNG, SVG).
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {uploadedDrawings.map((dwg, idx) => (
                      <div 
                        key={idx} 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem' }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          📄 {dwg.name} {dwg.size ? `(${(dwg.size / 1024).toFixed(0)} KB)` : ''}
                        </span>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleRemoveDrawing(idx); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold' }}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '4px' }}>
                      + Click to attach more drawings
                    </div>
                  </div>
                )}
              </div>

              {/* BOM Upload Zone */}
              <div 
                className={`file-upload-mock ${uploadedBom ? 'uploaded' : ''}`}
                style={{ cursor: 'pointer', padding: '16px', border: uploadedBom ? '1.5px solid var(--accent)' : '1.5px dashed var(--border)' }}
                onClick={() => bomInputRef.current?.click()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                  <strong>Bill of Materials (BOM)</strong>
                </div>
                {uploadedBom ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>
                    <span>📊 {uploadedBom.name} {uploadedBom.size ? `(${(uploadedBom.size / 1024).toFixed(0)} KB)` : ''}</span>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setUploadedBom(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold' }}
                      title="Remove BOM"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Click to select BOM spreadsheet (XLSX, CSV) or leave blank for default assembly BOM.
                  </div>
                )}
              </div>
            </div>

            {/* Benchmark sample loader button */}
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-link"
                style={{ fontSize: '0.78rem', textDecoration: 'underline', color: 'var(--accent)' }}
                onClick={handleLoadSampleDrawings}
              >
                Need sample files? Load aerospace turbine &amp; manifold benchmark drawings
              </button>
            </div>

            {/* NDA & Data Disclosure */}
            <div style={{ marginTop: '12px', padding: '14px 16px', background: 'var(--bg-subtle, rgba(255, 255, 255, 0.03))', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem', lineHeight: '1.45' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input
                  id="consent-ai-analysis-checkbox"
                  type="checkbox"
                  checked={consentAiAnalysis}
                  onChange={e => setConsentAiAnalysis(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="consent-ai-analysis-checkbox" style={{ margin: 0, cursor: 'pointer', color: 'var(--text-heading)', fontWeight: 600 }}>
                  Authorize Google Gemini Vision Cloud AI for Automated DFM &amp; Tooling Decomposition
                </label>
              </div>
              <div style={{ marginLeft: '26px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {consentAiAnalysis ? (
                  <span>
                    <strong style={{ color: '#16a34a' }}>&#10003; Cloud AI Enabled (TLS 1.3 Encrypted):</strong> Your CAD drawings are processed ephemerally in transit via Google Cloud Gemini Vision solely to deconstruct geometric dimensions and machining steps. In compliance with the ITTOVA Mutual NDA and Enterprise AI Policy, drawings are <strong>never persistently stored on public servers or used to train public foundation models</strong>.
                  </span>
                ) : (
                  <span>
                    <strong style={{ color: '#2563eb' }}>&#128274; Local On-Premise Mode (Zero External Transmission):</strong> You have opted out of cloud AI processing. Your drawings will be analyzed exclusively on-premise using ITTOVA&apos;s deterministic rule-based CAM algorithms without transmitting any CAD data outside this server.
                  </span>
                )}
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: 'var(--sp-5)' }}>
              <div>
                <label>Supplier Matching Search Radius (km)</label>
                <input 
                  type="number" 
                  value={searchRadius} 
                  onChange={e => setSearchRadius(Number(e.target.value))} 
                  style={{ width: '180px' }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {isAnalyzing && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="spinner-sm" style={{ width: '14px', height: '14px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    {analysisProgress || 'Analyzing drawings with AI DFM engine...'}
                  </div>
                )}
                <button 
                  className="btn w-full" 
                  onClick={handleDrawingSubmit}
                  disabled={isAnalyzing || uploadedDrawings.length < 2}
                  style={{ opacity: (isAnalyzing || uploadedDrawings.length < 2) ? 0.6 : 1, cursor: (isAnalyzing || uploadedDrawings.length < 2) ? 'not-allowed' : 'pointer' }}
                >
                  {isAnalyzing ? 'Analyzing Drawings...' : 'Analyze with AI & Submit to Process Validator'}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Project Tracker */}
          <div className="view-section-title">
            <h3>Active Project Tracker &amp; Execution Matrix</h3>
          </div>

          {myProjects.length === 0 ? (
            <div className="card">
              <p className="subtitle">No engineering projects submitted yet. Use the card above to upload drawings.</p>
            </div>
          ) : (
            myProjects.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="flex-between">
                  <div>
                    <div className="kicker">Engineering Sourcing Order</div>
                    <h3 style={{ margin: '0.2rem 0' }}>Project: {p.id}</h3>
                    <p className="subtitle" style={{ margin: 0 }}>Drawings: {p.files} &bull; BOM: {p.bom}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-pending">{p.status.replace(/_/g, ' ')}</span>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ display: 'block', marginTop: '6px', marginLeft: 'auto' }}
                      onClick={() => setCadModal({ pid: p.id })}
                    >
                      Inspect 3D CAD
                    </button>
                  </div>
                </div>

                {/* Live Stepper */}
                <LiveStepper status={p.status} />

                {/* Stage Action: Customer Scope Confirmation */}
                {p.status === 'CUSTOMER_SCOPE_PENDING' && (
                  <div className="inner-panel" style={{ marginTop: 'var(--sp-5)', border: '1.5px solid var(--accent-border)' }}>
                    <div className="flex-between">
                      <div>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.2rem' }}>Process Scope Selection Required</h4>
                        <p className="subtitle" style={{ margin: 0 }}>Specify whether raw material, manufacturing, and finishing are Vendor Supplied or In-House Customer supplied.</p>
                      </div>
                    </div>

                    <div className="table-responsive" style={{ marginTop: 'var(--sp-4)' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Drawing #</th>
                            <th>Process Stage</th>
                            <th>Raw Material</th>
                            <th>Manufacturing</th>
                            <th>Surface Finishing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.drawings.map((d, dIdx) => d.processes.map((proc, pIdx) => (
                            <tr key={`${dIdx}_${pIdx}`}>
                              <td><strong>{d.dwgNo}</strong></td>
                              <td><span className="badge badge-process">Stage {proc.stageId}: {proc.name}</span></td>
                              <td>
                                <select 
                                  value={proc.rawScope} 
                                  disabled={pIdx > 0}
                                  onChange={e => updateProjectScope(p.id, dIdx, pIdx, 'rawScope', e.target.value)}
                                >
                                  <option value="Vendor">Vendor Supplied</option>
                                  <option value="In-House">In-House Customer</option>
                                </select>
                              </td>
                              <td>
                                <select 
                                  value={proc.mfgScope} 
                                  onChange={e => updateProjectScope(p.id, dIdx, pIdx, 'mfgScope', e.target.value)}
                                >
                                  <option value="Vendor">Vendor Supplied</option>
                                  <option value="In-House">In-House Customer</option>
                                </select>
                              </td>
                              <td>
                                <select 
                                  value={proc.finScope} 
                                  onChange={e => updateProjectScope(p.id, dIdx, pIdx, 'finScope', e.target.value)}
                                >
                                  <option value="Vendor">Vendor Supplied</option>
                                  <option value="In-House">In-House Customer</option>
                                </select>
                              </td>
                            </tr>
                          )))}
                        </tbody>
                      </table>
                    </div>

                    <button 
                      className="btn btn-success" 
                      style={{ marginTop: 'var(--sp-4)' }}
                      onClick={() => confirmScopes(p.id)}
                    >
                      Confirm Scopes &amp; Request Verified Quotes
                    </button>
                  </div>
                )}

                {/* Stage Action: Customer Final Quote Selection */}
                {p.status === 'CUSTOMER_FINAL_SELECTION' && (
                  <div className="inner-panel" style={{ marginTop: 'var(--sp-5)', border: '1.5px solid var(--accent-border)' }}>
                    <h4 style={{ color: 'var(--accent)', marginBottom: '0.2rem' }}>Verified Supplier Quotes Matrix</h4>
                    <p className="subtitle" style={{ margin: 0 }}>Select supplier bids per manufacturing stage. Pricing reflects audited vendor quotes with 5% platform fee included.</p>

                    <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      {p.drawings.map((d, dIdx) => d.processes.map((proc, pIdx) => (
                        <div key={`${dIdx}_${pIdx}`} className="inner-panel" style={{ background: 'var(--bg)' }}>
                          <div className="flex-between">
                            <strong>{d.dwgNo} &mdash; Stage {proc.stageId}: {proc.name}</strong>
                            <span className="badge badge-process">{proc.quotes.length} Quotes Audited</span>
                          </div>
                          <select 
                            style={{ marginTop: '0.4rem' }}
                            value={quoteSelections[p.id]?.[`${dIdx}_${pIdx}`] || proc.selectedVendor || ''}
                            onChange={e => handleQuoteSelect(p.id, dIdx, pIdx, e.target.value)}
                          >
                            <option value="">Select Supplier Bid...</option>
                            {proc.quotes.map(q => (
                              <option key={q.vid} value={q.vid}>
                                {q.vid} &mdash; ₹{Math.round(q.cost * 1.05).toLocaleString('en-IN')} ({q.time} Days Delivery)
                              </option>
                            ))}
                          </select>
                        </div>
                      )))}
                    </div>

                    <button 
                      className="btn btn-success" 
                      style={{ marginTop: 'var(--sp-4)' }}
                      onClick={() => handleConfirmQuotes(p.id, p.drawings)}
                    >
                      Authorize Supplier Selections &amp; Release PO
                    </button>
                  </div>
                )}

                {/* Stage Action: Quality Passed / Delivery Approval */}
                {p.status === 'PENDING_CUST_DELIVERY_APPROVAL' && (
                  <div style={{ marginTop: 'var(--sp-5)' }}>
                    <div className="alert alert-success">
                      <div>
                        <strong>QA Inspection Conformance Certified!</strong>
                        <div>Dimensional CMM and hardness specs match engineering drawings. Confirm unloading facility below.</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-success"
                      onClick={() => approveCustomerDelivery(p.id, activeCustomer.deliveryAddress)}
                    >
                      Approve Delivery Address &amp; Request Logistics Freight Invoice
                    </button>
                  </div>
                )}

                {/* Stage Action: Final Invoice Payment */}
                {p.status === 'PENDING_CUST_PAYMENT' && (
                  <div className="inner-panel" style={{ marginTop: 'var(--sp-5)', border: '1.5px solid var(--accent-border)' }}>
                    <div className="flex-between">
                      <div>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.2rem' }}>Final Commercial Invoice &amp; Tax Settlement</h4>
                        <p className="subtitle" style={{ margin: 0, fontSize: '0.82rem' }}>
                          Invoice Number: <strong>INV-ITV-{p.id}</strong> &bull; Credit Facility: <strong>{activeCustomer.creditTier || 'Cash'}</strong>
                        </p>
                      </div>
                      <span className="badge badge-pending">Payment Due</span>
                    </div>

                    {/* Invoice Line Item Breakdown */}
                    <div style={{ margin: '14px 0', background: 'var(--bg-card)', padding: '12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <div className="flex-between" style={{ padding: '3px 0' }}>
                        <span>Precision Manufacturing &amp; Machining (Agreed Scope)</span>
                        <strong>₹42,500.00</strong>
                      </div>
                      <div className="flex-between" style={{ padding: '3px 0' }}>
                        <span>Logistics, Freight &amp; Transit Handling</span>
                        <strong>₹{Number(p.logisticsFee || 4500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="flex-between" style={{ padding: '3px 0', color: 'var(--text-muted)' }}>
                        <span>Applicable GST (18%)</span>
                        <span>₹{Math.round((42500 + Number(p.logisticsFee || 4500)) * 0.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex-between" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', fontSize: '0.95rem' }}>
                        <strong>Total Amount Payable</strong>
                        <strong style={{ color: 'var(--accent)' }}>
                          ₹{Math.round((42500 + Number(p.logisticsFee || 4500)) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem' }}>Payment / Settlement Method</label>
                        <select 
                          value={paymentModes[p.id] || (activeCustomer?.creditTier && !activeCustomer.creditTier.includes('Cash') ? 'CREDIT_LINE' : 'NETBANKING')}
                          onChange={e => setPaymentModes({ ...paymentModes, [p.id]: e.target.value })}
                          style={{ fontSize: '0.82rem' }}
                        >
                          <option value="CREDIT_LINE">Corporate Trade Credit (Sanctioned Facility)</option>
                          <option value="NETBANKING">Corporate NetBanking / NEFT / RTGS</option>
                          <option value="UPI">Instant UPI / Bharat QR Escrow</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem' }}>Transaction / UTR Reference</label>
                        <input 
                          type="text" 
                          placeholder="Optional / Auto-generated gateway code"
                          value={paymentRefs[p.id] || ''}
                          onChange={e => setPaymentRefs({ ...paymentRefs, [p.id]: e.target.value })}
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    <button 
                      className="btn btn-success w-full"
                      disabled={isSettling[p.id]}
                      onClick={async () => {
                        setIsSettling(prev => ({ ...prev, [p.id]: true }));
                        const method = paymentModes[p.id] || (activeCustomer?.creditTier && !activeCustomer.creditTier.includes('Cash') ? 'CREDIT_LINE' : 'NETBANKING');
                        const ref = paymentRefs[p.id] || '';
                        await payCustomerFinal(p.id, { paymentMethod: method, transactionRef: ref });
                        setIsSettling(prev => ({ ...prev, [p.id]: false }));
                      }}
                    >
                      {isSettling[p.id] ? 'Settling Payment via Escrow...' : 'Authorize Settlement & Release for Shipping'}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  </div>
                )}

                {/* Settled Payment Receipt Badge */}
                {p.paymentReceipt && (
                  <div className="inner-panel" style={{ marginTop: 'var(--sp-4)', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div className="flex-between">
                      <div>
                        <strong style={{ color: 'var(--success)' }}>✓ Commercial Settlement Completed &amp; Escrow Locked</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Receipt: <strong>{p.paymentReceipt.receiptId}</strong> &bull; Txn Ref: {p.paymentReceipt.transactionRef} &bull; Total Settled: ₹{p.paymentReceipt.amountPaid?.toLocaleString()} ({p.paymentReceipt.paymentMethod})
                        </div>
                      </div>
                      <span className="badge badge-approved">Settled</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
