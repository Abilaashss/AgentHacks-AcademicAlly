import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaSpinner, FaLightbulb, FaExclamationTriangle, FaChartLine, FaSearch } from 'react-icons/fa';
import SectionTitle from './SectionTitle';

interface AnalysisViewProps {
  title: string;
  type: 'trends' | 'gaps';
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  title,
  type,
  analysis,
  isLoading,
  error
}) => {
  const getSubtitle = () => {
    if (type === 'trends') {
      return 'Identifying key research trends, methodological approaches, and emerging directions.';
    }
    return 'Identifying unexplored areas, methodological limitations, and future research opportunities.';
  };

  const getIcon = () => {
    if (type === 'trends') {
      return <FaChartLine className="h-6 w-6" />;
    }
    return <FaSearch className="h-6 w-6" />;
  };

  return (
    <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6">
      <SectionTitle 
        title={title} 
        subtitle={getSubtitle()}
        icon={getIcon()}
      />
      
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-perplexity-darkaccent mr-3" />
          <p className="text-perplexity-darksecondary font-medium">
            {type === 'trends' 
              ? 'Analyzing research trends with AI...'
              : 'Identifying research gaps with AI...'}
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">Error generating analysis</p>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && analysis && (
        <div className="prose prose-lg max-w-none">
          <div className="mb-6 bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-md">
            <div className="flex items-center">
              <FaLightbulb className="text-blue-500 h-5 w-5 mr-3" />
              <p className="font-medium text-blue-900">
                {type === 'trends' 
                  ? 'Research trends analysis completed'
                  : 'Research gaps analysis completed'}
              </p>
            </div>
          </div>
          <div className="prose-headings:font-semibold prose-headings:text-blue-900 prose-headings:mt-6 prose-headings:mb-4 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-900 prose-p:mb-4 prose-p:leading-relaxed prose-strong:font-semibold prose-strong:text-blue-900 prose-ul:ml-6 prose-ul:list-disc prose-ol:ml-6 prose-ol:list-decimal prose-li:text-gray-900 prose-li:mb-2 prose-a:text-blue-600 prose-h1:text-blue-900 prose-h2:text-blue-800 prose-h3:text-gray-700">
            <div className="prose max-w-none text-gray-900 bg-white p-6 rounded-lg border border-perplexity-darkborder">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && !analysis && (
        <div className="text-center py-10 text-perplexity-darksecondary">
          <p>No analysis available. Select papers and click "Analyze" to begin.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisView; 