import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaSpinner, FaBook, FaExclamationTriangle, FaChartLine, FaArrowRight } from 'react-icons/fa';
import SectionTitle from './SectionTitle';

interface LiteratureSurveyViewProps {
  title: string;
  survey: string | null;
  isLoading: boolean;
  error: string | null;
  paperCount: number;
  onViewFullSurvey?: () => void;
}

const LiteratureSurveyView: React.FC<LiteratureSurveyViewProps> = ({
  title,
  survey,
  isLoading,
  error,
  paperCount,
  onViewFullSurvey
}) => {
  // Function to get a preview of the survey (first 500 characters)
  const getSurveyPreview = (fullSurvey: string) => {
    if (fullSurvey.length <= 500) return fullSurvey;
    
    // Find the nearest period or line break after 500 characters
    let endIndex = 500;
    const periodIndex = fullSurvey.indexOf('.', 500);
    const lineBreakIndex = fullSurvey.indexOf('\n', 500);
    
    if (periodIndex !== -1 && (lineBreakIndex === -1 || periodIndex < lineBreakIndex)) {
      endIndex = periodIndex + 1; // Include the period
    } else if (lineBreakIndex !== -1) {
      endIndex = lineBreakIndex;
    }
    
    return fullSurvey.substring(0, endIndex) + '...';
  };
  
  return (
    <div className="bg-perplexity-darkcard rounded-xl border border-perplexity-darkborder p-6">
      <SectionTitle 
        title={title} 
        subtitle={`Comprehensive literature survey with citations based on ${paperCount} selected papers.`}
        icon={<FaBook className="h-6 w-6" />}
      />
      
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-perplexity-darkaccent mr-3" />
          <p className="text-perplexity-darksecondary font-medium">Generating comprehensive literature survey with AI...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">Error generating literature survey</p>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && survey && (
        <div className="prose prose-lg max-w-none">
          <div className="mb-6 bg-purple-100 border-l-4 border-purple-500 p-4 rounded-r-md">
            <div className="flex items-center">
              <FaChartLine className="text-purple-700 h-5 w-5 mr-3" />
              <p className="font-medium text-purple-900">
                Literature survey completed with {paperCount} paper citations
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-perplexity-darkborder">
            <div className="prose max-w-none text-gray-900 survey-content">
              <style>
                {`
                .survey-content h1 { color: #1e293b; font-size: 1.75rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem; }
                .survey-content h2 { color: #334155; font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem; }
                .survey-content h3 { color: #475569; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem; }
                .survey-content p { color: #334155; margin-bottom: 1rem; line-height: 1.6; }
                .survey-content ul, .survey-content ol { margin-left: 1.5rem; margin-bottom: 1rem; }
                .survey-content li { color: #334155; margin-bottom: 0.5rem; }
                .survey-content strong { color: #1e293b; font-weight: 600; }
                .survey-content a { color: #2563eb; text-decoration: underline; }
                .survey-content blockquote { border-left: 4px solid #7c3aed; background-color: rgba(124, 58, 237, 0.1); padding: 0.5rem 1rem; margin-bottom: 1rem; border-radius: 0.25rem; }
                .survey-content blockquote p { color: #7c3aed; }
                `}
              </style>
              <div className="text-gray-900">
                <ReactMarkdown>{getSurveyPreview(survey)}</ReactMarkdown>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={onViewFullSurvey}
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              <FaArrowRight className="mr-2" />
              View Full Survey with Citations
            </button>
          </div>
        </div>
      )}
      
      {!isLoading && !error && !survey && (
        <div className="text-center py-10 text-white">
          <p>No literature survey available. Select papers and click "Generate Literature Survey" to begin.</p>
        </div>
      )}
    </div>
  );
};

export default LiteratureSurveyView; 