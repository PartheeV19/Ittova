import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { setPool } from '../db/pool.js';
import { createSession, resolveSession, sessionCookieOptions, SESSION_TTL_MS } from '../auth/session.js';

test('Session Inactivity Timeout & Sliding Window', async (t) => {
  await t.test('1. SESSION_TTL_MS is set to exactly 1 hour (3,600,000 ms)', () => {
    assert.equal(SESSION_TTL_MS, 60 * 60 * 1000);
    const cookieOpts = sessionCookieOptions();
    assert.equal(cookieOpts.maxAge, 60 * 60 * 1000);
  });

  await t.test('2. createSession issues session with 1 hour expiry', async () => {
    let insertedRow = null;
    setPool({
      query: async (sql, params) => {
        if (sql.includes('INSERT INTO sessions')) {
          insertedRow = { accountId: params[0], tokenHash: params[1], expiresAt: params[2] };
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
    });

    const before = Date.now();
    const { rawToken, expiresAt } = await createSession('test-account-id');
    const after = Date.now();

    assert.ok(rawToken && rawToken.length === 64);
    assert.ok(expiresAt instanceof Date);
    const expectedExpiry = before + SESSION_TTL_MS;
    assert.ok(expiresAt.getTime() >= expectedExpiry && expiresAt.getTime() <= after + SESSION_TTL_MS);
    assert.equal(insertedRow.accountId, 'test-account-id');
  });

  await t.test('3. resolveSession extends expires_at when past the touch threshold (sliding window)', async () => {
    const rawToken = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const hashed = createHash('sha256').update(rawToken).digest('hex');
    let updatedExpiresAt = null;

    // Remaining time: 40 minutes (less than 55 minutes threshold)
    const existingExpiresAt = new Date(Date.now() + 40 * 60 * 1000);

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT s.id, s.account_id, s.expires_at')) {
          if (params[0] === hashed) {
            return {
              rows: [{
                id: 'session-uuid-1',
                account_id: 'user-uuid-1',
                expires_at: existingExpiresAt,
                role: 'supplier',
                status: 'active',
                public_id: 'VEND-123',
                profile_data: { company: 'Test Mfg' },
                email: 'supplier@test.com'
              }],
              rowCount: 1
            };
          }
        }
        if (sql.includes('UPDATE sessions SET expires_at = $1 WHERE id = $2')) {
          updatedExpiresAt = params[0];
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
    });

    const user = await resolveSession(rawToken);
    assert.ok(user);
    assert.equal(user.role, 'supplier');
    assert.equal(user.email, 'supplier@test.com');

    // Verify touch update query was called to push expires_at to now + 1 hour
    assert.ok(updatedExpiresAt instanceof Date);
    const diff = updatedExpiresAt.getTime() - Date.now();
    assert.ok(diff >= (59 * 60 * 1000) && diff <= (60 * 60 * 1000) + 1000);
  });

  await t.test('4. resolveSession returns null when expired or invalid', async () => {
    setPool({
      query: async () => ({ rows: [], rowCount: 0 })
    });

    const user = await resolveSession('non-existent-or-expired-token');
    assert.equal(user, null);
  });
});
