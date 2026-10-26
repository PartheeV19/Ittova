import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { setPool } from '../db/pool.js';
import customerRoutes from '../routes/customers.routes.js';

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

  app.use('/customers', customerRoutes);

  // Error handler
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}/customers`,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Finding 4: Customer onboarding compliance, KYC documents & bank confirmation verification', async (t) => {
  let customers = {};

  const mockPool = {
    query: async (sql, params = []) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      // Check existing customer by account_id
      if (normalizedSql.startsWith('SELECT * FROM customers WHERE account_id = $1')) {
        const cust = Object.values(customers).find((c) => c.account_id === params[0]);
        return { rows: cust ? [cust] : [], rowCount: cust ? 1 : 0 };
      }

      // SELECT customer by id
      if (normalizedSql.startsWith('SELECT * FROM customers WHERE id = $1')) {
        const cust = customers[params[0]];
        return { rows: cust ? [cust] : [], rowCount: cust ? 1 : 0 };
      }

      // INSERT customer
      if (normalizedSql.startsWith('INSERT INTO customers')) {
        const [id, account_id, name, email, phone, location, profileJson] = params;
        const newCustomer = {
          id,
          account_id,
          name,
          email,
          phone,
          location,
          status: 'PENDING',
          profile: JSON.parse(profileJson),
          created_at: new Date().toISOString()
        };
        customers[id] = newCustomer;
        return { rows: [newCustomer], rowCount: 1 };
      }

      // UPDATE customer approve
      if (normalizedSql.startsWith('UPDATE customers SET status = \'APPROVED\'')) {
        const id = params[0];
        const creditTier = params[1];
        const creditLimit = params[2];
        const auditorNotes = params[3];
        const approvedBy = params[4];
        const approvedAt = params[5];

        if (!customers[id]) return { rows: [], rowCount: 0 };

        customers[id] = {
          ...customers[id],
          status: 'APPROVED',
          profile: {
            ...customers[id].profile,
            creditTier,
            creditLimit,
            bankVerified: true,
            kycVerified: true,
            auditorNotes,
            approvedBy,
            approvedAt
          },
          updated_at: new Date().toISOString()
        };

        return { rows: [customers[id]], rowCount: 1 };
      }

      // SELECT all
      if (normalizedSql.startsWith('SELECT * FROM customers ORDER BY created_at DESC')) {
        return { rows: Object.values(customers), rowCount: Object.values(customers).length };
      }

      return { rows: [], rowCount: 0 };
    }
  };

  setPool(mockPool);
  const server = await createTestServer();

  const customerUser = { accountId: 'acc-cust-101', role: 'customer', publicId: 'C-HYD-00101' };
  const staffUser = { accountId: 'acc-staff-auditor', role: 'staff' };

  try {
    await t.test('1. Rejects onboarding when bank confirmation document is missing', async () => {
      const payload = {
        name: 'Zenith Components Pvt Ltd',
        location: 'Hyderabad, Telangana',
        pan: 'AABCZ9876K',
        gst: '36AABCZ9876K1Z8',
        bankName: 'State Bank of India',
        bankAcc: '38472910548',
        bankIfsc: 'SBIN0004123',
        decTerms: true,
        decTruth: true,
        decNda: true,
        attachedDocs: [
          'Certificate_of_Incorporation.pdf',
          'Company_PAN_Card.pdf',
          'GST_REG06_Certificate.pdf'
          // Missing Cancelled_Cheque_Attested.pdf
        ]
      };

      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Bank confirmation document'));
    });

    await t.test('2. Rejects onboarding when statutory KYC documents (Incorporation, PAN, GST) are missing', async () => {
      const payload = {
        name: 'Zenith Components Pvt Ltd',
        location: 'Hyderabad, Telangana',
        pan: 'AABCZ9876K',
        gst: '36AABCZ9876K1Z8',
        bankName: 'State Bank of India',
        bankAcc: '38472910548',
        bankIfsc: 'SBIN0004123',
        decTerms: true,
        decTruth: true,
        decNda: true,
        attachedDocs: [
          'Cancelled_Cheque_Attested.pdf'
          // Missing Certificate_of_Incorporation, PAN, GST
        ]
      };

      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Mandatory statutory documents missing'));
    });

    await t.test('3. Rejects onboarding when statutory undertakings (Terms, Truthfulness, NDA) are unconfirmed', async () => {
      const payload = {
        name: 'Zenith Components Pvt Ltd',
        location: 'Hyderabad, Telangana',
        pan: 'AABCZ9876K',
        gst: '36AABCZ9876K1Z8',
        bankName: 'State Bank of India',
        bankAcc: '38472910548',
        bankIfsc: 'SBIN0004123',
        decTerms: false, // Unaccepted terms
        decTruth: true,
        decNda: true,
        attachedDocs: [
          'Cancelled_Cheque_Attested.pdf',
          'Certificate_of_Incorporation.pdf',
          'Company_PAN_Card.pdf',
          'GST_REG06_Certificate.pdf'
        ]
      };

      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('statutory undertakings'));
    });

    await t.test('4. Rejects onboarding when invalid IFSC code is provided', async () => {
      const payload = {
        name: 'Zenith Components Pvt Ltd',
        location: 'Hyderabad, Telangana',
        pan: 'AABCZ9876K',
        gst: '36AABCZ9876K1Z8',
        bankName: 'State Bank of India',
        bankAcc: '38472910548',
        bankIfsc: 'INVALID_IFSC_123',
        decTerms: true,
        decTruth: true,
        decNda: true,
        attachedDocs: [
          'Cancelled_Cheque_Attested.pdf',
          'Certificate_of_Incorporation.pdf',
          'Company_PAN_Card.pdf',
          'GST_REG06_Certificate.pdf'
        ]
      };

      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('IFSC code'));
    });

    await t.test('5. Successfully creates customer profile with complete verified KYC & bank proof', async () => {
      const validPayload = {
        name: 'Zenith Precision Components Pvt Ltd',
        location: 'Plot 45, IDA Industrial Estate, Hyderabad, Telangana',
        pan: 'AABCZ9876K',
        gst: '36AABCZ9876K1Z8',
        bankName: 'State Bank of India',
        bankBranch: 'Industrial Finance Branch, Punjagutta, Hyderabad',
        bankAcc: '38472910548',
        bankIfsc: 'SBIN0004123',
        reqCreditTier: '15 to 30 Day Credit',
        reqCreditLimit: '₹ 25,00,000',
        decTerms: true,
        decTruth: true,
        decNda: true,
        apprRail: true,
        attachedDocs: [
          'Certificate_of_Incorporation.pdf',
          'Company_PAN_Card.pdf',
          'GST_REG06_Certificate.pdf',
          'Cancelled_Cheque_Attested.pdf',
          'Audited_Financials_FY24_FY25.pdf',
          'ITR_Acknowledgments_AY24_AY25.pdf',
          'GSTR_3B_1_Last_6_Months.pdf',
          'Bank_Statements_6_Months.pdf',
          'RDSO_Approval_Certificate.pdf'
        ]
      };

      const res = await fetch(server.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify(validPayload)
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.status, 'PENDING');
      assert.equal(data.name, 'Zenith Precision Components Pvt Ltd');
      assert.equal(data.bankVerified, false);
      assert.equal(data.sectoralVerifications.railwayApproved, 'VERIFIED_DOCUMENTED');
    });

    await t.test('6. Rejects staff approval if bank confirmation proof is missing on record', async () => {
      // Manually tamper/insert customer with missing bank proof
      customers['C-INCOMPLETE'] = {
        id: 'C-INCOMPLETE',
        account_id: 'acc-cust-tampered',
        name: 'Tampered Co',
        status: 'PENDING',
        profile: {
          attachedDocs: ['Certificate_of_Incorporation.pdf'] // Missing bank cheque & PAN/GST
        }
      };

      const res = await fetch(`${server.url}/C-INCOMPLETE/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(staffUser)
        },
        body: JSON.stringify({ creditTier: 'Standard', creditLimit: '₹ 10,00,000' })
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Bank confirmation proof'));
    });

    await t.test('7. Staff approves customer with complete dossier, recording bank & KYC verification flags', async () => {
      const res = await fetch(`${server.url}/C-HYD-00101/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(staffUser)
        },
        body: JSON.stringify({
          creditTier: '15 to 30 Day Credit',
          creditLimit: '₹ 25,00,000',
          auditorNotes: 'Verified against MCA, GSTN portal and Attested SBI Cheque'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'APPROVED');
      assert.equal(data.bankVerified, true);
      assert.equal(data.kycVerified, true);
      assert.equal(data.approvedBy, 'acc-staff-auditor');
      assert.ok(data.approvedAt);
    });
  } finally {
    await server.close();
  }
});
