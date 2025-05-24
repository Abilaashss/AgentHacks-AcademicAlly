import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import PaperCard from '../components/PaperCard';
import { searchPapers, Paper } from '../services/api';
import { FaSpinner, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

// Create a ThemeContext to access theme from any component
export const ThemeContext = React.createContext<'light' | 'dark'>('dark');

const HomePage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(!!searchParams.get('q'));
  
  // Initialize from URL query params
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]); // Clear previous results while loading
    
    try {
      // Update URL
      setSearchParams({ q: searchQuery });
      
      const data = await searchPapers(searchQuery);
      
      // Check if we got results
      if (data.length === 0) {
        setError('No papers found matching your query. Try using different keywords.');
      } else {
        setResults(data);
        // Save the first result to localStorage to persist across sessions
        if (data.length > 0) {
          try {
            // Store first paper ID for recent papers
            const recentPaperIds = JSON.parse(localStorage.getItem('recentPaperIds') || '[]');
            const newPaperId = data[0].id;
            
            // Add to beginning of array if not already present
            if (!recentPaperIds.includes(newPaperId)) {
              recentPaperIds.unshift(newPaperId);
              // Keep only the most recent 10
              const updatedRecentPapers = recentPaperIds.slice(0, 10);
              localStorage.setItem('recentPaperIds', JSON.stringify(updatedRecentPapers));
            }
          } catch (err) {
            console.error('Error saving to localStorage:', err);
          }
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-perplexity-darktext' : 'text-gray-900'}`}>
          Paper Pulse
        </h1>
        <p className={`text-xl max-w-2xl mx-auto mb-8 ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-600'}`}>
          Search, summarize, and analyze research papers with AI
        </p>
        
        <SearchBar 
          onSearch={handleSearch} 
          isSearching={loading} 
          initialQuery={query}
          theme={theme}
        />
      </div>
      
      {/* Search Results */}
      <div className="mt-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className={`animate-spin h-10 w-10 mb-4 ${theme === 'dark' ? 'text-perplexity-darkaccent' : 'text-primary'}`} />
            <p className={theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-600'}>Searching for papers...</p>
          </div>
        )}
        
        {error && (
          <div className={`border-l-4 border-red-500 p-4 rounded-md max-w-3xl mx-auto ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'}`}>
            <div className="flex">
              <FaExclamationTriangle className="text-red-500 h-5 w-5 mr-3" />
              <p className={theme === 'dark' ? 'text-red-300' : 'text-red-800'}>{error}</p>
            </div>
          </div>
        )}
        
        {hasSearched && !loading && !error && results.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-perplexity-darktext' : 'text-gray-800'}`}>No results found</h3>
            <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-600'}`}>
              We couldn't find any papers matching your search.
              Try using different keywords or broadening your search.
            </p>
          </div>
        )}
        
        {/* Display results */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {results.map((paper) => (
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
    </div>
  );
};

export default HomePage; 