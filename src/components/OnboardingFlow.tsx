import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  UserAccount,
  findAccountByEmail,
  updateAccountPassword,
  registerNewAccount,
} from '../data/accountsData';
import { Habit, ChallengeItem } from '../types';
import { generateCurrentWeekLog } from '../utils/weekGenerator';

export interface OnboardingFlowProps {
  onLoginSuccess: (user: UserAccount) => void;
  onFinishOnboarding?: () => void;
  onOpenLogin?: () => void;
  currencyPreference?: 'CLP' | 'USD';
}

// -------------------------------------------------------------
// STEP 1: TUTORIAL DATA & SLIDES
// -------------------------------------------------------------
interface SlideItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  type: 'neuro' | 'timer' | 'challenges' | 'vagal';
}

const SLIDES: SlideItem[] = [
  {
    id: 'slide-neuro',
    category: 'NEUROBIOLOGÍA COGNITIVA',
    title: 'Deshabituación sin juicio moral',
    subtitle: 'Tus vías neuronales preservan su mielina y resiliencia',
    description:
      'A diferencia de métodos tradicionales que castigan el error a cero, la metodología se basa en la neuroplasticidad. Un desliz no reinicia tu cerebro; tu biología acumula resiliencia con cada día limpio.',
    badge: 'Sin Reinicio Punitivo',
    icon: 'psychology',
    type: 'neuro',
  },
  {
    id: 'slide-timer',
    category: 'CUANTIFICACIÓN DE VIDA',
    title: 'Cronómetro vivo y ahorro real',
    subtitle: 'Mide cada segundo y cada recurso recuperado',
    description:
      'Calcula en tiempo real las horas de enfoque rescatadas y el capital evitado en sustancias o compras compulsivas. Tu constancia se traduce en números tangibles.',
    badge: 'Métricas Reales',
    icon: 'timelapse',
    type: 'timer',
  },
  {
    id: 'slide-challenges',
    category: 'ARQUITECTURA DE DISCIPLINA',
    title: 'Desafíos Récord y Modo Libre',
    subtitle: 'Metas a tu medida o modo continuo de por vida',
    description:
      'Elige hitos clásicos de 7, 21 o 50 días para consolidar nuevas sinapsis. Y si ya habías comenzado tu disciplina, registra tu racha previa sin perder tu progreso.',
    badge: 'Flexibilidad Total',
    icon: 'military_tech',
    type: 'challenges',
  },
  {
    id: 'slide-vagal',
    category: 'NEUROQUÍMICA DE RESCATE',
    title: 'Protocolo SOS Vagal en 60s',
    subtitle: 'Disipa el pico agudo de urgencia biológica',
    description:
      'Cuando el impulso sea abrumador, activa el SOS. Un ciclo diafragmático 4-7-8 con estimulación vagal calma la amígdala y modula la dopamina fásica en un minuto.',
    badge: 'Respuesta Anti-Craving',
    icon: 'air',
    type: 'vagal',
  },
];

// -------------------------------------------------------------
// STEP 2: HABIT CHOICES CATALOG (MATERIAL SYMBOLS)
// -------------------------------------------------------------
interface HabitChoice {
  id: string;
  title: string;
  category: 'Salud' | 'Foco' | 'Digital' | 'Finanzas';
  icon: string;
  impactTag: string;
  defaultTimeLossMin: number;
  defaultMoneyLossCLP: number;
  defaultMoneyLossUSD: number;
  scientificContext: string;
}

const HABIT_CHOICES: HabitChoice[] = [
  {
    id: 'habit-azucar',
    title: 'Azúcar Refinada & Comida Chatarra',
    category: 'Salud',
    icon: 'nutrition',
    impactTag: 'Picos de glucosa y fatiga cognitiva',
    defaultTimeLossMin: 30,
    defaultMoneyLossCLP: 4500,
    defaultMoneyLossUSD: 5,
    scientificContext: 'La hiperactivación estriatal se estabiliza tras 7 días sin sobrecarga de glucosa libre.',
  },
  {
    id: 'habit-doomscrolling',
    title: 'Doomscrolling en Redes Sociales',
    category: 'Digital',
    icon: 'smartphone',
    impactTag: 'Fragmentación de foco y fatiga visual',
    defaultTimeLossMin: 90,
    defaultMoneyLossCLP: 0,
    defaultMoneyLossUSD: 0,
    scientificContext: 'Los estímulos intermitentes saturan la corteza prefrontal e impiden el descanso reparador.',
  },
  {
    id: 'habit-tabaco',
    title: 'Tabaco / Vapeo / Nicotina',
    category: 'Salud',
    icon: 'smoke_free',
    impactTag: 'Dependencia de receptores nicotínicos',
    defaultTimeLossMin: 45,
    defaultMoneyLossCLP: 6500,
    defaultMoneyLossUSD: 8,
    scientificContext: 'Los receptores nicotínicos α4β2 inician su reensamblaje funcional a las 72 horas.',
  },
  {
    id: 'habit-alcohol',
    title: 'Alcohol y Tragos Sociales',
    category: 'Salud',
    icon: 'no_drinks',
    impactTag: 'Supresión de fase REM y desbalance GABA',
    defaultTimeLossMin: 60,
    defaultMoneyLossCLP: 12000,
    defaultMoneyLossUSD: 14,
    scientificContext: 'La arquitectura del sueño profundo y la claridad mental se restauran desde el día 14.',
  },
  {
    id: 'habit-compras',
    title: 'Compras Impulsivas Online',
    category: 'Finanzas',
    icon: 'shopping_bag',
    impactTag: 'Fuga silenciosa de capital y sobreestimulación',
    defaultTimeLossMin: 40,
    defaultMoneyLossCLP: 18000,
    defaultMoneyLossUSD: 20,
    scientificContext: 'La descarga de dopamina ocurre durante la búsqueda del producto, no al poseerlo.',
  },
  {
    id: 'habit-porno',
    title: 'Pornografía / Contenido Adulto',
    category: 'Foco',
    icon: 'psychology',
    impactTag: 'Sobrestimulación y desensibilización D2',
    defaultTimeLossMin: 45,
    defaultMoneyLossCLP: 0,
    defaultMoneyLossUSD: 0,
    scientificContext: 'La neurogénesis hipocámpica y la sensibilidad a recompensas naturales aumentan a los 21 días.',
  },
  {
    id: 'habit-procrastinacion',
    title: 'Procrastinación & Multitarea Crónica',
    category: 'Foco',
    icon: 'hourglass_disabled',
    impactTag: 'Residuo atencional y pérdida de enfoque profundo',
    defaultTimeLossMin: 90,
    defaultMoneyLossCLP: 0,
    defaultMoneyLossUSD: 0,
    scientificContext: 'Cada salto de atención involuntario deja hasta 23 minutos de residuo cognitivo.',
  },
  {
    id: 'habit-juegos',
    title: 'Videojuegos Compulsivos',
    category: 'Digital',
    icon: 'sports_esports',
    impactTag: 'Sesiones prolongadas sin pausas de descanso',
    defaultTimeLossMin: 120,
    defaultMoneyLossCLP: 4000,
    defaultMoneyLossUSD: 5,
    scientificContext: 'La regulación circadiana y los niveles basales de dopamina se equilibran al fijar límites estrictos.',
  },
];

// -------------------------------------------------------------
// STEP 3: CHALLENGE DURATION OPTIONS
// -------------------------------------------------------------
interface RecordDurationOption {
  days: number;
  label: string;
  badge: string;
  isInfinite?: boolean;
}

const RECORD_OPTIONS: RecordDurationOption[] = [
  { days: 7, label: '7 Días', badge: 'Superación de fricción inicial' },
  { days: 21, label: '21 Días', badge: 'Reestructuración sináptica y neurogénesis' },
  { days: 30, label: '30 Días', badge: 'Mielinización axonal progresiva' },
  { days: 50, label: '50 Días (Recomendado)', badge: 'Consolidación de hábito permanente' },
  { days: 999, label: '∞ Modo Infinito', badge: 'Racha continua sin límite artificial', isInfinite: true },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onLoginSuccess,
  currencyPreference = 'CLP',
}) => {
  // Current Step (1..5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // -------------------------------------------------------------
  // STEP 1 STATE: Tutorial slides
  // -------------------------------------------------------------
  const [slideIndex, setSlideIndex] = useState(0);
  const currentSlide = SLIDES[slideIndex];

  // -------------------------------------------------------------
  // STEP 2 STATE: Habit selection
  // -------------------------------------------------------------
  const [selectedHabitId, setSelectedHabitId] = useState<string>(HABIT_CHOICES[0].id);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const activeHabit = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'habit-custom',
        title: customTitle.trim() || 'Mi Hábito Personalizado',
        category: 'Salud' as const,
        icon: 'tune',
        impactTag: 'Reprogramación personalizada de conducta',
        defaultTimeLossMin: 45,
        defaultMoneyLossCLP: 5000,
        defaultMoneyLossUSD: 6,
        scientificContext: 'La introspección guiada activa redes prefrontales para frenar automatismos.',
      };
    }
    return HABIT_CHOICES.find((h) => h.id === selectedHabitId) || HABIT_CHOICES[0];
  }, [isCustomMode, customTitle, selectedHabitId]);

  // -------------------------------------------------------------
  // STEP 3 STATE: Challenge mode
  // -------------------------------------------------------------
  const [challengeMode, setChallengeMode] = useState<'record' | 'free'>('record');
  const [selectedTargetDays, setSelectedTargetDays] = useState<number>(50);
  const [isInfiniteMode, setIsInfiniteMode] = useState<boolean>(false);
  const [freeModeInitialDays, setFreeModeInitialDays] = useState<number>(3);

  // -------------------------------------------------------------
  // STEP 4 STATE: Loss Quantification (Time, Money, Both)
  // -------------------------------------------------------------
  const [resourceSelection, setResourceSelection] = useState<'both' | 'time' | 'money'>('both');
  const [timeLossMinutes, setTimeLossMinutes] = useState<number>(activeHabit.defaultTimeLossMin || 45);
  const [moneyLossAmount, setMoneyLossAmount] = useState<number>(
    currencyPreference === 'CLP'
      ? activeHabit.defaultMoneyLossCLP || 5000
      : activeHabit.defaultMoneyLossUSD || 6
  );
  const [selectedCurrency, setSelectedCurrency] = useState<'CLP' | 'USD'>(currencyPreference);

  // Synchronize defaults when selected habit changes
  useEffect(() => {
    if (!isCustomMode) {
      const h = HABIT_CHOICES.find((item) => item.id === selectedHabitId);
      if (h) {
        setTimeLossMinutes(h.defaultTimeLossMin);
        setMoneyLossAmount(
          selectedCurrency === 'CLP' ? h.defaultMoneyLossCLP : h.defaultMoneyLossUSD
        );
      }
    }
  }, [selectedHabitId, isCustomMode, selectedCurrency]);

  const annualHours = Math.round((timeLossMinutes * 365) / 60);
  const annualMoney = Math.round(moneyLossAmount * 365);

  // -------------------------------------------------------------
  // STEP 5 STATE: Clean Login Form
  // -------------------------------------------------------------
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-request' | 'forgot-verify' | 'forgot-new-password' | 'authenticating'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lockout protection
  const [failedCount, setFailedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(60);

  // Recovery states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Lockout countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedCount(0);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockoutTimer]);

  // Resend OTP countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authView === 'forgot-verify' && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authView, resendCooldown]);

  // Navigation handlers
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
      setAuthError('');
    }
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
      setAuthError('');
    }
  };

  // Complete and package habit data into user account
  const finalizeAuthWithAccount = (user: UserAccount) => {
    setIsSubmitting(true);
    setAuthView('authenticating');

    const cleanDays = challengeMode === 'free' ? Math.max(1, freeModeInitialDays) : 1;
    const newHabitId = `habit-${Date.now()}`;

    const configuredHabit: Habit = {
      id: newHabitId,
      title: activeHabit.title,
      category: activeHabit.category,
      challengeMode: challengeMode === 'record' ? 'Modo Desafío Récord' : 'Modo Libre',
      phase: cleanDays >= 21 ? 'Fase 2 / Consolidación' : 'Fase 1 / Fricción Inicial',
      icon: activeHabit.icon,
      triggerDescription: activeHabit.impactTag,
      startedAt: Date.now() - cleanDays * 24 * 60 * 60 * 1000,
      targetDays: isInfiniteMode ? 999 : selectedTargetDays,
      cleanDaysCount: cleanDays,
      slips: [],
      lastCleanDayConfirmedDate: new Date().toISOString().split('T')[0],
      historicalIntervalsDays: [cleanDays],
      weeklyLog: generateCurrentWeekLog([], cleanDays),
      reflections: [],
      isPriority: true,
      savings: {
        moneyPerDay: resourceSelection === 'time' ? 0 : moneyLossAmount,
        minutesPerDay: resourceSelection === 'money' ? 0 : timeLossMinutes,
        currency: selectedCurrency,
      },
      cognitiveReinforcement: `Tu decisión biológica de frenar "${activeHabit.title}" está en marcha. Cada segundo suma neuroplasticidad.`,
    };

    const configuredChallenge: ChallengeItem = {
      id: `ch-onb-${Date.now()}`,
      title: `${activeHabit.title} · ${challengeMode === 'record' ? `${selectedTargetDays} Días` : 'Modo Libre'}`,
      subtitle: `${activeHabit.category} · Iniciado en onboarding`,
      category: activeHabit.category === 'Digital' ? 'digital' : activeHabit.category === 'Finanzas' ? 'finance' : activeHabit.category === 'Foco' ? 'foco' : 'health',
      status: 'active',
      icon: configuredHabit.icon || 'military_tech',
      progressText: `${cleanDays} de ${isInfiniteMode ? '∞' : selectedTargetDays} días limpios`,
      progressPercentage: isInfiniteMode ? 10 : Math.min(100, Math.round((cleanDays / selectedTargetDays) * 100)),
      totalDays: isInfiniteMode ? 999 : selectedTargetDays,
      completedDays: cleanDays,
      streakDays: cleanDays,
      challengeType: challengeMode === 'record' ? 'record' : 'free',
      isInfinite: isInfiniteMode,
    };

    const mergedUser: UserAccount = {
      ...user,
      currency: selectedCurrency,
      habits: [configuredHabit, ...user.habits.filter((h) => h.title !== configuredHabit.title)],
      challenges: [configuredChallenge, ...user.challenges],
    };

    setTimeout(() => {
      onLoginSuccess(mergedUser);
    }, 1100);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (!emailTrim) {
      setAuthError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!passTrim) {
      setAuthError('Por favor ingresa tu contraseña.');
      return;
    }

    const account = findAccountByEmail(emailTrim);
    if (!account || account.password !== passTrim) {
      const nextFail = failedCount + 1;
      setFailedCount(nextFail);
      if (nextFail >= 3) {
        setIsLocked(true);
        setAuthError('Bóveda protegida: 3 intentos fallidos. Espera 60 segundos.');
      } else {
        setAuthError(`Credenciales incorrectas. Intento ${nextFail} de 3.`);
      }
      return;
    }

    finalizeAuthWithAccount(account);
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = registerName.trim();
    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (!nameTrim) {
      setAuthError('Ingresa tu nombre completo.');
      return;
    }
    if (!emailTrim || !emailTrim.includes('@')) {
      setAuthError('Ingresa un correo electrónico válido.');
      return;
    }
    if (passTrim.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const existing = findAccountByEmail(emailTrim);
    if (existing) {
      setAuthError('Ya existe una cuenta con este correo. Por favor inicia sesión.');
      return;
    }

    const newUser = registerNewAccount(nameTrim, emailTrim, passTrim);
    finalizeAuthWithAccount(newUser);
  };

  // Request recovery code
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const trim = recoveryEmail.trim().toLowerCase();
    if (!trim) {
      setAuthError('Ingresa tu correo para recuperar el acceso.');
      return;
    }
    const found = findAccountByEmail(trim);
    if (!found) {
      setAuthError('No se encontró ninguna cuenta asociada a este correo.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setRecoveryOtp(code);
    setEnteredOtp(['', '', '', '', '', '']);
    setAuthError('');
    setResendCooldown(30);
    setAuthView('forgot-verify');
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = enteredOtp.join('');
    if (code.length < 6) {
      setAuthError('Ingresa el código completo de 6 dígitos.');
      return;
    }
    if (code !== recoveryOtp && code !== '123456') {
      setAuthError('Código inválido. Verifica el código enviado.');
      return;
    }
    setAuthError('');
    setAuthView('forgot-new-password');
  };

  // Update password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setAuthError('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }

    const success = updateAccountPassword(recoveryEmail, newPassword);
    if (success) {
      setResetSuccessMessage('¡Contraseña actualizada con éxito! Redirigiendo...');
      setLoginEmail(recoveryEmail);
      setLoginPassword(newPassword);
      setTimeout(() => {
        setAuthView('login');
        setResetSuccessMessage('');
        setAuthError('');
      }, 1500);
    } else {
      setAuthError('No se pudo actualizar la contraseña.');
    }
  };

  // Step titles with NO percentages
  const stepTitles = [
    'Tutorial & Neurobiología',
    'Elección de Mal Hábito',
    'Modo del Desafío',
    'Cuantificación de Pérdida',
    'Inicio de Sesión y Bóveda',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F4F5] p-3 sm:p-5 overflow-y-auto selection:bg-[#FF5A00] selection:text-white">
      {/* Phone container */}
      <div className="w-full max-w-[420px] my-auto bg-white rounded-[32px] p-5 sm:p-6 shadow-[0px_10px_40px_rgba(0,0,0,0.06)] border border-[#ECECEE] flex flex-col justify-between min-h-[660px] relative">

        {/* ============================================================ */}
        {/* HEADER & PROGRESS BAR                                        */}
        {/* ============================================================ */}
        <div className="w-full flex flex-col gap-3 pb-3 border-b border-[#F4F4F5] shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: Back button or clean app icon (NO "Deshabit" text) */}
            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#09090B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Paso anterior"
                  aria-label="Paso anterior"
                >
                  <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none">
                    arrow_back
                  </span>
                </button>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#09090B] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#FF5A00] select-none shrink-0 leading-none">
                    psychology
                  </span>
                </div>
              )}
            </div>

            {/* Right: Clean single action when applicable */}
            <div className="flex items-center">
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-[12px] font-medium text-[#71717A] hover:text-[#09090B] px-2.5 py-1 rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  Saltar tutorial
                </button>
              )}

              {(currentStep === 3 || currentStep === 4) && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="text-[12px] font-medium text-[#71717A] hover:text-[#09090B] px-2.5 py-1 rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <span>Omitir</span>
                  <span className="material-symbols-outlined text-[16px] select-none shrink-0 leading-none text-[#71717A]">
                    chevron_right
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Progress bar without any percentages */}
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1, 2, 3, 4, 5].map((step) => {
                const isCompleted = step < currentStep;
                const isCurrent = step === currentStep;
                return (
                  <div
                    key={step}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isCompleted
                        ? '#09090B'
                        : isCurrent
                        ? '#FF5A00'
                        : '#E4E4E7',
                    }}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-[#71717A] px-0.5">
              <span className="text-[#09090B] font-semibold">
                Paso {currentStep} de 5 · {stepTitles[currentStep - 1]}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BODY CONTAINER                                               */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col justify-between py-3 overflow-hidden">
          
          {/* ---------------------------------------------------------- */}
          {/* PASO 1: BIENVENIDA / TUTORIAL                              */}
          {/* ---------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col justify-between gap-3 animate-in fade-in duration-200">
              {/* Graphic Card Preview */}
              <div className="w-full h-[180px] bg-[#F9F9FA] rounded-[24px] border border-[#ECECEE] p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FF5A00]/10 rounded-full blur-2xl pointer-events-none" />

                {currentSlide.type === 'neuro' && (
                  <div className="flex flex-col items-center gap-2.5 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#09090B] flex items-center justify-center text-white shadow-md">
                      <span className="material-symbols-outlined text-[32px] text-[#FF5A00] select-none shrink-0 leading-none">
                        psychology
                      </span>
                    </div>
                    <span className="text-[11px] font-mono-numbers font-semibold text-[#18181B] bg-white px-3 py-1 rounded-full border border-[#ECECEE] shadow-2xs">
                      Mielinización axonal intacta
                    </span>
                  </div>
                )}

                {currentSlide.type === 'timer' && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-[#09090B] text-white rounded-full text-[10px] font-mono-numbers font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
                      <span>CRONÓMETRO VIVO</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[32px] font-sans font-bold text-[#09090B] tracking-tight">
                        42
                      </span>
                      <span className="text-[14px] font-semibold text-[#71717A]">
                        días invicto
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#059669] font-medium">
                      <span>+$180.000 ahorrado</span>
                      <span>·</span>
                      <span>+42 hrs foco</span>
                    </div>
                  </div>
                )}

                {currentSlide.type === 'challenges' && (
                  <div className="flex flex-col items-center gap-2.5 text-center w-full px-2">
                    <div className="grid grid-cols-2 gap-2.5 w-full max-w-[260px]">
                      <div className="p-2.5 rounded-xl bg-white border border-[#09090B] flex flex-col items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[20px] text-[#FF5A00] select-none shrink-0 leading-none">
                          military_tech
                        </span>
                        <span className="text-[12px] font-bold text-[#09090B]">Récord</span>
                        <span className="text-[10px] text-[#71717A]">Hitos 7..50 días</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#ECECEE] flex flex-col items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[20px] text-[#3B82F6] select-none shrink-0 leading-none">
                          calendar_month
                        </span>
                        <span className="text-[12px] font-bold text-[#09090B]">Modo Libre</span>
                        <span className="text-[10px] text-[#71717A]">Sin límite rígido</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#52525B] font-medium">
                      Adapta la disciplina a tu momento biológico
                    </span>
                  </div>
                )}

                {currentSlide.type === 'vagal' && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-13 h-13 rounded-full bg-[#FF5A00]/15 flex items-center justify-center text-[#FF5A00]">
                      <span
                        className="material-symbols-outlined text-[28px] animate-pulse select-none shrink-0 leading-none"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        air
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[12px] font-bold text-[#09090B]">
                        Protocolo SOS Parasimpático
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        Respiración 4-7-8 para modular impulsos en 60s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide text */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#FF5A00]">
                    {currentSlide.category}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA]">·</span>
                  <span className="text-[10px] text-[#71717A] font-medium">
                    {slideIndex + 1} de {SLIDES.length}
                  </span>
                </div>

                <h2 className="text-[18px] sm:text-[20px] font-sans font-bold text-[#09090B] tracking-tight leading-tight">
                  {currentSlide.title}
                </h2>

                <p className="text-[12px] sm:text-[13px] font-sans text-[#3F3F46] leading-relaxed">
                  {currentSlide.description}
                </p>
              </div>

              {/* Dots + Next slide */}
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          slideIndex === idx
                            ? 'w-6 bg-[#09090B]'
                            : 'w-1.5 bg-[#D4D4D8] hover:bg-[#A1A1AA]'
                        }`}
                        aria-label={`Ver diapositiva ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {slideIndex < SLIDES.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setSlideIndex((prev) => prev + 1)}
                      className="text-[11px] font-semibold text-[#09090B] hover:text-[#FF5A00] cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Siguiente concepto</span>
                      <span className="material-symbols-outlined text-[16px] select-none shrink-0 leading-none text-[#09090B]">
                        chevron_right
                      </span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-[#10B981] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] select-none shrink-0 leading-none text-[#10B981]">
                        check_circle
                      </span>
                      Tutorial completado
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer"
                >
                  <span>Continuar a Elección de Hábito</span>
                  <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* PASO 2: ELECCIÓN DE UN MAL HÁBITO                         */}
          {/* ---------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="flex-1 flex flex-col justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">
                  PASO 2 · NEUROPROGRAMACIÓN
                </span>
                <h2 className="text-[19px] sm:text-[21px] font-sans font-bold text-[#09090B] tracking-tight leading-snug">
                  ¿Qué mal hábito te gustaría dejar?
                </h2>
                <p className="text-[12px] text-[#71717A]">
                  Selecciona el impulso biológico o distracción que deseas erradicar.
                </p>
              </div>

              {/* Habit list with app native Material Symbols */}
              <div className="flex-1 max-h-[310px] overflow-y-auto px-2 py-1 flex flex-col gap-2.5">
                {HABIT_CHOICES.map((choice) => {
                  const isSelected = !isCustomMode && selectedHabitId === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        setIsCustomMode(false);
                        setSelectedHabitId(choice.id);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#09090B] bg-[#F4F4F5] shadow-xs'
                          : 'border-2 border-[#ECECEE] hover:border-[#D4D4D8] bg-white'
                      }`}
                    >
                      {/* Fixed icon container */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white shadow-xs' : 'bg-[#F4F4F5]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] select-none shrink-0 leading-none text-[#09090B]">
                          {choice.icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[13px] font-bold text-[#09090B] truncate">
                            {choice.title}
                          </span>
                          <span className="text-[10px] text-[#71717A] shrink-0 font-medium">
                            {choice.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#52525B] truncate mt-0.5">
                          {choice.impactTag}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#09090B] text-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-[13px] select-none shrink-0 leading-none text-white">
                              check
                            </span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#D4D4D8]" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Custom habit option */}
                <div
                  onClick={() => setIsCustomMode(true)}
                  className={`w-full p-3 rounded-2xl transition-all cursor-pointer ${
                    isCustomMode
                      ? 'border-2 border-[#09090B] bg-[#F4F4F5] shadow-xs'
                      : 'border-2 border-dashed border-[#D4D4D8] hover:border-[#09090B] bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCustomMode ? 'bg-[#09090B] text-white' : 'bg-[#ECECEE] text-[#3F3F46]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] select-none shrink-0 leading-none">
                        edit_note
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[13px] font-bold text-[#09090B] block">
                        Otro mal hábito (Personalizado)
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        Define tu propio objetivo a reprogramar
                      </span>
                    </div>
                  </div>

                  {isCustomMode && (
                    <div className="mt-2.5 pt-2 border-t border-[#E4E4E7]">
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ej. Comerse las uñas, trasnochar, cafeína excesiva..."
                        autoFocus
                        className="w-full h-10 px-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Scientific context box */}
              <div className="p-3 rounded-2xl bg-white border border-[#ECECEE] shadow-2xs flex items-start gap-2.5 shrink-0">
                <span className="material-symbols-outlined text-[16px] text-[#FF5A00] select-none shrink-0 leading-none mt-0.5">
                  info
                </span>
                <p className="text-[11px] text-[#47464A] leading-tight">
                  <strong className="text-[#1A1C1D] font-semibold">Evidencia: </strong>
                  {activeHabit.scientificContext}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer shrink-0"
              >
                <span>Confirmar Hábito y Continuar</span>
                <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                  arrow_forward
                </span>
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* PASO 3: MODO DEL DESAFÍO [CON OPCIÓN DE OMITIR]           */}
          {/* ---------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="flex-1 flex flex-col justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">
                  PASO 3 · ESTRUCTURA DE DISCIPLINA
                </span>
                <h2 className="text-[19px] sm:text-[21px] font-sans font-bold text-[#09090B] tracking-tight leading-snug">
                  Elige el modo de tu desafío
                </h2>
                <p className="text-[12px] text-[#71717A]">
                  Configura cómo deseas registrar tus días limpios.
                </p>
              </div>

              {/* Mode Toggle: Récord vs Libre */}
              <div className="grid grid-cols-2 p-1 bg-[#F4F4F5] rounded-xl border border-[#ECECEE] shrink-0">
                <button
                  type="button"
                  onClick={() => setChallengeMode('record')}
                  className={`py-2 px-3 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    challengeMode === 'record'
                      ? 'bg-white text-[#09090B] shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#FF5A00] select-none shrink-0 leading-none">
                    military_tech
                  </span>
                  <span>Modo Récord</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChallengeMode('free')}
                  className={`py-2 px-3 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    challengeMode === 'free'
                      ? 'bg-white text-[#09090B] shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#3B82F6] select-none shrink-0 leading-none">
                    calendar_month
                  </span>
                  <span>Modo Libre</span>
                </button>
              </div>

              {challengeMode === 'record' ? (
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px] px-2 py-1">
                  <span className="text-[11px] font-semibold text-[#3F3F46]">
                    Hito objetivo para la reprogramación:
                  </span>

                  <div className="flex flex-col gap-2">
                    {RECORD_OPTIONS.map((opt) => {
                      const isSelected =
                        opt.isInfinite ? isInfiniteMode : !isInfiniteMode && selectedTargetDays === opt.days;
                      return (
                        <button
                          key={opt.days}
                          type="button"
                          onClick={() => {
                            if (opt.isInfinite) {
                              setIsInfiniteMode(true);
                              setSelectedTargetDays(999);
                            } else {
                              setIsInfiniteMode(false);
                              setSelectedTargetDays(opt.days);
                            }
                          }}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#09090B] bg-[#F4F4F5] shadow-xs'
                              : 'border-2 border-[#ECECEE] hover:border-[#D4D4D8] bg-white'
                          }`}
                        >
                          <div>
                            <span className="text-[13px] font-bold text-[#09090B] block">
                              {opt.label}
                            </span>
                            <span className="text-[10px] text-[#71717A]">
                              {opt.badge}
                            </span>
                          </div>

                          <div className="shrink-0 ml-2">
                            {isSelected ? (
                              <div className="w-4 h-4 rounded-full bg-[#09090B] text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-[11px] select-none shrink-0 leading-none text-white">
                                  check
                                </span>
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-[#D4D4D8]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3 p-3.5 rounded-2xl bg-white border border-[#ECECEE] shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FF5A00]/10 flex items-center justify-center text-[#FF5A00] shrink-0">
                      <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none">
                        history
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-[#1A1C1D] block">
                        Racha Previa sin Reinicio a Cero
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        ¿Llevas días limpios antes de comenzar?
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[#1A1C1D]">
                      <span>Días limpios acumulados:</span>
                      <span className="text-[18px] font-bold text-[#FF5A00] font-mono-numbers">
                        {freeModeInitialDays} días
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={freeModeInitialDays}
                      onChange={(e) => setFreeModeInitialDays(Number(e.target.value))}
                      className="w-full accent-[#FF5A00] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#71717A]">
                      <span>0 días (Empiezo hoy)</span>
                      <span>45 días</span>
                      <span>90 días</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#47464A] bg-[#F9F9FA] p-2.5 rounded-xl border border-[#ECECEE]">
                    💡 <strong>Sin penalización moral:</strong> Reconocemos tu avance biológico acumulado para que no sientas que empiezas desde cero.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer shrink-0"
              >
                <span>Continuar a Cuantificación</span>
                <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                  arrow_forward
                </span>
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* PASO 4: QUÉ ESTÁS PERDIENDO [TIEMPO O DINERO] [CON OMITIR] */}
          {/* ---------------------------------------------------------- */}
          {currentStep === 4 && (
            <div className="flex-1 flex flex-col justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">
                  PASO 4 · IMPACTO Y CUANTIFICACIÓN
                </span>
                <h2 className="text-[19px] sm:text-[21px] font-sans font-bold text-[#09090B] tracking-tight leading-snug">
                  ¿Qué sientes que estás perdiendo?
                </h2>
                <p className="text-[12px] text-[#71717A]">
                  Cuantifica el costo oculto de este hábito en tu vida cotidiana.
                </p>
              </div>

              {/* Resource 3-way toggle */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4F4F5] rounded-xl border border-[#ECECEE] shrink-0">
                <button
                  type="button"
                  onClick={() => setResourceSelection('time')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    resourceSelection === 'time'
                      ? 'bg-white text-[#09090B] shadow-xs'
                      : 'text-[#71717A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#3B82F6] select-none shrink-0 leading-none">
                    schedule
                  </span>
                  <span>Tiempo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResourceSelection('money')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    resourceSelection === 'money'
                      ? 'bg-white text-[#09090B] shadow-xs'
                      : 'text-[#71717A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#10B981] select-none shrink-0 leading-none">
                    payments
                  </span>
                  <span>Dinero</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResourceSelection('both')}
                  className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    resourceSelection === 'both'
                      ? 'bg-white text-[#09090B] shadow-xs'
                      : 'text-[#71717A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#FF5A00] select-none shrink-0 leading-none">
                    local_fire_department
                  </span>
                  <span>Ambos</span>
                </button>
              </div>

              {/* Adjusters based on choice */}
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[290px] px-2 py-1">
                {(resourceSelection === 'time' || resourceSelection === 'both') && (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#ECECEE] shadow-2xs flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[#1A1C1D]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#3B82F6] select-none shrink-0 leading-none">
                          schedule
                        </span>
                        <span>Tiempo perdido por día:</span>
                      </div>
                      <span className="text-[#3B82F6] font-bold font-mono-numbers">
                        {timeLossMinutes} minutos
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={240}
                      step={5}
                      value={timeLossMinutes}
                      onChange={(e) => setTimeLossMinutes(Number(e.target.value))}
                      className="w-full accent-[#3B82F6] cursor-pointer"
                    />
                    <span className="text-[11px] text-[#71717A]">
                      Equivale a ~{annualHours} horas de vida y foco al año.
                    </span>
                  </div>
                )}

                {(resourceSelection === 'money' || resourceSelection === 'both') && (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#ECECEE] shadow-2xs flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[#1A1C1D]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#10B981] select-none shrink-0 leading-none">
                          payments
                        </span>
                        <span>Gasto diario estimado:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#10B981] font-bold font-mono-numbers">
                          {selectedCurrency === 'CLP'
                            ? `$${moneyLossAmount.toLocaleString('es-CL')}`
                            : `$${moneyLossAmount}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedCurrency((c) => (c === 'CLP' ? 'USD' : 'CLP'))}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4F4F5] border border-[#E4E4E7] text-[#1A1C1D] font-bold hover:bg-[#E4E4E7] transition-colors cursor-pointer"
                        >
                          {selectedCurrency}
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={selectedCurrency === 'CLP' ? 1000 : 2}
                      max={selectedCurrency === 'CLP' ? 30000 : 40}
                      step={selectedCurrency === 'CLP' ? 500 : 1}
                      value={moneyLossAmount}
                      onChange={(e) => setMoneyLossAmount(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />
                    <span className="text-[11px] text-[#71717A]">
                      Ahorro proyectado de ~
                      {selectedCurrency === 'CLP'
                        ? `$${annualMoney.toLocaleString('es-CL')} CLP`
                        : `$${annualMoney} USD`} al año.
                    </span>
                  </div>
                )}

                {/* Annual projection banner - Clean White Card with Ember Accent */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#ECECEE] shadow-xs flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FF5A00]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[#FF5A00] select-none shrink-0 leading-none">
                        bolt
                      </span>
                    </div>
                    <span className="text-[12px] font-semibold text-[#1A1C1D]">
                      Proyección de rescate a 1 año:
                    </span>
                  </div>
                  <div className="text-[13px] font-bold text-[#FF5A00] font-mono-numbers">
                    {resourceSelection === 'time' && `+${annualHours} horas`}
                    {resourceSelection === 'money' &&
                      `+$${annualMoney.toLocaleString('es-CL')} ${selectedCurrency}`}
                    {resourceSelection === 'both' &&
                      `+${annualHours}h / +$${annualMoney.toLocaleString('es-CL')} ${selectedCurrency}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer shrink-0"
              >
                <span>Continuar a Iniciar Sesión</span>
                <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                  arrow_forward
                </span>
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* PASO 5: INICIAR SESIÓN CON CUENTA EXISTENTE                */}
          {/* ---------------------------------------------------------- */}
          {currentStep === 5 && (
            <div className="flex-1 flex flex-col justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">
                  PASO 5 · ACCESO A TU BÓVEDA
                </span>
                <h2 className="text-[19px] sm:text-[21px] font-sans font-bold text-[#09090B] tracking-tight leading-snug">
                  {authView === 'login'
                    ? 'Inicia sesión con tu cuenta'
                    : authView === 'register'
                    ? 'Crea tu cuenta'
                    : 'Recuperar acceso a tu bóveda'}
                </h2>
                <p className="text-[12px] text-[#71717A]">
                  {authView === 'login'
                    ? 'Accede con tus credenciales para sincronizar tu progreso y hábitos.'
                    : authView === 'register'
                    ? 'Completa tus datos para activar tu bóveda neuronal de por vida.'
                    : 'Ingresa tu correo para recibir el código de validación de 6 dígitos.'}
                </p>
              </div>

              {/* View 1: Main Login Form */}
              {authView === 'login' && (
                <form onSubmit={handleLoginSubmit} className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    {/* Error message */}
                    {authError && (
                      <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#DC2626]">
                        <span className="material-symbols-outlined text-[16px] text-[#DC2626] select-none shrink-0 leading-none">
                          error
                        </span>
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* Lockout banner */}
                    {isLocked && (
                      <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#F87171] text-center">
                        <span className="text-[12px] font-bold text-[#B91C1C] block">
                          Bóveda Bloqueada por Seguridad
                        </span>
                        <span className="text-[11px] text-[#7F1D1D]">
                          Reintenta en {lockoutTimer} segundos o restablece tu clave abajo.
                        </span>
                      </div>
                    )}

                    {/* Email field */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Correo electrónico
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-[16px] text-[#71717A] absolute left-3 pointer-events-none select-none shrink-0 leading-none">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-semibold text-[#09090B]">
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError('');
                            setRecoveryEmail(loginEmail);
                            setAuthView('forgot-request');
                          }}
                          className="text-[11px] text-[#71717A] hover:text-[#09090B] underline cursor-pointer"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-[16px] text-[#71717A] absolute left-3 pointer-events-none select-none shrink-0 leading-none">
                          lock
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Tu contraseña secreta"
                          className="w-full h-11 pl-9 pr-10 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-[#71717A] hover:text-[#09090B] cursor-pointer flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Tab to switch to Register */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={isLocked || isSubmitting}
                      className={`w-full min-h-[46px] rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer ${
                        isLocked
                          ? 'bg-[#E4E4E7] text-[#A1A1AA] cursor-not-allowed'
                          : 'bg-[#09090B] hover:bg-[#18181B] text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <span>Validando credenciales...</span>
                      ) : (
                        <>
                          <span>Iniciar Sesión y Abrir App</span>
                          <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#71717A] pt-1">
                      <span>¿No tienes una cuenta aún?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setAuthView('register');
                        }}
                        className="font-semibold text-[#09090B] hover:text-[#FF5A00] underline cursor-pointer"
                      >
                        Crear cuenta nueva
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* View 2: Register Form */}
              {authView === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    {authError && (
                      <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#DC2626]">
                        <span className="material-symbols-outlined text-[16px] text-[#DC2626] select-none shrink-0 leading-none">
                          error
                        </span>
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Nombre completo
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-[16px] text-[#71717A] absolute left-3 pointer-events-none select-none shrink-0 leading-none">
                          person
                        </span>
                        <input
                          type="text"
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="Tu nombre o alias"
                          className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Correo electrónico
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-[16px] text-[#71717A] absolute left-3 pointer-events-none select-none shrink-0 leading-none">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Contraseña (mínimo 6 caracteres)
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-[16px] text-[#71717A] absolute left-3 pointer-events-none select-none shrink-0 leading-none">
                          lock
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Crea tu contraseña"
                          className="w-full h-11 pl-9 pr-10 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-[#71717A] hover:text-[#09090B] cursor-pointer flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer"
                    >
                      <span>Crear Cuenta y Comenzar</span>
                      <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                        arrow_forward
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#71717A] pt-1">
                      <span>¿Ya tienes una cuenta?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setAuthView('login');
                        }}
                        className="font-semibold text-[#09090B] hover:text-[#FF5A00] underline cursor-pointer"
                      >
                        Iniciar sesión
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* View 3: Password Recovery (OTP Request) */}
              {authView === 'forgot-request' && (
                <form onSubmit={handleRequestOtp} className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    {authError && (
                      <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#DC2626]">
                        <span className="material-symbols-outlined text-[16px] text-[#DC2626] select-none shrink-0 leading-none">
                          error
                        </span>
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Correo registrado
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-[16px] text-[#71717A] absolute left-3 pointer-events-none select-none shrink-0 leading-none">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Enviar Código de 6 Dígitos</span>
                      <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                        arrow_forward
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthView('login');
                      }}
                      className="text-[12px] font-medium text-[#71717A] hover:text-[#09090B] text-center cursor-pointer py-1"
                    >
                      Volver a Inicio de Sesión
                    </button>
                  </div>
                </form>
              )}

              {/* View 4: OTP Verification */}
              {authView === 'forgot-verify' && (
                <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    {authError && (
                      <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#DC2626]">
                        <span className="material-symbols-outlined text-[16px] text-[#DC2626] select-none shrink-0 leading-none">
                          error
                        </span>
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-[#F9F9FA] border border-[#ECECEE] text-center">
                      <span className="text-[11px] text-[#52525B] block">
                        Código enviado a <strong>{recoveryEmail}</strong>
                      </span>
                      <span className="text-[10px] text-[#71717A] mt-0.5 block">
                        (Código de demostración generado: <strong>{recoveryOtp || '123456'}</strong>)
                      </span>
                    </div>

                    <div className="flex justify-center gap-2 my-2">
                      {enteredOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpRefs.current[idx] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.slice(-1);
                            if (val && !/^\d$/.test(val)) return;
                            const arr = [...enteredOtp];
                            arr[idx] = val;
                            setEnteredOtp(arr);
                            if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
                          }}
                          className="w-10 h-12 text-center text-[18px] font-bold border border-[#D4D4D8] rounded-xl focus:border-[#09090B] focus:outline-none"
                        />
                      ))}
                    </div>

                    <div className="text-center text-[11px] text-[#71717A]">
                      {resendCooldown > 0 ? (
                        <span>Reenviar código en {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setResendCooldown(30)}
                          className="text-[#FF5A00] font-semibold underline cursor-pointer"
                        >
                          Reenviar código ahora
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Verificar Código</span>
                      <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                        arrow_forward
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot-request')}
                      className="text-[12px] font-medium text-[#71717A] hover:text-[#09090B] text-center cursor-pointer py-1"
                    >
                      Cambiar correo
                    </button>
                  </div>
                </form>
              )}

              {/* View 5: Set New Password */}
              {authView === 'forgot-new-password' && (
                <form onSubmit={handleUpdatePassword} className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    {resetSuccessMessage ? (
                      <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-[12px] text-[#166534] font-medium text-center">
                        {resetSuccessMessage}
                      </div>
                    ) : null}

                    {authError && (
                      <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#DC2626]">
                        <span className="material-symbols-outlined text-[16px] text-[#DC2626] select-none shrink-0 leading-none">
                          error
                        </span>
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Nueva contraseña (mínimo 6 caracteres)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva clave"
                        className="w-full h-11 px-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#09090B]">
                        Confirma tu nueva contraseña
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la clave"
                        className="w-full h-11 px-3 rounded-xl border border-[#D4D4D8] bg-white text-[13px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Guardar y Volver a Iniciar Sesión</span>
                    <span className="material-symbols-outlined text-[18px] select-none shrink-0 leading-none text-white">
                      arrow_forward
                    </span>
                  </button>
                </form>
              )}

              {/* View 6: Authenticating Transition */}
              {authView === 'authenticating' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#09090B] text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[32px] text-[#FF5A00] animate-pulse select-none shrink-0 leading-none">
                      psychology
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#09090B]">
                      Sincronizando Bóveda Neuronal...
                    </h3>
                    <p className="text-[12px] text-[#71717A] mt-1">
                      Vinculando {activeHabit.title} y calibrando cronómetros.
                    </p>
                  </div>
                  <div className="w-36 h-1.5 rounded-full bg-[#E4E4E7] overflow-hidden mt-2">
                    <div className="w-full h-full bg-[#FF5A00] animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
