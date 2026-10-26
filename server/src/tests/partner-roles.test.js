import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { setPool } from '../db/pool.js';
import authRoutes from '../routes/auth.routes.js';
import { createHmac } from 'node:crypto';
import { resolveSession } from '../auth/session.js';

process.env.OTP_HASH_SECRET = 'a'.repeat(32);
process.env.OTP_DEV_MODE = 'true';
process.env.NODE_ENV = 'test';

function hashCode(code) {
  return createHmac('sha256', process.env.OTP_HASH_SECRET).update(code).digest('hex');
}

function createTestServer() {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);

  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}/auth`,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Finding 7: Partner roles onboarding & authentication (finance_partner and material_partner)', async (t) => {
  let appUsers = {};
  let otpCodes = {};
  let sessions = {};
  let nextUserId = 1;
  let nextSessionId = 1;

  const mockClient = {
    query: async (sql, params = []) => {
      const norm = sql.replace(/\s+/g, ' ').trim();
      if (norm === 'BEGIN' || norm === 'COMMIT' || norm === 'ROLLBACK') {
        return { rows: [] };
      }
      if (norm.startsWith('SELECT pg_advisory_xact_lock')) {
        return { rows: [] };
      }
      if (norm.startsWith('SELECT COUNT(*)::int AS total')) {
        return { rows: [{ total: 0, cooling_down: false }] };
      }
      if (norm.startsWith('UPDATE otp_codes SET consumed_at = now() WHERE lower(contact) = $1')) {
        return { rows: [], rowCount: 1 };
      }
      if (norm.startsWith('INSERT INTO otp_codes')) {
        const id = 'otp-' + Math.random();
        otpCodes[id] = {
          id,
          contact: params[0],
          code_hash: params[1],
          purpose: params[2],
          consumed_at: null,
          attempt_count: 0
        };
        return { rows: [{ id }] };
      }
      if (norm.includes('FROM otp_codes WHERE lower(contact) = $1 AND purpose = $2 AND consumed_at IS NULL')) {
        const found = Object.values(otpCodes).find(
          o => o.contact.toLowerCase() === params[0].toLowerCase() && o.purpose === params[1] && !o.consumed_at
        );
        if (found) {
          return { rows: [{ id: found.id, code_hash: found.code_hash, attempt_count: found.attempt_count }] };
        }
        return { rows: [] };
      }
      if (norm.startsWith('UPDATE otp_codes SET consumed_at = now() WHERE id = $1')) {
        if (otpCodes[params[0]]) otpCodes[params[0]].consumed_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      if (norm.startsWith('UPDATE otp_codes SET attempt_count = attempt_count + 1 WHERE id = $1')) {
        if (otpCodes[params[0]]) otpCodes[params[0]].attempt_count++;
        return { rows: [], rowCount: 1 };
      }
      return { rows: [] };
    },
    release: () => {}
  };

  const mockPool = {
    connect: async () => mockClient,
    query: async (sql, params = []) => {
      const norm = sql.replace(/\s+/g, ' ').trim();

      // Check app_users by email or phone
      if (norm.startsWith('SELECT id, role, status, public_id, identity_codes, profile_data FROM app_users')) {
        const emailArg = (params[0] || '').toLowerCase();
        const phoneArg = (params[1] || '').replace(/[^0-9]/g, '');
        const user = Object.values(appUsers).find(u => {
          if (emailArg && u.email.toLowerCase() === emailArg) return true;
          const uPhone = (u.profile_data?.phone || '').replace(/[^0-9]/g, '');
          if (phoneArg && uPhone && uPhone === phoneArg) return true;
          return false;
        });
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
      }

      // INSERT INTO app_users
      if (norm.startsWith('INSERT INTO app_users')) {
        const email = params[0];
        const role = params[1];
        const profileData = JSON.parse(params[2] || '{}');
        const user = {
          id: 'user-' + nextUserId++,
          email,
          role,
          status: 'active',
          public_id: 'PUB-' + Math.floor(1000 + Math.random() * 9000),
          identity_codes: [],
          profile_data: profileData
        };
        appUsers[user.id] = user;
        return { rows: [user], rowCount: 1 };
      }

      // INSERT INTO sessions
      if (norm.startsWith('INSERT INTO sessions (account_id, token_hash, expires_at)')) {
        const session = {
          id: nextSessionId++,
          account_id: params[0],
          token_hash: params[1],
          expires_at: params[2]
        };
        sessions[session.token_hash] = session;
        return { rows: [session], rowCount: 1 };
      }

      // SELECT session
      if (norm.includes('FROM sessions s JOIN app_users u ON u.id = s.account_id WHERE s.token_hash = $1')) {
        const s = sessions[params[0]];
        if (s && appUsers[s.account_id]) {
          const u = appUsers[s.account_id];
          return {
            rows: [{
              account_id: u.id,
              role: u.role,
              status: u.status,
              public_id: u.public_id,
              profile_data: u.profile_data
            }],
            rowCount: 1
          };
        }
        return { rows: [], rowCount: 0 };
      }

      return { rows: [], rowCount: 0 };
    }
  };

  setPool(mockPool);
  const { url, close } = await createTestServer();

  t.after(async () => {
    await close();
  });

  // Helper to plant an OTP code
  const plantOtp = (contact, code, purpose = 'signup') => {
    const id = 'otp-' + Math.random();
    otpCodes[id] = {
      id,
      contact,
      code_hash: hashCode(code),
      purpose,
      consumed_at: null,
      attempt_count: 0
    };
  };

  await t.test('Test 1: Rejects unauthorized or arbitrary participant roles', async () => {
    plantOtp('hacker@ittova.com', '123456', 'signup');
    const res = await fetch(`${url}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: 'hacker@ittova.com',
        code: '123456',
        role: 'unauthorized_superadmin',
        purpose: 'signup',
        profile: { fullName: 'Hacker', company: 'Shadow Corp' }
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /select a valid participant account/i);
  });

  await t.test('Test 2: Rejects signup if missing company or full name', async () => {
    plantOtp('finance@bank.com', '123456', 'signup');
    const res = await fetch(`${url}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: 'finance@bank.com',
        code: '123456',
        role: 'finance_partner',
        purpose: 'signup',
        profile: { fullName: '', company: '' }
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Full name and company are required/i);
  });

  let financeToken = '';
  await t.test('Test 3: Successfully creates finance_partner account with valid OTP', async () => {
    plantOtp('capital@tatacapital.com', '654321', 'signup');
    const res = await fetch(`${url}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: 'capital@tatacapital.com',
        code: '654321',
        role: 'finance_partner',
        purpose: 'signup',
        profile: {
          fullName: 'Ananya Sharma',
          company: 'Tata Industrial Capital NBFC',
          participantRole: 'Bank / NBFC Financier'
        }
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.role, 'finance_partner');
    assert.ok(body.accountId);
    assert.equal(body.profileData.company, 'Tata Industrial Capital NBFC');

    const cookie = res.headers.get('set-cookie');
    assert.ok(cookie);
    financeToken = cookie.split(';')[0].split('=')[1];
  });

  await t.test('Test 4: Session resolution confirms finance_partner role permissions', async () => {
    assert.ok(financeToken);
    const session = await resolveSession(financeToken);
    assert.ok(session);
    assert.equal(session.role, 'finance_partner');
    assert.equal(session.status, 'active');
  });

  let materialToken = '';
  await t.test('Test 5: Successfully creates material_partner account with valid OTP', async () => {
    plantOtp('stock@jindalalloys.com', '789123', 'signup');
    const res = await fetch(`${url}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: 'stock@jindalalloys.com',
        code: '789123',
        role: 'material_partner',
        purpose: 'signup',
        profile: {
          fullName: 'Vikram Jindal',
          company: 'Jindal Precision Alloys & NABL Testing',
          participantRole: 'Raw Material & Testing Partner'
        }
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.role, 'material_partner');
    assert.ok(body.accountId);
    assert.equal(body.profileData.company, 'Jindal Precision Alloys & NABL Testing');

    const cookie = res.headers.get('set-cookie');
    assert.ok(cookie);
    materialToken = cookie.split(';')[0].split('=')[1];
  });

  await t.test('Test 6: Session resolution confirms material_partner role permissions', async () => {
    assert.ok(materialToken);
    const session = await resolveSession(materialToken);
    assert.ok(session);
    assert.equal(session.role, 'material_partner');
    assert.equal(session.status, 'active');
  });

  await t.test('Test 7: User registered with email and phone can log in using their phone number OTP', async () => {
    // Vikram Jindal registered in Test 5 with email 'stock@jindalalloys.com'
    // Let's attach a phone '+919876543210' to his profile
    const jindalUser = Object.values(appUsers).find(u => u.email === 'stock@jindalalloys.com');
    assert.ok(jindalUser);
    jindalUser.profile_data.phone = '+919876543210';

    // Now user requests/verifies OTP using their phone number for 'login' purpose
    plantOtp('+919876543210', '998877', 'login');
    const res = await fetch(`${url}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: '+919876543210',
        code: '998877',
        role: 'material_partner',
        purpose: 'login'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.accountId, jindalUser.id);
    assert.equal(body.role, 'material_partner');
  });
});
