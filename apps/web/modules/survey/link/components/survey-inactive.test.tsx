import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SurveyInactive } from "./survey-inactive";

vi.mock("@/tolgee/server", () => ({
  getTranslate: vi.fn(async () => (key: string) => key),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe("SurveyInactive", () => {
  test.each(["scheduled", "completed"] as const)(
    "shows the custom unavailable message when the survey is %s",
    async (status) => {
      const { container } = render(
        await SurveyInactive({
          status,
          surveyClosedMessage: {
            heading: "Voting is not available",
            subheading: "Please return during the voting period.",
          },
        })
      );

      expect(container.querySelector("h1")).toHaveTextContent("Voting is not available");
      expect(container.querySelector("p")).toHaveTextContent("Please return during the voting period.");
    }
  );

  test("shows the scheduled fallback when no custom message is configured", async () => {
    render(await SurveyInactive({ status: "scheduled" }));

    expect(screen.getByRole("heading", { name: "common.survey scheduled." })).toBeInTheDocument();
    expect(screen.getByText("s.survey_scheduled")).toBeInTheDocument();
  });
});
