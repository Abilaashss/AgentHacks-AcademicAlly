import React, { useState, useRef, useContext } from 'react';
import { Paper, searchPapers, generateHypothesis, HypothesisResult } from '../services/api';
import SearchBar from '../components/SearchBar';
import { FaPlus, FaTrash, FaSpinner, FaLightbulb } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { ThemeContext } from './HomePage';

const HypothesisPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hypothesisResult, setHypothesisResult] = useState<HypothesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const paperSelectionRef = useRef<HTMLDivElement>(null);

  // Search papers
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const results = await searchPapers(query);
      if (results.length === 0) {
        setSearchError('No papers found matching your query. Try different keywords.');
      } else {
        setSearchResults(results);
      }
      setTimeout(() => {
        if (paperSelectionRef.current) {
          paperSelectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addPaper = (paper: Paper) => {
    if (!selectedPapers.some(p => p.id === paper.id)) {
      setSelectedPapers([...selectedPapers, paper]);
    }
  };

  const removePaper = (paperId: string) => {
    setSelectedPapers(selectedPapers.filter(p => p.id !== paperId));
  };

  const handleGenerateHypothesis = async () => {
    if (selectedPapers.length === 0 || !topic.trim()) {
      setError('Please select at least one paper and enter a research topic.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setHypothesisResult(null);
    try {
      const paperIds = selectedPapers.map(p => p.id);
      const result = await generateHypothesis(paperIds, topic);
      setHypothesisResult(result);
    } catch (err) {
      setError('Failed to generate hypothesis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Hypothesis Generation & Validation</h1>
      {/* Paper Selection Section */}
      <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-200 mb-4">1. Select Papers</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Selected Papers ({selectedPapers.length})
          </h3>
          {selectedPapers.length === 0 ? (
            <div className="bg-perplexity-darkbg p-4 rounded-md text-perplexity-darksecondary text-center">
              No papers selected. Search and add papers below.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedPapers.map(paper => (
                <div key={paper.id} className="flex justify-between items-center p-4 border border-perplexity-darkborder bg-white rounded-md">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{paper.title}</p>
                    <p className="text-sm text-gray-700">
                      {paper.authors?.join(', ')} • {new Date(paper.publishedDate).getFullYear()}
                    </p>
                  </div>
                  <button
                    onClick={() => removePaper(paper.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    aria-label="Remove paper"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Search for Papers</h3>
          <SearchBar
            onSearch={handleSearch}
            isSearching={isSearching}
            initialQuery={searchQuery}
            placeholder="Search for papers for hypothesis generation..."
            theme={theme}
          />
        </div>
        {searchError && (
          <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded-md my-4">
            <div className="flex">
              <span className="text-red-500 h-5 w-5 mr-3 mt-0.5">!</span>
              <p className="text-red-300">{searchError}</p>
            </div>
          </div>
        )}
        {searchResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map(paper => (
                <div key={paper.id} className="flex justify-between items-center p-4 border border-perplexity-darkborder bg-white rounded-md">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{paper.title}</p>
                    <p className="text-sm text-gray-700">
                      {paper.authors?.join(', ')} • {new Date(paper.publishedDate).getFullYear()}
                    </p>
                  </div>
                  <button
                    onClick={() => addPaper(paper)}
                    disabled={selectedPapers.some(p => p.id === paper.id)}
                    className={`p-2 rounded-full ${
                      selectedPapers.some(p => p.id === paper.id)
                        ? 'text-perplexity-darksecondary cursor-not-allowed'
                        : 'text-green-400 hover:text-green-300'
                    }`}
                    aria-label="Add paper"
                  >
                    <FaPlus />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Topic Input & Generate Button */}
      <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-200 mb-4">2. Enter Research Topic</h2>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g., Multimodal Learning in Healthcare"
          className="w-full p-3 rounded-md bg-perplexity-darkbg border border-perplexity-darkborder text-white mb-4"
        />
        <button
          onClick={handleGenerateHypothesis}
          disabled={selectedPapers.length === 0 || !topic.trim() || isGenerating}
          className={`px-6 py-2 flex items-center bg-perplexity-darkaccent text-white rounded-lg transition-colors duration-200 ${
            selectedPapers.length === 0 || !topic.trim() || isGenerating
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600'
          }`}
        >
          {isGenerating ? <FaSpinner className="animate-spin mr-2" /> : <FaLightbulb className="mr-2" />}
          Generate Hypothesis
        </button>
        {error && <div className="mt-4 text-red-400">{error}</div>}
      </div>
      {/* Hypothesis Result */}
      {hypothesisResult && (
        <div className="bg-white rounded-xl border border-perplexity-darkborder p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">3. Generated Hypothesis & Validation</h2>
          <div className="prose max-w-none text-gray-900">
            <ReactMarkdown>{hypothesisResult.hypothesis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default HypothesisPage; 