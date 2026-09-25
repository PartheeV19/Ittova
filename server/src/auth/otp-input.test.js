import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, normalizePhone, parseOtpRequest } from './otp-input.js';

test('normalizes the email and international phone for a shared challenge', () => {
  assert.deepEqual(parseOtpRequest({ email: ' Buyer@Example.com ', phone: '+91 98765 43210' }), {
    contact: 'buyer@example.com', email: 'buyer@example.com', phone: '+919876543210',
    purpose: 'signup', destinations: ['buyer@example.com', '+919876543210']
  });
});
test('requires both destinations for shared delivery', () => {
  for (const body of [{ email: 'a@example.com' }, { phone: '+919876543210' }, { deliveryChannels: ['email', 'sms'], contact: 'a@example.com' }]) {
    assert.throws(() => parseOtpRequest(body), { statusCode: 400 });
  }
});
test('rejects malformed or ambiguous destinations', () => {
  for (const value of ['', 'a@', 'a b@example.com', {}, null]) assert.throws(() => normalizeEmail(value));
  for (const value of ['9876543210', '+0123456789', '+91hello9876543210', {}, null]) assert.throws(() => normalizePhone(value));
});
test('supports existing single-contact login and rejects unknown purposes', () => {
  assert.equal(parseOtpRequest({ contact: 'A@example.com', purpose: 'login' }).contact, 'a@example.com');
  assert.equal(parseOtpRequest({ contact: '+1 (202) 555-0100' }).phone, '+12025550100');
  assert.throws(() => parseOtpRequest({ contact: 'a@example.com', purpose: 'reset-admin' }), { statusCode: 400 });
});
