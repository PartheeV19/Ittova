import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCadDrawing, SAMPLE_CAD_DRAWINGS } from '../services/cad-analyzer.service.js';

test('Finding 3: Real CAD drawing submission & CAM/DFM decomposition', async (t) => {
  await t.test('1. Loads preset drawing analysis accurately with drawing SVG and callouts', async () => {
    const res = await analyzeCadDrawing({ presetId: 'shaft-precision-drive' });
    assert.equal(res.source, 'sample-preset');
    assert.ok(res.drawingSvg);
    assert.equal(res.drawingNo, 'ITV-DWG-7081-REV-C');
    assert.ok(res.analysis.operations.length > 0);
    assert.ok(res.analysis.operations[0].subordinatedDrawingRef.balloonId);
  });

  await t.test('2. Fails with 404 on nonexistent preset ID', async () => {
    await assert.rejects(
      async () => {
        await analyzeCadDrawing({ presetId: 'nonexistent-dwg-999' });
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        return true;
      }
    );
  });

  await t.test('3. Generates structured local CAM decomposition when GEMINI_API_KEY is not set', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    const origAltKey = process.env.GEMINI_API;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API;

    try {
      // 1x1 transparent PNG in base64
      const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await analyzeCadDrawing({
        imageBase64: dummyPngBase64,
        mimeType: 'image/png',
        partHint: 'Turbine Housing Flange',
        materialHint: 'SS316L'
      });

      assert.equal(res.source, 'local-deterministic');
      assert.ok(res.analysis);
      assert.ok(res.analysis.operations.length >= 3, 'Must have at least 3 operations');
      assert.equal(res.analysis.material, 'SS316L');
      assert.ok(res.analysis.machinesSummary.length > 0);
      assert.ok(res.analysis.dfmRecommendations.length > 0);

      // Verify operations have required fields for the quoting and scheduling engine
      const op = res.analysis.operations[0];
      assert.ok(op.opNumber);
      assert.ok(op.name);
      assert.ok(op.machineCategory);
      assert.ok(op.estimatedCycleTimeSec > 0);
    } finally {
      if (origKey) process.env.GEMINI_API_KEY = origKey;
      if (origAltKey) process.env.GEMINI_API = origAltKey;
    }
  });

  await t.test('4. Uploaded drawing without cloud consent routes strictly to on-premise engine despite configured API key', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'mock-test-key-for-governance';

    try {
      const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await analyzeCadDrawing({
        imageBase64: dummyPngBase64,
        mimeType: 'image/png',
        partHint: 'Proprietary Defense Missile Fin',
        materialHint: 'Titanium Ti-6Al-4V',
        consentToCloudAnalysis: false // User opted out or did not consent
      });

      assert.equal(res.source, 'local-deterministic');
      assert.equal(res.dataGovernance.cloudTransmission, false);
      assert.equal(res.dataGovernance.consentGiven, false);
      assert.match(res.notice, /Proprietary IP Protection/i);
      assert.match(res.dataGovernance.disclosure, /Zero cloud transmission/i);
    } finally {
      if (origKey) process.env.GEMINI_API_KEY = origKey;
      else delete process.env.GEMINI_API_KEY;
    }
  });

  await t.test('5. Preset sample drawings include benchmark non-confidential governance metadata', async () => {
    const res = await analyzeCadDrawing({ presetId: 'spur-gear-precision' });
    assert.equal(res.source, 'sample-preset');
    assert.ok(res.dataGovernance);
    assert.equal(res.dataGovernance.classification, 'PUBLIC_BENCHMARK_PRESET');
    assert.equal(res.dataGovernance.cloudTransmission, false);
  });
});
