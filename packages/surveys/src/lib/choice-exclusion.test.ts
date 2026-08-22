import { describe, expect, test } from "vitest";
import { getChoiceExclusionViolations } from "@formbricks/types/surveys/choice-exclusion";
import { type TSurvey, TSurveyQuestionTypeEnum } from "@formbricks/types/surveys/types";

const survey = {
  questions: [
    {
      id: "first-vote",
      type: TSurveyQuestionTypeEnum.MultipleChoiceSingle,
      choices: [
        { id: "a", label: { default: "Candidate A", de: "Kandidat A" } },
        { id: "b", label: { default: "Candidate B", de: "Kandidat B" } },
      ],
    },
    {
      id: "group-vote",
      type: TSurveyQuestionTypeEnum.MultipleChoiceMulti,
      choices: [
        { id: "a", label: { default: "Candidate A" } },
        { id: "b", label: { default: "Candidate B" } },
      ],
    },
    {
      id: "second-vote",
      type: TSurveyQuestionTypeEnum.MultipleChoiceSingle,
      choiceExclusion: { questionIds: ["first-vote", "group-vote"] },
      choices: [
        { id: "a", label: { default: "Candidate A" } },
        { id: "b", label: { default: "Candidate B" } },
      ],
    },
  ],
} as unknown as Pick<TSurvey, "questions">;

describe("getChoiceExclusionViolations", () => {
  test("rejects an answer already used in a configured source question", () => {
    expect(
      getChoiceExclusionViolations(survey, {
        "first-vote": "Candidate A",
        "second-vote": "Candidate A",
      })
    ).toEqual(["second-vote"]);

    expect(
      getChoiceExclusionViolations(survey, {
        "group-vote": ["Candidate A", "Candidate B"],
        "second-vote": "Candidate B",
      })
    ).toEqual(["second-vote"]);
  });

  test("allows distinct and incomplete answers", () => {
    expect(
      getChoiceExclusionViolations(survey, {
        "first-vote": "Candidate A",
        "second-vote": "Candidate B",
      })
    ).toEqual([]);
    expect(getChoiceExclusionViolations(survey, { "first-vote": "Candidate A" })).toEqual([]);
    expect(getChoiceExclusionViolations(survey, { "first-vote": "", "second-vote": "" })).toEqual([]);
  });

  test("canonicalizes localized choices and rejects forged choice labels", () => {
    expect(
      getChoiceExclusionViolations(
        survey,
        {
          "first-vote": "Kandidat A",
          "second-vote": "Candidate A",
        },
        "de"
      )
    ).toEqual(["second-vote"]);
    expect(
      getChoiceExclusionViolations(survey, {
        "first-vote": "Candidate A ",
        "second-vote": "Candidate B",
      })
    ).toEqual(["first-vote"]);
  });

  test("treats different free-text Other answers as the same selected option", () => {
    const surveyWithOther = {
      questions: [
        {
          id: "first-vote",
          type: TSurveyQuestionTypeEnum.MultipleChoiceSingle,
          choices: [
            { id: "a", label: { default: "Candidate A" } },
            { id: "other", label: { default: "Other" } },
          ],
        },
        {
          id: "second-vote",
          type: TSurveyQuestionTypeEnum.MultipleChoiceSingle,
          choices: [
            { id: "a", label: { default: "Candidate A" } },
            { id: "other", label: { default: "Other" } },
          ],
          choiceExclusion: { questionIds: ["first-vote"] },
        },
      ],
    } as unknown as Pick<TSurvey, "questions">;

    expect(
      getChoiceExclusionViolations(surveyWithOther, {
        "first-vote": "Alice",
        "second-vote": "Bob",
      })
    ).toEqual(["second-vote"]);
  });
});
