import { Holiday } from "@/types/task";

/**
 * Calculate business days between two dates, excluding weekends and holidays
 * @param startDate Start date
 * @param endDate End date
 * @param holidays Array of holiday dates
 * @returns Number of business days
 */
export function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  holidays: Holiday[] = []
): number {
  if (startDate > endDate) {
    return 0;
  }

  // Build holiday set (supporting ranges)
  const holidayDates = new Set(
    holidays.flatMap(h => {
      const dates: string[] = [];
      const current = new Date(h.startDate);
      const end = new Date(h.endDate);
      while (current <= end) {
        dates.push(current.toDateString());
        current.setDate(current.getDate() + 1);
      }
      return dates;
    })
  );

  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    const isHoliday = holidayDates.has(currentDate.toDateString());

    if (!isWeekend && !isHoliday) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

/**
 * Calculate estimated hours based on business days
 * @param startDate Start date
 * @param endDate End date
 * @param holidays Array of holiday dates
 * @param hoursPerDay Working hours per day (default: 8)
 * @returns Estimated total hours
 */
export function calculateEstimatedHours(
  startDate: Date,
  endDate: Date,
  holidays: Holiday[] = [],
  hoursPerDay: number = 8
): number {
  const businessDays = calculateBusinessDays(startDate, endDate, holidays);
  return businessDays * hoursPerDay;
}

/**
 * Check if a date range is within another date range
 * @param checkStart Start date to check
 * @param checkEnd End date to check
 * @param rangeStart Range start date
 * @param rangeEnd Range end date
 * @returns true if the check range is within the given range
 */
export function isDateRangeWithin(
  checkStart: Date,
  checkEnd: Date,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  return checkStart >= rangeStart && checkEnd <= rangeEnd;
}
