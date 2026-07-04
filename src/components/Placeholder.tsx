import React, { useState } from 'react';
import { Code, Eye, EyeOff } from 'lucide-react';

interface PlaceholderProps {
  comment: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  hint?: string;
}

export default function Placeholder({ comment, title, description, children, hint }: PlaceholderProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="my-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors overflow-hidden">
      {/* Placeholder Header */}
      <div className="bg-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm">📌</span>
          <span className="font-serif text-sm font-bold text-slate-800">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-all focus:outline-none"
            title="Toggle HTML comment preview"
          >
            <Code className="w-3.5 h-3.5 text-blue-500" />
            {showCode ? 'Hide Code' : 'View HTML Comment'}
          </button>
        </div>
      </div>

      {/* Code Comment Box */}
      {showCode && (
        <div className="bg-slate-950 p-3 border-b border-slate-800 font-mono text-xs text-blue-400 overflow-x-auto select-all">
          <span className="text-slate-500">&lt;!--</span> <span className="text-yellow-400 font-bold">{comment}</span> <span className="text-slate-500">--&gt;</span>
          {hint && (
            <div className="text-[10px] text-slate-500 mt-1 italic">
              {hint}
            </div>
          )}
        </div>
      )}

      {/* Main Placeholder Workspace */}
      <div className="p-5">
        <p className="text-xs text-slate-500 mb-4 font-sans leading-relaxed">
          <span className="font-semibold text-slate-700">Instructions:</span> {description}
        </p>

        {children ? (
          <div className="border border-slate-200 rounded bg-white p-4 shadow-sm">
            {children}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-100/60 rounded border border-slate-200 border-dashed text-slate-400 font-mono text-xs">
            No interactive preview - Content will render here
          </div>
        )}
      </div>
    </div>
  );
}
