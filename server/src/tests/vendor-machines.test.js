import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { setPool } from '../db/pool.js';
import vendorRoutes from '../routes/vendors.routes.js';

function createTestServer() {
  const app = express();
  app.use(express.json());

  // Test auth middleware to inject user from headers
  app.use((req, _res, next) => {
    if (req.headers['x-test-user']) {
      req.user = JSON.parse(req.headers['x-test-user']);
    }
    next();
  });

  app.use('/vendors', vendorRoutes);

  // Error handler
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}/vendors`,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Supplier Machine Registry: Machine array handling, profile merge & refresh persistence', async (t) => {
  let vendors = {};
  let vendorMachines = {};
  let nextMachineId = 100;

  const mockPool = {
    query: async (sql, params = []) => {
      const norm = sql.replace(/\s+/g, ' ').trim();

      // Check existing vendor by account_id
      if (norm.startsWith('SELECT * FROM vendors WHERE account_id = $1')) {
        const v = Object.values(vendors).find((item) => item.account_id === params[0]);
        return { rows: v ? [v] : [], rowCount: v ? 1 : 0 };
      }

      // Check vendor by id
      if (norm.startsWith('SELECT * FROM vendors WHERE id = $1')) {
        const v = vendors[params[0]];
        return { rows: v ? [v] : [], rowCount: v ? 1 : 0 };
      }

      // INSERT vendor
      if (norm.startsWith('INSERT INTO vendors')) {
        const [id, account_id, name, email, phone, location, profileJson] = params;
        const newVendor = {
          id,
          account_id,
          name,
          email,
          phone,
          location,
          status: 'APPROVED',
          audit_score: '95/100',
          profile: JSON.parse(profileJson || '{}'),
          created_at: new Date().toISOString()
        };
        vendors[id] = newVendor;
        return { rows: [newVendor], rowCount: 1 };
      }

      // SELECT from vendor_machines
      if (norm.startsWith('SELECT * FROM vendor_machines WHERE vendor_id = $1')) {
        const vendorId = params[0];
        const machines = Object.values(vendorMachines).filter((m) => m.vendor_id === vendorId);
        return { rows: machines, rowCount: machines.length };
      }

      // INSERT into vendor_machines
      if (norm.startsWith('INSERT INTO vendor_machines')) {
        const [id, vendor_id, name, process, hourly_rate, availability_status, detailsJson] = params;
        const m = {
          id: id || `M-${nextMachineId++}`,
          vendor_id,
          name,
          process,
          hourly_rate,
          availability_status: availability_status || 'idle',
          details: JSON.parse(detailsJson || '{}'),
          created_at: new Date().toISOString()
        };
        vendorMachines[m.id] = m;
        return { rows: [m], rowCount: 1 };
      }

      // SELECT all vendors
      if (norm.startsWith('SELECT * FROM vendors')) {
        return { rows: Object.values(vendors), rowCount: Object.keys(vendors).length };
      }

      return { rows: [], rowCount: 0 };
    }
  };

  setPool(mockPool);
  const { url, close } = await createTestServer();

  t.after(async () => {
    await close();
  });

  const supplierUser = {
    accountId: 'acc-vendor-001',
    role: 'supplier',
    publicId: 'VND-PUN-001'
  };

  const otherSupplier = {
    accountId: 'acc-vendor-002',
    role: 'supplier',
    publicId: 'VND-BLR-002'
  };

  await t.test('1. Onboards vendor with initial machines and persists them in vendor_machines table', async () => {
    const res = await fetch(`${url}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user': JSON.stringify(supplierUser)
      },
      body: JSON.stringify({
        name: 'Apex Precision Engineering Works',
        email: 'shop@apexprecision.in',
        phone: '+919876543210',
        location: 'Pune, Maharashtra',
        accountLocation: 'Pune, India',
        // Pass initial machines along with stale machines in profile
        machines: [
          { name: 'Haas VF-4 4-Axis VMC', process: 'CNC MILLING (4-Axis)', rate: 2200 },
          { name: 'Doosan Lynx 2100 CNC Lathe', process: 'CNC TURNING', rate: 1600 }
        ]
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.id, 'VND-PUN-001');
    assert.equal(body.machines.length, 2);
    assert.equal(body.machines[0].name, 'Haas VF-4 4-Axis VMC');
    assert.equal(body.machines[0].rate, 2200);
    assert.equal(body.machines[1].name, 'Doosan Lynx 2100 CNC Lathe');
  });

  await t.test('2. Stale profile JSON cannot overwrite authoritative machines array on GET /:id', async () => {
    // Manually simulate a corrupt or legacy stale profile in the DB having machines: ['old-stale-data']
    vendors['VND-PUN-001'].profile = {
      machines: [{ name: 'Ghost Stale Machine That Should Be Overwritten' }],
      district: 'Pune',
      state: 'Maharashtra'
    };

    const res = await fetch(`${url}/VND-PUN-001`, {
      headers: {
        'x-test-user': JSON.stringify(supplierUser)
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.district, 'Pune');
    assert.equal(body.machines.length, 2);
    assert.equal(body.machines[0].name, 'Haas VF-4 4-Axis VMC');
    assert.notEqual(body.machines[0].name, 'Ghost Stale Machine That Should Be Overwritten');
  });

  await t.test('3. Registers new machine via POST /:id/machines', async () => {
    const res = await fetch(`${url}/VND-PUN-001/machines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user': JSON.stringify(supplierUser)
      },
      body: JSON.stringify({
        name: 'Mitsubishi 4kW Fiber Laser 3015',
        process: 'CNC LASER CUTTING',
        rate: 2800,
        size: '3000 x 1500 mm Bed',
        axis: '3-Axis Laser Bed'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.name, 'Mitsubishi 4kW Fiber Laser 3015');
    assert.equal(body.process, 'CNC LASER CUTTING');
    assert.equal(body.rate, 2800);
  });

  await t.test('4. Refreshing facility via GET /:id or GET / retains newly added machine', async () => {
    const res = await fetch(`${url}/VND-PUN-001`, {
      headers: {
        'x-test-user': JSON.stringify(supplierUser)
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    // Must now contain all 3 machines (initial 2 + newly added 1)
    assert.equal(body.machines.length, 3);
    const newM = body.machines.find(m => m.name === 'Mitsubishi 4kW Fiber Laser 3015');
    assert.ok(newM, 'New laser machine must persist across refresh');
    assert.equal(newM.rate, 2800);
  });

  await t.test('5. Rejects unauthorized vendor attempting to add machine to another facility', async () => {
    const res = await fetch(`${url}/VND-PUN-001/machines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user': JSON.stringify(otherSupplier)
      },
      body: JSON.stringify({
        name: 'Intruder Mill',
        process: 'CNC MILLING',
        rate: 9999
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /only add machines to your own facility/i);
  });
});
