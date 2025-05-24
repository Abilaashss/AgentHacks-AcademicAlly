import React, { useState, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Paper, searchPapers, analyzeTrends, analyzeGaps, generateLiteratureSurvey, generateGapsAnalysis, generateTrendsAnalysis } from '../services/api';
import AnalysisView from '../components/AnalysisView';
import LiteratureSurveyView from '../components/LiteratureSurveyView';
import LiteratureSurveyModal from '../components/LiteratureSurveyModal';
import SearchBar from '../components/SearchBar';
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaArrowRight, FaSpinner, FaBook, FaChartLine } from 'react-icons/fa';
import { ThemeContext } from './HomePage';

const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const theme = useContext(ThemeContext);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>(
    location.state?.papers || []
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [topic, setTopic] = useState<string>('');
  const [researchQuestion, setResearchQuestion] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(false);
  
  const [trendsAnalysis, setTrendsAnalysis] = useState<string | null>(null);
  const [gapsAnalysis, setGapsAnalysis] = useState<string | null>(null);
  const [literatureSurvey, setLiteratureSurvey] = useState<string | null>(null);
  const [isTrendsLoading, setIsTrendsLoading] = useState<boolean>(false);
  const [isGapsLoading, setIsGapsLoading] = useState<boolean>(false);
  const [isSurveyLoading, setIsSurveyLoading] = useState<boolean>(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [gapsError, setGapsError] = useState<string | null>(null);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  
  // Modal state
  const [showSurveyModal, setShowSurveyModal] = useState<boolean>(false);
  
  // Analysis state
  const [analysisType, setAnalysisType] = useState<'survey' | 'gaps' | 'trends' | null>(null);
  const [researchTopic, setResearchTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Refs for scrolling
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
      
      // Automatically scroll to results
      setTimeout(() => {
        if (paperSelectionRef.current) {
          paperSelectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add a paper to the selected list
  const addPaper = (paper: Paper) => {
    if (!selectedPapers.some(p => p.id === paper.id)) {
      setSelectedPapers([...selectedPapers, paper]);
    }
  };
  
  // Remove a paper from the selected list
  const removePaper = (paperId: string) => {
    setSelectedPapers(selectedPapers.filter(p => p.id !== paperId));
  };
  
  // Run trends analysis
  const handleAnalyzeTrends = async () => {
    if (selectedPapers.length === 0 || !topic.trim()) return;
    
    setIsTrendsLoading(true);
    setTrendsError(null);
    
    try {
      const paperIds = selectedPapers.map(p => p.id);
      const result = await analyzeTrends(paperIds, topic);
      setTrendsAnalysis(result.trends || '');
    } catch (error) {
      console.error('Error analyzing trends:', error);
      setTrendsError('Failed to analyze trends. Please try again.');
    } finally {
      setIsTrendsLoading(false);
    }
  };
  
  // Run gaps analysis
  const handleAnalyzeGaps = async () => {
    if (selectedPapers.length === 0 || !topic.trim()) return;
    
    setIsGapsLoading(true);
    setGapsError(null);
    
    try {
      const paperIds = selectedPapers.map(p => p.id);
      const result = await analyzeGaps(paperIds, topic, researchQuestion || undefined);
      setGapsAnalysis(result.gaps || '');
    } catch (error) {
      console.error('Error analyzing gaps:', error);
      setGapsError('Failed to analyze research gaps. Please try again.');
    } finally {
      setIsGapsLoading(false);
    }
  };
  
  // Generate literature survey
  const handleGenerateLiteratureSurvey = async () => {
    if (selectedPapers.length === 0) {
      // Alert the user that they need to select papers
      alert("Please select at least one paper for the literature survey.");
      return;
    }
    
    if (!topic.trim()) {
      // Alert the user that they need to provide a topic
      alert("Please provide a research topic for the literature survey.");
      return;
    }
    
    setIsSurveyLoading(true);
    setSurveyError(null);
    
    try {
      // Show a more detailed message during loading
      window.scrollTo({ top: document.getElementById('literature-survey-section')?.offsetTop, behavior: 'smooth' });
      
      const paperIds = selectedPapers.map(p => p.id);
      const result = await generateLiteratureSurvey(paperIds, topic);
      setLiteratureSurvey(result.survey || '');
      
      // Automatically open the modal when survey is ready
      if (result.survey) {
        setShowSurveyModal(true);
      }
    } catch (error) {
      console.error('Error generating literature survey:', error);
      setSurveyError('Failed to generate literature survey. Please try again. The error might be related to API rate limits or connection issues.');
    } finally {
      setIsSurveyLoading(false);
    }
  };
  
  const handleGenerateAnalysis = async () => {
    if (selectedPapers.length === 0 || !researchTopic || !analysisType) {
      setAnalysisError('Please select papers, enter a research topic, and choose an analysis type.');
      return;
    }
    
    setIsGenerating(true);
    setAnalysisError(null);
    setGeneratedContent('');
    
    try {
      const paperIds = selectedPapers.map(paper => paper.id);
      
      let content = '';
      switch (analysisType) {
        case 'survey':
          const surveyResult = await generateLiteratureSurvey(paperIds, researchTopic);
          content = surveyResult.survey;
          break;
        case 'gaps':
          content = await generateGapsAnalysis(paperIds, researchTopic);
          break;
        case 'trends':
          content = await generateTrendsAnalysis(paperIds, researchTopic);
          break;
      }
      
      setGeneratedContent(content);
      setShowSurveyModal(true);
    } catch (error) {
      console.error('Generation error:', error);
      setAnalysisError(`Failed to generate ${analysisType} analysis. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const getAnalysisButtonText = () => {
    if (isGenerating) {
      return 'Generating...';
    }
    
    switch (analysisType) {
      case 'survey':
        return 'Generate Literature Survey';
      case 'gaps':
        return 'Analyze Research Gaps';
      case 'trends':
        return 'Identify Research Trends';
      default:
        return 'Select Analysis Type';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Research Analysis</h1>
      
      {/* Paper Selection Section */}
      <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">1. Select Papers for Analysis</h2>
        
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
            placeholder="Search for papers to analyze..."
            theme={theme}
          />
        </div>
        
        {searchError && (
          <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded-md my-4">
            <div className="flex">
              <FaExclamationTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
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
      
      {/* Analysis Configuration */}
      <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-200 mb-4">2. Configure Analysis</h2>
        
        <div className="mb-4">
          <label htmlFor="topic" className="block text-blue-200 mb-2">
            Research Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Transformers in Natural Language Processing"
            className="w-full p-3 rounded-md bg-perplexity-darkbg border border-perplexity-darkborder text-white"
          />
          <p className="text-sm text-gray-400 mt-1">
            Specify the topic that connects the selected papers for more focused analysis.
          </p>
        </div>
        
        <div className="mb-4">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center text-perplexity-darksecondary hover:text-white"
          >
            {showOptions ? <FaChevronUp className="mr-2" /> : <FaChevronDown className="mr-2" />}
            Additional Options
          </button>
          
          {showOptions && (
            <div className="mt-3 pl-4 border-l-2 border-perplexity-darkborder">
              <div className="mb-4">
                <label htmlFor="researchQuestion" className="block text-blue-200 mb-2">
                  Research Question (Optional)
                </label>
                <input
                  type="text"
                  id="researchQuestion"
                  value={researchQuestion}
                  onChange={(e) => setResearchQuestion(e.target.value)}
                  placeholder="e.g., How do transformer models compare to recurrent neural networks?"
                  className="w-full p-3 rounded-md bg-perplexity-darkbg border border-perplexity-darkborder text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Adding a specific research question will help focus the research gap analysis.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={handleAnalyzeTrends}
            disabled={selectedPapers.length === 0 || !topic.trim() || isTrendsLoading || isGapsLoading || isSurveyLoading}
            className={`px-6 py-2 flex items-center bg-perplexity-darkaccent text-white rounded-lg transition-colors duration-200 ${
              selectedPapers.length === 0 || !topic.trim() || isTrendsLoading || isGapsLoading || isSurveyLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            {isTrendsLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
            Analyze Research Trends
          </button>
          
          <button
            onClick={handleAnalyzeGaps}
            disabled={selectedPapers.length === 0 || !topic.trim() || isTrendsLoading || isGapsLoading || isSurveyLoading}
            className={`px-6 py-2 flex items-center bg-perplexity-darkaccent text-white rounded-lg transition-colors duration-200 ${
              selectedPapers.length === 0 || !topic.trim() || isTrendsLoading || isGapsLoading || isSurveyLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            {isGapsLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
            Identify Research Gaps
          </button>
          
          <button
            onClick={handleGenerateLiteratureSurvey}
            disabled={selectedPapers.length === 0 || !topic.trim() || isTrendsLoading || isGapsLoading || isSurveyLoading}
            className={`px-6 py-2 flex items-center bg-purple-600 text-white rounded-lg transition-colors duration-200 ${
              selectedPapers.length === 0 || !topic.trim() || isTrendsLoading || isGapsLoading || isSurveyLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-purple-700'
            }`}
          >
            {isSurveyLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaBook className="mr-2" />}
            Generate Literature Survey
          </button>
        </div>
      </div>
      
      {/* Analysis Results */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <AnalysisView
          title="Research Trends"
          type="trends"
          analysis={trendsAnalysis}
          isLoading={isTrendsLoading}
          error={trendsError}
        />
        
        <AnalysisView
          title="Research Gaps"
          type="gaps"
          analysis={gapsAnalysis}
          isLoading={isGapsLoading}
          error={gapsError}
        />
      </div>
      
      {/* Literature Survey */}
      <div id="literature-survey-section" className="mb-8">
        <LiteratureSurveyView
          title="Literature Survey"
          survey={literatureSurvey}
          isLoading={isSurveyLoading}
          error={surveyError}
          paperCount={selectedPapers.length}
          onViewFullSurvey={() => setShowSurveyModal(true)}
        />
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleGenerateAnalysis}
            disabled={isGenerating || selectedPapers.length === 0 || !researchTopic || !analysisType}
            className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
              isGenerating || selectedPapers.length === 0 || !researchTopic || !analysisType
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {getAnalysisButtonText()}
              </>
            ) : (
              getAnalysisButtonText()
            )}
          </button>
        </div>
        
        {selectedPapers.length === 0 && (
          <div className="mt-4 text-center text-amber-400">
            <p>Select at least one paper to generate a literature survey.</p>
          </div>
        )}
        
        {selectedPapers.length > 0 && !topic.trim() && (
          <div className="mt-4 text-center text-amber-400">
            <p>Please provide a research topic for the literature survey.</p>
          </div>
        )}
      </div>
      
      {/* Survey Modal */}
      <LiteratureSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        content={literatureSurvey || generatedContent}
        analysisType={analysisType || 'survey'}
        title={topic}
        theme={theme}
      />
    </div>
  );
};

export default AnalysisPage; 