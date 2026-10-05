import { AppNotification, Habit, NotificationAction } from '../types';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export function getInitialNotifications(habits: Habit[], now: number = Date.now()): AppNotification[] {
  // Habit IDs differ per account, so habit-linked notifications bind to the account's own habits.
  const linkHabit = (index: number, label: string) => {
    const habit = habits.length > 0 ? habits[index % habits.length] : undefined;
    const action: NotificationAction = habit
      ? { type: 'habit', targetId: habit.id, label }
      : { type: 'challenges', label: 'Ir a Desafíos' };
    return { title: habit?.title ?? 'tu desafío', habitId: habit?.id, action };
  };

  const milestoneHabit = linkHabit(2, 'Ver progreso del hábito');
  const cleanDayHabit = linkHabit(1, 'Ver hábito');
  const reflectionHabit = linkHabit(0, 'Abrir diario del hábito');
  const challengeHabit = linkHabit(3, 'Ver desafío');

  return [
    {
      id: 'notif-seed-1',
      origin: 'activity',
      kind: 'milestone',
      title: 'Hito neurobiológico alcanzado',
      summary: `Superaste 6 días en "${milestoneHabit.title}". La reactividad nocturna de la amígdala bajó un 18%.`,
      body: `Has superado el umbral de 6 días consecutivos en "${milestoneHabit.title}". A partir de este punto la reactividad de la amígdala ante el estímulo disminuye cerca de un 18% y la corteza prefrontal recupera terreno en el control inhibitorio. Mantener tu rutina de sustitución consolida este avance.`,
      timestamp: now - 2 * HOUR,
      isRead: false,
      habitId: milestoneHabit.habitId,
      action: milestoneHabit.action,
    },
    {
      id: 'notif-seed-2',
      origin: 'reminder',
      kind: 'reminder',
      title: 'Blindaje nocturno a las 22:00',
      summary: 'Hora de pasar el dispositivo a escala de grises y dejarlo fuera del dormitorio.',
      body:
        'Tu blindaje nocturno comienza a las 22:00. Activa la escala de grises, deja el teléfono cargando fuera del dormitorio y reemplaza el scroll por una actividad de baja estimulación. Puedes ajustar el horario o desactivar este recordatorio desde Ajustes.',
      timestamp: now - 3 * HOUR,
      isRead: false,
      action: { type: 'settings', label: 'Ajustar recordatorio' },
    },
    {
      id: 'notif-seed-3',
      origin: 'activity',
      kind: 'clean_day',
      title: 'Día limpio consolidado',
      summary: `Registraste un nuevo día limpio en "${cleanDayHabit.title}". La racha sigue creciendo.`,
      body: `Confirmaste un nuevo día limpio en "${cleanDayHabit.title}". Cada día registrado refuerza la resensibilización de los receptores de dopamina y reduce la intensidad del antojo en los próximos días.`,
      timestamp: now - 5 * HOUR,
      isRead: false,
      habitId: cleanDayHabit.habitId,
      action: cleanDayHabit.action,
    },
    {
      id: 'notif-seed-4',
      origin: 'reminder',
      kind: 'reminder',
      title: 'Pausa de respiración sugerida',
      summary: 'Las tardes suelen concentrar tus impulsos. Un ejercicio de 60 s puede ayudarte.',
      body:
        'Según tus registros, entre las 17:00 y las 19:00 aparecen la mayoría de tus impulsos. Un protocolo de respiración vagal de 60 segundos reduce el pico de craving antes de que se transforme en conducta.',
      timestamp: now - 1 * DAY - 2 * HOUR,
      isRead: false,
      action: { type: 'sos', label: 'Iniciar respiración' },
    },
    {
      id: 'notif-seed-5',
      origin: 'activity',
      kind: 'reflection',
      title: 'Reflexión guardada en tu diario',
      summary: `Tu nota sobre el disparador de estrés laboral quedó registrada en "${reflectionHabit.title}".`,
      body: `Guardaste una reflexión en el diario de "${reflectionHabit.title}". El registro metacognitivo te ayuda a reconocer patrones y a separar el impulso automático de la decisión consciente.`,
      timestamp: now - 1 * DAY - 6 * HOUR,
      isRead: true,
      habitId: reflectionHabit.habitId,
      action: reflectionHabit.action,
    },
    {
      id: 'notif-seed-6',
      origin: 'reminder',
      kind: 'system',
      title: 'Respaldo local completado',
      summary: '12 registros sincronizados en almacenamiento local sin pérdida de datos.',
      body:
        'Se completó el respaldo automático de tu bóveda: 12 registros sincronizados en el almacenamiento local del dispositivo, sin pérdida de datos. No necesitas hacer nada.',
      timestamp: now - 1 * DAY - 9 * HOUR,
      isRead: true,
      action: { type: 'profile', label: 'Ver mi perfil' },
    },
    {
      id: 'notif-seed-7',
      origin: 'activity',
      kind: 'challenge',
      title: 'Nuevo desafío en curso',
      summary: `Activaste "${challengeHabit.title}". El cuantificador en vivo ya está corriendo.`,
      body: `Activaste el desafío "${challengeHabit.title}". El cuantificador en vivo registra tu tiempo limpio y el ahorro acumulado desde ese momento.`,
      timestamp: now - 3 * DAY,
      isRead: true,
      habitId: challengeHabit.habitId,
      action: challengeHabit.action,
    },
    {
      id: 'notif-seed-8',
      origin: 'reminder',
      kind: 'reminder',
      title: 'Sesión de terapia disponible',
      summary: 'Nuevo protocolo de anclaje sensorial para momentos de alta vulnerabilidad.',
      body:
        'Hay un nuevo protocolo de anclaje sensorial disponible en Terapia 1:1. Está diseñado para momentos de alta vulnerabilidad y dura menos de 5 minutos.',
      timestamp: now - 4 * DAY,
      isRead: true,
      action: { type: 'therapy', label: 'Ir a Terapia' },
    },
  ];
}
