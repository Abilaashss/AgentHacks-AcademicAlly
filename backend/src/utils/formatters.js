const { DOMParser } = require('xmldom');

/**
 * Parse and format arXiv API XML response
 * @param {string} xmlData - XML response from arXiv API
 * @returns {Array} - Formatted array of paper objects
 */
exports.formatArxivResponse = (xmlData) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');
    
    const results = [];
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Get basic paper info
      const title = getElementTextContent(entry, 'title');
      const summary = getElementTextContent(entry, 'summary');
      const published = getElementTextContent(entry, 'published');
      const updated = getElementTextContent(entry, 'updated');
      const id = getElementTextContent(entry, 'id');
      
      // Get author info
      const authorNodes = entry.getElementsByTagName('author');
      const authors = [];
      
      for (let j = 0; j < authorNodes.length; j++) {
        const name = getElementTextContent(authorNodes[j], 'name');
        if (name) authors.push(name);
      }
      
      // Get category/subject info
      const categoryNodes = entry.getElementsByTagName('category');
      const categories = [];
      
      for (let j = 0; j < categoryNodes.length; j++) {
        const term = categoryNodes[j].getAttribute('term');
        if (term) categories.push(term);
      }
      
      // Format and add to results
      results.push({
        id: `arxiv:${id.split('/').pop().split('v')[0]}`,
        title: cleanupText(title),
        abstract: cleanupText(summary),
        authors,
        publishedDate: published ? new Date(published).toISOString() : null,
        lastUpdated: updated ? new Date(updated).toISOString() : null,
        url: id,
        pdfUrl: id.replace('abs', 'pdf'),
        source: 'arxiv',
        categories,
        year: published ? new Date(published).getFullYear() : null,
        venue: 'arXiv'
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error formatting arXiv response:', error);
    return [];
  }
};

/**
 * Parse and format Semantic Scholar API response
 * @param {Object} data - JSON response from Semantic Scholar API
 * @returns {Array} - Formatted array of paper objects
 */
exports.formatSemanticScholarResponse = (data) => {
  try {
    if (!data || !data.data) {
      return [];
    }
    
    return data.data.map(paper => {
      // Format authors
      const authors = paper.authors
        ? paper.authors.map(author => author.name)
        : [];
      
      // Format and return
      return {
        id: paper.paperId || paper.id,
        title: paper.title || 'Untitled',
        abstract: paper.abstract || '',
        authors,
        publishedDate: paper.publicationDate || null,
        year: paper.year || (paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : null),
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId || paper.id}`,
        source: 'semantic_scholar',
        venue: paper.venue || paper.journal || '',
        citationCount: paper.citationCount || 0,
        fieldsOfStudy: paper.fieldsOfStudy || []
      };
    });
  } catch (error) {
    console.error('Error formatting Semantic Scholar response:', error);
    return [];
  }
};

/**
 * Parse and format Serper API response to extract scholarly results
 * @param {Object} data - JSON response from Serper API
 * @returns {Array} - Formatted array of paper objects
 */
exports.formatSerperResponse = (data) => {
  try {
    if (!data || !data.organic) {
      return [];
    }
    
    return data.organic
      .filter(item => {
        // Filter for likely scholarly results
        const isScholar = item.link.includes('scholar.google.com') || 
                          item.link.includes('researchgate.net') || 
                          item.link.includes('academia.edu') ||
                          item.link.includes('springer.com') ||
                          item.link.includes('sciencedirect.com') ||
                          item.link.includes('ncbi.nlm.nih.gov');
        return isScholar || 
               (item.title && 
                (item.title.includes('research') || 
                 item.title.includes('study') || 
                 item.title.includes('journal') ||
                 item.title.includes('paper')));
      })
      .map(item => {
        // Try to extract author information from the snippet
        const authorMatch = item.snippet ? item.snippet.match(/by\s([^\.]+)/i) : null;
        const authors = authorMatch ? 
                        authorMatch[1].split(',').map(a => a.trim().replace(/\s+and\s+/i, '')) : 
                        [];
        
        // Try to extract date information
        const dateMatch = item.snippet ? item.snippet.match(/(\d{4})\s*[-—–]\s*(\d{4}|\d{2})?/) : null;
        const year = dateMatch ? parseInt(dateMatch[1]) : null;
        
        return {
          id: `serper:${Buffer.from(item.link).toString('base64').substring(0, 16)}`,
          title: item.title || 'Untitled',
          abstract: item.snippet || '',
          authors,
          publishedDate: year ? new Date(year, 0, 1).toISOString() : new Date().toISOString(),
          year,
          url: item.link,
          source: 'serper',
          venue: item.sitelinks && item.sitelinks.length > 0 ? item.sitelinks[0].title : ''
        };
      });
  } catch (error) {
    console.error('Error formatting Serper response:', error);
    return [];
  }
};

/**
 * Helper function to get text content of an XML element
 * @param {Element} parent - Parent element
 * @param {string} tagName - Tag name to find
 * @returns {string} - Text content or empty string
 */
const getElementTextContent = (parent, tagName) => {
  const elements = parent.getElementsByTagName(tagName);
  if (elements.length > 0) {
    return elements[0].textContent || '';
  }
  return '';
};

/**
 * Clean up text content (remove excess whitespace, etc.)
 * @param {string} text - Input text
 * @returns {string} - Cleaned text
 */
const cleanupText = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}; 