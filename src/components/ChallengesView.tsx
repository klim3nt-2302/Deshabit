import React, { useState } from 'react';
import { ChallengeItem } from '../types';
import { FloatingNewChallengeButton } from './FloatingNewChallengeButton';
import { StreakAnalyticsModal } from './StreakAnalyticsModal';
import { CreateChallengeModal } from './CreateChallengeModal';
import { NotificationBellButton } from './NotificationBellButton';

interface ChallengesViewProps {
  challenges: ChallengeItem[];
  onSelectChallenge: (challenge: ChallengeItem) => void;
  onAddChallenge: (challenge: Omit<ChallengeItem, 'id'>) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  onOpenSettings: () => void;
  currencyPreference?: 'CLP' | 'USD';
}

type FilterType = 'all' | 'completed' | 'active' | 'health_foco';

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  onSelectChallenge,
  onAddChallenge,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenSettings,
  currencyPreference = 'CLP',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Filtered challenges
  const filteredChallenges = challenges.filter((c) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'completed') return c.status === 'completed';
    if (selectedFilter === 'active') return c.status === 'active';
    if (selectedFilter === 'health_foco') return c.category === 'health' || c.category === 'foco';
    return true;
  });

  const totalCompleted = challenges.filter((c) => c.status === 'completed').length;
  const totalActive = challenges.filter((c) => c.status === 'active').length;
  const totalDaysClean = challenges.reduce((acc, c) => acc + c.completedDays, 0);

  return (
    <div className="w-full flex flex-col gap-6 pb-28">
      {/* ============================================================ */}
      {/* 1. HEADER DE SECCIÓN Y ACCIÓN RÁPIDA                       */}
      {/* ============================================================ */}
      <header className="w-full flex items-center justify-between py-2">
        <div>
          <h1 className="text-[24px] font-sans font-semibold text-[#09090B] tracking-tight leading-[32px]">
            Desafíos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBellButton
            id="btn-challenges-notifications"
            unreadCount={unreadNotificationsCount}
            onClick={onOpenNotifications}
          />

          <button
            type="button"
            onClick={onOpenSettings}
            id="btn-challenges-settings"
            aria-label="Ajustes y filtros"
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center text-[#3F3F46] hover:text-[#09090B] transition-colors cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
              tune
            </span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MÉTRICAS DE LOGRO CONSOLIDADO (STATS CARD)              */}
      {/* ============================================================ */}
      <section
        aria-label="Impacto acumulado"
        className="w-full bg-white rounded-3xl p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#3F3F46] font-semibold">
            Impacto acumulado
          </span>
        </div>

        {/* 3 Columnas Simétricas */}
        <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="text-[24px] font-sans font-semibold tracking-tight text-[#09090B]">
              {totalCompleted}
            </span>
            <span className="text-[11px] font-sans text-[#3F3F46] leading-tight mt-1.5">
              Desafíos superados
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="text-[24px] font-sans font-semibold tracking-tight text-[#09090B]">
              {totalDaysClean}
            </span>
            <span className="text-[11px] font-sans text-[#3F3F46] leading-tight mt-1.5">
              Días limpios totales
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="text-[24px] font-sans font-semibold tracking-tight text-[#09090B]">
              100%
            </span>
            <span className="text-[11px] font-sans text-[#3F3F46] leading-tight mt-1.5">
              Éxito en fases
            </span>
          </div>
        </div>

        {/* Barra de progreso general integrada */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex justify-between items-center text-[12px] font-sans">
            <span className="text-[#3F3F46] font-medium">Ciclo Anual 2024</span>
            <span className="text-[#09090B] font-semibold">8 de 10 hitos</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#ECECEE] overflow-hidden">
            <div className="h-full bg-[#09090B] rounded-full transition-all duration-500" style={{ width: '80%' }} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. VISUAL DELIGHT: VISUAL MILESTONE SPARKLINE (MICRO-INTERACTIVA) */}
      {/* ============================================================ */}
      <section
        role="button"
        tabIndex={0}
        onClick={() => setIsStreakModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsStreakModalOpen(true);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isStreakModalOpen}
        aria-label="Racha Histórica Activa: 34 días sin interrupciones. Toca para ver la analítica y desglose de la gráfica"
        className="w-full bg-white rounded-3xl p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-between gap-3 cursor-pointer group hover:shadow-[0px_6px_20px_rgba(0,0,0,0.07)] hover:outline-[#D4D4D8] active:scale-[0.99] transition-all duration-200 select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#ECECEE]/50 group-hover:bg-[#FF5A00]/10 flex items-center justify-center shrink-0 text-[#FF5A00] transition-colors duration-200">
            <span
              className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#3F3F46] font-semibold truncate leading-tight">
              Racha Histórica Activa
            </span>
            <span className="text-[14px] font-sans font-semibold text-[#09090B] truncate group-hover:text-[#FF5A00] transition-colors duration-200 mt-0.5">
              34 días sin interrupciones
            </span>
          </div>
        </div>

        {/* Mini sparkline chart inline SVG */}
        <svg
          className="w-18 h-7 shrink-0 text-[#FF5A00] transition-transform duration-200 group-hover:scale-105"
          fill="none"
          viewBox="0 0 80 28"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 24 L14 18 L26 21 L38 12 L50 14 L62 6 L78 3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <circle cx="78" cy="3" fill="currentColor" r="2.5" />
          <circle
            cx="78"
            cy="3"
            fill="currentColor"
            r="4.5"
            className="animate-ping opacity-60"
          />
        </svg>

        {/* Affordance chevron */}
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
        >
          chevron_right
        </span>
      </section>

      {/* ============================================================ */}
      {/* 4. FILTROS DE HISTORIAL (SEGMENTED PILLS)                  */}
      {/* ============================================================ */}
      <section
        aria-label="Filtros de desafíos"
        className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        id="filterContainer"
      >
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[12px] font-sans font-medium transition-colors cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-white text-[#3F3F46] outline outline-1 outline-[#ECECEE] -outline-offset-1 hover:text-[#09090B]'
          }`}
        >
          Todos ({challenges.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('completed')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[12px] font-sans font-medium transition-colors cursor-pointer ${
            selectedFilter === 'completed'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-white text-[#3F3F46] outline outline-1 outline-[#ECECEE] -outline-offset-1 hover:text-[#09090B]'
          }`}
        >
          Superados
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('active')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[12px] font-sans font-medium transition-colors cursor-pointer ${
            selectedFilter === 'active'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-white text-[#3F3F46] outline outline-1 outline-[#ECECEE] -outline-offset-1 hover:text-[#09090B]'
          }`}
        >
          En curso ({totalActive})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('health_foco')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[12px] font-sans font-medium transition-colors cursor-pointer ${
            selectedFilter === 'health_foco'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-white text-[#3F3F46] outline outline-1 outline-[#ECECEE] -outline-offset-1 hover:text-[#09090B]'
          }`}
        >
          Salud & Foco
        </button>
      </section>

      {/* ============================================================ */}
      {/* 5. LISTADO DEL HISTORIAL DE DESAFÍOS                       */}
      {/* ============================================================ */}
      <section aria-label="Lista de desafíos" className="flex flex-col gap-4" id="challengeList">
        {filteredChallenges.length === 0 ? (
          <div className="w-full bg-white rounded-2xl p-6 text-center outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="material-symbols-outlined text-[28px] text-[#3F3F46] mb-1">
              search_off
            </span>
            <p className="text-[13px] font-sans text-[#3F3F46]">
              No hay desafíos para el filtro seleccionado.
            </p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => {
            const isActive = challenge.status === 'active';

            return (
              <article
                key={challenge.id}
                id={`challenge-card-${challenge.id}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectChallenge(challenge)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectChallenge(challenge);
                  }
                }}
                aria-label={`Ver detalle del desafío: ${challenge.title}`}
                className="habit-card bg-white rounded-2xl p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ECECEE] -outline-offset-1 transition-all duration-200 flex flex-col gap-4 cursor-pointer hover:shadow-[0px_6px_16px_rgba(0,0,0,0.07)] hover:outline-[#D4D4D8] active:scale-[0.99] focus:outline-[#09090B] focus:outline-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      aria-hidden="true"
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-[#ECECEE]/50 text-[#FF5A00]'
                          : 'bg-[#F9F9FA] text-[#09090B]'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {challenge.icon}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[14px] leading-tight text-[#09090B] font-semibold truncate">
                        {challenge.title}
                      </h3>
                      <p
                        className={`text-[10px] mt-1 ${
                          isActive ? 'text-[#FF5A00] font-medium' : 'text-[#3F3F46]'
                        }`}
                      >
                        {challenge.subtitle}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#ECECEE] text-[#09090B] text-[11px] font-sans font-semibold shrink-0 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3F3F46]">
                        schedule
                      </span>
                      <span>En curso</span>
                    </div>
                  ) : (
                    <div className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#09090B] text-white text-[11px] font-sans font-semibold shrink-0 flex items-center gap-1.5">
                      <span>Superado</span>
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                        check
                      </span>
                    </div>
                  )}
                </div>

                <div aria-label="Progreso del desafío" className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-medium text-[#3F3F46]">
                    <span>{challenge.progressText}</span>
                    <span className={`font-bold ${isActive ? 'text-[#FF5A00]' : 'text-[#09090B]'}`}>
                      {challenge.progressPercentage}%
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="w-full h-1.5 rounded-full bg-[#ECECEE] overflow-hidden"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isActive ? 'bg-[#FF5A00]' : 'bg-[#09090B]'
                      }`}
                      style={{ width: `${challenge.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {challenge.notes && (
                  <p className="text-[12px] text-[#3F3F46] bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 p-3 rounded-xl leading-relaxed mt-0.5">
                    {challenge.notes}
                  </p>
                )}
              </article>
            );
          })
        )}
      </section>

      {/* ============================================================ */}
      {/* 6. BOTÓN FLOTANTE FIJO (FAB CON 50% TRANSPARENCIA)           */}
      {/* ============================================================ */}
      <FloatingNewChallengeButton
        onClick={() => setIsModalOpen(true)}
        id="fabBtn"
        ariaLabel="Crear nuevo desafío"
      />

      {/* ============================================================ */}
      {/* 7. MODAL / BOTTOM SHEET PARA CREAR NUEVO DESAFÍO           */}
      {/* ============================================================ */}
      <CreateChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddChallenge={onAddChallenge}
        currencyPreference={currencyPreference}
      />

      {/* ============================================================ */}
      {/* 8. MODAL DE ANALÍTICA Y DESGLOSE DE RACHA HISTÓRICA          */}
      {/* ============================================================ */}
      <StreakAnalyticsModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        currentStreakDays={34}
      />
    </div>
  );
};
