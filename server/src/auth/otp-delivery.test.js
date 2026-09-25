import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverOtp } from './otp-delivery.js';
import { createOtpRequester } from './otp-service.js';
import { createOtpRequestLimiter } from './otp-rate-limit.js';

const env = { RESEND_API_KEY: 'test-resend', OTP_EMAIL_FROM: 'ITOVA <otp@example.com>', MSG91_AUTH_KEY: 'test-sms', MSG91_TEMPLATE_ID: 'template', MSG91_OTP_VARIABLE: 'OTP' };
const input = { email: 'buyer@example.com', phone: '+919876543210', code: '123456', id: 'test-challenge' };
const ok = data => ({ ok: true, json: async () => data });

test('sends exactly the same code through Resend and MSG91 without returning the code', async () => {
  const calls = [];
  const result = await deliverOtp(input, { env, fetchImpl: async (url, options) => {
    calls.push({ url, ...options, payload: JSON.parse(options.body) });
    return ok(url.includes('resend') ? { id: 'email-id' } : { type: 'success' });
  } });
  assert.deepEqual(result, [input.email, input.phone]);
  const email = calls.find(call => call.url.includes('resend'));
  const sms = calls.find(call => call.url.includes('msg91'));
  assert.equal(email.headers.Authorization, 'Bearer test-resend');
  assert.equal(email.headers['Idempotency-Key'], 'otp-test-challenge');
  assert.ok(email.payload.text.includes(input.code));
  assert.ok(email.payload.html.includes(input.code));
  assert.equal(sms.payload.recipients[0].OTP, input.code);
  assert.equal(sms.payload.recipients[0].mobiles, '919876543210');
  assert.ok(!JSON.stringify(result).includes(input.code));
});

test('email-only delivery works with just Resend credentials', async () => {
  const accepted = await deliverOtp({ ...input, phone: undefined }, {
    env: { RESEND_API_KEY: 'test', OTP_EMAIL_FROM: env.OTP_EMAIL_FROM },
    fetchImpl: async url => { assert.equal(url, 'https://api.resend.com/emails'); return ok({ id: 'id' }); }
  });
  assert.deepEqual(accepted, [input.email]);
});

test('missing SMS setup fails before any email is sent', async () => {
  let called = false;
  await assert.rejects(deliverOtp(input, { env: { RESEND_API_KEY: 'test', OTP_EMAIL_FROM: env.OTP_EMAIL_FROM }, fetchImpl: async () => { called = true; } }), { statusCode: 503 });
  assert.equal(called, false);
});

for (const failure of ['http', 'payload', 'timeout', 'malformed']) {
  test(`provider ${failure} failure returns a safe error without pretending both messages were sent`, async () => {
    await assert.rejects(deliverOtp(input, { env, fetchImpl: async url => {
      if (url.includes('resend')) return ok({ id: 'email-id' });
      if (failure === 'timeout') throw new Error('private provider details');
      if (failure === 'malformed') return { ok: true, json: async () => { throw new Error('bad json'); } };
      return { ok: failure !== 'http', json: async () => ({ type: 'error', message: 'private provider details' }) };
    } }), error => error.statusCode === 503 && !error.message.includes('private provider details'));
  });
}

test('delivery failure revokes the code and never marks it usable', async () => {
  const events = [];
  const request = createOtpRequester({ configured: () => {}, issue: async () => ({ id: 'id', code: '123456' }),
    deliver: async () => { events.push('deliver'); throw new Error('delivery failed'); },
    accept: async () => events.push('accept'), revoke: async id => events.push(`revoke:${id}`) });
  await assert.rejects(request({ email: input.email, phone: input.phone }), /delivery failed/);
  assert.deepEqual(events, ['deliver', 'revoke:id']);
});

test('marks a challenge ready only after delivery and returns no secrets', async () => {
  const events = [];
  const request = createOtpRequester({ configured: () => {}, issue: async (contact, purpose, destinations) => {
    assert.equal(contact, input.email); assert.equal(purpose, 'login'); assert.deepEqual(destinations, [input.email, input.phone]);
    return { id: 'id', code: '123456' };
  }, deliver: async () => { events.push('deliver'); return [input.email, input.phone]; },
  accept: async () => events.push('accept'), revoke: async () => events.push('revoke') });
  const result = await request({ email: input.email, phone: input.phone, purpose: 'login' });
  assert.deepEqual(events, ['deliver', 'accept']);
  assert.equal(result.status, 'accepted'); assert.equal(result.expiresIn, 600);
  assert.ok(!JSON.stringify(result).includes('123456'));
});

test('IP burst limit blocks the eleventh request and recovers after its window', () => {
  let time = 0; let allowed = 0; let status;
  const limit = createOtpRequestLimiter(() => time);
  const response = { set() { return this; }, status(value) { status = value; return this; }, json() {} };
  for (let i = 0; i < 11; i++) limit({ ip: '127.0.0.1' }, response, () => allowed++);
  assert.equal(allowed, 10); assert.equal(status, 429);
  time = 900001;
  limit({ ip: '127.0.0.1' }, response, () => allowed++);
  assert.equal(allowed, 11);
});
