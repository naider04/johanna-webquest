import React from 'react';
import { Compass, HelpCircle, Upload, Eye, ExternalLink, Globe, BookOpen, PenTool, CheckCircle, Radio, Clipboard, Anchor, Moon, Sun, ShieldCheck } from 'lucide-react';
import MoonExperiment from './MoonExperiment';
import EclipseSandbox, { EclipseElement } from './EclipseSandbox';

interface ProcessProps {
  activity1Evidence: string | null;
  onActivity1EvidenceChange: (val: string | null) => void;
  activity1Prediction: string;
  onActivity1PredictionChange: (val: string) => void;
  activity2BrightSide: string;
  onActivity2BrightSideChange: (val: string) => void;
  activity2Hemisphere: string;
  onActivity2HemisphereChange: (val: string) => void;
  sandboxElements: EclipseElement[];
  onSandboxElementsChange: (elements: EclipseElement[]) => void;
  activity3CompareExplain: string;
  onActivity3CompareExplainChange: (val: string) => void;
  activity3SolarEffect: string;
  onActivity3SolarEffectChange: (val: string) => void;
  activity3Screenshot: string | null;
  onActivity3ScreenshotChange: (val: string | null) => void;
  activity4Reflection: string;
  onActivity4ReflectionChange: (val: string) => void;
}

export default function Process({
  activity1Evidence,
  onActivity1EvidenceChange,
  activity1Prediction,
  onActivity1PredictionChange,
  activity2BrightSide,
  onActivity2BrightSideChange,
  activity2Hemisphere,
  onActivity2HemisphereChange,
  sandboxElements,
  onSandboxElementsChange,
  activity3CompareExplain,
  onActivity3CompareExplainChange,
  activity3SolarEffect,
  onActivity3SolarEffectChange,
  activity3Screenshot,
  onActivity3ScreenshotChange,
  activity4Reflection,
  onActivity4ReflectionChange,
}: ProcessProps) {

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      
      {/* Title block */}
      <div className="border-b-2 border-indigo-100 pb-4">
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 animate-fadeIn">
          <Compass className="w-7 h-7 text-indigo-600" /> The Scientific Process
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Complete the research phases and interact with the simulators to solve the mystery of Exo-Luna.
        </p>
      </div>

      {/* ACTIVITY 1: ROTATION LOCKING & OCEANIC TIDES */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-indigo-600" />
            <h3 className="font-sans text-lg md:text-xl font-bold text-slate-800">
              Activity 1: Gravity, Tidal Locking, and Oceanic Tides
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
            Evidence 1
          </span>
        </div>

        {/* Narrative & Scientific Mission */}
        <div className="text-slate-700 text-xs md:text-sm leading-relaxed space-y-3 font-sans bg-slate-50/80 p-4 rounded-lg border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-600">
            Scientific Inquiry Worksheet: Tidal Locking
          </h4>
          <p>
            <strong>Tidal locking</strong> occurs when a planet's gravity slows down its moon's rotation until it takes just as long to rotate on its own axis as it does to complete one orbit. As a result of this synchrony, an observer on the planet <strong>will always see the same side</strong> of the moon. Furthermore, the differential gravitational pull creates tides that deform the oceans into a bulge.
          </p>
          <div className="border-t border-slate-200/60 pt-2.5 mt-2 space-y-2">
            <h5 className="font-bold text-xs text-slate-800">Student Guide:</h5>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 text-xs">
              <li>Use the research resources to investigate how orbits and gravity synchronize.</li>
              <li>Adjust the controls in the <strong>Moon Orbit Simulator</strong> so that the Rotational Period matches the Orbital Period: <strong>27.322 days</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Required Resources for Activity 1 */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3">
          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Required Research Resources</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://beltoforion.de/en/tides/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm rounded-lg transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Tides Explained Tutorial</span>
                <span className="text-[10px] text-slate-400">Gravity cycles and orbital physics</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </a>
            <a
              href="https://cdn.oceanservice.noaa.gov/oceanserviceprod/facts/springtide.gif"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm rounded-lg transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Spring and Neap Tides GIF</span>
                <span className="text-[10px] text-slate-400">Visual demonstration of tidal bulge</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </a>
          </div>
        </div>

        {/* The Simulator */}
        <MoonExperiment
          onLockCompleted={(completed) => {
            if (completed && activity1Evidence !== 'ACHIEVED') {
              onActivity1EvidenceChange('ACHIEVED');
            }
          }}
          isCompletedInitially={activity1Evidence === 'ACHIEVED'}
        />

        {/* Auto-detected Status Card */}
        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Simulator Verification Status
          </label>
          {activity1Evidence === 'ACHIEVED' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 animate-fadeIn">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold">TIDAL LOCKING ACHIEVED!</strong>
                The simulation has verified a perfect synchronous orbit (Rotational Period = Orbital Period). Your progress has been saved.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0 animate-pulse" />
              <div className="text-xs">
                <strong className="block font-bold">PENDING COMPLETION</strong>
                Set the Moon's Rotational Period to <strong>27.322 days</strong> and press Play in the simulator to complete this activity.
              </div>
            </div>
          )}
        </div>

        {/* Complete sentences section */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
            Logbook: Complete Investigation Sentences
          </h4>
          
          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
            {/* Sentence 1 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
              <p>
                1. Tidal locking occurs when the orbital period of a satellite is exactly{' '}
                <select
                  value={(activity1Prediction || '').split('|')[0] || ''}
                  onChange={(e) => {
                    const parts = (activity1Prediction || '').split('|');
                    parts[0] = e.target.value;
                    onActivity1PredictionChange(parts.join('|'));
                  }}
                  className="mx-1 px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- select --</option>
                  <option value="equal">equal (synchronous)</option>
                  <option value="double">double</option>
                  <option value="half">half</option>
                </select>{' '}
                to its rotation period on its own axis.
              </p>
            </div>

            {/* Sentence 2 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
              <p>
                2. As a result of this synchronized rotation coupling, the observable face of the satellite{' '}
                <select
                  value={(activity1Prediction || '').split('|')[1] || ''}
                  onChange={(e) => {
                    const parts = (activity1Prediction || '').split('|');
                    parts[1] = e.target.value;
                    onActivity1PredictionChange(parts.join('|'));
                  }}
                  className="mx-1 px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- select --</option>
                  <option value="always">always</option>
                  <option value="never">never</option>
                  <option value="sometimes">sometimes</option>
                </select>{' '}
                faces in the same direction towards its host planet.
              </p>
            </div>

            {/* Sentence 3 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
              <p>
                3. The differential gravity exerted by the moon lifts and deforms the planet's water masses, creating a symmetric tidal{' '}
                <select
                  value={(activity1Prediction || '').split('|')[2] || ''}
                  onChange={(e) => {
                    const parts = (activity1Prediction || '').split('|');
                    parts[2] = e.target.value;
                    onActivity1PredictionChange(parts.join('|'));
                  }}
                  className="mx-1 px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- select --</option>
                  <option value="bulge">bulge</option>
                  <option value="whirlpool">whirlpool</option>
                  <option value="funnel">funnel</option>
                </select>{' '}
                on both sides of the planetary body.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY 2: MOON PHASES & HEMISPHERE PERSPECTIVES */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="font-sans text-lg md:text-xl font-bold text-slate-800">
              Activity 2: Moon Phases and Hemispheric Perspectives
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
            Evidence 2
          </span>
        </div>

        {/* Narrative & Scientific Mission */}
        <div className="text-slate-700 text-xs md:text-sm leading-relaxed space-y-3 font-sans bg-slate-50/80 p-4 rounded-lg border border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-600">
            Scientific Inquiry Worksheet: Sunlight and Hemispheres
          </h4>
          <p>
            Viewed from space, the sun always illuminates exactly half of a moon. However, for an observer on the planet, the proportion of that illuminated half that is visible changes constantly throughout the month, creating the <strong>eight lunar phases</strong>. A surprising fact of geometric perspective is that observers in the Northern and Southern Hemispheres see the same phase inverted from left to right.
          </p>
          <div className="border-t border-slate-200/60 pt-2.5 mt-2 space-y-2">
            <h5 className="font-bold text-xs text-slate-800">Student Guide:</h5>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 text-xs">
              <li>Click on the interactive link to open the <strong>PBS Learning Media 3D Simulator</strong> in a new tab. Observe how illumination changes from space versus Earth perspective.</li>
              <li>Analyze the <strong>Hemispheric Perspective Diagram</strong> to see how the crescent's curvature is inverted depending on the observer's location on the globe.</li>
              <li>Complete the scientific sentences based on your observations in the phases simulator.</li>
            </ol>
          </div>
        </div>

        {/* Required Resources for Activity 2 */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3">
          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Required Research Resources</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://spaceplace.nasa.gov/oreo-moon/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm rounded-lg transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">NASA Oreo Moon Phases (English)</span>
                <span className="text-[10px] text-slate-400">Guide to model moon phases interactively</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </a>
            <a
              href="https://solarsystem.nasa.gov/__webgl/5/moon_lunar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm rounded-lg transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">NASA 3D Moon Visualizer</span>
                <span className="text-[10px] text-slate-400">Plan phases and satellite orientations</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </a>
          </div>
        </div>

        {/* Comparative Materials Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* PBS Simulator Link Image */}
          <div className="flex flex-col space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. PBS Interactive Simulator (Click to open)
            </span>
            <a
              href="https://www.pbslearningmedia.org/resource/buac19-35-sci-ess-earthsunmoon35model/moon-phases-simulation-viewed-from-earth-and-space/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-xl border border-slate-200 shadow-md transition-all duration-300 hover:shadow-xl hover:border-indigo-400"
            >
              <img
                src="/image_011.png.png"
                alt="PBS Moon Phases Simulator Screenshot"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <ExternalLink className="w-8 h-8 text-white mb-2 drop-shadow" />
                <span className="text-white font-bold text-sm drop-shadow">
                  Open Interactive Phases Simulator
                </span>
                <span className="text-indigo-200 text-xs mt-1 drop-shadow">
                  Opens in a new tab
                </span>
              </div>
            </a>
          </div>

          {/* Hemisphere Guide Image */}
          <div className="flex flex-col space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Hemisphere Orientation Guide
            </span>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-md p-2">
              <img
                src="/image_002.png.png"
                alt="Lunar phases viewed from Northern vs Southern Hemisphere"
                className="w-full h-auto object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Complete sentences section */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
            Logbook: Complete Sentences on Phases and Illumination
          </h4>

          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
            {/* Sentence 1 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
              <p>
                1. The hemisphere of Exo-Luna facing its host star is{' '}
                <select
                  value={activity2BrightSide}
                  onChange={(e) => onActivity2BrightSideChange(e.target.value)}
                  className="mx-1 px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- select --</option>
                  <option value="illuminated">illuminated (always by direct starlight)</option>
                  <option value="dark">dark (due to radial shadow effect)</option>
                  <option value="eclipsed">eclipsed (by total alignment)</option>
                </select>{' '}
                due to the direct incidence of light emissions.
              </p>
            </div>

            {/* Sentence 2 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
              <p>
                2. Viewed by a colonist in the Southern Hemisphere of the planet, the curvature of the lunar crescent points in the{' '}
                <select
                  value={(activity2Hemisphere || '').split('|')[0] || ''}
                  onChange={(e) => {
                    const parts = (activity2Hemisphere || '').split('|');
                    parts[0] = e.target.value;
                    onActivity2HemisphereChange(parts.join('|'));
                  }}
                  className="mx-1 px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- select --</option>
                  <option value="opposite">opposite (geometrically inverted)</option>
                  <option value="identical">identical (parallel in angle)</option>
                  <option value="vertical">vertical (perpendicular to the horizon)</option>
                </select>{' '}
                direction compared to the Northern Hemisphere.
              </p>
            </div>

            {/* Sentence 3 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
              <p>
                3. When Exo-Luna is positioned directly between the planet and its host star, observers on the surface will experience a{' '}
                <select
                  value={(activity2Hemisphere || '').split('|')[1] || ''}
                  onChange={(e) => {
                    const parts = (activity2Hemisphere || '').split('|');
                    parts[1] = e.target.value;
                    onActivity2HemisphereChange(parts.join('|'));
                  }}
                  className="mx-1 px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- select --</option>
                  <option value="New">New (the near side is in darkness facing us)</option>
                  <option value="Full">Full (reflecting maximum solar illumination)</option>
                  <option value="Quarter">Quarter (partial side illumination)</option>
                </select>{' '}
                phase from the ground.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
