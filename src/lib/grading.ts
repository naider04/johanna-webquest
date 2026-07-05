import { RubricScore, SubmissionData, ProgressSnapshot } from "../types";

type Rating = "Excellent" | "Good" | "Needs Improvement" | null;

const hasContent = (value: unknown) => {
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
};

const getPoints = (val: Rating) => {
  if (val === "Excellent") return 4;
  if (val === "Good") return 3;
  if (val === "Needs Improvement") return 1;
  return 0;
};

// Correct answers for all logbook dropdowns
const CORRECT: Record<string, string> = {
  act1_0: "equal",
  act1_1: "always",
  act1_2: "bulge",
  act2_bright: "illuminated",
  act2_hemi0: "opposite",
  act2_hemi1: "New",
};

const countCorrectAnswers = (submission: Partial<SubmissionData>): number => {
  const act1Parts = (submission.activity1Prediction || "").split("|");
  const act2HemiParts = (submission.activity2Hemisphere || "").split("|");
  let correct = 0;
  if (act1Parts[0] === CORRECT.act1_0) correct++;
  if (act1Parts[1] === CORRECT.act1_1) correct++;
  if (act1Parts[2] === CORRECT.act1_2) correct++;
  if (submission.activity2BrightSide === CORRECT.act2_bright) correct++;
  if (act2HemiParts[0] === CORRECT.act2_hemi0) correct++;
  if (act2HemiParts[1] === CORRECT.act2_hemi1) correct++;
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
  // Evidence: only check is the tidal locking puzzle
  const puzzleDone = submission.activity1Evidence === "ACHIEVED";
  const evidence: Exclude<Rating, null> = puzzleDone
    ? "Excellent"
    : "Needs Improvement";

  // Understanding: based on correct logbook answers out of 6
  const correct = countCorrectAnswers(submission);
  let understanding: Exclude<Rating, null>;
  if (correct === 6) understanding = "Excellent";
  else if (correct >= 3) understanding = "Good";
  else understanding = "Needs Improvement";

  return { evidence, understanding };
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
      nextStep: "Complete the tidal locking simulator.",
      completed: submission.activity1Evidence === "ACHIEVED",
    },
    {
      label: "Activity 2",
      nextStep: "Fill in the moon phases and hemisphere answers.",
      completed:
        hasContent(submission.activity2BrightSide) &&
        hasContent(submission.activity2Hemisphere),
    },
  ];

  const completedSteps = milestones.filter((s) => s.completed).length;
  const totalSteps = milestones.length;
  const percent = Math.round((completedSteps / totalSteps) * 100);
  const nextIncomplete = milestones.find((s) => !s.completed);

  return {
    completedSteps,
    totalSteps,
    percent,
    stageLabel: nextIncomplete ? nextIncomplete.label : "Ready for review",
    nextStep: nextIncomplete
      ? nextIncomplete.nextStep
      : "All activities complete.",
  };
};
