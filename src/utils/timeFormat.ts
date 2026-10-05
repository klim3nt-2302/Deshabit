import { Habit, NeuroMilestone } from '../types';
import { NEURO_MILESTONES } from '../data/initialData';

export interface TimeDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  totalDays: number;
}

export function calculateCleanTime(startedAt: number, currentTimestamp: number = Date.now()): TimeDuration {
  const elapsedMs = Math.max(0, currentTimestamp - startedAt);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalDays = Number((totalSeconds / 86400).toFixed(2));

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    totalDays,
  };
}

export type NotificationDayGroup = 'today' | 'yesterday' | 'earlier';

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function getNotificationDayGroup(ts: number, now: number = Date.now()): NotificationDayGroup {
  const today = startOfDay(now);
  if (ts >= today) return 'today';
  if (ts >= today - 86400000) return 'yesterday';
  return 'earlier';
}

export function formatRelativeTime(ts: number, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - ts);
  const minutes = Math.floor(diffMs / 60000);
  const group = getNotificationDayGroup(ts, now);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (group === 'today') return `Hace ${Math.floor(minutes / 60)} h`;
  if (group === 'yesterday') return `Ayer, ${formatClock(ts)}`;

  const days = Math.floor(diffMs / 86400000);
  if (days < 7) return `Hace ${days} días`;
  return new Date(ts).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

export function formatFullDateTime(ts: number): string {
  const date = new Date(ts).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${formatClock(ts)}`;
}

export function getCurrentMilestone(totalDays: number): {
  current: NeuroMilestone;
  next: NeuroMilestone | null;
  progressToNextPct: number;
} {
  const sorted = [...NEURO_MILESTONES].sort((a, b) => a.dayThreshold - b.dayThreshold);
  let current = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    if (totalDays >= sorted[i].dayThreshold) {
      current = sorted[i];
    }
  }

  const nextIndex = sorted.findIndex((m) => m.dayThreshold > totalDays);
  const next = nextIndex !== -1 ? sorted[nextIndex] : null;

  let progressToNextPct = 100;
  if (next) {
    const prevThreshold = current.dayThreshold <= next.dayThreshold && current !== next ? current.dayThreshold : 0;
    const range = next.dayThreshold - prevThreshold;
    const progress = totalDays - prevThreshold;
    progressToNextPct = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  return { current, next, progressToNextPct };
}

export function calculateAntiPunitiveStats(habit: Habit, currentDays: number): {
  averageCleanIntervalDays: number;
  expansionPercentage: number;
  synapticRetentionPct: number;
  totalDaysEvaluated: number;
  intervalsList: number[];
} {
  const intervals = [...habit.historicalIntervalsDays, currentDays];
  const totalDays = intervals.reduce((acc, val) => acc + val, 0);
  const averageCleanIntervalDays = Number((totalDays / intervals.length).toFixed(1));

  // Compare last two intervals or compare against previous baseline
  let expansionPercentage = 35;
  if (intervals.length >= 2) {
    const current = intervals[intervals.length - 1];
    const previous = intervals[intervals.length - 2];
    if (previous > 0) {
      expansionPercentage = Math.round(((current - previous) / previous) * 100);
    }
  }

  // Retention: Slips do not delete the neural pathway. Each slip represents a minor friction point.
  // Formula: (Total clean days / (Total clean days + number of slips * 0.5)) * 100
  const slipsCount = habit.slips.length;
  const synapticRetentionPct = Math.min(
    99,
    Math.max(88, Math.round(((totalDays) / (totalDays + slipsCount * 0.4)) * 100))
  );

  return {
    averageCleanIntervalDays: Math.max(0.1, averageCleanIntervalDays),
    expansionPercentage: Math.max(5, expansionPercentage),
    synapticRetentionPct,
    totalDaysEvaluated: Math.round(totalDays),
    intervalsList: intervals,
  };
}
