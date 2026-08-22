import { cleanup, render, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, test, vi } from "vitest";
import { type TSurveyMultipleChoiceQuestion, TSurveyQuestionTypeEnum } from "@formbricks/types/surveys/types";
import { MultipleChoiceSingleQuestion } from "./multiple-choice-single-question";

const question: TSurveyMultipleChoiceQuestion = {
  id: "second-vote",
  type: TSurveyQuestionTypeEnum.MultipleChoiceSingle,
  headline: { default: "Second vote" },
  required: true,
  choices: [
    { id: "candidate-a", label: { default: "Candidate A" } },
    { id: "candidate-b", label: { default: "Candidate B" } },
  ],
};

const getProps = () => ({
  question,
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  onBack: vi.fn(),
  isFirstQuestion: false,
  isLastQuestion: true,
  languageCode: "default",
  ttc: {},
  setTtc: vi.fn(),
  autoFocusEnabled: false,
  currentQuestionId: question.id,
  isBackButtonHidden: false,
});

describe("MultipleChoiceSingleQuestion choice exclusion", () => {
  afterEach(() => cleanup());

  test("disables an excluded choice and keeps another choice available and required", () => {
    const props = getProps();
    const { getByLabelText } = render(
      <MultipleChoiceSingleQuestion {...props} excludedChoiceTokens={["choice:Candidate A"]} />
    );

    expect((getByLabelText("Candidate A") as HTMLInputElement).disabled).toBe(true);
    expect((getByLabelText("Candidate B") as HTMLInputElement).disabled).toBe(false);
    expect((getByLabelText("Candidate B") as HTMLInputElement).required).toBe(true);
  });

  test("clears a selected answer when it becomes excluded", async () => {
    const props = getProps();
    render(
      <MultipleChoiceSingleQuestion
        {...props}
        value="Candidate A"
        excludedChoiceTokens={["choice:Candidate A"]}
      />
    );

    await waitFor(() => expect(props.onChange).toHaveBeenCalledWith({ "second-vote": "" }));
  });

  test("disables Other as one choice regardless of its free-text answer", () => {
    const props = getProps();
    const questionWithOther = {
      ...question,
      choices: [...question.choices, { id: "other", label: { default: "Other" } }],
    };
    const { getByLabelText } = render(
      <MultipleChoiceSingleQuestion
        {...props}
        question={questionWithOther}
        excludedChoiceTokens={["other"]}
      />
    );

    expect((getByLabelText("Other") as HTMLInputElement).disabled).toBe(true);
  });
});
