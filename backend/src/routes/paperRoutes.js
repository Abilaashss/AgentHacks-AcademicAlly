const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');

// GET /api/papers/recent
router.get('/recent', paperController.getRecentPapers);

// GET /api/papers/:id
router.get('/:id', paperController.getPaperById);

// GET /api/papers/:id/summary
router.get('/:id/summary', paperController.getPaperSummary);

module.exports = router; 