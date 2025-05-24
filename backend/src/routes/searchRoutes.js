const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /api/search?query=<search_term>
router.get('/', searchController.searchPapers);

module.exports = router; 