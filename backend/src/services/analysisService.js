const paperService = require('./paperService');
const llmService = require('./llmService');

// Analyze trends across multiple papers
exports.analyzeTrends = async (paperIds, topic) => {
  try {
    console.log(`Trends analysis requested for topic: "${topic}" with ${paperIds.length} papers`);
    
    // Get all papers
    const papers = [];
    const failedPaperIds = [];
    
    for (const id of paperIds) {
      try {
        const paper = await paperService.getPaperById(id);
        if (paper) {
          papers.push(paper);
        } else {
          failedPaperIds.push(id);
          console.warn(`Could not retrieve paper with ID: ${id}`);
        }
      } catch (err) {
        failedPaperIds.push(id);
        console.error(`Error retrieving paper with ID ${id}:`, err.message);
      }
    }
    
    // Filter out any papers that couldn't be retrieved
    const validPapers = papers.filter(paper => paper !== null);
    
    if (validPapers.length === 0) {
      throw new Error('No valid papers found for trend analysis. Please check the paper IDs and try again.');
    }
    
    console.log(`Successfully retrieved ${validPapers.length} papers for trend analysis`);
    
    // Generate trend analysis using the LLM with retry logic
    let trends = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (!trends && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Generating trends analysis, attempt ${attempts}/${maxAttempts}`);
        trends = await llmService.analyzeTrends(validPapers, topic);
        
        // Basic validation of returned analysis
        if (!trends || trends.trim().length < 100) {
          console.warn(`Trends analysis was too short (${trends?.length || 0} chars). Retrying...`);
          trends = null;
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          console.warn(`LLM service error, will retry: ${err.message}`);
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw err; // rethrow on final attempt
        }
      }
    }
    
    if (!trends) {
      throw new Error('Failed to generate a quality trends analysis after multiple attempts.');
    }
    
    console.log(`Successfully generated trends analysis (${trends.length} chars) for topic: "${topic}"`);
    
    return {
      topic,
      paperCount: validPapers.length,
      trends,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in analyzeTrends service:', error);
    throw error;
  }
};

// Analyze research gaps
exports.analyzeGaps = async (paperIds, topic, researchQuestion) => {
  try {
    console.log(`Gaps analysis requested for topic: "${topic}" with ${paperIds.length} papers`);
    
    // Get all papers
    const papers = [];
    const failedPaperIds = [];
    
    for (const id of paperIds) {
      try {
        const paper = await paperService.getPaperById(id);
        if (paper) {
          papers.push(paper);
        } else {
          failedPaperIds.push(id);
          console.warn(`Could not retrieve paper with ID: ${id}`);
        }
      } catch (err) {
        failedPaperIds.push(id);
        console.error(`Error retrieving paper with ID ${id}:`, err.message);
      }
    }
    
    // Filter out any papers that couldn't be retrieved
    const validPapers = papers.filter(paper => paper !== null);
    
    if (validPapers.length === 0) {
      throw new Error('No valid papers found for gap analysis. Please check the paper IDs and try again.');
    }
    
    console.log(`Successfully retrieved ${validPapers.length} papers for gap analysis`);
    
    // Generate gap analysis using the LLM with retry logic
    let gaps = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (!gaps && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Generating gaps analysis, attempt ${attempts}/${maxAttempts}`);
        gaps = await llmService.analyzeGaps(validPapers, topic, researchQuestion);
        
        // Basic validation of returned analysis
        if (!gaps || gaps.trim().length < 100) {
          console.warn(`Gaps analysis was too short (${gaps?.length || 0} chars). Retrying...`);
          gaps = null;
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          console.warn(`LLM service error, will retry: ${err.message}`);
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw err; // rethrow on final attempt
        }
      }
    }
    
    if (!gaps) {
      throw new Error('Failed to generate a quality gaps analysis after multiple attempts.');
    }
    
    console.log(`Successfully generated gaps analysis (${gaps.length} chars) for topic: "${topic}"`);
    
    return {
      topic,
      researchQuestion: researchQuestion || null,
      paperCount: validPapers.length,
      gaps,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in analyzeGaps service:', error);
    throw error;
  }
};

// Generate literature survey
exports.generateLiteratureSurvey = async (paperIds, topic) => {
  try {
    // Log request
    console.log(`Literature survey requested for topic: "${topic}" with ${paperIds.length} papers`);
    
    // Get papers from paperService
    const papers = [];
    const failedPaperIds = [];
    
    for (const id of paperIds) {
      try {
        const paper = await paperService.getPaperById(id);
        if (paper) {
          papers.push(paper);
        } else {
          failedPaperIds.push(id);
          console.warn(`Could not retrieve paper with ID: ${id}`);
        }
      } catch (err) {
        failedPaperIds.push(id);
        console.error(`Error retrieving paper with ID ${id}:`, err.message);
      }
    }
    
    if (papers.length === 0) {
      throw new Error('No valid papers found for analysis. Please check the paper IDs and try again.');
    }
    
    if (failedPaperIds.length > 0) {
      console.warn(`Failed to retrieve ${failedPaperIds.length} papers: ${failedPaperIds.join(', ')}`);
    }
    
    console.log(`Successfully retrieved ${papers.length} papers for literature survey`);
    
    // Validate papers have required fields
    papers.forEach((paper, index) => {
      // Ensure papers have at least minimal required fields
      if (!paper.abstract || paper.abstract.trim() === '') {
        console.warn(`Paper ${index + 1} (${paper.id}) is missing an abstract. Using title only.`);
        paper.abstract = `No abstract available for "${paper.title}"`;
      }
      
      if (!paper.authors || paper.authors.length === 0) {
        console.warn(`Paper ${index + 1} (${paper.id}) is missing authors information.`);
        paper.authors = ['Unknown Author'];
      }
      
      // Make sure year is available (for citations)
      if (!paper.year) {
        // Try to extract year from publishedDate if available
        if (paper.publishedDate) {
          const dateMatch = paper.publishedDate.match(/\d{4}/);
          if (dateMatch) {
            paper.year = parseInt(dateMatch[0]);
          }
        }
        
        // If still no year, use current year
        if (!paper.year) {
          paper.year = new Date().getFullYear();
          console.warn(`Paper ${index + 1} (${paper.id}) is missing publication year. Using current year.`);
        }
      }
    });
    
    // Get literature survey from LLM with retry logic
    let survey = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (!survey && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Generating literature survey, attempt ${attempts}/${maxAttempts}`);
        survey = await llmService.generateLiteratureSurvey(papers, topic);
        
        // Basic validation of returned survey
        if (!survey || survey.trim().length < 100) {
          console.warn(`Literature survey was too short (${survey?.length || 0} chars). Retrying...`);
          survey = null;
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          console.warn(`LLM service error, will retry: ${err.message}`);
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw err; // rethrow on final attempt
        }
      }
    }
    
    if (!survey) {
      throw new Error('Failed to generate a quality literature survey after multiple attempts.');
    }
    
    console.log(`Successfully generated literature survey (${survey.length} chars) for topic: "${topic}"`);
    
    return {
      topic,
      paperCount: papers.length,
      survey,
      paperIds,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in literature survey generation:', error);
    throw error;
  }
};

// Generate and validate a novel hypothesis
exports.generateHypothesis = async (paperIds, topic) => {
  try {
    console.log(`Hypothesis generation requested for topic: "${topic}" with ${paperIds.length} papers`);
    const papers = [];
    const failedPaperIds = [];
    for (const id of paperIds) {
      try {
        const paper = await paperService.getPaperById(id);
        if (paper) {
          papers.push(paper);
        } else {
          failedPaperIds.push(id);
          console.warn(`Could not retrieve paper with ID: ${id}`);
        }
      } catch (err) {
        failedPaperIds.push(id);
        console.error(`Error retrieving paper with ID ${id}:`, err.message);
      }
    }
    const validPapers = papers.filter(paper => paper !== null);
    if (validPapers.length === 0) {
      throw new Error('No valid papers found for hypothesis generation. Please check the paper IDs and try again.');
    }
    let hypothesis = null;
    let attempts = 0;
    const maxAttempts = 2;
    while (!hypothesis && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Generating hypothesis, attempt ${attempts}/${maxAttempts}`);
        hypothesis = await llmService.generateHypothesis(validPapers, topic);
        if (!hypothesis || hypothesis.trim().length < 100) {
          console.warn(`Hypothesis was too short (${hypothesis?.length || 0} chars). Retrying...`);
          hypothesis = null;
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          console.warn(`LLM service error, will retry: ${err.message}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw err;
        }
      }
    }
    if (!hypothesis) {
      throw new Error('Failed to generate a quality hypothesis after multiple attempts.');
    }
    console.log(`Successfully generated hypothesis (${hypothesis.length} chars) for topic: "${topic}"`);
    return {
      topic,
      paperCount: validPapers.length,
      hypothesis,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in generateHypothesis service:', error);
    throw error;
  }
}; 