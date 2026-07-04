import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Play, Pause, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MoonExperimentProps {
  onLockCompleted?: (completed: boolean) => void;
  isCompletedInitially?: boolean;
}

export default function MoonExperiment({ onLockCompleted, isCompletedInitially }: MoonExperimentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States for user input
  const [orbitDays, setOrbitDays] = useState<number>(27.322);
  const [rotationDays, setRotationDays] = useState<number>(20.000);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(100000);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Simulation metrics
  const [facingEarthTime, setFacingEarthTime] = useState<number>(0);
  const [isLockedCompleted, setIsLockedCompleted] = useState<boolean>(isCompletedInitially || false);
  const notifiedRef = useRef(isCompletedInitially || false);

  // Center and scale parameters
  const CENTER_X = 400;
  const CENTER_Y = 300;
  const ORBIT_RADIUS = 220;
  const EARTH_SIZE = 120;
  const MOON_SIZE = 50;
  const REQUIRED_TIME = 27.321661;

  // Ref to hold changing values for the animation frame loop
  const stateRef = useRef({
    orbitDays,
    rotationDays,
    speedMultiplier,
    isPlaying,
    orbitAngle: 0,
    moonRotationAngle: 0,
    facingEarthTime: 0,
    lastTime: performance.now(),
  });

  // Keep stateRef in sync with React state variables
  useEffect(() => {
    stateRef.current.orbitDays = orbitDays;
    stateRef.current.rotationDays = rotationDays;
    stateRef.current.speedMultiplier = speedMultiplier;
    stateRef.current.isPlaying = isPlaying;
  }, [orbitDays, rotationDays, speedMultiplier, isPlaying]);

  // Handle image preloading with custom refs
  const earthImgRef = useRef<HTMLImageElement | null>(null);
  const moonImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const earth = new Image();
    earth.src = '/image_009.png.png';
    const moon = new Image();
    moon.src = '/image_008.png.png';

    earthImgRef.current = earth;
    moonImgRef.current = moon;
  }, []);

  // Helper check function
  const checkFacing = (orbitAngle: number, moonRotationAngle: number) => {
    const moonX = CENTER_X + Math.cos(orbitAngle) * ORBIT_RADIUS;
    const moonY = CENTER_Y + Math.sin(orbitAngle) * ORBIT_RADIUS;

    // Direction from Moon pointing directly to Earth
    const earthDirection = Math.atan2(CENTER_Y - moonY, CENTER_X - moonX);

    // Flashlight beam angle is aligned to the top face marker (moonRotationAngle - PI/2)
    const flashlightDirection = moonRotationAngle - Math.PI / 2;

    const difference = Math.atan2(
      Math.sin(flashlightDirection - earthDirection),
      Math.cos(flashlightDirection - earthDirection)
    );

    return Math.abs(difference) < 0.15;
  };

  // Reset helper
  const handleReset = () => {
    stateRef.current.orbitAngle = 0;
    stateRef.current.moonRotationAngle = 0;
    stateRef.current.facingEarthTime = 0;
    setFacingEarthTime(0);
    setIsLockedCompleted(false);
    setOrbitDays(27.322);
    setRotationDays(20.000);
    setSpeedMultiplier(100000);
    setIsPlaying(true);
    // Sync ref values immediately
    stateRef.current.orbitDays = 27.322;
    stateRef.current.rotationDays = 20.000;
    stateRef.current.speedMultiplier = 100000;
    stateRef.current.isPlaying = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loop = (now: number) => {
      const state = stateRef.current;
      let dt = (now - state.lastTime) / 1000;
      if (dt > 0.1) dt = 0.1; // Cap to prevent massive jumps when switching tabs
      state.lastTime = now;

      if (state.isPlaying) {
        const simulatedDays = (dt / 86400) * state.speedMultiplier;

        state.orbitAngle += simulatedDays * ((2 * Math.PI) / state.orbitDays);
        state.moonRotationAngle += simulatedDays * ((2 * Math.PI) / state.rotationDays);

        const facing = checkFacing(state.orbitAngle, state.moonRotationAngle);
        if (facing) {
          state.facingEarthTime += simulatedDays;
        } else {
          state.facingEarthTime = 0;
        }

        setFacingEarthTime(state.facingEarthTime);

        if (state.facingEarthTime >= REQUIRED_TIME) {
          setIsLockedCompleted(true);
          if (!notifiedRef.current) {
            notifiedRef.current = true;
            onLockCompleted?.(true);
          }
        } else {
          setIsLockedCompleted(false);
          if (state.facingEarthTime === 0 && notifiedRef.current) {
            notifiedRef.current = false;
            onLockCompleted?.(false);
          }
        }
      }

      // Drawing routine
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep Space background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 1234.5) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 5432.1) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Orbit Path Outline
      ctx.beginPath();
      ctx.arc(CENTER_X, CENTER_Y, ORBIT_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const facing = checkFacing(state.orbitAngle, state.moonRotationAngle);

      // Earth Alignment Glow
      if (facing) {
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y, 80, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fill();
      }

      // Draw Earth Image or Fallback Shape
      const earthImg = earthImgRef.current;
      if (earthImg && earthImg.complete && earthImg.naturalWidth > 0) {
        ctx.drawImage(
          earthImg,
          CENTER_X - EARTH_SIZE / 2,
          CENTER_Y - EARTH_SIZE / 2,
          EARTH_SIZE,
          EARTH_SIZE
        );
      } else {
        // Fallback Vector Earth
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y, EARTH_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        // Earth lands
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(CENTER_X - 18, CENTER_Y - 10, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CENTER_X + 22, CENTER_Y + 12, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moon position tracking
      const moonX = CENTER_X + Math.cos(state.orbitAngle) * ORBIT_RADIUS;
      const moonY = CENTER_Y + Math.sin(state.orbitAngle) * ORBIT_RADIUS;

      ctx.save();
      ctx.translate(moonX, moonY);
      ctx.rotate(state.moonRotationAngle);

      // Draw Moon Image or Fallback Shape
      const moonImg = moonImgRef.current;
      if (moonImg && moonImg.complete && moonImg.naturalWidth > 0) {
        ctx.drawImage(
          moonImg,
          -MOON_SIZE / 2,
          -MOON_SIZE / 2,
          MOON_SIZE,
          MOON_SIZE
        );
      } else {
        // Fallback Vector Moon
        ctx.beginPath();
        ctx.arc(0, 0, MOON_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        // Craters
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(-8, -6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Surface Yellow Alignment Spot
      ctx.beginPath();
      ctx.arc(0, -MOON_SIZE / 2 + 5, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.fill();

      // Laser Alignment Line pointing towards the Earth's orbit center
      ctx.beginPath();
      ctx.moveTo(0, -MOON_SIZE / 2);
      ctx.lineTo(0, -ORBIT_RADIUS + 70);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const remaining = REQUIRED_TIME - facingEarthTime;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto my-6 text-white">
      {/* Simulation Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-sans text-xl font-bold text-slate-100 flex items-center gap-2">
            Moon Tidal Locking Experiment
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Find the rotation speed that keeps the same side of the Moon facing Earth.
          </p>
        </div>
      </div>

      {/* Prominent Center Timer/Status Indicator */}
      <div className="bg-slate-950 py-4 text-center border-b border-slate-800/80 font-sans">
        {remaining > 0 ? (
          <div className="text-xl md:text-2xl font-bold text-yellow-400 tracking-wide">
            Keep facing Earth: {remaining.toFixed(2)} days remaining
          </div>
        ) : (
          <div className="text-xl md:text-2xl font-bold text-emerald-400 tracking-wide flex items-center justify-center gap-2 px-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" /> Complete! The Moon stayed locked to Earth.
          </div>
        )}
      </div>

      {/* Main Sandbox Canvas Wrapper */}
      <div className="relative bg-slate-950 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full max-w-2xl aspect-[4/3] rounded-xl border border-slate-800 shadow-inner bg-[#0b0f19]"
        />
      </div>

      {/* Interactive Controls Panel */}
      <div className="p-6 bg-slate-950/80 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sliders Area */}
        <div className="space-y-4">
          {/* Orbit slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans font-semibold">
              <span className="text-slate-400">Orbit Period</span>
              <span className="text-blue-400 font-mono">{orbitDays.toFixed(3)} Days</span>
            </div>
            <input
              id="orbit-slider"
              type="range"
              min="1"
              max="60"
              step="0.001"
              value={orbitDays}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setOrbitDays(val);
                stateRef.current.orbitDays = val;
                stateRef.current.facingEarthTime = 0;
                setFacingEarthTime(0);
                setIsLockedCompleted(false);
              }}
              className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rotation slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans font-semibold">
              <span className="text-slate-400">Moon Rotation Period</span>
              <span className="text-purple-400 font-mono">{rotationDays.toFixed(3)} Days</span>
            </div>
            <input
              id="rotation-slider"
              type="range"
              min="1"
              max="60"
              step="0.001"
              value={rotationDays}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setRotationDays(val);
                stateRef.current.rotationDays = val;
                stateRef.current.facingEarthTime = 0;
                setFacingEarthTime(0);
                setIsLockedCompleted(false);
              }}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Simulation Speed slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans font-semibold">
              <span className="text-slate-400">Simulation Speed</span>
              <span className="text-emerald-400 font-mono">
                {speedMultiplier >= 1000000 
                  ? `${(speedMultiplier / 1000000).toFixed(1)}M x` 
                  : `${(speedMultiplier / 1000).toFixed(0)}k x`
                }
              </span>
            </div>
            <input
              id="speed-slider"
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={speedMultiplier}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSpeedMultiplier(val);
                stateRef.current.speedMultiplier = val;
              }}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons Action Area */}
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            <button
              id="btn-play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition-colors focus:outline-none border border-slate-700"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause Simulation' : 'Start Simulation'}
            </button>

            <button
              id="btn-reset-sim"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-lg text-xs transition-colors focus:outline-none border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
