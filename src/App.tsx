import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TitlePage from './components/TitlePage';
import Introduction from './components/Introduction';
import Task from './components/Task';
import Process from './components/Process';
import Evaluation from './components/Evaluation';
import Conclusion from './components/Conclusion';
import WixBanner from './components/WixBanner';
import ClassroomSession from './components/ClassroomSession';
import TeacherDashboard from './components/TeacherDashboard';
import { StudentDetails, WebQuestPage, RubricScore, SubmissionData } from './types';
import { EclipseElement } from './components/EclipseSandbox';
import { db, doc, setDoc, getDoc, getDocs, collection, onSnapshot, deleteDoc } from './lib/firebase';
import { calculateAutomaticRubric, emptyRubricScore, normalizeRubricScore } from './lib/grading';
import { AlertCircle, MessageSquare, Award, Sparkles, X } from 'lucide-react';

const LOCAL_DRAFT_KEY = 'webquest_submission_draft_v1';

type PersistedDraft = {
  submissionId: string | null;
  studentDetails: StudentDetails;
  activity1Evidence: string | null;
  activity1Prediction: string;
  activity2BrightSide: string;
  activity2Hemisphere: string;
  sandboxElementsJson: string;
  activity3CompareExplain: string;
  activity3SolarEffect: string;
  activity3Screenshot: string | null;
  activity4Reflection: string;
  missionTargetName: string;
  missionTidalSummary: string;
  missionPhasesSummary: string;
  missionEclipseSummary: string;
  missionHabitabilitySummary: string;
  missionFinalRecommendation: string;
  missionFinalJustification: string;
  missionReportSubmitted: boolean;
  rubricScore: RubricScore;
  teacherFeedback: string;
  updatedAt: string;
};

const loadLocalDraft = (): PersistedDraft | null => {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveLocalDraft = (draft: PersistedDraft) => {
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota / serialization issues and keep the cloud path as the primary store.
  }
};

const clearLocalDraft = () => {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
};

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<WebQuestPage>('title');

  // Student State
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    studentName: '',
    classCode: '',
    teacherName: '',
    subject: '',
    date: '',
  });

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [allSubmissions, setAllSubmissions] = useState<SubmissionData[]>([]);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('');
  const [showFeedbackAlert, setShowFeedbackAlert] = useState<boolean>(false);

  const [activity1Evidence, setActivity1Evidence] = useState<string | null>(null);
  const [activity1Prediction, setActivity1Prediction] = useState<string>('');
  const [activity2BrightSide, setActivity2BrightSide] = useState<string>('');
  const [activity2Hemisphere, setActivity2Hemisphere] = useState<string>('');
  const [sandboxElements, setSandboxElements] = useState<EclipseElement[]>([]);
  const [activity3CompareExplain, setActivity3CompareExplain] = useState<string>('');
  const [activity3SolarEffect, setActivity3SolarEffect] = useState<string>('');
  const [activity3Screenshot, setActivity3Screenshot] = useState<string | null>(null);
  const [activity4Reflection, setActivity4Reflection] = useState<string>('');

  // Activity 5: Final Mission Report Submission
  const [missionTargetName, setMissionTargetName] = useState<string>('Kepler-Prime');
  const [missionTidalSummary, setMissionTidalSummary] = useState<string>('');
  const [missionPhasesSummary, setMissionPhasesSummary] = useState<string>('');
  const [missionEclipseSummary, setMissionEclipseSummary] = useState<string>('');
  const [missionHabitabilitySummary, setMissionHabitabilitySummary] = useState<string>('');
  const [missionFinalRecommendation, setMissionFinalRecommendation] = useState<string>('');
  const [missionFinalJustification, setMissionFinalJustification] = useState<string>('');
  const [missionReportSubmitted, setMissionReportSubmitted] = useState<boolean>(false);

  // Rubric / Evaluation State
  const [rubricScore, setRubricScore] = useState<RubricScore>({
    participation: null,
    evidence: null,
    understanding: null,
    oralProduction: null,
  });

  // Track if initial load is completed to prevent blank-data overwrites
  const isLoadedFromCloud = useRef(false);

  const hydrateSubmissionState = (data: Partial<SubmissionData>) => {
    setStudentDetails(data.studentDetails || { studentName: '', classCode: '', teacherName: '', subject: '', date: '' });
    setActivity1Evidence(data.activity1Evidence || null);
    setActivity1Prediction(data.activity1Prediction || '');
    setActivity2BrightSide(data.activity2BrightSide || '');
    setActivity2Hemisphere(data.activity2Hemisphere || '');
    setActivity3CompareExplain(data.activity3CompareExplain || '');
    setActivity3SolarEffect(data.activity3SolarEffect || '');
    setActivity3Screenshot(data.activity3Screenshot || null);
    setActivity4Reflection(data.activity4Reflection || '');
    setMissionTargetName(data.missionTargetName || 'Kepler-Prime');
    setMissionTidalSummary(data.missionTidalSummary || '');
    setMissionPhasesSummary(data.missionPhasesSummary || '');
    setMissionEclipseSummary(data.missionEclipseSummary || '');
    setMissionHabitabilitySummary(data.missionHabitabilitySummary || '');
    setMissionFinalRecommendation(data.missionFinalRecommendation || '');
    setMissionFinalJustification(data.missionFinalJustification || '');
    setMissionReportSubmitted(data.missionReportSubmitted || false);
    setRubricScore(normalizeRubricScore(data.rubricScore));
    setTeacherFeedback(data.teacherFeedback || '');

    if (data.sandboxElementsJson) {
      try {
        setSandboxElements(JSON.parse(data.sandboxElementsJson));
      } catch (e) {
        console.error('Error parsing sandbox items', e);
      }
    }
  };

  const parseTimestamp = (value?: string | null) => {
    const time = value ? Date.parse(value) : NaN;
    return Number.isFinite(time) ? time : 0;
  };

  const shouldPreferLocalDraft = (localDraft: PersistedDraft | null, cloudUpdatedAt?: string) => {
    if (!localDraft) return false;
    if (!cloudUpdatedAt) return true;
    return parseTimestamp(localDraft.updatedAt) >= parseTimestamp(cloudUpdatedAt);
  };

  // Load existing session from localStorage on startup
  useEffect(() => {
    const savedId = localStorage.getItem('webquest_submission_id');
    const urlParams = new URLSearchParams(window.location.search);
    const classCodeParam = urlParams.get('classCode');
    const localDraft = loadLocalDraft();

    if (!savedId && localDraft) {
      setSubmissionId(localDraft.submissionId);
      if (localDraft.submissionId) {
        localStorage.setItem('webquest_submission_id', localDraft.submissionId);
      }
      hydrateSubmissionState(localDraft);
      isLoadedFromCloud.current = true;

      if (classCodeParam) {
        setStudentDetails(prev => ({
          ...prev,
          classCode: classCodeParam.toUpperCase()
        }));
      }

      return;
    }

    if (savedId) {
      setSubmissionId(savedId);
      // Fetch the document
      const docRef = doc(db, 'submissions', savedId);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SubmissionData;
          const preferLocal = shouldPreferLocalDraft(localDraft, data.updatedAt);

          if (preferLocal && localDraft) {
            hydrateSubmissionState(localDraft);
          } else {
            const mergedData = {
              ...data,
              studentDetails: {
                ...(data.studentDetails || { studentName: '', classCode: '', teacherName: '', subject: '', date: '' }),
                ...(classCodeParam ? { classCode: classCodeParam.toUpperCase() } : {}),
              },
            };
            hydrateSubmissionState(mergedData);
            clearLocalDraft();
          }
        } else {
          // If document not found, but we had savedId, allow pre-filling classCode
          if (classCodeParam) {
            setStudentDetails(prev => ({ ...prev, classCode: classCodeParam.toUpperCase() }));
          }
          if (localDraft) {
            hydrateSubmissionState(localDraft);
            if (localDraft.submissionId) {
              setSubmissionId(localDraft.submissionId);
              localStorage.setItem('webquest_submission_id', localDraft.submissionId);
            }
          }
        }
        isLoadedFromCloud.current = true;
      }).catch((err) => {
        console.error('Error fetching student document', err);
        if (localDraft) {
          hydrateSubmissionState(localDraft);
          if (localDraft.submissionId) {
            setSubmissionId(localDraft.submissionId);
            localStorage.setItem('webquest_submission_id', localDraft.submissionId);
          }
        }
        isLoadedFromCloud.current = true;
      });
    } else {
      isLoadedFromCloud.current = true;
      if (classCodeParam) {
        setStudentDetails(prev => ({
          ...prev,
          classCode: classCodeParam.toUpperCase()
        }));
      }
    }
  }, []);

  // Set up listener for real-time teacher feedback or grade overrides
  useEffect(() => {
    if (!submissionId) return;

    const docRef = doc(db, 'submissions', submissionId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SubmissionData;
        
        // Show real-time feedback toast if teacher feedback has changed and is not empty
        if (data.teacherFeedback && data.teacherFeedback !== teacherFeedback) {
          setTeacherFeedback(data.teacherFeedback);
          setShowFeedbackAlert(true);
        }

        // Live sync rubric changes from teacher dashboard
        const normalizedRubric = normalizeRubricScore(data.rubricScore);
        if (JSON.stringify(normalizedRubric) !== JSON.stringify(rubricScore)) {
          setRubricScore(normalizedRubric);
        }
      }
    });

    return () => unsubscribe();
  }, [submissionId, teacherFeedback, rubricScore]);

  // Set up real-time listener for ALL submissions (visible to teachers)
  useEffect(() => {
    const colRef = collection(db, 'submissions');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list: SubmissionData[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as SubmissionData);
      });
      setAllSubmissions(list);
    });

    return () => unsubscribe();
  }, []);

  // Keep a local backup so a refresh does not wipe the current session if cloud sync is interrupted.
  useEffect(() => {
    if (!submissionId || !isLoadedFromCloud.current) return;

    saveLocalDraft({
      submissionId,
      studentDetails,
      activity1Evidence,
      activity1Prediction,
      activity2BrightSide,
      activity2Hemisphere,
      sandboxElementsJson: JSON.stringify(sandboxElements),
      activity3CompareExplain,
      activity3SolarEffect,
      activity3Screenshot,
      activity4Reflection,
      missionTargetName,
      missionTidalSummary,
      missionPhasesSummary,
      missionEclipseSummary,
      missionHabitabilitySummary,
      missionFinalRecommendation,
      missionFinalJustification,
      missionReportSubmitted,
      rubricScore,
      teacherFeedback,
      updatedAt: new Date().toISOString(),
    });
  }, [
    submissionId,
    studentDetails,
    activity1Evidence,
    activity1Prediction,
    activity2BrightSide,
    activity2Hemisphere,
    sandboxElements,
    activity3CompareExplain,
    activity3SolarEffect,
    activity3Screenshot,
    activity4Reflection,
    missionTargetName,
    missionTidalSummary,
    missionPhasesSummary,
    missionEclipseSummary,
    missionHabitabilitySummary,
    missionFinalRecommendation,
    missionFinalJustification,
    missionReportSubmitted,
    rubricScore,
    teacherFeedback,
  ]);

  // Debounced Autosave Effect
  useEffect(() => {
    if (!submissionId || !isLoadedFromCloud.current) return;

    setSyncStatus('saving');
    const delayDebounce = setTimeout(async () => {
      try {
        const docRef = doc(db, 'submissions', submissionId);
        const submissionPayload: SubmissionData = {
          id: submissionId,
          studentDetails,
          activity1Evidence,
          activity1Prediction,
          activity2BrightSide,
          activity2Hemisphere,
          sandboxElementsJson: JSON.stringify(sandboxElements),
          activity3CompareExplain,
          activity3SolarEffect,
          activity3Screenshot,
          activity4Reflection,
          missionTargetName,
          missionTidalSummary,
          missionPhasesSummary,
          missionEclipseSummary,
          missionHabitabilitySummary,
          missionFinalRecommendation,
          missionFinalJustification,
          missionReportSubmitted,
          rubricScore: {
            ...rubricScore,
            ...calculateAutomaticRubric({
              activity1Evidence,
              activity1Prediction,
              activity2BrightSide,
              activity2Hemisphere,
              activity3CompareExplain,
              activity3SolarEffect,
              activity3Screenshot,
              activity4Reflection,
              missionTidalSummary,
              missionPhasesSummary,
              missionEclipseSummary,
              missionHabitabilitySummary,
              missionFinalRecommendation,
              missionFinalJustification,
              missionReportSubmitted,
            }),
          },
          teacherFeedback,
          updatedAt: new Date().toISOString()
        };

        await setDoc(docRef, submissionPayload, { merge: true });
        setSyncStatus('saved');
      } catch (err) {
        console.error('Firestore autosave error', err);
        setSyncStatus('error');
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(delayDebounce);
  }, [
    submissionId,
    studentDetails,
    activity1Evidence,
    activity1Prediction,
    activity2BrightSide,
    activity2Hemisphere,
    sandboxElements,
    activity3CompareExplain,
    activity3SolarEffect,
    activity3Screenshot,
    activity4Reflection,
    missionTargetName,
    missionTidalSummary,
    missionPhasesSummary,
    missionEclipseSummary,
    missionHabitabilitySummary,
    missionFinalRecommendation,
    missionFinalJustification,
    missionReportSubmitted,
    rubricScore
  ]);

  // Handle manual session creation/updates
  const handleUpdateStudentDetails = async (newDetails: StudentDetails) => {
    setStudentDetails(newDetails);
    
    let currentId = submissionId;
    if (!currentId) {
      // Create new session ID
      currentId = `student-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('webquest_submission_id', currentId);
      setSubmissionId(currentId);
    }

    try {
      setSyncStatus('saving');
      const docRef = doc(db, 'submissions', currentId);
      await setDoc(docRef, {
        id: currentId,
        studentDetails: newDetails,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSyncStatus('saved');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  // Handle retrieving another session from the list
  const handleRetrieveSession = async (id: string) => {
    setSyncStatus('saving');
    try {
      const docRef = doc(db, 'submissions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SubmissionData;
        localStorage.setItem('webquest_submission_id', id);
        setSubmissionId(id);
        
        // Load data in state
        setStudentDetails(data.studentDetails || { studentName: '', classCode: '', teacherName: '', subject: '', date: '' });
        setActivity1Evidence(data.activity1Evidence || null);
        setActivity1Prediction(data.activity1Prediction || '');
        setActivity2BrightSide(data.activity2BrightSide || '');
        setActivity2Hemisphere(data.activity2Hemisphere || '');
        setActivity3CompareExplain(data.activity3CompareExplain || '');
        setActivity3SolarEffect(data.activity3SolarEffect || '');
        setActivity3Screenshot(data.activity3Screenshot || null);
        setActivity4Reflection(data.activity4Reflection || '');
        setMissionTargetName(data.missionTargetName || 'Kepler-Prime');
        setMissionTidalSummary(data.missionTidalSummary || '');
        setMissionPhasesSummary(data.missionPhasesSummary || '');
        setMissionEclipseSummary(data.missionEclipseSummary || '');
        setMissionHabitabilitySummary(data.missionHabitabilitySummary || '');
        setMissionFinalRecommendation(data.missionFinalRecommendation || '');
        setMissionFinalJustification(data.missionFinalJustification || '');
        setMissionReportSubmitted(data.missionReportSubmitted || false);
        setRubricScore(normalizeRubricScore(data.rubricScore));
        setTeacherFeedback(data.teacherFeedback || '');
        if (data.sandboxElementsJson) {
          try {
            setSandboxElements(JSON.parse(data.sandboxElementsJson));
          } catch (e) {
            console.error(e);
          }
        }
        setSyncStatus('saved');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  const handleLeaveClass = () => {
    localStorage.removeItem('webquest_submission_id');
    setSubmissionId(null);
    setStudentDetails({
      studentName: '',
      classCode: '',
      teacherName: '',
      subject: '',
      date: '',
    });
    // Reset other student states to defaults
    setActivity1Evidence(null);
    setActivity1Prediction('');
    setActivity2BrightSide('');
    setActivity2Hemisphere('');
    setSandboxElements([]);
    setActivity3CompareExplain('');
    setActivity3SolarEffect('');
    setActivity3Screenshot(null);
    setActivity4Reflection('');
    setMissionTargetName('Kepler-Prime');
    setMissionTidalSummary('');
    setMissionPhasesSummary('');
    setMissionEclipseSummary('');
    setMissionHabitabilitySummary('');
    setMissionFinalRecommendation('');
    setMissionFinalJustification('');
    setMissionReportSubmitted(false);
    setRubricScore(emptyRubricScore());
    setTeacherFeedback('');
    clearLocalDraft();
  };

  const handleDeleteMyProgress = async () => {
    if (!submissionId) return;
    try {
      setSyncStatus('saving');
      const docRef = doc(db, 'submissions', submissionId);
      await deleteDoc(docRef);
      handleLeaveClass();
      setSyncStatus('idle');
      alert('Tu progreso ha sido eliminado correctamente de la base de datos.');
    } catch (err) {
      console.error('Error deleting own progress:', err);
      alert('Error al eliminar tu progreso.');
    }
  };

  // Pull new data for Teacher Dashboard
  const handleRefreshAllData = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'submissions'));
      const list: SubmissionData[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as SubmissionData);
      });
      setAllSubmissions(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRubricChange = (
    criteria: keyof RubricScore,
    rating: 'Excellent' | 'Good' | 'Needs Improvement'
  ) => {
    setRubricScore((prev) => ({ ...prev, [criteria]: rating }));
  };

  // Convert submission list to simplified format for selector
  const simpleSubmissionsList = allSubmissions.map((s) => ({
    id: s.id,
    name: s.studentDetails?.studentName || 'Unnamed Student',
    classCode: s.studentDetails?.classCode || s.studentDetails?.teacherName || 'General',
  })).filter((s) => s.name !== 'Unnamed Student');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 print:bg-white text-slate-800 pt-[50px]">
      
      {/* Wix Banner Always Visible */}
      <WixBanner />

      {/* WebQuest Classroom Header */}
      <Header />

      {/* Multiuser Classroom Status & Autosave Bar */}
      {activePage !== 'teacher' && (
        <ClassroomSession
          studentDetails={studentDetails}
          submissionId={submissionId}
          onUpdateDetails={handleUpdateStudentDetails}
          onRetrieveSession={handleRetrieveSession}
          syncStatus={syncStatus}
          allExistingSubmissions={simpleSubmissionsList}
          onOpenTeacherPortal={() => setActivePage('teacher')}
          onLeaveClass={handleLeaveClass}
          onDeleteProgress={handleDeleteMyProgress}
        />
      )}

      {/* Real-time Teacher Feedback Notification Pop-up */}
      {showFeedbackAlert && teacherFeedback && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-indigo-500 text-slate-100 px-6 py-4 animate-fadeIn relative flex items-start gap-3.5 z-50 shadow-lg">
          <div className="p-2 bg-indigo-600/30 text-indigo-300 rounded-full border border-indigo-400/20">
            <MessageSquare className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <div className="flex-1 text-xs md:text-sm">
            <h4 className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> New Teacher Feedback Received!
            </h4>
            <p className="mt-1 text-slate-200 leading-relaxed italic whitespace-pre-wrap">
              "{teacherFeedback}"
            </p>
          </div>
          <button
            onClick={() => setShowFeedbackAlert(false)}
            className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sticky Section Navigation */}
      {activePage !== 'teacher' && (
        <Navigation activePage={activePage} onPageChange={setActivePage} />
      )}

      {/* Page Routing Container */}
      <main className="flex-1 bg-slate-50/50 py-4">
        {activePage === 'title' && <TitlePage />}
        {activePage === 'intro' && <Introduction />}
        {activePage === 'task' && <Task />}
        {activePage === 'process' && (
          <Process
            activity1Evidence={activity1Evidence}
            onActivity1EvidenceChange={setActivity1Evidence}
            activity1Prediction={activity1Prediction}
            onActivity1PredictionChange={setActivity1Prediction}
            activity2BrightSide={activity2BrightSide}
            onActivity2BrightSideChange={setActivity2BrightSide}
            activity2Hemisphere={activity2Hemisphere}
            onActivity2HemisphereChange={setActivity2Hemisphere}
            sandboxElements={sandboxElements}
            onSandboxElementsChange={setSandboxElements}
            activity3CompareExplain={activity3CompareExplain}
            onActivity3CompareExplainChange={setActivity3CompareExplain}
            activity3SolarEffect={activity3SolarEffect}
            onActivity3SolarEffectChange={setActivity3SolarEffect}
            activity3Screenshot={activity3Screenshot}
            onActivity3ScreenshotChange={setActivity3Screenshot}
            activity4Reflection={activity4Reflection}
            onActivity4ReflectionChange={setActivity4Reflection}
          />
        )}
        {activePage === 'evaluation' && (
          <div className="space-y-6">
            {/* Show teacher feedback alert on evaluation page if present */}
            {teacherFeedback && (
              <div className="max-w-4xl mx-auto px-4">
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm text-slate-800">
                  <h4 className="font-bold text-indigo-800 uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" /> Instructor Comments &amp; Guidance
                  </h4>
                  <p className="text-xs md:text-sm italic leading-relaxed text-slate-700 whitespace-pre-wrap">
                    "{teacherFeedback}"
                  </p>
                </div>
              </div>
            )}
            <Evaluation score={rubricScore} onScoreChange={handleRubricChange} />
          </div>
        )}
        {activePage === 'conclusion' && (
          <Conclusion
            details={studentDetails}
            score={rubricScore}
            activity1Evidence={activity1Evidence}
            activity1Prediction={activity1Prediction}
            activity2BrightSide={activity2BrightSide}
            activity2Hemisphere={activity2Hemisphere}
            sandboxElements={sandboxElements}
            activity3CompareExplain={activity3CompareExplain}
            activity3SolarEffect={activity3SolarEffect}
            activity3Screenshot={activity3Screenshot}
            activity4Reflection={activity4Reflection}
            missionTargetName={missionTargetName}
            missionTidalSummary={missionTidalSummary}
            missionPhasesSummary={missionPhasesSummary}
            missionEclipseSummary={missionEclipseSummary}
            missionHabitabilitySummary={missionHabitabilitySummary}
            missionFinalRecommendation={missionFinalRecommendation}
            missionFinalJustification={missionFinalJustification}
            missionReportSubmitted={missionReportSubmitted}
          />
        )}
        {activePage === 'teacher' && (
          <TeacherDashboard
            submissions={allSubmissions}
            onBackToApp={() => setActivePage('title')}
            onRefreshData={handleRefreshAllData}
          />
        )}
      </main>

      {/* Shared Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-auto text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 mx-auto">
            <button
              onClick={() => setActivePage('evaluation')}
              className="hover:text-blue-600 font-semibold transition-colors focus:outline-none"
            >
              View Grading Scale
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActivePage('teacher')}
              className="hover:text-indigo-600 font-bold transition-colors focus:outline-none flex items-center gap-1"
            >
              Teacher Access Portal 🔑
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
