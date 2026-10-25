import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// Sleek engineering SVG icons
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MachineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ToolIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const GaugeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m14 10-4 4" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InsightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const TargetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default function CADModelAnalyzer({ initialPresetId = 'shaft-precision-drive', onClose }) {
  const { showToast } = useApp();
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState(initialPresetId);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [drawingSvg, setDrawingSvg] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedMimeType, setUploadedMimeType] = useState('');
  const [activeTab, setActiveTab] = useState('operations'); // 'operations' | 'machines' | 'tooling' | 'dfm' | 'flow'
  const [selectedOpNumber, setSelectedOpNumber] = useState('OP 10');
  const [hoveredBalloon, setHoveredBalloon] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [analysisProgress, setAnalysisProgress] = useState('');

  const fileInputRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const opCardsRef = useRef({});
  const analysisRequestRef = useRef(0);
  const analysisAbortRef = useRef(null);
  const progressTimersRef = useRef([]);

  const clearProgressTimers = () => {
    progressTimersRef.current.forEach(clearTimeout);
    progressTimersRef.current = [];
  };

  // Load the sample list, then analyze the selected preset.
  useEffect(() => {
    const controller = new AbortController();
    fetchPresets(controller.signal);

    return () => {
      controller.abort();
      analysisRequestRef.current += 1;
      analysisAbortRef.current?.abort();
      clearProgressTimers();
    };
  }, []);

  const fetchPresets = async (signal) => {
    try {
      const res = await fetch('/api/v1/cad/presets', { signal });
      if (!res.ok) throw new Error('Could not load presets');
      const data = await res.json();
      const availablePresets = Array.isArray(data.presets) ? data.presets : [];
      if (!availablePresets.length) throw new Error('No sample drawings are available.');
      if (signal.aborted) return;

      setPresets(availablePresets);
      const initialPreset = availablePresets.find(preset => preset.id === initialPresetId) || availablePresets[0];
      setSelectedPresetId(initialPreset.id);
      runAnalysis(initialPreset.id);
    } catch (err) {
      if (signal.aborted) return;
      console.warn('Failed to load CAD sample drawings:', err);
      setAnalysisError(err.message || 'The CAD analyzer service is unavailable.');
      showToast(err.message || 'The CAD analyzer service is unavailable.');
    }
  };

  // Run analysis for a preset or uploaded drawing
  const runAnalysis = async (presetId, customImage = null, customMimeType = 'image/png') => {
    clearProgressTimers();
    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;
    const requestId = ++analysisRequestRef.current;

    setAnalyzing(true);
    setAnalysisReport(null);
    setAnalysisMeta(null);
    setAnalysisError('');
    setAnalysisProgress('Decomposing CAD geometry & extracting title block...');

    try {
      progressTimersRef.current = [
        setTimeout(() => setAnalysisProgress('Detecting datums, critical tolerances, and GD&T...'), 400),
        setTimeout(() => setAnalysisProgress('Generating operations routing & matching CNC machine tools...'), 800),
        setTimeout(() => setAnalysisProgress('Subordinating features with drawing coordinates...'), 1200)
      ];

      const payload = customImage
        ? { imageBase64: customImage, mimeType: customMimeType }
        : { presetId: presetId || selectedPresetId };

      const res = await fetch('/api/v1/cad/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis request failed (${res.status})`);
      }

      const data = await res.json();
      if (requestId !== analysisRequestRef.current) return;
      if (!data.analysis || !Array.isArray(data.analysis.operations) || data.analysis.operations.length === 0) {
        throw new Error('The analyzer did not return a usable manufacturing plan.');
      }
      setAnalysisReport(data.analysis);
      setAnalysisMeta({ source: data.source, modelUsed: data.modelUsed, notice: data.notice });
      if (data.drawingSvg) {
        setDrawingSvg(data.drawingSvg);
        setUploadedImage(null);
        setUploadedMimeType('');
      }
      if (data.analysis?.operations?.[0]?.opNumber) {
        setSelectedOpNumber(data.analysis.operations[0].opNumber);
      }
      showToast('CAD drawing analysis complete.');
    } catch (err) {
      if (requestId !== analysisRequestRef.current || err.name === 'AbortError') return;
      console.error('CAD Analysis error:', err);
      setAnalysisError(err.message || 'Analysis failed. Please try again.');
      showToast(err.message || 'Analysis failed. Please try again.');
    } finally {
      if (requestId === analysisRequestRef.current) {
        clearProgressTimers();
        setAnalyzing(false);
        setAnalysisProgress('');
      }
    }
  };

  // Handle Preset Change
  const handlePresetSelect = (id) => {
    setSelectedPresetId(id);
    setUploadedImage(null);
    setUploadedMimeType('');
    setDrawingSvg('');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    runAnalysis(id);
  };

  // Handle Upload Drawing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    if (!supportedTypes.includes(file.type)) {
      showToast('Upload a PNG, JPG, WEBP, or PDF engineering drawing.');
      e.target.value = '';
      return;
    }
    if (file.size === 0 || file.size > 8 * 1024 * 1024) {
      showToast('Drawing files must be larger than 0 bytes and 8 MB or smaller.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = typeof reader.result === 'string' ? reader.result : '';
      if (!base64Data) {
        showToast('The selected drawing could not be read. Please try again.');
        e.target.value = '';
        return;
      }
      setUploadedImage(base64Data);
      setUploadedMimeType(file.type);
      setDrawingSvg('');
      setSelectedPresetId('custom');
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      runAnalysis(null, base64Data, file.type);
    };
    reader.onerror = () => {
      showToast('The selected drawing could not be read. Please try again.');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Select an operation and highlight its subordinated balloon
  const handleSelectOperation = (opNumber) => {
    setSelectedOpNumber(opNumber);
    const op = analysisReport?.operations?.find(o => o.opNumber === opNumber);
    if (op?.subordinatedDrawingRef?.balloonNumber) {
      setHoveredBalloon(op.subordinatedDrawingRef.balloonNumber);
    }
  };

  // Select balloon on drawing and scroll operation into view
  const handleSelectBalloon = (balloonNumber) => {
    const op = analysisReport?.operations?.find(o => o.subordinatedDrawingRef?.balloonNumber === balloonNumber);
    if (op) {
      setSelectedOpNumber(op.opNumber);
      setActiveTab('operations');
      if (opCardsRef.current[op.opNumber]) {
        opCardsRef.current[op.opNumber].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Pan controls
  const handleMouseDown = (e) => {
    if (e.target.closest('.cad-balloon-pin')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.6, prev + delta), 2.8));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="cad-analyzer-container">
      {/* Top Action Header */}
      <header className="cad-analyzer-header">
        <div className="cad-header-left">
          <div className="cad-title-badge">
            <span className="cad-engine-pill">
              {analysisMeta?.source === 'sample-preset' ? 'Sample plan' : 'Manufacturing workspace'}
            </span>
            <h1>CAD drawing analyzer</h1>
          </div>
          <p className="cad-header-sub">
            Turn engineering drawings into clear operation plans, tooling lists, and machine requirements.
          </p>
        </div>

        <div className="cad-header-actions">
          {/* Preset Selector */}
          <div className="cad-preset-selector-group">
            <label htmlFor="preset-select">Sample Drawing:</label>
            <select
              id="preset-select"
              value={selectedPresetId}
              onChange={(e) => handlePresetSelect(e.target.value)}
              disabled={analyzing || presets.length === 0}
              className="cad-select-input"
            >
              {presets.length === 0 && <option value="">{analysisError ? 'Samples unavailable' : 'Loading samples…'}</option>}
              {presets.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.drawingNo})</option>
              ))}
              {uploadedImage && <option value="custom">Custom Uploaded Drawing</option>}
            </select>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
          >
            <span>Upload drawing</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileUpload}
          />

          {/* Re-analyze Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm btn-reanalyze"
            onClick={() => runAnalysis(selectedPresetId === 'custom' ? null : selectedPresetId, uploadedImage, uploadedMimeType)}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing…' : analysisReport ? 'Run analysis again' : 'Run analysis'}
          </button>

          {onClose && (
            <button type="button" className="cad-close-btn" onClick={onClose} title="Close Analyzer">
              ✕
            </button>
          )}
        </div>
      </header>

      {analysisMeta?.notice && (
        <div className={`cad-analyzer-notice ${analysisMeta.source === 'sample-preset' ? 'sample' : ''}`} role="status">
          <strong>{analysisMeta.source === 'sample-preset' ? 'Sample plan' : 'AI estimate'}</strong>
          <span>{analysisMeta.notice}</span>
          {analysisMeta.modelUsed && <span className="cad-model-label">Engine: {analysisMeta.modelUsed}</span>}
        </div>
      )}
      {analysisError && (
        <div className="cad-analyzer-error" role="alert">
          <strong>Analysis unavailable</strong>
          <span>{analysisError}</span>
        </div>
      )}

      {/* Main Two-Column Workstation */}
      <div className="cad-workstation-grid">

        {/* Left Column: Visual Drawing Canvas & Subordination Overlays */}
        <div className="cad-drawing-viewport-card">
          <div className="cad-viewport-toolbar">
            <div className="cad-drawing-meta">
              <span className="cad-drawing-id">{analysisReport?.drawingNumber || (uploadedImage ? 'UPLOADED DRAWING' : 'SELECT A SAMPLE')}</span>
              <span className="cad-part-name">{analysisReport?.partName || (uploadedImage ? 'Engineering drawing' : 'Awaiting drawing')}</span>
            </div>

            <div className="cad-viewport-controls">
              <button type="button" onClick={() => handleZoom(0.2)} title="Zoom In">+</button>
              <span className="cad-zoom-label">{Math.round(zoomLevel * 100)}%</span>
              <button type="button" onClick={() => handleZoom(-0.2)} title="Zoom Out">&minus;</button>
              <button type="button" onClick={handleResetView} title="Reset View">Fit</button>
            </div>
          </div>

          <div
            className="cad-canvas-container"
            ref={drawingCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          >
            {analyzing && (
              <div className="cad-analysis-overlay">
                <div className="cad-scan-line" />
                <div className="cad-loading-spinner" />
                <div className="cad-loading-text">{analysisProgress || 'Extracting CAD geometry & tooling sequence...'}</div>
              </div>
            )}

            <div
              className="cad-drawing-pan-layer"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              {/* SVG CAD Drawing */}
              {drawingSvg && (
                <div
                  className="cad-svg-wrapper"
                  dangerouslySetInnerHTML={{ __html: drawingSvg }}
                />
              )}

              {/* Uploaded drawing preview */}
              {uploadedImage && !drawingSvg && (
                <div className="cad-uploaded-image-wrapper">
                  {uploadedMimeType === 'application/pdf' ? (
                    <object data={uploadedImage} type="application/pdf" className="cad-custom-pdf" aria-label="Uploaded engineering drawing PDF">
                      <a href={uploadedImage} target="_blank" rel="noreferrer">Open uploaded PDF</a>
                    </object>
                  ) : (
                    <img src={uploadedImage} alt="Uploaded Engineering Drawing" className="cad-custom-img" />
                  )}
                </div>
              )}

              {!drawingSvg && !uploadedImage && (
                <div className="cad-drawing-placeholder" aria-live="polite">
                  <span className="cad-placeholder-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <path d="M12 5.5h16l8 8V42H12a3 3 0 0 1-3-3V8.5a3 3 0 0 1 3-3Z" />
                      <path d="M28 5.5v9h8M16 23h16M16 29h10M16 35h7" />
                      <circle cx="34" cy="34" r="7" />
                      <path d="m39 39 4 4" />
                    </svg>
                  </span>
                  <strong>{analyzing ? 'Preparing drawing preview' : 'Your drawing preview appears here'}</strong>
                  <span>Choose a sample above or upload a PDF, PNG, JPG, or WEBP engineering drawing.</span>
                </div>
              )}

              {/* Subordinated Balloon Pins Overlaid on Drawing */}
              {analysisReport?.operations?.map((op) => {
                const ref = op.subordinatedDrawingRef;
                if (!ref || !ref.calloutLocation) return null;
                const isSelected = selectedOpNumber === op.opNumber;
                const isHovered = hoveredBalloon === ref.balloonNumber;

                return (
                  <div
                    key={op.opNumber}
                    className={`cad-balloon-pin ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={{
                      left: `${ref.calloutLocation.xPercent}%`,
                      top: `${ref.calloutLocation.yPercent}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBalloon(ref.balloonNumber);
                    }}
                    onMouseEnter={() => setHoveredBalloon(ref.balloonNumber)}
                    onMouseLeave={() => setHoveredBalloon(null)}
                    title={`Op: ${op.name} (${op.machine})`}
                  >
                    <span className="cad-balloon-number">{ref.balloonNumber}</span>

                    {/* Floating Callout Tooltip */}
                    {(isSelected || isHovered) && (
                      <div className="cad-balloon-tooltip">
                        <div className="tooltip-op-tag">{op.opNumber}: {op.name}</div>
                        <div className="tooltip-feature"><strong>Feature:</strong> {ref.feature}</div>
                        <div className="tooltip-machine"><strong>Machine:</strong> {op.machineCategory} ({op.machine.split('(')[0]})</div>
                        <div className="tooltip-tool"><strong>Tool:</strong> {op.tooling.split(';')[0]}</div>
                        {ref.tolerance && <div className="tooltip-tol"><strong>Tolerance:</strong> {ref.tolerance}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas Bottom Legend */}
          <div className="cad-canvas-footer-legend">
            {analysisReport ? (
              <>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#e12d39' }} /> Drawing callouts · select one to inspect its operation
                </span>
                <span className="legend-item">
                  <span className="legend-badge">Material</span> {analysisReport.material || 'Not identified'}
                </span>
                <span className="legend-item">
                  <span className="legend-badge">Stock size</span> {analysisReport.rawStock || 'Not identified'}
                </span>
              </>
            ) : (
              <span className="cad-supported-files">PDF, PNG, JPG, or WEBP <span>·</span> Up to 8 MB</span>
            )}
          </div>
        </div>

        {/* Right Column: Comprehensive Operations, Tooling & Machines Panel */}
        <div className={`cad-details-panel-card ${analysisReport ? '' : 'empty'}`}>
          {!analysisReport && (
            <div className="cad-analyzer-empty" role={analysisError ? 'alert' : 'status'}>
              <strong>{analyzing ? 'Building your manufacturing plan' : 'Your process plan appears here'}</strong>
              <span>{analysisError ? 'The analyzer could not reach its sample service. Retry, or upload a drawing when the service is available.' : 'Choose a sample or upload a drawing to generate operations, tooling, and machine requirements.'}</span>
              {analysisError && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={analyzing}
                  onClick={() => runAnalysis(selectedPresetId === 'custom' ? null : selectedPresetId, uploadedImage, uploadedMimeType)}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="cad-panel-tabs">
            <button
              type="button"
              className={`cad-tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
              onClick={() => setActiveTab('operations')}
            >
              Operations &amp; Process Routing ({analysisReport?.operations?.length || 0})
            </button>
            <button
              type="button"
              className={`cad-tab-btn ${activeTab === 'machines' ? 'active' : ''}`}
              onClick={() => setActiveTab('machines')}
            >
              Machines Required ({analysisReport?.machinesSummary?.length || 0})
            </button>
            <button
              type="button"
              className={`cad-tab-btn ${activeTab === 'tooling' ? 'active' : ''}`}
              onClick={() => setActiveTab('tooling')}
            >
              Bill of Tools ({analysisReport?.toolingSummary?.length || 0})
            </button>
            <button
              type="button"
              className={`cad-tab-btn ${activeTab === 'dfm' ? 'active' : ''}`}
              onClick={() => setActiveTab('dfm')}
            >
              DFM &amp; Tolerances
            </button>
            <button
              type="button"
              className={`cad-tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
              onClick={() => setActiveTab('flow')}
            >
              Process Flow
            </button>
          </div>

          {/* TAB 1: OPERATIONS & PROCESS ROUTING */}
          {activeTab === 'operations' && (
            <div className="cad-tab-content-scroll">
              <div className="cad-op-summary-bar">
                <div className="op-summary-stat">
                  <span className="stat-label">Total Operations</span>
                  <strong className="stat-value">{analysisReport?.operations?.length || 0} Steps</strong>
                </div>
                <div className="op-summary-divider" />
                <div className="op-summary-stat">
                  <span className="stat-label">Estimated Routing Time</span>
                  <strong className="stat-value">
                    {(analysisReport?.operations?.reduce((acc, o) => acc + (o.estimatedCycleTimeSec || 0), 0) / 60).toFixed(1)} min
                  </strong>
                </div>
              </div>

              {/* Visual Process Flow Strip */}
              <div className="cad-process-flow-strip">
                {analysisReport?.operations?.map((op, idx) => {
                  const isActive = selectedOpNumber === op.opNumber;
                  const catCode = {
                    'Turning': 'TURN', 'Milling': 'MILL', 'Drilling': 'DRIL', 'Grinding': 'GRND',
                    'Inspection': 'INSP', 'Finishing': 'FIN', 'EDM': 'EDM', 'Welding': 'WELD'
                  }[op.machineCategory] || 'PROC';

                  return (
                    <React.Fragment key={op.opNumber}>
                      <button
                        type="button"
                        className={`flow-node ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectOperation(op.opNumber)}
                        title={`${op.opNumber}: ${op.name}`}
                      >
                        <span className="flow-node-cat">{catCode}</span>
                        <span className="flow-node-label">{op.opNumber}</span>
                      </button>
                      {idx < (analysisReport.operations.length - 1) && (
                        <span className="flow-connector" aria-hidden="true">→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="cad-operations-timeline">
                {analysisReport?.operations?.map((op) => {
                  const isSelected = selectedOpNumber === op.opNumber;
                  const balloonNo = op.subordinatedDrawingRef?.balloonNumber;

                  return (
                    <article
                      key={op.opNumber}
                      ref={el => opCardsRef.current[op.opNumber] = el}
                      className={`cad-operation-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectOperation(op.opNumber)}
                    >
                      {/* Top Header Row */}
                      <div className="op-card-header">
                        <div className="op-card-header-left">
                          <span className="op-seq-badge">{op.opNumber}</span>
                          <span className="op-category-pill">{op.machineCategory}</span>
                          <span className="op-stage-pill">{op.stage}</span>
                        </div>

                        <div className="op-card-header-right">
                          {op.estimatedCycleTimeSec > 0 && (
                            <span className="op-time-badge" title="Estimated operation cycle time">
                              <ClockIcon />
                              <span>{Math.round(op.estimatedCycleTimeSec)}s</span>
                            </span>
                          )}

                          {balloonNo && (
                            <button
                              type="button"
                              className="op-balloon-link-badge"
                              title="Locate feature callout on drawing"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectBalloon(balloonNo);
                              }}
                            >
                              <PinIcon />
                              <span>Callout #{balloonNo}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="op-title-text">{op.name}</h3>

                      {/* Subordinated Feature Callout */}
                      {op.subordinatedDrawingRef && (
                        <div className="op-subordinated-feature-box">
                          <div className="feature-info-row">
                            <span className="feature-prefix">Drawing Feature:</span>
                            <span className="feature-desc">{op.subordinatedDrawingRef.feature}</span>
                          </div>
                          {op.subordinatedDrawingRef.tolerance && (
                            <span className="op-tolerance-tag">Tol: {op.subordinatedDrawingRef.tolerance}</span>
                          )}
                        </div>
                      )}

                      {/* Machine & Tool Details Grid */}
                      <div className="op-specs-grid">
                        <div className="op-spec-item">
                          <div className="spec-label-row">
                            <MachineIcon />
                            <span className="spec-label">Machine Required</span>
                          </div>
                          <span className="spec-value">{op.machine}</span>
                        </div>

                        <div className="op-spec-item">
                          <div className="spec-label-row">
                            <ToolIcon />
                            <span className="spec-label">Cutting Tooling</span>
                          </div>
                          <span className="spec-value">{op.tooling}</span>
                        </div>

                        <div className="op-spec-item">
                          <div className="spec-label-row">
                            <span className="spec-label">Fixturing &amp; Workholding</span>
                          </div>
                          <span className="spec-value">{op.fixturing || 'Standard Vise / 3-Jaw Chuck'}</span>
                        </div>

                        <div className="op-spec-item">
                          <div className="spec-label-row">
                            <GaugeIcon />
                            <span className="spec-label">Quality Metrology</span>
                          </div>
                          <span className="spec-value">{op.inspectionTool}</span>
                        </div>
                      </div>

                      {/* Cutting Parameters Strip */}
                      {op.cuttingParams && (
                        <div className="op-cutting-params-strip">
                          <span className="param-label">Machining Telemetry:</span>
                          <div className="param-chips-row">
                            {op.cuttingParams.speed && (
                              <span className="param-item">
                                <span className="param-key">Vc</span> {op.cuttingParams.speed}
                              </span>
                            )}
                            {op.cuttingParams.rpm && (
                              <span className="param-item">
                                <span className="param-key">n</span> {op.cuttingParams.rpm}
                              </span>
                            )}
                            {op.cuttingParams.feed && (
                              <span className="param-item">
                                <span className="param-key">f</span> {op.cuttingParams.feed}
                              </span>
                            )}
                            {op.cuttingParams.doc && (
                              <span className="param-item">
                                <span className="param-key">ap</span> {op.cuttingParams.doc}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MACHINES INVOLVED & SHOP FLOOR ALLOCATION */}
          {activeTab === 'machines' && (
            <div className="cad-tab-content-scroll">
              <div className="cad-tab-intro">
                <h3>Required Machinery Fleet for this Component</h3>
                <p>The CAD analyzer has identified the following manufacturing machinery necessary to meet part tolerances and geometry specifications.</p>
              </div>

              <div className="cad-machines-grid">
                {analysisReport?.machinesSummary?.map((m, idx) => (
                  <div key={idx} className="cad-machine-card">
                    <div className="machine-card-header">
                      <div className="machine-icon-box">
                        <MachineIcon />
                      </div>
                      <div className="machine-title-group">
                        <h4>{m.machineName}</h4>
                        <span className="vendor-suitability-pill">{m.suitabilityScore || 'Qualified Vendor Spec'}</span>
                      </div>
                    </div>

                    <div className="machine-specs-section">
                      <span className="specs-subheading">Technical Specifications</span>
                      <p className="specs-text">{m.requiredSpecs}</p>
                    </div>

                    <div className="machine-ops-tags">
                      <span className="specs-subheading">Allocated Operations</span>
                      <div className="ops-chips-wrap">
                        {m.operationsPerformed?.map((opName, oIdx) => (
                          <span key={oIdx} className="op-chip">{opName}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BILL OF TOOLS (TOOLING MATRIX) */}
          {activeTab === 'tooling' && (
            <div className="cad-tab-content-scroll">
              <div className="cad-tab-intro">
                <h3>Bill of Tools (Shop Floor Tooling Matrix)</h3>
                <p>Comprehensive list of carbide inserts, solid end mills, taps, and grinding wheels needed to execute this production run.</p>
              </div>

              <div className="cad-tooling-table-wrap">
                <table className="cad-tooling-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Tool Specification / Code</th>
                      <th>Coating / Grade</th>
                      <th>Machining Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisReport?.toolingSummary?.map((t, idx) => (
                      <tr key={idx}>
                        <td><span className="tool-category-badge">{t.toolCategory}</span></td>
                        <td><strong className="tool-code-mono">{t.toolCode}</strong></td>
                        <td><span className="tool-coating-text">{t.coating || 'Standard / Uncoated'}</span></td>
                        <td>{t.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DFM & TOLERANCES */}
          {activeTab === 'dfm' && (
            <div className="cad-tab-content-scroll">
              <div className="cad-tab-intro">
                <h3>Design for Manufacturability (DFM) &amp; Tolerances</h3>
                <p>AI engineering observations on dimension stackups, tool access constraints, and setup consolidation opportunities.</p>
              </div>

              {/* Critical Tolerances Card */}
              <div className="cad-dfm-section">
                <div className="dfm-section-header">
                  <TargetIcon />
                  <h4>Critical Drawing Tolerances Identified</h4>
                </div>
                <div className="critical-tols-list">
                  {analysisReport?.criticalTolerances?.map((tol, idx) => (
                    <div key={idx} className="tol-badge-card">
                      <span className="tol-check"><CheckIcon /></span>
                      <span className="tol-text">{tol}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Recommendations */}
              <div className="cad-dfm-section">
                <div className="dfm-section-header">
                  <InsightIcon />
                  <h4>Process Optimization &amp; Tooling Notes</h4>
                </div>
                <div className="dfm-recommendations-list">
                  {analysisReport?.dfmRecommendations?.map((rec, idx) => (
                    <div key={idx} className="dfm-rec-item">
                      <span className="dfm-bullet" aria-hidden="true">•</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROCESS FLOW DIAGRAM */}
          {activeTab === 'flow' && (
            <div className="cad-tab-content-scroll">
              <div className="cad-tab-intro">
                <h3>Manufacturing Process Flow Diagram</h3>
                <p>Visual representation of the complete manufacturing workflow showing process categories, machine allocations, and quality gates.</p>
              </div>

              {/* Process Flow Swimlane View */}
              <div className="cad-flow-diagram">
                {(() => {
                  const categories = {};
                  analysisReport?.operations?.forEach(op => {
                    const cat = op.machineCategory || 'Other';
                    if (!categories[cat]) categories[cat] = [];
                    categories[cat].push(op);
                  });
                  return Object.entries(categories).map(([cat, ops]) => {
                    const catCode = {
                      'Turning': 'TURN', 'Milling': 'MILL', 'Drilling': 'DRIL', 'Grinding': 'GRND',
                      'Inspection': 'INSP', 'Finishing': 'FIN', 'EDM': 'EDM', 'Welding': 'WELD'
                    }[cat] || 'PROC';

                    return (
                      <div key={cat} className="flow-swimlane">
                        <div className="swimlane-header">
                          <span className="swimlane-cat-code">{catCode}</span>
                          <span className="swimlane-title">{cat}</span>
                          <span className="swimlane-count">{ops.length} ops</span>
                        </div>
                        <div className="swimlane-ops">
                          {ops.map(op => (
                            <div
                              key={op.opNumber}
                              className={`swimlane-op-card ${selectedOpNumber === op.opNumber ? 'active' : ''}`}
                              onClick={() => handleSelectOperation(op.opNumber)}
                            >
                              <div className="swim-op-header">
                                <span className="swim-op-badge">{op.opNumber}</span>
                                {op.estimatedCycleTimeSec > 0 && (
                                  <span className="swim-op-time">
                                    <ClockIcon />
                                    <span>{Math.round(op.estimatedCycleTimeSec)}s</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="swim-op-name">{op.name}</h4>
                              <p className="swim-op-machine">{op.machine.split('(')[0].trim()}</p>
                              <p className="swim-op-tool">{op.tooling.split(';')[0]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Total Summary */}
              <div className="cad-flow-summary-bar">
                <div className="flow-summary-item">
                  <span className="flow-summary-label">Total Operations</span>
                  <span className="flow-summary-value">{analysisReport?.operations?.length || 0}</span>
                </div>
                <div className="flow-summary-item">
                  <span className="flow-summary-label">Machine Categories</span>
                  <span className="flow-summary-value">
                    {new Set(analysisReport?.operations?.map(o => o.machineCategory)).size || 0}
                  </span>
                </div>
                <div className="flow-summary-item">
                  <span className="flow-summary-label">Est. Total Cycle</span>
                  <span className="flow-summary-value">
                    {(analysisReport?.operations?.reduce((a, o) => a + (o.estimatedCycleTimeSec || 0), 0) / 60).toFixed(1)} min
                  </span>
                </div>
                <div className="flow-summary-item">
                  <span className="flow-summary-label">Unique Machines</span>
                  <span className="flow-summary-value">{analysisReport?.machinesSummary?.length || 0}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
