  import { Router } from 'express';
import { analyzeCadDrawing, SAMPLE_CAD_DRAWINGS } from '../services/cad-analyzer.service.js';

const router = Router();

/**
 * GET /api/v1/cad/presets
 * List all available preset CAD blueprints and drawings
 */
router.get('/presets', (_req, res) => {
  const presets = SAMPLE_CAD_DRAWINGS.map(p => ({ 
    id: p.id,
    title: p.title,
    drawingNo: p.drawingNo,
    partCategory: p.partCategory,
    material: p.material,
    rawStockSize: p.rawStockSize,
    netWeight: p.netWeight,
    primaryTolerance: p.primaryTolerance,
    drawingSvg: p.drawingSvg
  }));
  res.json({ presets });
});

/**
 * GET /api/v1/cad/status
 * Check CAD analyzer engine readiness & LLM vision status
 */
router.get('/status', (_req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API || process.env.GEMINI_API_KEY);
  res.json({
    status: hasGemini ? 'ready' : 'sample-only',
    engine: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    geminiVisionConfigured: hasGemini,
    uploadedDrawingAnalysisAvailable: hasGemini,
    samplePresetsAvailable: SAMPLE_CAD_DRAWINGS.length
  });
});

/**
 * POST /api/v1/cad/analyze
 * Comprehensive manufacturing process, tooling, and machine decomposition
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { imageBase64, mimeType, presetId, partHint, materialHint } = req.body || {};

    const hasPreset = typeof presetId === 'string' && presetId.trim().length > 0;
    const hasUpload = typeof imageBase64 === 'string' && imageBase64.trim().length > 0;

    if (hasPreset === hasUpload) {
      return res.status(400).json({
        error: 'Choose exactly one sample drawing or upload one PNG, JPG, WEBP, or PDF drawing.'
      });
    }

    const report = await analyzeCadDrawing({
      imageBase64,
      mimeType,
      presetId,
      partHint,
      materialHint
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
