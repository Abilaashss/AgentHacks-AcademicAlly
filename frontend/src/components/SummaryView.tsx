import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import SectionTitle from './SectionTitle';

interface SummaryViewProps {
  title: string;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  title,
  summary,
  isLoading,
  error
}) => {
  return (
    <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6">
      <SectionTitle 
        title={title} 
        subtitle="AI-generated summary of the paper's key findings and contributions."
        icon={<FaSearch className="h-6 w-6" />}
      />
      
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-perplexity-darkaccent mr-3" />
          <p className="text-perplexity-darksecondary font-medium">Generating summary with AI...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">Error generating summary</p>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && summary && (
        <div className="prose prose-lg max-w-none">
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded-r-md">
            <div className="flex items-center">
              <FaCheck className="text-green-500 h-5 w-5 mr-3" />
              <p className="font-medium text-green-900">
                Summary generated successfully
              </p>
            </div>
          </div>
          <div className="prose-headings:font-semibold prose-headings:text-blue-900 prose-p:text-gray-900 prose-p:mb-4 prose-strong:font-semibold prose-strong:text-blue-900 prose-ul:ml-6 prose-ul:list-disc prose-ol:ml-6 prose-ol:list-decimal prose-li:text-gray-900 prose-a:text-blue-600 prose-h1:text-blue-900 prose-h2:text-blue-800 prose-h3:text-gray-700">
            <div className="prose max-w-none text-gray-900 bg-white">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && !summary && (
        <div className="text-center py-10 text-perplexity-darksecondary">
          <p>No summary available. Click "Generate Summary" to create one.</p>
        </div>
      )}
    </div>
  );
};

export default SummaryView; 