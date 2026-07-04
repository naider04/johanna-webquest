import React from 'react';
import { RubricScore } from '../types';
import { Award, CheckCircle, Trophy, BarChart3 } from 'lucide-react';

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
      name: 'Game 1: Tidal Locking Simulation',
      description: 'Configuring the moon\'s orbit and rotation to achieve stable synchronous locking.',
      excellentText: 'Successfully completed the simulator, adjusted gravity, orbital velocity, and achieved stable, 1:1 synchronous tidal locking.',
      goodText: 'Completed the simulator and achieved temporary synchrony, but with minor orbital decay or drift.',
      needsImprovementText: 'Unable to achieve synchronous tidal locking, or orbital parameters remained unstable.',
    },
    {
      id: 'understanding',
      name: 'Questionnaire 1: Tidal Locking & Gravity Logbook',
      description: 'Understanding of gravitational coupling, tidal bulges, and synchronous rotation.',
      excellentText: 'Answers to the tidal locking logbook are complete, demonstrate precise physics knowledge, and explain rotation coupling accurately.',
      goodText: 'Answers are complete with general understanding, but contain minor physical misconceptions.',
      needsImprovementText: 'Answers are incomplete or demonstrate significant misconceptions about tidal coupling.',
    },
    {
      id: 'participation',
      name: 'Questionnaire 2: Moon Phases Logbook',
      description: 'Understanding of sunlight illumination angle and hemispheric perspective shifts.',
      excellentText: 'Answers to the moon phases logbook are complete, accurate, and perfectly explain sunlight illumination angles and perspective inversion.',
      goodText: 'Answers are complete with general understanding of phases, though some explanation lines are brief.',
      needsImprovementText: 'Answers are incomplete, incorrect, or show limited understanding of phase angles.',
    }
  ];

  // Map values to points
  const getPoints = (val: 'Excellent' | 'Good' | 'Needs Improvement' | null | undefined) => {
    if (val === 'Excellent') return 4;
    if (val === 'Good') return 3;
    if (val === 'Needs Improvement') return 1;
    return 0;
  };

  const totalPoints =
    getPoints(score?.participation) +
    getPoints(score?.evidence) +
    getPoints(score?.understanding);

  const maxPoints = 12;
  const gradePercentage = Math.round((totalPoints / maxPoints) * 100);

  const isAllSelected =
    score?.participation !== null && score?.participation !== undefined &&
    score?.evidence !== null && score?.evidence !== undefined &&
    score?.understanding !== null && score?.understanding !== undefined;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Title block */}
      <div className="border-b-2 border-blue-100 pb-4 mb-6">
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-7 h-7 text-blue-600" /> Evaluation Rubric
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review the grading guidelines. Your teacher will evaluate your work and grade this rubric.
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
