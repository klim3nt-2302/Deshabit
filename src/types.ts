export interface SlipRecord {
  id: string;
  timestamp: number; // ms
  trigger: string;
  intervalBeforeSlipDays: number;
  notes?: string;
  intensity?: 'leve' | 'moderada' | 'aguda';
}

export interface DayStatus {
  dateStr: string; // YYYY-MM-DD
  dayLetter: string; // L, M, X, J, V, S, D
  dayNumber: number;
  status: 'clean' | 'slip' | 'future' | 'today';
}

export interface ReflectionEntry {
  id: string;
  timestamp: number;
  text: string;
  triggerContext?: string;
}

export interface HabitSavings {
  moneyPerDay: number;
  minutesPerDay: number;
  currency: string;
}

export interface NeuroMilestone {
  dayThreshold: number;
  title: string;
  shortLabel: string;
  biologicalDescription: string;
  circuitryImpact: string;
}

export interface Habit {
  id: string;
  title: string;
  category: 'Salud' | 'Foco' | 'Digital' | 'Finanzas';
  challengeMode: string; // e.g. "Modo Desafío"
  phase: string; // e.g. "Fase 1 / Rigor"
  levelBadge?: string; // e.g. "Nivel 3"
  icon?: string; // Material symbol icon name, e.g. "nutrition", "devices", "account_balance_wallet"
  description?: string;
  triggerDescription: string;
  startedAt: number; // timestamp in ms
  targetDays: number; // default 50
  slips: SlipRecord[];
  historicalIntervalsDays: number[];
  lastCleanDayConfirmedDate?: string; // YYYY-MM-DD
  cleanDaysCount: number;
  weeklyLog: DayStatus[];
  reflections: ReflectionEntry[];
  savings: HabitSavings;
  cognitiveReinforcement: string;
  isPriority?: boolean;
  status?: 'active' | 'completed';
  progressPercentage?: number;
  challengeType?: 'record' | 'free';
  isInfinite?: boolean;
  startDate?: string;
}

export interface HabitTemplate {
  id: string;
  title: string;
  category: 'Salud' | 'Foco' | 'Digital' | 'Finanzas';
  description: string;
  triggerExample: string;
  targetDays: number;
  scientificContext: string;
  savings: HabitSavings;
}

export interface ChallengeItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'health' | 'foco' | 'finance' | 'digital';
  status: 'active' | 'completed';
  icon: string;
  progressText: string;
  progressPercentage: number;
  totalDays: number;
  completedDays: number;
  notes?: string;
  streakDays?: number;
  completedDate?: string;
  challengeType?: 'record' | 'free';
  isInfinite?: boolean;
  startDate?: string; // YYYY-MM-DD for free mode
  costTimeMinutes?: number;
  costMoneyAmount?: number;
  costMoneyCurrency?: string;
}

export type NotificationOrigin = 'activity' | 'reminder';

export type NotificationKind =
  | 'milestone'
  | 'clean_day'
  | 'slip'
  | 'reflection'
  | 'challenge'
  | 'reminder'
  | 'system';

export interface NotificationAction {
  type: 'habit' | 'challenges' | 'therapy' | 'settings' | 'sos' | 'profile';
  targetId?: string;
  label: string; // e.g. "Ver desafío"
}

export interface AppNotification {
  id: string;
  origin: NotificationOrigin;
  kind: NotificationKind;
  title: string;
  summary: string; // 1-2 líneas para la lista
  body: string; // texto completo para el detalle
  timestamp: number; // ms
  isRead: boolean;
  habitId?: string;
  action?: NotificationAction;
}
