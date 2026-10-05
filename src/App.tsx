import React, { useState, useEffect } from 'react';
import { Habit, HabitTemplate, ChallengeItem, AppNotification, NotificationAction } from './types';
import { INITIAL_HABITS } from './data/initialData';
import { INITIAL_CHALLENGES } from './data/initialChallenges';
import { getInitialNotifications } from './data/initialNotifications';
import { HomeFeed } from './components/HomeFeed';
import { HabitDetail } from './components/HabitDetail';
import { ChallengesView } from './components/ChallengesView';
import { TherapyView } from './components/TherapyView';
import { BottomNav } from './components/BottomNav';
import { SOSBreathingModal } from './components/SOSBreathingModal';
import { SlipModal } from './components/SlipModal';
import { CreateHabitModal } from './components/CreateHabitModal';
import { CreateChallengeModal } from './components/CreateChallengeModal';
import { NeuroInsightsModal } from './components/NeuroInsightsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileView } from './components/ProfileView';
import { OfflineBanner } from './components/OfflineBanner';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Toast, ToastMessage } from './components/Toast';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AuthScreen } from './components/AuthScreen';
import {
  UserAccount,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  isOnboardingCompleted,
  setOnboardingCompleted,
  DEMO_ACCOUNTS,
} from './data/accountsData';
import { generateCurrentWeekLog } from './utils/weekGenerator';
import { calculateCleanTime } from './utils/timeFormat';
import { convertChallengeToHabit } from './utils/challengeBridge';

const STORAGE_KEY = 'habitflow_deshabit_v3';
const ACTIVE_HABIT_KEY = 'habitflow_active_habit_v3';
const CHALLENGES_STORAGE_KEY = 'habitflow_challenges_v1';
const NOTIFICATIONS_STORAGE_KEY = 'deshabit_notifications_v1';

export default function App() {
  // Primary Habits State
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((h: Habit) => {
            const initial = INITIAL_HABITS.find((ih) => ih.id === h.id);
            const fallbackIcon =
              h.id === 'habit-azucar' ? 'nutrition' :
              h.id === 'habit-redes' ? 'devices' :
              h.id === 'habit-compras' ? 'account_balance_wallet' :
              h.id === 'habit-cero-cigarrillo' ? 'smoke_free' : 'star';

            return {
              ...initial,
              ...h,
              icon: h.icon || initial?.icon || fallbackIcon,
            };
          });
        }
      }
    } catch {
      // Ignore
    }
    return INITIAL_HABITS;
  });

  // Challenges State (Catálogo e Historial de Desafíos)
  const [challenges, setChallenges] = useState<ChallengeItem[]>(() => {
    try {
      const saved = localStorage.getItem(CHALLENGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Storage quota or parsing error
    }
    return INITIAL_CHALLENGES;
  });

  // Notifications State (Centro de actividad)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Storage quota or parsing error
    }
    return getInitialNotifications(habits);
  });

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Current view: 'home' | 'detail' | 'challenges' | 'therapy' | 'profile'
  const [viewMode, setViewMode] = useState<'home' | 'detail' | 'challenges' | 'therapy' | 'profile'>('home');
  const [previousView, setPreviousView] = useState<'home' | 'challenges' | 'therapy' | 'profile'>('home');
  const [selectedChallengeHabit, setSelectedChallengeHabit] = useState<Habit | null>(null);

  const [activeHabitId, setActiveHabitId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_HABIT_KEY);
      if (savedId && habits.some((h) => h.id === savedId)) return savedId;
    } catch {
      // Ignore
    }
    return habits[0]?.id || 'habit-azucar';
  });

  // Target habit for slip reporting (can be opened from list card or detail)
  const [targetSlipHabit, setTargetSlipHabit] = useState<Habit | null>(null);

  // Live timestamp updated every 1000ms
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  // Core Edge Cases states
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isRetryingOffline, setIsRetryingOffline] = useState<boolean>(false);
  const [isLoadingSimulated, setIsLoadingSimulated] = useState<boolean>(false);

  // Modals state
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isProPaymentModalOpen, setIsProPaymentModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplateForCreate, setSelectedTemplateForCreate] = useState<HabitTemplate | null>(null);
  const [isNeuroModalOpen, setIsNeuroModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User Authentication & Session States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getActiveSession();
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !isOnboardingCompleted();
  });
  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState<boolean>(false);
  const [authScreenMode, setAuthScreenMode] = useState<'login' | 'register' | 'switch-account'>('login');

  // Settings & Preferences States
  const [currencyPreference, setCurrencyPreference] = useState<'CLP' | 'USD'>(() => {
    try {
      const saved = localStorage.getItem('deshabit_currency');
      if (saved === 'USD' || saved === 'CLP') return saved;
    } catch {}
    return 'CLP';
  });

  const [isPinLockEnabled, setIsPinLockEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('deshabit_pin_enabled') === 'true';
    } catch {}
    return false;
  });

  const [pinCode, setPinCode] = useState<string>(() => {
    try {
      return localStorage.getItem('deshabit_pin_code') || '1234';
    } catch {}
    return '1234';
  });

  const [isAppBlockerEnabled, setIsAppBlockerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('deshabit_app_blocker_enabled');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [blockedApps, setBlockedApps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deshabit_blocked_apps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['instagram', 'tiktok', 'x', 'youtube'];
  });

  const [isNonPunitiveMode, setIsNonPunitiveMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('deshabit_non_punitive');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [isMorningAlertEnabled, setIsMorningAlertEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('deshabit_morning_alert');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [morningTime, setMorningTime] = useState<string>(() => {
    try {
      return localStorage.getItem('deshabit_morning_time') || '08:00 AM';
    } catch {}
    return '08:00 AM';
  });

  const [isNightShieldEnabled, setIsNightShieldEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('deshabit_night_shield');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [nightShieldRange, setNightShieldRange] = useState<{ start: string; end: string }>(() => {
    try {
      const saved = localStorage.getItem('deshabit_night_range');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { start: '22:00', end: '02:00' };
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('deshabit_currency', currencyPreference);
      localStorage.setItem('deshabit_pin_enabled', String(isPinLockEnabled));
      localStorage.setItem('deshabit_pin_code', pinCode);
      localStorage.setItem('deshabit_app_blocker_enabled', String(isAppBlockerEnabled));
      localStorage.setItem('deshabit_blocked_apps', JSON.stringify(blockedApps));
      localStorage.setItem('deshabit_non_punitive', String(isNonPunitiveMode));
      localStorage.setItem('deshabit_morning_alert', String(isMorningAlertEnabled));
      localStorage.setItem('deshabit_morning_time', morningTime);
      localStorage.setItem('deshabit_night_shield', String(isNightShieldEnabled));
      localStorage.setItem('deshabit_night_range', JSON.stringify(nightShieldRange));
    } catch {}
  }, [
    currencyPreference,
    isPinLockEnabled,
    pinCode,
    isAppBlockerEnabled,
    blockedApps,
    isNonPunitiveMode,
    isMorningAlertEnabled,
    morningTime,
    isNightShieldEnabled,
    nightShieldRange,
  ]);

  // Discrete toast message
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch {
      // Storage quota or iframe constraints
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
    } catch {
      // Storage quota
    }
  }, [challenges]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Storage quota
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_HABIT_KEY, activeHabitId);
    } catch {
      // Storage quota
    }
  }, [activeHabitId]);

  // Live timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast auto-dismissal
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => {
      setToast(null);
    }, 4200);
    return () => clearTimeout(timeout);
  }, [toast]);

  // Find active habit (either regular habit or converted challenge habit)
  const currentHabit: Habit =
    selectedChallengeHabit && selectedChallengeHabit.id === activeHabitId
      ? selectedChallengeHabit
      : habits.find((h) => h.id === activeHabitId) ||
        (challenges.some((c) => c.id === activeHabitId)
          ? convertChallengeToHabit(challenges.find((c) => c.id === activeHabitId)!, currentTimestamp)
          : habits[0]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Action: Select habit and open detail from Home
  const handleSelectHabit = (habit: Habit) => {
    setSelectedChallengeHabit(null);
    setActiveHabitId(habit.id);
    setPreviousView('home');
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Select challenge and open detail from Challenges
  const handleSelectChallenge = (challenge: ChallengeItem) => {
    const habitRep = convertChallengeToHabit(challenge, currentTimestamp);
    setSelectedChallengeHabit(habitRep);
    setActiveHabitId(challenge.id);
    setPreviousView('challenges');
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Notifications: register user activity in the notification center
  const pushNotification = (
    data: Omit<AppNotification, 'id' | 'timestamp' | 'isRead' | 'origin'> &
      Partial<Pick<AppNotification, 'origin'>>
  ) => {
    const now = Date.now();
    const newNotification: AppNotification = {
      origin: 'activity',
      ...data,
      id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now,
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id && !n.isRead ? { ...n, isRead: true } : n)));
  };

  const handleMarkNotificationUnread = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id && n.isRead ? { ...n, isRead: false } : n)));
  };

  const handleMarkAllNotificationsRead = () => {
    if (unreadNotificationsCount === 0) return;
    const count = unreadNotificationsCount;
    setNotifications((prev) => prev.map((n) => (n.isRead ? n : { ...n, isRead: true })));
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Todo al día',
      description: `${count} ${count === 1 ? 'notificación marcada' : 'notificaciones marcadas'} como leídas.`,
    });
  };

  const handleNotificationAction = (action: NotificationAction) => {
    setIsNotificationsOpen(false);

    switch (action.type) {
      case 'habit': {
        const habit = habits.find((h) => h.id === action.targetId);
        const challenge = challenges.find((c) => c.id === action.targetId);
        if (habit) {
          handleSelectHabit(habit);
        } else if (challenge) {
          handleSelectChallenge(challenge);
        } else {
          setViewMode('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setToast({
            id: String(Date.now()),
            type: 'info',
            title: 'Hábito no disponible',
            description: 'Este hábito ya no está en tu cuenta. Te llevamos al inicio.',
          });
        }
        break;
      }
      case 'challenges':
      case 'therapy':
      case 'profile':
        setViewMode(action.type);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'sos':
        setIsSOSModalOpen(true);
        break;
    }
  };

  // Action: Confirm or toggle clean day (handles both 'Registrar día' and 'Completado')
  const handleToggleCleanDay = (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;

    const isAlreadyCompletedToday = target.lastCleanDayConfirmedDate === todayStr;

    if (isAlreadyCompletedToday) {
      // Revert completion for today
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newCleanCount = Math.max(0, target.cleanDaysCount - 1);
      const updatedWeek = generateCurrentWeekLog(
        target.slips.map((s) => s.timestamp),
        newCleanCount
      );

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              cleanDaysCount: newCleanCount,
              lastCleanDayConfirmedDate: yesterday,
              weeklyLog: updatedWeek,
            };
          }
          return h;
        })
      );

      setToast({
        id: String(Date.now()),
        type: 'info',
        title: 'Registro revertido',
        description: `Has retirado la confirmación de hoy para "${target.title}". Puedes volver a registrarla en cualquier momento.`,
      });
    } else {
      // Confirm clean day for today
      const newCleanCount = target.cleanDaysCount + 1;
      const updatedWeek = generateCurrentWeekLog(
        target.slips.map((s) => s.timestamp),
        newCleanCount
      );

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              cleanDaysCount: newCleanCount,
              lastCleanDayConfirmedDate: todayStr,
              weeklyLog: updatedWeek,
            };
          }
          return h;
        })
      );

      setToast({
        id: String(Date.now()),
        type: 'success',
        title: 'Día limpio consolidado (+1)',
        description: `¡Día asegurado para "${target.title}"! Plasticidad sináptica en crecimiento constante.`,
      });

      pushNotification({
        kind: 'clean_day',
        title: 'Día limpio consolidado',
        summary: `Registraste el día ${newCleanCount} en "${target.title}". La racha sigue creciendo.`,
        body: `Confirmaste un nuevo día limpio en "${target.title}" y ya acumulas ${newCleanCount} ${newCleanCount === 1 ? 'día' : 'días'}. Cada registro refuerza los circuitos de autocontrol y reduce la intensidad del impulso en los próximos días.`,
        habitId: target.id,
        action: { type: 'habit', targetId: target.id, label: 'Ver hábito' },
      });
    }
  };

  const handleConfirmCleanDay = (habitId: string) => {
    handleToggleCleanDay(habitId);
  };

  // Action: Open slip modal for specific habit
  const handleOpenSlipModal = (habit: Habit) => {
    setTargetSlipHabit(habit);
    setIsSlipModalOpen(true);
  };

  // Action: Submit slip non-punitively
  const handleSubmitSlip = (trigger: string, notes?: string, intensity: 'leve' | 'moderada' | 'aguda' = 'moderada') => {
    const habitToUpdate = targetSlipHabit || currentHabit;
    if (!habitToUpdate) return;

    const cleanTime = calculateCleanTime(habitToUpdate.startedAt, currentTimestamp);
    const intervalDays = cleanTime.totalDays;

    const newSlip = {
      id: `slip-${Date.now()}`,
      timestamp: Date.now(),
      trigger,
      intervalBeforeSlipDays: intervalDays,
      notes,
      intensity,
    };

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitToUpdate.id) {
          const updatedSlips = [...h.slips, newSlip];
          const updatedHistorical = [...h.historicalIntervalsDays, intervalDays];
          return {
            ...h,
            startedAt: Date.now(), // Stopwatch restarts without moral guilt
            slips: updatedSlips,
            historicalIntervalsDays: updatedHistorical,
            weeklyLog: generateCurrentWeekLog(updatedSlips.map((s) => s.timestamp), h.cleanDaysCount),
          };
        }
        return h;
      })
    );

    setToast({
      id: String(Date.now()),
      type: 'info',
      title: 'Recaída registrada sin juicio moral',
      description: `Causa (${trigger}) guardada. El 94% de tus vías neuronales preservan su mielinización.`,
    });

    pushNotification({
      kind: 'slip',
      title: 'Recaída registrada sin juicio',
      summary: `Guardaste una recaída en "${habitToUpdate.title}" (${trigger}). Tu progreso neuronal se conserva.`,
      body: `Registraste una recaída en "${habitToUpdate.title}" con el disparador "${trigger}" e intensidad ${intensity}. El cronómetro se reinició, pero los ${Math.floor(intervalDays)} días previos siguen contando en tu historial: la mayoría de las vías neuronales que construiste se mantienen. Revisar el disparador en el diario te ayuda a anticiparlo la próxima vez.`,
      habitId: habitToUpdate.id,
      action: { type: 'habit', targetId: habitToUpdate.id, label: 'Revisar hábito' },
    });
  };

  // Action: Add reflection note to journal
  const handleAddReflection = (habitId: string, text: string) => {
    const newRef = {
      id: `ref-${Date.now()}`,
      timestamp: Date.now(),
      text,
    };

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            reflections: [newRef, ...h.reflections],
          };
        }
        return h;
      })
    );

    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Reflexión registrada en el diario',
      description: 'El registro metacognitivo acelera el desapego del impulso automático.',
    });

    const reflectedHabit = habits.find((h) => h.id === habitId);
    pushNotification({
      kind: 'reflection',
      title: 'Reflexión guardada en tu diario',
      summary: reflectedHabit
        ? `Tu nota quedó registrada en el diario de "${reflectedHabit.title}".`
        : 'Tu nota quedó registrada en el diario.',
      body: `"${text}"\n\nEl registro metacognitivo te ayuda a reconocer patrones y a separar el impulso automático de la decisión consciente.`,
      habitId,
      action: { type: 'habit', targetId: habitId, label: 'Abrir diario del hábito' },
    });
  };

  // Action: Create habit
  const handleCreateHabit = (data: {
    title: string;
    category: 'Salud' | 'Foco' | 'Digital' | 'Finanzas';
    triggerDescription: string;
    targetDays: number;
    initialCleanHours?: number;
  }) => {
    const hoursOffsetMs = (data.initialCleanHours || 0) * 3600 * 1000;
    const initialStartedAt = Date.now() - hoursOffsetMs;
    const initialCleanDays = Math.floor((data.initialCleanHours || 0) / 24);

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: data.title,
      category: data.category,
      challengeMode: 'Modo Desafío',
      phase: 'Fase 1 / Rigor',
      triggerDescription: data.triggerDescription,
      startedAt: initialStartedAt,
      targetDays: data.targetDays || 50,
      cleanDaysCount: initialCleanDays,
      historicalIntervalsDays: [2.5],
      slips: [],
      reflections: [],
      savings: {
        moneyPerDay: data.category === 'Finanzas' ? 12 : data.category === 'Salud' ? 4 : 0,
        minutesPerDay: 45,
        currency: '€',
      },
      cognitiveReinforcement: 'Fase inicial: La corteza prefrontal dorsolateral ejerce resistencia activa ante el impulso.',
      weeklyLog: generateCurrentWeekLog([], initialCleanDays),
    };

    setHabits((prev) => [newHabit, ...prev]);

    // Synchronize to challenges list
    const challengeCategory: ChallengeItem['category'] =
      data.category === 'Salud'
        ? 'health'
        : data.category === 'Finanzas'
        ? 'finance'
        : data.category === 'Digital'
        ? 'digital'
        : 'foco';

    const newChallenge: ChallengeItem = {
      id: newHabit.id,
      title: newHabit.title,
      subtitle: `En progreso · Día ${initialCleanDays} de ${data.targetDays}`,
      category: challengeCategory,
      status: 'active',
      icon: data.category === 'Finanzas' ? 'savings' : data.category === 'Salud' ? 'self_improvement' : 'mindfulness',
      progressText: `${initialCleanDays} de ${data.targetDays} días`,
      progressPercentage: Math.min(100, Math.round((initialCleanDays / (data.targetDays || 50)) * 100)),
      totalDays: data.targetDays || 50,
      completedDays: initialCleanDays,
      notes: data.triggerDescription,
    };
    setChallenges((prev) => [newChallenge, ...prev]);

    setActiveHabitId(newHabit.id);
    setPreviousView('home');
    setViewMode('detail');

    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Desafío activado en vivo',
      description: `Cuantificador en vivo activo para "${newHabit.title}".`,
    });

    pushNotification({
      kind: 'challenge',
      title: 'Nuevo desafío en curso',
      summary: `Activaste "${newHabit.title}". El cuantificador en vivo ya está corriendo.`,
      body: `Activaste el desafío "${newHabit.title}" con una meta de ${newHabit.targetDays} días. El cuantificador en vivo registra tu tiempo limpio desde ahora.`,
      habitId: newHabit.id,
      action: { type: 'habit', targetId: newHabit.id, label: 'Ver desafío' },
    });
  };

  // Action: Select template from EmptyState
  const handleSelectTemplateFromEmpty = (tmpl: HabitTemplate) => {
    setSelectedTemplateForCreate(tmpl);
    setIsCreateModalOpen(true);
  };

  // Action: Retry offline connection
  const handleRetryOffline = () => {
    setIsRetryingOffline(true);
    setTimeout(() => {
      setIsRetryingOffline(false);
      setIsOffline(false);
      setToast({
        id: String(Date.now()),
        type: 'success',
        title: 'Conexión restablecida',
        description: 'Sincronizado con almacenamiento SQLite local y estado de red activo.',
      });
    }, 1200);
  };

  // Action: Add new challenge
  const handleAddChallenge = (challengeData: Omit<ChallengeItem, 'id'>) => {
    const newChallenge: ChallengeItem = {
      ...challengeData,
      id: `ch-${Date.now()}`,
    };
    setChallenges((prev) => [newChallenge, ...prev]);

    // Also register in habits list so it has full detail support
    const newHabit = convertChallengeToHabit(newChallenge, Date.now());
    setHabits((prev) => [newHabit, ...prev]);

    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Desafío activado con éxito',
      description: `Has iniciado el protocolo disciplinario "${newChallenge.title}".`,
    });

    pushNotification({
      kind: 'challenge',
      title: 'Nuevo desafío en curso',
      summary: `Activaste "${newChallenge.title}". Ya puedes seguir su progreso en Desafíos.`,
      body: `Iniciaste el protocolo "${newChallenge.title}". Revisa su avance, tu racha y el ahorro acumulado en la sección Desafíos.`,
      habitId: newHabit.id,
      action: { type: 'habit', targetId: newHabit.id, label: 'Ver desafío' },
    });
  };

  // Action: Reset default data
  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_HABIT_KEY);
    localStorage.removeItem(CHALLENGES_STORAGE_KEY);
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    setHabits(INITIAL_HABITS);
    setChallenges(INITIAL_CHALLENGES);
    setNotifications(getInitialNotifications(INITIAL_HABITS));
    setActiveHabitId(INITIAL_HABITS[0].id);
    setViewMode('home');
    setToast({
      id: String(Date.now()),
      type: 'info',
      title: 'Datos restaurados a valores de muestra',
      description: 'Cuatro desafíos precargados con métricas científicas y registros históricos.',
    });
  };

  // Action: Handle Login Success with Account Data Loading
  const handleLoginSuccess = (user: UserAccount) => {
    saveActiveSession(user);
    setCurrentUser(user);
    setHabits(user.habits);
    setChallenges(user.challenges);
    setNotifications(getInitialNotifications(user.habits));
    setCurrencyPreference(user.currency);
    if (user.habits.length > 0) {
      setActiveHabitId(user.habits[0].id);
    }
    setOnboardingCompleted(true);
    setIsOnboardingOpen(false);
    setIsAuthScreenOpen(false);
    setViewMode('home');
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: `¡Bienvenido, ${user.name.split(' ')[0]}!`,
      description: `Bóveda sincronizada: ${user.streakHeadline}.`,
    });
  };

  // Action: Handle Logout
  const handleLogout = () => {
    clearActiveSession();
    setCurrentUser(null);
    setIsOnboardingOpen(true);
    setIsAuthScreenOpen(false);
    setToast({
      id: String(Date.now()),
      type: 'info',
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión. Puedes ingresar con otra cuenta o usar el pre-completado.',
    });
  };

  // Action: Handle Switch Account (Pantalla completa sin modal ni nav-bar)
  const handleOpenSwitchAccount = () => {
    setAuthScreenMode('switch-account');
    setIsAuthScreenOpen(true);
  };

  // 1. Pantalla completa: Onboarding Flow Interactivo Integrado de 5 Pasos (Sin nav-bar)
  if (isOnboardingOpen || (!currentUser && !isAuthScreenOpen)) {
    return (
      <div className="w-full min-h-screen bg-[#F9F9FA]">
        <OnboardingFlow
          onLoginSuccess={handleLoginSuccess}
          currencyPreference={currencyPreference}
          onFinishOnboarding={() => {
            setOnboardingCompleted(true);
            setIsOnboardingOpen(false);
          }}
          onOpenLogin={() => {
            setIsAuthScreenOpen(true);
          }}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    );
  }

  // 2. Pantalla completa: Inicio de Sesión o Cambiar Cuenta (Pantalla completa, NO modal, SIN nav-bar)
  if (!currentUser || isAuthScreenOpen) {
    return (
      <div className="w-full min-h-screen bg-[#F9F9FA]">
        <AuthScreen
          initialMode={authScreenMode}
          activeUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onCancel={
            currentUser
              ? () => {
                  setIsAuthScreenOpen(false);
                }
              : undefined
          }
          onSwitchToOnboarding={() => {
            setIsAuthScreenOpen(false);
            setIsOnboardingOpen(true);
          }}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9F9FA] text-[#09090B] flex flex-col items-center selection:bg-[#FF5A00] selection:text-white">
      {/* Viewport Mobile Standard: 358px content on 390px viewport */}
      <main className="w-full max-w-[390px] pt-4 pb-24 px-4 bg-[#F9F9FA] flex flex-col items-center">
        <div className="w-full max-w-[358px] flex flex-col select-none">
          {/* Offline Banner / Alert */}
          {isOffline && (
            <OfflineBanner
              isOffline={isOffline}
              onRetry={handleRetryOffline}
              isRetrying={isRetryingOffline}
            />
          )}

          {/* Skeleton Loader or View Content */}
          {isLoadingSimulated ? (
            <SkeletonLoader />
          ) : viewMode === 'profile' ? (
            <ProfileView
              habits={habits}
              challenges={challenges}
              currencyPreference={currencyPreference}
              currentUser={currentUser}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationsCount={unreadNotificationsCount}
              isProModalOpen={isProPaymentModalOpen}
              onSetProModalOpen={setIsProPaymentModalOpen}
              onOpenProModal={() => {
                setIsProPaymentModalOpen(true);
              }}
              onShowToast={(title, description) => {
                setToast({
                  id: String(Date.now()),
                  type: 'info',
                  title,
                  description,
                });
              }}
              onOpenAuthModal={handleOpenSwitchAccount}
              onOpenSwitchAccount={handleOpenSwitchAccount}
              onLogout={handleLogout}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          ) : viewMode === 'challenges' ? (
            <ChallengesView
              challenges={challenges}
              onSelectChallenge={handleSelectChallenge}
              onAddChallenge={handleAddChallenge}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationsCount={unreadNotificationsCount}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
              }}
              currencyPreference={currencyPreference}
            />
          ) : viewMode === 'therapy' ? (
            <TherapyView
              onStartBreathing={() => setIsSOSModalOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationsCount={unreadNotificationsCount}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
              }}
              onShowToast={(title, description) => {
                setToast({
                  id: String(Date.now()),
                  type: 'info',
                  title,
                  description,
                });
              }}
              isProModalOpen={isProPaymentModalOpen}
              onSetProModalOpen={setIsProPaymentModalOpen}
            />
          ) : viewMode === 'home' ? (
            <HomeFeed
              habits={habits}
              currentTimestamp={currentTimestamp}
              userName={currentUser?.name}
              totalStreakDays={currentUser?.stats?.totalCleanDays}
              onSelectHabit={handleSelectHabit}
              onConfirmCleanDay={handleConfirmCleanDay}
              onToggleCleanDay={handleToggleCleanDay}
              onOpenSlipModalForHabit={handleOpenSlipModal}
              onOpenCreateModal={() => {
                setSelectedTemplateForCreate(null);
                setIsCreateModalOpen(true);
              }}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
              }}
              onOpenNeuroModal={() => setIsNeuroModalOpen(true)}
              unreadNotificationsCount={unreadNotificationsCount}
            />
          ) : currentHabit ? (
            <HabitDetail
              habit={currentHabit}
              currentTimestamp={currentTimestamp}
              onBack={() => setViewMode(previousView)}
              backLabel={previousView === 'challenges' ? 'Desafíos' : previousView === 'therapy' ? 'Terapia' : previousView === 'profile' ? 'Perfil' : 'Inicio'}
              onOpenSOSModal={() => setIsSOSModalOpen(true)}
              onOpenSlipModal={() => handleOpenSlipModal(currentHabit)}
              onOpenNeuroModal={() => setIsNeuroModalOpen(true)}
              onAddReflection={handleAddReflection}
            />
          ) : null}
        </div>
      </main>

      {/* Fixed Bottom Navigation - siempre visible para permitir navegar entre secciones */}
      <BottomNav
        activeTab={
          viewMode === 'profile'
            ? 'profile'
            : viewMode === 'therapy'
            ? 'therapy'
            : viewMode === 'challenges' || (viewMode === 'detail' && previousView === 'challenges')
            ? 'challenges'
            : 'home'
        }
        onNavigateHome={() => {
          setIsProPaymentModalOpen(false);
          setIsSOSModalOpen(false);
          setIsSettingsOpen(false);
          setIsCreateModalOpen(false);
          setIsNeuroModalOpen(false);
          setIsNotificationsOpen(false);
          setIsSlipModalOpen(false);
          setViewMode('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateChallenges={() => {
          setIsProPaymentModalOpen(false);
          setIsSOSModalOpen(false);
          setIsSettingsOpen(false);
          setIsCreateModalOpen(false);
          setIsNeuroModalOpen(false);
          setIsNotificationsOpen(false);
          setIsSlipModalOpen(false);
          setViewMode('challenges');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTriggerTherapy={() => {
          setIsProPaymentModalOpen(false);
          setIsSOSModalOpen(false);
          setIsSettingsOpen(false);
          setIsCreateModalOpen(false);
          setIsNeuroModalOpen(false);
          setIsNotificationsOpen(false);
          setIsSlipModalOpen(false);
          setViewMode('therapy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => {
          setIsProPaymentModalOpen(false);
          setIsSOSModalOpen(false);
          setIsSettingsOpen(false);
          setIsCreateModalOpen(false);
          setIsNeuroModalOpen(false);
          setIsNotificationsOpen(false);
          setIsSlipModalOpen(false);
          setViewMode('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <SOSBreathingModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onComplete={() => {
          setToast({
            id: String(Date.now()),
            type: 'info',
            title: 'Protocolo vagal de 60s completado',
            description: 'El pico agudo de dopamina fásica se ha atenuado mediante estimulación parasimpática.',
          });
        }}
      />

      <SlipModal
        isOpen={isSlipModalOpen}
        habit={targetSlipHabit || currentHabit}
        onClose={() => setIsSlipModalOpen(false)}
        onSubmitSlip={handleSubmitSlip}
      />

      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedTemplateForCreate(null);
        }}
        onAddChallenge={handleAddChallenge}
        currencyPreference={currencyPreference}
      />

      <NeuroInsightsModal
        isOpen={isNeuroModalOpen}
        onClose={() => setIsNeuroModalOpen(false)}
        currentDays={
          currentHabit ? calculateCleanTime(currentHabit.startedAt, currentTimestamp).totalDays : 0
        }
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        habits={habits}
        currentTimestamp={currentTimestamp}
        onMarkRead={handleMarkNotificationRead}
        onMarkUnread={handleMarkNotificationUnread}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onAction={handleNotificationAction}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        isLoadingSimulated={isLoadingSimulated}
        onToggleLoading={() => setIsLoadingSimulated(!isLoadingSimulated)}
        currencyPreference={currencyPreference}
        onSetCurrencyPreference={setCurrencyPreference}
        isPinLockEnabled={isPinLockEnabled}
        onTogglePinLock={setIsPinLockEnabled}
        pinCode={pinCode}
        onSetPinCode={setPinCode}
        isAppBlockerEnabled={isAppBlockerEnabled}
        onToggleAppBlocker={setIsAppBlockerEnabled}
        blockedApps={blockedApps}
        onSetBlockedApps={setBlockedApps}
        isNonPunitiveMode={isNonPunitiveMode}
        onToggleNonPunitiveMode={setIsNonPunitiveMode}
        isMorningAlertEnabled={isMorningAlertEnabled}
        onToggleMorningAlert={setIsMorningAlertEnabled}
        morningTime={morningTime}
        onSetMorningTime={setMorningTime}
        isNightShieldEnabled={isNightShieldEnabled}
        onToggleNightShield={setIsNightShieldEnabled}
        nightShieldRange={nightShieldRange}
        onSetNightShieldRange={setNightShieldRange}
        onShowToast={(title, description) => {
          setToast({
            id: String(Date.now()),
            type: 'info',
            title,
            description,
          });
        }}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
