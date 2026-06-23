import type { DateRangePickerProps } from "@cloudscape-design/components/date-range-picker";

export const relativeOptions: DateRangePickerProps.RelativeOption[] = [
  { key: "1m", amount: 1, unit: "minute", type: "relative" },
  { key: "30m", amount: 30, unit: "minute", type: "relative" },
  { key: "1h", amount: 1, unit: "hour", type: "relative" },
  { key: "12h", amount: 12, unit: "hour", type: "relative" },
];

export const dateRangeI18nStrings: DateRangePickerProps.I18nStrings = {
  todayAriaLabel: "Today",
  nextMonthAriaLabel: "Next month",
  previousMonthAriaLabel: "Previous month",
  customRelativeRangeDurationLabel: "Duration",
  customRelativeRangeDurationPlaceholder: "Enter duration",
  customRelativeRangeOptionLabel: "Custom range",
  customRelativeRangeOptionDescription: "Set a custom range in the past",
  customRelativeRangeUnitLabel: "Unit of time",
  formatRelativeRange: (e) => `Last ${e.amount} ${e.unit}`,
  formatUnit: (unit, value) => (value === 1 ? unit : `${unit}s`),
  dateTimeConstraintText: "Range must be between 1 minute and 12 hours.",
  relativeModeTitle: "Relative range",
  absoluteModeTitle: "Absolute range",
  relativeRangeSelectionHeading: "Choose a range",
  startDateLabel: "Start date",
  endDateLabel: "End date",
  startTimeLabel: "Start time",
  endTimeLabel: "End time",
  clearButtonLabel: "Clear",
  cancelButtonLabel: "Cancel",
  applyButtonLabel: "Apply",
};

export function rangeToStartTime(
  value: DateRangePickerProps.Value | null,
): number | undefined {
  if (!value) return undefined;
  if (value.type === "absolute") {
    const start = Date.parse(value.startDate);
    return Number.isNaN(start) ? undefined : start;
  }
  const unitMs: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  };
  return Date.now() - value.amount * (unitMs[value.unit] ?? 60_000);
}
