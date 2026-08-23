import { describe, expect, test } from "vitest";
import { combineDateWithTime, getStartOfDay, setLocalTime } from "./index";

describe("DatePicker date conversion", () => {
  test("allows today by comparing calendar days from local midnight", () => {
    const startOfDay = getStartOfDay(new Date(2026, 7, 23, 18, 45, 30));

    expect(startOfDay).toEqual(new Date(2026, 7, 23, 0, 0, 0));
  });

  test("combines the selected calendar day with browser-local time", () => {
    const combined = combineDateWithTime(new Date(2026, 7, 23), new Date(2026, 7, 20, 18, 45));

    expect(combined).toEqual(new Date(2026, 7, 23, 18, 45));
  });

  test("updates time using the browser-local clock", () => {
    const updated = setLocalTime(new Date(2026, 7, 23, 10, 0), "18:47");

    expect(updated).toEqual(new Date(2026, 7, 23, 18, 47));
  });
});
