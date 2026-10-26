import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logEvent } from '../db/events.js';
import { processCustomerPayment, processVendorPayout } from '../services/payment-settlement.service.js';

const router = Router();

async function newProjectId(pool) {
  for (let i = 0; i < 5; i++) {
    const candidate = `PRJ-${randomInt(100000, 999999)}`;
    const check = await pool.query('SELECT 1 FROM projects WHERE id = $1', [candidate]);
    if (check.rowCount === 0) return candidate;
  }
  return `PRJ-${Date.now().toString().slice(-6)}${randomInt(10, 99)}`;
}

function toApiShape(row, user = null, vendorId = null) {
  const base = {
    id: row.id,
    cust: row.customer_id,
    status: row.status,
    searchLoc: row.search_location,
    searchRad: row.search_radius_km,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...row.payload
  };

  // Closed vendor tenders: strictly sanitize competing suppliers' bids, identities, and vendor routing
  if (user?.role === 'supplier') {
    const needle = vendorId ? `${vendorId} (` : null;
    const drawings = JSON.parse(JSON.stringify(base.drawings || []));
    drawings.forEach((drawing) => {
      (drawing.processes || []).forEach((process) => {
        // Redact competing quotes: supplier ONLY sees their own bid
        process.quotes = needle
          ? (process.quotes || []).filter((q) => (q.vid || '').startsWith(needle))
          : [];

        // Redact competitor matches in topVendors
        delete process.topVendors;

        // Redact competitor selectedVendor identity: if this vendor isn't the selected one, redact it
        if (process.selectedVendor && (!needle || !process.selectedVendor.startsWith(needle))) {
          process.selectedVendor = null;
        }
      });
    });
    base.drawings = drawings;
  }

  return base;
}

async function getOwnCustomer(pool, accountId) {
  const result = await pool.query('SELECT id, status FROM customers WHERE account_id = $1', [accountId]);
  return result.rows[0] || null;
}

async function getOwnCustomerId(pool, accountId) {
  const customer = await getOwnCustomer(pool, accountId);
  return customer?.id || null;
}

async function getOwnVendor(pool, accountId) {
  const result = await pool.query('SELECT id, name, status FROM vendors WHERE account_id = $1', [accountId]);
  return result.rows[0] || null;
}

async function getOwnVendorId(pool, accountId) {
  const vendor = await getOwnVendor(pool, accountId);
  return vendor?.id || null;
}

// True if this vendor already appears in any process's quotes or selectedVendor,
// across all drawings -- vendors need to keep seeing a project after they've
// bid or been picked, not just while it's an open RFQ.
function vendorInvolved(payload, vendorId) {
  if (!vendorId || !Array.isArray(payload?.drawings)) return false;
  const needle = `${vendorId} (`;
  return payload.drawings.some((drawing) =>
    (drawing.processes || []).some((process) =>
      (process.selectedVendor || '').startsWith(needle) ||
      (process.quotes || []).some((quote) => (quote.vid || '').startsWith(needle))
    )
  );
}

function isSelectedVendor(payload, vendorId) {
  if (!vendorId || !Array.isArray(payload?.drawings)) return false;
  const needle = `${vendorId} (`;
  return payload.drawings.some((drawing) =>
    (drawing.processes || []).some((process) =>
      (process.selectedVendor || '').startsWith(needle)
    )
  );
}

const OPEN_RFQ_STATUSES = ['PENDING_VENDOR_QUOTES', 'VEND_VAL_QUOTES_ASSIGNED'];

async function loadProjectForUser(pool, id, user) {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  if (result.rowCount === 0) return { row: null, allowed: false };
  const row = result.rows[0];

  if (['staff', 'admin'].includes(user.role)) return { row, allowed: true };

  if (user.role === 'customer') {
    const customerId = await getOwnCustomerId(pool, user.accountId);
    return { row, allowed: customerId != null && customerId === row.customer_id };
  }

  if (user.role === 'supplier') {
    const vendorId = await getOwnVendorId(pool, user.accountId);
    const allowed = OPEN_RFQ_STATUSES.includes(row.status) || vendorInvolved(row.payload, vendorId);
    return { row, allowed };
  }

  return { row, allowed: false };
}

// Generic status/payload transition + audit log with pre-condition status validation.
async function transition(pool, id, { status, payloadPatch = {}, actorId, eventType, allowedPreStatuses = null }) {
  const before = await pool.query('SELECT status FROM projects WHERE id = $1', [id]);
  if (before.rowCount === 0) return { error: 'not_found' };

  const currentStatus = before.rows[0].status;
  if (allowedPreStatuses && !allowedPreStatuses.includes(currentStatus)) {
    return {
      error: 'invalid_status',
      currentStatus,
      allowed: allowedPreStatuses
    };
  }

  const result = await pool.query(
    `UPDATE projects
     SET status = COALESCE($2, status), payload = payload || $3::jsonb, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, status || null, JSON.stringify(payloadPatch)]
  );

  const row = result.rows[0];
  await logEvent({
    projectId: id,
    actorId,
    eventType,
    fromStatus: currentStatus,
    toStatus: row.status,
    details: payloadPatch
  });
  return { row };
}

function simpleTransition(path, {
  role,
  status,
  eventType,
  allowedPreStatuses = null,
  requireSelectedVendor = false,
  buildPatch = () => ({})
}) {
  router.post(path, requireAuth, requireRole(...role), async (request, response) => {
    const pool = getPool();
    const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
    if (!row) return response.status(404).json({ error: 'Project not found.' });
    if (!allowed) return response.status(403).json({ error: 'Not permitted to access this project.' });

    if (request.user.role === 'customer') {
      const customer = await getOwnCustomer(pool, request.user.accountId);
      if (!customer || customer.id !== row.customer_id) {
        return response.status(403).json({ error: 'Only the project owner can perform this action.' });
      }
    }

    if (requireSelectedVendor && request.user.role === 'supplier') {
      const vendor = await getOwnVendor(pool, request.user.accountId);
      if (!vendor || vendor.status !== 'APPROVED') {
        return response.status(403).json({ error: 'Supplier must be approved to perform this action.' });
      }
      if (!isSelectedVendor(row.payload, vendor.id)) {
        return response.status(403).json({ error: 'Only the selected supplier for this project can perform this action.' });
      }
    }

    const patch = buildPatch(request.body || {});
    const result = await transition(pool, request.params.id, {
      status,
      payloadPatch: patch,
      actorId: request.user.accountId,
      eventType,
      allowedPreStatuses
    });

    if (result.error === 'not_found') {
      return response.status(404).json({ error: 'Project not found.' });
    }
    if (result.error === 'invalid_status') {
      return response.status(409).json({
        error: `Cannot transition project from status '${result.currentStatus}'. Expected: ${result.allowed.join(', ')}.`
      });
    }

    const vendorId = request.user.role === 'supplier' ? await getOwnVendorId(pool, request.user.accountId) : null;
    response.json(toApiShape(result.row, request.user, vendorId));
  });
}

// --- Create & read ---------------------------------------------------------

// Customer submits drawings for a new project. Requires an approved customer account.
router.post('/', requireAuth, requireRole('customer'), async (request, response) => {
  const pool = getPool();
  const customer = await getOwnCustomer(pool, request.user.accountId);
  if (!customer) {
    return response.status(409).json({ error: 'Create a customer profile before submitting a project.' });
  }
  if (customer.status !== 'APPROVED') {
    return response.status(403).json({ error: 'Customer account must be verified and approved before creating projects.' });
  }

  const { searchLoc = 'Hyderabad', searchRad = 50, drawings = [], files = '', bom = '' } = request.body || {};
  const id = await newProjectId(pool);

  const inserted = await pool.query(
    `INSERT INTO projects (id, customer_id, created_by, status, search_location, search_radius_km, payload)
     VALUES ($1, $2, $3, 'AI_EXTRACTED_PENDING_VAL', $4, $5, $6)
     RETURNING *`,
    [id, customer.id, request.user.accountId, searchLoc, searchRad, JSON.stringify({ drawings, files, bom })]
  );

  await logEvent({
    projectId: id,
    actorId: request.user.accountId,
    eventType: 'project_created',
    toStatus: 'AI_EXTRACTED_PENDING_VAL'
  });

  response.status(201).json(toApiShape(inserted.rows[0], request.user));
});

router.get('/', requireAuth, async (request, response) => {
  const pool = getPool();

  if (['staff', 'admin'].includes(request.user.role)) {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return response.json(result.rows.map((r) => toApiShape(r, request.user)));
  }

  if (request.user.role === 'customer') {
    const customerId = await getOwnCustomerId(pool, request.user.accountId);
    const result = customerId
      ? await pool.query('SELECT * FROM projects WHERE customer_id = $1 ORDER BY created_at DESC', [customerId])
      : { rows: [] };
    return response.json(result.rows.map((r) => toApiShape(r, request.user)));
  }

  if (request.user.role === 'supplier') {
    const vendorId = await getOwnVendorId(pool, request.user.accountId);
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    const visible = result.rows.filter((row) => OPEN_RFQ_STATUSES.includes(row.status) || vendorInvolved(row.payload, vendorId));
    return response.json(visible.map((r) => toApiShape(r, request.user, vendorId)));
  }

  response.json([]);
});

router.get('/:id', requireAuth, async (request, response) => {
  const pool = getPool();
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });
  const vendorId = request.user.role === 'supplier' ? await getOwnVendorId(pool, request.user.accountId) : null;
  response.json(toApiShape(row, request.user, vendorId));
});

// --- Customer scoping & selection ------------------------------------------

// Edits one process's scope field (e.g. rawScope/mfgScope/finScope).
// Restricted to customer owner in CUSTOMER_SCOPE_PENDING stage, or staff/admin.
router.patch('/:id/scope', requireAuth, requireRole('customer', 'staff', 'admin'), async (request, response) => {
  const { dIdx, pIdx, field, value } = request.body || {};
  if (dIdx == null || pIdx == null || !field) {
    return response.status(400).json({ error: 'dIdx, pIdx, and field are required.' });
  }

  const pool = getPool();
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });

  if (request.user.role === 'customer') {
    const customer = await getOwnCustomer(pool, request.user.accountId);
    if (!customer || customer.id !== row.customer_id) {
      return response.status(403).json({ error: 'Only the project owner can modify scopes.' });
    }
    if (row.status !== 'CUSTOMER_SCOPE_PENDING') {
      return response.status(409).json({
        error: `Customer scope adjustments are only permitted in 'CUSTOMER_SCOPE_PENDING' (current status: '${row.status}').`
      });
    }
  }

  const drawings = JSON.parse(JSON.stringify(row.payload.drawings || []));
  if (!drawings[dIdx]?.processes?.[pIdx]) {
    return response.status(400).json({ error: 'No such drawing/process index.' });
  }
  drawings[dIdx].processes[pIdx][field] = value;
  if (field === 'mfgScope' && pIdx === 0 && drawings[dIdx].processes.length > 1) {
    drawings[dIdx].processes[1].rawScope = value;
  }

  const updated = await pool.query(
    `UPDATE projects SET payload = payload || $2::jsonb, updated_at = now() WHERE id = $1 RETURNING *`,
    [request.params.id, JSON.stringify({ drawings })]
  );

  await logEvent({
    projectId: request.params.id,
    actorId: request.user.accountId,
    eventType: 'scope_updated',
    fromStatus: row.status,
    toStatus: row.status,
    details: { dIdx, pIdx, field, value }
  });

  response.json(toApiShape(updated.rows[0]));
});

simpleTransition('/:id/confirm-scopes', {
  role: ['customer'],
  status: 'AI_VENDOR_SEARCH_PENDING',
  eventType: 'scopes_confirmed',
  allowedPreStatuses: ['CUSTOMER_SCOPE_PENDING']
});

// Customer picks a vendor per process stage: { selections: { "0_1": "V-1234 (Acme)" } }
router.post('/:id/select-vendors', requireAuth, requireRole('customer'), async (request, response) => {
  const { selections = {} } = request.body || {};
  const pool = getPool();
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });

  const customer = await getOwnCustomer(pool, request.user.accountId);
  if (!customer || customer.id !== row.customer_id) {
    return response.status(403).json({ error: 'Only the project owner can select vendors.' });
  }

  if (row.status !== 'CUSTOMER_FINAL_SELECTION') {
    return response.status(409).json({
      error: `Cannot select vendors when project is in status '${row.status}'. Expected 'CUSTOMER_FINAL_SELECTION'.`
    });
  }

  const drawings = JSON.parse(JSON.stringify(row.payload.drawings || []));
  drawings.forEach((drawing, dIdx) => {
    (drawing.processes || []).forEach((process, pIdx) => {
      const key = `${dIdx}_${pIdx}`;
      if (selections[key]) process.selectedVendor = selections[key];
    });
  });

  const result = await transition(pool, request.params.id, {
    status: 'CUST_SELECTED_VEND_PENDING',
    payloadPatch: { drawings },
    actorId: request.user.accountId,
    eventType: 'vendors_selected',
    allowedPreStatuses: ['CUSTOMER_FINAL_SELECTION']
  });

  if (result.error === 'invalid_status') {
    return response.status(409).json({
      error: `Cannot transition project from status '${result.currentStatus}'. Expected: ${result.allowed.join(', ')}.`
    });
  }

  response.json(toApiShape(result.row));
});

simpleTransition('/:id/approve-delivery', {
  role: ['customer'],
  status: 'PENDING_LOGISTICS_FEE',
  eventType: 'delivery_approved',
  allowedPreStatuses: ['PENDING_CUST_DELIVERY_APPROVAL'],
  buildPatch: (body) => ({ custDeliveryAddress: body.deliveryAddress || 'Central Customer Inward Receiving Dock' })
});

router.post('/:id/pay', requireAuth, requireRole('customer'), async (request, response) => {
  const pool = getPool();
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted to access this project.' });

  const customer = await getOwnCustomer(pool, request.user.accountId);
  if (!customer || customer.id !== row.customer_id) {
    return response.status(403).json({ error: 'Only the project owner can perform this action.' });
  }

  if (row.status !== 'PENDING_CUST_PAYMENT') {
    return response.status(409).json({
      error: `Cannot transition: project is in status ${row.status}. Expected PENDING_CUST_PAYMENT.`
    });
  }

  try {
    const { receipt, patch } = processCustomerPayment({
      project: row,
      customer,
      paymentDetails: request.body || {}
    });

    const result = await transition(pool, request.params.id, {
      status: 'PAYMENT_COMPLETED_PENDING_DISPATCH',
      payloadPatch: patch,
      actorId: request.user.accountId,
      eventType: 'final_payment_received',
      allowedPreStatuses: ['PENDING_CUST_PAYMENT']
    });

    if (result.error === 'invalid_status') {
      return response.status(409).json({ error: 'Cannot pay invoice in current stage.' });
    }
    if (result.error) {
      return response.status(400).json({ error: result.error });
    }

    response.json(toApiShape(result.row, request.user));
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

// --- Staff workflow ----------------------------------------------------

simpleTransition('/:id/assign-pv', {
  role: ['staff', 'admin'],
  status: 'PROCESS_VAL_ASSIGNED',
  eventType: 'process_validator_assigned',
  allowedPreStatuses: ['AI_EXTRACTED_PENDING_VAL', 'PROCESS_VAL_ASSIGNED'],
  buildPatch: (body) => ({ assignedProcVal: body.staffId })
});

simpleTransition('/:id/approve-pv-specs', {
  role: ['staff', 'admin'],
  status: 'CUSTOMER_SCOPE_PENDING',
  eventType: 'process_specs_approved',
  allowedPreStatuses: ['PROCESS_VAL_ASSIGNED']
});

router.post('/:id/assign-vv', requireAuth, requireRole('staff', 'admin'), async (request, response) => {
  const pool = getPool();
  const { row } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });

  const { staffId, newStatus } = request.body || {};
  const validTransitions = {
    'VEND_VAL_AI_ASSIGNED': ['AI_VENDOR_SEARCH_PENDING', 'VEND_VAL_AI_ASSIGNED'],
    'VEND_VAL_QUOTES_ASSIGNED': ['PENDING_VENDOR_QUOTES', 'VEND_VAL_QUOTES_ASSIGNED'],
    'VEND_VAL_PO_ASSIGNED': ['CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED']
  };

  const allowedPre = newStatus && validTransitions[newStatus] ? validTransitions[newStatus] : null;
  if (newStatus && allowedPre && !allowedPre.includes(row.status)) {
    return response.status(409).json({
      error: `Cannot assign vendor validator for '${newStatus}' from current status '${row.status}'. Expected: ${allowedPre.join(', ')}.`
    });
  }

  const result = await transition(pool, request.params.id, {
    status: newStatus || null,
    payloadPatch: { assignedVendVal: staffId },
    actorId: request.user.accountId,
    eventType: 'vendor_validator_assigned',
    allowedPreStatuses: allowedPre
  });
  if (result.error === 'not_found') return response.status(404).json({ error: 'Project not found.' });
  if (result.error === 'invalid_status') {
    return response.status(409).json({
      error: `Cannot transition project from status '${result.currentStatus}'. Expected: ${result.allowed.join(', ')}.`
    });
  }
  response.json(toApiShape(result.row));
});

simpleTransition('/:id/approve-vv-routing', {
  role: ['staff', 'admin'],
  status: 'PENDING_VENDOR_QUOTES',
  eventType: 'vendor_routing_approved',
  allowedPreStatuses: ['AI_VENDOR_SEARCH_PENDING', 'VEND_VAL_AI_ASSIGNED']
});

simpleTransition('/:id/approve-quotes-fee', {
  role: ['staff', 'admin'],
  status: 'CUSTOMER_FINAL_SELECTION',
  eventType: 'quotes_marked_up_and_released',
  allowedPreStatuses: ['PENDING_VENDOR_QUOTES', 'VEND_VAL_QUOTES_ASSIGNED']
});

simpleTransition('/:id/authorize-po', {
  role: ['staff', 'admin'],
  status: 'PO_SENT_TO_VENDOR',
  eventType: 'po_authorized',
  allowedPreStatuses: ['CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED']
});

simpleTransition('/:id/assign-inspector', {
  role: ['staff', 'admin'],
  status: 'INSPECTOR_ASSIGNED',
  eventType: 'inspector_assigned',
  allowedPreStatuses: ['PENDING_INSPECTION', 'INSPECTOR_ASSIGNED'],
  buildPatch: (body) => ({ assignedInspector: body.staffId })
});

simpleTransition('/:id/submit-qc-report', {
  role: ['staff', 'admin'],
  status: 'PENDING_CUST_DELIVERY_APPROVAL',
  eventType: 'qc_report_submitted',
  allowedPreStatuses: ['INSPECTOR_ASSIGNED']
});

simpleTransition('/:id/request-freight-fee', {
  role: ['staff', 'admin'],
  status: 'PENDING_CUST_PAYMENT',
  eventType: 'freight_fee_requested',
  allowedPreStatuses: ['PENDING_LOGISTICS_FEE'],
  buildPatch: (body) => ({ logisticsFee: Number(body.fee) || 4500 })
});

simpleTransition('/:id/accept-pickup', {
  role: ['staff', 'admin'],
  status: 'LOGISTICS_ACCEPTED',
  eventType: 'logistics_pickup_accepted',
  allowedPreStatuses: ['DISPATCH_REQUESTED']
});

simpleTransition('/:id/receive-warehouse', {
  role: ['staff', 'admin'],
  status: 'PENDING_INSPECTION',
  eventType: 'material_received_at_warehouse',
  allowedPreStatuses: ['LOGISTICS_ACCEPTED']
});

simpleTransition('/:id/dispatch', {
  role: ['staff', 'admin'],
  status: 'DISPATCHED_TO_CUST',
  eventType: 'dispatched_to_customer',
  allowedPreStatuses: ['PAYMENT_COMPLETED_PENDING_DISPATCH'],
  buildPatch: () => ({ custPaymentStatus: 'PAID' })
});

router.post('/:id/pay-vendor', requireAuth, requireRole('admin'), async (request, response) => {
  const pool = getPool();
  const { row } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });

  const allowedPreStatuses = ['PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'];
  if (!allowedPreStatuses.includes(row.status)) {
    return response.status(409).json({
      error: `Cannot release vendor payout in status ${row.status}. Expected ${allowedPreStatuses.join(' or ')}.`
    });
  }

  try {
    const selectedVendorId = row.payload?.selectedVendor?.vendorId || (typeof row.payload?.selectedVendor === 'string' ? row.payload?.selectedVendor : null);
    let vendor = null;
    if (selectedVendorId) {
      const vResult = await pool.query('SELECT * FROM vendors WHERE id = $1', [selectedVendorId]);
      if (vResult.rowCount > 0) vendor = vResult.rows[0];
    }

    const { receipt, patch } = processVendorPayout({
      project: row,
      vendor,
      payoutDetails: request.body || {}
    });

    const result = await transition(pool, request.params.id, {
      status: null, // Keep current stage
      payloadPatch: patch,
      actorId: request.user.accountId,
      eventType: 'vendor_payout_authorized',
      allowedPreStatuses
    });

    if (result.error === 'invalid_status') {
      return response.status(409).json({ error: 'Cannot release vendor payout in current status.' });
    }
    if (result.error) {
      return response.status(400).json({ error: result.error });
    }

    response.json(toApiShape(result.row, request.user));
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

// --- Supplier ------------------------------------------------------------

simpleTransition('/:id/accept-po', {
  role: ['supplier'],
  status: 'PO_ACCEPTED_VENDOR',
  eventType: 'po_accepted_by_vendor',
  allowedPreStatuses: ['PO_SENT_TO_VENDOR'],
  requireSelectedVendor: true
});

simpleTransition('/:id/request-dispatch', {
  role: ['supplier'],
  status: 'DISPATCH_REQUESTED',
  eventType: 'vendor_dispatch_requested',
  allowedPreStatuses: ['PO_ACCEPTED_VENDOR'],
  requireSelectedVendor: true
});

// A vendor bids: requires audited & approved facility and project in open RFQ status.
router.post('/:id/vendor-quote', requireAuth, requireRole('supplier'), async (request, response) => {
  const pool = getPool();
  const vendor = await getOwnVendor(pool, request.user.accountId);
  if (!vendor) return response.status(409).json({ error: 'Create a vendor profile before bidding.' });
  if (vendor.status !== 'APPROVED') {
    return response.status(403).json({ error: 'Supplier facility must be audited and approved before submitting bids.' });
  }

  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });

  if (!OPEN_RFQ_STATUSES.includes(row.status)) {
    return response.status(409).json({
      error: `Bids are only accepted during open RFQ stages (current status: '${row.status}'). Expected: ${OPEN_RFQ_STATUSES.join(', ')}.`
    });
  }

  const { cost, time } = request.body || {};
  const vid = `${vendor.id} (${vendor.name})`;
  const quote = { vid, cost: Number(cost) || 0, time: Number(time) || 7 };

  const drawings = JSON.parse(JSON.stringify(row.payload.drawings || []));
  drawings.forEach((drawing) => {
    (drawing.processes || []).forEach((process) => {
      process.quotes = [...(process.quotes || []).filter((q) => q.vid !== vid), quote];
    });
  });

  const result = await transition(pool, request.params.id, {
    payloadPatch: { drawings },
    actorId: request.user.accountId,
    eventType: 'vendor_quote_submitted',
    allowedPreStatuses: OPEN_RFQ_STATUSES
  });

  if (result.error === 'invalid_status') {
    return response.status(409).json({
      error: `Cannot submit bid when project is in status '${result.currentStatus}'. Expected: ${result.allowed.join(', ')}.`
    });
  }

  response.json(toApiShape(result.row, request.user, vendor.id));
});

export default router;
