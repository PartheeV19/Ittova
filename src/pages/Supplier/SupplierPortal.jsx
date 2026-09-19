import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function SupplierPortal() {
  const { 
    db, 
    selectedVendorId, 
    setSelectedVendorId, 
    addVendor, 
    acceptVendorPO, 
    requestVendorDispatch, 
    showToast,
    navigateBack 
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
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

  // Projects where this vendor is selected
  const activeOrders = db.projects.filter(p => {
    return p.drawings?.some(d => d.processes.some(proc => proc.selectedVendor && proc.selectedVendor.includes(selectedVendorId)));
  });

  const handleDemoFill = () => {
    setFormData({
      name: 'Industrial Engineering Works',
      location: 'Industrial Area, Cherlapally, Hyderabad',
      phone: '+91 91234 56789',
      email: 'orders@industrialworks.in',
      m1_name: 'Doosan Lynx 220 LCNC',
      m1_proc: 'CNC TURNING',
      m1_size: 'Ø300 x 510 mm',
      m1_axis: '2-Axis CNC Turning',
      m1_mat: 'SS 304, MS, Brass',
      m1_rate: 1500,
      m2_name: 'Haas VF-2SS Super Speed',
      m2_proc: 'CNC MILLING',
      m2_size: '762 x 406 x 508 mm',
      m2_axis: '4-Axis VMC',
      m2_mat: 'Aluminum 6061, Tool Steel',
      m2_rate: 2200
    });
    showToast('Demo supplier facility loaded!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter facility name!');
      return;
    }

    const machines = [];
    if (formData.m1_name) {
      machines.push({
        id: 'M-' + Math.floor(100 + Math.random() * 900),
        name: formData.m1_name,
        process: formData.m1_proc || 'CNC MACHINING',
        size: formData.m1_size || 'Standard',
        rate: Number(formData.m1_rate) || 1500,
        materials: formData.m1_mat || 'MS, SS',
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
        rate: Number(formData.m2_rate) || 1800,
        materials: formData.m2_mat || 'MS, SS',
        axis: formData.m2_axis || '4-Axis',
        status: 'Idle',
        audit: 'APPROVED'
      });
    }

    const vid = addVendor({
      name: formData.name,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
      machines: machines
    });

    setIsRegistering(false);
    setSelectedVendorId(vid);
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

      {/* Supplier Identity Banner */}
      <div className="card">
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Supplier Partner Facility Console</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px' }}>
              {activeVendor ? activeVendor.name : 'Supplier Facility Onboarding'}
            </div>
            {activeVendor && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Facility ID: <strong>{activeVendor.id}</strong> &bull; Location: {activeVendor.location} &bull; Contact: {activeVendor.phone}
              </div>
            )}
          </div>
          <div className="flex-gap">
            {activeVendor ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${activeVendor.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                  {activeVendor.status === 'APPROVED' ? 'Authorized Facility' : 'Audit Pending'}
                </span>
                <span className="badge badge-tier">
                  {activeVendor.auditScore || 'Verified ISO'}
                </span>
              </div>
            ) : (
              <span className="badge badge-pending">Registration Required</span>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form */}
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
              <button type="button" className="btn btn-secondary" onClick={() => setIsRegistering(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Dashboard */}
      {activeVendor && !isRegistering && (
        <div>
          {/* Machinery Matrix */}
          <div className="card">
            <div className="flex-between">
              <div>
                <div className="kicker">Live Production Floor</div>
                <h3 style={{ margin: '0.2rem 0' }}>Registered Machinery Matrix</h3>
                <p className="subtitle" style={{ margin: 0 }}>Location: {activeVendor.location} &bull; Contact: {activeVendor.phone}</p>
              </div>
              <span className="badge badge-approved">{activeVendor.machines?.length || 0} Machines Verified</span>
            </div>

            <div className="grid-3" style={{ marginTop: 'var(--sp-5)' }}>
              {activeVendor.machines?.map(m => (
                <div key={m.id} className="inner-panel">
                  <div className="flex-between">
                    <span className="badge badge-process">{m.process}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span className={`status-dot ${m.status === 'Idle' ? 'idle' : 'busy'}`} />
                      {m.status}
                    </div>
                  </div>
                  <h4 style={{ margin: '0.4rem 0 0.2rem 0' }}>{m.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Envelope: {m.size} &bull; {m.axis}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', marginTop: '4px' }}>
                    Materials: <strong>{m.materials}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, marginTop: '4px' }}>
                    Rate: ₹{m.rate}/hr
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active POs & Production Orders */}
          <div className="view-section-title">
            <h3>Dispatched Production POs &amp; Work Orders</h3>
          </div>

          {activeOrders.length === 0 ? (
            <div className="card">
              <p className="subtitle">No production orders currently assigned to this facility.</p>
            </div>
          ) : (
            activeOrders.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 'var(--sp-4)' }}>
                <div className="flex-between">
                  <div>
                    <h4>Project: {p.id}</h4>
                    <p className="subtitle" style={{ margin: 0 }}>Customer: {p.cust} &bull; Drawings: {p.files}</p>
                  </div>
                  <span className="badge badge-pending">{p.status.replace(/_/g, ' ')}</span>
                </div>

                {p.status === 'PO_SENT_TO_VENDOR' && (
                  <div style={{ marginTop: 'var(--sp-4)' }}>
                    <div className="alert alert-info">
                      Production PO dispatched by ITTOVA Vendor Validator. Click below to acknowledge and begin machining.
                    </div>
                    <button className="btn btn-success" onClick={() => acceptVendorPO(p.id)}>
                      Accept PO &amp; Lock Machine Slots
                    </button>
                  </div>
                )}

                {p.status === 'PO_ACCEPTED_VENDOR' && (
                  <div style={{ marginTop: 'var(--sp-4)' }}>
                    <div className="alert alert-process">
                      Parts currently undergoing CNC operations. Once complete, request logistics pickup.
                    </div>
                    <button className="btn btn-success" onClick={() => requestVendorDispatch(p.id)}>
                      Mark Machining Finished &amp; Request Logistics Pickup
                    </button>
                  </div>
                )}

                {['DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION', 'PENDING_CUST_DELIVERY_APPROVAL', 'DISPATCHED_TO_CUST'].includes(p.status) && (
                  <div style={{ marginTop: 'var(--sp-4)' }}>
                    <div className="alert alert-success">
                      Parts dispatched from facility &bull; Currently in transit / quality inspection.
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
