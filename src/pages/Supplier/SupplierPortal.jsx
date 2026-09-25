import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import LiveStepper from '../../components/LiveStepper';

export default function SupplierPortal() {
  const { 
    db, 
    selectedVendorId, 
    setSelectedVendorId, 
    addVendor, 
    addVendorMachine,
    acceptVendorPO, 
    requestVendorDispatch, 
    submitVendorQuote,
    setCadModal,
    showToast,
    navigateBack 
  } = useApp();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'rfqs' | 'machines' | 'audit'
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [quoteDrafts, setQuoteDrafts] = useState({});
  const [newMachine, setNewMachine] = useState({
    name: '',
    process: 'CNC MILLING',
    size: '',
    axis: '',
    materials: '',
    rate: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    m1_name: '',
    m1_proc: '',
    m1_size: '',
    m1_axis: '',
    m1_mat: '',
    m1_rate: '',
    m2_name: '',
    m2_proc: '',
    m2_size: '',
    m2_axis: '',
    m2_mat: '',
    m2_rate: ''
  });

  const activeVendor = db.vendors.find(v => v.id === selectedVendorId);

  // Active production work orders assigned to this facility
  const activeOrders = db.projects.filter(p => {
    return Boolean(activeVendor) && p.drawings?.some(d =>
      d.processes?.some(proc => proc.selectedVendor && proc.selectedVendor.includes(activeVendor?.id || selectedVendorId))
    );
  });

  // Open RFQ opportunities in the network
  const availableRfqs = db.projects.filter(p => ['PENDING_VENDOR_QUOTES', 'VEND_VAL_QUOTES_ASSIGNED'].includes(p.status));

  const handleDemoFill = () => {
    setFormData({
      name: 'Apex Precision Aerospace & CNC Works',
      location: 'Cherlapally Industrial Estate, Phase II, Hyderabad',
      phone: '+91 98765 43210',
      email: 'production@apexprecision.in',
      m1_name: 'Haas VF-4SS Super Speed',
      m1_proc: 'CNC MILLING',
      m1_size: '1270 × 508 × 635 mm',
      m1_axis: '4-Axis VMC (12,000 RPM)',
      m1_mat: 'Aluminum 6061-T6, Tool Steel, SS 304',
      m1_rate: 2200,
      m2_name: 'Doosan Puma GT2600',
      m2_proc: 'CNC TURNING',
      m2_size: 'Ø410 × 650 mm',
      m2_axis: '2-Axis CNC Turning',
      m2_mat: 'Alloy Steel, Brass, Titanium',
      m2_rate: 1650
    });
    showToast('Demo supplier facility loaded!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter facility name!');
      return;
    }

    const machines = [];
    if (formData.m1_name) {
      machines.push({
        id: 'M-' + Math.floor(100 + Math.random() * 900),
        name: formData.m1_name,
        process: formData.m1_proc || 'CNC MACHINING',
        size: formData.m1_size || 'Standard',
        rate: Number(formData.m1_rate) || 1800,
        materials: formData.m1_mat || 'MS, SS, Aluminum',
        axis: formData.m1_axis || '3-Axis',
        status: 'Idle',
        audit: 'APPROVED'
      });
    }
    if (formData.m2_name) {
      machines.push({
        id: 'M-' + Math.floor(100 + Math.random() * 900),
        name: formData.m2_name,
        process: formData.m2_proc || 'CNC MACHINING',
        size: formData.m2_size || 'Standard',
        rate: Number(formData.m2_rate) || 1600,
        materials: formData.m2_mat || 'MS, SS',
        axis: formData.m2_axis || '4-Axis',
        status: 'Idle',
        audit: 'APPROVED'
      });
    }

    const vid = await addVendor({
      name: formData.name,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
      machines: machines
    });

    if (!vid) return;
    setIsRegistering(false);
    setSelectedVendorId(vid);
  };

  const handleAddMachineSubmit = async (e) => {
    e.preventDefault();
    if (!newMachine.name.trim()) {
      showToast('Please enter machine name!');
      return;
    }

    if (activeVendor) {
      const machineObj = {
        id: 'M-' + Math.floor(100 + Math.random() * 900),
        name: newMachine.name,
        process: newMachine.process,
        size: newMachine.size || 'Standard',
        axis: newMachine.axis || '3-Axis',
        materials: newMachine.materials || 'MS, SS, Aluminum',
        rate: Number(newMachine.rate) || 1800,
        status: 'Idle',
        audit: 'APPROVED'
      };
      const result = await addVendorMachine(activeVendor.id, machineObj);
      if (result === null) return;
      setShowAddMachine(false);
      setNewMachine({ name: '', process: 'CNC MILLING', size: '', axis: '', materials: '', rate: '' });
    }
  };

  return (
    <div className="view">
      {/* In-App Back Navigation */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {activeVendor && !isRegistering && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {db.vendors.length > 1 && (
              <select 
                value={activeVendor.id} 
                onChange={e => setSelectedVendorId(e.target.value)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
              >
                {db.vendors.map(v => (
                  <option key={v.id} value={v.id}>Facility: {v.name} ({v.id})</option>
                ))}
              </select>
            )}
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsRegistering(true)}
            >
              + Register Another Facility
            </button>
          </div>
        )}
      </div>

      {/* Supplier Identity Banner */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Manufacturing Partner Console</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)', marginTop: '4px' }}>
              {activeVendor ? activeVendor.name : 'Manufacturing Facility Onboarding'}
            </div>
            {activeVendor && (
              <div style={{ fontSize: '0.84rem', color: 'var(--muted)', marginTop: '4px' }}>
                Facility ID: <strong>{activeVendor.id}</strong> &bull; Location: {activeVendor.location} &bull; Contact: {activeVendor.phone}
              </div>
            )}
          </div>
          <div className="flex-gap">
            {activeVendor ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge badge-${activeVendor.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                  {activeVendor.status === 'APPROVED' ? '✓ Audited Facility' : 'Audit Pending'}
                </span>
                <span className="badge badge-tier">
                  {activeVendor.auditScore || 'ISO 9001:2015'}
                </span>
              </div>
            ) : (
              <span className="badge badge-pending">Registration Required</span>
            )}
          </div>
        </div>

        {/* Quick Facility Metrics Strip */}
        {activeVendor && !isRegistering && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
            <div style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Verified Machines</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>{activeVendor.machines?.length || 0} Units</div>
            </div>
            <div style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Work Orders</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: activeOrders.length > 0 ? 'var(--red)' : 'var(--ink)', marginTop: '2px' }}>{activeOrders.length} In-Progress</div>
            </div>
            <div style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Network RFQ Tenders</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>{availableRfqs.length} Open</div>
            </div>
            <div style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Quality Rating</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>★ {activeVendor.rating || '4.9'} / 5.0</div>
            </div>
          </div>
        )}
      </div>

      {/* Facility Registration / Onboarding Screen */}
      {(!activeVendor || isRegistering) && (
        <div className="card card-accent" style={{ marginBottom: 'var(--sp-6)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
            <div>
              <div className="kicker">Manufacturing Partner Onboarding</div>
              <h2 style={{ marginBottom: '0.25rem' }}>Supplier &amp; Machinery Matrix Registration</h2>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Register CNC machines, working envelopes, and certifications. The ITTOVA Vendor Audit team performs physical verification before order routing.
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleDemoFill}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>⚡</span> Fill Demo Facility Data
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div>
                <label>Facility / Corporate Name <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Industrial CNC Machining Works" 
                />
              </div>
              <div>
                <label>Facility Physical Location <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Cherlapally Industrial Area, Hyderabad" 
                />
              </div>
              <div>
                <label>Operational Phone <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 87654 32109" 
                />
              </div>
              <div>
                <label>Official Email <span className="text-danger">*</span></label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="orders@facility.com" 
                />
              </div>
            </div>

            <div className="view-section-title" style={{ marginTop: 'var(--sp-6)' }}>
              <h3>Machinery Capability Matrix</h3>
            </div>

            <div className="grid-2">
              <div className="machine-block">
                <h4>Machine 1</h4>
                <label>Make &amp; Model</label>
                <input type="text" value={formData.m1_name} onChange={e => setFormData({ ...formData, m1_name: e.target.value })} placeholder="Trumpf TruLaser 3030" />
                <label>Process Capability</label>
                <input type="text" value={formData.m1_proc} onChange={e => setFormData({ ...formData, m1_proc: e.target.value })} placeholder="CNC LASER CUTTING" />
                <label>Max Work Envelope</label>
                <input type="text" value={formData.m1_size} onChange={e => setFormData({ ...formData, m1_size: e.target.value })} placeholder="2000 × 4000 mm" />
                <label>Axis / Power Specification</label>
                <input type="text" value={formData.m1_axis} onChange={e => setFormData({ ...formData, m1_axis: e.target.value })} placeholder="6 kW Fiber Laser" />
                <label>Supported Materials</label>
                <input type="text" value={formData.m1_mat} onChange={e => setFormData({ ...formData, m1_mat: e.target.value })} placeholder="MS, SS, Aluminum" />
                <label>Hourly Rate (₹ / hr)</label>
                <input type="number" value={formData.m1_rate} onChange={e => setFormData({ ...formData, m1_rate: e.target.value })} placeholder="2500" />
              </div>

              <div className="machine-block">
                <h4>Machine 2</h4>
                <label>Make &amp; Model</label>
                <input type="text" value={formData.m2_name} onChange={e => setFormData({ ...formData, m2_name: e.target.value })} placeholder="Amada Press Brake 130T" />
                <label>Process Capability</label>
                <input type="text" value={formData.m2_proc} onChange={e => setFormData({ ...formData, m2_proc: e.target.value })} placeholder="CNC BENDING" />
                <label>Max Work Envelope</label>
                <input type="text" value={formData.m2_size} onChange={e => setFormData({ ...formData, m2_size: e.target.value })} placeholder="3000 mm" />
                <label>Axis / Power Specification</label>
                <input type="text" value={formData.m2_axis} onChange={e => setFormData({ ...formData, m2_axis: e.target.value })} placeholder="7-Axis CNC" />
                <label>Supported Materials</label>
                <input type="text" value={formData.m2_mat} onChange={e => setFormData({ ...formData, m2_mat: e.target.value })} placeholder="MS, SS" />
                <label>Hourly Rate (₹ / hr)</label>
                <input type="number" value={formData.m2_rate} onChange={e => setFormData({ ...formData, m2_rate: e.target.value })} placeholder="1200" />
              </div>
            </div>

            <div style={{ marginTop: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
              <button type="submit" className="btn">
                Submit Facility Application
              </button>
              {activeVendor && (
                <button type="button" className="btn btn-secondary" onClick={() => setIsRegistering(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Main Vendor Dashboard */}
      {activeVendor && !isRegistering && (
        <div>
          {/* Visual Lifecycle Guide */}
          <div className="vendor-flow-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Industrial Operating Model
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
                  How Manufacturing Partners Operate on ITOVA
                </div>
              </div>
              <span className="badge badge-approved">Traceable ISO Workflow</span>
            </div>

            <div className="vendor-flow-steps">
              <div className={`vendor-flow-step ${activeTab === 'machines' ? 'active' : ''}`}>
                <div className="vendor-flow-step-num">Step 1</div>
                <div className="vendor-flow-step-title">Machine Verification</div>
                <div className="vendor-flow-step-desc">Envelopes, axes, and hourly rates validated by ITOVA Vendor Audit team.</div>
              </div>
              <div className={`vendor-flow-step ${activeTab === 'rfqs' ? 'active' : ''}`}>
                <div className="vendor-flow-step-num">Step 2</div>
                <div className="vendor-flow-step-title">RFQ &amp; Drawing Review</div>
                <div className="vendor-flow-step-desc">Inspect confidential CAD drawings, material specs, and submit machine bids.</div>
              </div>
              <div className={`vendor-flow-step ${activeTab === 'orders' ? 'active' : ''}`}>
                <div className="vendor-flow-step-num">Step 3</div>
                <div className="vendor-flow-step-title">PO Acceptance</div>
                <div className="vendor-flow-step-desc">Lock machine capacity when customer and ITTOVA release the production PO.</div>
              </div>
              <div className={`vendor-flow-step ${activeTab === 'audit' ? 'active' : ''}`}>
                <div className="vendor-flow-step-num">Step 4</div>
                <div className="vendor-flow-step-title">Machining &amp; Dispatch</div>
                <div className="vendor-flow-step-desc">Execute CNC runs and trigger logistics pickup for Central QC inspection.</div>
              </div>
            </div>
          </div>

          {/* Clean Segmented Navigation Tabs */}
          <div className="vendor-tabs-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              className={`vendor-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span>📦 Work Orders &amp; Production</span>
              <span className="vendor-tab-badge">{activeOrders.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'rfqs'}
              className={`vendor-tab-btn ${activeTab === 'rfqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('rfqs')}
            >
              <span>📋 Available RFQs &amp; Tenders</span>
              <span className="vendor-tab-badge">{availableRfqs.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'machines'}
              className={`vendor-tab-btn ${activeTab === 'machines' ? 'active' : ''}`}
              onClick={() => setActiveTab('machines')}
            >
              <span>⚙️ Machinery Matrix</span>
              <span className="vendor-tab-badge">{activeVendor.machines?.length || 0}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'audit'}
              className={`vendor-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span>🛡️ Facility Audit &amp; Credentials</span>
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: WORK ORDERS & PRODUCTION (PO Execution)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Dispatched Production POs &amp; Work Orders</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                    Orders assigned to your facility for CNC machining, laser cutting, and fabrication.
                  </p>
                </div>
              </div>

              {activeOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📦</div>
                  <h4 style={{ margin: '0 0 0.5rem', color: 'var(--ink)' }}>No Production POs Assigned Yet</h4>
                  <p className="subtitle" style={{ maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.88rem' }}>
                    When buyers accept your manufacturing quotes, purchase orders will arrive here for capacity locking and machining.
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setActiveTab('rfqs')}
                  >
                    Browse Available RFQs &amp; Tender Pool &rarr;
                  </button>
                </div>
              ) : (
                activeOrders.map(p => (
                  <div key={p.id} className="card" style={{ marginBottom: '1.25rem', border: '1px solid var(--line)' }}>
                    <div className="flex-between" style={{ borderBottom: '1px solid var(--line-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.15rem' }}>Work Order: {p.id}</h4>
                          <span className="badge badge-approved">Confirmed PO</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                          Customer Account: <strong>{p.cust}</strong> &bull; Drawing Package: {p.files} &bull; BOM: {p.bom || 'Master_BOM.xlsx'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-pending" style={{ textTransform: 'uppercase' }}>
                          {p.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Integrated Live Stepper for Order Progress */}
                    <div style={{ margin: '1rem 0' }}>
                      <LiveStepper status={p.status} />
                    </div>

                    {/* Drawing & Process Breakdown */}
                    <div style={{ marginTop: '1.25rem', background: 'var(--paper)', padding: '1rem', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '8px' }}>
                        Part Geometry &amp; Assigned Operations
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {p.drawings?.map(d => (
                          <div key={d.dwgNo} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                            <div className="flex-between">
                              <strong style={{ fontSize: '0.88rem' }}>{d.dwgNo}</strong>
                              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Qty: {d.qty} pcs</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                              Material: <strong>{d.material}</strong> &bull; Scope: {d.proc}
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <button 
                                type="button" 
                                className="btn-link" 
                                onClick={() => setCadModal({ pid: p.id })}
                                style={{ fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <span>🔍</span> Inspect CAD Drawing
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage Actions */}
                    {p.status === 'PO_SENT_TO_VENDOR' && (
                      <div style={{ marginTop: '1.25rem', background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.25rem', borderRadius: 'var(--r-xs)' }}>
                        <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.92rem', marginBottom: '4px' }}>
                          ⚡ Purchase Order Dispatched &mdash; Capacity Confirmation Required
                        </div>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: '#78350f', lineHeight: 1.5 }}>
                          The buyer has authorized PO release. Acknowledge this order to lock CNC spindle machine slots and initiate raw material preparation.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button 
                            type="button"
                            className="btn btn-success" 
                            onClick={() => acceptVendorPO(p.id)}
                            style={{ fontWeight: 700 }}
                          >
                            ✓ Accept PO &amp; Lock Machine Slots
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => setCadModal({ pid: p.id })}
                          >
                            Inspect Drawing Specs
                          </button>
                        </div>
                      </div>
                    )}

                    {p.status === 'PO_ACCEPTED_VENDOR' && (
                      <div style={{ marginTop: '1.25rem', background: '#eff6ff', border: '1px solid #dbeafe', padding: '1.25rem', borderRadius: 'var(--r-xs)' }}>
                        <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.92rem', marginBottom: '4px' }}>
                          🏭 Machining &amp; Operations Underway
                        </div>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                          Parts are currently running on your facility's CNC machines. Once parts pass internal dimensional checks, request ITTOVA logistics pickup for central QC inspection.
                        </p>
                        <button 
                          type="button"
                          className="btn btn-success" 
                          onClick={() => requestVendorDispatch(p.id)}
                          style={{ fontWeight: 700 }}
                        >
                          🚀 Mark Machining Complete &amp; Request Logistics Pickup
                        </button>
                      </div>
                    )}

                    {['DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION', 'PENDING_CUST_DELIVERY_APPROVAL', 'DISPATCHED_TO_CUST'].includes(p.status) && (
                      <div style={{ marginTop: '1.25rem', background: '#f0fdf4', border: '1px solid #dcfce7', padding: '1rem 1.25rem', borderRadius: 'var(--r-xs)' }}>
                        <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.88rem' }}>
                          ✓ Parts Dispatched from Facility
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '2px' }}>
                          Consignment is in custody of ITTOVA Logistics coordinator &bull; Queued for Central QC Inspection &amp; IGI Reporting.
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: AVAILABLE RFQS & TENDERS POOL
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'rfqs' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Network RFQ Tenders &amp; Open Bidding</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                    Engineering buyer requirements matching your registered CNC turning, milling, and laser capabilities.
                  </p>
                </div>
              </div>

              {availableRfqs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <p className="subtitle">No open customer RFQs in the network right now.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {availableRfqs.map(p => (
                    <div key={p.id} className="card" style={{ border: '1px solid var(--line)' }}>
                      <div className="flex-between">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ margin: 0 }}>Project Tender: {p.id}</h4>
                            <span className="badge badge-process">RFQ Open</span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                            Buyer: {p.cust} &bull; Cluster: {p.searchLoc || 'Hyderabad'} ({p.searchRad || 50} km Radius) &bull; Files: {p.files}
                          </p>
                        </div>
                        <span className="badge badge-tier">NDA Protected</span>
                      </div>

                      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                        {p.drawings?.map(d => (
                          <div key={d.dwgNo} style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                            <div className="flex-between">
                              <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{d.dwgNo}</span>
                              <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{d.qty} units</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                              Required Operations: <strong>{d.proc}</strong>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                              Material: {d.material}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--line-light)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          Status: <strong>{p.status.replace(/_/g, ' ')}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setCadModal({ pid: p.id })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>🔍</span> Inspect CAD Drawing
                          </button>
                          <label style={{ width: '130px' }}>
                            Bid Value (₹)
                            <input
                              type="number"
                              min="1"
                              value={quoteDrafts[p.id]?.cost || ''}
                              onChange={e => setQuoteDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], cost: e.target.value } }))}
                              placeholder="25000"
                            />
                          </label>
                          <label style={{ width: '110px' }}>
                            Lead Time (days)
                            <input
                              type="number"
                              min="1"
                              value={quoteDrafts[p.id]?.time || ''}
                              onChange={e => setQuoteDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], time: e.target.value } }))}
                              placeholder="7"
                            />
                          </label>
                          <button 
                            type="button" 
                            className="btn btn-sm"
                            onClick={() => {
                              const draft = quoteDrafts[p.id] || {};
                              if (!draft.cost || !draft.time) {
                                showToast('Enter a bid value and lead time before submitting.');
                                return;
                              }
                              submitVendorQuote(p.id, activeVendor.id, draft);
                              setQuoteDrafts(prev => ({ ...prev, [p.id]: { ...draft, submitted: true } }));
                            }}
                          >
                            {quoteDrafts[p.id]?.submitted ? 'Bid Submitted' : 'Submit Bid'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: MACHINERY MATRIX & CAPACITY
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'machines' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registered Machinery Matrix</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                    Physical machine registry, working envelopes, and spindle availability for {activeVendor.name}.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddMachine(!showAddMachine)}
                >
                  {showAddMachine ? 'Cancel' : '+ Add Another Machine'}
                </button>
              </div>

              {/* Add Machine Inline Form */}
              {showAddMachine && (
                <div className="card" style={{ marginBottom: '1.25rem', background: '#f8fafc', border: '1px solid var(--line)' }}>
                  <h4 style={{ margin: '0 0 1rem' }}>Register New Spindle / Machine</h4>
                  <form onSubmit={handleAddMachineSubmit}>
                    <div className="grid-2">
                      <div>
                        <label>Machine Make &amp; Model <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          value={newMachine.name}
                          onChange={e => setNewMachine({ ...newMachine, name: e.target.value })}
                          placeholder="e.g. Mazak Quick Turn 250"
                        />
                      </div>
                      <div>
                        <label>Process Capability</label>
                        <select 
                          value={newMachine.process}
                          onChange={e => setNewMachine({ ...newMachine, process: e.target.value })}
                        >
                          <option value="CNC MILLING">CNC MILLING (4-Axis / 5-Axis VMC)</option>
                          <option value="CNC TURNING">CNC TURNING (Lathe)</option>
                          <option value="CNC LASER CUTTING">CNC LASER CUTTING (Fiber Laser)</option>
                          <option value="CNC BENDING">CNC BENDING (Press Brake)</option>
                          <option value="SURFACE GRINDING">SURFACE GRINDING</option>
                        </select>
                      </div>
                      <div>
                        <label>Max Working Envelope</label>
                        <input 
                          type="text" 
                          value={newMachine.size}
                          onChange={e => setNewMachine({ ...newMachine, size: e.target.value })}
                          placeholder="e.g. 1000 × 500 × 500 mm"
                        />
                      </div>
                      <div>
                        <label>Axis / Power Specification</label>
                        <input 
                          type="text" 
                          value={newMachine.axis}
                          onChange={e => setNewMachine({ ...newMachine, axis: e.target.value })}
                          placeholder="e.g. 4-Axis VMC (12,000 RPM)"
                        />
                      </div>
                      <div>
                        <label>Supported Materials</label>
                        <input 
                          type="text" 
                          value={newMachine.materials}
                          onChange={e => setNewMachine({ ...newMachine, materials: e.target.value })}
                          placeholder="e.g. Aluminum 6061, SS 304, Tool Steel"
                        />
                      </div>
                      <div>
                        <label>Standard Hourly Rate (₹ / hr)</label>
                        <input 
                          type="number" 
                          value={newMachine.rate}
                          onChange={e => setNewMachine({ ...newMachine, rate: e.target.value })}
                          placeholder="e.g. 2000"
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn btn-sm">Save Machine</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddMachine(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Machine Cards Grid */}
              <div className="grid-3">
                {activeVendor.machines?.map(m => (
                  <div key={m.id} className="inner-panel" style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', padding: '16px' }}>
                    <div className="flex-between">
                      <span className="badge badge-process">{m.process}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                        <span className={`status-dot ${m.status === 'Idle' ? 'idle' : 'busy'}`} />
                        {m.status === 'Idle' ? 'Spindle Available' : 'Running'}
                      </div>
                    </div>
                    <h4 style={{ margin: '0.6rem 0 0.3rem 0', fontSize: '1.02rem', color: 'var(--ink)' }}>{m.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Envelope: <strong>{m.size}</strong> &bull; {m.axis}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                      Materials: <strong>{m.materials}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-light)' }}>
                      <span style={{ fontSize: '0.86rem', color: 'var(--red)', fontWeight: 800 }}>
                        ₹{m.rate}/hr
                      </span>
                      <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                        ✓ {m.audit || 'APPROVED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: FACILITY AUDIT & CREDENTIALS
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'audit' && (
            <div>
              <div className="card" style={{ border: '1px solid var(--line)' }}>
                <div className="flex-between" style={{ borderBottom: '1px solid var(--line-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Facility Verification &amp; Audit Dossier</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                      Physical plant audit records conducted by ITTOVA Central Verification Engineering.
                    </p>
                  </div>
                  <span className="badge badge-approved" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                    Status: VERIFIED &amp; CLEARED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Audited Legal Entity</div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--ink)', marginTop: '4px' }}>{activeVendor.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Facility ID: {activeVendor.id}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Physical Plant: {activeVendor.location}</div>
                  </div>

                  <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Audit Score &amp; Standards</div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#16a34a', marginTop: '4px' }}>
                      {activeVendor.auditScore || '96/100 (ISO 9001:2015)'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Lead Auditor: <strong>V. Kumar</strong> (Vendor Audit Officer)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Calibration: Valid through Dec 2027</div>
                  </div>

                  <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Metrology &amp; Quality QA</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)', marginTop: '4px' }}>CMM &amp; Surface Profilometer</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Digital Height Gauges: Mitutoyo (0.001mm)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Material Testing: Spectro &amp; Hardness Verified</div>
                  </div>

                  <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>IP &amp; CAD Confidentiality</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)', marginTop: '4px' }}>Mutual Platform NDA: Signed</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>CAD Drawing Vault: AES-256 Encrypted</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Power: Dedicated HT Feeder + 125 kVA Backup</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
