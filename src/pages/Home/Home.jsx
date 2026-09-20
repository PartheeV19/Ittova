import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Home() {
  const { setCurrentView, showToast, resetDatabase, visitorProfile, clearVisitorProfile } = useApp();

  const handleLaunchAuth = (tabKey) => {
    const normalizedTab = tabKey === 'supplier' ? 'vendor' : tabKey;
    const route = normalizedTab === 'customer' || normalizedTab === 'vendor' ? normalizedTab : 'login';
    setCurrentView(route);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="view" style={{ overflowX: 'hidden' }}>

      {/* ── 1. HERO SECTION WITH HEXAGON CONTROL SCHEMATIC ── */}
      <section id="home" className="hero-industrial">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title-industrial">
                Every industrial requirement.<br />
                <span>One accountable</span> execution system.
              </h1>
              <p className="hero-lead-industrial">
                ITOVA connects customers, verified manufacturers, material partners, quality systems, 
                logistics and finance through a controlled, traceable industrial operating model.
              </p>
              <div className="hero-actions-industrial">
                <button 
                  type="button" 
                  className="btn btn-dark" 
                  onClick={() => handleLaunchAuth('customer')}
                >
                  Submit a Requirement &rarr;
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => scrollTo('how')}
                >
                  Explore ITOVA
                </button>
              </div>
            </div>

            {/* Industrial Hexagon Control Gateway */}
            <div className="control-container control-hexagon-container" aria-label="ITOVA hexagon control gateway diagram">
              {/* Hexagon Schematic SVG Canvas */}
              <svg className="control-hex-svg" viewBox="0 0 520 440" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Hexagon Frame */}
                <polygon 
                  points="260,20 480,115 480,325 260,420 40,325 40,115" 
                  className="hex-poly-outer" 
                />
                {/* Inner Concentric Hexagon */}
                <polygon 
                  points="260,82 414,146 414,294 260,358 106,294 106,146" 
                  className="hex-poly-inner" 
                />
                {/* Connecting Laser Beams to Corner Nodes */}
                <line x1="260" y1="220" x2="40" y2="115" className="hex-laser-beam beam-customer" />
                <line x1="260" y1="220" x2="480" y2="115" className="hex-laser-beam beam-quality" />
                <line x1="260" y1="220" x2="40" y2="325" className="hex-laser-beam beam-material" />
                <line x1="260" y1="220" x2="480" y2="325" className="hex-laser-beam beam-logistics" />
                <line x1="260" y1="220" x2="260" y2="20" className="hex-laser-beam beam-top" />
                <line x1="260" y1="220" x2="260" y2="420" className="hex-laser-beam beam-bottom" />

                {/* Vertex Anchors */}
                <circle cx="260" cy="20" r="4" className="hex-vertex-dot" />
                <circle cx="260" cy="420" r="4" className="hex-vertex-dot" />
              </svg>

              {/* Top-Left Corner: CUSTOMER */}
              <div 
                className="hex-corner-node corner-customer" 
                onClick={() => handleLaunchAuth('customer')} 
                title="Customer Gateway - Submit drawings & procure"
                role="button"
                tabIndex={0}
              >
                <span className="hex-node-sub">PROCURE &amp; CAD</span>
                <span className="hex-node-title">CUSTOMER</span>
              </div>

              {/* Top-Right Corner: QUALITY */}
              <div 
                className="hex-corner-node corner-quality" 
                onClick={() => scrollTo('how')} 
                title="Quality Systems - CMM, Mill test certificates & IGI Hub"
                role="button"
                tabIndex={0}
              >
                <span className="hex-node-sub">IGI &amp; AUDIT</span>
                <span className="hex-node-title">QUALITY</span>
              </div>

              {/* Bottom-Left Corner: MATERIAL */}
              <div 
                className="hex-corner-node corner-material" 
                onClick={() => handleLaunchAuth('vendor')} 
                title="Material & Sourcing - Vetted machine shops & stockists"
                role="button"
                tabIndex={0}
              >
                <span className="hex-node-sub">TRACED SUPPLY</span>
                <span className="hex-node-title">MATERIAL</span>
              </div>

              {/* Bottom-Right Corner: LOGISTICS */}
              <div 
                className="hex-corner-node corner-logistics" 
                onClick={() => scrollTo('how')} 
                title="Tracked Freight - Consolidation & hub dispatch"
                role="button"
                tabIndex={0}
              >
                <span className="hex-node-sub">HUB FREIGHT</span>
                <span className="hex-node-title">LOGISTICS</span>
              </div>

              {/* Hexagon Center Core: ITOVA */}
              <div 
                className="hex-core-center" 
                onClick={() => scrollTo('how')} 
                title="ITOVA Accountable Operating System"
              >
                <div className="hex-core-glow" />
                <div className="hex-core-badge">
                  <span className="hex-core-title">ITOVA</span>
                  <span className="hex-core-sub">SYSTEM CORE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST METRIC STRIP ───────────────────── */}
      <div className="container" style={{ padding: 0 }}>
        <div className="trust-strip">
          <div className="trust-cell">
            <b>Verified Capability</b>
            <span>Qualified industrial partners &amp; vetted shops</span>
          </div>
          <div className="trust-cell">
            <b>Controlled Execution</b>
            <span>One process from drawing RFQ to final dispatch</span>
          </div>
          <div className="trust-cell">
            <b>Traceable Quality</b>
            <span>Mill test certificates &amp; IGI inspection visibility</span>
          </div>
          <div className="trust-cell">
            <b>Reliable Delivery</b>
            <span>Consolidation, hub warehousing &amp; tracked logistics</span>
          </div>
        </div>
      </div>

      {/* ── 3. HOW ITOVA WORKS (6-STAGE PIPELINE) ───── */}
      <section id="how" className="section-industrial">
        <div className="container">
          <div className="section-tag">How ITOVA works</div>
          <h2>From requirement to reliable delivery.</h2>
          <p className="subtitle">
            A single operating layer replaces fragmented follow-up across sourcing, production, 
            inspection, material movement and commercial closure.
          </p>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-no">01 / REQUIREMENT</div>
              <h3>Define</h3>
              <p>Submit 2D/3D drawings, engineering specifications, tolerances, volume and delivery timelines.</p>
            </article>

            <article className="step-card">
              <div className="step-no">02 / CAPABILITY</div>
              <h3>Verify</h3>
              <p>Evaluate qualified sources for machine envelope fit, cycle time, quality history and commercial suitability.</p>
            </article>

            <article className="step-card">
              <div className="step-no">03 / EXECUTION</div>
              <h3>Control</h3>
              <p>Monitor locked process sheets, production milestones, raw material lot movement and tooling changes.</p>
            </article>

            <article className="step-card">
              <div className="step-no">04 / QUALITY</div>
              <h3>Assure</h3>
              <p>Manage digital inspection reports, CMM readings, material certificates and hub-level IGI acceptance.</p>
            </article>

            <article className="step-card">
              <div className="step-no">05 / DELIVERY</div>
              <h3>Deliver</h3>
              <p>Coordinate secure crating, logistics carrier dispatch, transit insurance and final receipt confirmation.</p>
            </article>

            <article className="step-card">
              <div className="step-no">06 / LEARNING</div>
              <h3>Strengthen</h3>
              <p>Build immutable vendor reliability records for accelerated future sourcing and priority allocation.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── 4. ONE NETWORK, DEFINED ROLES (DARK NAVY) ── */}
      <section id="network" className="dark-network-section">
        <div className="container">
          <div className="section-tag">One network. Defined roles.</div>
          <h2>Built for every party that makes industrial execution work.</h2>
          <p className="dark-sub">
            ITOVA protects proprietary intellectual property while giving each participant the right visibility, responsibility and control.
          </p>

          <div className="network-roles-grid">
            <article className="network-role-card">
              <h3>Customers &amp; OEMs</h3>
              <button type="button" onClick={() => handleLaunchAuth('customer')}>
                Submit requirements &rarr;
              </button>
            </article>

            <article className="network-role-card">
              <h3>Manufacturers</h3>
              <button type="button" onClick={() => handleLaunchAuth('vendor')}>
                Register capability &rarr;
              </button>
            </article>

            <article className="network-role-card">
              <h3>Material Partners</h3>
              <button type="button" onClick={() => handleLaunchAuth('vendor')}>
                Supply with traceability &rarr;
              </button>
            </article>

            <article className="network-role-card">
              <h3>Banks &amp; NBFCs</h3>
              <button type="button" onClick={() => scrollTo('how')}>
                Enable execution finance &rarr;
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ── 5. PORTAL GATEWAYS LAUNCHPAD ────────────── */}
      <section id="portals" className="section-industrial" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>PORTAL ACCESS</div>
            <h2>Industrial Command Portals</h2>
            <p className="subtitle" style={{ margin: '0 auto' }}>
              Select your authenticated gateway to access CAD intake, capacity matchmaking, or order execution.
            </p>
          </div>

          <div className="portal-gateway-grid portal-grid-two-up">
            {/* 1. Customer */}
            <div className="portal-gateway-card">
              <span className="portal-gateway-badge">Buyers &amp; OEMs</span>
              <h3 className="portal-gateway-title">Customer Portal</h3>
              <p className="portal-gateway-desc">
                Direct procurement connecting engineering buyers with verified manufacturing facilities.
              </p>
              <div className="portal-gateway-features">
                <div className="gateway-feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>2D &amp; 3D CAD Drawing Intake</span>
                </div>
                <div className="gateway-feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Process Sheet Review &amp; Quotations</span>
                </div>
                <div className="gateway-feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Live Production Stepper &amp; Tracking</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-dark"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => handleLaunchAuth('customer')}
              >
                Launch Customer Portal &rarr;
              </button>
            </div>

            {/* 2. Vendor */}
            <div className="portal-gateway-card">
              <span className="portal-gateway-badge">Manufacturing Facilities</span>
              <h3 className="portal-gateway-title">Vendor Platform</h3>
              <p className="portal-gateway-desc">
                Shop-floor management, machinery capacity registry, and RFQ quoting for suppliers.
              </p>
              <div className="portal-gateway-features">
                <div className="gateway-feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Machine Registry &amp; Open Capacity</span>
                </div>
                <div className="gateway-feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Bidding, PO Execution &amp; Invoicing</span>
                </div>
                <div className="gateway-feature-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Production Alarms &amp; Milestone Reports</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => handleLaunchAuth('vendor')}
              >
                Launch Vendor Portal &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. WHY ITOVA SECTION ───────────────────── */}
      <section id="about" className="section-industrial">
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            <div className="section-tag">Why ITOVA</div>
            <h2>Industrial trust should be engineered—not assumed.</h2>
            <p className="subtitle" style={{ fontSize: '1.08rem', lineHeight: 1.75 }}>
              ITOVA brings engineering understanding, verified capabilities, controlled documents, 
              quality assurance, logistics coordination and financial visibility into one accountable operating system.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. START WITH ITOVA (CTA BANNER) ────────── */}
      <section id="join" className="cta-banner-industrial">
        <div className="container">
          <div className="cta-inner-industrial">
            <div>
              <div className="section-tag" style={{ marginBottom: '6px' }}>Start with ITOVA</div>
              <h2>Turn your next requirement into reliable delivery.</h2>
            </div>
            <div className="hero-actions-industrial">
              <button 
                type="button" 
                className="btn btn-dark" 
                onClick={() => handleLaunchAuth('customer')}
              >
                Submit a Requirement &rarr;
              </button>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => handleLaunchAuth('vendor')}
              >
                Vendor Portal &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. INDUSTRIAL FOOTER ───────────────────── */}
      <footer className="industrial-footer">
        <div className="container">
          <div className="foot-grid">
            <div className="foot-brand-col">
              <div className="foot-brand">
                IT<span className="brand-o">O</span>VA
              </div>
              <p className="foot-p">
                Engineering every industrial requirement into reliable delivery through accountable execution.
              </p>
            </div>

            <div className="foot-links-col">
              <b>Operating Portals</b>
              <button type="button" onClick={() => handleLaunchAuth('customer')}>
                Customer &amp; OEM Sourcing
              </button>
              <button type="button" onClick={() => handleLaunchAuth('vendor')}>
                Vendor &amp; Manufacturing Platform
              </button>
            </div>

            <div className="foot-links-col">
              <b>Navigation</b>
              <button type="button" onClick={() => scrollTo('home')}>Overview</button>
              <button type="button" onClick={() => scrollTo('how')}>How ITOVA Works</button>
              <button type="button" onClick={() => scrollTo('network')}>Industrial Network</button>
              <button type="button" onClick={() => scrollTo('about')}>Why ITOVA</button>
            </div>

            <div className="foot-links-col">
              <b>System Control</b>
              <span style={{ fontSize: '0.84rem', color: '#9ab0bf' }}>www.itova.in</span>
              <span style={{ fontSize: '0.84rem', color: '#9ab0bf' }}>hello@itova.in</span>
              <div style={{ marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={resetDatabase}
                  style={{ color: '#fca5a5', textDecoration: 'underline' }}
                >
                  Reset session database
                </button>
              </div>
            </div>
          </div>

          <div className="fine-print">
            <span>&copy; {new Date().getFullYear()} ITOVA. All rights reserved.</span>
            <span>Privacy &bull; Information Security &bull; Terms of Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
