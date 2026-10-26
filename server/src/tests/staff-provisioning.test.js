import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { setPool } from '../db/pool.js';
import staffRoutes, { VALID_STAFF_ROLES } from '../routes/staff.routes.js';
import { bootstrapStaffAccounts, DEFAULT_BOOTSTRAP_ACCOUNTS } from '../db/bootstrap.js';

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

  app.use('/staff', staffRoutes);

  // Error handler
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}/staff`,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Finding 6: Staff provisioning work queue roles & root administrator bootstrap', async (t) => {
  let appUsers = {};
  let staffMembers = {};

  const mockClient = {
    query: async (sql, params = []) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      if (normalizedSql === 'BEGIN' || normalizedSql === 'COMMIT' || normalizedSql === 'ROLLBACK') {
        return { rows: [], rowCount: 0 };
      }

      if (normalizedSql.startsWith('INSERT INTO app_users')) {
        const [email, password_hash, role] = params;
        const id = `user-${Object.keys(appUsers).length + 1}`;
        const newUser = { id, email, password_hash, role: role || 'admin', status: 'active' };
        appUsers[id] = newUser;
        return { rows: [{ id }], rowCount: 1 };
      }

      if (normalizedSql.startsWith('INSERT INTO staff')) {
        const [id, account_id, name, role, title] = params;
        const newStaff = {
          id,
          account_id,
          name,
          role,
          title,
          profile: {},
          created_at: new Date().toISOString()
        };
        staffMembers[id] = newStaff;
        return { rows: [newStaff], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    },
    release: () => {}
  };

  const mockPool = {
    connect: async () => mockClient,
    query: async (sql, params = []) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      // Check existing admin for bootstrap
      if (normalizedSql.startsWith("SELECT id FROM app_users WHERE role = 'admin'")) {
        const admins = Object.values(appUsers).filter((u) => u.role === 'admin');
        return { rows: admins, rowCount: admins.length };
      }

      // Check existing by email
      if (normalizedSql.startsWith('SELECT id FROM app_users WHERE lower(email) = lower($1)')) {
        const found = Object.values(appUsers).filter((u) => u.email.toLowerCase() === params[0].toLowerCase());
        return { rows: found, rowCount: found.length };
      }

      // SELECT staff by account_id
      if (normalizedSql.startsWith('SELECT * FROM staff WHERE account_id = $1')) {
        const staff = Object.values(staffMembers).find((s) => s.account_id === params[0]);
        return { rows: staff ? [staff] : [], rowCount: staff ? 1 : 0 };
      }

      // SELECT all staff
      if (normalizedSql.startsWith('SELECT * FROM staff ORDER BY created_at')) {
        return { rows: Object.values(staffMembers), rowCount: Object.values(staffMembers).length };
      }

      return mockClient.query(sql, params);
    }
  };

  setPool(mockPool);
  const server = await createTestServer();

  const customerUser = { accountId: 'acc-cust-1', role: 'customer' };
  const adminUser = { accountId: 'user-1', role: 'admin' };

  try {
    await t.test('1. Bootstraps root administrator account when no admin exists in system', async () => {
      const res = await fetch(`${server.url}/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'ITTOVA Root Admin',
          email: 'admin@ittova.com',
          password: 'RootAdminPass123!',
          title: 'System Chief Administrator'
        })
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.id, 'S-ROOT-ADMIN');
      assert.equal(data.name, 'ITTOVA Root Admin');
      assert.equal(data.role, 'ADMIN');
    });

    await t.test('2. Rejects second bootstrap attempt once system already has an admin', async () => {
      const res = await fetch(`${server.url}/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Intruder Admin',
          email: 'intruder@hacker.io',
          password: 'PassWord123!'
        })
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.ok(data.error.includes('already been bootstrapped'));
    });

    await t.test('3. Rejects non-admin attempting to provision staff accounts', async () => {
      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify({
          name: 'Unauthorized User',
          email: 'test@unauth.com',
          password: 'Password123!',
          role: 'PROCESS_VALIDATOR'
        })
      });

      assert.equal(res.status, 403);
    });

    await t.test('4. Rejects invalid staff role with list of allowed work queue roles', async () => {
      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(adminUser)
        },
        body: JSON.stringify({
          name: 'Invalid Staff',
          email: 'invalid@ittova.com',
          password: 'Password123!',
          role: 'INVALID_ROLE_XYZ'
        })
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Allowed staff roles'));
      assert.ok(data.error.includes('CUSTOMER_AUDIT'));
      assert.ok(data.error.includes('PROCESS_VALIDATOR'));
    });

    await t.test('5. Admin successfully provisions staff for work queue roles', async () => {
      const rolesToTest = [
        { role: 'CUSTOMER_AUDIT', title: 'Corporate KYC Auditor' },
        { role: 'PROCESS_VALIDATOR', title: 'Senior CAM Process Planner' },
        { role: 'VENDOR_AUDIT', title: 'Facility Quality Auditor' },
        { role: 'VENDOR_VALIDATOR', title: 'Supplier Commercial Sourcing' },
        { role: 'LOGISTICS', title: 'Dispatch & Fleet Coordinator' },
        { role: 'INSPECTOR', title: 'CMM Metrology Inspector' }
      ];

      for (const item of rolesToTest) {
        const res = await fetch(server.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-test-user': JSON.stringify(adminUser)
          },
          body: JSON.stringify({
            name: `${item.role} Staff`,
            email: `test-${item.role.toLowerCase()}@ittova.internal`,
            password: 'SecurePass123!',
            role: item.role,
            title: item.title
          })
        });

        assert.equal(res.status, 201);
        const data = await res.json();
        assert.equal(data.role, item.role);
        assert.equal(data.title, item.title);
        assert.ok(data.id.startsWith('S-'));
      }
    });

    await t.test('6. bootstrapStaffAccounts successfully provisions all default departmental accounts', async () => {
      const provisioned = await bootstrapStaffAccounts(mockPool);
      // Admin was already bootstrapped in step 1, remaining 6 accounts should be provisioned
      assert.equal(provisioned.length, DEFAULT_BOOTSTRAP_ACCOUNTS.length - 1);
    });
  } finally {
    await server.close();
  }
});
