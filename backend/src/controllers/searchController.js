const searchService = require('../services/searchService');

// Search for papers based on query
exports.searchPapers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required' 
      });
    }
    
    const results = await searchService.searchPapers(query);
    
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in searchPapers controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while searching for papers',
      error: error.message
    });
  }
}; 