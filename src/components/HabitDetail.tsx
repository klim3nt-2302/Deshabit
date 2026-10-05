import React, { useState } from 'react';
import { Habit } from '../types';
import { calculateCleanTime, getCurrentMilestone, calculateAntiPunitiveStats } from '../utils/timeFormat';
import { WeeklyMatrix } from './WeeklyMatrix';

interface HabitDetailProps {
  habit: Habit;
  currentTimestamp: number;
  onBack: () => void;
  backLabel?: string;
  onOpenSOSModal: () => void;
  onOpenSlipModal: () => void;
  onOpenNeuroModal: () => void;
  onAddReflection: (habitId: string, text: string) => void;
}

type TabType = 'progreso' | 'historial' | 'causas' | 'diario';

export const HabitDetail: React.FC<HabitDetailProps> = ({
  habit,
  currentTimestamp,
  onBack,
  backLabel = 'Inicio',
  onOpenSOSModal,
  onOpenSlipModal,
  onOpenNeuroModal,
  onAddReflection,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('progreso');
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [appBlockerActive, setAppBlockerActive] = useState(true);
  const [impactDimension, setImpactDimension] = useState<'ambos' | 'dinero' | 'tiempo'>('ambos');
  const [impactPeriod, setImpactPeriod] = useState<'semana' | 'mes' | 'año'>('semana');
  const [isReminderScheduled, setIsReminderScheduled] = useState(false);

  const cleanTime = calculateCleanTime(habit.startedAt, currentTimestamp);
  const targetDays = habit.targetDays || 50;
  const progressPct = Math.min(100, Math.max(1, Math.round((cleanTime.totalDays / targetDays) * 100)));
  const daysRemaining = Math.max(0, targetDays - cleanTime.days);
  const milestoneData = getCurrentMilestone(cleanTime.totalDays);
  const stats = calculateAntiPunitiveStats(habit, cleanTime.totalDays);

  // Financial and time calculations ($5.000 CLP / día y 3 min / día)
  const impactDays = impactPeriod === 'semana' ? 7 : impactPeriod === 'mes' ? 30 : 365;
  const impactMoneySavedCLP = impactDays * 5000;
  const impactMinutesSaved = impactDays * 3;

  const stipulatedDateCLP = new Date(currentTimestamp + impactDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedMoneyCLP = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(impactMoneySavedCLP);

  const formatRecoveredTime = (totalMins: number) => {
    if (totalMins < 60) return `${totalMins} min`;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  };

  const formattedTimeSaved = formatRecoveredTime(impactMinutesSaved);

  // Common trigger frequency statistics
  const triggerStats = [
    { name: 'Fatiga cognitiva nocturna', pct: 45 },
    { name: 'Estrés agudo laboral', pct: 30 },
    { name: 'Fricción ambiental o acceso directo', pct: 15 },
    { name: 'Aburrimiento reactivo', pct: 10 },
  ];

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddReflection(habit.id, newNoteText.trim());
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const startDateFormatted = new Date(habit.startedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const lastSlipFormatted = habit.slips.length > 0
    ? new Date(habit.slips[habit.slips.length - 1].timestamp).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      })
    : 'Sin recaídas registradas';

  return (
    <div className="w-full flex flex-col items-center">
      {/* 358px constrained container to match design system layout */}
      <div className="w-full max-w-[358px] flex flex-col gap-4 pb-24">
        {/* ============================================================ */}
        {/* 1. TOP NAV / BREADCRUMB: [ Inicio/Desafíos > Detalle ]      */}
        {/* ============================================================ */}
        <div className="w-full flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack}
            id="btn-back-to-home"
            aria-label={`Volver a ${backLabel}`}
            className="min-h-[44px] px-3.5 py-2 rounded-[14px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[#18181B] hover:text-[#09090B] hover:bg-[#F9F9FA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#09090B]">
              arrow_back
            </span>
            <span className="text-[13px] font-sans font-medium leading-[16px]">
              {backLabel}
            </span>
          </button>

          <div className="px-2.5 py-1 bg-[#ECECEE] rounded-[12px] flex items-center">
            <span className="text-[#3F3F46] text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px]">
              Detalle del desafío
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. TARJETA HÉROE                                             */}
        {/* ============================================================ */}
        <section
          aria-label={habit.isPriority ? 'Hábito Prioritario' : 'Detalle del Desafío'}
          className="w-full p-5 bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden rounded-[24px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-4"
        >
          {/* Top level row */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${
                  habit.status === 'completed' ? 'bg-[#09090B]' : 'bg-[#FF5A00]'
                }`}
              />
              <span className="text-[#18181B] text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px]">
                {habit.isPriority
                  ? 'HÁBITO PRIORITARIO'
                  : habit.status === 'completed'
                  ? 'DESAFÍO CULMINADO'
                  : habit.challengeMode || 'MODO DESAFÍO'}
              </span>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full flex items-center justify-center gap-1 ${
                habit.status === 'completed'
                  ? 'bg-[#09090B] text-white'
                  : 'bg-[#FF5A00] text-white'
              }`}
            >
              {habit.status === 'completed' && (
                <span className="material-symbols-outlined text-[13px] text-white">
                  check
                </span>
              )}
              <span className="text-white text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px]">
                {habit.status === 'completed' ? 'SUPERADO' : habit.phase || 'NIVEL 3'}
              </span>
            </div>
          </div>

          {/* Title and description with icon */}
          <div className="flex items-start gap-3">
            {habit.icon && (
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  habit.status === 'completed'
                    ? 'bg-[#F9F9FA] text-[#09090B] outline outline-1 outline-[#ECECEE] -outline-offset-1'
                    : 'bg-[#ECECEE]/50 text-[#FF5A00]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={habit.status === 'active' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {habit.icon}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[#09090B] text-[20px] font-sans font-semibold leading-[28px]">
                {habit.title}
              </h1>
              <p className="text-[#18181B] text-[13px] font-sans font-normal leading-[18px]">
                {habit.triggerDescription || habit.description || 'Disciplina estricta de abstinencia biológica'}
              </p>
            </div>
          </div>

          {/* Días invicto / completados */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-[#09090B] text-[36px] font-sans font-semibold leading-[42px]">
              {cleanTime.days}
            </span>
            <span className="text-[#18181B] text-[16px] font-sans font-medium leading-[24px]">
              {habit.status === 'completed' ? 'días completados' : 'días invicto'}
            </span>
          </div>

          {/* Live clean time block */}
          <div className="w-full px-3.5 py-2.5 bg-[#ECECEE]/50 rounded-[16px] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 relative flex items-center justify-center">
                <span
                  className={`w-2 h-2 absolute opacity-75 rounded-full ${
                    habit.status === 'completed' ? 'bg-[#09090B]' : 'bg-[#FF5A00] animate-ping'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    habit.status === 'completed' ? 'bg-[#09090B]' : 'bg-[#FF5A00]'
                  }`}
                />
              </div>
              <span className="text-[#3F3F46] text-[11px] font-sans font-semibold uppercase leading-[14px] tracking-[0.55px]">
                {habit.status === 'completed' ? 'TIEMPO TOTAL LIMPIO' : 'TIEMPO LIMPIO EN VIVO'}
              </span>
            </div>

            <div
              className="flex items-center gap-1.5"
              role="timer"
              aria-label={`Tiempo: ${cleanTime.hours} horas, ${cleanTime.minutes} minutos, ${cleanTime.seconds} segundos`}
            >
              <div className="flex flex-col items-center">
                <span className="text-black text-[20px] font-sans font-semibold leading-[28px]">
                  {String(cleanTime.hours).padStart(2, '0')}
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
                  {String(cleanTime.minutes).padStart(2, '0')}
                </span>
                <span className="text-[#3F3F46] text-[10px] font-sans font-medium uppercase leading-[10px]">
                  MIN
                </span>
              </div>

              <div className="pb-2 text-[#3F3F46] text-[13px] font-sans font-bold leading-[16px]">
                :
              </div>

              <div className="flex flex-col items-center">
                <span className={`${habit.status === 'completed' ? 'text-[#09090B]' : 'text-[#FF5A00]'} text-[20px] font-sans font-semibold leading-[28px]`}>
                  {String(cleanTime.seconds).padStart(2, '0')}
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
                {habit.status === 'completed'
                  ? `Meta superada: ${targetDays} de ${targetDays} días`
                  : `Próximo gran objetivo: ${targetDays} días`}
              </span>
              <span className="text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                {habit.status === 'completed' ? '100%' : `${progressPct}%`}
              </span>
            </div>
            <div className="w-full h-2 relative bg-[#ECECEE] overflow-hidden rounded-full">
              <div
                className={`h-2 absolute top-0 left-0 rounded-full transition-all duration-500 ease-out ${
                  habit.status === 'completed' ? 'bg-[#09090B]' : 'bg-[#FF5A00]'
                }`}
                style={{ width: `${habit.status === 'completed' ? 100 : Math.min(100, progressPct)}%` }}
              />
            </div>
          </div>

          {/* Behavioral quote */}
          <div className="p-4 bg-[#ECECEE]/50 rounded-[12px]">
            <p className="text-[#18181B] text-[13px] font-sans font-normal leading-[21.13px]">
              "{habit.cognitiveReinforcement || milestoneData.current.biologicalDescription || 'Vas en racha implacable. Tu capacidad pulmonar y niveles basales de dopamina han alcanzado niveles de restauración óptimos.'}"
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. BOTONES DE ACCIÓN DE INTERVENCIÓN                        */}
        {/* ============================================================ */}
        <section aria-label="Acciones de intervención" className="w-full grid grid-cols-2 gap-2.5">
          {habit.status === 'completed' ? (
            <div className="col-span-2 min-h-[48px] px-4 py-3 bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 rounded-[14px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#09090B]">
                  verified
                </span>
                <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                  Desafío Superado con Éxito
                </span>
              </div>
              <span className="text-[11px] font-sans font-medium text-[#3F3F46]">
                100% Consistencia
              </span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenSlipModal}
                id="btn-detail-record-slip"
                aria-label="Registrar recaída"
                className="min-h-[48px] px-3 bg-white text-[#18181B] outline outline-1 outline-[#ECECEE] -outline-offset-1 rounded-[14px] flex items-center justify-center gap-2 transition-colors hover:bg-[#F9F9FA] active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                  history
                </span>
                <span className="text-[13px] font-sans font-medium leading-[16px]">
                  Registrar recaída
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenSOSModal}
                id="btn-detail-sos-breathing"
                aria-label="Iniciar Enfoque rápido"
                className="min-h-[48px] px-3 bg-[#09090B] text-white outline outline-[1.5px] outline-[#2C2E34] -outline-offset-[1.5px] rounded-[14px] flex items-center justify-center gap-2 transition-all hover:bg-[#18181B] active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-white">
                  air
                </span>
                <span className="text-[13px] font-sans font-medium leading-[16px]">
                  Enfoque rápido
                </span>
              </button>
            </>
          )}
        </section>

        {/* ============================================================ */}
        {/* 4. TARJETA DE ESTADOS INTERACTIVOS: TABS                   */}
        {/* ============================================================ */}
        <section
          aria-label="Información del hábito"
          className="w-full bg-white rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-4"
        >
          {/* Segmented control tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#ECECEE]/50 rounded-[14px]" role="tablist">
            {(['progreso', 'historial', 'causas', 'diario'] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={`min-h-[44px] py-2 rounded-[10px] text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.44px] transition-all capitalize ${
                    isActive
                      ? 'bg-white text-[#09090B] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold'
                      : 'text-[#3F3F46] hover:text-[#09090B]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Progreso */}
          {activeTab === 'progreso' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-[16px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-sans font-medium text-[#3F3F46] leading-[14px] tracking-[0.44px] block">
                    Intervalo promedio limpio
                  </span>
                  <span className="text-[20px] font-sans font-semibold text-[#09090B] leading-[28px]">
                    {stats.averageCleanIntervalDays} días
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#E8F5E9] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#2E7D32]">
                    trending_up
                  </span>
                  <span className="text-[11px] font-sans font-medium text-[#2E7D32] leading-[14px] tracking-[0.44px]">
                    +{stats.expansionPercentage}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[16px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-sans font-medium text-[#3F3F46] leading-[14px] tracking-[0.44px] block">
                    Retención de neuroplasticidad
                  </span>
                  <span className="text-[20px] font-sans font-semibold text-[#09090B] leading-[28px]">
                    {stats.synapticRetentionPct}%
                  </span>
                </div>
                <span className="material-symbols-outlined text-[20px] text-[#09090B]">
                  verified_user
                </span>
              </div>

              <p className="text-[13px] font-sans font-normal text-[#18181B] leading-[20px]">
                La neurobiología demuestra que un desliz aislado no destruye los circuitos formados. El tiempo promedio entre desvíos se amplía progresivamente.
              </p>
            </div>
          )}

          {/* Tab 2: Historial */}
          {activeTab === 'historial' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-sans font-medium text-[#3F3F46] uppercase leading-[14px] tracking-[0.55px]">
                Registro cronológico de ciclos
              </span>

              {habit.slips.length === 0 ? (
                <p className="text-[13px] font-sans font-normal text-[#3F3F46] py-3 text-center">
                  Sin desvíos registrados. Racha inicial continua en curso.
                </p>
              ) : (
                habit.slips.map((slip) => (
                  <div
                    key={slip.id}
                    className="p-3 rounded-[14px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-1 text-[13px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#09090B]">{slip.trigger}</span>
                      <span className="text-[11px] text-[#3F3F46] font-medium">
                        {new Date(slip.timestamp).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {slip.notes && (
                      <p className="text-[12px] text-[#18181B] italic leading-relaxed">
                        "{slip.notes}"
                      </p>
                    )}
                    <span className="text-[11px] text-[#3F3F46]">
                      Intervalo previo sostenido: {slip.intervalBeforeSlipDays} días
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Causas */}
          {activeTab === 'causas' && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-sans font-medium text-[#3F3F46] uppercase leading-[14px] tracking-[0.55px]">
                Detonantes recurrentes identificados
              </span>

              <div className="flex flex-col gap-2.5">
                {triggerStats.map((item) => (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#18181B] font-normal">{item.name}</span>
                      <span className="font-medium text-[#09090B]">{item.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#ECECEE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#09090B] rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[12px] font-sans font-normal text-[#3F3F46] leading-[18px]">
                El 75% de los impulsos se concentran en la fatiga cognitiva tardía. La recomendación primaria es incrementar la fricción ambiental.
              </p>
            </div>
          )}

          {/* Tab 4: Diario */}
          {activeTab === 'diario' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-medium text-[#3F3F46] uppercase leading-[14px] tracking-[0.55px]">
                  Reflexiones y registros cognitivos
                </span>

                <button
                  type="button"
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="min-h-[44px] px-2.5 py-1 text-[12px] font-sans font-medium text-[#09090B] flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Añadir nota</span>
                </button>
              </div>

              {isAddingNote && (
                <form onSubmit={handleCreateNote} className="flex flex-col gap-2.5 p-3 rounded-[14px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="¿Cómo manejaste el último impulso? ¿Qué fricción te ayudó?"
                    rows={2}
                    className="w-full p-2.5 rounded-[10px] bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-[#09090B]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="min-h-[44px] px-3 py-1.5 text-[12px] font-sans font-medium text-[#3F3F46]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] px-4 py-1.5 bg-[#09090B] text-white text-[12px] font-sans font-medium rounded-[10px]"
                    >
                      Guardar nota
                    </button>
                  </div>
                </form>
              )}

              {habit.reflections.length === 0 ? (
                <p className="text-[13px] font-sans font-normal text-[#3F3F46] py-2 text-center">
                  No hay notas en el diario aún. Registra reflexiones breves tras superar impulsos.
                </p>
              ) : (
                habit.reflections.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 rounded-[14px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-1 text-[13px]"
                  >
                    <p className="text-[#18181B] leading-relaxed">{ref.text}</p>
                    <span className="text-[11px] text-[#3F3F46]">
                      {new Date(ref.timestamp).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 6. MATRIZ SEMANAL CONSOLIDADA                                */}
        {/* ============================================================ */}
        <WeeklyMatrix
          weekLog={habit.weeklyLog}
          title="Vista Rápida de la Semana"
        />

        {/* ============================================================ */}
        {/* 7. TARJETA: ANÁLISIS DEL DESAFÍO                            */}
        {/* ============================================================ */}
        <section
          aria-label="Análisis del Desafío"
          className="w-full bg-white rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-4"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                psychology
              </span>
              <h2 className="text-[16px] font-sans font-semibold text-[#09090B] leading-[22px]">
                Análisis del Desafío
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-[#FF5A00] text-white text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.55px] rounded-[12px]">
              Módulos Pro
            </span>
          </div>

          {/* Sub-block 1: Análisis Predictivo de IA */}
          <div className="p-3.5 rounded-[16px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#09090B]">
                <span className="material-symbols-outlined text-[16px] text-[#09090B]">
                  insights
                </span>
                <span>Análisis Predictivo de IA</span>
              </div>
            </div>

            <p className="text-[12px] font-sans text-[#3F3F46] leading-relaxed">
              Patrón circadiano identificado: <strong>Mayor probabilidad los jueves entre 20:00 y 23:30</strong> (asociada al valle de cortisol y agotamiento de la reserva inhibitoria prefrontal).
            </p>

            <button
              type="button"
              onClick={() => setIsReminderScheduled(!isReminderScheduled)}
              id="btn-schedule-reminder"
              className="min-h-[44px] px-3.5 py-2 rounded-[12px] bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[#09090B] text-[12px] font-sans font-medium hover:bg-[#F9F9FA] transition-colors flex items-center justify-center gap-2 self-start mt-1"
            >
              <span className="material-symbols-outlined text-[16px] text-[#FF5A00]">
                alarm
              </span>
              <span>
                {isReminderScheduled
                  ? 'Recordatorio preventivo activo · 19:45'
                  : 'Programar recordatorio preventivo'}
              </span>
            </button>
          </div>

          {/* Sub-block 2: App Blocker */}
          <div className="p-3.5 rounded-[16px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#09090B]">
                <span className="material-symbols-outlined text-[16px] text-[#09090B]">
                  lock
                </span>
                <span>App Blocker</span>
              </div>

              {/* Accessible interactive switch */}
              <button
                type="button"
                role="switch"
                aria-checked={appBlockerActive}
                onClick={() => setAppBlockerActive(!appBlockerActive)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  appBlockerActive ? 'bg-[#09090B]' : 'bg-[#D4D4D8]'
                }`}
                aria-label="Alternar blindaje de aplicaciones"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    appBlockerActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[12px] font-sans text-[#3F3F46] leading-relaxed">
              Bloquea aplicaciones de delivery y redes sociales durante tu ventana vulnerable para introducir fricción insalvable.
            </p>

            {/* Blocked App Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="px-2.5 py-1 rounded-[12px] bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                Instagram
              </span>
              <span className="px-2.5 py-1 rounded-[12px] bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                TikTok
              </span>
              <span className="px-2.5 py-1 rounded-[12px] bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                UberEats
              </span>
              <span className="px-2.5 py-1 rounded-[12px] bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[#18181B] text-[11px] font-sans font-medium leading-[14px] tracking-[0.44px]">
                Delivery
              </span>
              <span
                className={`px-2.5 py-1 rounded-[12px] text-[11px] font-sans font-semibold leading-[14px] tracking-[0.44px] ${
                  appBlockerActive
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#ECECEE] text-[#3F3F46]'
                }`}
              >
                {appBlockerActive ? 'Blindaje Activo' : 'En Pausa'}
              </span>
            </div>
          </div>

          {/* Sub-block 3: Calculadora de Impacto */}
          <div className="p-3.5 rounded-[16px] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#09090B]">
                <span className="material-symbols-outlined text-[16px] text-[#FF5A00]">
                  savings
                </span>
                <span>Calculadora de Impacto</span>
              </div>

              {/* Selector de Impacto: Ambos | Dinero | Tiempo */}
              <div className="flex items-center bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 rounded-[10px] p-0.5">
                <button
                  type="button"
                  onClick={() => setImpactDimension('ambos')}
                  id="btn-impact-ambos"
                  aria-pressed={impactDimension === 'ambos'}
                  className={`min-h-[28px] px-2 py-0.5 rounded-[8px] text-[11px] font-sans font-medium transition-colors cursor-pointer ${
                    impactDimension === 'ambos'
                      ? 'bg-[#09090B] text-white'
                      : 'text-[#3F3F46] hover:text-[#09090B]'
                  }`}
                >
                  Ambos
                </button>
                <button
                  type="button"
                  onClick={() => setImpactDimension('dinero')}
                  id="btn-impact-dinero"
                  aria-pressed={impactDimension === 'dinero'}
                  className={`min-h-[28px] px-2 py-0.5 rounded-[8px] text-[11px] font-sans font-medium transition-colors cursor-pointer ${
                    impactDimension === 'dinero'
                      ? 'bg-[#09090B] text-white'
                      : 'text-[#3F3F46] hover:text-[#09090B]'
                  }`}
                >
                  Dinero
                </button>
                <button
                  type="button"
                  onClick={() => setImpactDimension('tiempo')}
                  id="btn-impact-tiempo"
                  aria-pressed={impactDimension === 'tiempo'}
                  className={`min-h-[28px] px-2 py-0.5 rounded-[8px] text-[11px] font-sans font-medium transition-colors cursor-pointer ${
                    impactDimension === 'tiempo'
                      ? 'bg-[#09090B] text-white'
                      : 'text-[#3F3F46] hover:text-[#09090B]'
                  }`}
                >
                  Tiempo
                </button>
              </div>
            </div>

            {/* Selector de Periodo: Semana | Mes | Año */}
            <div
              className="grid grid-cols-3 gap-1 p-1 bg-[#ECECEE]/50 rounded-[12px]"
              role="tablist"
              aria-label="Periodo estipulado"
            >
              {(['semana', 'mes', 'año'] as const).map((period) => {
                const isActive = impactPeriod === period;
                const label = period === 'semana' ? 'Semana' : period === 'mes' ? 'Mes' : 'Año';
                return (
                  <button
                    key={period}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setImpactPeriod(period)}
                    id={`tab-impact-period-${period}`}
                    className={`min-h-[34px] py-1.5 rounded-[8px] text-[11px] font-sans font-medium uppercase leading-[14px] tracking-[0.44px] transition-all capitalize cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#09090B] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold'
                        : 'text-[#3F3F46] hover:text-[#09090B]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Impact Display Cards */}
            <div className={`grid gap-2 pt-0.5 ${impactDimension === 'ambos' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Dinero Card */}
              {(impactDimension === 'dinero' || impactDimension === 'ambos') && (
                <div className="bg-white p-3 rounded-[14px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-medium text-[#3F3F46] uppercase leading-[14px] tracking-[0.44px]">
                      Ahorro Dinero
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#09090B]">
                      payments
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[18px] sm:text-[20px] font-sans font-semibold text-[#09090B] leading-[24px]">
                      {formattedMoneyCLP}
                    </span>
                    <span className="text-[10px] font-sans font-normal text-[#71717A] leading-[13px]">
                      $5.000 CLP / día ({impactDays}d)
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-[#ECECEE] flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans text-[#18181B]">
                    <span className="material-symbols-outlined text-[13px] text-[#FF5A00] shrink-0">
                      event
                    </span>
                    <span className="truncate font-medium">
                      Estipulado: {stipulatedDateCLP}
                    </span>
                  </div>
                </div>
              )}

              {/* Tiempo Card */}
              {(impactDimension === 'tiempo' || impactDimension === 'ambos') && (
                <div className="bg-white p-3 rounded-[14px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-medium text-[#3F3F46] uppercase leading-[14px] tracking-[0.44px]">
                      Tiempo Ganado
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#09090B]">
                      schedule
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[18px] sm:text-[20px] font-sans font-semibold text-[#09090B] leading-[24px]">
                      {formattedTimeSaved}
                    </span>
                    <span className="text-[10px] font-sans font-normal text-[#71717A] leading-[13px]">
                      3 min / día ({impactDays}d)
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-[#ECECEE] flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans text-[#18181B]">
                    <span className="material-symbols-outlined text-[13px] text-[#FF5A00] shrink-0">
                      event
                    </span>
                    <span className="truncate font-medium">
                      Estipulado: {stipulatedDateCLP}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] font-sans font-normal text-[#3F3F46] leading-[16px]">
              Proyección acumulativa de capital y tiempo disponible reinvertido en tu bienestar bio-cognitivo.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. TARJETA: METADATOS DEL DESAFÍO                           */}
        {/* ============================================================ */}
        <section
          aria-label="Metadatos del Desafío"
          className="w-full bg-white rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-2.5"
        >
          <h2 className="text-[14px] font-sans font-semibold text-[#09090B] leading-[20px]">
            Metadatos del Desafío
          </h2>

          <div className="flex flex-col gap-2 text-[12px] font-sans">
            <div className="flex justify-between items-center">
              <span className="text-[#3F3F46]">Inicio del desafío:</span>
              <span className="text-[#18181B] font-medium">{startDateFormatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3F3F46]">Última recaída:</span>
              <span className="text-[#18181B] font-medium">{lastSlipFormatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3F3F46]">Duración del ciclo actual:</span>
              <span className="text-[#09090B] font-medium">{cleanTime.days} días, {cleanTime.hours} horas</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
