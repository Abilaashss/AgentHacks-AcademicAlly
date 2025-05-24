const axios = require('axios');
const llmService = require('./llmService');
const { formatArxivResponse, formatSemanticScholarResponse, formatSerperResponse } = require('../utils/formatters');

// In-memory cache for recent papers
let recentPapers = [];

// Get paper details by ID
exports.getPaperById = async (id) => {
  try {
    // Check the ID format to determine which API to use
    if (id === 'recent') {
      // Return the most recent paper or a placeholder if none exist
      return recentPapers.length > 0 ? recentPapers[0] : {
        id: 'placeholder',
        title: 'Sample Paper',
        abstract: 'This is a placeholder for when no recent papers are available. Try searching for papers first.',
        authors: ['Demo Author'],
        publishedDate: new Date().toISOString(),
        url: '#',
        source: 'demo'
      };
    } else if (id.startsWith('arxiv:')) {
      // ArXiv paper
      const arxivId = id.replace('arxiv:', '');
      return await getArxivPaper(arxivId);
    } else if (id.startsWith('serper:')) {
      // Serper search result paper
      const encodedUrl = id.replace('serper:', '');
      return await getSerperPaper(encodedUrl);
    } else {
      // Semantic Scholar paper
      return await getSemanticScholarPaper(id);
    }
  } catch (error) {
    console.error('Error in getPaperById service:', error);
    throw error;
  }
};

// Get paper summary
exports.getSummary = async (id) => {
  try {
    // Get the paper details first
    const paper = await exports.getPaperById(id);
    
    if (!paper) {
      throw new Error('Paper not found');
    }
    
    // Generate a summary using the LLM service
    const summary = await llmService.generateSummary(paper);
    
    return {
      paperId: id,
      title: paper.title,
      summary,
      summaryGeneratedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getSummary service:', error);
    throw error;
  }
};

// Get recent papers
exports.getRecentPapers = async () => {
  return recentPapers;
};

// Add a paper to recent papers
exports.addToRecentPapers = (paper) => {
  // Check if paper already exists in recent list (avoid duplicates)
  const exists = recentPapers.some(p => p.id === paper.id);
  
  if (!exists) {
    // Add paper to the front of the array
    recentPapers.unshift(paper);
    
    // Limit to 10 recent papers
    if (recentPapers.length > 10) {
      recentPapers = recentPapers.slice(0, 10);
    }
  }
  
  return recentPapers;
};

// Fetch paper from ArXiv
const getArxivPaper = async (arxivId) => {
  try {
    // Make request to arXiv API
    const response = await axios.get(
      `http://export.arxiv.org/api/query?id_list=${arxivId}`
    );
    
    // Parse and format the response
    const papers = formatArxivResponse(response.data);
    
    // Return the first (and should be only) paper
    const paper = papers.length > 0 ? papers[0] : null;
    
    // Add to recent papers if found
    if (paper) {
      exports.addToRecentPapers(paper);
    }
    
    return paper;
  } catch (error) {
    console.error('Error fetching arXiv paper:', error);
    throw error;
  }
};

// Fetch paper from Semantic Scholar
const getSemanticScholarPaper = async (paperId) => {
  try {
    // Make request to Semantic Scholar API
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=title,abstract,year,authors,url,venue,publicationDate,references,citations,embedding,tldr,fieldsOfStudy`
    );
    
    // Parse and format the response
    const formattedPapers = formatSemanticScholarResponse({
      data: [response.data]
    });
    
    // Get the parsed paper
    const paper = formattedPapers.length > 0 ? formattedPapers[0] : null;
    
    // Add to recent papers if found
    if (paper) {
      exports.addToRecentPapers(paper);
    }
    
    return paper;
  } catch (error) {
    console.error('Error fetching Semantic Scholar paper:', error);
    throw error;
  }
};

// Fetch paper from Serper results (needs original URL)
const getSerperPaper = async (encodedUrl) => {
  try {
    // Try to decode the URL
    const originalUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
    
    // Create a paper object based on available information
    const paper = {
      id: `serper:${encodedUrl}`,
      title: 'Research Paper',
      abstract: 'Loading content from ' + originalUrl,
      authors: [],
      publishedDate: new Date().toISOString(),
      url: originalUrl,
      source: 'serper'
    };
    
    // Try to fetch some metadata from the URL (this is simplified)
    try {
      // Attempt to get page title at minimum
      const response = await axios.get(originalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // 5 second timeout
      });
      
      // Try to extract title from HTML
      const titleMatch = response.data.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        paper.title = titleMatch[1].trim();
      }
      
      // Try to extract description/abstract
      const descMatch = response.data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i);
      if (descMatch && descMatch[1]) {
        paper.abstract = descMatch[1].trim();
      }
    } catch (fetchError) {
      console.warn('Could not fetch metadata from URL:', fetchError.message);
      // Continue with basic paper info
    }
    
    // Add to recent papers
    exports.addToRecentPapers(paper);
    
    return paper;
  } catch (error) {
    console.error('Error processing Serper paper:', error);
    throw error;
  }
}; 