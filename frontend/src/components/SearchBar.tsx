import React, { useState, FormEvent } from 'react';
import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  initialQuery?: string;
  placeholder?: string;
  theme: 'light' | 'dark';
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isSearching = false,
  initialQuery = '',
  placeholder = 'Search for research papers...',
  theme
}) => {
  const [query, setQuery] = useState(initialQuery);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query.trim());
    }
  };
  
  const clearSearch = () => {
    setQuery('');
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <FaSpinner className={`h-5 w-5 animate-spin ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'}`} />
            ) : (
              <FaSearch className={`h-5 w-5 ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'}`} />
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isSearching}
            className={`block w-full pl-10 pr-12 py-4 rounded-xl border-2 focus:ring-0 focus:outline-none transition duration-200 text-lg shadow-sm ${
              theme === 'dark'
                ? 'border-perplexity-darkborder bg-perplexity-darkcard focus:border-perplexity-darkaccent text-perplexity-darktext placeholder-perplexity-darksecondary'
                : 'border-gray-300 bg-white focus:border-primary text-gray-800 placeholder-gray-500'
            }`}
          />
          
          {query && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={clearSearch}
                className={theme === 'dark' ? 'text-perplexity-darksecondary hover:text-perplexity-darktext focus:outline-none' : 'text-gray-500 hover:text-gray-800 focus:outline-none'}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className={`absolute right-3 top-3 px-4 py-2 rounded-lg text-white font-medium focus:outline-none transition duration-200 ${
            !query.trim() || isSearching
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600'
          } ${theme === 'dark' ? 'bg-perplexity-darkaccent' : 'bg-primary'}`}
        >
          Search
        </button>
      </form>
      
      <div className={`mt-2 text-sm pl-3 ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'}`}>
        Try: "machine learning", "quantum computing", "climate change research"
      </div>
    </div>
  );
};

export default SearchBar; 