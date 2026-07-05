import { RubricScore, SubmissionData, ProgressSnapshot } from "../types";

type Rating = "Excellent" | "Good" | "Needs Improvement" | null;

const hasContent = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return Boolean(value);
};

const getPoints = (val: Rating) => {
  if (val === "Excellent") return 4;
  if (val === "Good") return 3;
  if (val === "Needs Improvement") return 1;
  return 0;
};

const scoreFromCompletion = (
  completed: number,
  total: number,
): Exclude<Rating, null> => {
  const ratio = total > 0 ? completed / total : 0;
  if (ratio >= 0.8) return "Excellent";
  if (ratio >= 0.45) return "Good";
  return "Needs Improvement";
};

// Correct answers for logbook dropdowns
const CORRECT_ANSWERS = {
  act1_0: "equal",
  act1_1: "always",
  act1_2: "bulge",
  act2_bright: "illuminated",
  act2_hemi0: "opposite",
  act2_hemi1: "New",
};

const countCorrectLogbookAnswers = (
  submission: Partial<SubmissionData>,
): number => {
  const act1Parts = (submission.activity1Prediction || "").split("|");
  const act2HemiParts = (submission.activity2Hemisphere || "").split("|");
  let correct = 0;
  if (act1Parts[0] === CORRECT_ANSWERS.act1_0) correct++;
  if (act1Parts[1] === CORRECT_ANSWERS.act1_1) correct++;
  if (act1Parts[2] === CORRECT_ANSWERS.act1_2) correct++;
  if (submission.activity2BrightSide === CORRECT_ANSWERS.act2_bright) correct++;
  if (act2HemiParts[0] === CORRECT_ANSWERS.act2_hemi0) correct++;
  if (act2HemiParts[1] === CORRECT_ANSWERS.act2_hemi1) correct++;
  return correct; // out of 6
};

export const emptyRubricScore = (): RubricScore => ({
  participation: null,
  evidence: null,
  understanding: null,
  oralProduction: null,
});

export const normalizeRubricScore = (
  score: Partial<RubricScore> | null | undefined,
): RubricScore => ({
  participation: score?.participation ?? null,
  evidence: score?.evidence ?? null,
  understanding: score?.understanding ?? null,
  oralProduction:
    score?.oralProduction ??
    (score as { reflection?: RubricScore["oralProduction"] } | undefined)
      ?.reflection ??
    null,
});

export const getRubricTotal = (score: RubricScore | undefined | null) => {
  if (!score) return 0;
  return (
    getPoints(score.participation) +
    getPoints(score.evidence) +
    getPoints(score.understanding) +
    getPoints(score.oralProduction)
  );
};

export const calculateAutomaticRubric = (
  submission: Partial<SubmissionData>,
): Pick<RubricScore, "evidence" | "understanding"> => {
  // Evidence: puzzle completed + screenshot uploaded + final report fields
  const puzzleAchieved = submission.activity1Evidence === "ACHIEVED";
  const evidenceChecks = [
    puzzleAchieved, // tidal locking puzzle ✅
    hasContent(submission.activity3Screenshot),
    Boolean(submission.missionReportSubmitted),
    hasContent(submission.missionFinalRecommendation),
    hasContent(submission.missionFinalJustification),
  ];

  // Understanding: correct logbook answers (6 total) + open-ended text fields (4)
  const correctLogbook = countCorrectLogbookAnswers(submission); // 0–6
  const openEndedChecks = [
    hasContent(submission.activity3CompareExplain),
    hasContent(submission.activity3SolarEffect),
    hasContent(submission.activity4Reflection),
    hasContent(submission.missionTidalSummary),
    hasContent(submission.missionPhasesSummary),
    hasContent(submission.missionEclipseSummary),
    hasContent(submission.missionHabitabilitySummary),
  ];
  const openEndedCompleted = openEndedChecks.filter(Boolean).length;

  // Total understanding score: 6 logbook + 7 open-ended = 13 checks
  const totalUnderstanding = correctLogbook + openEndedCompleted;
  const maxUnderstanding = 6 + openEndedChecks.length;

  return {
    evidence: scoreFromCompletion(
      evidenceChecks.filter(Boolean).length,
      evidenceChecks.length,
    ),
    understanding: scoreFromCompletion(totalUnderstanding, maxUnderstanding),
  };
};

export const buildProgressSnapshot = (
  submission: Partial<SubmissionData>,
): ProgressSnapshot => {
  const milestones = [
    {
      label: "Registration",
      nextStep: "Confirm student name and class code.",
      completed:
        hasContent(submission.studentDetails?.studentName) &&
        hasContent(submission.studentDetails?.classCode),
    },
    {
      label: "Activity 1",
      nextStep: "Complete tidal locking evidence and prediction answers.",
      completed:
        hasContent(submission.activity1Evidence) ||
        hasContent(submission.activity1Prediction),
    },
    {
      label: "Activity 2",
      nextStep: "Fill in the moon phases and hemisphere answers.",
      completed:
        hasContent(submission.activity2BrightSide) &&
        hasContent(submission.activity2Hemisphere),
    },
    {
      label: "Activity 3",
      nextStep: "Add eclipse analysis and sandbox evidence.",
      completed:
        hasContent(submission.activity3CompareExplain) ||
        hasContent(submission.activity3SolarEffect) ||
        hasContent(submission.activity3Screenshot),
    },
    {
      label: "Activity 4",
      nextStep: "Write the closing reflection.",
      completed: hasContent(submission.activity4Reflection),
    },
    {
      label: "Mission report",
      nextStep: "Submit the final feasibility report.",
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
    stageLabel: nextIncomplete ? nextIncomplete.label : "Ready for review",
    nextStep: nextIncomplete
      ? nextIncomplete.nextStep
      : "All core milestones are complete.",
  };
};
