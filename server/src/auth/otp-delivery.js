function unavailable(message) {
  return Object.assign(new Error(message), { statusCode: 503 });
}

export function assertDeliveryConfigured({ email, phone }, env = process.env) {
  if (email && (!env.RESEND_API_KEY || !env.OTP_EMAIL_FROM)) throw unavailable('Email verification is not configured yet.');
  if (phone && (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID)) throw unavailable('SMS verification is not configured yet.');
}

// Acceptance by a provider does not confirm inbox or handset delivery.
export async function deliverOtp({ email, phone, code, id }, { env = process.env, fetchImpl = fetch } = {}) {
  assertDeliveryConfigured({ email, phone }, env);
  if (!/^[0-9]{6}$/.test(code)) throw new Error('Invalid generated OTP.');
  const requests = [];
  if (email) requests.push((async () => {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `otp-${id}` },
      body: JSON.stringify({
        from: env.OTP_EMAIL_FROM, to: [email], subject: 'Your ITOVA verification code',
        text: `Your ITOVA verification code is ${code}. It expires in 10 minutes. Do not share this code. If you did not request it, ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;color:#102a43;max-width:480px;margin:auto;padding:32px"><h1>IT<span style="color:#c41330">O</span>VA</h1><p>Your verification code</p><p style="font-size:32px;letter-spacing:8px;font-weight:bold">${code}</p><p>This code expires in 10 minutes. Do not share it.</p><p>If you did not request this code, ignore this email.</p></div>`
      })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.id) throw new Error('Email provider rejected request.');
    return email;
  })());
  if (phone) requests.push((async () => {
    const response = await fetchImpl('https://control.msg91.com/api/v5/flow', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { authkey: env.MSG91_AUTH_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ template_id: env.MSG91_TEMPLATE_ID,
        recipients: [{ mobiles: phone.slice(1), [env.MSG91_OTP_VARIABLE || 'OTP']: code }] })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.type !== 'success') throw new Error('SMS provider rejected request.');
    return phone;
  })());
  const results = await Promise.allSettled(requests);
  if (!results.length || results.some(result => result.status === 'rejected')) {
    throw unavailable('Could not send your verification code to all requested contacts. Please request a new code in a minute.');
  }
  return results.map(result => result.value);
}
