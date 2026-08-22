import {
  type TSurvey,
  type TSurveyMultipleChoiceQuestion,
  type TSurveyQuestionChoice,
  TSurveyQuestionTypeEnum,
} from "./types";

type ResponseValue = string | number | string[] | Record<string, string>;

const normalizeChoiceLabel = (label: string): string => label.normalize("NFKC").trim();

export const getChoiceToken = (choice: TSurveyQuestionChoice): string =>
  choice.id === "other" ? "other" : `choice:${normalizeChoiceLabel(choice.label.default)}`;

/** Resolves a stored, localized response value to a stable choice identity. */
export const getChoiceAnswerToken = (
  question: TSurveyMultipleChoiceQuestion,
  answer: string,
  languageCode = "default"
): string | null | undefined => {
  if (answer.trim() === "") return undefined;

  const matchingChoice = question.choices.find(
    (choice) => choice.id !== "other" && (choice.label[languageCode] ?? choice.label.default) === answer
  );
  if (matchingChoice) return getChoiceToken(matchingChoice);

  return question.choices.some((choice) => choice.id === "other") ? "other" : null;
};

/** Returns IDs containing invalid answers or duplicate excluded choices. */
export const getChoiceExclusionViolations = (
  survey: Pick<TSurvey, "questions">,
  responseData: Record<string, ResponseValue>,
  languageCode = "default"
): string[] => {
  const questionsById = new Map(survey.questions.map((question) => [question.id, question]));
  const violations = new Set<string>();

  survey.questions.forEach((question) => {
    if (question.type !== TSurveyQuestionTypeEnum.MultipleChoiceSingle || !question.choiceExclusion) {
      return;
    }

    const targetAnswer = responseData[question.id];
    if (typeof targetAnswer !== "string") return;

    const targetToken = getChoiceAnswerToken(question, targetAnswer, languageCode);
    if (targetToken === null) {
      violations.add(question.id);
      return;
    }
    if (targetToken === undefined) return;

    const excludedTokens = new Set<string>();
    question.choiceExclusion.questionIds.forEach((sourceQuestionId) => {
      const sourceQuestion = questionsById.get(sourceQuestionId);
      if (
        sourceQuestion?.type !== TSurveyQuestionTypeEnum.MultipleChoiceSingle &&
        sourceQuestion?.type !== TSurveyQuestionTypeEnum.MultipleChoiceMulti
      ) {
        return;
      }

      const sourceAnswer = responseData[sourceQuestionId];
      const answers = typeof sourceAnswer === "string" ? [sourceAnswer] : sourceAnswer;
      if (!Array.isArray(answers)) return;

      answers.forEach((answer) => {
        const sourceToken = getChoiceAnswerToken(sourceQuestion, answer, languageCode);
        if (sourceToken === null) violations.add(sourceQuestionId);
        if (sourceToken !== null && sourceToken !== undefined) excludedTokens.add(sourceToken);
      });
    });

    if (excludedTokens.has(targetToken)) violations.add(question.id);
  });

  return Array.from(violations);
};
