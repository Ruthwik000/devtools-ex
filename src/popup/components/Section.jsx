import React from 'react';

const Section = ({ title, expanded, onToggle, children }) => {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
      >
        <span className="font-medium text-slate-100">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="px-4 py-3 border-t border-slate-800 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default Section;
