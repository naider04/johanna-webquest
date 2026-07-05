import React, { useState } from 'react';
import { User, GraduationCap, Cloud, CloudLightning, RefreshCw, Key, ChevronDown, Check, Sparkles } from 'lucide-react';
import { StudentDetails } from '../types';

interface ClassroomSessionProps {
  studentDetails: StudentDetails;
  submissionId: string | null;
  onUpdateDetails: (details: StudentDetails) => void;
  onRetrieveSession: (id: string) => void;
  syncStatus: 'idle' | 'saving' | 'saved' | 'error';
  allExistingSubmissions: { id: string; name: string; classCode: string }[];
  onOpenTeacherPortal: () => void;
  onLeaveClass: () => void;
  onDeleteProgress: () => Promise<void>;
}

export default function ClassroomSession({
  studentDetails,
  submissionId,
  onUpdateDetails,
  onRetrieveSession,
  syncStatus,
  allExistingSubmissions,
  onOpenTeacherPortal,
  onLeaveClass,
  onDeleteProgress,
}: ClassroomSessionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'register' | 'retrieve'>('register');
  const [nameInput, setNameInput] = useState(studentDetails.studentName);
  const [classCodeInput, setClassCodeInput] = useState(studentDetails.classCode || '');
  const [retrieveId, setRetrieveId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state inputs with parent props (e.g. when pre-loaded from URL or loaded from Firestore)
  React.useEffect(() => {
    setNameInput(studentDetails.studentName);
    setClassCodeInput(studentDetails.classCode || '');
  }, [studentDetails]);

  // Auto-open modal if they have classCode but haven't registered name/session yet (QR Code direct entry)
  React.useEffect(() => {
    if (studentDetails.classCode && !studentDetails.studentName && !submissionId) {
      setIsOpen(true);
    }
  }, [studentDetails.classCode, studentDetails.studentName, submissionId]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!classCodeInput.trim()) {
      setErrorMsg('Please enter the class code.');
      return;
    }
    setErrorMsg('');
    onUpdateDetails({
      studentName: nameInput.trim(),
      classCode: classCodeInput.trim().toUpperCase(),
      date: new Date().toLocaleDateString(),
    });
    setIsOpen(false);
  };

  const handleRetrieve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retrieveId) {
      setErrorMsg('Please select your session.');
      return;
    }
    setErrorMsg('');
    onRetrieveSession(retrieveId);
    setIsOpen(false);
  };

  return (
    <div className="bg-[#1e293b] text-slate-100 border-b border-slate-700 py-2.5 px-4 sticky top-[50px] z-40 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Side: Current Session Info */}
        <div className="flex items-center gap-2">
          {submissionId ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">
                Active Session: <strong className="text-white font-bold">{studentDetails.studentName}</strong>
              </span>
              {studentDetails.classCode && (
                <span className="text-slate-400 font-mono hidden md:inline">
                  • Class Code: <strong className="text-indigo-300 font-bold">{studentDetails.classCode}</strong>
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span><strong>Temporary Session</strong> (Register below to sync with your teacher!)</span>
            </div>
          )}
        </div>

        {/* Right Side: Session Controls & Teacher Entry */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Cloud Sync Indicator */}
          {submissionId && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1.5 font-mono">
              {syncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span>Syncing...</span>
                </>
              )}
              {syncStatus === 'saved' && (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Synced</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Saved locally</span>
                </>
              )}
              {syncStatus === 'idle' && (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Connected</span>
                </>
              )}
            </div>
          )}

          {/* Setup / Edit Session Button */}
          <button
            onClick={() => {
              setNameInput(studentDetails.studentName);
              setClassCodeInput(studentDetails.classCode || '');
              setIsOpen(!isOpen);
            }}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white rounded transition-colors flex items-center gap-1 focus:outline-none"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {submissionId ? 'Manage Session' : 'Connect with Teacher / Class'}
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Teacher Portal Button */}
          <button
            onClick={onOpenTeacherPortal}
            className="px-2.5 py-1 bg-[#475569] hover:bg-[#64748b] text-[11px] font-bold text-slate-100 rounded transition-colors flex items-center gap-1 focus:outline-none border border-slate-600"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Teacher Portal
          </button>
        </div>
      </div>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-700 shadow-xl p-5 z-50 animate-fadeIn">
          <div className="max-w-2xl mx-auto font-sans">
            <div className="flex gap-4 border-b border-slate-800 pb-3 mb-4">
              <button
                onClick={() => setMode('register')}
                className={`text-sm font-bold pb-1 focus:outline-none border-b-2 transition-all ${
                  mode === 'register' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Register New Student
              </button>
              <button
                onClick={() => setMode('retrieve')}
                className={`text-sm font-bold pb-1 focus:outline-none border-b-2 transition-all ${
                  mode === 'retrieve' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Load Existing Session
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-950 border border-rose-800 text-rose-200 p-2.5 rounded text-xs mb-3 font-medium">
                {errorMsg}
              </div>
            )}

            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Name *</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Code *</label>
                  <input
                    type="text"
                    value={classCodeInput}
                    onChange={(e) => setClassCodeInput(e.target.value)}
                    placeholder="e.g. PHYSICS101"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <p className="text-[10px] text-slate-400 self-center mr-auto">
                    * Registering auto-saves your progress to the cloud so your teacher can review it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Register and Sync
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRetrieve} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Select your active session</label>
                  {allExistingSubmissions.length > 0 ? (
                    <select
                      value={retrieveId}
                      onChange={(e) => setRetrieveId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose your name --</option>
                      {allExistingSubmissions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Class: {s.classCode})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-slate-800 rounded text-slate-400 text-xs text-center border border-slate-700">
                      No active class sessions found. Register as a new student to begin.
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] text-slate-400">
                    Retrieve your previous session to continue where you left off.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={allExistingSubmissions.length === 0}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded text-white font-bold"
                    >
                      Retrieve Progress
                    </button>
                  </div>
                </div>
              </form>
            )}

            {submissionId && (
              <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                  ⚠️ Gestión de Sesión / Danger Zone
                </h4>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  Puedes desconectarte de esta clase o eliminar permanentemente tu progreso registrado.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const confirmLeave = window.confirm('¿Estás seguro de que deseas salir de la clase? Tu progreso en la nube se conservará, pero se cerrará tu sesión local actual.');
                      if (confirmLeave) {
                        onLeaveClass();
                        setIsOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Salir de la Clase / Desvincularme
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmDelete = window.confirm('¡ATENCIÓN! ¿Estás seguro de que deseas borrar permanentemente todo tu progreso y respuestas de la base de datos? Esta acción es irreversible y tu profesor ya no verá tu trabajo.');
                      if (confirmDelete) {
                        await onDeleteProgress();
                        setIsOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Borrar mi Progreso por Completo (Nube)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
