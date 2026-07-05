import React, { useState } from "react";
import {
  Users,
  Award,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Search,
  Lock,
  Unlock,
  Eye,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  ArrowLeft,
  Send,
  QrCode,
  Copy,
  Check,
  Plus,
  Trash2,
  School,
  BookOpen,
  Activity,
} from "lucide-react";
import { SubmissionData, RubricScore, ClassData } from "../types";
import {
  db,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "../lib/firebase";
import {
  buildProgressSnapshot,
  calculateAutomaticRubric,
  getRubricTotal as calculateRubricTotal,
} from "../lib/grading";

const PENDING_CLASSES_KEY = "webquest_pending_classes_v1";

const loadPendingClasses = (): ClassData[] => {
  try {
    const raw = localStorage.getItem(PENDING_CLASSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const savePendingClasses = (classes: ClassData[]) => {
  try {
    localStorage.setItem(PENDING_CLASSES_KEY, JSON.stringify(classes));
  } catch {
    // Ignore storage issues and keep the in-memory UI fallback.
  }
};

const addPendingClass = (newClass: ClassData) => {
  const next = loadPendingClasses().filter(
    (item) => item.classCode !== newClass.classCode,
  );
  next.unshift(newClass);
  savePendingClasses(next);
};

const clearPendingClass = (classCode: string) => {
  const next = loadPendingClasses().filter(
    (item) => item.classCode !== classCode,
  );
  savePendingClasses(next);
};

interface TeacherDashboardProps {
  submissions: SubmissionData[];
  onBackToApp: () => void;
  onRefreshData: () => Promise<void>;
}

export default function TeacherDashboard({
  submissions,
  onBackToApp,
  onRefreshData,
}: TeacherDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<SubmissionData | null>(
    null,
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time Class Management State
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classSubject, setClassSubject] = useState("");

  const [teacherName, setTeacherName] = useState(() => {
    return localStorage.getItem("teacher_name") || "";
  });

  const [pendingClasses] = useState<ClassData[]>(() => loadPendingClasses());

  const [copiedCodeClass, setCopiedCodeClass] = useState<string | null>(null);
  const [copiedLinkClass, setCopiedLinkClass] = useState<string | null>(null);
  const [showQrClass, setShowQrClass] = useState<string | null>(null);

  // Fetch classes from Firestore in real-time
  React.useEffect(() => {
    const colRef = collection(db, "classes");
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: ClassData[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ClassData);
        });
        const merged = [...list];
        pendingClasses.forEach((pending) => {
          if (!merged.some((item) => item.classCode === pending.classCode)) {
            merged.push(pending);
          }
        });
        merged.sort((a, b) =>
          (b.createdAt || "").localeCompare(a.createdAt || ""),
        );
        setClasses(merged);
      },
      (error) => {
        console.error("Error listening to classes", error);
      },
    );
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
      alert(
        "Por favor, ingresa tu nombre de profesor en la parte superior antes de crear una clase.",
      );
      return;
    }
    if (!classSubject.trim()) {
      alert("Por favor, ingresa el nombre de la asignatura o curso.");
      return;
    }

    // Generate unique class code
    const cleanPrefix = teacherName
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 4)
      .toUpperCase();

    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = `${cleanPrefix || "CLASS"}-${randomNum}`;
    const newClass: ClassData = {
      classCode: code,
      subject: classSubject.trim(),
      teacherName: teacherName.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "classes", code), newClass);
      clearPendingClass(code);
      setClassSubject("");
      setSelectedClass(newClass);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error creating class:", err);
      addPendingClass(newClass);
      setClasses((prev) => {
        const next = [
          newClass,
          ...prev.filter((item) => item.classCode !== newClass.classCode),
        ];
        next.sort((a, b) =>
          (b.createdAt || "").localeCompare(a.createdAt || ""),
        );
        return next;
      });
      setClassSubject("");
      setSelectedClass(newClass);
      setSelectedStudent(null);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(
        `La clase quedó guardada localmente y se sincronizará cuando la conexión/Firestore vuelva a responder.\n\nDetalle técnico: ${errMsg}`,
      );
    }
  };

  const handleDeleteClass = async (classCode: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas borrar la clase "${classCode}"? Los dossiers de los estudiantes no se borrarán de la base de datos, pero la clase ya no aparecerá en la lista.`,
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "classes", classCode));
      if (selectedClass?.classCode === classCode) {
        setSelectedClass(null);
        setSelectedStudent(null);
      }
      alert("Clase eliminada correctamente.");
    } catch (err) {
      console.error("Error deleting class:", err);
      alert("Error al eliminar la clase.");
    }
  };

  const handleDeleteStudentProgress = async (
    studentId: string,
    studentName: string,
  ) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas borrar por completo el progreso del estudiante "${studentName}"? Esta acción eliminará su dossier permanentemente de la base de datos y no se podrá deshacer.`,
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "submissions", studentId));
      setSelectedStudent(null);
      await onRefreshData();
      alert("Progreso del estudiante eliminado correctamente.");
    } catch (err) {
      console.error("Error deleting student progress:", err);
      alert("Error al eliminar el progreso del estudiante.");
    }
  };

  const getPoints = (
    val: "Excellent" | "Good" | "Needs Improvement" | null | undefined,
  ) => {
    if (val === "Excellent") return 4;
    if (val === "Good") return 3;
    if (val === "Needs Improvement") return 1;
    return 0;
  };

  const getRubricTotal = (score: RubricScore | undefined | null) => {
    return calculateRubricTotal(score);
  };

  // Combined total: automatic scores + manual scores
  const getCombinedTotal = (student: SubmissionData) => {
    const autoRubric = calculateAutomaticRubric(student);
    const manualScore =
      getPoints(student.rubricScore?.participation) +
      getPoints(student.rubricScore?.oralProduction);
    return (
      getPoints(autoRubric.evidence) +
      getPoints(autoRubric.understanding) +
      manualScore
    );
  };

  const handleViewStudent = (student: SubmissionData) => {
    setSelectedStudent(student);
    setFeedbackText(student.teacherFeedback || "");
  };

  const handleSaveFeedback = async () => {
    if (!selectedStudent) return;
    setIsSendingFeedback(true);
    try {
      const studentDocRef = doc(db, "submissions", selectedStudent.id);
      await updateDoc(studentDocRef, {
        teacherFeedback: feedbackText,
      });
      setSelectedStudent((prev) =>
        prev ? { ...prev, teacherFeedback: feedbackText } : null,
      );
      await onRefreshData();
      alert("Feedback updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update feedback. Please try again.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleTeacherGradeRubric = async (
    criteria: keyof RubricScore,
    rating: "Excellent" | "Good" | "Needs Improvement",
  ) => {
    if (!selectedStudent) return;
    const currentRubric = selectedStudent.rubricScore || {
      participation: null,
      evidence: null,
      understanding: null,
      oralProduction: null,
    };
    const updatedRubric = {
      ...currentRubric,
      [criteria]: rating,
    };

    try {
      const studentDocRef = doc(db, "submissions", selectedStudent.id);
      await updateDoc(studentDocRef, {
        rubricScore: updatedRubric,
      });
      setSelectedStudent((prev) =>
        prev ? { ...prev, rubricScore: updatedRubric } : null,
      );
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to update grade in database.");
    }
  };

  // Class filtration logic
  const activeClassSubmissions = selectedClass
    ? submissions.filter(
        (s) =>
          s.studentDetails?.classCode?.trim().toUpperCase() ===
          selectedClass.classCode.toUpperCase(),
      )
    : [];

  const filteredSubmissions = activeClassSubmissions.filter((s) => {
    const name = s.studentDetails?.studentName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedStudentProgress = selectedStudent
    ? buildProgressSnapshot(selectedStudent)
    : null;
  const selectedStudentAutoRubric = selectedStudent
    ? calculateAutomaticRubric(selectedStudent)
    : null;

  // KPI calculations for currently selected class
  const classTotalStudents = activeClassSubmissions.length;
  const gradedClassSubs = activeClassSubmissions.filter((s) => {
    const score = s.rubricScore;
    return (
      score && (score.participation || score.evidence || score.understanding)
    );
  });
  const classAverageScore =
    gradedClassSubs.length > 0
      ? (
          gradedClassSubs.reduce((acc, s) => acc + getCombinedTotal(s), 0) /
          gradedClassSubs.length
        ).toFixed(1)
      : "0.0";
  const classCompletedReportsCount = activeClassSubmissions.filter(
    (s) => s.missionReportSubmitted,
  ).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fadeIn font-sans">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest inline-block font-bold">
            UNEMI E-Learning Hub
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Portal del Docente:
            Exo-Lunar WebQuest
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Administra tus clases, monitorea el progreso de los estudiantes,
            califica rúbricas y provee retroalimentación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold focus:outline-none disabled:opacity-55"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
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
                <Sparkles className="w-4 h-4 text-indigo-600" /> Configuración
                del Profesor
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Introduce tu nombre de docente. Este nombre se utilizará de
                forma permanente para crear y gestionar todas tus clases (se
                solicita una sola vez).
              </p>
            </div>
            <div className="w-full md:w-80 space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Nombre del Profesor *
              </label>
              <input
                type="text"
                placeholder="Ej. Dra. Johanna"
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  localStorage.setItem("teacher_name", e.target.value);
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
                  <p className="text-slate-600 font-medium text-xs">
                    No has creado ninguna clase todavía.
                  </p>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    Crea una nueva clase usando el panel de la derecha para
                    generar un código y QR para tus estudiantes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classes.map((cls) => {
                    const classStudentsCount = submissions.filter(
                      (s) =>
                        s.studentDetails?.classCode?.trim().toUpperCase() ===
                        cls.classCode.toUpperCase(),
                    ).length;
                    const isCopiedCode = copiedCodeClass === cls.classCode;
                    const isCopiedLink = copiedLinkClass === cls.classCode;
                    const joinLink = `${window.location.origin}/?classCode=${cls.classCode}`;

                    return (
                      <div
                        key={cls.classCode}
                        className="border border-slate-200 hover:border-indigo-200 rounded-xl p-4 bg-slate-50/40 hover:bg-white transition-all shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-xs text-slate-800 font-sans line-clamp-1">
                              {cls.subject}
                            </h4>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono uppercase shrink-0">
                              {cls.classCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Profesor: {cls.teacherName}
                          </p>

                          <div className="mt-3 bg-white border border-slate-100 rounded-lg p-2 text-[10px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                Estudiantes:
                              </span>
                              <strong className="text-slate-700">
                                {classStudentsCount} registrados
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100/80 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(cls.classCode);
                                setCopiedCodeClass(cls.classCode);
                                setTimeout(
                                  () => setCopiedCodeClass(null),
                                  2000,
                                );
                              }}
                              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Copiar Código de Clase"
                            >
                              {isCopiedCode ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {isCopiedCode ? "Copiado" : "Código"}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(joinLink);
                                setCopiedLinkClass(cls.classCode);
                                setTimeout(
                                  () => setCopiedLinkClass(null),
                                  2000,
                                );
                              }}
                              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                              title="Copiar Enlace de Acceso Directo"
                            >
                              {isCopiedLink ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {isCopiedLink ? "Copiado" : "Enlace"}
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
                              <BookOpen className="w-3.5 h-3.5" /> Ver Clase e
                              Informes
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Asignatura o Curso *
                  </label>
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
                    Debes configurar tu nombre de profesor arriba antes de poder
                    crear una clase.
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
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-sans">
                    {selectedClass.subject}
                  </h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase">
                    {selectedClass.classCode}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Profesor: {selectedClass.teacherName} | Código generado y
                  activo
                </p>
              </div>
            </div>

            {/* Action panel: Show QR inline */}
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  setShowQrClass(
                    showQrClass === selectedClass.classCode
                      ? null
                      : selectedClass.classCode,
                  )
                }
                className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors focus:outline-none"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                {showQrClass === selectedClass.classCode
                  ? "Hide QR"
                  : "Show QR"}
              </button>
              {showQrClass === selectedClass.classCode &&
                (() => {
                  const joinUrl = `${window.location.origin}/?classCode=${selectedClass.classCode}`;
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg flex flex-col items-center gap-2 animate-fadeIn">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`}
                        alt="QR Code"
                        className="w-40 h-40 rounded"
                      />
                      <span className="font-mono font-bold text-indigo-700 text-sm tracking-widest">
                        {selectedClass.classCode}
                      </span>
                      <span className="text-[10px] text-slate-400 text-center max-w-[160px] break-all">
                        {joinUrl}
                      </span>
                    </div>
                  );
                })()}
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
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Estudiantes Registrados
                </span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {classTotalStudents}
                </span>
              </div>
            </div>
            {/* KPI 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Puntuación Promedio de Rúbrica
                </span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {classAverageScore}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    / 16.0
                  </span>
                </span>
              </div>
            </div>
            {/* KPI 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Informes Guardados
                </span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {classCompletedReportsCount}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    (
                    {classTotalStudents > 0
                      ? Math.round(
                          (classCompletedReportsCount / classTotalStudents) *
                            100,
                        )
                      : 0}
                    %)
                  </span>
                </span>
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

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Dossiers de Estudiantes
                </h3>

                {filteredSubmissions.length > 0 ? (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {filteredSubmissions.map((sub) => {
                      const isSelected = selectedStudent?.id === sub.id;
                      const totalScore = getCombinedTotal(sub);
                      const progress = buildProgressSnapshot(sub);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleViewStudent(sub)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 focus:outline-none ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-500 shadow-sm"
                              : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-sans font-bold text-xs text-slate-800 block truncate">
                              {sub.studentDetails?.studentName ||
                                "Unnamed Student"}
                            </span>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 mt-0.5 font-mono">
                              <span>ID: {sub.id.substring(0, 12)}...</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                              Actualizado:{" "}
                              {sub.updatedAt
                                ? new Date(sub.updatedAt).toLocaleTimeString()
                                : "N/A"}
                            </span>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                <span>Live Progress</span>
                                <span>{progress.percent}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                                  style={{ width: `${progress.percent}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-slate-500 font-medium">
                                {progress.stageLabel}
                              </p>
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
                    <p className="text-slate-400 text-xs">
                      No se encontraron estudiantes en esta clase.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Selected Student Full Progress Details */}
            <div className="lg:col-span-7">
              {selectedStudent ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                  {/* ── Header ── */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-base font-bold text-slate-900">
                          {selectedStudent.studentDetails?.studentName ||
                            "Unnamed Student"}
                        </h3>
                        <button
                          onClick={() =>
                            handleDeleteStudentProgress(
                              selectedStudent.id,
                              selectedStudent.studentDetails?.studentName ||
                                "Unnamed Student",
                            )
                          }
                          className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors focus:outline-none"
                          title="Borrar progreso del estudiante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedStudent.studentDetails?.subject ||
                          selectedClass.subject}{" "}
                        · {selectedStudent.studentDetails?.date || "N/A"} ·{" "}
                        {selectedStudentProgress?.percent ?? 0}% completado
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-indigo-600">
                      {getCombinedTotal(selectedStudent)} / 16
                    </span>
                  </div>

                  {/* ── Logbook Answers ── */}
                  {(() => {
                    const CORRECT: Record<string, string> = {
                      act1_0: "equal",
                      act1_1: "always",
                      act1_2: "bulge",
                      act2_bright: "illuminated",
                      act2_hemi0: "opposite",
                      act2_hemi1: "New",
                    };

                    const act1Parts = (
                      selectedStudent.activity1Prediction || ""
                    ).split("|");
                    const act2HemiParts = (
                      selectedStudent.activity2Hemisphere || ""
                    ).split("|");

                    const rows: {
                      label: string;
                      answer: string | null;
                      correct: boolean | null;
                      activity: string;
                    }[] = [
                      {
                        activity: "Act 1",
                        label:
                          "1. Orbital period = rotation period causes tidal locking",
                        answer: act1Parts[0] || null,
                        correct: act1Parts[0]
                          ? act1Parts[0] === CORRECT.act1_0
                          : null,
                      },
                      {
                        activity: "Act 1",
                        label:
                          "2. Observable face of satellite ___ faces toward its planet",
                        answer: act1Parts[1] || null,
                        correct: act1Parts[1]
                          ? act1Parts[1] === CORRECT.act1_1
                          : null,
                      },
                      {
                        activity: "Act 1",
                        label:
                          "3. Differential gravity creates a symmetric tidal ___",
                        answer: act1Parts[2] || null,
                        correct: act1Parts[2]
                          ? act1Parts[2] === CORRECT.act1_2
                          : null,
                      },
                      {
                        activity: "Act 2",
                        label: "1. Hemisphere facing host star is ___",
                        answer: selectedStudent.activity2BrightSide || null,
                        correct: selectedStudent.activity2BrightSide
                          ? selectedStudent.activity2BrightSide ===
                            CORRECT.act2_bright
                          : null,
                      },
                      {
                        activity: "Act 2",
                        label:
                          "2. Southern Hemisphere crescent points in the ___ direction",
                        answer: act2HemiParts[0] || null,
                        correct: act2HemiParts[0]
                          ? act2HemiParts[0] === CORRECT.act2_hemi0
                          : null,
                      },
                      {
                        activity: "Act 2",
                        label:
                          "3. Moon between planet and star → observers see a ___ phase",
                        answer: act2HemiParts[1] || null,
                        correct: act2HemiParts[1]
                          ? act2HemiParts[1] === CORRECT.act2_hemi1
                          : null,
                      },
                    ];

                    const answered = rows.filter((r) => r.answer).length;
                    const correct = rows.filter(
                      (r) => r.correct === true,
                    ).length;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Respuestas del Logbook
                          </h4>
                          <span className="text-[11px] font-bold text-slate-600">
                            {correct}/{answered} correctas
                          </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase w-12">
                                  Act.
                                </th>
                                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">
                                  Pregunta
                                </th>
                                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">
                                  Respuesta
                                </th>
                                <th className="text-center px-3 py-2 text-[10px] font-bold text-slate-400 uppercase w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {rows.map((row, i) => (
                                <tr
                                  key={i}
                                  className={
                                    row.correct === true
                                      ? "bg-emerald-50/40"
                                      : row.correct === false
                                        ? "bg-rose-50/40"
                                        : ""
                                  }
                                >
                                  <td className="px-3 py-2 font-bold text-slate-400 text-[10px]">
                                    {row.activity}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600 leading-tight">
                                    {row.label}
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-slate-800">
                                    {row.answer ? (
                                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                        {row.answer}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 italic">
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-center text-base">
                                    {row.correct === true ? (
                                      "✅"
                                    ) : row.correct === false ? (
                                      "❌"
                                    ) : (
                                      <span className="text-slate-300">·</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Simulator evidence */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                          <span className="font-semibold text-slate-500">
                            Simulador Act 1:
                          </span>
                          {selectedStudent.activity1Evidence === "ACHIEVED" ? (
                            <span className="text-emerald-600 font-bold">
                              ✅ Tidal locking logrado
                            </span>
                          ) : selectedStudent.activity1Evidence ? (
                            <span className="text-amber-600">
                              ⬆ Imagen subida
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">
                              Sin evidencia
                            </span>
                          )}
                          {selectedStudent.activity1Evidence &&
                            selectedStudent.activity1Evidence !==
                              "ACHIEVED" && (
                              <img
                                src={selectedStudent.activity1Evidence}
                                alt="Evidence"
                                className="ml-2 h-10 rounded border object-contain bg-slate-200"
                              />
                            )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Rúbrica compacta ── */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Rúbrica
                    </h4>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">
                              Criterio
                            </th>
                            <th className="text-center px-2 py-2 text-[10px] font-bold text-slate-400 uppercase">
                              NI (1)
                            </th>
                            <th className="text-center px-2 py-2 text-[10px] font-bold text-slate-400 uppercase">
                              Good (3)
                            </th>
                            <th className="text-center px-2 py-2 text-[10px] font-bold text-slate-400 uppercase">
                              Exc (4)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(
                            [
                              {
                                id: "evidence" as const,
                                label: "Evidencia (auto)",
                                editable: false,
                                autoKey: "evidence" as const,
                              },
                              {
                                id: "understanding" as const,
                                label: "Preguntas (auto)",
                                editable: false,
                                autoKey: "understanding" as const,
                              },
                              {
                                id: "participation" as const,
                                label: "Participación",
                                editable: true,
                              },
                              {
                                id: "oralProduction" as const,
                                label: "Producción oral",
                                editable: true,
                              },
                            ] as const
                          ).map((c) => {
                            const currentRating = c.editable
                              ? selectedStudent.rubricScore?.[c.id]
                              : "autoKey" in c
                                ? selectedStudentAutoRubric?.[c.autoKey]
                                : undefined;
                            return (
                              <tr key={c.id}>
                                <td className="px-3 py-2 font-semibold text-slate-700">
                                  {c.label}
                                </td>
                                {(
                                  [
                                    "Needs Improvement",
                                    "Good",
                                    "Excellent",
                                  ] as const
                                ).map((rating) => {
                                  const isActive = currentRating === rating;
                                  return (
                                    <td
                                      key={rating}
                                      className="text-center px-2 py-2"
                                    >
                                      {c.editable ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleTeacherGradeRubric(
                                              c.id,
                                              rating,
                                            )
                                          }
                                          className={`w-7 h-7 rounded-full border text-[10px] font-bold transition-all focus:outline-none ${
                                            isActive
                                              ? "bg-indigo-600 border-indigo-600 text-white shadow"
                                              : "bg-white border-slate-300 text-slate-400 hover:border-indigo-400"
                                          }`}
                                        >
                                          {rating === "Needs Improvement"
                                            ? "1"
                                            : rating === "Good"
                                              ? "3"
                                              : "4"}
                                        </button>
                                      ) : (
                                        <span
                                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-[10px] font-bold ${
                                            isActive
                                              ? "bg-emerald-500 border-emerald-500 text-white"
                                              : "bg-slate-50 border-slate-200 text-slate-300"
                                          }`}
                                        >
                                          {rating === "Needs Improvement"
                                            ? "1"
                                            : rating === "Good"
                                              ? "3"
                                              : "4"}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Feedback ── */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />{" "}
                      Feedback
                    </h4>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Escribe comentarios o correcciones..."
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 bg-white text-slate-800"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveFeedback}
                        disabled={isSendingFeedback}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 focus:outline-none"
                      >
                        <Send className="w-3 h-3" />
                        {isSendingFeedback ? "Enviando..." : "Enviar Feedback"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-12 text-center text-slate-400">
                  <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-semibold">
                    Selecciona un estudiante de la lista izquierda para revisar
                    su progreso, calificar su rúbrica y enviarle comentarios.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
