import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ChapterPagination({ prevView, prevLabel, nextView, nextLabel, onNavigate }) {
  return (
    <div className="chapter-pagination-container mt-8 pt-6 border-t border-white/10 no-print">
      <div className="flex justify-between items-center w-full">
        {prevView ? (
          <button 
            onClick={() => onNavigate(prevView)} 
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous: {prevLabel}</span>
          </button>
        ) : <div />}

        {nextView ? (
          <button 
            onClick={() => onNavigate(nextView)} 
            className="btn btn-primary-glow text-sm flex items-center gap-2"
          >
            <span>Next: {nextLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
