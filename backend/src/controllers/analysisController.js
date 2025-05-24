const analysisService = require('../services/analysisService');

// Analyze trends in research papers
exports.analyzeTrends = async (req, res) => {
  try {
    const { paperIds, topic } = req.body;
    
    if (!paperIds || !Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper IDs array is required' 
      });
    }
    
    const trends = await analysisService.analyzeTrends(paperIds, topic);
    
    return res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error in analyzeTrends controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while analyzing trends',
      error: error.message
    });
  }
};

// Analyze research gaps
exports.analyzeGaps = async (req, res) => {
  try {
    const { paperIds, topic, researchQuestion } = req.body;
    
    if (!paperIds || !Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper IDs array is required' 
      });
    }
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic is required' 
      });
    }
    
    const gaps = await analysisService.analyzeGaps(paperIds, topic, researchQuestion);
    
    return res.status(200).json({
      success: true,
      data: gaps
    });
  } catch (error) {
    console.error('Error in analyzeGaps controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while analyzing research gaps',
      error: error.message
    });
  }
};

// Generate literature survey
exports.generateLiteratureSurvey = async (req, res) => {
  try {
    const { paperIds, topic } = req.body;
    
    if (!paperIds || !Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one paper ID is required' 
      });
    }
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic is required' 
      });
    }
    
    const result = await analysisService.generateLiteratureSurvey(paperIds, topic);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in literature survey controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while generating the literature survey',
      error: error.message
    });
  }
};

// Generate and validate a novel hypothesis
exports.generateHypothesis = async (req, res) => {
  try {
    const { paperIds, topic } = req.body;
    if (!paperIds || !Array.isArray(paperIds) || paperIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper IDs array is required' 
      });
    }
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic is required' 
      });
    }
    const result = await analysisService.generateHypothesis(paperIds, topic);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in generateHypothesis controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while generating the hypothesis',
      error: error.message
    });
  }
}; 