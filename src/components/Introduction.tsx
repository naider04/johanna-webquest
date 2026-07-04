import React from 'react';
import { Compass, BookOpen } from 'lucide-react';

export default function Introduction() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header Block */}
      <div className="border-b-2 border-indigo-100 pb-4">
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" /> Introduction
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Explore the relationship between planets and their natural satellites to evaluate Kepler-Prime's suitability for human settlement.
        </p>
      </div>

      {/* Mission Representative Image */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200">
        <img
          src="/introduction.png"
          alt="Kepler-Prime and its mysterious moon Exo-Luna"
          className="w-full h-auto object-cover max-h-[360px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-white">
          <p className="text-xs md:text-sm font-semibold tracking-wider uppercase font-mono text-indigo-300">Target Object: Kepler-Prime &amp; Exo-Luna</p>
          <p className="text-[10px] md:text-xs text-slate-200 mt-0.5">Orbital alignment and phase simulation analysis baseline</p>
        </div>
      </div>

      {/* Main Narrative & Context */}
      <div className="space-y-6 text-slate-700 font-sans leading-relaxed text-sm md:text-base">
        
        {/* The Scenario Card */}
        <div className="flex gap-4 p-5 rounded-xl border border-indigo-100 bg-indigo-50/30">
          <Compass className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-indigo-950 uppercase tracking-wider text-xs md:text-sm">The Scenario</h4>
            <p className="text-slate-700 text-xs md:text-sm leading-relaxed">
              Humanity has discovered <strong>Kepler-Prime</strong>, a planet located in a distant star system that may support future human settlement. However, scientists have identified a major challenge: Kepler-Prime is accompanied by a mysterious moon called <strong>Exo-Luna</strong>, and little is known about how this moon could affect the planet's environment.
            </p>
          </div>
        </div>

        {/* The Scientific Problem */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wider">The Scientific Problem</h4>
          <p>
            Earth's Moon provides an important example of how a natural satellite can influence a planet. Its gravity affects tides, its orbit creates predictable phases, and its position allows scientists to study planetary systems. To prepare for colonization, researchers must use Earth's Moon as a model to predict how Exo-Luna may behave.
          </p>
        </div>

        {/* Student Role */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wider">Your Role</h4>
          <p>
            You are part of a planetary science team responsible for analyzing the Earth-Moon system. Your mission is to investigate lunar mechanics and use your findings to evaluate whether Kepler-Prime is prepared for human settlement.
          </p>
        </div>

        {/* Transition / Call to Action */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wider">Scientific Investigation</h4>
          <p className="font-medium text-slate-800">
            Through simulations, research, and scientific modeling, you will collect evidence and create a final planetary feasibility report.
          </p>
        </div>
      </div>

    </div>
  );
}
