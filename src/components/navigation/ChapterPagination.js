import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ChapterPagination({ prevView, prevLabel, nextView, nextLabel, onNavigate }) {
  if (!prevView && !nextView) return null;

  return (
    <nav className="chapter-pagination-container mt-8 pt-6 border-t border-amber-400/20 no-print" aria-label="Chapter Navigation">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
        {prevView ? (
          <button 
            onClick={() => {
              onNavigate(prevView);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="btn btn-secondary text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 py-2.5 px-4 rounded-xl font-bold transition-all hover:border-amber-400/40"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="truncate">Back: {prevLabel}</span>
          </button>
        ) : <div className="hidden sm:block" />}

        {nextView ? (
          <button 
            onClick={() => {
              onNavigate(nextView);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="btn btn-primary-glow text-xs sm:text-sm flex items-center justify-center sm:justify-end gap-2 py-2.5 px-5 rounded-xl font-bold transition-all shadow-md shadow-amber-400/20"
          >
            <span className="truncate">Next: {nextLabel}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 flex-shrink-0" />
          </button>
        ) : <div className="hidden sm:block" />}
      </div>
    </nav>
  );
}

