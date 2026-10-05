import React, { useState, useMemo } from 'react';
import { ChallengeItem } from '../types';

export interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChallenge: (challenge: Omit<ChallengeItem, 'id'>) => void;
  currencyPreference?: 'CLP' | 'USD';
}

interface RecommendedHabit {
  id: string;
  title: string;
  category: 'health' | 'foco' | 'finance' | 'digital';
  categoryLabel: 'Salud' | 'Foco mental' | 'Finanzas' | 'Digital';
  icon: string;
  defaultDescription: string;
  defaultMinutesPerDay: number;
  defaultMoneyPerDayUSD: number;
  defaultMoneyPerDayCLP: number;
}

const RECOMMENDED_HABITS: RecommendedHabit[] = [
  {
    id: 'rec-azucar',
    title: 'Azúcar Refinada & Chatarra',
    category: 'health',
    categoryLabel: 'Salud',
    icon: 'nutrition',
    defaultDescription: 'Eliminar el consumo compulsivo de dulces, ultraprocesados y bollería vespertina.',
    defaultMinutesPerDay: 30,
    defaultMoneyPerDayUSD: 6,
    defaultMoneyPerDayCLP: 5000,
  },
  {
    id: 'rec-doomscrolling',
    title: 'Doomscrolling en Redes Sociales',
    category: 'digital',
    categoryLabel: 'Digital',
    icon: 'smartphone',
    defaultDescription: 'Cero feeds infinitos, videos cortos (TikTok/Reels) y navegación nocturna en cama.',
    defaultMinutesPerDay: 90,
    defaultMoneyPerDayUSD: 0,
    defaultMoneyPerDayCLP: 0,
  },
  {
    id: 'rec-tabaco',
    title: 'Tabaco / Cigarrillo / Vapeo',
    category: 'health',
    categoryLabel: 'Salud',
    icon: 'smoke_free',
    defaultDescription: 'Cero cigarrillos o pods de vapeo con nicotina para regenerar capacidad pulmonar.',
    defaultMinutesPerDay: 45,
    defaultMoneyPerDayUSD: 8,
    defaultMoneyPerDayCLP: 6500,
  },
  {
    id: 'rec-alcohol',
    title: 'Alcohol y Tragos Sociales',
    category: 'health',
    categoryLabel: 'Salud',
    icon: 'no_drinks',
    defaultDescription: 'Pausa total de bebidas alcohólicas para restaurar el sueño profundo y función hepática.',
    defaultMinutesPerDay: 60,
    defaultMoneyPerDayUSD: 14,
    defaultMoneyPerDayCLP: 12000,
  },
  {
    id: 'rec-compras',
    title: 'Compras Impulsivas Online',
    category: 'finance',
    categoryLabel: 'Finanzas',
    icon: 'shopping_bag',
    defaultDescription: 'Moratoria obligatoria de 72h antes de cualquier adquisición no planificada.',
    defaultMinutesPerDay: 40,
    defaultMoneyPerDayUSD: 20,
    defaultMoneyPerDayCLP: 18000,
  },
  {
    id: 'rec-porno',
    title: 'Pornografía / Contenido Adulto',
    category: 'foco',
    categoryLabel: 'Foco mental',
    icon: 'psychology',
    defaultDescription: 'Regulación de vías dopaminérgicas anulando estímulos sexuales artificiales.',
    defaultMinutesPerDay: 45,
    defaultMoneyPerDayUSD: 0,
    defaultMoneyPerDayCLP: 0,
  },
  {
    id: 'rec-procrastinacion',
    title: 'Procrastinación & Multitarea',
    category: 'foco',
    categoryLabel: 'Foco mental',
    icon: 'hourglass_disabled',
    defaultDescription: 'Bloques de trabajo cognitivo enfocado de 50 minutos sin alternancia de ventanas.',
    defaultMinutesPerDay: 90,
    defaultMoneyPerDayUSD: 0,
    defaultMoneyPerDayCLP: 0,
  },
  {
    id: 'rec-juegos',
    title: 'Videojuegos Compulsivos',
    category: 'digital',
    categoryLabel: 'Digital',
    icon: 'sports_esports',
    defaultDescription: 'Freno a partidas interminables nocturnas que comprometen las horas de descanso.',
    defaultMinutesPerDay: 120,
    defaultMoneyPerDayUSD: 5,
    defaultMoneyPerDayCLP: 4000,
  },
  {
    id: 'rec-cafeina',
    title: 'Exceso de Cafeína / Energéticas',
    category: 'health',
    categoryLabel: 'Salud',
    icon: 'coffee',
    defaultDescription: 'Límite estricto de café antes de las 13:00 para proteger el anclaje de adenosina.',
    defaultMinutesPerDay: 20,
    defaultMoneyPerDayUSD: 5,
    defaultMoneyPerDayCLP: 3500,
  },
  {
    id: 'rec-apuestas',
    title: 'Apuestas / Casino Online',
    category: 'finance',
    categoryLabel: 'Finanzas',
    icon: 'casino',
    defaultDescription: 'Cierre de cuentas de apuestas y eliminación de aplicaciones de azar.',
    defaultMinutesPerDay: 45,
    defaultMoneyPerDayUSD: 30,
    defaultMoneyPerDayCLP: 25000,
  },
];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onAddChallenge,
  currencyPreference = 'CLP',
}) => {
  // Mode: Record or Libre
  const [challengeMode, setChallengeMode] = useState<'record' | 'free'>('record');

  // Habit selection: either a recommended ID or 'custom'
  const [selectedHabitId, setSelectedHabitId] = useState<string>(RECOMMENDED_HABITS[0].id);
  const [customHabitTitle, setCustomHabitTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<'health' | 'foco' | 'finance' | 'digital'>('health');
  const [habitDescription, setHabitDescription] = useState(RECOMMENDED_HABITS[0].defaultDescription);

  // Modo Record states
  const [targetDays, setTargetDays] = useState<number>(30);
  const [isInfinite, setIsInfinite] = useState<boolean>(false);
  const [customTargetDays, setCustomTargetDays] = useState<string>('');

  // Modo Libre states - Start date & interactive calendar
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [today]);

  const [startDate, setStartDate] = useState<string>(todayStr);

  // Calendar view navigation (Year and Month)
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());

  // Cost tracking for Libre mode: 'time' | 'money' | 'both'
  const [costMode, setCostMode] = useState<'both' | 'time' | 'money'>('both');
  const [costTimeMinutes, setCostTimeMinutes] = useState<number>(RECOMMENDED_HABITS[0].defaultMinutesPerDay);
  const [costMoneyAmount, setCostMoneyAmount] = useState<number>(
    currencyPreference === 'CLP'
      ? RECOMMENDED_HABITS[0].defaultMoneyPerDayCLP
      : RECOMMENDED_HABITS[0].defaultMoneyPerDayUSD
  );
  const [selectedCurrency, setSelectedCurrency] = useState<'CLP' | 'USD' | 'EUR'>(
    currencyPreference === 'CLP' ? 'CLP' : 'USD'
  );

  // Handle habit selection change
  const handleSelectHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    if (habitId === 'custom') {
      setHabitDescription('');
    } else {
      const found = RECOMMENDED_HABITS.find((h) => h.id === habitId);
      if (found) {
        setHabitDescription(found.defaultDescription);
        setCostTimeMinutes(found.defaultMinutesPerDay);
        setCostMoneyAmount(
          selectedCurrency === 'CLP' ? found.defaultMoneyPerDayCLP : found.defaultMoneyPerDayUSD
        );
      }
    }
  };

  // Calculate days already clean based on selected startDate (for Modo Libre)
  const calculateAccumulatedDays = (start: string): number => {
    if (!start) return 0;
    const startMs = new Date(start + 'T00:00:00').getTime();
    const nowMs = today.getTime();
    const diffMs = nowMs - startMs;
    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const accumulatedDays = challengeMode === 'free' ? calculateAccumulatedDays(startDate) : 0;

  // Fast dates presets for Modo Libre
  const setStartDatePreset = (daysAgo: number) => {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() - daysAgo);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    setStartDate(dateStr);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  // Calendar navigation helpers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const isCurrentMonthView = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const handleNextMonth = () => {
    if (isCurrentMonthView) return; // Cannot navigate to future months
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // getDay() gives 0 for Sunday, 1 for Monday... adjust to 0 for Monday, 6 for Sunday
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const cells = [];

    // Empty leading padding cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }

    const selectedDateObj = new Date(startDate + 'T00:00:00');
    selectedDateObj.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);

      const cellDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isFuture = cellDate.getTime() > today.getTime();
      const isCellToday = cellDate.getTime() === today.getTime();
      const isSelected = cellDateStr === startDate;
      const isInStreak =
        !isFuture &&
        !isSelected &&
        cellDate.getTime() >= selectedDateObj.getTime() &&
        cellDate.getTime() <= today.getTime();

      cells.push({
        type: 'day',
        dayNumber: day,
        dateStr: cellDateStr,
        isFuture,
        isToday: isCellToday,
        isSelected,
        isInStreak,
        key: cellDateStr,
      });
    }

    return cells;
  }, [viewYear, viewMonth, startDate, today]);

  // Formatted date string for banner
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = startDate.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[0], 10);
        return `${d} de ${MONTH_NAMES[m]} de ${y}`;
      }
    } catch {}
    return startDate;
  }, [startDate]);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let title = '';
    let category: 'health' | 'foco' | 'finance' | 'digital' = 'health';
    let icon = 'flag';

    if (selectedHabitId === 'custom') {
      title = customHabitTitle.trim() || 'Nuevo Desafío';
      category = customCategory;
      const catIconMap: Record<typeof customCategory, string> = {
        health: 'favorite',
        foco: 'psychology',
        finance: 'savings',
        digital: 'devices',
      };
      icon = catIconMap[customCategory];
    } else {
      const found = RECOMMENDED_HABITS.find((h) => h.id === selectedHabitId);
      if (found) {
        title = found.title;
        category = found.category;
        icon = found.icon;
      }
    }

    if (challengeMode === 'record') {
      const finalDays = isInfinite
        ? 9999
        : customTargetDays && Number(customTargetDays) > 0
        ? Number(customTargetDays)
        : targetDays;

      const subtitle = isInfinite
        ? 'Modo Récord · Desafío Infinito (∞) · Día 1'
        : `Modo Récord · Día 1 de ${finalDays} · Racha 1d`;

      onAddChallenge({
        title,
        subtitle,
        category,
        status: 'active',
        icon,
        progressText: isInfinite ? 'Récord sin límite' : `1 de ${finalDays} días`,
        progressPercentage: isInfinite ? 1 : Math.round((1 / finalDays) * 100),
        totalDays: finalDays,
        completedDays: 1,
        streakDays: 1,
        notes: habitDescription.trim() || `Desafío modo récord orientado a superar ${title}.`,
        challengeType: 'record',
        isInfinite,
      });
    } else {
      // Modo Libre
      const currentDaysClean = Math.max(1, accumulatedDays);
      const estTargetDays = Math.max(currentDaysClean + 30, 60);

      const subtitle = accumulatedDays > 0
        ? `Modo Libre · ${accumulatedDays}d limpios previos acumulados`
        : `Modo Libre · Iniciado hoy`;

      const currencySymbol = selectedCurrency === 'CLP' ? '$' : selectedCurrency === 'USD' ? 'US$' : '€';

      onAddChallenge({
        title,
        subtitle,
        category,
        status: 'active',
        icon,
        progressText: `${currentDaysClean} días limpios`,
        progressPercentage: Math.min(100, Math.round((currentDaysClean / estTargetDays) * 100)),
        totalDays: estTargetDays,
        completedDays: currentDaysClean,
        streakDays: currentDaysClean,
        notes: `${habitDescription.trim()} (Costo evitado: ${costTimeMinutes}min/d · ${currencySymbol}${costMoneyAmount}/d)`,
        challengeType: 'free',
        startDate,
        costTimeMinutes: costMode === 'money' ? 0 : costTimeMinutes,
        costMoneyAmount: costMode === 'time' ? 0 : costMoneyAmount,
        costMoneyCurrency: selectedCurrency,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-challenge-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] my-auto bg-white rounded-[28px] sm:rounded-[32px] shadow-[0px_16px_50px_rgba(0,0,0,0.16)] p-5 sm:p-6 flex flex-col gap-4 max-h-[86vh] overflow-y-auto border border-[#ECECEE] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F4F4F5]">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-sans uppercase tracking-wider text-[#FF5A00] font-bold block">
              Configuración de Desafío
            </span>
            <h3 id="modal-challenge-title" className="text-[18px] sm:text-[20px] font-sans font-bold text-[#09090B] truncate">
              Crear Nuevo Desafío
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-9 h-9 min-w-[36px] rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] active:scale-90 flex items-center justify-center text-[#3F3F46] hover:text-[#09090B] transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1. SELECTOR DE MODO: RÉCORD vs LIBRE */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] block">
            Tipo de desafío
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F4F5] rounded-2xl">
            <button
              type="button"
              onClick={() => setChallengeMode('record')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                challengeMode === 'record'
                  ? 'bg-white text-[#09090B] shadow-sm font-semibold'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[13px]">
                <span
                  className="material-symbols-outlined text-[17px] text-[#FF5A00]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  emoji_events
                </span>
                <span className="font-semibold">Modo Récord</span>
              </div>
              <span className="text-[10px] text-[#71717A] mt-0.5 text-center leading-tight">
                Meta de días o infinito (∞)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setChallengeMode('free')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                challengeMode === 'free'
                  ? 'bg-white text-[#09090B] shadow-sm font-semibold'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[13px]">
                <span
                  className="material-symbols-outlined text-[17px] text-[#FF5A00]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  calendar_month
                </span>
                <span className="font-semibold">Modo Libre</span>
              </div>
              <span className="text-[10px] text-[#71717A] mt-0.5 text-center leading-tight">
                Fecha inicio + Costo/Ahorro
              </span>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* 2. SELECCIÓN DEL MAL HÁBITO */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A]">
                1. Selecciona o personaliza el mal hábito
              </label>
              {selectedHabitId !== 'custom' && (
                <button
                  type="button"
                  onClick={() => handleSelectHabit('custom')}
                  className="text-[11px] font-semibold text-[#FF5A00] hover:underline cursor-pointer shrink-0"
                >
                  + Escribir propio
                </button>
              )}
            </div>

            {/* Grid adaptativo móvil (1 columna en pantallas ultra angostas, 2 cols en >=420px) */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 max-h-[175px] overflow-y-auto p-1.5 border border-[#ECECEE] rounded-2xl bg-[#FAFAFA]">
              {RECOMMENDED_HABITS.map((hab) => {
                const isSelected = selectedHabitId === hab.id;
                return (
                  <button
                    key={hab.id}
                    type="button"
                    onClick={() => handleSelectHabit(hab.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[50px] ${
                      isSelected
                        ? 'bg-white border-[#09090B] shadow-xs'
                        : 'bg-white/80 border-transparent hover:bg-white hover:border-[#ECECEE]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[19px] shrink-0 mt-0.5 ${
                        isSelected ? 'text-[#FF5A00]' : 'text-[#71717A]'
                      }`}
                    >
                      {hab.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] leading-snug line-clamp-1 ${isSelected ? 'font-bold text-[#09090B]' : 'font-medium text-[#27272A]'}`}>
                        {hab.title}
                      </p>
                      <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide block">
                        {hab.categoryLabel}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Botón para personalizar hábito */}
              <button
                type="button"
                onClick={() => handleSelectHabit('custom')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer col-span-1 min-[420px]:col-span-2 ${
                  selectedHabitId === 'custom'
                    ? 'bg-white border-[#09090B] shadow-xs'
                    : 'bg-white/80 border-dashed border-[#D4D4D8] hover:bg-white hover:border-[#09090B]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[19px] shrink-0 ${
                    selectedHabitId === 'custom' ? 'text-[#FF5A00]' : 'text-[#71717A]'
                  }`}
                >
                  edit_note
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#09090B] truncate">
                    Escribir un mal hábito personalizado...
                  </p>
                  <p className="text-[10px] text-[#71717A] truncate">
                    Define un hábito propio no incluido en la lista.
                  </p>
                </div>
              </button>
            </div>

            {/* Formulario hábito personalizado si está activo */}
            {selectedHabitId === 'custom' && (
              <div className="p-3 bg-[#F4F4F5] rounded-2xl border border-[#ECECEE] flex flex-col gap-2.5 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-sans font-medium text-[#3F3F46] block mb-1">
                    Nombre del mal hábito a superar:
                  </label>
                  <input
                    type="text"
                    value={customHabitTitle}
                    onChange={(e) => setCustomHabitTitle(e.target.value)}
                    placeholder="Ej. Morderse las uñas, trasnochar, etc."
                    className="w-full bg-white text-[#09090B] px-3.5 py-2.5 rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-sans font-medium text-[#3F3F46] block mb-1">
                    Categoría del hábito:
                  </label>
                  <div className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'health', label: 'Salud' },
                        { id: 'foco', label: 'Foco' },
                        { id: 'digital', label: 'Digital' },
                        { id: 'finance', label: 'Finanzas' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCustomCategory(c.id)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border text-center transition-all cursor-pointer ${
                          customCategory === c.id
                            ? 'bg-[#09090B] text-white border-[#09090B]'
                            : 'bg-white text-[#3F3F46] border-[#ECECEE]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. DESCRIPCIÓN DEL HÁBITO */}
          <div className="space-y-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] block">
              2. Descripción del hábito o detonante
            </label>
            <textarea
              value={habitDescription}
              onChange={(e) => setHabitDescription(e.target.value)}
              rows={2}
              placeholder="Describe cuándo suele ocurrir este mal hábito, qué lo detona o tu motivación para superarlo..."
              className="w-full bg-[#FAFAFA] text-[#09090B] px-3.5 py-2 rounded-xl text-[12px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B] resize-none leading-relaxed"
            />
          </div>

          {/* 4. OPCIONES ESPECÍFICAS SEGÚN MODO */}
          {challengeMode === 'record' ? (
            /* ================= MODO RÉCORD ================= */
            <div className="space-y-2.5 p-3.5 bg-[#FAFAFA] rounded-2xl border border-[#ECECEE]">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#09090B]">
                  3. Días objetivos del desafío
                </label>
                <span className="text-[11px] text-[#71717A] font-medium">
                  {isInfinite ? 'Modo Infinito activo' : `${targetDays} días seleccionados`}
                </span>
              </div>

              {/* Botón Destacado: MODO INFINITO */}
              <button
                type="button"
                onClick={() => setIsInfinite(!isInfinite)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isInfinite
                    ? 'bg-[#09090B] text-white border-[#09090B] shadow-sm'
                    : 'bg-white text-[#18181B] border-[#ECECEE] hover:border-[#09090B]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[20px] font-bold text-[#FF5A00] leading-none shrink-0">∞</span>
                  <div className="text-left min-w-0">
                    <p className="text-[12px] font-bold leading-tight">
                      Modo Infinito (Sin fecha límite)
                    </p>
                    <p className={`text-[10px] truncate ${isInfinite ? 'text-[#D4D4D8]' : 'text-[#71717A]'}`}>
                      Desafío continuo de por vida sin caducidad fija.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                    isInfinite ? 'bg-[#FF5A00] border-[#FF5A00] text-white' : 'border-[#D4D4D8]'
                  }`}
                >
                  {isInfinite && <span className="material-symbols-outlined text-[13px]">check</span>}
                </div>
              </button>

              {/* Días objetivos predeterminados (si no es infinito) */}
              {!isInfinite && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[7, 14, 21, 30, 50, 90, 100, 365].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setTargetDays(d);
                          setCustomTargetDays('');
                        }}
                        className={`py-2 rounded-xl text-[12px] font-mono-numbers font-semibold border text-center transition-all cursor-pointer ${
                          targetDays === d && !customTargetDays
                            ? 'bg-[#09090B] text-white border-[#09090B]'
                            : 'bg-white text-[#3F3F46] border-[#ECECEE] hover:text-[#09090B]'
                        }`}
                      >
                        {d} {d === 365 ? 'año' : 'd'}
                      </button>
                    ))}
                  </div>

                  {/* Campo para días personalizados adaptado a móvil */}
                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <span className="text-[11px] text-[#71717A] shrink-0">O escribe tus días:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={9999}
                        value={customTargetDays}
                        onChange={(e) => {
                          setCustomTargetDays(e.target.value);
                          if (e.target.value) setTargetDays(Number(e.target.value));
                        }}
                        placeholder="Ej. 45"
                        className="w-20 bg-white text-[#09090B] px-2.5 py-1.5 rounded-lg text-[12px] font-mono-numbers outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                      />
                      <span className="text-[11px] text-[#71717A]">días meta</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= MODO LIBRE ================= */
            <div className="space-y-3.5 p-3.5 bg-[#FAFAFA] rounded-2xl border border-[#ECECEE]">
              {/* ================= CALENDARIO INTERACTIVO REDISEÑADO ================= */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#09090B] block">
                      3. Calendario de inicio del hábito
                    </label>
                    <span className="text-[10px] text-[#71717A]">
                      Elige desde cuándo vienes superando este hábito (hasta hoy)
                    </span>
                  </div>
                </div>

                {/* Tarjeta del Calendario */}
                <div className="p-3 bg-white rounded-2xl border border-[#ECECEE] shadow-xs space-y-2.5">
                  {/* Header de Mes y Año con navegación */}
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      aria-label="Mes anterior"
                      className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] active:scale-95 flex items-center justify-center text-[#3F3F46] hover:text-[#09090B] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-center">
                      <span className="text-[13px] font-bold text-[#09090B]">
                        {MONTH_NAMES[viewMonth]}
                      </span>
                      <span className="text-[13px] font-medium text-[#71717A]">
                        {viewYear}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      disabled={isCurrentMonthView}
                      aria-label="Mes siguiente"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isCurrentMonthView
                          ? 'bg-[#F4F4F5]/50 text-[#D4D4D8] cursor-not-allowed opacity-50'
                          : 'bg-[#F4F4F5] hover:bg-[#ECECEE] active:scale-95 text-[#3F3F46] hover:text-[#09090B]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DAY_LABELS.map((d) => (
                      <span key={d} className="text-[10px] font-bold text-[#A1A1AA] uppercase">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Celdas de días del calendario */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarCells.map((cell) => {
                      if (cell.type === 'empty') {
                        return <div key={cell.key} className="h-8" />;
                      }

                      const { dayNumber, dateStr, isFuture, isToday, isSelected, isInStreak } = cell;

                      if (isFuture) {
                        return (
                          <div
                            key={cell.key}
                            title="No se pueden elegir fechas futuras"
                            className="h-8 flex items-center justify-center rounded-lg text-[11px] font-mono-numbers text-[#D4D4D8] cursor-not-allowed opacity-40 select-none"
                          >
                            {dayNumber}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => dateStr && setStartDate(dateStr)}
                          title={`${dayNumber} de ${MONTH_NAMES[viewMonth]}${isToday ? ' (Hoy)' : ''}`}
                          className={`h-8 flex items-center justify-center rounded-lg text-[11px] font-mono-numbers transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#09090B] text-white font-bold shadow-xs ring-2 ring-[#FF5A00] ring-offset-1 z-10 scale-105'
                              : isInStreak
                              ? 'bg-[#FF5A00]/15 text-[#C2410C] font-semibold hover:bg-[#FF5A00]/25'
                              : isToday
                              ? 'bg-[#F4F4F5] font-bold text-[#FF5A00] outline outline-1 outline-[#FF5A00]/40 hover:bg-[#ECECEE]'
                              : 'text-[#27272A] hover:bg-[#F4F4F5]'
                          }`}
                        >
                          {dayNumber}
                          {isToday && !isSelected && (
                            <span className="w-1 h-1 bg-[#FF5A00] rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Accesos rápidos de fecha adaptados para móvil */}
                  <div className="pt-2 border-t border-[#F4F4F5]">
                    <span className="text-[10px] font-sans font-medium text-[#71717A] block mb-1.5">
                      Accesos directos rápidos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStartDatePreset(0)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                          startDate === todayStr
                            ? 'bg-[#09090B] text-white border-[#09090B] font-semibold shadow-xs'
                            : 'bg-white text-[#71717A] border-[#ECECEE] hover:text-[#09090B]'
                        }`}
                      >
                        Hoy (Día 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStartDatePreset(1)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border bg-white text-[#71717A] border-[#ECECEE] hover:text-[#09090B] hover:border-[#09090B] cursor-pointer"
                      >
                        Ayer (-1d)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStartDatePreset(3)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border bg-white text-[#71717A] border-[#ECECEE] hover:text-[#09090B] hover:border-[#09090B] cursor-pointer"
                      >
                        Hace 3d
                      </button>
                      <button
                        type="button"
                        onClick={() => setStartDatePreset(7)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border bg-white text-[#71717A] border-[#ECECEE] hover:text-[#09090B] hover:border-[#09090B] cursor-pointer"
                      >
                        Hace 1 sem
                      </button>
                      <button
                        type="button"
                        onClick={() => setStartDatePreset(14)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border bg-white text-[#71717A] border-[#ECECEE] hover:text-[#09090B] hover:border-[#09090B] cursor-pointer"
                      >
                        Hace 2 sem
                      </button>
                      <button
                        type="button"
                        onClick={() => setStartDatePreset(30)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border bg-white text-[#71717A] border-[#ECECEE] hover:text-[#09090B] hover:border-[#09090B] cursor-pointer"
                      >
                        Hace 1 mes
                      </button>
                    </div>
                  </div>
                </div>

                {/* Badge explicativo de días limpios calculados */}
                {accumulatedDays > 0 ? (
                  <div className="flex items-center gap-2 p-2.5 bg-[#10B981]/10 text-[#059669] rounded-xl text-[12px] font-semibold animate-in fade-in">
                    <span className="material-symbols-outlined text-[18px] shrink-0">verified</span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-tight">
                        ¡Llevas {accumulatedDays} días limpios acumulados!
                      </p>
                      <p className="text-[10px] text-[#047857] font-normal leading-tight mt-0.5">
                        Iniciado el {formattedSelectedDate}. Se registrará como progreso previo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-[#F4F4F5] text-[#71717A] rounded-xl text-[11px]">
                    <span className="material-symbols-outlined text-[16px] text-[#FF5A00] shrink-0">flag</span>
                    <span>Empiezas desde hoy como Día 1 de abstinencia.</span>
                  </div>
                )}
              </div>

              {/* Ingreso de Costo en Tiempo o Dinero (DIAGRAMADO RESPONSIVE PARA MÓVIL) */}
              <div className="space-y-2.5 pt-2 border-t border-[#ECECEE]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#09090B]">
                    4. ¿Qué te cuesta este mal hábito?
                  </label>

                  {/* Selector de modo de costo */}
                  <div className="flex gap-1 p-0.5 bg-[#F4F4F5] rounded-lg">
                    {(['both', 'time', 'money'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCostMode(m)}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md uppercase transition-all cursor-pointer ${
                          costMode === m
                            ? 'bg-[#09090B] text-white shadow-xs'
                            : 'text-[#71717A] hover:text-[#09090B]'
                        }`}
                      >
                        {m === 'both' ? 'Tiempo y $' : m === 'time' ? 'Tiempo' : 'Dinero'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input y presets de Tiempo adaptados a pantallas móviles */}
                {(costMode === 'both' || costMode === 'time') && (
                  <div className="p-3 bg-white rounded-xl border border-[#ECECEE] space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-[12px] font-semibold text-[#18181B] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#FF5A00]">
                          schedule
                        </span>
                        Tiempo perdido al día
                      </span>
                      <span className="text-[11px] font-mono-numbers text-[#71717A]">
                        ~{Math.round((costTimeMinutes * 30) / 60)} hrs al mes
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={1440}
                        value={costTimeMinutes}
                        onChange={(e) => setCostTimeMinutes(Number(e.target.value))}
                        className="w-24 bg-[#FAFAFA] text-[#09090B] px-3 py-1.5 rounded-lg text-[13px] font-mono-numbers outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                      />
                      <span className="text-[12px] text-[#71717A]">minutos diarios</span>
                    </div>

                    {/* Chips rápidos en fila independiente para no desbordar en móvil */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[15, 30, 45, 60, 90, 120].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCostTimeMinutes(m)}
                          className={`px-2 py-1 text-[10px] rounded-md transition-all cursor-pointer ${
                            costTimeMinutes === m
                              ? 'bg-[#09090B] text-white font-bold'
                              : 'bg-[#F4F4F5] text-[#3F3F46] hover:bg-[#E4E4E7]'
                          }`}
                        >
                          {m >= 60 ? `${m / 60}h` : `${m}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input y presets de Dinero adaptados a pantallas móviles */}
                {(costMode === 'both' || costMode === 'money') && (
                  <div className="p-3 bg-white rounded-xl border border-[#ECECEE] space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-[12px] font-semibold text-[#18181B] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                          payments
                        </span>
                        Gasto en dinero al día
                      </span>

                      {/* Selector de Moneda */}
                      <div className="flex gap-1">
                        {(['CLP', 'USD', 'EUR'] as const).map((curr) => (
                          <button
                            key={curr}
                            type="button"
                            onClick={() => setSelectedCurrency(curr)}
                            className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all cursor-pointer ${
                              selectedCurrency === curr
                                ? 'bg-[#10B981] text-white'
                                : 'bg-[#F4F4F5] text-[#71717A]'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 max-w-[150px]">
                        <span className="absolute left-2.5 top-1.5 text-[12px] text-[#71717A]">
                          {selectedCurrency === 'CLP' ? '$' : selectedCurrency === 'USD' ? 'US$' : '€'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={costMoneyAmount}
                          onChange={(e) => setCostMoneyAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-2 py-1.5 bg-[#FAFAFA] text-[#09090B] rounded-lg text-[13px] font-mono-numbers outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                        />
                      </div>
                      <span className="text-[12px] text-[#71717A]">al día</span>
                    </div>

                    {/* Proyección mensual clara */}
                    <div className="flex items-center justify-between p-2 bg-[#10B981]/10 rounded-xl text-[#047857] text-[11px] font-medium">
                      <span>Ahorro mensual proyectado:</span>
                      <span className="font-bold text-[12px] font-mono-numbers">
                        {selectedCurrency === 'CLP'
                          ? `$${(costMoneyAmount * 30).toLocaleString('es-CL')}`
                          : `${selectedCurrency === 'USD' ? 'US$' : '€'}${costMoneyAmount * 30}`}
                      </span>
                    </div>

                    {/* Chips rápidos de montos */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {(selectedCurrency === 'CLP'
                        ? [2000, 5000, 10000, 15000, 20000]
                        : [5, 10, 15, 20, 30]
                      ).map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setCostMoneyAmount(amount)}
                          className={`px-2 py-1 text-[10px] rounded-md transition-all cursor-pointer ${
                            costMoneyAmount === amount
                              ? 'bg-[#10B981] text-white font-bold'
                              : 'bg-[#F4F4F5] text-[#3F3F46] hover:bg-[#E4E4E7]'
                          }`}
                        >
                          {selectedCurrency === 'CLP' ? `$${amount / 1000}k` : `$${amount}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de Iniciar Compromiso */}
          <div className="pt-2">
            <button
              type="submit"
              id="confirmNewChallengeBtn"
              className="w-full min-h-[50px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px] text-[#FF5A00]">
                rocket_launch
              </span>
              <span className="truncate px-1">
                {challengeMode === 'record'
                  ? isInfinite
                    ? 'Iniciar Desafío Infinito (∞)'
                    : `Iniciar Desafío (${targetDays} Días)`
                  : `Activar Desafío Modo Libre (${accumulatedDays}d limpios)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
