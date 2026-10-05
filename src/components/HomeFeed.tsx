import React, { useState } from 'react';
import { Habit } from '../types';
import { calculateCleanTime } from '../utils/timeFormat';
import { WeeklyMatrix } from './WeeklyMatrix';
import { FloatingNewChallengeButton } from './FloatingNewChallengeButton';
import { NotificationBellButton } from './NotificationBellButton';

interface HomeFeedProps {
  habits: Habit[];
  currentTimestamp: number;
  userName?: string;
  totalStreakDays?: number;
  onSelectHabit: (habit: Habit) => void;
  onConfirmCleanDay: (habitId: string) => void;
  onToggleCleanDay?: (habitId: string) => void;
  onOpenSlipModalForHabit: (habit: Habit) => void;
  onOpenCreateModal: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenNeuroModal: () => void;
  unreadNotificationsCount?: number;
}

// Helper function to guarantee semantic icon resolution according to design system
export const getHabitIcon = (habit: Habit): string => {
  if (habit.id === 'habit-azucar' || habit.title.toLowerCase().includes('azúcar') || habit.title.toLowerCase().includes('azucar')) {
    return 'nutrition';
  }
  if (habit.id === 'habit-redes' || habit.title.toLowerCase().includes('redes') || habit.title.toLowerCase().includes('pantalla')) {
    return 'devices';
  }
  if (habit.id === 'habit-compras' || habit.title.toLowerCase().includes('compras')) {
    return 'account_balance_wallet';
  }
  if (habit.id === 'habit-cero-cigarrillo' || habit.title.toLowerCase().includes('cigarrillo')) {
    return 'smoke_free';
  }
  if (habit.icon) return habit.icon;
  if (habit.category?.toLowerCase() === 'salud') return 'nutrition';
  if (habit.category?.toLowerCase() === 'foco') return 'devices';
  return 'star';
};

export const HomeFeed: React.FC<HomeFeedProps> = ({
  habits,
  currentTimestamp,
  userName,
  totalStreakDays,
  onSelectHabit,
  onConfirmCleanDay,
  onToggleCleanDay,
  onOpenSlipModalForHabit: _onOpenSlipModalForHabit,
  onOpenCreateModal,
  onOpenNotifications,
  onOpenSettings,
  onOpenNeuroModal: _onOpenNeuroModal,
  unreadNotificationsCount = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Salud' | 'Foco'>('Todos');
  const todayStr = new Date().toISOString().split('T')[0];

  // Priority habit: flagged with isPriority or default to first habit
  const priorityHabit = habits.find((h) => h.isPriority) || habits[0];

  // Dynamic clean time for priority habit
  const priorityCleanTime = priorityHabit
    ? calculateCleanTime(priorityHabit.startedAt, currentTimestamp)
    : null;

  const currentDays = priorityCleanTime?.days ?? 42;
  const currentHours = priorityCleanTime?.hours ?? 14;
  const currentMinutes = priorityCleanTime?.minutes ?? 32;
  const currentSeconds = priorityCleanTime?.seconds ?? 45;

  // Habits listed in "Mis Hábitos":
  // We exclude the priority habit displayed in the Hero card at the top.
  // If only 1 habit exists in total, fallback to showing all.
  const candidateHabits = habits.length > 1
    ? habits.filter((h) => !h.isPriority)
    : habits;

  // Filter habits by category: ['Todos', 'Salud', 'Foco']
  const filteredHabits = selectedCategory === 'Todos'
    ? candidateHabits
    : candidateHabits.filter((h) => h.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleActionClick = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    if (onToggleCleanDay) {
      onToggleCleanDay(habitId);
    } else {
      onConfirmCleanDay(habitId);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container matching 358px width from user specification */}
      <div className="w-full max-w-[358px] flex flex-col gap-3">
        {/* ============================================================ */}
        {/* 1. CABECERA CONTEXTUAL Y PÍLDORA DE CONSISTENCIA GLOBAL */}
        {/* ============================================================ */}
        <header className="w-full pb-1 flex flex-col gap-3">
          <div className="w-full flex justify-between items-start">
            <div className="pt-1.5 flex flex-col gap-1">
              <span className="text-[#3F3F46] text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px]">
                JUEVES, 24 DE OCTUBRE
              </span>
              <h1 className="text-[#09090B] text-[24px] font-sans font-semibold leading-[32px]">
                Hola, {userName ? userName.split(' ')[0] : 'Alejandro'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notificaciones */}
              <NotificationBellButton
                id="btn-header-notifications"
                unreadCount={unreadNotificationsCount}
                onClick={onOpenNotifications}
              />

              {/* Ajustes / Tune */}
              <button
                type="button"
                onClick={onOpenSettings}
                id="btn-header-tune"
                aria-label="Ajustes de vista"
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center transition-colors hover:bg-[#f9f9fa]"
              >
                <span className="material-symbols-outlined text-[20px] text-[#18181B]">
                  tune
                </span>
              </button>
            </div>
          </div>

          {/* Píldora de métrica global */}
          <div className="w-full px-4 py-2 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#FF5A00]/15 rounded-full flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[13px] text-[#FF5A00]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
              </div>
              <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                {totalStreakDays !== undefined ? String(totalStreakDays).padStart(2, '0') : '02'} días en racha total
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-1.5 h-1.5 bg-[#D4D4D8] rounded-full" />
              <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                92% de consistencia
              </span>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. TARJETA HÉROE DEL HÁBITO PRIORITARIO */}
        {/* ============================================================ */}
        <section
          aria-label="Hábito Prioritario"
          className="w-full p-5 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden rounded-[24px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-4 cursor-pointer"
          onClick={() => priorityHabit && onSelectHabit(priorityHabit)}
        >
          {/* Top level row */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-2 h-2 bg-[#FF5A00] rounded-full" />
              <span className="text-[#18181B] text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px]">
                HÁBITO PRIORITARIO
              </span>
            </div>
            <div className="px-2.5 py-1 bg-[#FF5A00] rounded-full flex items-center justify-center">
              <span className="text-white text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px]">
                NIVEL 3
              </span>
            </div>
          </div>

          {/* Title and description */}
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[#09090B] text-[20px] font-sans font-semibold leading-[28px]">
              {priorityHabit?.title || 'Cero cigarrillo y nicotina'}
            </h2>
            <p className="text-[#18181B] text-[13px] font-sans font-normal leading-[18px]">
              {priorityHabit?.triggerDescription || priorityHabit?.description || 'Disciplina estricta de abstinencia biológica'}
            </p>
          </div>

          {/* 42 días invicto */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-[#09090B] text-[36px] font-sans font-semibold leading-[42px]">
              {currentDays}
            </span>
            <span className="text-[#18181B] text-[16px] font-sans font-medium leading-[24px]">
              días invicto
            </span>
          </div>

          {/* Live clean time block */}
          <div className="w-full px-3.5 py-2.5 bg-[#ECECEE]/50 rounded-[16px] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 relative flex items-center justify-center">
                <span className="w-2 h-2 absolute opacity-75 bg-[#FF5A00] rounded-full animate-ping" />
                <span className="w-2 h-2 bg-[#FF5A00] rounded-full" />
              </div>
              <span className="text-[#3F3F46] text-[11px] font-sans font-semibold uppercase leading-[14px] tracking-[0.55px]">
                TIEMPO LIMPIO EN VIVO
              </span>
            </div>

            <div
              className="flex items-center gap-1.5"
              role="timer"
              aria-label={`Tiempo: ${currentHours} horas, ${currentMinutes} minutos, ${currentSeconds} segundos`}
            >
              <div className="flex flex-col items-center">
                <span className="text-black text-[20px] font-sans font-semibold leading-[28px]">
                  {String(currentHours).padStart(2, '0')}
                </span>
                <span className="text-[#3F3F46] text-[10px] font-sans font-medium uppercase leading-[10px]">
                  HRS
                </span>
              </div>

              <div className="pb-2 text-[#3F3F46] text-[13px] font-sans font-bold leading-[16px]">
                :
              </div>

              <div className="flex flex-col items-center">
                <span className="text-black text-[20px] font-sans font-semibold leading-[28px]">
                  {String(currentMinutes).padStart(2, '0')}
                </span>
                <span className="text-[#3F3F46] text-[10px] font-sans font-medium uppercase leading-[10px]">
                  MIN
                </span>
              </div>

              <div className="pb-2 text-[#3F3F46] text-[13px] font-sans font-bold leading-[16px]">
                :
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[#FF5A00] text-[20px] font-sans font-semibold leading-[28px]">
                  {String(currentSeconds).padStart(2, '0')}
                </span>
                <span className="text-[#3F3F46] text-[10px] font-sans font-medium uppercase leading-[10px]">
                  SEG
                </span>
              </div>
            </div>
          </div>

          {/* Goal progress gauge */}
          <div className="pt-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                Próximo gran objetivo: {priorityHabit?.targetDays || 50} días
              </span>
              <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                {Math.min(100, Math.round(((priorityCleanTime?.totalDays || 42) / (priorityHabit?.targetDays || 50)) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 relative bg-[#ECECEE] overflow-hidden rounded-full">
              <div
                className="h-2 absolute top-0 left-0 bg-[#09090B] rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.round(((priorityCleanTime?.totalDays || 42) / (priorityHabit?.targetDays || 50)) * 100))}%`
                }}
              />
            </div>
          </div>

          {/* Behavioral quote */}
          <div className="p-4 bg-[#ECECEE]/50 rounded-[12px]">
            <p className="text-[#18181B] text-[13px] font-sans font-normal leading-[21.13px]">
              "{priorityHabit?.cognitiveReinforcement || 'Vas en racha implacable. Tu capacidad pulmonar y niveles basales de dopamina han alcanzado niveles de restauración óptimos.'}"
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. LISTA DE DESAFÍOS ACTIVOS ("MIS HÁBITOS") */}
        {/* ============================================================ */}
        <section aria-label="Mis Hábitos" className="w-full flex flex-col gap-3">
          {/* Header & filters */}
          <div className="px-1 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[#09090B] text-[18px] sm:text-[20px] font-sans font-semibold leading-[26px] sm:leading-[28px]">
                Mis Hábitos
              </h2>
              <div
                className="w-6 h-6 bg-[#ECECEE] rounded-full flex items-center justify-center transition-all duration-200"
                aria-label={`${filteredHabits.length} hábitos en categoría ${selectedCategory}`}
              >
                <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                  {filteredHabits.length}
                </span>
              </div>
            </div>

            {/* Segmented slide filter tabs: [Todos, Salud, Foco] */}
            <div
              className="p-1 bg-[#ECECEE]/70 rounded-[14px] flex items-center gap-1 shadow-inner"
              role="tablist"
              aria-label="Filtro de hábitos por categoría"
            >
              {(['Todos', 'Salud', 'Foco'] as const).map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    id={`tab-category-${cat.toLowerCase()}`}
                    aria-selected={isActive}
                    aria-controls="habit-cards-list"
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[44px] px-3 sm:px-3.5 py-2 rounded-[10px] font-sans text-[12px] sm:text-[13px] font-medium leading-[16px] transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.06)] text-[#09090B] font-semibold'
                        : 'text-[#3F3F46] hover:text-[#09090B] hover:bg-white/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards container */}
          <div
            id="habit-cards-list"
            role="region"
            aria-live="polite"
            className="w-full flex flex-col gap-3 transition-all duration-200"
          >
            {filteredHabits.map((habit) => {
              const isCompletedToday = habit.lastCleanDayConfirmedDate === todayStr;
              const cleanTime = calculateCleanTime(habit.startedAt, currentTimestamp);
              const targetDays = habit.targetDays || 21;
              const progressPct = Math.min(100, Math.max(2, Math.round((cleanTime.days / targetDays) * 100)));
              const daysRemaining = Math.max(0, targetDays - cleanTime.days);

              return (
                <article
                  key={habit.id}
                  id={`habit-card-${habit.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectHabit(habit)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectHabit(habit);
                    }
                  }}
                  aria-label={`Ver detalles del desafío: ${habit.title}`}
                  className="w-full p-4 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-3 cursor-pointer hover:shadow-[0px_4px_12px_rgba(0,0,0,0.06)] hover:outline-[#D4D4D8] transition-all duration-200 active:scale-[0.99] focus:outline-[#09090B] focus:outline-2"
                >
                  <div className="w-full flex justify-between items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-[#ECECEE]/70 rounded-[16px] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-[#09090B]">
                          {getHabitIcon(habit)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#09090B] text-[14px] sm:text-[15px] font-sans font-semibold leading-[20px] sm:leading-[22px] truncate">
                          {habit.title}
                        </h3>
                        <p className="text-[#18181B] text-[10px] sm:text-[11px] font-sans font-normal leading-[16px] truncate">
                          {cleanTime.days}d {cleanTime.hours}h {cleanTime.minutes}m {cleanTime.seconds}s · {isCompletedToday ? 'Completado' : (habit.slips.length > 0 ? 'con desvíos' : 'sin recaída')}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Action Button with fluid UX micro-interaction */}
                    {isCompletedToday ? (
                      <button
                        type="button"
                        onClick={(e) => handleActionClick(e, habit.id)}
                        id={`btn-completed-${habit.id}`}
                        aria-label={`Completado hoy para ${habit.title}. Haz clic para revertir.`}
                        title="Día registrado hoy. Haz clic para desmarcar."
                        className="min-h-[44px] px-3.5 sm:px-4 py-2 bg-[#09090B] hover:bg-[#18181B] active:scale-95 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[14px] flex items-center gap-1.5 transition-all duration-200 cursor-pointer outline outline-1 outline-transparent hover:outline-[#2C2E34] group shrink-0"
                      >
                        <span
                          className="material-symbols-outlined text-[15px] text-white transition-transform group-hover:scale-110"
                        >
                          check
                        </span>
                        <span className="text-white text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px] whitespace-nowrap">
                          Completado
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleActionClick(e, habit.id)}
                        id={`btn-register-${habit.id}`}
                        aria-label={`Registrar día limpio para ${habit.title}`}
                        title="Registrar día limpio de hoy"
                        className="min-h-[44px] px-3 sm:px-3.5 py-2 bg-[#ECECEE]/70 hover:bg-[#ECECEE] active:scale-95 rounded-[14px] flex items-center gap-1.5 transition-all duration-200 cursor-pointer outline outline-1 outline-transparent hover:outline-[#D4D4D8] group shrink-0"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#18181B] transition-transform group-hover:scale-110">
                          check
                        </span>
                        <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px] whitespace-nowrap">
                          Registrar día
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Goal Progress Bar - Oculto al momento de marcar el registro del hábito */}
                  {!isCompletedToday && (
                    <div className="pt-1 flex flex-col gap-1.5 transition-all duration-300">
                      <div className="flex justify-between items-start text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                        <span>
                          Meta {targetDays} días · {daysRemaining === 0 ? 'Meta alcanzada' : `faltan ${daysRemaining} días`}
                        </span>
                        <span>
                          {progressPct}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={cleanTime.days}
                        aria-valuemin={0}
                        aria-valuemax={targetDays}
                        aria-label={`Progreso de ${habit.title}: ${progressPct}%`}
                        className="w-full h-2 relative bg-[#ECECEE] overflow-hidden rounded-full"
                      >
                        <div
                          className="h-2 bg-[#FF5A00] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredHabits.length === 0 && (
              <div className="w-full py-8 px-4 bg-white rounded-[16px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col items-center justify-center gap-2 text-center">
                <span className="material-symbols-outlined text-[28px] text-[#3F3F46]">
                  filter_list_off
                </span>
                <p className="text-[13px] font-sans font-medium text-[#18181B]">
                  No hay hábitos registrados en la categoría {selectedCategory}.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Todos')}
                  className="min-h-[44px] px-3.5 py-2 text-[12px] font-sans font-medium text-[#FF5A00] hover:underline cursor-pointer"
                >
                  Ver todos los hábitos
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. MATRIZ SEMANAL CONSOLIDADA (ÚLTIMOS 7 DÍAS) */}
        {/* ============================================================ */}
        <WeeklyMatrix weekLog={priorityHabit?.weeklyLog} />

        {/* ============================================================ */}
        {/* 5. BOTÓN DE ACCIÓN FLOTANTE (FAB CON 50% TRANSPARENCIA)      */}
        {/* ============================================================ */}
        <FloatingNewChallengeButton
          onClick={onOpenCreateModal}
          id="fab-nuevo-desafio"
          ariaLabel="Nuevo desafío"
        />
      </div>
    </div>
  );
};
