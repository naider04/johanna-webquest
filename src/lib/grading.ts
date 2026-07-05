import { RubricScore, SubmissionData, ProgressSnapshot } from '../types';

type Rating = 'Excellent' | 'Good' | 'Needs Improvement' | null;

const hasContent = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return Boolean(value);
};

const getPoints = (val: Rating) => {
  if (val === 'Excellent') return 4;
  if (val === 'Good') return 3;
  if (val === 'Needs Improvement') return 1;
  return 0;
};

const scoreFromCompletion = (completed: number, total: number): Exclude<Rating, null> => {
  const ratio = total > 0 ? completed / total : 0;

  if (ratio >= 0.8) return 'Excellent';
  if (ratio >= 0.45) return 'Good';
  return 'Needs Improvement';
};

export const emptyRubricScore = (): RubricScore => ({
  participation: null,
  evidence: null,
  understanding: null,
  oralProduction: null,
});

export const normalizeRubricScore = (score: Partial<RubricScore> | null | undefined): RubricScore => ({
  participation: score?.participation ?? null,
  evidence: score?.evidence ?? null,
  understanding: score?.understanding ?? null,
  oralProduction: score?.oralProduction ?? (score as { reflection?: RubricScore['oralProduction'] } | undefined)?.reflection ?? null,
});

export const getRubricTotal = (score: RubricScore | undefined | null) => {
  if (!score) return 0;

  return getPoints(score.participation) +
    getPoints(score.evidence) +
    getPoints(score.understanding) +
    getPoints(score.oralProduction);
};

export const calculateAutomaticRubric = (
  submission: Partial<SubmissionData>
): Pick<RubricScore, 'evidence' | 'understanding'> => {
  const autoEvidenceChecks = [
    submission.activity1Evidence,
    submission.activity3Screenshot,
    submission.missionReportSubmitted,
    submission.missionFinalRecommendation,
    submission.missionFinalJustification,
  ];

  const autoUnderstandingChecks = [
    submission.activity1Prediction,
    submission.activity2BrightSide,
    submission.activity2Hemisphere,
    submission.activity3CompareExplain,
    submission.activity3SolarEffect,
    submission.activity4Reflection,
    submission.missionTidalSummary,
    submission.missionPhasesSummary,
    submission.missionEclipseSummary,
    submission.missionHabitabilitySummary,
  ];

  return {
    evidence: scoreFromCompletion(
      autoEvidenceChecks.filter(hasContent).length,
      autoEvidenceChecks.length
    ),
    understanding: scoreFromCompletion(
      autoUnderstandingChecks.filter(hasContent).length,
      autoUnderstandingChecks.length
    ),
  };
};

export const buildProgressSnapshot = (
  submission: Partial<SubmissionData>
): ProgressSnapshot => {
  const milestones = [
    {
      label: 'Registration',
      nextStep: 'Confirm student name and class code.',
      completed: hasContent(submission.studentDetails?.studentName) && hasContent(submission.studentDetails?.classCode),
    },
    {
      label: 'Activity 1',
      nextStep: 'Complete tidal locking evidence and prediction answers.',
      completed: hasContent(submission.activity1Evidence) || hasContent(submission.activity1Prediction),
    },
    {
      label: 'Activity 2',
      nextStep: 'Fill in the moon phases and hemisphere answers.',
      completed: hasContent(submission.activity2BrightSide) && hasContent(submission.activity2Hemisphere),
    },
    {
      label: 'Activity 3',
      nextStep: 'Add eclipse analysis and sandbox evidence.',
      completed: hasContent(submission.activity3CompareExplain) || hasContent(submission.activity3SolarEffect) || hasContent(submission.activity3Screenshot),
    },
    {
      label: 'Activity 4',
      nextStep: 'Write the closing reflection.',
      completed: hasContent(submission.activity4Reflection),
    },
    {
      label: 'Mission report',
      nextStep: 'Submit the final feasibility report.',
      completed: Boolean(submission.missionReportSubmitted),
    },
  ];

  const completedSteps = milestones.filter((step) => step.completed).length;
  const totalSteps = milestones.length;
  const percent = Math.round((completedSteps / totalSteps) * 100);
  const nextIncomplete = milestones.find((step) => !step.completed);

  return {
    completedSteps,
    totalSteps,
    percent,
    stageLabel: nextIncomplete ? nextIncomplete.label : 'Ready for review',
    nextStep: nextIncomplete ? nextIncomplete.nextStep : 'All core milestones are complete.',
  };
};