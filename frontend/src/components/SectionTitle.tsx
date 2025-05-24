import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        {icon && <span className="text-perplexity-darkaccent">{icon}</span>}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-blue-200 text-base mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle; 