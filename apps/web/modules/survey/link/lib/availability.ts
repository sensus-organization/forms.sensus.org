import { TSurvey } from "@formbricks/types/surveys/types";

export const getEffectiveSurveyStatus = (
  survey: Pick<TSurvey, "status" | "runOnDate" | "closeOnDate">,
  now = new Date()
): TSurvey["status"] => {
  let status = survey.status;

  if (status === "scheduled" && survey.runOnDate && survey.runOnDate <= now) {
    status = "inProgress";
  }

  if (status === "inProgress" && survey.closeOnDate && survey.closeOnDate <= now) {
    status = "completed";
  }

  return status;
};
