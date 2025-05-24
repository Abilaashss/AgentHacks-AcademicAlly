import axios from 'axios';

// Define the base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Customize error message based on status code
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error:', error.response.status, error.response.data);
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      } else if (error.response.status === 404) {
        error.message = 'Resource not found. Please try again later.';
      } else if (error.response.status >= 500) {
        error.message = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      error.message = 'Network error. Please check your connection and try again.';
    }
    return Promise.reject(error);
  }
);

// Define interfaces for API data
export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedDate: string;
  url: string;
  source: string;
  pdfUrl?: string;
  venue?: string;
  year?: number;
  citationCount?: number;
  fieldsOfStudy?: string[];
  relevanceScore?: number;
}

export interface PaperSummary {
  paperId: string;
  title: string;
  summary: string;
  summaryGeneratedAt: string;
}

export interface AnalysisResult {
  topic: string;
  paperCount: number;
  trends?: string;
  gaps?: string;
  researchQuestion?: string | null;
  analyzedAt: string;
}

export interface LiteratureSurveyResult {
  topic: string;
  paperCount: number;
  survey: string;
  paperIds: string[];
  analyzedAt: string;
}

export interface HypothesisResult {
  topic: string;
  paperCount: number;
  hypothesis: string;
  analyzedAt: string;
}

// API Functions
export const searchPapers = async (query: string): Promise<Paper[]> => {
  try {
    if (!query.trim()) {
      return [];
    }
    const response = await api.get(`/search?query=${encodeURIComponent(query.trim())}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching papers:', error);
    throw error;
  }
};

export const getRecentPapers = async (): Promise<Paper[]> => {
  try {
    const response = await api.get('/papers/recent');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching recent papers:', error);
    throw error;
  }
};

export const getPaperById = async (id: string): Promise<Paper> => {
  try {
    // First try to get from backend
    const response = await api.get(`/papers/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching paper with ID ${id}:`, error);
    throw error;
  }
};

export const getPaperSummary = async (id: string): Promise<PaperSummary> => {
  try {
    const response = await api.get(`/papers/${id}/summary`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching summary for paper with ID ${id}:`, error);
    throw error;
  }
};

export const analyzeTrends = async (paperIds: string[], topic: string): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/analysis/trends', { paperIds, topic });
    return response.data.data;
  } catch (error) {
    console.error('Error analyzing trends:', error);
    throw error;
  }
};

export const analyzeGaps = async (
  paperIds: string[], 
  topic: string, 
  researchQuestion?: string
): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/analysis/gaps', { 
      paperIds, 
      topic, 
      researchQuestion 
    });
    return response.data.data;
  } catch (error) {
    console.error('Error analyzing gaps:', error);
    throw error;
  }
};

export const generateLiteratureSurvey = async (
  paperIds: string[], 
  topic: string
): Promise<LiteratureSurveyResult> => {
  try {
    const response = await api.post('/analysis/literature-survey', { 
      paperIds, 
      topic
    });
    return response.data.data;
  } catch (error) {
    console.error('Error generating literature survey:', error);
    throw error;
  }
};

export const generateGapsAnalysis = async (
  paperIds: string[],
  researchTopic: string
): Promise<string> => {
  try {
    const response = await api.post('/analysis/gaps', { 
      paperIds, 
      topic: researchTopic
    });
    return response.data.data.gaps || '';
  } catch (error) {
    console.error('Error generating gaps analysis:', error);
    throw error;
  }
};

export const generateTrendsAnalysis = async (
  paperIds: string[],
  researchTopic: string
): Promise<string> => {
  try {
    const response = await api.post('/analysis/trends', { 
      paperIds, 
      topic: researchTopic
    });
    return response.data.data.trends || '';
  } catch (error) {
    console.error('Error generating trends analysis:', error);
    throw error;
  }
};

export const generateHypothesis = async (
  paperIds: string[],
  topic: string
): Promise<HypothesisResult> => {
  try {
    const response = await api.post('/analysis/hypothesis', {
      paperIds,
      topic
    });
    return response.data.data;
  } catch (error) {
    console.error('Error generating hypothesis:', error);
    throw error;
  }
};

export default {
  searchPapers,
  getPaperById,
  getPaperSummary,
  analyzeTrends,
  analyzeGaps,
  getRecentPapers,
  generateLiteratureSurvey,
  generateGapsAnalysis,
  generateTrendsAnalysis,
  generateHypothesis,
}; 