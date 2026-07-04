import React from 'react';
import { Target, ClipboardCheck } from 'lucide-react';

export default function Task() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Title block */}
      <div className="border-b-2 border-indigo-100 pb-4">
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-7 h-7 text-indigo-600" /> The Task
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review the core questions and the final deliverable you will produce.
        </p>
      </div>

      {/* Task Representative Image */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200">
        <img
          src="/task.png"
          alt="Feasibility Report and Orbital Analysis Briefing"
          className="w-full h-auto object-cover max-h-[360px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-white">
          <p className="text-xs md:text-sm font-semibold tracking-wider uppercase font-mono text-indigo-300">Deliverable Objective: Feasibility Report</p>
          <p className="text-[10px] md:text-xs text-slate-200 mt-0.5">Synthesize orbit, phase, eclipse, and habitability data into a colonization recommendation</p>
        </div>
      </div>

      {/* Task Explanation Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
        
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" /> Mission Goal
          </h3>
          <p className="text-slate-700 text-sm md:text-base leading-relaxed">
            Your goal is to create an <strong>Exo-Luna Planetary Feasibility Report</strong> for the colonization committee.
          </p>
        </div>

        <div className="space-y-2 border-t border-slate-200/60 pt-4">
          <h4 className="font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wider">Final Product</h4>
          <p className="text-slate-700 text-xs md:text-sm">During this WebQuest, you will complete investigations to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs md:text-sm">
            <li>Analyze tidal locking and gravity forces.</li>
            <li>Explain moon phase patterns and hemisphere perspectives.</li>
            <li>Evaluate eclipse alignments and potential hazards.</li>
            <li>Investigate geological history and space exploration challenges.</li>
            <li>Formulate a final scientific colonization recommendation.</li>
          </ul>
        </div>

        <div className="space-y-2 border-t border-slate-200/60 pt-4">
          <h4 className="font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wider">Final Deliverable</h4>
          <p className="text-slate-700 text-xs md:text-sm">
            Your final report must include evidence from all four scientific investigations and provide a recommendation:
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 inline-block space-y-2 font-mono text-xs md:text-sm text-slate-800 shadow-sm mt-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-slate-400 rounded flex-shrink-0"></div>
              <span className="font-sans text-slate-700 font-medium">☐ Approve Colonization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-slate-400 rounded flex-shrink-0"></div>
              <span className="font-sans text-slate-700 font-medium">☐ Approve with Precautions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-slate-400 rounded flex-shrink-0"></div>
              <span className="font-sans text-slate-700 font-medium">☐ More Research Required</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 pt-1">
            You must support your final decision using scientific evidence collected throughout your research.
          </p>
        </div>
      </div>

    </div>
  );
}
