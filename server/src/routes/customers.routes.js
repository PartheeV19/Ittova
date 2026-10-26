import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ensureAccountPublicId } from '../auth/user-id.js';

const router = Router();

function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    status: row.status,
    ...row.profile,
    createdAt: row.created_at
  };
}

// Statutory and Banking Validation Helpers
function validateCustomerOnboardingPayload(name, location, profileFields) {
  if (!name || !name.trim()) {
    return 'A company/customer legal name is required.';
  }
  if (!location || !location.trim()) {
    return 'Company registered or plant location is required.';
  }

  // Identity / Statutory numbers
  const pan = (profileFields.pan || '').trim().toUpperCase();
  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    return 'A valid 10-character PAN number is required (e.g. AABCZ9876K).';
  }

  const gst = (profileFields.gst || '').trim().toUpperCase();
  if (!gst || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
    return 'A valid 15-character GSTIN registration number is required (e.g. 36AABCZ9876K1Z8).';
  }

  // Banking details & verification
  const bankName = (profileFields.bankName || '').trim();
  const bankAcc = (profileFields.bankAcc || '').trim();
  const bankIfsc = (profileFields.bankIfsc || '').trim().toUpperCase();

  if (!bankName) {
    return 'Settlement bank name is required.';
  }
  if (!bankAcc || bankAcc.length < 8) {
    return 'A valid bank account number is required.';
  }
  if (!bankIfsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc)) {
    return 'A valid 11-character Indian IFSC code is required (e.g. SBIN0004123).';
  }

  // Document attachments validation
  const attachedDocs = Array.isArray(profileFields.attachedDocs) ? profileFields.attachedDocs : [];
  const hasBankProof = attachedDocs.some(d => /cheque|bank_statement|bank_header/i.test(d));
  if (!hasBankProof) {
    return 'Bank confirmation document (cancelled cheque or certified bank statement) is mandatory to verify bank details.';
  }

  const hasIncorporation = attachedDocs.some(d => /incorporation|registration_deed/i.test(d));
  const hasPanDoc = attachedDocs.some(d => /pan/i.test(d));
  const hasGstDoc = attachedDocs.some(d => /gst/i.test(d));

  if (!hasIncorporation || !hasPanDoc || !hasGstDoc) {
    return 'Mandatory statutory documents missing: Certificate of Incorporation, PAN card, and GST certificate must be attached.';
  }

  // Undertakings & Declarations
  if (!profileFields.decTerms || !profileFields.decTruth || !profileFields.decNda) {
    return 'All statutory undertakings (Terms of Use, KYC truthfulness, and Mutual NDA) must be affirmatively agreed and certified.';
  }

  // Credit Tier underwriting requirements
  const reqTier = profileFields.reqCreditTier || 'Cash / Advance';
  if (!reqTier.includes('Cash') && !reqTier.includes('Advance')) {
    const hasFinancials = attachedDocs.some(d => /financial|balance_sheet|audited/i.test(d));
    const hasItr = attachedDocs.some(d => /itr/i.test(d));
    const hasStatements = attachedDocs.some(d => /statement/i.test(d));

    if (!hasFinancials || !hasItr || !hasStatements) {
      return 'Audited financials (last 2 years), ITR acknowledgments, and 6-month bank statements are mandatory for non-advance credit underwriting.';
    }
  }

  return null;
}

// Create the customer profile for the signed-in account (post OTP-verify).
// One profile per app_users row -- a second call just returns the existing one.
router.post('/', requireAuth, requireRole('customer'), async (request, response) => {
  const { name, email, phone, location, accountLocation, ...profileFields } = request.body || {};

  const validationError = validateCustomerOnboardingPayload(name, location, profileFields);
  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  const pool = getPool();
  const existing = await pool.query('SELECT * FROM customers WHERE account_id = $1', [request.user.accountId]);
  if (existing.rowCount > 0) {
    return response.json(toApiShape(existing.rows[0]));
  }

  let id = request.user.publicId;
  if (!id) {
    const identity = await ensureAccountPublicId(pool, request.user.accountId, accountLocation);
    if (identity.error) return response.status(400).json({ error: identity.error });
    id = identity.publicId;
  }

  // Record audit verification flags for sectoral claims
  const attachedDocs = Array.isArray(profileFields.attachedDocs) ? profileFields.attachedDocs : [];
  const sectoralVerifications = {
    railwayApproved: profileFields.apprRail ? (attachedDocs.some(d => /rdso|rail/i.test(d)) ? 'VERIFIED_DOCUMENTED' : 'PENDING_DOCUMENT_AUDIT') : 'NOT_CLAIMED',
    defenseApproved: profileFields.apprDef ? (attachedDocs.some(d => /defense|dgqa|mod/i.test(d)) ? 'VERIFIED_DOCUMENTED' : 'PENDING_DOCUMENT_AUDIT') : 'NOT_CLAIMED',
    aeroApproved: profileFields.apprAero ? (attachedDocs.some(d => /as9100|iso/i.test(d)) ? 'VERIFIED_DOCUMENTED' : 'PENDING_DOCUMENT_AUDIT') : 'NOT_CLAIMED',
    autoApproved: profileFields.apprAuto ? (attachedDocs.some(d => /iatf/i.test(d)) ? 'VERIFIED_DOCUMENTED' : 'PENDING_DOCUMENT_AUDIT') : 'NOT_CLAIMED'
  };

  const enrichedProfile = {
    ...profileFields,
    bankVerified: false,
    kycVerified: false,
    sectoralVerifications,
    submittedAt: new Date().toISOString()
  };

  const inserted = await pool.query(
    `INSERT INTO customers (id, account_id, name, email, phone, location, status, profile)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
     ON CONFLICT (account_id) DO NOTHING
     RETURNING *`,
    [id, request.user.accountId, name.trim(), email || null, phone || null, location.trim(), JSON.stringify(enrichedProfile)]
  );

  if (!inserted.rowCount) {
    const concurrent = await pool.query('SELECT * FROM customers WHERE account_id = $1', [request.user.accountId]);
    return response.json(toApiShape(concurrent.rows[0]));
  }

  response.status(201).json(toApiShape(inserted.rows[0]));
});

// Staff/admin: full list, for the onboarding queue and lookups.
router.get('/', requireAuth, requireRole('staff', 'admin'), async (_request, response) => {
  const result = await getPool().query('SELECT * FROM customers ORDER BY created_at DESC');
  response.json(result.rows.map(toApiShape));
});

// The signed-in customer's own profile.
router.get('/me', requireAuth, requireRole('customer'), async (request, response) => {
  const result = await getPool().query('SELECT * FROM customers WHERE account_id = $1', [request.user.accountId]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'No customer profile yet.' });
  response.json(toApiShape(result.rows[0]));
});

// Single customer -- the owning customer, or staff/admin.
router.get('/:id', requireAuth, async (request, response) => {
  const result = await getPool().query('SELECT * FROM customers WHERE id = $1', [request.params.id]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'Customer not found.' });

  const row = result.rows[0];
  const isOwner = row.account_id === request.user.accountId;
  const isStaff = ['staff', 'admin'].includes(request.user.role);
  if (!isOwner && !isStaff) return response.status(403).json({ error: 'Not permitted.' });

  response.json(toApiShape(row));
});

// Staff/admin: KYC + credit approval.
router.patch('/:id/approve', requireAuth, requireRole('staff', 'admin'), async (request, response) => {
  const { creditTier, creditLimit, auditorNotes } = request.body || {};
  const pool = getPool();

  const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [request.params.id]);
  if (customerResult.rowCount === 0) return response.status(404).json({ error: 'Customer not found.' });

  const customer = customerResult.rows[0];
  const profile = customer.profile || {};
  const attachedDocs = Array.isArray(profile.attachedDocs) ? profile.attachedDocs : [];

  // Verify mandatory documents are present before approval
  const hasBankProof = attachedDocs.some(d => /cheque|bank_statement|bank_header/i.test(d));
  const hasIncorporation = attachedDocs.some(d => /incorporation|registration_deed/i.test(d));
  const hasPanDoc = attachedDocs.some(d => /pan/i.test(d));
  const hasGstDoc = attachedDocs.some(d => /gst/i.test(d));

  if (!hasBankProof || !hasIncorporation || !hasPanDoc || !hasGstDoc) {
    return response.status(400).json({
      error: 'Cannot approve customer: Bank confirmation proof and statutory KYC documents (Incorporation, PAN, GST) must be verified.'
    });
  }

  const result = await pool.query(
    `UPDATE customers
     SET status = 'APPROVED',
         profile = profile || jsonb_build_object(
           'creditTier', $2::text,
           'creditLimit', $3::text,
           'bankVerified', true,
           'kycVerified', true,
           'auditorNotes', $4::text,
           'approvedBy', $5::text,
           'approvedAt', $6::text
         ),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      request.params.id,
      creditTier || profile.reqCreditTier || 'Cash / Advance',
      creditLimit || profile.reqCreditLimit || 'Pending Sanction',
      auditorNotes || 'Verified against MCA, GSTN and Attested Bank Cheque',
      request.user.accountId,
      new Date().toISOString()
    ]
  );

  response.json(toApiShape(result.rows[0]));
});

export default router;
