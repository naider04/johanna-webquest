import React from 'react';
import { StudentDetails, RubricScore } from '../types';
import { Award, Compass, CheckCircle2, Globe, BookOpen, PenTool, Clipboard, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';
import { EclipseElement } from './EclipseSandbox';
import { getRubricTotal } from '../lib/grading';

interface ConclusionProps {
  details: StudentDetails;
  score: RubricScore;
  activity1Evidence: string | null;
  activity1Prediction: string;
  activity2BrightSide: string;
  activity2Hemisphere: string;
  sandboxElements: EclipseElement[];
  activity3CompareExplain: string;
  activity3SolarEffect: string;
  activity3Screenshot: string | null;
  activity4Reflection: string;
  missionTargetName: string;
  missionTidalSummary: string;
  missionPhasesSummary: string;
  missionEclipseSummary: string;
  missionHabitabilitySummary: string;
  missionFinalRecommendation: string;
  missionFinalJustification: string;
  missionReportSubmitted: boolean;
}

export default function Conclusion({
  details,
  score,
  activity1Evidence,
  activity1Prediction,
  activity2BrightSide,
  activity2Hemisphere,
  sandboxElements,
  activity3CompareExplain,
  activity3SolarEffect,
  activity3Screenshot,
  activity4Reflection,
  missionTargetName,
  missionTidalSummary,
  missionPhasesSummary,
  missionEclipseSummary,
  missionHabitabilitySummary,
  missionFinalRecommendation,
  missionFinalJustification,
  missionReportSubmitted,
}: ConclusionProps) {
  // Map values to points
  const isComplete = Boolean(
    activity1Prediction && activity1Prediction.trim().length > 0 &&
    activity2BrightSide && activity2BrightSide.trim().length > 0 &&
    activity2Hemisphere && activity2Hemisphere.trim().length > 0
  );

  const totalPoints = getRubricTotal(score);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Title block */}
      <div className="border-b-2 border-indigo-100 pb-4">
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-7 h-7 text-indigo-600" /> Conclusion
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Your scientific inquiry is complete! Reflect on your findings and review your submitted feasibility report.
        </p>
      </div>

      {/* Conclusion Representative Image */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200">
        <img
          src="/conclusion.png"
          alt="Future settlement and research station on Kepler-Prime stabilized by Exo-Luna"
          className="w-full h-auto object-cover max-h-[360px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-white">
          <p className="text-xs md:text-sm font-semibold tracking-wider uppercase font-mono text-indigo-300">Inquiry Complete: Colonization Feasibility</p>
          <p className="text-[10px] md:text-xs text-slate-200 mt-0.5">Using astronomical observations to secure our future among the stars</p>
        </div>
      </div>

      {/* Congratulations / Mission Completion Banner */}
      <div className="bg-indigo-50 border-2 border-indigo-200 text-slate-800 rounded-xl p-6 md:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <CheckCircle2 className="w-12 h-12 text-indigo-600 mb-3" />
          <h3 className="font-sans text-xl md:text-2xl font-bold text-indigo-950 tracking-tight">
            Congratulations, Planetary Scientist!
          </h3>
          <p className="text-slate-700 text-sm md:text-base max-w-2xl mx-auto mt-2 leading-relaxed">
            You have completed the Exo-Luna investigation and submitted your feasibility report. Your final score combines automatic question checks with teacher review of participation and oral production.
          </p>
        </div>
      </div>

      {/* Review What Students Learned & Closing Message */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">What You Discovered</h4>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            During this investigation, you discovered how gravity shapes planetary systems, how orbital motion creates observable patterns, and how moons can influence the environments of their planets.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Closing Reflection</h4>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            The exploration of space depends on scientists who can observe, analyze evidence, and make informed decisions. Your work as a planetary researcher contributes to humanity's understanding of worlds beyond Earth.
          </p>
        </div>
      </div>

      {/* Reflection Prompts */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" /> Reflection &amp; Inquiry Synthesis
        </h4>
        <p className="text-xs text-slate-500">
          Consider these guiding reflection questions as you finalize your academic notes or share findings with colleagues:
        </p>
        <ul className="list-decimal pl-5 space-y-3 text-xs md:text-sm text-slate-700 font-sans">
          <li className="pl-1">
            <span className="font-semibold text-slate-950">How did your understanding of the Moon change after completing this investigation?</span>
          </li>
          <li className="pl-1">
            <span className="font-semibold text-slate-950">Which scientific factor would be most important when deciding whether to colonize a planet with a moon?</span>
          </li>
          <li className="pl-1">
            <span className="font-semibold text-slate-950">How can simulations and digital resources help scientists study places humans cannot easily visit?</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
