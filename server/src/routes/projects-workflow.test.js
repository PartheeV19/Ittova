import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { setPool } from '../db/pool.js';
import projectRoutes from './projects.routes.js';

function createTestServer(mockDb) {
  const app = express();
  app.use(express.json());

  // Test auth middleware to inject user from headers
  app.use((req, _res, next) => {
    if (req.headers['x-test-user']) {
      req.user = JSON.parse(req.headers['x-test-user']);
    }
    next();
  });

  app.use('/projects', projectRoutes);

  // Error handler
  app.use((err, _req, res, _next) => {
    console.error('Test server error:', err);
    res.status(err.status || 500).json({ error: err.message });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}/projects`,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Finding 1: Project API ownership, approval, and workflow stage enforcement', async (t) => {
  // Set up mock DB pool
  let projects = {};
  let customers = {};
  let vendors = {};
  let events = [];

  const mockPool = {
    query: async (sql, params = []) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      // SELECT customers
      if (normalizedSql.startsWith('SELECT id, status FROM customers WHERE account_id = $1')) {
        const cust = Object.values(customers).find((c) => c.account_id === params[0]);
        return { rows: cust ? [cust] : [], rowCount: cust ? 1 : 0 };
      }
      if (normalizedSql.startsWith('SELECT id FROM customers WHERE account_id = $1')) {
        const cust = Object.values(customers).find((c) => c.account_id === params[0]);
        return { rows: cust ? [{ id: cust.id }] : [], rowCount: cust ? 1 : 0 };
      }

      // SELECT vendors
      if (normalizedSql.startsWith('SELECT id, name, status FROM vendors WHERE account_id = $1')) {
        const vend = Object.values(vendors).find((v) => v.account_id === params[0]);
        return { rows: vend ? [vend] : [], rowCount: vend ? 1 : 0 };
      }
      if (normalizedSql.startsWith('SELECT id FROM vendors WHERE account_id = $1')) {
        const vend = Object.values(vendors).find((v) => v.account_id === params[0]);
        return { rows: vend ? [{ id: vend.id }] : [], rowCount: vend ? 1 : 0 };
      }

      // SELECT project list
      if (normalizedSql.startsWith('SELECT * FROM projects ORDER BY created_at DESC')) {
        return { rows: Object.values(projects), rowCount: Object.values(projects).length };
      }
      if (normalizedSql.startsWith('SELECT * FROM projects WHERE customer_id = $1')) {
        const list = Object.values(projects).filter((p) => p.customer_id === params[0]);
        return { rows: list, rowCount: list.length };
      }

      // SELECT project by id
      if (normalizedSql === 'SELECT * FROM projects WHERE id = $1') {
        const p = projects[params[0]];
        return { rows: p ? [p] : [], rowCount: p ? 1 : 0 };
      }
      if (normalizedSql === 'SELECT status FROM projects WHERE id = $1') {
        const p = projects[params[0]];
        return { rows: p ? [{ status: p.status }] : [], rowCount: p ? 1 : 0 };
      }

      // INSERT project
      if (normalizedSql.includes('INSERT INTO projects')) {
        const p = {
          id: params[0],
          customer_id: params[1],
          created_by: params[2],
          status: 'AI_EXTRACTED_PENDING_VAL',
          search_location: params[3],
          search_radius_km: params[4],
          payload: JSON.parse(params[5]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        projects[p.id] = p;
        return { rows: [p], rowCount: 1 };
      }

      // UPDATE project
      if (normalizedSql.includes('UPDATE projects SET status = COALESCE($2, status)')) {
        const p = projects[params[0]];
        if (!p) return { rows: [], rowCount: 0 };
        const newStatus = params[1] || p.status;
        const patch = JSON.parse(params[2]);
        p.status = newStatus;
        p.payload = { ...p.payload, ...patch };
        p.updated_at = new Date().toISOString();
        return { rows: [p], rowCount: 1 };
      }

      // UPDATE payload only (scope)
      if (normalizedSql.includes('UPDATE projects SET payload = payload || $2::jsonb')) {
        const p = projects[params[0]];
        if (!p) return { rows: [], rowCount: 0 };
        const patch = JSON.parse(params[1]);
        p.payload = { ...p.payload, ...patch };
        p.updated_at = new Date().toISOString();
        return { rows: [p], rowCount: 1 };
      }

      // INSERT project_events
      if (normalizedSql.includes('INSERT INTO project_events')) {
        events.push({
          projectId: params[0],
          actorId: params[1],
          eventType: params[2],
          fromStatus: params[3],
          toStatus: params[4],
          details: params[5]
        });
        return { rows: [], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    }
  };

  setPool(mockPool);
  const server = await createTestServer(mockPool);

  t.after(async () => {
    await server.close();
  });

  const customerPendingAccount = { accountId: 'acc-cust-pending', role: 'customer' };
  const customerApprovedAccount = { accountId: 'acc-cust-approved', role: 'customer' };
  const customerOtherAccount = { accountId: 'acc-cust-other', role: 'customer' };
  const supplierPendingAccount = { accountId: 'acc-vend-pending', role: 'supplier' };
  const supplierApprovedAccount = { accountId: 'acc-vend-approved', role: 'supplier' };
  const supplierOtherAccount = { accountId: 'acc-vend-other', role: 'supplier' };
  const staffAccount = { accountId: 'acc-staff', role: 'staff' };

  customers['CUST-PENDING'] = { id: 'CUST-PENDING', account_id: 'acc-cust-pending', status: 'PENDING' };
  customers['CUST-APPROVED'] = { id: 'CUST-APPROVED', account_id: 'acc-cust-approved', status: 'APPROVED' };
  customers['CUST-OTHER'] = { id: 'CUST-OTHER', account_id: 'acc-cust-other', status: 'APPROVED' };

  vendors['VEND-PENDING'] = { id: 'VEND-PENDING', name: 'Pending Fab', account_id: 'acc-vend-pending', status: 'PENDING' };
  vendors['VEND-APPROVED'] = { id: 'VEND-APPROVED', name: 'Approved CNC', account_id: 'acc-vend-approved', status: 'APPROVED' };
  vendors['VEND-OTHER'] = { id: 'VEND-OTHER', name: 'Other CNC', account_id: 'acc-vend-other', status: 'APPROVED' };

  await t.test('1. Unapproved customer cannot create project', async () => {
    const res = await fetch(server.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(customerPendingAccount)
      },
      body: JSON.stringify({ searchLoc: 'Hyderabad' })
    });
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.match(body.error, /verified and approved/i);
  });

  let createdProjectId;

  await t.test('2. Approved customer can create project', async () => {
    const res = await fetch(server.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(customerApprovedAccount)
      },
      body: JSON.stringify({
        searchLoc: 'Hyderabad',
        drawings: [
          {
            dwgNo: 'DWG-01',
            processes: [
              { stageId: 1, name: 'CNC MILLING', rawScope: 'Vendor', mfgScope: 'Vendor' }
            ]
          }
        ]
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'AI_EXTRACTED_PENDING_VAL');
    assert.equal(body.cust, 'CUST-APPROVED');
    createdProjectId = body.id;
  });

  await t.test('3. Out-of-sequence customer pay or scope confirmation is rejected', async () => {
    // Current status is AI_EXTRACTED_PENDING_VAL, attempting to pay immediately
    const payRes = await fetch(`${server.url}/${createdProjectId}/pay`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(customerApprovedAccount)
      }
    });
    assert.equal(payRes.status, 409);
    const payBody = await payRes.json();
    assert.match(payBody.error, /Cannot transition/i);

    // Attempting to confirm scopes when not in CUSTOMER_SCOPE_PENDING
    const scopeRes = await fetch(`${server.url}/${createdProjectId}/confirm-scopes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(customerApprovedAccount)
      }
    });
    assert.equal(scopeRes.status, 409);
  });

  await t.test('4. Another customer cannot modify or transition this project', async () => {
    const res = await fetch(`${server.url}/${createdProjectId}/confirm-scopes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(customerOtherAccount)
      }
    });
    assert.equal(res.status, 403);
  });

  await t.test('5. Valid staff progression from AI_EXTRACTED_PENDING_VAL to CUSTOMER_SCOPE_PENDING', async () => {
    // 5a. Assign PV
    const assignPvRes = await fetch(`${server.url}/${createdProjectId}/assign-pv`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(staffAccount)
      },
      body: JSON.stringify({ staffId: 'PV-01' })
    });
    assert.equal(assignPvRes.status, 200);
    assert.equal((await assignPvRes.json()).status, 'PROCESS_VAL_ASSIGNED');

    // 5b. Approve PV Specs
    const approvePvRes = await fetch(`${server.url}/${createdProjectId}/approve-pv-specs`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(staffAccount)
      }
    });
    assert.equal(approvePvRes.status, 200);
    assert.equal((await approvePvRes.json()).status, 'CUSTOMER_SCOPE_PENDING');
  });

  await t.test('6. In CUSTOMER_SCOPE_PENDING, customer confirms scopes to AI_VENDOR_SEARCH_PENDING', async () => {
    const confirmRes = await fetch(`${server.url}/${createdProjectId}/confirm-scopes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(customerApprovedAccount)
      }
    });
    assert.equal(confirmRes.status, 200);
    assert.equal((await confirmRes.json()).status, 'AI_VENDOR_SEARCH_PENDING');
  });

  await t.test('7. Unapproved supplier cannot submit bid', async () => {
    // Move project to PENDING_VENDOR_QUOTES
    projects[createdProjectId].status = 'PENDING_VENDOR_QUOTES';

    const res = await fetch(`${server.url}/${createdProjectId}/vendor-quote`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(supplierPendingAccount)
      },
      body: JSON.stringify({ cost: 25000, time: 5 })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /audited and approved/i);
  });

  await t.test('8. Supplier cannot bid when project is not in an open RFQ stage', async () => {
    // If supplier is involved (already has a quote or is selected), they can view it but cannot bid once past open RFQ
    projects[createdProjectId].payload.drawings[0].processes[0].quotes = [
      { vid: 'VEND-APPROVED (Approved CNC)', cost: 20000, time: 5 }
    ];
    projects[createdProjectId].status = 'CUSTOMER_FINAL_SELECTION';

    const res = await fetch(`${server.url}/${createdProjectId}/vendor-quote`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(supplierApprovedAccount)
      },
      body: JSON.stringify({ cost: 25000, time: 5 })
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.match(body.error, /open RFQ stages/i);
  });

  await t.test('9. Supplier PO acceptance requires selected vendor status', async () => {
    projects[createdProjectId].status = 'PO_SENT_TO_VENDOR';
    // Process has VEND-APPROVED as selectedVendor
    projects[createdProjectId].payload.drawings[0].processes[0].selectedVendor = 'VEND-APPROVED (Approved CNC)';

    // Another supplier involved in quotes but not selected
    projects[createdProjectId].payload.drawings[0].processes[0].quotes.push({
      vid: 'VEND-OTHER (Other CNC)', cost: 22000, time: 6
    });

    const otherRes = await fetch(`${server.url}/${createdProjectId}/accept-po`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(supplierOtherAccount)
      }
    });
    assert.equal(otherRes.status, 403);
    assert.match((await otherRes.json()).error, /selected supplier/i);

    // Selected supplier accepts PO
    const approvedRes = await fetch(`${server.url}/${createdProjectId}/accept-po`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-user': JSON.stringify(supplierApprovedAccount)
      }
    });
    assert.equal(approvedRes.status, 200);
    assert.equal((await approvedRes.json()).status, 'PO_ACCEPTED_VENDOR');
  });

  await t.test('10. Open RFQ supplier project listing redacts competing bids and topVendors', async () => {
    // Reset project to open RFQ stage with quotes from multiple vendors and competitor topVendors
    projects[createdProjectId].status = 'PENDING_VENDOR_QUOTES';
    projects[createdProjectId].payload.drawings[0].processes[0].topVendors = [
      'VEND-APPROVED (Approved CNC)',
      'VEND-OTHER (Other CNC)',
      'VEND-SECRET (Secret Competitor)'
    ];
    projects[createdProjectId].payload.drawings[0].processes[0].quotes = [
      { vid: 'VEND-APPROVED (Approved CNC)', cost: 20000, time: 5 },
      { vid: 'VEND-OTHER (Other CNC)', cost: 18500, time: 4 },
      { vid: 'VEND-SECRET (Secret Competitor)', cost: 17000, time: 3 }
    ];

    // Supplier VEND-APPROVED requests project list
    const res = await fetch(server.url, {
      headers: {
        'x-test-user': JSON.stringify(supplierApprovedAccount)
      }
    });
    assert.equal(res.status, 200);
    const list = await res.json();
    const proj = list.find((p) => p.id === createdProjectId);
    assert.ok(proj, 'Project should be visible to supplier during open RFQ');

    const proc = proj.drawings[0].processes[0];
    // Competing quotes must be redacted: only VEND-APPROVED quote must exist
    assert.equal(proc.quotes.length, 1);
    assert.equal(proc.quotes[0].vid, 'VEND-APPROVED (Approved CNC)');
    assert.equal(proc.quotes[0].cost, 20000);
    // Competing topVendors list must be redacted
    assert.equal(proc.topVendors, undefined);
  });

  await t.test('11. Supplier with no bids yet sees empty quotes array on open RFQs', async () => {
    // Third supplier who hasn't bid yet views the open RFQ
    vendors['VEND-NEW'] = { id: 'VEND-NEW', name: 'New Supplier', account_id: 'acc-vend-new', status: 'APPROVED' };
    const newSupplierAccount = { accountId: 'acc-vend-new', role: 'supplier' };

    const res = await fetch(`${server.url}/${createdProjectId}`, {
      headers: {
        'x-test-user': JSON.stringify(newSupplierAccount)
      }
    });
    assert.equal(res.status, 200);
    const proj = await res.json();
    const proc = proj.drawings[0].processes[0];
    // Must see zero quotes from other vendors
    assert.deepEqual(proc.quotes, []);
    assert.equal(proc.topVendors, undefined);
  });

  await t.test('12. Customer and staff can see all competing quotes for audit and selection', async () => {
    // Customer viewing their own project sees all 3 vendor quotes
    const custRes = await fetch(`${server.url}/${createdProjectId}`, {
      headers: {
        'x-test-user': JSON.stringify(customerApprovedAccount)
      }
    });
    assert.equal(custRes.status, 200);
    const custProj = await custRes.json();
    assert.equal(custProj.drawings[0].processes[0].quotes.length, 3);

    // Staff viewing the project sees all 3 vendor quotes
    const staffRes = await fetch(`${server.url}/${createdProjectId}`, {
      headers: {
        'x-test-user': JSON.stringify(staffAccount)
      }
    });
    assert.equal(staffRes.status, 200);
    const staffProj = await staffRes.json();
    assert.equal(staffProj.drawings[0].processes[0].quotes.length, 3);
  });
});
