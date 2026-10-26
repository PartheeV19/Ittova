import 'dotenv/config';
import { closePool, getPool } from './pool.js';
import { hashPassword } from '../auth/password.js';

export const DEFAULT_BOOTSTRAP_ACCOUNTS = [
  {
    name: 'ITTOVA Administrator',
    email: 'admin@ittova.com',
    authRole: 'admin',
    operationalRole: 'ADMIN',
    title: 'Platform Chief Administrator',
    staffId: 'S-ROOT-ADMIN'
  },
  {
    name: 'K. S. Narayanan',
    email: 'customer.audit@ittova.com',
    authRole: 'staff',
    operationalRole: 'CUSTOMER_AUDIT',
    title: 'Senior Corporate Underwriter & KYC Auditor',
    staffId: 'S-CUST-AUDIT'
  },
  {
    name: 'Rajesh Varma',
    email: 'vendor.audit@ittova.com',
    authRole: 'staff',
    operationalRole: 'VENDOR_AUDIT',
    title: 'Lead Supplier Quality & Facility Auditor',
    staffId: 'S-VEND-AUDIT'
  },
  {
    name: 'Dr. Anita Desai',
    email: 'process.validator@ittova.com',
    authRole: 'staff',
    operationalRole: 'PROCESS_VALIDATOR',
    title: 'Chief Manufacturing & CAM Process Engineer',
    staffId: 'S-PROC-VAL'
  },
  {
    name: 'Vikram Mehta',
    email: 'vendor.validator@ittova.com',
    authRole: 'staff',
    operationalRole: 'VENDOR_VALIDATOR',
    title: 'Strategic Sourcing Manager & Commercial Lead',
    staffId: 'S-VEND-VAL'
  },
  {
    name: 'Sunil Rao',
    email: 'logistics@ittova.com',
    authRole: 'logistics',
    operationalRole: 'LOGISTICS',
    title: 'National Logistics & Freight Operations Manager',
    staffId: 'S-LOGISTICS'
  },
  {
    name: 'P. Venkatraman',
    email: 'inspector@ittova.com',
    authRole: 'inspector',
    operationalRole: 'INSPECTOR',
    title: 'Chief Dimensional QA & CMM Inspector',
    staffId: 'S-INSPECTOR'
  }
];

export async function bootstrapStaffAccounts(pool = getPool(), options = {}) {
  const defaultPassword = options.password || process.env.DEFAULT_STAFF_PASSWORD || 'Ittova@2026!';
  const passwordHash = await hashPassword(defaultPassword);
  const provisioned = [];

  for (const acct of DEFAULT_BOOTSTRAP_ACCOUNTS) {
    const existing = await pool.query(
      'SELECT id FROM app_users WHERE lower(email) = lower($1)',
      [acct.email]
    );

    if (existing.rowCount > 0) {
      // Ensure staff record exists
      await pool.query(
        `INSERT INTO staff (id, account_id, name, role, title, profile)
         VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, title = EXCLUDED.title`,
        [acct.staffId, existing.rows[0].id, acct.name, acct.operationalRole, acct.title]
      );
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO app_users (email, password_hash, role, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id`,
        [acct.email.toLowerCase(), passwordHash, acct.authRole]
      );

      const staffRes = await client.query(
        `INSERT INTO staff (id, account_id, name, role, title, profile)
         VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, title = EXCLUDED.title
         RETURNING *`,
        [acct.staffId, userRes.rows[0].id, acct.name, acct.operationalRole, acct.title]
      );

      await client.query('COMMIT');
      provisioned.push(staffRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return provisioned;
}

// CLI Execution entry point
if (process.argv[1] && process.argv[1].endsWith('bootstrap.js')) {
  try {
    console.log('Running ITTOVA staff & administrator bootstrap...');
    const result = await bootstrapStaffAccounts();
    console.log(`Successfully bootstrapped ${result.length} accounts. All departmental staff initialized.`);
  } catch (err) {
    console.error('Bootstrap failed:', err.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}
