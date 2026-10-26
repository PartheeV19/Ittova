import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { setPool } from '../db/pool.js';
import projectRoutes from '../routes/projects.routes.js';
import {
  calculateProjectFinancials,
  processCustomerPayment,
  processVendorPayout
} from '../services/payment-settlement.service.js';

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

  app.use('/projects', projectRoutes);

  // Error handler
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}/projects`,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Finding 5: Commercial payment gateway, tax calculation & vendor escrow settlement', async (t) => {
  await t.test('1. calculateProjectFinancials computes correct GST (18%) and supplier facilitation fee', () => {
    const payload = {
      drawings: [
        {
          dwgNo: 'DWG-001',
          processes: [
            { stageId: 1, name: 'CNC Milling', price: 20000 },
            { stageId: 2, name: 'Surface Grinding', price: 10000 }
          ]
        }
      ],
      logisticsFee: 5000
    };

    const fin = calculateProjectFinancials(payload);
    assert.equal(fin.manufacturingFee, 30000);
    assert.equal(fin.logisticsFee, 5000);
    assert.equal(fin.subtotal, 35000);
    assert.equal(fin.taxAmount, Math.round(35000 * 0.18)); // 6300
    assert.equal(fin.totalPayable, 41300);
    assert.equal(fin.platformFee, 1500); // 5% of 30000
    assert.equal(fin.netSupplierPayout, 28500);
  });

  await t.test('2. processCustomerPayment generates structured receipt and prevents double settlement', () => {
    const project = {
      id: 'PRJ-TEST-101',
      customer_id: 'C-HYD-00101',
      payload: {
        logisticsFee: 4500,
        custPaymentStatus: 'PENDING'
      }
    };

    const customer = {
      id: 'C-HYD-00101',
      name: 'Zenith Precision Components Pvt Ltd',
      creditTier: '15 to 30 Day Credit'
    };

    const result = processCustomerPayment({
      project,
      customer,
      paymentDetails: { paymentMethod: 'CREDIT_LINE' }
    });

    assert.ok(result.receipt.receiptId.startsWith('RCP-'));
    assert.equal(result.receipt.invoiceNumber, 'INV-ITV-PRJ-TEST-101');
    assert.equal(result.receipt.paymentMethod, 'CREDIT_LINE');
    assert.equal(result.receipt.status, 'CAPTURED');
    assert.equal(result.patch.custPaymentStatus, 'PAID');
    assert.ok(result.receipt.amountPaid > 0);

    // Test idempotency: second call must throw error
    assert.throws(
      () => {
        processCustomerPayment({
          project: { ...project, payload: { ...project.payload, custPaymentStatus: 'PAID' } },
          customer
        });
      },
      /already been settled/
    );
  });

  await t.test('3. processVendorPayout generates UTR banking settlement receipt', () => {
    const project = {
      id: 'PRJ-TEST-101',
      payload: {
        vendorPaymentStatus: 'PENDING'
      }
    };

    const vendor = {
      id: 'V-HYD-00201',
      name: 'AeroMach Technologies Pvt Ltd',
      bankName: 'HDFC Bank',
      bankAcc: '50200012345678',
      bankIfsc: 'HDFC0001234'
    };

    const result = processVendorPayout({
      project,
      vendor,
      payoutDetails: { utrNumber: 'UTR-TEST-888999' }
    });

    assert.ok(result.receipt.payoutId.startsWith('POUT-'));
    assert.equal(result.receipt.utrNumber, 'UTR-TEST-888999');
    assert.equal(result.receipt.settlementAccount.accountMasked, '••••5678');
    assert.equal(result.receipt.settlementAccount.ifsc, 'HDFC0001234');
    assert.equal(result.receipt.status, 'SETTLED');
    assert.equal(result.patch.vendorPaymentStatus, 'PAID');

    // Test idempotency: second call must throw error
    assert.throws(
      () => {
        processVendorPayout({
          project: { ...project, payload: { ...project.payload, vendorPaymentStatus: 'PAID' } },
          vendor
        });
      },
      /already been authorized/
    );
  });

  // End-to-end API Route tests
  let projects = {};
  let customers = {};
  let vendors = {};

  const mockPool = {
    query: async (sql, params = []) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      // SELECT customers
      if (normalizedSql.startsWith('SELECT id, status FROM customers WHERE account_id = $1')) {
        const cust = Object.values(customers).find((c) => c.account_id === params[0]);
        return { rows: cust ? [cust] : [], rowCount: cust ? 1 : 0 };
      }
      if (normalizedSql.startsWith('SELECT id FROM customers WHERE account_id = $1')) {
        const cust = Object.values(customers).find((c) => c.account_id === params[0]);
        return { rows: cust ? [{ id: cust.id }] : [], rowCount: cust ? 1 : 0 };
      }

      // SELECT vendors
      if (normalizedSql.startsWith('SELECT * FROM vendors WHERE id = $1')) {
        const v = vendors[params[0]];
        return { rows: v ? [v] : [], rowCount: v ? 1 : 0 };
      }

      // SELECT projects WHERE id = $1
      if (normalizedSql.startsWith('SELECT * FROM projects WHERE id = $1')) {
        const p = projects[params[0]];
        return { rows: p ? [p] : [], rowCount: p ? 1 : 0 };
      }
      if (normalizedSql.startsWith('SELECT status FROM projects WHERE id = $1')) {
        const p = projects[params[0]];
        return { rows: p ? [{ status: p.status }] : [], rowCount: p ? 1 : 0 };
      }

      // UPDATE projects
      if (normalizedSql.startsWith('UPDATE projects SET status = COALESCE($2, status), payload = payload || $3::jsonb')) {
        const id = params[0];
        const newStatus = params[1];
        const patch = JSON.parse(params[2]);
        const p = projects[id];
        if (!p) return { rows: [], rowCount: 0 };

        p.status = newStatus || p.status;
        p.payload = { ...p.payload, ...patch };
        p.updated_at = new Date().toISOString();
        return { rows: [p], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    }
  };

  setPool(mockPool);
  const server = await createTestServer();

  const customerUser = { accountId: 'acc-cust-101', role: 'customer' };
  const adminUser = { accountId: 'acc-admin-001', role: 'admin' };
  const supplierUser = { accountId: 'acc-supp-201', role: 'supplier' };

  customers['C-HYD-00101'] = {
    id: 'C-HYD-00101',
    account_id: 'acc-cust-101',
    name: 'Zenith Precision Components Pvt Ltd',
    status: 'APPROVED',
    profile: { creditTier: '15 to 30 Day Credit' }
  };

  vendors['V-HYD-00201'] = {
    id: 'V-HYD-00201',
    account_id: 'acc-supp-201',
    name: 'AeroMach CNC Works',
    status: 'APPROVED',
    bankName: 'HDFC Bank',
    bankAcc: '50200012345678',
    bankIfsc: 'HDFC0001234'
  };

  try {
    await t.test('4. Rejects customer payment if project is not in PENDING_CUST_PAYMENT status', async () => {
      projects['PRJ-STAGE-ERR'] = {
        id: 'PRJ-STAGE-ERR',
        customer_id: 'C-HYD-00101',
        status: 'CUSTOMER_SCOPE_PENDING',
        payload: { custPaymentStatus: 'PENDING' }
      };

      const res = await fetch(`${server.url}/PRJ-STAGE-ERR/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify({ paymentMethod: 'NETBANKING' })
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.ok(data.error.includes('PENDING_CUST_PAYMENT'));
    });

    await t.test('5. Successfully settles customer payment via gateway and transitions to PAYMENT_COMPLETED_PENDING_DISPATCH', async () => {
      projects['PRJ-PAY-OK'] = {
        id: 'PRJ-PAY-OK',
        customer_id: 'C-HYD-00101',
        status: 'PENDING_CUST_PAYMENT',
        payload: {
          logisticsFee: 4500,
          custPaymentStatus: 'PENDING',
          selectedVendor: 'V-HYD-00201'
        }
      };

      const res = await fetch(`${server.url}/PRJ-PAY-OK/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(customerUser)
        },
        body: JSON.stringify({
          paymentMethod: 'CREDIT_LINE',
          transactionRef: 'CRD-SANCTION-9921'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'PAYMENT_COMPLETED_PENDING_DISPATCH');
      assert.equal(data.custPaymentStatus, 'PAID');
      assert.ok(data.paymentReceipt);
      assert.equal(data.paymentReceipt.transactionRef, 'CRD-SANCTION-9921');
      assert.equal(data.paymentReceipt.paymentMethod, 'CREDIT_LINE');
      assert.ok(data.paymentReceipt.amountPaid > 0);
    });

    await t.test('6. Rejects vendor payout when called by non-admin role', async () => {
      const res = await fetch(`${server.url}/PRJ-PAY-OK/pay-vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(supplierUser)
        },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 403);
    });

    await t.test('7. Admin authorizes supplier payout with generated UTR settlement receipt', async () => {
      const res = await fetch(`${server.url}/PRJ-PAY-OK/pay-vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user': JSON.stringify(adminUser)
        },
        body: JSON.stringify({
          payoutMode: 'NEFT_RTGS',
          utrNumber: 'UTR-BANK-777888'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.vendorPaymentStatus, 'PAID');
      assert.ok(data.vendorPayoutReceipt);
      assert.equal(data.vendorPayoutReceipt.utrNumber, 'UTR-BANK-777888');
      assert.equal(data.vendorPayoutReceipt.status, 'SETTLED');
      assert.equal(data.vendorPayoutReceipt.settlementAccount.ifsc, 'HDFC0001234');
    });
  } finally {
    await server.close();
  }
});
