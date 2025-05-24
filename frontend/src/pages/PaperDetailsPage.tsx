import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaperById, getPaperSummary, Paper, PaperSummary } from '../services/api';
import SummaryView from '../components/SummaryView';
import { FaArrowLeft, FaExternalLinkAlt, FaFilePdf, FaSpinner, FaExclamationTriangle, FaPen } from 'react-icons/fa';

const PaperDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const paperData = await getPaperById(id);
        setPaper(paperData);
      } catch (err) {
        console.error('Error fetching paper:', err);
        setError('Failed to load paper details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaper();
  }, [id]);
  
  const handleGenerateSummary = async () => {
    if (!id) return;
    
    setSummaryLoading(true);
    setSummaryError(null);
    
    try {
      const summaryData: PaperSummary = await getPaperSummary(id);
      setSummary(summaryData.summary);
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };
  
  // Format published date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <FaSpinner className="animate-spin h-12 w-12 text-perplexity-darkaccent mb-4" />
        <p className="text-perplexity-darktext text-lg">Loading paper details...</p>
      </div>
    );
  }
  
  if (error || !paper) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-900 border-l-4 border-red-500 p-6 rounded-md max-w-3xl mx-auto">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 h-6 w-6 mr-4 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Paper</h2>
              <p className="text-red-300">{error || "Paper not found"}</p>
              <Link to="/" className="inline-block mt-4 text-perplexity-darkaccent font-medium hover:underline">
                Return to Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-perplexity-darkaccent hover:text-blue-400">
          <FaArrowLeft className="mr-2" /> Back to Search
        </Link>
      </div>
      
      {/* Paper Details */}
      <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6 mb-8">
        <h1 className="text-3xl font-bold text-perplexity-darktext mb-4">{paper.title}</h1>
        
        <div className="flex flex-wrap items-center text-sm text-perplexity-darksecondary mb-4">
          <span className="mr-2">{formatDate(paper.publishedDate)}</span>
          {paper.venue && (
            <>
              <span className="mx-2">•</span>
              <span>{paper.venue}</span>
            </>
          )}
          <span className="mx-2">•</span>
          <span className="capitalize">{paper.source}</span>
        </div>
        
        <div className="flex space-x-4 mb-6">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-perplexity-darkaccent hover:text-blue-400"
            >
              <FaFilePdf className="mr-2" /> View PDF
            </a>
          )}
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-perplexity-darkaccent hover:text-blue-400"
          >
            <FaExternalLinkAlt className="mr-2" /> Visit Source
          </a>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-200 mb-2">Authors</h2>
          <p className="text-perplexity-darktext">
            {paper.authors && paper.authors.length > 0
              ? paper.authors.join(', ')
              : 'Unknown authors'}
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-blue-200 mb-2">Abstract</h2>
          <p className="text-perplexity-darksecondary whitespace-pre-line">
            {paper.abstract || 'No abstract available.'}
          </p>
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-200">AI-Generated Summary</h2>
          
          {!summaryLoading && !summary && (
            <button
              onClick={handleGenerateSummary}
              className="inline-flex items-center px-4 py-2 bg-perplexity-darkaccent text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <FaPen className="mr-2" /> Generate Summary
            </button>
          )}
        </div>
        
        <SummaryView
          title={paper.title}
          summary={summary}
          isLoading={summaryLoading}
          error={summaryError}
        />
      </div>
    </div>
  );
};

export default PaperDetailsPage; 