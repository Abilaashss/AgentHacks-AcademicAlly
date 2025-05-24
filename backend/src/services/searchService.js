const axios = require('axios');
const { formatArxivResponse, formatSemanticScholarResponse, formatSerperResponse } = require('../utils/formatters');

// Search for papers across multiple sources
exports.searchPapers = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Concurrently fetch results from different sources
    const [arxivResults, semanticScholarResults, serperResults] = await Promise.all([
      searchArxiv(query),
      searchSemanticScholar(query),
      searchSerper(query)
    ]);
    
    // Combine results
    let combinedResults = [...arxivResults, ...semanticScholarResults, ...serperResults];
    
    // Score results by relevance to query
    combinedResults = combinedResults.map(paper => {
      // Calculate relevance score
      let score = 0;
      
      // Check title for query terms
      const title = paper.title.toLowerCase();
      queryTerms.forEach(term => {
        if (title.includes(term)) score += 5;
      });
      
      // Check abstract for query terms
      const abstract = (paper.abstract || '').toLowerCase();
      queryTerms.forEach(term => {
        if (abstract.includes(term)) score += 2;
      });
      
      // Check other fields
      if (paper.authors) {
        const authorsStr = paper.authors.join(' ').toLowerCase();
        queryTerms.forEach(term => {
          if (authorsStr.includes(term)) score += 1;
        });
      }
      
      if (paper.venue) {
        const venue = paper.venue.toLowerCase();
        queryTerms.forEach(term => {
          if (venue.includes(term)) score += 1;
        });
      }
      
      // Boost recent papers
      const pubDate = new Date(paper.publishedDate);
      const now = new Date();
      const ageInYears = (now - pubDate) / (1000 * 60 * 60 * 24 * 365);
      if (ageInYears < 1) score += 2;
      else if (ageInYears < 3) score += 1;
      
      // Store the score
      return { ...paper, relevanceScore: score };
    });
    
    // Filter out completely irrelevant results
    combinedResults = combinedResults.filter(paper => paper.relevanceScore > 0);
    
    // Sort by relevance score first, then by date
    combinedResults.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.publishedDate) - new Date(a.publishedDate);
    });
    
    return combinedResults;
  } catch (error) {
    console.error('Error in searchPapers service:', error);
    throw error;
  }
};

// Search arXiv for papers
const searchArxiv = async (query) => {
  try {
    // Format the query for arXiv API
    const formattedQuery = encodeURIComponent(query.trim());
    
    // Make request to arXiv API
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=all:${formattedQuery}&start=0&max_results=15&sortBy=submittedDate&sortOrder=descending`
    );
    
    // Parse and format the response
    return formatArxivResponse(response.data);
  } catch (error) {
    console.error('Error searching arXiv:', error);
    return []; // Return empty array on error, don't fail the entire search
  }
};

// Search Semantic Scholar for papers
const searchSemanticScholar = async (query) => {
  try {
    // Format the query for Semantic Scholar API
    const formattedQuery = encodeURIComponent(query.trim());
    
    // Make request to Semantic Scholar API
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${formattedQuery}&limit=15&fields=title,abstract,year,authors,url,venue,publicationDate`
    );
    
    // Parse and format the response
    return formatSemanticScholarResponse(response.data);
  } catch (error) {
    console.error('Error searching Semantic Scholar:', error);
    return []; // Return empty array on error, don't fail the entire search
  }
};

// Search using Serper API for research papers
const searchSerper = async (query) => {
  try {
    const serperApiKey = process.env.SERPER_API_KEY;
    
    if (!serperApiKey) {
      console.warn('Serper API key not found in environment variables');
      return [];
    }
    
    // Specifically look for academic content by adding research paper to the query
    const academicQuery = `${query} research paper`;
    
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: academicQuery,
        gl: 'us',
        hl: 'en',
        num: 15,
      },
      {
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Parse and format the response
    return formatSerperResponse(response.data);
  } catch (error) {
    console.error('Error searching with Serper:', error);
    return []; // Return empty array on error, don't fail the entire search
  }
}; 