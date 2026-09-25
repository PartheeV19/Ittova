function invalid(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export function normalizeEmail(value) {
  if (typeof value !== 'string') throw invalid('Enter a valid email address.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw invalid('Enter a valid email address.');
  }
  return email;
}

export function normalizePhone(value) {
  if (typeof value !== 'string' || !/^[+0-9 ().-]+$/.test(value)) {
    throw invalid('Enter a phone number with its country code, for example +919876543210.');
  }
  const phone = value.replace(/[ ().-]/g, '');
  if (!/^\+[1-9][0-9]{7,14}$/.test(phone)) {
    throw invalid('Enter a phone number with its country code, for example +919876543210.');
  }
  return phone;
}

export function parseOtpRequest(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw invalid('Invalid OTP request.');
  const purpose = body.purpose ?? 'signup';
  if (!['signup', 'login'].includes(purpose)) throw invalid('Invalid OTP purpose.');
  if (body.email !== undefined || body.phone !== undefined || body.deliveryChannels !== undefined) {
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    return { contact: email, email, phone, purpose, destinations: [email, phone] };
  }
  const contact = typeof body.contact === 'string' && body.contact.includes('@')
    ? normalizeEmail(body.contact) : normalizePhone(body.contact);
  return { contact, purpose, destinations: [contact], ...(contact.includes('@') ? { email: contact } : { phone: contact }) };
}
