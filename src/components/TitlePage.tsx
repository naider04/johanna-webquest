import React from 'react';
import { BookOpen, User, GraduationCap, Layers, Calendar, Info } from 'lucide-react';

export default function TitlePage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      
      {/* Main Cover Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-10 max-w-3xl mx-auto">
        
        {/* Top Decorative Space-Themed Academic Accent */}
        <div className="h-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />

        <div className="p-8 md:p-12 text-center">
          
          {/* UNEMI Logo & Institution Header */}
          <div className="mb-6">
            <div className="min-h-[100px] flex items-center justify-center mb-3">
              <img 
                src="/logo_unemi.png" 
                alt="UNEMI Logo" 
                className="max-h-24 object-contain transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="text-slate-500 font-mono text-[11px] uppercase tracking-wider font-bold">
              State University of Milagro
            </div>
          </div>

          {/* Separation Line */}
          <div className="w-16 h-1 bg-indigo-600 mx-auto mb-8 rounded-full" />

          {/* Academic Topic / Book Title */}
          <div className="mb-8 space-y-3">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest inline-block">
              Academic WebQuest Project
            </span>
            <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Exo-Lunar Mechanics &amp; Habitability
            </h2>
            <p className="text-slate-500 text-sm font-medium italic">
              A Comparative Inquiry into Earth-Moon Dynamics and Keplerian Systems
            </p>
          </div>

          {/* Academic Description of the WebQuest */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-8 text-left max-w-xl mx-auto flex gap-3">
            <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project Abstract &amp; Framework</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                This WebQuest guides students through an interactive inquiry-based physics laboratory. By investigating tidal locking gravity, phases, and eclipse ray geometry of Earth's Moon, students build the academic models required to conduct a predictive suitability analysis for future colonization of the newly discovered planet, Kepler-Prime, and its satellite, Exo-Luna.
              </p>
            </div>
          </div>

          {/* Course Details Graphic / Accent */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 text-left max-w-xl mx-auto space-y-4 shadow-sm">
            
            {/* Author */}
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Author / Researcher
                </span>
                <span className="font-sans text-base font-bold text-slate-800">
                  JOHANNA KATHERINE LLANEZ BELTRAN
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Subject / Course
                </span>
                <span className="font-sans text-sm font-semibold text-slate-700 uppercase">
                  E-LEARNING: TRENDS &amp; CHALLENGES
                </span>
              </div>
            </div>

            {/* Career / Program */}
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Career / Program
                </span>
                <span className="font-sans text-sm font-semibold text-slate-700 capitalize">
                  Pedagogy of National and Foreign Languages
                </span>
              </div>
            </div>

            {/* Level & Institution */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Level
                  </span>
                  <span className="font-sans text-sm font-semibold text-slate-700">
                    6th Semester
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Academic Year
                  </span>
                  <span className="font-sans text-sm font-semibold text-slate-700">
                    2026
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
