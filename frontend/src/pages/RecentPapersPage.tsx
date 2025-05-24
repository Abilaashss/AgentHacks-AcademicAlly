import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PaperCard from '../components/PaperCard';
import { getRecentPapers, getPaperById, Paper } from '../services/api';
import { FaSpinner, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa6';
import { ThemeContext } from './HomePage';

const RecentPapersPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPapers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Retrieve IDs from localStorage
        const recentPaperIds = JSON.parse(localStorage.getItem('recentPaperIds') || '[]');
        
        if (recentPaperIds.length === 0) {
          setPapers([]);
          setLoading(false);
          return;
        }
        
        // Fetch details for each paper
        const fetchedPapers = await Promise.all(
          recentPaperIds.map(async (id: string) => {
            try {
              return await getPaperById(id);
            } catch (err) {
              console.error(`Error fetching paper ${id}:`, err);
              return null;
            }
          })
        );
        
        // Filter out any null results (failed fetches)
        const validPapers = fetchedPapers.filter(p => p !== null) as Paper[];
        setPapers(validPapers);
      } catch (err) {
        console.error('Error loading recent papers:', err);
        setError('Failed to load recent papers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentPapers();
  }, []);
  
  const clearRecentPapers = () => {
    localStorage.removeItem('recentPaperIds');
    setPapers([]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-perplexity-darktext' : 'text-gray-900'}`}>
          Recent Papers
        </h1>
        
        {papers.length > 0 && (
          <button
            onClick={clearRecentPapers}
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark' 
                ? 'bg-red-900 hover:bg-red-800 text-white' 
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            }`}
          >
            Clear History
          </button>
        )}
      </div>
      
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className={`animate-spin h-10 w-10 mb-4 ${theme === 'dark' ? 'text-perplexity-darkaccent' : 'text-primary'}`} />
          <p className={theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-600'}>Loading recent papers...</p>
        </div>
      )}
      
      {error && (
        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-300'} mb-8`}>
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 mr-2 text-red-500" />
            <p className={theme === 'dark' ? 'text-red-300' : 'text-red-800'}>{error}</p>
          </div>
        </div>
      )}
      
      {!loading && !error && papers.length === 0 && (
        <div className="text-center py-12">
          <div className={`rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-perplexity-darkbg' : 'bg-gray-100'}`}>
            <FaClock className={`h-10 w-10 ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-perplexity-darktext' : 'text-gray-800'}`}>No recent papers</h3>
          <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-600'}`}>
            Papers you view will appear here. Start by searching for papers on the home page.
          </p>
        </div>
      )}
      
      {papers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {papers.map((paper) => (
            <PaperCard
              key={paper.id}
              id={paper.id}
              title={paper.title}
              authors={paper.authors}
              abstract={paper.abstract}
              publishedDate={paper.publishedDate}
              source={paper.source}
              url={paper.url}
              pdfUrl={paper.pdfUrl}
              venue={paper.venue}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPapersPage; 