import React from 'react';
import { RubricScore } from '../types';
import { Award, CheckCircle, Trophy } from 'lucide-react';
import { getRubricTotal } from '../lib/grading';

interface EvaluationProps {
  score: RubricScore;
  onScoreChange: (criteria: keyof RubricScore, rating: 'Excellent' | 'Good' | 'Needs Improvement') => void;
}

export default function Evaluation({ score, onScoreChange }: EvaluationProps) {
  const criteriaList: {
    id: keyof RubricScore;
    name: string;
    description: string;
    excellentText: string;
    goodText: string;
    needsImprovementText: string;
  }[] = [
    {
      id: 'evidence',
      name: 'Automatic: Evidence Collection',
      description: 'Computed from the saved simulator work, screenshots, and final report.',
      excellentText: 'Most evidence checkpoints are complete, including the simulator, screenshot, and final report.',
      goodText: 'Several evidence checkpoints are complete, but one or two artifacts are missing.',
      needsImprovementText: 'Few evidence checkpoints are complete, so the automatic evidence score is low.',
    },
    {
      id: 'understanding',
      name: 'Automatic: Question Accuracy',
      description: 'Computed from the written answers across the logbooks and mission report.',
      excellentText: 'Most question prompts are complete with clear scientific explanations.',
      goodText: 'Some question prompts are complete with understandable but uneven explanations.',
      needsImprovementText: 'The question prompts are mostly incomplete, so the automatic understanding score is low.',
    },
    {
      id: 'participation',
      name: 'Teacher Review: Participation',
      description: 'Scored by the teacher based on engagement, collaboration, and class contribution.',
      excellentText: 'The student participated actively and contributed consistently during the lesson.',
      goodText: 'The student participated appropriately, though engagement was uneven or needed prompting.',
      needsImprovementText: 'The student showed limited participation and needed frequent prompting.',
    },
    {
      id: 'oralProduction',
      name: 'Teacher Review: Oral Production',
      description: 'Scored by the teacher based on oral explanation and scientific vocabulary.',
      excellentText: 'The student explained ideas clearly and used accurate scientific language.',
      goodText: 'The student explained ideas with some clarity, but needed support with vocabulary or detail.',
      needsImprovementText: 'The oral explanation was brief, unclear, or lacked scientific vocabulary.',
    }
  ];

  // Map values to points
  const getPoints = (val: 'Excellent' | 'Good' | 'Needs Improvement' | null | undefined) => {
    if (val === 'Excellent') return 4;
    if (val === 'Good') return 3;
    if (val === 'Needs Improvement') return 1;
    return 0;
  };

  const totalPoints = getRubricTotal(score);

  const maxPoints = 16;
  const gradePercentage = Math.round((totalPoints / maxPoints) * 100);

  const isAllSelected =
    score?.participation !== null && score?.participation !== undefined &&
    score?.evidence !== null && score?.evidence !== undefined &&
    score?.understanding !== null && score?.understanding !== undefined &&
    score?.oralProduction !== null && score?.oralProduction !== undefined;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Title block */}
      <div className="border-b-2 border-blue-100 pb-4 mb-6">
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-7 h-7 text-blue-600" /> Evaluation Rubric
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Half of the score is computed automatically from the submitted questions and evidence. The other half is scored by the teacher for participation and oral production.
        </p>
      </div>

      {/* Rubric Table Container */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <table id="evaluation-rubric-table" className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-sans text-sm">
              <th className="p-4 w-1/4 font-bold">Inquiry Criteria</th>
              <th className="p-4 w-1/4 font-bold text-emerald-700 bg-emerald-50/40">Excellent (4 pts)</th>
              <th className="p-4 w-1/4 font-bold text-blue-700 bg-blue-50/40">Good (3 pts)</th>
              <th className="p-4 w-1/4 font-bold text-amber-700 bg-amber-50/40">Needs Improvement (1 pt)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-600 font-sans">
            {criteriaList.map((crit) => (
              <tr key={crit.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Criteria Column */}
                <td className="p-4 border-r border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm mb-1">{crit.name}</span>
                  <p className="text-[11px] text-slate-400 leading-normal">{crit.description}</p>
                </td>

                {/* Excellent Cell */}
                <td
                  className={`p-4 border-r border-slate-200 transition-colors relative ${
                    score?.[crit.id] === 'Excellent'
                      ? 'bg-emerald-50 border-2 border-emerald-500 font-medium text-emerald-900'
                      : ''
                  }`}
                >
                  {score?.[crit.id] === 'Excellent' && (
                    <div className="absolute top-1 right-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4 fill-current text-white" />
                    </div>
                  )}
                  {crit.excellentText}
                </td>

                {/* Good Cell */}
                <td
                  className={`p-4 border-r border-slate-200 transition-colors relative ${
                    score?.[crit.id] === 'Good'
                      ? 'bg-blue-50 border-2 border-blue-500 font-medium text-blue-900'
                      : ''
                  }`}
                >
                  {score?.[crit.id] === 'Good' && (
                    <div className="absolute top-1 right-1 text-blue-600">
                      <CheckCircle className="w-4 h-4 fill-current text-white" />
                    </div>
                  )}
                  {crit.goodText}
                </td>

                {/* Needs Improvement Cell */}
                <td
                  className={`p-4 transition-colors relative ${
                    score?.[crit.id] === 'Needs Improvement'
                      ? 'bg-amber-50 border-2 border-amber-500 font-medium text-amber-900'
                      : ''
                  }`}
                >
                  {score?.[crit.id] === 'Needs Improvement' && (
                    <div className="absolute top-1 right-1 text-amber-600">
                      <CheckCircle className="w-4 h-4 fill-current text-white" />
                    </div>
                  )}
                  {crit.needsImprovementText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scoring Card - Now placed BELOW the Rubric */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/40">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="font-sans text-base font-bold text-blue-200">Classroom Grade Summary</h4>
            <p className="text-xs text-slate-400 font-sans">Total accumulated score assigned by your teacher.</p>
          </div>
        </div>

        {isAllSelected ? (
          <div className="text-center sm:text-right font-sans">
            <span className="text-3xl md:text-4xl font-bold text-amber-400">
              {totalPoints} / {maxPoints}
            </span>
            <span className="block text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
              Performance Level: {gradePercentage >= 90 ? 'A - Outstanding' : gradePercentage >= 75 ? 'B - Good' : 'C - Developing'} ({gradePercentage}%)
            </span>
          </div>
        ) : (
          <div className="text-center sm:text-right font-sans">
            <span className="text-amber-400 font-bold text-lg block">
              Grade Pending
            </span>
            <span className="block text-xs font-sans text-slate-400 mt-1">
              Your teacher will grade each area after reviewing your logbooks.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
