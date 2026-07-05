import React, { useState } from 'react';
import { 
  Users, Award, ClipboardList, CheckCircle2, ChevronRight, MessageSquare, 
  Search, Lock, Unlock, Eye, Sparkles, AlertCircle, RefreshCw, Download, FileText, ArrowLeft, Send,
  QrCode, Copy, Check, Plus, Trash2, School, BookOpen, Activity
} from 'lucide-react';
import { SubmissionData, RubricScore, ClassData } from '../types';
import { db, doc, updateDoc, setDoc, deleteDoc, collection, onSnapshot } from '../lib/firebase';
import { buildProgressSnapshot, calculateAutomaticRubric, getRubricTotal as calculateRubricTotal } from '../lib/grading';

interface TeacherDashboardProps {
  submissions: SubmissionData[];
  onBackToApp: () => void;
  onRefreshData: () => Promise<void>;
}

export default function TeacherDashboard({ submissions, onBackToApp, onRefreshData }: TeacherDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<SubmissionData | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time Class Management State
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classSubject, setClassSubject] = useState('');
  
  const [teacherName, setTeacherName] = useState(() => {
    return localStorage.getItem('teacher_name') || '';
  });

  const [copiedCodeClass, setCopiedCodeClass] = useState<string | null>(null);
  const [copiedLinkClass, setCopiedLinkClass] = useState<string | null>(null);

  // Fetch classes from Firestore in real-time
  React.useEffect(() => {
    const colRef = collection(db, 'classes');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list: ClassData[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ClassData);
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setClasses(list);
    }, (error) => {
      console.error('Error listening to classes', error);
    });
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setIsRefreshing(false);
  };

  const handleGenerateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      alert('Por favor, ingresa tu nombre de profesor en la parte superior antes de crear una clase.');
      return;
    }
    if (!classSubject.trim()) {
      alert('Por favor, ingresa el nombre de la asignatura o curso.');
      return;
    }

    // Generate unique class code
    const cleanPrefix = teacherName.trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 4)
      .toUpperCase();
      
    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = `${cleanPrefix || 'CLASS'}-${randomNum}`;

    try {
      const newClass: ClassData = {
        classCode: code,
        subject: classSubject.trim(),
        teacherName: teacherName.trim(),
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'classes', code), newClass);
      setClassSubject('');
      setSelectedClass(newClass);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Error creating class:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Error al crear la clase en la base de datos:\n${errMsg}\n\nNota: Si estás en Netlify, asegúrate de haber subido los cambios más recientes del repositorio (incluyendo las reglas de Firestore y firebase-applet-config.json).`);
    }
  };

  const handleDeleteClass = async (classCode: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas borrar la clase "${classCode}"? Los dossiers de los estudiantes no se borrarán de la base de datos, pero la clase ya no aparecerá en la lista.`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'classes', classCode));
      if (selectedClass?.classCode === classCode) {
        setSelectedClass(null);
        setSelectedStudent(null);
      }
      alert('Clase eliminada correctamente.');
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Error al eliminar la clase.');
    }
  };

  const handleDeleteStudentProgress = async (studentId: string, studentName: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas borrar por completo el progreso del estudiante "${studentName}"? Esta acción eliminará su dossier permanentemente de la base de datos y no se podrá deshacer.`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'submissions', studentId));
      setSelectedStudent(null);
      await onRefreshData();
      alert('Progreso del estudiante eliminado correctamente.');
    } catch (err) {
      console.error('Error deleting student progress:', err);
      alert('Error al eliminar el progreso del estudiante.');
    }
  };

  const getPoints = (val: 'Excellent' | 'Good' | 'Needs Improvement' | null | undefined) => {
    if (val === 'Excellent') return 4;
    if (val === 'Good') return 3;
    if (val === 'Needs Improvement') return 1;
    return 0;
  };

  const getRubricTotal = (score: RubricScore | undefined | null) => {
    return calculateRubricTotal(score);
  };

  const handleViewStudent = (student: SubmissionData) => {
    setSelectedStudent(student);
    setFeedbackText(student.teacherFeedback || '');
  };

  const handleSaveFeedback = async () => {
    if (!selectedStudent) return;
    setIsSendingFeedback(true);
    try {
      const studentDocRef = doc(db, 'submissions', selectedStudent.id);
      await updateDoc(studentDocRef, {
        teacherFeedback: feedbackText,
      });
      setSelectedStudent(prev => prev ? { ...prev, teacherFeedback: feedbackText } : null);
      await onRefreshData();
      alert('Feedback updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update feedback. Please try again.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleTeacherGradeRubric = async (criteria: keyof RubricScore, rating: 'Excellent' | 'Good' | 'Needs Improvement') => {
    if (!selectedStudent) return;
    const currentRubric = selectedStudent.rubricScore || {
      participation: null,
      evidence: null,
      understanding: null,
      oralProduction: null
    };
    const updatedRubric = {
      ...currentRubric,
      [criteria]: rating
    };

    try {
      const studentDocRef = doc(db, 'submissions', selectedStudent.id);
      await updateDoc(studentDocRef, {
        rubricScore: updatedRubric
      });
      setSelectedStudent(prev => prev ? { ...prev, rubricScore: updatedRubric } : null);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to update grade in database.');
    }
  };

  // Class filtration logic
  const activeClassSubmissions = selectedClass
    ? submissions.filter(s => s.studentDetails?.classCode?.trim().toUpperCase() === selectedClass.classCode.toUpperCase())
    : [];

  const filteredSubmissions = activeClassSubmissions.filter(s => {
    const name = s.studentDetails?.studentName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedStudentProgress = selectedStudent ? buildProgressSnapshot(selectedStudent) : null;
  const selectedStudentAutoRubric = selectedStudent ? calculateAutomaticRubric(selectedStudent) : null;

  // KPI calculations for currently selected class
  const classTotalStudents = activeClassSubmissions.length;
  const gradedClassSubs = activeClassSubmissions.filter(s => {
    const score = s.rubricScore;
    return score && (score.participation || score.evidence || score.understanding);
  });
  const classAverageScore = gradedClassSubs.length > 0
    ? (gradedClassSubs.reduce((acc, s) => acc + getRubricTotal(s.rubricScore), 0) / gradedClassSubs.length).toFixed(1)
    : '0.0';
  const classCompletedReportsCount = activeClassSubmissions.filter(s => s.missionReportSubmitted).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fadeIn font-sans">
      
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest inline-block font-bold">
            UNEMI E-Learning Hub
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Portal del Docente: Exo-Lunar WebQuest
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Administra tus clases, monitorea el progreso de los estudiantes, califica rúbricas y provee retroalimentación.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold focus:outline-none disabled:opacity-55"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar Datos
          </button>
          <button
            onClick={onBackToApp}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a la WebQuest
          </button>
        </div>
      </div>

      {selectedClass === null ? (
        /* CLASSES MAIN SCREEN */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Teacher Profile / Name Configuration */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-md">
              <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Configuración del Profesor
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Introduce tu nombre de docente. Este nombre se utilizará de forma permanente para crear y gestionar todas tus clases (se solicita una sola vez).
              </p>
            </div>
            <div className="w-full md:w-80 space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre del Profesor *</label>
              <input
                type="text"
                placeholder="Ej. Dra. Johanna"
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  localStorage.setItem('teacher_name', e.target.value);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none focus:border-indigo-500 transition-colors font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: List of Created Classes */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-sans font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <School className="w-5 h-5 text-indigo-600" /> Clases Creadas
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {classes.length} Clase(s)
                </span>
              </div>

              {classes.length === 0 ? (
                <div className="py-12 px-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <School className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-600 font-medium text-xs">No has creado ninguna clase todavía.</p>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">Crea una nueva clase usando el panel de la derecha para generar un código y QR para tus estudiantes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classes.map((cls) => {
                    const classStudentsCount = submissions.filter(s => s.studentDetails?.classCode?.trim().toUpperCase() === cls.classCode.toUpperCase()).length;
                    const isCopiedCode = copiedCodeClass === cls.classCode;
                    const isCopiedLink = copiedLinkClass === cls.classCode;
                    const joinLink = `${window.location.origin}/?classCode=${cls.classCode}`;
                    
                    return (
                      <div key={cls.classCode} className="border border-slate-200 hover:border-indigo-200 rounded-xl p-4 bg-slate-50/40 hover:bg-white transition-all shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-xs text-slate-800 font-sans line-clamp-1">{cls.subject}</h4>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono uppercase shrink-0">
                              {cls.classCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Profesor: {cls.teacherName}</p>
                          
                          <div className="mt-3 bg-white border border-slate-100 rounded-lg p-2 text-[10px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Estudiantes:</span>
                              <strong className="text-slate-700">{classStudentsCount} registrados</strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100/80 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(cls.classCode);
                                setCopiedCodeClass(cls.classCode);
                                setTimeout(() => setCopiedCodeClass(null), 2000);
                              }}
                              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Copiar Código de Clase"
                            >
                              {isCopiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              {isCopiedCode ? 'Copiado' : 'Código'}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(joinLink);
                                setCopiedLinkClass(cls.classCode);
                                setTimeout(() => setCopiedLinkClass(null), 2000);
                              }}
                              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Copiar Enlace de Acceso Directo"
                            >
                              {isCopiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              {isCopiedLink ? 'Copiado' : 'Enlace'}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedClass(cls);
                                setSelectedStudent(null);
                              }}
                              className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> Ver Clase e Informes
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.classCode)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-100 rounded flex items-center justify-center transition-colors"
                              title="Borrar Clase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Add New Class Form */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-sans font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Añadir Nueva Clase
              </h3>
              <form onSubmit={handleGenerateClass} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Asignatura o Curso *</label>
                  <input
                    type="text"
                    placeholder="Ej. Física Lunar - Paralelo A"
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                
                {!teacherName.trim() && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 leading-tight">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Debes configurar tu nombre de profesor arriba antes de poder crear una clase.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!teacherName.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md focus:outline-none"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  Crear Clase y Generar Código
                </button>
              </form>
            </div>
          </div>

        </div>
      ) : (
        /* CLASS SELECTED VIEW: STUDENT LIST & DOSSIERS */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Selected Class Subheader with Action and QR info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setSelectedStudent(null);
                }}
                className="p-2 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors focus:outline-none"
                title="Volver a la lista de clases"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-sans">{selectedClass.subject}</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase">
                    {selectedClass.classCode}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Profesor: {selectedClass.teacherName} | Código generado y activo</p>
              </div>
            </div>
            
            {/* Action panel: Print QR of Direct Access */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    const joinUrl = `${window.location.origin}/?classCode=${selectedClass.classCode}`;
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Código QR Clase: ${selectedClass.classCode}</title>
                          <style>
                            body { font-family: sans-serif; text-align: center; padding: 50px; background-color: white; color: black; }
                            .container { max-width: 500px; margin: 0 auto; border: 2px solid #ccc; padding: 40px; border-radius: 15px; }
                            h1 { font-size: 28px; margin-bottom: 5px; }
                            h2 { font-size: 18px; color: #4f46e5; margin-bottom: 25px; }
                            img { width: 300px; height: 300px; margin: 20px 0; }
                            p { font-size: 14px; color: #555; }
                            .code { font-family: monospace; font-size: 32px; font-weight: bold; background-color: #f3f4f6; padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 15px; letter-spacing: 2px; }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <h1>UNEMI - Exo-Lunar WebQuest</h1>
                            <h2>Docente: ${selectedClass.teacherName} | Asignatura: ${selectedClass.subject}</h2>
                            <p>Escanea este código QR con tu celular para unirte directamente:</p>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}" />
                            <div style="margin-top: 20px;">Código de Clase Manual:</div>
                            <div class="code">${selectedClass.classCode}</div>
                          </div>
                          <script>window.onload = function() { window.print(); }</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors focus:outline-none"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                Imprimir QR de Acceso Estudiante
              </button>
            </div>
          </div>

          {/* Class KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* KPI 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudiantes Registrados</span>
                <span className="text-2xl font-extrabold text-slate-800">{classTotalStudents}</span>
              </div>
            </div>
            {/* KPI 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Puntuación Promedio de Rúbrica</span>
                <span className="text-2xl font-extrabold text-slate-800">{classAverageScore} <span className="text-xs text-slate-400 font-normal">/ 16.0</span></span>
              </div>
            </div>
            {/* KPI 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Informes Guardados</span>
                <span className="text-2xl font-extrabold text-slate-800">{classCompletedReportsCount} <span className="text-xs text-slate-400 font-normal">({classTotalStudents > 0 ? Math.round((classCompletedReportsCount / classTotalStudents) * 100) : 0}%)</span></span>
              </div>
            </div>
          </div>

          {/* Student list and review panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Student Submissions List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante por nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dossiers de Estudiantes</h3>

                {filteredSubmissions.length > 0 ? (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {filteredSubmissions.map((sub) => {
                      const isSelected = selectedStudent?.id === sub.id;
                      const totalScore = getRubricTotal(sub.rubricScore);
                        const progress = buildProgressSnapshot(sub);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleViewStudent(sub)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 focus:outline-none ${
                            isSelected 
                              ? 'bg-indigo-50/70 border-indigo-500 shadow-sm' 
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-sans font-bold text-xs text-slate-800 block truncate">{sub.studentDetails?.studentName || 'Unnamed Student'}</span>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 mt-0.5 font-mono">
                              <span>ID: {sub.id.substring(0, 12)}...</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono mt-1 block">Actualizado: {sub.updatedAt ? new Date(sub.updatedAt).toLocaleTimeString() : 'N/A'}</span>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                <span>Live Progress</span>
                                <span>{progress.percent}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${progress.percent}%` }} />
                              </div>
                              <p className="text-[9px] text-slate-500 font-medium">{progress.stageLabel}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 flex flex-col items-end">
                            {sub.missionReportSubmitted ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                Guardado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                En Proceso
                              </span>
                            )}
                            <span className="text-xs font-bold text-indigo-700 mt-1.5 block">
                              Score: {totalScore} / 16
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-400 text-xs">No se encontraron estudiantes en esta clase.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Selected Student Full Progress Details */}
            <div className="lg:col-span-7">
              {selectedStudent ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                  
                  {/* Student Header with Delete option */}
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-lg font-bold text-slate-900">{selectedStudent.studentDetails?.studentName || 'Unnamed Student'}</h3>
                        <button
                          onClick={() => handleDeleteStudentProgress(selectedStudent.id, selectedStudent.studentDetails?.studentName || 'Unnamed Student')}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
                          title="Borrar progreso del estudiante permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Asignatura: {selectedStudent.studentDetails?.subject || selectedClass.subject} | Fecha: {selectedStudent.studentDetails?.date || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Accumulated Score</span>
                      <span className="text-xl font-extrabold text-indigo-600 font-sans">{getRubricTotal(selectedStudent.rubricScore)} / 16</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Progress</span>
                      <span className="text-2xl font-extrabold text-slate-900">{selectedStudentProgress?.percent ?? 0}%</span>
                      <p className="text-[11px] text-slate-500 mt-1">{selectedStudentProgress?.stageLabel || 'Getting started'}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Automatic Half</span>
                      <p className="text-xs text-slate-600 mt-1">Evidence and question accuracy are scored from the saved work in real time.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Manual Half</span>
                      <p className="text-xs text-slate-600 mt-1">Participation and oral production stay editable by the teacher.</p>
                    </div>
                  </div>

                  {/* Real-time Teacher Rubric Grading */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4">
                    <div className="border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-4 h-4 text-indigo-600" /> Evaluation Rubric
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Automatic question scores update from the student work. Only participation and oral production are edited manually here.</p>
                    </div>
                    
                    <div className="space-y-4 text-xs">
                      {[
                        {
                          id: 'evidence' as const,
                          name: '1. Automatic: Evidence Collection',
                          description: 'Computed from the saved simulator work, screenshots, and final report.',
                          editable: false,
                          options: [
                            { rating: 'Needs Improvement' as const, points: '1 pt', text: 'Few evidence checkpoints are complete, so the automatic evidence score is low.' },
                            { rating: 'Good' as const, points: '3 pts', text: 'Several evidence checkpoints are complete, but one or two artifacts are missing.' },
                            { rating: 'Excellent' as const, points: '4 pts', text: 'Most evidence checkpoints are complete, including the simulator, screenshot, and final report.' }
                          ]
                        },
                        {
                          id: 'understanding' as const,
                          name: '2. Automatic: Question Accuracy',
                          description: 'Computed from the written answers across the logbooks and mission report.',
                          editable: false,
                          options: [
                            { rating: 'Needs Improvement' as const, points: '1 pt', text: 'The question prompts are mostly incomplete, so the automatic understanding score is low.' },
                            { rating: 'Good' as const, points: '3 pts', text: 'Some question prompts are complete with understandable but uneven explanations.' },
                            { rating: 'Excellent' as const, points: '4 pts', text: 'Most question prompts are complete with clear scientific explanations.' }
                          ]
                        },
                        {
                          id: 'participation' as const,
                          name: '3. Teacher Review: Participation',
                          description: 'Scored by the teacher based on engagement, collaboration, and class contribution.',
                          editable: true,
                          options: [
                            { rating: 'Needs Improvement' as const, points: '1 pt', text: 'The student showed limited participation and needed frequent prompting.' },
                            { rating: 'Good' as const, points: '3 pts', text: 'The student participated appropriately, though engagement was uneven or needed prompting.' },
                            { rating: 'Excellent' as const, points: '4 pts', text: 'The student participated actively and contributed consistently during the lesson.' }
                          ]
                        },
                        {
                          id: 'oralProduction' as const,
                          name: '4. Teacher Review: Oral Production',
                          description: 'Scored by the teacher based on oral explanation and scientific vocabulary.',
                          editable: true,
                          options: [
                            { rating: 'Needs Improvement' as const, points: '1 pt', text: 'The oral explanation was brief, unclear, or lacked scientific vocabulary.' },
                            { rating: 'Good' as const, points: '3 pts', text: 'The student explained ideas with some clarity, but needed support with vocabulary or detail.' },
                            { rating: 'Excellent' as const, points: '4 pts', text: 'The student explained ideas clearly and used accurate scientific language.' }
                          ]
                        }
                      ].map((criterion) => (
                        <div key={criterion.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-2">
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-xs">{criterion.name}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{criterion.description}</p>
                            </div>
                            <div className="text-right mt-1 md:mt-0">
                              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                                Grade: {selectedStudent.rubricScore?.[criterion.id] || 'Pending'}
                              </span>
                            </div>
                          </div>

                          {criterion.editable ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              {criterion.options.map((opt) => {
                                const isSelected = selectedStudent.rubricScore?.[criterion.id] === opt.rating;
                                return (
                                  <button
                                    key={opt.rating}
                                    type="button"
                                    onClick={() => handleTeacherGradeRubric(criterion.id, opt.rating)}
                                    className={`p-3 text-left rounded-lg border text-[11px] transition-all flex flex-col justify-between h-full focus:outline-none ${
                                      isSelected
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <span className={`font-extrabold text-[9px] uppercase tracking-wider block ${
                                        isSelected ? 'text-indigo-200' : 'text-indigo-600'
                                      }`}>
                                        {opt.rating} ({opt.points})
                                      </span>
                                      <p className={`leading-snug ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                                        {opt.text}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              {criterion.options.map((opt) => {
                                const autoScore = criterion.id === 'evidence'
                                  ? selectedStudentAutoRubric?.evidence
                                  : selectedStudentAutoRubric?.understanding;
                                const isSelected = autoScore === opt.rating;
                                return (
                                  <div
                                    key={opt.rating}
                                    className={`p-3 text-left rounded-lg border text-[11px] flex flex-col justify-between h-full ${
                                      isSelected
                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <span className={`font-extrabold text-[9px] uppercase tracking-wider block ${
                                        isSelected ? 'text-emerald-700' : 'text-slate-500'
                                      }`}>
                                        {opt.rating} ({opt.points})
                                      </span>
                                      <p className={isSelected ? 'text-emerald-950' : 'text-slate-600'}>
                                        {opt.text}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Answers Sections */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Activity Portfolios</h4>

                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-slate-700">
                      <div className="flex items-center gap-2 text-indigo-800 font-bold uppercase tracking-wider mb-2">
                        <Activity className="w-4 h-4" /> Live Student Progress
                      </div>
                      <p><strong>Current stage:</strong> {selectedStudentProgress?.stageLabel || 'Getting started'}</p>
                      <p><strong>Next step:</strong> {selectedStudentProgress?.nextStep || 'Waiting for new work.'}</p>
                      <p><strong>Automatic evidence score:</strong> {selectedStudentAutoRubric?.evidence || 'Pending'}</p>
                      <p><strong>Automatic question score:</strong> {selectedStudentAutoRubric?.understanding || 'Pending'}</p>
                    </div>

                    {/* Act 1 */}
                    <div className="space-y-1">
                      <span className="block text-[11px] font-bold text-slate-500 uppercase">Activity 1: Gravity, Tidal Locking, and Oceanic Tides</span>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-2">
                        <p><strong>Simulator Game 1 Status:</strong> {selectedStudent.activity1Evidence === 'ACHIEVED' ? <span className="text-emerald-600 font-bold">✅ Stable 1:1 synchronous tidal locking achieved!</span> : <span className="text-amber-600">☑ Completed</span>}</p>
                        <p><strong>Logbook Prediction Answer:</strong> {selectedStudent.activity1Prediction ? (
                          <span className="italic">"{selectedStudent.activity1Prediction.split('|').join(' / ')}"</span>
                        ) : <span className="text-slate-400 italic">No answer provided</span>}</p>
                        {selectedStudent.activity1Evidence && selectedStudent.activity1Evidence !== 'ACHIEVED' && (
                          <div>
                            <span className="block font-bold mb-1">Uploaded Evidence:</span>
                            <img src={selectedStudent.activity1Evidence} alt="Activity 1 Uploaded" className="max-h-28 rounded border object-contain bg-slate-200" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Act 2 */}
                    <div className="space-y-1">
                      <span className="block text-[11px] font-bold text-slate-500 uppercase">Activity 2: Moon Phases and Hemispheric Perspectives</span>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-2">
                        <p><strong>Questionnaire 1 Bright Side Answer:</strong> {selectedStudent.activity2BrightSide ? <span className="italic">"{selectedStudent.activity2BrightSide}"</span> : <span className="text-slate-400 italic">No answer provided</span>}</p>
                        <p><strong>Questionnaire 2 Hemisphere Answer:</strong> {selectedStudent.activity2Hemisphere ? <span className="italic">"{selectedStudent.activity2Hemisphere}"</span> : <span className="text-slate-400 italic">No answer provided</span>}</p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-indigo-600" /> Send Teacher Feedback &amp; Comments
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Write feedback, correction comments, or an overall score evaluation. The student will instantly receive this on their screen.
                    </p>
                    <div className="space-y-2">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Type constructive scientific feedback here..."
                        rows={4}
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 bg-white text-slate-800"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveFeedback}
                          disabled={isSendingFeedback}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 focus:outline-none"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isSendingFeedback ? 'Enviando...' : 'Sincronizar Feedback'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-12 text-center text-slate-400">
                  <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-semibold">Selecciona un estudiante de la lista izquierda para revisar su progreso, calificar su rúbrica y enviarle comentarios.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
