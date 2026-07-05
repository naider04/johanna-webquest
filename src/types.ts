export type WebQuestPage = 'title' | 'intro' | 'task' | 'process' | 'evaluation' | 'conclusion' | 'teacher';

export interface ClassData {
  classCode: string;
  subject: string;
  teacherName: string;
  createdAt: string;
}

export interface StudentDetails {
  studentName: string;
  classCode: string;
  teacherName?: string;
  subject?: string;
  date: string;
}

export interface ActivityState {
  activity1Evidence: string | null; // Base64 or mock file path
  activity2Answers: string[];
  activity3DiagramUrl: string | null;
  activity4Reflection: string;
}

export interface RubricScore {
  participation: 'Excellent' | 'Good' | 'Needs Improvement' | null;
  evidence: 'Excellent' | 'Good' | 'Needs Improvement' | null;
  understanding: 'Excellent' | 'Good' | 'Needs Improvement' | null;
  oralProduction: 'Excellent' | 'Good' | 'Needs Improvement' | null;
}

export interface ProgressSnapshot {
  completedSteps: number;
  totalSteps: number;
  percent: number;
  stageLabel: string;
  nextStep: string;
}

export interface SubmissionData {
  id: string;
  studentDetails: StudentDetails;
  activity1Evidence: string | null;
  activity1Prediction: string;
  activity2BrightSide: string;
  activity2Hemisphere: string;
  sandboxElementsJson: string; // Serialized EclipseElement[]
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
  teacherFeedback?: string;
  updatedAt: string;
}
