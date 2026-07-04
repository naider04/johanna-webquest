import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun as SunIcon, 
  Globe, 
  Moon as MoonIcon, 
  Type, 
  Trash2, 
  Plus, 
  Maximize, 
  Minimize,
  Settings,
  MousePointer
} from 'lucide-react';

interface ElementBase {
  id: string;
  x: number;
  y: number;
}

interface ImageElement extends ElementBase {
  type: 'image';
  src: string;
  label: string;
  width: number;
  height: number;
}

interface LineElement extends ElementBase {
  type: 'line';
  x2: number;
  y2: number;
  stroke: string;
  dashArray: string;
}

interface TextElement extends ElementBase {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
}

export type EclipseElement = ImageElement | LineElement | TextElement;

interface EclipseSandboxProps {
  elements: EclipseElement[];
  onChange: (elements: EclipseElement[]) => void;
}

export default function EclipseSandbox({ elements, onChange }: EclipseSandboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetLeft: number; offsetTop: number; target?: 'start' | 'end' | 'body' } | null>(null);
  const [editTextId, setEditTextId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  // State for active tool: select mode or direct click-and-drag line drawing
  const [activeTool, setActiveTool] = useState<'select' | 'solid-ray' | 'dashed-ray'>('select');
  const [drawingLine, setDrawingLine] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Settings for adding elements
  const [lineColor, setLineColor] = useState('#fbbf24'); // Default amber/yellow
  const [textValue, setTextValue] = useState('Label');
  const [textSize, setTextSize] = useState(16);
  const [textColor, setTextColor] = useState('#ffffff');

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate unique IDs
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Set up an initial layout when mounting if empty with Earth, Moon, and Sun
  useEffect(() => {
    if (elements.length === 0) {
      const defaultSun: ImageElement = {
        id: 'sun_init',
        type: 'image',
        src: '/image_010.png.png',
        label: 'Sun',
        x: 150,
        y: 250,
        width: 150,
        height: 150,
      };
      const defaultEarth: ImageElement = {
        id: 'earth_init',
        type: 'image',
        src: '/image_009.png.png',
        label: 'Earth',
        x: 450,
        y: 250,
        width: 100,
        height: 100,
      };
      const defaultMoon: ImageElement = {
        id: 'moon_init',
        type: 'image',
        src: '/image_008.png.png',
        label: 'Moon',
        x: 680,
        y: 250,
        width: 50,
        height: 50,
      };
      onChange([defaultSun, defaultEarth, defaultMoon]);
    }
  }, []);

  // Element Spawners
  const spawnImage = (label: 'Earth' | 'Moon' | 'Sun') => {
    let src = '';
    let size = 80;
    if (label === 'Earth') {
      src = '/image_009.png.png';
      size = 100;
    } else if (label === 'Moon') {
      src = '/image_008.png.png';
      size = 50;
    } else if (label === 'Sun') {
      src = '/image_010.png.png';
      size = 140;
    }

    const newElem: ImageElement = {
      id: generateId(),
      type: 'image',
      src,
      label,
      x: 150,
      y: 150,
      width: size,
      height: size,
    };
    onChange([...elements, newElem]);
    setSelectedId(newElem.id);
  };

  const spawnText = () => {
    const newElem: TextElement = {
      id: generateId(),
      type: 'text',
      x: 150,
      y: 150,
      text: textValue,
      fontSize: textSize,
      color: textColor,
    };
    onChange([...elements, newElem]);
    setSelectedId(newElem.id);
  };

  // Helper to resolve client mouse positions relative to canvas
  const getMousePos = (e: React.MouseEvent) => {
    const svgRect = containerRef.current?.getBoundingClientRect();
    if (!svgRect) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(800, e.clientX - svgRect.left)),
      y: Math.max(0, Math.min(500, e.clientY - svgRect.top)),
    };
  };

  // Drag Handlers for Dragging inside Canvas SVG
  const handleMouseDown = (e: React.MouseEvent, elem: EclipseElement, target: 'start' | 'end' | 'body' = 'body') => {
    if (activeTool !== 'select') return; // Only drag existing items when Select mode is active

    e.stopPropagation();
    setSelectedId(elem.id);

    // Bring element to the end of elements array (z-index front) so that the last selected/dragged element goes on top
    const otherElems = elements.filter(item => item.id !== elem.id);
    onChange([...otherElems, elem]);
    
    const svgRect = containerRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    // Relative mouse position inside SVG
    const clientX = e.clientX - svgRect.left;
    const clientY = e.clientY - svgRect.top;

    if (elem.type === 'line' && target === 'start') {
      setDragging({ id: elem.id, offsetLeft: clientX - elem.x, offsetTop: clientY - elem.y, target: 'start' });
    } else if (elem.type === 'line' && target === 'end') {
      setDragging({ id: elem.id, offsetLeft: clientX - elem.x2, offsetTop: clientY - elem.y2, target: 'end' });
    } else {
      setDragging({ id: elem.id, offsetLeft: clientX - elem.x, offsetTop: clientY - elem.y, target: 'body' });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'solid-ray' || activeTool === 'dashed-ray') {
      e.stopPropagation();
      const pos = getMousePos(e);
      setDrawingLine({
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
      });
    } else {
      // In select mode, clicking empty space deselects
      setSelectedId(null);
      setEditTextId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (drawingLine) {
      setDrawingLine({
        ...drawingLine,
        currentX: pos.x,
        currentY: pos.y,
      });
      return;
    }

    if (!dragging) return;

    const newX = pos.x - dragging.offsetLeft;
    const newY = pos.y - dragging.offsetTop;

    // Keep elements inside bounds roughly
    const boundedX = Math.max(0, Math.min(800, newX));
    const boundedY = Math.max(0, Math.min(500, newY));

    onChange(
      elements.map((elem) => {
        if (elem.id !== dragging.id) return elem;

        if (elem.type === 'line') {
          if (dragging.target === 'start') {
            return { ...elem, x: pos.x, y: pos.y };
          } else if (dragging.target === 'end') {
            return { ...elem, x2: pos.x, y2: pos.y };
          } else {
            // Drag entire line body
            const dx = pos.x - dragging.offsetLeft - elem.x;
            const dy = pos.y - dragging.offsetTop - elem.y;
            return { 
              ...elem, 
              x: boundedX, 
              y: boundedY, 
              x2: Math.max(0, Math.min(800, elem.x2 + dx)), 
              y2: Math.max(0, Math.min(500, elem.y2 + dy)) 
            };
          }
        } else {
          return { ...elem, x: boundedX, y: boundedY };
        }
      })
    );
  };

  const handleMouseUp = () => {
    if (drawingLine) {
      const dx = drawingLine.currentX - drawingLine.startX;
      const dy = drawingLine.currentY - drawingLine.startY;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Only insert if the line actually has some dragged distance
      if (length > 5) {
        const newLine: LineElement = {
          id: generateId(),
          type: 'line',
          x: drawingLine.startX,
          y: drawingLine.startY,
          x2: drawingLine.currentX,
          y2: drawingLine.currentY,
          stroke: lineColor,
          dashArray: activeTool === 'dashed-ray' ? '5,5' : '',
        };
        onChange([...elements, newLine]);
        setSelectedId(newLine.id);
      }
      setDrawingLine(null);
      setActiveTool('select'); // Automatically revert to selection/drag tool!
    }
    setDragging(null);
  };

  // Resize control
  const handleResize = (id: string, action: 'grow' | 'shrink') => {
    onChange(
      elements.map((elem) => {
        if (elem.id !== id) return elem;
        if (elem.type === 'image') {
          const delta = action === 'grow' ? 10 : -10;
          const newWidth = Math.max(30, elem.width + delta);
          const newHeight = Math.max(30, elem.height + delta);
          return { ...elem, width: newWidth, height: newHeight };
        }
        if (elem.type === 'text') {
          const delta = action === 'grow' ? 2 : -2;
          const newSize = Math.max(10, elem.fontSize + delta);
          return { ...elem, fontSize: newSize };
        }
        return elem;
      })
    );
  };

  // Delete element
  const handleDelete = (id: string) => {
    onChange(elements.filter((elem) => elem.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editTextId === id) setEditTextId(null);
  };

  // Listen for 'Delete' or 'Backspace' keys to delete selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we are actively editing a text box
      if (editTextId !== null) return;
      
      // Check if the focus is inside any input or textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDelete(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, editTextId, elements]);

  const startTextEdit = (elem: TextElement) => {
    setEditTextId(elem.id);
    setInputText(elem.text);
  };

  const saveTextEdit = () => {
    if (!editTextId) return;
    onChange(
      elements.map((elem) => {
        if (elem.id === editTextId && elem.type === 'text') {
          return { ...elem, text: inputText };
        }
        return elem;
      })
    );
    setEditTextId(null);
  };

  // Get active element object for configuration
  const activeElem = elements.find((e) => e.id === selectedId);

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-white shadow-lg">
      
      {/* Simulation Header */}
      <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold font-sans flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Eclipse Space Diagram Sandbox
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Draw lunar or solar eclipses and their umbras and penumbras using vector tools.
          </p>
        </div>

        {/* Preset Selector Replacement: Clear Board Button */}
        <div>
          <button
            id="btn-clear-board"
            onClick={() => {
              onChange([]);
              setSelectedId(null);
              setEditTextId(null);
            }}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-center shadow"
          >
            <Trash2 className="w-4 h-4" /> Clear Board
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        
        {/* Left Toolbar Column */}
        <div className="p-4 bg-slate-950/50 border-r border-slate-800 space-y-5 lg:col-span-1">
          
          {/* Spawner Blocks */}
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
              1. Add Celestial Elements
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-add-sun"
                onClick={() => spawnImage('Sun')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-900 hover:bg-amber-600/20 hover:border-amber-500/50 border border-slate-800 text-xs transition-all gap-1 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <SunIcon className="w-5 h-5 animate-pulse" />
                </div>
                <span className="font-semibold text-[10px]">Add Sun</span>
              </button>

              <button
                id="btn-add-earth"
                onClick={() => spawnImage('Earth')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-900 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-800 text-xs transition-all gap-1 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="font-semibold text-[10px]">Add Earth</span>
              </button>

              <button
                id="btn-add-moon"
                onClick={() => spawnImage('Moon')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-900 hover:bg-slate-700/40 hover:border-slate-500/50 border border-slate-800 text-xs transition-all gap-1 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                  <MoonIcon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-[10px]">Add Moon</span>
              </button>
            </div>
          </div>

          {/* Active Drawing and Pointer Tools */}
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
              2. Drawing Tools
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-tool-select"
                onClick={() => setActiveTool('select')}
                title="Select & Move Elements"
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${
                  activeTool === 'select'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <MousePointer className="w-5 h-5" />
                </div>
              </button>

              <button
                id="btn-tool-solid"
                onClick={() => setActiveTool('solid-ray')}
                title="Solid Ray (Click & Drag to Draw)"
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${
                  activeTool === 'solid-ray'
                    ? 'bg-amber-600 border-amber-500 text-white shadow animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="w-6 h-1 bg-current rounded-full" />
                </div>
              </button>

              <button
                id="btn-tool-dashed"
                onClick={() => setActiveTool('dashed-ray')}
                title="Dashed Ray (Click & Drag to Draw)"
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${
                  activeTool === 'dashed-ray'
                    ? 'bg-amber-600 border-amber-500 text-white shadow animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="w-6 h-1 border-b border-dashed border-current" />
                </div>
              </button>
            </div>

            {/* Color Pick for lines */}
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400">Ray Color:</span>
              <div className="flex gap-1">
                {[
                  { hex: '#fbbf24', name: 'Yellow (Sunlight)' },
                  { hex: '#ef4444', name: 'Red' },
                  { hex: '#64748b', name: 'Gray (Umbra)' },
                  { hex: '#cbd5e1', name: 'Light Gray (Penumbra)' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setLineColor(c.hex)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      lineColor === c.hex ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Label spawner */}
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
              3. Text Labels
            </span>
            <div className="space-y-2">
              <input
                id="text-label-input"
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded focus:border-indigo-500 focus:outline-none text-white"
              />
              <div className="flex gap-2">
                <select
                  id="text-color-select"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[10px] rounded p-1 text-slate-300 w-1/2"
                >
                  <option value="#ffffff">White</option>
                  <option value="#fbbf24">Amber</option>
                  <option value="#38bdf8">Sky Blue</option>
                  <option value="#cbd5e1">Gray</option>
                </select>
                <select
                  id="text-size-select"
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                  className="bg-slate-900 border border-slate-800 text-[10px] rounded p-1 text-slate-300 w-1/2"
                >
                  <option value={12}>Small</option>
                  <option value={16}>Medium</option>
                  <option value={24}>Large</option>
                </select>
              </div>
              <button
                id="btn-spawn-text"
                onClick={spawnText}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 border border-slate-700"
              >
                <Type className="w-3.5 h-3.5 text-slate-400" /> Insert Label block
              </button>
            </div>
          </div>

        </div>

        {/* Central Workspace SVG Container */}
        <div className="relative col-span-3 bg-slate-950 p-4 flex flex-col justify-between min-h-[500px]">

          {/* Interactive SVG Sandbox */}
          <div 
            id="sandbox-workspace"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-[500px] border border-slate-800 rounded-xl relative overflow-hidden bg-black select-none"
            style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
          >
            {/* SVG Interactive layer */}
            <svg 
              className="absolute inset-0 w-full h-full"
              onMouseDown={handleCanvasMouseDown}
            >
              {/* Invisible rect for catching clicks on the empty workspace to deselect or start drawing */}
              <rect
                width="100%"
                height="100%"
                fill="transparent"
              />

              {/* Draw elements in unified order so that "the last element always goes on top" is fully preserved */}
              {elements.map((elem) => {
                if (elem.type === 'line') {
                  const l = elem as LineElement;
                  const isSelected = l.id === selectedId;
                  return (
                    <g key={l.id} onClick={(e) => e.stopPropagation()}>
                      {/* Broad hit area for easier clicking */}
                      <line
                        x1={l.x}
                        y1={l.y}
                        x2={l.x2}
                        y2={l.y2}
                        stroke="transparent"
                        strokeWidth="20"
                        style={{ cursor: activeTool === 'select' ? 'move' : 'crosshair', pointerEvents: activeTool === 'select' ? 'auto' : 'none' }}
                        onMouseDown={(e) => handleMouseDown(e, l, 'body')}
                      />
                      {/* Rendered line */}
                      <line
                        x1={l.x}
                        y1={l.y}
                        x2={l.x2}
                        y2={l.y2}
                        stroke={l.stroke}
                        strokeWidth={isSelected ? '4' : '2.5'}
                        strokeDasharray={l.dashArray}
                        style={{ 
                          cursor: activeTool === 'select' ? 'move' : 'crosshair', 
                          pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                          filter: isSelected ? 'drop-shadow(0px 0px 4px rgba(251,191,36,0.8))' : 'none' 
                        }}
                        onMouseDown={(e) => handleMouseDown(e, l, 'body')}
                      />
                      {/* Circle endpoints for line dragging */}
                      {isSelected && activeTool === 'select' && (
                        <>
                          <circle
                            cx={l.x}
                            cy={l.y}
                            r="7"
                            fill="#fbbf24"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="cursor-pointer"
                            onMouseDown={(e) => handleMouseDown(e, l, 'start')}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <circle
                            cx={l.x2}
                            cy={l.y2}
                            r="7"
                            fill="#fbbf24"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="cursor-pointer"
                            onMouseDown={(e) => handleMouseDown(e, l, 'end')}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </>
                      )}
                    </g>
                  );
                }

                if (elem.type === 'text') {
                  const t = elem as TextElement;
                  const isSelected = t.id === selectedId;
                  return (
                    <g key={t.id} onClick={(e) => e.stopPropagation()}>
                      <text
                        x={t.x}
                        y={t.y}
                        fill={t.color}
                        fontSize={t.fontSize}
                        fontFamily="Arial, sans-serif"
                        fontWeight="bold"
                        className="select-none"
                        style={{ 
                          cursor: activeTool === 'select' ? 'move' : 'crosshair', 
                          pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                          filter: isSelected ? 'drop-shadow(0px 0px 3px rgba(255,255,255,0.8))' : 'none' 
                        }}
                        onMouseDown={(e) => handleMouseDown(e, t)}
                        onDoubleClick={() => startTextEdit(t)}
                        textAnchor="middle"
                      >
                        {t.text}
                      </text>
                      {isSelected && (
                        <rect
                          x={t.x - (t.text.length * t.fontSize * 0.3) - 6}
                          y={t.y - t.fontSize}
                          width={(t.text.length * t.fontSize * 0.6) + 12}
                          height={t.fontSize + 6}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      )}
                    </g>
                  );
                }

                if (elem.type === 'image') {
                  const img = elem as ImageElement;
                  const isSelected = img.id === selectedId;
                  return (
                    <g key={img.id} onClick={(e) => e.stopPropagation()}>
                      {/* Sun Glow */}
                      {img.label === 'Sun' && (
                        <circle
                          cx={img.x}
                          cy={img.y}
                          r={img.width / 2 + 10}
                          fill="rgba(245, 158, 11, 0.15)"
                          style={{ filter: 'blur(8px)' }}
                          className="pointer-events-none"
                        />
                      )}

                      <image
                        href={img.src}
                        x={img.x - img.width / 2}
                        y={img.y - img.height / 2}
                        width={img.width}
                        height={img.height}
                        style={{
                          cursor: activeTool === 'select' ? 'move' : 'crosshair',
                          pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                          filter: isSelected ? 'drop-shadow(0px 0px 8px #a855f7)' : 'none',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, img)}
                      />

                      {/* Border for selected state */}
                      {isSelected && (
                        <rect
                          x={img.x - img.width / 2 - 4}
                          y={img.y - img.height / 2 - 4}
                          width={img.width + 8}
                          height={img.height + 8}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                          rx="6"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Small text label above body */}
                      <g className="pointer-events-none">
                        <rect
                          x={img.x - 24}
                          y={img.y - img.height / 2 - 22}
                          width="48"
                          height="14"
                          fill="rgba(15, 23, 42, 0.85)"
                          stroke="#1e293b"
                          strokeWidth="1"
                          rx="3"
                        />
                        <text
                          x={img.x}
                          y={img.y - img.height / 2 - 12}
                          fill="#cbd5e1"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {img.label}
                        </text>
                      </g>
                    </g>
                  );
                }

                return null;
              })}

              {/* Real-time live preview of line being drawn */}
              {drawingLine && (
                <line
                  x1={drawingLine.startX}
                  y1={drawingLine.startY}
                  x2={drawingLine.currentX}
                  y2={drawingLine.currentY}
                  stroke={lineColor}
                  strokeWidth="3.5"
                  strokeDasharray={activeTool === 'dashed-ray' ? '5,5' : ''}
                  opacity="0.9"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(251,191,36,0.8))' }}
                />
              )}
            </svg>
          </div>

          {/* Bottom active inspector controls panel */}
          {activeElem && (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 min-h-[50px]">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Selected Element:
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-semibold text-white">
                    {activeElem.type === 'image' 
                      ? `${(activeElem as ImageElement).label} Image` 
                      : activeElem.type === 'line' 
                      ? 'Light Ray Line' 
                      : `Label ("${(activeElem as TextElement).text}")`
                    }
                  </span>
                </div>

                {/* Grow / Shrink / Delete Controls */}
                <div className="flex items-center gap-2">
                  {editTextId === activeElem.id ? (
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                      <input
                        id="edit-text-box-input"
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="bg-transparent px-2 py-1 text-xs text-white border-none outline-none focus:ring-0 w-32"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTextEdit();
                        }}
                        autoFocus
                      />
                      <button
                        id="btn-save-text-edit"
                        onClick={saveTextEdit}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold rounded text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : activeElem.type === 'text' ? (
                    <button
                      id="btn-trigger-text-edit"
                      onClick={() => startTextEdit(activeElem as TextElement)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded border border-slate-700 transition-all"
                    >
                      Edit Text
                    </button>
                  ) : null}

                  {activeElem.type !== 'line' && (
                    <>
                      <button
                        id="btn-scale-up"
                        onClick={() => handleResize(activeElem.id, 'grow')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs border border-slate-700 flex items-center gap-1 font-semibold"
                        title="Grow Size"
                      >
                        <Maximize className="w-3.5 h-3.5 text-slate-300" /> Grow
                      </button>
                      <button
                        id="btn-scale-down"
                        onClick={() => handleResize(activeElem.id, 'shrink')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs border border-slate-700 flex items-center gap-1 font-semibold"
                        title="Shrink Size"
                      >
                        <Minimize className="w-3.5 h-3.5 text-slate-300" /> Shrink
                      </button>
                    </>
                  )}

                  <button
                    id="btn-delete-element"
                    onClick={() => handleDelete(activeElem.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded text-xs border border-red-900/50 flex items-center gap-1 font-semibold"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
