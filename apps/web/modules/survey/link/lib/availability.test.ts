import { describe, expect, test } from "vitest";
import { getEffectiveSurveyStatus } from "./availability";

const now = new Date("2026-08-23T12:00:00.000Z");

describe("getEffectiveSurveyStatus", () => {
  test("opens a scheduled survey as soon as its release time passes", () => {
    expect(
      getEffectiveSurveyStatus(
        {
          status: "scheduled",
          runOnDate: new Date("2026-08-23T11:59:00.000Z"),
          closeOnDate: null,
        },
        now
      )
    ).toBe("inProgress");
  });

  test("keeps a survey scheduled before its release time", () => {
    expect(
      getEffectiveSurveyStatus(
        {
          status: "scheduled",
          runOnDate: new Date("2026-08-23T12:01:00.000Z"),
          closeOnDate: null,
        },
        now
      )
    ).toBe("scheduled");
  });

  test("closes an active survey as soon as its close time passes", () => {
    expect(
      getEffectiveSurveyStatus(
        {
          status: "inProgress",
          runOnDate: null,
          closeOnDate: new Date("2026-08-23T11:59:00.000Z"),
        },
        now
      )
    ).toBe("completed");
  });

  test("does not open a survey after both its release and close times have passed", () => {
    expect(
      getEffectiveSurveyStatus(
        {
          status: "scheduled",
          runOnDate: new Date("2026-08-23T10:00:00.000Z"),
          closeOnDate: new Date("2026-08-23T11:00:00.000Z"),
        },
        now
      )
    ).toBe("completed");
  });
});
