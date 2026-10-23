import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

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
              {analysisMeta?.source === 'sample-preset' ? 'Sample CAD Plan' : 'AI Precision CAM'}
            </span>
            <h1>CAD Drawing &amp; Manufacturing Process Analyzer</h1>
          </div>
          <p className="cad-header-sub">
            Deconstruct 2D drawings into complete CNC operations, required cutting tools, and machine allocations with visual drawing subordination.
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
              disabled={analyzing}
              className="cad-select-input"
            >
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
            <span>📁 Upload Drawing</span>
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
            {analyzing ? 'Analyzing CAD...' : '⚡ Re-Run Model'}
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
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#e12d39' }} /> Subordinated Drawing Balloon Callouts (Click to inspect operation)
            </span>
            <span className="legend-item">
              <span className="legend-badge">Material</span> {analysisReport?.material || 'Not identified'}
            </span>
            <span className="legend-item">
              <span className="legend-badge">Stock Size</span> {analysisReport?.rawStock || 'Not identified'}
            </span>
          </div>
        </div>

        {/* Right Column: Comprehensive Operations, Tooling & Machines Panel */}
        <div className={`cad-details-panel-card ${analysisReport ? '' : 'empty'}`}>
          {!analysisReport && (
            <div className="cad-analyzer-empty" role={analysisError ? 'alert' : 'status'}>
              <strong>{analyzing ? 'Analyzing drawing…' : 'No analysis available'}</strong>
              <span>{analysisError || 'Choose a sample drawing or upload a supported engineering drawing to begin.'}</span>
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
                <span>Total Manufacturing Steps: <strong>{analysisReport?.operations?.length || 0}</strong></span>
                <span>Est. Total Cycle Time: <strong>{(analysisReport?.operations?.reduce((acc, o) => acc + (o.estimatedCycleTimeSec || 0), 0) / 60).toFixed(1)} mins</strong></span>
              </div>

              {/* Visual Process Flow Strip */}
              <div className="cad-process-flow-strip">
                {analysisReport?.operations?.map((op, idx) => {
                  const isActive = selectedOpNumber === op.opNumber;
                  const categoryIcon = {
                    'Turning': '🔩', 'Milling': '⚙️', 'Drilling': '🔧', 'Grinding': '💎',
                    'Inspection': '📐', 'Finishing': '🔥', 'EDM': '⚡', 'Welding': '🔥'
                  }[op.machineCategory] || '⚙️';
                  return (
                    <React.Fragment key={op.opNumber}>
                      <button
                        type="button"
                        className={`flow-node ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectOperation(op.opNumber)}
                        title={`${op.opNumber}: ${op.name}`}
                      >
                        <span className="flow-node-icon">{categoryIcon}</span>
                        <span className="flow-node-label">{op.opNumber}</span>
                        <span className="flow-node-cat">{op.machineCategory}</span>
                      </button>
                      {idx < (analysisReport.operations.length - 1) && (
                        <span className="flow-connector">→</span>
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
                      <div className="op-card-header">
                        <div className="op-card-title-group">
                          <span className="op-seq-badge">{op.opNumber}</span>
                          <span className="op-stage-pill">{op.stage}</span>
                          <h3 className="op-title-text">{op.name}</h3>
                        </div>

                        {balloonNo && (
                          <div
                            className="op-balloon-link-badge"
                            title="Subordinated to drawing feature"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBalloon(balloonNo);
                            }}
                          >
                            <span className="op-balloon-icon">📍</span>
                            <span>Drawing Balloon #{balloonNo}</span>
                          </div>
                        )}
                      </div>

                      {/* Subordinated Feature Callout */}
                      {op.subordinatedDrawingRef && (
                        <div className="op-subordinated-feature-box">
                          <strong>Drawing Callout:</strong> {op.subordinatedDrawingRef.feature}
                          {op.subordinatedDrawingRef.tolerance && (
                            <span className="op-tolerance-tag">Tol: {op.subordinatedDrawingRef.tolerance}</span>
                          )}
                        </div>
                      )}

                      {/* Machine & Tool Details Grid */}
                      <div className="op-specs-grid">
                        <div className="op-spec-item">
                          <span className="spec-label">Machine Required:</span>
                          <span className="spec-value machine-highlight">
                            {op.machine}
                          </span>
                        </div>

                        <div className="op-spec-item">
                          <span className="spec-label">Cutting Tool &amp; Inserts:</span>
                          <span className="spec-value tool-highlight">
                            {op.tooling}
                          </span>
                        </div>

                        <div className="op-spec-item">
                          <span className="spec-label">Fixturing &amp; Workholding:</span>
                          <span className="spec-value">{op.fixturing || 'Standard Vise / 3-Jaw Chuck'}</span>
                        </div>

                        <div className="op-spec-item">
                          <span className="spec-label">Quality Inspection Gauge:</span>
                          <span className="spec-value">{op.inspectionTool}</span>
                        </div>
                      </div>

                      {/* Cutting Parameters Strip */}
                      {op.cuttingParams && (
                        <div className="op-cutting-params-strip">
                          <span className="param-label">Cutting Parameters:</span>
                          {op.cuttingParams.speed && <span className="param-item">Vc: <strong>{op.cuttingParams.speed}</strong></span>}
                          {op.cuttingParams.rpm && <span className="param-item">RPM: <strong>{op.cuttingParams.rpm}</strong></span>}
                          {op.cuttingParams.feed && <span className="param-item">Feed: <strong>{op.cuttingParams.feed}</strong></span>}
                          {op.cuttingParams.doc && <span className="param-item">ap: <strong>{op.cuttingParams.doc}</strong></span>}
                          {op.estimatedCycleTimeSec && (
                            <span className="param-item param-time">⏱ {Math.round(op.estimatedCycleTimeSec)}s</span>
                          )}
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
                      <div className="machine-icon-box">⚙️</div>
                      <div>
                        <h4>{m.machineName}</h4>
                        <span className="vendor-suitability-pill">{m.suitabilityScore || '95% ITTOVA Vendor Match'}</span>
                      </div>
                    </div>

                    <div className="machine-specs-section">
                      <span className="specs-subheading">Required Technical Specifications:</span>
                      <p className="specs-text">{m.requiredSpecs}</p>
                    </div>

                    <div className="machine-ops-tags">
                      <span className="specs-subheading">Operations Allocated:</span>
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
                        <td><strong>{t.toolCode}</strong></td>
                        <td>{t.coating || 'TiAlN / Polished'}</td>
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
                <h4>🎯 Critical Drawing Tolerances Identified</h4>
                <div className="critical-tols-list">
                  {analysisReport?.criticalTolerances?.map((tol, idx) => (
                    <div key={idx} className="tol-badge-card">
                      <span className="tol-check">✓</span>
                      <span>{tol}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Recommendations */}
              <div className="cad-dfm-section">
                <h4>🛠 Process Optimization &amp; Tooling Notes</h4>
                <div className="dfm-recommendations-list">
                  {analysisReport?.dfmRecommendations?.map((rec, idx) => (
                    <div key={idx} className="dfm-rec-item">
                      <span className="dfm-icon">💡</span>
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
                    const catIcon = {
                      'Turning': '🔩', 'Milling': '⚙️', 'Drilling': '🔧', 'Grinding': '💎',
                      'Inspection': '📐', 'Finishing': '🔥', 'EDM': '⚡', 'Welding': '🔥'
                    }[cat] || '⚙️';
                    return (
                      <div key={cat} className="flow-swimlane">
                        <div className="swimlane-header">
                          <span className="swimlane-icon">{catIcon}</span>
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
                                <span className="swim-op-time">⏱ {Math.round(op.estimatedCycleTimeSec || 0)}s</span>
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
