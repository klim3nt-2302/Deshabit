import { DayStatus } from '../types';

export function generateCurrentWeekLog(
  slipTimestamps: number[] = [],
  cleanDaysCount: number = 6
): DayStatus[] {
  const now = new Date();
  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDayOfWeek = now.getDay();
  // Map to Monday as start: Monday = 0, Tuesday = 1, ..., Sunday = 6
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const dayLetters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const week: DayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const dateStr = dayDate.toISOString().split('T')[0];
    const isToday = dayDate.toDateString() === now.toDateString();
    const isFuture = dayDate > now && !isToday;

    let status: 'clean' | 'slip' | 'future' | 'today' = 'clean';

    if (isToday) {
      status = 'today';
    } else if (isFuture) {
      status = 'future';
    } else {
      // Check if there was a slip on this day
      const hasSlip = slipTimestamps.some((ts) => {
        const slipDate = new Date(ts).toISOString().split('T')[0];
        return slipDate === dateStr;
      });

      if (hasSlip) {
        status = 'slip';
      } else {
        status = 'clean';
      }
    }

    week.push({
      dateStr,
      dayLetter: dayLetters[i],
      dayNumber: dayDate.getDate(),
      status,
    });
  }

  return week;
}
