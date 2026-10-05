import { Habit, ChallengeItem } from '../types';
import { INITIAL_HABITS } from './initialData';
import { INITIAL_CHALLENGES } from './initialChallenges';
import { generateCurrentWeekLog } from '../utils/weekGenerator';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarIcon: string;
  roleBadge: string;
  streakHeadline: string;
  currency: 'CLP' | 'USD';
  memberSince: string;
  habits: Habit[];
  challenges: ChallengeItem[];
  stats: {
    totalCleanDays: number;
    consistencyPercentage: number;
    moneySaved: number;
    hoursSaved: number;
  };
}

const CAMILA_HABITS: Habit[] = [
  {
    id: 'habit-cafeina',
    title: 'Exceso de Cafeína y Energéticas',
    category: 'Salud',
    challengeMode: 'Modo Récord',
    phase: 'Fase 2 / Progresión',
    icon: 'coffee',
    startedAt: Date.now() - 18 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000,
    cleanDaysCount: 18,
    targetDays: 30,
    isPriority: true,
    triggerDescription: 'Consumo automático de café post-almuerzo y bebidas estimulantes en guardias.',
    slips: [],
    historicalIntervalsDays: [18],
    weeklyLog: generateCurrentWeekLog([], 18),
    reflections: [
      {
        id: 'ref-c-1',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        text: 'Los receptores de adenosina se han estabilizado. Mi sueño profundo REM subió 35 minutos.',
      },
    ],
    savings: {
      moneyPerDay: 5,
      minutesPerDay: 25,
      currency: 'USD',
    },
    cognitiveReinforcement:
      'Tu curva de cortisol matutino se ha normalizado. La energía ahora proviene de tu respiración y nutrición celular.',
  },
  {
    id: 'habit-procrastinacion',
    title: 'Procrastinación & Multitarea Digital',
    category: 'Foco',
    challengeMode: 'Modo Récord',
    phase: 'Fase 2 / Consolidación',
    icon: 'psychology',
    startedAt: Date.now() - 24 * 24 * 60 * 60 * 1000,
    cleanDaysCount: 24,
    targetDays: 50,
    isPriority: false,
    triggerDescription: 'Alternancia compulsiva de pestañas en reportes clínicos complejos.',
    slips: [],
    historicalIntervalsDays: [24],
    weeklyLog: generateCurrentWeekLog([], 24),
    reflections: [],
    savings: {
      moneyPerDay: 0,
      minutesPerDay: 75,
      currency: 'USD',
    },
    cognitiveReinforcement:
      'Tus periodos de concentración profunda han recuperado la resistencia axonal basal.',
  },
];

const CAMILA_CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch-camila-1',
    title: 'Desintoxicación de Cafeína 30 Días',
    subtitle: 'Modo Récord · Día 18 de 30 · Racha 18d',
    category: 'health',
    status: 'active',
    icon: 'coffee',
    progressText: '18 de 30 días',
    progressPercentage: 60,
    totalDays: 30,
    completedDays: 18,
    streakDays: 18,
    notes: 'Preservar receptores de adenosina limpios durante la jornada.',
    challengeType: 'record',
  },
  {
    id: 'ch-camila-2',
    title: 'Bloque de Foco Profundo Clínico',
    subtitle: 'Modo Récord · Día 24 de 50',
    category: 'foco',
    status: 'active',
    icon: 'psychology',
    progressText: '24 de 50 días',
    progressPercentage: 48,
    totalDays: 50,
    completedDays: 24,
    streakDays: 24,
    notes: 'Sesiones de 50 minutos de redacción de casos sin multitarea.',
    challengeType: 'record',
  },
];

const MATIAS_HABITS: Habit[] = [
  {
    id: 'habit-apuestas',
    title: 'Cero Apuestas & Casino Online',
    category: 'Finanzas',
    challengeMode: 'Modo Récord',
    phase: 'Fase 1 / Rigor',
    icon: 'casino',
    startedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    cleanDaysCount: 7,
    targetDays: 21,
    isPriority: true,
    triggerDescription: 'Impulso de ingresar a plataformas deportivas tras momentos de tensión financiera.',
    slips: [],
    historicalIntervalsDays: [7],
    weeklyLog: generateCurrentWeekLog([], 7),
    reflections: [
      {
        id: 'ref-m-1',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        text: 'Cerré definitivamente dos cuentas de apuestas. La paz mental no tiene precio.',
      },
    ],
    savings: {
      moneyPerDay: 25000,
      minutesPerDay: 45,
      currency: 'CLP',
    },
    cognitiveReinforcement:
      'Tu corteza prefrontal ha recuperado el control del circuito estriatal de recompensa variable.',
  },
  {
    id: 'habit-compras-matias',
    title: 'Compras Impulsivas en Línea',
    category: 'Finanzas',
    challengeMode: 'Modo Récord',
    phase: 'Fase 1 / Rigor',
    icon: 'shopping_bag',
    startedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    cleanDaysCount: 12,
    targetDays: 30,
    isPriority: false,
    triggerDescription: 'Ofertas relámpago nocturnas en aplicaciones de comercio electrónico.',
    slips: [],
    historicalIntervalsDays: [12],
    weeklyLog: generateCurrentWeekLog([], 12),
    reflections: [],
    savings: {
      moneyPerDay: 15000,
      minutesPerDay: 30,
      currency: 'CLP',
    },
    cognitiveReinforcement:
      'El lapso de 72 horas para compras aplazadas ha evitado gastos impulsivos innecesarios.',
  },
];

const MATIAS_CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch-matias-1',
    title: 'Blindaje Financiero 21 Días',
    subtitle: 'Modo Récord · Día 7 de 21 · Racha 7d',
    category: 'finance',
    status: 'active',
    icon: 'savings',
    progressText: '7 de 21 días',
    progressPercentage: 33,
    totalDays: 21,
    completedDays: 7,
    streakDays: 7,
    notes: 'Moratoria estricta ante aplicaciones de azar y casinos.',
    challengeType: 'record',
  },
];

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-alejandro',
    name: 'Alejandro García',
    email: 'alejandro.garcia@neuroflow.cl',
    password: 'Password123!',
    avatarIcon: 'person',
    roleBadge: 'Nivel 3 · Disciplina Implacable',
    streakHeadline: '42 días invicto · Nicotina, Azúcar & Redes',
    currency: 'CLP',
    memberSince: 'Septiembre 2024',
    habits: INITIAL_HABITS,
    challenges: INITIAL_CHALLENGES,
    stats: {
      totalCleanDays: 42,
      consistencyPercentage: 92,
      moneySaved: 180000,
      hoursSaved: 42,
    },
  },
  {
    id: 'user-camila',
    name: 'Dra. Camila Morales',
    email: 'camila.morales@clinicaneuro.org',
    password: 'NeuroClinic2024!',
    avatarIcon: 'medical_services',
    roleBadge: 'Nivel 2 · Optimización Cognitiva',
    streakHeadline: '18 días invicta · Cero Cafeína & Foco',
    currency: 'USD',
    memberSince: 'Agosto 2024',
    habits: CAMILA_HABITS,
    challenges: CAMILA_CHALLENGES,
    stats: {
      totalCleanDays: 18,
      consistencyPercentage: 96,
      moneySaved: 120,
      hoursSaved: 36,
    },
  },
  {
    id: 'user-matias',
    name: 'Matías Valenzuela',
    email: 'matias.v@investcorp.com',
    password: 'Discipline2024!',
    avatarIcon: 'trending_up',
    roleBadge: 'Nivel 1 · Control Financiero',
    streakHeadline: '07 días invicto · Apuestas & Compras',
    currency: 'CLP',
    memberSince: 'Octubre 2024',
    habits: MATIAS_HABITS,
    challenges: MATIAS_CHALLENGES,
    stats: {
      totalCleanDays: 7,
      consistencyPercentage: 88,
      moneySaved: 280000,
      hoursSaved: 14,
    },
  },
];

const ACCOUNTS_STORAGE_KEY = 'deshabit_registered_accounts_v1';
const SESSION_STORAGE_KEY = 'deshabit_auth_session_v1';
const ONBOARDING_COMPLETED_KEY = 'deshabit_onboarding_completed_v1';

// Get all accounts (built-in + any user created)
export function getRegisteredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEMO_ACCOUNTS;
}

// Save accounts list
export function saveRegisteredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}

// Find account by email
export function findAccountByEmail(email: string): UserAccount | undefined {
  const accounts = getRegisteredAccounts();
  const normalized = email.trim().toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === normalized);
}

// Update password for an account (Forgot password flow)
export function updateAccountPassword(email: string, newPass: string): boolean {
  const accounts = getRegisteredAccounts();
  const normalized = email.trim().toLowerCase();
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === normalized);
  if (idx === -1) return false;

  accounts[idx].password = newPass;
  saveRegisteredAccounts(accounts);

  // If this user is currently in session, update session too
  const current = getActiveSession();
  if (current && current.email.toLowerCase() === normalized) {
    current.password = newPass;
    saveActiveSession(current);
  }
  return true;
}

// Register a new account
export function registerNewAccount(name: string, email: string, pass: string): UserAccount {
  const accounts = getRegisteredAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  const newAcc: UserAccount = {
    id: `user-${Date.now()}`,
    name: name.trim() || 'Nuevo Miembro',
    email: normalizedEmail,
    password: pass,
    avatarIcon: 'person',
    roleBadge: 'Nivel 1 · Iniciando Camino',
    streakHeadline: '01 día invicto · Compromiso Biológico',
    currency: 'CLP',
    memberSince: 'Hoy',
    habits: INITIAL_HABITS.map((h, i) => ({
      ...h,
      id: `habit-${Date.now()}-${i}`,
      startedAt: Date.now(),
      cleanDaysCount: 1,
      slips: [],
      historicalIntervalsDays: [1],
    })),
    challenges: INITIAL_CHALLENGES.map((c, i) => ({
      ...c,
      id: `ch-${Date.now()}-${i}`,
      completedDays: 1,
      streakDays: 1,
    })),
    stats: {
      totalCleanDays: 1,
      consistencyPercentage: 100,
      moneySaved: 0,
      hoursSaved: 0,
    },
  };

  accounts.push(newAcc);
  saveRegisteredAccounts(accounts);
  return newAcc;
}

// Active session helpers
export function getActiveSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function saveActiveSession(account: UserAccount): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(account));
  } catch {}
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

// Onboarding status helpers
export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {}
  return false;
}

export function setOnboardingCompleted(completed: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, String(completed));
  } catch {}
}
