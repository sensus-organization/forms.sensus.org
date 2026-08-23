import { describe, expect, test } from "vitest";
import { getCalendarDateFromUtc, getStartOfDay } from "./index";

describe("DatePicker date conversion", () => {
  test("uses the stored UTC calendar date instead of shifting it through the browser timezone", () => {
    const calendarDate = getCalendarDateFromUtc(new Date("2026-08-23T23:30:00.000Z"));

    expect(calendarDate.getFullYear()).toBe(2026);
    expect(calendarDate.getMonth()).toBe(7);
    expect(calendarDate.getDate()).toBe(23);
  });

  test("allows today by comparing calendar days from local midnight", () => {
    const startOfDay = getStartOfDay(new Date(2026, 7, 23, 18, 45, 30));

    expect(startOfDay).toEqual(new Date(2026, 7, 23, 0, 0, 0));
  });
});
