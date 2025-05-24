const paperService = require('../services/paperService');

// Get paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper ID is required' 
      });
    }
    
    const paper = await paperService.getPaperById(id);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: paper
    });
  } catch (error) {
    console.error('Error in getPaperById controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching the paper',
      error: error.message
    });
  }
};

// Get paper summary
exports.getPaperSummary = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper ID is required' 
      });
    }
    
    const summary = await paperService.getSummary(id);
    
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error in getPaperSummary controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while generating the summary',
      error: error.message
    });
  }
};

// Get recent papers
exports.getRecentPapers = async (req, res) => {
  try {
    const recentPapers = await paperService.getRecentPapers();
    
    return res.status(200).json({
      success: true,
      data: recentPapers
    });
  } catch (error) {
    console.error('Error in getRecentPapers controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching recent papers',
      error: error.message
    });
  }
}; 