import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilePdf, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';

interface PaperCardProps {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  source: string;
  url: string;
  pdfUrl?: string;
  venue?: string;
  theme: 'light' | 'dark';
}

const PaperCard: React.FC<PaperCardProps> = ({
  id,
  title,
  authors,
  abstract,
  publishedDate,
  source,
  url,
  pdfUrl,
  venue,
  theme
}) => {
  // Format date
  const formattedDate = new Date(publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Truncate abstract
  const truncatedAbstract = abstract && abstract.length > 300
    ? abstract.substring(0, 300) + '...'
    : abstract;
  
  return (
    <div className={`rounded-xl border p-6 hover:shadow-lg transition-shadow duration-200 ${
      theme === 'dark' 
        ? 'bg-perplexity-darkcard border-perplexity-darkborder' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-perplexity-darktext' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <div className={`flex flex-wrap items-center text-sm mb-3 ${
            theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'
          }`}>
            <span className="mr-2">{formattedDate}</span>
            {venue && (
              <>
                <span className="mx-2">•</span>
                <span>{venue}</span>
              </>
            )}
            <span className="mx-2">•</span>
            <span className="capitalize">{source}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-colors duration-200 ${
                theme === 'dark'
                  ? 'text-perplexity-darksecondary hover:text-perplexity-darkaccent hover:bg-perplexity-darkbg'
                  : 'text-gray-500 hover:text-primary hover:bg-gray-100'
              }`}
              title="Download PDF"
            >
              <FaFilePdf className="h-5 w-5" />
            </a>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark'
                ? 'text-perplexity-darksecondary hover:text-perplexity-darkaccent hover:bg-perplexity-darkbg'
                : 'text-gray-500 hover:text-primary hover:bg-gray-100'
            }`}
            title="Visit original source"
          >
            <FaExternalLinkAlt className="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <div className="mt-2">
        <p className={`text-sm mb-2 ${
          theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'
        }`}>
          {authors && authors.length > 0 ? (
            <>
              <span className="font-medium">Authors:</span> {authors.join(', ')}
            </>
          ) : (
            'Unknown authors'
          )}
        </p>
        
        <p className={theme === 'dark' ? 'text-perplexity-darktext mb-4' : 'text-gray-800 mb-4'}>
          {truncatedAbstract || 'No abstract available.'}
        </p>
        
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/paper/${id}`}
            className={`inline-flex items-center font-medium ${
              theme === 'dark' 
                ? 'text-perplexity-darkaccent hover:text-blue-400' 
                : 'text-primary hover:text-blue-600'
            }`}
          >
            View Details <FaArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaperCard; 