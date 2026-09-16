// ==========================================================================
// ITTOX ITTOVA - Autonomous Precision Sourcing Platform Core Script
// ==========================================================================

const INIT_DB = {
  customers: [
    {
      id: 'C-101',
      name: 'Medha Servo Drives',
      address: 'Hyderabad Industrial Park',
      phone: '+91 98765 43210',
      email: 'procurement@medhaservo.com',
      status: 'APPROVED',
      creditTier: '15 to 30 day credit',
      creditLimit: '₹ 50,00,000',
      gst: '36AAAAA0000A1Z5',
      pan: 'AAAAA0000A'
    }
  ],
  vendors: [
    {
      id: 'V-201',
      name: 'BNR Precision Engineering',
      location: 'Cherlapally, Hyderabad',
      phone: '+91 87654 32109',
      email: 'orders@bnrprecision.com',
      status: 'APPROVED',
      rating: 5,
      auditScore: '96/100 (ISO 9001:2015)',
      machines: [
        { id: 'M-101', name: 'Trumpf TruLaser 3030 Fiber', process: 'CNC LASER CUTTING', size: '2000x4000 mm', rate: 2500, materials: 'MS, SS, Aluminum', axis: '2D Fiber Laser', status: 'Idle', audit: 'APPROVED' },
        { id: 'M-102', name: 'Amada HG 1303 Press Brake', process: 'CNC BENDING', size: '3000 mm (130T)', rate: 1200, materials: 'MS, SS', axis: '7-Axis CNC', status: 'Idle', audit: 'APPROVED' },
        { id: 'M-103', name: 'Haas VF-4SS 4-Axis VMC', process: 'CNC MILLING', size: '1270x508 mm', rate: 1800, materials: 'SS, Aluminum, Alloy Steel', axis: '4-Axis VMC', status: 'Under Load', audit: 'APPROVED' }
      ]
    },
    {
      id: 'V-202',
      name: 'Apex Precision Tools & Aerospace',
      location: 'Balanagar, Hyderabad',
      phone: '+91 76543 21098',
      email: 'contact@apexprecision.in',
      status: 'APPROVED',
      rating: 5,
      auditScore: '98/100 (AS9100D Certified)',
      machines: [
        { id: 'M-201', name: 'Mazak Integrex e-500H', process: 'CNC TURNING & MILLING', size: 'Ø820 x 3000 mm', rate: 3200, materials: 'Titanium, Inconel, SS 316', axis: '5-Axis Multi-Tasking', status: 'Idle', audit: 'APPROVED' }
      ]
    }
  ],
  staff: [
    { id: 'S-1', name: 'P. Sharma', role: 'PROCESS_VALIDATOR' },
    { id: 'S-2', name: 'V. Kumar', role: 'VENDOR_VALIDATOR' },
    { id: 'S-3', name: 'I. Reddy', role: 'INSPECTOR' },
    { id: 'S-4', name: 'L. Das', role: 'LOGISTICS' },
    { id: 'S-5', name: 'A. Rao', role: 'CUSTOMER_AUDIT' },
    { id: 'S-6', name: 'K. Singh', role: 'VENDOR_AUDIT' }
  ],
  projects: []
};

let db = JSON.parse(localStorage.getItem('ITTOX_DB')) || JSON.parse(JSON.stringify(INIT_DB));
let savedProjId = '';

function save() {
  localStorage.setItem('ITTOX_DB', JSON.stringify(db));
  renderAll();
}

function softResetDB() {
  db = JSON.parse(JSON.stringify(INIT_DB));
  savedProjId = '';
  save();
  showToast('Database reset to default seed state!');
}

function getUID(prefix) {
  return prefix + '-' + Math.floor(1000 + Math.random() * 9000);
}

// --------------------------------------------------------------------------
// Navigation & Role Switcher
// --------------------------------------------------------------------------
function nav(view) {
  document.querySelectorAll('.view').forEach(e => e.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active'));

  const targetView = document.getElementById('view-' + view);
  const targetBtn = document.getElementById('btn-nav-' + view);

  if (targetView) targetView.classList.remove('hidden');
  if (targetBtn) targetBtn.classList.add('active');

  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAll() {
  buildSelects();
  if (!document.getElementById('view-staff').classList.contains('hidden')) loadStaffDash();
  if (!document.getElementById('view-customer').classList.contains('hidden')) loadCustDash();
  if (!document.getElementById('view-vendor').classList.contains('hidden')) loadVendDash();
  if (!document.getElementById('view-admin').classList.contains('hidden') && !document.getElementById('adminDash').classList.contains('hidden')) loadAdmin();
}

function buildSelects() {
  const pop = (id, arr, isStaff = false) => {
    let el = document.getElementById(id);
    if (!el) return;
    let val = el.value;
    if (isStaff) {
      el.innerHTML = '<option value="">Select Staff Account...</option>' + arr.map(x => `<option value="${x.id}">${x.name} [${x.role.replace(/_/g, ' ')}]</option>`).join('');
    } else {
      el.innerHTML = '<option value="">Select Account...</option>' + arr.map(x => `<option value="${x.id}">${x.name} [${x.status}]</option>`).join('');
    }
    if (arr.some(x => x.id === val)) el.value = val;
  };
  pop('staffSelector', db.staff, true);
  pop('custSelector', db.customers);
  pop('vendSelector', db.vendors);
}

// --------------------------------------------------------------------------
// Admin Dashboard
// --------------------------------------------------------------------------
function loginAdmin() {
  const u = document.getElementById('adminUser').value;
  const p = document.getElementById('adminPass').value;
  if (u === 'DDD' && p === '123') {
    document.getElementById('adminDash').classList.remove('hidden');
    loadAdmin();
    showToast('Admin Central authenticated successfully.');
  } else {
    alert('Invalid credentials! Use user: DDD, pass: 123');
  }
}

function loadAdmin() {
  let pendVendPays = db.projects.filter(p => p.status === 'DISPATCHED_TO_CUST' && p.vendorPaymentStatus !== 'PAID');
  document.getElementById('adminVendorPayments').innerHTML = pendVendPays.length
    ? pendVendPays.map(p => `
      <div class="card flex-between" id="admin-pay-card-${p.id}">
        <div>
          <strong>Project ${p.id}</strong><br>
          <small>Customer Payment Cleared: YES | Vendor Payout Pending</small>
        </div>
        <button class="btn btn-sm btn-success" id="btn_a_pay_${p.id}" onclick="payVendor('${p.id}')">Approve Vendor Payout</button>
      </div>`).join('')
    : '<p class="subtitle">No pending vendor payouts in queue.</p>';

  document.getElementById('adminProjList').innerHTML = db.projects.length
    ? db.projects.map(p => `
      <div class="card flex-between" style="padding:1rem;">
        <div>
          <strong>Project ${p.id}</strong> <small>(${p.cust})</small><br>
          <small class="text-muted">Files: ${p.files}</small>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-pending">${p.status.replace(/_/g, ' ')}</span><br>
          <small style="font-size:0.75rem;">Cust: ${p.custPaymentStatus || 'PENDING'} | Vend Payout: ${p.vendorPaymentStatus || 'N/A'}</small>
        </div>
      </div>`).join('')
    : '<p class="subtitle">No active projects in ecosystem.</p>';
}

function payVendor(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.vendorPaymentStatus = 'PAID';
    save();
    showToast(`Vendor payout for ${pid} authorized!`);
  }
}

// --------------------------------------------------------------------------
// Staff Portal Engine (6 Roles)
// --------------------------------------------------------------------------
function loadStaffDash() {
  document.querySelectorAll('.staff-dash').forEach(e => e.classList.add('hidden'));
  let sid = document.getElementById('staffSelector').value;
  if (!sid) return;
  let s = db.staff.find(x => x.id === sid);
  if (!s) return;

  let dash = document.getElementById('dash-' + s.role);
  if (!dash) return;
  dash.classList.remove('hidden');
  dash.innerHTML = `<h2 style="margin-bottom:1.25rem;">${s.role.replace(/_/g, ' ')} Dashboard <span class="badge badge-process">${s.name}</span></h2>`;

  if (s.role === 'CUSTOMER_AUDIT') renderCustAudit(dash);
  if (s.role === 'VENDOR_AUDIT') renderVendAudit(dash);
  if (s.role === 'PROCESS_VALIDATOR') renderProcVal(dash, s);
  if (s.role === 'VENDOR_VALIDATOR') renderVendVal(dash, s);
  if (s.role === 'LOGISTICS') renderLogistics(dash);
  if (s.role === 'INSPECTOR') renderInspector(dash);
}

// 1. Customer Audit Team
function renderCustAudit(dash) {
  let pendC = db.customers.filter(c => c.status === 'PENDING');
  let html = `<h3>Customer Compliance Registrations &amp; Credit Underwriting</h3>`;
  if (pendC.length === 0) {
    html += `<div class="card"><p class="subtitle">No pending customer registrations to audit.</p></div>`;
  } else {
    pendC.forEach(c => {
      let docsList = (c.attachedDocs && c.attachedDocs.length)
        ? c.attachedDocs.map(d => `<span class="badge badge-approved" style="margin: 2px;">&check; ${d}</span>`).join('')
        : '<span class="badge badge-pending">Standard KYC Attached</span>';

      html += `
      <div class="card" id="audit-cust-card-${c.id}" style="margin-bottom: var(--sp-6);">
        <div class="flex-between">
          <div>
            <div class="kicker">${c.entityType || 'Corporate Entity'} &bull; CIN: ${c.cin || 'N/A'}</div>
            <h4 style="font-size: 1.15rem; margin: 0.2rem 0;">${c.name}</h4>
          </div>
          <span class="badge badge-pending">KYC &amp; Credit Pending</span>
        </div>

        <div class="grid-3" style="margin: 1rem 0; gap: var(--sp-4);">
          <div class="inner-panel">
            <h5 style="color: var(--accent); font-size: 0.78rem; text-transform: uppercase; margin-bottom: 0.5rem;">Statutory &amp; Identity</h5>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>GSTIN:</strong> ${c.gst || 'N/A'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>PAN:</strong> ${c.pan || 'N/A'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Signatory:</strong> ${c.signatoryName || 'Authorized Signatory'} (${c.signatoryDesig || 'Director'})</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Signatory Phone:</strong> ${c.signatoryPhone || c.phone}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Reg. Address:</strong> ${c.address}</p>
          </div>

          <div class="inner-panel">
            <h5 style="color: var(--accent); font-size: 0.78rem; text-transform: uppercase; margin-bottom: 0.5rem;">Operations &amp; Banking</h5>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Works:</strong> ${c.factoryAddress || c.address}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Sector:</strong> ${c.sector || 'Precision Engineering'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Products:</strong> ${c.product || 'Sub-Assemblies'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Bank:</strong> ${c.bankName || 'State Bank of India'} &bull; ${c.bankBranch || 'Hyderabad'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>A/c No:</strong> ${c.bankAcc || '••••••••'} (IFSC: ${c.bankIfsc || 'N/A'})</p>
          </div>

          <div class="inner-panel">
            <h5 style="color: var(--accent); font-size: 0.78rem; text-transform: uppercase; margin-bottom: 0.5rem;">Commercial &amp; Compliance</h5>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Requested Tier:</strong> <span class="badge badge-tier">${c.reqCreditTier || '15 to 30 Day Credit'}</span></p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Requested Limit:</strong> <strong>${c.reqCreditLimit || '₹ 25,00,000'}</strong></p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>MSME Category:</strong> ${c.msmeType || 'Medium Enterprise'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>Udyam Reg:</strong> ${c.udyamNo || 'N/A'}</p>
            <p style="font-size: 0.8rem; margin: 2px 0;"><strong>M-NDA Executed:</strong> <span class="text-success">&check; Certified</span></p>
          </div>
        </div>

        <div style="margin: 0.75rem 0;">
          <strong style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Verified Attached Documents:</strong>
          <div style="margin-top: 0.35rem; display: flex; flex-wrap: wrap; gap: 4px;">
            ${docsList}
          </div>
        </div>

        <div class="inner-panel" style="margin-top: 1rem; border: 1.5px dashed var(--border-mid); background: var(--bg-subtle);" id="ca-upload-area-${c.id}">
          <h5 style="margin-bottom: 0.5rem;">Audit Assessment &amp; Credit Sanction</h5>
          <div class="grid-2" style="margin-bottom: 0.75rem;">
            <div>
              <label>Approved Credit Tier</label>
              <select id="ca_tier_${c.id}">
                <option value="Cash / Advance" ${c.reqCreditTier === 'Cash / Advance' ? 'selected' : ''}>Cash / Advance Tier</option>
                <option value="15 to 30 Day Credit" ${!c.reqCreditTier || c.reqCreditTier.includes('15') ? 'selected' : ''}>15 to 30 Day Credit</option>
                <option value="45 to 90 Day Credit" ${c.reqCreditTier && c.reqCreditTier.includes('45') ? 'selected' : ''}>45 to 90 Day Credit</option>
                <option value="Strategic Partner" ${c.reqCreditTier && c.reqCreditTier.includes('Strategic') ? 'selected' : ''}>Strategic Enterprise Tier</option>
              </select>
            </div>
            <div>
              <label>Sanctioned Credit Limit (₹)</label>
              <input type="text" id="ca_limit_${c.id}" value="${c.reqCreditLimit || '₹ 25,00,000'}" placeholder="Approved Credit Limit">
            </div>
          </div>
          <label>Upload Verified Legal KYC &amp; Credit Underwriting Audit Report (PDF)</label>
          <div class="file-upload-mock uploaded" id="ca_mock_file_${c.id}" onclick="showToast('KYC Audit Report re-verified.')">
            Verified_Legal_KYC_Audit_Report.pdf (Signed &amp; Approved)
          </div>
        </div>

        <div style="margin-top: 1.25rem; display: flex; gap: var(--sp-3);">
          <button class="btn btn-success" id="btn_appr_cust_${c.id}" onclick="apprCust('${c.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Approve Entity &amp; Activate Sourcing Account
          </button>
        </div>
      </div>`;
    });
  }
  dash.innerHTML += html;
}

function apprCust(cid) {
  let c = db.customers.find(x => x.id === cid);
  if (c) {
    c.status = 'APPROVED';
    c.creditTier = document.getElementById('ca_tier_' + cid).value;
    c.creditLimit = document.getElementById('ca_limit_' + cid).value;
    save();
    showToast(`Customer ${c.name} approved with ${c.creditTier}!`);
  }
}

// 2. Vendor Audit Team
function renderVendAudit(dash) {
  let pendV = db.vendors.filter(v => v.status === 'PENDING');
  let html = `<h3>Vendor Facility & Capability Audits</h3>`;
  if (pendV.length === 0) {
    html += `<div class="card"><p class="subtitle">No facility onboarding applications pending review.</p></div>`;
  } else {
    pendV.forEach(v => {
      html += `
      <div class="card" id="audit-vend-card-${v.id}">
        <h4>Facility: ${v.name}</h4>
        <p class="subtitle">Location: ${v.location} | Contact: ${v.phone} | ${v.email}</p>
        <div class="machine-block">
          <h5>Onboarded Machinery & Equipment Specs:</h5>
          ${v.machines.map(m => `<div>• <strong>${m.name}</strong> (${m.process}) | Size: ${m.size} | Mat: ${m.materials} | Axis: ${m.axis} | Rate: ₹${m.rate}/hr</div>`).join('')}
        </div>
        <div style="margin-top:1rem; border:1px dashed var(--border-color); padding:1rem; border-radius:var(--radius-md); background:rgba(9,13,22,0.4);">
          <label>1. Upload Factory Audit & First-Article Sample Test Report</label>
          <div class="file-upload-mock" id="va_mock_file_${v.id}" onclick="this.classList.add('uploaded'); this.innerText='Factory_Audit_Sample_Test.pdf Attached';">
            Click to Attach Verified Technical Audit Report
          </div>
          <label style="margin-top:0.75rem;">2. Assign Capability Rating & Category</label>
          <select id="va_rating_${v.id}">
            <option value="5">5 Star - High Precision ISO 9001 / AS9100</option>
            <option value="4">4 Star - Verified Engineering Supplier</option>
            <option value="3">3 Star - Standard Fabrication Vendor</option>
          </select>
        </div>
        <div style="margin-top:1.25rem;">
          <button class="btn btn-success" id="btn_appr_vend_${v.id}" onclick="apprVendor('${v.id}')">Approve Facility & Activate Machines</button>
        </div>
      </div>`;
    });
  }
  dash.innerHTML += html;
}

function apprVendor(vid) {
  let v = db.vendors.find(x => x.id === vid);
  if (v) {
    v.status = 'APPROVED';
    v.rating = Number(document.getElementById('va_rating_' + vid).value) || 5;
    v.auditScore = `${v.rating * 18 + 6}/100 (ISO Approved)`;
    v.machines.forEach(m => m.audit = 'APPROVED');
    save();
    showToast(`Vendor ${v.name} approved as ${v.rating}-Star supplier!`);
  }
}

// 3. Process Validator
function renderProcVal(dash, s) {
  let unassigned = db.projects.filter(p => p.status === 'AI_EXTRACTED_PENDING_VAL');
  let mine = db.projects.filter(p => p.status === 'PROCESS_VAL_ASSIGNED' && p.assignedProcVal === s.id);

  let html = `<h3>Global Extraction Queue</h3>`;
  if (unassigned.length === 0) {
    html += `<div class="card"><p class="subtitle">No unassigned CAD extractions in queue.</p></div>`;
  } else {
    unassigned.forEach(p => {
      html += `
      <div class="card flex-between">
        <div><strong>Project ${p.id}</strong> <span class="badge badge-process">CAD Extracted</span><br><small class="text-muted">Customer: ${p.cust} | Files: ${p.files}</small></div>
        <button class="btn btn-sm" id="btn_assign_pv_${p.id}" onclick="assignPV('${p.id}', '${s.id}')">Assign to Me</button>
      </div>`;
    });
  }

  html += `<h3 style="margin-top:1.5rem;">My Validation Tasks</h3>`;
  if (mine.length === 0) {
    html += `<div class="card"><p class="subtitle">You have no active drawing validation tasks.</p></div>`;
  } else {
    mine.forEach(p => {
      html += `
      <div class="card" id="proc-val-card-${p.id}">
        <div class="flex-between">
          <h4>Project: ${p.id}</h4>
          <button class="btn btn-sm btn-outline" id="btn_pv_view_${p.id}" onclick="openViewer('${p.id}')">Interactive CAD Viewer</button>
        </div>
        <div class="table-responsive" style="margin:1rem 0;">
          <table>
            <thead>
              <tr><th>Drawing Part #</th><th>Process Stages</th><th>Est. Quantity</th></tr>
            </thead>
            <tbody>
              ${p.drawings.map((d, i) => `
                <tr>
                  <td><input type="text" id="pv_dwg_${p.id}_${i}" value="${d.dwgNo}"></td>
                  <td><input type="text" id="pv_proc_${p.id}_${i}" value="${d.proc}"></td>
                  <td><input type="number" id="pv_qty_${p.id}_${i}" value="${d.qty}"></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn btn-success" id="btn_appr_pv_${p.id}" onclick="approveProcVal('${p.id}')">Save & Authorize Specs for Customer Scoping</button>
      </div>`;
    });
  }
  dash.innerHTML += html;
}

function assignPV(pid, sid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.assignedProcVal = sid;
    p.status = 'PROCESS_VAL_ASSIGNED';
    save();
    showToast(`Project ${pid} assigned to Process Validator.`);
  }
}

function approveProcVal(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.drawings.forEach((d, i) => {
      d.dwgNo = document.getElementById(`pv_dwg_${pid}_${i}`).value;
      d.proc = document.getElementById(`pv_proc_${pid}_${i}`).value;
      d.processes = d.proc.split(',').map(s => s.trim()).filter(Boolean).map((pName, index) => {
        return {
          stageId: index + 1,
          name: pName,
          topVendors: [],
          quotes: [],
          selectedVendor: null,
          prodStatus: 'Pending',
          rawScope: 'Vendor',
          mfgScope: 'Vendor',
          finScope: 'Vendor'
        };
      });
    });
    p.status = 'CUSTOMER_SCOPE_PENDING';
    save();
    showToast(`Project ${pid} process specs approved. Sent to Customer for Scoping!`);
  }
}

// 4. Vendor Validator
function renderVendVal(dash, s) {
  let unAI = db.projects.filter(p => p.status === 'AI_VENDOR_SEARCH_PENDING');
  let mineAI = db.projects.filter(p => p.status === 'VEND_VAL_AI_ASSIGNED' && p.assignedVendVal === s.id);
  let unQ = db.projects.filter(p => p.status === 'QUOTES_RECEIVED_PENDING');
  let mineQ = db.projects.filter(p => p.status === 'VEND_VAL_QUOTES_ASSIGNED' && p.assignedVendVal === s.id);
  let unPO = db.projects.filter(p => p.status === 'CUST_SELECTED_VEND_PENDING');
  let minePO = db.projects.filter(p => p.status === 'VEND_VAL_PO_ASSIGNED' && p.assignedVendVal === s.id);

  let html = `<h3>1. AI Supplier Match Verification</h3>`;
  if (unAI.length === 0 && mineAI.length === 0) html += `<div class="card"><p class="subtitle">No AI vendor routing tasks pending.</p></div>`;
  unAI.forEach(p => {
    html += `<div class="card flex-between">${p.id} Routing Match <button class="btn btn-sm" id="btn_assign_vv_ai_${p.id}" onclick="assignVV('${p.id}', '${s.id}', 'VEND_VAL_AI_ASSIGNED')">Assign to Me</button></div>`;
  });
  mineAI.forEach(p => {
    html += `
    <div class="card" id="vv-ai-card-${p.id}">
      <div class="flex-between"><h4>${p.id} AI Machine Match</h4><button class="btn btn-sm btn-outline" id="btn_vv_ai_view_${p.id}" onclick="openViewer('${p.id}')">Inspect CAD</button></div>
      <div class="table-responsive" style="margin:1rem 0;">
        <table>
          <thead><tr><th>Drawing</th><th>Stage</th><th>Matched Vendor Machines</th></tr></thead>
          <tbody>
            ${p.drawings.map(d => d.processes.map(proc => `
              <tr>
                <td><strong>${d.dwgNo}</strong></td>
                <td><span class="badge badge-process">${proc.name}</span></td>
                <td>${proc.topVendors.length ? proc.topVendors.join(', ') : 'V-201 (BNR Laser/Bending), V-202 (Apex Multi-Axis)'}</td>
              </tr>`).join('')).join('')}
          </tbody>
        </table>
      </div>
      <button class="btn btn-success" id="btn_appr_vv_ai_${p.id}" onclick="apprVVAIRouting('${p.id}')">Authorize RFQ Dispatch to Vendors</button>
    </div>`;
  });

  html += `<h3 style="margin-top:1.5rem;">2. Audit Bids & Apply 5% Platform Margin</h3>`;
  if (unQ.length === 0 && mineQ.length === 0) html += `<div class="card"><p class="subtitle">No vendor quotes in audit queue.</p></div>`;
  unQ.forEach(p => {
    html += `<div class="card flex-between">${p.id} (Bids Received) <button class="btn btn-sm" id="btn_assign_vv_q_${p.id}" onclick="assignVV('${p.id}', '${s.id}', 'VEND_VAL_QUOTES_ASSIGNED')">Assign to Me</button></div>`;
  });
  mineQ.forEach(p => {
    let quoteHtml = '';
    p.drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
      quoteHtml += `<p style="margin-top:0.5rem; font-weight:bold;">${d.dwgNo} - Stage ${proc.stageId} (${proc.name}):</p>`;
      proc.quotes.forEach((q, qIdx) => {
        quoteHtml += `
        <div class="flex-gap" style="margin-bottom:0.5rem;">
          <span style="width:140px; font-weight:600;">${q.vid}</span>
          <input type="number" id="vval_qcost_${p.id}_${dIdx}_${pIdx}_${qIdx}" value="${q.cost}" style="width:120px;" placeholder="Cost (₹)">
          <input type="number" id="vval_qtime_${p.id}_${dIdx}_${pIdx}_${qIdx}" value="${q.time}" style="width:100px;" placeholder="Days">
          <small class="text-muted">+ 5% Ittox Fee Included</small>
        </div>`;
      });
    }));
    html += `
    <div class="card" id="vv-quote-card-${p.id}">
      <div class="flex-between"><h4>${p.id} Quotes Audit</h4><button class="btn btn-sm btn-outline" id="btn_vv_q_view_${p.id}" onclick="openViewer('${p.id}')">Inspect CAD</button></div>
      <div style="background:rgba(9,13,22,0.4); padding:1rem; border-radius:var(--radius-md); margin:1rem 0;">${quoteHtml}</div>
      <button class="btn btn-success" id="btn_appr_vv_q_${p.id}" onclick="apprQ('${p.id}')">Approve Quotes & Release to Customer Matrix</button>
    </div>`;
  });

  html += `<h3 style="margin-top:1.5rem;">3. Final PO Release Authorization</h3>`;
  if (unPO.length === 0 && minePO.length === 0) html += `<div class="card"><p class="subtitle">No PO releases in queue.</p></div>`;
  unPO.forEach(p => {
    html += `<div class="card flex-between">${p.id} (Customer Selected) <button class="btn btn-sm" id="btn_assign_vv_po_${p.id}" onclick="assignVV('${p.id}', '${s.id}', 'VEND_VAL_PO_ASSIGNED')">Assign to Me</button></div>`;
  });
  minePO.forEach(p => {
    let poHtml = p.drawings.map(d => d.processes.map(proc => `
      <tr>
        <td>${d.dwgNo}</td>
        <td><span class="badge badge-process">${proc.name}</span></td>
        <td><span class="badge badge-approved">${proc.selectedVendor}</span></td>
      </tr>`).join('')).join('');
    html += `
    <div class="card" id="vv-po-card-${p.id}">
      <div class="flex-between"><h4>${p.id} Final PO Authorization</h4><button class="btn btn-sm btn-outline" id="btn_vv_po_view_${p.id}" onclick="openViewer('${p.id}')">Inspect CAD</button></div>
      <table class="table-responsive" style="margin:1rem 0;">
        <thead><tr><th>Drawing</th><th>Process Stage</th><th>Selected Vendor</th></tr></thead>
        <tbody>${poHtml}</tbody>
      </table>
      <button class="btn btn-success" id="btn_appr_vv_po_${p.id}" onclick="apprVVPORelease('${p.id}')">Authorize PO Dispatch to Vendors</button>
    </div>`;
  });

  dash.innerHTML += html;
}

function assignVV(pid, sid, stat) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.assignedVendVal = sid;
    p.status = stat;
    save();
    showToast(`Project ${pid} assigned to Vendor Validator.`);
  }
}

function apprVVAIRouting(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'PENDING_VENDOR_QUOTES';
    save();
    showToast(`RFQs dispatched to matched vendor network!`);
  }
}

function apprQ(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
      proc.quotes.forEach((q, qIdx) => {
        const costEl = document.getElementById(`vval_qcost_${pid}_${dIdx}_${pIdx}_${qIdx}`);
        const timeEl = document.getElementById(`vval_qtime_${pid}_${dIdx}_${pIdx}_${qIdx}`);
        if (costEl) q.cost = costEl.value;
        if (timeEl) q.time = timeEl.value;
      });
    }));
    p.status = 'CUSTOMER_FINAL_SELECTION';
    save();
    showToast(`Quotes approved with +5% fee. Released to Customer portal!`);
  }
}

function apprVVPORelease(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'PO_SENT_TO_VENDOR';
    save();
    showToast(`Production POs dispatched to suppliers!`);
  }
}

// 5. Inspector (QA/QC)
function renderInspector(dash) {
  let pending = db.projects.filter(p => p.status === 'PENDING_INSPECTION');
  let html = `<h3>Incoming Warehouse QA / Dimensional Inspection</h3>`;
  if (pending.length === 0) {
    html += `<div class="card"><p class="subtitle">No incoming parts awaiting physical inspection.</p></div>`;
  } else {
    pending.forEach(p => {
      html += `
      <div class="card" id="insp-card-${p.id}">
        <div class="flex-between">
          <h4>Project ${p.id}</h4>
          <button class="btn btn-sm btn-outline" id="btn_i_view_${p.id}" onclick="openViewer('${p.id}')">Inspect Drawing & Tolerances</button>
        </div>
        <div class="grid-2" style="margin:1rem 0;">
          <div>
            <label>Inspection Outcome</label>
            <select id="i_stat_${p.id}">
              <option value="Approved - Match Spec" selected>Approved - Clean Quality Pass (ISO Spec)</option>
              <option value="Rework Required">Rework Required at Supplier</option>
              <option value="Rejected">Rejected - Material Non-Conformance</option>
            </select>
          </div>
          <div>
            <label>Dimensional Log / Notes</label>
            <input type="text" id="i_note_${p.id}" placeholder="e.g. CMM report verified, tolerance ±0.02mm met" value="Passed CMM & roughness check">
          </div>
        </div>
        <button class="btn btn-success" id="btn_i_done_${p.id}" onclick="inspDone('${p.id}')">Submit Official QA Certificate</button>
      </div>`;
    });
  }
  dash.innerHTML += html;
}

function inspDone(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    let stat = document.getElementById('i_stat_' + pid).value;
    p.status = stat.includes('Approved') ? 'PENDING_CUST_DELIVERY_APPROVAL' : 'PO_ACCEPTED_VENDOR';
    p.qaNotes = document.getElementById('i_note_' + pid).value;
    save();
    showToast(`QA Inspection report submitted for ${pid}!`);
  }
}

// 6. Logistics & Delivery Team
function renderLogistics(dash) {
  let disp = db.projects.filter(p => p.status === 'DISPATCH_REQUESTED');
  let transit = db.projects.filter(p => p.status === 'LOGISTICS_ACCEPTED');
  let addFees = db.projects.filter(p => p.status === 'PENDING_LOGISTICS_FEE');
  let toShip = db.projects.filter(p => p.status === 'PAYMENT_COMPLETED_PENDING_DISPATCH');

  let html = `<h3>1. Vendor Pickup Requests</h3>`;
  if (disp.length === 0) html += `<div class="card"><p class="subtitle">No pending supplier pickup requests.</p></div>`;
  disp.forEach(p => {
    let vendorsToCall = [];
    p.drawings.forEach(d => d.processes.forEach(proc => {
      if (proc.selectedVendor && !vendorsToCall.includes(proc.selectedVendor)) vendorsToCall.push(proc.selectedVendor);
    }));
    let vendInfoHtml = vendorsToCall.map(vid => {
      let v = db.vendors.find(x => x.id === vid) || { name: 'BNR Precision', location: 'Hyderabad', phone: '9876543210' };
      return `<div><strong>${v.name}</strong> - Loc: ${v.location} | Ph: ${v.phone}</div>`;
    }).join('');

    html += `
    <div class="card" id="log-disp-card-${p.id}">
      <h4>Project ${p.id} Pickup</h4>
      <div style="background:rgba(9,13,22,0.4); padding:0.85rem; border-radius:var(--radius-md); margin:0.5rem 0;">${vendInfoHtml}</div>
      <button class="btn btn-success" id="btn_l_acc_${p.id}" onclick="acceptLogisticsPickup('${p.id}')">Verbal Confirmation Done - Accept Pickup</button>
    </div>`;
  });

  html += `<h3 style="margin-top:1.5rem;">2. In Transit to ITTOX Warehouse</h3>`;
  if (transit.length === 0) html += `<div class="card"><p class="subtitle">No shipments in transit.</p></div>`;
  transit.forEach(p => {
    html += `<div class="card flex-between">Project ${p.id} (In Transit) <button class="btn btn-success" id="btn_l_rec_${p.id}" onclick="receiveMaterial('${p.id}')">Material Received at ITTOX Warehouse</button></div>`;
  });

  html += `<h3 style="margin-top:1.5rem;">3. Transport & Freight Fee Calculation</h3>`;
  if (addFees.length === 0) html += `<div class="card"><p class="subtitle">No pending freight fee calculations.</p></div>`;
  addFees.forEach(p => {
    html += `
    <div class="card" id="log-fee-card-${p.id}">
      <h4>${p.id} Final Delivery</h4>
      <p class="subtitle">Customer Delivery Address: ${p.custDeliveryAddress || 'Hyderabad Industrial Area'}</p>
      <input type="number" id="fee_tot_${p.id}" placeholder="Total Transport & Insurance Fee (₹)" value="4500" style="margin:0.75rem 0;">
      <button class="btn btn-success" id="btn_l_pay_${p.id}" onclick="logisticsReqPay('${p.id}')">Request Final Payment from Customer</button>
    </div>`;
  });

  html += `<h3 style="margin-top:1.5rem;">4. Final Dispatch to Customer</h3>`;
  if (toShip.length === 0) html += `<div class="card"><p class="subtitle">No orders pending final customer dispatch.</p></div>`;
  toShip.forEach(p => {
    html += `<div class="card flex-between">Project ${p.id} (Payment Cleared) <button class="btn btn-success" id="btn_l_ship_${p.id}" onclick="dispatchToCust('${p.id}')">Dispatch Order to Customer</button></div>`;
  });

  dash.innerHTML += html;
}

function acceptLogisticsPickup(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'LOGISTICS_ACCEPTED';
    save();
    showToast(`Pickup accepted for Project ${pid}. Truck dispatched to supplier.`);
  }
}

function receiveMaterial(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'PENDING_INSPECTION';
    save();
    showToast(`Material received at ITTOX Central Warehouse! Sent to QA.`);
  }
}

function logisticsReqPay(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.logisticsFee = Number(document.getElementById('fee_tot_' + pid).value) || 0;
    p.status = 'PENDING_CUST_PAYMENT';
    save();
    showToast(`Freight fee appended. Final invoice generated for customer.`);
  }
}

function dispatchToCust(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'DISPATCHED_TO_CUST';
    p.custPaymentStatus = 'PAID';
    save();
    showToast(`Project ${pid} dispatched to Customer! Order completed.`);
  }
}

// --------------------------------------------------------------------------
// Customer Portal Engine & Registration Wizard
// --------------------------------------------------------------------------
let custWizardStep = 1;
const attachedDocs = new Set();

function showCustReg() {
  const regEl = document.getElementById('custReg');
  if (regEl) {
    regEl.classList.remove('hidden');
    wizardGoTo(1);
    regEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleDocSlot(el, docName) {
  if (!el) return;
  if (el.classList.contains('uploaded')) {
    el.classList.remove('uploaded');
    el.innerHTML = '<span>Attach PDF</span>';
    attachedDocs.delete(docName);
    showToast(`Removed attachment: ${docName}`);
  } else {
    el.classList.add('uploaded');
    el.innerHTML = `<span>&check; ${docName}</span>`;
    attachedDocs.add(docName);
    showToast(`Attached: ${docName}`);
  }
}

function selectCreditTier(tierKey) {
  // Update card UI
  ['cash', '15_30', '45_90', 'strategic'].forEach(t => {
    const el = document.getElementById(`ct-opt-${t.replace('_', '-')}`);
    if (el) el.classList.remove('selected');
  });
  const selectedEl = document.getElementById(`ct-opt-${tierKey.replace('_', '-')}`);
  if (selectedEl) selectedEl.classList.add('selected');

  const tierNames = {
    cash: 'Cash / Advance',
    '15_30': '15 to 30 Day Credit',
    '45_90': '45 to 90 Day Credit',
    strategic: 'Strategic Partner'
  };
  const val = tierNames[tierKey] || '15 to 30 Day Credit';
  const hiddenInput = document.getElementById('c_credit_tier_val');
  if (hiddenInput) hiddenInput.value = val;

  // Dynamic documentation rules in Step 4
  const alertMsg = document.getElementById('fin-tier-alert-msg');
  const rowSanction = document.getElementById('row-sanction');
  const rowRating = document.getElementById('row-credit-rating');
  const rowTrade = document.getElementById('row-trade-ref');
  const rowFin = document.getElementById('row-audit-fin');
  const rowItr = document.getElementById('row-itr');
  const rowGstr = document.getElementById('row-gstr');
  const rowBank = document.getElementById('row-bank-stmt');

  if (tierKey === 'cash') {
    if (alertMsg) alertMsg.innerHTML = `Selected Credit Tier: <strong>Cash / Advance</strong>. Financial audits and tax returns are <em>optional</em>. Fast-track approval within 4 hours.`;
    [rowFin, rowItr, rowGstr, rowBank, rowSanction, rowRating, rowTrade].forEach(r => {
      if (r) r.style.opacity = '0.55';
    });
  } else if (tierKey === '15_30') {
    if (alertMsg) alertMsg.innerHTML = `Selected Credit Tier: <strong>15 to 30 Day Credit</strong>. Audited accounts (2 yrs), ITR, and 6-month GST returns are required.`;
    [rowFin, rowItr, rowGstr, rowBank].forEach(r => { if (r) r.style.opacity = '1'; });
    [rowSanction, rowRating, rowTrade].forEach(r => { if (r) r.style.opacity = '0.65'; });
  } else if (tierKey === '45_90') {
    if (alertMsg) alertMsg.innerHTML = `Selected Credit Tier: <strong>45 to 90 Day Credit</strong>. Complete financial dossier, bank facility proofs, and 2 trade references required.`;
    [rowFin, rowItr, rowGstr, rowBank, rowSanction, rowTrade].forEach(r => { if (r) r.style.opacity = '1'; });
    if (rowRating) rowRating.style.opacity = '0.8';
  } else if (tierKey === 'strategic') {
    if (alertMsg) alertMsg.innerHTML = `Selected Credit Tier: <strong>Strategic Enterprise Partner</strong>. Full institutional financial audit, credit agency rating, and facility proof required.`;
    [rowFin, rowItr, rowGstr, rowBank, rowSanction, rowRating, rowTrade].forEach(r => { if (r) r.style.opacity = '1'; });
  }
}

function wizardGoTo(step) {
  if (step < 1 || step > 6) return;
  custWizardStep = step;

  // Toggle panels
  for (let i = 1; i <= 6; i++) {
    const panel = document.getElementById(`wiz-panel-${i}`);
    if (panel) {
      if (i === step) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
  }

  // Update step indicators
  for (let i = 1; i <= 6; i++) {
    const item = document.getElementById(`wiz-step-${i}`);
    const conn = document.getElementById(`wiz-conn-${i}`);
    if (item) {
      item.classList.remove('active', 'completed');
      if (i === step) item.classList.add('active');
      else if (i < step) item.classList.add('completed');
    }
    if (conn) {
      if (i < step) conn.style.background = 'var(--success)';
      else conn.style.background = 'var(--border)';
    }
  }

  // Update navigation buttons
  const prevBtn = document.getElementById('btn-wiz-prev');
  const nextBtn = document.getElementById('btn-wiz-next');
  const submitBtn = document.getElementById('btn-submit-cust');
  const counter = document.getElementById('wiz-step-counter');

  if (counter) counter.innerText = `Step ${step} of 6`;

  if (prevBtn) {
    prevBtn.style.visibility = (step === 1) ? 'hidden' : 'visible';
  }

  if (step === 6) {
    if (nextBtn) nextBtn.classList.add('hidden');
    if (submitBtn) submitBtn.classList.remove('hidden');
    populateReview();
  } else {
    if (nextBtn) nextBtn.classList.remove('hidden');
    if (submitBtn) submitBtn.classList.add('hidden');
  }

  const regCard = document.getElementById('custReg');
  if (regCard) regCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function wizardNext() {
  if (custWizardStep === 1) {
    const name = document.getElementById('c_name')?.value?.trim();
    if (!name) {
      alert('Please enter the Company Legal Name before continuing.');
      document.getElementById('c_name')?.focus();
      return;
    }
  }
  if (custWizardStep < 6) {
    wizardGoTo(custWizardStep + 1);
  }
}

function wizardBack() {
  if (custWizardStep > 1) {
    wizardGoTo(custWizardStep - 1);
  }
}

function populateReview() {
  const container = document.getElementById('wiz-review-container');
  if (!container) return;

  const val = id => document.getElementById(id)?.value || '&mdash;';
  const checked = id => document.getElementById(id)?.checked ? '<span class="text-success">&check; Certified</span>' : '<span class="text-danger">&cross; Not Selected</span>';

  let docsHtml = '';
  if (attachedDocs.size === 0) {
    docsHtml = '<span class="text-muted">Standard documents will be uploaded during physical audit.</span>';
  } else {
    docsHtml = Array.from(attachedDocs).map(d => `<span class="badge badge-approved" style="margin: 2px;">&check; ${d}</span>`).join(' ');
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <div class="review-row">
        <span class="review-label">Company Legal Name</span>
        <span class="review-value"><strong>${val('c_name')}</strong></span>
      </div>
      <div class="review-row">
        <span class="review-label">Entity Type &amp; CIN</span>
        <span class="review-value">${val('c_type')} &bull; ${val('c_cin')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">PAN &amp; GSTIN</span>
        <span class="review-value">${val('c_pan')} &bull; ${val('c_gst')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">Authorised Signatory</span>
        <span class="review-value">${val('c_sig_name')} (${val('c_sig_desig')}) &bull; ${val('c_sig_phone')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">Works / Plant Location</span>
        <span class="review-value">${val('c_factory_addr')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">Industry &amp; Products</span>
        <span class="review-value">${val('c_sector')} &mdash; ${val('c_prod')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">Bank Settlement</span>
        <span class="review-value">${val('c_bank_name')} (${val('c_bank_branch')}) &bull; A/c: ${val('c_bank_acc')} &bull; IFSC: ${val('c_bank_ifsc')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">Requested Credit Facility</span>
        <span class="review-value"><span class="badge badge-tier">${val('c_credit_tier_val')}</span> &bull; Limit: <strong>${val('c_req_limit')}</strong></span>
      </div>
      <div class="review-row">
        <span class="review-label">MSME Classification</span>
        <span class="review-value">${val('c_msme_type')} (Udyam: ${val('c_udyam_no')})</span>
      </div>
      <div class="review-row">
        <span class="review-label">Mutual NDA</span>
        <span class="review-value">${checked('c_dec_nda')}</span>
      </div>
      <div class="review-row">
        <span class="review-label">Attached Documents</span>
        <span class="review-value" style="text-align: right; max-width: 65%;">${docsHtml}</span>
      </div>
    </div>
  `;
}

function demoCust() {
  // Step 1
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('c_name', 'Medha Servo Drives Private Limited');
  set('c_type', 'Private Limited Company');
  set('c_cin', 'U31909TG1990PTC011234');
  set('c_pan', 'AABCM1234P');
  set('c_gst', '36AABCM1234P1Z4');
  set('c_addr', 'Plot 21/A, R&D Enclave, Cherlapally, Hyderabad, Telangana 500051');
  set('c_sig_name', 'K. V. Rama Rao');
  set('c_sig_desig', 'Director & Head of Procurement');
  set('c_sig_phone', '+91 98490 12345');
  set('c_sig_email', 'ramarao@medhaservo.com');

  // Step 2
  set('c_factory_addr', 'Sy No. 501, Phase-V, IDA Cherlapally, Medchal-Malkajgiri, Telangana 500051');
  set('c_delivery_addr', 'Central Inward Stores, Gate No. 2, Medha Servo Campus, Cherlapally');
  set('c_proc_name', 'N. Suresh Kumar');
  set('c_proc_email', 'procurement@medhaservo.com');
  set('c_proc_phone', '+91 98491 88776');
  set('c_fin_name', 'P. Laxman Rao');
  set('c_fin_email', 'finance@medhaservo.com');
  set('c_fin_phone', '+91 98492 55443');
  set('c_qc_name', 'D. Srinivas');
  set('c_qc_email', 'qa.inward@medhaservo.com');
  set('c_qc_phone', '+91 98493 22110');
  set('c_sector', 'Railways & Rolling Stock');
  set('c_prod', 'Traction Converters, Auxiliary Power Units, TCMS Enclosures');
  set('c_turnover', '₹25 Cr – ₹100 Cr');

  // Step 3
  set('c_bank_name', 'State Bank of India');
  set('c_bank_branch', 'Industrial Finance Branch, Punjagutta, Hyderabad');
  set('c_bank_acc', '38472910548');
  set('c_bank_acc2', '38472910548');
  set('c_bank_type', 'Current Account');
  set('c_bank_ifsc', 'SBIN0004123');

  // Step 4 & 5
  selectCreditTier('15_30');
  set('c_req_limit', '₹ 50,00,000');
  set('c_msme_type', 'Medium Enterprise');
  set('c_udyam_no', 'UDYAM-TS-02-0019842');

  // Mark mock documents uploaded
  const slots = [
    { id: 'slot_incorp', doc: 'Certificate_of_Incorporation.pdf' },
    { id: 'slot_pan', doc: 'Company_PAN_Card.pdf' },
    { id: 'slot_gst', doc: 'GST_REG06_Certificate.pdf' },
    { id: 'slot_moa', doc: 'MoA_AoA_Executed.pdf' },
    { id: 'slot_cheque', doc: 'Cancelled_Cheque_Attested.pdf' },
    { id: 'slot_audit_fin', doc: 'Audited_Financials_FY24_FY25.pdf' },
    { id: 'slot_itr', doc: 'ITR_Acknowledgments_AY24_AY25.pdf' },
    { id: 'slot_gstr', doc: 'GSTR_3B_1_Last_6_Months.pdf' },
    { id: 'slot_bank_stmt', doc: 'Bank_Statements_6_Months.pdf' },
    { id: 'slot_udyam', doc: 'Udyam_Registration_Certificate.pdf' }
  ];
  slots.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.classList.add('uploaded');
      el.innerHTML = `<span>&check; ${s.doc}</span>`;
      attachedDocs.add(s.doc);
    }
  });

  // Jump to step 6 to show completed dossier
  wizardGoTo(6);
  showToast('Demo corporate dossier loaded! Review all 6 sections below.');
}

function regCust() {
  const name = document.getElementById('c_name')?.value?.trim();
  if (!name) {
    alert('Please enter company legal name!');
    wizardGoTo(1);
    return;
  }

  const getV = id => document.getElementById(id)?.value?.trim() || '';
  const newCid = getUID('C');

  const newCust = {
    id: newCid,
    name: name,
    entityType: getV('c_type') || 'Private Limited Company',
    cin: getV('c_cin'),
    pan: getV('c_pan'),
    gst: getV('c_gst'),
    address: getV('c_addr') || 'Hyderabad Industrial Area',
    signatoryName: getV('c_sig_name'),
    signatoryDesig: getV('c_sig_desig'),
    signatoryPhone: getV('c_sig_phone'),
    signatoryEmail: getV('c_sig_email'),
    factoryAddress: getV('c_factory_addr') || getV('c_addr'),
    deliveryAddress: getV('c_delivery_addr') || getV('c_addr'),
    procName: getV('c_proc_name'),
    procEmail: getV('c_proc_email'),
    procPhone: getV('c_proc_phone'),
    finName: getV('c_fin_name'),
    finEmail: getV('c_fin_email'),
    finPhone: getV('c_fin_phone'),
    qcName: getV('c_qc_name'),
    qcEmail: getV('c_qc_email'),
    qcPhone: getV('c_qc_phone'),
    sector: getV('c_sector') || 'Railways & Rolling Stock',
    product: getV('c_prod') || 'Precision Components',
    turnover: getV('c_turnover'),
    bankName: getV('c_bank_name'),
    bankBranch: getV('c_bank_branch'),
    bankAcc: getV('c_bank_acc'),
    bankType: getV('c_bank_type'),
    bankIfsc: getV('c_bank_ifsc'),
    reqCreditTier: getV('c_credit_tier_val') || '15 to 30 Day Credit',
    reqCreditLimit: getV('c_req_limit') || '₹ 25,00,000',
    msmeType: getV('c_msme_type'),
    udyamNo: getV('c_udyam_no'),
    phone: getV('c_sig_phone') || getV('c_proc_phone') || '+91 98490 12345',
    email: getV('c_proc_email') || getV('c_sig_email') || 'procurement@company.com',
    status: 'PENDING',
    creditTier: 'Under Audit Review',
    creditLimit: 'Pending Sanction',
    attachedDocs: Array.from(attachedDocs)
  };

  db.customers.push(newCust);
  save();

  // Hide registration wizard and select new customer
  document.getElementById('custReg').classList.add('hidden');
  buildSelects();
  const sel = document.getElementById('custSelector');
  if (sel) sel.value = newCid;
  loadCustDash();

  showToast(`Application for ${name} submitted to Customer Audit team! (ID: ${newCid})`);
}

function loadCustDash() {
  let cid = document.getElementById('custSelector').value;
  document.getElementById('custReg').classList.add('hidden');
  document.getElementById('custDash').classList.add('hidden');
  if (!cid) return;
  let c = db.customers.find(x => x.id === cid);
  if (!c) return;

  document.getElementById('custBadge').innerHTML = `<span class="badge badge-${c.status === 'APPROVED' ? 'approved' : 'pending'}">${c.status}</span> <span class="badge badge-tier">${c.creditTier || 'Cash/Advance'}</span>`;
  if (c.status === 'APPROVED') {
    document.getElementById('custDash').classList.remove('hidden');
    renderCustProjects(c.id);
  }
}

function custSubmitDwg() {
  let simDrawings = [
    {
      dwgNo: 'DWG-A101',
      proc: 'CNC LASER CUTTING, CNC MILLING',
      qty: 25,
      material: 'Mild Steel',
      rawScope: 'Vendor',
      mfgScope: 'Vendor',
      finScope: 'Vendor',
      processes: [
        { stageId: 1, name: 'CNC LASER CUTTING', topVendors: ['V-201 (BNR Precision)'], quotes: [{ vid: 'V-201 (BNR Precision)', cost: 12500, time: 3 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' },
        { stageId: 2, name: 'CNC MILLING', topVendors: ['V-201 (BNR Precision)', 'V-202 (Apex)'], quotes: [{ vid: 'V-201 (BNR Precision)', cost: 28000, time: 5 }, { vid: 'V-202 (Apex)', cost: 31000, time: 4 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' }
      ]
    },
    {
      dwgNo: 'DWG-B202',
      proc: 'CNC LASER CUTTING, CNC BENDING',
      qty: 50,
      material: 'Aluminum 6061-T6',
      rawScope: 'Vendor',
      mfgScope: 'Vendor',
      finScope: 'Vendor',
      processes: [
        { stageId: 1, name: 'CNC LASER CUTTING', topVendors: ['V-201 (BNR Precision)'], quotes: [{ vid: 'V-201 (BNR Precision)', cost: 18000, time: 2 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' },
        { stageId: 2, name: 'CNC BENDING', topVendors: ['V-201 (BNR Precision)'], quotes: [{ vid: 'V-201 (BNR Precision)', cost: 14000, time: 3 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' }
      ]
    }
  ];

  const pid = getUID('PRJ');
  savedProjId = pid;

  db.projects.push({
    id: pid,
    cust: document.getElementById('custSelector').value,
    status: 'AI_EXTRACTED_PENDING_VAL',
    searchLoc: 'Hyderabad',
    searchRad: document.getElementById('c_rad') ? document.getElementById('c_rad').value : 50,
    files: 'DWG-A101.pdf, DWG-B202.pdf',
    bom: 'Master_BOM.xlsx',
    drawings: simDrawings
  });
  save();
  showToast(`Engineering drawings uploaded! AI DFM analysis finished. Assigned project ID ${pid}.`);
}

function handleCustScopeChange(pid, dIdx, pIdx, field, val) {
  let p = db.projects.find(x => x.id === pid);
  if (!p) return;
  let procList = p.drawings[dIdx].processes;
  procList[pIdx][field] = val;
  if (field === 'mfgScope' && pIdx === 0 && procList.length > 1) {
    procList[1]['rawScope'] = val; // Downstream lock
  }
  save();
}

function custSubmitScopes(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'AI_VENDOR_SEARCH_PENDING';
    save();
    showToast('Scopes confirmed! Sent to Vendor Validator for AI Machine Matching.');
  }
}

function custConfirmVendors(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (!p) return;
  let allSelected = true;
  p.drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
    let sel = document.getElementById(`vsel_${pid}_${dIdx}_${pIdx}`);
    if (sel && sel.value) {
      proc.selectedVendor = sel.value;
    } else {
      allSelected = false;
    }
  }));

  if (!allSelected) {
    alert('Please select a vendor for every process stage!');
    return;
  }

  p.status = 'CUST_SELECTED_VEND_PENDING';
  save();
  showToast('Vendor selections confirmed! Sent to Vendor Validator for PO release.');
}

function custApproveDelivery(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.custDeliveryAddress = 'Plot 42, Medha Tech Park, Hyderabad';
    p.status = 'PENDING_LOGISTICS_FEE';
    save();
    showToast('Delivery approved! Sent to Logistics for freight calculation.');
  }
}

function custPayFinal(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.custPaymentStatus = 'PAID';
    p.status = 'PAYMENT_COMPLETED_PENDING_DISPATCH';
    save();
    showToast('Final payment cleared! Order released for shipping.');
  }
}

function renderCustProjects(cid) {
  let html = '';
  const myProjects = db.projects.filter(p => p.cust === cid).reverse();
  if (myProjects.length === 0) {
    html = `<div class="card"><p class="subtitle">No engineering projects submitted yet. Use the card above to upload drawings.</p></div>`;
  } else {
    myProjects.forEach(p => {
      html += `
      <div class="card" id="cust-proj-card-${p.id}">
        <div class="flex-between">
          <h4>Project: ${p.id}</h4>
          <span class="badge badge-pending">${p.status.replace(/_/g, ' ')}</span>
        </div>`;

      // Live Stepper
      html += `
      <div class="stepper-container">
        <div class="step-node ${['AI_EXTRACTED_PENDING_VAL', 'PROCESS_VAL_ASSIGNED'].includes(p.status) ? 'active' : 'completed'}">
          <div class="step-icon">1</div>
          <div class="step-label">AI DFM</div>
        </div>
        <div class="step-node ${p.status === 'CUSTOMER_SCOPE_PENDING' ? 'active' : (['AI_VENDOR_SEARCH_PENDING', 'VEND_VAL_AI_ASSIGNED', 'PENDING_VENDOR_QUOTES', 'QUOTES_RECEIVED_PENDING', 'VEND_VAL_QUOTES_ASSIGNED', 'CUSTOMER_FINAL_SELECTION', 'CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED', 'PO_SENT_TO_VENDOR', 'PO_ACCEPTED_VENDOR', 'DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION', 'PENDING_CUST_DELIVERY_APPROVAL', 'PENDING_LOGISTICS_FEE', 'PENDING_CUST_PAYMENT', 'PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'].includes(p.status) ? 'completed' : '')}">
          <div class="step-icon">2</div>
          <div class="step-label">Scoping</div>
        </div>
        <div class="step-node ${p.status === 'CUSTOMER_FINAL_SELECTION' ? 'active' : (['CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED', 'PO_SENT_TO_VENDOR', 'PO_ACCEPTED_VENDOR', 'DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION', 'PENDING_CUST_DELIVERY_APPROVAL', 'PENDING_LOGISTICS_FEE', 'PENDING_CUST_PAYMENT', 'PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'].includes(p.status) ? 'completed' : '')}">
          <div class="step-icon">3</div>
          <div class="step-label">Vendor Quote</div>
        </div>
        <div class="step-node ${['PO_ACCEPTED_VENDOR', 'DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION'].includes(p.status) ? 'active' : (['PENDING_CUST_DELIVERY_APPROVAL', 'PENDING_LOGISTICS_FEE', 'PENDING_CUST_PAYMENT', 'PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'].includes(p.status) ? 'completed' : '')}">
          <div class="step-icon">4</div>
          <div class="step-label">Production & QA</div>
        </div>
        <div class="step-node ${p.status === 'DISPATCHED_TO_CUST' ? 'completed' : (['PENDING_CUST_PAYMENT', 'PAYMENT_COMPLETED_PENDING_DISPATCH'].includes(p.status) ? 'active' : '')}">
          <div class="step-icon">5</div>
          <div class="step-label">Delivered</div>
        </div>
      </div>`;

      if (p.status === 'CUSTOMER_SCOPE_PENDING') {
        html += `
        <p style="margin-top:0.5rem;" class="subtitle">Select scopes. Stage 2 Raw Material scope is automatically locked by Stage 1 Manufacturing scope.</p>
        <div class="table-responsive">
          <table>
            <thead><tr><th>Drawing</th><th>Process Stage</th><th>Raw Material</th><th>Manufacturing</th><th>Finishing</th></tr></thead>
            <tbody>`;
        p.drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
          let rmDisabled = (pIdx > 0) ? 'disabled' : '';
          html += `
          <tr>
            <td><strong>${d.dwgNo}</strong></td>
            <td><span class="badge badge-process">Stage ${proc.stageId}: ${proc.name}</span></td>
            <td><select id="scope_${p.id}_${dIdx}_${pIdx}_raw" onchange="handleCustScopeChange('${p.id}',${dIdx},${pIdx},'rawScope',this.value)" ${rmDisabled}><option value="Vendor" ${proc.rawScope === 'Vendor' ? 'selected' : ''}>Vendor Supplied</option><option value="In-House" ${proc.rawScope === 'In-House' ? 'selected' : ''}>In-House Customer</option></select></td>
            <td><select id="scope_${p.id}_${dIdx}_${pIdx}_mfg" onchange="handleCustScopeChange('${p.id}',${dIdx},${pIdx},'mfgScope',this.value)"><option value="Vendor" ${proc.mfgScope === 'Vendor' ? 'selected' : ''}>Vendor Supplied</option><option value="In-House" ${proc.mfgScope === 'In-House' ? 'selected' : ''}>In-House Customer</option></select></td>
            <td><select id="scope_${p.id}_${dIdx}_${pIdx}_fin" onchange="handleCustScopeChange('${p.id}',${dIdx},${pIdx},'finScope',this.value)"><option value="Vendor" ${proc.finScope === 'Vendor' ? 'selected' : ''}>Vendor Supplied</option><option value="In-House" ${proc.finScope === 'In-House' ? 'selected' : ''}>In-House Customer</option></select></td>
          </tr>`;
        }));
        html += `</tbody></table></div><button class="btn btn-success" id="btn_cust_scope_${p.id}" style="margin-top:1rem;" onclick="custSubmitScopes('${p.id}')">Confirm Scopes & Dispatch RFQ</button>`;
      }

      if (p.status === 'CUSTOMER_FINAL_SELECTION') {
        html += `<p style="margin-top:0.5rem; font-weight:bold;">Select Vendor per Process Stage (Costs include 5% Platform Margin):</p>`;
        p.drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
          html += `
          <div class="inner-panel" style="margin-top:0.75rem;">
            <strong>${d.dwgNo} - Stage ${proc.stageId}: ${proc.name}</strong>
            <select id="vsel_${p.id}_${dIdx}_${pIdx}" style="margin-top:0.4rem;">
              <option value="">Select Vendor Quote...</option>
              ${proc.quotes.map(q => `<option value="${q.vid}">${q.vid} - ₹${Math.round(q.cost * 1.05)} (${q.time} Days)</option>`).join('')}
            </select>
          </div>`;
        }));
        html += `<button class="btn btn-success" id="btn_cust_confirm_v_${p.id}" style="margin-top:1rem;" onclick="custConfirmVendors('${p.id}')">Confirm Selections & Authorize PO</button>`;
      }

      if (p.status === 'PENDING_CUST_DELIVERY_APPROVAL') {
        html += `
        <div class="alert alert-success">QA Passed! Materials match drawing specs. Click below to approve final delivery address.</div>
        <button class="btn btn-success" id="btn_cust_appr_del_${p.id}" onclick="custApproveDelivery('${p.id}')">Approve Delivery & Request Freight Fee</button>`;
      }

      if (p.status === 'PENDING_CUST_PAYMENT') {
        html += `
        <div class="alert alert-warn">Final Invoice Ready. Freight & Delivery Fee: ₹${p.logisticsFee || 4500}</div>
        <button class="btn btn-success" id="btn_cust_pay_${p.id}" onclick="custPayFinal('${p.id}')">Pay Final Balance (Credit Term / Cheque)</button>`;
      }

      html += `</div>`;
    });
  }
  document.getElementById('custProjects').innerHTML = html;
}

// --------------------------------------------------------------------------
// Vendor Portal Engine
// --------------------------------------------------------------------------
function showVendReg() {
  document.getElementById('vendReg').classList.remove('hidden');
}

function demoVend() {
  document.getElementById('v_name').value = 'Apex Machining Works';
  document.getElementById('v_loc').value = 'Cherlapally, Hyderabad';
  document.getElementById('v_phone').value = '+91 91234 56789';
  document.getElementById('v_email').value = 'contact@apexworks.com';
  document.getElementById('v_m1_name').value = 'Doosan Lynx 220 LCNC';
  document.getElementById('v_m1_proc').value = 'CNC TURNING';
  document.getElementById('v_m1_size').value = 'Ø300 x 510 mm';
  document.getElementById('v_m1_axis').value = '2-Axis Turning';
  document.getElementById('v_m1_mat').value = 'SS 304, MS, Brass';
  document.getElementById('v_m1_rate').value = 1500;
}

function regVend() {
  const name = document.getElementById('v_name').value;
  if (!name) { alert('Please enter facility name!'); return; }

  const m1 = {
    id: getUID('M'),
    name: document.getElementById('v_m1_name').value || 'Laser Cutter',
    process: document.getElementById('v_m1_proc').value || 'CNC LASER CUTTING',
    size: document.getElementById('v_m1_size').value || '2000x3000 mm',
    axis: document.getElementById('v_m1_axis').value || '2D Laser',
    materials: document.getElementById('v_m1_mat').value || 'MS, SS',
    rate: Number(document.getElementById('v_m1_rate').value) || 2000,
    status: 'Idle',
    audit: 'APPROVED'
  };

  db.vendors.push({
    id: getUID('V'),
    name: name,
    location: document.getElementById('v_loc').value,
    phone: document.getElementById('v_phone').value,
    email: document.getElementById('v_email').value,
    status: 'PENDING',
    rating: 4,
    machines: [m1]
  });
  save();
  document.getElementById('vendReg').classList.add('hidden');
  showToast('Supplier registration & machine details submitted to Vendor Audit team!');
}

function loadVendDash() {
  let vid = document.getElementById('vendSelector').value;
  document.getElementById('vendReg').classList.add('hidden');
  document.getElementById('vendDash').classList.add('hidden');
  if (!vid) return;
  let v = db.vendors.find(x => x.id === vid);
  if (!v) return;

  document.getElementById('vendBadge').innerHTML = `<span class="badge badge-${v.status === 'APPROVED' ? 'approved' : 'pending'}">${v.status}</span> <span class="badge badge-process">${v.rating || 5} Stars</span>`;
  if (v.status === 'APPROVED') {
    document.getElementById('vendDash').classList.remove('hidden');
    renderVendMachines(v);
    renderVendRFQs(v);
    renderVendPOs(v);
  }
}

function renderVendMachines(v) {
  let html = v.machines.map(m => `
    <div class="machine-block flex-between">
      <div>
        <strong>${m.name}</strong> (${m.process})<br>
        <small class="text-muted">Size: ${m.size} | Axis: ${m.axis} | Mat: ${m.materials} | Rate: ₹${m.rate}/hr</small>
      </div>
      <div>
        <select onchange="updateMachineStatus('${v.id}', '${m.id}', this.value)" style="width:140px;">
          <option value="Idle" ${m.status === 'Idle' ? 'selected' : ''}>Idle (Ready)</option>
          <option value="Under Load" ${m.status === 'Under Load' ? 'selected' : ''}>Under Load</option>
          <option value="Maintenance" ${m.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
        </select>
      </div>
    </div>`).join('');
  document.getElementById('vendMachines').innerHTML = html;
}

function updateMachineStatus(vid, mid, newStatus) {
  let v = db.vendors.find(x => x.id === vid);
  if (v) {
    let m = v.machines.find(x => x.id === mid);
    if (m) {
      m.status = newStatus;
      save();
      showToast(`Machine ${m.name} status updated to ${newStatus}`);
    }
  }
}

function renderVendRFQs(v) {
  let rfqs = db.projects.filter(p => p.status === 'PENDING_VENDOR_QUOTES');
  let html = '';
  if (rfqs.length === 0) {
    html = `<p class="subtitle">No open RFQs assigned to your facility.</p>`;
  } else {
    rfqs.forEach(p => {
      html += `
      <div class="card" id="vend-rfq-card-${p.id}">
        <div class="flex-between">
          <h4>RFQ Project: ${p.id}</h4>
          <button class="btn btn-sm btn-outline" id="btn_v_view_${p.id}" onclick="openViewer('${p.id}')">View Drawings</button>
        </div>
        <div class="grid-2" style="margin:0.75rem 0;">
          ${p.drawings.map(d => `<div><strong>${d.dwgNo}</strong> (Qty: ${d.qty})<br><small class="text-muted">${d.proc}</small></div>`).join('')}
        </div>
        <button class="btn btn-success" id="btn_v_submit_bid_${p.id}" onclick="vendSubmitBid('${p.id}', '${v.id}')">Submit Bid (₹25,000 / 3 Days)</button>
      </div>`;
    });
  }
  document.getElementById('vendRFQs').innerHTML = html;
}

function vendSubmitBid(pid, vid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.drawings.forEach(d => d.processes.forEach(proc => {
      if (!proc.quotes.some(q => q.vid.includes(vid))) {
        proc.quotes.push({ vid: `${vid} (${db.vendors.find(x => x.id === vid).name})`, cost: 25000, time: 3 });
      }
    }));
    p.status = 'QUOTES_RECEIVED_PENDING';
    save();
    showToast(`Bid submitted for ${pid}! Sent to Vendor Validator for margin audit.`);
  }
}

function renderVendPOs(v) {
  let pos = db.projects.filter(p => p.status === 'PO_SENT_TO_VENDOR' || p.status === 'PO_ACCEPTED_VENDOR' || p.status === 'DISPATCH_REQUESTED');
  let html = '';
  if (pos.length === 0) {
    html = `<p class="subtitle">No active production orders.</p>`;
  } else {
    pos.forEach(p => {
      html += `
      <div class="card" id="vend-po-card-${p.id}">
        <div class="flex-between">
          <h4>Production Order: ${p.id}</h4>
          <span class="badge badge-approved">${p.status.replace(/_/g, ' ')}</span>
        </div>
        <p class="subtitle" style="margin:0.5rem 0;">Drawings: ${p.files}</p>`;

      if (p.status === 'PO_SENT_TO_VENDOR') {
        html += `<button class="btn btn-success" id="btn_v_acc_po_${p.id}" onclick="vendAcceptPO('${p.id}')">Accept PO & Begin Production</button>`;
      }
      if (p.status === 'PO_ACCEPTED_VENDOR') {
        html += `<button class="btn btn-success" id="btn_v_req_disp_${p.id}" onclick="vendReqDispatch('${p.id}')">Production Completed - Request Logistics Pickup</button>`;
      }
      if (p.status === 'DISPATCH_REQUESTED') {
        html += `<div class="alert alert-info">Logistics team notified for pickup coordination.</div>`;
      }
      html += `</div>`;
    });
  }
  document.getElementById('vendPOs').innerHTML = html;
}

function vendAcceptPO(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'PO_ACCEPTED_VENDOR';
    save();
    showToast(`PO accepted! Production started for Project ${pid}.`);
  }
}

function vendReqDispatch(pid) {
  let p = db.projects.find(x => x.id === pid);
  if (p) {
    p.status = 'DISPATCH_REQUESTED';
    save();
    showToast(`Pickup request sent to ITTOX Logistics!`);
  }
}

// --------------------------------------------------------------------------
// 3D CAD Viewer Simulation Engine
// --------------------------------------------------------------------------
let canvasAnimId = null;
let rotationAngle = 0;

function openViewer(pid) {
  document.getElementById('viewerModal').classList.remove('hidden');
  initCADCanvas();
}

function closeViewer() {
  document.getElementById('viewerModal').classList.add('hidden');
  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
}

function initCADCanvas() {
  const canvas = document.getElementById('cadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    rotationAngle += 0.015;

    // 3D Wireframe Cube / Precision Part Simulation
    const size = 90;
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);

    const nodes = [
      [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
      [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
    ];

    const projected = nodes.map(node => {
      let x = node[0] * cos - node[2] * sin;
      let z = node[0] * sin + node[2] * cos;
      let y = node[1];
      const scale = 250 / (250 + z);
      return [x * scale, y * scale];
    });

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    // Draw Edges
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;

    edges.forEach(edge => {
      const p1 = projected[edge[0]];
      const p2 = projected[edge[1]];
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    });

    // Draw Center Axis
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, 0); ctx.stroke();
    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); ctx.stroke();

    ctx.restore();

    // Overlay Specs
    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px Inter';
    ctx.fillText('CAD SCHEMATIC: DWG-A101 (Multi-Stage Assembly)', 15, 25);
    ctx.fillStyle = '#00f2fe';
    ctx.fillText('Material: SS 316L | DFM Status: PASS (±0.02mm)', 15, 45);

    canvasAnimId = requestAnimationFrame(draw);
  }

  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
  draw();
}

// --------------------------------------------------------------------------
// Automated Interactive Presenter Bot & Timeline System
// --------------------------------------------------------------------------
const DEMO_STEPS = [
  { id: 'step-0', title: '1. Ecosystem Home', desc: 'Welcome to ITTOX ITTOVA - Autonomous Precision Sourcing Platform inspired by Xometry.', view: 'home', action: () => nav('home') },
  { id: 'step-1', title: '2. Register Customer', desc: 'Customer submits company KYC & requests credit terms (15-30 days).', view: 'customer', action: () => { nav('customer'); showCustReg(); demoCust(); } },
  { id: 'step-2', title: '3. Audit Customer', desc: 'Customer Audit Team reviews financials & approves credit limit.', view: 'staff', action: () => { nav('staff'); document.getElementById('staffSelector').value = 'S-5'; loadStaffDash(); } },
  { id: 'step-3', title: '4. Upload Drawings', desc: 'Customer uploads CAD drawings (DWG-A101 & DWG-B202) + BOM for AI DFM analysis.', view: 'customer', action: () => { nav('customer'); document.getElementById('custSelector').value = 'C-101'; loadCustDash(); custSubmitDwg(); } },
  { id: 'step-4', title: '5. Validate CAD Specs', desc: 'Process Validator inspects drawings & verifies extracted process stages.', view: 'staff', action: () => { nav('staff'); document.getElementById('staffSelector').value = 'S-1'; loadStaffDash(); } },
  { id: 'step-5', title: '6. Select Scopes', desc: 'Customer configures Raw Material, Mfg, and Finishing scopes.', view: 'customer', action: () => { nav('customer'); document.getElementById('custSelector').value = 'C-101'; loadCustDash(); } },
  { id: 'step-6', title: '7. Register Supplier', desc: 'New Vendor registers laser cutting & CNC bending machinery.', view: 'vendor', action: () => { nav('vendor'); showVendReg(); demoVend(); } },
  { id: 'step-7', title: '8. Audit Supplier', desc: 'Vendor Audit Team verifies factory test reports & assigns 5-Star rating.', view: 'staff', action: () => { nav('staff'); document.getElementById('staffSelector').value = 'S-6'; loadStaffDash(); } },
  { id: 'step-8', title: '9. AI Machine Matching', desc: 'Vendor Validator authorizes AI supplier routing in 50km radius.', view: 'staff', action: () => { nav('staff'); document.getElementById('staffSelector').value = 'S-2'; loadStaffDash(); } },
  { id: 'step-9', title: '10. Submit Vendor Bid', desc: 'Supplier reviews RFQ and submits pricing bid.', view: 'vendor', action: () => { nav('vendor'); document.getElementById('vendSelector').value = 'V-201'; loadVendDash(); } },
  { id: 'step-10', title: '11. Audit Margin & Quote', desc: 'Vendor Validator audits bids & applies 5% platform margin.', view: 'staff', action: () => { nav('staff'); document.getElementById('staffSelector').value = 'S-2'; loadStaffDash(); } },
  { id: 'step-11', title: '12. Accept Quote & PO', desc: 'Customer selects optimal vendor quotes and confirms PO.', view: 'customer', action: () => { nav('customer'); document.getElementById('custSelector').value = 'C-101'; loadCustDash(); } },
  { id: 'step-12', title: '13. Production & QA', desc: 'Supplier manufactures parts. Warehouse Inspector runs CMM QA check.', view: 'staff', action: () => { nav('staff'); document.getElementById('staffSelector').value = 'S-3'; loadStaffDash(); } },
  { id: 'step-13', title: '14. Dispatch & Payout', desc: 'Logistics delivers order to Customer. Admin approves supplier payout.', view: 'admin', action: () => { nav('admin'); document.getElementById('adminUser').value = 'DDD'; document.getElementById('adminPass').value = '123'; loginAdmin(); } }
];

let currentStepIndex = 0;
let isPlaying = false;
let autoPlayTimer = null;

function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  container.innerHTML = DEMO_STEPS.map((step, idx) => `
    <div class="timeline-step ${idx === currentStepIndex ? 'active' : (idx < currentStepIndex ? 'completed' : '')}" onclick="jumpToDemoStep(${idx})">
      ${step.title}
    </div>`).join('');
}

function updateDemoCaption() {
  const step = DEMO_STEPS[currentStepIndex];
  const cap = document.getElementById('demo-caption');
  if (cap) {
    cap.innerHTML = `<strong>${step.title}:</strong> ${step.desc}`;
  }
  renderTimeline();
}

function jumpToDemoStep(idx) {
  currentStepIndex = idx;
  const step = DEMO_STEPS[currentStepIndex];
  step.action();
  updateDemoCaption();
  simulateCursorClick();
}

function nextDemoStep() {
  if (currentStepIndex < DEMO_STEPS.length - 1) {
    jumpToDemoStep(currentStepIndex + 1);
  } else {
    togglePlay(false);
    showToast('Demo presentation completed!');
  }
}

function togglePlay(play) {
  isPlaying = play;
  const playBtn = document.getElementById('btn-demo-play');
  const pauseBtn = document.getElementById('btn-demo-pause');

  if (isPlaying) {
    if (playBtn) playBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';
    autoPlayTimer = setInterval(() => {
      nextDemoStep();
    }, 4500);
  } else {
    if (playBtn) playBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }
}

function simulateCursorClick() {
  const cursor = document.getElementById('sim-cursor');
  if (!cursor) return;
  cursor.style.display = 'block';

  const x = Math.floor(200 + Math.random() * (window.innerWidth - 400));
  const y = Math.floor(150 + Math.random() * (window.innerHeight - 300));

  cursor.style.transform = `translate(${x}px, ${y}px)`;

  setTimeout(() => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }, 1200);
}

// --------------------------------------------------------------------------
// Toast System
// --------------------------------------------------------------------------
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  renderTimeline();
  updateDemoCaption();
});
