import React from 'react';
import { WebQuestPage } from '../types';
import { ChevronLeft, ChevronRight, Home, Info, Target, Cpu, Award, CheckCircle } from 'lucide-react';

interface NavigationProps {
  activePage: WebQuestPage;
  onPageChange: (page: WebQuestPage) => void;
}

export default function Navigation({ activePage, onPageChange }: NavigationProps) {
  const pages: { id: WebQuestPage; label: string; icon: React.ReactNode }[] = [
    { id: 'title', label: 'Title Page', icon: <Home className="w-4 h-4" /> },
    { id: 'intro', label: 'Introduction', icon: <Info className="w-4 h-4" /> },
    { id: 'task', label: 'The Task', icon: <Target className="w-4 h-4" /> },
    { id: 'process', label: 'The Process', icon: <Cpu className="w-4 h-4" /> },
    { id: 'evaluation', label: 'Evaluation', icon: <Award className="w-4 h-4" /> },
    { id: 'conclusion', label: 'Conclusion', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const currentIndex = pages.findIndex((p) => p.id === activePage);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onPageChange(pages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      onPageChange(pages[currentIndex + 1].id);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-[#334155] border-b border-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-1 md:py-0">
          
          {/* Tabs List */}
          <nav id="webquest-navbar" className="flex overflow-x-auto scrollbar-none py-1.5 md:py-0 -mx-4 px-4 md:mx-0 md:px-0 gap-1.5">
            {pages.map((page) => {
              const isActive = activePage === page.id;
              return (
                <button
                  key={page.id}
                  id={`nav-btn-${page.id}`}
                  onClick={() => onPageChange(page.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs md:text-sm font-semibold transition-all rounded-md whitespace-nowrap focus:outline-none ${
                    isActive
                      ? 'bg-[#475569] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#475569]/50'
                  }`}
                >
                  {page.icon}
                  {page.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Page Steps / Back-Next Indicator */}
          <div className="flex items-center justify-between md:justify-end gap-3 mt-1.5 md:mt-0 border-t border-slate-600/30 md:border-t-0 pt-1.5 md:pt-0 pb-1.5 md:pb-0">
            <button
              id="nav-btn-prev"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-600 hover:bg-slate-500 disabled:opacity-30 disabled:hover:bg-slate-600 rounded-md text-slate-100 transition-colors focus:outline-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs font-mono text-slate-300">
              {currentIndex + 1} / {pages.length}
            </span>
            <button
              id="nav-btn-next"
              onClick={handleNext}
              disabled={currentIndex === pages.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 rounded-md text-white transition-colors focus:outline-none"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
