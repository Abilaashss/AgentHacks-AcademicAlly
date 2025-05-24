import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaBook, FaExternalLinkAlt, FaFilePdf, FaSearch, FaChartLine } from 'react-icons/fa';
import { HiDownload } from 'react-icons/hi';

interface LiteratureSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: string;
  papers?: any[];
  topic?: string;
  title?: string;
  content?: string;
  analysisType?: 'survey' | 'gaps' | 'trends';
  theme?: 'light' | 'dark';
}

const LiteratureSurveyModal: React.FC<LiteratureSurveyModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  survey,
  papers,
  topic,
  analysisType = 'survey',
  theme = 'dark'
}) => {
  // Use the most appropriate content source
  const displayContent = content || survey || '';
  const displayTitle = title || topic || 'Analysis';

  // Function to export content as markdown text
  const exportContent = () => {
    const element = document.createElement("a");
    const file = new Blob([displayContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${analysisType}-${displayTitle.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Determine title and icon based on analysis type
  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'gaps':
        return 'Research Gaps Analysis';
      case 'trends':
        return 'Research Trends Analysis';
      default:
        return 'Literature Survey';
    }
  };

  // Add this function to return the correct icon
  const getIcon = () => {
    switch (analysisType) {
      case 'gaps':
        return <FaSearch className="h-6 w-6" />;
      case 'trends':
        return <FaChartLine className="h-6 w-6" />;
      default:
        return <FaBook className="h-6 w-6" />;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}
      aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div 
          className={`inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle rounded-xl shadow-xl transform transition-all ${
            theme === 'dark' 
              ? 'bg-perplexity-darkcard border border-perplexity-darkborder' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-perplexity-darkaccent">{getIcon()}</span>
              <h2 className="text-2xl font-bold text-blue-200">{getAnalysisTitle()}</h2>
            </div>
            <div className="flex items-center">
              <button 
                onClick={exportContent}
                className={`mr-2 flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-perplexity-darkbg hover:bg-gray-800 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <HiDownload className="mr-1" /> Export
              </button>
              <button 
                onClick={onClose}
                className={`rounded-full p-1 ${
                  theme === 'dark'
                    ? 'hover:bg-perplexity-darkbg text-gray-300 hover:text-white'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content with scrolling */}
          <div 
            className={`mt-2 p-4 rounded-lg border overflow-y-auto max-h-[70vh] bg-white border-perplexity-darkborder text-gray-900`}
          >
            <div className={`prose max-w-none`}>
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiteratureSurveyModal; 