import { Router } from 'express';
import { getPool } from '../db/pool.js';

const router = Router();

function normalizeContact({ email, phone } = {}) {
  if (typeof email !== 'string') {
    throw Object.assign(new Error('Enter a valid email address.'), { statusCode: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw Object.assign(new Error('Enter a valid email address.'), { statusCode: 400 });
  }

  if (typeof phone !== 'string' || !/^[+0-9 ().-]+$/.test(phone)) {
    throw Object.assign(new Error('Enter a phone number with its country code, for example +919876543210.'), { statusCode: 400 });
  }
  const normalizedPhone = phone.replace(/[ ().-]/g, '');
  if (!/^\+[1-9][0-9]{7,14}$/.test(normalizedPhone)) {
    throw Object.assign(new Error('Enter a phone number with its country code, for example +919876543210.'), { statusCode: 400 });
  }

  return { email: normalizedEmail, phone: normalizedPhone };
}

router.post('/', async (request, response) => {
  const { email, phone } = normalizeContact(request.body);
  const result = await getPool().query(
    `INSERT INTO visitor_contacts (email, phone)
     VALUES ($1, $2)
     ON CONFLICT (lower(email)) DO UPDATE
       SET phone = EXCLUDED.phone, updated_at = NOW()
     RETURNING email, phone`,
    [email, phone]
  );

  response.set('Cache-Control', 'no-store').json({ ...result.rows[0], stored: true });
});

export default router;
