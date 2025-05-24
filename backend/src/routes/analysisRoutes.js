const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// POST /api/analysis/trends
router.post('/trends', analysisController.analyzeTrends);

// POST /api/analysis/gaps
router.post('/gaps', analysisController.analyzeGaps);

// POST /api/analysis/literature-survey
router.post('/literature-survey', analysisController.generateLiteratureSurvey);

// POST /api/analysis/hypothesis
router.post('/hypothesis', analysisController.generateHypothesis);

module.exports = router; 