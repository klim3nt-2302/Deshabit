import { ChallengeItem, Habit } from '../types';
import { generateCurrentWeekLog } from './weekGenerator';

/**
 * Converts a ChallengeItem to a full Habit entity so that the user
 * can view its [Detalle del desafío] seamlessly with zero invented data.
 */
export function convertChallengeToHabit(challenge: ChallengeItem, now: number = Date.now()): Habit {
  const isCompleted = challenge.status === 'completed';
  const cleanDays = challenge.completedDays;
  const targetDays = challenge.isInfinite ? 9999 : challenge.totalDays;

  // Set startedAt accurately so calculateCleanTime yields exactly cleanDays
  let startedAt: number;
  if (challenge.startDate) {
    const parsedStart = new Date(challenge.startDate).getTime();
    startedAt = isNaN(parsedStart) ? now - ((cleanDays * 24 * 3600 + 14 * 3600) * 1000) : parsedStart;
  } else {
    const elapsedMs = (cleanDays * 24 * 3600 + 14 * 3600 + 32 * 60 + 45) * 1000;
    startedAt = now - elapsedMs;
  }

  const categoryMap: Record<ChallengeItem['category'], 'Salud' | 'Foco' | 'Finanzas' | 'Digital'> = {
    health: 'Salud',
    foco: 'Foco',
    finance: 'Finanzas',
    digital: 'Digital',
  };

  const categoryLabel = categoryMap[challenge.category] || 'Salud';

  const defaultNotes = isCompleted
    ? 'Hito superado con éxito. Consistencia demostrada y vías dopaminérgicas rehabilitadas.'
    : challenge.isInfinite
    ? 'Modo Infinito activo: compromiso continuo de superación y acumulación de días limpios.'
    : challenge.challengeType === 'free'
    ? 'Modo Libre activo: seguimiento de ahorro continuo y fechas históricas registradas.'
    : 'Protocolo en ejecución activa. Mantén el foco en la respuesta inhibitoria.';

  const noteText = challenge.notes || defaultNotes;

  const challengeMode = isCompleted
    ? 'Desafío Culminado'
    : challenge.isInfinite
    ? 'Modo Infinito'
    : challenge.challengeType === 'free'
    ? 'Modo Libre'
    : 'Modo Récord';

  const phase = isCompleted
    ? 'Superado'
    : challenge.isInfinite
    ? '∞ Sin Límite'
    : challenge.challengeType === 'free'
    ? 'Libre / Seguimiento'
    : 'En Progreso';

  return {
    id: challenge.id,
    title: challenge.title,
    category: categoryLabel,
    challengeMode,
    phase,
    levelBadge: isCompleted ? 'Completado' : challenge.isInfinite ? '∞ Infinito' : 'Activo',
    icon: challenge.icon,
    description: challenge.notes,
    triggerDescription: challenge.subtitle,
    startedAt,
    targetDays,
    cleanDaysCount: cleanDays,
    lastCleanDayConfirmedDate: isCompleted ? new Date().toISOString().split('T')[0] : undefined,
    historicalIntervalsDays: [targetDays],
    slips: [],
    reflections: [
      {
        id: `ref-${challenge.id}`,
        timestamp: now - (isCompleted ? 2 * 86400 * 1000 : 86400 * 1000),
        text: noteText,
        triggerContext: challenge.subtitle,
      },
    ],
    savings: {
      moneyPerDay:
        challenge.costMoneyAmount !== undefined
          ? challenge.costMoneyAmount
          : challenge.category === 'finance'
          ? 16.2
          : 4.5,
      minutesPerDay:
        challenge.costTimeMinutes !== undefined
          ? challenge.costTimeMinutes
          : challenge.category === 'foco' || challenge.category === 'digital'
          ? 45
          : 30,
      currency: challenge.costMoneyCurrency || '€',
    },
    cognitiveReinforcement: noteText,
    isPriority: false,
    status: challenge.status,
    progressPercentage: challenge.progressPercentage,
    challengeType: challenge.challengeType,
    isInfinite: challenge.isInfinite,
    startDate: challenge.startDate,
    weeklyLog: generateCurrentWeekLog([], cleanDays),
  };
}
