import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const SECTORS = [
  {
    number: '01 / 06',
    title: 'Aerospace & Defence Components',
    excerpt: '5-Axis CNC machined parts in Inconel 718, Titanium Grade 5, and Aircraft Aluminum 7075. AS9100D certified process routing.',
    badge: 'AS9100D Certified',
    gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    number: '02 / 06',
    title: 'Locomotive & Rail Heavy Assemblies',
    excerpt: 'Heavy-duty Bogie assemblies, braking linkages, and traction motor housings built to Medha Servo Drives precision standards.',
    badge: 'Traction & Bogie',
    gradient: 'linear-gradient(135deg, #1e3a2f 0%, #1b4332 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8M8 19l-2 3M16 19l2 3"/>
      </svg>
    )
  },
  {
    number: '03 / 06',
    title: 'Precision Tooling, Dies & Molds',
    excerpt: 'Sub-micron Wire EDM and hardened D2/HCHCR forming tools, progressive stamping dies, and high-tonnage press brake tooling.',
    badge: '±0.002mm Accuracy',
    gradient: 'linear-gradient(135deg, #1b4332 0%, #245c42 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    )
  },
  {
    number: '04 / 06',
    title: 'Energy & Heavy Process Engineering',
    excerpt: 'Turbine casing components, ASME certified pressure vessel flanges, and high-pressure forged valves in SS 316L and Duplex SS.',
    badge: 'ASME Section IX',
    gradient: 'linear-gradient(135deg, #132a20 0%, #1b4332 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    )
  },
  {
    number: '05 / 06',
    title: 'Industrial Automation & Robotics',
    excerpt: 'High-cycle robotic linkages, multi-axis pneumatic manifolds, harmonic drive housings, and anodized motion control parts.',
    badge: 'Robotics & Automation',
    gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    )
  },
  {
    number: '06 / 06',
    title: 'Electric Mobility & Battery Packs',
    excerpt: 'IP67 sealed battery enclosures, structural busbars, motor stator housings, and lightweight extruded aluminum chassis parts.',
    badge: 'Automotive & EV',
    gradient: 'linear-gradient(135deg, #1a3628 0%, #1b4332 100%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  }
];

export default function Home() {
  const { setCurrentView, showToast, resetDatabase, currentUser } = useApp();
  const [material, setMaterial] = useState('SS 316');
  const [batchSize, setBatchSize] = useState('Batch');
  const [radius, setRadius] = useState('50');

  const handleLaunchAuth = (role) => {
    setCurrentView('login');
    showToast(`Launching ${role === 'vendor' ? 'Supplier' : 'Customer'} Workspace Authentication.`);
  };

  return (
    <div className="view">
      {/* ── 1. HERO SECTION ──────────────────────── */}
      <section className="hero-wrapper">
        <div className="container">
          <div className="hero-inner-grid">
            <div className="hero-content">
              <div className="hero-label">
                Precision Manufacturing &amp; Sourcing Platform
              </div>
              <h1 className="hero-title">
                Custom Manufacturing,<br />
                <span className="italic">Managed End-to-End</span>
              </h1>
              <p className="hero-subtitle">
                ITTOVA connects engineering OEMs directly with 38 pre-audited CNC machining, sheet metal, and casting hubs across Hyderabad. Autonomous drawing feature extraction, Zeiss CMM inspection, and guaranteed DIN EN 10204 3.1 traceability.
              </p>
              <div className="hero-cta-row">
                <button 
                  className="btn btn-lg" 
                  onClick={() => handleLaunchAuth('customer')}
                >
                  Submit Engineering Drawings
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button 
                  className="btn btn-secondary btn-lg" 
                  onClick={() => handleLaunchAuth('vendor')}
                >
                  Register as Supplier
                </button>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="hero-visual-card">
              <div className="hero-cad-preview">
                <div className="hero-cad-grid-pattern" />
                <div className="hero-cad-model-icon">
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div className="hero-cad-title">Hydraulic Manifold Block — 5-Axis VMC</div>
                <div className="hero-cad-meta">SS 316L &bull; ±0.005mm &bull; Zeiss CMM Verified</div>
              </div>

              <div className="hero-floating-badge">
                <div className="badge-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <div className="badge-number">99.85%</div>
                  <div className="badge-label">Zeiss CMM Inspection Conformance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MARQUEE TICKER (InsectaTech Signature) ── */}
      <div className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-item">
            <span className="marquee-text">5-Axis CNC Milling</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Fiber Laser Cutting (Up to 12kW)</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Zeiss CMM Accredited Metrology</span>
            <span className="marquee-dot" />
            <span className="marquee-text">AS9100D &amp; ISO 9001:2015 Audited Hubs</span>
            <span className="marquee-dot" />
            <span className="marquee-text">DIN EN 10204 3.1 Traceability</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Autonomous AI CAD Feature Scoping</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Cherlapally &amp; Balanagar Industrial Clusters</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Guaranteed ±0.005mm Tolerances</span>
            <span className="marquee-dot" />
          </div>
          {/* Duplicate track for seamless infinite scroll */}
          <div className="marquee-item">
            <span className="marquee-text">5-Axis CNC Milling</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Fiber Laser Cutting (Up to 12kW)</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Zeiss CMM Accredited Metrology</span>
            <span className="marquee-dot" />
            <span className="marquee-text">AS9100D &amp; ISO 9001:2015 Audited Hubs</span>
            <span className="marquee-dot" />
            <span className="marquee-text">DIN EN 10204 3.1 Traceability</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Autonomous AI CAD Feature Scoping</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Cherlapally &amp; Balanagar Industrial Clusters</span>
            <span className="marquee-dot" />
            <span className="marquee-text">Guaranteed ±0.005mm Tolerances</span>
            <span className="marquee-dot" />
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── 3. AI QUOTING ENGINE ─────────────────── */}
        <div className="quote-engine" id="quoting-engine">
          <div className="quote-engine-header">
            <div>
              <div className="section-label">Instant Estimation Engine</div>
              <h3 style={{ marginBottom: '0.25rem' }}>AI-Assisted CAD Intake &amp; DFM Scoping</h3>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Drop your 3D CAD (.STEP, .IGES, .SLDPRT) or 2D production drawings (PDF, DWG) for instant process decomposition.
              </p>
            </div>
            <span className="badge badge-approved">
              <span className="status-live-dot" /> AI Model v4.2 Active
            </span>
          </div>

          <div className="grid-2">
            <div 
              className="file-upload-mock" 
              id="hero-dropzone"
              onClick={() => handleLaunchAuth('customer')}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--color-accent-pale)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <strong>Drop 3D CAD or 2D Drawing Files Here</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Supports .STEP, .IGES, .SLDPRT, .PDF, .DWG, .DXF (Max 150MB)
              </span>
              <span className="btn btn-sm" style={{ marginTop: '8px' }}>
                Browse Files &rarr;
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div>
                <label>Material Specification</label>
                <select value={material} onChange={e => setMaterial(e.target.value)}>
                  <option value="SS 316">Stainless Steel 316L (Food &amp; Marine Grade)</option>
                  <option value="SS 304">Stainless Steel 304 (General Industrial)</option>
                  <option value="Al 7075">Aircraft Aluminum 7075-T6</option>
                  <option value="Al 6061">Structural Aluminum 6061-T6</option>
                  <option value="Titanium Gr 5">Titanium Grade 5 (Ti-6Al-4V Aerospace)</option>
                  <option value="MS IS 2062">Mild Steel IS 2062 Grade B</option>
                </select>
              </div>
              <div className="grid-2">
                <div>
                  <label>Supplier Hub Radius</label>
                  <select value={radius} onChange={e => setRadius(e.target.value)}>
                    <option value="25">Within 25 km (Cherlapally Hub)</option>
                    <option value="50">Within 50 km (Greater Hyderabad)</option>
                    <option value="100">Within 100 km (Telangana State)</option>
                    <option value="All">All South India Facilities</option>
                  </select>
                </div>
                <div>
                  <label>Batch Size Volume</label>
                  <select value={batchSize} onChange={e => setBatchSize(e.target.value)}>
                    <option value="Prototype">Prototype (1–5 pcs)</option>
                    <option value="Batch">Batch Production (10–100 pcs)</option>
                    <option value="Production">Mass Series (100+ pcs)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button 
                  className="btn w-full" 
                  style={{ width: '100%', padding: '14px 24px' }}
                  onClick={() => handleLaunchAuth('customer')}
                >
                  Generate Immediate DFM Quotation &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. HOW IT WORKS: 4 STEPS ────────────── */}
        <div style={{ marginTop: 'var(--sp-12)' }}>
          <div className="section-label">Execution Methodology</div>
          <h2>Structured Manufacturing in Four Steps</h2>
          <p className="subtitle">
            From preliminary CAD intake to Zeiss CMM inspection and final delivery, every production stage is audited and tracked.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <span className="workflow-step-num">01</span>
            <h4>Drawing Intake &amp; AI DFM</h4>
            <p>CAD models and 2D engineering drawings are automatically parsed. Geometrical tolerances, envelope dimensions, and toolpaths are extracted in minutes.</p>
          </div>
          <div className="workflow-step">
            <span className="workflow-step-num">02</span>
            <h4>Process Validation &amp; Scoping</h4>
            <p>Certified manufacturing engineers review AI extractions, establish process routing sequences, and demarcate in-house versus outsourced processing.</p>
          </div>
          <div className="workflow-step">
            <span className="workflow-step-num">03</span>
            <h4>Audited Supplier Bidding</h4>
            <p>Idle spindles in pre-audited Hyderabad facilities are matched to your specific envelope and tolerance specs. Transparent quotes are compiled with platform fee.</p>
          </div>
          <div className="workflow-step">
            <span className="workflow-step-num">04</span>
            <h4>Zeiss CMM QA &amp; Dispatch</h4>
            <p>Parts arrive at the ITTOX Central Warehouse for dimensional metrology verification against drawing specs. Approved lots ship with full ISO conformance dossiers.</p>
          </div>
        </div>

        {/* ── 5. MANUFACTURING SECTORS ───────────── */}
        <div style={{ marginTop: 'var(--sp-12)' }}>
          <div className="products-header">
            <div>
              <div className="section-label">Capabilities &amp; Sectors</div>
              <h2>Engineered for High-Consequence Applications</h2>
            </div>
            <p className="subtitle" style={{ maxWidth: '480px', marginBottom: 0 }}>
              Delivering high-precision CNC machined parts, fabricated assemblies, and precision tooling for global OEMs.
            </p>
          </div>

          <div className="products-grid">
            {SECTORS.map((sec, idx) => (
              <div key={idx} className="product-card" onClick={() => handleLaunchAuth('customer')}>
                <div 
                  className="card-visual" 
                  style={{ background: sec.gradient }}
                />
                <div className="card-overlay" />
                <div className="card-content">
                  <div className="card-number">{sec.number}</div>
                  <h3 className="card-title">{sec.title}</h3>
                  <div className="card-excerpt">{sec.excerpt}</div>
                  <div className="card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. METROLOGY STATS STRIP ───────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                99.85<span className="stat-suffix">%</span>
              </div>
              <div className="stat-label">Zeiss CMM Dimensional Conformance</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                &plusmn;0.005<span className="stat-suffix">mm</span>
              </div>
              <div className="stat-label">Precision Machining Tolerance</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                38<span className="stat-suffix">+</span>
              </div>
              <div className="stat-label">Audited Manufacturing Facilities</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                24<span className="stat-suffix">h</span>
              </div>
              <div className="stat-label">Rapid DFM &amp; RFQ Turnaround</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── 7. WHY CHOOSE ITTOVA (2x2 Quadrant Grid) ── */}
        <div className="why-section">
          <div className="section-label">Enterprise Advantage</div>
          <h2>Why Corporate OEMs Choose ITTOVA</h2>
          <p className="subtitle">
            Engineered to eliminate supply chain unpredictability, fragmented machine shops, and quality variance.
          </p>

          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/>
                  <circle cx="12" cy="12" r="3.5"/>
                </svg>
              </div>
              <h3 className="why-title">Autonomous DFM Feature Scoping</h3>
              <p className="why-text">
                Proprietary algorithmic parsing extracts geometrical tolerances, surface finish callouts (Ra values), and envelope dimensions from your CAD files, cutting RFQ turnaround from weeks to hours.
              </p>
            </div>

            <div className="why-item">
              <div className="why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="why-title">Zero-Compromise Metrology &amp; Quality Release</h3>
              <p className="why-text">
                Every batch routes through the ITTOX central quality hub for coordinate measuring machine (CMM) inspection. Parts are released only with verified DIN EN 10204 3.1 material test certificates.
              </p>
            </div>

            <div className="why-item">
              <div className="why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <h3 className="why-title">Institutional Working Capital &amp; Credit</h3>
              <p className="why-text">
                Integrated NBFC capital lines provide verified vendors with immediate raw material financing upon PO issuance, while offering corporate OEMs Net 30/60 day settlement terms.
              </p>
            </div>

            <div className="why-item">
              <div className="why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8zM5 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM19 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              </div>
              <h3 className="why-title">Geofenced Chain-of-Custody Logistics</h3>
              <p className="why-text">
                GPS-monitored transit from supplier facility to ITTOX central warehouse to customer receiving docks. Zero cross-contamination, secure packaging, and complete digital traceability.
              </p>
            </div>
          </div>
        </div>

        {/* ── 8. EIGHT WORK PLATFORMS ───────────────── */}
        <div style={{ marginTop: 'var(--sp-12)' }}>
          <div className="section-label">Ecosystem Architecture</div>
          <h2>Eight Integrated Work Platforms</h2>
          <p className="subtitle">
            Every stakeholder &mdash; customer, supplier, bank, material trader, and operations officer &mdash; operates through an authenticated, role-isolated console.
          </p>

          <div className="module-grid">
            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h4>Customer Platform</h4>
              <p>CAD drawing release, real-time stage tracking, process scope confirmation, bid comparison, and engineering chat board.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <h4>Vendor Platform</h4>
              <p>CNC machinery registry, RFQ inbox, production PO acceptance, inward material tracking, and daily progress alarms.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <h4>Bank / NBFC Capital</h4>
              <p>Embedded invoice discounting and raw material credit lines pre-sanctioned for verified ITTOVA tier-1 suppliers.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <h4>Raw Material Network</h4>
              <p>Certified steel, aluminum, and exotic alloy traders supply certified billets with mill test reports direct to vendor plants.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <h4>Process Validator App</h4>
              <p>Expert manufacturing engineers validate AI-generated toolpaths, geometric tolerances, and machine allocation rules.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8zM5 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM19 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
              </div>
              <h4>Logistics App</h4>
              <p>Geofenced route scheduling from vendor to ITTOX hub, quality seal verification, and final delivery to client loading bay.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h4>IGI / Metrology QA App</h4>
              <p>Inward and outward quality control. Multi-axis Zeiss CMM inspection, Ra surface roughness, and certificate issuance.</p>
            </div>

            <div className="module-card">
              <div className="module-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <h4>Stores &amp; Intake App</h4>
              <p>Warehouse staging, protective preservation packaging, QR tag issuance, and dispatch dock inventory reconciliation.</p>
            </div>
          </div>
        </div>

        {/* ── 9. CTA BANNER (Deep British Racing Green) ── */}
        <div className="cta-section">
          <div className="cta-content">
            <div className="section-label" style={{ color: 'var(--color-gold-light)', justifyContent: 'center' }}>
              Begin Your Production Run
            </div>
            <h2 className="cta-heading">Ready to Accelerate Your Precision Sourcing?</h2>
            <p className="cta-text">
              Join leading aerospace, defence, and locomotive OEMs who rely on ITTOVA for autonomous DFM analysis, guaranteed tolerances, and certified quality release.
            </p>
            <div className="cta-buttons">
              <button 
                className="btn btn-white btn-lg" 
                onClick={() => handleLaunchAuth('customer')}
              >
                Submit Engineering Drawings &rarr;
              </button>
              <button 
                className="btn btn-white-outline btn-lg" 
                onClick={() => handleLaunchAuth('vendor')}
              >
                Apply as Certified Supplier
              </button>
            </div>
          </div>
        </div>

        {/* Database reset helper */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
          <button className="btn-reset-link" onClick={resetDatabase}>
            Reset demo database to seed state
          </button>
        </div>
      </div>

      {/* ── 10. ENTERPRISE FOOTER ─────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-brand-section" style={{ cursor: 'default' }}>
                <div className="brand-mark-hex">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/>
                    <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
                  </svg>
                </div>
                <div className="nav-brand-meta">
                  <span className="nav-brand-title">ITTOVA</span>
                  <span className="nav-brand-sub" style={{ color: 'var(--color-gold-light)' }}>
                    PRECISION SOURCING PLATFORM
                  </span>
                </div>
              </div>
              <p>
                India's premier autonomous precision manufacturing and sourcing network. Connecting engineering OEMs directly with certified manufacturing facilities across Hyderabad.
              </p>
              <div className="footer-cert-badges">
                <span className="footer-cert-pill">ISO 9001:2015</span>
                <span className="footer-cert-pill">AS9100D</span>
                <span className="footer-cert-pill">DIN EN 10204 3.1</span>
                <span className="footer-cert-pill">SOC-2 TYPE II</span>
              </div>
            </div>

            <div className="footer-column">
              <h4>Stakeholder Portals</h4>
              <ul>
                <li><button onClick={() => handleLaunchAuth('customer')}>Corporate Customer Portal</button></li>
                <li><button onClick={() => handleLaunchAuth('vendor')}>Supplier Manufacturing Hub</button></li>
                <li><button onClick={() => handleLaunchAuth('staff')}>Internal Operations Console</button></li>
                <li><button onClick={() => handleLaunchAuth('admin')}>Executive Governance</button></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Capabilities</h4>
              <ul>
                <li><a href="#quoting-engine">5-Axis CNC Milling</a></li>
                <li><a href="#quoting-engine">Fiber Laser Cutting</a></li>
                <li><a href="#quoting-engine">Precision Press Brake Bending</a></li>
                <li><a href="#quoting-engine">Zeiss CMM Inspection</a></li>
                <li><a href="#quoting-engine">DIN EN 10204 3.1 Traceability</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Operating Facilities</h4>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Phase-III, Cherlapally Industrial Area &amp; Balanagar, Hyderabad, Telangana 500051</span>
              </div>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>sourcing@ittova.com</span>
              </div>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+91 40 2712 4000 (Mon&ndash;Sat)</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ITTOX Technologies &bull; ITTOVA Precision Sourcing System. All Rights Reserved.</p>
            <p>AS9100D, ISO 9001:2015, DIN EN 10204 3.1 Certified Metrology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
