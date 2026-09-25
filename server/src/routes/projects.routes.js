import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logEvent } from '../db/events.js';

const router = Router();

function newProjectId() {
  return `PRJ-${randomInt(1000, 9999)}`;
}

function toApiShape(row) {
  return {
    id: row.id,
    cust: row.customer_id,
    status: row.status,
    searchLoc: row.search_location,
    searchRad: row.search_radius_km,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...row.payload
  };
}

async function getOwnCustomerId(pool, accountId) {
  const result = await pool.query('SELECT id FROM customers WHERE account_id = $1', [accountId]);
  return result.rows[0]?.id || null;
}

async function getOwnVendorId(pool, accountId) {
  const result = await pool.query('SELECT id FROM vendors WHERE account_id = $1', [accountId]);
  return result.rows[0]?.id || null;
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

// Generic status/payload transition + audit log. Use for simple transitions;
// anything that needs to reach into the nested drawings array gets its own
// handler further down.
async function transition(pool, id, { status, payloadPatch = {}, actorId, eventType }) {
  const before = await pool.query('SELECT status FROM projects WHERE id = $1', [id]);
  if (before.rowCount === 0) return null;

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
    fromStatus: before.rows[0].status,
    toStatus: row.status,
    details: payloadPatch
  });
  return row;
}

function simpleTransition(path, { role, status, eventType, buildPatch = () => ({}) }) {
  router.post(path, requireAuth, requireRole(...role), async (request, response) => {
    const patch = buildPatch(request.body || {});
    const row = await transition(getPool(), request.params.id, {
      status,
      payloadPatch: patch,
      actorId: request.user.accountId,
      eventType
    });
    if (!row) return response.status(404).json({ error: 'Project not found.' });
    response.json(toApiShape(row));
  });
}

// --- Create & read ---------------------------------------------------------

// Customer submits drawings for a new project. Real AI/DFM extraction isn't
// wired up yet (see the punch list) -- the client sends the extracted
// drawings/processes/BOM it already has, and this just persists them.
router.post('/', requireAuth, requireRole('customer'), async (request, response) => {
  const pool = getPool();
  const customerId = await getOwnCustomerId(pool, request.user.accountId);
  if (!customerId) {
    return response.status(409).json({ error: 'Create a customer profile before submitting a project.' });
  }

  const { searchLoc = 'Hyderabad', searchRad = 50, drawings = [], files = '', bom = '' } = request.body || {};
  const id = newProjectId();

  const inserted = await pool.query(
    `INSERT INTO projects (id, customer_id, created_by, status, search_location, search_radius_km, payload)
     VALUES ($1, $2, $3, 'AI_EXTRACTED_PENDING_VAL', $4, $5, $6)
     RETURNING *`,
    [id, customerId, request.user.accountId, searchLoc, searchRad, JSON.stringify({ drawings, files, bom })]
  );

  await logEvent({
    projectId: id,
    actorId: request.user.accountId,
    eventType: 'project_created',
    toStatus: 'AI_EXTRACTED_PENDING_VAL'
  });

  response.status(201).json(toApiShape(inserted.rows[0]));
});

router.get('/', requireAuth, async (request, response) => {
  const pool = getPool();

  if (['staff', 'admin'].includes(request.user.role)) {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return response.json(result.rows.map(toApiShape));
  }

  if (request.user.role === 'customer') {
    const customerId = await getOwnCustomerId(pool, request.user.accountId);
    const result = customerId
      ? await pool.query('SELECT * FROM projects WHERE customer_id = $1 ORDER BY created_at DESC', [customerId])
      : { rows: [] };
    return response.json(result.rows.map(toApiShape));
  }

  if (request.user.role === 'supplier') {
    const vendorId = await getOwnVendorId(pool, request.user.accountId);
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    const visible = result.rows.filter((row) => OPEN_RFQ_STATUSES.includes(row.status) || vendorInvolved(row.payload, vendorId));
    return response.json(visible.map(toApiShape));
  }

  response.json([]);
});

router.get('/:id', requireAuth, async (request, response) => {
  const { row, allowed } = await loadProjectForUser(getPool(), request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });
  response.json(toApiShape(row));
});

// --- Customer scoping & selection ------------------------------------------

// Edits one process's scope field (e.g. rawScope/mfgScope/finScope). Mirrors
// the downstream-lock rule from the original client-only logic: changing a
// stage-1 manufacturing scope re-locks stage 2's raw-material scope to match.
router.patch('/:id/scope', requireAuth, requireRole('customer', 'staff', 'admin'), async (request, response) => {
  const { dIdx, pIdx, field, value } = request.body || {};
  if (dIdx == null || pIdx == null || !field) {
    return response.status(400).json({ error: 'dIdx, pIdx, and field are required.' });
  }

  const pool = getPool();
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });

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
  response.json(toApiShape(updated.rows[0]));
});

simpleTransition('/:id/confirm-scopes', {
  role: ['customer'],
  status: 'AI_VENDOR_SEARCH_PENDING',
  eventType: 'scopes_confirmed'
});

// Customer picks a vendor per process stage: { selections: { "0_1": "V-1234 (Acme)" } }
router.post('/:id/select-vendors', requireAuth, requireRole('customer'), async (request, response) => {
  const { selections = {} } = request.body || {};
  const pool = getPool();
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });

  const drawings = JSON.parse(JSON.stringify(row.payload.drawings || []));
  drawings.forEach((drawing, dIdx) => {
    (drawing.processes || []).forEach((process, pIdx) => {
      const key = `${dIdx}_${pIdx}`;
      if (selections[key]) process.selectedVendor = selections[key];
    });
  });

  const updated = await transition(pool, request.params.id, {
    status: 'CUST_SELECTED_VEND_PENDING',
    payloadPatch: { drawings },
    actorId: request.user.accountId,
    eventType: 'vendors_selected'
  });
  response.json(toApiShape(updated));
});

simpleTransition('/:id/approve-delivery', {
  role: ['customer'],
  status: 'PENDING_LOGISTICS_FEE',
  eventType: 'delivery_approved',
  buildPatch: (body) => ({ custDeliveryAddress: body.deliveryAddress || 'Central Customer Inward Receiving Dock' })
});

simpleTransition('/:id/pay', {
  role: ['customer'],
  status: 'PAYMENT_COMPLETED_PENDING_DISPATCH',
  eventType: 'final_payment_received',
  buildPatch: () => ({ custPaymentStatus: 'PAID' })
});

// --- Staff workflow ----------------------------------------------------

simpleTransition('/:id/assign-pv', {
  role: ['staff', 'admin'],
  status: 'PROCESS_VAL_ASSIGNED',
  eventType: 'process_validator_assigned',
  buildPatch: (body) => ({ assignedProcVal: body.staffId })
});

simpleTransition('/:id/approve-pv-specs', {
  role: ['staff', 'admin'],
  status: 'CUSTOMER_SCOPE_PENDING',
  eventType: 'process_specs_approved'
});

router.post('/:id/assign-vv', requireAuth, requireRole('staff', 'admin'), async (request, response) => {
  const { staffId, newStatus } = request.body || {};
  const row = await transition(getPool(), request.params.id, {
    status: newStatus || null,
    payloadPatch: { assignedVendVal: staffId },
    actorId: request.user.accountId,
    eventType: 'vendor_validator_assigned'
  });
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  response.json(toApiShape(row));
});

simpleTransition('/:id/approve-vv-routing', {
  role: ['staff', 'admin'],
  status: 'PENDING_VENDOR_QUOTES',
  eventType: 'vendor_routing_approved'
});

simpleTransition('/:id/approve-quotes-fee', {
  role: ['staff', 'admin'],
  status: 'CUSTOMER_FINAL_SELECTION',
  eventType: 'quotes_marked_up_and_released'
});

simpleTransition('/:id/authorize-po', {
  role: ['staff', 'admin'],
  status: 'PO_SENT_TO_VENDOR',
  eventType: 'po_authorized'
});

simpleTransition('/:id/assign-inspector', {
  role: ['staff', 'admin'],
  status: 'INSPECTOR_ASSIGNED',
  eventType: 'inspector_assigned',
  buildPatch: (body) => ({ assignedInspector: body.staffId })
});

simpleTransition('/:id/submit-qc-report', {
  role: ['staff', 'admin'],
  status: 'PENDING_CUST_DELIVERY_APPROVAL',
  eventType: 'qc_report_submitted'
});

simpleTransition('/:id/request-freight-fee', {
  role: ['staff', 'admin'],
  status: 'PENDING_CUST_PAYMENT',
  eventType: 'freight_fee_requested',
  buildPatch: (body) => ({ logisticsFee: Number(body.fee) || 4500 })
});

simpleTransition('/:id/accept-pickup', {
  role: ['staff', 'admin'],
  status: 'LOGISTICS_ACCEPTED',
  eventType: 'logistics_pickup_accepted'
});

simpleTransition('/:id/receive-warehouse', {
  role: ['staff', 'admin'],
  status: 'PENDING_INSPECTION',
  eventType: 'material_received_at_warehouse'
});

simpleTransition('/:id/dispatch', {
  role: ['staff', 'admin'],
  status: 'DISPATCHED_TO_CUST',
  eventType: 'dispatched_to_customer',
  buildPatch: () => ({ custPaymentStatus: 'PAID' })
});

// --- Admin -------------------------------------------------------------

simpleTransition('/:id/pay-vendor', {
  role: ['admin'],
  status: null,
  eventType: 'vendor_payout_authorized',
  buildPatch: () => ({ vendorPaymentStatus: 'PAID' })
});

// --- Supplier ------------------------------------------------------------

simpleTransition('/:id/accept-po', {
  role: ['supplier'],
  status: 'PO_ACCEPTED_VENDOR',
  eventType: 'po_accepted_by_vendor'
});

simpleTransition('/:id/request-dispatch', {
  role: ['supplier'],
  status: 'DISPATCH_REQUESTED',
  eventType: 'vendor_dispatch_requested'
});

// A vendor bids: applies the same quote to every process stage, matching the
// original client-only behavior. { cost, time }
router.post('/:id/vendor-quote', requireAuth, requireRole('supplier'), async (request, response) => {
  const pool = getPool();
  const vendorId = await getOwnVendorId(pool, request.user.accountId);
  if (!vendorId) return response.status(409).json({ error: 'Create a vendor profile before bidding.' });

  const vendorRow = await pool.query('SELECT name FROM vendors WHERE id = $1', [vendorId]);
  const { row, allowed } = await loadProjectForUser(pool, request.params.id, request.user);
  if (!row) return response.status(404).json({ error: 'Project not found.' });
  if (!allowed) return response.status(403).json({ error: 'Not permitted.' });

  const { cost, time } = request.body || {};
  const vid = `${vendorId} (${vendorRow.rows[0].name})`;
  const quote = { vid, cost: Number(cost) || 0, time: Number(time) || 7 };

  const drawings = JSON.parse(JSON.stringify(row.payload.drawings || []));
  drawings.forEach((drawing) => {
    (drawing.processes || []).forEach((process) => {
      process.quotes = [...(process.quotes || []).filter((q) => q.vid !== vid), quote];
    });
  });

  const updated = await transition(pool, request.params.id, {
    payloadPatch: { drawings },
    actorId: request.user.accountId,
    eventType: 'vendor_quote_submitted'
  });
  response.json(toApiShape(updated));
});

export default router;
